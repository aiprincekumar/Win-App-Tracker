@echo off
@cls
@chcp 65001 >nul
title Windows Native Game Idle Sentinel (Xbox Game Bar Engine)

python "%~dp0game_idle_detector.py" %*
if %ERRORLEVEL% neq 0 pause
