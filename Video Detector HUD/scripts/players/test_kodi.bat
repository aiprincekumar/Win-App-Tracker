@echo off
setlocal
title Kodi Media Center - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting Kodi Media Center Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\kodi\kodi_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Kodi Detector exited with error code %errorlevel%.
    pause
)
endlocal
