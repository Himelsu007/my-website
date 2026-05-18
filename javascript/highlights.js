// ========================================
// HIGHLIGHTS — render, filter, lightbox
// Lightweight: CSS masonry, lazy images,
// photos open in lightbox, videos link to IG.
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("highlights_grid");
    const empty = document.getElementById("highlights_empty");
    const filterBar = document.getElementById("highlights_filter");
    const lightbox = document.getElementById("highlights_lightbox");
    if (!grid) return;

    let photoOrder = []; // indices of photos for lightbox prev/next
    let lbIndex = 0;

    function render(filter = "all") {
        grid.innerHTML = "";
        photoOrder = [];

        const visible = highlights.filter(h =>
            filter === "all" ? true : h.type === filter
        );

        if (empty) empty.hidden = visible.length > 0;

        visible.forEach((item) => {
            const realIndex = highlights.indexOf(item);
            const card = document.createElement(item.type === "video" ? "a" : "button");
            card.className = `hl_card hl_card--${item.type}`;

            if (item.type === "video") {
                card.href = item.instagramUrl || "#";
                card.target = "_blank";
                card.rel = "noopener";
                card.setAttribute("aria-label", `Watch "${item.caption}" on Instagram`);
            } else {
                card.type = "button";
                card.dataset.index = realIndex;
                card.setAttribute("aria-label", `View photo: ${item.caption}`);
                photoOrder.push(realIndex);
            }

            const img = item.type === "video" ? item.poster : item.src;

            // Moving cover (GIF-loop technique). Supports .gif (native loop)
            // and .mp4/.webm/.mov (muted autoplay loop, plays only in view).
            const isVideoClip = item.clip && /\.(mp4|webm|mov)$/i.test(item.clip);
            const isGifClip   = item.clip && /\.gif$/i.test(item.clip);

            let mediaHTML;
            if (isVideoClip) {
                mediaHTML = `<video class="hl_clip" muted loop playsinline preload="none"
                                    poster="${item.poster || ""}" data-src="${item.clip}"
                                    aria-label="${item.caption}"></video>`;
            } else if (isGifClip) {
                mediaHTML = `<img class="hl_clip" src="${item.clip}" alt="${item.caption}" loading="lazy" decoding="async">`;
            } else {
                mediaHTML = `<img src="${img}" alt="${item.caption}" loading="lazy" decoding="async">`;
            }

            const hasClip = isVideoClip || isGifClip;

            card.innerHTML = `
                <div class="hl_media">
                    ${mediaHTML}
                    ${item.type === "video" ? `
                        ${hasClip ? "" : `
                        <span class="hl_play" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </span>`}
                        <span class="hl_ig_tag">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                            Watch on IG
                        </span>` : ""}
                </div>
                <div class="hl_overlay">
                    <p class="hl_caption barlow-condensed-bold">${item.caption}</p>
                    <span class="hl_venue">${item.venue}</span>
                </div>
            `;
            grid.appendChild(card);
        });

        setupClipObserver();
    }

    // Lazy autoplay: video clips only load + play while on screen,
    // pause + release when scrolled away. Keeps the page light.
    let clipObserver;
    function setupClipObserver() {
        if (clipObserver) clipObserver.disconnect();
        const clips = grid.querySelectorAll("video.hl_clip");
        if (!clips.length || !("IntersectionObserver" in window)) return;

        clipObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const v = entry.target;
                if (entry.isIntersecting) {
                    if (!v.src && v.dataset.src) v.src = v.dataset.src;
                    const p = v.play();
                    if (p && p.catch) p.catch(() => {});
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25 });

        clips.forEach(v => clipObserver.observe(v));
    }

    // ---- Filter chips ----
    if (filterBar) {
        filterBar.addEventListener("click", (e) => {
            const chip = e.target.closest(".hl_chip");
            if (!chip) return;
            filterBar.querySelectorAll(".hl_chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            render(chip.dataset.filter);
        });
    }

    // ---- Lightbox (photos only) ----
    function openLightbox(realIndex) {
        lbIndex = photoOrder.indexOf(realIndex);
        showLightbox();
        lightbox.classList.add("visible");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function showLightbox() {
        const item = highlights[photoOrder[lbIndex]];
        if (!item) return;
        lightbox.querySelector(".hl_lb_img").src = item.src;
        lightbox.querySelector(".hl_lb_img").alt = item.caption;
        lightbox.querySelector(".hl_lb_caption").textContent = item.caption;
        lightbox.querySelector(".hl_lb_venue").textContent = item.venue;
    }
    function moveLightbox(dir) {
        if (!photoOrder.length) return;
        lbIndex = (lbIndex + dir + photoOrder.length) % photoOrder.length;
        showLightbox();
    }
    function closeLightbox() {
        lightbox.classList.remove("visible");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    grid.addEventListener("click", (e) => {
        const card = e.target.closest(".hl_card--photo");
        if (card) openLightbox(parseInt(card.dataset.index, 10));
    });

    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.closest(".hl_lb_close")) return closeLightbox();
            if (e.target.closest(".hl_lb_next")) return moveLightbox(1);
            if (e.target.closest(".hl_lb_prev")) return moveLightbox(-1);
        });
        document.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("visible")) return;
            if (e.key === "Escape") closeLightbox();
            else if (e.key === "ArrowRight") moveLightbox(1);
            else if (e.key === "ArrowLeft") moveLightbox(-1);
        });
        // swipe
        let sx = 0;
        lightbox.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
        lightbox.addEventListener("touchend", e => {
            const dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 50) moveLightbox(dx < 0 ? 1 : -1);
        });
    }

    render("all");
});
