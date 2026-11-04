# register_native_messaging_host.ps1
# Registers com.antigravity.videohud Native Messaging Host in HKCU for Google Chrome & Microsoft Edge
# Zero-Prompt Standard: Allows browser extensions to launch HUD directly without browser dialogs
# Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) {
    $scriptDir = $PSScriptRoot
}
if (-not $scriptDir) {
    $scriptDir = (Get-Location).Path
}

$rootDir = Split-Path -Parent $scriptDir
if (-not $rootDir -or -not (Test-Path $rootDir)) {
    $rootDir = $scriptDir
}

$jsonPath = Join-Path $rootDir "config\com.antigravity.videohud.json"
if (-not (Test-Path $jsonPath)) {
    $jsonPath = Join-Path $scriptDir "com.antigravity.videohud.json"
}

if (-not (Test-Path $jsonPath)) {
    Write-Error "Host manifest not found at: $jsonPath"
    exit 1
}

# Dynamically bind host launcher path in manifest for current machine
$batPath = Join-Path $scriptDir "launch_hud_native.bat"
if (Test-Path $batPath) {
    try {
        $manifestContent = Get-Content -Raw $jsonPath | ConvertFrom-Json
        $manifestContent.path = $batPath
        $manifestContent | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8
    } catch {
        Write-Warning "Could not update path in $jsonPath: $_"
    }
}

# 1. Register for Google Chrome
$chromeKey = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.antigravity.videohud"
New-Item -Path $chromeKey -Force | Out-Null
Set-ItemProperty -Path $chromeKey -Name "(Default)" -Value $jsonPath

# 2. Register for Microsoft Edge
$edgeKey = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\com.antigravity.videohud"
New-Item -Path $edgeKey -Force | Out-Null
Set-ItemProperty -Path $edgeKey -Name "(Default)" -Value $jsonPath

Write-Host "SUCCESS: com.antigravity.videohud registered for Chrome & Edge."
Write-Host "Target Manifest: $jsonPath"
