/* Match Modal Component */
class MatchModal {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
    }

    /* Initialization */
    async init() {
        if (this.isInitialized) return;

        try {
            const response = await fetch('../../pages/components/matchModal.html');
            const modalHTML = await response.text();

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

    /* Event Listeners */
    setupEventListeners() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    /* Modal Control */
    show(matchData = {}) {
        if (!this.modal) return;

        const {
            title = 'Match Details',
            dateTime = { date: 'TBD', time: 'TBD' },
            season = 'Current Season',
            stadium = 'Home Stadium',
            goalscorers = [],
            score = null
        } = matchData;

        document.body.classList.add('modal-open');
        this.updateContent(title, dateTime, season, stadium, goalscorers, score);
        this.modal.style.display = 'flex';

        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }

    close() {
        if (!this.modal) return;
        document.body.classList.remove('modal-open');
        this.modal.style.display = 'none';
    }

    /* Content Updates */
    updateContent(title, dateTime, season, stadium, goalscorers, score) {
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) titleEl.textContent = title;

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

        const dateEl = this.modal.querySelector('#matchDate');
        const timeEl = this.modal.querySelector('#matchTime');
        if (dateEl && timeEl) {
            let dateValue = 'TBD';
            let timeValue = 'TBD';

            if (typeof dateTime === 'object' && dateTime.date && dateTime.time) {
                dateValue = dateTime.date;
                timeValue = dateTime.time;
            } else if (typeof dateTime === 'string') {
                if (dateTime.includes(' — ')) {
                    const [datePart, timePart] = dateTime.split(' — ');
                    dateValue = datePart;
                    const timeMatch = timePart.match(/\d{2}:\d{2}/);
                    timeValue = timeMatch ? timeMatch[0] : 'TBD';
                } else {
                    dateValue = dateTime;
                }
            }

            dateEl.innerHTML = `<i class="fas fa-calendar"></i> ${dateValue}`;
            timeEl.innerHTML = `<i class="fas fa-clock"></i> ${timeValue}`;
        }

        const seasonEl = this.modal.querySelector('#matchSeason');
        if (seasonEl) seasonEl.textContent = season;

        const stadiumEl = this.modal.querySelector('#stadiumName');
        if (stadiumEl) {
            stadiumEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${stadium}`;
        }

        this.updateGoalscorers(goalscorers);
    }

    /* Goalscorers Update */
    updateGoalscorers(goalscorers) {
        const goalscorersList = this.modal.querySelector('#goalscorersList');
        if (!goalscorersList) return;

        if (goalscorers.length === 0) {
            goalscorersList.innerHTML = '<li class="goalscorer-item">No goals scored</li>';
            return;
        }

        goalscorersList.innerHTML = '';
        const scorerCounts = {};

        if (typeof goalscorers[0] === 'object') {
            goalscorers.forEach(scorer => {
                const playerName = scorer.player || scorer.name;
                const goals = scorer.goals || 1;
                scorerCounts[playerName] = (scorerCounts[playerName] || 0) + goals;
            });
        } else if (typeof goalscorers[0] === 'string') {
            goalscorers.forEach(player => {
                scorerCounts[player] = (scorerCounts[player] || 0) + 1;
            });
        }

        Object.entries(scorerCounts).forEach(([player, goals], index) => {
            const li = document.createElement('li');
            li.className = 'goalscorer-item';
            li.style.animationDelay = `${(index + 1) * 0.1}s`;

            let footballIcons = '';
            for (let i = 0; i < goals; i++) {
                footballIcons += '<i class="fas fa-futbol"></i> ';
            }

            li.innerHTML = `${footballIcons}${player}`;
            goalscorersList.appendChild(li);
        });
    }
}

/* Global Instance */
window.matchModal = new MatchModal();

document.addEventListener('DOMContentLoaded', () => {
    window.matchModal.init();
});