// ========================================
// PRODUCT DATA
// ========================================

const products = [
    {
        name: "Regular Elite Crew Socks #Black",
        tile: "light",
        priceEUR: 18,
        status: "available",
        category: "socks",
        image: "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks.webp",
        images: [
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks02.webp",
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks03.webp",
            "assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks-04.webp"
        ],
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        optionTitle: "<strong>Size</strong>",
        options: ["34 - 38", "38 - 42", "42 - 46"]
    },
    {
        name: "Nba Nike Headband",
        tile: "light",
        priceEUR: 30,
        status: "available",
        category: "accessories",
        image: "assets/images/products/nike-nba-dri-fit-fury-classic-headband-black.webp",
        images: [
            "assets/images/products/nba-nike-headband-bg-02.webp",
            "assets/images/products/nba-nike-headband-bg.webp",
            "assets/images/products/nba-nike-headband-bg-03.webp",
            "assets/images/products/nba-nike-headband-bg-04.webp"
        ],
        description: "Compression support for a consistent shot and full control.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Nike Wristbands",
        tile: "light",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/nba-wristband/nba-wristband.webp",
        images: [
            "assets/images/products/nba-wristband/nba-wristband.webp",
            "assets/images/products/nba-wristband/nba-wristband-worn.webp"
        ],
        description: "Double-wide terry cloth that keeps sweat off your hands. Sold as a pair.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Wilson Alliance Series Platinum",
        tile: "light",
        priceEUR: 80,
        status: "available",
        category: "balls",
        tag: "Exclusive",
        image: "assets/images/products/wilson-silver/wilson-official-ball-silver.webp",
        images: [
            "assets/images/products/wilson-silver/wilson-silver0002.webp",
            "assets/images/products/wilson-silver/wilson-silver0001.webp",
            "assets/images/products/wilson-silver/wilson-silver0003.webp"
        ],
        description: "Let professional autographs shine with the Wilson Alliance Series.",
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },
    {
        name: "Wilson NBA Authentic Series Indoor",
        tile: "light",
        priceEUR: 50,
        status: "available",
        category: "balls",
        image: "assets/images/products/wilson-orange/wilson-official-ball.webp",
        images: [
            "assets/images/products/wilson-orange/wilson-orange0002.webp",
            "assets/images/products/wilson-orange/wilson-orange0001.webp",
            "assets/images/products/wilson-orange/wilson-orange0003.webp"
        ],
        description: "NBA experiences can happen anytime, anyplace.",
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },
    {
        name: "Nba Nike Elite Shooting Sleeve (White)",
        tile: "dark",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/nba-shooting-sleeve.webp",
        images: [
            "assets/images/white-shooting-sleeve-bg.avif",
            "assets/images/products/nba-shooting-sleeve.webp"
        ],
        description: "Compression support for a consistent shot and full control.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Elite Crew Socks",
        tile: "light",
        priceEUR: 25,
        status: "available",
        category: "socks",
        tag: "Best Seller",
        image: "assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.webp",
        images: [
            "assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.webp",
            "assets/images/products/nba-elite-crew-socks/nba-elite-crew0001.webp",
            "assets/images/products/nba-elite-crew-socks/nba-elite-crew0003.webp",
            "assets/images/ben-simons-bg.avif"
        ],
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nba Nike Elite Shooting Sleeve (Black)",
        tile: "light",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/shooting-sleeve-black.webp",
        images: [
            "assets/images/black-shooting-sleeve-bg.avif",
            "assets/images/products/shooting-sleeve-black.webp"
        ],
        description: "Compression support for a consistent shot and full control.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Elite Crew Socks #SW",
        tile: "dark",
        priceEUR: null,
        status: "soldout",
        category: "socks",
        image: "assets/images/products/nba-elite-crew-socks/nike-elite-socks-white.webp",
        description: "Maximum comfort on the court.",
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SW",
        tile: "photo",
        priceEUR: null,
        status: "soldout",
        category: "apparel",
        image: "assets/images/products/nike-elite-tee-white.webp",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA.",
        tag: "Limited Edition",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-tank-top-black.webp",
        description: "Designed for high-tempo runs where every possession matters.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike NBA Elite Pro Compression #SB",
        tile: "photo",
        priceEUR: null,
        status: "soldout",
        category: "apparel",
        image: "assets/images/products/nike-elite-tee-black.webp",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TW",
        tile: "photo",
        priceEUR: null,
        status: "soldout",
        category: "apparel",
        image: "assets/images/products/nike-elite-tank-top-white.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LSW",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-long-sleeve-white.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-short-sleeve-black.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LHB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-long-sleeve-black.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHW",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-short-sleeve-white.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    }
];


// ========================================
// PRODUCT LOADER
// ========================================
// Builds one card. Shared by the main shelf and the "Back Soon" rail so the
// two can never drift apart.
function buildProductCard(product) {
    const absoluteIndex = products.indexOf(product);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `products_box ${isSoldOutP(product) ? "is_sold_out" : ""} ${isSoon(product) ? "is_coming_soon" : ""}`;
    card.setAttribute("data-product-index", absoluteIndex);
    card.setAttribute("aria-label", `View details for ${product.name}, ${displayPrice(product)}`);
    card.innerHTML = `
        <div class="product_image_wrapper tile-${product.tile || "photo"}">
            <img src="${product.image}" alt="${product.name}" class="product_image" loading="lazy" decoding="async">
        </div>
        <div class="product_info">
            <span class="product_name barlow-condensed-regular">${product.name}</span>
            <span class="product_price barlow-condensed-regular">${displayPrice(product)}</span>
        </div>`;
    return card;
}

function loadProducts(filter = "all") {
    const container = document.getElementById("products_grid");
    const emptyState = document.getElementById("products_empty_state");
    const soonSection = document.getElementById("products_unavailable");
    const soonGrid = document.getElementById("products_unavailable_grid");
    if (!container) return;

    container.innerHTML = "";
    if (soonGrid) soonGrid.innerHTML = "";

    const inFilter = p => {
        if (filter === "all") return true;
        if (filter === "coming-soon") return isSoon(p);
        return p.category === filter;
    };

    // The shelf only shows what can actually be bought. Anything sold out or
    // still coming drops to its own section underneath, so the storefront does
    // not read as picked over — more than half the catalogue is unbuyable.
    // The "Coming Soon" chip is the one filter where unavailable IS the intent.
    const wantsUnavailable = filter === "coming-soon";
    const visible = products.filter(p => inFilter(p) && (wantsUnavailable || isBuyable(p)));
    const unavailable = wantsUnavailable
        ? []
        : products.filter(p => inFilter(p) && !isBuyable(p));

    if (emptyState) {
        emptyState.hidden = visible.length > 0;
        // "No products in this category yet" is wrong when the category is full
        // of sold-out stock — say what is actually true.
        emptyState.textContent = unavailable.length
            ? "Nothing in stock in this category right now — see Back Soon below."
            : "No products in this category yet.";
    }

    if (soonSection) {
        soonSection.hidden = unavailable.length === 0;
        unavailable.forEach(product => soonGrid.appendChild(buildProductCard(product)));
    }

    visible.forEach((product) => {
        container.appendChild(buildProductCard(product));
    });
}

// ========================================
// IMAGE PRELOADER (avoids modal slideshow stutter)
// ----------------------------------------
// This used to fetch every image of every product 1.5s after load, which
// pulled the entire catalogue down on arrival and made the lazy-loading on the
// grid pointless. Now a product's gallery is fetched only when someone shows
// intent to open it, so the slideshow is still warm without the up-front cost.
// ========================================
const _preloaded = new Set();

function preloadProduct(product) {
    if (!product || _preloaded.has(product.name)) return;
    _preloaded.add(product.name);
    (product.images || [product.image]).forEach(src => {
        if (!src) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
    });
}

// Hovering or starting a tap on a card is a strong signal the modal is next.
function initPreloadOnIntent() {
    const warm = e => {
        const card = e.target.closest("[data-product-index]");
        if (!card) return;
        preloadProduct(products[Number(card.dataset.productIndex)]);
    };
    ["products_grid", "products_unavailable_grid"].forEach(id => {
        const grid = document.getElementById(id);
        if (!grid) return;
        grid.addEventListener("pointerenter", warm, true);
        grid.addEventListener("pointerdown", warm, true);
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

// ---- status ----
// `status` is the single source of truth: "available" | "soldout" | "soon".
// It replaced a price string that doubled as a status ("SOLD OUT"), which meant
// the price field could not be used for schema, sorting or totals — and had
// already drifted out of step with the old isSoldOut flag on one product.
const STATUS_LABEL = { available: "", soldout: "Sold Out", soon: "Coming Soon" };

const isBuyable   = p => p && p.status === "available";
const isSoon      = p => p && p.status === "soon";
const isSoldOutP  = p => p && p.status === "soldout";

// Shows the price when one is known, otherwise the status. Sold-out items with
// a recorded price will show the price and the badge together.
function displayPrice(p) {
    if (!p) return "";
    if (p.priceEUR != null) return formatPrice(p.priceEUR);
    return STATUS_LABEL[p.status] || "";
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

    // Covers the paths that bypass the grid (related-product clicks, deep links).
    preloadProduct(product);

    if (opener) slideshowState.openerElement = opener;

    const isSoldOut = isSoldOutP(product);
    const isComingSoon = isSoon(product);
    const isAvailable = isBuyable(product);
    const isQuantity = (product.optionTitle || "").toLowerCase().includes("quantity");
    const titleId = `modal_title_${slugify(product.name)}`;
    const unitPrice = product.priceEUR;

    // ---- IMAGES + SKELETON ----
    const imagesToLoad = (product.images || [product.image]).filter(Boolean);
    const imagesHTML = imagesToLoad.map((src, i) =>
        `<img src="${src}" alt="${product.name} — view ${i + 1}" class="${i === 0 ? "active" : ""}" draggable="false" loading="${i === 0 ? "eager" : "lazy"}" decoding="async">`
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
            const onlyOne = product.options.length === 1;
            const pillsHTML = product.options.map(opt =>
                `<button class="pill${onlyOne ? " active" : ""}" type="button" ${!isAvailable ? "disabled" : ""}>${opt}</button>`
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
        // A quantity stepper already has a valid default of 1, and a product
        // offered in exactly one size (both Wilson balls, size 7) has nothing
        // to choose — gating the CTAs on either left the buy buttons dead at
        // 45% opacity with no obvious way to wake them.
        const requiresPick = !!product.options && !isQuantity && product.options.length > 1;
        // Two paths on purpose: order this one thing now, or collect several and
        // send them as a single message from the bag.
        ctaHTML = `<div class="modal_cta_row">
            <button id="add_to_bag_btn" class="bag_btn ${requiresPick ? "disabled" : ""}" type="button"
                    data-index="${products.indexOf(product)}">Add to Bag</button>
            <button id="whatsapp_order_btn" class="whatsapp_btn ${requiresPick ? "disabled" : ""}" type="button">
                <span class="cta_label">WhatsApp Order</span>
                <span class="cta_total" data-unit-price="${unitPrice ?? ""}"></span>
            </button>
        </div>`;
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
                          <span class="barlow-condensed-bold">${displayPrice(r)}</span>
                      </div>
                  </button>`;
              }).join("")}</div>
           </div>`
        : "";

    // ---- BUILD ----
    modal.innerHTML = `
        <div class="modal_content" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
            <button class="close_modal" type="button" aria-label="Close">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>

            <div class="modal_scroll">
            <div class="modal_image_wrapper tile-${product.tile || "photo"} ${isSoldOut ? "sold_out_img" : ""}" data-zoomable="true">
                <div class="modal_image_skeleton"></div>
                ${imagesHTML}
                ${product.tag ? `<span class="product_badge">${product.tag}</span>` : ""}
                ${arrowsHTML}
                ${dotsHTML}
                ${hasMultiple ? `<div class="modal_slide_progress"><span class="modal_slide_progress_bar"></span></div>` : ""}
                <button class="lightbox_trigger" type="button" aria-label="Open fullscreen view">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                </button>
            </div>

            <div class="modal_details">
                <h2 id="${titleId}" class="modal_title barlow-condensed-black">${product.name.toUpperCase()}</h2>
                <div class="modal_price barlow-condensed-black">${displayPrice(product)}</div>

                ${urgencyHTML}

                <p class="modal_description inter-regular">
                    ${product.description || "Premium gear for elite performance."}
                </p>

                ${variantsHTML}

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
            </div><!-- /.modal_scroll -->

            <!-- Pinned: the sheet exists to sell this, so the action never scrolls away. -->
            <div class="modal_footer">
                <div class="whatsapp_container">
                    ${ctaHTML}
                </div>
            </div>
        </div>

        <!-- LIGHTBOX -->
        <div class="lightbox" id="image_lightbox" aria-hidden="true">
            <button class="lightbox_close" type="button" aria-label="Close fullscreen">&times;</button>
            <img class="lightbox_img" src="" alt="">
        </div>
    `;

    modal.classList.add("active");
    if (window.LXScrollLock) LXScrollLock.lock("productModal");

    // ---- INIT SLIDESHOW STATE ----
    slideshowState.currentIndex = 0;
    slideshowState.total = imagesToLoad.length;
    slideshowState.auto = hasMultiple;
    if (hasMultiple) startAutoSlideshow(modal);

    // ---- INIT QUANTITY STEPPER TOTAL ----
    updateQuantityTotal(modal);

    // ---- IMAGE HOVER ZOOM (desktop only) ----

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
    if (window.LXScrollLock) LXScrollLock.release("productModal");
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

    // Open from either shelf — the main grid or the "Back Soon" rail.
    const openFromCard = (e) => {
        const card = e.target.closest(".products_box");
        if (!card) return;
        const index = parseInt(card.getAttribute("data-product-index"), 10);
        openProductModal(index, card);
    };
    container.addEventListener("click", openFromCard);
    document.getElementById("products_unavailable_grid")
        ?.addEventListener("click", openFromCard);

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
            const bagBtn = document.getElementById("add_to_bag_btn");
            if (bagBtn) bagBtn.classList.remove("disabled");
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
            const bagBtn = document.getElementById("add_to_bag_btn");
            if (bagBtn) bagBtn.classList.remove("disabled");
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
        // ---- ADD TO BAG ----
        const bagBtn = e.target.closest("#add_to_bag_btn");
        if (bagBtn) {
            if (bagBtn.classList.contains("disabled")) {
                const variantGroup = modal.querySelector(".modal_variant_group");
                if (variantGroup) {
                    variantGroup.classList.add("needs-attention");
                    variantGroup.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => variantGroup.classList.remove("needs-attention"), 1400);
                }
                return;
            }
            const product = products[Number(bagBtn.dataset.index)];
            if (!product || typeof LXBag === "undefined") return;
            const activePill = modal.querySelector(".variant_pills .pill.active");
            const qtyInput = modal.querySelector(".qty_input");
            LXBag.add({
                name: product.name,
                option: activePill ? activePill.innerText.trim() : "",
                price: product.priceEUR,
                qty: qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1,
                image: product.image
            });
            return;
        }

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
            const bagBtn = document.getElementById("add_to_bag_btn");
            if (bagBtn) bagBtn.classList.remove("disabled");
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
    initPreloadOnIntent();
});
