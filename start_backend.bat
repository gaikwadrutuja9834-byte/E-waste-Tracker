@echo off
echo ========================================================
echo        ECOTRACE AI - Backend Server Launcher
echo ========================================================
cd /d "%~dp0backend"

if not exist "venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
)

echo [2/3] Activating virtual environment & installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/3] Starting FastAPI server on http://localhost:8000 ...
python run.py
pause
