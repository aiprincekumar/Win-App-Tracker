# register_native_messaging_host.ps1
# Registers com.antigravity.videohud Native Messaging Host in HKCU for Google Chrome, Microsoft Edge, Brave, and Opera
# Zero-Prompt Standard: Allows browser extensions to launch HUD & Data Hub directly without browser dialogs
# Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = $PSScriptRoot }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$rootDir = Split-Path -Parent $scriptDir
if (-not $rootDir -or -not (Test-Path $rootDir)) { $rootDir = $scriptDir }

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
        
        # Ensure allowed_origins contains user extension IDs
        $currentOrigins = @($manifestContent.allowed_origins)
        $requiredOrigins = @(
            "chrome-extension://opiinjipkdkeolidiofmhncoegmaijmm/",
            "chrome-extension://dgenbagabmmjpfjlbcnnlmpopipdapjo/",
            "chrome-extension://okhjkpgblgdjappgfgakbcecdblgffcl/",
            "chrome-extension://plbckkomfjfiennfeiiemhjpmhfdffac/",
            "chrome-extension://ihfjdgiggeobgfalcificfpplpbgbffd/",
            "chrome-extension://bbokfekppobgfopnjfogbgamkggghpba/"
        )
        foreach ($orig in $requiredOrigins) {
            if ($currentOrigins -notcontains $orig) {
                $currentOrigins += $orig
            }
        }
        $manifestContent.allowed_origins = $currentOrigins
        $manifestContent | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8
    } catch {
        Write-Warning "Could not update path in ${jsonPath}: $_"
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

# 3. Register for Brave Browser
$braveKey = "HKCU:\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.antigravity.videohud"
New-Item -Path $braveKey -Force | Out-Null
Set-ItemProperty -Path $braveKey -Name "(Default)" -Value $jsonPath

# 4. Register for Opera Stable
$operaKey = "HKCU:\Software\Opera Software\Opera Stable\NativeMessagingHosts\com.antigravity.videohud"
New-Item -Path $operaKey -Force | Out-Null
Set-ItemProperty -Path $operaKey -Name "(Default)" -Value $jsonPath

Write-Host "SUCCESS: com.antigravity.videohud registered for Chrome, Edge, Brave & Opera."
Write-Host "Target Manifest: $jsonPath"
Write-Host "Target Launcher: $batPath"
