from flask import Blueprint, render_template, redirect, request, url_for, flash
from flask_login import login_required, logout_user, current_user
from app.models.menu import Menu
from app.models.ingredient import Ingredient
from app.models.composition import Composition
from app import db
from flask import session, render_template

user_bp = Blueprint('user', __name__)

def get_menu_with_ingredients():
    menu_items = db.session.query(Menu).all()
    ingredient_map = {}
    for item in menu_items:
        composition_entries = db.session.query(Composition).filter_by(menu_id=item.menu_id).all()
        ingredient_ids = [comp.ingredient_id for comp in composition_entries]
        if ingredient_ids:
            ingredients = db.session.query(Ingredient).filter(Ingredient.ingredient_id.in_(ingredient_ids)).all()
            ingredient_map[item.menu_id] = ", ".join(i.ingredient_name for i in ingredients)
        else:
            ingredient_map[item.menu_id] = "No ingredients listed"
    return menu_items, ingredient_map


# Редирект с /visitor на /visitor/menu по умолчанию
@user_bp.route("/visitor")
def visitor_root():
    return redirect(url_for("user.menu_page"))

@user_bp.route("/visitor/menu")
def menu_page():
    menu_items, ingredient_map = get_menu_with_ingredients()
    return render_template("auth_interface_user.html",
                           menu_items=menu_items,
                           ingredient_map=ingredient_map,
                           active_page="menu",
                           page_title="Menu")

@user_bp.route("/visitor/cart")
def cart_page():
    menu_items, ingredient_map = get_menu_with_ingredients()
    return render_template("auth_interface_user.html",
                           menu_items=menu_items,
                           ingredient_map=ingredient_map,
                           active_page="cart",
                           page_title="Cart")

@user_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    session.pop('_flashes', None)
    flash("You have been logged out.", "info")
    return redirect(url_for("auth.home"))