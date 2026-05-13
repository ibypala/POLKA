// ========== VIDEO EDIT ==========

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================= */
    /* DELETE MODAL */
    /* ========================================= */

    const deleteBtn =
        document.getElementById('deleteBtn');

    const deleteModal =
        document.getElementById('deleteModal');

    const cancelDelete =
        document.getElementById('cancelDelete');

    if (
        deleteBtn &&
        deleteModal
    ) {

        deleteBtn.addEventListener('click', () => {

            deleteModal.classList.add('show');

            document.body.style.overflow = 'hidden';

        });

    }

    function closeModal() {

        deleteModal.classList.remove('show');

        document.body.style.overflow = '';

    }

    if (cancelDelete) {

        cancelDelete.addEventListener(
            'click',
            closeModal
        );

    }

    if (deleteModal) {

        deleteModal.addEventListener(
            'click',
            e => {

                if (e.target === deleteModal) {

                    closeModal();

                }

            }
        );

    }

    /* ========================================= */
    /* THUMBNAIL PREVIEW */
    /* ========================================= */

    const thumbnailInput =
        document.getElementById('id_thumbnail');

    const thumbnailPreview =
        document.getElementById(
            'thumbnailPreview'
        );

    const previewContainer =
        document.getElementById(
            'newPreviewContainer'
        );

    const fileName =
        document.getElementById('file-name');

    if (thumbnailInput) {

        thumbnailInput.addEventListener(
            'change',
            e => {

                const file =
                    e.target.files[0];

                if (!file) return;

                fileName.textContent =
                    file.name;

                /* SIZE */

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {

                    alert(
                        'Превью слишком большое. Максимум 5MB'
                    );

                    thumbnailInput.value = '';

                    fileName.textContent =
                        'Файл не выбран';

                    return;

                }

                /* TYPE */

                if (
                    !file.type.startsWith(
                        'image/'
                    )
                ) {

                    alert(
                        'Выберите изображение'
                    );

                    thumbnailInput.value = '';

                    fileName.textContent =
                        'Файл не выбран';

                    return;

                }

                const reader =
                    new FileReader();

                reader.onload = event => {

                    if (
                        thumbnailPreview
                    ) {

                        thumbnailPreview.src =
                            event.target.result;

                    }

                    if (
                        previewContainer
                    ) {

                        previewContainer.style.display =
                            'block';

                    }

                };

                reader.readAsDataURL(file);

            }
        );

    }

});