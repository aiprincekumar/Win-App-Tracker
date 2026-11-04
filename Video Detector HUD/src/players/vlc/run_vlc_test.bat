@echo off
setlocal
python "%~dp0vlc_detector.py" %*
if errorlevel 1 pause
endlocal
