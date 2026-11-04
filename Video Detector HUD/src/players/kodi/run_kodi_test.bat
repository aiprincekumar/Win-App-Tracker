@echo off
setlocal
python "%~dp0kodi_detector.py" %*
if errorlevel 1 pause
endlocal
