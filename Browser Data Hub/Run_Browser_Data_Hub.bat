@echo off
setlocal enabledelayedexpansion
title Browser Data Hub - Launcher

cd /d "%~dp0"

:: 1. Check if Browser Data Hub is already running on port 65433
netstat -ano | findstr ":65433" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [+] Browser Data Hub is ALREADY ACTIVE and listening on ws://127.0.0.1:65433
    exit /b 0
)

:: 2. Find Python executable dynamically
set "PYTHON_EXEC="
if exist "%USERPROFILE%\.venv\Scripts\pythonw.exe" (
    set "PYTHON_EXEC=%USERPROFILE%\.venv\Scripts\pythonw.exe"
) else if exist "%~dp0.venv\Scripts\pythonw.exe" (
    set "PYTHON_EXEC=%~dp0.venv\Scripts\pythonw.exe"
) else if exist "%~dp0..\.venv\Scripts\pythonw.exe" (
    set "PYTHON_EXEC=%~dp0..\.venv\Scripts\pythonw.exe"
) else if exist "%USERPROFILE%\.local\bin\python.exe" (
    set "PYTHON_EXEC=%USERPROFILE%\.local\bin\python.exe"
) else (
    where pythonw >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "PYTHON_EXEC=pythonw"
    ) else (
        where python >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            set "PYTHON_EXEC=python"
        )
    )
)

if not defined PYTHON_EXEC (
    echo [ERROR] No Python installation found on system!
    echo Please install Python 3.10+ or configure a virtual environment.
    pause
    exit /b 1
)

:: 3. Launch Browser Data Hub detached in background
start "" "!PYTHON_EXEC!" "%~dp0browser_data_hub.py" %*

:: 4. Verify startup
set /a ATTEMPTS=0
:VERIFY_LOOP
timeout /t 1 /nobreak >nul 2>&1
netstat -ano | findstr ":65433" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [+] Browser Data Hub started successfully on ws://127.0.0.1:65433
    exit /b 0
)
set /a ATTEMPTS+=1
if !ATTEMPTS! LSS 4 goto VERIFY_LOOP

echo [+] Browser Data Hub initiated. Binding port ws://127.0.0.1:65433...
exit /b 0
