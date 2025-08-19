// statistics.js
import { animateOnScroll } from './general.js';

// Season player data (2024-2025, 35 players)
const seasonPlayers = [
    { name: "Romelu Lukaku", position: "attacker", goals: 23, matches: 25 },
    { name: "Kevin De Bruyne", position: "midfielder", goals: 12, matches: 26 },
    { name: "Jeremy Doku", position: "attacker", goals: 8, matches: 24 },
    { name: "Youri Tielemans", position: "midfielder", goals: 6, matches: 23 },
    { name: "Axel Witsel", position: "defender", goals: 3, matches: 27 },
    { name: "Thibaut Courtois", position: "goalkeeper", goals: 0, matches: 28 },
    { name: "Eden Hazard", position: "attacker", goals: 7, matches: 22 },
    { name: "Dries Mertens", position: "attacker", goals: 6, matches: 20 },
    { name: "Toby Alderweireld", position: "defender", goals: 2, matches: 26 },
    { name: "Thomas Vermaelen", position: "defender", goals: 1, matches: 24 },
    { name: "Christian Benteke", position: "attacker", goals: 5, matches: 21 },
    { name: "Yannick Carrasco", position: "midfielder", goals: 4, matches: 23 },
    { name: "Radja Nainggolan", position: "midfielder", goals: 3, matches: 22 },
    { name: "Marouane Fellaini", position: "midfielder", goals: 2, matches: 20 },
    { name: "Simon Mignolet", position: "goalkeeper", goals: 0, matches: 25 },
    { name: "Mousa Dembele", position: "midfielder", goals: 2, matches: 24 },
    { name: "Nacer Chadli", position: "midfielder", goals: 3, matches: 22 },
    { name: "Divock Origi", position: "attacker", goals: 4, matches: 19 },
    { name: "Leander Dendoncker", position: "midfielder", goals: 2, matches: 23 },
    { name: "Michy Batshuayi", position: "attacker", goals: 5, matches: 20 },
    { name: "Thomas Meunier", position: "defender", goals: 1, matches: 25 },
    { name: "Adnan Januzaj", position: "attacker", goals: 3, matches: 21 },
    { name: "Steven Defour", position: "midfielder", goals: 1, matches: 22 },
    { name: "Laurent Ciman", position: "defender", goals: 1, matches: 23 },
    { name: "Dennis Praet", position: "midfielder", goals: 2, matches: 20 },
    { name: "Timothy Castagne", position: "defender", goals: 1, matches: 24 },
    { name: "Hans Vanaken", position: "midfielder", goals: 3, matches: 22 },
    { name: "Leandro Trossard", position: "attacker", goals: 4, matches: 21 },
    { name: "Jason Denayer", position: "defender", goals: 0, matches: 22 },
    { name: "Matz Sels", position: "goalkeeper", goals: 0, matches: 20 },
    { name: "Charles De Ketelaere", position: "midfielder", goals: 3, matches: 19 },
    { name: "Amadou Onana", position: "midfielder", goals: 1, matches: 21 },
    { name: "Lois Openda", position: "attacker", goals: 5, matches: 18 },
    { name: "Johan Bakayoko", position: "attacker", goals: 3, matches: 20 },
    { name: "Wout Faes", position: "defender", goals: 1, matches: 23 }
];

// All-time player data (unchanged from previous)
const allTimePlayers = [
    { name: "Marc Degryse", position: "attacker", goals: 127, matches: 320, period: "2009-2018" },
    { name: "Luc Nilis", position: "attacker", goals: 98, matches: 280, period: "2010-2019" },
    { name: "Gert Verheyen", position: "attacker", goals: 87, matches: 300, period: "2015-2023" },
    { name: "Wesley Sonck", position: "attacker", goals: 73, matches: 260, period: "2012-2020" },
    { name: "Jan Ceulemans", position: "midfielder", goals: 69, matches: 290, period: "2011-2018" },
    { name: "Daniel Van Buyten", position: "defender", goals: 54, matches: 310, period: "2013-2021" },
    { name: "Franky Van der Elst", position: "midfielder", goals: 45, matches: 340, period: "2014-2022" },
    { name: "Kevin De Bruyne", position: "midfielder", goals: 42, matches: 200, period: "2018-2025" },
    { name: "Romelu Lukaku", position: "attacker", goals: 40, matches: 180, period: "2019-2025" },
    { name: "Eden Hazard", position: "attacker", goals: 38, matches: 220, period: "2017-2023" },
    { name: "Thibaut Courtois", position: "goalkeeper", goals: 0, matches: 350, period: "2015-2025" },
    { name: "Axel Witsel", position: "defender", goals: 15, matches: 300, period: "2016-2025" },
    { name: "Jeremy Doku", position: "attacker", goals: 35, matches: 190, period: "2020-2025" },
    { name: "Youri Tielemans", position: "midfielder", goals: 30, matches: 210, period: "2019-2025" },
    { name: "Vincent Kompany", position: "defender", goals: 20, matches: 280, period: "2014-2022" },
    { name: "Dries Mertens", position: "attacker", goals: 36, matches: 230, period: "2018-2024" },
    { name: "Toby Alderweireld", position: "defender", goals: 18, matches: 290, period: "2016-2024" },
    { name: "Thomas Vermaelen", position: "defender", goals: 12, matches: 260, period: "2015-2023" },
    { name: "Christian Benteke", position: "attacker", goals: 33, matches: 200, period: "2018-2024" },
    { name: "Yannick Carrasco", position: "midfielder", goals: 25, matches: 220, period: "2019-2025" },
    { name: "Radja Nainggolan", position: "midfielder", goals: 28, matches: 240, period: "2017-2023" },
    { name: "Marouane Fellaini", position: "midfielder", goals: 22, matches: 250, period: "2016-2022" },
    { name: "Simon Mignolet", position: "goalkeeper", goals: 0, matches: 300, period: "2015-2023" },
    { name: "Mousa Dembele", position: "midfielder", goals: 15, matches: 270, period: "2016-2022" },
    { name: "Nacer Chadli", position: "midfielder", goals: 20, matches: 200, period: "2018-2024" },
    { name: "Divock Origi", position: "attacker", goals: 30, matches: 180, period: "2019-2025" },
    { name: "Leander Dendoncker", position: "midfielder", goals: 18, matches: 230, period: "2018-2024" },
    { name: "Michy Batshuayi", position: "attacker", goals: 28, matches: 190, period: "2019-2025" },
    { name: "Thomas Meunier", position: "defender", goals: 10, matches: 260, period: "2017-2023" },
    { name: "Adnan Januzaj", position: "attacker", goals: 22, matches: 200, period: "2018-2024" },
    { name: "Steven Defour", position: "midfielder", goals: 15, matches: 220, period: "2016-2022" },
    { name: "Laurent Ciman", position: "defender", goals: 8, matches: 250, period: "2015-2021" },
    { name: "Dennis Praet", position: "midfielder", goals: 12, matches: 200, period: "2019-2025" },
    { name: "Timothy Castagne", position: "defender", goals: 10, matches: 210, period: "2019-2025" },
    { name: "Hans Vanaken", position: "midfielder", goals: 25, matches: 230, period: "2018-2025" }
];

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
    updateSeasonPlayerStats();
    updateAllTimePlayerStats();
}

// Update season player stats display
function updateSeasonPlayerStats(sortBy = document.querySelector('#season-sort .selected')?.dataset.value || 'goals') {
    const playerStatsList = document.querySelector('.player-stats-list');

    // Sort players
    const sortedPlayers = [...seasonPlayers].sort((a, b) => {
        if (sortBy === 'goals') {
            return b.goals - a.goals || (b.goals / b.matches) - (a.goals / a.matches);
        } else if (sortBy === 'matches') {
            return b.matches - a.matches || (b.goals / b.matches) - (a.goals / a.matches);
        } else {
            return (b.goals / b.matches) - (a.goals / a.matches) || b.goals - a.goals;
        }
    });

    // Clear existing content
    playerStatsList.innerHTML = '';

    // Render sorted players
    sortedPlayers.forEach((player, index) => {
        const avgGoals = (player.goals / player.matches).toFixed(2);
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
        if (sortBy === 'goals') {
            return b.goals - a.goals || (b.goals / b.matches) - (a.goals / a.matches);
        } else if (sortBy === 'matches') {
            return b.matches - a.matches || (b.goals / b.matches) - (a.goals / a.matches);
        } else {
            return (b.goals / b.matches) - (a.goals / a.matches) || b.goals - a.goals;
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
            sectionsToShow = [sections.teamAlltime];
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