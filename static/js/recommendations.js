// ========== РЕКОМЕНДАЦИИ ==========

document.addEventListener('DOMContentLoaded', function() {
    // Отслеживание кликов по рекомендациям для аналитики
    const recommendationLinks = document.querySelectorAll('.recommendation-item');
    
    recommendationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const videoId = this.getAttribute('href').split('/').filter(Boolean).pop();
            console.log('Клик по рекомендации:', videoId);
            // Здесь можно отправить данные на сервер для аналитики
        });
    });
});