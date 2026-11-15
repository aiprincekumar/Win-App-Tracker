# Phase 3 Specification: Full Regression Verification, AppSec Audit, Memory Sync & Git Push

> **Phase:** 3 of 3  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Assigned Role:** Level 4 Independent QA Agent  
> **Required Dynamic Skills:** `terminal-ops`, `security-review`, `memory-sync-sentinel`  
> **Target Files:**
> - All 31 test suites in [`tests/`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests)
> - [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - Git Repository and Remote Tracking Branch

---

## 🎯 1. Phase Objective

Execute exhaustive regression testing across all 31 test suites in the `tests/` directory, certifying that zero functional, syntax, or integration regressions were introduced. Execute an automated SAST and secret audit via `gitleaks detect --redact`. Synchronize Section 0 and Section 1 of [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) with Grade A+ certification and the Universal 7-Column Diagnostic Matrix. Conclude with autonomous local micro-commits and GitHub push intelligence per Universal Rule 15 with full 3-point terminal proof.

---

## 📋 2. Prerequisites & Inputs

1. Successful completion and verification of Phase 1 and Phase 2.
2. `gitleaks` CLI binary available in system PATH.
3. Clean Git working tree with changes staged for commit.

---

## 🔍 3. Technical Context & File Anchors

### 3.1 Test Suite Inventory (31 Test Files in `tests/`)
1. `test_media_controls_and_fullscreen_fix.js`
2. `test_dashboard_csv_export_rfc4180.js`
3. `test_dashboard_full_audio_lab_parity.js`
4. `test_dashboard_i18n_bilingual_parity.js`
5. `test_dashboard_multi_browser_filter.js`
6. `test_dashboard_sleep_settings_sync.js`
7. `test_dashboard_theme_and_a11y_verification.js`
8. `test_dashboard_window_focus_and_hub_retry.js`
9. `test_event_deduplication.js`
10. `test_extension_delta_sync.js`
11. `test_four_pillar_hub_ui.js`
12. `test_fullscreen_controller.js`
13. `test_header_status_badges.js`
14. `test_jump_to_media_tab_and_bottom_toast.js`
15. `test_light_mode_contrast_and_wcag.js`
16. `test_media_tab_switch_and_i18n.js`
17. `test_popup_formattime_resolution.js`
18. `test_popup_phase1_quick_settings.js`
19. `test_popup_phase2_smart_automations.js`
20. `test_popup_phase3_digital_wellness_alarms.js`
21. `test_popup_phase4_studio_vault.js`
22. `test_popup_phase5_audio_lab_and_dsp.js`
23. `test_popup_sqlite_data_hub_sync.js`
24. `test_six_tab_popup_architecture.js`
25. `test_sleep_timer_and_ui_controls.js`
26. `test_syntax_and_manifest_integrity.js`
27. `test_tab_switch_and_storage_persistence.js`
28. `test_theme_toggle.js`
29. `test_timer_and_dual_media_tracking.js`
30. `test_tracking_modes_and_audible_bg_media.js`
31. `test_volume_timeline_fullscreen_controls.js`

### 3.2 Global Memory Anchor
- [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) (Section 0: Live Agent State Machine & Section 1: Multi-Project Stage Matrix)

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Run Full Regression Suite
Execute all 31 test files sequentially in PowerShell:
```powershell
$tests = Get-ChildItem -Path tests\*.js; $allPassed = $true; foreach ($t in $tests) { Write-Host "Running $($t.Name)..." -ForegroundColor Cyan; node $t.FullName; if ($LASTEXITCODE -ne 0) { $allPassed = $false; Write-Host "FAILED: $($t.Name)" -ForegroundColor Red; break; } }; if ($allPassed) { Write-Host "ALL 31/31 TEST SUITES PASSED CLEANLY!" -ForegroundColor Green } else { exit 1 }
```
Assert that every single test file exits with code 0.

### Step 2: AppSec & Secret Audit
Run `gitleaks`:
```powershell
gitleaks detect --redact -v
```
Ensure 0 leaks are detected. If any pattern flags a false positive, investigate and redact.

### Step 3: Synchronize Global Memory (`memory.md`)
Update [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md):
- Set Section 0.1 Active Task ID: `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`.
- Set Gate State: `COMPLETED (Grade A+ QA Signoff Certified)`.
- Record milestone details in Section 0 and Section 1 table for `Browser Detection`:
  - Restoration of direct 0ms MAIN world scripting across popup button handlers.
  - Unblocked content script `primaryMediaElement` execution.
  - Test suite overhaul in `test_media_controls_and_fullscreen_fix.js`.
  - 31/31 test suites certified green with exit code 0.
  - 0 gitleaks detected.

### Step 4: Autonomous Git Commit & Push (Universal Rule 15)
1. **Local Micro-Commit:**
   Stage modified files:
   ```powershell
   git add popup/popup.js content_media.js tests/test_media_controls_and_fullscreen_fix.js temp_prompt/direct_scripting_parity/
   git commit -m "feat(media): restore direct 0ms MAIN world scripting and popup-dashboard media actuation parity"
   ```
   Notify user: "Haan, local me commit ho chuka hai [commit hash/message]".
2. **Online Upstream Pre-Check & Push:**
   Verify upstream online presence:
   ```powershell
   git ls-remote --exit-code origin
   ```
   Because change magnitude is significant (>= 3 files: `popup/popup.js`, `content_media.js`, `test_media_controls_and_fullscreen_fix.js`, plus prompt specs), autonomously push to GitHub:
   ```powershell
   git push origin main
   ```
3. **Capture 3-Point Terminal Proof:**
   - `git log -1` (commit hash and message)
   - `git push` (remote confirmation)
   - `git status` (clean working tree confirmation)

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

1. Never bypass failed tests: if even 1 test of the 31 suites fails, stop immediately, diagnose root cause, and rectify.
2. Never skip `gitleaks detect --redact`.
3. Never skip the 3-point terminal proof for git operations.

---

## 📦 6. Deliverables Manifest

1. Full regression report confirming 31/31 test suites passed.
2. Gitleaks clean audit log (0 findings).
3. Updated [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md).
4. Git commit and push proof on `origin/main`.

---

## 🚦 7. Local Verification Gate

- 31/31 tests pass with exit code 0.
- `gitleaks detect --redact` exits with code 0.
- `git status` shows clean working tree.
