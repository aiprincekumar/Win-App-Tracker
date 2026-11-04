@echo off
setlocal
title GOM Player - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting GOM Player Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\gomplayer\gomplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] GOM Player Detector exited with error code %errorlevel%.
    pause
)
endlocal
