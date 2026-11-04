@echo off
setlocal
python "%~dp0modern_wmp_detector.py" %*
if errorlevel 1 pause
endlocal
