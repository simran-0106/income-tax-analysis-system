#!/usr/bin/env python3
"""
Quick test script to verify database connection and auth flow
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, User
from werkzeug.security import generate_password_hash, check_password_hash

def test_database():
    """Test database connection"""
    print("🔍 Testing database connection...")
    try:
        with app.app_context():
            # Try a simple query
            user_count = User.query.count()
            print(f"✅ Database connected! Total users: {user_count}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_signup():
    """Test signup flow"""
    print("\n🔍 Testing signup flow...")
    try:
        with app.app_context():
            # Clear test user if exists
            test_user = User.query.filter_by(username="testuser").first()
            if test_user:
                db.session.delete(test_user)
                db.session.commit()
            
            # Create test user
            hashed_pw = generate_password_hash("testpass123")
            new_user = User(
                username="testuser",
                email="test@example.com",
                phone="9876543210",
                password_hash=hashed_pw
            )
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ Signup test passed! User created: {new_user.username}")
            return True
    except Exception as e:
        print(f"❌ Signup test failed: {e}")
        db.session.rollback()
        return False

def test_login():
    """Test login flow"""
    print("\n🔍 Testing login flow...")
    try:
        with app.app_context():
            user = User.query.filter_by(username="testuser").first()
            if not user:
                print("❌ Test user not found. Run signup test first.")
                return False
            
            # Test password verification
            is_valid = check_password_hash(user.password_hash, "testpass123")
            if is_valid:
                print(f"✅ Login test passed! Password verified for user: {user.username}")
                return True
            else:
                print("❌ Password verification failed")
                return False
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Income Tax Analysis - Auth Flow Test")
    print("=" * 50)
    
    db_ok = test_database()
    if not db_ok:
        print("\n⚠️  Please ensure MySQL is running and credentials are correct.")
        sys.exit(1)
    
    signup_ok = test_signup()
    login_ok = test_login() if signup_ok else False
    
    print("\n" + "=" * 50)
    if db_ok and signup_ok and login_ok:
        print("✅ All tests passed! Auth flow is working.")
    else:
        print("❌ Some tests failed. Check the errors above.")
    print("=" * 50)
