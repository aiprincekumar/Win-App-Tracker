@echo off
setlocal
title Daum PotPlayer - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting Daum PotPlayer Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\potplayer\potplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] PotPlayer Detector exited with error code %errorlevel%.
    pause
)
endlocal
