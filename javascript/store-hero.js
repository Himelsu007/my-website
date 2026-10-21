/* =====================================================
   STORE HERO — players, colour, stock, tilt
   -----------------------------------------------------
   The markup is in merch.html, the look in css/store-hero.css. This:
   - shows the players one after another, every few seconds, while the hero
     is on screen and no product sheet is open over it. Each photo carries
     the tank's colour, where the ring and chip sit on him, and how far right
     he moves (data-c, data-ring, data-chip, data-x on the <img>);
   - keeps the tabs, the price and the button in step with the tank in the
     photo on show. A colour that cannot be bought leaves the hero, players
     and all; with both out, the button says so and still opens the sheet,
     where "Notify me" lives;
   - picking a colour keeps to that colour's players;
   - fetches each photo just before its turn, once the page has loaded;
   - decodes the small label above the headline from one line to the next;
   - opens the product sheet from "Shop the tank", as a shelf card does;
   - glides down to the shelf from the scroll cue;
   - on a computer, turns the player toward the mouse.
   Needs product-catalog.js and product-data.js, loaded before it.
   ===================================================== */
(function () {
    "use strict";

    var hero = document.getElementById("store_hero");
    if (!hero || typeof products === "undefined") return;

    var HOLD = 3000;   // how long each player stays, in ms
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    var tabs = [].slice.call(hero.querySelectorAll(".sh-swatch"));
    var cta = hero.querySelector(".sh-cta");
    var ctaLabel = hero.querySelector(".sh-cta-label");
    var ctaPrice = hero.querySelector(".sh-cta-price");
    var sheet = document.getElementById("product_modal");

    function productFor(c) {
        var tab = hero.querySelector('.sh-swatch[data-c="' + c + '"]');
        var sku = tab && tab.getAttribute("data-sku");
        for (var i = 0; i < products.length; i++) if (products[i].sku === sku) return products[i];
        return null;
    }

    // Only colours that can be bought take part. One left needs no tabs.
    var live = tabs.map(function (t) { return t.getAttribute("data-c"); })
        .filter(function (c) { return isBuyable(productFor(c)); });
    tabs.forEach(function (t) { t.hidden = live.length < 2 || live.indexOf(t.getAttribute("data-c")) < 0; });

    // The players in a colour that can be bought; all of them if none can.
    var allShots = [].slice.call(hero.querySelectorAll(".sh-shot"));
    var shots = allShots.filter(function (img) { return !live.length || live.indexOf(img.getAttribute("data-c")) >= 0; });
    if (!shots.length) return;
    function colourOf(i) { return shots[i].getAttribute("data-c"); }

    // ---- photos: each is fetched one turn ahead, once the page is in ----
    var ready = [], pageIn = false;
    function load(i) {
        if (ready[i]) return ready[i];
        var img = shots[i];
        if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
        ready[i] = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
        return ready[i];
    }

    // ---- showing a player ----
    var current = 0;
    var keep = null;   // the colour someone picked, if they did
    function next(i) {
        for (var n = 1; n <= shots.length; n++) {
            var j = (i + n) % shots.length;
            if (!keep || colourOf(j) === keep) return j;
        }
        return i;
    }
    function pair(v) { return (v || "0,0").split(","); }
    function show(i) {
        current = i;
        var img = shots[i], c = colourOf(i), st = hero.style;
        var ring = pair(img.getAttribute("data-ring")), chip = pair(img.getAttribute("data-chip"));
        allShots.forEach(function (s) { s.classList.toggle("is-on", s === img); });
        hero.setAttribute("data-c", c);
        st.setProperty("--ax", ring[0] + "%");
        st.setProperty("--ay", ring[1] + "%");
        st.setProperty("--bx", chip[0] + "%");
        st.setProperty("--by", chip[1] + "%");
        st.setProperty("--shot-x", (img.getAttribute("data-x") || 0) + "%");
        tabs.forEach(function (t) {
            var on = t.getAttribute("data-c") === c;
            t.classList.toggle("is-on", on);
            t.setAttribute("aria-pressed", on ? "true" : "false");
        });
        var p = productFor(c);
        if (p) {
            cta.href = productPath(p);
            ctaPrice.textContent = displayPrice(p);
            ctaLabel.textContent = isBuyable(p) ? "Shop the tank" : "Back soon · Notify me";
        }
        if (pageIn) load(next(i));
    }
    // The latest request wins: a tap overrides a turn still loading.
    var asked = 0;
    function go(i) {
        var mine = ++asked;
        return load(i).then(function () { if (mine === asked) show(i); });
    }

    // ---- taking turns, while the hero is on screen and no sheet covers it ----
    var pinned = false, onScreen = true, timer = 0;
    function cycle() {
        clearTimeout(timer);
        hero.classList.remove("is-rotating");
        var run = !pinned && !reduced && next(current) !== current && onScreen && !document.hidden &&
            !(sheet && sheet.classList.contains("active"));
        if (!run) return;
        hero.style.setProperty("--sh-hold", HOLD + "ms");
        void hero.offsetWidth;                  // restart the tab's bar
        hero.classList.add("is-rotating");
        timer = setTimeout(function () { go(next(current)).then(cycle); }, HOLD);
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

    // ---- a tab keeps to its colour's players ----
    tabs.forEach(function (t) {
        t.addEventListener("click", function () {
            keep = t.getAttribute("data-c");
            clearTimeout(timer);
            hero.classList.remove("is-rotating");
            go(colourOf(current) === keep ? current : next(current)).then(cycle);
        });
    });

    // ---- "Shop the tank" opens the sheet; a modified click opens the page ----
    cta.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var p = productFor(colourOf(current));
        if (!p || typeof openProductModal !== "function") return;
        e.preventDefault();
        pinned = true;
        cycle();
        openProductModal(products.indexOf(p), cta);
    });

    // ---- the scroll cue glides down to the shelf. The page's <base> makes a
    // bare "#..." link lead to the home page, so it names the store. ----
    var cue = hero.querySelector(".sh-scroll");
    var shelf = document.getElementById("product_filter_bar");
    if (cue && shelf) cue.addEventListener("click", function (e) {
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

    // ---- start: the first player who can be bought; the next fetched later ----
    if (shots[0] === allShots[0]) show(0);
    else go(0);                                 // e.g. black sold out: the first white player, once loaded
    function warm() { pageIn = true; load(next(current)); }
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });
    // First turn after the entrance has played.
    setTimeout(cycle, document.documentElement.getAttribute("data-splash") === "enter" ? 1600 : 400);

    // ---- computers: the player turns toward the mouse ----
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
