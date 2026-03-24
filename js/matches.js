import { animateOnScroll } from './utils/animations.js';
import { initializeCountdown, updateCountdown } from './general.js';
import { fetchCurrentSeasonMatches } from './utils/dataService.js';
import { FootballLoader } from './components/loader.js'; // Ensure this matches your new component path

// Define animation elements
const animationElements = [
    { selector: '.match-card', containerSelector: 'section' },
    { selector: '.timeline', containerSelector: 'section' },
    { selector: '.timeline-item', containerSelector: ['section', '.container'] },
    { selector: '.timeline-start-knob', containerSelector: '.timeline-wrapper' },
    { selector: '.countdown-block', containerSelector: null },
    { selector: '#home-match-sponsor', containerSelector: null },
    { selector: '.sponsor-cta-section', containerSelector: null },
    { selector: '.form-result', containerSelector: null },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.upcoming-match-name', containerSelector: null },
    { selector: '.form-description', containerSelector: null }
];

// Matches page initialization
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderMatches();
    animateOnScroll(animationElements);
    scrollTimelineToEnd();
});

/* Fetch and Render Matches */
async function fetchAndRenderMatches() {
    const loaderId = 'matches-global-loader';
    const errorId = 'matches-error';
    const loaderContainer = document.getElementById(loaderId);

    // 1. Initialize the modular loader
    if (loaderContainer) {
        loaderContainer.classList.remove('hidden');
        FootballLoader.init(loaderId, 'Wedstrijden worden geladen...');
    }

    const knob = document.querySelector('.timeline-start-knob');
    if (knob) knob.style.opacity = '0';

    // Hide grids during load for a cleaner transition
    document.querySelectorAll('.matches-grid, #form-results, #season-timeline').forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s ease';
    });

    try {
        const matches = await fetchCurrentSeasonMatches();

        renderUpcomingMatches(matches.upcoming);
        renderRecentMatches(matches.past);
        renderSeasonTimeline(matches.all);
        renderForm(matches.form);
        renderSponsorsTicker(matches.all);
        updateCountdown(matches.upcoming);
        setupMatchInteractions();

        // 2. Hide loader on success
        if (loaderContainer) loaderContainer.classList.add('hidden');

        // Fade in content
        document.querySelectorAll('.matches-grid, #form-results, #season-timeline').forEach(el => {
            el.style.opacity = '1';
        });

        if (knob) knob.style.opacity = '';

        initializeCountdown();
        scrollTimelineToEnd();

    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);

        // 3. Use modular error display
        if (loaderContainer) loaderContainer.classList.add('hidden');
        FootballLoader.showError(errorId, 'Wedstrijden konden niet worden geladen. Probeer opnieuw.');

        const titleEl = document.getElementById('next-match-title');
        const countdownEl = document.getElementById('countdown');
        if (titleEl && countdownEl) {
            titleEl.textContent = 'Geen wedstrijden beschikbaar.';
            countdownEl.style.display = 'none';
        }
    }
}

// Render upcoming matches
function renderUpcomingMatches(upcomingMatches) {
    const grid = document.getElementById('upcoming-matches-grid');
    grid.innerHTML = '';

    if (upcomingMatches.length === 0) {
        grid.classList.add('no-matches');
        const noMatchWrapper = document.createElement('div');
        noMatchWrapper.className = 'upcoming-match-name';

        const heading = document.createElement('h3');
        heading.textContent = 'Geen wedstrijden gepland in de nabije toekomst.';

        noMatchWrapper.appendChild(heading);
        grid.appendChild(noMatchWrapper);

        setTimeout(() => {
            noMatchWrapper.classList.add('animate-in');
        }, 100);

        return;
    }

    grid.classList.remove('no-matches');

    const limitedMatches = upcomingMatches.slice(0, 6);

    limitedMatches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card modern';
        card.setAttribute('data-venue', match.stadium);
        card.setAttribute('data-match-title', match.title);
        card.setAttribute('data-match-date', match.dateTime.date);
        card.setAttribute('data-match-time', match.dateTime.time);
        card.setAttribute('data-match-season', match.season);
        card.setAttribute('data-sponsor', JSON.stringify(match.sponsor || null));
        card.setAttribute('data-match-data', JSON.stringify(match));

        const [homeTeam, awayTeam] = match.title.split(' vs ');
        card.innerHTML = `
            <span class="result-icon"><i class="fas fa-hourglass-half"></i></span>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${homeTeam}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${awayTeam}</div>
                </div>
                <div class="match-score">${match.dateTime.displayDate} — ${match.dateTime.time}</div>
                <div class="match-details">
                    <div class="match-venue">
                        <i class="fas fa-map-marker-alt"></i>
                        ${match.stadium}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render recent matches
function renderRecentMatches(pastMatches) {
    const grid = document.getElementById('recent-matches-grid');
    grid.innerHTML = '';

    if (pastMatches.length === 0) {
        grid.classList.add('no-matches');
        const noMatchWrapper = document.createElement('div');
        noMatchWrapper.className = 'upcoming-match-name';

        const heading = document.createElement('h3');
        heading.textContent = 'Geen recente wedstrijden beschikbaar.';

        noMatchWrapper.appendChild(heading);
        grid.appendChild(noMatchWrapper);

        setTimeout(() => {
            noMatchWrapper.classList.add('animate-in');
        }, 100);

        return;
    }

    grid.classList.remove('no-matches');

    const reversedPastMatches = [...pastMatches].reverse().slice(0, 6); // Limit to 6 recent matches

    reversedPastMatches.forEach(match => {
        const card = document.createElement('div');
        const resultClass = match.result === 'winst' ? 'win' : match.result === 'gelijk' ? 'draw' : 'loss';
        card.className = `match-card modern result`;
        card.setAttribute('data-venue', match.stadium);
        card.setAttribute('data-match-title', match.title);
        card.setAttribute('data-score', match.score);
        card.setAttribute('data-match-date', match.dateTime.date);
        card.setAttribute('data-match-time', match.dateTime.time);
        card.setAttribute('data-match-season', match.season);
        card.setAttribute('data-goalscorers', JSON.stringify(match.goalscorers));
        card.setAttribute('data-sponsor', JSON.stringify(match.sponsor || null));
        card.setAttribute('data-match-data', JSON.stringify(match));

        const [homeTeam, awayTeam] = match.title.split(' vs ');
        card.innerHTML = `
            <div class="result-icon ${resultClass}"><span><i class="fas fa-${resultClass === 'win' ? 'check' : resultClass === 'draw' ? 'minus' : 'times'}"></i></span></div>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${homeTeam}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${awayTeam}</div>
                </div>
                <div class="match-score">${match.score}</div>
                <div class="match-details">
                    <span class="match-date"><i class="fas fa-calendar"></i> ${match.dateTime.displayDate}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render season timeline
function renderSeasonTimeline(matches) {
    const timeline = document.getElementById('season-timeline');
    timeline.innerHTML = '';

    const pastMatches = matches.filter(match => match.result);

    pastMatches.forEach((match, index) => {
        const item = document.createElement('div');
        const resultClass = match.result ? (match.result === 'winst' ? 'win' : match.result === 'gelijk' ? 'draw' : 'loss') : '';
        item.className = `timeline-item ${resultClass}`;
        item.setAttribute('data-match', `match${index + 1}`);
        item.setAttribute('data-match-data', JSON.stringify(match));
        item.innerHTML = `
            <span class="result-icon"><i class="fas fa-${resultClass === 'win' ? 'check' : resultClass === 'draw' ? 'minus' : 'times'}"></i></span>
            <small>${match.dateTime.displayDate}</small>
        `;
        timeline.appendChild(item);
    });
}

// Render form display
function renderForm(form) {
    const formResults = document.getElementById('form-results');
    formResults.innerHTML = '';

    form.forEach(result => {
        const span = document.createElement('span');
        const resultClass = result === 'winst' ? 'win' : result === 'gelijk' ? 'draw' : 'loss';
        span.className = `form-result ${resultClass}`;
        span.innerHTML = `<i class="fas fa-${resultClass === 'win' ? 'check' : resultClass === 'draw' ? 'minus' : 'times'}"></i>`;
        formResults.appendChild(span);
    });
}

// Render Sponsors Ticker
function renderSponsorsTicker(allMatches) {
    const track = document.getElementById('sponsor-ticker-track');
    const wrapper = document.getElementById('sponsor-ticker-wrapper');
    if (!track || !wrapper) return;

    track.innerHTML = '';

    const uniqueSponsors = new Map();
    allMatches.forEach(match => {
        if (match.sponsor && match.sponsor.name && match.sponsor.logo) {
            if (!uniqueSponsors.has(match.sponsor.name)) {
                uniqueSponsors.set(match.sponsor.name, match.sponsor);
            }
        }
    });

    if (uniqueSponsors.size === 0) {
        const section = document.querySelector('.sponsors-ticker-section');
        if (section) section.style.display = 'none';
        return;
    }

    const createSponsorHTML = (sponsor) => `
        <a href="${sponsor.url}" target="_blank" rel="noopener" class="sponsor-item" title="${sponsor.name}">
            <img src="${sponsor.logo}" alt="${sponsor.name}" class="sponsor-logo" loading="lazy">
        </a>
    `;

    let logosHTML = '';
    uniqueSponsors.forEach(sponsor => {
        logosHTML += createSponsorHTML(sponsor);
    });

    track.innerHTML = logosHTML;

    const images = track.querySelectorAll('img');
    let imagesLoaded = 0;
    const totalImages = images.length;

    const checkDimensionsAndStart = () => {
        requestAnimationFrame(() => {
            const trackWidth = track.scrollWidth;
            const wrapperWidth = wrapper.offsetWidth;
            const threshold = wrapperWidth * 0.7; // 70% regel

            track.classList.remove('centered', 'scrolling');

            if (trackWidth > threshold) {
                track.innerHTML += logosHTML;
                track.classList.add('scrolling');

                setTimeout(() => {
                    if (track.scrollWidth < wrapperWidth * 2) {
                        track.innerHTML += logosHTML;
                    }
                }, 50);
            } else {
                track.classList.add('centered');
            }
        });
    };

    if (totalImages === 0) {
        checkDimensionsAndStart();
        return;
    }

    images.forEach(img => {
        if (img.complete) {
            imagesLoaded++;
        } else {
            img.addEventListener('load', () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) checkDimensionsAndStart();
            });
            img.addEventListener('error', () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) checkDimensionsAndStart();
            });
        }
    });

    if (imagesLoaded === totalImages) {
        checkDimensionsAndStart();
    }
}

// Match interactions
function setupMatchInteractions() {
    // 1. Single loop for all match cards (both upcoming and past)
    document.querySelectorAll('.match-card.modern').forEach(card => {
        card.addEventListener('click', () => {
            const matchDataRaw = card.getAttribute('data-match-data');
            if (!matchDataRaw) return;

            let matchData;
            try {
                matchData = JSON.parse(matchDataRaw);
            } catch (error) {
                console.warn('Failed to parse match data:', error);
                return;
            }

            matchData.isUpcoming = !card.classList.contains('result');

            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
    });

    // 2. Timeline items loop
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            const matchDataRaw = item.getAttribute('data-match-data');
            let matchData;
            try {
                matchData = JSON.parse(matchDataRaw);
            } catch (error) {
                console.warn('Failed to parse match data:', error);
                matchData = {
                    title: `Match ${item.dataset.match}`,
                    dateTime: { date: item.querySelector('small')?.textContent || 'TBD', time: 'TBD' },
                    season: '2025-2026',
                    stadium: 'Onbekend Stadion',
                    score: null,
                    goalscorers: []
                };
            }
            matchData.isUpcoming = !matchData.score;
            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
    });
}

// Timeline scroller
function scrollTimelineToEnd() {
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    if (timelineWrapper) {
        timelineWrapper.scrollLeft = timelineWrapper.scrollWidth;
    }
}