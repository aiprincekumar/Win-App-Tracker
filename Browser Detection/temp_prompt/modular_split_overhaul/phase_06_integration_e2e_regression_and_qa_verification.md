# Phase 06: Integration, E2E Regression & 39-Test QA Verification

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_06_integration_e2e_regression_and_qa_verification.md`](phase_06_integration_e2e_regression_and_qa_verification.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 08 (QA & Testing) & Dept 10 (AppSec & InfoSec)  
> **Target Agent Role:** Level 4 Independent QA Verification Tester  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Perform an exhaustive, end-to-end integration and quality assurance verification across the entire modularized codebase. Execute **all 39 test suites** in `tests/` with 100% green passage (exit code 0), audit AST compilation integrity via Node.js compiler and `vm.Script`, verify 0 secrets via `gitleaks detect --redact`, certify UTF-8 with BOM standard across all modified assets, and deliver an independent Grade A+ signoff.

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Phases 01 through 05 completed cleanly; all 10 candidate monoliths successfully decomposed into modular subsystems.
- **Target Files:**
  - Entire workspace codebase: `background.js`, `content_media.js`, `inject_main_world.js`, `fullscreen_controller.js`, `dashboard/`, `popup/`, and `src/`.
  - All 39 test suites in `tests/`.

---

## 🔍 3. Technical Context & File Anchors

The complete test battery consists of 39 standalone test suites covering:
1. `test_context_invalidation_guards.js`
2. `test_dashboard_csv_export_rfc4180.js`
3. `test_dashboard_full_audio_lab_parity.js`
4. `test_dashboard_future_uiux_actual_verification.js`
5. `test_dashboard_i18n_bilingual_parity.js`
6. `test_dashboard_multi_browser_filter.js`
7. `test_dashboard_sleep_settings_sync.js`
8. `test_dashboard_theme_and_a11y_verification.js`
9. `test_dashboard_uiux_phase1.js`
10. `test_dashboard_uiux_phase2.js`
11. `test_dashboard_uiux_phase3.js`
12. `test_dashboard_uiux_phase4.js`
13. `test_dashboard_window_focus_and_hub_retry.js`
14. `test_event_deduplication.js`
15. `test_extension_delta_sync.js`
16. `test_four_pillar_hub_ui.js`
17. `test_fullscreen_blackout_fix.js`
18. `test_fullscreen_controller.js`
19. `test_header_status_badges.js`
20. `test_jump_to_media_tab_and_bottom_toast.js`
21. `test_light_mode_contrast_and_wcag.js`
22. `test_media_controls_and_fullscreen_fix.js`
23. `test_media_tab_switch_and_i18n.js`
24. `test_popup_formattime_resolution.js`
25. `test_popup_phase1_quick_settings.js`
26. `test_popup_phase2_smart_automations.js`
27. `test_popup_phase3_digital_wellness_alarms.js`
28. `test_popup_phase4_studio_vault.js`
29. `test_popup_phase5_audio_lab_and_dsp.js`
30. `test_popup_sqlite_data_hub_sync.js`
31. `test_six_tab_popup_architecture.js`
32. `test_sleep_timer_and_ui_controls.js`
33. `test_syntax_and_manifest_integrity.js`
34. `test_tab_switch_and_storage_persistence.js`
35. `test_theme_toggle.js`
36. `test_timer_and_dual_media_tracking.js`
37. `test_tracking_modes_and_audible_bg_media.js`
38. `test_unified_timeline_scrubber.js`
39. `test_volume_timeline_fullscreen_controls.js`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: AST Parsing & Syntax Verification**
   - Run `node -c` compiler check on all root scripts and all files under `src/`.
   - Execute `node tests/test_syntax_and_manifest_integrity.js` to certify `vm.Script` compilation, manifest V3 integrity, and script linkages.

2. **Step 2: Execute Complete 39-Test Suite Battery**
   - Execute each of the 39 test suites in Node.js.
   - Collect raw terminal execution proof confirming 39/39 passing suites with 0 assertion failures and exit code 0.

3. **Step 3: Security & Secret Scan Audit**
   - Execute `gitleaks detect --redact` on the entire workspace.
   - Verify 0 secrets or sensitive tokens detected.

4. **Step 4: UTF-8 BOM Header Verification**
   - Inspect byte sequence of all modified `.js`, `.css`, and `.html` files.
   - Confirm presence of `0xEF, 0xBB, 0xBF` preamble.

5. **Step 5: Codebase Footprint & Hygiene Certification**
   - Measure lines of code across all 10 root files; certify significant reduction in monolith size.
   - Ensure clean working tree and prepare Grade A+ certification dossier.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero Failure Tolerance:** A single failing test in any of the 39 suites strictly blocks completion.
- **Zero Secrets Tolerance:** Any gitleaks finding trips state machine to `BLOCKED`.

---

## 📦 6. Deliverables Manifest

- Complete 39-test suite execution log (100% green pass proof)
- AST parsing verification report
- Gitleaks scan report (0 findings)
- UTF-8 BOM verification report
- Final QA Grade A+ certification dossier

---

## 🧪 7. Local Verification Gate

Execute the master verification runner:
```powershell
node -e "const fs = require('fs'); const files = fs.readdirSync('tests').filter(f => f.endsWith('.js')); let passed = 0, failed = 0; for (const f of files) { try { require('./tests/' + f); passed++; } catch (e) { console.error('FAIL in ' + f + ':', e.message); failed++; } } console.log('\nFINAL AUDIT: ' + passed + '/' + files.length + ' test suites passed cleanly!'); if (failed > 0) process.exit(1);"
gitleaks detect --redact
```
All 39 suites must pass cleanly and gitleaks must report 0 leaks.
