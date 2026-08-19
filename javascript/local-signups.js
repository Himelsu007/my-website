/* =====================================================
   LOCAL SIGN-UP COUNTER
   -----------------------------------------------------
   When someone completes the form and sends their
   WhatsApp registration, we remember it in this browser
   and add it on top of `spotsTaken` from events.js.

   IMPORTANT: this is per-device. It is NOT shared between
   visitors — each person only sees their own sign-ups
   counted. `events.js` stays the source of truth, so keep
   updating spotsTaken there as registrations are confirmed.
   ===================================================== */
(function (global) {
    const STORE = "lx_local_signups_v1";

    // Key on the run's identity rather than its position in the array, so
    // reordering or removing runs in events.js can't shift a count onto the
    // wrong game.
    function runKey(run) {
        if (!run) return "";
        return [run.title, run.date, run.time]
            .map(v => (v || "").toString().trim().toLowerCase())
            .join("|")
            .replace(/\s+/g, " ");
    }

    function readAll() {
        try {
            const raw = localStorage.getItem(STORE);
            const parsed = raw ? JSON.parse(raw) : {};
            return (parsed && typeof parsed === "object") ? parsed : {};
        } catch (e) {
            return {};                       // private mode / corrupted data
        }
    }

    function writeAll(data) {
        try { localStorage.setItem(STORE, JSON.stringify(data)); }
        catch (e) { /* storage full or blocked — counting just won't persist */ }
    }

    /** Spots this browser has already registered for the given run. */
    function localSignupsFor(run) {
        const key = runKey(run);
        if (!key) return 0;
        const n = Number(readAll()[key]);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    /** Record a completed registration. `spots` = the player + any playing guests. */
    function addLocalSignup(run, spots) {
        const key = runKey(run);
        if (!key) return 0;
        const n = Math.max(1, parseInt(spots, 10) || 1);
        const data = readAll();
        data[key] = (Number(data[key]) || 0) + n;
        writeAll(data);
        return data[key];
    }

    /** Drop stored counts for runs that no longer exist in events.js. */
    function pruneLocalSignups(runs) {
        if (!Array.isArray(runs)) return;
        const valid = new Set(runs.map(runKey));
        const data = readAll();
        let changed = false;
        Object.keys(data).forEach(k => {
            if (!valid.has(k)) { delete data[k]; changed = true; }
        });
        if (changed) writeAll(data);
    }

    global.runKey = runKey;
    global.localSignupsFor = localSignupsFor;
    global.addLocalSignup = addLocalSignup;
    global.pruneLocalSignups = pruneLocalSignups;
})(window);
