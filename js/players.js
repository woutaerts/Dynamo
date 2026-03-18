import { animateOnScroll, animatePlayerCards } from './utils/animations.js';
import { positionDisplayMap } from './utils/helpers.js';
import { fetchSeasonPlayers } from './utils/dataService.js';

const animationElements = [
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' },
    { selector: '.page-hero h1', containerSelector: 'section' },
    { selector: '.filter-section', containerSelector: null },
    { selector: '.search-container', containerSelector: null },
    { selector: '.player-card', containerSelector: 'section' }
];

let globalPlayers = [];
let currentFilter = 'all';

const DOM = {
    get grid()          { return document.querySelector('.players-grid'); },
    get loading()       { return document.getElementById('players-loading'); },
    get searchInput()   { return document.querySelector('.player-search'); },
    get filterButtons() { return document.querySelectorAll('.filter-btn'); },
    get cards()         { return document.querySelectorAll('.player-card'); }
};

/* Initialisatie van de pagina en alle bijbehorende functionaliteiten bij het laden */
document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderPlayers();
    initializeFilters();
    addSearchFunctionality();
    initializeKeyboardNavigation();
    animatePlayerCards();
    animateOnScroll(animationElements);
    initializePositionAwareHover();
    setTimeout(checkInitialHash, 100);
});

/* Haal de spelersdata op via de data service en render deze op het scherm */
async function fetchAndRenderPlayers() {
    const loadingEl = DOM.loading;
    const gridEl = DOM.grid;

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (gridEl) gridEl.style.opacity = '0';

    try {
        // Pass 'true' to get detailed fields like nationality and birthdays
        globalPlayers = await fetchSeasonPlayers(true);

        renderPlayerCards(globalPlayers);

        if (loadingEl) loadingEl.classList.add('hidden');
        if (gridEl) {
            gridEl.style.opacity = '1';
            gridEl.style.transition = 'opacity 0.4s ease';
        }
    } catch (error) {
        console.error('Error fetching or rendering players:', error);
        if (loadingEl) loadingEl.innerHTML = '<p style="color: var(--dynamo-red);">Fout bij laden spelers.</p>';
    }
}

/* Genereer de HTML voor de spelerskaarten en koppel direct de events */
function renderPlayerCards(players) {
    const playersGrid = document.querySelector('.players-grid');
    if (!playersGrid) return;
    playersGrid.innerHTML = '';

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = `player-card${player.isBirthday ? ' birthday' : ''}`;
        card.setAttribute('data-position', player.position);

        // 1. Define the conditional HTML logic outside the template string
        const birthdayHTML = player.isBirthday
            ? '<div class="confetti-bg"></div><div class="garland-left"></div><div class="garland-right"></div>'
            : '';

        // 2. Inject the variable into the template string using ${}
        card.innerHTML = `
            ${birthdayHTML}
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-position">${positionDisplayMap[player.position]}</div>
                <div class="player-nationality">
                    <img src="${player.flagSrc}" alt="${player.nationality} Flag" class="flag-icon">
                </div>
            </div>
        `;

        // 1. Set cursor style
        card.style.cursor = 'pointer';

        // 2. Attach click event using the 'player' object directly via closure
        card.addEventListener('click', (e) => {
            e.preventDefault();

            if (window.playerModal) {
                // Pass the existing player object directly!
                window.playerModal.show(player);
            } else {
                console.error('PlayerModal not initialized');
                alert('Spelerdetails zijn momenteel niet beschikbaar. Probeer het later opnieuw.');
            }
        });

        // 3. Attach hover events
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');

        // Save the DOM element reference directly to the player object!
        player.element = card;

        // Finally, append the card to the grid
        playersGrid.appendChild(card);
    });
}

/* Stel de positiefilters in en koppel de juiste filteracties aan de knoppen */
function initializeFilters() {
    const buttons = DOM.filterButtons; // Query once here

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPosition = button.getAttribute('data-position');
            currentFilter = targetPosition;

            // Efficiently toggle classes using the cached list
            buttons.forEach(btn => btn.classList.toggle('active', btn === button));

            updateHeroAccentColor(targetPosition);
            filterPlayers(targetPosition);

            if (DOM.searchInput) DOM.searchInput.value = '';
            history.replaceState(null, null, targetPosition === 'all' ? '#players' : `#${targetPosition}`);
        });
    });
}

/* Toon of verberg spelerskaarten op basis van de geselecteerde positie */
function filterPlayers(position) {
    globalPlayers.forEach(player => {
        const shouldShow = position === 'all' || player.position === position;

        player.element.classList.toggle('filter-hidden', !shouldShow);
        player.element.classList.toggle('filter-visible', shouldShow);
    });
}

/* Controleer de URL-hash bij het laden en activeer automatisch de juiste filter */
function checkInitialHash() {
    const hash = window.location.hash.substring(1);
    const validPositions = ['goalkeeper', 'defender', 'midfielder', 'attacker'];

    if (validPositions.includes(hash)) {
        const targetButton = document.querySelector(`[data-position="${hash}"]`);
        if (targetButton) targetButton.click();
    }
}

/* Initialiseer het zoekveld om spelers op naam te kunnen zoeken */
function addSearchFunctionality() {
    const searchInput = document.querySelector('.player-search');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
}

/* Verwerk de zoekinvoer en combineer deze met de actieve positiefilter */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    globalPlayers.forEach(player => {
        const matchesSearch = searchTerm === '' || player.name.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' || player.position === currentFilter;

        player.element.classList.toggle('filter-hidden', !(matchesSearch && matchesFilter));
        player.element.classList.toggle('filter-visible', matchesSearch && matchesFilter);
    });
}

/* Maak het mogelijk om met de pijltjestoetsen door de filters te navigeren */
function initializeKeyboardNavigation() {
    const buttons = Array.from(DOM.filterButtons); // Convert NodeList to Array once

    document.addEventListener('keydown', (e) => {
        if (DOM.searchInput && document.activeElement === DOM.searchInput) return;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();

            const currentIndex = buttons.findIndex(btn => btn.classList.contains('active'));
            let newIndex;

            if (e.key === 'ArrowLeft') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
            } else {
                newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
            }

            buttons[newIndex].click();
            buttons[newIndex].focus();
        }
    });
}

/* Voeg een dynamisch hover-effect toe aan de filterknoppen op basis van muispositie */
function initializePositionAwareHover() {
    const filterButtons = DOM.filterButtons;

    filterButtons.forEach(button => {
        const hoverSpan = document.createElement('span');
        hoverSpan.className = 'hover-effect';
        button.appendChild(hoverSpan);

        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });

        button.addEventListener('mouseleave', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });
    });
}

/* Pas de accentkleur van de pagina aan op basis van de geselecteerde positiefilter */
function updateHeroAccentColor(position) {
    const validPositions = ['goalkeeper', 'defender', 'midfielder', 'attacker', 'all'];
    const newClass = validPositions.includes(position) ? `filter-${position}` : 'filter-all';

    // 1. Remove all possible filter classes safely without touching other classes
    const filterClasses = validPositions.map(pos => `filter-${pos}`);
    document.body.classList.remove(...filterClasses);

    // 2. Add the specific new filter class
    document.body.classList.add(newClass);
}