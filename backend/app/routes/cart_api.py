from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.user_cart import User_Cart

cart_api = Blueprint("cart_api", __name__)

# URL по умолчанию для отсутствующего изображения
DEFAULT_IMAGE = "https://via.placeholder.com/250x180?text=Image+Error"


# Получение корзины текущего пользователя
@cart_api.route("/api/cart", methods=["GET"])
@login_required
def get_cart():
    cart_items = User_Cart.query.filter_by(user_login=current_user.login).all()
    return jsonify([
        {
            "dish_name": item.dish_name,
            "price": item.price,
            "image": item.image_url or DEFAULT_IMAGE,
            "qty": item.qty
        }
        for item in cart_items
    ])


# Сохранение корзины (перезаписываем старую)
@cart_api.route("/api/cart", methods=["POST"])
@login_required
def save_cart():
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({"error": "Invalid data format"}), 400

    # Удаляем текущую корзину пользователя
    User_Cart.query.filter_by(user_login=current_user.login).delete()
    db.session.commit()

    # Добавляем новые позиции
    for item in data:
        new_item = User_Cart(
            user_login=current_user.login,
            dish_name=item["dish_name"],
            qty=item.get("qty", 1),
            price=item.get("price", 0),
            image_url=item.get("image") or DEFAULT_IMAGE
        )
        db.session.add(new_item)

    db.session.commit()
    return jsonify({"status": "ok"}), 200
