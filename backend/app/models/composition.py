from app import db

class Composition(db.Model):
    __tablename__ = 'Composition'
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.ingredient_id'), primary_key=True)
    menu_id = db.Column(db.Integer, db.ForeignKey('Menu.menu_id'), primary_key=True)

    ingredient = db.relationship("Ingredient", back_populates="composition")
    menu = db.relationship("Menu", back_populates="composition")
