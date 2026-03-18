// Central source for month-to-index mapping
export const MONTH_INDEX_MAP = {
    'jan': 0, 'feb': 1, 'mar': 2, 'mrt': 2, 'apr': 3, 'may': 4, 'mei': 4,
    'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'okt': 9, 'nov': 10, 'dec': 11
};
export const monthMapEnglishToDutch = {
    'jan': 'jan', 'feb': 'feb', 'mar': 'mrt', 'apr': 'apr', 'may': 'mei', 'jun': 'jun',
    'jul': 'jul', 'aug': 'aug', 'sep': 'sep', 'oct': 'okt', 'nov': 'nov', 'dec': 'dec'
};

export const positionMap = {
    'GK': 'goalkeeper', 'VER': 'defender', 'MID': 'midfielder', 'AAN': 'attacker'
};

export const positionDisplayMap = {
    'goalkeeper': 'Doelman', 'defender': 'Verdediger',
    'midfielder': 'Middenvelder', 'attacker': 'Aanvaller'
};

export const positionIcons = {
    'goalkeeper': '<i class="fas fa-hand-paper"></i>',
    'defender': '<i class="fas fa-shield-alt"></i>',
    'midfielder': '<i class="fas fa-person-running"></i>',
    'attacker': '<i class="fas fa-crosshairs"></i>'
};

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
            const goals = m[2] ? parseInt(m[2], 10) : 1;
            if (player) scorers.push({ player, goals });
        }
    }
    return scorers;
}