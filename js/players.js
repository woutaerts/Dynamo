// Players page interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page
    initializePlayerCards();
    initializeFilters();
    addSearchFunctionality();

    // Check for hash on page load after a short delay
    setTimeout(() => {
        checkInitialHash();
    }, 100);
});

// Initialize player cards
function initializePlayerCards() {
    const cards = document.querySelectorAll('.player-card');

    cards.forEach((card, index) => {
        // Remove click event for modal (as requested)
        card.style.cursor = 'default';

        // Keep hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const playerCards = document.querySelectorAll('.player-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPosition = button.getAttribute('data-position');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter players
            filterPlayers(targetPosition, playerCards);

            // Clear search when filter changes
            const searchInput = document.querySelector('.player-search');
            if (searchInput) {
                searchInput.value = '';
            }

            // Update URL hash for bookmarking
            history.replaceState(null, null, targetPosition === 'all' ? '#players' : `#${targetPosition}`);
        });
    });
}

// Filter players based on position
function filterPlayers(position, cards) {
    cards.forEach((card) => {
        const cardPosition = card.getAttribute('data-position');
        const shouldShow = position === 'all' || cardPosition === position;

        if (shouldShow) {
            card.classList.remove('filter-hidden');
            card.classList.add('filter-visible');
        } else {
            card.classList.add('filter-hidden');
            card.classList.remove('filter-visible');
        }
    });
}

// Check initial hash on page load
function checkInitialHash() {
    const hash = window.location.hash.substring(1);
    const validPositions = ['goalkeeper', 'defender', 'midfielder', 'attacker'];

    if (validPositions.includes(hash)) {
        const targetButton = document.querySelector(`[data-position="${hash}"]`);
        if (targetButton) {
            targetButton.click();
        }
    }
}

// Add search functionality
function addSearchFunctionality() {
    const searchInput = document.querySelector('.player-search');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Handle search functionality
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

        if (matchesSearch && matchesFilter) {
            card.classList.remove('filter-hidden');
            card.classList.add('filter-visible');
        } else {
            card.classList.add('filter-hidden');
            card.classList.remove('filter-visible');
        }
    });
}

// Add keyboard navigation support for filters
document.addEventListener('keydown', (e) => {
    // Only handle arrow keys if search input is not focused
    const searchInput = document.querySelector('.player-search');
    if (searchInput && document.activeElement === searchInput) {
        return;
    }

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