import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS 
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import pandas as pd
import pymysql  # ✅ MySQL driver

# Import models
from models import db, User, Upload, FraudAnalysis

# ==============================
# 🔐 Flask Configuration
# ==============================

SECRET_KEY = os.environ.get("JWT_SECRET", "your-very-secret-key")

app = Flask(__name__)
CORS(app)

# Enable MySQL driver
pymysql.install_as_MySQLdb()

# 🧠 Base directory
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, "uploads")

# ✅ MySQL Connection String (update your password below)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://flaskuser:flaskpass@localhost/income_tax_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = SECRET_KEY

# Initialize Database
db.init_app(app)

# Ensure uploads folder exists
if not os.path.isdir(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==============================
# ⚙️ Database Setup Function
# ==============================
def create_app():
    with app.app_context():
        db.create_all()  # Creates all tables (users, uploads, fraud_analysis)
        # quick migration: populate username for existing users if missing
        try:
            users_missing = User.query.filter((User.username == None) | (User.username == "")).all()
            for u in users_missing:
                if u.email:
                    u.username = u.email
                else:
                    u.username = f"user{u.id}"
                db.session.add(u)
            db.session.commit()
        except Exception as e:
            print("Username migration skipped or failed:", e)
    return app

# ==============================
# 🔑 JWT Helper Functions
# ==============================
def create_token(identifier):
    payload = {
        "sub": identifier,
        "exp": datetime.utcnow() + timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ==============================
# 🌐 ROUTES
# ==============================

@app.route('/')
def home():
    return jsonify({"message": "Flask backend with MySQL is running ✅"})

# ------------------------------
# 📝 SIGNUP
# ------------------------------
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"message": "Invalid JSON body"}), 400

        # prefer username, but accept email or old userId fields for compatibility
        username = data.get("username") or data.get("userId") or data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if not username or not password:
            return jsonify({"message": "Username and password required"}), 400

        # check uniqueness against username or email
        existing = User.query.filter((User.username == username) | (User.email == username)).first()
        if existing:
            return jsonify({"message": "Username or email already exists"}), 400

        hashed = generate_password_hash(password)
        new_user = User(username=username, email=data.get("email"), phone=phone, password_hash=hashed)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Signup successful"}), 200
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"Signup failed: {str(e)}"}), 500

# ------------------------------
# 🔐 LOGIN
# ------------------------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"message": "Invalid JSON body"}), 400

        # accept username, userId, or email from frontend
        identifier = data.get("username") or data.get("userId") or data.get("email")
        password = data.get("password")

        if not identifier or not password:
            return jsonify({"message": "Username and password required"}), 400

        # try finding by username first, fall back to email
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()

        if user and check_password_hash(user.password_hash, password):
            # use username as token subject when available
            token_sub = user.username or user.email
            token = create_token(token_sub)
            return jsonify({"message": "Login successful", "token": token}), 200
        return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({"message": f"Login failed: {str(e)}"}), 500

# ------------------------------
# 👤 PROFILE (Protected Route)
# ------------------------------
@app.route('/profile', methods=['GET'])
def profile():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Missing token"}), 401

    try:
        token = auth_header.split(" ")[1]
    except IndexError:
        return jsonify({"message": "Invalid token format"}), 401

    payload = decode_token(token)
    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    # payload['sub'] may contain username or email; search both
    sub = payload.get("sub")
    user = User.query.filter((User.username == sub) | (User.email == sub)).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "role": user.role
    })

# ------------------------------
# 📊 STATS ENDPOINT
# ------------------------------
@app.route('/stats', methods=['GET'])
def stats():
    try:
        users_count = User.query.count()
    except Exception:
        users_count = 0

    uploads_count = Upload.query.count()
    fraud_count = FraudAnalysis.query.count()

    return jsonify({
        "users": users_count,
        "uploads": uploads_count,
        "fraud": fraud_count
    })

# ------------------------------
# 📤 FILE UPLOAD
# ------------------------------
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Read uploaded data
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Generate fraud risk (dummy logic for now)
        df['fraud_risk'] = df.apply(
            lambda x: 0.8 if x.get('Tax_Paid', 0) < (x.get('Income', 1) * 0.05) else 0.2,
            axis=1
        )

        # Save analyzed data to database
        for _, row in df.iterrows():
            fraud_record = FraudAnalysis(
                transaction_id=row.get('PAN_Number'),
                income=row.get('Income', 0),
                tax_paid=row.get('Tax_Paid', 0),
                fraud_risk=row.get('fraud_risk', 0),
                user_id=1  # You can replace this with logged-in user later
            )
            db.session.add(fraud_record)
        db.session.commit()

        summary = {
            "rows": len(df),
            "columns": len(df.columns),
            "columns_list": df.columns.tolist(),
            "preview": df.head(5).to_dict(orient="records")
        }
        return jsonify({"message": "File analyzed and saved successfully", "summary": summary}), 200

    except Exception as e:
        return jsonify({"message": f"Error processing file: {str(e)}"}), 500


# ------------------------------
# 📥 SERVE UPLOADED FILES
# ------------------------------
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ------------------------------
# 📈 AUGMENTED DATA
# ------------------------------
@app.route('/augmented-data', methods=['GET'])
def serve_augmented_data():
    augmented_path = os.path.join(UPLOAD_FOLDER, 'sample_augmented.csv')

    try:
        from scripts.visualize import main as generate_visuals
        generate_visuals()
    except Exception as e:
        return jsonify({"error": f"Error generating augmented data: {str(e)}"}), 500

    if request.args.get('download') == 'true':
        return send_from_directory(
            UPLOAD_FOLDER,
            'sample_augmented.csv',
            as_attachment=True,
            download_name='income_tax_augmented.csv'
        )
    return send_from_directory(UPLOAD_FOLDER, 'sample_augmented.csv')

# ==============================
# 🚀 RUN FLASK APP
# ==============================
if __name__ == '__main__':
    create_app()
    app.run(debug=True, port=5000)
