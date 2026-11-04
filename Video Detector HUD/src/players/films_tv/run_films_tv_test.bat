@echo off
setlocal
python "%~dp0films_tv_detector.py" %*
if errorlevel 1 pause
endlocal
