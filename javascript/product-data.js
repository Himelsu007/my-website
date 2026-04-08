// ========================================
// PRODUCT DATA
// ========================================

const products = [
    {
        name: "Regular Elite Crew Socks #Black",
        price: "18€",
        image:"../assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks.webp",
        images: ["../assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks02.webp", "../assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks03.webp", "../assets/images/products/nba-elite-crew-socks/regular-nike-elite-socks-04.webp"], // <-- Array of images
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["34 - 38", "38 - 42", "42 - 46"]
    },

    {
        name: "Nba Elite Crew Socks #Black",
        price: "25€ - Delivery in 24h",
        tag: "Best Seller", 
        image:"../assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.png",
        images: ["../assets/images/products/nba-elite-crew-socks/nike-elite-socks-black.png", "../assets/images/products/nba-elite-crew-socks/nba-elite-crew0001.jpg.avif", "../assets/images/products/nba-elite-crew-socks/nba-elite-crew0003.jpg.avif", , "../assets/images/ben-simons-bg.JPG"], // <-- Array of images
        description: "No slipping nor distractions, just lockdown performance from the ground up.",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Wilson Alliance Series Platinum ",
        price: "80€",
        tag: "Exclusive", 
        image:"../assets/images/products/wilson-silver/wilson-official-ball-silver.png",
        images: ["../assets/images/products/wilson-silver/wilson-silver0002.webp", "../assets/images/products/wilson-silver/wilson-silver0001.webp", "../assets/images/products/wilson-silver/wilson-silver0003.avif"],
        description: "Let professional autographs shine with the Wilson Alliance Series. ",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["7"]
    },
{
        name: "Wilson NBA Authentic Series Indoor ",
        price: "50€",
        image:"../assets/images/products/wilson-orange/wilson-official-ball.jpg",
        images: ["../assets/images/products/wilson-orange/wilson-orange0002.avif", "../assets/images/products/wilson-orange/wilson-orange0001.avif", "../assets/images/products/wilson-orange/wilson-orange0003.avif"],
        description: "NBA experiences can happen anytime, anyplace.",
        isSoldOut: false,
        optionTitle: "<strong> Size <strong>",
        options: ["7"]
},
{
        name: "Nba Elite Crew Socks #White",
        price: "SOLD OUT",
        image:"../assets/images/products/nba-elite-crew-socks/nike-elite-socks-white.png",
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
        name: "Nike Nba Elite Pro Tank Top #TB ",
        price:"COMING SOON",
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
        name: "Nike Nba Elite Pro Tank Top #TW ",
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
    
    // We need a global variable to store our timer so we can kill it later
    let slideshowInterval; 

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

        // --- NEW SLIDESHOW LOGIC ---
        // Support the new 'images' array, but fallback to 'image' string if not updated yet
        const imagesToLoad = product.images || [product.image];
        
        // Loop through images and add the 'active' class ONLY to the first one
        const imagesHTML = imagesToLoad.map((imgUrl, i) => 
            `<img src="${imgUrl}" alt="${product.name}" class="${i === 0 ? 'active' : ''}">`
        ).join('');

        modal.innerHTML = `
            <div class="modal_content">
                <div class="modal_image_wrapper ${isSoldOut ? 'sold_out_img' : ''}">
                    ${imagesHTML}
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

        // --- START SLIDESHOW TIMER ---
        clearInterval(slideshowInterval); // Clear any ghost timers just to be safe
        
        if (imagesToLoad.length > 1) {
            let currentImgIndex = 0;
            const imgElements = modal.querySelectorAll('.modal_image_wrapper img');
            
            slideshowInterval = setInterval(() => {
                // Remove active from current
                imgElements[currentImgIndex].classList.remove('active');
                
                // Move to next index, loop back to 0 if at the end
                currentImgIndex = (currentImgIndex + 1) % imgElements.length;
                
                // Add active to new
                imgElements[currentImgIndex].classList.add('active');
            }, 2400); // 2.4s interval
        }
    });

    // Handle Modal Interactions
    modal.addEventListener("click", (e) => {
        // 1. Close logic
        if (e.target === modal || e.target.closest(".close_modal")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
            clearInterval(slideshowInterval); // CRITICAL: Stop the slideshow when closed
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
                waBtn.classList.add("shake");
                setTimeout(() => waBtn.classList.remove("shake"), 500);
                return;
            }

            const selectedSize = document.querySelector(".variant_pills .pill.active").innerText;
            const productName = document.querySelector(".modal_title").innerText;
            const productPrice = document.querySelector(".modal_price").innerText;

            const phoneNumber = "351911861637"; 
            const textMessage = `Hello! I would like to order the ${productName} (${productPrice}) - Size: ${selectedSize}.`;
            const encodedMessage = encodeURIComponent(textMessage);
            
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(waUrl, '_blank'); 
        }
    });

    // Close on Escape Key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
            clearInterval(slideshowInterval); // CRITICAL: Stop the slideshow when closed
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

});