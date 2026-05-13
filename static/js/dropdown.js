// ========== ВЫПАДАЮЩЕЕ МЕНЮ ==========

document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.querySelector('.sort-dropdown .btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        // Убираем Bootstrap атрибуты
        dropdownBtn.removeAttribute('data-bs-toggle');
        
        dropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Закрыть при клике вне
        document.addEventListener('click', function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Закрыть по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
});