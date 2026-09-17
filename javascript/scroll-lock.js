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
    var prev = "";

    window.LXScrollLock = {
        lock: function (owner) {
            if (holders.size === 0) {
                prev = document.body.style.overflow;
                document.body.style.overflow = "hidden";
            }
            holders.add(owner);
        },
        release: function (owner) {
            holders.delete(owner);
            if (holders.size === 0) document.body.style.overflow = prev || "";
        },
        held: function () { return holders.size; }
    };
})();
