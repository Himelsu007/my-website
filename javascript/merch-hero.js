/* =====================================================
   MERCH HERO — featured product showcase
   -----------------------------------------------------
   Cycles the .active class across the .showcase-slide
   backgrounds and the matching .hud-title, and drives the
   progress bar underneath.

   Timing comes from css/merch.css, which is the authority:
     .slide-progress-bar  transition: width 3s linear
   so the swap is every 3s. The slides' own 1.2s crossfade
   and 4s Ken Burns crawl are pure CSS — this file only
   moves the class that triggers them.
   ===================================================== */
(function () {
    "use strict";

    var INTERVAL = 3000;   /* must match the 3s width transition in merch.css */

    function init() {
        var stage = document.getElementById("products_show_case_main_child_container");
        if (!stage) return;

        var slides = stage.querySelectorAll(".showcase-slide");
        var titles = stage.querySelectorAll(".hud-title");
        var bar    = stage.querySelector(".slide-progress-bar");
        if (slides.length < 2) return;

        /* Auto-rotation is motion nobody asked for — leave it on the first
           slide for anyone who has asked the system to reduce it. */
        var still = false;
        try { still = matchMedia("(prefers-reduced-motion: reduce)").matches; }
        catch (e) {}
        if (still) return;

        var index = 0;
        var timer = null;

        /* The bar transitions to 100% over 3s, so it has to be snapped back to
           0 with the transition off, or the return trip animates too. */
        function restartBar() {
            if (!bar) return;
            bar.style.transition = "none";
            bar.style.width = "0%";
            void bar.offsetWidth;          /* force the reflow before re-enabling */
            bar.style.transition = "";     /* back to the 3s linear from the CSS */
            bar.style.width = "100%";
        }

        function show(next) {
            slides[index].classList.remove("active");
            if (titles[index]) titles[index].classList.remove("active");

            index = next;

            slides[index].classList.add("active");
            if (titles[index]) titles[index].classList.add("active");

            restartBar();
        }

        function advance() {
            show((index + 1) % slides.length);
        }

        function start() {
            if (timer) return;
            restartBar();
            timer = setInterval(advance, INTERVAL);
        }

        function stop() {
            clearInterval(timer);
            timer = null;
            if (bar) {
                bar.style.transition = "none";
                bar.style.width = "0%";
            }
        }

        /* Background tabs throttle timers but not CSS transitions, so without
           this the bar drifts out of step with the slides. */
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) stop();
            else start();
        });

        start();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
