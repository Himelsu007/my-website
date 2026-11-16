/* =====================================================
   SHIPPING RULES — one place for every fee
   -----------------------------------------------------
   Read by the bag (bag.js) and the order slip (order.html), so the fee the
   buyer agrees to and the one on their slip can't drift apart. The fee is
   also written into the order link, so changing a number here never changes
   an order already placed.

     Lisbon city   postcodes 1000–1999   free, same-day express
     Greater Lisbon postcodes 2600–2899  3€
     Rest of Portugal                    6€, by post
     EU                                  38€, by post
   ===================================================== */
(function () {
    var FEES = { pickup: 0, lisbon: 0, greater: 3, portugal: 6, eu: 38 };

    var ZONES = {
        pickup:   { label: "Pickup at the run", eta: "" },
        lisbon:   { label: "Express delivery, Lisbon", eta: "Same day if ordered before 18:00" },
        greater:  { label: "Delivery, Greater Lisbon", eta: "1–2 working days" },
        portugal: { label: "Shipping, Portugal", eta: "By post, 2–4 working days" },
        eu:       { label: "Shipping, EU", eta: "By post, 5–10 working days" }
    };

    /* Portugal first: nearly every order is from here. */
    var COUNTRIES = [
        ["PT", "Portugal"], ["AT", "Austria"], ["BE", "Belgium"], ["BG", "Bulgaria"],
        ["HR", "Croatia"], ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"],
        ["EE", "Estonia"], ["FI", "Finland"], ["FR", "France"], ["DE", "Germany"],
        ["GR", "Greece"], ["HU", "Hungary"], ["IE", "Ireland"], ["IT", "Italy"],
        ["LV", "Latvia"], ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MT", "Malta"],
        ["NL", "Netherlands"], ["PL", "Poland"], ["RO", "Romania"], ["SK", "Slovakia"],
        ["SI", "Slovenia"], ["ES", "Spain"], ["SE", "Sweden"]
    ];

    function countryName(code) {
        var c = COUNTRIES.filter(function (x) { return x[0] === code; })[0];
        return c ? c[1] : code || "";
    }

    function ptPostcode(pc) { return /^\d{4}-\d{3}$/.test(String(pc || "").trim()); }

    /* Which zone an address falls in, or "" while there isn't enough of it
       to say. A Portuguese postcode needs all seven digits: "1" alone could
       still become Lisbon or Porto. */
    function zoneOf(country, postcode) {
        country = country || "PT";
        if (country !== "PT") return String(postcode || "").trim() ? "eu" : "";
        if (!ptPostcode(postcode)) return "";
        var n = parseInt(postcode, 10);
        if (n >= 1000 && n <= 1999) return "lisbon";
        if (n >= 2600 && n <= 2899) return "greater";
        return "portugal";
    }

    /* { zone, fee, label, eta } for a bag's fulfilment, or null. */
    function quote(f) {
        if (!f || !f.method) return null;
        var z = f.method === "pickup" ? "pickup" : zoneOf(f.country, f.postcode);
        if (!z) return null;
        return { zone: z, fee: FEES[z], label: ZONES[z].label, eta: ZONES[z].eta };
    }

    window.lxShip = {
        FEES: FEES, ZONES: ZONES, COUNTRIES: COUNTRIES,
        countryName: countryName, zoneOf: zoneOf, quote: quote, ptPostcode: ptPostcode
    };
})();
