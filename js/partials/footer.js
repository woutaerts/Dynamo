// Retrieve and display the footer in the designated placeholder on all pages

fetch("../../pages/partials/footer.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;

        // Secret animation for footer logo
        const footerLogo = document.querySelector('.footer-logo');
        if (footerLogo) {
            let clickCount = 0;
            let clickTimer = null;

            footerLogo.addEventListener('click', function() {
                clickCount++;

                // Reset timer on each click
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }

                // Secret animation sequence based on click count
                if (clickCount === 5) {
                    // five clicks - EXPLOSIVE pulse animation + reset
                    this.classList.add('secret-pulse');
                    setTimeout(() => {
                        this.classList.remove('secret-pulse');
                        clickCount = 0; // Reset for next sequence
                    }, 2500);
                }

                // Reset click count after 2 seconds of no clicks
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 2000);
            });
        }
    });