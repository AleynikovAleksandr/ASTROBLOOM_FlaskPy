  document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector('.form-box.register form');
    if (!registerForm) return;

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const fields = {
        passport: registerForm.querySelector('input[name="passport"]'),
        full_name: registerForm.querySelector('input[name="full_name"]'),
        bank_card: registerForm.querySelector('input[name="bank_card"]'),
        login: registerForm.querySelector('input[name="login"]'),
        password: registerForm.querySelector('input[name="password"]'),
    };

    function clearError(input) {
        input.classList.remove("input-error");
        const err = input.parentElement.querySelector(".error-message");
        if (err) err.remove();
    }

    function showError(input, message) {
        clearError(input);
        if (input.value.trim() === "") return; // Не показываем, если ничего не введено

        input.classList.add("input-error");
        const msg = document.createElement("p");
        msg.classList.add("error-message");
        msg.textContent = message;
        input.parentElement.appendChild(msg);
    }

    function validate() {
        let valid = true;

        const passportVal = fields.passport.value.trim();
        const fullNameVal = fields.full_name.value.trim();
        const bankCardVal = fields.bank_card.value.trim();
        const loginVal = fields.login.value.trim();
        const passwordVal = fields.password.value.trim();

        // passport
        if (passportVal !== "" && passportVal.length > 10) {
            showError(fields.passport, "Passport must be max 10 characters.");
            valid = false;
        } else {
            clearError(fields.passport);
        }

        // full_name
        const nameParts = fullNameVal.split(" ");
        if (fullNameVal !== "" && nameParts.length < 2) {
            showError(fields.full_name, "Enter Lastname and Firstname (middle optional).");
            valid = false;
        } else {
            clearError(fields.full_name);
        }

        // bank_card
        if (bankCardVal !== "" && !/^\d{16}$/.test(bankCardVal)) {
            showError(fields.bank_card, "Bank card must be exactly 16 digits.");
            valid = false;
        } else {
            clearError(fields.bank_card);
        }

        // login
        if (loginVal !== "" && loginVal.startsWith("of_")) {
            showError(fields.login, "Login must not start with 'of_'.");
            valid = false;
        } else {
            clearError(fields.login);
        }

        // password (просто обязательное поле)
        if (passwordVal !== "") {
            clearError(fields.password);
        }

        // Только если все поля НЕ пустые и нет ошибок — включить кнопку
        const allFilled = Object.values(fields).every(f => f.value.trim() !== "");
        submitBtn.disabled = !(valid && allFilled);
    }

    // Слушаем события ввода
    Object.values(fields).forEach(field => {
        field.addEventListener("input", validate);
        field.addEventListener("blur", validate);
    });

    validate(); // при загрузке
});