import { animateOnScroll } from './utils/animations.js';
import { fetchSearchMatches } from './utils/dataService.js';

/* Animation Elements */
const animationElements = [
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.search-container', containerSelector: 'section' }];

/* Page Initialization */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchAndRenderMatches();
        setupSearch();

        animateOnScroll(animationElements);

        // Initialize match modal if available
        if (window.matchModal?.init) {
            await window.matchModal.init();
        }
    } catch (error) {
        console.error('Error during page initialization:', error);
    }
});

/* Fetch and Render Matches */
async function fetchAndRenderMatches() {
    const loadingEl   = document.getElementById('search-loading');
    const errorEl     = document.getElementById('search-error');
    const contentEl   = document.getElementById('search-results-content');
    const searchMsg   = document.getElementById('search-message');
    const resultsHeader = document.getElementById('search-results-header');

    loadingEl?.classList.remove('hidden');
    errorEl?.classList.add('hidden');
    contentEl?.classList.add('hidden');
    searchMsg?.classList.add('hidden');
    resultsHeader?.classList.add('results-header-hidden');

    try {
        // Fetch via service!
        window.allMatches = await fetchSearchMatches();

        loadingEl?.classList.add('hidden');
        contentEl?.classList.remove('hidden');

        renderSearchResults(window.allMatches);
        resultsHeader?.classList.remove('results-header-hidden');

        const resultsDropdown = document.getElementById('results-sort');
        if (resultsDropdown) initCustomDropdown(resultsDropdown);

    } catch (error) {
        console.error('Error fetching matches:', error);
        loadingEl?.classList.add('hidden');
        errorEl?.classList.remove('hidden');
        contentEl?.classList.add('hidden');
        resultsHeader?.classList.add('results-header-hidden');
        searchMsg.textContent = 'Fout bij het laden van wedstrijden.';
        searchMsg.classList.add('error-message');
        searchMsg.classList.remove('hidden');
    }
}

/* Render Search Results */
function renderSearchResults(matches) {
    const grid           = document.getElementById('search-results-grid');
    const searchMessage  = document.getElementById('search-message');
    const resultsHeader  = document.getElementById('search-results-header');
    const resultsContent = document.getElementById('search-results-content');

    if (!grid) {
        console.error('Grid element not found');
        return;
    }

    grid.innerHTML = '';

    if (matches.length === 0) {
        if (searchMessage) {
            searchMessage.textContent = 'Geen wedstrijden gevonden.';
            searchMessage.classList.remove('hidden');
        }

        resultsHeader?.classList.add('results-header-hidden');
        resultsContent?.classList.add('hidden');
        return;
    }

    searchMessage?.classList.add('hidden');
    resultsHeader?.classList.remove('results-header-hidden');
    resultsContent?.classList.remove('hidden');

    matches.forEach(match => {
        const resCls = match.result === 'winst' ? 'win' : match.result === 'gelijk' ? 'draw' : 'loss';
        const card = document.createElement('div');
        card.className = `match-card modern result`;
        card.style.cursor = 'pointer';

        card.setAttribute('data-match-data', JSON.stringify(match));

        const [home, away] = match.title.split(' vs ');
        card.innerHTML = `
            <div class="result-icon ${resCls}">
                <span><i class="fas fa-${resCls === 'win' ? 'check' : resCls === 'draw' ? 'minus' : 'times'}"></i></span>
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
                    <span class="match-season"><i class="fas fa-trophy"></i> ${match.dateTime.season}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (searchMessage) {
        searchMessage.classList.add('hidden');
    }

    setupCardClicks();
    animateMatchCards();
}

/* Make Match Cards Clickable */
function setupCardClicks() {
    document.querySelectorAll('#search-results-grid .match-card.modern.result').forEach(card => {
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

            matchData.isUpcoming = false;

            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('matchModal not ready');
            }
        });
    });
}

/* Match Card Animations */
function animateMatchCards() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.match-card:not(.animate-in)').forEach(card => observer.observe(card));
}

/* Search and Autocomplete */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchMessage = document.getElementById('search-message');
    const searchWrapper = document.querySelector('.search-wrapper');

    if (!searchInput || !autocompleteList) return;

    const performSearch = (query) => {
        const allData = window.allMatches;

        if (!allData) {
            if (searchMessage) {
                searchMessage.textContent = 'Fout bij het laden van wedstrijden.';
                searchMessage.classList.add('error-message');
                searchMessage.classList.remove('hidden');
            }
            return;
        }

        const filteredMatches = allData.filter(match =>
            match.title.toLowerCase().includes(query.toLowerCase())
        );
        renderSearchResults(filteredMatches);
    };

    const renderAutocomplete = (query) => {
        autocompleteList.innerHTML = '';
        const allData = window.allMatches;

        if (!allData || query.length < 1) {
            autocompleteList.style.display = 'none';
            return;
        }

        const uniqueOpponents = [...new Set(allData.map(match => match.opponent))];
        const filteredOpponents = uniqueOpponents.filter(opponent =>
            opponent.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (filteredOpponents.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        filteredOpponents.forEach(opponent => {
            const li = document.createElement('li');
            li.textContent = opponent;
            li.className = 'autocomplete-item';
            li.addEventListener('click', () => {
                searchInput.value = opponent;
                performSearch(opponent);
                autocompleteList.innerHTML = '';
                autocompleteList.style.display = 'none';
            });
            autocompleteList.appendChild(li);
        });

        autocompleteList.style.display = 'block';
    };

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        renderAutocomplete(query);
        performSearch(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
            autocompleteList.innerHTML = '';
            autocompleteList.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.innerHTML = '';
            autocompleteList.style.display = 'none';
        }
    });

    if (searchWrapper) {
        searchWrapper.addEventListener('click', () => searchInput.focus());
    }
}

/* Sort Dropdown */
function initCustomDropdown(dropdownEl) {
    const selected = dropdownEl.querySelector('.selected');
    const options = dropdownEl.querySelector('.options');

    if (!selected || !options) return;

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownEl.classList.toggle('active');
    });

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = li.dataset.value;
            const text = li.textContent;
            selected.dataset.value = value;
            selected.textContent = text;
            dropdownEl.classList.remove('active');
            if (dropdownEl.id === 'results-sort') {
                sortSearchResults(value);
            }
        });
    });

    document.addEventListener('click', e => {
        if (!dropdownEl.contains(e.target)) {
            dropdownEl.classList.remove('active');
        }
    });
}

/* Sorting Logic */
function sortSearchResults(sortKey) {
    if (!window.allMatches) return;

    const grid = document.getElementById('search-results-grid');
    if (!grid) return;

    let displayed = Array.from(document.querySelectorAll('#search-results-grid .match-card'))
        .map(card => {
            const matchData = JSON.parse(card.getAttribute('data-match-data') || '{}');
            return {
                el: card,
                date: matchData.dateTime?.date || '01-01-2000',
                score: matchData.score || '0-0',
                isHome: matchData.isHome === true
            };
        });

    displayed.sort((a, b) => {
        switch (sortKey) {
            case 'date-desc': return parseSearchDate(b.date) - parseSearchDate(a.date);
            case 'date-asc': return parseSearchDate(a.date) - parseSearchDate(b.date);
            case 'biggest-win': return victoryMargin(b) - victoryMargin(a);
            case 'biggest-loss': return lossMargin(b) - lossMargin(a);
            default: return 0;
        }
    });

    displayed.forEach(item => grid.appendChild(item.el));
    animateMatchCards();
}

/* HELPER FUNCTIONS */
function parseSearchDate(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // Creates a numeric timestamp: new Date(year, monthIndex, day)
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
    return 0;
}

function victoryMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const dynamo = item.isHome ? home : away;
    const opp = item.isHome ? away : home;

    if (dynamo > opp) {
        return dynamo - opp;
    } else if (dynamo === opp) {
        return -0.5;
    } else {
        return -1000 - (opp - dynamo);
    }
}

function lossMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const dynamo = item.isHome ? home : away;
    const opp = item.isHome ? away : home;

    if (dynamo < opp) {
        return opp - dynamo;
    } else if (dynamo === opp) {
        return -0.5;
    } else {
        return -1000 - (dynamo - opp);
    }
}