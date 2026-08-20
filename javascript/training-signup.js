/* =====================================================
   TRAINING BOOKING — fills the pack summary, validates
   the form, sends the WhatsApp message and logs the
   booking to the shared Google Sheet.
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    if (typeof trainingPacks === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("pack");
    const pack = trainingPacks.find(p => p.id === wanted)
              || trainingPacks[parseInt(wanted, 10)]
              || trainingPacks[0];

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    /* ---------- Summary card ---------- */
    set("tp-badge", pack.badge || "Training");
    set("tp-name", pack.name);
    set("tp-price", pack.price);
    set("tp-duration", pack.duration);
    set("tp-note", pack.note);
    set("tp-tagline", pack.tagline);
    set("pay-amount", pack.price);

    const list = document.getElementById("tp-features");
    if (list) {
        list.innerHTML = pack.features.map(f =>
            `<li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>${f}</span></li>`
        ).join("");
    }

    /* ---------- Copy the MB WAY number ---------- */
    (function wireCopy(){
        const btn = document.getElementById("copy-mbway");
        if (!btn) return;
        btn.addEventListener("click", async () => {
            const label = btn.querySelector("span");
            try { await navigator.clipboard.writeText(btn.dataset.copy || ""); }
            catch (e) {
                const t = document.createElement("textarea");
                t.value = btn.dataset.copy || ""; document.body.appendChild(t); t.select();
                try { document.execCommand("copy"); } catch (e2) {}
                t.remove();
            }
            btn.classList.add("copied");
            if (label) label.textContent = "Copied";
            setTimeout(() => { btn.classList.remove("copied"); if (label) label.textContent = "Copy"; }, 1800);
        });
    })();

    const pick = name => {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : null;
    };

    /* ---------- Send ---------- */
    const btn = document.getElementById("send-booking");
    if (!btn) return;

    btn.addEventListener("click", function () {
        const name = document.getElementById("player-name").value.trim();
        const age  = pick("age_group");
        const days = pick("pref_days");
        const time = pick("pref_time");

        if (!name) return alert("Please enter your name.");
        if (!age)  return alert("Please select your age group.");
        if (!days) return alert("Please choose which days suit you.");
        if (!time) return alert("Please choose a preferred time.");

        const message =
            `\u{1F3C0} *LOCKED IN — TRAINING BOOKING*\n\n` +
            `*Pack:* ${pack.name}\n` +
            `*Price:* ${pack.price} · ${pack.duration}\n\n` +
            `*Player:* ${name}\n` +
            `*Age Group:* ${age}\n` +
            `*Preferred days:* ${days}\n` +
            `*Preferred time:* ${time}\n\n` +
            `I'd like to book this session. Let me know the next available slot!`;

        window.open(`https://wa.me/351911861637?text=${encodeURIComponent(message)}`,
                    "_blank", "noopener,noreferrer");

        // Log it to the same Google Sheet as the run signups
        if (typeof postSignup === "function") {
            postSignup({
                runKey: `training|${pack.id}`,
                run:    `TRAINING — ${pack.name}`,
                when:   `${days} · ${time}`,
                where:  pack.price,
                player: name,
                age:    age,
                guestsPlaying: 0,
                guestsWatching: 0,
                spots: 0                 // training doesn't consume run spots
            });
        }

        showBooked();
        btn.innerText = "SENT — CHECK WHATSAPP";
    });

    function showBooked() {
        const card = document.querySelector(".rs-inner");
        if (!card || card.querySelector(".rs-registered")) return;
        const el = document.createElement("div");
        el.className = "rs-registered";
        el.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                       "<span>Booking sent — confirm on WhatsApp</span>";
        card.insertBefore(el, card.firstChild);
    }
});
