# Income Tax Project — Run & Development Guide

This repository has a Flask backend and a React frontend. Below are quick steps to get the project running locally on Windows (PowerShell). Adjust commands for other shells or OS.

## Prerequisites
- Python 3.10+ (or 3.8+)
- Node.js 16+ and npm
- (Optional) virtualenv or venv for Python environment

---

## Backend (Flask)

1. Open PowerShell and create/activate a virtual environment:

```powershell
cd "c:\Users\simra\OneDrive\Desktop\final year project\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install Python requirements:

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

3. Create the SQLite DB (optional — app will create DB on first run):

```powershell
python -c "from app import create_app; create_app()"
```

4. Start the backend server:

```powershell
python app.py
```

The backend will run on port 5000 by default.

Notes:
- Environment variable JWT_SECRET can be set to override the default secret key.

---

## Frontend (React)

1. Open a new PowerShell and install dependencies:

```powershell
cd "c:\Users\simra\OneDrive\Desktop\final year project\frontend"
npm install
```

2. Start the dev server:

```powershell
npm start
```

The React dev server proxies API requests to `http://localhost:5000` by default (see `frontend/package.json`).

To create a production build:

```powershell
npx react-scripts build
```

---

## What I fixed
- Fixed frontend components to correctly consume the API helper (`api.js`) return values (avoid `res.data.data` style bugs).
- Updated upload component to use the central `uploadFile` API helper and to send the JWT token saved in `localStorage`.
- Verified frontend builds successfully (`npx react-scripts build`).
- Added this README with run instructions.

## Next suggested steps
- Create a `.env` to store secrets and load via `python-dotenv` in the backend.
- Add a `/stats` endpoint to the backend if the dashboard should fetch server stats.
- Add simple unit tests for the backend endpoints and a smoke test for the frontend.

If you'd like, I can:
- Install backend requirements and try starting the Flask server here.
- Add token-based auto-login after signup.
- Implement the `/stats` endpoint used by the dashboard.

---

If you want me to continue (start the backend here, implement `/stats`, or add tests), tell me which item to pick next.