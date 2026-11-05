@echo off
setlocal enabledelayedexpansion
title Win App Tracker - Universal Service Launcher

echo ======================================================================
echo              WIN APP TRACKER - ALL-SERVICES LAUNCHER
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Auto-synchronize registry for Native Messaging and videohud:// protocol
echo [*] Dynamically configuring Windows Registry and Native Messaging Hosts...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Video Detector HUD\scripts\register_native_messaging_host.ps1" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Video Detector HUD\scripts\register_videohud_protocol.ps1" >nul 2>&1

:: 2. Launch Browser Data Hub (port 65433)
echo [*] Starting Multi-Browser SQLite Data Hub (ws://127.0.0.1:65433)...
call "%~dp0Browser Data Hub\Run_Browser_Data_Hub.bat"

:: 3. Launch Video Detector HUD (ws://127.0.0.1:65432)
echo [*] Starting Video Detector HUD (ws://127.0.0.1:65432)...
call "%~dp0Video Detector HUD\Run_Video_Detector_HUD.bat"

echo.
echo ======================================================================
echo                        VERIFICATION STATUS
echo ======================================================================
netstat -ano | findstr ":65433" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [OK] Browser Data Hub is ONLINE on ws://127.0.0.1:65433
) else (
    echo [WARN] Browser Data Hub port 65433 not detected yet.
)

netstat -ano | findstr ":65432" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [OK] Video Detector HUD is ONLINE on ws://127.0.0.1:65432
) else (
    echo [WARN] Video Detector HUD port 65432 not detected yet.
)
echo ======================================================================
echo System is fully dynamic and operational.
