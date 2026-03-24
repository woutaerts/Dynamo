/* Match Modal Component */
class MatchModal {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
        this.scrollPosition = 0; // Store scroll position
    }

    /* Initialization */
    async init() {
        if (this.isInitialized) return;

        const placeholder = document.getElementById('match-modal-placeholder');
        if (!placeholder) return;

        placeholder.style.opacity = '0';
        placeholder.style.visibility = 'hidden';

        try {
            const response = await fetch('/dynamo/html/components/matchModal.html');
            placeholder.innerHTML = await response.text();

            this.modal = document.getElementById('matchCenterModal');
            if (this.modal) {
                this.modal.style.display = 'none';
                this.setupEventListeners();
                this.isInitialized = true;

                placeholder.style.opacity = '1';
                placeholder.style.visibility = 'visible';
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
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });
    }

    /* Scroll to Self */
    scrollToSelf() {
        if (this.modal) {
            const rect = this.modal.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const targetPosition = rect.top + scrollTop - 50; // Adjust offset as needed
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn('Match modal not found for autoscroll');
        }
    }

    show(matchData = {}) {
        if (!this.modal) return;

        this.scrollPosition = window.scrollY || document.documentElement.scrollTop;

        const {
            title = 'Match Details',
            dateTime = {date: 'TBD', time: 'TBD', displayDate: 'TBD'},
            season = 'Current Season',
            stadium = 'Home Stadium',
            goalscorers = [],
            score = null,
            result = null,
            isUpcoming = false,
            isHome = true,
            sponsor = null
        } = matchData;

        document.body.classList.add('modal-open');

        const resultClass = !isUpcoming && result
            ? (result === 'winst' ? 'win' : result === 'gelijk' ? 'draw' : 'loss')
            : '';

        this.modal.classList.remove('win', 'draw', 'loss');
        if (resultClass) {
            this.modal.classList.add(resultClass);
        }

        // Update content first
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.toggle('upcoming-match', isUpcoming);
            this.updateContent(title, dateTime, season, stadium, goalscorers, score, isUpcoming, isHome, sponsor);
        }

        // Now show modal
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');  // triggers fade-in

        // Animation & scroll
        if (modalContent) {
            modalContent.scrollTop = 0;
            const sections = modalContent.querySelectorAll('.modal-match-score, .goalscorers-section, .date-time-section, .stadium-section');
            sections.forEach(section => section.classList.remove('animate-in'));
            sections.forEach((section, index) => {
                if ((section.matches('.modal-match-score') && (isUpcoming || !score)) ||
                    (section.matches('.goalscorers-section') && isUpcoming)) {
                    section.style.display = 'none';
                } else {
                    section.style.display = section.matches('.modal-match-score') ? 'flex' : 'block';
                    setTimeout(() => section.classList.add('animate-in'), index * 100);
                }
            });
        } else {
            console.warn('Modal content not found');
        }

        setTimeout(() => this.scrollToSelf(), 100);
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('show');
        document.body.classList.remove('modal-open');

        setTimeout(() => {
            this.modal.style.display = 'none';
            window.scrollTo({
                top: this.scrollPosition,
                behavior: 'smooth'
            });
        }, 300); // match CSS transition duration
    }

    /* Content Updates */
    updateContent(title, dateTime, season, stadium, goalscorers, score, isUpcoming, isHome, sponsor) {
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) {
            const [homeTeam, awayTeam] = title.split(' vs ').map(team => team.trim());
            const homeTeamEl = titleEl.querySelector('.home-team');
            const awayTeamEl = titleEl.querySelector('.away-team');
            if (homeTeamEl && awayTeamEl) {
                homeTeamEl.textContent = homeTeam || 'Home Team';
                awayTeamEl.textContent = awayTeam || 'Away Team';
            }
        }

        const scoreEl = this.modal.querySelector('#modalMatchScore');
        const scoreDisplayEl = this.modal.querySelector('.score-display');
        if (scoreEl && scoreDisplayEl) {
            scoreEl.style.display = isUpcoming ? 'none' : 'flex';
            if (score && !isUpcoming) {
                scoreDisplayEl.textContent = score;
            }
        }

        const dateEl = this.modal.querySelector('#matchDate');
        const timeEl = this.modal.querySelector('#matchTime');
        if (dateEl && timeEl) {
            // Simplified: Direct assignment from the data object
            const dateValue = dateTime.displayDate || 'TBD';
            const timeValue = dateTime.time || 'TBD';

            dateEl.innerHTML = `<i class="fas fa-calendar"></i> ${dateValue}`;
            timeEl.innerHTML = `<i class="fas fa-clock"></i> ${timeValue}`;
        }

        const seasonEl = this.modal.querySelector('#matchSeason');
        if (seasonEl) seasonEl.textContent = season;

        const stadiumEl = this.modal.querySelector('#stadiumName');
        if (stadiumEl) {
            stadiumEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${stadium}`;
        }

        const goalscorersSection = this.modal.querySelector('.goalscorers-section');
        if (goalscorersSection) {
            goalscorersSection.style.display = isUpcoming ? 'none' : 'block';
            if (!isUpcoming) {
                this.updateGoalscorers(goalscorers);
            }
        }

        const sponsorSection = this.modal.querySelector('#modalMatchSponsor');
        const sponsorLogo = this.modal.querySelector('#modalSponsorLogo');
        const sponsorLink = this.modal.querySelector('#modalSponsorLink');
        const sponsorName = this.modal.querySelector('#modalSponsorName');

        if (sponsorSection) {
            if (sponsor && sponsor.name && sponsor.logo) {
                sponsorSection.style.display = 'block';

                if (sponsorLogo) {
                    sponsorLogo.src = sponsor.logo;
                    sponsorLogo.alt = `Sponsor: ${sponsor.name}`;
                }

                if (sponsorLink) {
                    sponsorLink.href = sponsor.url || '#';
                    sponsorLink.title = `Bezoek ${sponsor.name}`;
                }

                if (sponsorName) {
                    sponsorName.textContent = sponsor.name;
                }
            } else {
                sponsorSection.style.display = 'none';
            }
        }
    }

    /* Goalscorers Update */
    updateGoalscorers(goalscorers) {
        const goalscorersList = this.modal.querySelector('#goalscorersList');
        if (!goalscorersList) return;

        if (goalscorers.length === 0) {
            goalscorersList.innerHTML = '<li class="goalscorer-item">Geen doelpuntenmakers</li>';
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

        Object.entries(scorerCounts).forEach(([player, goals]) => {
            const li = document.createElement('li');
            li.className = 'goalscorer-item';

            const footballIcons = '<i class="fas fa-futbol"></i> '.repeat(goals);

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