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

// Setup staggered animations for statistics elements
function setupStaggeredAnimations() {
    // Select all animatable elements in statistics sections
    const animatableElements = document.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all similar elements in the same section
                const section = entry.target.closest('section') || entry.target.closest('.container') || entry.target.closest('.stats-section') || entry.target.closest('.detailed-stats') || entry.target.closest('.all-time-stats') || entry.target.closest('.toggles-container');

                // Define different selectors for different types of elements
                let sectionElements;
                if (entry.target.classList.contains('stat-card')) {
                    sectionElements = section.querySelectorAll('.stat-card');
                } else if (entry.target.classList.contains('stat-category')) {
                    sectionElements = section.querySelectorAll('.stat-category');
                } else if (entry.target.classList.contains('player-card')) {
                    sectionElements = section.querySelectorAll('.player-card');
                } else if (entry.target.classList.contains('scorer-card')) {
                    sectionElements = section.querySelectorAll('.scorer-card');
                } else if (entry.target.classList.contains('record-category')) {
                    sectionElements = section.querySelectorAll('.record-category');
                } else if (entry.target.classList.contains('toggle-wrapper')) {
                    sectionElements = section.querySelectorAll('.toggle-wrapper');
                } else {
                    // Fallback for any other elements
                    sectionElements = [entry.target];
                }

                // Convert NodeList to Array and find the index of current element
                const elementIndex = Array.from(sectionElements).indexOf(entry.target);

                // Apply staggered delay: 150ms between each element
                // Use shorter delay for smaller elements like toggle-wrapper
                let baseDelay = entry.target.classList.contains('toggle-wrapper') ?
                    elementIndex * 100 : elementIndex * 150;

                setTimeout(() => {
                    entry.target.classList.add('animate-in');

                    // Trigger counter animation for stat cards
                    if (entry.target.classList.contains('stat-card')) {
                        const counter = entry.target.querySelector('.stat-number');
                        if (counter && counter.getAttribute('data-target')) {
                            animateCounter(counter);
                        }
                    }
                }, baseDelay);

                obs.unobserve(entry.target); // Stop observing after animation is triggered
            }
        });
    }, observerOptions);

    // Set initial state and observe all elements
    animatableElements.forEach(element => {
        // Set initial invisible state
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        // Observe for intersection
        observer.observe(element);
    });
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
            // Team + Season (default - no class needed, handled by default CSS)
            teamSeasonStats?.classList.remove('hidden');
            teamSeasonDetailed?.classList.remove('hidden');
            setTimeout(() => {
                resetAndAnimateNewSection([teamSeasonStats, teamSeasonDetailed]);
            }, 100);
        } else if (!isPlayer && isAlltime) {
            // Team + All Time
            teamAlltimeStats?.classList.remove('hidden');
            document.body.classList.add('team-alltime');
            setTimeout(() => {
                resetAndAnimateNewSection([teamAlltimeStats]);
            }, 100);
        } else if (isPlayer && !isAlltime) {
            // Player + Season
            playerSeasonStats?.classList.remove('hidden');
            document.body.classList.add('player-season');
            setTimeout(() => {
                resetAndAnimateNewSection([playerSeasonStats]);
            }, 100);
        } else {
            // Player + All Time
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

// Reset and animate new section when switching views
function resetAndAnimateNewSection(sections) {
    sections.forEach(section => {
        if (!section) return;

        // Find all animatable elements in the new section
        const elements = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');

        elements.forEach((element, index) => {
            // Reset animation state
            element.classList.remove('animate-in');
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';

            // Apply staggered animation
            setTimeout(() => {
                element.classList.add('animate-in');

                // Trigger counter animation for stat cards
                if (element.classList.contains('stat-card')) {
                    const counter = element.querySelector('.stat-number');
                    if (counter && counter.getAttribute('data-target')) {
                        animateCounter(counter);
                    }
                }
            }, index * 150);
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