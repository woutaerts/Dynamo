/**
 * components/matchModal.js
 *
 * Changes:
 *   - `setupEventListeners` → `bindEvents`       (bind* for event attachment)
 *   - `scrollToSelf`        → `scrollModalIntoView` (avoids clash with native scrollIntoView)
 *   - `updateContent`       → `renderContent`    (render* for DOM population)
 *   - `updateGoalscorers`   → `renderGoalscorers` (consistent render* pattern)
 */

class MatchModal {
    constructor() {
        this.modal          = null;
        this.isInitialized  = false;
        this.scrollPosition = 0;
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
                this.bindEvents();
                this.isInitialized = true;

            }
        } catch (error) {
            console.error('Failed to load match modal:', error);
        }
    }

    // ── Event Binding ─────────────────────────────────────────────────────────

    bindEvents() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        this.modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) this.close();
        });
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

        // Cancel any animation still running from a previous open/close
        this._clearAnimations();
        this.originEl = originEl;

        document.body.classList.add('modal-open');

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

            // Instantly show/hide sections based on match type (No more staggered animations)
            const sections = modalContent.querySelectorAll('.modal-match-score, .goalscorers-section, .date-time-section, .stadium-section');
            sections.forEach(s => {
                if ((s.matches('.modal-match-score') && (isUpcoming || !score)) ||
                    (s.matches('.goalscorers-section') && isUpcoming)) {
                    s.style.display = 'none';
                } else {
                    s.style.display = s.matches('.modal-match-score') ? 'flex' : 'block';
                }
            });
        }

        // Adding .show triggers the CSS overlay fade-in
        this.modal.classList.add('show');

        if (!modalContent) return;

        // ── FLIP: First & Last ────────────────────────────────
        const contentRect = modalContent.getBoundingClientRect();
        const toRadius    = getComputedStyle(modalContent).borderRadius;
        let fromKF;

        if (originEl) {
            const cardRect = originEl.getBoundingClientRect();
            const dx     = cardRect.left + cardRect.width  / 2 - (contentRect.left + contentRect.width  / 2);
            const dy     = cardRect.top  + cardRect.height / 2 - (contentRect.top  + contentRect.height / 2);
            const scaleX = cardRect.width  / contentRect.width;
            const scaleY = cardRect.height / contentRect.height;

            fromKF = {
                transform:    `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
                opacity:      '0',
                borderRadius: getComputedStyle(originEl).borderRadius
            };
        } else {
            // Fallback
            fromKF = { transform: 'scale(0.92) translateY(14px)', opacity: '0', borderRadius: toRadius };
        }

        // ── FLIP: Invert & Play ───────────────────────────────
        modalContent.animate(
            [fromKF, { transform: 'none', opacity: '1', borderRadius: toRadius }],
            {
                duration: originEl ? 480 : 280,
                easing:   originEl
                    ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'backwards'
            }
        );
    }

    close() {
        if (!this.modal || !this.modal.classList.contains('show')) return;

        const modalContent = this.modal.querySelector('.modal-content');
        if (!modalContent) return;

        this._clearAnimations();

        const fromRadius = getComputedStyle(modalContent).borderRadius;
        const originEl   = this.originEl;
        let toKF;
        let duration = 280;

        if (originEl) {
            const cardRect    = originEl.getBoundingClientRect();
            const contentRect = modalContent.getBoundingClientRect();

            const dx     = cardRect.left + cardRect.width  / 2 - (contentRect.left + contentRect.width  / 2);
            const dy     = cardRect.top  + cardRect.height / 2 - (contentRect.top  + contentRect.height / 2);
            const scaleX = cardRect.width  / contentRect.width;
            const scaleY = cardRect.height / contentRect.height;

            toKF = {
                transform:    `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
                opacity:      '0',
                borderRadius: getComputedStyle(originEl).borderRadius
            };
            duration = 360;
        } else {
            toKF = { transform: 'scale(0.92) translateY(14px)', opacity: '0', borderRadius: fromRadius };
        }

        this.modal.classList.remove('show');

        const anim = modalContent.animate(
            [{ transform: 'none', opacity: '1', borderRadius: fromRadius }, toKF],
            { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
        );

        anim.onfinish = () => {
            document.body.classList.remove('modal-open');
            this._clearAnimations();
            this.originEl = null;
        };
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    _clearAnimations() {
        if (!this.modal) return;
        this.modal.getAnimations().forEach(a => a.cancel());
        const content = this.modal.querySelector('.modal-content');
        if (content) content.getAnimations().forEach(a => a.cancel());
    }

    // ── Content Population ────────────────────────────────────────────────────

    renderContent(title, dateTime, season, stadium, goalscorers, score, isUpcoming, isHome, sponsor) {
        // Title (home team / away team)
        const titleEl = this.modal.querySelector('#modalMatchTitle');
        if (titleEl) {
            const [homeTeam, awayTeam] = title.split(' vs ').map(t => t.trim());
            const homeEl  = titleEl.querySelector('.home-team');
            const awayEl  = titleEl.querySelector('.away-team');
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
            const li       = document.createElement('li');
            li.className   = 'goalscorer-item';
            li.innerHTML   = `${'<i class="fas fa-futbol"></i> '.repeat(goals)}${player}`;
            list.appendChild(li);
        });
    }
}

// ── Global Instance ───────────────────────────────────────────────────────────

window.matchModal = new MatchModal();

document.addEventListener('DOMContentLoaded', () => {
    window.matchModal.init();
});
