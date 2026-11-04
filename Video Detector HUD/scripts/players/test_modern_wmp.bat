@echo off
setlocal
title Windows 11 Modern Media Player - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting Windows 11 Modern Media Player Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\media_player_modern\modern_wmp_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Modern Media Player Detector exited with error code %errorlevel%.
    pause
)
endlocal
