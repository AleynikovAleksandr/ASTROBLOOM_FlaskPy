from app import db
from flask_login import UserMixin

class Visitor(UserMixin, db.Model):
    __tablename__ = "Visitor"
    passport = db.Column(db.String(10), primary_key=True)
    last_name = db.Column(db.String(50), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50))
    bank_card_number = db.Column(db.String(16), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    def get_id(self):
        return self.login
