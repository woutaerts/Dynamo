/**
 * utils/helpers.js
 * Central source for shared constants, maps, and pure utility functions.
 *
 * Renames applied:
 *   monthMapEnglishToDutch → MONTH_EN_TO_NL   (consistent ALL_CAPS for constants)
 *   positionMap            → POSITION_CODE_MAP (explicit about what it maps: codes)
 *   positionDisplayMap     → POSITION_LABEL_MAP (explicit about what it stores: labels)
 *   positionIcons          → POSITION_ICON_MAP  (consistent with other map names)
 *
 * New addition:
 *   resultToClass(result)  → shared converter used across matches, search, archive
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
    'goalkeeper': 'Doelman',    'defender': 'Verdediger',
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
    if (result === 'winst')   return 'win';
    if (result === 'gelijk')  return 'draw';
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
        tableStates[tableId] = !isExpanded; // Flip the state
        renderCallback();                   // Fire the parent's render function

        // Scroll back to the bottom of the table if we just collapsed it
        if (isExpanded) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });

    toggleContainer.appendChild(toggleBtn);
    tableContainer.insertAdjacentElement('afterend', toggleContainer);
}
