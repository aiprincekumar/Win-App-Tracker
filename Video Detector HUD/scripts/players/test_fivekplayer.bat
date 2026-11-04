@echo off
setlocal
title 5KPlayer - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting 5KPlayer Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\fivekplayer\fivekplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] 5KPlayer Detector exited with error code %errorlevel%.
    pause
)
endlocal
