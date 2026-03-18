// A temporary memory bank to hold requests that are currently in progress
const activeFetches = new Map();

// Set how long the data should stay cached (e.g., 5 minutes in milliseconds)
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchCsvCached(url) {
    // 1. Check if it's already in sessionStorage AND hasn't expired yet
    const cachedItem = sessionStorage.getItem(url);
    if (cachedItem) {
        try {
            const { timestamp, data } = JSON.parse(cachedItem);
            const now = Date.now();

            // If the cache is younger than 5 minutes, return it immediately!
            if (now - timestamp < CACHE_TTL) {
                return data;
            }
        } catch (e) {
            // If JSON parsing fails, just ignore it and fetch fresh data
            console.warn('Cache parsing failed, fetching fresh data.');
        }
    }

    // 2. Prevent the "Race Condition"
    if (activeFetches.has(url)) {
        return activeFetches.get(url);
    }

    // 3. Start the actual download
    const fetchPromise = (async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();

        // 4. Safely save to storage (Prevents the "Quota Crash")
        try {
            const cacheData = JSON.stringify({ timestamp: Date.now(), data: text });
            sessionStorage.setItem(url, cacheData);
        } catch (e) {
            console.warn('SessionStorage is full or unavailable. Skipping cache.');
        }

        return text;
    })();

    // Store the active promise so other callers can piggyback on it
    activeFetches.set(url, fetchPromise);

    try {
        // Wait for the download to finish and return the text
        return await fetchPromise;
    } finally {
        // Clean up our tracker once the download is completely finished (or fails)
        activeFetches.delete(url);
    }
}