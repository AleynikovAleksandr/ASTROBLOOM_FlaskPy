from app import db

class User_Cart(db.Model):
    __tablename__ = "User_Cart"  

    user_login = db.Column(db.String(50), db.ForeignKey('Visitor.login', onupdate="CASCADE", ondelete="CASCADE"), primary_key=True)
    dish_name = db.Column(db.String(255), primary_key=True)  
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    qty = db.Column(db.Integer, default=1, nullable=False)

    def to_dict(self):
        return {
            "dish_name": self.dish_name,
            "price": self.price,
            "image": self.image_url or "",
            "qty": self.qty
        }
