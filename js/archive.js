/* Imports van externe modules */
import { animateOnScroll } from './utils/animations.js';
import { LineGraph } from './components/lineGraph.js';
import { SHEET_URLS} from './utils/dataService.js';
import { fetchCsvCached } from './utils/fetchCsv.js';
import { positionIcons, positionDisplayMap, positionMap, monthMapEnglishToDutch, parseGoalscorers, parseDate } from './utils/helpers.js';

/* Configuratie voor animaties */
const animationElements = [
    { selector: '.page-hero h1',         containerSelector: 'section' },
    { selector: '.section-title',        containerSelector: 'section' },
    { selector: '.season-selector-section .dropdown-container', containerSelector: 'section' }
];

/* Configuratie van alle seizoenen en hun spreadsheet parameters */
const SEASON_CONFIG = {
    '2024-2025': {
        label: '2024-25',
        url: SHEET_URLS.season2425,
        matchCols:    { first: col('F'), last: col('AA') },
        matchRows:    { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 75, goalsAgainst: 76, goalscorers: 78 },
        playerRows:   { first: 7, last: 51 },
        playerCols:   { name: col('B'), position: col('D'), goals: col('AD'), matches: col('AE') },
        statsCell:    { played: [78, col('AE')], wins: [76, col('AG')], draws: [77, col('AG')], losses: [78, col('AG')], goalsFor: [75, col('AE')], goalsAgainst: [76, col('AE')] },
    },
    '2023-2024': {
        label: '2023-24',
        url: SHEET_URLS.season2324,
        matchCols:    { first: col('F'), last: col('Z') },
        matchRows:    { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 64, goalsAgainst: 65, goalscorers: 67 },
        playerRows:   { first: 7, last: 50 },
        playerCols:   { name: col('B'), position: col('D'), goals: col('AC'), matches: col('AD') },
        statsCell:    { played: [67, col('AD')], wins: [65, col('AF')], draws: [66, col('AF')], losses: [67, col('AF')], goalsFor: [64, col('AD')], goalsAgainst: [65, col('AD')] },
    },
    '2022-2023': {
        label: '2022-23',
        url: SHEET_URLS.season2223,
        matchCols:    { first: col('F'), last: col('W') },
        matchRows:    { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 73, goalsAgainst: 74, goalscorers: 76 },
        playerRows:   { first: 7, last: 52 },
        playerCols:   { name: col('B'), position: col('D'), goals: col('Z'), matches: col('AA') },
        statsCell:    { played: [76, col('AA')], wins: [74, col('AC')], draws: [75, col('AC')], losses: [76, col('AC')], goalsFor: [73, col('AA')], goalsAgainst: [74, col('AA')] },
    },
    '2021-2022': {
        label: '2021-22',
        url: SHEET_URLS.season2122,
        matchCols:    { first: col('F'), last: col('X') },
        matchRows:    { opponent: 1, date: 2, time: 3, stadium: 4, homeAway: 5, goalsFor: 56, goalsAgainst: 57, goalscorers: 59 },
        playerRows:   { first: 7, last: 47 },
        playerCols:   { name: col('B'), position: col('D'), goals: col('AA'), matches: col('AB') },
        statsCell:    { played: [59, col('AB')], wins: [57, col('AD')], draws: [58, col('AD')], losses: [59, col('AD')], goalsFor: [56, col('AB')], goalsAgainst: [57, col('AB')] },
    },
};

/* Globale status voor archiefspelers */
let archivePlayers = [];

/* Genereer de HTML voor de grafiek tooltip (Hoisted voor betere prestaties) */
const getArchiveTooltipHTML = (d) => `
    <div style="background:white;border:2px solid #3D5A80;border-radius:12px;padding:10px 8px;
         box-shadow:0 4px 10px rgba(0,0,0,0.1);width:90px;box-sizing:border-box;
         text-align:center;font-family:'Poppins',sans-serif;">
        <h4 style="margin:0 0 6px;font-size:1.3rem;font-weight:800;color:#3D5A80;line-height:1;">${d.matches}</h4>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="display:flex;justify-content:center;align-items:center;width:22px;height:22px;
                  border-radius:50%;background:#648F5F;color:white;font-size:10px;">
                <i class="fas fa-check" style="-webkit-text-stroke:1px white;"></i></span>
            <span style="font-size:0.95rem;font-weight:600;color:#333;width:16px;text-align:left;">${d.winst}</span>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="display:flex;justify-content:center;align-items:center;width:22px;height:22px;
                  border-radius:50%;background:#E8B04B;color:white;font-size:10px;">
                <i class="fas fa-minus" style="-webkit-text-stroke:1px white;"></i></span>
            <span style="font-size:0.95rem;font-weight:600;color:#333;width:16px;text-align:left;">${d.gelijk}</span>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;">
            <span style="display:flex;justify-content:center;align-items:center;width:22px;height:22px;
                  border-radius:50%;background:#E07A5F;color:white;font-size:10px;">
                <i class="fas fa-times" style="-webkit-text-stroke:1px white;"></i></span>
            <span style="font-size:0.95rem;font-weight:600;color:#333;width:16px;text-align:left;">${d.verlies}</span>
        </div>
    </div>`;

/* Initialisatie van de pagina bij het laden */
document.addEventListener('DOMContentLoaded', () => {
    initArchiveDropdown();
    initArchivePlayerSort();
    initGlobalDropdownCloser();
    initArchiveSortableHeaders();
    animateOnScroll(animationElements);
    const initialSeason = document.querySelector('#season-select .selected').dataset.value;
    loadSeason(initialSeason);
});

/* Bepaal en wissel tussen seizoensweergave of vergelijking */
async function loadSeason(seasonString) {
    const loadingEl      = document.getElementById('archive-loading');
    const contentEl      = document.getElementById('archive-content');
    const errorEl        = document.getElementById('archive-error');
    const titleEl        = document.getElementById('archive-season-title');
    const comparisonView = document.getElementById('archive-comparison-view');
    const seasonView     = document.getElementById('archive-season-view');

    titleEl.textContent = seasonString === 'Vergelijking'
        ? 'Seizoenen Vergelijken'
        : `Overzicht ${seasonString}`;
    titleEl.classList.remove('animate-in');

    contentEl.style.display = 'none';
    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');

    try {
        if (seasonString === 'Vergelijking') {
            seasonView.classList.add('hidden');
            comparisonView.classList.remove('hidden');

            const allData = await fetchAllSeasonsData();
            loadingEl.classList.add('hidden');
            contentEl.style.display = 'block';

            // 1. Define our graphs in a clean configuration array
            const graphConfigs = [
                {
                    id: '#matches-graph', title: 'Aantal gespeelde wedstrijden', color: '#7B96B7', dotColor: '#3D5A80', hideLine: true,
                    mapFn: d => ({
                        label: d.seasonLabel, value: d.matches, tooltipHTML: getArchiveTooltipHTML(d),
                        stacked: [
                            { value: d.winst, color: '#648F5F' },
                            { value: d.gelijk, color: '#E8B04B' },
                            { value: d.verlies, color: '#E07A5F' }
                        ]
                    })
                },
                { id: '#total-voor-graph', title: 'Aantal gescoorde doelpunten', color: '#84B281', dotColor: '#648F5F', mapFn: d => ({ label: d.seasonLabel, value: d.totalVoor }) },
                { id: '#total-tegen-graph', title: 'Aantal tegendoelpunten', color: '#E07A5F', dotColor: '#B90A0A', mapFn: d => ({ label: d.seasonLabel, value: d.totalTegen }) },
                { id: '#avg-voor-graph', title: 'Gemiddeld aantal gescoorde doelpunten per wedstrijd', color: '#84B281', dotColor: '#648F5F', mapFn: d => ({ label: d.seasonLabel, value: d.avgVoor }) },
                { id: '#avg-tegen-graph', title: 'Gemiddeld aantal tegendoelpunten per wedstrijd', color: '#E07A5F', dotColor: '#B90A0A', mapFn: d => ({ label: d.seasonLabel, value: d.avgTegen }) }
            ];

            // 2. Loop through the config to clear and render them automatically
            graphConfigs.forEach(config => {
                const el = document.querySelector(config.id);
                if (el) {
                    el.innerHTML = ''; // Clear old graph
                    new LineGraph(config.id, {
                        title: config.title,
                        hideLineAndDots: config.hideLine || false,
                        color: config.color,
                        dotColor: config.dotColor,
                        data: allData.map(config.mapFn)
                    });
                }
            });
        } else {
            comparisonView.classList.add('hidden');
            seasonView.classList.remove('hidden');
            loadingEl.classList.add('hidden');
            contentEl.style.display = 'block';
            await loadSeasonData(seasonString);
        }

        setTimeout(() => titleEl.classList.add('animate-in'), 100);

    } catch (err) {
        console.error('Error loading data:', err);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

/* Verwerk en weergave van data voor een specifiek seizoen */
async function loadSeasonData(seasonString) {
    const config       = SEASON_CONFIG[seasonString];
    const innerLoader  = document.getElementById('archive-season-loader');
    const innerError   = document.getElementById('archive-season-error');
    const innerContent = document.getElementById('archive-season-content');

    if (innerLoader)  innerLoader.classList.remove('hidden');
    if (innerError)   innerError.classList.add('hidden');
    if (innerContent) innerContent.classList.add('hidden');

    const sortSel = document.querySelector('#archive-player-sort .selected');
    if (sortSel) { sortSel.textContent = 'Totaal Doelpunten'; sortSel.dataset.value = 'goals'; }

    try {
        const csvText = await fetchCsvCached(config.url);
        const parsed = Papa.parse(csvText, { skipEmptyLines: false, delimiter: ',' });
        const rows = parsed.data;

        const stats  = parseSeasonStats(rows, config);
        const players = parseSeasonPlayers(rows, config);
        const matches = parseSeasonMatches(rows, config, seasonString);

        renderSeasonStats(stats);
        archivePlayers = players;
        renderArchivePlayers('goals');
        renderSeasonMatches(matches);
        setupArchiveMatchInteractions();

        if (innerLoader)  innerLoader.classList.add('hidden');
        if (innerContent) innerContent.classList.remove('hidden');

        animateArchiveMatches();

        animateOnScroll([
            { selector: '.stat-card',                        containerSelector: 'section' },
            { selector: '.archive-player-row',               containerSelector: 'section' },
            { selector: '.archive-subsection .section-title', containerSelector: 'section' },
        ]);

    } catch (err) {
        console.error('Error loading season data:', err);
        if (innerLoader) innerLoader.classList.add('hidden');
        if (innerError)  innerError.classList.remove('hidden');
    }
}

/* Haal overzichtsdata op van alle seizoenen */
async function fetchAllSeasonsData() {
    const csvText = await fetchCsvCached(SHEET_URLS.seasonRecords);
    const parsed  = Papa.parse(csvText, { skipEmptyLines: true, delimiter: ',' });
    const rows    = parsed.data;

    const cleanLabel   = str => str ? str.replace(/[="]/g, '').trim() : '';
    const toDecimal    = (val, abs = false) => { let n = parseFloat(val); if (isNaN(n)) return 0; if (abs) n = Math.abs(n); return parseFloat(n.toFixed(2)); };
    const toInt        = (val, abs = false) => { let n = parseInt(val); if (isNaN(n)) return 0; return abs ? Math.abs(n) : n; };

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

/* Zet kolomletters om naar een 0-gebaseerde array index */
function col(letters) {
    letters = letters.toUpperCase();
    let n = 0;
    for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
}

/* Haal de tekstwaarde van een specifieke cel op */
function cell(rows, rowIdx, colIdx) {
    return rows[rowIdx]?.[colIdx]?.toString().trim().replace(/^["=]+|["]+$/g, '') || '';
}

/* Haal de absolute integerwaarde van een specifieke cel op */
function intCell(rows, rowIdx, colIdx) {
    return Math.abs(parseInt(cell(rows, rowIdx, colIdx), 10)) || 0;
}

/* Verwerk de globale teamstatistieken uit de spreadsheet */
function parseSeasonStats(rows, config) {
    const s = config.statsCell;
    return {
        matches:      intCell(rows, s.played[0],       s.played[1]),
        wins:         intCell(rows, s.wins[0],          s.wins[1]),
        draws:        intCell(rows, s.draws[0],         s.draws[1]),
        losses:       intCell(rows, s.losses[0],        s.losses[1]),
        goalsFor:     intCell(rows, s.goalsFor[0],      s.goalsFor[1]),
        goalsAgainst: intCell(rows, s.goalsAgainst[0],  s.goalsAgainst[1]),
    };
}

/* Verwerk de spelersstatistieken uit de spreadsheet */
function parseSeasonPlayers(rows, config) {
    const { first, last } = config.playerRows;
    const pc = config.playerCols;
    const titleRows = ['keeper', 'verdedigers', 'middenvelders', 'aanvallers'];
    const players = [];

    for (let r = first; r <= last; r++) {
        const name     = cell(rows, r, pc.name);
        const posCode  = cell(rows, r, pc.position);
        const goalsStr = cell(rows, r, pc.goals);
        const matchStr = cell(rows, r, pc.matches);

        if (!name || titleRows.includes(name.toLowerCase())) continue;

        const position = positionMap[posCode];
        if (!position) continue;

        const goals   = parseInt(goalsStr, 10);
        const matches = parseInt(matchStr, 10);
        if (isNaN(goals) || isNaN(matches)) continue;

        players.push({ name, position, goals, matches });
    }
    return players.sort((a, b) => b.goals - a.goals);
}

/* Verwerk alle gespeelde wedstrijden uit de spreadsheet */
function parseSeasonMatches(rows, config, seasonString) {
    const mc = config.matchCols;
    const mr = config.matchRows;
    const seasonLabel = config.label || seasonString;
    const matches = [];

    for (let c = mc.first; c <= mc.last; c++) {
        const opponent    = cell(rows, mr.opponent,     c);
        const dateRaw     = cell(rows, mr.date,         c);
        const time        = cell(rows, mr.time,         c);
        const stadium     = cell(rows, mr.stadium,      c);
        const homeAway    = cell(rows, mr.homeAway,     c).toLowerCase();
        const gfRaw       = cell(rows, mr.goalsFor,     c);
        const gaRaw       = cell(rows, mr.goalsAgainst, c);
        const gsRaw       = cell(rows, mr.goalscorers,  c);

        if (!opponent || !dateRaw) continue;

        const isHome = homeAway === 'thuis';

        const dateParts  = dateRaw.split(' ');
        const day        = dateParts[0] || '';
        const monthEn    = (dateParts[1] || '').toLowerCase();
        const monthDutch = monthMapEnglishToDutch[monthEn] || monthEn;
        const displayDate = `${day} ${monthDutch}`;

        const title = isHome
            ? `Dynamo Beirs vs ${opponent}`
            : `${opponent} vs Dynamo Beirs`;

        const gf = parseInt(gfRaw, 10);
        const ga = parseInt(gaRaw, 10);
        if (isNaN(gf) || isNaN(ga)) continue;

        const score  = isHome ? `${gf}-${ga}` : `${ga}-${gf}`;
        const result = gf > ga ? 'winst' : gf < ga ? 'verlies' : 'gelijk';
        const goalscorers = parseGoalscorers(gsRaw);

        matches.push({
            title,
            displayDate,
            dateRaw,
            score,
            result,
            stadium,
            time,
            goalscorers,
            season: seasonLabel,
        });
    }

    matches.sort((a, b) => parseDate(a.dateRaw) - parseDate(b.dateRaw));
    return matches;
}
/* Toon de globale statistieken op de pagina */
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

/* Toon en sorteer de spelers in de archieftabel */
function renderArchivePlayers(sortBy = 'goals') {
    const list = document.getElementById('archive-player-list');
    if (!list) return;

    const sorted = [...archivePlayers].sort((a, b) => {
        const aR = a.matches === 0 ? 0 : a.goals / a.matches;
        const bR = b.matches === 0 ? 0 : b.goals / b.matches;
        if (sortBy === 'goals') {
            return b.goals - a.goals || bR - aR || b.matches - a.matches || a.name.localeCompare(b.name);
        } else if (sortBy === 'matches') {
            return b.matches - a.matches || b.goals - a.goals || bR - aR || a.name.localeCompare(b.name);
        } else {
            return bR - aR || b.goals - a.goals || b.matches - a.matches || a.name.localeCompare(b.name);
        }
    });

    list.innerHTML = '';

    if (sorted.length === 0) {
        list.innerHTML = '<div class="archive-empty-msg">Geen spelersdata beschikbaar.</div>';
        return;
    }

    sorted.forEach((player, index) => {
        const avg = player.matches === 0
            ? '0.00'
            : (player.goals / player.matches).toFixed(2);
        const row = document.createElement('div');
        row.className = 'player-row archive-player-row';
        row.innerHTML = `
            <div class="table-cell player-rank">${index + 1}</div>
            <div class="table-cell player-position">
                ${positionIcons[player.position] || ''}
                <span class="tooltip">${positionDisplayMap[player.position] || ''}</span>
            </div>
            <div class="table-cell player-name">${player.name}</div>
            <div class="table-cell player-goals">${player.goals}</div>
            <div class="table-cell player-matches">${player.matches}</div>
            <div class="table-cell player-avg-goals">${avg}</div>
        `;
        list.appendChild(row);
    });
}

/* Toon alle seizoenswedstrijden als interactieve kaarten */
function renderSeasonMatches(matches) {
    const grid = document.getElementById('archive-matches-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (matches.length === 0) {
        grid.innerHTML = '<div class="archive-empty-msg">Geen wedstrijden beschikbaar voor dit seizoen.</div>';
        return;
    }

    matches.forEach(match => {
        const resultClass = match.result === 'winst' ? 'win'
            : match.result === 'gelijk' ? 'draw' : 'loss';
        const icon = resultClass === 'win' ? 'check'
            : resultClass === 'draw' ? 'minus' : 'times';

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

        card.innerHTML = `
            <div class="result-icon ${resultClass}">
                <span><i class="fas fa-${icon}"></i></span>
            </div>
            <div class="match-body">
                <div class="match-teams">
                    <div class="home-team">${homeTeam}</div>
                    <div class="vs-divider">vs</div>
                    <div class="away-team">${awayTeam}</div>
                </div>
                <div class="match-score">${match.score}</div>
                <div class="match-details">
                    <span class="match-date">
                        <i class="fas fa-calendar"></i> ${match.displayDate}
                    </span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* Configureer de dropdown voor seizoenselectie */
function initArchiveDropdown() {
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

/* Configureer de custom dropdown voor speler-sortering */
function initArchivePlayerSort() {
    const dropdown = document.getElementById('archive-player-sort');
    if (!dropdown) return;
    const selected = dropdown.querySelector('.selected');
    const options  = dropdown.querySelector('.options');

    selected.addEventListener('click', (e) => {
        e.stopPropagation(); // Good practice to add this here too
        dropdown.classList.toggle('active');
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    options.querySelectorAll('li').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation(); // And here
            selected.textContent   = opt.textContent;
            selected.dataset.value = opt.dataset.value;
            dropdown.classList.remove('active');
            options.style.display  = 'none';
            renderArchivePlayers(opt.dataset.value);
        });
    });
}

/* Eén globale listener om alle actieve dropdowns te sluiten bij een klik ernaast */
function initGlobalDropdownCloser() {
    document.addEventListener('click', e => {
        // 1. Check and close Season Dropdown
        const seasonDropdown = document.getElementById('season-select');
        if (seasonDropdown && !seasonDropdown.contains(e.target)) {
            seasonDropdown.classList.remove('active');
        }

        // 2. Check and close Player Sort Dropdown
        const sortDropdown = document.getElementById('archive-player-sort');
        if (sortDropdown && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.remove('active');
            const options = sortDropdown.querySelector('.options');
            if (options) options.style.display = 'none';
        }
    });
}

/* Maak specifieke tabelkoppen sorteerbaar en klikbaar */
function initArchiveSortableHeaders() {
    const headerCells = document.querySelectorAll('#archive-players-section .table-header .table-cell');

    headerCells.forEach((cell, index) => {
        let key = null;
        let label = '';

        if (index === 3) {
            key = 'goals';
            label = 'Totaal Doelpunten';
        } else if (index === 4) {
            key = 'matches';
            label = 'Gespeelde Wedstrijden';
        } else if (index === 5) {
            key = 'avg-goals';
            label = 'Gemiddelde Doelpunten per Wedstrijd';
        }

        if (key) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                const sortSel = document.querySelector('#archive-player-sort .selected');
                if (sortSel) {
                    sortSel.dataset.value = key;
                    sortSel.textContent = label;
                }
                renderArchivePlayers(key);
            });
        }
    });
}

/* Verbind de klik-events op wedstrijdkaarten aan de infomodal */
function setupArchiveMatchInteractions() {
    document.querySelectorAll('#archive-matches-grid .archive-match-card').forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            const matchDate = card.getAttribute('data-match-date') || 'TBD';
            const matchTime = card.getAttribute('data-match-time') || 'TBD';

            const dateParts  = matchDate.split(' ');
            const day        = dateParts[0] || '';
            const monthEn    = (dateParts[1] || '').toLowerCase();
            const monthDutch = monthMapEnglishToDutch[monthEn] || monthEn;
            const displayDate = `${day} ${monthDutch}`;

            let goalscorers = [];
            try {
                goalscorers = JSON.parse(card.getAttribute('data-goalscorers') || '[]');
            } catch (e) {}

            const matchData = {
                title:      card.getAttribute('data-match-title') || 'Wedstrijddetails',
                stadium:    card.getAttribute('data-venue')        || 'Onbekend stadion',
                score:      card.getAttribute('data-score'),
                season:     card.getAttribute('data-match-season') || '',
                isUpcoming: false,
                goalscorers,
                dateTime: { date: matchDate, time: matchTime, displayDate },
            };

            if (window.matchModal) {
                window.matchModal.show(matchData);
            } else {
                console.error('MatchModal not initialized');
            }
        });
    });
}

/* Initialiseer intersection observer voor getrapte animaties van wedstrijdkaarten */
function animateArchiveMatches() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target.closest('#archive-matches-grid');
                const items = Array.from(container.querySelectorAll('.archive-match-card'));
                const index = items.indexOf(entry.target);

                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 30);

                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.archive-match-card:not(.animate-in)').forEach(card => observer.observe(card));
}