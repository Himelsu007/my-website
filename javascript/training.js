// ========================================
// TRAINING — scroll-reveal entrance
// Adds .in when an element scrolls into view.
// Stagger is handled in CSS (nth-child delays).
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    const els = document.querySelectorAll(".tr-reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
        els.forEach(el => el.classList.add("in"));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    els.forEach(el => io.observe(el));

    // ---- Proof clips: load + play only while on screen (saves CPU/bandwidth) ----
    const clips = document.querySelectorAll("video.tr-proof-clip");
    if (clips.length && "IntersectionObserver" in window
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const vio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const v = entry.target;
                if (entry.isIntersecting) {
                    const p = v.play();
                    if (p && p.catch) p.catch(() => {});
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25 });
        clips.forEach(v => vio.observe(v));
    }
});
