// ========== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ==========

(function() {
    // Получаем сохраненную тему или определяем по системным настройкам
    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    // Устанавливаем тему
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Обновляем текст в меню если оно есть
        const themeText = document.querySelector('.theme-toggle-dropdown span');
        if (themeText) {
            themeText.textContent = theme === 'light' ? 'Темная тема' : 'Светлая тема';
        }
    };
    
    // Инициализация
    setTheme(getPreferredTheme());
    
    // Обработчик для кнопки темы у гостя
    const themeToggleGuest = document.getElementById('themeToggleGuest');
    if (themeToggleGuest) {
        themeToggleGuest.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }
    
    // Следим за изменением системных настроек
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
})();