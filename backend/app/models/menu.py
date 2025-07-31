from app import db

class Menu(db.Model):
    __tablename__ = 'Menu'
    menu_id = db.Column(db.Integer, primary_key=True)
    menu_name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Numeric(10, 2), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    composition = db.relationship("Composition", back_populates="menu")
