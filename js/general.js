/* js/general.js */
import { MONTH_INDEX_MAP } from './utils/helpers.js';

/**
 * Countdown Timer & Sponsor Logic
 */
export function initializeCountdown() {
    const countdownElement = document.getElementById("countdown");
    const titleEl = document.getElementById("next-match-title");
    const sponsorBlock = document.getElementById('home-match-sponsor');
    const sponsorLink = document.getElementById('home-sponsor-link');
    const sponsorLogo = document.getElementById('home-sponsor-logo');

    if (!countdownElement || !titleEl) return;

    const upcomingMatches = window.upcomingMatchesData || [];

    const parseDateTime = (matchDate, matchTime) => {
        if (!matchDate || !matchTime) return NaN;
        const dateParts = matchDate.split(' ');
        if (dateParts.length < 3) return NaN;

        const day = dateParts[0];
        const month = dateParts[1].toLowerCase();
        const year = dateParts[2];

        const timeParts = matchTime.split(':');
        if (timeParts.length < 2) return NaN;

        const monthIndex = MONTH_INDEX_MAP[month];
        if (monthIndex === undefined) return NaN;

        return new Date(year, monthIndex, day, timeParts[0], timeParts[1]).getTime();
    };

    const now = Date.now();
    let targetMatch = null;
    let targetDate = NaN;

    for (const match of upcomingMatches) {
        const parsed = parseDateTime(match.dateTime.date, match.dateTime.time);
        if (!isNaN(parsed) && parsed > now) {
            targetMatch = match;
            targetDate = parsed;
            break;
        }
    }

    if (!targetMatch || isNaN(targetDate)) {
        titleEl.textContent = "Geen wedstrijden gepland in de nabije toekomst.";
        countdownElement.style.display = "none";
        if (sponsorBlock) sponsorBlock.style.display = "none";
        return;
    }

    titleEl.textContent = targetMatch.title;
    if (targetMatch.sponsor && sponsorBlock) {
        sponsorLink.href = targetMatch.sponsor.url;
        sponsorLogo.src = targetMatch.sponsor.logo;
        sponsorLogo.alt = `Logo ${targetMatch.sponsor.name}`;
        sponsorLink.title = `Bezoek website van ${targetMatch.sponsor.name} - Matchbalsponsor`;
        sponsorBlock.style.display = 'block';
    } else if (sponsorBlock) {
        sponsorBlock.style.display = 'none';
    }

    countdownElement.style.display = "flex";

    if (window.countdownInterval) clearInterval(window.countdownInterval);

    function updateDisplay() {
        const currentTime = Date.now();
        const distance = targetDate - currentTime;

        if (distance < 0) {
            clearInterval(window.countdownInterval);
            initializeCountdown();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const elements = { days, hours, minutes, seconds };
        Object.keys(elements).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.textContent = elements[key] < 10 ? '0' + elements[key] : elements[key];
        });
    }

    updateDisplay();
    window.countdownInterval = setInterval(updateDisplay, 1000);
}

/**
 * Updates global match data (called by home page initializer)
 */
export function updateCountdown(upcomingMatches) {
    window.upcomingMatchesData = upcomingMatches;

    const titleEl = document.getElementById('next-match-title');
    const countdownEl = document.getElementById('countdown');
    const sponsorBlock = document.getElementById('home-match-sponsor');

    if (upcomingMatches.length === 0) {
        if (titleEl) titleEl.textContent = 'Geen wedstrijden gepland in de nabije toekomst.';
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