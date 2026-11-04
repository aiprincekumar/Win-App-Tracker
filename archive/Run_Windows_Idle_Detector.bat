@echo off
@chcp 65001 >nul
setlocal EnableDelayedExpansion

REM Windows Idle and True Active Media Playback Sentinel Launcher
title Windows Idle ^& Media Playback Sentinel
color 0B

set "SCRIPT_DIR=%~dp0"
set "ENGINE_PATH=%~dp0Win App Tracker.py"

:: Locate Python Runtime
set "PYTHON_EXE="

where py >nul 2>nul
if !ERRORLEVEL! equ 0 (
    set "PYTHON_EXE=py -3"
)

if not defined PYTHON_EXE (
    where python >nul 2>nul
    if !ERRORLEVEL! equ 0 (
        set "PYTHON_EXE=python"
    )
)

if not defined PYTHON_EXE (
    if exist "%USERPROFILE%\.local\bin\python.exe" (
        set "PYTHON_EXE=%USERPROFILE%\.local\bin\python.exe"
    )
)

if not defined PYTHON_EXE (
    for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
        if exist "%%D\python.exe" set "PYTHON_EXE=%%D\python.exe"
    )
)

if not defined PYTHON_EXE (
    for /d %%D in ("%ProgramFiles%\Python*") do (
        if exist "%%D\python.exe" set "PYTHON_EXE=%%D\python.exe"
    )
)

if not defined PYTHON_EXE (
    echo.
    echo ============================================================================
    echo  [ERROR] Python runtime was not detected on this system!
    echo  Please install Python 3.10+ or add it to PATH.
    echo ============================================================================
    echo.
    pause
    exit /b 1
)

:: Directly Launch the Live Windows Idle & Media Sentinel Loop
!PYTHON_EXE! "%ENGINE_PATH%" %*
set "EXIT_CODE=!ERRORLEVEL!"
exit /b !EXIT_CODE!
