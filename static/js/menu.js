// ========== МЕНЮ ПОЛЬЗОВАТЕЛЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const themeToggleDropdown = document.getElementById('themeToggleDropdown');
    
    // Открытие/закрытие меню
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Закрытие при клике вне меню
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Переключение темы из меню
    if (themeToggleDropdown) {
        themeToggleDropdown.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Обновляем текст кнопки
            const themeText = this.querySelector('span');
            themeText.textContent = newTheme === 'light' ? 'Темная тема' : 'Светлая тема';
        });
    }
});