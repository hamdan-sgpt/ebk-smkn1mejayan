@echo off
title Izinkan Akses HP - e-BK SMKN 1 Mejayan
color 0a

:: Memeriksa hak Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ================================================================
    echo   [INFO] Meminta Izin Administrator...
    echo   Jika muncul jendela UAC (pop-up Windows), silakan klik YES / YA.
    echo ================================================================
    powershell -Command "Start-Process cmd -ArgumentList '/k cd /d \"%~dp0\" && \"%~nx0\" admin' -Verb RunAs"
    exit /b
)

echo ================================================================
echo   MEMBUKA FIREWALL WINDOWS UNTUK AKSES HP (LAN)
echo   Aplikasi e-BK SMKN 1 Mejayan
echo ================================================================
echo.

echo [1/2] Membuka port 5173 (Frontend React Vite)...
netsh advfirewall firewall delete rule name="e-BK Vite 5173" >nul 2>&1
netsh advfirewall firewall add rule name="e-BK Vite 5173" dir=in action=allow protocol=TCP localport=5173 profile=any
echo       [OK] Port 5173 berhasil dibuka!
echo.

echo [2/2] Membuka port 8000 (Backend PHP API)...
netsh advfirewall firewall delete rule name="e-BK PHP 8000" >nul 2>&1
netsh advfirewall firewall add rule name="e-BK PHP 8000" dir=in action=allow protocol=TCP localport=8000 profile=any
echo       [OK] Port 8000 berhasil dibuka!
echo.

echo ================================================================
echo   SELESAI! Firewall Windows sudah berhasil diizinkan.
echo.
set "MY_IP="
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Test-Connection -ComputerName (hostname) -Count 1).IPV4Address.IPAddressToString" 2^>nul') do set "MY_IP=%%a"
if "%MY_IP%"=="" set "MY_IP=192.168.1.3"

echo   Sekarang buka di browser HP Anda (Chrome / Safari):
echo   http://%MY_IP%:5173
echo.
echo   Catatan penting:
echo   1. Pastikan HP terhubung ke jaringan Wi-Fi yang sama dengan laptop.
echo   2. Gunakan "http://" (bukan "https://").
echo ================================================================
echo.
pause

