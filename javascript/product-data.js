// ========================================
// PRODUCT DATA
// ========================================

const products = [
{
        name: "Nike Elite Pro T-Shirt",
        price: "€49.99",
        image: "../assets/images/products/nike-elite-tee-white.png",
        description: "Engineered with Dri-FIT technology for high-intensity runs.",
        tag: "LIMITED EDITION", // New Badge
        isSoldOut: false        // This one is now sold out
    },

    {
        name: "Locked In Performance Socks",
        price: "€14.99",
        image: "../assets/images/products/nike-elite-tank-top-black.png",
        description: "Extra cushioning for maximum comfort on the court.",
        tag: "NEW ARRIVAL",   
        isSoldOut: false
    },
    


{
        name:"Elite Training Tank",
        price:"€39.99",
        image:"../assets/images/products/nike-elite-tee-black.png.webp",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "LIMITED EDITION",
        isSoldOut: false

},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-tank-top-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false

},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-long-sleeve-white.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false

},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-short-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false
},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-long-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false

},

{
        name:"Game Day Headband",
        price:"SOLD OUT",
        image:"../assets/images/products/nike-elite-short-sleeve-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: true

},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-socks-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false

},

{
        name:"Game Day Headband",
        price:"€12.99",
        image:"../assets/images/products/nike-elite-socks-white.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        tag: "NEW ARRIVAL",
        isSoldOut: false

},

];


// ========================================
// PRODUCT LOADER
// ========================================
function loadProducts() {
    const container = document.getElementById("products_show_case_container");
    products.forEach((product, index) => {
        const card = document.createElement("div");
        // Add a class if it's sold out
        card.className = `products_box ${product.isSoldOut ? 'is_sold_out' : ''}`;
        card.setAttribute("data-product-index", index);
        card.innerHTML = `
            <div class="product_image" style="background-image:url('${product.image}')">
                ${product.isSoldOut ? '<span class="sold_out_label">OUT OF STOCK</span>' : ''}
            </div>
            <div class="product_info">
                <span class="product_name barlow-condensed-regular">${product.name}</span>
                <span class="product_price barlow-condensed-regular">${product.price}</span>
            </div>
        `;
        container.appendChild(card);
    });
    
    initModal();
}

function initModal() {
    const modal = document.getElementById("product_modal");
    const container = document.getElementById("products_show_case_container");

    // Open Modal Logic
    container.addEventListener("click", (e) => {
        const card = e.target.closest(".products_box");
        if (!card) return;

const index = card.getAttribute("data-product-index");
const product = products[index];
const isSoldOut = product.isSoldOut;

modal.innerHTML = `
    <div class="modal_content">
        <div class="modal_image_wrapper ${isSoldOut ? 'sold_out_img' : ''}">
            <img src="${product.image}" alt="${product.name}">
            ${product.tag ? `<span class="product_badge">${product.tag}</span>` : ''}
            <button class="close_modal">✕</button>
        </div>
        
        <div class="modal_details">
            <h2 class="modal_title barlow-condensed-black">${product.name.toUpperCase()}</h2>
            <div class="modal_price barlow-condensed-black">${product.price}</div>
            
            <p class="modal_description inter-regular">
                ${product.description || "Premium gear for elite performance."}
            </p>
            
            <div class="modal_variant_group">
                <h4 class="inter-medium">Size</h4>
                <div class="variant_pills">
                    <button class="pill" ${isSoldOut ? 'disabled' : ''}>S</button>
                    <button class="pill" ${isSoldOut ? 'disabled' : ''}>M</button>
                    <button class="pill" ${isSoldOut ? 'disabled' : ''}>L</button>
                </div>
            </div>
            
            <div class="whatsapp_container">
                ${isSoldOut ? 
                    `<button class="sold_out_btn" disabled>OUT OF STOCK</button>` : // Disabled button for sold out products
                    `<button id="whatsapp_order_btn" class="whatsapp_btn disabled">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382..."/> </svg>
                        WhatsApp Order
                    </button>`
                }
            </div>
        </div>
    </div>
`;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    // Handle Modal Interactions
    modal.addEventListener("click", (e) => {
        // 1. Close logic
        if (e.target === modal || e.target.closest(".close_modal")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }

        // 2. Size Pill Selection
        if (e.target.classList.contains("pill")) {
            const pillContainer = e.target.closest(".variant_pills");
            pillContainer.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");

            // Enable the WhatsApp button now that a size is selected
            document.getElementById("whatsapp_order_btn").classList.remove("disabled");
        }

        // 3. WhatsApp Order Execution
        const waBtn = e.target.closest("#whatsapp_order_btn");
        if (waBtn) {
            if (waBtn.classList.contains("disabled")) {
                // Button is disabled, shake it to tell the user they missed something
                waBtn.classList.add("shake");
                setTimeout(() => waBtn.classList.remove("shake"), 500);
                return;
            }

            // Grab the data
            const selectedSize = document.querySelector(".variant_pills .pill.active").innerText;
            const productName = document.querySelector(".modal_title").innerText;
            const productPrice = document.querySelector(".modal_price").innerText;

            // Build the URL
            const phoneNumber = "351911861637"; // <--- CHANGE THIS (e.g., 351912345678)
            const textMessage = `Hello! I would like to order the ${productName} (${productPrice}). Size: ${selectedSize}.`;
            const encodedMessage = encodeURIComponent(textMessage);
            
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(waUrl, '_blank'); // Opens in a new tab/app
        }
    });

    // Close on Escape Key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

});