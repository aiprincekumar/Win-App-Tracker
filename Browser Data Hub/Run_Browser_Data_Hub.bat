@echo off
cd /d "%~dp0"

:: 1. Launch pythonw from local workspace or user venv
if exist "%~dp0.venv\Scripts\pythonw.exe" (
    start "" "%~dp0.venv\Scripts\pythonw.exe" "%~dp0browser_data_hub.py" %*
    exit /b
)
if exist "%~dp0..\.venv\Scripts\pythonw.exe" (
    start "" "%~dp0..\.venv\Scripts\pythonw.exe" "%~dp0browser_data_hub.py" %*
    exit /b
)
if defined USERPROFILE (
    if exist "%USERPROFILE%\.venv\Scripts\pythonw.exe" (
        start "" "%USERPROFILE%\.venv\Scripts\pythonw.exe" "%~dp0browser_data_hub.py" %*
        exit /b
    )
    if exist "%USERPROFILE%\.local\bin\python.exe" (
        start "" "%USERPROFILE%\.local\bin\python.exe" "%~dp0browser_data_hub.py" %*
        exit /b
    )
)

:: 2. Launch pythonw from PATH
start "" pythonw "%~dp0browser_data_hub.py" %* 2>nul && exit /b

:: 3. Launch python fallback
start "" python "%~dp0browser_data_hub.py" %* 2>nul && exit /b
exit /b