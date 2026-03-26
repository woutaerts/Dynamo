/**
 * archive.js — Archive page
 *
 * Changes:
 *   - `col`                         → `colIndex`  (more descriptive: converts col letter to index)
 *   - `cell`                        → `cellText`  (returns text content of a cell)
 *   - `intCell`                     → `cellInt`   (returns integer value of a cell)
 *   - `initArchiveDropdown`         → `initSeasonDropdown`
 *   - `initArchivePlayerSort`       → `initPlayerSortDropdown`
 *   - `initGlobalDropdownCloser`    → `bindDropdownClose`
 *   - `initArchiveSortableHeaders`  → `initSortHeaders`
 *   - `setupArchiveMatchInteractions` → `bindArchiveMatchClicks`
 *   - `FootballLoader.init`         → `FootballLoader.show` (loader rename)
 *   - Updated imports for renamed helpers
 */
import { animateOnScroll } from './utils/animations.js';
import { LineGraph } from './components/lineGraph.js';
import { Papa, SHEET_URLS } from './utils/dataService.js';
import { fetchCsvCached } from './utils/fetchCsv.js';
import { FootballLoader } from './components/loader.js';
import {
    PLAYER_TABLE_HEADER_HTML,
    POSITION_ICON_MAP,
    POSITION_LABEL_MAP,
    POSITION_CODE_MAP,
    MONTH_EN_TO_NL,
    parseGoalscorers,
    parseDate,
    resetTableState,
    sliceForTable,
    appendTableToggle
} from './utils/helpers.js';

// ── Animation Registry ────────────────────────────────────────────────────────

const animationElements = [
    { selector: '.page-hero h1',                          containerSelector: 'section' },
    { selector: '.section-title',                         containerSelector: 'section' },
    { selector: '.picker-section .season-picker',         containerSelector: 'section' }
];

// ── Season Configuration ──────────────────────────────────────────────────────

const SEASON_CONFIG = {
    '2025-2026': {
        label: '2025-2026', url: SHEET_URLS.currentSeason,
        matchCols:  { first: colIndex('F'), last: colIndex('AA') },
        matchRows:  { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 74, goalsAgainst: 75, goalscorers: 77 },
        playerRows: { first: 4, last: 51 },
        playerCols: { name: colIndex('B'), position: colIndex('D'), goals: colIndex('AD'), matches: colIndex('AE') },
        statsCell:  { played: [77, colIndex('AE')], wins: [75, colIndex('AG')], draws: [76, colIndex('AG')], losses: [77, colIndex('AG')], goalsFor: [74, colIndex('AE')], goalsAgainst: [75, colIndex('AE')] },
    },
    '2024-2025': {
        label: '2024-2025', url: SHEET_URLS.season2425,
        matchCols:  { first: colIndex('F'), last: colIndex('AA') },
        matchRows:  { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 75, goalsAgainst: 76, goalscorers: 78 },
        playerRows: { first: 7, last: 51 },
        playerCols: { name: colIndex('B'), position: colIndex('D'), goals: colIndex('AD'), matches: colIndex('AE') },
        statsCell:  { played: [78, colIndex('AE')], wins: [76, colIndex('AG')], draws: [77, colIndex('AG')], losses: [78, colIndex('AG')], goalsFor: [75, colIndex('AE')], goalsAgainst: [76, colIndex('AE')] },
    },
    '2023-2024': {
        label: '2023-2024', url: SHEET_URLS.season2324,
        matchCols:  { first: colIndex('F'), last: colIndex('Z') },
        matchRows:  { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 64, goalsAgainst: 65, goalscorers: 67 },
        playerRows: { first: 7, last: 50 },
        playerCols: { name: colIndex('B'), position: colIndex('D'), goals: colIndex('AC'), matches: colIndex('AD') },
        statsCell:  { played: [67, colIndex('AD')], wins: [65, colIndex('AF')], draws: [66, colIndex('AF')], losses: [67, colIndex('AF')], goalsFor: [64, colIndex('AD')], goalsAgainst: [65, colIndex('AD')] },
    },
    '2022-2023': {
        label: '2022-2023', url: SHEET_URLS.season2223,
        matchCols:  { first: colIndex('F'), last: colIndex('W') },
        matchRows:  { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 73, goalsAgainst: 74, goalscorers: 76 },
        playerRows: { first: 7, last: 52 },
        playerCols: { name: colIndex('B'), position: colIndex('D'), goals: colIndex('Z'), matches: colIndex('AA') },
        statsCell:  { played: [76, colIndex('AA')], wins: [74, colIndex('AC')], draws: [75, colIndex('AC')], losses: [76, colIndex('AC')], goalsFor: [73, colIndex('AA')], goalsAgainst: [74, colIndex('AA')] },
    },
    '2021-2022': {
        label: '2021-2022', url: SHEET_URLS.season2122,
        matchCols:  { first: colIndex('F'), last: colIndex('X') },
        matchRows:  { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 56, goalsAgainst: 57, goalscorers: 59 },
        playerRows: { first: 7, last: 47 },
        playerCols: { name: colIndex('B'), position: colIndex('D'), goals: colIndex('AA'), matches: colIndex('AB') },
        statsCell:  { played: [59, colIndex('AB')], wins: [57, colIndex('AD')], draws: [58, colIndex('AD')], losses: [59, colIndex('AD')], goalsFor: [56, colIndex('AB')], goalsAgainst: [57, colIndex('AB')] },
    },
};

// ── Module State ──────────────────────────────────────────────────────────────

let archivePlayers = [];
let archiveMatches = [];

// ── Tooltip Template ──────────────────────────────────────────────────────────

const getTooltipHTML = (d) => `
    <div class="archive-graph-tooltip">
        <h4 class="archive-graph-tooltip-title">${d.matches}</h4>
        <div class="archive-graph-tooltip-row">
            <span class="archive-graph-tooltip-icon win"><i class="fas fa-check"></i></span>
            <span class="archive-graph-tooltip-value">${d.winst}</span>
        </div>
        <div class="archive-graph-tooltip-row">
            <span class="archive-graph-tooltip-icon draw"><i class="fas fa-minus"></i></span>
            <span class="archive-graph-tooltip-value">${d.gelijk}</span>
        </div>
        <div class="archive-graph-tooltip-row">
            <span class="archive-graph-tooltip-icon loss"><i class="fas fa-times"></i></span>
            <span class="archive-graph-tooltip-value">${d.verlies}</span>
        </div>
    </div>
`;

// ── Page Initialization ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initSeasonDropdown();
    initPlayerSortDropdown();
    bindDropdownClose();
    initSortHeaders();
    initMatchSortDropdown();
    animateOnScroll(animationElements);
    const initialSeason = document.querySelector('#season-select .selected').dataset.value;
    loadSeason(initialSeason);
});

// ── Season Loading ────────────────────────────────────────────────────────────

async function loadSeason(seasonString) {
    const loadingId      = 'archive-loading';
    const errorId        = 'archive-error';
    const loadingEl      = document.getElementById(loadingId);
    const contentEl      = document.getElementById('archive-content');
    const errorEl        = document.getElementById(errorId);
    const titleEl        = document.getElementById('archive-season-title');
    const comparisonView = document.getElementById('archive-comparison-view');
    const seasonView     = document.getElementById('archive-season-view');

    titleEl.textContent = seasonString === 'Vergelijking'
        ? 'Seizoenen Vergelijken'
        : `Overzicht ${seasonString}`;
    titleEl.classList.remove('animate-in');

    contentEl.style.display = 'none';
    errorEl.classList.add('hidden');

    if (loadingEl) {
        loadingEl.classList.remove('hidden');
        FootballLoader.show(loadingId, 'Gegevens worden geladen...');
    }

    try {
        if (seasonString === 'Vergelijking') {
            seasonView.classList.add('hidden');
            comparisonView.classList.remove('hidden');

            const allData = await fetchAllSeasonsData();
            loadingEl?.classList.add('hidden');
            contentEl.style.display = 'block';

            const graphConfigs = [
                {
                    id: '#matches-graph', title: 'Aantal gespeelde wedstrijden',
                    color: '#7B96B7', dotColor: '#3D5A80', hideLine: true,
                    mapFn: d => ({
                        label: d.seasonLabel, value: d.matches, tooltipHTML: getTooltipHTML(d),
                        stacked: [
                            { value: d.winst,   color: '#648F5F' },
                            { value: d.gelijk,  color: '#E8B04B' },
                            { value: d.verlies, color: '#E07A5F' }
                        ]
                    })
                },
                { id: '#total-voor-graph',  title: 'Aantal gescoorde doelpunten',                        color: '#84B281', dotColor: '#648F5F', mapFn: d => ({ label: d.seasonLabel, value: d.totalVoor  }) },
                { id: '#total-tegen-graph', title: 'Aantal tegendoelpunten',                              color: '#E07A5F', dotColor: '#B90A0A', mapFn: d => ({ label: d.seasonLabel, value: d.totalTegen }) },
                { id: '#avg-voor-graph',    title: 'Gemiddeld aantal gescoorde doelpunten per wedstrijd', color: '#84B281', dotColor: '#648F5F', mapFn: d => ({ label: d.seasonLabel, value: d.avgVoor    }) },
                { id: '#avg-tegen-graph',   title: 'Gemiddeld aantal tegendoelpunten per wedstrijd',     color: '#E07A5F', dotColor: '#B90A0A', mapFn: d => ({ label: d.seasonLabel, value: d.avgTegen   }) }
            ];

            graphConfigs.forEach(({ id, title, color, dotColor, hideLine, mapFn }) => {
                const el = document.querySelector(id);
                if (el) {
                    el.innerHTML = '';
                    new LineGraph(id, {
                        title, color, dotColor,
                        hideLineAndDots: hideLine || false,
                        data: allData.map(mapFn)
                    });
                }
            });
        } else {
            comparisonView.classList.add('hidden');
            seasonView.classList.remove('hidden');
            loadingEl?.classList.add('hidden');
            contentEl.style.display = 'block';
            await loadSeasonData(seasonString);
        }

        setTimeout(() => titleEl.classList.add('animate-in'), 100);
    } catch (err) {
        console.error('Error loading data:', err);
        if (loadingEl) loadingEl.classList.add('hidden');
        FootballLoader.showError(errorId, 'Gegevens konden niet worden geladen. Probeer opnieuw.');
    }
}

async function loadSeasonData(seasonString) {
    const config       = SEASON_CONFIG[seasonString];
    const innerLoadId  = 'archive-season-loader';
    const innerErrorId = 'archive-season-error';
    const innerLoader  = document.getElementById(innerLoadId);
    const innerContent = document.getElementById('archive-season-content');

    if (innerLoader) {
        innerLoader.classList.remove('hidden');
        FootballLoader.show(innerLoadId, 'Seizoensgegevens worden geladen...');
    }

    document.getElementById(innerErrorId)?.classList.add('hidden');
    innerContent?.classList.add('hidden');

    const sortSel = document.querySelector('#archive-player-sort .selected');
    if (sortSel) { sortSel.textContent = 'Totaal Doelpunten'; sortSel.dataset.value = 'goals'; }

    const matchSortSel = document.querySelector('#archive-match-sort .selected');
    if (matchSortSel) {
        matchSortSel.innerHTML = 'Datum (oud <i class="fas fa-arrow-right-long"></i> nieuw)';
        matchSortSel.dataset.value = 'date-asc';
    }

    try {
        const csvText = await fetchCsvCached(config.url);
        const rows    = Papa.parse(csvText, { skipEmptyLines: false, delimiter: ',' }).data;

        const stats   = parseSeasonStats(rows, config);
        const players = parseSeasonPlayers(rows, config);
        const matches = parseSeasonMatches(rows, config, seasonString);

        renderSeasonStats(stats);
        archivePlayers = players;
        resetTableState('archive-players');
        renderArchivePlayers('goals');
        archiveMatches = matches;
        renderSortedMatches('date-asc');

        if (innerLoader)  innerLoader.classList.add('hidden');
        if (innerContent) innerContent.classList.remove('hidden');

        animateArchiveMatches();
        animateOnScroll([
            { selector: '.stat-card',                         containerSelector: 'section' },
            { selector: '.archive-player-row',                containerSelector: 'section' },
            { selector: '.archive-subsection .section-title', containerSelector: 'section' }
        ]);
    } catch (err) {
        console.error('Error loading season data:', err);
        if (innerLoader) innerLoader.classList.add('hidden');
        FootballLoader.showError(innerErrorId, 'Seizoensgegevens konden niet worden geladen. Probeer opnieuw.');
    }
}

// ── Data Fetching ─────────────────────────────────────────────────────────────

async function fetchAllSeasonsData() {
    const csvText = await fetchCsvCached(SHEET_URLS.seasonRecords);
    const rows    = Papa.parse(csvText, { skipEmptyLines: true, delimiter: ',' }).data;

    const cleanLabel = str => str ? str.replace(/[="]/g, '').trim() : '';
    const toDecimal  = (val, abs = false) => { let n = parseFloat(val); if (isNaN(n)) return 0; if (abs) n = Math.abs(n); return parseFloat(n.toFixed(2)); };
    const toInt      = (val, abs = false) => { let n = parseInt(val);   if (isNaN(n)) return 0; return abs ? Math.abs(n) : n; };

    return [3, 5, 7, 9, 11].map(rowIndex => {
        const row = rows[rowIndex];
        return {
            seasonLabel: cleanLabel(row[1]),
            matches:     toInt(row[2]),
            winst:       toInt(row[3]),
            gelijk:      toInt(row[4]),
            verlies:     toInt(row[5], true),
            totalVoor:   toInt(row[6]),
            totalTegen:  toInt(row[7], true),
            avgVoor:     toDecimal(row[11]),
            avgTegen:    toDecimal(row[12], true),
        };
    });
}

// ── Cell Helpers ──────────────────────────────────────────────────────────────

/** Converts a spreadsheet column letter (e.g. "AF") to a 0-based array index. */
function colIndex(letters) {
    letters = letters.toUpperCase();
    let n = 0;
    for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
}

/** Returns the trimmed string value of a cell, stripping quotes and `=` signs. */
function cellText(rows, rowIdx, colIdx) {
    return rows[rowIdx]?.[colIdx]?.toString().trim().replace(/^[="]+|["+$]/g, '') || '';
}

/** Returns the absolute integer value of a cell (defaults to 0). */
function cellInt(rows, rowIdx, colIdx) {
    return Math.abs(parseInt(cellText(rows, rowIdx, colIdx), 10)) || 0;
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseSeasonStats(rows, config) {
    const s = config.statsCell;
    return {
        matches:      cellInt(rows, s.played[0],      s.played[1]),
        wins:         cellInt(rows, s.wins[0],         s.wins[1]),
        draws:        cellInt(rows, s.draws[0],        s.draws[1]),
        losses:       cellInt(rows, s.losses[0],       s.losses[1]),
        goalsFor:     cellInt(rows, s.goalsFor[0],     s.goalsFor[1]),
        goalsAgainst: cellInt(rows, s.goalsAgainst[0], s.goalsAgainst[1]),
    };
}

function parseSeasonPlayers(rows, config) {
    const { first, last } = config.playerRows;
    const pc        = config.playerCols;
    const titleRows = ['keeper', 'verdedigers', 'middenvelders', 'aanvallers'];
    const players   = [];

    for (let r = first; r <= last; r++) {
        const name      = cellText(rows, r, pc.name);
        const posCode   = cellText(rows, r, pc.position);
        const goals     = parseInt(cellText(rows, r, pc.goals),   10);
        const matches   = parseInt(cellText(rows, r, pc.matches), 10);

        if (!name || titleRows.includes(name.toLowerCase())) continue;
        const position = POSITION_CODE_MAP[posCode];
        if (!position || isNaN(goals) || isNaN(matches)) continue;

        players.push({ name, position, goals, matches });
    }
    return players.sort((a, b) => b.goals - a.goals);
}

function parseSeasonMatches(rows, config, seasonString) {
    const mc          = config.matchCols;
    const mr          = config.matchRows;
    const seasonLabel = config.label || seasonString;
    const matches     = [];

    for (let c = mc.first; c <= mc.last; c++) {
        const opponent  = cellText(rows, mr.opponent,     c);
        const dateRaw   = cellText(rows, mr.date,         c);
        const time      = cellText(rows, mr.time,         c);
        const stadium   = cellText(rows, mr.stadium,      c);
        const homeAway  = cellText(rows, mr.homeAway,     c).toLowerCase();
        const gfRaw     = cellText(rows, mr.goalsFor,     c);
        const gaRaw     = cellText(rows, mr.goalsAgainst, c);
        const gsRaw     = cellText(rows, mr.goalscorers,  c);

        if (!opponent || !dateRaw) continue;

        const isHome     = homeAway === 'thuis';
        const dateParts  = dateRaw.split(' ');
        const day        = dateParts[0] || '';
        const monthEn    = (dateParts[1] || '').toLowerCase();
        const monthDutch = MONTH_EN_TO_NL[monthEn] || monthEn;
        const displayDate = `${day} ${monthDutch}`;
        const title      = isHome ? `Dynamo Beirs vs ${opponent}` : `${opponent} vs Dynamo Beirs`;

        const gf = parseInt(gfRaw, 10);
        const ga = parseInt(gaRaw, 10);
        if (isNaN(gf) || isNaN(ga)) continue;

        const score  = isHome ? `${gf}-${ga}` : `${ga}-${gf}`;
        const result = gf > ga ? 'winst' : gf < ga ? 'verlies' : 'gelijk';

        matches.push({
            title, displayDate, dateRaw, score, result, stadium, time,
            goalscorers: parseGoalscorers(gsRaw),
            season: seasonLabel,
            isHome
        });
    }

    return matches.sort((a, b) => parseDate(a.dateRaw) - parseDate(b.dateRaw));
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderSeasonStats(stats) {
    const map = {
        'arch-stat-matches':       stats.matches,
        'arch-stat-wins':          stats.wins,
        'arch-stat-draws':         stats.draws,
        'arch-stat-losses':        stats.losses,
        'arch-stat-goals-for':     stats.goalsFor,
        'arch-stat-goals-against': stats.goalsAgainst,
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
}

function renderArchivePlayers(sortBy = 'goals') {
    const tableContainer = document.querySelector('.player-stats-table');
    if (!tableContainer) return;

    const sorted = [...archivePlayers].sort((a, b) => {
        const aR = a.matches === 0 ? 0 : a.goals / a.matches;
        const bR = b.matches === 0 ? 0 : b.goals / b.matches;
        if (sortBy === 'goals')   return b.goals - a.goals || bR - aR || b.matches - a.matches;
        if (sortBy === 'matches') return b.matches - a.matches || b.goals - a.goals;
        return bR - aR || b.goals - a.goals;
    });

    tableContainer.innerHTML = `${PLAYER_TABLE_HEADER_HTML}<div id="archive-player-list"></div>`;
    const list = document.getElementById('archive-player-list');

    if (sorted.length === 0) {
        list.innerHTML = '<div class="archive-empty-msg">Geen data beschikbaar.</div>';
        return;
    }

    const visiblePlayers = sliceForTable(sorted, 'archive-players', 10);

    visiblePlayers.forEach((player, index) => {
        const avg = player.matches === 0 ? '0.00' : (player.goals / player.matches).toFixed(2);
        const row = document.createElement('div');
        row.className = 'player-row archive-player-row';
        row.innerHTML = `
            <div class="table-cell player-rank">${index + 1}</div>
            <div class="table-cell player-position">
                ${POSITION_ICON_MAP[player.position] || ''}
                <span class="tooltip">${POSITION_LABEL_MAP[player.position] || ''}</span>
            </div>
            <div class="table-cell player-name">${player.name}</div>
            <div class="table-cell player-goals">${player.goals}</div>
            <div class="table-cell player-matches">${player.matches}</div>
            <div class="table-cell player-avg-goals">${avg}</div>
        `;
        list.appendChild(row);
    });

    appendTableToggle(tableContainer, 'archive-players', sorted.length, 10, () => renderArchivePlayers(sortBy));
    initSortHeaders();
}

function renderSeasonMatches(matches) {
    const grid = document.getElementById('archive-matches-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (matches.length === 0) {
        grid.innerHTML = '<div class="archive-empty-msg">Geen wedstrijden beschikbaar voor dit seizoen.</div>';
        return;
    }

    matches.forEach(match => {
        const cls  = match.result === 'winst' ? 'win' : match.result === 'gelijk' ? 'draw' : 'loss';
        const icon = cls === 'win' ? 'check' : cls === 'draw' ? 'minus' : 'times';
        const parts    = match.title.split(' vs ');
        const homeTeam = parts[0] || match.title;
        const awayTeam = parts[1] || '';

        const card = document.createElement('div');
        card.className = 'match-card modern result archive-match-card';
        card.setAttribute('data-match-title',  match.title);
        card.setAttribute('data-venue',        match.stadium);
        card.setAttribute('data-score',        match.score);
        card.setAttribute('data-match-date',   match.dateRaw);
        card.setAttribute('data-match-time',   match.time);
        card.setAttribute('data-match-season', match.season);
        card.setAttribute('data-goalscorers',  JSON.stringify(match.goalscorers));
        card.setAttribute('data-result',       match.result);

        card.innerHTML = `
            <div class="result-icon ${cls}"><span><i class="fas fa-${icon}"></i></span></div>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${homeTeam}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${awayTeam}</div>
                </div>
                <div class="match-score">${match.score}</div>
                <div class="match-details">
                    <span class="match-date"><i class="fas fa-calendar"></i> ${match.displayDate}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ── Dropdowns ─────────────────────────────────────────────────────────────────

function initSeasonDropdown() {
    const dropdownEl = document.getElementById('season-select');
    if (!dropdownEl) return;
    const selected = dropdownEl.querySelector('.selected');
    const options  = dropdownEl.querySelector('.options');

    selected.addEventListener('click', e => {
        e.stopPropagation();
        dropdownEl.classList.toggle('active');
    });

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', e => {
            e.stopPropagation();
            selected.dataset.value = li.dataset.value;
            selected.textContent   = li.textContent;
            dropdownEl.classList.remove('active');
            loadSeason(li.dataset.value);
        });
    });
}

function initPlayerSortDropdown() {
    const dropdown = document.getElementById('archive-player-sort');
    if (!dropdown) return;
    const selected = dropdown.querySelector('.selected');
    const options  = dropdown.querySelector('.options');

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    options.querySelectorAll('li').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            selected.textContent   = opt.textContent;
            selected.dataset.value = opt.dataset.value;
            dropdown.classList.remove('active');
            options.style.display  = 'none';
            renderArchivePlayers(opt.dataset.value);
        });
    });
}

function bindDropdownClose() {
    document.addEventListener('click', e => {
        const seasonDropdown = document.getElementById('season-select');
        if (seasonDropdown && !seasonDropdown.contains(e.target)) {
            seasonDropdown.classList.remove('active');
        }

        const sortDropdown = document.getElementById('archive-player-sort');
        if (sortDropdown && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.remove('active');
            const options = sortDropdown.querySelector('.options');
            if (options) options.style.display = 'none';
        }

        const matchSortDropdown = document.getElementById('archive-match-sort');
        if (matchSortDropdown && !matchSortDropdown.contains(e.target)) {
            matchSortDropdown.classList.remove('active');
            const options = matchSortDropdown.querySelector('.options');
            if (options) options.style.display = 'none';
        }
    });
}

// ── Match Sorting & Dropdown ──────────────────────────────────────────────────

function renderSortedMatches(sortKey = 'date-asc') {
    const sorted = [...archiveMatches].sort((a, b) => {
        if (sortKey === 'date-desc') return parseDate(b.dateRaw) - parseDate(a.dateRaw);
        if (sortKey === 'date-asc')  return parseDate(a.dateRaw) - parseDate(b.dateRaw);

        const getMargin = (m, type) => {
            const [home, away] = m.score.split('-').map(Number);
            const us  = m.isHome ? home : away;
            const opp = m.isHome ? away : home;
            if (type === 'win')  return us > opp ? us - opp : us === opp ? -0.5 : -1000 - (opp - us);
            if (type === 'loss') return us < opp ? opp - us : us === opp ? -0.5 : -1000 - (us - opp);
        };

        if (sortKey === 'biggest-win')  return getMargin(b, 'win') - getMargin(a, 'win') || parseDate(b.dateRaw) - parseDate(a.dateRaw);
        if (sortKey === 'biggest-loss') return getMargin(b, 'loss') - getMargin(a, 'loss') || parseDate(b.dateRaw) - parseDate(a.dateRaw);

        return 0;
    });

    renderSeasonMatches(sorted);
    bindArchiveMatchClicks();

    // Only re-trigger the entrance animation if the section is already visible
    if (!document.getElementById('archive-season-content').classList.contains('hidden')) {
        animateArchiveMatches();
    }
}

function initMatchSortDropdown() {
    const dropdown = document.getElementById('archive-match-sort');
    if (!dropdown) return;
    const selected = dropdown.querySelector('.selected');
    const options  = dropdown.querySelector('.options');

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    options.querySelectorAll('li').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            selected.innerHTML     = opt.innerHTML; // Using innerHTML to preserve the font-awesome arrow
            selected.dataset.value = opt.dataset.value;
            dropdown.classList.remove('active');
            options.style.display  = 'none';
            renderSortedMatches(opt.dataset.value);
        });
    });
}

// ── Sortable Headers ──────────────────────────────────────────────────────────

function initSortHeaders() {
    document.querySelectorAll('#archive-players-section .table-header .table-cell').forEach((cell, index) => {
        const keyMap = { 3: 'goals', 4: 'matches', 5: 'avg-goals' };
        const lblMap = {
            3: 'Totaal Doelpunten',
            4: 'Gespeelde Wedstrijden',
            5: 'Gemiddelde Doelpunten per Wedstrijd'
        };
        const key = keyMap[index];
        if (!key) return;

        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
            const sortSel = document.querySelector('#archive-player-sort .selected');
            if (sortSel) { sortSel.dataset.value = key; sortSel.textContent = lblMap[index]; }
            renderArchivePlayers(key);
        });
    });
}

// ── Match Interactions ────────────────────────────────────────────────────────

function bindArchiveMatchClicks() {
    document.querySelectorAll('#archive-matches-grid .archive-match-card').forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            const matchDate = card.getAttribute('data-match-date') || 'TBD';
            const matchTime = card.getAttribute('data-match-time') || 'TBD';

            const dateParts   = matchDate.split(' ');
            const day         = dateParts[0] || '';
            const monthEn     = (dateParts[1] || '').toLowerCase();
            const displayDate = `${day} ${MONTH_EN_TO_NL[monthEn] || monthEn}`;

            let goalscorers = [];
            try { goalscorers = JSON.parse(card.getAttribute('data-goalscorers') || '[]'); } catch (e) {}

            const matchData = {
                title:      card.getAttribute('data-match-title') || 'Wedstrijddetails',
                stadium:    card.getAttribute('data-venue')        || 'Onbekend stadion',
                score:      card.getAttribute('data-score'),
                result:     card.getAttribute('data-result')       || null,
                season:     card.getAttribute('data-match-season') || '',
                isUpcoming: false,
                goalscorers,
                dateTime: { date: matchDate, time: matchTime, displayDate }
            };

            if (window.matchModal) {
                window.matchModal.show(matchData, card);
            } else {
                console.error('MatchModal not initialized');
            }
        });
    });
}

// ── Match Card Animations ─────────────────────────────────────────────────────

function animateArchiveMatches() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const container = entry.target.closest('#archive-matches-grid');
            const items     = Array.from(container.querySelectorAll('.archive-match-card'));
            const index     = items.indexOf(entry.target);

            setTimeout(() => entry.target.classList.add('animate-in'), index * 30);
            obs.unobserve(entry.target);
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.archive-match-card:not(.animate-in)').forEach(c => observer.observe(c));
}
