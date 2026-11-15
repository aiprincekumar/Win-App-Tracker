# Phase 3: Full Regression Verification, Remote Chrome Port 9222, Git & Sync
## Standalone Executable Implementation Specification

> **Phase:** 3 of 3  
> **Role:** Level 4 Independent QA Agent / SRE  
> **Target Files:**
> - All 30 Test Suites in [`tests/`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests)
> - [`c:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md)  
> **Governance:** Universal Rule 15, Rule 20, Rule 23 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective

The objective of Phase 3 is to execute complete independent QA verification across the entire project, audit secrets, update active memory ledgers, and perform autonomous local commits and remote push intelligence:
1. Run all 30 test suites in `tests/` and verify 100% green passage with exit code 0.
2. Probe remote Chrome debugging port 9222 via PowerShell to verify live browser connectivity if Chrome is active.
3. Perform secret scanning with `gitleaks detect --redact` (0 secrets tolerated).
4. Synchronize Section 0 and Diagnostic Matrix in `memory.md` and `project_feature_memory.md`.
5. Autonomously execute local micro-commit and GitHub push under Universal Rule 15.

---

## 📋 2. Prerequisites & Inputs

- Successful completion of Phase 1 and Phase 2.
- Clean working directory with no untracked extraneous artifacts outside `temp_prompt/`.

---

## 🔍 3. Technical Context & Commands

### 3.1 Full Test Suite Regression (All 30 Test Suites)
Execute the batch test runner:
```powershell
Get-ChildItem -Path tests -Filter *.js | ForEach-Object {
    Write-Host "Running: $($_.Name)" -ForegroundColor Cyan
    node $_.FullName
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Test Failed: $($_.Name)"
        exit 1
    }
}
```

### 3.2 Remote Chrome Debugging Port 9222 Verification
Verify if remote debugging port 9222 is active:
```powershell
try {
    $res = Invoke-RestMethod -Uri "http://localhost:9222/json/version" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Chrome Port 9222 Active: Browser $($res.Browser)" -ForegroundColor Green
} catch {
    Write-Host "Chrome Port 9222 is not currently listening (offline / mock environment)" -ForegroundColor Yellow
}
```

### 3.3 Secret Scanning Audit
Verify no API keys, tokens, or private credentials are leaked:
```powershell
gitleaks detect --source="." --redact -v
```
Must report 0 leaks.

### 3.4 Memory Ledger Synchronization
Update `C:\Users\Atul Verma\.gemini\memory.md`:
- Section 0: `Live Agent State & Stateful Handoff Ledger`
- Record the completion of `TASK-PARITY-OVERHAUL-POPUP-DASHBOARD-RESILIENCE-001`.
- Update Diagnostic Matrix in `project_feature_memory.md`.

### 3.5 Autonomous Local Micro-Commit & GitHub Push Intelligence (Universal Rule 15)
1. **Autonomous Local Commit:**
   ```powershell
   git add inject_main_world.js content_media.js popup/popup.js tests/test_media_controls_and_fullscreen_fix.js project_feature_memory.md temp_prompt/
   git commit -m "fix(media): parity overhaul popup and dashboard resilience and fix latent bridge bugs"
   ```
2. **Online Upstream Pre-Check:**
   ```powershell
   git ls-remote --exit-code origin
   ```
3. **Autonomous Push Decision:**
   Since this is a multi-file major overhaul (>= 3 files), autonomously push to GitHub online:
   ```powershell
   git push origin main
   ```
4. **3-Point Terminal Proof:**
   - `git log -1`
   - `git push` output
   - `git status` clean tree

---

## 🚫 4. Architectural Constraints & Boundaries

- Zero tolerated test failures. If any test fails, execution halts immediately for diagnostic triage.
- Zero secrets committed to git.

---

## 📦 5. Deliverables Manifest

1. Verified test runner output for all 30 tests.
2. Verified `gitleaks detect --redact` output.
3. Updated `project_feature_memory.md` and `memory.md`.
4. Git 3-point terminal proof (commit hash, push response, status clean).

---

## 🚦 6. Local Verification Gate

- All 30 tests pass with exit code 0.
- `gitleaks` reports 0 leaks.
- Working tree clean.
