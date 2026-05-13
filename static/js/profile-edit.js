document.addEventListener('DOMContentLoaded', () => {

    console.log('PROFILE EDIT JS LOADED');

    // ===== AVATAR =====

    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    if (avatarInput) {

        avatarInput.addEventListener('change', event => {

            const file = event.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = e => {

                // если превью IMG
                if (avatarPreview.tagName === 'IMG') {

                    avatarPreview.src = e.target.result;

                } else {

                    avatarPreview.style.backgroundImage =
                        `url(${e.target.result})`;

                    avatarPreview.style.backgroundSize = 'cover';
                    avatarPreview.style.backgroundPosition = 'center';

                    avatarPreview.innerHTML = '';
                }
            };

            reader.readAsDataURL(file);
        });
    }

    // ===== BANNER =====

    const bannerInput = document.getElementById('bannerInput');
    const bannerPreview = document.getElementById('bannerPreview');

    if (bannerInput && bannerPreview) {

        bannerInput.addEventListener('change', event => {

            const file = event.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = e => {

                // img
                if (bannerPreview.tagName === 'IMG') {

                    bannerPreview.src = e.target.result;

                } else {

                    bannerPreview.style.backgroundImage =
                        `url(${e.target.result})`;

                    bannerPreview.style.backgroundSize = 'cover';
                    bannerPreview.style.backgroundPosition = 'center';

                    bannerPreview.textContent = '';
                }
            };

            reader.readAsDataURL(file);
        });
    }

    // ===== BIO COUNTER =====

    const bio = document.getElementById('id_bio');
    const counter = document.getElementById('bio-counter');

    if (bio && counter) {

        const updateCounter = () => {

            counter.textContent =
                `${bio.value.length}/500`;
        };

        updateCounter();

        bio.addEventListener('input', updateCounter);
    }
});