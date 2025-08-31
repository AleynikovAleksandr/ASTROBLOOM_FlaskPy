from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask import session, flash, url_for, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.visitor import Visitor
from app.models.user_cart import User_Cart

profile_bp = Blueprint("profile", __name__, template_folder="templates")

@profile_bp.route("/edit_profile", methods=["GET", "POST"])
@login_required
def edit_profile():
    user = current_user

    if request.method == "POST":
        data = request.get_json()  # получаем данные через fetch
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        # Full Name разбор
        full_name = data.get("fullName", "").strip()
        names = full_name.split()
        last_name = names[0] if len(names) > 0 else ""
        first_name = names[1] if len(names) > 1 else ""
        middle_name = names[2] if len(names) > 2 else None

        # Старый логин для переноса корзины
        old_login = user.login

        # Обновляем поля
        user.passport = data.get("passport", user.passport)
        user.last_name = last_name
        user.first_name = first_name
        user.middle_name = middle_name
        user.bank_card_number = data.get("cardNumber", user.bank_card_number)
        user.password = data.get("password", user.password)  # Здесь можно добавить хеширование
        new_login = data.get("login", user.login)

        login_changed = old_login != new_login
        if login_changed:
            user.login = new_login
            # Переносим корзину на новый login
            User_Cart.query.filter_by(user_login=old_login).update({"user_login": new_login})

        db.session.commit()
        
        if login_changed:
            # если логин изменился → фронт должен разлогинить пользователя
            session.pop('_flashes', None)
            flash("You have been logged out.", "info")
            
            return jsonify({
                "success": True,
                "message": "Profile updated",
                "loginChanged": True,
                "redirect": url_for("auth.home")
            })

        # если логин не менялся
        return jsonify({
            "success": True,
            "message": "Profile updated",
            "loginChanged": False
        })


    # GET — подгружаем текущие данные
    full_name = f"{user.last_name} {user.first_name}"
    if user.middle_name:
        full_name += f" {user.middle_name}"

    return render_template(
        "edit_profile.html",
        passport=user.passport,
        full_name=full_name,
        card_number=user.bank_card_number,
        login=user.login,
        password=user.password  
    )
