/**
 * search.js — Search page
 *
 * Changes:
 *   - `fetchAndRenderMatches` → `loadMatches`
 *   - `setupCardClicks`       → `bindCardClicks`
 *   - `setupSearch`           → `initSearch`
 *   - `parseSearchDate`       → REMOVED (was an exact duplicate of the private
 *                               `parseSearchDate` in dataService.js; replaced by
 *                               imported `parseDDMMYYYY`)
 *   - `FootballLoader.init`   → `FootballLoader.show` (loader rename)
 *   - Duplicate comment block removed (the function header comment appeared twice)
 */
import { animateOnScroll } from './utils/animations.js';
import { fetchSearchMatches, parseDDMMYYYY } from './utils/dataService.js';
import { FootballLoader } from './components/loader.js';
import { resultToClass, resultToIcon } from './utils/helpers.js';

const animationElements = [
    { selector: '.section-title',    containerSelector: 'section' },
    { selector: '.page-hero h1',     containerSelector: 'section' },
    { selector: '.search-container', containerSelector: 'section' }
];

// ── Page Initialization ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadMatches();
        initSearch();
        animateOnScroll(animationElements);

        if (window.matchModal?.init) await window.matchModal.init();
    } catch (error) {
        console.error('Error during page initialization:', error);
    }
});

// ── Data Loading ──────────────────────────────────────────────────────────────

async function loadMatches() {
    const loaderId      = 'search-loading';
    const errorId       = 'search-error';
    const loadingEl     = document.getElementById(loaderId);
    const contentEl     = document.getElementById('search-results-content');
    const searchMsg     = document.getElementById('search-message');
    const resultsHeader = document.getElementById('search-results-header');

    if (loadingEl) {
        loadingEl.classList.remove('hidden');
        FootballLoader.show(loaderId, 'Wedstrijden worden geladen...');
    }

    document.getElementById(errorId)?.classList.add('hidden');
    contentEl?.classList.add('hidden');
    searchMsg?.classList.add('hidden');
    resultsHeader?.classList.add('hidden');

    try {
        window.allMatches = await fetchSearchMatches();

        if (loadingEl) loadingEl.classList.add('hidden');
        contentEl?.classList.remove('hidden');

        renderSearchResults(window.allMatches);
        resultsHeader?.classList.remove('hidden');

        const dropdown = document.getElementById('results-sort');
        if (dropdown) initDropdown(dropdown);
    } catch (error) {
        console.error('Error fetching matches:', error);

        if (loadingEl) loadingEl.classList.add('hidden');
        FootballLoader.showError(errorId, 'Wedstrijden konden niet worden geladen. Probeer opnieuw.');

        contentEl?.classList.add('hidden');
        resultsHeader?.classList.add('hidden');
    }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderSearchResults(matches) {
    const grid          = document.getElementById('search-results-grid');
    const searchMessage = document.getElementById('search-message');
    const resultsHeader = document.getElementById('search-results-header');
    const resultsContent = document.getElementById('search-results-content');

    if (!grid) { console.error('Grid element not found'); return; }

    grid.innerHTML = '';

    if (matches.length === 0) {
        if (searchMessage) {
            searchMessage.textContent = 'Geen wedstrijden gevonden.';
            searchMessage.classList.remove('hidden');
        }
        resultsHeader?.classList.add('hidden');
        resultsContent?.classList.add('hidden');
        return;
    }

    searchMessage?.classList.add('hidden');
    resultsHeader?.classList.remove('hidden');
    resultsContent?.classList.remove('hidden');

    matches.forEach(match => {
        const cls  = resultToClass(match.result);
        const icon = resultToIcon(cls);
        const card = document.createElement('div');
        card.className    = 'match-card modern result';
        card.style.cursor = 'pointer';
        card.setAttribute('data-match-data', JSON.stringify(match));

        const [home, away] = match.title.split(' vs ');
        card.innerHTML = `
            <div class="result-icon ${cls}">
                <span><i class="fas fa-${icon}"></i></span>
            </div>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${home}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${away}</div>
                </div>
                <div class="match-score">${match.score}</div>
                <div class="match-details">
                    <span class="match-date"><i class="fas fa-calendar"></i> ${match.dateTime.displayDate}</span>
                    <span class="match-season"><i class="fas fa-trophy"></i> ${match.season}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    bindCardClicks();
    animateMatchCards();
}

// ── Interactions ──────────────────────────────────────────────────────────────

function bindCardClicks() {
    document.querySelectorAll('#search-results-grid .match-card.modern.result').forEach(card => {
        card.addEventListener('click', () => {
            const raw = card.getAttribute('data-match-data');
            if (!raw) return;
            try {
                const matchData    = JSON.parse(raw);
                matchData.isUpcoming = false;
                window.matchModal?.show(matchData);
            } catch (err) {
                console.warn('Failed to parse match data:', err);
            }
        });
    });
}

function animateMatchCards() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.match-card:not(.animate-in)').forEach(c => observer.observe(c));
}

// ── Search & Autocomplete ─────────────────────────────────────────────────────

function initSearch() {
    const input         = document.getElementById('search-input');
    const autocomplete  = document.getElementById('autocomplete-list');
    const searchMessage = document.getElementById('search-message');
    const wrapper       = document.querySelector('.search-wrapper');

    if (!input || !autocomplete) return;

    const performSearch = (query) => {
        if (!window.allMatches) {
            if (searchMessage) {
                searchMessage.textContent = 'Fout bij het laden van wedstrijden.';
                searchMessage.classList.add('error-message');
                searchMessage.classList.remove('hidden');
            }
            return;
        }
        const filtered = window.allMatches.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase())
        );
        renderSearchResults(filtered);
    };

    const renderAutocomplete = (query) => {
        autocomplete.innerHTML = '';
        if (!window.allMatches || query.length < 1) {
            autocomplete.style.display = 'none';
            return;
        }

        const unique = [...new Set(window.allMatches.map(m => m.opponent))];
        const hits   = unique.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

        if (hits.length === 0) { autocomplete.style.display = 'none'; return; }

        hits.forEach(opponent => {
            const li       = document.createElement('li');
            li.textContent = opponent;
            li.className   = 'autocomplete-item';
            li.addEventListener('click', () => {
                input.value            = opponent;
                autocomplete.innerHTML = '';
                autocomplete.style.display = 'none';
                performSearch(opponent);
            });
            autocomplete.appendChild(li);
        });

        autocomplete.style.display = 'block';
    };

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        renderAutocomplete(query);
        performSearch(query);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(input.value.trim());
            autocomplete.innerHTML     = '';
            autocomplete.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.innerHTML     = '';
            autocomplete.style.display = 'none';
        }
    });

    if (wrapper) wrapper.addEventListener('click', () => input.focus());
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

function initDropdown(dropdownEl) {
    const selected = dropdownEl.querySelector('.selected');
    const options  = dropdownEl.querySelector('.options');
    if (!selected || !options) return;

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownEl.classList.toggle('active');
    });

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selected.dataset.value = li.dataset.value;
            selected.innerHTML     = li.innerHTML;
            dropdownEl.classList.remove('active');
            if (dropdownEl.id === 'results-sort') sortSearchResults(li.dataset.value);
        });
    });

    document.addEventListener('click', e => {
        if (!dropdownEl.contains(e.target)) dropdownEl.classList.remove('active');
    });
}

// ── Sorting ───────────────────────────────────────────────────────────────────

function sortSearchResults(sortKey) {
    if (!window.allMatches) return;

    const grid = document.getElementById('search-results-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.match-card')).map(card => {
        const data = JSON.parse(card.getAttribute('data-match-data') || '{}');
        return { el: card, date: data.dateTime?.date || '01-01-2000', score: data.score || '0-0', isHome: data.isHome === true };
    });

    items.sort((a, b) => {
        switch (sortKey) {
            case 'date-desc':    return parseDDMMYYYY(b.date) - parseDDMMYYYY(a.date);
            case 'date-asc':     return parseDDMMYYYY(a.date) - parseDDMMYYYY(b.date);
            case 'biggest-win':  return calcWinMargin(b) - calcWinMargin(a);
            case 'biggest-loss': return calcLossMargin(b) - calcLossMargin(a);
            default:             return 0;
        }
    });

    items.forEach(item => grid.appendChild(item.el));
    animateMatchCards();
}

function calcWinMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const us  = item.isHome ? home : away;
    const opp = item.isHome ? away : home;
    return us > opp ? us - opp : us === opp ? -0.5 : -1000 - (opp - us);
}

function calcLossMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const us  = item.isHome ? home : away;
    const opp = item.isHome ? away : home;
    return us < opp ? opp - us : us === opp ? -0.5 : -1000 - (us - opp);
}
