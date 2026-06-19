@echo off
setlocal
set "PORT=8018"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>nul
)

echo Local server on port %PORT% has been stopped.
timeout /t 2 /nobreak >nul
exit /b
