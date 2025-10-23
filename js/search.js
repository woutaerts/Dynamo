// search.js
import { animateOnScroll } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.match-card', containerSelector: 'section' },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.search-container', containerSelector: 'section' }
];

// Matches page initialization and functionality
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderMatches();
    setupSearch();
    animateOnScroll(animationElements);
});

// Fetch and parse CSV data from Google Spreadsheet
async function fetchAndRenderMatches() {
    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRCgon0xh9NuQ87NgqQzBNPCEmmZWcC_jrulRhLwmrudf5UQ2QBRA28F1qmWB9L5xP9uZ8-ct2aqfR/pub?gid=890518549&single=true&output=csv';

    try {
        const response = await fetch(spreadsheetUrl);
        const csvText = await response.text();
        window.allMatches = parseCsvData(csvText);
        renderSearchResults(window.allMatches); // Initially display all past matches
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        const searchMessage = document.getElementById('search-message');
        searchMessage.textContent = 'Fout bij het laden van wedstrijden.';
        searchMessage.classList.add('error-message');
        searchMessage.classList.remove('hidden');
    }
}

// Parse CSV data using Papaparse
function parseCsvData(csvText) {
    const parsed = Papa.parse(csvText, {
        skipEmptyLines: true,
        delimiter: ','
    });

    const rows = parsed.data;
    const matches = [];
    const currentDate = new Date();

    // Start from row 3 (index 2) and continue until goals scored/conceded are empty
    for (let i = 2; i < rows.length; i++) {
        const opponent = rows[i][1]?.trim(); // Column B (Tegenstander)
        const date = rows[i][4]?.trim(); // Column E (Datum)
        const goalsScored = rows[i][5]?.trim(); // Column F (D+)
        const goalsConceded = rows[i][6]?.trim(); // Column G (D-)

        // Skip if opponent or date is missing, or if goals scored/conceded are empty (not just "0")
        if (!opponent || !date || goalsScored === undefined || goalsConceded === undefined) continue;

        // Parse date in DD-MM-YYYY format
        let displayDate = '';
        let matchDate;
        let season = '';
        try {
            const [day, month, year] = date.split('-').map(num => parseInt(num));
            matchDate = new Date(year, month - 1, day);
            // Skip future matches
            if (matchDate > currentDate) continue;
            const monthNames = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
            displayDate = `${day} ${monthNames[month - 1]}`;
            // Determine season (August 1 to June 30)
            const seasonStartYear = month >= 8 ? year : year - 1;
            const seasonEndYear = (seasonStartYear + 1) % 100; // Last two digits
            season = `'${seasonStartYear % 100}-'${seasonEndYear < 10 ? '0' + seasonEndYear : seasonEndYear}`;
        } catch (error) {
            console.warn(`Invalid date format for match against ${opponent}: ${date}`);
            continue; // Skip invalid dates
        }

        const match = {
            title: `Dynamo Beirs vs ${opponent}`,
            opponent: opponent,
            dateTime: { date, displayDate, season },
            score: `${goalsScored}-${goalsConceded}`,
            isHome: true, // Assuming Dynamo Beirs is the home team; adjust if CSV provides home/away data
            result: determineResult(goalsScored, goalsConceded)
        };

        matches.push(match);
    }

    // Sort matches by date (most recent first)
    matches.sort((a, b) => {
        const dateA = parseDate(a.dateTime.date);
        const dateB = parseDate(b.dateTime.date);
        return dateB - dateA; // Descending order
    });

    return matches;
}

// Determine match result
function determineResult(goalsScored, goalsConceded) {
    const scored = parseInt(goalsScored);
    const conceded = parseInt(goalsConceded);
    if (isNaN(scored) || isNaN(conceded)) return 'gelijk'; // Default to draw if parsing fails
    if (scored > conceded) return 'winst';
    if (scored === conceded) return 'gelijk';
    return 'verlies';
}

// Parse date for sorting (DD-MM-YYYY)
function parseDate(dateStr) {
    try {
        const [day, month, year] = dateStr.split('-').map(num => parseInt(num));
        return new Date(year, month - 1, day);
    } catch (error) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return new Date(0); // Return epoch date for invalid dates to sort them last
    }
}

// Render search results
function renderSearchResults(matches) {
    const grid = document.getElementById('search-results-grid');
    const searchMessage = document.getElementById('search-message');
    grid.innerHTML = '';

    matches.forEach(match => {
        const card = document.createElement('div');
        const resultClass = match.result === 'winst' ? 'win' : match.result === 'gelijk' ? 'draw' : 'loss';
        card.className = `match-card modern result animate-in`; // Add animate-in to ensure visibility
        card.setAttribute('data-match-title', match.title);
        card.setAttribute('data-score', match.score);
        card.setAttribute('data-match-date', match.dateTime.date);

        const [homeTeam, awayTeam] = match.title.split(' vs ');
        card.innerHTML = `
            <div class="result-icon ${resultClass}">
                <span><i class="fas fa-${resultClass === 'win' ? 'check' : resultClass === 'draw' ? 'minus' : 'times'}"></i></span>
            </div>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${homeTeam}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${awayTeam}</div>
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

    // Hide search message when matches are displayed
    searchMessage.classList.add('hidden');

    // Force visibility to avoid animation issues
    setTimeout(() => {
        document.querySelectorAll('.match-card').forEach(card => {
            card.classList.add('animate-in');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 0);
}

// Setup search and autocomplete functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchMessage = document.getElementById('search-message');

    const performSearch = (query) => {
        if (!window.allMatches) {
            searchMessage.textContent = 'Fout bij het laden van wedstrijden.';
            searchMessage.classList.add('error-message');
            searchMessage.classList.remove('hidden');
            return;
        }

        const filteredMatches = window.allMatches.filter(match =>
            match.title.toLowerCase().includes(query.toLowerCase())
        );

        renderSearchResults(filteredMatches);
    };

    const renderAutocomplete = (query) => {
        autocompleteList.innerHTML = '';
        if (!window.allMatches || query.length < 1) {
            autocompleteList.style.display = 'none';
            return;
        }

        const uniqueOpponents = [...new Set(window.allMatches.map(match => match.opponent))];
        const filteredOpponents = uniqueOpponents.filter(opponent =>
            opponent.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions

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

        autocompleteList.style.display = filteredOpponents.length > 0 ? 'block' : 'none';
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

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.innerHTML = '';
            autocompleteList.style.display = 'none';
        }
    });

    // Focus input when clicking wrapper
    document.querySelector('.search-wrapper').addEventListener('click', () => {
        searchInput.focus();
    });
}

// Match interactions (hover effects only)
function setupMatchInteractions() {
    document.querySelectorAll('.match-card.modern.result').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover'); // Add hover class for elevation and shadow
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover'); // Remove hover class
        });
    });
}