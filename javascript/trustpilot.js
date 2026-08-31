/* =====================================================
   TRUSTPILOT — Locked In Lx
   -----------------------------------------------------
   Reviews for the runs. Trustpilot renders its widgets as
   iframes served from widget.trustpilot.com, so nothing in
   them is readable by Google as page content — the SEO value
   is the Trustpilot profile itself ranking for brand queries,
   plus the sameAs link in the homepage Organization schema.
   On-page, the value is trust before someone books.

   UNTIL CONFIG.businessUnitId IS FILLED IN the whole section
   stays hidden, so the page never shows an empty review box.
   ===================================================== */
(function () {
    "use strict";

    var CONFIG = {
        /* ---- FILL THIS IN --------------------------------------------
           Trustpilot Business > Integrations > TrustBox. Pick any widget,
           and the generated snippet contains data-businessunit-id="...".
           It is a 24-character hex string. Paste it here and the reviews
           section appears on the homepage. Leave empty and it stays hidden. */
        businessUnitId: "",

        /* Your domain as Trustpilot knows it — drives the profile and
           review links. */
        domain: "lockedinlx.com",

        /* trustpilot.com is the global host; locale controls widget copy. */
        host:   "https://www.trustpilot.com",
        locale: "en-GB",

        /* Template IDs identify which TrustBox to draw. These are the
           defaults below, but ALWAYS confirm against the snippet your own
           Trustpilot dashboard generates — availability depends on plan,
           and the dashboard is the authority. */
        display: {
            /* "Micro Combo" — stars + score + review count. Compact, and
               available on the free plan. Swap for a richer TrustBox
               (Carousel/Grid) once you have reviews and a plan that allows it. */
            templateId: "5419b6ffb0d04a076446a9af",
            height: "24px",
            width:  "100%"
        },
        collector: {
            /* "Review Collector" — the box that asks people to leave one. */
            templateId: "56278e9abfbbba0bdcd568bc",
            height: "52px",
            width:  "100%"
        },

        /* Dark site, dark widgets. */
        theme: "dark"
    };

    var BOOTSTRAP = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

    function configured() {
        return /^[0-9a-f]{24}$/i.test(String(CONFIG.businessUnitId || "").trim());
    }

    /** Public profile page — every review, on Trustpilot. */
    function profileUrl() {
        return CONFIG.host + "/review/" + CONFIG.domain;
    }
    /** The link that opens the "write a review" form. This is the one to
        drop in the WhatsApp group after a run. */
    function evaluateUrl() {
        return CONFIG.host + "/evaluate/" + CONFIG.domain;
    }

    /* ---------- one TrustBox ---------- */
    function buildWidget(spec) {
        var el = document.createElement("div");
        el.className = "trustpilot-widget";
        el.setAttribute("data-locale", CONFIG.locale);
        el.setAttribute("data-template-id", spec.templateId);
        el.setAttribute("data-businessunit-id", CONFIG.businessUnitId.trim());
        el.setAttribute("data-style-height", spec.height);
        el.setAttribute("data-style-width", spec.width);
        el.setAttribute("data-theme", CONFIG.theme);

        /* Trustpilot replaces the contents with an iframe. Until it does,
           this anchor is what a visitor (and a crawler) sees. */
        var a = document.createElement("a");
        a.href = profileUrl();
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Trustpilot";
        el.appendChild(a);

        return el;
    }

    /* ---------- load the bootstrap once, then render ----------
       The bootstrap exposes no ready event, so poll for window.Trustpilot.
       onFail runs if it never turns up — blocked by an ad blocker, offline,
       or the CDN is down. */
    var loading = false;
    function withTrustpilot(onReady, onFail) {
        if (window.Trustpilot) { onReady(); return; }
        if (!loading) {
            loading = true;
            var s = document.createElement("script");
            s.src = BOOTSTRAP;
            s.async = true;
            s.onerror = function () { window.__tpBootstrapFailed = true; };
            document.head.appendChild(s);
        }
        var tries = 0;
        var t = setInterval(function () {
            if (window.Trustpilot) { clearInterval(t); onReady(); }
            else if (window.__tpBootstrapFailed || ++tries > 100) {  /* ~10s */
                clearInterval(t); onFail();
            }
        }, 100);
    }

    /* ---------- entity signal ----------
       Ties the Trustpilot profile to the homepage Organization via its @id,
       so Google reads them as the same entity. Injected rather than written
       into index.html so an unconfigured build never claims a profile that
       does not exist yet. Google renders the page, so injected JSON-LD is
       picked up the same as static JSON-LD. */
    function injectSameAs() {
        var node = document.createElement("script");
        node.type = "application/ld+json";
        node.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@id": "https://www.lockedinlx.com/#organization",
            "sameAs": profileUrl()
        });
        document.head.appendChild(node);
    }

    /** A TrustBox that drew successfully contains an iframe with real height.
        Note Trustpilot sizes the iframe from data-style-height, so this tells
        us the widget was *created*, not that it found reviews. */
    function drew(w) {
        var f = w.querySelector("iframe");
        return !!f && f.getBoundingClientRect().height > 4;
    }

    function collapse(w)   { if (w.parentNode) w.parentNode.setAttribute("data-tp-empty", ""); }
    function uncollapse(w) { if (w.parentNode) w.parentNode.removeAttribute("data-tp-empty"); }

    /** Collapse any slot the bootstrap did not draw into, so the panel never
        shows a dead band. Only called once Trustpilot is known to be present,
        so this races nothing — widgets appear within a frame or two. */
    function collapseUndrawn(widgets) {
        var tries = 0;
        var t = setInterval(function () {
            var pending = widgets.filter(function (w) { return !drew(w); });
            widgets.forEach(function (w) { if (drew(w)) uncollapse(w); });
            if (!pending.length) { clearInterval(t); return; }
            if (++tries > 30) {                       /* ~3s, then give up */
                clearInterval(t);
                pending.forEach(collapse);
            }
        }, 100);
    }

    function init() {
        var section = document.getElementById("reviews_section");
        if (!section || !configured()) return;   /* stay hidden */

        var displaySlot   = section.querySelector("[data-tp-display]");
        var collectorSlot = section.querySelector("[data-tp-collector]");
        var cta           = section.querySelector("[data-tp-cta]");
        var profileLink   = section.querySelector("[data-tp-profile]");

        if (cta)         cta.href = evaluateUrl();
        if (profileLink) profileLink.href = profileUrl();

        var widgets = [];
        if (displaySlot) {
            var d = buildWidget(CONFIG.display);
            displaySlot.appendChild(d);
            widgets.push(d);
        }
        if (collectorSlot) {
            var c = buildWidget(CONFIG.collector);
            collectorSlot.appendChild(c);
            widgets.push(c);
        }

        section.removeAttribute("hidden");
        section.setAttribute("data-tp-state", "ready");
        injectSameAs();

        withTrustpilot(
            function onReady() {
                widgets.forEach(function (w) {
                    try { window.Trustpilot.loadFromElement(w, true); } catch (e) {}
                });
                collapseUndrawn(widgets);
            },
            function onFail() {
                /* Ad blockers routinely block widget.trustpilot.com. Collapse
                   the widget slots and keep the section: the copy and the
                   "Leave a review" link still work without Trustpilot's JS. */
                widgets.forEach(collapse);
            }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
