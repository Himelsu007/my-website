// ========================================
// LEADERBOARD — renders podium + top 10 table
// Data comes from javascript/leaderboard-data.js
// Ranking is driven by each player's assigned `pct`.
// ========================================
(function () {
    const podium = document.getElementById("lb_podium");
    const rowsEl = document.getElementById("lb_rows");
    if (!podium || !rowsEl || typeof leaderboardPlayers === "undefined") return;

    const MAX   = (typeof LEADERBOARD_MAX_ROWS  !== "undefined") ? LEADERBOARD_MAX_ROWS  : 10;
    const LABEL = (typeof LEADERBOARD_STAT_LABEL !== "undefined") ? LEADERBOARD_STAT_LABEL : "Win Rate";

    // The percentage you assign. Clamped to 0–100 so a typo can't break the bars.
    const pct  = p => Math.max(0, Math.min(100, Number(p.pct) || 0));
    const show = v => v.toFixed(1).replace(/\.0$/, "");
    const initials = n => (n || "")
        .trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
    const esc = s => String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const hasRecord = p => Number.isFinite(Number(p.w)) && Number.isFinite(Number(p.l));

    // Photo (if set) layered over the initials — if the file is missing or
    // fails to load it removes itself and the initials show through.
    const avatar = p => p.photo
        ? `<img class="lb-photo" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.remove()">`
        : "";

    const ranked = [...leaderboardPlayers]
        .sort((a, b) => pct(b) - pct(a))
        .slice(0, MAX);

    if (!ranked.length) return;

    // ---- Season label ----
    const seasonEl = document.getElementById("lb_season");
    if (seasonEl && typeof LEADERBOARD_SEASON !== "undefined") {
        seasonEl.textContent = LEADERBOARD_SEASON;
    }

    // ---- Row count chip ----
    // The markup hardcoded "Top 10"; derive it so it cannot drift out of step
    // with LEADERBOARD_MAX_ROWS or the number of players actually listed.
    const countEl = document.querySelector("#lb_table .lb-c");
    if (countEl) countEl.textContent = `Top ${ranked.length}`;

    // ---- Footnote ----
    const footEl = document.getElementById("lb_foot");
    if (footEl && typeof LEADERBOARD_FOOTNOTE !== "undefined") {
        if (LEADERBOARD_FOOTNOTE) footEl.textContent = LEADERBOARD_FOOTNOTE;
        else footEl.remove();
    }

    // ---- Podium: 2nd · 1st · 3rd ----
    [
        { p: ranked[1], cls: "lb-second", label: "2nd" },
        { p: ranked[0], cls: "lb-first",  label: "1st" },
        { p: ranked[2], cls: "lb-third",  label: "3rd" }
    ].forEach(({ p, cls, label }) => {
        if (!p) return;
        const el = document.createElement("div");
        el.className = `lb-pod ${cls}`;
        el.innerHTML = `
            <div class="lb-pod-av">${esc(initials(p.name))}${avatar(p)}<span class="lb-pod-rank">${label}</span></div>
            <div class="lb-pod-name">${esc(p.name)}</div>
            ${p.alias ? `<div class="lb-pod-alias">"${esc(p.alias)}"</div>` : ""}
            <div class="lb-pod-block">
                <div class="lb-pod-pct">${show(pct(p))}<span class="lb-u">%</span></div>
                <div class="lb-pod-pct-label">${esc(LABEL)}</div>
                ${hasRecord(p) ? `<div class="lb-pod-wl">
                    <span class="lb-w">${p.w}W</span><span class="lb-sep">/</span><span class="lb-l">${p.l}L</span>
                </div>` : ""}
            </div>`;
        el._player = p;                 // used by the count-up on reveal
        podium.appendChild(el);
    });

    // ---- Full rankings ----
    ranked.forEach((p, i) => {
        const v = pct(p);
        const row = document.createElement("div");
        row.className = `lb-row${i < 3 ? " lb-top" + (i + 1) : ""}`;
        row.innerHTML = `
            <div class="lb-r-pos">${i + 1}</div>
            <div class="lb-r-av">${esc(initials(p.name))}${avatar(p)}</div>
            <div class="lb-r-id">
                <div class="lb-r-name">${esc(p.name)}${p.alias ? `<span class="lb-alias">"${esc(p.alias)}"</span>` : ""}</div>
                ${p.pos ? `<div class="lb-r-postag">${esc(p.pos)}</div>` : ""}
            </div>
            <div class="lb-r-wl">
                ${hasRecord(p) ? `<div class="lb-v"><span class="lb-w">${p.w}</span>-<span class="lb-l">${p.l}</span></div>
                <div class="lb-k">W-L</div>` : ""}
            </div>
            <div class="lb-r-bar">
                <div class="lb-r-bar-track"><span class="lb-r-bar-fill" style="--lb-pct:${v}%"></span></div>
                <span class="lb-r-bar-k">${esc(LABEL)}</span>
            </div>
            <div class="lb-r-pct">${show(v)}<span class="lb-u">%</span></div>`;
        rowsEl.appendChild(row);
    });

    // ---- Count-up: numbers tick from 0 up to their value ----
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function countUp(el, target, duration, delay) {
        if (!el) return;
        if (reduced) return;                       // leave the final value in place

        // Rebuild as [number text node][% unit] so each frame is a cheap
        // nodeValue write instead of re-parsing HTML.
        const unit = el.querySelector(".lb-u");
        const num = document.createTextNode(show(target));   // starts at the REAL value
        el.textContent = "";
        el.appendChild(num);
        if (unit) el.appendChild(unit);

        let done = false;
        const finish = () => { if (!done) { done = true; num.nodeValue = show(target); } };

        setTimeout(() => {
            // Only blank to 0 once rAF has proven it's actually running — otherwise
            // a throttled tab would leave the number stuck at 0 forever.
            requestAnimationFrame(t0 => {
                if (done) return;          // safety net already settled it — don't re-blank
                num.nodeValue = "0";
                (function step(now) {
                    if (done) return;
                    const t = Math.min((now - t0) / duration, 1);
                    num.nodeValue = show(target * (1 - Math.pow(1 - t, 3)));  // ease-out cubic
                    if (t < 1) requestAnimationFrame(step); else finish();
                })(t0);
            });
            // Safety net: guarantee the true value even if frames never come.
            setTimeout(finish, duration + 500);
        }, delay);
    }

    // ---- Reveal on scroll ----
    const table = document.getElementById("lb_table");
    const targets = [...podium.querySelectorAll(".lb-pod")];
    if (table) targets.push(table);

    function activate(el) {
        el.classList.add("in");
        if (el === table) {
            el.querySelectorAll(".lb-r-pct").forEach((n, i) => {
                countUp(n, pct(ranked[i]), 900, 100 + i * 80);   // matches the bar cascade
            });
        } else if (el._player) {
            countUp(el.querySelector(".lb-pod-pct"), pct(el._player), 1100, 150);
        }
    }

    if (!("IntersectionObserver" in window)) {
        targets.forEach(activate);
        return;
    }
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); }
        });
    }, { threshold: 0.2 });
    targets.forEach(t => io.observe(t));
})();
