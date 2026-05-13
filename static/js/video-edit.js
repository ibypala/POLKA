// ========== PROFILE EDIT ==========

document.addEventListener('DOMContentLoaded', () => {

    /* ========================= */
    /* AVATAR PREVIEW */
    /* ========================= */

    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    if (avatarInput && avatarPreview) {

        avatarInput.addEventListener('change', e => {

            const file = e.target.files[0];

            if (!file) return;

            // проверка размера
            if (file.size > 5 * 1024 * 1024) {
                alert('Аватар слишком большой. Максимум 5MB');
                avatarInput.value = '';
                return;
            }

            // проверка типа
            if (!file.type.startsWith('image/')) {
                alert('Выберите изображение');
                avatarInput.value = '';
                return;
            }

            const reader = new FileReader();

            reader.onload = event => {

                // если был div.default — заменяем на img
                if (avatarPreview.tagName !== 'IMG') {

                    const img = document.createElement('img');

                    img.id = 'avatarPreview';
                    img.className = 'avatar-preview';
                    img.src = event.target.result;

                    avatarPreview.replaceWith(img);

                } else {

                    avatarPreview.src = event.target.result;
                }
            };

            reader.readAsDataURL(file);
        });
    }

    /* ========================= */
    /* BANNER PREVIEW */
    /* ========================= */

    const bannerInput = document.getElementById('bannerInput');
    const bannerPreview = document.getElementById('bannerPreview');

    if (bannerInput && bannerPreview) {

        bannerInput.addEventListener('change', e => {

            const file = e.target.files[0];

            if (!file) return;

            // проверка размера
            if (file.size > 10 * 1024 * 1024) {
                alert('Баннер слишком большой. Максимум 10MB');
                bannerInput.value = '';
                return;
            }

            // проверка типа
            if (!file.type.startsWith('image/')) {
                alert('Выберите изображение');
                bannerInput.value = '';
                return;
            }

            const reader = new FileReader();

            reader.onload = event => {

                bannerPreview.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    /* ========================= */
    /* BIO COUNTER */
    /* ========================= */

    const bioField = document.getElementById('id_bio');
    const bioCounter = document.getElementById('bio-counter');

    if (bioField && bioCounter) {

        const updateCounter = () => {

            const length = bioField.value.length;

            bioCounter.textContent = `${length}/500`;
        };

        updateCounter();

        bioField.addEventListener('input', updateCounter);
    }

});