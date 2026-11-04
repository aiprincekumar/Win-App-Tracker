@echo off
@cls
@chcp 65001 >nul
title Windows Native AntiGravity Agent Inactivity Sentinel (Brain & Agent Monitor)

python "%~dp0antigravity_detector.py" %*
if %ERRORLEVEL% neq 0 pause
