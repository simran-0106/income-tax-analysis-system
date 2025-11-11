#!/usr/bin/env python3
"""
Database migration script to add username column to users table
Run this once to fix the "Unknown column 'users.username'" error
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db
import pymysql

def migrate_database():
    """Add username column to users table if it doesn't exist"""
    print("🔄 Starting database migration...")
    
    try:
        with app.app_context():
            # Get raw connection
            conn = db.engine.raw_connection()
            cursor = conn.cursor()
            
            try:
                # Check if username column exists
                cursor.execute("""
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME='users' AND COLUMN_NAME='username'
                """)
                
                if cursor.fetchone():
                    print("✅ Column 'username' already exists!")
                    cursor.close()
                    conn.close()
                    return True
                
                # Column doesn't exist, add it
                print("📝 Adding 'username' column to users table...")
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN username VARCHAR(80) UNIQUE NULL AFTER id
                """)
                conn.commit()
                print("✅ Column 'username' added successfully!")
                
                # Populate username from email for existing users
                print("📝 Populating username from email for existing users...")
                cursor.execute("""
                    UPDATE users 
                    SET username = SUBSTRING_INDEX(email, '@', 1) 
                    WHERE username IS NULL AND email IS NOT NULL
                """)
                conn.commit()
                print("✅ Populated username for existing users!")
                
                cursor.close()
                conn.close()
                return True
                
            except pymysql.Error as e:
                print(f"❌ MySQL Error: {e}")
                cursor.close()
                conn.close()
                return False
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Income Tax Analysis - Database Migration")
    print("=" * 60)
    
    success = migrate_database()
    
    print("=" * 60)
    if success:
        print("✅ Migration completed successfully!")
        print("You can now signup/login without errors.")
    else:
        print("❌ Migration failed. Check errors above.")
        sys.exit(1)
    print("=" * 60)
