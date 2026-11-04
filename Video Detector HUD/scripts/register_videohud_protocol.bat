@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register_videohud_protocol.ps1"
echo Protocol videohud:// registered.
