// ========================================
// LEADERBOARD — renders podium + top 10 table
// Data comes from javascript/leaderboard-data.js
// ========================================
(function () {
    const podium = document.getElementById("lb_podium");
    const rowsEl = document.getElementById("lb_rows");
    if (!podium || !rowsEl || typeof leaderboardPlayers === "undefined") return;

    const MIN = (typeof LEADERBOARD_MIN_GAMES !== "undefined") ? LEADERBOARD_MIN_GAMES : 0;
    const MAX = (typeof LEADERBOARD_MAX_ROWS !== "undefined") ? LEADERBOARD_MAX_ROWS : 10;

    const games = p => (p.w || 0) + (p.l || 0);
    const pct   = p => games(p) ? ((p.w || 0) / games(p)) * 100 : 0;
    const show  = v => v.toFixed(1).replace(/\.0$/, "");
    const initials = n => (n || "")
        .trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
    const esc = s => String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const ranked = leaderboardPlayers
        .filter(p => games(p) >= MIN)
        .sort((a, b) => pct(b) - pct(a) || (b.w || 0) - (a.w || 0))
        .slice(0, MAX);

    if (!ranked.length) return;

    // ---- Season label ----
    const seasonEl = document.getElementById("lb_season");
    if (seasonEl && typeof LEADERBOARD_SEASON !== "undefined") {
        seasonEl.textContent = LEADERBOARD_SEASON;
    }

    // ---- Podium: 2nd · 1st · 3rd ----
    const order = [
        { p: ranked[1], cls: "lb-second", label: "2nd" },
        { p: ranked[0], cls: "lb-first",  label: "1st" },
        { p: ranked[2], cls: "lb-third",  label: "3rd" }
    ];

    order.forEach(({ p, cls, label }) => {
        if (!p) return;
        const el = document.createElement("div");
        el.className = `lb-pod ${cls}`;
        el.innerHTML = `
            <div class="lb-pod-av">${esc(initials(p.name))}<span class="lb-pod-rank">${label}</span></div>
            <div class="lb-pod-name">${esc(p.name)}</div>
            ${p.alias ? `<div class="lb-pod-alias">"${esc(p.alias)}"</div>` : ""}
            <div class="lb-pod-block">
                <div class="lb-pod-pct">${show(pct(p))}<span class="lb-u">%</span></div>
                <div class="lb-pod-pct-label">Win Rate</div>
                <div class="lb-pod-wl">
                    <span class="lb-w">${p.w}W</span><span class="lb-sep">/</span><span class="lb-l">${p.l}L</span>
                </div>
            </div>`;
        podium.appendChild(el);
    });

    // ---- Full rankings ----
    ranked.forEach((p, i) => {
        const v = pct(p);
        const row = document.createElement("div");
        row.className = `lb-row${i < 3 ? " lb-top" + (i + 1) : ""}`;
        row.innerHTML = `
            <div class="lb-r-pos">${i + 1}</div>
            <div class="lb-r-av">${esc(initials(p.name))}</div>
            <div class="lb-r-id">
                <div class="lb-r-name">${esc(p.name)}${p.alias ? `<span class="lb-alias">"${esc(p.alias)}"</span>` : ""}</div>
                <div class="lb-r-postag">${esc(p.pos || "")}</div>
            </div>
            <div class="lb-r-wl">
                <div class="lb-v"><span class="lb-w">${p.w}</span>-<span class="lb-l">${p.l}</span></div>
                <div class="lb-k">W-L</div>
            </div>
            <div class="lb-r-bar">
                <div class="lb-r-bar-track"><span class="lb-r-bar-fill" style="--lb-pct:${v}%"></span></div>
                <span class="lb-r-bar-k">Win Rate</span>
            </div>
            <div class="lb-r-pct">${show(v)}<span class="lb-u">%</span></div>`;
        rowsEl.appendChild(row);
    });

    // ---- Reveal on scroll ----
    const table = document.getElementById("lb_table");
    const targets = [...podium.querySelectorAll(".lb-pod")];
    if (table) targets.push(table);

    if (!("IntersectionObserver" in window)) {
        targets.forEach(t => t.classList.add("in"));
        return;
    }
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
    }, { threshold: 0.2 });
    targets.forEach(t => io.observe(t));
})();
