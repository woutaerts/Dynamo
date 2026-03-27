/**
 * utils/modal-base.js
 *
 * Abstract base class for FLIP-animated overlay modals.
 * Eliminates ~120 lines of byte-for-byte duplicate code shared between
 * matchModal.js and playerModal.js.
 *
 * Subclasses must:
 *   - Set `this.modal` to the overlay Element after loading the HTML partial.
 *   - Call `this.bindEvents()` once the modal DOM is ready.
 *   - Implement their own `show()` method that calls `this._animateOpen(originEl)`.
 *   - Implement their own `close()` method that calls `this._animateClose()`.
 */
export class ModalBase {
    constructor() {
        this.modal         = null;
        this.isInitialized = false;
        this.originEl      = null;
    }

    // ── Shared Event Binding ──────────────────────────────────────────────────

    /**
     * Attaches close-on-backdrop-click, close-button click, and Escape key.
     * Call once after this.modal is set.
     */
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

    // ── FLIP: Open ────────────────────────────────────────────────────────────

    /**
     * Adds `.show` to the overlay (triggers CSS fade-in), then runs the FLIP
     * open animation on `.modal-content`, expanding outward from `originEl`.
     *
     * @param {Element|null} originEl  The card/element the modal expands from.
     */
    _animateOpen(originEl) {
        if (!this.modal) return;

        document.body.classList.add('modal-open');
        this._clearAnimations();
        this.originEl = originEl;

        // Adding .show triggers the CSS overlay fade-in (opacity 0 → 1)
        this.modal.classList.add('show');

        const modalContent = this.modal.querySelector('.modal-content');
        if (!modalContent) return;

        // ── FLIP: First & Last ────────────────────────────────────────────────
        // The modal is now visible in its final position — measure it.
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
            // Fallback: simple scale-up from center
            fromKF = { transform: 'scale(0.92) translateY(14px)', opacity: '0', borderRadius: toRadius };
        }

        // ── FLIP: Invert & Play ───────────────────────────────────────────────
        modalContent.animate(
            [fromKF, { transform: 'none', opacity: '1', borderRadius: toRadius }],
            {
                duration: originEl ? 480 : 280,
                easing:   originEl
                    ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'   // spring when from card
                    : 'cubic-bezier(0.16, 1, 0.3, 1)',       // fast-out fallback
                fill: 'backwards'   // hold fromKF until animation begins
            }
        );
    }

    // ── FLIP: Close ───────────────────────────────────────────────────────────

    /**
     * Runs the FLIP close animation, collapsing back toward `this.originEl`,
     * then removes `.show` and cleans up body scroll lock.
     */
    _animateClose() {
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

        // Removing .show triggers the CSS overlay fade-out (opacity 1 → 0)
        this.modal.classList.remove('show');

        const anim = modalContent.animate(
            [{ transform: 'none', opacity: '1', borderRadius: fromRadius }, toKF],
            { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
        );

        anim.onfinish = () => {
            document.body.classList.remove('modal-open');
            this._clearAnimations();    // clear fill:'forwards' so next open is clean
            this.originEl = null;
        };
    }

    // ── Animation Cleanup ─────────────────────────────────────────────────────

    /** Cancels all in-flight WAAPI animations on the overlay and its content panel. */
    _clearAnimations() {
        if (!this.modal) return;
        this.modal.getAnimations().forEach(a => a.cancel());
        const content = this.modal.querySelector('.modal-content');
        if (content) content.getAnimations().forEach(a => a.cancel());
    }
}