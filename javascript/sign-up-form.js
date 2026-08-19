document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       1. AUTO-FILL EVENT NAME
    ========================================= */
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get("event") || "Private Run";
    const isWaitlist = urlParams.get("status") === "waitlist";
    const eventInput = document.getElementById("event-name");

    if(eventInput) eventInput.value = isWaitlist ? `${eventName} (Waitlist)` : eventName;

    /* =========================================
       1b. RUN SUMMARY CARD
       Looks the run up in the shared `events` array (events.js) so the
       date / time / venue / price never drift from the booking cards.
    ========================================= */
    let selectedRun = null;

    (function fillRunSummary(){
        if (typeof events === "undefined" || !document.getElementById("run-summary")) return;

        const idx = parseInt(urlParams.get("run"), 10);
        let run = Number.isInteger(idx) ? events[idx] : null;
        // Fall back to matching on title (e.g. an old link without ?run=)
        if (!run) run = events.find(e => e.title === eventName) || null;
        if (!run) return;                       // leave the neutral defaults in place
        selectedRun = run;

        const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

        set("rs-tag", run.type || "Pickup Game");
        set("rs-title", run.title);

        // Date chip — reuse the same parser the booking cards use
        const d = (typeof parseEventDate === "function") ? parseEventDate(run.date) : null;
        const dateEl = document.getElementById("rs-date");
        if (dateEl && d) {
            dateEl.querySelector(".rs-weekday").textContent = d.wk || "\u00A0";
            dateEl.querySelector(".rs-day").textContent = d.day;
            dateEl.querySelector(".rs-month").textContent = d.mon;
        }

        const timeEl = document.querySelector("#rs-time span");
        if (timeEl && run.time) timeEl.textContent = run.time;

        // Venue + map
        const loc = (run.location || "").trim();
        set("rs-loc-name", loc);
        const locLink = document.getElementById("rs-location");
        if (locLink) {
            if (run.map) locLink.href = run.map;
            else locLink.removeAttribute("target");
            locLink.setAttribute("aria-label", `View ${loc} on the map`);
        }
        const mapImg = document.getElementById("rs-map-img");
        if (mapImg) {
            mapImg.src = run.image || (typeof venueImage === "function" ? venueImage(loc) : mapImg.src);
            mapImg.alt = loc;
        }

        // Price + spots left
        set("rs-price", run.price || "\u2014");
        const total = run.spotsTotal || 0;
        const localTaken = (typeof localSignupsFor === "function") ? localSignupsFor(run) : 0;
        const left  = Math.max(0, total - ((run.spotsTaken || 0) + localTaken));
        const spotsEl = document.getElementById("rs-spots");
        if (spotsEl) {
            spotsEl.textContent = total ? left : "\u2014";
            spotsEl.classList.toggle("is-full", total > 0 && left === 0);
            spotsEl.classList.toggle("is-low",  left > 0 && left <= 5);
        }

        // Waitlist runs get a different step 2/3 wording
        if (isWaitlist) {
            const steps = document.querySelectorAll(".rs-step");
            if (steps[1]) steps[1].innerHTML = '<span class="rs-step-n">2</span> We add you to the waitlist';
            if (steps[2]) steps[2].innerHTML = '<span class="rs-step-n">3</span> Pay only if a spot opens';
        }
    })();

    /* =========================================
       2. GUEST COUNTER
    ========================================= */
    // Guests are split by what they're there for: only players take up a spot.
    const guests = { play: 0, watch: 0 };
    const totalEl = document.getElementById("guest-total");

    function refreshGuests() {
        const play = document.getElementById("guest-play-count");
        const watch = document.getElementById("guest-watch-count");
        if (play)  play.textContent  = guests.play;
        if (watch) watch.textContent = guests.watch;
        const spots = 1 + guests.play;                 // the player themselves + playing guests
        if (totalEl) totalEl.innerHTML = `Spots needed: <strong>${spots}</strong>`;

        // Keep the amount due in step with the number of playing spots
        const amountEl = document.getElementById("pay-amount");
        if (amountEl && selectedRun) {
            const unit = parseFloat(String(selectedRun.price || "").replace(/[^\d.]/g, ""));
            if (Number.isFinite(unit)) {
                const total = unit * spots;
                amountEl.textContent = "\u20AC" + (Number.isInteger(total) ? total : total.toFixed(2));
            }
        }
    }

    function wireCounter(kind, plusId, minusId) {
        const plus = document.getElementById(plusId);
        const minus = document.getElementById(minusId);
        if (!plus || !minus) return;
        plus.addEventListener("click", () => {
            if (guests[kind] < 20) { guests[kind]++; refreshGuests(); }
        });
        minus.addEventListener("click", () => {
            if (guests[kind] > 0) { guests[kind]--; refreshGuests(); }
        });
    }

    wireCounter("play",  "guest-play-plus",  "guest-play-minus");
    wireCounter("watch", "guest-watch-plus", "guest-watch-minus");
    refreshGuests();

    /* ===== Copy the MB WAY number ===== */
    (function wireCopy(){
        const btn = document.getElementById("copy-mbway");
        if (!btn) return;
        btn.addEventListener("click", async () => {
            const value = btn.dataset.copy || "";
            const label = btn.querySelector("span");
            try {
                await navigator.clipboard.writeText(value);
            } catch (e) {
                // Older browsers / insecure origins
                const tmp = document.createElement("textarea");
                tmp.value = value; document.body.appendChild(tmp); tmp.select();
                try { document.execCommand("copy"); } catch (e2) {}
                tmp.remove();
            }
            btn.classList.add("copied");
            if (label) label.textContent = "Copied";
            setTimeout(() => {
                btn.classList.remove("copied");
                if (label) label.textContent = "Copy";
            }, 1800);
        });
    })();

    function getSelectedAgeGroup() {
        const selected = document.querySelector('input[name="age_group"]:checked');
        return selected ? selected.value : null;
    }

    /* =========================================
       3. SEND REGISTRATION VIA WHATSAPP
    ========================================= */
    const generateBtn = document.getElementById("generate-pdf");

    // Waitlist users get a different button label up front
    if (isWaitlist && generateBtn) {
        generateBtn.innerText = "REQUEST WAITLIST SPOT";
    }

    if(generateBtn) {
        generateBtn.addEventListener("click", function() {

            const playerName = document.getElementById("player-name").value.trim();
            const ageGroup = getSelectedAgeGroup();

            /* ===== VALIDATION ===== */
            if (!playerName) return alert("Please enter your name.");
            if (!ageGroup) return alert("Please select your age group.");

            /* ===== PREPARE MESSAGE ===== */
            const spotsNeeded = 1 + guests.play;

            // Quote the run details straight from the shared events data
            let runLines = `*Run:* ${eventName}\n`;
            if (selectedRun) {
                runLines  = `*Run:* ${selectedRun.title}\n`;
                if (selectedRun.date || selectedRun.time) {
                    runLines += `*When:* ${[selectedRun.date, selectedRun.time].filter(Boolean).join(" \u00B7 ")}\n`;
                }
                if (selectedRun.location) runLines += `*Where:* ${selectedRun.location.trim()}\n`;
            }

            let guestLines = "";
            if (guests.play)  guestLines += `*Guests playing:* ${guests.play}\n`;
            if (guests.watch) guestLines += `*Guests watching:* ${guests.watch}\n`;
            if (!guests.play && !guests.watch) guestLines = `*Guests:* none\n`;

            const message = isWaitlist
                ? `\u{1F3C0} *LOCKED IN \u2014 WAITLIST REQUEST*\n\n` +
                runLines +
                `\n*Player:* ${playerName}\n` +
                `*Age Group:* ${ageGroup}\n` +
                guestLines +
                `*Spots needed:* ${spotsNeeded}\n\n` +
                `This run is sold out \u2014 please add me to the waitlist. I'll confirm and send payment the moment a spot opens up.`
                : `\u{1F3C0} *LOCKED IN RUN REGISTRATION*\n\n` +
                runLines +
                `\n*Player:* ${playerName}\n` +
                `*Age Group:* ${ageGroup}\n` +
                guestLines +
                `*Spots needed:* ${spotsNeeded}\n\n` +
                `I've completed my registration. Let me know where to send the payment receipt!`;

            const waUrl = `https://wa.me/351911861637?text=${encodeURIComponent(message)}`;

            /* ===== REDIRECT TO WHATSAPP ===== */
            // This works smoothly on both mobile and desktop
            window.open(waUrl, "_blank", "noopener,noreferrer");

            /* ===== COUNT THE SIGN-UP (this device only) =====
               Waitlist requests don't take a spot, so they aren't counted. */
            if (!isWaitlist && selectedRun && typeof addLocalSignup === "function") {
                addLocalSignup(selectedRun, spotsNeeded);

                // Reflect it straight away in the summary card
                const total = selectedRun.spotsTotal || 0;
                const taken = (selectedRun.spotsTaken || 0) + localSignupsFor(selectedRun);
                const left = Math.max(0, total - taken);
                const spotsEl = document.getElementById("rs-spots");
                if (spotsEl) {
                    spotsEl.textContent = total ? left : "\u2014";
                    spotsEl.classList.toggle("is-full", total > 0 && left === 0);
                    spotsEl.classList.toggle("is-low",  left > 0 && left <= 5);
                }
            }

            // Subtle UI feedback letting the user know the action completed
            generateBtn.innerText = "OPENED IN WHATSAPP";
            generateBtn.style.opacity = "0.7";
        });
    }
});