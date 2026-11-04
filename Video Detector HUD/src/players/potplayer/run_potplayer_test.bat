@echo off
setlocal
python "%~dp0potplayer_detector.py" %*
if errorlevel 1 pause
endlocal
