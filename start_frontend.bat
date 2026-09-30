@echo off
echo ========================================================
echo        ECOTRACE AI - Frontend Server Launcher
echo ========================================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [1/2] Installing Node packages...
    call npm install
)

echo [2/2] Starting Vite React dev server on http://localhost:5173 ...
call npm run dev
pause
