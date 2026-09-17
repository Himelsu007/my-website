/* =====================================================
   PRODUCT STRUCTURED DATA
   -----------------------------------------------------
   Generates the Product/Offer JSON-LD from the same products[] array the page
   renders from, so the two can no longer drift.

   Previously two products were marked up by hand out of sixteen, and one of
   those carried a price that did not match the catalogue. Everything else was
   invisible to Google.

   Only products with a known priceEUR are emitted: an Offer without a price is
   invalid, and inventing one would be worse than omitting it. Add a price to a
   sold-out item and it starts appearing here automatically, marked OutOfStock.
   ===================================================== */
(function () {
    "use strict";

    if (typeof products === "undefined") return;

    var ORIGIN = "https://www.lockedinlx.com";
    var PAGE   = ORIGIN + "/merch.html";

    var AVAILABILITY = {
        available: "https://schema.org/InStock",
        soldout:   "https://schema.org/OutOfStock",
        soon:      "https://schema.org/PreOrder"
    };

    function abs(src) {
        if (!src) return null;
        return /^https?:/.test(src) ? src : ORIGIN + "/" + String(src).replace(/^\/+/, "");
    }

    function sku(p) {
        return "LILX-" + slugify(p.name).toUpperCase().replace(/-/g, "-").slice(0, 40);
    }

    /* Sizes / quantities the product is offered in. Quantity pickers are not a
       product property, so only option sets that look like sizes are included. */
    function optionProps(p) {
        if (!p.options || !p.options.length) return undefined;
        var label = String(p.optionTitle || "").replace(/<[^>]*>/g, "").trim() || "Option";
        if (/quantity/i.test(label)) return undefined;
        return p.options.map(function (v) {
            return { "@type": "PropertyValue", name: label, value: String(v) };
        });
    }

    function toProduct(p, i) {
        var id = PAGE + "#" + slugify(p.name);
        var images = [p.image].concat(p.images || []).filter(Boolean).map(abs);

        var node = {
            "@type": "Product",
            "@id": id,
            name: p.name,
            description: p.description || undefined,
            sku: sku(p),
            image: images.length ? images : undefined,
            brand: { "@type": "Brand", name: "NBA Elite" },
            additionalProperty: optionProps(p),
            offers: {
                "@type": "Offer",
                url: id,
                price: Number(p.priceEUR).toFixed(2),
                priceCurrency: "EUR",
                priceValidUntil: "2026-12-31",
                availability: AVAILABILITY[p.status] || AVAILABILITY.available,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Locked In Lx" },
                shippingDetails: {
                    "@type": "OfferShippingDetails",
                    shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "EUR" },
                    deliveryTime: {
                        "@type": "ShippingDeliveryTime",
                        handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
                        transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" }
                    }
                },
                hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    applicableCountry: "PT",
                    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                    merchantReturnDays: 14,
                    returnMethod: "https://schema.org/ReturnInStore",
                    returnFees: "https://schema.org/FreeReturn"
                }
            }
        };

        return { "@type": "ListItem", position: i + 1, item: node };
    }

    var priced = products.filter(function (p) { return p.priceEUR != null; });
    if (!priced.length) return;

    var graph = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": PAGE + "#product-list",
        name: "Locked In Lx Store",
        numberOfItems: priced.length,
        itemListElement: priced.map(toProduct)
    };

    var node = document.createElement("script");
    node.type = "application/ld+json";
    node.textContent = JSON.stringify(graph, function (k, v) {
        return v === undefined ? undefined : v;
    });
    document.head.appendChild(node);
})();
