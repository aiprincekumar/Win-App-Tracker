@echo off
setlocal
title Films & TV (Movies & TV UWP) - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting Films & TV UWP Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\films_tv\films_tv_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Films & TV Detector exited with error code %errorlevel%.
    pause
)
endlocal
