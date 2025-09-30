// statistics.js
import { animateOnScroll } from './general.js';

// Season player data (loaded dynamically from CSV)
let seasonPlayers = [];

// All-time player data (loaded dynamically from CSV)
let allTimePlayers = [];

// Function to load and parse season players from the Google Sheet CSV
async function loadSeasonPlayers() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQRCgon0xh9NuQ87NgqQzBNPCEmmZWcC_jrulRhLwmrudf5UQ2QBRA28F1qmWB9L5xP9uZ8-ct2aqfR/pub?gid=300017481&single=true&output=csv');
        if (!response.ok) {
            throw new Error('Failed to fetch season players CSV');
        }
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));

        // Position translation map
        const positionMap = {
            'GK': 'goalkeeper',
            'VER': 'defender',
            'MID': 'midfielder',
            'AAN': 'attacker'
        };

        // Title rows to skip
        const titleRows = ['keeper', 'verdedigers', 'middenvelders', 'aanvallers'];

        const players = [];
        for (let i = 0; i < Math.min(rows.length, 50); i++) { // Up to row 49 (0-indexed, skip extern from 50+)
            const row = rows[i];
            if (row.length < 11) continue;

            const name = row[1];      // Column B
            const positionDutch = row[2];  // Column C
            const goalsStr = row[28];  // Column AC
            const matchesStr = row[29]; // Column AD
            const ratioStr = row[30];  // Column AE

            // Skip if any required field is empty
            if (!name || !positionDutch || !goalsStr || !matchesStr || !ratioStr) continue;

            // Skip title rows
            if (titleRows.includes(name.toLowerCase())) continue;

            const goals = parseInt(goalsStr, 10);
            const matches = parseInt(matchesStr, 10);

            // Validate numbers
            if (isNaN(goals) || isNaN(matches)) continue;

            const position = positionMap[positionDutch];
            if (!position) continue; // Skip invalid positions

            players.push({
                name,
                position,
                goals,
                matches
            });
        }

        // Sort by goals descending (initial sort for consistency)
        seasonPlayers = players.sort((a, b) => b.goals - a.goals);

        // Update the display after loading
        updateSeasonPlayerStats();

        console.log(`Loaded ${seasonPlayers.length} season players from CSV.`);
    } catch (error) {
        console.error('Error loading season players:', error);
        seasonPlayers = []; // Empty array on failure
        updateSeasonPlayerStats();
    }
}

// Function to load and parse all-time players from the Google Sheet CSV
async function loadAllTimePlayers() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQRCgon0xh9NuQ87NgqQzBNPCEmmZWcC_jrulRhLwmrudf5UQ2QBRA28F1qmWB9L5xP9uZ8-ct2aqfR/pub?gid=1401992067&single=true&output=csv');
        if (!response.ok) {
            throw new Error('Failed to fetch all-time players CSV');
        }
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));

        // Position translation map
        const positionMap = {
            'GK': 'goalkeeper',
            'VER': 'defender',
            'MID': 'midfielder',
            'AAN': 'attacker'
        };

        // Title rows to skip
        const titleRows = ['keeper', 'verdedigers', 'middenvelders', 'aanvallers'];

        const players = [];
        for (let i = 0; i < Math.min(rows.length, 57); i++) {  // Up to row 56 (0-indexed, skip extern from 57+)
            const row = rows[i];
            if (row.length < 7) continue;

            const name = row[1];      // Column B
            const positionDutch = row[2];  // Column C
            const goalsStr = row[4];  // Column E
            const matchesStr = row[5]; // Column F
            const ratioStr = row[6];  // Column G

            // Skip if any required field is empty
            if (!name || !positionDutch || !goalsStr || !matchesStr || !ratioStr) continue;

            // Skip title rows
            if (titleRows.includes(name.toLowerCase())) continue;

            const goals = parseInt(goalsStr, 10);
            const matches = parseInt(matchesStr, 10);

            // Validate numbers
            if (isNaN(goals) || isNaN(matches) || matches <= 0) continue;

            const position = positionMap[positionDutch];
            if (!position) continue;  // Skip invalid positions

            players.push({
                name,
                position,
                goals,
                matches
            });
        }

        // Sort by goals descending (initial sort for consistency)
        allTimePlayers = players.sort((a, b) => b.goals - a.goals);

        // Update the display after loading
        updateAllTimePlayerStats();

        console.log(`Loaded ${allTimePlayers.length} all-time players from CSV.`);
    } catch (error) {
        console.error('Error loading all-time players:', error);
        allTimePlayers = []; // Empty array on failure
        updateAllTimePlayerStats();
    }
}

// Position icons mapping
const positionIcons = {
    all: '<i class="fas fa-users"></i>',
    goalkeeper: '<i class="fas fa-hand-paper"></i>',
    defender: '<i class="fas fa-shield-alt"></i>',
    midfielder: '<i class="fas fa-person-running"></i>',
    attacker: '<i class="fas fa-crosshairs"></i>'
};

// Define animation elements
const animationElements = [
    { selector: '.stat-card', containerSelector: 'section' },
    { selector: '.record-category', containerSelector: 'section' },
    { selector: '.scorer-row', containerSelector: 'section' },
    { selector: '.player-row', containerSelector: 'section' },
    { selector: '.stat-category', containerSelector: 'section' },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.toggles-container', containerSelector: null }
];

// DOM initialization
document.addEventListener('DOMContentLoaded', () => {
    initToggle();
    initPlayerStats();
    initSortableHeaders();
    initCustomDropdowns();
    animateOnScroll(animationElements);
});

// Initialize player stats (using custom dropdowns instead of <select>)
function initPlayerStats() {
    loadSeasonPlayers(); // Load dynamic season data
    loadAllTimePlayers(); // Load dynamic all-time data
}

// Update season player stats display
function updateSeasonPlayerStats(sortBy = document.querySelector('#season-sort .selected')?.dataset.value || 'goals') {
    const playerStatsList = document.querySelector('.player-stats-list');

    // Sort players
    const sortedPlayers = [...seasonPlayers].sort((a, b) => {
        const aRatio = a.matches === 0 ? 0 : a.goals / a.matches;
        const bRatio = b.matches === 0 ? 0 : b.goals / b.matches;

        if (sortBy === 'goals') {
            // 1. Most goals (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 2. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 3. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'matches') {
            // 1. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 2. Goals scored (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 3. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        } else { // sortBy === 'avg-goals'
            // 1. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 2. Goals scored (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 3. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        }
    });

    // Clear existing content
    playerStatsList.innerHTML = '';

    // Render sorted players
    sortedPlayers.forEach((player, index) => {
        const avgGoals = player.matches === 0 ? '0.00' : (player.goals / player.matches).toFixed(2);
        const row = document.createElement('div');
        row.className = 'player-row';
        row.innerHTML = `
            <div class="table-cell player-rank">${index + 1}</div>
            <div class="table-cell player-position">${positionIcons[player.position]}</div>
            <div class="table-cell player-name">${player.name}</div>
            <div class="table-cell player-goals">${player.goals}</div>
            <div class="table-cell player-matches">${player.matches}</div>
            <div class="table-cell player-avg-goals">${avgGoals}</div>
        `;
        playerStatsList.appendChild(row);
    });

    animateOnScroll([{ selector: '.player-row', containerSelector: 'section' }]);
}

// Update all-time player stats display
function updateAllTimePlayerStats(sortBy = document.querySelector('#alltime-sort .selected')?.dataset.value || 'goals') {
    const topScorersList = document.querySelector('.top-scorers-list');

    // Sort players
    const sortedPlayers = [...allTimePlayers].sort((a, b) => {
        const aRatio = a.goals / a.matches; // All-time players have matches > 0
        const bRatio = b.goals / b.matches;

        if (sortBy === 'goals') {
            // 1. Most goals (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 2. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 3. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'matches') {
            // 1. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 2. Goals scored (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 3. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        } else { // sortBy === 'avg-goals'
            // 1. Highest ratio (descending)
            if (aRatio !== bRatio) return bRatio - aRatio;
            // 2. Goals scored (descending)
            if (a.goals !== b.goals) return b.goals - a.goals;
            // 3. Matches played (descending)
            if (a.matches !== b.matches) return b.matches - a.matches;
            // 4. Name (alphabetically, ascending)
            return a.name.localeCompare(b.name);
        }
    });

    // Clear existing content
    topScorersList.innerHTML = '';

    // Render sorted players
    sortedPlayers.forEach((player, index) => {
        const avgGoals = (player.goals / player.matches).toFixed(2);
        const row = document.createElement('div');
        row.className = 'scorer-row';
        row.innerHTML = `
            <div class="table-cell scorer-rank">${index + 1}</div>
            <div class="table-cell scorer-position">${positionIcons[player.position]}</div>
            <div class="table-cell scorer-name">${player.name}</div>
            <div class="table-cell scorer-goals">${player.goals}</div>
            <div class="table-cell scorer-matches">${player.matches}</div>
            <div class="table-cell scorer-avg-goals">${avgGoals}</div>
        `;
        topScorersList.appendChild(row);
    });

    animateOnScroll([{ selector: '.scorer-row', containerSelector: 'section' }]);
}

// Custom dropdown initializer
function initCustomDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const selected = dropdown.querySelector('.selected');
        const options = dropdown.querySelector('.options');

        selected.addEventListener('click', () => {
            // Toggle active class on the clicked dropdown
            dropdown.classList.toggle('active');
            // Show/hide options
            options.style.display = options.style.display === 'block' ? 'none' : 'block';
            // Close other dropdowns
            document.querySelectorAll('.custom-dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                    otherDropdown.querySelector('.options').style.display = 'none';
                }
            });
        });

        options.querySelectorAll('li').forEach(option => {
            option.addEventListener('click', () => {
                selected.textContent = option.textContent;
                selected.dataset.value = option.dataset.value;
                dropdown.classList.remove('active'); // Close dropdown after selection
                options.style.display = 'none';

                if (dropdown.id === 'season-sort') {
                    updateSeasonPlayerStats(selected.dataset.value);
                } else if (dropdown.id === 'alltime-sort') {
                    updateAllTimePlayerStats(selected.dataset.value);
                }
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.querySelector('.options').style.display = 'none';
            });
        }
    });
}

// Keep sortable headers but hook them to custom dropdowns
function initSortableHeaders() {
    const seasonHeaderCells = document.querySelectorAll('#player-season-stats .table-header .table-cell');
    const allTimeHeaderCells = document.querySelectorAll('#player-alltime-stats .table-header .table-cell');

    seasonHeaderCells.forEach((cell, index) => {
        const key = getSortKeyFromIndex(index);
        if (key) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                const selected = document.querySelector('#season-sort .selected');
                if (selected) {
                    selected.dataset.value = key;
                    selected.textContent = getLabelFromKey(key);
                }
                updateSeasonPlayerStats(key);
            });
        }
    });

    allTimeHeaderCells.forEach((cell, index) => {
        const key = getSortKeyFromIndex(index);
        if (key) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                const selected = document.querySelector('#alltime-sort .selected');
                if (selected) {
                    selected.dataset.value = key;
                    selected.textContent = getLabelFromKey(key);
                }
                updateAllTimePlayerStats(key);
            });
        }
    });
}

function getSortKeyFromIndex(index) {
    switch (index) {
        case 3: return 'goals';
        case 4: return 'matches';
        case 5: return 'avg-goals';
        default: return null;
    }
}

function getLabelFromKey(key) {
    switch (key) {
        case 'goals': return 'Total Goals';
        case 'matches': return 'Matches Played';
        case 'avg-goals': return 'Average Goals per Match';
        default: return '';
    }
}

// Toggle system for team/player and season/all-time views
function initToggle() {
    const toggles = {
        teamPlayer: document.getElementById('team-player-toggle'),
        seasonAlltime: document.getElementById('season-alltime-toggle')
    };

    const labels = {
        team: document.getElementById('label-team'),
        player: document.getElementById('label-player'),
        season: document.getElementById('label-season'),
        alltime: document.getElementById('label-alltime')
    };

    const sections = {
        teamSeason: document.getElementById('team-season-stats'),
        teamSeasonDetailed: document.getElementById('team-season-detailed'),
        teamAlltimePerformance: document.getElementById('team-alltime-performance'),
        teamAlltime: document.getElementById('team-alltime-stats'),
        playerSeason: document.getElementById('player-season-stats'),
        playerAlltime: document.getElementById('player-alltime-stats')
    };

    const updateView = () => {
        const isPlayer = toggles.teamPlayer?.checked;
        const isAlltime = toggles.seasonAlltime?.checked;

        // Update label states
        labels.team?.classList.toggle('active', !isPlayer);
        labels.player?.classList.toggle('active', isPlayer);
        labels.season?.classList.toggle('active', !isAlltime);
        labels.alltime?.classList.toggle('active', isAlltime);

        // Hide all sections
        Object.values(sections).forEach(section => section?.classList.add('hidden'));

        // Remove theme classes
        document.body.classList.remove('team-alltime', 'player-season', 'player-alltime');

        // Reset animations for all relevant elements
        animationElements.forEach(({ selector }) => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.remove('animate-in');
            });
        });

        // Show appropriate sections
        let sectionsToShow;
        if (!isPlayer && !isAlltime) {
            sectionsToShow = [sections.teamSeason, sections.teamSeasonDetailed];
            document.body.classList.add('team-season');
        } else if (!isPlayer && isAlltime) {
            sectionsToShow = [
                sections.teamAlltimePerformance,
                sections.teamAlltime
            ];
            document.body.classList.add('team-alltime');
        } else if (isPlayer && !isAlltime) {
            sectionsToShow = [sections.playerSeason];
            document.body.classList.add('player-season');
            // Update season player stats
            updateSeasonPlayerStats();
        } else {
            sectionsToShow = [sections.playerAlltime];
            document.body.classList.add('player-alltime');
            // Update all-time player stats
            updateAllTimePlayerStats();
        }

        // Show sections
        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
            }
        });

        // Force reanimation for page-hero h1
        const pageHeroH1 = document.querySelector('.page-hero h1');
        if (pageHeroH1) {
            pageHeroH1.classList.remove('animate-in');
            setTimeout(() => {
                pageHeroH1.classList.add('animate-in');
            }, 100);
        }

        // Re-observe elements for animation
        animateOnScroll(animationElements);
    };

    // Add click event listeners to labels
    labels.team?.addEventListener('click', () => {
        if (toggles.teamPlayer.checked) {
            toggles.teamPlayer.checked = false;
            toggles.teamPlayer.dispatchEvent(new Event('change'));
        }
    });

    labels.player?.addEventListener('click', () => {
        if (!toggles.teamPlayer.checked) {
            toggles.teamPlayer.checked = true;
            toggles.teamPlayer.dispatchEvent(new Event('change'));
        }
    });

    labels.season?.addEventListener('click', () => {
        if (toggles.seasonAlltime.checked) {
            toggles.seasonAlltime.checked = false;
            toggles.seasonAlltime.dispatchEvent(new Event('change'));
        }
    });

    labels.alltime?.addEventListener('click', () => {
        if (!toggles.seasonAlltime.checked) {
            toggles.seasonAlltime.checked = true;
            toggles.seasonAlltime.dispatchEvent(new Event('change'));
        }
    });

    // Initial view setup
    updateView();
    toggles.teamPlayer?.addEventListener('change', updateView);
    toggles.seasonAlltime?.addEventListener('change', updateView);
}