// ========== ЛАЙКИ/ДИЗЛАЙКИ ==========

document.addEventListener('DOMContentLoaded', function() {
    const likeBtn = document.querySelector('.like-button[data-video-id]');
    const dislikeBtn = document.querySelector('.dislike-button[data-video-id]');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const videoId = this.dataset.videoId;
            
            fetch(`/video/${videoId}/like/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.liked) {
                    likeBtn.classList.add('liked');
                    if (dislikeBtn) dislikeBtn.classList.remove('disliked');
                } else {
                    likeBtn.classList.remove('liked');
                }
                likeBtn.querySelector('.like-count').textContent = data.likes_count;
                if (dislikeBtn) dislikeBtn.querySelector('.dislike-count').textContent = data.dislikes_count;
            });
        });
    }
    
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const videoId = this.dataset.videoId;
            
            fetch(`/video/${videoId}/dislike/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.disliked) {
                    dislikeBtn.classList.add('disliked');
                    if (likeBtn) likeBtn.classList.remove('liked');
                } else {
                    dislikeBtn.classList.remove('disliked');
                }
                if (likeBtn) likeBtn.querySelector('.like-count').textContent = data.likes_count;
                dislikeBtn.querySelector('.dislike-count').textContent = data.dislikes_count;
            });
        });
    }
    
    // Функция для получения CSRF токена из куки
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