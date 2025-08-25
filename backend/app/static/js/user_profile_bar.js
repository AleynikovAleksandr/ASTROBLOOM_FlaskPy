document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.getElementById("openEditProfileBtn");

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            // Перенаправляем на отдельную страницу редактирования профиля
            window.location.href = "/edit_profile";
        });
    }
});
