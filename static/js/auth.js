// ========== АВТОРИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function () {

    console.log('Страница авторизации загружена');

/* ========================= */
/* USERNAME VALIDATION */
/* ========================= */

const usernameField = document.getElementById('id_username');

if (usernameField) {

    usernameField.addEventListener('input', function () {

        // Только английские символы
        this.value = this.value.replace(
            /[^a-zA-Z0-9@.+_-]/g,
            ''
        );

    });

    usernameField.addEventListener('keypress', function (e) {

        const char = String.fromCharCode(e.which);

        // Проверка символа
        if (!/[a-zA-Z0-9@.+_-]/.test(char)) {

            e.preventDefault();

        }

    });

    usernameField.setAttribute(
        'title',
        'Только английские буквы, цифры и символы @ . + _ -'
    );

}

    /* ========================= */
    /* PASSWORD VALIDATION */
    /* ========================= */

    const password1Field = document.getElementById('id_password1');
    const password2Field = document.getElementById('id_password2');
    const loginPasswordField = document.getElementById('id_password');

    const passwordFields = [
        password1Field,
        password2Field,
        loginPasswordField
    ];

    passwordFields.forEach(field => {

        if (!field) return;

        field.addEventListener('input', function () {

            // Удаляем кириллицу
            this.value = this.value.replace(
                /[А-Яа-яЁё]/g,
                ''
            );

        });

    });

    /* ========================= */
    /* PASSWORD MATCH CHECK */
    /* ========================= */

    if (password1Field && password2Field) {

        function checkPasswordMatch() {

            if (password1Field.value !== password2Field.value) {

                password2Field.setCustomValidity(
                    'Пароли не совпадают'
                );

            } else {

                password2Field.setCustomValidity('');

            }

        }

        password1Field.addEventListener(
            'input',
            checkPasswordMatch
        );

        password2Field.addEventListener(
            'input',
            checkPasswordMatch
        );

    }

    /* ========================= */
    /* USERNAME LENGTH */
    /* ========================= */

    if (usernameField) {

        usernameField.addEventListener('input', function () {

            const maxLength = 150;

            const currentLength = this.value.length;

            const remaining = maxLength - currentLength;

            // Можно потом добавить счетчик

            console.log(
                `Осталось символов: ${remaining}`
            );

        });

    }

});