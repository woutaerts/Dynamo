/**
 * general.js
 * Shared UI logic used by multiple pages.
 *
 * Changes:
 *   - `initializeCountdown` → `initCountdown`  (shorter, consistent init* pattern)
 *   - `updateCountdown`     → `setCountdownData` (describes the action precisely:
 *                              it stores data AND triggers a display update)
 *   - Inner `parseDateTime` → `parseMatchDateTime` (avoids confusion with
 *                              `parseDate` in helpers.js which has a different signature)
 *   - Inner `updateDisplay` → `tickCountdown` (clearer intent: one tick of the timer)
 *
 * New export:
 *   - `renderForm(form)` — moved here from index.js and matches.js where it was
 *                          an exact duplicate. Both files now import it from here.
 */
import { MONTH_INDEX_MAP } from './utils/helpers.js';

// ── Countdown Timer ───────────────────────────────────────────────────────────

/**
 * Starts the countdown timer towards the next upcoming match.
 * Reads match data from `window.upcomingMatchesData` (set by `setCountdownData`).
 * If called while a timer is already running it cleanly restarts.
 */
export function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    const titleEl     = document.getElementById('next-match-title');
    const sponsorBlock = document.getElementById('home-match-sponsor');
    const sponsorLink  = document.getElementById('home-sponsor-link');
    const sponsorLogo  = document.getElementById('home-sponsor-logo');

    if (!countdownEl || !titleEl) return;

    const upcomingMatches = window.upcomingMatchesData || [];

    const parseMatchDateTime = (matchDate, matchTime) => {
        if (!matchDate || !matchTime) return NaN;
        const dateParts = matchDate.split(' ');
        if (dateParts.length < 3) return NaN;

        const timeParts  = matchTime.split(':');
        if (timeParts.length < 2) return NaN;

        const monthIndex = MONTH_INDEX_MAP[dateParts[1].toLowerCase()];
        if (monthIndex === undefined) return NaN;

        return new Date(dateParts[2], monthIndex, dateParts[0], timeParts[0], timeParts[1]).getTime();
    };

    const now = Date.now();
    let targetMatch = null;
    let targetDate  = NaN;

    for (const match of upcomingMatches) {
        const parsed = parseMatchDateTime(match.dateTime.date, match.dateTime.time);
        if (!isNaN(parsed) && parsed > now) {
            targetMatch = match;
            targetDate  = parsed;
            break;
        }
    }

    if (!targetMatch || isNaN(targetDate)) {
        titleEl.textContent = 'Geen wedstrijden gepland in de nabije toekomst.';
        countdownEl.style.display = 'none';
        if (sponsorBlock) sponsorBlock.style.display = 'none';
        return;
    }

    titleEl.textContent = targetMatch.title;

    if (targetMatch.sponsor && sponsorBlock) {
        sponsorLink.href     = targetMatch.sponsor.url;
        sponsorLogo.src      = targetMatch.sponsor.logo;
        sponsorLogo.alt      = `Logo ${targetMatch.sponsor.name}`;
        sponsorLink.title    = `Bezoek website van ${targetMatch.sponsor.name} - Matchbalsponsor`;
        sponsorBlock.style.display = 'block';
    } else if (sponsorBlock) {
        sponsorBlock.style.display = 'none';
    }

    countdownEl.style.display = 'flex';

    if (window.countdownInterval) clearInterval(window.countdownInterval);

    function tickCountdown() {
        const distance = targetDate - Date.now();

        if (distance < 0) {
            clearInterval(window.countdownInterval);
            initCountdown();
            return;
        }

        const units = {
            days:    Math.floor(distance / 86400000),
            hours:   Math.floor((distance % 86400000) / 3600000),
            minutes: Math.floor((distance % 3600000)  / 60000),
            seconds: Math.floor((distance % 60000)    / 1000)
        };

        Object.entries(units).forEach(([key, val]) => {
            const el = document.getElementById(key);
            if (el) el.textContent = val < 10 ? '0' + val : val;
        });
    }

    tickCountdown();
    window.countdownInterval = setInterval(tickCountdown, 1000);
}

/**
 * Stores upcoming match data globally and syncs the countdown UI.
 * Called by page loaders (index.js, matches.js) once match data arrives.
 *
 * @param {Object[]} upcomingMatches - Array of upcoming match objects.
 */
export function setCountdownData(upcomingMatches) {
    window.upcomingMatchesData = upcomingMatches;

    const titleEl    = document.getElementById('next-match-title');
    const countdownEl = document.getElementById('countdown');
    const sponsorBlock = document.getElementById('home-match-sponsor');

    if (upcomingMatches.length === 0) {
        if (titleEl)     titleEl.textContent = 'Geen wedstrijden gepland in de nabije toekomst.';
        if (countdownEl) countdownEl.style.display = 'none';
        if (sponsorBlock) sponsorBlock.style.display = 'none';
        return;
    }

    const nextMatch = upcomingMatches[0];
    if (titleEl) titleEl.textContent = nextMatch.title;

    if (nextMatch.sponsor && sponsorBlock) {
        document.getElementById('home-sponsor-link').href = nextMatch.sponsor.url;
        const logo = document.getElementById('home-sponsor-logo');
        logo.src = nextMatch.sponsor.logo;
        logo.alt = `Logo ${nextMatch.sponsor.name}`;
        sponsorBlock.style.display = 'block';
    } else if (sponsorBlock) {
        sponsorBlock.style.display = 'none';
    }
}

// ── Form Results Renderer ─────────────────────────────────────────────────────

/**
 * Renders the recent-form strip (last 5 results) into `#form-results`.
 *
 * Moved here from index.js and matches.js where it was an exact duplicate.
 * Both files now import and call this single version.
 *
 * @param {string[]} form - Array of Dutch result strings: 'winst'|'gelijk'|'verlies'
 */
export function renderForm(form) {
    const formResults = document.getElementById('form-results');
    if (!formResults) return;
    formResults.innerHTML = '';

    form.forEach(result => {
        const span      = document.createElement('span');
        const cls       = result === 'winst' ? 'win' : result === 'gelijk' ? 'draw' : 'loss';
        const icon      = cls === 'win' ? 'check' : cls === 'draw' ? 'minus' : 'times';
        span.className  = `form-result ${cls}`;
        span.innerHTML  = `<i class="fas fa-${icon}"></i>`;
        formResults.appendChild(span);
    });
}
