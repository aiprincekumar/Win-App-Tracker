@echo off
@cls
@chcp 65001 >nul
title Windows Video-Only Idle Sentinel (Pure Audio Ignored)

python "%~dp0video_idle_detector.py" %*
if %ERRORLEVEL% neq 0 pause
