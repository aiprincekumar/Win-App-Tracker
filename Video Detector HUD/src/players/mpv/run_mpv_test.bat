@echo off
setlocal
python "%~dp0mpv_detector.py" %*
if errorlevel 1 pause
endlocal
