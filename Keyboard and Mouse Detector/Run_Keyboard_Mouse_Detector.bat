@echo off
@cls
@chcp 65001 >nul
title Windows Native Keyboard & Mouse Idle Sentinel (1-Minute Inactivity Tracker)

python "%~dp0keyboard_mouse_detector.py" %*
if %ERRORLEVEL% neq 0 pause
