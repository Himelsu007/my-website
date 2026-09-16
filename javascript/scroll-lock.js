/* =====================================================
   SCROLL LOCK — shared by every overlay
   -----------------------------------------------------
   The product modal, the bag drawer and the lightbox each used to set
   document.body.style.overflow themselves. Whichever closed LAST won, so
   closing the bag while the product modal was still open unlocked the page and
   it scrolled away behind the modal.

   A counter fixes it: the page stays locked until every overlay has released.
   ===================================================== */
(function () {
    "use strict";

    var holders = new Set();
    var savedY = 0;

    window.LXScrollLock = {
        lock: function (owner) {
            if (holders.size === 0) {
                // overflow:hidden alone does not stop touch scrolling on iOS —
                // the page keeps sliding behind the sheet. Fixing the body is
                // the only reliable stop, so the scroll position is saved and
                // pinned via `top`, then restored on release.
                savedY = window.scrollY || window.pageYOffset || 0;
                document.body.style.top = (-savedY) + "px";
                document.body.classList.add("lx-scroll-locked");
            }
            holders.add(owner);
        },
        release: function (owner) {
            holders.delete(owner);
            if (holders.size === 0) {
                document.body.classList.remove("lx-scroll-locked");
                document.body.style.top = "";
                // Jump back without smooth-scrolling, or the page visibly flies.
                window.scrollTo({ top: savedY, behavior: "instant" });
            }
        },
        held: function () { return holders.size; }
    };
})();
