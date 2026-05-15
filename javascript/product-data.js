// ========================================
// PRODUCT DATA
// ========================================

const products = [
    {
        name: "Regular Elite Crew Socks #Black",
        price: "€18",
        category: "socks",
        image: "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks.webp",
        images: [
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks02.webp",
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks03.webp",
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks-04.webp"
        ],
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        isSoldOut: false,
        optionTitle: "<strong>Size</strong>",
        options: ["34 - 38", "38 - 42", "42 - 46"]
    },
        {
        name: "Nba Nike Headband",
        price: "€30",
        category: "accessories",
        image: "assets/images/products/nike-nba-dri-fit-fury-classic-headband-black.jpg",
        images: [
            "assets/images/products/nba-nike-headband-bg-02.avif",
            "assets/images/products/nba-nike-headband-bg.avif",
            "assets/images/products/nba-nike-headband-bg-03.avif",
            "assets/images/products/nba-nike-headband-bg-04.webp"
        ],
        description: "Compression support for a consistent shot and full control.",
        isSoldOut: false,
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },

    {
        name: "Wilson Alliance Series Platinum",
        price: "€80",
        category: "balls",
        tag: "Exclusive",
        image: "assets/images/products/wilson-silver/wilson-official-ball-silver.png",
        images: [
            "assets/images/products/wilson-silver/wilson-silver0002.webp",
            "assets/images/products/wilson-silver/wilson-silver0001.webp",
            "assets/images/products/wilson-silver/wilson-silver0003.avif"
        ],
        description: "Let professional autographs shine with the Wilson Alliance Series.",
        isSoldOut: false,
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },
    {
        name: "Wilson NBA Authentic Series Indoor",
        price: "€50",
        category: "balls",
        image: "assets/images/products/wilson-orange/wilson-official-ball.jpg",
        images: [
            "assets/images/products/wilson-orange/wilson-orange0002.avif",
            "assets/images/products/wilson-orange/wilson-orange0001.avif",
            "assets/images/products/wilson-orange/wilson-orange0003.avif"
        ],
        description: "NBA experiences can happen anytime, anyplace.",
        isSoldOut: false,
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },

    {
        name: "Nba Nike Elite Shooting Sleeve (White)",
        price: "€35",
        category: "accessories",
        image: "assets/images/products/nba-shooting-sleeve.avif",
        images: [
            "assets/images/white-shooting-sleeve-bg.avif",
            "assets/images/products/nba-shooting-sleeve.avif"
        ],
        description: "Compression support for a consistent shot and full control.",
        isSoldOut: false,
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
        {
        name: "Nba Elite Crew Socks",
        price: "€25",
        category: "socks",
        tag: "Best Seller",
        image: "assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.png",
        images: [
            "assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.png",
            "assets/images/products/nba-elite-crew-socks/nba-elite-crew0001.jpg.avif",
            "assets/images/products/nba-elite-crew-socks/nba-elite-crew0003.jpg.avif",
            "assets/images/ben-simons-bg.avif"
        ],
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        isSoldOut: false,
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nba Nike Elite Shooting Sleeve (Black)",
        price: "€35",
        category: "accessories",
        image: "assets/images/products/shooting-sleeve-black.avif",
        images: [
            "assets/images/black-shooting-sleeve-bg.avif",
            "assets/images/products/shooting-sleeve-black.avif"
        ],
        description: "Compression support for a consistent shot and full control.",
        isSoldOut: false,
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Elite Crew Socks #SW",
        price: "SOLD OUT",
        category: "socks",
        image: "assets/images/products/nba-elite-crew-socks/nike-elite-socks-white.png",
        description: "Maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SW",
        price: "SOLD OUT",
        category: "apparel",
        image: "assets/images/products/nike-elite-tee-white.png",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA.",
        tag: "Limited Edition",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TB",
        price: "COMING SOON",
        category: "apparel",
        comingSoon: true,
        image: "assets/images/products/nike-elite-tank-top-black.png",
        description: "Designed for high-tempo runs where every possession matters.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike NBA Elite Pro Compression #SB",
        price: "SOLD OUT",
        category: "apparel",
        image: "assets/images/products/nike-elite-tee-black.png.webp",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TW",
        price: "SOLD OUT",
        category: "apparel",
        image: "assets/images/products/nike-elite-tank-top-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LSW",
        price: "COMING SOON",
        category: "apparel",
        comingSoon: true,
        image: "assets/images/products/nike-elite-long-sleeve-white.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHB",
        price: "COMING SOON",
        category: "apparel",
        comingSoon: true,
        image: "assets/images/products/nike-elite-short-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LHB",
        price: "COMING SOON",
        category: "apparel",
        comingSoon: true,
        image: "assets/images/products/nike-elite-long-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHW",
        price: "COMING SOON",
        category: "apparel",
        comingSoon: true,
        image: "assets/images/products/nike-elite-short-sleeve-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size",
        options: ["S", "M", "L"]
    }
];


// ========================================
// PRODUCT LOADER
// ========================================
function loadProducts(filter = "all") {
    const container = document.getElementById("products_grid");
    const emptyState = document.getElementById("products_empty_state");
    if (!container) return;

    container.innerHTML = "";

    const visible = products.filter(p => {
        if (filter === "all") return true;
        if (filter === "coming-soon") return !!p.comingSoon;
        return p.category === filter;
    });

    if (emptyState) emptyState.hidden = visible.length > 0;

    visible.forEach((product) => {
        // Use the absolute index in `products` so the modal handler can find the right item
        const absoluteIndex = products.indexOf(product);

        const card = document.createElement("button");
        card.type = "button";
        card.className = `products_box ${product.isSoldOut ? "is_sold_out" : ""} ${product.comingSoon ? "is_coming_soon" : ""}`;
        card.setAttribute("data-product-index", absoluteIndex);
        card.setAttribute("aria-label", `View details for ${product.name}, ${product.price}`);

        card.innerHTML = `
            <div class="product_image_wrapper">
                <img src="${product.image}" alt="${product.name}" class="product_image" loading="lazy" decoding="async">
            </div>
            <div class="product_info">
                <span class="product_name barlow-condensed-regular">${product.name}</span>
                <span class="product_price barlow-condensed-regular">${product.price}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// ========================================
// IMAGE PRELOADER (avoids modal slideshow stutter)
// ========================================
function preloadProductImages() {
    products.forEach(p => {
        const list = p.images || [p.image];
        list.forEach(src => {
            if (!src) return;
            const img = new Image();
            img.src = src;
        });
    });
}

// ========================================
// FILTER BAR HANDLER
// ========================================
function initFilterBar() {
    const bar = document.getElementById("product_filter_bar");
    if (!bar) return;
    bar.addEventListener("click", (e) => {
        const chip = e.target.closest(".filter_chip");
        if (!chip) return;
        bar.querySelectorAll(".filter_chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        loadProducts(chip.dataset.filter);
    });
}

// ========================================
// HELPERS
// ========================================
function slugify(s) {
    return (s || "").toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

function getRelatedProducts(currentProduct, count = 4) {
    const sameCat = products.filter(p => p !== currentProduct && p.category === currentProduct.category);
    const rest = products.filter(p => p !== currentProduct && p.category !== currentProduct.category);
    return [...sameCat, ...rest].slice(0, count);
}

// Parses a price string like "€18" → 18. Returns null for COMING SOON / SOLD OUT.
function parsePrice(priceStr) {
    const match = /([\d.]+)/.exec(priceStr || "");
    return match ? parseFloat(match[1]) : null;
}

function formatPrice(value) {
    return `€${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

// ========================================
// MODAL STATE
// ========================================
let slideshowState = {
    interval: null,
    timeline: null,
    currentIndex: 0,
    total: 0,
    auto: true,
    openerElement: null
};

function clearSlideshow() {
    clearInterval(slideshowState.interval);
    if (slideshowState.timeline) clearTimeout(slideshowState.timeline);
    slideshowState.interval = null;
    slideshowState.timeline = null;
}

// ========================================
// FOCUS TRAP
// ========================================
function trapFocus(container) {
    const focusables = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return () => {};
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    function handler(e) {
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
}

// ========================================
// SLIDESHOW
// ========================================
const SLIDE_DURATION = 2400;

function resetSlideProgress(modal, running) {
    const bar = modal.querySelector(".modal_slide_progress_bar");
    if (!bar) return;
    // Reset
    bar.style.transition = "none";
    bar.style.width = "0%";
    // Force reflow then animate
    void bar.offsetWidth;
    if (running) {
        bar.style.transition = `width ${SLIDE_DURATION}ms linear`;
        bar.style.width = "100%";
    } else {
        bar.style.transition = "width 0.25s ease";
        bar.style.width = "0%";
    }
}

function gotoSlide(modal, index, { resumeAuto = false } = {}) {
    const imgs = modal.querySelectorAll(".modal_image_wrapper > img");
    const dots = modal.querySelectorAll(".slide_dot");
    if (!imgs.length) return;

    slideshowState.currentIndex = (index + imgs.length) % imgs.length;
    imgs.forEach((im, i) => im.classList.toggle("active", i === slideshowState.currentIndex));
    dots.forEach((d, i) => d.classList.toggle("active", i === slideshowState.currentIndex));

    if (slideshowState.auto && imgs.length > 1) {
        resetSlideProgress(modal, true);
    }

    if (resumeAuto && slideshowState.auto && imgs.length > 1) {
        startAutoSlideshow(modal);
    }
}

function startAutoSlideshow(modal) {
    clearSlideshow();
    const imgs = modal.querySelectorAll(".modal_image_wrapper > img");
    if (imgs.length <= 1) return;
    slideshowState.auto = true;
    resetSlideProgress(modal, true);
    slideshowState.interval = setInterval(() => {
        gotoSlide(modal, slideshowState.currentIndex + 1);
    }, SLIDE_DURATION);
}

function stopAutoSlideshow() {
    slideshowState.auto = false;
    clearSlideshow();
    const modal = document.getElementById("product_modal");
    if (modal) resetSlideProgress(modal, false);
}

// ========================================
// OPEN / CLOSE MODAL
// ========================================
function openProductModal(index, opener) {
    const modal = document.getElementById("product_modal");
    const product = products[index];
    if (!modal || !product) return;

    if (opener) slideshowState.openerElement = opener;

    const isSoldOut = product.isSoldOut;
    const isComingSoon = !!product.comingSoon;
    const isAvailable = !isSoldOut && !isComingSoon;
    const isQuantity = (product.optionTitle || "").toLowerCase().includes("quantity");
    const titleId = `modal_title_${slugify(product.name)}`;
    const unitPrice = parsePrice(product.price);

    // ---- IMAGES + SKELETON ----
    const imagesToLoad = (product.images || [product.image]).filter(Boolean);
    const imagesHTML = imagesToLoad.map((src, i) =>
        `<img src="${src}" alt="${product.name} — view ${i + 1}" class="${i === 0 ? "active" : ""}" draggable="false">`
    ).join("");

    // ---- DOTS / ARROWS ----
    const hasMultiple = imagesToLoad.length > 1;
    const dotsHTML = hasMultiple
        ? `<div class="slide_dots" role="tablist" aria-label="Product images">${
            imagesToLoad.map((_, i) =>
                `<button class="slide_dot ${i === 0 ? "active" : ""}" data-slide="${i}" type="button" role="tab" aria-label="Show image ${i + 1}"></button>`
            ).join("")
          }</div>`
        : "";
    const arrowsHTML = hasMultiple
        ? `<button class="slide_arrow prev" type="button" aria-label="Previous image">‹</button>
           <button class="slide_arrow next" type="button" aria-label="Next image">›</button>`
        : "";

    // ---- VARIANT UI (pills OR quantity stepper) ----
    let variantsHTML = "";
    if (product.options && product.options.length > 0) {
        if (isQuantity) {
            const max = parseInt(product.options[product.options.length - 1], 10) || 4;
            variantsHTML = `
                <div class="modal_variant_group">
                    <div class="modal_variant_header">
                        <h4 class="inter-medium">${product.optionTitle || "Quantity"}</h4>
                    </div>
                    <div class="qty_stepper" data-min="1" data-max="${max}" data-unit-price="${unitPrice ?? ""}">
                        <button class="qty_btn minus" type="button" aria-label="Decrease quantity" ${isAvailable ? "" : "disabled"}>−</button>
                        <input class="qty_input" type="number" min="1" max="${max}" value="1" inputmode="numeric" aria-label="Quantity">
                        <button class="qty_btn plus" type="button" aria-label="Increase quantity" ${isAvailable ? "" : "disabled"}>+</button>
                    </div>
                </div>
            `;
        } else {
            const pillsHTML = product.options.map(opt =>
                `<button class="pill" type="button" ${!isAvailable ? "disabled" : ""}>${opt}</button>`
            ).join("");
            variantsHTML = `
                <div class="modal_variant_group">
                    <div class="modal_variant_header">
                        <h4 class="inter-medium">${product.optionTitle || "Select Size"}</h4>
                        <button class="size_chart_link" type="button" aria-label="View size chart">View size chart ›</button>
                    </div>
                    <div class="variant_pills">${pillsHTML}</div>
                    <div class="size_chart_inline" hidden>${getSizeChartHTML(product)}</div>
                </div>
            `;
        }
    }

    // ---- CTA ----
    let ctaHTML;
    if (isComingSoon) {
        ctaHTML = `<button id="whatsapp_notify_btn" class="whatsapp_btn" type="button">Notify Me on WhatsApp</button>`;
    } else if (isSoldOut) {
        ctaHTML = `<button class="sold_out_btn" type="button" disabled>OUT OF STOCK</button>`;
    } else {
        const requiresPick = !!product.options;
        ctaHTML = `<button id="whatsapp_order_btn" class="whatsapp_btn ${requiresPick ? "disabled" : ""}" type="button">
            <span class="cta_label">WhatsApp Order</span>
            <span class="cta_total" data-unit-price="${unitPrice ?? ""}"></span>
        </button>`;
    }

    // ---- URGENCY LINE (only for available items) ----
    const urgencyHTML = isAvailable
        ? `<div class="modal_urgency"><span class="urgency_dot"></span> Recently popular — order before it goes</div>`
        : "";

    // ---- RELATED PRODUCTS ----
    const related = getRelatedProducts(product, 4);
    const relatedHTML = related.length
        ? `<div class="modal_related">
              <h4 class="barlow-condensed-bold">You might also like</h4>
              <div class="modal_related_track">${related.map(r => {
                  const idx = products.indexOf(r);
                  return `<button class="modal_related_card" type="button" data-related-index="${idx}" aria-label="View ${r.name}">
                      <img src="${r.image}" alt="${r.name}" loading="lazy">
                      <div class="modal_related_meta">
                          <span class="barlow-condensed-regular">${r.name}</span>
                          <span class="barlow-condensed-bold">${r.price}</span>
                      </div>
                  </button>`;
              }).join("")}</div>
           </div>`
        : "";

    // ---- BUILD ----
    modal.innerHTML = `
        <div class="modal_content" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
            <div class="modal_image_wrapper ${isSoldOut ? "sold_out_img" : ""}" data-zoomable="true">
                <div class="modal_image_skeleton"></div>
                ${imagesHTML}
                ${product.tag ? `<span class="product_badge">${product.tag}</span>` : ""}
                ${arrowsHTML}
                ${dotsHTML}
                ${hasMultiple ? `<div class="modal_slide_progress"><span class="modal_slide_progress_bar"></span></div>` : ""}
                <button class="lightbox_trigger" type="button" aria-label="Open fullscreen view">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                </button>
                <button class="close_modal" type="button" aria-label="Close">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <div class="modal_details">
                <h2 id="${titleId}" class="modal_title barlow-condensed-black">${product.name.toUpperCase()}</h2>
                <div class="modal_price barlow-condensed-black">${product.price}</div>

                ${urgencyHTML}

                <p class="modal_description inter-regular">
                    ${product.description || "Premium gear for elite performance."}
                </p>

                ${variantsHTML}

                <div class="whatsapp_container">
                    ${ctaHTML}
                </div>

                <div class="modal_trust_row">
                    <div class="trust_item">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span>Authentic Nike &amp; Wilson</span>
                    </div>
                    <div class="trust_item">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        <span>24h Lisbon delivery</span>
                    </div>
                    <div class="trust_item">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        <span>30-day returns</span>
                    </div>
                </div>

                ${relatedHTML}

                <p class="modal_backdrop_hint inter-regular">Press <kbd>Esc</kbd> or click outside to close</p>
            </div>
        </div>

        <!-- LIGHTBOX -->
        <div class="lightbox" id="image_lightbox" aria-hidden="true">
            <button class="lightbox_close" type="button" aria-label="Close fullscreen">&times;</button>
            <img class="lightbox_img" src="" alt="">
        </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // ---- INIT SLIDESHOW STATE ----
    slideshowState.currentIndex = 0;
    slideshowState.total = imagesToLoad.length;
    slideshowState.auto = hasMultiple;
    if (hasMultiple) startAutoSlideshow(modal);

    // ---- INIT QUANTITY STEPPER TOTAL ----
    updateQuantityTotal(modal);

    // ---- IMAGE HOVER ZOOM (desktop only) ----
    initImageZoom(modal);

    // ---- SWIPE GESTURES (mobile) ----
    initSwipe(modal);

    // ---- FOCUS TRAP + INITIAL FOCUS ----
    if (slideshowState._releaseFocusTrap) slideshowState._releaseFocusTrap();
    const content = modal.querySelector(".modal_content");
    slideshowState._releaseFocusTrap = trapFocus(content);
    if (content) content.scrollTop = 0;  // always start at the image
    const firstFocusable = modal.querySelector(".close_modal");
    if (firstFocusable) firstFocusable.focus({ preventScroll: true });
}

function closeProductModal() {
    const modal = document.getElementById("product_modal");
    if (!modal || !modal.classList.contains("active")) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    clearSlideshow();
    if (slideshowState._releaseFocusTrap) {
        slideshowState._releaseFocusTrap();
        slideshowState._releaseFocusTrap = null;
    }
    // Blur any lingering focus on the opener card so the gold ring doesn't stick
    if (slideshowState.openerElement && typeof slideshowState.openerElement.blur === "function") {
        slideshowState.openerElement.blur();
    }
    slideshowState.openerElement = null;
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

// ========================================
// QUANTITY STEPPER TOTAL
// ========================================
function updateQuantityTotal(modal) {
    const stepper = modal.querySelector(".qty_stepper");
    const totalEl = modal.querySelector(".cta_total");
    if (!totalEl) return;
    const unit = parseFloat(totalEl.dataset.unitPrice);
    if (!unit) { totalEl.textContent = ""; return; }
    const qty = stepper ? (parseInt(stepper.querySelector(".qty_input").value, 10) || 1) : 1;
    if (qty > 1) {
        totalEl.textContent = ` — ${formatPrice(unit * qty)}`;
    } else {
        totalEl.textContent = "";
    }
}

// ========================================
// IMAGE HOVER ZOOM (desktop)
// ========================================
function initImageZoom(modal) {
    const wrapper = modal.querySelector(".modal_image_wrapper");
    if (!wrapper) return;
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch devices
    wrapper.addEventListener("mousemove", (e) => {
        if (!wrapper.classList.contains("zooming")) return;
        const rect = wrapper.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        wrapper.querySelectorAll("img").forEach(img => {
            img.style.transformOrigin = `${x}% ${y}%`;
        });
    });
    wrapper.addEventListener("mouseenter", () => wrapper.classList.add("zooming"));
    wrapper.addEventListener("mouseleave", () => {
        wrapper.classList.remove("zooming");
        wrapper.querySelectorAll("img").forEach(img => (img.style.transformOrigin = "center"));
    });
}

// ========================================
// SWIPE GESTURES (mobile slideshow + dismiss)
// ========================================
function initSwipe(modal) {
    const wrapper = modal.querySelector(".modal_image_wrapper");
    if (!wrapper) return;
    let startX = 0, startY = 0, deltaX = 0, deltaY = 0, swiping = false;

    wrapper.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        swiping = true;
    }, { passive: true });

    wrapper.addEventListener("touchmove", (e) => {
        if (!swiping) return;
        deltaX = e.touches[0].clientX - startX;
        deltaY = e.touches[0].clientY - startY;
    }, { passive: true });

    wrapper.addEventListener("touchend", () => {
        if (!swiping) return;
        swiping = false;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            stopAutoSlideshow();
            gotoSlide(modal, slideshowState.currentIndex + (deltaX < 0 ? 1 : -1));
        }
        deltaX = 0; deltaY = 0;
    });
}

// ========================================
// SIZE CHART
// ========================================
function getSizeChartHTML(product) {
    const cat = product.category;
    if (cat === "socks") {
        return `
            <table class="size_chart_table">
                <thead><tr><th>EU Size</th><th>UK</th><th>US</th></tr></thead>
                <tbody>
                    <tr><td>34 – 38</td><td>2 – 5</td><td>3 – 6</td></tr>
                    <tr><td>38 – 42</td><td>5 – 8</td><td>6 – 9</td></tr>
                    <tr><td>42 – 45</td><td>8 – 10.5</td><td>9 – 11.5</td></tr>
                    <tr><td>46 – 49</td><td>11 – 13</td><td>12 – 14</td></tr>
                </tbody>
            </table>`;
    }
    // apparel default
    return `
        <table class="size_chart_table">
            <thead><tr><th>Size</th><th>Chest (cm)</th><th>Length (cm)</th></tr></thead>
            <tbody>
                <tr><td>S</td><td>92 – 96</td><td>68</td></tr>
                <tr><td>M</td><td>97 – 102</td><td>70</td></tr>
                <tr><td>L</td><td>103 – 108</td><td>72</td></tr>
                <tr><td>XL</td><td>109 – 114</td><td>74</td></tr>
            </tbody>
        </table>`;
}

// ========================================
// LIGHTBOX
// ========================================
function openLightbox(src, alt) {
    const lightbox = document.getElementById("image_lightbox");
    if (!lightbox) return;
    const img = lightbox.querySelector(".lightbox_img");
    img.src = src;
    img.alt = alt || "";
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("visible");
}

function closeLightbox() {
    const lightbox = document.getElementById("image_lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("visible");
    lightbox.setAttribute("aria-hidden", "true");
}

// ========================================
// MAIN MODAL CONTROLLER
// ========================================
function initModal() {
    const modal = document.getElementById("product_modal");
    const container = document.getElementById("products_grid");
    if (!modal || !container) return;

    // Open from product grid
    container.addEventListener("click", (e) => {
        const card = e.target.closest(".products_box");
        if (!card) return;
        const index = parseInt(card.getAttribute("data-product-index"), 10);
        openProductModal(index, card);
    });

    // All modal interactions are delegated here
    modal.addEventListener("click", (e) => {
        // CLOSE (backdrop or X)
        if (e.target === modal || e.target.closest(".close_modal")) {
            closeProductModal();
            return;
        }

        // LIGHTBOX TRIGGER
        const lightboxBtn = e.target.closest(".lightbox_trigger");
        if (lightboxBtn) {
            const wrapper = modal.querySelector(".modal_image_wrapper");
            const activeImg = wrapper.querySelector("img.active") || wrapper.querySelector("img");
            if (activeImg) openLightbox(activeImg.src, activeImg.alt);
            return;
        }

        // LIGHTBOX CLOSE (clicking the lightbox)
        const lightbox = e.target.closest("#image_lightbox");
        if (lightbox && (e.target === lightbox || e.target.closest(".lightbox_close"))) {
            closeLightbox();
            return;
        }

        // SLIDESHOW: arrow nav
        const arrow = e.target.closest(".slide_arrow");
        if (arrow) {
            stopAutoSlideshow();
            gotoSlide(modal, slideshowState.currentIndex + (arrow.classList.contains("next") ? 1 : -1));
            return;
        }

        // SLIDESHOW: dot nav
        const dot = e.target.closest(".slide_dot");
        if (dot) {
            stopAutoSlideshow();
            gotoSlide(modal, parseInt(dot.dataset.slide, 10));
            return;
        }

        // SIZE CHART link
        if (e.target.closest(".size_chart_link")) {
            const inline = modal.querySelector(".size_chart_inline");
            const link = modal.querySelector(".size_chart_link");
            if (inline) {
                const willOpen = inline.hasAttribute("hidden");
                inline.toggleAttribute("hidden");
                link.textContent = willOpen ? "Hide size chart ›" : "View size chart ›";
            }
            return;
        }

        // SIZE PILL select
        if (e.target.classList.contains("pill")) {
            const pillContainer = e.target.closest(".variant_pills");
            pillContainer.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");
            const orderBtn = document.getElementById("whatsapp_order_btn");
            if (orderBtn) orderBtn.classList.remove("disabled");
            return;
        }

        // QUANTITY STEPPER
        const qtyBtn = e.target.closest(".qty_btn");
        if (qtyBtn) {
            const stepper = qtyBtn.closest(".qty_stepper");
            const input = stepper.querySelector(".qty_input");
            const min = parseInt(stepper.dataset.min, 10) || 1;
            const max = parseInt(stepper.dataset.max, 10) || 99;
            let val = parseInt(input.value, 10) || min;
            val += qtyBtn.classList.contains("plus") ? 1 : -1;
            val = Math.max(min, Math.min(max, val));
            input.value = val;
            updateQuantityTotal(modal);
            const orderBtn = document.getElementById("whatsapp_order_btn");
            if (orderBtn) orderBtn.classList.remove("disabled");
            return;
        }

        // RELATED PRODUCT click — swap modal content
        const relatedCard = e.target.closest(".modal_related_card");
        if (relatedCard) {
            const idx = parseInt(relatedCard.dataset.relatedIndex, 10);
            // Soft transition: fade content, swap, fade back
            const content = modal.querySelector(".modal_content");
            content.classList.add("swapping");
            setTimeout(() => {
                openProductModal(idx);
                modal.querySelector(".modal_content")?.classList.remove("swapping");
            }, 200);
            return;
        }

        // WHATSAPP ORDER
        const waBtn = e.target.closest("#whatsapp_order_btn");
        if (waBtn) {
            if (waBtn.classList.contains("disabled")) {
                // Highlight the variant group instead of shaking the button
                const variantGroup = modal.querySelector(".modal_variant_group");
                if (variantGroup) {
                    variantGroup.classList.add("needs-attention");
                    variantGroup.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => variantGroup.classList.remove("needs-attention"), 1400);
                }
                return;
            }
            const activePill = modal.querySelector(".variant_pills .pill.active");
            const qtyInput = modal.querySelector(".qty_input");
            const selected = activePill ? activePill.innerText : "";
            const qty = qtyInput ? parseInt(qtyInput.value, 10) : null;
            const productName = modal.querySelector(".modal_title").innerText;
            const productPrice = modal.querySelector(".modal_price").innerText;
            const totalText = modal.querySelector(".cta_total")?.textContent.trim();
            const url = `${window.location.origin}${window.location.pathname}#${slugify(productName)}`;

            let extras = "";
            if (selected) extras += ` — Size: ${selected}`;
            if (qty && qty > 1) extras += ` — Quantity: ${qty}`;

            const phoneNumber = "351911861637";
            const textMessage = `Hello! I'd like to order ${productName} (${productPrice})${extras}${totalText ? ` — Total: ${totalText.replace(/^—\s*/, "")}` : ""}.\n\nProduct: ${url}`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`, "_blank");
            return;
        }

        // WHATSAPP NOTIFY (coming soon)
        const notifyBtn = e.target.closest("#whatsapp_notify_btn");
        if (notifyBtn) {
            const productName = modal.querySelector(".modal_title").innerText;
            const url = `${window.location.origin}${window.location.pathname}#${slugify(productName)}`;
            const phoneNumber = "351911861637";
            const textMessage = `Hi! Please notify me when "${productName}" is back in stock.\n\nProduct: ${url}`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`, "_blank");
            return;
        }
    });

    // Quantity input direct change
    modal.addEventListener("input", (e) => {
        if (e.target.classList.contains("qty_input")) {
            const stepper = e.target.closest(".qty_stepper");
            const min = parseInt(stepper.dataset.min, 10) || 1;
            const max = parseInt(stepper.dataset.max, 10) || 99;
            let val = parseInt(e.target.value, 10);
            if (isNaN(val)) val = min;
            val = Math.max(min, Math.min(max, val));
            e.target.value = val;
            updateQuantityTotal(modal);
            const orderBtn = document.getElementById("whatsapp_order_btn");
            if (orderBtn) orderBtn.classList.remove("disabled");
        }
    });

    // Global keys
    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;

        // Lightbox open? Esc closes it
        const lightbox = document.getElementById("image_lightbox");
        if (lightbox && lightbox.classList.contains("visible")) {
            if (e.key === "Escape") {
                closeLightbox();
                e.stopPropagation();
            }
            return;
        }

        if (e.key === "Escape") {
            closeProductModal();
        } else if (e.key === "ArrowLeft" && slideshowState.total > 1) {
            stopAutoSlideshow();
            gotoSlide(modal, slideshowState.currentIndex - 1);
        } else if (e.key === "ArrowRight" && slideshowState.total > 1) {
            stopAutoSlideshow();
            gotoSlide(modal, slideshowState.currentIndex + 1);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts("all");
    initFilterBar();
    initModal();
    // Preload secondary images after a short delay so it doesn't compete with the LCP
    setTimeout(preloadProductImages, 1500);
});
