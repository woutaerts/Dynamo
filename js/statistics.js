import { animateOnScroll } from './utils/animations.js';
import { positionIcons, positionDisplayMap } from './utils/helpers.js';
import { fetchTeamSeasonStats, fetchTeamAllTimeStats, fetchSeasonRecords, fetchSeasonPlayers, fetchAllTimePlayers} from './utils/dataService.js';

// Variables
let seasonPlayers = [];
let allTimePlayers = [];
let teamSeasonStats = {};
let teamAllTimeStats = {};
let seasonRecords = {};
let isLoading = false;



// Function to update team season stats display
function updateTeamSeasonStats() {
    document.getElementById('team-matches-played').textContent = teamSeasonStats.matchesPlayed || 0;
    document.getElementById('team-wins').textContent = teamSeasonStats.wins || 0;
    document.getElementById('team-draws').textContent = teamSeasonStats.draws || 0;
    document.getElementById('team-losses').textContent = teamSeasonStats.losses || 0;
    document.getElementById('team-goals-scored').textContent = teamSeasonStats.goalsScored || 0;
    document.getElementById('team-goals-conceded').textContent = teamSeasonStats.goalsConceded || 0;

    document.getElementById('team-goals-scored-detailed').textContent = teamSeasonStats.goalsScored || 0;
    document.getElementById('team-goals-per-match').textContent = (teamSeasonStats.goalsPerMatch || 0).toFixed(2);
    document.getElementById('team-largest-win').textContent = teamSeasonStats.largestWinScore || '0-0';

    document.getElementById('team-goals-conceded-detailed').textContent = teamSeasonStats.goalsConceded || 0;
    document.getElementById('team-goals-conceded-per-match').textContent = (teamSeasonStats.goalsConcededPerMatch || 0).toFixed(2);
    document.getElementById('team-clean-sheets').textContent = teamSeasonStats.cleanSheets || 0;

    const goalDiff = teamSeasonStats.goalDifference || 0;
    document.getElementById('team-goal-difference').textContent = goalDiff >= 0 ? `+${goalDiff}` : goalDiff;
    document.getElementById('team-win-rate').textContent = `${(teamSeasonStats.winRate || 0).toFixed(0)}%`;
    document.getElementById('team-points').textContent = teamSeasonStats.points || 0;

    animateOnScroll([
        { selector: '.stat-card', containerSelector: 'section' },
        { selector: '.stat-category', containerSelector: 'section' }
    ]);
}

// Function to update team all-time stats display
function updateTeamAllTimeStats() {
    document.getElementById('team-alltime-matches-played').textContent = teamAllTimeStats.matchesPlayed || 0;
    document.getElementById('team-alltime-wins').textContent = teamAllTimeStats.wins || 0;
    document.getElementById('team-alltime-draws').textContent = teamAllTimeStats.draws || 0;
    document.getElementById('team-alltime-losses').textContent = teamAllTimeStats.losses || 0;
    document.getElementById('team-alltime-goals-scored').textContent = teamAllTimeStats.goalsScored || 0;
    document.getElementById('team-alltime-goals-conceded').textContent = teamAllTimeStats.goalsConceded || 0;

    document.getElementById('alltime-most-wins').innerHTML = `${seasonRecords.mostWins.value} <small>(${seasonRecords.mostWins.season})</small>`;
    document.getElementById('alltime-most-goals').innerHTML = `${seasonRecords.mostGoals.value} <small>(${seasonRecords.mostGoals.season})</small>`;
    document.getElementById('alltime-best-goal-difference').innerHTML = `${seasonRecords.bestGoalDifference.value >= 0 ? '+' : ''}${seasonRecords.bestGoalDifference.value} <small>(${seasonRecords.bestGoalDifference.season})</small>`;
    document.getElementById('alltime-most-clean-sheets').innerHTML = `${seasonRecords.mostCleanSheets.value} <small>(${seasonRecords.mostCleanSheets.season})</small>`;

    document.getElementById('alltime-longest-win-streak').textContent = teamAllTimeStats.longestWinStreak || 0;
    document.getElementById('alltime-longest-unbeaten').textContent = teamAllTimeStats.longestUnbeatenRun || 0;
    document.getElementById('alltime-total-matches').textContent = teamAllTimeStats.matchesPlayed || 0;
    document.getElementById('alltime-different-goalscorers').textContent = teamAllTimeStats.differentGoalscorers || 0;

    animateOnScroll([
        { selector: '.stat-card', containerSelector: 'section' },
        { selector: '.record-category', containerSelector: 'section' }
    ]);
}

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

    // Observe static elements (Hero, Titles, and the Toggle Container)
    const staticElements = animationElements.filter(el =>
        !['.player-row', '.scorer-row'].includes(el.selector)
    );
    animateOnScroll(staticElements);

    // Initialize the specialized observer for dynamic table rows
    initRowObserver();
});

// Initialize player stats and team stats
async function initPlayerStats() {
    isLoading = true;
    const teamPlayerToggle = document.getElementById('team-player-toggle');
    const seasonAlltimeToggle = document.getElementById('season-alltime-toggle');
    [teamPlayerToggle, seasonAlltimeToggle].forEach(t => t && (t.disabled = true));
    document.querySelectorAll('.toggle-label').forEach(l => l.style.pointerEvents = 'none');

    const uiGroups = [
        {
            l: document.getElementById('team-season-loading'),
            e: document.getElementById('team-season-error'),
            c: document.getElementById('team-season-grid')
        },
        {
            l: document.getElementById('team-season-detailed-loading'),
            e: document.getElementById('team-season-detailed-error'),
            c: document.getElementById('team-season-detailed-stats')
        },
        {
            l: document.getElementById('team-alltime-performance-loading'),
            e: document.getElementById('team-alltime-performance-error'),
            c: document.getElementById('team-alltime-performance-grid')
        },
        {
            l: document.getElementById('team-alltime-loading'),
            e: document.getElementById('team-alltime-error'),
            c: document.getElementById('team-alltime-records')
        },
        {
            l: document.getElementById('player-season-loading'),
            e: document.getElementById('player-season-error'),
            c: document.getElementById('player-season-content')
        },
        {
            l: document.getElementById('player-alltime-loading'),
            e: document.getElementById('player-alltime-error'),
            c: document.getElementById('player-alltime-content')
        }
    ];
    uiGroups.forEach(group => setElementState(group.l, group.e, group.c, 'loading'));

    try {
        // Fetch everything via the data service in parallel!
        const [seasonStats, allTimeStats, records, sPlayers, aPlayers] = await Promise.all([
            fetchTeamSeasonStats(),
            fetchTeamAllTimeStats(),
            fetchSeasonRecords(),
            fetchSeasonPlayers(),
            fetchAllTimePlayers()
        ]);

        // Assign the returned data to your global variables
        teamSeasonStats = seasonStats;
        teamAllTimeStats = allTimeStats;
        seasonRecords = records;
        seasonPlayers = sPlayers;
        allTimePlayers = aPlayers;

        updateTeamSeasonStats();
        updateTeamAllTimeStats();
        updateSeasonPlayerStats();
        updateAllTimePlayerStats();

        uiGroups.forEach(group => setElementState(group.l, group.e, group.c, 'success'));
    } catch (error) {
        console.error('Error initializing player stats:', error);
        uiGroups.forEach(group => setElementState(group.l, group.e, group.c, 'error'));
    } finally {
        isLoading = false;
        if (teamPlayerToggle) teamPlayerToggle.disabled = false;
        if (seasonAlltimeToggle) seasonAlltimeToggle.disabled = false;
        document.querySelectorAll('.toggle-label').forEach(label => label.style.pointerEvents = '');
    }
}

/**
 * Shared sorting logic for player arrays
 */
function sortPlayers(players, sortBy) {
    return [...players].sort((a, b) => {
        const aRatio = a.matches === 0 ? 0 : a.goals / a.matches;
        const bRatio = b.matches === 0 ? 0 : b.goals / b.matches;

        if (sortBy === 'goals') {
            if (a.goals !== b.goals) return b.goals - a.goals;
            if (aRatio !== bRatio) return bRatio - aRatio;
            return a.matches !== b.matches ? b.matches - a.matches : a.name.localeCompare(b.name);
        } else if (sortBy === 'matches') {
            if (a.matches !== b.matches) return b.matches - a.matches;
            if (a.goals !== b.goals) return b.goals - a.goals;
            return aRatio !== bRatio ? bRatio - aRatio : a.name.localeCompare(b.name);
        } else {
            if (aRatio !== bRatio) return bRatio - aRatio;
            if (a.goals !== b.goals) return b.goals - a.goals;
            return a.matches !== b.matches ? b.matches - a.matches : a.name.localeCompare(b.name);
        }
    });
}

/**
 * Shared renderer for player tables
 */
function renderPlayerTable(players, listSelector, rowClass, sortBy) {
    const list = document.querySelector(listSelector);
    if (!list) return;

    // COMPUTE ONCE: 'player-row' becomes 'player', 'scorer-row' becomes 'scorer'
    const prefix = rowClass.split('-')[0];

    const sortedPlayers = sortPlayers(players, sortBy);
    list.innerHTML = '';

    sortedPlayers.forEach((player, index) => {
        const avgGoals = player.matches === 0 ? '0.00' : (player.goals / player.matches).toFixed(2);
        const row = document.createElement('div');
        row.className = rowClass;

        // Use the cached 'prefix' variable for all cell classes
        row.innerHTML = `
            <div class="table-cell ${prefix}-rank">${index + 1}</div>
            <div class="table-cell ${prefix}-position" data-position="${positionDisplayMap[player.position]}">
                ${positionIcons[player.position]}
                <span class="tooltip">${positionDisplayMap[player.position]}</span>
            </div>
            <div class="table-cell ${prefix}-name">${player.name}</div>
            <div class="table-cell ${prefix}-goals">${player.goals}</div>
            <div class="table-cell ${prefix}-matches">${player.matches}</div>
            <div class="table-cell ${prefix}-avg-goals">${avgGoals}</div>
        `;
        list.appendChild(row);
    });
}

// Update season player stats display
function updateSeasonPlayerStats(sortBy = document.querySelector('#season-sort .selected')?.dataset.value || 'goals') {
    renderPlayerTable(seasonPlayers, '.player-stats-list', 'player-row', sortBy);
}

// Update all-time player stats display
function updateAllTimePlayerStats(sortBy = document.querySelector('#alltime-sort .selected')?.dataset.value || 'goals') {
    renderPlayerTable(allTimePlayers, '.top-scorers-list', 'scorer-row', sortBy);
}

// Custom dropdown initializer
function initCustomDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const selected = dropdown.querySelector('.selected');
        const options = dropdown.querySelector('.options');
        selected.addEventListener('click', () => {
            dropdown.classList.toggle('active');
            options.style.display = options.style.display === 'block' ? 'none' : 'block';
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
                dropdown.classList.remove('active');
                options.style.display = 'none';
                if (dropdown.id === 'season-sort') {
                    updateSeasonPlayerStats(selected.dataset.value);
                } else if (dropdown.id === 'alltime-sort') {
                    updateAllTimePlayerStats(selected.dataset.value);
                }
            });
        });
    });
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
        case 'goals': return 'Totaal Doelpunten';
        case 'matches': return 'Gespeelde Wedstrijden';
        case 'avg-goals': return 'Gemiddelde Doelpunten per Wedstrijd';
        default: return '';
    }
}

// Debounce function to limit toggle frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Manages visibility for loading, error, and content element groups
 * @param {HTMLElement} loading - The loading spinner/text element
 * @param {HTMLElement} error - The error message element
 * @param {HTMLElement} content - The main data container
 * @param {string} state - 'loading' | 'success' | 'error'
 */
function setElementState(loading, error, content, state) {
    if (!loading || !error || !content) return;

    loading.classList.toggle('hidden', state !== 'loading');
    error.classList.toggle('hidden', state !== 'error');
    content.classList.toggle('hidden', state !== 'success');
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

    const updateView = debounce(() => {
        if (isLoading) return;

        const isPlayer = toggles.teamPlayer?.checked;
        const isAlltime = toggles.seasonAlltime?.checked;
        labels.team?.classList.toggle('active', !isPlayer);
        labels.player?.classList.toggle('active', isPlayer);
        labels.season?.classList.toggle('active', !isAlltime);
        labels.alltime?.classList.toggle('active', isAlltime);

        // Hide all sections
        Object.values(sections).forEach(section => section?.classList.add('hidden'));
        document.body.classList.remove('team-season', 'team-alltime', 'player-season', 'player-alltime');

        // Reset animations
        document.querySelectorAll('.section-title, .section-subtitle, .stat-card, .record-category').forEach(el => {
            el.classList.remove('animate-in');
        });

        let sectionsToShow;
        if (!isPlayer && !isAlltime) {
            sectionsToShow = [sections.teamSeason, sections.teamSeasonDetailed];
            document.body.classList.add('team-season');
            updateTeamSeasonStats();
        } else if (!isPlayer && isAlltime) {
            sectionsToShow = [sections.teamAlltimePerformance, sections.teamAlltime];
            document.body.classList.add('team-alltime');
            updateTeamAllTimeStats();
        } else if (isPlayer && !isAlltime) {
            sectionsToShow = [sections.playerSeason];
            document.body.classList.add('player-season');
            updateSeasonPlayerStats();
        } else {
            sectionsToShow = [sections.playerAlltime];
            document.body.classList.add('player-alltime');
            updateAllTimePlayerStats();
        }

        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
            }
        });

        // Re-trigger the animation observer for the newly visible section titles/cards
        animateOnScroll(animationElements.filter(el =>
            ['.section-title', '.section-subtitle', '.stat-card', '.record-category'].includes(el.selector)
        ));

        const pageHeroH1 = document.querySelector('.page-hero h1');
        if (pageHeroH1) {
            pageHeroH1.classList.remove('animate-in');
            setTimeout(() => {
                pageHeroH1.classList.add('animate-in');
            }, 100);
        }
    }, 300);

    // Helper to safely toggle via label
    const createLabelHandler = (toggle, desiredState) => {
        return () => {
            if (isLoading) return;
            if (toggle.checked !== desiredState) {
                toggle.checked = desiredState;
                toggle.dispatchEvent(new Event('change'));
            }
        };
    };

    // Attach label handlers with loading guard
    labels.team?.addEventListener('click', createLabelHandler(toggles.teamPlayer, false));
    labels.player?.addEventListener('click', createLabelHandler(toggles.teamPlayer, true));
    labels.season?.addEventListener('click', createLabelHandler(toggles.seasonAlltime, false));
    labels.alltime?.addEventListener('click', createLabelHandler(toggles.seasonAlltime, true));

    // Initial view
    updateView();
    toggles.teamPlayer?.addEventListener('change', updateView);
    toggles.seasonAlltime?.addEventListener('change', updateView);
}

/**
 * Creates one single observer for dynamic table rows
 */
function initRowObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Stop watching once animated
            }
        });
    }, { threshold: 0.1 });

    // We watch the parent containers. When content changes,
    // we observe the new children.
    const config = { childList: true };
    const tables = ['.player-stats-list', '.top-scorers-list'];

    tables.forEach(selector => {
        const container = document.querySelector(selector);
        if (!container) return;

        // Watch for new rows being added via re-sort or view change
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) observer.observe(node);
                });
            });
        });

        mutationObserver.observe(container, config);
    });
}