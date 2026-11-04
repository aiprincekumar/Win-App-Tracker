@echo off
setlocal
python "%~dp0mpc_classic_detector.py" %*
if errorlevel 1 pause
endlocal
