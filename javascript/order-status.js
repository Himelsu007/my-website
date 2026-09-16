/* =====================================================
   ORDER STATUS  (Google Sheet + Apps Script)
   -----------------------------------------------------
   The order link doubles as the buyer's tracking page, so the status cannot
   live in the URL — it has to be something you can change after the link is
   sent. It lives in one row of your Google Sheet, in the same web app that
   already counts run signups.

   To move an order along: open the Sheet, find the row by its reference
   (LX-2BD2), and type the new status in the Status column. Nothing to deploy,
   nothing to rebuild — the page reads it on the next open.

   Allowed values in that column (case does not matter):
       Requested · Confirmed · Ready · Delivered · Cancelled

   If the Sheet is unreachable, not yet set up, or has no row for this
   reference, the page falls back to "Order Requested" — which is true by
   definition, because the buyer is holding the link.
   ===================================================== */

/* Same web app as javascript/signups-api.js — one deployment serves both.
   If you ever redeploy to a new URL, change it in both files. */
const ORDERS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxpYeaAJK4zxhbOs5JyCvwcBsYqe7JzWKIw9iKuTxNScSTIKuoDUIhjY5SNV54ZsApa/exec";

(function (global) {
    "use strict";

    /* The journey, in order. `key` is what the Sheet holds and never changes —
       you still type Ready and Delivered whichever way the order is going.
       Only the wording the buyer reads follows the method, because "Delivered
       / Handed over" is simply false for something they collected themselves
       at a run. */
    var STEPS = {
        pickup: [
            { key: "requested", label: "Order Requested",   blurb: "We have your list",           phrase: "is requested" },
            { key: "confirmed", label: "Stock Confirmed",   blurb: "Everything is in",            phrase: "is confirmed" },
            { key: "ready",     label: "Set Aside for You", blurb: "Packed and coming to the run", phrase: "is set aside" },
            { key: "delivered", label: "Collected",         blurb: "Picked up at the run",        phrase: "was collected" }
        ],
        delivery: [
            { key: "requested", label: "Order Requested",  blurb: "We have your list",  phrase: "is requested" },
            { key: "confirmed", label: "Stock Confirmed",  blurb: "Everything is in",   phrase: "is confirmed" },
            { key: "ready",     label: "Out for Delivery", blurb: "On its way to you",  phrase: "is on its way" },
            { key: "delivered", label: "Delivered",        blurb: "Handed over",        phrase: "was delivered" }
        ],
        /* Links sent before the bag asked how they wanted it. */
        unknown: [
            { key: "requested", label: "Order Requested", blurb: "We have your list",   phrase: "is requested" },
            { key: "confirmed", label: "Stock Confirmed", blurb: "Everything is in",    phrase: "is confirmed" },
            { key: "ready",     label: "Ready for You",   blurb: "Packed and set aside", phrase: "is ready" },
            { key: "delivered", label: "Handed Over",     blurb: "All done",            phrase: "is complete" }
        ]
    };

    function stepsFor(method) {
        return STEPS[method] || STEPS.unknown;
    }

    var CANCELLED_PHRASE = "was cancelled";

    /* What people actually type into a spreadsheet cell. */
    var ALIASES = {
        requested: "requested", request: "requested", new: "requested",
        pending: "requested", received: "requested",
        confirmed: "confirmed", confirm: "confirmed", accepted: "confirmed",
        instock: "confirmed", "in stock": "confirmed",
        ready: "ready", packed: "ready", prepared: "ready",
        "out for delivery": "ready", shipped: "ready",
        delivered: "delivered", done: "delivered", complete: "delivered",
        completed: "delivered", collected: "delivered", handed: "delivered",
        cancelled: "cancelled", canceled: "cancelled", cancel: "cancelled",
        refunded: "cancelled", void: "cancelled"
    };

    function normalise(raw) {
        var v = String(raw || "").trim().toLowerCase().replace(/[_-]+/g, " ");
        return ALIASES[v] || ALIASES[v.replace(/\s+/g, "")] || null;
    }

    var isConfigured = function () {
        return typeof ORDERS_ENDPOINT === "string"
            && /^https:\/\/script\.google\.com\//.test(ORDERS_ENDPOINT);
    };

    /* A buyer refreshing their tracking page should not wait on Apps Script,
       which takes a couple of seconds. The last answer paints immediately and
       is replaced if the Sheet says something newer. */
    function cacheKey(ref) { return "lx_order_status_" + ref; }

    function readCache(ref) {
        try { return JSON.parse(sessionStorage.getItem(cacheKey(ref)) || "null"); }
        catch (e) { return null; }
    }
    function writeCache(ref, data) {
        try { sessionStorage.setItem(cacheKey(ref), JSON.stringify(data)); } catch (e) {}
    }

    /** Resolves to { key, note, updated } — never rejects. */
    function fetchStatus(ref) {
        if (!isConfigured() || !ref) return Promise.resolve(null);
        return fetch(ORDERS_ENDPOINT + "?order=" + encodeURIComponent(ref), { cache: "no-store" })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d || !d.ok || !d.status) return null;
                var key = normalise(d.status);
                if (!key) return null;
                var out = { key: key, note: d.note || "", updated: d.updated || "" };
                writeCache(ref, out);
                return out;
            })
            .catch(function () { return null; });
    }

    global.LXOrderStatus = {
        stepsFor: stepsFor,
        CANCELLED_PHRASE: CANCELLED_PHRASE,
        normalise: normalise,
        cached: readCache,
        fetch: fetchStatus,
        isConfigured: isConfigured
    };
})(window);
