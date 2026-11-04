@echo off
setlocal
title VLC Media Player - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting VLC Media Player Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\vlc\vlc_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] VLC Detector exited with error code %errorlevel%.
    pause
)
endlocal
