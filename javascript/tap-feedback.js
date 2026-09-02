/* =====================================================
   TAP FEEDBACK — the store buttons on the home page
   -----------------------------------------------------
   Adds a press + ripple to the four product cards and the
   VIEW MERCH button. The ripple layer is created here rather
   than in the markup because it is purely decorative — with
   JS off, the CSS :active press still works on its own.

   The cards live in a horizontally scrolling carousel, so a
   press that turns into a drag has to cancel: otherwise
   swiping the carousel lights up whichever card you started
   the swipe on.
   ===================================================== */
(function () {
    "use strict";

    var DRAG_CANCEL = 10;   /* px of movement that means "this is a scroll" */

    function init() {
        var targets = [];

        var cards = document.querySelectorAll(".home_page_product_boxes");
        Array.prototype.push.apply(targets, cards);

        var merchBtn = document.getElementById("home_page_merch_button");
        if (merchBtn) targets.push(merchBtn);

        if (!targets.length) return;

        targets.forEach(function (el) {
            /* The ripple needs something to clip it that is not one of the two
               pseudo-elements the card already uses for image and gradient. */
            var fx = document.createElement("span");
            fx.className = "lx-tapfx";
            fx.setAttribute("aria-hidden", "true");
            el.insertBefore(fx, el.firstChild);

            var startX = 0, startY = 0, active = false;

            function release() {
                active = false;
                el.classList.remove("lx-press");
            }

            el.addEventListener("pointerdown", function (e) {
                if (e.button && e.button !== 0) return;

                var r = el.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                active = true;

                fx.style.setProperty("--tx", (e.clientX - r.left) + "px");
                fx.style.setProperty("--ty", (e.clientY - r.top) + "px");

                /* Restart the animation even if the last one has not finished. */
                fx.classList.remove("lx-rippling");
                void fx.offsetWidth;
                fx.classList.add("lx-rippling");

                el.classList.add("lx-press");
            });

            el.addEventListener("pointermove", function (e) {
                if (!active) return;
                if (Math.abs(e.clientX - startX) > DRAG_CANCEL ||
                    Math.abs(e.clientY - startY) > DRAG_CANCEL) {
                    release();                       /* it was a swipe, not a tap */
                    fx.classList.remove("lx-rippling");
                }
            });

            ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
                el.addEventListener(type, release);
            });

            /* Let the ripple finish after the finger lifts — the press class is
               gone by then, so the two are cleared independently. */
            fx.addEventListener("animationend", function (e) {
                if (e.animationName === "lxRipple") fx.classList.remove("lx-rippling");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
