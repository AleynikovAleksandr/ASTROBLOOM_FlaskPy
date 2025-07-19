from app import db
from flask_login import UserMixin

class Waiter(UserMixin, db.Model):
    __tablename__ = "Waiter"
    login = db.Column(db.String(50), primary_key=True)
    last_name = db.Column(db.String(50), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50))
    password = db.Column(db.String(255), nullable=False)

    def get_id(self):
        return self.login
