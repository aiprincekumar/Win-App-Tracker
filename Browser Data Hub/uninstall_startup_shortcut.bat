@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Browser Data Hub - Windows Startup Uninstaller
echo   Department 06: Backend ^& API Engineering ^& Dept 13: SRE / Automation
echo ============================================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\Browser_Data_Hub.lnk"

echo [1/2] Removing shortcut from Windows Startup folder...
if exist "%SHORTCUT_PATH%" (
    del /f /q "%SHORTCUT_PATH%"
    echo [SUCCESS] Removed "%SHORTCUT_PATH%".
) else (
    echo [INFO] Shortcut was not present in Windows Startup folder.
)

echo [2/2] Checking running daemon instances...
if exist "%~dp0stop_data_hub.bat" (
    call "%~dp0stop_data_hub.bat"
)

echo.
echo ============================================================================
echo [DONE] Auto-start registration has been cleanly removed.
echo   - Browser Data Hub will no longer launch automatically on Windows boot.
echo ============================================================================
timeout /t 2 >nul 2>&1
exit /b 0
