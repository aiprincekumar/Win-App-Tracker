@echo off
setlocal
title Media Player Standalone Telemetry Diagnostic Sentinel - Master Launcher
:menu
cls
echo ===============================================================================
echo   WINDOWS VIDEO SENTINEL - UNIVERSAL MEDIA PLAYER FLEET DIAGNOSTIC SUITE
echo ===============================================================================
echo.
echo   Select a media player to launch its dedicated standalone diagnostic sentinel:
echo.
echo     [1]  VLC Media Player (vlc.exe)
echo     [2]  Films ^& TV / Movies ^& TV UWP (video.ui.exe)
echo     [3]  Media Player Classic (mpc-hc.exe, mpc-be.exe, wmplayer.exe)
echo     [4]  Windows 11 Modern Media Player (microsoft.media.player.exe)
echo     [5]  Daum PotPlayer (potplayermini64.exe, potplayer64.exe)
echo     [6]  MPV / mpv.net (mpv.exe, mpvnet.exe)
echo     [7]  KMPlayer (kmplayer.exe, kmplayer64.exe)
echo     [8]  GOM Player (gom.exe, gom64.exe)
echo     [9]  SMPlayer (smplayer.exe)
echo     [10] Kodi Media Center (kodi.exe)
echo     [11] BS.Player (bsplayer.exe)
echo     [12] 5KPlayer (5kplayer.exe)
echo.
echo     [13] Run Full Automated Offline Player Verification Test Suite
echo     [0]  Exit
echo.
echo ===============================================================================
set /p choice="  Enter choice [0-13]: "

if "%choice%"=="1" (
    call "%~dp0test_vlc.bat"
    goto menu
)
if "%choice%"=="2" (
    call "%~dp0test_films_tv.bat"
    goto menu
)
if "%choice%"=="3" (
    call "%~dp0test_mpc_classic.bat"
    goto menu
)
if "%choice%"=="4" (
    call "%~dp0test_modern_wmp.bat"
    goto menu
)
if "%choice%"=="5" (
    call "%~dp0test_potplayer.bat"
    goto menu
)
if "%choice%"=="6" (
    call "%~dp0test_mpv.bat"
    goto menu
)
if "%choice%"=="7" (
    call "%~dp0test_kmplayer.bat"
    goto menu
)
if "%choice%"=="8" (
    call "%~dp0test_gomplayer.bat"
    goto menu
)
if "%choice%"=="9" (
    call "%~dp0test_smplayer.bat"
    goto menu
)
if "%choice%"=="10" (
    call "%~dp0test_kodi.bat"
    goto menu
)
if "%choice%"=="11" (
    call "%~dp0test_bsplayer.bat"
    goto menu
)
if "%choice%"=="12" (
    call "%~dp0test_fivekplayer.bat"
    goto menu
)
if "%choice%"=="13" (
    cls
    echo ===============================================================================
    echo   Executing Full Unit ^& E2E Offline Player Test Suite...
    echo ===============================================================================
    python -m unittest discover -s "%~dp0..\..\tests"
    echo.
    pause
    goto menu
)
if "%choice%"=="0" (
    exit /b 0
)

echo.
echo   [!] Invalid selection. Please choose 0 to 13.
timeout /t 2 >nul
goto menu
