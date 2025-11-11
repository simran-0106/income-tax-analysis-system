#!/usr/bin/env python3
"""
Direct database migration script - no app dependencies
Adds username column to users table if it doesn't exist
"""
import pymysql
import sys

def migrate():
    """Migrate database directly using pymysql"""
    print("=" * 60)
    print("Database Migration - Add Username Column")
    print("=" * 60)
    
    try:
        # Connect to MySQL
        conn = pymysql.connect(
            host='localhost',
            user='flaskuser',
            password='flaskpass',
            database='income_tax_db',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ Connected to database")
        
        cursor = conn.cursor()
        
        # Check if username column exists
        print("\n🔍 Checking if 'username' column exists...")
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME='users' AND COLUMN_NAME='username'
        """)
        
        if cursor.fetchone():
            print("✅ Column 'username' already exists - no migration needed!")
            cursor.close()
            conn.close()
            return True
        
        # Add username column
        print("📝 Adding 'username' column to users table...")
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN username VARCHAR(80) UNIQUE NULL AFTER id
        """)
        conn.commit()
        print("✅ Column 'username' added successfully!")
        
        # Populate username from email for existing users
        print("📝 Populating username for existing users...")
        cursor.execute("""
            UPDATE users 
            SET username = SUBSTRING_INDEX(email, '@', 1) 
            WHERE username IS NULL AND email IS NOT NULL
        """)
        updated = cursor.rowcount
        conn.commit()
        print(f"✅ Updated {updated} users with username from email")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        return True
        
    except pymysql.Error as e:
        print(f"\n❌ MySQL Error: {e}")
        print("\n⚠️  Make sure:")
        print("   1. MySQL is running")
        print("   2. Database 'income_tax_db' exists")
        print("   3. User 'flaskuser' exists with password 'flaskpass'")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = migrate()
    sys.exit(0 if success else 1)
