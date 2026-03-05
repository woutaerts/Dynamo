// Imports and Initialization
import { animateOnScroll } from './general.js';
import { LineGraph } from './components/LineGraph.js';

const animationElements = [
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.season-selector-section .dropdown-container', containerSelector: 'section' }
];

document.addEventListener('DOMContentLoaded', () => {
    initArchiveDropdown();
    animateOnScroll(animationElements);

    const initialSeason = document.querySelector('#season-select .selected').dataset.value;
    loadSeason(initialSeason);
});

// Dropdown Initialization
function initArchiveDropdown() {
    const dropdownEl = document.getElementById('season-select');
    if (!dropdownEl) return;

    const selected = dropdownEl.querySelector('.selected');
    const options = dropdownEl.querySelector('.options');

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownEl.classList.toggle('active');
    });

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selected.dataset.value = li.dataset.value;
            selected.textContent = li.textContent;
            dropdownEl.classList.remove('active');
            loadSeason(li.dataset.value);
        });
    });

    document.addEventListener('click', e => {
        if (!dropdownEl.contains(e.target)) dropdownEl.classList.remove('active');
    });
}

// Season Loading and Rendering
async function loadSeason(seasonString) {
    const loadingEl = document.getElementById('archive-loading');
    const contentEl = document.getElementById('archive-content');
    const errorEl = document.getElementById('archive-error');
    const titleEl = document.getElementById('archive-season-title');

    const statsGrid = document.getElementById('archive-stats-grid');
    const comparisonView = document.getElementById('archive-comparison-view');

    titleEl.textContent = seasonString === 'Vergelijking' ? 'Seizoenen Vergelijken' : `Overzicht ${seasonString}`;
    contentEl.style.display = 'none';
    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');

    try {
        if (seasonString === 'Vergelijking') {
            const allData = await fetchAllSeasonsData();

            statsGrid.classList.add('hidden');
            comparisonView.classList.remove('hidden');

            loadingEl.classList.add('hidden');
            contentEl.style.display = 'block';

            ['#matches-graph', '#total-voor-graph', '#total-tegen-graph', '#avg-voor-graph', '#avg-tegen-graph'].forEach(id => {
                const el = document.querySelector(id);
                if(el) el.innerHTML = '';
            });

            const getTooltipHTML = (d) => `
                <div style="background:white; border: 2px solid #3D5A80; border-radius:12px; padding:10px 8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width: 90px; box-sizing:border-box; text-align:center; font-family:'Poppins', sans-serif;">
                    <h4 style="margin: 0 0 6px; font-size: 1.3rem; font-weight: 800; color: #3D5A80; line-height: 1;">${d.matches}</h4>
                    
                    <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="display:flex; justify-content:center; align-items:center; width:22px; height:22px; border-radius:50%; background:#648F5F; color:white; font-size:10px;">
                            <i class="fas fa-check" style="-webkit-text-stroke: 1px white;"></i>
                        </span>
                        <span style="font-size:0.95rem; font-weight:600; color:#333; width: 16px; text-align:left;">${d.winst}</span>
                    </div>
                    
                    <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="display:flex; justify-content:center; align-items:center; width:22px; height:22px; border-radius:50%; background:#E8B04B; color:white; font-size:10px;">
                            <i class="fas fa-minus" style="-webkit-text-stroke: 1px white;"></i>
                        </span>
                        <span style="font-size:0.95rem; font-weight:600; color:#333; width: 16px; text-align:left;">${d.gelijk}</span>
                    </div>
                    
                    <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                        <span style="display:flex; justify-content:center; align-items:center; width:22px; height:22px; border-radius:50%; background:#E07A5F; color:white; font-size:10px;">
                            <i class="fas fa-times" style="-webkit-text-stroke: 1px white;"></i>
                        </span>
                        <span style="font-size:0.95rem; font-weight:600; color:#333; width: 16px; text-align:left;">${d.verlies}</span>
                    </div>
                </div>
            `;

            new LineGraph('#matches-graph', {
                title: 'Aantal gespeelde wedstrijden',
                hideLineAndDots: true,
                data: allData.map(d => ({
                    label: d.seasonLabel,
                    value: d.matches,
                    tooltipHTML: getTooltipHTML(d),
                    stacked: [
                        { value: d.winst, color: '#648F5F' },
                        { value: d.gelijk, color: '#E8B04B' },
                        { value: d.verlies, color: '#E07A5F' }
                    ]
                })),
                color: '#7B96B7',
                dotColor: '#3D5A80',
            });

            new LineGraph('#total-voor-graph', {
                title: 'Aantal gescoorde doelpunten',
                data: allData.map(d => ({ label: d.seasonLabel, value: d.totalVoor })),
                color: '#84B281',
                dotColor: '#648F5F',
            });

            new LineGraph('#total-tegen-graph', {
                title: 'Aantal tegendoelpunten',
                data: allData.map(d => ({ label: d.seasonLabel, value: d.totalTegen })),
                color: '#E07A5F',
                dotColor: '#B90A0A',
            });

            new LineGraph('#avg-voor-graph', {
                title: 'Gemiddeld aantal gescoorde doelpunten per wedstrijd',
                data: allData.map(d => ({ label: d.seasonLabel, value: d.avgVoor })),
                color: '#84B281',
                dotColor: '#648F5F',
            });

            new LineGraph('#avg-tegen-graph', {
                title: 'Gemiddeld aantal tegendoelpunten per wedstrijd',
                data: allData.map(d => ({ label: d.seasonLabel, value: d.avgTegen })),
                color: '#E07A5F',
                dotColor: '#B90A0A',
            });

        } else {
            comparisonView.classList.add('hidden');
            statsGrid.classList.remove('hidden');
            loadingEl.classList.add('hidden');
            contentEl.style.display = 'block';
        }

        setTimeout(() => { titleEl.classList.add('animate-in'); }, 100);

    } catch (err) {
        console.error('Error loading data:', err);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

// Data Fetching and Parsing
async function fetchAllSeasonsData() {
    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRCgon0xh9NuQ87NgqQzBNPCEmmZWcC_jrulRhLwmrudf5UQ2QBRA28F1qmWB9L5xP9uZ8-ct2aqfR/pub?gid=39583142&single=true&output=csv';
    const response = await fetch(spreadsheetUrl);
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { skipEmptyLines: true, delimiter: ',' });
    const rows = parsed.data;

    const cleanSeasonLabel = (str) => {
        if (!str) return '';
        return str.replace(/[="]/g, '').trim();
    };

    const parseDecimal = (val, reverse = false) => {
        let n = parseFloat(val);
        if (isNaN(n)) return 0;
        if (reverse) n = Math.abs(n);
        return parseFloat(n.toFixed(2));
    };

    const parseIntSafe = (val, reverse = false) => {
        let n = parseInt(val);
        if (isNaN(n)) return 0;
        return reverse ? Math.abs(n) : n;
    };

    return [3, 5, 7, 9, 11].map(rowIndex => {
        const row = rows[rowIndex];
        return {
            seasonLabel: cleanSeasonLabel(row[1]),
            matches: parseIntSafe(row[2]),
            winst: parseIntSafe(row[3]),
            gelijk: parseIntSafe(row[4]),
            verlies: parseIntSafe(row[5], true),
            totalVoor: parseIntSafe(row[6]),
            totalTegen: parseIntSafe(row[7], true),
            avgVoor: parseDecimal(row[11]),
            avgTegen: parseDecimal(row[12], true)
        };
    });
}