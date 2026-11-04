@echo off
setlocal
title KMPlayer - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting KMPlayer Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\kmplayer\kmplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] KMPlayer Detector exited with error code %errorlevel%.
    pause
)
endlocal
