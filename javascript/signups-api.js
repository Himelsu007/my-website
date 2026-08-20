/* =====================================================
   SHARED SIGNUP COUNT  (Google Sheet + Apps Script)
   -----------------------------------------------------
   PASTE YOUR WEB APP URL BELOW. Until you do, the site
   simply uses the numbers in events.js — nothing breaks.

   Setup: docs/google-apps-script.gs
   ===================================================== */
const SIGNUPS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxpYeaAJK4zxhbOs5JyCvwcBsYqe7JzWKIw9iKuTxNScSTIKuoDUIhjY5SNV54ZsApa/exec"; 

(function (global) {
    const CACHE_KEY = "lx_signup_tally_cache_v1";
    const CACHE_MS  = 60 * 1000;          // re-check at most once a minute

    const isConfigured = () => typeof SIGNUPS_ENDPOINT === "string"
                             && /^https:\/\/script\.google\.com\//.test(SIGNUPS_ENDPOINT);

    /* Apps Script takes 2-3s to answer, so the last known tally lives in
       localStorage. It seeds the very first paint, which stops the card
       from showing the events.js baseline and then jumping. */
    function readStored() {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); }
        catch (e) { return null; }
    }

    function readCache() {
        const c = readStored();
        return (c && Date.now() - c.at < CACHE_MS) ? c.tally : null;
    }

    /** Last known tally at any age — good enough to paint with immediately. */
    function cachedTally() {
        const c = readStored();
        return (c && c.tally && Object.keys(c.tally).length) ? c.tally : null;
    }

    function writeCache(tally) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), tally })); }
        catch (e) {}
    }

    /** Fetch { runKey: spotsTaken } from the Sheet. Resolves to {} on any failure. */
    async function fetchTally() {
        if (!isConfigured()) return {};
        const cached = readCache();
        if (cached) return cached;
        try {
            const res = await fetch(SIGNUPS_ENDPOINT, { method: "GET", cache: "no-store" });
            const data = await res.json();
            const tally = (data && data.ok && data.tally) ? data.tally : {};
            writeCache(tally);
            return tally;
        } catch (e) {
            console.warn("Signup tally unavailable, using events.js numbers.", e);
            return {};
        }
    }

    /** Record a signup. Fire-and-forget; never blocks the WhatsApp hand-off. */
    function postSignup(payload) {
        if (!isConfigured()) return;
        try {
            // text/plain avoids a CORS preflight, which Apps Script can't answer
            fetch(SIGNUPS_ENDPOINT, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            }).catch(() => {});
            try { localStorage.removeItem(CACHE_KEY); } catch (e) {}     // force a refresh next load
        } catch (e) { /* never let logging break the flow */ }
    }

    global.signupsConfigured = isConfigured;
    global.fetchSignupTally  = fetchTally;
    global.cachedSignupTally = cachedTally;
    global.postSignup        = postSignup;
})(window);
