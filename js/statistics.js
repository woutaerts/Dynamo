// Counter animation function
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Simplified setup staggered animations - matching index.js approach
function setupStaggeredAnimations() {
    // Select all animatable elements (same as before)
    const statCards = document.querySelectorAll('.stat-card');
    const statCategories = document.querySelectorAll('.stat-category');
    const playerCards = document.querySelectorAll('.player-card');
    const scorerCards = document.querySelectorAll('.scorer-card');
    const recordCategories = document.querySelectorAll('.record-category');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle stat cards
                if (entry.target.classList.contains('stat-card')) {
                    const section = entry.target.closest('section') || entry.target.closest('.stats-section');
                    const cardsInSection = section.querySelectorAll('.stat-card');
                    const cardIndex = Array.from(cardsInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');

                        // Trigger counter animation
                        const counter = entry.target.querySelector('.stat-number');
                        if (counter && counter.getAttribute('data-target')) {
                            animateCounter(counter);
                        }
                    }, cardIndex * 200);
                }

                // Handle stat categories
                else if (entry.target.classList.contains('stat-category')) {
                    const section = entry.target.closest('section') || entry.target.closest('.detailed-stats');
                    const categoriesInSection = section.querySelectorAll('.stat-category');
                    const categoryIndex = Array.from(categoriesInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, categoryIndex * 200);
                }

                // Handle player cards
                else if (entry.target.classList.contains('player-card')) {
                    const section = entry.target.closest('section') || entry.target.closest('.container');
                    const cardsInSection = section.querySelectorAll('.player-card');
                    const cardIndex = Array.from(cardsInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, cardIndex * 200);
                }

                // Handle scorer cards
                else if (entry.target.classList.contains('scorer-card')) {
                    const section = entry.target.closest('section') || entry.target.closest('.all-time-stats');
                    const cardsInSection = section.querySelectorAll('.scorer-card');
                    const cardIndex = Array.from(cardsInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, cardIndex * 200);
                }

                // Handle record categories
                else if (entry.target.classList.contains('record-category')) {
                    const section = entry.target.closest('section') || entry.target.closest('.all-time-stats');
                    const categoriesInSection = section.querySelectorAll('.record-category');
                    const categoryIndex = Array.from(categoriesInSection).indexOf(entry.target);

                    setTimeout(() => {
                        entry.target.classList.add('card-animate-in');
                    }, categoryIndex * 200);
                }

                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements
    statCards.forEach(card => observer.observe(card));
    statCategories.forEach(category => observer.observe(category));
    playerCards.forEach(card => observer.observe(card));
    scorerCards.forEach(card => observer.observe(card));
    recordCategories.forEach(category => observer.observe(category));
}

// Animate individual counter
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    if (!target) return;

    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current);
    }, 16);
}

// Toggle functionality for stats and labels
function initToggle() {
    const teamPlayerToggle = document.getElementById('team-player-toggle');
    const seasonAlltimeToggle = document.getElementById('season-alltime-toggle');

    // Labels
    const labelTeam = document.getElementById('label-team');
    const labelSpeler = document.getElementById('label-speler');
    const labelSeizoen = document.getElementById('label-seizoen');
    const labelAlltime = document.getElementById('label-alltime');

    // Content sections
    const teamSeasonStats = document.getElementById('team-season-stats');
    const teamSeasonDetailed = document.getElementById('team-season-detailed');
    const teamAlltimeStats = document.getElementById('team-alltime-stats');
    const playerSeasonStats = document.getElementById('player-season-stats');
    const playerAlltimeStats = document.getElementById('player-alltime-stats');

    function updateView() {
        const isPlayer = teamPlayerToggle.checked;
        const isAlltime = seasonAlltimeToggle.checked;

        // Update labels
        if (isPlayer) {
            labelTeam.classList.remove('active');
            labelSpeler.classList.add('active');
        } else {
            labelTeam.classList.add('active');
            labelSpeler.classList.remove('active');
        }

        if (isAlltime) {
            labelSeizoen.classList.remove('active');
            labelAlltime.classList.add('active');
        } else {
            labelSeizoen.classList.add('active');
            labelAlltime.classList.remove('active');
        }

        // Hide all sections first
        const allSections = [teamSeasonStats, teamSeasonDetailed, teamAlltimeStats, playerSeasonStats, playerAlltimeStats];
        allSections.forEach(section => {
            if (section) section.classList.add('hidden');
        });

        // Remove all theme classes
        document.body.classList.remove('team-alltime', 'player-season', 'player-alltime');

        // Show appropriate section and set theme
        if (!isPlayer && !isAlltime) {
            teamSeasonStats?.classList.remove('hidden');
            teamSeasonDetailed?.classList.remove('hidden');
            setTimeout(() => {
                resetAndAnimateNewSection([teamSeasonStats, teamSeasonDetailed]);
            }, 100);
        } else if (!isPlayer && isAlltime) {
            teamAlltimeStats?.classList.remove('hidden');
            document.body.classList.add('team-alltime');
            setTimeout(() => {
                resetAndAnimateNewSection([teamAlltimeStats]);
            }, 100);
        } else if (isPlayer && !isAlltime) {
            playerSeasonStats?.classList.remove('hidden');
            document.body.classList.add('player-season');
            setTimeout(() => {
                resetAndAnimateNewSection([playerSeasonStats]);
            }, 100);
        } else {
            playerAlltimeStats?.classList.remove('hidden');
            document.body.classList.add('player-alltime');
            setTimeout(() => {
                resetAndAnimateNewSection([playerAlltimeStats]);
            }, 100);
        }
    }

    // Initialize view on load
    updateView();

    // Add event listeners for toggle changes
    teamPlayerToggle?.addEventListener('change', updateView);
    seasonAlltimeToggle?.addEventListener('change', updateView);
}

// Updated reset and animate function to use card-animate-in class
function resetAndAnimateNewSection(sections) {
    sections.forEach(section => {
        if (!section) return;

        // Find all animatable elements in the new section
        const elements = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');

        elements.forEach((element, index) => {
            // Reset animation state - remove the card-animate-in class
            element.classList.remove('card-animate-in');

            // Apply staggered animation using the same class as index.js
            setTimeout(() => {
                element.classList.add('card-animate-in');

                // Trigger counter animation for stat cards
                if (element.classList.contains('stat-card')) {
                    const counter = element.querySelector('.stat-number');
                    if (counter && counter.getAttribute('data-target')) {
                        animateCounter(counter);
                    }
                }
            }, index * 200); // Using 200ms delay like index.js
        });
    });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize toggle functionality
    initToggle();

    // Setup staggered intersection animations
    setupStaggeredAnimations();

    // Initial counter animation for visible elements
    setTimeout(() => {
        animateCounters();
    }, 500);
});