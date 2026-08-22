/* =====================================================
   COOKIE CONSENT
   -----------------------------------------------------
   Google Analytics does NOT load until someone accepts.
   Decline means the GA script is never fetched and no
   _ga cookie is ever written.

   Not gated (strictly necessary for things the visitor
   asked for, so no consent required):
     - lx_signups        remembers you registered for a run
     - lx_signup_tally_* caches the shared spot count
     - lx_cookie_consent this choice itself
   ===================================================== */
(function () {
    "use strict";

    var GA_ID  = "G-Q80DNK1HPN";
    var STORE  = "lx_cookie_consent";
    var POLICY = "cookies.html";

    function read() {
        try { return localStorage.getItem(STORE); } catch (e) { return null; }
    }
    function write(v) {
        try { localStorage.setItem(STORE, v); } catch (e) {}
    }

    /* ---------- Google Analytics, loaded only on consent ---------- */
    var gaLoaded = false;
    function loadAnalytics() {
        if (gaLoaded || !GA_ID) return;
        gaLoaded = true;

        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(s);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, { anonymize_ip: true });
    }

    /* ---------- The bar ---------- */
    function buildBar() {
        var bar = document.createElement("div");
        bar.className = "ck-bar";
        bar.setAttribute("role", "dialog");
        bar.setAttribute("aria-live", "polite");
        bar.setAttribute("aria-label", "Cookie choice");
        bar.innerHTML =
            '<div class="ck-inner">' +
                '<div class="ck-copy">' +
                    '<span class="ck-title">Cookies</span>' +
                    '<p class="ck-text">We use analytics cookies to see which runs people actually look at. ' +
                    'Nothing is tracked unless you say yes. ' +
                    '<a href="' + POLICY + '" class="ck-link">Read the policy</a></p>' +
                '</div>' +
                '<div class="ck-actions">' +
                    '<button type="button" class="ck-btn ck-btn--no" data-ck="deny">Decline</button>' +
                    '<button type="button" class="ck-btn ck-btn--yes" data-ck="grant">Accept</button>' +
                '</div>' +
            '</div>';
        return bar;
    }

    function show() {
        var bar = buildBar();
        document.body.appendChild(bar);
        // rAF gives a clean slide-in, but it never fires in a background tab -
        // the timer makes sure the bar can't get stuck off-screen either way.
        var revealed = false;
        function reveal() {
            if (revealed) return;
            revealed = true;
            bar.classList.add("in");
        }
        requestAnimationFrame(function () { requestAnimationFrame(reveal); });
        setTimeout(reveal, 300);

        bar.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-ck]");
            if (!btn) return;
            var granted = btn.getAttribute("data-ck") === "grant";
            write(granted ? "granted" : "denied");
            if (granted) loadAnalytics();
            dismiss(bar);
        });
    }

    function dismiss(bar) {
        bar.classList.remove("in");
        bar.addEventListener("transitionend", function () { bar.remove(); }, { once: true });
        setTimeout(function () { if (bar.parentNode) bar.remove(); }, 600);
    }

    /* ---------- Boot ---------- */
    var choice = read();
    if (choice === "granted") {
        loadAnalytics();                 // returning visitor who already said yes
    } else if (choice !== "denied") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", show);
        } else {
            show();
        }
    }

    /* Let cookies.html offer a way to change the answer later */
    window.lxCookieConsent = {
        get: read,
        reset: function () {
            try { localStorage.removeItem(STORE); } catch (e) {}
        }
    };
})();
