// ========================================
// PRODUCT DATA
// ========================================

// `sku` is the permanent identifier for a product — it is what the Matrix
// business app matches an order line against to find the right inventory
// item, and what the Product schema publishes to Google.
//
// It is written out rather than derived from the name on purpose. It used to
// be computed as "LILX-" + the slugified name, which meant renaming a product
// silently changed its code and unlinked it from stock that was already
// counted against it. These are exactly the values that formula produced, so
// nothing already synced moves — but from here the name is free to change and
// the code is not. Never edit an existing sku; a new product gets a new one.
//
// `tile` is the ground the photo sits on: "light" for a pack shot on white
// (or a dark cut-out placed on white), "dark" for a white cut-out placed on
// black, "photo" for a full photograph.
//
// `lead` is the one-line headline over the description in the sheet.
//
// `unavailable` lists options that exist but are out right now: they still
// show, dimmed and unclickable, so a shopper sees the range and what is left.
// When one option remains it is picked for them.
const products = [
    {
        name: "Regular Elite Crew Socks #Black",
        sku: "LILX-REGULAR-ELITE-CREW-SOCKS-BLACK",
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
        lead: "Locked in from the ground up.",
        description: "A snug black crew that stays put through every cut, closeout and sprint back on defence. No slipping, no stopping to pull them up — just your game. Sizes 34 to 46.",
        optionTitle: "<strong>Size</strong>",
        options: ["34 - 38", "38 - 42", "42 - 46"]
    },
    {
        name: "Nba Nike Headband",
        sku: "LILX-NBA-NIKE-HEADBAND",
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
        lead: "Eyes on the rim, not the sweat.",
        description: "Nike's NBA headband catches sweat before it reaches your eyes, so nothing breaks your focus from warm-up to the last game of the night.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Nike Wristbands",
        sku: "LILX-NBA-NIKE-WRISTBANDS",
        tile: "light",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/nba-wristband/nba-wristband.webp",
        images: [
            "assets/images/products/nba-wristband/nba-wristband.webp",
            "assets/images/products/nba-wristband/nba-wristband-worn.webp"
        ],
        lead: "Dry hands on every catch.",
        description: "Double-wide terry soaks up sweat before it runs into your hands, so the ball feels the same on your last shot as on your first. Sold as a pair.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Wilson Alliance Series Platinum",
        sku: "LILX-WILSON-ALLIANCE-SERIES-PLATINUM",
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
        lead: "Made to be signed.",
        description: "The platinum edition of Wilson's Alliance Series, built to let autographs shine. Get it signed, give it a spot on the shelf, keep the moment. Official size 7.",
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },
    {
        name: "Wilson NBA Authentic Series Indoor",
        sku: "LILX-WILSON-NBA-AUTHENTIC-SERIES-INDOOR",
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
        lead: "Built for the hardwood.",
        description: "Wilson's NBA Authentic Series, made for indoor courts. Official size 7 — the ball to bring when the run is inside.",
        optionTitle: "<strong>Size</strong>",
        options: ["7"]
    },
    {
        name: "Nba Nike Elite Shooting Sleeve (White)",
        sku: "LILX-NBA-NIKE-ELITE-SHOOTING-SLEEVE-WHITE",
        tile: "dark",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/nba-shooting-sleeve.webp",
        images: [
            "assets/images/white-shooting-sleeve-bg.avif",
            "assets/images/products/nba-shooting-sleeve.webp"
        ],
        lead: "Same release, every quarter.",
        description: "Compression that keeps your shooting arm warm and supported, so your release feels in the fourth quarter the way it did in warm-ups. In clean white.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        name: "Nba Elite Crew Socks",
        sku: "LILX-NBA-ELITE-CREW-SOCKS",
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
        lead: "Our best seller. Black or white.",
        description: "The NBA Elite crew locks in from the first step and stays put until the final bucket — no slipping, no distractions. Sizes 38 to 49.",
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nba Nike Elite Shooting Sleeve (Black)",
        sku: "LILX-NBA-NIKE-ELITE-SHOOTING-SLEEVE-BLACK",
        tile: "light",
        priceEUR: 35,
        status: "available",
        category: "accessories",
        image: "assets/images/products/shooting-sleeve-black.webp",
        images: [
            "assets/images/black-shooting-sleeve-bg.avif",
            "assets/images/products/shooting-sleeve-black.webp"
        ],
        lead: "Your shooting arm, locked in.",
        description: "Compression that keeps your arm warm and supported from the first shot of the night to the last. In black.",
        optionTitle: "<strong>Quantity</strong>",
        options: ["1", "2", "3", "4"]
    },
    {
        // Named as in Matrix ("Nike Nba Compression Short Sleeves"). The white
        // one carries Matrix's own SKU, so its orders land on that stock; the
        // black one follows Matrix's LILX-{category}-{item}-{colour} pattern.
        name: "Nike Nba Compression Short Sleeves (Black)",
        sku: "LILX-TOP-CMP-SS-BLK",
        tile: "light",
        priceEUR: 50,
        status: "available",
        category: "apparel",
        image: "assets/images/products/nike-compression-short-sleeves/nike-compression-short-sleeves-black.webp",
        lead: "The base layer, in black.",
        description: "The Nike Pro NBA compression tee: Dri-FIT, light and tight to the body, made to be worn alone or under your jersey.",
        optionTitle: "<strong>Size</strong>",
        options: ["S", "M", "L"],
        unavailable: ["S", "L"]
    },
    {
        name: "Nike Nba Compression Short Sleeves (White)",
        sku: "LILX-TOP-CMP-SS",
        tile: "light",
        priceEUR: 50,
        status: "available",
        category: "apparel",
        image: "assets/images/products/nike-compression-short-sleeves/nike-compression-short-sleeves-white.webp",
        lead: "The base layer, in white.",
        description: "The Nike Pro NBA compression tee in white: Dri-FIT, light and tight to the body, so it stays out of your way from warm-up to the last run.",
        optionTitle: "<strong>Size</strong>",
        options: ["S", "M", "L"],
        unavailable: ["S", "L"]
    },
    {
        // Named and coded as in Matrix: its two "Nba Nike-Pro Combat
        // Compression Tank" records are told apart by colour tag, and these
        // SKUs are theirs, so an order lands on the right stock.
        name: "Nba Nike-Pro Combat Compression Tank (Black)",
        sku: "SLA",
        tile: "light",
        priceEUR: 50,
        status: "available",
        category: "apparel",
        image: "assets/images/products/nike-pro-combat-tank/nike-pro-combat-tank-black.webp",
        lead: "Sleeveless, second skin.",
        description: "The Nike Pro Combat NBA compression tank: Dri-FIT, light and tight to the body, with nothing on your shoulders between you and your shot.",
        optionTitle: "<strong>Size</strong>",
        options: ["S", "M", "L"],
        unavailable: ["S", "L"]
    },
    {
        name: "Nba Nike-Pro Combat Compression Tank (White)",
        sku: "AU09282",
        tile: "light",
        priceEUR: 50,
        status: "available",
        category: "apparel",
        image: "assets/images/products/nike-pro-combat-tank/nike-pro-combat-tank-white.webp",
        lead: "The tank, in white.",
        description: "The Nike Pro Combat NBA compression tank in white: Dri-FIT and tight to the body, made to be worn alone on warm nights or under your jersey.",
        optionTitle: "<strong>Size</strong>",
        options: ["S", "M", "L"],
        unavailable: ["S", "L"]
    },
    {
        name: "Nba Elite Crew Socks #SW",
        sku: "LILX-NBA-ELITE-CREW-SOCKS-SW",
        tile: "dark",
        priceEUR: null,
        status: "soldout",
        category: "socks",
        image: "assets/images/products/nba-elite-crew-socks/nike-elite-socks-white.webp",
        lead: "The Elite crew, all white.",
        description: "Comfort that lasts the whole run, in clean white. This one is sold out — the NBA Elite Crew Socks still come in white, and they're on the shelf now.",
        optionTitle: "<strong>Size</strong>",
        options: ["38 - 41", "42 - 45", "46 - 49"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TB",
        sku: "LILX-NIKE-NBA-ELITE-PRO-TANK-TOP-TB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-tank-top-black.webp",
        lead: "Nothing in the way of your shot.",
        description: "The Nike NBA Elite Pro tank in black. Sleeveless and light, made for high-tempo runs where every possession matters.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Tank Top #TW",
        sku: "LILX-NIKE-NBA-ELITE-PRO-TANK-TOP-TW",
        tile: "photo",
        priceEUR: null,
        status: "soldout",
        category: "apparel",
        image: "assets/images/products/nike-elite-tank-top-white.webp",
        lead: "Built for high-tempo runs.",
        description: "The Nike NBA Elite Pro tank in white. Sleeveless and light, so nothing gets between you and the next possession.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LSW",
        sku: "LILX-NIKE-NBA-ELITE-PRO-COMPRESSION-LSW",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-long-sleeve-white.webp",
        lead: "Legs locked in.",
        description: "Long Nike NBA Elite Pro compression tights in white — light and tight under your shorts, for colder nights and longer runs.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHB",
        sku: "LILX-NIKE-NBA-ELITE-PRO-COMPRESSION-SHB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-short-sleeve-black.webp",
        lead: "Locked in under your shorts.",
        description: "Nike NBA Elite Pro compression shorts in black: light, tight to the body and made to be worn under your game shorts, run after run.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #LHB",
        sku: "LILX-NIKE-NBA-ELITE-PRO-COMPRESSION-LHB",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-long-sleeve-black.webp",
        lead: "Full leg, full game.",
        description: "Long Nike NBA Elite Pro compression tights in black — light and tight under your shorts, warm enough for cold nights without slowing you down.",
        optionTitle: "Size",
        options: ["S", "M", "L"]
    },
    {
        name: "Nike Nba Elite Pro Compression #SHW",
        sku: "LILX-NIKE-NBA-ELITE-PRO-COMPRESSION-SHW",
        tile: "photo",
        priceEUR: null,
        status: "soon",
        category: "apparel",
        image: "assets/images/products/nike-elite-short-sleeve-white.webp",
        lead: "Light, tight, ready.",
        description: "Nike NBA Elite Pro compression shorts in white. Made for players who don't take days off, just like the pros in the NBA.",
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
