class AnimationManager {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        this.initialize();
    }

    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initToggle();
            this.setupStaggeredAnimations();
            setTimeout(() => this.animateCounters(), 500);
        });
    }

    initToggle() {
        const teamPlayerToggle = document.getElementById('team-player-toggle');
        const seasonAlltimeToggle = document.getElementById('season-alltime-toggle');

        const labelTeam = document.getElementById('label-team');
        const labelSpeler = document.getElementById('label-player');
        const labelSeizoen = document.getElementById('label-season');
        const labelAlltime = document.getElementById('label-alltime');

        const teamSeasonStats = document.getElementById('team-season-stats');
        const teamSeasonDetailed = document.getElementById('team-season-detailed');
        const teamAlltimeStats = document.getElementById('team-alltime-stats');
        const playerSeasonStats = document.getElementById('player-season-stats');
        const playerAlltimeStats = document.getElementById('player-alltime-stats');

        const updateView = () => {
            const isPlayer = teamPlayerToggle.checked;
            const isAlltime = seasonAlltimeToggle.checked;

            // Update labels
            labelTeam.classList.toggle('active', !isPlayer);
            labelSpeler.classList.toggle('active', isPlayer);
            labelSeizoen.classList.toggle('active', !isAlltime);
            labelAlltime.classList.toggle('active', isAlltime);

            // Hide all sections first
            [teamSeasonStats, teamSeasonDetailed, teamAlltimeStats, playerSeasonStats, playerAlltimeStats].forEach(section => {
                if (section) section.classList.add('hidden');
            });

            // Remove all theme classes
            document.body.classList.remove('team-alltime', 'player-season', 'player-alltime');

            // Show appropriate section and set theme
            if (!isPlayer && !isAlltime) {
                teamSeasonStats?.classList.remove('hidden');
                teamSeasonDetailed?.classList.remove('hidden');
                setTimeout(() => this.resetAndAnimateNewSection([teamSeasonStats, teamSeasonDetailed]), 100);
            } else if (!isPlayer && isAlltime) {
                teamAlltimeStats?.classList.remove('hidden');
                document.body.classList.add('team-alltime');
                setTimeout(() => this.resetAndAnimateNewSection([teamAlltimeStats]), 100);
            } else if (isPlayer && !isAlltime) {
                playerSeasonStats?.classList.remove('hidden');
                document.body.classList.add('player-season');
                setTimeout(() => this.resetAndAnimateNewSection([playerSeasonStats]), 100);
            } else {
                playerAlltimeStats?.classList.remove('hidden');
                document.body.classList.add('player-alltime');
                setTimeout(() => this.resetAndAnimateNewSection([playerAlltimeStats]), 100);
            }
        };

        // Initialize view on load
        updateView();

        // Add event listeners for toggle changes
        teamPlayerToggle?.addEventListener('change', updateView);
        seasonAlltimeToggle?.addEventListener('change', updateView);
    }

    setupStaggeredAnimations() {
        const elements = [
            ...document.querySelectorAll('.stat-card'),
            ...document.querySelectorAll('.stat-category'),
            ...document.querySelectorAll('.player-card'),
            ...document.querySelectorAll('.scorer-card'),
            ...document.querySelectorAll('.record-category')
        ];

        elements.forEach(element => this.observer.observe(element));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target.closest('section') || entry.target.closest('.stats-section, .detailed-stats, .container, .all-time-stats');
                const elementsInSection = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');
                const index = Array.from(elementsInSection).indexOf(entry.target);

                setTimeout(() => {
                    entry.target.classList.add('card-animate-in');
                    if (entry.target.classList.contains('stat-card')) {
                        const counter = entry.target.querySelector('.stat-number');
                        if (counter && counter.getAttribute('data-target')) {
                            this.animateCounter(counter);
                        }
                    }
                }, index * 200);

                this.observer.unobserve(entry.target);
            }
        });
    }

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

    animateCounters() {
        document.querySelectorAll('.stat-number').forEach(this.animateCounter.bind(this));
    }

    resetAndAnimateNewSection(sections) {
        sections.forEach(section => {
            if (!section) return;

            const elements = section.querySelectorAll('.stat-card, .stat-category, .player-card, .scorer-card, .record-category');
            elements.forEach((element, index) => {
                element.classList.remove('card-animate-in');
                setTimeout(() => {
                    element.classList.add('card-animate-in');
                    if (element.classList.contains('stat-card')) {
                        const counter = element.querySelector('.stat-number');
                        if (counter && counter.getAttribute('data-target')) {
                            this.animateCounter(counter);
                        }
                    }
                }, index * 200);
            });
        });
    }
}

new AnimationManager();
