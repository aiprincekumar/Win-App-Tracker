# Phase 3: Full Regression Verification, Gitleaks Audit, Memory Synchronization & Autonomous Push
## Standalone Executable Subagent Task Specification

> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-PHASE3`  
> **Target Role:** Level 4 Independent QA Agent (`QA Verification Tester` / `SRE Security Auditor`)  
> **Assigned AI Model:** `flash` (Fast, meticulous regression & secret scanning)  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Prerequisites:** Successful completion and Grade A+ signoff of Phase 1 and Phase 2  
> **Universal Standards:** Universal Rule 15 (Autonomous Git Push Intelligence), Universal Rule 20 (Diagnostic Matrix), Universal Rule 23 (Memory Sync)  

---

## 🎯 1. Phase Objective

Perform comprehensive independent quality assurance, full workspace regression testing across all 34 core test suites, automated secret leak audit via `gitleaks`, update `memory.md` to reflect completed milestone, and execute autonomous Git operations with 3-point terminal proof.

---

## 🛠️ 2. Step-by-Step Verification & Handoff Instructions

### Step 1: Full Workspace Regression Testing
Execute all 34 core workspace test suites to guarantee 0 regressions across all features:
```powershell
$suites = @(
  "test_context_invalidation_guards.js",
  "test_dashboard_csv_export_rfc4180.js",
  "test_dashboard_full_audio_lab_parity.js",
  "test_dashboard_i18n_bilingual_parity.js",
  "test_dashboard_multi_browser_filter.js",
  "test_dashboard_sleep_settings_sync.js",
  "test_dashboard_theme_and_a11y_verification.js",
  "test_dashboard_uiux_phase1.js",
  "test_dashboard_uiux_phase2.js",
  "test_dashboard_uiux_phase3.js",
  "test_dashboard_window_focus_and_hub_retry.js",
  "test_event_deduplication.js",
  "test_extension_delta_sync.js",
  "test_four_pillar_hub_ui.js",
  "test_fullscreen_controller.js",
  "test_header_status_badges.js",
  "test_jump_to_media_tab_and_bottom_toast.js",
  "test_light_mode_contrast_and_wcag.js",
  "test_media_controls_and_fullscreen_fix.js",
  "test_media_tab_switch_and_i18n.js",
  "test_popup_formattime_resolution.js",
  "test_popup_phase1_quick_settings.js",
  "test_popup_phase2_smart_automations.js",
  "test_popup_phase3_digital_wellness_alarms.js",
  "test_popup_phase4_studio_vault.js",
  "test_popup_phase5_audio_lab_and_dsp.js",
  "test_popup_sqlite_data_hub_sync.js",
  "test_six_tab_popup_architecture.js",
  "test_sleep_timer_and_ui_controls.js",
  "test_syntax_and_manifest_integrity.js",
  "test_tab_switch_and_storage_persistence.js",
  "test_theme_toggle.js",
  "test_timer_and_dual_media_tracking.js",
  "test_tracking_modes_and_audible_bg_media.js",
  "test_volume_timeline_fullscreen_controls.js"
)

$passed = 0
$failed = 0
foreach ($s in $suites) {
  node "tests/$s" > $null 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS: $s"
    $passed++
  } else {
    Write-Host "❌ FAIL: $s"
    $failed++
  }
}
Write-Host "Total Passed: $passed / $($suites.Count)"
if ($failed -gt 0) { exit 1 }
```
**Gate Requirement:** All 34/34 core test suites must pass cleanly with exit code 0.

### Step 2: Automated Secret Leak Audit
Run `gitleaks` across working tree and commit history:
```bash
gitleaks detect --redact -v
```
**Gate Requirement:** 0 leaks detected.

### Step 3: Global Working Memory Synchronization (`memory.md`)
Update [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md):
1. Update Section `0.1 Current Active Execution Gate State`:
   - Set Milestone: "Explicit Idempotent State & Strict Mutual Exclusion Media Controls Architecture Certified (Grade A+)".
   - Record active authorization token `AUTH-MGR-*`.
   - Update `memory.md` multi-project stage row for `Web Activity & Media Sentinel` (`Browser Detection`).

### Step 4: Autonomous Local Commit & Remote Push Intelligence (Universal Rule 15)
1. Execute autonomous local micro-commit:
   ```bash
   git add popup/popup.js dashboard/dashboard.js background.js content_media.js inject_main_world.js tests/test_media_controls_and_fullscreen_fix.js temp_prompt/
   git commit -m "feat(media): implement explicit idempotent state & strict mutual exclusion media controls"
   ```
2. Verify online upstream existence:
   ```bash
   git ls-remote --exit-code origin
   ```
3. Autonomous Push Decision:
   - Modifications span 6 core codebase files (`>= 3 files` -> Significant / Major change).
   - Autonomously push to GitHub:
     ```bash
     git push origin main
     ```
4. Produce 3-point terminal proof:
   - Proof 1: `git log -1` (commit hash and message)
   - Proof 2: `git push` output (remote confirmation)
   - Proof 3: `git status` (clean working tree confirmation)

---

## 🔬 3. Local Verification Gate

- 34/34 core test suites: PASS (Exit code 0).
- Gitleaks audit: 0 leaks.
- `memory.md`: Fully synchronized.
- Git 3-point terminal proof certified.

---

## 📦 4. Deliverables Manifest
- Regression test suite terminal log (34/34 passed).
- Gitleaks clean audit report.
- Synchronized `C:\Users\Atul Verma\.gemini\memory.md`.
- 3-point terminal proof of local commit and remote push.
