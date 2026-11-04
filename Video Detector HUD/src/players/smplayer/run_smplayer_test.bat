@echo off
setlocal
python "%~dp0smplayer_detector.py" %*
if errorlevel 1 pause
endlocal
