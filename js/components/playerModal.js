import { positionDisplayMap } from '../utils/helpers.js';

/* Player Modal Component */
class PlayerModal {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
        this.scrollPosition = 0; // Store scroll position
    }

    /* Initialization */
    async init() {
        if (this.isInitialized) return;

        try {
            const response = await fetch('/dynamo/html/components/playerModal.html');
            const modalHTML = await response.text();

            const placeholder = document.getElementById('player-modal-placeholder');
            if (placeholder) {
                placeholder.innerHTML = modalHTML;
                this.modal = document.getElementById('playerModal');
                this.setupEventListeners();
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('Failed to load player modal:', error);
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

    /* Modal Control */
    show(playerData = {}) {
        if (!this.modal) return;

        // Save current scroll position
        this.scrollPosition = window.scrollY || document.documentElement.scrollTop;

        const {
            name = 'Player Name',
            position = 'Unknown',
            flagSrc = '../img/icons/flags/belgium.svg',
            gamesThisSeason = 0,
            gamesTotal = 0,
            goalsThisSeason = 0,
            goalsTotal = 0
        } = playerData;

        document.body.classList.add('modal-open');

        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('goalkeeper', 'defender', 'midfielder', 'attacker');
            modalContent.classList.add(position.toLowerCase());
            this.updateContent(name, position, flagSrc, gamesThisSeason, gamesTotal, goalsThisSeason, goalsTotal);
        }

        this.modal.classList.add('show');

        if (modalContent) {
            modalContent.scrollTop = 0;
            const sections = modalContent.querySelectorAll('.season-stats-section, .all-time-stats-section');
            sections.forEach(section => section.classList.remove('animate-in'));
            sections.forEach((section, index) => {
                section.style.display = 'block';
                setTimeout(() => section.classList.add('animate-in'), index * 100);
            });
        } else {
            console.warn('Modal content not found');
        }
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('show');
        document.body.classList.remove('modal-open');

        setTimeout(() => {
            this.modal.style.display = 'none';
            window.scrollTo({ top: this.scrollPosition, behavior: 'smooth' });
        }, 300);
    }

    /* Content Updates */
    updateContent(name, position, flagSrc, gamesThisSeason, gamesTotal, goalsThisSeason, goalsTotal) {
        const nameEl = this.modal.querySelector('#modalPlayerName');
        if (nameEl) nameEl.textContent = name;

        const positionEl = this.modal.querySelector('#playerPosition');
        if (positionEl) positionEl.textContent = positionDisplayMap[position.toLowerCase()] || position;

        const flagEl = this.modal.querySelector('#nationalityFlag');
        if (flagEl) {
            flagEl.src = flagSrc;
            flagEl.alt = `Nationality Flag`;
        }

        const gamesThisSeasonEl = this.modal.querySelector('#gamesThisSeason');
        if (gamesThisSeasonEl) gamesThisSeasonEl.textContent = gamesThisSeason;

        const gamesTotalEl = this.modal.querySelector('#gamesTotal');
        if (gamesTotalEl) gamesTotalEl.textContent = gamesTotal;

        const goalsThisSeasonEl = this.modal.querySelector('#goalsThisSeason');
        if (goalsThisSeasonEl) goalsThisSeasonEl.textContent = goalsThisSeason;

        const goalsTotalEl = this.modal.querySelector('#goalsTotal');
        if (goalsTotalEl) goalsTotalEl.textContent = goalsTotal;
    }
}

/* Global Instance */
window.playerModal = new PlayerModal();

document.addEventListener('DOMContentLoaded', () => {
    window.playerModal.init();
});