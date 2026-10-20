#!/usr/bin/env node
// ========================================
// STORE BUILD — what search engines read
// ========================================
// The storefront is drawn by JavaScript from javascript/product-catalog.js,
// so to a crawler merch.html is one page with no products in it. This script
// writes the parts Google needs as plain HTML/XML, all from that same
// catalogue so nothing can drift:
//
//   store/<slug>/index.html   one page per product: the store with that
//                             product's sheet open, plus its name, price,
//                             photos and Product data in the page itself
//   merch.html                the store's product list (ItemList JSON-LD)
//   sitemap.xml               every product page and every photo
//   feeds/google-merchant.xml the Merchant Center feed (one item per size)
//
// bump-assets.sh runs it, so it happens on every catalogue change. To run it
// on its own:   node tools/build-store.mjs [path/to/product-catalog.js]

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.lockedinlx.com";
const STORE_URL = `${ORIGIN}/merch.html`;
const PHONE = "351911861637";
const TODAY = new Date().toISOString().slice(0, 10);

const catalogPath = path.resolve(process.argv[2] || path.join(ROOT, "javascript/product-catalog.js"));
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(catalogPath, "utf8"), ctx, { filename: catalogPath });
const products = vm.runInContext("products", ctx);

const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => {
    fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, f), s);
};

// ---- helpers ----
// Same slug rule as product-data.js, which links the shelf cards to these pages.
const slugify = s => String(s || "").toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
const slugOf = p => p.slug || slugify(p.name);
const pageUrl = p => `${ORIGIN}/store/${slugOf(p)}/`;
const abs = src => (/^https?:/.test(src) ? src : `${ORIGIN}/${String(src).replace(/^\/+/, "")}`);
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = s => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
// For values read back out of merch.html's own markup.
const unescape = s => String(s).replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const euros = v => `${Number.isInteger(v) ? v : v.toFixed(2)}€`;
const skuOf = p => p.sku || `LILX-${slugify(p.name).toUpperCase().slice(0, 40)}`;
const hasPrice = p => p.priceEUR != null;

const CATEGORY = { socks: "Socks", balls: "Basketballs", apparel: "Apparel", accessories: "Accessories" };

function imagesOf(p) {
    const all = [p.image, ...(p.images || []), ...Object.values(p.colorImages || {})];
    return [...new Set(all.filter(Boolean))];
}

// Every product so far is Nike or Wilson; the name says which. A product
// can still set `brand` in the catalogue if the name ever doesn't.
function brandOf(p) {
    if (p.brand) return p.brand;
    if (/wilson/i.test(p.name)) return "Wilson";
    if (/molten/i.test(p.name)) return "Molten";
    if (/spalding/i.test(p.name)) return "Spalding";
    if (/nike|nba|elite/i.test(p.name)) return "Nike";
    return "Locked In Lx";
}

const describe = p => [p.lead, p.description].map(text).filter(Boolean).join(" ");

// Sizes only — a quantity picker is not a property of the product.
function sizesOf(p) {
    if (!p.options || !p.options.length || !/size/i.test(text(p.optionTitle))) return null;
    const out = new Set((p.unavailable || []).map(String));
    return p.options.map(v => ({ value: String(v), inStock: !out.has(String(v)) }));
}

function inStock(p) {
    const sizes = sizesOf(p);
    return p.status === "available" && (!sizes || sizes.some(s => s.inStock));
}

const availabilityLabel = p => (inStock(p) ? "In stock" : p.status === "soon" ? "Coming soon" : "Out of stock");
const pageTitle = p => `${p.name} | Locked In Lx Store, Lisbon`;

function metaDescription(p) {
    const tail = hasPrice(p) ? ` ${euros(p.priceEUR)} at Locked In Lx, Lisbon. Order on WhatsApp.` : " Locked In Lx, Lisbon.";
    let body = describe(p);
    const room = 158 - tail.length;
    if (body.length > room) body = body.slice(0, room - 1).replace(/\s+\S*$/, "") + "…";
    return body + tail;
}

// ---- Product structured data ----
// Shipping and returns say what the product sheet says: free delivery, a day
// at most, 30-day returns.
function productLd(p) {
    const url = pageUrl(p);
    const node = {
        "@type": "Product",
        "@id": `${url}#product`,
        name: p.name,
        url,
        description: describe(p) || undefined,
        sku: skuOf(p),
        image: imagesOf(p).map(abs),
        brand: { "@type": "Brand", name: brandOf(p) },
        category: CATEGORY[p.category]
    };
    if (hasPrice(p)) {
        node.offers = {
            "@type": "Offer",
            url,
            price: Number(p.priceEUR).toFixed(2),
            priceCurrency: "EUR",
            availability: inStock(p) ? "https://schema.org/InStock"
                : p.status === "soon" ? "https://schema.org/PreOrder" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Locked In Lx", url: `${ORIGIN}/` },
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "EUR" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "PT" },
                deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
                    transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" }
                }
            },
            hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "PT",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 30,
                returnFees: "https://schema.org/FreeReturn"
            }
        };
    }
    return node;
}

const crumbs = (...items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item }))
});

const ldScript = graph => `<!-- lx:store-ld -->
<script type="application/ld+json">
${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 4)}
</script>
<!-- /lx:store-ld -->`;

// Replaces exactly one match, or stops the build — a template change that
// silently skipped a tag would publish 19 pages with the wrong title.
function swap(html, re, replacement, label) {
    const hits = html.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"));
    if (!hits || hits.length !== 1) throw new Error(`build-store: expected one ${label} in merch.html, found ${hits ? hits.length : 0}`);
    return html.replace(re, replacement);
}

const metaTag = (attr, key, value) => new RegExp(`<meta ${attr}="${key}" content="[^"]*">`);

// ---- merch.html: the store's own list ----
const listed = products.filter(p => p.status !== "soon" || hasPrice(p));
let merch = read("merch.html");
merch = swap(merch, /<!-- lx:store-ld -->[\s\S]*?<!-- \/lx:store-ld -->/, ldScript([
    {
        "@type": "CollectionPage",
        "@id": `${STORE_URL}#webpage`,
        name: "Locked In Lx Store",
        url: STORE_URL,
        description: unescape(merch.match(/<meta name="description" content="([^"]*)">/)[1]),
        breadcrumb: crumbs(["Home", `${ORIGIN}/`], ["Store", STORE_URL]),
        mainEntity: {
            "@type": "ItemList",
            "@id": `${STORE_URL}#products`,
            numberOfItems: listed.length,
            itemListElement: listed.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: pageUrl(p), name: p.name }))
        }
    }
]), "store JSON-LD block");
const merchChanged = merch.replace(/\?v=\d+/g, "") !== read("merch.html").replace(/\?v=\d+/g, "");
write("merch.html", merch);

// ---- store/<slug>/index.html ----
const storeTitle = unescape(merch.match(/<title>([^<]*)<\/title>/)[1].trim());

function staticProduct(p) {
    const url = pageUrl(p);
    const sizes = sizesOf(p);
    const photos = imagesOf(p).map((src, i) =>
        `<img src="/${esc(src.replace(/^\/+/, ""))}" alt="${esc(p.name)} — view ${i + 1}"${i ? ' loading="lazy"' : ""} decoding="async">`).join("\n            ");
    const order = `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello! I'd like to order ${p.name}${hasPrice(p) ? ` (${euros(p.priceEUR)})` : ""}.\n\nProduct: ${url}`)}`;
    const facts = [
        p.category !== "balls" && "Express delivery, free anywhere in Lisbon",
        "Pick up at a run, free",
        "30-day returns, just message us",
        "No online payment: confirm on WhatsApp"
    ].filter(Boolean);
    return `<!-- lx:product — written by tools/build-store.mjs. With JavaScript on,
     the store opens this product's sheet instead and this stays hidden. -->
<article class="pp-static" aria-labelledby="pp_title">
    <nav class="pp-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/merch.html">Store</a> / <span>${esc(CATEGORY[p.category] || "Gear")}</span></nav>
    <h1 id="pp_title">${esc(p.name)}</h1>
    <p class="pp-price">${hasPrice(p) ? euros(p.priceEUR) : ""} <span>${availabilityLabel(p)}</span></p>
    <div class="pp-photos">
            ${photos}
    </div>
    ${p.lead ? `<p class="pp-lead">${p.lead}</p>` : ""}
    ${p.description ? `<p>${p.description}</p>` : ""}
    ${sizes ? `<p class="pp-sizes"><strong>Size:</strong> ${sizes.map(s => esc(s.value) + (s.inStock ? "" : " (out of stock)")).join(", ")}</p>` : ""}
    <ul class="pp-facts">
        ${facts.map(f => `<li>${f}</li>`).join("\n        ")}
    </ul>
    <p class="pp-actions"><a class="pp-order" href="${esc(order)}" target="_blank" rel="noopener">Order on WhatsApp</a> <a href="/merch.html">Back to the store</a></p>
</article>`;
}

function productPage(p) {
    const url = pageUrl(p);
    const title = pageTitle(p);
    const desc = metaDescription(p);
    const image = abs(imagesOf(p)[0]);
    let h = merch;
    // Everything on the page is written relative to the site root.
    h = swap(h, /<meta charset="UTF-8">/, `<meta charset="UTF-8">
    <base href="/">
    <script>document.documentElement.className += " lx-js";</script>`, "charset meta");
    h = swap(h, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, "title");
    h = swap(h, metaTag("name", "description"), `<meta name="description" content="${esc(desc)}">`, "description");
    h = swap(h, metaTag("property", "og:type"), `<meta property="og:type" content="product">`, "og:type");
    h = swap(h, metaTag("property", "og:url"), `<meta property="og:url" content="${url}">`, "og:url");
    h = swap(h, metaTag("property", "og:title"), `<meta property="og:title" content="${esc(title)}">`, "og:title");
    h = swap(h, metaTag("property", "og:description"), `<meta property="og:description" content="${esc(desc)}">`, "og:description");
    h = swap(h, metaTag("property", "og:image"), `<meta property="og:image" content="${esc(image)}">`, "og:image");
    h = swap(h, /\s*<meta property="og:image:width" content="[^"]*">\s*<meta property="og:image:height" content="[^"]*">/, "", "og:image size");
    h = swap(h, metaTag("property", "og:image:alt"), `<meta property="og:image:alt" content="${esc(p.name)}">${hasPrice(p) ? `
    <meta property="product:price:amount" content="${Number(p.priceEUR).toFixed(2)}">
    <meta property="product:price:currency" content="EUR">` : ""}`, "og:image:alt");
    h = swap(h, metaTag("name", "twitter:url"), `<meta name="twitter:url" content="${url}">`, "twitter:url");
    h = swap(h, metaTag("name", "twitter:title"), `<meta name="twitter:title" content="${esc(title)}">`, "twitter:title");
    h = swap(h, metaTag("name", "twitter:description"), `<meta name="twitter:description" content="${esc(desc)}">`, "twitter:description");
    h = swap(h, metaTag("name", "twitter:image"), `<meta name="twitter:image" content="${esc(image)}">`, "twitter:image");
    h = swap(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, "canonical");
    h = swap(h, /<!-- lx:store-ld -->[\s\S]*?<!-- \/lx:store-ld -->/, ldScript([
        productLd(p),
        crumbs(["Home", `${ORIGIN}/`], ["Store", STORE_URL], [p.name, url])
    ]), "store JSON-LD block");
    h = swap(h, /<body>/, `<body data-product-slug="${esc(slugOf(p))}" data-store-title="${esc(storeTitle)}">`, "body tag");
    // The product's own heading replaces the store's.
    h = swap(h, /<h1 class="sr-only"[^>]*>[\s\S]*?<\/h1>/, staticProduct(p), "store h1");
    return h;
}

const sameContent = (a, b) => a != null && a.replace(/\?v=\d+/g, "") === b.replace(/\?v=\d+/g, "");
const prevSitemap = read("sitemap.xml");
const prevLastmod = loc => {
    const m = prevSitemap.match(new RegExp(`<loc>${loc.replace(/[.?*+^$()[\]{}|\\/]/g, "\\$&")}</loc>\\s*<lastmod>([\\d-]+)</lastmod>`));
    return m ? m[1] : null;
};

const pages = [];
const seen = new Set();
for (const p of listed) {
    const slug = slugOf(p);
    if (seen.has(slug)) throw new Error(`build-store: two products share the page /store/${slug}/ — give one a \`slug\``);
    seen.add(slug);
    const file = `store/${slug}/index.html`;
    const html = productPage(p);
    let before = null;
    try { before = read(file); } catch (e) {}
    const lastmod = sameContent(before, html) ? (prevLastmod(pageUrl(p)) || TODAY) : TODAY;
    write(file, html);
    pages.push({ p, lastmod });
}

// Pages for products that have left the catalogue go with them. Only folders
// this script wrote are touched.
for (const dir of fs.readdirSync(path.join(ROOT, "store"), { withFileTypes: true })) {
    if (!dir.isDirectory() || seen.has(dir.name)) continue;
    const file = path.join(ROOT, "store", dir.name, "index.html");
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8").includes("data-product-slug=")) {
        fs.rmSync(path.join(ROOT, "store", dir.name), { recursive: true });
    }
}

// /store/ on its own has nothing to show; send it to the shelf.
write("store/index.html", `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Locked In Lx Store</title>
    <link rel="canonical" href="${STORE_URL}">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=/merch.html">
</head>
<body>
    <p><a href="/merch.html">Go to the Locked In Lx store</a></p>
</body>
</html>
`);

// ---- sitemap.xml ----
const newest = pages.reduce((m, x) => (x.lastmod > m ? x.lastmod : m), merchChanged ? TODAY : (prevLastmod(STORE_URL) || TODAY));
const imageTags = srcs => srcs.map(src => `
    <image:image>
        <image:loc>${esc(abs(src))}</image:loc>
    </image:image>`).join("");
const storeUrls = `<!-- lx:store — written by tools/build-store.mjs -->
<url>
    <loc>${STORE_URL}</loc>
    <lastmod>${newest}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTags(listed.map(p => p.image).filter(Boolean))}
</url>
${pages.map(({ p, lastmod }) => `
<url>
    <loc>${pageUrl(p)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTags(imagesOf(p))}
</url>`).join("\n")}
<!-- /lx:store -->`;
let sitemap = prevSitemap;
if (/<!-- lx:store /.test(sitemap)) {
    sitemap = sitemap.replace(/<!-- lx:store [\s\S]*?<!-- \/lx:store -->/, storeUrls);
} else {
    const old = /<url>\s*<loc>https:\/\/www\.lockedinlx\.com\/merch\.html<\/loc>[\s\S]*?<\/url>/;
    if (!old.test(sitemap)) throw new Error("build-store: no merch.html entry in sitemap.xml to replace");
    sitemap = sitemap.replace(old, storeUrls);
}
write("sitemap.xml", sitemap);

// ---- feeds/google-merchant.xml ----
// One item per size, grouped by product, so a size that is out shows as out.
const x = s => esc(s).replace(/'/g, "&apos;");
const items = [];
for (const p of listed.filter(hasPrice)) {
    const imgs = imagesOf(p).map(abs);
    const sizes = sizesOf(p);
    const wearable = p.category === "socks" || p.category === "apparel" || p.category === "accessories";
    const variants = sizes ? sizes : [null];
    for (const s of variants) {
        const id = s ? `${skuOf(p)}-${s.value.replace(/\s+/g, "")}` : skuOf(p);
        const available = s ? p.status === "available" && s.inStock : inStock(p);
        items.push(`    <item>
        <g:id>${x(id)}</g:id>${sizes ? `
        <g:item_group_id>${x(skuOf(p))}</g:item_group_id>` : ""}
        <g:title>${x(s ? `${p.name} – Size ${s.value}` : p.name)}</g:title>
        <g:description>${x(describe(p))}</g:description>
        <g:link>${x(pageUrl(p))}</g:link>
        <g:image_link>${x(imgs[0])}</g:image_link>${imgs.slice(1, 11).map(i => `
        <g:additional_image_link>${x(i)}</g:additional_image_link>`).join("")}
        <g:availability>${available ? "in_stock" : "out_of_stock"}</g:availability>
        <g:price>${Number(p.priceEUR).toFixed(2)} EUR</g:price>
        <g:brand>${x(brandOf(p))}</g:brand>
        <g:condition>new</g:condition>
        <g:product_type>${x(`Basketball &gt; ${CATEGORY[p.category] || "Gear"}`).replace(/&amp;gt;/, "&gt;")}</g:product_type>${s ? `
        <g:size>${x(s.value)}</g:size>` : ""}${wearable ? `
        <g:gender>unisex</g:gender>
        <g:age_group>adult</g:age_group>` : ""}
    </item>`);
    }
}
write("feeds/google-merchant.xml", `<?xml version="1.0" encoding="UTF-8"?>
<!-- Written by tools/build-store.mjs from javascript/product-catalog.js. Edit the catalogue, not this file. -->
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
    <title>Locked In Lx Store</title>
    <link>${STORE_URL}</link>
    <description>Basketball socks, balls and gear from Locked In Lx, Lisbon.</description>
${items.join("\n")}
</channel>
</rss>
`);

console.log(`store build -> ${pages.length} product pages, ${items.length} feed items`);
