@echo off
@cls
@chcp 65001 >nul
title Windows Audio Inactivity Sentinel (आइडल ऑडियो डिटेक्टर)

python "%~dp0audio_detector.py" %*
if %ERRORLEVEL% neq 0 pause
