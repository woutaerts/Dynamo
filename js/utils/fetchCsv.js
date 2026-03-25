/**
 * utils/fetchCsv.js
 * Cached CSV fetcher with race-condition prevention and TTL-based invalidation.
 * No renames required — API is clean and minimal.
 */

/** In-progress requests keyed by URL, prevents duplicate concurrent fetches. */
const activeFetches = new Map();

/** Cache time-to-live: 5 minutes in milliseconds. */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Fetches a CSV from `url`, returning a cached copy if one exists and is fresh.
 * Multiple simultaneous callers for the same URL share a single in-flight request.
 *
 * @param {string} url
 * @returns {Promise<string>} Raw CSV text
 */
export async function fetchCsvCached(url) {
    // 1. Return from sessionStorage if the entry is still within TTL
    const cachedItem = sessionStorage.getItem(url);
    if (cachedItem) {
        try {
            const { timestamp, data } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < CACHE_TTL) return data;
        } catch (e) {
            console.warn('Cache parse failed, fetching fresh data.');
        }
    }

    // 2. Piggyback on an existing in-flight fetch for the same URL
    if (activeFetches.has(url)) return activeFetches.get(url);

    // 3. Start a new fetch and register it while it is in flight
    const fetchPromise = (async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();

        try {
            sessionStorage.setItem(url, JSON.stringify({ timestamp: Date.now(), data: text }));
        } catch (e) {
            console.warn('SessionStorage full or unavailable — cache skipped.');
        }

        return text;
    })();

    activeFetches.set(url, fetchPromise);

    try {
        return await fetchPromise;
    } finally {
        activeFetches.delete(url);
    }
}
