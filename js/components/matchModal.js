/**
 * components/matchModal.js
 *
 * Extends ModalBase — FLIP open/close/clear and event binding are inherited.
 * This file owns only: HTML partial loading and content population.
 *
 * Removed (~60 lines of duplicate code):
 *   - bindEvents()       → ModalBase.bindEvents()
 *   - close()            → ModalBase._animateClose()
 *   - _clearAnimations() → ModalBase._clearAnimations()
 *   - FLIP geometry in show() → ModalBase._animateOpen(originEl)
 */
import { ModalBase } from '../utils/modal-base.js';

class MatchModal extends ModalBase {
    constructor() {
        super();
        // this.modal, this.isInitialized, this.originEl inherited from ModalBase
    }

    // ── Initialization ────────────────────────────────────────────────────────

    async init() {
        if (this.isInitialized) return;

        const placeholder = document.getElementById('match-modal-placeholder');
        if (!placeholder) return;

        try {
            const response = await fetch('/dynamo/html/components/matchModal.html');
            placeholder.innerHTML = await response.text();

            this.modal = document.getElementById('matchCenterModal');
            if (this.modal) {
                this.bindEvents();          // inherited from ModalBase
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('Failed to load match modal:', error);
        }
    }

    // ── Modal Control ─────────────────────────────────────────────────────────

    show(matchData = {}, originEl = null) {
        if (!this.modal) return;

        const {
            title       = 'Match Details',
            dateTime    = { date: 'TBD', time: 'TBD', displayDate: 'TBD' },
            season      = 'Current Season',
            stadium     = 'Home Stadium',
            goalscorers = [],
            score       = null,
            result      = null,
            isUpcoming  = false,
            isHome      = true,
            sponsor     = null
        } = matchData;

        // Apply result colour class to overlay
        const resultClass = !isUpcoming && result
            ? (result === 'winst' ? 'win' : result === 'gelijk' ? 'draw' : 'loss')
            : '';
        this.modal.classList.remove('win', 'draw', 'loss');
        if (resultClass) this.modal.classList.add(resultClass);

        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.toggle('upcoming-match', isUpcoming);
            this.renderContent(title, dateTime, season, stadium, goalscorers, score, isUpcoming, isHome, sponsor);
            modalContent.scrollTop = 0;

            const sections = modalContent.querySelectorAll(
                '.modal-match-score, .goalscorers-section, .date-time-section, .stadium-section'
            );
            sections.forEach(s => {
                if ((s.matches('.modal-match-score') && (isUpcoming || !score)) ||
                    (s.matches('.goalscorers-section') && isUpcoming)) {
                    s.style.display = 'none';
                } else {
                    s.style.display = s.matches('.modal-match-score') ? 'flex' : 'block';
                }
            });
        }

        this._animateOpen(originEl);    // inherited FLIP open
    }

    close() {
        this._animateClose();           // inherited FLIP close
    }

    // ── Content Population ────────────────────────────────────────────────────

    renderContent(title, dateTime, season, stadium, goalscorers, score, isUpcoming, isHome, sponsor) {
        // Title (home team / away team)
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) {
            const [homeTeam, awayTeam] = title.split(' vs ').map(t => t.trim());
            const homeEl = titleEl.querySelector('.home-team');
            const awayEl = titleEl.querySelector('.away-team');
            if (homeEl && awayEl) {
                homeEl.textContent = homeTeam || 'Home Team';
                awayEl.textContent = awayTeam || 'Away Team';
            }
        }

        // Score
        const scoreEl        = this.modal.querySelector('#modalMatchScore');
        const scoreDisplayEl = this.modal.querySelector('.score-display');
        if (scoreEl && scoreDisplayEl) {
            scoreEl.style.display = isUpcoming ? 'none' : 'flex';
            if (score && !isUpcoming) scoreDisplayEl.textContent = score;
        }

        // Date & Time
        const dateEl = this.modal.querySelector('#matchDate');
        const timeEl = this.modal.querySelector('#matchTime');
        if (dateEl && timeEl) {
            dateEl.innerHTML = `<i class="fas fa-calendar"></i> ${dateTime.displayDate || 'TBD'}`;
            timeEl.innerHTML = `<i class="fas fa-clock"></i> ${dateTime.time || 'TBD'}`;
        }

        // Season label
        const seasonEl = this.modal.querySelector('#matchSeason');
        if (seasonEl) seasonEl.textContent = season;

        // Stadium
        const stadiumEl = this.modal.querySelector('#stadiumName');
        if (stadiumEl) stadiumEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${stadium}`;

        // Goalscorers
        const goalscorersSection = this.modal.querySelector('.goalscorers-section');
        if (goalscorersSection) {
            goalscorersSection.style.display = isUpcoming ? 'none' : 'block';
            if (!isUpcoming) this.renderGoalscorers(goalscorers);
        }

        // Sponsor
        const sponsorSection = this.modal.querySelector('#modalMatchSponsor');
        if (sponsorSection) {
            if (sponsor?.name && sponsor?.logo) {
                sponsorSection.style.display = 'block';

                const sponsorLogo = this.modal.querySelector('#modalSponsorLogo');
                if (sponsorLogo) { sponsorLogo.src = sponsor.logo; sponsorLogo.alt = `Sponsor: ${sponsor.name}`; }

                const sponsorLink = this.modal.querySelector('#modalSponsorLink');
                if (sponsorLink) { sponsorLink.href = sponsor.url || '#'; sponsorLink.title = `Bezoek ${sponsor.name}`; }

                const sponsorName = this.modal.querySelector('#modalSponsorName');
                if (sponsorName) sponsorName.textContent = sponsor.name;
            } else {
                sponsorSection.style.display = 'none';
            }
        }
    }

    renderGoalscorers(goalscorers) {
        const list = this.modal.querySelector('#goalscorersList');
        if (!list) return;

        if (goalscorers.length === 0) {
            list.innerHTML = '<li class="goalscorer-item">Geen doelpuntenmakers</li>';
            return;
        }

        list.innerHTML = '';
        const counts = {};

        if (typeof goalscorers[0] === 'object') {
            goalscorers.forEach(s => {
                const name = s.player || s.name;
                counts[name] = (counts[name] || 0) + (s.goals || 1);
            });
        } else {
            goalscorers.forEach(name => { counts[name] = (counts[name] || 0) + 1; });
        }

        Object.entries(counts).forEach(([player, goals]) => {
            const li     = document.createElement('li');
            li.className = 'goalscorer-item';
            li.innerHTML = `${'<i class="fas fa-futbol"></i> '.repeat(goals)}${player}`;
            list.appendChild(li);
        });
    }
}

// ── Global Instance ───────────────────────────────────────────────────────────

window.matchModal = new MatchModal();

document.addEventListener('DOMContentLoaded', () => {
    window.matchModal.init();
});