/* iOS Safari zooms the page into a text field the moment it is tapped
   whenever its text would render under 16px — which also happens to a 16px
   field when the visitor has Safari's page zoom below 100%. Telling iOS the
   page's maximum scale is 1 stops that jump. It does NOT stop people
   pinch-zooming: iOS ignores maximum-scale for gestures (since iOS 10).
   Android does honour it for pinch, which is why this only runs on iOS. */
(function () {
    var ua = navigator.userAgent || "";
    var iOS = /iPhone|iPad|iPod/.test(ua) ||
              (/Macintosh/.test(ua) && "ontouchend" in document);   // iPadOS reports as a Mac
    if (!iOS) return;
    var meta = document.querySelector('meta[name="viewport"]');
    if (meta && !/maximum-scale/.test(meta.content)) {
        meta.setAttribute("content", meta.content + ", maximum-scale=1");
    }
})();
