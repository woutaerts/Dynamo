class AnimationManager {
    constructor() {
        this.observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        this.init();
    }

    // Initialize all functionality
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initToggle();
            this.setupStaggeredAnimations();
            setTimeout(() => this.animateCounters(), 500);
        });
    }

    // Toggle system management
    initToggle() {
        const toggles = {
            teamPlayer: document.getElementById('team-player-toggle'),
            seasonAlltime: document.getElementById('season-alltime-toggle')
        };

        const labels = {
            team: document.getElementById('label-team'),
            player: document.getElementById('label-player'),
            season: document.getElementById('label-season'),
            alltime: document.getElementById('label-alltime')
        };

        const sections = {
            teamSeason: document.getElementById('team-season-stats'),
            teamSeasonDetailed: document.getElementById('team-season-detailed'),
            teamAlltime: document.getElementById('team-alltime-stats'),
            playerSeason: document.getElementById('player-season-stats'),
            playerAlltime: document.getElementById('player-alltime-stats')
        };

        const updateView = () => {
            const isPlayer = toggles.teamPlayer.checked;
            const isAlltime = toggles.seasonAlltime.checked;

            // Update label states
            labels.team.classList.toggle('active', !isPlayer);
            labels.player.classList.toggle('active', isPlayer);
            labels.season.classList.toggle('active', !isAlltime);
            labels.alltime.classList.toggle('active', isAlltime);

            // Hide all sections
            Object.values(sections).forEach(section => section?.classList.add('hidden'));

            // Remove theme classes
            document.body.classList.remove('team-alltime', 'player-season', 'player-alltime');

            // Show appropriate sections and set theme
            if (!isPlayer && !isAlltime) {
                this.showSections([sections.teamSeason, sections.teamSeasonDetailed]);
            } else if (!isPlayer && isAlltime) {
                this.showSections([sections.teamAlltime]);
                document.body.classList.add('team-alltime');
            } else if (isPlayer && !isAlltime) {
                this.showSections([sections.playerSeason]);
                document.body.classList.add('player-season');
            } else {
                this.showSections([sections.playerAlltime]);
                document.body.classList.add('player-alltime');
            }
        };

        updateView();
        toggles.teamPlayer?.addEventListener('change', updateView);
        toggles.seasonAlltime?.addEventListener('change', updateView);
    }

    // Show sections with animation
    showSections(sectionsToShow) {
        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
                setTimeout(() => this.resetAndAnimateNewSection([section]), 100);
            }
        });
    }

    // Animation setup
    setupStaggeredAnimations() {
        const selectors = ['.stat-card', '.stat-category', '.player-card', '.scorer-card', '.record-category'];
        const elements = selectors.flatMap(selector => [...document.querySelectorAll(selector)]);
        elements.forEach(element => this.observer.observe(element));
    }

    // Intersection observer handler
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target.closest('section, .stats-section, .detailed-stats, .container, .all-time-stats');
                const elementsInSection = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');
                const index = Array.from(elementsInSection).indexOf(entry.target);

                setTimeout(() => {
                    entry.target.classList.add('card-animate-in');
                    const counter = entry.target.querySelector('.stat-number');
                    if (counter?.getAttribute('data-target')) {
                        this.animateCounter(counter);
                    }
                }, index * 200);

                this.observer.unobserve(entry.target);
            }
        });
    }

    // Counter animation
    animateCounter(counter) {
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

    // Animate all counters
    animateCounters() {
        document.querySelectorAll('.stat-number').forEach(counter => this.animateCounter(counter));
    }

    // Reset and animate new sections
    resetAndAnimateNewSection(sections) {
        sections.forEach(section => {
            if (!section) return;

            const elements = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');
            elements.forEach((element, index) => {
                element.classList.remove('card-animate-in');
                setTimeout(() => {
                    element.classList.add('card-animate-in');
                    const counter = element.querySelector('.stat-number');
                    if (counter?.getAttribute('data-target')) {
                        this.animateCounter(counter);
                    }
                }, index * 200);
            });
        });
    }
}

new AnimationManager();