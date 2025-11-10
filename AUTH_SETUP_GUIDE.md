# 🔐 Income Tax Analysis - Auth Setup Guide

## Quick Start

### Prerequisites
- **Python 3.8+** installed
- **MySQL 5.7+** running locally
- **Node.js 14+** installed
- **npm** for frontend

### Step 1: MySQL Database Setup

Before running the app, create the database and user:

```sql
-- Open MySQL command line (mysql.exe -u root -p)
CREATE DATABASE income_tax_db;
CREATE USER 'flaskuser'@'localhost' IDENTIFIED BY 'flaskpass';
GRANT ALL PRIVILEGES ON income_tax_db.* TO 'flaskuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Or use PowerShell:**
```powershell
mysql -u root -p -e "CREATE DATABASE income_tax_db; CREATE USER 'flaskuser'@'localhost' IDENTIFIED BY 'flaskpass'; GRANT ALL PRIVILEGES ON income_tax_db.* TO 'flaskuser'@'localhost'; FLUSH PRIVILEGES;"
```

### Step 2: Backend Setup

```powershell
cd 'c:\Users\simra\OneDrive\Desktop\final year project\backend'

# Install dependencies
pip install -r requirements.txt

# Test the auth flow (optional but recommended)
python test_auth.py

# Start the backend server
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debugger is active!
```

### Step 3: Frontend Setup (in another terminal)

```powershell
cd 'c:\Users\simra\OneDrive\Desktop\final year project\frontend'

# Install dependencies
npm install

# Start the frontend dev server
npm start
```

Frontend will open at `http://localhost:3000`

---

## 🧪 Testing Auth Flow

### Manual Test Steps

1. **Sign Up**
   - Open browser to `http://localhost:3000/signup`
   - Enter:
     - Username: `john_doe`
     - Phone: `9876543210`
     - Password: `Password123`
     - Confirm: `Password123`
   - Click "Sign Up"
   - Should show success message and redirect to Login

2. **Login**
   - On the Login page (or visit `http://localhost:3000`)
   - Enter:
     - Username: `john_doe`
     - Password: `Password123`
   - Click "Login"
   - Should redirect to Dashboard and show "Welcome, john_doe"

3. **Verify Storage**
   - Open Browser DevTools (F12)
   - Go to Application → Local Storage
   - Should see:
     - `token`: (long JWT string)
     - `username`: `john_doe`

### Automated Test

```powershell
cd 'c:\Users\simra\OneDrive\Desktop\final year project\backend'
python test_auth.py
```

This will:
- ✅ Test database connection
- ✅ Create a test user
- ✅ Verify password hashing
- ✅ Report any issues with detailed errors

---

## 🚨 Troubleshooting

### "Connection refused" when starting backend

**Problem:** MySQL is not running

**Solution:**
```powershell
# Start MySQL service on Windows
# Option 1: Using Services (services.msc)
Start-Service MySQL80  # or MySQL57, depending on your version

# Option 2: Using Command Prompt as Admin
net start MySQL80
```

### "Database error" during signup/login

**Problem:** Database credentials are wrong or database doesn't exist

**Solution:**
1. Verify MySQL is running: `mysql -u root -p -e "SHOW DATABASES;"`
2. Check credentials in `backend/app.py` line 31:
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://flaskuser:flaskpass@localhost/income_tax_db"
   ```
3. Re-run Step 1 (MySQL setup) if needed

### Signup/Login shows "Invalid JSON" error

**Problem:** Frontend API config is wrong

**Solution:**
1. Check `frontend/src/api.js` line 5:
   ```javascript
   baseURL: "http://localhost:5000",
   ```
2. Verify backend is running on `http://localhost:5000`
3. Check browser console (F12) for CORS or network errors

### "User already exists" during signup

**Problem:** You're trying to sign up with the same username twice

**Solution:**
- Choose a different username (each must be unique)
- Or delete the user from the database:
  ```sql
  DELETE FROM users WHERE username = 'john_doe';
  ```

### Page shows "Guest" instead of username on dashboard

**Problem:** Token validation failed or username not stored

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete) and Local Storage
2. Try logging out and logging back in
3. Check browser console for any errors (F12 → Console)

---

## 📁 Project Structure

```
backend/
├── app.py                 # Flask API (signup/login/upload endpoints)
├── models.py              # Database models (User, Upload, FraudAnalysis)
├── test_auth.py           # Auth flow test script (run this to debug!)
├── requirements.txt       # Python dependencies
└── uploads/               # Uploaded files & generated visualizations

frontend/
├── src/
│   ├── components/
│   │   ├── login.js       # Login form (improved with error handling)
│   │   ├── signup.js      # Signup form (with validation)
│   │   ├── dashboard.js   # Main dashboard
│   │   └── navbar.js      # Navigation bar
│   ├── api.js             # API client (axios)
│   └── App.js             # Main App component
└── package.json           # Dependencies
```

---

## 🔑 Key Improvements Made

### Backend (app.py)
- ✅ Try-catch error handling with detailed logging
- ✅ Accepts `username`, `userId` (legacy), or `email` for compatibility
- ✅ Validates input fields (username, password required)
- ✅ Prevents duplicate users
- ✅ Hashes passwords with werkzeug
- ✅ Issues JWT tokens valid for 6 hours
- ✅ Safe DB migration on startup (populates missing usernames)

### Frontend (login.js, signup.js)
- ✅ Form validation (username, password, phone format checks)
- ✅ Inline error messages (no more alert boxes!)
- ✅ Loading spinner during auth requests
- ✅ Password confirmation in signup
- ✅ Auto-redirect after successful signup
- ✅ Disabled inputs while loading
- ✅ Helpful placeholders and descriptions
- ✅ Trimmed input to prevent whitespace bugs

---

## 🚀 Next Steps (Optional)

1. **Add email verification** - Send OTP to email during signup
2. **Add password reset** - Create forgot password flow
3. **Add 2FA** - Two-factor authentication with TOTP
4. **Improve validation** - Add real-time validation and format checking
5. **Add OAuth** - Google/GitHub login integration
6. **Session management** - Automatic logout on token expiration

---

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Run `python test_auth.py` to diagnose database/auth issues
3. Check browser console (F12 → Console) for frontend errors
4. Check backend terminal for error logs (marked with ❌)

---

**Last Updated:** November 10, 2025
**Author:** Development Team
