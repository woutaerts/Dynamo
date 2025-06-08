// Retrieve and display the footer in the designated placeholder on all pages

fetch("../../pages/partials/footer.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    });