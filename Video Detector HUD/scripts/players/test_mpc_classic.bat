@echo off
setlocal
title Media Player Classic & Legacy WMP - Standalone Video Telemetry Diagnostic
cls
echo ===============================================================================
echo   Starting MPC-HC / MPC-BE / Legacy WMP Standalone Diagnostic Sentinel...
echo ===============================================================================
python "%~dp0..\..\src\players\mpc_classic\mpc_classic_detector.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] MPC Classic Detector exited with error code %errorlevel%.
    pause
)
endlocal
