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
        // Colours: add or remove a string and the pills, the WhatsApp order and
        // the bag all follow. Nothing else to change.
        colors: ["Black", "White"],
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
// SHORT PRODUCT CODES
// ========================================
// order.html has to name the products in a bag that reached it through a URL,
// and a WhatsApp message with the full names spelled out in the link is the
// wall of text we are trying to get rid of. So each product gets a 4-character
// code derived from its name, and the link carries codes instead.
//
// Derived, not stored, so there is no second list to keep in sync — but that
// also means RENAMING a product invalidates any order link already sent for
// it. The slip degrades to "item not in the catalogue" rather than showing the
// wrong product, and the total in the WhatsApp message is independent of all
// this, so an order is never lost. Rename between sending and opening a link
// and you just have to read the items off the chat.
function lxProductCode(name) {
    var h = 0x811c9dc5;                       // FNV-1a, 32-bit
    for (var i = 0; i < name.length; i++) {
        h ^= name.charCodeAt(i);
        h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
    }
    return ("000" + (h % 1679616).toString(36)).slice(-4);   // 36^4
}

function lxFindProductByCode(code) {
    for (var i = 0; i < products.length; i++) {
        if (lxProductCode(products[i].name) === code) return products[i];
    }
    return null;
}
