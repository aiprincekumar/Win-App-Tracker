@echo off
setlocal enabledelayedexpansion
title Browser Data Hub - Stop Service

echo [*] Stopping active Browser Data Hub instances on port 65433...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$conns = Get-NetTCPConnection -LocalPort 65433 -State Listen -ErrorAction SilentlyContinue; " ^
  "if ($conns) { foreach ($c in $conns) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('[+] Stopped Browser Data Hub process PID ' + $c.OwningProcess); } } else { Write-Host '[INFO] No active Browser Data Hub service found on port 65433.'; }"
