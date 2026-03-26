/**
 * components/playerModal.js
 *
 * Changes:
 *   - Removed scrollPosition hack; page no longer jumps on open.
 *   - Added originEl tracking for FLIP animation.
 *   - show(playerData, originEl) — FLIP expands from clicked card.
 *   - close()                    — FLIP shrinks back to originating card.
 *   - _clearAnimations()         — cancels in-flight WAAPI animations.
 */
import { POSITION_LABEL_MAP } from '../utils/helpers.js';

class PlayerModal {
    constructor() {
        this.modal         = null;
        this.isInitialized = false;
        this.originEl      = null;   // the card element that triggered open
    }

    // ── Initialization ────────────────────────────────────────────────────────

    async init() {
        if (this.isInitialized) return;

        try {
            const response  = await fetch('/dynamo/html/components/playerModal.html');
            const modalHTML = await response.text();

            const placeholder = document.getElementById('player-modal-placeholder');
            if (placeholder) {
                placeholder.innerHTML = modalHTML;
                this.modal = document.getElementById('playerModal');
                this.bindEvents();
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('Failed to load player modal:', error);
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

    /**
     * Opens the modal, animating the content outward from `originEl` (FLIP).
     * Falls back to a simple scale-up if no originEl is provided.
     *
     * @param {Object} playerData  — player data object (same shape as before)
     * @param {Element|null} originEl — the card that was clicked
     */
    show(playerData = {}, originEl = null) {
        if (!this.modal) return;

        const {
            name            = 'Player Name',
            position        = 'Unknown',
            flagSrc         = '../img/icons/flags/belgium.svg',
            gamesThisSeason = 0,
            gamesTotal      = 0,
            goalsThisSeason = 0,
            goalsTotal      = 0
        } = playerData;

        // Cancel any animation still running from a previous open/close
        this._clearAnimations();
        this.originEl = originEl;

        document.body.classList.add('modal-open');

        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('goalkeeper', 'defender', 'midfielder', 'attacker');
            modalContent.classList.add(position.toLowerCase());
            this.renderContent(name, position, flagSrc, gamesThisSeason, gamesTotal, goalsThisSeason, goalsTotal);
            modalContent.scrollTop = 0;
        }

        // Adding .show triggers the CSS overlay fade-in (opacity 0 → 1)
        this.modal.classList.add('show');

        if (!modalContent) return;

        // ── FLIP: First & Last ────────────────────────────────
        // The modal is now visible in its final position — measure it.
        const contentRect = modalContent.getBoundingClientRect();
        const toRadius    = getComputedStyle(modalContent).borderRadius;

        let fromKF;
        if (originEl) {
            const cardRect = originEl.getBoundingClientRect();

            // Offset from card center → modal center
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
            // Fallback: simple scale-up from center
            fromKF = { transform: 'scale(0.92) translateY(14px)', opacity: '0', borderRadius: toRadius };
        }

        // ── FLIP: Invert & Play ───────────────────────────────
        modalContent.animate(
            [fromKF, { transform: 'none', opacity: '1', borderRadius: toRadius }],
            {
                duration: originEl ? 480 : 280,
                // Spring easing when coming from a card; fast-out otherwise
                easing:   originEl
                    ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'backwards'  // hold the from-keyframe until the animation begins
            }
        );
    }

    close() {
        if (!this.modal || !this.modal.classList.contains('show')) return;

        const modalContent = this.modal.querySelector('.modal-content');
        if (!modalContent) return;

        // Cancel the open animation (reverts content to its CSS default: fully visible)
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

            toKF     = {
                transform:    `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
                opacity:      '0',
                borderRadius: getComputedStyle(originEl).borderRadius
            };
            duration = 360;
        } else {
            toKF = { transform: 'scale(0.92) translateY(14px)', opacity: '0', borderRadius: fromRadius };
        }

        // Removing .show triggers the CSS overlay fade-out (opacity 1 → 0)
        this.modal.classList.remove('show');

        // Animate content back toward the originating card
        const anim = modalContent.animate(
            [{ transform: 'none', opacity: '1', borderRadius: fromRadius }, toKF],
            { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
        );

        anim.onfinish = () => {
            document.body.classList.remove('modal-open');
            // Clear fill: 'forwards' so the element resets cleanly for next open
            this._clearAnimations();
            this.originEl = null;
        };
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /** Cancels all WAAPI animations on the overlay and its content panel. */
    _clearAnimations() {
        if (!this.modal) return;
        this.modal.getAnimations().forEach(a => a.cancel());
        const content = this.modal.querySelector('.modal-content');
        if (content) content.getAnimations().forEach(a => a.cancel());
    }

    // ── Content Population ────────────────────────────────────────────────────

    renderContent(name, position, flagSrc, gamesThisSeason, gamesTotal, goalsThisSeason, goalsTotal) {
        const nameEl = this.modal.querySelector('#modalPlayerName');
        if (nameEl) nameEl.textContent = name;

        const positionEl = this.modal.querySelector('#playerPosition');
        if (positionEl) positionEl.textContent = POSITION_LABEL_MAP[position.toLowerCase()] || position;

        const flagEl = this.modal.querySelector('#nationalityFlag');
        if (flagEl) { flagEl.src = flagSrc; flagEl.alt = 'Nationality Flag'; }

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

// ── Global Instance ───────────────────────────────────────────────────────────

window.playerModal = new PlayerModal();

document.addEventListener('DOMContentLoaded', () => {
    window.playerModal.init();
});