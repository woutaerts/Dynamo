// Match Modal Component
class MatchModal {
    constructor() {
        this.modal = null;
        this.map = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Load modal HTML
            const response = await fetch('../../pages/components/matchModal.html');
            const modalHTML = await response.text();

            // Insert modal into placeholder
            const placeholder = document.getElementById('match-modal-placeholder');
            if (placeholder) {
                placeholder.innerHTML = modalHTML;
                this.modal = document.getElementById('matchCenterModal');
                this.setupEventListeners();
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('Failed to load match modal:', error);
        }
    }

    setupEventListeners() {
        if (!this.modal) return;

        // Close modal functionality
        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });
    }

    show(matchData = {}) {
        if (!this.modal) return;

        const {
            title = 'Match Center',
            venue = 'Home Stadium',
            lat = 50.9704,
            lng = 5.7734,
            events = [],
            playerStats = [],
            keyStats = []
        } = matchData;

        // Update modal content
        this.updateContent(title, venue, events, playerStats, keyStats);

        // Show modal
        this.modal.style.display = 'flex';

        // Initialize map after modal is visible
        setTimeout(() => {
            this.initializeMap(lat, lng, venue);
        }, 100);
    }

    close() {
        if (!this.modal) return;

        this.modal.style.display = 'none';
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    updateContent(title, venue, events, playerStats, keyStats) {
        // Update title
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) titleEl.textContent = title;

        // Update venue
        const venueEl = this.modal.querySelector('#venueInfo');
        if (venueEl) venueEl.textContent = venue;

        // Update match events if provided
        if (events.length > 0) {
            const eventsEl = this.modal.querySelector('.match-events');
            if (eventsEl) {
                eventsEl.innerHTML = events.map(event => `<li>${event}</li>`).join('');
            }
        }

        // Update player stats if provided
        if (playerStats.length > 0) {
            const statsEl = this.modal.querySelector('.player-stats');
            if (statsEl) {
                statsEl.innerHTML = playerStats.map(stat => `<li>${stat}</li>`).join('');
            }
        }

        // Update key stats if provided
        if (keyStats.length > 0) {
            const keyStatsEl = this.modal.querySelector('.key-stats');
            if (keyStatsEl) {
                keyStatsEl.innerHTML = keyStats.map(stat => `<li>${stat}</li>`).join('');
            }
        }
    }

    initializeMap(lat, lng, venueName) {
        // Remove existing map if it exists
        if (this.map) {
            this.map.remove();
        }

        const mapContainer = this.modal.querySelector('#matchMap');
        if (!mapContainer) return;

        try {
            // Create new map centered on the venue
            this.map = L.map('matchMap').setView([lat, lng], 15);

            // Add OpenStreetMap tile layer (free!)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Add a marker for the venue
            const marker = L.marker([lat, lng]).addTo(this.map);
            marker.bindPopup(`<strong>${venueName}</strong><br>Match Venue`).openPopup();
        } catch (error) {
            console.error('Failed to initialize map:', error);
        }
    }
}

// Create global instance
window.matchModal = new MatchModal();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matchModal.init();
});