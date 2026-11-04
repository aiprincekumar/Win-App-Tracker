@echo off
setlocal
python "%~dp0bsplayer_detector.py" %*
if errorlevel 1 pause
endlocal
