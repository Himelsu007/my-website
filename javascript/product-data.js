// ========================================
// PRODUCT DATA
// ========================================

const products = [

    {
        name: "Elite Crew Socks - Black",
        price: "25€",
        image:"../assets/images/products/nike-elite-socks-black.png",
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Wilson Alliance Series Platinum ",
        price: "59.99€",
        tag: "Exclusive", // New Badge
        image:"../assets/images/products/wilson-official-ball-silver.png",
        description: "Let professional autographs shine with the Wilson Alliance Series. ",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["7"]
    },
{
        name: "Wilson NBA Authentic Series Indoor ",
        price: "59.99€",
        image:"../assets/images/products/wilson-official-ball.jpg",
        description: "When high-performance meets high-demand, authentic NBA experiences can happen anytime, anyplace.",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["7"]
},
{
        name: "Elite Crew Socks - White",
        price: "SOLD OUT",
        image:"../assets/images/products/nike-elite-socks-white.png",
        description: "Maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "<strong> Size <strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
},

{
        name: "Nike Nba Elite Pro Compression #SW",
        price: "SOLD OUT",
        image: "../assets/images/products/nike-elite-tee-white.png",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA. ",
        tag: "LIMITED EDITION", // New Badge
        isSoldOut: true     ,   
        optionTitle: "Size", 
        options: ["S", "M", "L"],
    },

    {
        name: "Nike Nba Elite Pro Tank Top - Black ",
        price:"SOLD OUT",
        image: "../assets/images/products/nike-elite-tank-top-black.png",
        description: "Designed for high-tempo runs where every possession matters.",
        isSoldOut: true, // This one is now sold out
        optionTitle: "Size", 
        options: ["S", "M", "L"]
    },

{
        name: "Nike NBA Elite Pro Compression #SB ",
        price:"SOLD OUT",
        image:"../assets/images/products/nike-elite-tee-black.png.webp",
        description: "Lightweight, tight fit, and made for those who don't take days off, just like the pros in the NBA. ",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]
},

{
        name: "Nike Nba Elite Pro Tank Top - White ",
        price:"SOLD OUT",
        image:"../assets/images/products/nike-elite-tank-top-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]
},

{
        name:"Nike Nba Elite Pro Compression #LSW  ",
        price: "COMING SOON",
        image:"../assets/images/products/nike-elite-long-sleeve-white.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]
},

{
        name:"Nike Nba Elite Pro Compression #SHB ",
        price: "COMING SOON",
        image:"../assets/images/products/nike-elite-short-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]
},

{
        name:"Nike Nba Elite Pro Compression #LHB ",
        price: "COMING SOON",
        image:"../assets/images/products/nike-elite-long-sleeve-black.png",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]

},

{
        name:"Nike Nba Elite Pro Compression #SHW ",
        price: "COMING SOON",
        image:"../assets/images/products/nike-elite-short-sleeve-white.jpeg",
        description: "Extra cushioning in high-impact areas for maximum comfort on the court.",
        isSoldOut: true,
        optionTitle: "Size", 
        options: ["S", "M", "L"]

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
                ${product.isSoldOut ? '<span class="sold_out_label"></span>' : ''}
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

    // ==========================================
    // 1. OPEN MODAL & BUILD HTML DYNAMICALLY
    // ==========================================
    container.addEventListener("click", (e) => {
        const card = e.target.closest(".products_box");
        if (!card) return;

        const index = card.getAttribute("data-product-index");
        const product = products[index];
        const isSoldOut = product.isSoldOut;

        // DYNAMICALLY BUILD THE VARIANT PILLS HTML
        let variantsHTML = "";
        if (product.options && product.options.length > 0) {
            const pillsHTML = product.options.map(opt => 
                `<button class="pill" ${isSoldOut ? 'disabled' : ''}>${opt}</button>`
            ).join('');

            variantsHTML = `
                <div class="modal_variant_group">
                    <h4 class="inter-medium">${product.optionTitle || "Select Size"}</h4>
                    <div class="variant_pills">
                        ${pillsHTML}
                    </div>
                </div>
            `;
        }

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
                    
                    ${variantsHTML}
                    
                    <div class="whatsapp_container">
                        ${isSoldOut ? 
                            `<button class="sold_out_btn" disabled>OUT OF STOCK</button>` :
                            `<button id="whatsapp_order_btn" class="whatsapp_btn ${product.options ? 'disabled' : ''}">
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
            const textMessage = `Hello! I would like to order the ${productName} (${productPrice}) - Size: ${selectedSize}.`;
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

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

});