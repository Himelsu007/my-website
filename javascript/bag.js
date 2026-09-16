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
    /* Euro after the figure, the way it is written in Portugal. */
    function money(v) {
        return (Number.isInteger(v) ? v : v.toFixed(2)) + "€";
    }

    /* ---------------- stock re-check ----------------
       A bag is a snapshot: it stores the name and the price from the moment
       something was added, and then sits in localStorage for days. Mark a
       product sold out, change its price, or delete it from the catalogue,
       and the bag keeps happily ordering the old one — which surfaces as an
       argument about money at handover.

       So every time the drawer is painted, each line is checked back against
       the live catalogue. Nothing is silently corrected: a price that moved is
       the buyer's to accept, not ours to change behind them. */
    function auditLine(item) {
        if (typeof products === "undefined" || !Array.isArray(products)) return null;
        var p = products.filter(function (x) { return x.name === item.name; })[0];

        if (!p) return { kind: "gone",   note: "No longer sold" };
        if (typeof isBuyable === "function" && !isBuyable(p)) {
            return { kind: "gone", note: (typeof isSoon === "function" && isSoon(p))
                ? "Not out yet" : "Sold out" };
        }
        if (p.priceEUR != null && Number(p.priceEUR) !== Number(item.price)) {
            return { kind: "price", note: "Now " + money(p.priceEUR), now: Number(p.priceEUR) };
        }
        return null;
    }

    function audit() {
        return read().map(function (i) { return { item: i, issue: auditLine(i) }; });
    }

    /* ---------------- fulfilment ----------------
       Pickup or delivery, kept beside the bag so a half-filled address
       survives a reload or a wander back into the store. */
    var FKEY = "lx_fulfil";

    function readF() {
        try { return JSON.parse(localStorage.getItem(FKEY)) || {}; }
        catch (e) { return {}; }
    }
    function writeF(f) {
        try { localStorage.setItem(FKEY, JSON.stringify(f)); } catch (e) {}
        refreshGate();
    }

    /* Runs still to come, newest first, from events.js. Absent on a page that
       does not load it — the pickup option just goes quiet rather than
       offering an empty list. */
    function upcomingRuns() {
        if (typeof events === "undefined" || !Array.isArray(events)) return [];
        return events.filter(function (e) {
            return e && e.date && (typeof isPastRun !== "function" || !isPastRun(e));
        });
    }

    function runLabel(run) {
        if (!run) return "";
        var d = (typeof parseEventDate === "function") ? parseEventDate(run.date) : null;
        if (!d) return run.date;
        // events.js keeps these in caps for the event cards; inside a sentence
        // in a chat message, caps read as shouting.
        var tc = function (w) { return w.charAt(0) + w.slice(1).toLowerCase(); };
        return tc(d.wk) + " " + d.day + " " + tc(d.mon);
    }

    /* Complete enough to send. A postcode is the one field worth checking:
       a wrong door number gets a phone call, a wrong postcode gets a courier
       in the wrong half of the city. */
    function fulfilReady(f) {
        f = f || readF();
        if (f.method === "pickup")   return !!f.run;
        if (f.method === "delivery") {
            return !!(f.name && f.name.trim()) &&
                   !!(f.street && f.street.trim()) &&
                   /^\d{4}(-\d{3})?$/.test((f.postcode || "").trim());
        }
        return false;
    }

    /* One line for the chat: enough to act on without opening anything. */
    function fulfilLine(f) {
        if (f.method === "pickup")   return "Pickup \u2014 " + (f.runLabel || f.run) + " run";
        if (f.method === "delivery") return "Delivery \u2014 " + f.street + ", " + f.postcode;
        return "";
    }

    /* base64url so the order link carries no reserved characters — the
       fragment is split on "." and "~" and an address contains both. */
    function packF(f) {
        var parts = f.method === "pickup"
            ? ["p", f.runLabel || f.run || "", f.runWhere || ""]
            : ["d", f.name || "", f.street || "", f.postcode || ""];
        var bytes = new TextEncoder().encode(parts.join("|"));
        var bin = "";
        bytes.forEach(function (b) { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    /* ---------------- DOM ---------------- */
    var pill, drawer, backdrop, listEl, totalEl, toastEl;
    var stale = 0;              // lines the catalogue can no longer honour

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
              /* Asked here rather than over WhatsApp afterwards: this is the
                 last moment we have their attention, and every order that
                 leaves without it costs a round of messages. */
              '<div class="lx_bag_fulfil">' +
                '<span class="lx_bag_fulfil_label">How do you want it?</span>' +
                '<div class="lx_bag_methods">' +
                  '<button class="lx_bag_method" type="button" data-method="pickup">Pick up at a run</button>' +
                  '<button class="lx_bag_method" type="button" data-method="delivery">Delivery in Lisbon</button>' +
                '</div>' +
                '<div class="lx_bag_panel" data-panel="pickup" hidden>' +
                  '<label class="lx_bag_field">' +
                    '<span>Which run</span>' +
                    '<select class="lx_bag_input" data-fld="run"></select>' +
                  '</label>' +
                '</div>' +
                '<div class="lx_bag_panel" data-panel="delivery" hidden>' +
                  '<label class="lx_bag_field"><span>Name</span>' +
                    '<input class="lx_bag_input" data-fld="name" type="text" autocomplete="name" placeholder="Your full name"></label>' +
                  '<label class="lx_bag_field"><span>Street &amp; door</span>' +
                    '<input class="lx_bag_input" data-fld="street" type="text" autocomplete="street-address" placeholder="Rua da Prata 12, 3ºD"></label>' +
                  '<label class="lx_bag_field"><span>Postcode</span>' +
                    '<input class="lx_bag_input" data-fld="postcode" type="text" inputmode="numeric" autocomplete="postal-code" placeholder="1100-052"></label>' +
                  '<p class="lx_bag_hint">Lisbon only, within 12h. No delivery fee.</p>' +
                '</div>' +
              '</div>' +
              '<div class="lx_bag_total"><span>Total</span><strong>0€</strong></div>' +
              '<button class="lx_bag_order whatsapp_btn" type="button">Order all on WhatsApp</button>' +
              '<button class="lx_bag_clear" type="button">Empty bag</button>' +
              '<p class="lx_bag_note">Nothing is charged here. We confirm everything on WhatsApp first.</p>' +
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
        wireFulfil();

        listEl.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-bag-act]");
            if (!btn) return;
            var row = btn.closest("[data-bag-id]");
            var id  = row.getAttribute("data-bag-id");
            var cur = read().filter(function (i) { return i.id === id; })[0];
            if (!cur) return;
            var act = btn.getAttribute("data-bag-act");
            if (act === "reprice") {
                var live = (typeof products !== "undefined")
                    ? products.filter(function (x) { return x.name === cur.name; })[0] : null;
                if (live && live.priceEUR != null) {
                    var items2 = read().map(function (x) {
                        if (x.id === id) x.price = Number(live.priceEUR);
                        return x;
                    });
                    write(items2);
                }
                return;
            }
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

        var checked = audit();
        var blocked = checked.filter(function (c) { return c.issue && c.issue.kind === "gone"; }).length;

        listEl.innerHTML = items.length
            ? checked.map(function (c) {
                var i = c.item, issue = c.issue;
                return '<div class="lx_bag_item' +
                        (issue ? " has_issue is_" + issue.kind : "") +
                        '" data-bag-id="' + esc(i.id) + '">' +
                    '<img src="' + esc(i.image) + '" alt="" loading="lazy" decoding="async">' +
                    '<div class="lx_bag_item_id">' +
                        '<span class="lx_bag_item_name">' + esc(i.name) + '</span>' +
                        (i.option ? '<span class="lx_bag_item_opt">' + esc(i.option) + '</span>' : "") +
                        '<span class="lx_bag_item_price">' + money(i.price * i.qty) + '</span>' +
                        (issue ? '<span class="lx_bag_item_flag">' + esc(issue.note) +
                            (issue.kind === "price"
                                ? ' \u00b7 <button type="button" data-bag-act="reprice">Update</button>'
                                : ' \u00b7 <button type="button" data-bag-act="remove">Remove</button>') +
                          '</span>' : "") +
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
        stale = blocked;
        refreshGate();
    }

    /* Paints the fulfilment block from stored state and decides whether the
       order button can fire. Called on every render and every field change. */
    function refreshGate() {
        if (!drawer) return;
        var f = readF();
        var runs = upcomingRuns();

        drawer.querySelectorAll(".lx_bag_method").forEach(function (b) {
            b.classList.toggle("is-on", b.dataset.method === f.method);
            b.setAttribute("aria-pressed", b.dataset.method === f.method ? "true" : "false");
        });
        drawer.querySelectorAll(".lx_bag_panel").forEach(function (panel) {
            panel.hidden = panel.dataset.panel !== f.method;
        });

        var sel = drawer.querySelector('[data-fld="run"]');
        if (sel && sel.options.length !== runs.length + 1) {
            sel.innerHTML = '<option value="">Choose a run\u2026</option>' +
                runs.map(function (r) {
                    return '<option value="' + esc(r.date) + '">' +
                           esc(runLabel(r)) + " \u00b7 " + esc(r.location || "") + "</option>";
                }).join("");
        }
        if (sel) sel.value = f.run || "";

        ["name", "street", "postcode"].forEach(function (k) {
            var el = drawer.querySelector('[data-fld="' + k + '"]');
            if (el && el.value !== (f[k] || "") && document.activeElement !== el) {
                el.value = f[k] || "";
            }
        });

        /* With no runs left in events.js there is nothing to pick, so pickup
           would be a dead end — say so instead of offering an empty list. */
        var pickBtn = drawer.querySelector('[data-method="pickup"]');
        if (pickBtn) pickBtn.disabled = runs.length === 0;

        /* An order that includes something we cannot supply is worse than no
           order — it gets agreed on WhatsApp and then walked back. */
        drawer.querySelector(".lx_bag_order").disabled =
            read().length === 0 || stale > 0 || !fulfilReady(f);
    }

    function wireFulfil() {
        drawer.querySelectorAll(".lx_bag_method").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var f = readF();
                f.method = btn.dataset.method;
                writeF(f);
                // Land the eye on the first thing still to fill in.
                var first = drawer.querySelector('.lx_bag_panel[data-panel="' + f.method + '"] .lx_bag_input');
                if (first && f.method === "delivery") first.focus();
            });
        });

        drawer.addEventListener("input", function (e) {
            var el = e.target.closest(".lx_bag_input");
            if (!el) return;
            var f = readF();
            var k = el.dataset.fld;
            f[k] = el.value;
            if (k === "run") {
                var run = upcomingRuns().filter(function (r) { return r.date === el.value; })[0];
                f.runLabel = runLabel(run);
                f.runWhere = run ? (run.location || "") : "";
            }
            writeF(f);
        });
        drawer.addEventListener("change", function (e) {
            if (e.target.closest('[data-fld="run"]')) {
                var f = readF();
                var run = upcomingRuns().filter(function (r) { return r.date === e.target.value; })[0];
                f.run = e.target.value;
                f.runLabel = runLabel(run);
                f.runWhere = run ? (run.location || "") : "";
                writeF(f);
            }
        });
    }

    function esc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function open() {
        /* Re-paint on open, not just on change. The catalogue may have moved
           since this bag was filled — that is the whole point of the audit,
           and it has to run when they come back, not when they left. */
        render();
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

    /* ---------------- the order, as a link instead of a list ----------------
       A five-item bag spelled out in the chat is eleven lines that wrap and
       orphan their prices on a phone. So the message stays at four lines —
       who, which order, how much — and the items live on an order slip we
       host. The bag rides along in the URL fragment, which browsers never
       send to a server, so the order is not logged anywhere on the way.

       Products go in as 4-character codes and the choices as indexes into the
       catalogue, which is what keeps the link short enough to read.          */

    /* Unambiguous alphabet: no I/O/0/1 to misread over the phone. */
    var REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

    function makeRef() {
        var out = "";
        for (var i = 0; i < 4; i++) {
            out += REF_ALPHABET.charAt(Math.floor(Math.random() * REF_ALPHABET.length));
        }
        return out;
    }

    /* "Black · 42 - 45" is stored as one string because that is what the bag
       shows. Split it back into its catalogue positions for the link. */
    function encodeItem(item) {
        var product = (typeof products !== "undefined")
            ? products.filter(function (p) { return p.name === item.name; })[0]
            : null;
        if (!product) return null;

        var ci = "", oi = "";
        (item.option || "").split(" · ").forEach(function (part) {
            part = part.trim();
            if (!part) return;
            if (product.colors && product.colors.indexOf(part) > -1) {
                ci = product.colors.indexOf(part);
            } else if (product.options && product.options.indexOf(part) > -1) {
                oi = product.options.indexOf(part);
            }
        });
        return [lxProductCode(product.name), ci, oi, item.qty].join(".");
    }

    /* Takes any list of bag-shaped items, so the single-product "WhatsApp
       Order" button in the modal lands in the chat looking exactly like a
       bag order — same header, same reference, same slip. */
    function sendOrder(items) {
        if (!items || !items.length) return;

        var ref   = makeRef();
        var n     = items.reduce(function (s, i) { return s + i.qty; }, 0);
        var sum   = items.reduce(function (s, i) { return s + (i.price || 0) * i.qty; }, 0);
        var codes = items.map(encodeItem);

        var base = window.location.origin +
                   window.location.pathname.replace(/[^/]*$/, "") + "order.html";

        var f = readF();

        var link = base;
        // One unrecognised item and the slip would be missing a line, which is
        // worse than no slip — send them to the plain store link instead and
        // let the chat carry it.
        if (codes.every(Boolean)) {
            link = base + "#v1." + ref + "." + Date.now().toString(36) +
                   (fulfilReady(f) ? "." + packF(f) : "") +
                   "~" + codes.join("~");
        }

        var how = fulfilLine(f);
        var msg = "LOCKED IN LX\n" +
                  "Order LX-" + ref + "\n" +
                  n + (n === 1 ? " item" : " items") + " · " + money(sum) +
                  (how ? "\n" + how : "") + "\n\n" +
                  link;

        logOrder("LX-" + ref, items, sum, link);
        window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank");
    }

    /* The same order the seller is about to read in WhatsApp, dropped into the
       Orders tab of their Sheet so there is a row to move along. Without it,
       tracking means hand-typing every reference into a spreadsheet, which
       means tracking stops happening by the second week.

       Fire-and-forget on purpose: keepalive so it survives the tab handing off
       to WhatsApp, no-cors because Apps Script does not answer a preflight,
       and every failure swallowed — nothing here may delay or block an order.
       Set ORDERS_ENDPOINT to "" in order-status.js to turn this off. */
    function logOrder(ref, items, sum, link) {
        if (typeof ORDERS_ENDPOINT !== "string" ||
            !/^https:\/\/script\.google\.com\//.test(ORDERS_ENDPOINT)) return;
        try {
            fetch(ORDERS_ENDPOINT, {
                method: "POST",
                mode: "no-cors",
                keepalive: true,
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    kind: "order",
                    ref: ref,
                    total: sum,
                    link: link,
                    fulfilment: fulfilLine(readF()),
                    items: items.map(function (i) {
                        return i.qty + "\u00d7 " + i.name +
                               (i.option ? " (" + i.option + ")" : "");
                    }).join(", ")
                })
            }).catch(function () {});
        } catch (e) {}
    }

    function order() { sendOrder(read()); }

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
        count: count,
        sendOrder: sendOrder
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { build(); render(); });
    } else { build(); render(); }
})();
