// Header behavior
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', function () {
            navLinkItems.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    document.addEventListener('click', e => {
        if (!header.contains(e.target)) {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Retrieve and display the header in the designated placeholder on all pages

fetch("../../pages/partials/header.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById('header-placeholder').innerHTML = html;
    });