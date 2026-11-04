@echo off
@cls
@chcp 65001 >nul
title Windows Video Inactivity Sentinel (Video Detector)

python "%~dp0video_detector.py" %*
if %ERRORLEVEL% neq 0 pause
