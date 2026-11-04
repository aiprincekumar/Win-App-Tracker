@echo off
setlocal
python "%~dp0gomplayer_detector.py" %*
if errorlevel 1 pause
endlocal
