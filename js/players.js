// players.js
import { animateOnScroll } from './general.js';

// Define animation elements
const animationElements = [
    { selector: '.player-card', containerSelector: '.players-grid' },
    { selector: '.section-title', containerSelector: 'section' },
    { selector: '.section-subtitle', containerSelector: 'section' }
];

// Player page initialization and functionality
document.addEventListener('DOMContentLoaded', () => {
    initializePlayerCards();
    initializeFilters();
    addSearchFunctionality();
    animateOnScroll(animationElements); // Use animateOnScroll instead of animatePlayerCards
    initializePositionAwareHover();
    setTimeout(checkInitialHash, 100);
});

// Player card setup and hover effects
function initializePlayerCards() {
    document.querySelectorAll('.player-card').forEach(card => {
        card.style.cursor = 'default';
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });
}

// Filter button functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const playerCards = document.querySelectorAll('.player-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPosition = button.getAttribute('data-position');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            filterPlayers(targetPosition, playerCards);

            const searchInput = document.querySelector('.player-search');
            if (searchInput) searchInput.value = '';

            history.replaceState(null, null, targetPosition === 'all' ? '#players' : `#${targetPosition}`);
        });
    });
}

// Position-aware hover effect initialization
function initializePositionAwareHover() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        // Add hover effect span to each button
        const hoverSpan = document.createElement('span');
        hoverSpan.className = 'hover-effect';
        button.appendChild(hoverSpan);

        // Mouse enter event
        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });

        // Mouse leave event
        button.addEventListener('mouseleave', (e) => {
            const rect = button.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            hoverSpan.style.top = relY + 'px';
            hoverSpan.style.left = relX + 'px';
        });
    });
}

// Filter players by position
function filterPlayers(position, cards) {
    cards.forEach(card => {
        const cardPosition = card.getAttribute('data-position');
        const shouldShow = position === 'all' || cardPosition === position;

        card.classList.toggle('filter-hidden', !shouldShow);
        card.classList.toggle('filter-visible', shouldShow);
    });
}

// Handle initial page hash
function checkInitialHash() {
    const hash = window.location.hash.substring(1);
    const validPositions = ['goalkeeper', 'defender', 'midfielder', 'attacker'];

    if (validPositions.includes(hash)) {
        const targetButton = document.querySelector(`[data-position="${hash}"]`);
        if (targetButton) targetButton.click();
    }
}

// Search functionality setup
function addSearchFunctionality() {
    const searchInput = document.querySelector('.player-search');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
}

// Handle search with filter combination
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const playerCards = document.querySelectorAll('.player-card');
    const activeFilter = document.querySelector('.filter-btn.active');
    const activePosition = activeFilter ? activeFilter.getAttribute('data-position') : 'all';

    playerCards.forEach(card => {
        const playerName = card.querySelector('.player-name').textContent.toLowerCase();
        const cardPosition = card.getAttribute('data-position');
        const matchesSearch = searchTerm === '' || playerName.includes(searchTerm);
        const matchesFilter = activePosition === 'all' || cardPosition === activePosition;

        card.classList.toggle('filter-hidden', !(matchesSearch && matchesFilter));
        card.classList.toggle('filter-visible', matchesSearch && matchesFilter);
    });
}

// Keyboard navigation for filters
document.addEventListener('keydown', (e) => {
    const searchInput = document.querySelector('.player-search');
    if (searchInput && document.activeElement === searchInput) return;

    const filterButtons = document.querySelectorAll('.filter-btn');
    const activeButton = document.querySelector('.filter-btn.active');
    const currentIndex = Array.from(filterButtons).indexOf(activeButton);

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        let newIndex;

        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : filterButtons.length - 1;
        } else {
            newIndex = currentIndex < filterButtons.length - 1 ? currentIndex + 1 : 0;
        }

        filterButtons[newIndex].focus();
        filterButtons[newIndex].click();
    }
});