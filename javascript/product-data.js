// ========================================
// PRODUCT DATA
// ========================================

const products = [

{
name:"Nike Elite Pro T-Shirt",
price:"€49.99",
image:"../assets/images/products/nike-elite-tee-white.png"
},

{
name:"Locked In Performance Socks",
price:"€14.99",
image:"../assets/images/products/nike-elite-tank-top-black.png"
},

{
name:"Elite Training Tank",
price:"€39.99",
image:"../assets/images/products/nike-elite-tee-black.png.webp"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-tank-top-white.jpeg"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-long-sleeve-white.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-short-sleeve-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-long-sleeve-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-short-sleeve-white.jpeg"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-socks-black.png"
},

{
name:"Game Day Headband",
price:"€12.99",
image:"../assets/images/products/nike-elite-socks-white.png"
},

];


// ========================================
// PRODUCT LOADER
// ========================================

function loadProducts() {
    const container = document.getElementById("products_show_case_container");

    products.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "products_box";
        // Store the index so we can find the data later
        card.setAttribute("data-product-index", index);

        card.innerHTML = `
            <div class="product_image" style="background-image:url('${product.image}')"></div>
            <div class="product_info">
                <span class="product_name barlow-condensed-regular">${product.name}</span>
                <span class="product_price barlow-condensed-regular">${product.price}</span>
            </div>
        `;
        container.appendChild(card);
    });

    // Initialize Modal Logic after products are loaded
    initModal();
}

function initModal() {
    const modal = document.getElementById("product_modal");
    const modalBody = document.getElementById("modal_body");
    const container = document.getElementById("products_show_case_container");
    const closeBtn = document.querySelector(".close_modal");

    // Event Delegation: Listen for clicks on the container
    container.addEventListener("click", (e) => {
        const card = e.target.closest(".products_box");
        if (!card) return; // Exit if user clicked container but not a card

        const index = card.getAttribute("data-product-index");
        const product = products[index];

        // Inject content into modal
        modalBody.innerHTML = `
            <img src="${product.image}" style="width:100%; max-height:300px; object-fit:contain;">
            <h2 class="barlow-condensed-black">${product.name}</h2>
            <p class="product_price">${product.price}</p>
            <p class="inter-regular">Premium quality materials designed for elite performance on the court.</p>
            <button class="featured_cta">Add to Cart</button>
        `;

        modal.classList.add("active");
    });

    // Close Logic
    closeBtn.onclick = () => modal.classList.remove("active");
    
    window.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

});