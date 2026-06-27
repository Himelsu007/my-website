const events = [
                {
        type: "PICK UP GAME",
        title: "HALF COURT 4V4",
        date: "june 28th",
        time: "10AM - 11:45AM",
        location: "Técnico",
        map: "https://maps.app.goo.gl/s8LQtmuZsGKivsxo6",
        spotsTaken: 10,
        spotsTotal: 16,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist: false
    },
        {
        type: "PICKUP GAME",
        title: "Full COURT 5V5",
        date:  "June 27th",
        time: "8:15PM-10PM",
        location: "Pavilhão Islâmico de Lisboa",
        map: "https://maps.apple/p/qd6tPoDv6xcQE8",
        spotsTaken: 20,
        spotsTotal: 20,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist: false
    },

        {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date: "May 23rd",
        time: "7:15PM - 9:00PM",
        location: "Manuel CastelBranco",
        map: "https://maps.apple/p/4s78.LUWnt8Ggq",
        spotsTaken: 20,
        spotsTotal: 20,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist: false
    }
];



const SHOW_WAITLIST = true;


const DEFAULT_EVENT_IMAGE = "assets/images/IMG_0916.avif";

// Map a venue name → its photo (falls back to the default image)

function venueImage(loc) {
    const l = (loc || "").toLowerCase();
    if (l.includes("técnico") || l.includes("tecnico")) return "assets/images/tecnico.avif";
    if (l.includes("castel")) return "assets/images/castelbranco.avif";
    if (l.includes("islaámico") || l.includes("islamico") || l.includes("islâmico")) return "assets/images/IMG_0487.avif";
    return DEFAULT_EVENT_IMAGE;
}

// ---- Date parsing → calendar chip ----
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTH_LABEL = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function parseEventDate(str) {
    const s = (str || "").trim().toLowerCase();
    const m = s.match(/([a-z]+)\s*\.?\s*(\d{1,2})/);
    if (!m) return null;
    const monIdx = MONTHS.indexOf(m[1].slice(0, 3));
    const day = parseInt(m[2], 10);
    if (monIdx < 0 || !day) return null;
    let wk = "";
    try {
        const d = new Date(new Date().getFullYear(), monIdx, day);
        wk = WEEKDAYS[d.getDay()];
    } catch (e) {}
    return { wk, day, mon: MONTH_LABEL[monIdx] };
}

const container = document.getElementById("events_container");

if (container) {
    container.innerHTML = "";

    events.forEach(event => {
        const total = event.spotsTotal || 0;
        const taken = event.spotsTaken || 0;
        const spotsLeft = total - taken;
        const fillPercent = total > 0 ? Math.min(100, Math.round((taken / total) * 100)) : 0;
        const img = event.image || venueImage(event.location);

        // ---- State ----
        let status = "open";          // open | filling | full | soon
        let statusLabel = "Open";
        let scarcity = "Spots available";
        let ctaLabel = "Join Now";

        if (total <= 0) {
            status = "soon";
            statusLabel = "Coming Soon";
            scarcity = "Date to be announced";
            ctaLabel = "Notify Me";
        } else if (spotsLeft <= 0) {
            status = "full";
            statusLabel = "Sold Out";
            scarcity = "Game full";
        } else if (spotsLeft <= 5) {
            status = "filling";
            statusLabel = "Almost Full";
            scarcity = `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`;
            ctaLabel = "Grab a Spot";
        }

        // ---- Date chip ----
        const d = parseEventDate(event.date);
        const dateChip = d
            ? `<span class="bk-weekday">${d.wk || "&nbsp;"}</span>
                <span class="bk-day">${d.day}</span>
                <span class="bk-month">${d.mon}</span>`
            : `<span class="bk-weekday">&nbsp;</span>
                <span class="bk-day">•</span>
                <span class="bk-month">SOON</span>`;

        const arrowSvg = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

        // Per-event override falls back to the global SHOW_WAITLIST toggle
        const waitlistOn = (typeof event.waitlist === "boolean") ? event.waitlist : SHOW_WAITLIST;

        let ctaHTML;
        if (status === "full") {
            if (waitlistOn) {
                const href = `private_run_sign_up.html?event=${encodeURIComponent(event.title)}&status=waitlist`;
                ctaHTML = `<a class="bk-cta bk-cta--waitlist" href="${href}">Join Waitlist</a>`;
            } else {
                ctaHTML = `<button class="bk-cta bk-cta--soldout" type="button" disabled>Sold Out</button>`;
            }
        } else {
            const href = `private_run_sign_up.html?event=${encodeURIComponent(event.title)}`;
            ctaHTML = `<a class="bk-cta" href="${href}">${ctaLabel} ${arrowSvg}</a>`;
        }

        const card = `
        <article class="bk-card" data-status="${status}">
            <span class="bk-beam" aria-hidden="true"></span>
            <div class="bk-body">
                <div class="bk-top">
                    <div class="bk-date">${dateChip}</div>
                    <div class="bk-headline">
                        <span class="bk-format">${event.type}</span>
                        <h3 class="bk-title">${event.title}</h3>
                        <div class="bk-time">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                            ${event.time}
                        </div>
                    </div>
                </div>

                <a class="bk-location" href="${event.map}" target="_blank" rel="noopener" aria-label="View ${event.location.trim()} on the map">
                    <span class="bk-map">
                        <img src="${img}" alt="${event.location.trim()}" loading="lazy" decoding="async">
                        <span class="bk-pin"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg></span>
                    </span>
                    <span class="bk-loc-text">
                        <span class="bk-loc-name">${event.location.trim()}</span>
                        <span class="bk-loc-sub">Lisboa · View location ›</span>
                    </span>
                </a>

                <div class="bk-progress">
                    <div class="bk-progress-head">
                        <span class="bk-spots"><strong>${taken}</strong>/${total} spots</span>
                        <span class="bk-scarcity s-${status}">${scarcity}</span>
                    </div>
                    <div class="bk-bar"><span class="bk-fill f-${status}" style="--pct:${fillPercent}%"></span></div>
                </div>

                <div class="bk-footer">
                    <div class="bk-price">
                        <span class="bk-amount">${event.price}</span>
                        <span class="bk-price-label">${event.priceLabel}</span>
                    </div>
                    ${ctaHTML}
                </div>
            </div>
        </article>`;

        container.insertAdjacentHTML("beforeend", card);
    });

    // ---- Scroll-reveal entrance ----
    const cards = container.querySelectorAll(".bk-card");
    if (!("IntersectionObserver" in window)) {
        cards.forEach(c => c.classList.add("in"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        cards.forEach(c => io.observe(c));
    }
}
