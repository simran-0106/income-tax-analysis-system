import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import pandas as pd
import pymysql
from functools import wraps

# Import models
from models import db, User, Upload, FraudAnalysis

# ==============================
# 🔐 Flask Configuration
# ==============================
SECRET_KEY = os.environ.get("JWT_SECRET", "your-very-secret-key")

app = Flask(__name__)
CORS(app, supports_credentials=True)

pymysql.install_as_MySQLdb()

basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, "uploads")

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://flaskuser:flaskpass@localhost/income_tax_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = SECRET_KEY
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==============================
# ⚙️ DB Setup
# ==============================
def create_app():
    with app.app_context():
        db.create_all()
    return app

# ==============================
# 🔑 JWT Functions
# ==============================
def create_token(identifier):
    payload = {"sub": identifier, "exp": datetime.utcnow() + timedelta(hours=6)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "Token missing"}), 401
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"message": "Invalid or expired token"}), 401
        return f(payload["sub"], *args, **kwargs)
    return decorated

# ==============================
# 🌐 ROUTES
# ==============================
@app.route("/")
def home():
    return jsonify({"message": "Flask backend running ✅"})

# ------------------------------
# 📝 Signup
# ------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    phone = data.get("phone")
    password = data.get("password")

    if not username or not phone or not password:
        return jsonify({"error": "All fields required"}), 400

    if User.query.filter((User.username == username) | (User.phone == phone)).first():
        return jsonify({"error": "Username or phone already registered"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, phone=phone, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"}), 201

# ------------------------------
# 🔐 Login
# ------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Missing credentials"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        token = create_token(user.username)
        return jsonify({"message": "Login successful", "token": token}), 200
    return jsonify({"message": "Invalid username or password"}), 401

# ------------------------------
# 📊 Stats
# ------------------------------
@app.route("/stats", methods=["GET"])
def stats():
    return jsonify({
        "users": User.query.count(),
        "uploads": Upload.query.count(),
        "fraud": FraudAnalysis.query.filter(FraudAnalysis.fraud_risk > 0.5).count(),
    })

# ------------------------------
# 📤 File Upload + Analysis
# ------------------------------
@app.route("/upload", methods=["POST"])
@token_required
def upload(username):
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    try:
        # Support CSV or Excel
        if file.filename.endswith(".csv"):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Fraud detection logic
        df["fraud_risk"] = df.apply(
            lambda x: 0.8 if x.get("Tax_Paid", 0) < (x.get("Income", 1) * 0.05) else 0.2,
            axis=1,
        )

        user = User.query.filter_by(username=username).first()
        FraudAnalysis.query.filter_by(user_id=user.id).delete()

        for _, row in df.iterrows():
            db.session.add(FraudAnalysis(
                transaction_id=row.get("PAN_Number"),
                income=row.get("Income", 0),
                tax_paid=row.get("Tax_Paid", 0),
                fraud_risk=row.get("fraud_risk", 0),
                user_id=user.id,
            ))

        db.session.commit()

        summary = {
            "rows": len(df),
            "columns": len(df.columns),
            "data": df.head(10).to_dict(orient="records"),
        }
        return jsonify({"message": "File analyzed successfully ✅", "summary": summary})

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

# ------------------------------
# 📈 Fraud Data API (for charts)
# ------------------------------
@app.route("/fraud-data", methods=["GET"])
def fraud_data():
    data = FraudAnalysis.query.all()
    result = [
        {"income": r.income, "tax_paid": r.tax_paid, "fraud_risk": r.fraud_risk}
        for r in data
    ]
    return jsonify(result)

# ==============================
# 🚀 Run App
# ==============================
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
