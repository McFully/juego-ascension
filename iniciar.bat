@echo off
chcp 65001 >nul
title Ascension - Servidor de Desarrollo

echo.
echo ====================================================
echo   ASCENSION - Servidor de Desarrollo
echo ====================================================
echo.
cd /d "%~dp0"

if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo [INFO] Liberando puerto 5173 si está ocupado...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [INFO] Matando proceso anterior con PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo [INFO] Abriendo navegador...
start "" "http://localhost:5173/"

echo.
echo [INFO] Iniciando Vite...
echo.

call npm run dev

echo.
echo [INFO] Servidor detenido.
pause
