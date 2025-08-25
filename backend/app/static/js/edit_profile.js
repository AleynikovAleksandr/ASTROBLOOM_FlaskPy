document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById('saveBtn');

  // Поля
  const passportInput = document.getElementById('passport');
  const fullNameInput = document.getElementById('fullName');
  const cardInput = document.getElementById('cardNumber');
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');

  // Заполняем форму из data-value
  passportInput.value = passportInput.getAttribute('data-value') || '';
  fullNameInput.value = fullNameInput.getAttribute('data-value') || '';
  cardInput.value = cardInput.getAttribute('data-value') || '';
  loginInput.value = loginInput.getAttribute('data-value') || '';
  passwordInput.value = passwordInput.getAttribute('data-value') || '';

  // Валидация
  const fields = [
    {
      input: passportInput,
      counter: document.getElementById('passportCounter'),
      error: document.getElementById('passportError'),
      label: document.getElementById('passportField'),
      validate: value => {
        if (!value) return "";
        if (!/^\d+$/.test(value)) return "Passport must be numbers only";
        if (value.length !== 10) return "Passport must be exactly 10 digits";
        return "";
      },
      max: 10
    },
    {
      input: fullNameInput,
      error: document.getElementById('fullNameError'),
      label: document.getElementById('fullNameField'),
      validate: value => {
        if (!value) return "";
        const trimmed = value.trim();
        const parts = trimmed.split(/\s+/);
        if (parts.length !== 3) return "Enter Lastname, Firstname and Patronymic (separated by spaces).";
        if (parts.some(p => p === "")) return "No empty name parts allowed.";
        if (parts.some(p => /^\d+$/.test(p))) return "Name parts cannot be numbers.";
        return "";
      }
    },
    {
      input: cardInput,
      counter: document.getElementById('cardCounter'),
      error: document.getElementById('cardError'),
      label: document.getElementById('cardField'),
      validate: value => {
        if (!value) return "";
        if (!/^\d+$/.test(value)) return "Card number must be numbers only";
        if (value.length !== 16) return "Card number must be exactly 16 digits";
        return "";
      },
      max: 16
    },
    {
      input: loginInput,
      counter: document.getElementById('loginCounter'),
      error: document.getElementById('loginError'),
      label: document.getElementById('loginField'),
      validate: value => {
        if (!value) return "";
        if (/^of_/i.test(value)) return "Login cannot start with 'of_'";
        if (value.length < 5) return "Login must be at least 5 characters";
        return "";
      },
      max: 50
    },
    {
      input: passwordInput,
      error: document.getElementById('passwordError'),
      label: document.getElementById('passwordField'),
      validate: value => {
        if (!value) return "";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      }
    }
  ];

  function updateField(field) {
    const value = field.input.value;
    if (field.counter && field.max) {
      if (value.length > 0) {
        field.label.classList.add('inputting');
        field.counter.textContent = `${value.length} / ${field.max}`;
      } else {
        field.label.classList.remove('inputting');
        field.counter.textContent = `0 / ${field.max}`;
      }
    }
    const errorMsg = field.validate(value);
    if (errorMsg) {
      field.label.classList.add('invalid');
      field.error.textContent = errorMsg;
    } else {
      field.label.classList.remove('invalid');
      field.error.textContent = '';
    }
  }

  function checkFormValidity() {
    let valid = true;
    fields.forEach(field => {
      updateField(field);
      if (field.label.classList.contains('invalid') || !field.input.value) valid = false;
    });
    saveBtn.disabled = !valid;
  }

  fields.forEach(field => {
    field.input.addEventListener('input', () => {
      updateField(field);
      checkFormValidity();
    });
    field.input.addEventListener('focus', () => updateField(field));
    field.input.addEventListener('blur', () => updateField(field));
    updateField(field);
  });

  checkFormValidity();

  // Сохранение
  function saveProfile() {
    if (saveBtn.disabled) return; // блокируем, если форма невалидна

    const payload = {
      passport: passportInput.value,
      fullName: fullNameInput.value,
      cardNumber: cardInput.value,
      login: loginInput.value,
      password: passwordInput.value
    };

    fetch("/edit_profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Profile updated successfully");
          if (data.loginChanged) {
            console.log("Cart transferred to new login");
          }
        } else {
          alert("Error updating profile: " + data.message);
        }
      })
      .catch(err => console.error(err));
  }

  saveBtn.addEventListener("click", saveProfile);

  // Закрыть модалку
  const closeBtn = document.querySelector(".modal-window__close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => window.history.back());
  }

  // Eye toggle
  const eyeBtn = document.getElementById('togglePwd');
  const eyeIcon = document.getElementById('eyeIcon');
  let pwdVisible = false;
  eyeBtn.addEventListener('click', function() {
    pwdVisible = !pwdVisible;
    passwordInput.type = pwdVisible ? 'text' : 'password';
    eyeIcon.innerHTML = pwdVisible
      ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a17.77 17.77 0 0 1 3.08-4.38"/><path d="M1 1l22 22"/><circle cx="12" cy="12" r="3"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });
});
