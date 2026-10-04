// ========================================
// PRODUCT RENDERING
// ========================================
// The catalogue itself lives in product-catalog.js — edit prices, colours and
// stock there. This file only turns it into a storefront.


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
            ${product.tag ? `<span class="product_badge">${product.tag}</span>` : ""}
        </div>
        <div class="product_info">
            <span class="product_name barlow-condensed-regular">${product.name}</span>
            <span class="product_price">${displayPrice(product)}</span>
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
    // With nothing marked "soon" the chip would only open an empty shelf, so
    // it stays out of the row until a product is announced again.
    const soonChip = bar.querySelector('[data-filter="coming-soon"]');
    if (soonChip) soonChip.hidden = !products.some(isSoon);
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
// Colour names come from the catalogue, but anything interpolated into markup
// gets escaped — cheap insurance against a stray quote breaking an attribute.
function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(s) {
    return (s || "").toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

// Parses a price string like "€18" → 18. Returns null for COMING SOON / SOLD OUT.
function parsePrice(priceStr) {
    const match = /([\d.]+)/.exec(priceStr || "");
    return match ? parseFloat(match[1]) : null;
}

// Euro after the figure, the way it is written in Portugal.
function formatPrice(value) {
    return `${Number.isInteger(value) ? value : value.toFixed(2)}€`;
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
    modal.querySelectorAll(".modal_thumb").forEach((t, i) =>
        t.classList.toggle("active", i === slideshowState.currentIndex));

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

    // ---- COLOUR (optional second dimension) ----
    // Add or remove a colour by editing the `colors` array on the product in the
    // catalogue above — same style as events.js. Whatever is picked here rides
    // along on the WhatsApp message and the bag line automatically.
    let colorHTML = "";
    if (product.colors && product.colors.length) {
        const onlyOneColor = product.colors.length === 1;
        const swatches = product.colors.map(c =>
            `<button class="pill color_pill${onlyOneColor ? " active" : ""}" type="button"
                     data-color="${esc(c)}" ${!isAvailable ? "disabled" : ""}>
                <span class="color_dot" data-swatch="${esc(c.toLowerCase())}"></span>${esc(c)}
             </button>`
        ).join("");
        colorHTML = `
            <div class="modal_variant_group modal_color_group">
                <div class="modal_variant_header">
                    <h4 class="inter-medium">Colour</h4>
                </div>
                <div class="variant_pills color_pills">${swatches}</div>
            </div>`;
    }

    // ---- VARIANT UI (pills OR quantity stepper) ----
    const outOptions = new Set(product.unavailable || []);
    const sizeChoices = (product.options || []).filter(o => !outOptions.has(o));
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
            // Sizes that are out stay on show, dimmed and disabled, so the range
            // is visible; if only one is left it comes pre-picked.
            const onlyOne = sizeChoices.length === 1;
            const pillsHTML = product.options.map(opt => {
                const out = outOptions.has(opt);
                return `<button class="pill${onlyOne && !out ? " active" : ""}${out ? " is-out" : ""}" type="button"${!isAvailable || out ? " disabled" : ""}${out ? ` aria-label="${opt}, not available"` : ""}>${opt}</button>`;
            }).join("");
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
        const needsSize  = !!product.options && !isQuantity && sizeChoices.length > 1;
        const needsColor = !!product.colors && product.colors.length > 1;
        const requiresPick = needsSize || needsColor;
        // Two paths on purpose: order this one thing now, or collect several and
        // send them as a single message from the bag.
        /* The reference's bar: a round bag button and one wide pill. Until every
           choice is made, the pill itself says what is missing — the job the
           separate hint line used to do, without adding a line above the bar. */
        const pickLabel = needsSize && needsColor ? "Pick a colour and size"
                        : needsColor ? "Pick a colour" : "Pick a size";
        ctaHTML = `<div class="modal_cta_row">
            <button id="add_to_bag_btn" class="bag_btn ${requiresPick ? "disabled" : ""}" type="button"
                    data-index="${products.indexOf(product)}" aria-label="Add to bag">
                <!-- The same bag the floating bag button uses, so it reads as
                     "the bag" on sight; the + says this puts something in it. -->
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span class="bag_plus" aria-hidden="true">+</span>
                <span class="bag_label">Add to bag</span>
                <!-- Swapped in for a moment after each add (desktop): the
                     label rises out and this rises in. The toast still
                     announces it to screen readers. -->
                <span class="bag_added" aria-hidden="true"><b class="bag_added_n">+1</b>Added</span>
            </button>
            <button id="whatsapp_order_btn" class="whatsapp_btn ${requiresPick ? "disabled" : ""}" type="button"
                    data-index="${products.indexOf(product)}" data-pick="${requiresPick ? pickLabel : ""}">
                <span class="cta_label">${requiresPick ? pickLabel : "Order on WhatsApp"}</span>
                <span class="cta_total" data-unit-price="${unitPrice ?? ""}"></span>
            </button>
        </div>`;
    }


    // ---- BUILD ----
    // What sits where the reference has its rating. A true fact the buyer
    // wants, not a number nobody has given.
    const CATEGORY_LABEL = { socks: "Socks", balls: "Basketballs", apparel: "Apparel", accessories: "Accessories" };
    const catLabel = CATEGORY_LABEL[product.category] || "";
    const availability = isAvailable ? "12h delivery in Lisbon"
                       : isComingSoon ? "Coming soon" : "Sold out";
    // Basketballs don't carry the 12h line; their row reads "Basketballs |
    // In stock". A sold-out or coming-soon ball would still say so.
    const showAvailability = !(isAvailable && product.category === "balls");

    modal.innerHTML = `
        <div class="modal_content" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
            <!-- Pinned above the scroll, so the way out is always where the
                 thumb expects it. A back chevron on a phone, a cross on desktop. -->
            <div class="modal_topbar">
                <button class="close_modal" type="button" aria-label="Close">
                    <svg class="ic-back" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
                    <svg class="ic-close" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
                <span class="modal_topbar_title">Product Details</span>
                <span class="modal_topbar_crumb">Store <i>/</i> ${catLabel || "Gear"} <i>/</i> <b>${product.name}</b></span>
                <span class="modal_topbar_spacer" aria-hidden="true"></span>
            </div>

            <div class="modal_scroll">
            <div class="modal_image_wrapper tile-${product.tile || "photo"} ${isSoldOut ? "sold_out_img" : ""}" data-zoomable="true">
                <div class="modal_image_skeleton"></div>
                ${imagesHTML}
                ${product.tag ? `<span class="product_badge">${product.tag}</span>` : ""}
                ${arrowsHTML}
                ${dotsHTML}
                <button class="lightbox_trigger" type="button" aria-label="Open fullscreen view">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                </button>
            </div>

            ${hasMultiple ? `<div class="modal_thumbs" role="tablist" aria-label="Product images">${
                imagesToLoad.map((src, i) =>
                    `<button class="modal_thumb${i === 0 ? " active" : ""}" type="button" data-slide="${i}" aria-label="Show image ${i + 1}"><img src="${src}" alt="" loading="lazy" decoding="async"></button>`
                ).join("")}</div>` : ""}

            <div class="modal_details">
                <div class="modal_headrow">
                    <h2 id="${titleId}" class="modal_title">${product.name}</h2>
                    <div class="modal_price">${displayPrice(product)}</div>
                </div>
                <div class="modal_meta">
                    ${catLabel ? `<span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8" r="1.4"/></svg>${catLabel}</span>${showAvailability ? `<i aria-hidden="true">|</i>` : ""}` : ""}
                    ${showAvailability ? `<span class="${isAvailable ? "" : "is-off"}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.6L21 13v2.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>${availability}</span>` : ""}
                    ${isAvailable ? `<i aria-hidden="true" class="meta_sep_stock">|</i><span class="meta_stock">In stock</span>` : ""}
                </div>

                <div class="modal_section">
                    <h3 class="modal_section_title">Details</h3>
                    ${product.lead ? `<p class="modal_lead">${product.lead}</p>` : ""}
                    <p class="modal_description">${product.description || "Premium gear for elite performance."}</p>
                </div>

                <div class="modal_options">
                    ${colorHTML}
                    ${variantsHTML}
                </div>

                <!-- Desktop only: the facts a phone screen has no room for. All
                     of them already stated elsewhere on the site — nothing new
                     is promised here. -->
                <ul class="modal_facts">
                    <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.6L21 13v2.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg><span><b>12h delivery</b>Free anywhere in Lisbon</span></li>
                    <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 0 0 18M12 3a15 15 0 0 1 0 18M3.5 9h17M3.5 15h17"/></svg><span><b>Pick up at a run</b>Free, at your next game</span></li>
                    <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg><span><b>30-day returns</b>Just message us</span></li>
                    <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12.5a8.3 8.3 0 0 1-12.2 7.3L3 21l1.3-4.6A8.3 8.3 0 1 1 20 12.5z"/></svg><span><b>No online payment</b>Confirm on WhatsApp</span></li>
                </ul>
                ${product.sku ? `<p class="modal_sku">SKU <span>${esc(product.sku)}</span></p>` : ""}
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

    /* Opening a product is a step the Back button should undo. Without this
       entry, Back on a phone — or the iOS edge swipe, which is how most people
       leave anything — skipped straight past the sheet and out of the store.
       Pushed before the scroll lock, so the entry remembers the real scroll
       position rather than the locked one. */
    if (!modalHistoryPushed) {
        try { history.pushState({ lxModal: true }, ""); modalHistoryPushed = true; } catch (e) {}
    }
    /* The skeleton is a loading placeholder, not a backdrop. It was never
       taken away, so it sat behind every photo running its shimmer forever,
       and a transparent cut-out showed it through — the black socks, tagged
       for a white card like their shelf tile, opened on near-black. */
    const skeleton = modal.querySelector(".modal_image_skeleton");
    const firstImg = modal.querySelector(".modal_image_wrapper img");
    if (skeleton) {
        if (!firstImg || (firstImg.complete && firstImg.naturalWidth)) skeleton.remove();
        else {
            const drop = () => skeleton.remove();
            firstImg.addEventListener("load", drop, { once: true });
            firstImg.addEventListener("error", drop, { once: true });
        }
    }

    modal.dataset.productIndex = String(index);
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

let modalHistoryPushed = false;

/* fromHistory: true when Back closed it, so the entry is already gone. Any
   other way out (×, backdrop, Esc, swipe) has to consume that entry itself,
   or the next Back press would appear to do nothing. */
function closeProductModal(fromHistory) {
    const modal = document.getElementById("product_modal");
    if (!modal || !modal.classList.contains("active")) return;
    modal.classList.remove("active");
    if (modalHistoryPushed) {
        modalHistoryPushed = false;
        if (fromHistory !== true) { try { history.back(); } catch (e) {} }
    }
    // A drag-to-dismiss leaves inline transforms behind; clear them so the
    // next open slides up from the stylesheet's position, not from wherever
    // the finger let go.
    const sheet = modal.querySelector(".modal_content");
    if (sheet) { sheet.style.transform = ""; sheet.style.transition = ""; }
    modal.style.removeProperty("--lx-drag");
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
/*
 * One gesture surface, two jobs. Sideways changes the photo; downwards, on a
 * phone, when the sheet is scrolled to the top, pulls the whole sheet down to
 * close it — which is what the grab handle has always promised and never did.
 *
 * The axis is decided once, after the finger has moved 8px, and then held, so
 * a slightly diagonal swipe through the photos cannot turn into a dismiss
 * halfway through. A downward drag on a sheet that is scrolled into its
 * details is left to scroll; it only becomes a dismiss from the top.
 */
function initSwipe(modal) {
    const wrapper = modal.querySelector(".modal_image_wrapper");
    const topbar = modal.querySelector(".modal_topbar");
    const sheet = modal.querySelector(".modal_content");
    const scroller = modal.querySelector(".modal_scroll");
    if (!wrapper || !sheet) return;
    const isSheet = () => window.matchMedia("(max-width: 640px)").matches;

    // Two places take a drag: the photo (sideways = next photo, down = close,
    // but only from the top of the scroll) and the bar with the handle, which
    // never scrolls — so pulling it down always closes the sheet.
    let startX = 0, startY = 0, startT = 0, dx = 0, dy = 0, axis = null, live = false, fromPhoto = false;

    const start = (e, photo) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startT = Date.now();
        dx = dy = 0; axis = null; live = true; fromPhoto = photo;
    };

    // Not passive: once a drag is a dismiss, the page's own pull-to-bounce has
    // to be cancelled or iOS fights the sheet for the same finger.
    const move = (e) => {
        if (!live) return;
        dx = e.touches[0].clientX - startX;
        dy = e.touches[0].clientY - startY;
        if (!axis) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            if (Math.abs(dx) > Math.abs(dy)) axis = "x";
            else if (dy > 0 && isSheet() && (!fromPhoto || !scroller || scroller.scrollTop <= 0)) axis = "dismiss";
            else axis = "scroll";
        }
        if (axis === "dismiss") {
            e.preventDefault();
            const pull = Math.max(0, dy);
            sheet.style.transition = "none";
            sheet.style.transform = `translateY(${pull}px)`;
            // The backdrop lifts as the sheet goes, so it reads as leaving.
            modal.style.setProperty("--lx-drag", Math.min(1, pull / 320).toFixed(3));
        }
    };

    const finish = () => {
        if (!live) return;
        live = false;
        if (axis === "x" && fromPhoto && Math.abs(dx) > 50) {
            stopAutoSlideshow();
            gotoSlide(modal, slideshowState.currentIndex + (dx < 0 ? 1 : -1));
        } else if (axis === "dismiss") {
            const speed = dy / Math.max(1, Date.now() - startT);   // px per ms
            // Far enough, or a quick flick: either reads as "go away".
            if (dy > 110 || (dy > 36 && speed > 0.55)) {
                sheet.style.transition = "transform 0.24s cubic-bezier(0.33, 1, 0.68, 1)";
                sheet.style.transform = "translateY(105%)";
                setTimeout(() => closeProductModal(), 200);
            } else {
                sheet.style.transition = "transform 0.42s cubic-bezier(0.34, 1.3, 0.44, 1)";
                sheet.style.transform = "";
                modal.style.removeProperty("--lx-drag");
                setTimeout(() => { sheet.style.transition = ""; }, 440);
            }
        }
        axis = null; dx = dy = 0;
    };

    [[wrapper, true], [topbar, false]].forEach(([el, photo]) => {
        if (!el) return;
        el.addEventListener("touchstart", (e) => start(e, photo), { passive: true });
        el.addEventListener("touchmove", move, { passive: false });
        el.addEventListener("touchend", finish);
        el.addEventListener("touchcancel", finish);
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

// Enables the CTAs only once every pill group in the sheet has a selection.
/*
 * Both buttons are off until every choice is made — and the sheet says which
 * choice is still missing.
 *
 * It used to just grey them out. Two buttons went dead at once, in two
 * different ways, with nothing to read: the only way to find out why was to
 * click one and watch the size row flinch. Naming the missing thing is the
 * whole fix; the styling below only stops the dead state looking like a
 * rendering fault.
 */
function refreshCtaGate(modal) {
    const missing = [];
    modal.querySelectorAll(".variant_pills").forEach(g => {
        if (g.querySelector(".pill.active")) return;
        missing.push(g.classList.contains("color_pills") ? "colour" : "size");
    });

    const ready = missing.length === 0;
    ["whatsapp_order_btn", "add_to_bag_btn"].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.toggle("disabled", !ready);
        btn.setAttribute("aria-disabled", String(!ready));
    });

    // The pill says what is missing until nothing is: "Pick a colour and
    // size", then "Pick a size", then the action itself.
    const label = modal.querySelector("#whatsapp_order_btn .cta_label");
    if (label) {
        label.textContent = ready ? "Order on WhatsApp" : "Pick " + (missing.length === 2
            ? "a colour and size"
            : "a " + missing[0]);
    }
}

/* The photo for the colour that was picked, if that colour has its own. */
function imageFor(product, color) {
    return (color && product.colorImages && product.colorImages[color]) || product.image;
}

/* The button answers the click itself: "Add to bag" rises out, "+1 Added"
   rises in, then the label comes back. Clicking again mid-way restarts it
   with the new count rather than queueing a second run. */
function celebrateAdd(btn, qty) {
    const n = btn.querySelector(".bag_added_n");
    if (n) n.textContent = "+" + qty;
    clearTimeout(btn._addedTimer);
    btn.classList.remove("is-added", "is-leaving");
    void btn.offsetWidth;
    btn.classList.add("is-added");
    btn._addedTimer = setTimeout(() => {
        btn.classList.replace("is-added", "is-leaving");
        btn._addedTimer = setTimeout(() => btn.classList.remove("is-leaving"), 650);
    }, 1600);
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
        const thumb = e.target.closest(".modal_thumb");
        if (thumb) {
            stopAutoSlideshow();
            gotoSlide(modal, Number(thumb.dataset.slide));
            return;
        }

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

        // SIZE / COLOUR PILL select — closest(), because a tap on a colour
        // swatch lands on the dot inside the pill, not on the pill itself.
        const pill = e.target.closest(".variant_pills .pill");
        if (pill) {
            if (pill.disabled) return;
            const pillContainer = pill.closest(".variant_pills");
            pillContainer.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            // A colour with its own photo brings that photo to the front.
            const shown = products[Number(modal.dataset.productIndex)];
            const colorSrc = pill.dataset.color && shown && shown.colorImages && shown.colorImages[pill.dataset.color];
            if (colorSrc) {
                const slide = [...modal.querySelectorAll(".modal_image_wrapper img")].findIndex(img => img.getAttribute("src") === colorSrc);
                if (slide >= 0) { stopAutoSlideshow(); gotoSlide(modal, slide); }
            }
            // Two dimensions now: picking a colour must not unlock the CTAs
            // while the size is still unchosen, and vice versa.
            refreshCtaGate(modal);
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
            const colorPill  = modal.querySelector(".color_pills .pill.active");
            const activePill = modal.querySelector(".variant_pills:not(.color_pills) .pill.active");
            const qtyInput = modal.querySelector(".qty_input");
            // Colour + size together identify the line, so black 42-46 and
            // white 42-46 stay separate rows in the bag.
            const parts = [];
            if (colorPill) parts.push(colorPill.dataset.color);
            if (activePill) parts.push(activePill.innerText.trim());
            const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
            LXBag.add({
                name: product.name,
                sku: product.sku || "",
                option: parts.join(" · "),
                price: product.priceEUR,
                qty,
                image: imageFor(product, colorPill && colorPill.dataset.color)
            });
            celebrateAdd(bagBtn, qty);
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
            const colorPill  = modal.querySelector(".color_pills .pill.active");
            const activePill = modal.querySelector(".variant_pills:not(.color_pills) .pill.active");
            const qtyInput = modal.querySelector(".qty_input");
            const product = products[Number(waBtn.dataset.index)];

            // Same composer as the bag, so one product and five products arrive
            // in the chat looking identical — header, reference, order slip.
            // Only the choices differ, and they are picked exactly the way the
            // Add to Bag branch picks them so the two can never disagree.
            if (product && typeof LXBag !== "undefined" && LXBag.sendOrder) {
                const parts = [];
                if (colorPill) parts.push(colorPill.dataset.color);
                if (activePill) parts.push(activePill.innerText.trim());
                LXBag.sendOrder([{
                    name: product.name,
                    sku: product.sku || "",
                    option: parts.join(" · "),
                    price: product.priceEUR,
                    qty: qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1
                }]);
                return;
            }

            // Fallback for the one case the composer cannot cover: bag.js
            // missing. Better a clumsy message than a dead button.
            const selected = activePill ? activePill.innerText : "";
            const qty = qtyInput ? parseInt(qtyInput.value, 10) : null;
            const productName = modal.querySelector(".modal_title").innerText;
            const productPrice = modal.querySelector(".modal_price").innerText;
            const url = `${window.location.origin}${window.location.pathname}#${slugify(productName)}`;

            let extras = "";
            if (colorPill) extras += ` — Colour: ${colorPill.dataset.color}`;
            if (selected) extras += ` — Size: ${selected}`;
            if (qty && qty > 1) extras += ` — Quantity: ${qty}`;

            const phoneNumber = "351911861637";
            const textMessage = `Hello! I'd like to order ${productName} (${productPrice})${extras}.\n\nProduct: ${url}`;
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

    window.addEventListener("popstate", () => {
        if (modal.classList.contains("active")) closeProductModal(true);
        else modalHistoryPushed = false;
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
