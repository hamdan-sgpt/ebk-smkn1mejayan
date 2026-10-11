@echo off
setlocal enabledelayedexpansion
title e-BK Career Self-Efficacy SMKN 1 Mejayan (Fullstack)
color 0b

echo ================================================================
echo   e-BK Career Self-Efficacy - SMKN 1 Mejayan
echo   Pembimbing: Drs. M. Rofik, M.Pd
echo   Mode: FULLSTACK (React + Vite + PHP REST API + MySQL)
echo ================================================================
echo.

REM 1. Deteksi PHP XAMPP
set "PHP_BIN=php"
if exist "D:\xampp\php\php.exe" (
    set "PHP_BIN=D:\xampp\php\php.exe"
) else if exist "C:\xampp\php\php.exe" (
    set "PHP_BIN=C:\xampp\php\php.exe"
)

REM 2. Info MySQL
echo [1/3] Memeriksa status MySQL...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo       [OK] MySQL terdeteksi aktif di port 3306.
) else (
    echo       [PERHATIAN] Modul MySQL di XAMPP belum aktif.
    echo       Silakan klik START pada modul MySQL di XAMPP Control Panel.
)
echo.

REM 3. Jalankan Backend PHP di background
echo [2/3] Menjalankan Server Backend PHP API di port 8000...
start "e-BK PHP Backend" /min "%PHP_BIN%" -S 0.0.0.0:8000
echo       [OK] Backend API siap di http://localhost:8000 dan jaringan LAN
echo.

REM 4. Jalankan Frontend React Vite
echo [3/3] Menjalankan Frontend React Vite di port 5173...
echo.
set "MY_IP="
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Test-Connection -ComputerName (hostname) -Count 1).IPV4Address.IPAddressToString" 2^>nul') do set "MY_IP=%%a"
if "%MY_IP%"=="" set "MY_IP=192.168.1.3"

echo ================================================================
echo   AKSES DARI LAPTOP : http://localhost:5173
echo   AKSES DARI HP     : http://%MY_IP%:5173
echo                       (Pastikan HP satu Wi-Fi dengan laptop)
echo ================================================================
echo.

start http://localhost:5173

call npm run dev

echo.
echo Server telah dihentikan.
taskkill /F /IM php.exe >nul 2>&1
pause
