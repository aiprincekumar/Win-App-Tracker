@echo off
:: Registers com.antigravity.videohud Native Messaging Host in HKCU
:: Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register_native_messaging_host.ps1"
pause
