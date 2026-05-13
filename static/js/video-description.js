// ========== УПРАВЛЕНИЕ ОПИСАНИЕМ ==========

document.addEventListener('DOMContentLoaded', function() {
    const descriptionBlock = document.getElementById('descriptionBlock');
    const descriptionFooter = document.getElementById('descriptionFooter');
    const shortDate = document.getElementById('shortDate');
    const fullDate = document.getElementById('fullDate');
    
    console.log('Description JS loaded', descriptionBlock);
    
    if (!descriptionBlock) {
        console.log('Description block not found');
        return;
    }
    
    // Раскрытие по клику на весь блок
    descriptionBlock.addEventListener('click', function(e) {
        console.log('Description clicked');
        
        // Если кликнули на кнопку "Свернуть" - не раскрываем
        if (e.target.closest('.description-footer')) {
            console.log('Footer clicked');
            return;
        }
        
        // Переключаем класс expanded
        descriptionBlock.classList.toggle('expanded');
        console.log('Expanded:', descriptionBlock.classList.contains('expanded'));
        
        // Меняем дату
        if (shortDate && fullDate) {
            if (descriptionBlock.classList.contains('expanded')) {
                shortDate.classList.add('hidden');
                fullDate.classList.remove('hidden');
                if (descriptionFooter) descriptionFooter.classList.remove('hidden');
            } else {
                shortDate.classList.remove('hidden');
                fullDate.classList.add('hidden');
                if (descriptionFooter) descriptionFooter.classList.add('hidden');
            }
        }
    });
});