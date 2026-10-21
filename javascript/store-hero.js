/* =====================================================
   STORE HERO — colour, stock, tilt
   -----------------------------------------------------
   The markup is in merch.html, the look in css/store-hero.css. This:
   - keeps each colour in step with the catalogue: its price on the button,
     and a colour that cannot be bought leaves the hero. With both out, the
     button says so and still opens the sheet, where "Notify me" lives;
   - changes colour from the tabs, and every few seconds on its own
     until someone picks one; the white player loads after the page;
   - decodes the small label above the headline from one line to the next;
   - opens the product sheet from "Shop the tank", as a shelf card does;
   - scrolls to the shelf from "Browse the store";
   - on a computer, turns the figure toward the mouse.
   Needs product-catalog.js and product-data.js, loaded before it.
   ===================================================== */
(function () {
    "use strict";

    var hero = document.getElementById("store_hero");
    if (!hero || typeof products === "undefined") return;

    var HOLD = 3000;   // how long each colour stays before the next, in ms
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    var swatches = [].slice.call(hero.querySelectorAll(".sh-swatch"));
    var cta = hero.querySelector(".sh-cta");
    var ctaLabel = hero.querySelector(".sh-cta-label");
    var ctaPrice = hero.querySelector(".sh-cta-price");

    function productFor(c) {
        var sw = hero.querySelector('.sh-swatch[data-c="' + c + '"]');
        var sku = sw && sw.getAttribute("data-sku");
        for (var i = 0; i < products.length; i++) if (products[i].sku === sku) return products[i];
        return null;
    }

    // Only colours that can be bought take part. One left needs no swatches.
    var colours = swatches.map(function (s) { return s.getAttribute("data-c"); });
    var live = colours.filter(function (c) { return isBuyable(productFor(c)); });
    swatches.forEach(function (s) { s.hidden = live.length < 2 || live.indexOf(s.getAttribute("data-c")) < 0; });

    // ---- images: the white player is only fetched once the page is in ----
    var ready = {};
    function load(c) {
        if (ready[c]) return ready[c];
        var imgs = [].slice.call(hero.querySelectorAll('img.sh-shot[data-c="' + c + '"]'));
        ready[c] = Promise.all(imgs.map(function (img) {
            if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
            if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
            return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
        }));
        return ready[c];
    }

    // ---- showing a colour ----
    var current = hero.getAttribute("data-c");
    function show(c) {
        current = c;
        hero.setAttribute("data-c", c);
        [].forEach.call(hero.querySelectorAll(".sh-shot"), function (el) {
            el.classList.toggle("is-on", el.getAttribute("data-c") === c);
        });
        swatches.forEach(function (s) {
            var on = s.getAttribute("data-c") === c;
            s.classList.toggle("is-on", on);
            s.setAttribute("aria-pressed", on ? "true" : "false");
        });
        var p = productFor(c);
        if (p) {
            cta.href = productPath(p);
            ctaPrice.textContent = displayPrice(p);
            ctaLabel.textContent = isBuyable(p) ? "Shop the tank" : "Back soon · Notify me";
        }
    }
    function pick(c) { return load(c).then(function () { show(c); }); }

    // ---- on its own, every few seconds, while the hero is on screen and
    // no product sheet is open over it ----
    var picked = false, onScreen = true, timer = 0;
    var sheet = document.getElementById("product_modal");
    function cycle() {
        clearTimeout(timer);
        var go = !picked && !reduced && live.length > 1 && onScreen && !document.hidden &&
            !(sheet && sheet.classList.contains("active"));
        hero.classList.remove("is-rotating");
        if (!go) return;
        hero.style.setProperty("--sh-hold", HOLD + "ms");
        void hero.offsetWidth;                  // restart the swatch's ring
        hero.classList.add("is-rotating");
        timer = setTimeout(function () {
            pick(live[(live.indexOf(current) + 1) % live.length]).then(cycle);
        }, HOLD);
    }
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            onScreen = entries[0].isIntersecting;
            cycle();
        }, { threshold: 0.35 }).observe(hero);
    }
    document.addEventListener("visibilitychange", cycle);
    if (sheet && "MutationObserver" in window) {
        var wasOpen = sheet.classList.contains("active");
        new MutationObserver(function () {
            var open = sheet.classList.contains("active");
            if (open !== wasOpen) { wasOpen = open; cycle(); }
        }).observe(sheet, { attributes: true, attributeFilter: ["class"] });
    }

    swatches.forEach(function (s) {
        s.addEventListener("click", function () {
            picked = true;
            cycle();
            pick(s.getAttribute("data-c"));
        });
    });

    // ---- "Shop the tank" opens the sheet; a modified click opens the page ----
    cta.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var p = productFor(current);
        if (!p || typeof openProductModal !== "function") return;
        e.preventDefault();
        picked = true;
        cycle();
        openProductModal(products.indexOf(p), cta);
    });

    // ---- "Browse the store" glides down to the shelf. The page's <base>
    // makes a bare "#..." link lead to the home page, so it names the store. ----
    var more = hero.querySelector(".sh-more");
    var shelf = document.getElementById("product_filter_bar");
    if (more && shelf) more.addEventListener("click", function (e) {
        e.preventDefault();
        shelf.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });

    // ---- the mono label above the headline decodes to its next line ----
    var label = hero.querySelector(".sh-eyebrow-text");
    var lines = label ? (label.getAttribute("data-phrases") || "").split("|") : [];
    var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/";
    if (lines.length > 1) {
        label.style.setProperty("--n", Math.max.apply(null, lines.map(function (l) { return l.length; })));
        var line = 0;
        setInterval(function () {
            if (reduced || !onScreen || document.hidden) return;
            line = (line + 1) % lines.length;
            var to = lines[line], t0 = 0;
            requestAnimationFrame(function step(t) {
                if (!t0) t0 = t;
                var shown = Math.floor((t - t0) / 700 * to.length);   // letters settled so far
                label.textContent = to.split("").map(function (ch, i) {
                    return i < shown || ch === " " || ch === "·" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
                }).join("");
                if (shown < to.length) requestAnimationFrame(step);
            });
        }, 4200);
    }

    // ---- start: the right colour, the right price, the rest fetched later ----
    var start = live.indexOf(current) >= 0 || !live.length ? current : live[0];
    if (start === current) show(current);
    else pick(start);                           // e.g. black sold out: white, once loaded
    function warm() { live.forEach(load); }
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });
    // First change after the entrance has played.
    setTimeout(cycle, document.documentElement.getAttribute("data-splash") === "enter" ? 1600 : 400);

    // ---- computers: the figure turns toward the mouse ----
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0, box = null;
    function frame() {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        hero.style.setProperty("--sh-ry", x.toFixed(2) + "deg");
        hero.style.setProperty("--sh-rx", y.toFixed(2) + "deg");
        raf = Math.abs(tx - x) > 0.02 || Math.abs(ty - y) > 0.02 ? requestAnimationFrame(frame) : 0;
    }
    function aim() { if (!raf) raf = requestAnimationFrame(frame); }
    // Measured on the way in, not on every move, so moving never forces layout.
    hero.addEventListener("pointerenter", function () { box = hero.getBoundingClientRect(); });
    window.addEventListener("scroll", function () { box = null; }, { passive: true });
    hero.addEventListener("pointermove", function (e) {
        if (!box) box = hero.getBoundingClientRect();
        tx = ((e.clientX - box.left) / box.width - 0.5) * 14;
        ty = -((e.clientY - box.top) / box.height - 0.5) * 8;
        aim();
    });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; aim(); });
})();
