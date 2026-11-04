@echo off
:: Video Detector HUD - Native Messaging Host Launcher
:: Dispatches stdio messages to launch_hud_native.py
:: Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

cd /d "%~dp0"

if exist "%~dp0..\.venv\Scripts\python.exe" (
    "%~dp0..\.venv\Scripts\python.exe" "%~dp0launch_hud_native.py"
    exit /b %ERRORLEVEL%
)

if exist "%~dp0..\..\.venv\Scripts\python.exe" (
    "%~dp0..\..\.venv\Scripts\python.exe" "%~dp0launch_hud_native.py"
    exit /b %ERRORLEVEL%
)

if defined USERPROFILE (
    if exist "%USERPROFILE%\.venv\Scripts\python.exe" (
        "%USERPROFILE%\.venv\Scripts\python.exe" "%~dp0launch_hud_native.py"
        exit /b %ERRORLEVEL%
    )
    if exist "%USERPROFILE%\.local\bin\python.exe" (
        "%USERPROFILE%\.local\bin\python.exe" "%~dp0launch_hud_native.py"
        exit /b %ERRORLEVEL%
    )
)

python "%~dp0launch_hud_native.py"
exit /b %ERRORLEVEL%
