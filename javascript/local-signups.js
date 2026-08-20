/* =====================================================
   LOCAL SIGN-UP COUNTER
   -----------------------------------------------------
   Remembers, on THIS device only, which runs the visitor
   has registered for — used to show them a "You're
   registered" badge.

   It deliberately does NOT affect the spot count: the
   shared number comes from the Google Sheet (signups-api.js),
   falling back to events.js.
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

    /** Has this device already registered for the given run? */
    function hasRegistered(run) {
        const key = runKey(run);
        return !!(key && readAll()[key]);
    }

    /** Remember that this device registered for the run. */
    function markRegistered(run) {
        const key = runKey(run);
        if (!key) return;
        const data = readAll();
        data[key] = { at: Date.now() };
        writeAll(data);
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
    global.hasRegistered = hasRegistered;
    global.markRegistered = markRegistered;
    global.pruneLocalSignups = pruneLocalSignups;
})(window);
