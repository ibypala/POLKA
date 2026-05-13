// ========== БЕСКОНЕЧНЫЕ РЕКОМЕНДАЦИИ ==========

document.addEventListener('DOMContentLoaded', function() {
    let loading = false;
    let hasNextPage = true;
    let nextPage = 2;
    const recommendationsList = document.getElementById('recommendations-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noMoreMsg = document.getElementById('no-more-recommendations');
    const excludeId = recommendationsList?.dataset.exclude;
    
    async function loadMoreRecommendations() {
        if (loading || !hasNextPage) return;
        
        loading = true;
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        
        try {
            const response = await fetch(`/load-more-recommendations/?page=${nextPage}&exclude=${excludeId}`);
            const data = await response.json();
            
            if (data.videos.length > 0) {
                data.videos.forEach(html => {
                    recommendationsList.insertAdjacentHTML('beforeend', html);
                });
                hasNextPage = data.has_next;
                nextPage = data.next_page || nextPage + 1;
            } else {
                hasNextPage = false;
            }
            
            if (!hasNextPage && noMoreMsg) {
                noMoreMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка загрузки рекомендаций:', error);
        } finally {
            loading = false;
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }
    
    window.addEventListener('scroll', () => {
        if (!hasNextPage || loading) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (documentHeight - scrollPosition < 200) {
            loadMoreRecommendations();
        }
    });
});