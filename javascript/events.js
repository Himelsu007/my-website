const events = [  
                                {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date:  "August 29th",
        time: "8:15PM-10PM",
        location: "Pavilhão Islâmico de Lisboa",
        map: "https://maps.apple/p/qd6tPoDv6xcQE8",
        spotsTaken: 0,
        spotsTotal: 20,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist:false
    },               
    {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date:  "August 26th",
        time: "8:15PM-10PM",
        location: "Pavilhão Islâmico de Lisboa",
        map: "https://maps.apple/p/qd6tPoDv6xcQE8",
        spotsTaken: 24,
        spotsTotal: 24,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist:false
    }, 
    {
        type: "PICKUP GAME",
        title: "FULL COURT 5V5",
        date:  "August 15th",
        time: "8:00PM-9:45PM",
        location: "Técnico Lisboa",
        map: "https://maps.apple/p/LB2DKKvAarAnMM",
        spotsTaken: 24,
        spotsTotal: 24,
        price: "€5",
        priceLabel: "Entry Fee",
        waitlist:false
    },

    //     {
    //     type: "PICKUP GAME",
    //     title: "FULL COURT 5V5",
    //     date: "May 23rd",
    //     time: "7:15PM - 9:00PM",
    //     location: "Manuel CastelBranco",
    //     map: "https://maps.apple/p/4s78.LUWnt8Ggq",
    //     spotsTaken: 20,
    //     spotsTotal: 20,
    //     price: "€5",
    //     priceLabel: "Entry Fee",
    //     waitlist: false
    // }
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

/* When does this run actually finish?
   Dates here carry no year, so assume the current one and roll forward if
   that would put the run far in the past (handles the Dec -> Jan rollover).
   The end of the time range is what counts: "8:15PM-10PM" finishes at 22:00. */
function runEndsAt(event) {
    const s = ((event && event.date) || "").trim().toLowerCase();
    const m = s.match(/([a-z]+)\s*\.?\s*(\d{1,2})/);
    if (!m) return null;
    const monIdx = MONTHS.indexOf(m[1].slice(0, 3));
    const day = parseInt(m[2], 10);
    if (monIdx < 0 || !day) return null;

    let h = 23, min = 59;
    const t = ((event && event.time) || "").toLowerCase().replace(/\s+/g, "");
    const end = t.split(/[-\u2013\u2014]/)[1] || "";
    const tm = end.match(/(\d{1,2})(?::(\d{2}))?(am|pm)?/);
    if (tm) {
        h = parseInt(tm[1], 10);
        min = tm[2] ? parseInt(tm[2], 10) : 0;
        // "8:15PM-10PM" leaves the second half without a suffix - reuse the last one
        const ap = tm[3] || (t.match(/(am|pm)/g) || []).pop();
        if (ap === "pm" && h < 12) h += 12;
        if (ap === "am" && h === 12) h = 0;
    }

    const now = new Date();
    let dt = new Date(now.getFullYear(), monIdx, day, h, min, 0, 0);
    if (dt.getTime() - now.getTime() < -180 * 864e5) {
        dt = new Date(now.getFullYear() + 1, monIdx, day, h, min, 0, 0);
    }
    return dt;
}

/** A run is history once its end time has gone by. */
function isPastRun(event) {
    const end = runEndsAt(event);
    return !!end && Date.now() > end.getTime();
}

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

function renderEvents(tally, pending) {
    container.innerHTML = "";

    // Forget locally-stored sign-ups for runs that no longer exist
    if (typeof pruneLocalSignups === "function") pruneLocalSignups(events);

    events.forEach((event, i) => {
        const total = event.spotsTotal || 0;
        const past  = isPastRun(event);
        // A finished run is history - it reads its final number straight from
        // this file and ignores the Sheet, so old rows can be deleted freely.
        const shared = (!past && tally && typeof runKey === "function")
            ? (Number(tally[runKey(event)]) || 0) : 0;
        const taken = Math.min(total, (event.spotsTaken || 0) + shared);
        const registered = (typeof hasRegistered === "function") && hasRegistered(event);
        const spotsLeft = total - taken;
        const fillPercent = total > 0 ? Math.min(100, Math.round((taken / total) * 100)) : 0;
        const img = event.image || venueImage(event.location);

        // ---- State ----
        let status = "open";          // open | filling | full | soon
        let statusLabel = "Open";
        let scarcity = "Spots available";
        let ctaLabel = "Join Now";

        if (past) {
            status = "done";
            statusLabel = "Completed";
            scarcity = "Game done";
        } else if (pending) {
            // The Sheet hasn't answered yet - show the card without committing
            // to a number, rather than flashing the events.js baseline.
            status = "pending";
            statusLabel = "Checking";
            scarcity = "Checking availability\u2026";
        } else if (total <= 0) {
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

        const tick = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

        let ctaHTML;
        if (past) {
            ctaHTML = `<button class="bk-cta bk-cta--done" type="button" disabled>Played</button>`;
        } else if (pending) {
            ctaHTML = `<button class="bk-cta bk-cta--pending" type="button" disabled>Checking\u2026</button>`;
        } else if (registered && status !== "full") {
            // This device already sent a registration for this run
            const href = `private_run_sign_up.html?run=${i}&event=${encodeURIComponent(event.title)}`;
            ctaHTML = `<a class="bk-cta bk-cta--registered" href="${href}">${tick} You\u2019re Registered</a>`;
        } else if (status === "full") {
            if (waitlistOn) {
                const href = `private_run_sign_up.html?run=${i}&event=${encodeURIComponent(event.title)}&status=waitlist`;
                ctaHTML = `<a class="bk-cta bk-cta--waitlist" href="${href}">Join Waitlist</a>`;
            } else {
                ctaHTML = `<button class="bk-cta bk-cta--soldout" type="button" disabled>Sold Out</button>`;
            }
        } else {
            const href = `private_run_sign_up.html?run=${i}&event=${encodeURIComponent(event.title)}`;
            ctaHTML = `<a class="bk-cta" href="${href}">${ctaLabel} ${arrowSvg}</a>`;
        }

        const card = `
        <article class="bk-card" data-status="${status}"${registered ? ' data-registered="1"' : ''}>
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
                        <span class="bk-spots"><strong>${pending ? "\u2013" : taken}</strong>/${total} spots</span>
                        <span class="bk-scarcity s-${status}">${scarcity}</span>
                    </div>
                    <div class="bk-bar"><span class="bk-fill f-${status}" style="--pct:${pending ? 0 : fillPercent}%"></span></div>
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
    revealCards();
}

function revealCards() {
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

if (container) {
    const seed = (typeof cachedSignupTally === "function") ? cachedSignupTally() : null;

    if (typeof fetchSignupTally !== "function") {
        renderEvents({});                       // no Sheet configured - events.js only
    } else {
        // Seed from the last known Sheet count so the card opens on the right
        // number. With nothing remembered yet, paint the card but leave the
        // count blank until the Sheet answers (it takes a couple of seconds)
        // so the first number a visitor reads is never the wrong one.
        renderEvents(seed || {}, !seed);
        fetchSignupTally().then(tally => renderEvents(tally || {}));
    }
}
