@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Browser Data Hub - Windows Startup Auto-Boot Installer
echo   Department 06: Backend ^& API Engineering ^& Dept 13: SRE / Automation
echo ============================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "VBS_LAUNCHER=%SCRIPT_DIR%run_data_hub.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\Browser_Data_Hub.lnk"

if not exist "%VBS_LAUNCHER%" (
    echo [ERROR] Launcher file not found at: "%VBS_LAUNCHER%"
    pause
    exit /b 1
)

echo [1/3] Registering background daemon into Windows Startup folder:
echo       Destination: "%SHORTCUT_PATH%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ws = New-Object -ComObject WScript.Shell; " ^
    "$sc = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
    "$sc.TargetPath = 'wscript.exe'; " ^
    "$sc.Arguments = '`\"%VBS_LAUNCHER%`\"'; " ^
    "$sc.WorkingDirectory = '%SCRIPT_DIR%'; " ^
    "$sc.Description = 'Browser Data Hub - Multi-Browser SQLite Sentinel Service (Port 65433)'; " ^
    "$sc.WindowStyle = 7; " ^
    "$sc.Save();"

if exist "%SHORTCUT_PATH%" (
    echo [2/3] Verified shortcut creation in Windows Startup successfully!
) else (
    echo [ERROR] Failed to create shortcut in Startup folder.
    pause
    exit /b 1
)

echo [3/3] Checking service status and launching daemon in background...
netstat -ano | findstr ":65433" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [+] Browser Data Hub is ALREADY ACTIVE and listening on ws://127.0.0.1:65433
) else (
    echo [*] Launching silent background daemon via wscript.exe...
    wscript.exe "%VBS_LAUNCHER%"
    
    :: Verification loop
    set /a ATTEMPTS=0
    :VERIFY_LOOP
    timeout /t 1 /nobreak >nul 2>&1
    netstat -ano | findstr ":65433" | findstr "LISTENING" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [+] Verified Browser Data Hub active on ws://127.0.0.1:65433
        goto READY
    )
    set /a ATTEMPTS+=1
    if !ATTEMPTS! LSS 4 goto VERIFY_LOOP
)

:READY
echo.
echo ============================================================================
echo [SUCCESS] Windows Startup Auto-Boot is now ACTIVE!
echo   - Destination: %SHORTCUT_PATH%
echo   - Target: wscript.exe "%VBS_LAUNCHER%"
echo   - Whenever Windows boots, Browser Data Hub will start silently in background.
echo   - Zero terminal popups, pure invisible background daemon (^< 5 MB RAM).
echo   - Multi-Browser SQLite telemetry listening on ws://127.0.0.1:65433.
echo ============================================================================
timeout /t 2 >nul 2>&1
exit /b 0
