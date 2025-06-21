/* Footer Loader and Animation Handler */
(function() {
    // Load Footer Content
    fetch("../../pages/partials/footer.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
            initFooterAnimation();
        });

    // Initialize Secret Animation
    function initFooterAnimation() {
        const footerLogo = document.querySelector('.footer-logo');
        if (!footerLogo) return;

        let clickCount = 0;
        let clickTimer = null;

        footerLogo.addEventListener('click', function() {
            clickCount++;

            if (clickTimer) clearTimeout(clickTimer);

            // Trigger animation on 5 clicks
            if (clickCount === 5) {
                this.classList.add('secret-pulse');
                setTimeout(() => {
                    this.classList.remove('secret-pulse');
                    clickCount = 0;
                }, 2500);
            }

            // Reset counter after 2 seconds
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        });
    }
})();