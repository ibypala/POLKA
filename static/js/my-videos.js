// ===== SORT DROPDOWN =====

document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.sort-dropdown');
    if (!dropdown) return;

    const button = dropdown.querySelector('.sort-btn');

    // клик по кнопке
    if (button.contains(e.target)) {
        dropdown.classList.toggle('open');
        return;
    }

    // клик вне — закрываем
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});