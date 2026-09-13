/* =====================================================
   BAG — multi-item ordering over WhatsApp
   -----------------------------------------------------
   Every product used to open its own wa.me message, so buying three things
   meant three separate conversations and three totals to reconcile by hand.

   This collects selections in localStorage and composes ONE message with all
   the lines and a total. No backend, no payment integration — it fits the way
   orders already work, it just stops the order being split up.

   The single-item "WhatsApp Order" button is untouched; this sits beside it.
   ===================================================== */
(function () {
    "use strict";

    var KEY   = "lx_bag";
    var PHONE = "351911861637";

    /* ---------------- state ---------------- */
    function read() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch (e) { return []; }
    }
    function write(items) {
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
        render();
    }
    function count() {
        return read().reduce(function (n, i) { return n + i.qty; }, 0);
    }
    function total() {
        return read().reduce(function (n, i) { return n + (i.price || 0) * i.qty; }, 0);
    }
    /* Same product in a different size is a different line. */
    function lineId(name, option) { return name + "||" + (option || ""); }

    function add(item) {
        var items = read();
        var existing = items.filter(function (i) { return i.id === item.id; })[0];
        if (existing) existing.qty += item.qty;
        else items.push(item);
        write(items);
    }
    function setQty(id, qty) {
        var items = read().map(function (i) {
            if (i.id === id) i.qty = Math.max(0, qty);
            return i;
        }).filter(function (i) { return i.qty > 0; });
        write(items);
    }
    function clear() {
        write([]);
        close();   // an empty drawer over a locked page is a dead end
    }

    /* ---------------- money ---------------- */
    function money(v) {
        return "€" + (Number.isInteger(v) ? v : v.toFixed(2));
    }

    /* ---------------- DOM ---------------- */
    var pill, drawer, backdrop, listEl, totalEl, toastEl;

    function build() {
        pill = document.createElement("button");
        pill.id = "lx_bag_pill";
        pill.type = "button";
        pill.hidden = true;
        pill.setAttribute("aria-label", "Open your bag");
        pill.innerHTML =
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
            '<span class="lx_bag_count">0</span>';

        backdrop = document.createElement("div");
        backdrop.id = "lx_bag_backdrop";
        backdrop.hidden = true;

        drawer = document.createElement("aside");
        drawer.id = "lx_bag_drawer";
        drawer.hidden = true;
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-modal", "true");
        drawer.setAttribute("aria-label", "Your bag");
        // Plain divs, not semantic header/footer: style.css, merch.css and
        // responsive.css each style those tags globally as the site's fixed
        // page header (position:fixed; top:0; width:100%). Semantic tags here
        // were pulled out of the drawer's flex column, stretched to the full
        // viewport, and left sitting invisibly over the first row swallowing
        // its plus/minus clicks.
        drawer.innerHTML =
            '<div class="lx_bag_head">' +
              '<h2 class="barlow-condensed-black">Your Bag</h2>' +
              '<button class="lx_bag_close" type="button" aria-label="Close bag">&times;</button>' +
            '</div>' +
            '<div class="lx_bag_list"></div>' +
            '<div class="lx_bag_foot">' +
              '<div class="lx_bag_total"><span>Total</span><strong>€0</strong></div>' +
              '<button class="lx_bag_order whatsapp_btn" type="button">Order all on WhatsApp</button>' +
              '<button class="lx_bag_clear" type="button">Empty bag</button>' +
              '<p class="lx_bag_note">Collected in person at runs. We confirm everything on WhatsApp first.</p>' +
            '</div>';

        toastEl = document.createElement("div");
        toastEl.id = "lx_bag_toast";
        toastEl.hidden = true;

        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);
        document.body.appendChild(pill);
        document.body.appendChild(toastEl);

        listEl  = drawer.querySelector(".lx_bag_list");
        totalEl = drawer.querySelector(".lx_bag_total strong");

        pill.addEventListener("click", open);
        backdrop.addEventListener("click", close);
        drawer.querySelector(".lx_bag_close").addEventListener("click", close);
        drawer.querySelector(".lx_bag_clear").addEventListener("click", clear);
        drawer.querySelector(".lx_bag_order").addEventListener("click", order);

        listEl.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-bag-act]");
            if (!btn) return;
            var row = btn.closest("[data-bag-id]");
            var id  = row.getAttribute("data-bag-id");
            var cur = read().filter(function (i) { return i.id === id; })[0];
            if (!cur) return;
            var act = btn.getAttribute("data-bag-act");
            if (act === "plus")   setQty(id, cur.qty + 1);
            if (act === "minus")  setQty(id, cur.qty - 1);
            if (act === "remove") setQty(id, 0);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !drawer.hidden) close();
        });
    }

    function render() {
        if (!pill) return;
        var items = read();
        var n = count();

        pill.hidden = n === 0;
        pill.querySelector(".lx_bag_count").textContent = n;

        listEl.innerHTML = items.length
            ? items.map(function (i) {
                return '<div class="lx_bag_item" data-bag-id="' + esc(i.id) + '">' +
                    '<img src="' + esc(i.image) + '" alt="" loading="lazy" decoding="async">' +
                    '<div class="lx_bag_item_id">' +
                        '<span class="lx_bag_item_name">' + esc(i.name) + '</span>' +
                        (i.option ? '<span class="lx_bag_item_opt">' + esc(i.option) + '</span>' : "") +
                        '<span class="lx_bag_item_price">' + money(i.price * i.qty) + '</span>' +
                    '</div>' +
                    '<div class="lx_bag_qty">' +
                        '<button type="button" data-bag-act="minus" aria-label="Decrease quantity">−</button>' +
                        '<span>' + i.qty + '</span>' +
                        '<button type="button" data-bag-act="plus" aria-label="Increase quantity">+</button>' +
                    '</div>' +
                    '<button class="lx_bag_remove" type="button" data-bag-act="remove" aria-label="Remove ' + esc(i.name) + '">&times;</button>' +
                '</div>';
            }).join("")
            : '<p class="lx_bag_empty">Your bag is empty.</p>';

        totalEl.textContent = money(total());
        drawer.querySelector(".lx_bag_order").disabled = items.length === 0;
    }

    function esc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function open() {
        backdrop.hidden = false;
        drawer.hidden = false;
        if (window.LXScrollLock) LXScrollLock.lock("bag");
        // Focus moves into the drawer so keyboard and screen-reader users are
        // actually taken there, not left behind on the page.
        var first = drawer.querySelector(".lx_bag_close");
        if (first) first.focus({ preventScroll: true });
    }
    function close() {
        backdrop.hidden = true;
        drawer.hidden = true;
        // Releases only the bag's claim — if the product modal is still open it
        // keeps the page locked.
        if (window.LXScrollLock) LXScrollLock.release("bag");
    }

    function toast(msg) {
        toastEl.innerHTML = esc(msg) + ' <button type="button">View bag</button>';
        toastEl.hidden = false;
        toastEl.classList.add("in");
        toastEl.querySelector("button").onclick = function () { hideToast(); open(); };
        clearTimeout(toast._t);
        toast._t = setTimeout(hideToast, 4000);
    }
    function hideToast() {
        if (!toastEl) return;
        toastEl.classList.remove("in");
        setTimeout(function () { toastEl.hidden = true; }, 250);
    }

    /* ---------------- the whole order, in one message ---------------- */
    function order() {
        var items = read();
        if (!items.length) return;
        var lines = items.map(function (i) {
            return "• " + i.name +
                (i.option ? " — " + i.option : "") +
                " ×" + i.qty +
                " — " + money(i.price * i.qty);
        }).join("\n");
        var msg = "Hi! I'd like to order:\n\n" + lines +
                  "\n\nTotal: " + money(total()) +
                  "\n\n" + window.location.origin + window.location.pathname;
        window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank");
    }

    /* ---------------- public hook used by the modal ---------------- */
    window.LXBag = {
        add: function (p) {
            add({
                id: lineId(p.name, p.option),
                name: p.name,
                option: p.option || "",
                price: Number(p.price) || 0,
                qty: Math.max(1, Number(p.qty) || 1),
                image: p.image || ""
            });
            toast("Added to bag.");
        },
        open: open,
        count: count
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { build(); render(); });
    } else { build(); render(); }
})();
