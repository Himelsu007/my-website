/* =====================================================
   SPLASH — home → store, once per session
   -----------------------------------------------------
   index.html : intercepts links to merch.html, slides the
                panel up to cover, then navigates.
   merch.html : the panel is already covering (set inline in
                <head> before first paint) and slides away.

   Shows once per browser session. Closing the tab and coming
   back gives it again; clicking through to the store five
   times in one visit does not.

   Skipped entirely for reduced-motion, and for anyone whose
   browser refuses sessionStorage — in both cases links just
   navigate normally.
   ===================================================== */
(function () {
    "use strict";

    var SEEN   = "lx_splash_seen";    /* played already this session */
    var ACTIVE = "lx_splash_active";  /* a transition is mid-flight  */
    var COVER_MS = 420;

    function reduced() {
        try { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
        catch (e) { return false; }
    }
    function get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { sessionStorage.setItem(k, v); return true; } catch (e) { return false; } }
    function del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

    var root = document.documentElement;

    /* ---------------------------------------------- the store side */
    function arriving() {
        /* Clear the flag straight away so a refresh does not replay it. */
        del(ACTIVE);

        /* The CSS animation runs on its own. This only guarantees the panel
           is out of the way afterwards, including if the animation never
           fired (background tab, animations disabled, an old browser). */
        setTimeout(function () { root.setAttribute("data-splash", "done"); }, 2400);
    }

    /* ---------------------------------------------- the home side */
    function leaving() {
        var links = document.querySelectorAll('a[href="merch.html"]');
        if (!links.length) return;

        var going = false;

        function go(href) {
            if (going) return;
            going = true;

            if (!set(ACTIVE, "1")) { window.location.href = href; return; }
            set(SEEN, "1");

            root.setAttribute("data-splash", "cover");

            /* Navigate once the panel has covered. The timeout is the
               fallback for browsers that never fire animationend. */
            var moved = false;
            function navigate() {
                if (moved) return;
                moved = true;
                window.location.href = href;
            }
            var panel = document.querySelector(".lx-splash");
            if (panel) panel.addEventListener("animationend", navigate, { once: true });
            setTimeout(navigate, COVER_MS + 120);
        }

        Array.prototype.forEach.call(links, function (a) {
            a.addEventListener("click", function (e) {
                /* Let the browser handle anything that is not a plain click. */
                if (e.defaultPrevented || e.button !== 0 ||
                    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (get(SEEN)) return;      /* already had it this session */
                if (reduced()) return;

                e.preventDefault();
                go(a.getAttribute("href"));
            });
        });

        /* The VIEW MERCH button routed itself with window.location.href.
           Send it through the same path so it gets the transition too. */
        var btn = document.getElementById("home_page_merch_button");
        if (btn) {
            btn.addEventListener("click", function (e) {
                if (get(SEEN) || reduced()) { window.location.href = "merch.html"; return; }
                e.preventDefault();
                go("merch.html");
            });
        }
    }

    function init() {
        if (root.getAttribute("data-splash") === "enter") arriving();
        else if (document.querySelector(".lx-splash")) leaving();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /* Restored from the back/forward cache: the panel must not be covering. */
    window.addEventListener("pageshow", function (e) {
        if (e.persisted) {
            root.setAttribute("data-splash", "done");
            del(ACTIVE);
        }
    });
})();
