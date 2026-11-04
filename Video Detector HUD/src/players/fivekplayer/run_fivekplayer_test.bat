@echo off
setlocal
python "%~dp0fivekplayer_detector.py" %*
if errorlevel 1 pause
endlocal
