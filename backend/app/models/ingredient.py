from app import db

class Ingredient(db.Model):
    __tablename__ = 'Ingredient'
    ingredient_id = db.Column(db.Integer, primary_key=True)
    ingredient_name = db.Column(db.String(100), nullable=False)

    composition = db.relationship("Composition", back_populates="ingredient")
