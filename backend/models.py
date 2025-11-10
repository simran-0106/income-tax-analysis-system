from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# -------------------------
# 1️⃣ USER TABLE
# -------------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    # keep email for compatibility but add username as primary login identifier
    email = db.Column(db.String(120), unique=True, nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    phone = db.Column(db.String(15))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    uploads = db.relationship('Upload', backref='user', lazy=True)

# -------------------------
# 2️⃣ UPLOADS TABLE
# -------------------------
class Upload(db.Model):
    __tablename__ = 'uploads'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(20))
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# -------------------------
# 3️⃣ FRAUD ANALYSIS TABLE (Optional)
# -------------------------
class FraudAnalysis(db.Model):
    __tablename__ = 'fraud_analysis'

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(50))
    income = db.Column(db.Float)
    tax_paid = db.Column(db.Float)
    fraud_risk = db.Column(db.Float)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
