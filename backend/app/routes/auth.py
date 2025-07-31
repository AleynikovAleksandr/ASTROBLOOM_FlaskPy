from flask import Blueprint, render_template, redirect, request, url_for, flash
from app import db
from app.models.visitor import Visitor
from app.models.waiter import Waiter
from flask_login import login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash
from flask import session, render_template

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET'])
def home():
    return render_template('auth_interface.html')

@auth_bp.route('/login', methods=['POST'])
def login():
    login_value = request.form['login']
    password = request.form['password']

    if login_value.startswith("of_"):
        user = Waiter.query.filter_by(login=login_value).first()
    else:
        user = Visitor.query.filter_by(login=login_value).first()

    if user and user.password == password:
        login_user(user)
        flash("Login successful!", "success")
        if isinstance(user, Visitor):
            return redirect('/visitor')
        else:
            return redirect('/waiter')  # если сделаешь интерфейс для официанта
    else:
        flash("Invalid login or password", "error")
        return redirect('/')

@auth_bp.route('/register', methods=['POST'])
def register():
    passport = request.form['passport']
    full_name = request.form['full_name']
    bank_card = request.form['bank_card']
    login_value = request.form['login']
    password = request.form['password']

    if Visitor.query.filter_by(login=login_value).first():
        flash("Login already exists", "error")
        return redirect('/')

    names = full_name.split()
    last_name = names[0]
    first_name = names[1]
    middle_name = names[2] if len(names) > 2 else None

    new_user = Visitor(
        passport=passport,
        last_name=last_name,
        first_name=first_name,
        middle_name=middle_name,
        bank_card_number=bank_card,
        login=login_value,
        password=password
    )

    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)  # автоматически входим после регистрации
    flash("Registration successful!", "success")
    return redirect('/visitor')

