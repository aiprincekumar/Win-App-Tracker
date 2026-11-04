@echo off
cd /d "%~dp0"

:: 1. Launch pythonw from local workspace or user venv
if exist "%~dp0.venv\Scripts\pythonw.exe" (
    start "" "%~dp0.venv\Scripts\pythonw.exe" "%~dp0src\video_detector_hud.py" %*
    exit /b
)
if exist "%~dp0..\.venv\Scripts\pythonw.exe" (
    start "" "%~dp0..\.venv\Scripts\pythonw.exe" "%~dp0src\video_detector_hud.py" %*
    exit /b
)
if defined USERPROFILE (
    if exist "%USERPROFILE%\.venv\Scripts\pythonw.exe" (
        start "" "%USERPROFILE%\.venv\Scripts\pythonw.exe" "%~dp0src\video_detector_hud.py" %*
        exit /b
    )
    if exist "%USERPROFILE%\.local\bin\python.exe" (
        start "" "%USERPROFILE%\.local\bin\python.exe" "%~dp0src\video_detector_hud.py" %*
        exit /b
    )
)

:: 2. Launch pythonw from PATH
start "" pythonw "%~dp0src\video_detector_hud.py" %* 2>nul && exit /b

:: 3. Launch python fallback
start "" python "%~dp0src\video_detector_hud.py" %* 2>nul && exit /b
exit /b
