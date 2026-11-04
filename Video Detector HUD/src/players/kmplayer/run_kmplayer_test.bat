@echo off
setlocal
python "%~dp0kmplayer_detector.py" %*
if errorlevel 1 pause
endlocal
