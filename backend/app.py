import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import jwt
import pandas as pd

# ==============================
# 🔐 Configuration
# ==============================
SECRET_KEY = os.environ.get("JWT_SECRET", "your-very-secret-key")

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
db_file = os.path.join(basedir, 'app.db')
UPLOAD_FOLDER = os.path.join(basedir, "uploads")

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_file}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = SECRET_KEY

# initialize db
db.init_app(app)

if not os.path.isdir(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ==============================
# ⚙️ Create DB
# ==============================
def create_app():
    with app.app_context():
        db.create_all()
    return app


# ==============================
# 🔑 JWT Helper Functions
# ==============================
def create_token(email):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ==============================
# 🌐 Routes
# ==============================

@app.route('/')
def home():
    return jsonify({"message": "Flask backend is running"})


# ------------------------------
# 📝 Signup
# ------------------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("Signup Data:", data)

    if not data:
        return jsonify({"message": "Invalid JSON body"}), 400

    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # Create user
    hashed = generate_password_hash(password)
    new_user = User(email=email, phone=phone, password_hash=hashed)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful"}), 200


# ------------------------------
# 🔐 Login
# ------------------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print("Login Data:", data)

    if not data:
        return jsonify({"message": "Invalid JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        token = create_token(user.email)
        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# ------------------------------
# 👤 Protected Profile Route
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

    user = User.query.filter_by(email=payload["sub"]).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"email": user.email, "phone": user.phone})


# ------------------------------
# � Stats Endpoint
# ------------------------------
@app.route('/stats', methods=['GET'])
def stats():
    """Return basic metrics: total users, number of uploaded files, and detected frauds.

    - users: number of rows in the users table
    - uploads: number of files in the uploads folder
    - fraud: placeholder (0) — replace with real detection logic if available
    """
    try:
        users_count = User.query.count()
    except Exception:
        users_count = 0

    uploads_count = 0
    try:
        if os.path.isdir(UPLOAD_FOLDER):
            uploads_count = len([
                f for f in os.listdir(UPLOAD_FOLDER)
                if os.path.isfile(os.path.join(UPLOAD_FOLDER, f)) and not f.startswith('.')
            ])
    except Exception:
        uploads_count = 0

    # TODO: replace with real fraud detection metric
    fraud_count = 0

    return jsonify({
        "users": users_count,
        "uploads": uploads_count,
        "fraud": fraud_count,
    })


# ------------------------------
# �📁 File Upload
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
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        summary = {
            "rows": len(df),
            "columns": len(df.columns),
            "columns_list": df.columns.tolist(),
            "preview": df.head(5).to_dict(orient="records")
        }
        return jsonify({"message": "File uploaded successfully", "summary": summary}), 200
    except Exception as e:
        return jsonify({"message": f"File saved but error reading file: {str(e)}"}), 200


# ------------------------------
# 📤 Serve Uploaded Files
# ------------------------------
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ------------------------------
# 📊 Serve Augmented Data
# ------------------------------
@app.route('/augmented-data', methods=['GET'])
def serve_augmented_data():
    """Serve the augmented CSV with tax and fraud risk metrics.
    Access via /augmented-data?download=true to force download."""
    augmented_path = os.path.join(UPLOAD_FOLDER, 'sample_augmented.csv')
    
    # Run visualization script to ensure augmented data is fresh
    try:
        from scripts.visualize import main as generate_visuals
        generate_visuals()
    except Exception as e:
        return jsonify({"error": f"Error generating augmented data: {str(e)}"}), 500

    # Force download if requested
    if request.args.get('download') == 'true':
        return send_from_directory(
            UPLOAD_FOLDER,
            'sample_augmented.csv',
            as_attachment=True,
            download_name='income_tax_augmented.csv'
        )
    
    # Otherwise serve normally
    return send_from_directory(UPLOAD_FOLDER, 'sample_augmented.csv')


# ==============================
# 🚀 Run App
# ==============================
if __name__ == '__main__':
    create_app()
    app.run(debug=True, port=5000)
