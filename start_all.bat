@echo off
echo ========================================================
echo        ECOTRACE AI - Full Stack Launcher
echo ========================================================
echo Launching Backend server in a new window...
start "EcoTrace AI - Backend" cmd /k ""%~dp0start_backend.bat""

echo Launching Frontend React App in a new window...
start "EcoTrace AI - Frontend" cmd /k ""%~dp0start_frontend.bat""

echo.
echo Both servers are launching:
echo   - Backend API: http://localhost:8000 (Swagger docs at /docs)
echo   - Frontend UI: http://localhost:5173
echo.
pause
