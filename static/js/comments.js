// ========== COMMENTS ==========

document.addEventListener('DOMContentLoaded', () => {

    initMainCommentForm();

    initGlobalHandlers();

});

/* ================================================= */
/* MAIN COMMENT FORM */
/* ================================================= */

function initMainCommentForm() {

    const form = document.querySelector('.comment-form');

    if (!form) return;

    const textarea =
        form.querySelector('textarea');

    const submitBtn =
        form.querySelector('.btn-submit');

    if (!textarea || !submitBtn) return;

    submitBtn.disabled = true;

    textarea.addEventListener('input', () => {

        submitBtn.disabled =
            textarea.value.trim().length === 0;

    });

    form.addEventListener('submit', e => {

        e.preventDefault();

        sendMainComment(
            form,
            textarea,
            submitBtn
        );

    });

}

async function sendMainComment(
    form,
    textarea,
    submitBtn
) {

    const videoId =
        form.dataset.videoId;

    const text =
        textarea.value.trim();

    if (!text) return;

    submitBtn.disabled = true;

    const data = new FormData();

    data.append('text', text);

    data.append(
        'csrfmiddlewaretoken',
        getCsrfToken()
    );

    try {

        const response = await fetch(
            `/video/${videoId}/comment/`,
            {
                method: 'POST',
                body: data
            }
        );

        const html =
            await response.text();

        if (!response.ok) {

            throw new Error(
                extractError(html)
            );

        }

        const list =
            document.getElementById(
                'comments-list'
            );

        if (!list) return;

        list.querySelector('.no-comments')
            ?.remove();

        list.insertAdjacentHTML(
            'afterbegin',
            html
        );

        textarea.value = '';

        submitBtn.disabled = true;

    } catch (error) {

        submitBtn.disabled = false;

        showCommentError(
            error.message
        );

    }

}

/* ================================================= */
/* GLOBAL HANDLERS */
/* ================================================= */

function initGlobalHandlers() {

    document.addEventListener(
        'click',
        handleClick
    );

    document.addEventListener(
        'submit',
        handleSubmit
    );

    document.addEventListener(
        'input',
        handleInput
    );

}

/* ================================================= */
/* CLICK HANDLER */
/* ================================================= */

function handleClick(e) {

    /* REPLY */

    const replyBtn =
        e.target.closest('.reply-btn');

    if (replyBtn) {

        e.preventDefault();

        toggleReplyForm(
            replyBtn.dataset.commentId
        );

        return;

    }

    /* CANCEL */

    const cancelBtn =
        e.target.closest(
            '.btn-cancel[data-comment-id]'
        );

    if (cancelBtn) {

        e.preventDefault();

        closeReplyForm(
            cancelBtn.dataset.commentId
        );

        return;

    }

    /* DELETE */

    const deleteBtn =
        e.target.closest(
            '.delete-comment-btn'
        );

    if (deleteBtn) {

        e.preventDefault();

        openDeleteModal(
            deleteBtn.dataset.commentId
        );

    }

}

/* ================================================= */
/* SUBMIT HANDLER */
/* ================================================= */

function handleSubmit(e) {

    const form = e.target;

    if (
        !form.classList.contains(
            'reply-form'
        )
    ) return;

    e.preventDefault();

    sendReply(form);

}

/* ================================================= */
/* INPUT HANDLER */
/* ================================================= */

function handleInput(e) {

    const textarea = e.target;

    if (
        !textarea.closest('.reply-form')
    ) return;

    const form =
        textarea.closest('.reply-form');

    const btn =
        form.querySelector('.btn-submit');

    if (!btn) return;

    btn.disabled =
        textarea.value.trim().length === 0;

}

/* ================================================= */
/* REPLY FORM */
/* ================================================= */

function toggleReplyForm(commentId) {

    const current =
        document.getElementById(
            `reply-form-${commentId}`
        );

    if (!current) return;

    document
        .querySelectorAll(
            '.reply-form-container'
        )
        .forEach(container => {

            if (container !== current) {

                container.classList.add(
                    'hidden'
                );

            }

        });

    current.classList.toggle('hidden');

    if (
        !current.classList.contains(
            'hidden'
        )
    ) {

        const textarea =
            current.querySelector(
                'textarea'
            );

        const btn =
            current.querySelector(
                '.btn-submit'
            );

        if (textarea && btn) {

            btn.disabled =
                textarea.value.trim().length === 0;

            textarea.focus();

        }

    }

}

function closeReplyForm(commentId) {

    const container =
        document.getElementById(
            `reply-form-${commentId}`
        );

    if (!container) return;

    container.classList.add('hidden');

    const textarea =
        container.querySelector(
            'textarea'
        );

    if (textarea) {

        textarea.value = '';

    }

}

/* ================================================= */
/* SEND REPLY */
/* ================================================= */

async function sendReply(form) {

    const parentId =
        form.dataset.parentId;

    const textarea =
        form.querySelector('textarea');

    const submitBtn =
        form.querySelector('.btn-submit');

    const text =
        textarea.value.trim();

    if (!text) return;

    submitBtn.disabled = true;

    const data = new FormData();

    data.append('text', text);

    data.append(
        'csrfmiddlewaretoken',
        getCsrfToken()
    );

    try {

        const response = await fetch(
            `/comment/${parentId}/reply/`,
            {
                method: 'POST',
                body: data
            }
        );

        const html =
            await response.text();

        if (!response.ok) {

            throw new Error(
                extractError(html)
            );

        }

        const parent =
            document.getElementById(
                `comment-${parentId}`
            );

        if (!parent) return;

        let replies =
            parent.querySelector(
                '.comment-replies'
            );

        if (!replies) {

            replies =
                document.createElement(
                    'div'
                );

            replies.className =
                'comment-replies';

            const body =
                parent.querySelector(
                    '.comment-body'
                );

            body.appendChild(replies);

        }

        replies.insertAdjacentHTML(
            'beforeend',
            html
        );

        textarea.value = '';

        form.closest(
            '.reply-form-container'
        ).classList.add('hidden');

    } catch (error) {

        submitBtn.disabled = false;

        showCommentError(
            error.message
        );

    }

}

/* ================================================= */
/* DELETE MODAL */
/* ================================================= */

function openDeleteModal(commentId) {

    closeDeleteModal();

    const modal =
        document.createElement('div');

    modal.className =
        'modal-overlay';

    modal.id =
        'deleteCommentModal';

    modal.innerHTML = `
        <div class="delete-comment-modal">

            <h3>
                Удалить комментарий?
            </h3>

            <p>
                Вы уверены, что хотите удалить комментарий?
            </p>

            <p class="danger-text">
                Это действие нельзя отменить.
            </p>

            <div class="modal-actions">

                <button
                    class="btn-cancel"
                    id="cancelDeleteComment">

                    Отмена

                </button>

                <button
                    class="btn-danger"
                    id="confirmDeleteComment">

                    Удалить

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document.body.style.overflow =
        'hidden';

    requestAnimationFrame(() => {

        modal.classList.add('show');

    });

    modal.addEventListener(
        'click',
        e => {

            if (e.target === modal) {

                closeDeleteModal();

            }

        }
    );

    document
        .getElementById(
            'cancelDeleteComment'
        )
        .addEventListener(
            'click',
            closeDeleteModal
        );

    document
        .getElementById(
            'confirmDeleteComment'
        )
        .addEventListener(
            'click',
            () => {

                deleteComment(commentId);

            }
        );

}

function closeDeleteModal() {

    const modal =
        document.getElementById(
            'deleteCommentModal'
        );

    if (!modal) return;

    modal.remove();

    document.body.style.overflow =
        '';

}

/* ================================================= */
/* DELETE COMMENT */
/* ================================================= */

async function deleteComment(commentId) {

    const data = new FormData();

    data.append(
        'csrfmiddlewaretoken',
        getCsrfToken()
    );

    try {

        const response = await fetch(
            `/comment/${commentId}/delete/`,
            {
                method: 'POST',
                body: data
            }
        );

        const result =
            await response.json();

        if (
            result.status === 'ok'
        ) {

            document
                .getElementById(
                    `comment-${commentId}`
                )
                ?.remove();

        }

    } catch {

        showCommentError(
            'Не удалось удалить комментарий'
        );

    }

    closeDeleteModal();

}

/* ================================================= */
/* ERROR */
/* ================================================= */

function showCommentError(message) {

    const oldToast =
        document.querySelector(
            '.comment-error-toast'
        );

    if (oldToast) {

        oldToast.remove();

    }

    const toast =
        document.createElement('div');

    toast.className =
        'comment-error-toast';

    toast.textContent =
        message || 'Ошибка';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add('show');

    });

    setTimeout(() => {

        toast.classList.remove('show');

        setTimeout(() => {

            toast.remove();

        }, 200);

    }, 3500);

}

/* ================================================= */
/* ERROR PARSER */
/* ================================================= */

function extractError(html) {

    if (!html) {

        return 'Ошибка';

    }

    if (
        html.includes('This field')
    ) {

        return 'Заполните поле';

    }

    if (
        html.includes('Ensure this value')
    ) {

        return 'Комментарий слишком длинный';

    }

    if (
        html.includes('Invalid form')
    ) {

        return 'Неверный комментарий';

    }

    return html
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 200);

}

/* ================================================= */
/* CSRF */
/* ================================================= */

function getCsrfToken() {

    return document.querySelector(
        '[name=csrfmiddlewaretoken]'
    )?.value || '';

}