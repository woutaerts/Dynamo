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

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    show(matchData = {}) {
        if (!this.modal) return;

        const {
            title = 'Match Details',
            dateTime = 'TBD',
            season = 'Current Season',
            stadium = 'Home Stadium',
            lat = 50.9704,
            lng = 5.7734,
            goalscorers = [],
            score = null // Added score parameter
        } = matchData;

        // Prevent body scrolling
        document.body.classList.add('modal-open');

        // Update modal content
        this.updateContent(title, dateTime, season, stadium, goalscorers, score);

        // Show modal
        this.modal.style.display = 'flex';

        // Reset scroll position to top
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }

        // Initialize map after modal is visible
        setTimeout(() => {
            this.initializeMap(lat, lng, stadium);
        }, 100);
    }

    close() {
        if (!this.modal) return;

        // Re-enable body scrolling
        document.body.classList.remove('modal-open');

        this.modal.style.display = 'none';
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    updateContent(title, dateTime, season, stadium, goalscorers, score) {
        // Update title
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) titleEl.textContent = title;

        // Update score - Added score handling
        const scoreEl = this.modal.querySelector('#modalMatchScore');
        const scoreDisplayEl = this.modal.querySelector('.score-display');
        if (scoreEl && scoreDisplayEl) {
            if (score) {
                scoreDisplayEl.textContent = score;
                scoreEl.style.display = 'flex';
            } else {
                scoreEl.style.display = 'none';
            }
        }

        // Update date and time - format for centered display
        const dateTimeEl = this.modal.querySelector('#matchDateTime');
        if (dateTimeEl) {
            // Handle different dateTime formats
            if (typeof dateTime === 'object' && dateTime.date && dateTime.time) {
                dateTimeEl.innerHTML = `${dateTime.date}<br>${dateTime.time}`;
            } else if (typeof dateTime === 'string') {
                // If it already contains <br>, use as is
                if (dateTime.includes('<br>')) {
                    dateTimeEl.innerHTML = dateTime;
                } else {
                    // Try to parse different formats
                    const dateTimeStr = dateTime.toString();

                    // Handle "May 21, 2025 — 2-1" format
                    if (dateTimeStr.includes(' — ')) {
                        const parts = dateTimeStr.split(' — ');
                        const datePart = parts[0];
                        const timePart = parts[1];

                        // Check if the second part contains time (HH:MM format)
                        const timeMatch = timePart.match(/\d{2}:\d{2}/);
                        if (timeMatch) {
                            dateTimeEl.innerHTML = `${datePart}<br>${timeMatch[0]}`;
                        } else {
                            // If no time found, just show the date
                            dateTimeEl.innerHTML = datePart;
                        }
                    } else {
                        // Default: just show the dateTime as is
                        dateTimeEl.innerHTML = dateTimeStr;
                    }
                }
            } else {
                dateTimeEl.innerHTML = dateTime.toString();
            }
        }

        // Update season
        const seasonEl = this.modal.querySelector('#matchSeason');
        if (seasonEl) seasonEl.textContent = season;

        // Update stadium
        const stadiumEl = this.modal.querySelector('#stadiumName');
        if (stadiumEl) stadiumEl.textContent = stadium;

        // Update goalscorers
        this.updateGoalscorers(goalscorers);
    }

    updateGoalscorers(goalscorers) {
        const goalscorersList = this.modal.querySelector('#goalscorersList');
        if (!goalscorersList) return;

        if (goalscorers.length === 0) {
            goalscorersList.innerHTML = '<li class="goalscorer-item">No goals scored</li>';
            return;
        }

        // Clear existing content
        goalscorersList.innerHTML = '';

        // Process goalscorers data
        const scorerCounts = {};

        // If goalscorers is an array of objects with player names
        if (typeof goalscorers[0] === 'object') {
            goalscorers.forEach(scorer => {
                const playerName = scorer.player || scorer.name;
                const goals = scorer.goals || 1; // Use goals property if present, else default to 1
                scorerCounts[playerName] = (scorerCounts[playerName] || 0) + goals;
            });
        }
        // If goalscorers is an array of player names
        else if (typeof goalscorers[0] === 'string') {
            goalscorers.forEach(player => {
                scorerCounts[player] = (scorerCounts[player] || 0) + 1;
            });
        }

        // Create list items with football icons
        Object.entries(scorerCounts).forEach(([player, goals], index) => {
            const li = document.createElement('li');
            li.className = 'goalscorer-item';
            li.style.animationDelay = `${(index + 1) * 0.1}s`;

            // Create football icons based on number of goals
            let footballIcons = '';
            for (let i = 0; i < goals; i++) {
                footballIcons += '<i class="fas fa-futbol"></i> ';
            }

            // Set the content with icons and player name
            li.innerHTML = `${footballIcons}${player}`;

            goalscorersList.appendChild(li);
        });
    }

    initializeMap(lat, lng, stadiumName) {
        // Remove existing map if it exists
        if (this.map) {
            this.map.remove();
        }

        const mapContainer = this.modal.querySelector('#matchMap');
        if (!mapContainer) return;

        try {
            // Create new map centered on the stadium
            this.map = L.map('matchMap').setView([lat, lng], 15);

            // Add OpenStreetMap tile layer (free!)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Add a marker for the stadium
            const marker = L.marker([lat, lng]).addTo(this.map);
            marker.bindPopup(`<strong>${stadiumName}</strong><br>Match Venue`).openPopup();
        } catch (error) {
            console.error('Failed to initialize map:', error);
            // Show fallback message if map fails to load
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(0,0,0,0.1); color: #666; font-family: Poppins,serif;">
                    <p>Map unavailable</p>
                </div>
            `;
        }
    }
}

// Create global instance
window.matchModal = new MatchModal();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matchModal.init();
});