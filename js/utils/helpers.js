/**
 * utils/helpers.js
 * Central source for shared constants, maps, and pure utility functions.
 */

// ── Month Maps ────────────────────────────────────────────────────────────────

/** Maps lowercased month abbreviations (Dutch + English) to 0-based JS month index. */
export const MONTH_INDEX_MAP = {
    'jan': 0, 'feb': 1, 'mar': 2, 'mrt': 2, 'apr': 3, 'may': 4, 'mei': 4,
    'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'okt': 9, 'nov': 10, 'dec': 11
};

/** Maps English month abbreviations to their Dutch equivalents. */
export const MONTH_EN_TO_NL = {
    'jan': 'jan', 'feb': 'feb', 'mar': 'mrt', 'apr': 'apr', 'may': 'mei', 'jun': 'jun',
    'jul': 'jul', 'aug': 'aug', 'sep': 'sep', 'oct': 'okt', 'nov': 'nov', 'dec': 'dec'
};

// ── Position Maps ─────────────────────────────────────────────────────────────

/** Maps spreadsheet position codes (e.g. "GK") to internal English keys. */
export const POSITION_CODE_MAP = {
    'GK': 'goalkeeper', 'VER': 'defender', 'MID': 'midfielder', 'AAN': 'attacker'
};

/** Maps internal English position keys to Dutch display labels. */
export const POSITION_LABEL_MAP = {
    'goalkeeper': 'Doelman',      'defender': 'Verdediger',
    'midfielder': 'Middenvelder', 'attacker': 'Aanvaller'
};

/** Maps internal English position keys to their FontAwesome icon HTML. */
export const POSITION_ICON_MAP = {
    'goalkeeper': '<i class="fas fa-hand-paper"></i>',
    'defender':   '<i class="fas fa-shield-alt"></i>',
    'midfielder': '<i class="fas fa-person-running"></i>',
    'attacker':   '<i class="fas fa-crosshairs"></i>'
};

// ── Result Helpers ────────────────────────────────────────────────────────────

/**
 * Converts a Dutch result string to its CSS class name.
 * Shared by: matches.js, search.js, archive.js, matchModal.js
 *
 * @param {string} result - 'winst' | 'gelijk' | 'verlies'
 * @returns {'win' | 'draw' | 'loss'}
 */
export function resultToClass(result) {
    if (result === 'winst')  return 'win';
    if (result === 'gelijk') return 'draw';
    return 'loss';
}

/**
 * Returns the FontAwesome icon name for a given result CSS class.
 * @param {'win'|'draw'|'loss'} cls
 * @returns {'check'|'minus'|'times'}
 */
export function resultToIcon(cls) {
    if (cls === 'win')  return 'check';
    if (cls === 'draw') return 'minus';
    return 'times';
}

// ── Date Parsing ──────────────────────────────────────────────────────────────

/**
 * Parses a "DD Mon YYYY" date string (e.g. "14 apr 2025") into a Date object.
 * Used for sorting the current-season match arrays.
 */
export function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split(' ');
    const monthKey = (month || '').toLowerCase();

    return new Date(
        parseInt(year) || 2000,
        MONTH_INDEX_MAP[monthKey] ?? 0,
        parseInt(day) || 1
    );
}

// ── Goalscorer Parsing ────────────────────────────────────────────────────────

/**
 * Parses a raw goalscorers cell value into a structured array.
 * Format: "Player Name (x2); Other Player"
 */
export function parseGoalscorers(raw) {
    if (!raw || raw.trim() === '' || raw.trim() === '/') return [];

    const cleaned = raw.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    if (!cleaned) return [];

    const scorers = [];
    const entries = cleaned.split(';').map(s => s.trim()).filter(Boolean);

    for (const entry of entries) {
        const m = entry.match(/^(.+?)(?:\s*\(x(\d+)\))?$/i);
        if (m) {
            const player = m[1].trim();
            const goals  = m[2] ? parseInt(m[2], 10) : 1;
            if (player) scorers.push({ player, goals });
        }
    }
    return scorers;
}

// ── Table HTML ────────────────────────────────────────────────────────────────

/** Shared table header HTML used by both statistics.js and archive.js. */
export const PLAYER_TABLE_HEADER_HTML = `
    <div class="table-header">
        <div class="table-cell">Rang</div>
        <div class="table-cell">Positie</div>
        <div class="table-cell">Speler</div>
        <div class="table-cell sort-header" data-column="goals">
            <span class="desktop-only">Doelpunten</span>
            <i class="fas fa-futbol mobile-only"></i>
        </div>
        <div class="table-cell sort-header" data-column="matches">
            <span class="desktop-only">Wedstrijden</span>
            <i class="fas fa-shirt mobile-only"></i>
        </div>
        <div class="table-cell sort-header" data-column="avg-goals">
            <span class="desktop-only">Gem. D/W</span>
            <span class="mobile-only"><i class="fas fa-futbol"></i> / <i class="fas fa-shirt"></i></span>
        </div>
    </div>
`;

// ── Table Toggle Manager ──────────────────────────────────────────────────────

export const tableStates = {};

/** Resets a specific table back to its collapsed state. */
export function resetTableState(tableId) {
    tableStates[tableId] = false;
}

/** Returns either the sliced 10-item array or the full array based on current state. */
export function sliceForTable(items, tableId, limit = 10) {
    if (!(tableId in tableStates)) tableStates[tableId] = false;
    return tableStates[tableId] ? items : items.slice(0, limit);
}

/** Handles cleanup, creation, and event binding of the toggle button. */
export function appendTableToggle(tableContainer, tableId, totalItems, limit, renderCallback) {
    // 1. Clean up any existing button container after this table
    const nextEl = tableContainer.nextElementSibling;
    if (nextEl && nextEl.classList.contains('table-toggle-container')) {
        nextEl.remove();
    }

    // 2. If we have 10 or fewer items, we don't need a button
    if (totalItems <= limit) return;

    // 3. Create the new button container
    const isExpanded = tableStates[tableId];
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'table-toggle-container';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-toggle-table';
    toggleBtn.innerHTML = isExpanded
        ? 'Toon minder <i class="fas fa-chevron-up"></i>'
        : `Toon alle ${totalItems} spelers <i class="fas fa-chevron-down"></i>`;

    // 4. Bind the click event
    toggleBtn.addEventListener('click', () => {
        tableStates[tableId] = !isExpanded;
        renderCallback();

        if (isExpanded) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });

    toggleContainer.appendChild(toggleBtn);
    tableContainer.insertAdjacentElement('afterend', toggleContainer);
}

// ── Match Sort Margin Helpers ─────────────────────────────────────────────────
// Previously duplicated as inline closures in search.js and archive.js.

/**
 * Calculates the win-margin sort key for a match item.
 * Wins return positive margin; draws return -0.5; losses return deeply negative.
 *
 * @param {{ score: string, isHome: boolean }} item
 * @returns {number}
 */
export function calcWinMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const us  = item.isHome ? home : away;
    const opp = item.isHome ? away : home;
    return us > opp ? us - opp : us === opp ? -0.5 : -1000 - (opp - us);
}

/**
 * Calculates the loss-margin sort key for a match item.
 * Losses return positive margin; draws return -0.5; wins return deeply negative.
 *
 * @param {{ score: string, isHome: boolean }} item
 * @returns {number}
 */
export function calcLossMargin(item) {
    const [home, away] = item.score.split('-').map(Number);
    const us  = item.isHome ? home : away;
    const opp = item.isHome ? away : home;
    return us < opp ? opp - us : us === opp ? -0.5 : -1000 - (us - opp);
}


// ── Table Sorting Manager ─────────────────────────────────────────────────────

/**
 * Binds click events to table headers for sorting, updates the associated dropdown,
 * and triggers a re-render.
 *
 * @param {string} tableSelector - CSS selector for the table container.
 * @param {string} dropdownSelector - CSS selector for the dropdown to update.
 * @param {function} renderFn - Callback function to re-render the table, passed the sort key.
 */
export function bindSortableHeaders(tableSelector, dropdownSelector, renderFn) {
    const keyMap = { 3: 'goals', 4: 'matches', 5: 'avg-goals' };
    const lblMap = {
        'goals': 'Totaal Doelpunten',
        'matches': 'Gespeelde Wedstrijden',
        'avg-goals': 'Gemiddelde Doelpunten per Wedstrijd'
    };

    document.querySelectorAll(`${tableSelector} .table-header .table-cell`).forEach((cell, index) => {
        const key = keyMap[index];
        if (!key) return;

        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
            const selected = document.querySelector(`${dropdownSelector} .selected`);
            if (selected) {
                selected.dataset.value = key;
                selected.innerHTML = lblMap[key];
            }
            renderFn(key);
        });
    });
}


// ── Table Row Builder ─────────────────────────────────────────────────────────

/**
 * Builds a standardized DOM element for a player table row.
 * * @param {Object} player - The player data object { name, position, goals, matches }.
 * @param {number} index - The current index for the rank (0-based).
 * @param {string} rowClass - The full CSS class string to apply to the row wrapper.
 * @param {string} [prefix='player'] - The prefix to use for internal cell classes (e.g., 'player', 'scorer').
 * @returns {HTMLElement} The constructed row element.
 */
export function buildPlayerRow(player, index, rowClass, prefix = 'player') {
    const avg = player.matches === 0 ? '0.00' : (player.goals / player.matches).toFixed(2);
    const row = document.createElement('div');
    row.className = rowClass;

    row.innerHTML = `
        <div class="table-cell ${prefix}-rank">${index + 1}</div>
        <div class="table-cell ${prefix}-position">
            ${POSITION_ICON_MAP[player.position] || ''}
            <span class="tooltip">${POSITION_LABEL_MAP[player.position] || ''}</span>
        </div>
        <div class="table-cell ${prefix}-name">${player.name}</div>
        <div class="table-cell ${prefix}-goals">${player.goals}</div>
        <div class="table-cell ${prefix}-matches">${player.matches}</div>
        <div class="table-cell ${prefix}-avg-goals">${avg}</div>
    `;

    return row;
}

// ── General Utilities ─────────────────────────────────────────────────────────

/**
 * Creates a debounced function that delays invoking the provided function until after
 * `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
export function debounce(fn, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
}