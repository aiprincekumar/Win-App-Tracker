@echo off
setlocal
title BS.Player - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting BS.Player Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\bsplayer\bsplayer_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] BS.Player Detector exited with error code %errorlevel%.
    pause
)
endlocal
