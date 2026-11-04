# register_videohud_protocol.ps1
# Registers videohud:// custom URL protocol in HKCU (user registry - no admin rights required)
# Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) {
    $scriptDir = $PSScriptRoot
}
if (-not $scriptDir) {
    $scriptDir = (Get-Location).Path
}

$vbsPath = Join-Path $scriptDir "run_hud.vbs"

$protocolKey = "HKCU:\Software\Classes\videohud"
$cmdKey = "$protocolKey\shell\open\command"

New-Item -Path $protocolKey -Force | Out-Null
Set-ItemProperty -Path $protocolKey -Name "(Default)" -Value "URL:Video Detector HUD Protocol"
Set-ItemProperty -Path $protocolKey -Name "URL Protocol" -Value ""

New-Item -Path $cmdKey -Force | Out-Null
$cmdValue = "wscript.exe `"$vbsPath`""
Set-ItemProperty -Path $cmdKey -Name "(Default)" -Value $cmdValue

Write-Host "SUCCESS: videohud:// protocol registered successfully in HKCU."
Write-Host "Target: $cmdValue"
