# ==============================================================================
# Antigravity: Audio Playback Detector Sentinel (PowerShell Runner)
# Developer: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
# Workspace: Win App Tracker / Audio Detector
# ==============================================================================

param(
    [double]$Interval = 0.1,
    [double]$Threshold = 60.0,
    [switch]$Once,
    [switch]$Json,
    [switch]$Tests
)

# Enforce UTF-8 console output for full Unicode fidelity
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnginePath = Join-Path $ScriptDir "audio_detector.py"
$TestPath = Join-Path $ScriptDir "test_audio_detector.py"

# ==============================================================================
# Robust Python Interpreter Discovery (5-Stage Search)
# ==============================================================================
$PythonExe = $null

# 1. Check system PATH python first
$PathPython = Get-Command python -ErrorAction SilentlyContinue
if ($PathPython) {
    $PythonExe = $PathPython.Source
}

# 2. Check .local bin python
if (-not $PythonExe -and (Test-Path "$env:USERPROFILE\.local\bin\python.exe")) {
    $PythonExe = "$env:USERPROFILE\.local\bin\python.exe"
}

# 3. Check py launcher
if (-not $PythonExe) {
    $PyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($PyLauncher) {
        $PythonExe = $PyLauncher.Source
    }
}

# 4. Check AppData Programs Python
if (-not $PythonExe) {
    $AppDataPythons = Get-ChildItem -Path "$env:LOCALAPPDATA\Programs\Python" -Filter "python.exe" -Recurse -Depth 2 -ErrorAction SilentlyContinue
    if ($AppDataPythons) {
        $PythonExe = $AppDataPythons[0].FullName
    }
}

# 5. Check Program Files Python
if (-not $PythonExe) {
    $ProgramFilesPythons = Get-ChildItem -Path "$env:ProgramFiles\Python*" -Filter "python.exe" -Recurse -Depth 2 -ErrorAction SilentlyContinue
    if ($ProgramFilesPythons) {
        $PythonExe = $ProgramFilesPythons[0].FullName
    }
}

if (-not $PythonExe) {
    Write-Host "[ERROR] Python was not found on this machine!" -ForegroundColor Red
    Write-Host "Please install Python 3.10+ or add it to system PATH." -ForegroundColor Yellow
    exit 1
}

# 1. Run Automated Unit Tests (if test suite is present)
if ($Tests) {
    if (Test-Path "$TestPath") {
        & $PythonExe "$TestPath"
        exit $LASTEXITCODE
    } else {
        Write-Host "Audio Detector test suite has been purged for production." -ForegroundColor Yellow
        exit 0
    }
}

# 2. Single Check / JSON Mode
if ($Once -or $Json) {
    $ArgsList = @("--threshold", "$Threshold")
    if ($Once) { $ArgsList += "--once" }
    if ($Json) { $ArgsList += "--json" }
    & $PythonExe "$EnginePath" @ArgsList
    exit $LASTEXITCODE
}

# 3. Direct Live Sentinel Launch (Zero Flash, Zero Banners)
& $PythonExe "$EnginePath" --interval $Interval --threshold $Threshold
exit $LASTEXITCODE
