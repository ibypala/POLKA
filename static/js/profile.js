// ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('bioModal');
    const content = document.getElementById('modalContent');
    const closeBtn = document.getElementById('close');

    // Открытие модального окна с информацией - ПРОВЕРЬ ЭТОТ КОД
    const bioTrigger = document.querySelector('.bio-trigger');
    
    if (bioTrigger) {
        console.log('bioTrigger найден'); // Для отладки
        
        bioTrigger.addEventListener('click', function(e) {
            console.log('Клик по bio-trigger'); // Для отладки
            const d = e.currentTarget.dataset;
            
            content.innerHTML = `
                <p><b>${d.username}</b></p>
                ${d.location ? `<p>📍 ${d.location}</p>` : ''}
                ${d.bio ? `<p>${d.bio.replace(/\n/g,'<br>')}</p>` : ''}
                <hr>
                <p>📊 <b>${d.views}</b> просмотров · <b>${d.videos}</b> видео · <b>${d.subscribers}</b> подписчиков</p>
                <p>📅 с <b>${d.date}</b></p>
                ${d.website ? `<p><a href="${d.website}" target="_blank">🌐 Сайт</a></p>` : ''}
                ${d.youtube ? `<p><a href="${d.youtube}" target="_blank">▶️ YouTube</a></p>` : ''}
                ${d.telegram ? `<p><a href="${d.telegram}" target="_blank">📱 Telegram</a></p>` : ''}
            `;
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    } else {
        console.log('bioTrigger НЕ найден');
    }

    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Закрытие по клику вне модального окна
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Подписка/отписка
    const subscribeBtn = document.querySelector('.btn-subscribe');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function () {
            fetch(`/accounts/subscribe/${this.dataset.username}/`, {
                method: 'POST',
                headers: { 
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
            .then(r => r.json())
            .then(d => {
                if (!d.error) {
                    this.classList.toggle('on', d.subscribed);
                    this.querySelector('.text').textContent = 
                        d.subscribed ? 'Отписаться' : 'Подписаться';
                    this.querySelector('.count').textContent = d.subscribers_count;
                }
            });
        });
    }

    // Функция для получения CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});