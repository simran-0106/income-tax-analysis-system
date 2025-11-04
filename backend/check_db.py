# backend/check_db.py
from app import create_app
from models import db, User

app = create_app()

with app.app_context():
    users = User.query.all()
    print("Number of users:", len(users))
    for u in users:
        print(u.id, u.email, u.phone)
