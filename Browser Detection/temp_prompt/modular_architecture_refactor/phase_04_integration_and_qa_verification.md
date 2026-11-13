# Phase 04: Full Integration, Test Suite Alignment & QA Signoff

> **Phase Identifier:** `PHASE-04-INTEGRATION-QA`  
> **Target Subsystem:** Full System Integration & 16 Automated Test Suites (`tests/`, `src/`, root entry points)  
> **Lead Role:** Level 4 QA Verification Tester  
> **Assigned Model:** `flash` (per Dynamic Matrix Dept 08)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/phase_04_integration_and_qa_verification.md`

---

## 🎯 1. Phase Objective
Execute the comprehensive end-to-end integration and verification gate across all refactored subsystems (`src/background/`, `src/content/`, `src/inject/`, `src/popup/`, `src/dashboard/`, `src/shared/`). Ensure that all 16 automated test suites in `tests/` pass with 100% success (exit code 0, 0 failed), verify syntax and AST compilation across every file, validate zero-innerHTML Trusted Types compliance, perform a gitleaks secret audit, and certify Grade A+ production readiness.

---

## 📦 2. Prerequisites & Inputs
- **Prerequisite Phases:** Phase 01 (Background), Phase 02 (Content & Injection), and Phase 03 (Popup & Dashboard UI) completed.
- **Target Files:**
  - All files under `src/`
  - Root entry points (`background.js`, `content_media.js`, `fullscreen_controller.js`, `inject_main_world.js`, `popup/popup.js`, `dashboard/dashboard.js`)
  - All 16 test files in `tests/`
- **Baseline Requirement:** Zero syntax errors, zero unhandled promise rejections.

---

## ⚓ 3. Complete Roster of 16 Automated Test Suites

| Suite # | Test Suite File | Subsystem Under Test | Primary Verification Focus |
| :--- | :--- | :--- | :--- |
| 1 | `tests/test_dashboard_multi_browser_filter.js` | Dashboard / SQLite Hub | Multi-browser dropdown filtering (Chrome, Edge, Firefox, All) and SQLite aggregation |
| 2 | `tests/test_event_deduplication.js` | Content / Bridge | CustomEvent single-source dispatch, cooldown locks, and action deduplication |
| 3 | `tests/test_extension_delta_sync.js` | Background / WS Client | Exponential backoff retry ladder, offline sync queue, and delta activity streaming |
| 4 | `tests/test_four_pillar_hub_ui.js` | Popup UI Hub | 4-Pillar Hub (Player, Audio Lab with EQ, Studio Vault, Focus Tracker) navigation and IDs |
| 5 | `tests/test_fullscreen_controller.js` | Content / Fullscreen | Web Fullscreen CSS engine, 350ms debounce timestamp lock, in-page HUD button |
| 6 | `tests/test_header_status_badges.js` | Popup / Header | Live WebSocket port 65432 status badge and SQLite Data Hub badge states |
| 7 | `tests/test_jump_to_media_tab_and_bottom_toast.js`| Popup / Navigation | Jump to media tab action and bottom notification toast animations |
| 8 | `tests/test_media_tab_switch_and_i18n.js` | Popup / Tab Switch | Tab switching reactivity and bilingual / i18n label consistency |
| 9 | `tests/test_popup_sqlite_data_hub_sync.js` | Popup / Analytics | SQLite Data Hub query coordinator, stat pills, and processDomainStats calculation |
| 10 | `tests/test_six_tab_popup_architecture.js` | Popup / Architecture | Backward compatibility with 6-tab navigation models and storage persistence |
| 11 | `tests/test_sleep_timer_and_ui_controls.js` | Background / Sleep Timer | Sleep timer alarms, volume fade ladder calculations, and modal state persistence |
| 12 | `tests/test_syntax_and_manifest_integrity.js` | Manifest & Root Scripts | Node syntax (`node -c`), AST parse, MV3 schema, zero-innerHTML Trusted Types |
| 13 | `tests/test_tab_switch_and_storage_persistence.js` | Popup / Storage | Active tab selection persistence across popup close and reopen events |
| 14 | `tests/test_timer_and_dual_media_tracking.js` | Background / Media | Dual media tracking, audible background detection, and active tab time tracking |
| 15 | `tests/test_tracking_modes_and_audible_bg_media.js`| Content & Background | Foreground vs background media detection rules and audible tab priority |
| 16 | `tests/test_volume_timeline_fullscreen_controls.js` | Content & Main World | YouTube and HTML5 timeline seeking, volume slider, and playback speed ladders |

---

## 🔨 4. Surgical Step-by-Step Implementation Instructions

### Step 4.1: Syntax & AST Audit Across Entire Modular Tree
1. Execute `node -c` across every JavaScript file in `src/` and the root scripts:
   ```powershell
   Get-ChildItem -Path src, popup, dashboard -Filter *.js -Recurse | ForEach-Object { node -c $_.FullName }
   ```
2. Verify zero syntax warnings or unexpected token errors.

### Step 4.2: Zero-innerHTML W3C Trusted Types Compliance Audit
1. Audit all content, inject, popup, and dashboard modules for forbidden `innerHTML` assignments:
   ```powershell
   Select-String -Path src\*.js, popup\*.js, dashboard\*.js, *.js -Pattern '\.innerHTML\s*='
   ```
2. Confirm 0 matches (100% compliance with W3C Trusted Types on YouTube and MV3 CSP).

### Step 4.3: Automated Test Execution Runner
1. Run all 16 test suites sequentially using a PowerShell batch runner:
   ```powershell
   $passed = 0; $failed = 0;
   Get-ChildItem -Path tests -Filter *.js | ForEach-Object {
       Write-Host "Running $($_.Name)..."
       node $_.FullName | Out-Null
       if ($LASTEXITCODE -eq 0) { $passed++ } else { $failed++; Write-Host "FAILED: $($_.Name)" -ForegroundColor Red }
   }
   Write-Host "Verification Results: $passed Passed, $failed Failed"
   ```
2. Ensure `passed == 16` and `failed == 0`.

### Step 4.4: Credential & Secret Audit (Gitleaks)
1. Run `gitleaks detect --redact` to certify zero hardcoded secrets, API tokens, or credentials across the codebase.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Zero Test Waivers:** No test suite in `tests/` may be disabled, commented out, or bypassed.
- **Fail-Closed Gate:** If any test fails, the QA tester must flag the specific root cause in the 7-Column Diagnostic Matrix and reject signoff until resolved.

---

## 📋 6. Deliverables Manifest
- Complete 16-suite test execution report with raw terminal exit codes
- Comprehensive syntax audit log across all `src/` modules
- Gitleaks zero-leak audit certification
- Final Grade A+ Signoff certificate

---

## 🚦 7. Final Verification Gate
```powershell
# Full 16-Suite Test Execution
$passed = 0; $failed = 0; Get-ChildItem -Path tests -Filter *.js | ForEach-Object { node $_.FullName | Out-Null; if ($LASTEXITCODE -eq 0) { $passed++ } else { $failed++ } }; Write-Host "Final Gate: $passed/16 Passed"
# Must output: Final Gate: 16/16 Passed
```
