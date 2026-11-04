@echo off
setlocal
title MPV Player - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting MPV Player Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\mpv\mpv_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] MPV Detector exited with error code %errorlevel%.
    pause
)
endlocal
