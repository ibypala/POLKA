document.addEventListener('DOMContentLoaded', () => {

    // ===== TABS =====

    const navItems = document.querySelectorAll('.settings-nav-item');

    const tabContents = document.querySelectorAll('.tab-content');

    function openTab(tabName) {

        // sidebar

        navItems.forEach(nav => {

            nav.classList.remove('active');

            if (nav.dataset.tab === tabName) {
                nav.classList.add('active');
            }

        });

        // content

        tabContents.forEach(content => {

            content.classList.remove('active');

            if (content.id === tabName) {
                content.classList.add('active');
            }

        });

    }

    // CLICK EVENTS

    navItems.forEach(item => {

        item.addEventListener('click', () => {

            const tab = item.dataset.tab;

            openTab(tab);

            // меняем hash в URL
            window.location.hash = tab;

        });

    });

    // ===== OPEN TAB FROM URL HASH =====

    const hash = window.location.hash.replace('#', '');

    if (hash) {

        openTab(hash);

    } else {

        openTab('profile');

    }

    // ===== DELETE MODAL =====

    const modal = document.getElementById('deleteModal');

    const openBtn = document.getElementById('openDeleteModal');

    const closeBtn = document.getElementById('closeDeleteModal');

    function closeModal() {

        modal.classList.remove('show');

        document.body.style.overflow = '';

    }

    if (modal && openBtn && closeBtn) {

        openBtn.addEventListener('click', () => {

            modal.classList.add('show');

            document.body.style.overflow = 'hidden';

        });

        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', e => {

            if (e.target === modal) {
                closeModal();
            }

        });

        document.addEventListener('keydown', e => {

            if (e.key === 'Escape') {
                closeModal();
            }

        });

    }

});