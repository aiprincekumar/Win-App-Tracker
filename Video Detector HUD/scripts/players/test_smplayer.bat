@echo off
setlocal
title SMPlayer - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting SMPlayer Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\smplayer\smplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] SMPlayer Detector exited with error code %errorlevel%.
    pause
)
endlocal
