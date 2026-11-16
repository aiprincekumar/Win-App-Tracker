# Phase 06: Independent QA Verification & Test Suite Harmonization

> **Task ID:** TASK-MODULAR-SPLIT-006-P06  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 Independent QA Verification Tester (`qa_verification_tester`)  
> **Target Files:** Entire extension codebase, all test suites under [`tests/`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests)  
> **Prerequisites:** Phases 01 through 05 completed and locally verified  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Execute an exhaustive, independent quality assurance audit across the entire extension codebase following the modular facade refactoring. Certify that all 39 test suites in `tests/` pass with 100% exit code 0, all JavaScript files pass `node -c` syntax compilation and `new vm.Script()` AST parsing, zero `innerHTML` Trusted Types violations exist, zero secrets are detected by `gitleaks detect --redact`, and all files adhere to the UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding standard. Deliver a formal Grade A+ signoff.

---

## 🧪 2. Complete 39-Test Suite Execution Gate

The Level 4 QA Verification Tester must execute every test suite and verify raw terminal proof of exit code 0:
1. `node tests/test_context_invalidation_guards.js`
2. `node tests/test_dashboard_csv_export_rfc4180.js`
3. `node tests/test_dashboard_full_audio_lab_parity.js`
4. `node tests/test_dashboard_future_uiux_actual_verification.js`
5. `node tests/test_dashboard_i18n_bilingual_parity.js`
6. `node tests/test_dashboard_multi_browser_filter.js`
7. `node tests/test_dashboard_sleep_settings_sync.js`
8. `node tests/test_dashboard_theme_and_a11y_verification.js`
9. `node tests/test_dashboard_uiux_phase1.js`
10. `node tests/test_dashboard_uiux_phase2.js`
11. `node tests/test_dashboard_uiux_phase3.js`
12. `node tests/test_dashboard_uiux_phase4.js`
13. `node tests/test_dashboard_window_focus_and_hub_retry.js`
14. `node tests/test_event_deduplication.js`
15. `node tests/test_extension_delta_sync.js`
16. `node tests/test_four_pillar_hub_ui.js`
17. `node tests/test_fullscreen_blackout_fix.js`
18. `node tests/test_fullscreen_controller.js`
19. `node tests/test_header_status_badges.js`
20. `node tests/test_jump_to_media_tab_and_bottom_toast.js`
21. `node tests/test_light_mode_contrast_and_wcag.js`
22. `node tests/test_media_controls_and_fullscreen_fix.js`
23. `node tests/test_media_tab_switch_and_i18n.js`
24. `node tests/test_popup_formattime_resolution.js`
25. `node tests/test_popup_phase1_quick_settings.js`
26. `node tests/test_popup_phase2_smart_automations.js`
27. `node tests/test_popup_phase3_digital_wellness_alarms.js`
28. `node tests/test_popup_phase4_studio_vault.js`
29. `node tests/test_popup_phase5_audio_lab_and_dsp.js`
30. `node tests/test_popup_sqlite_data_hub_sync.js`
31. `node tests/test_six_tab_popup_architecture.js`
32. `node tests/test_sleep_timer_and_ui_controls.js`
33. `node tests/test_syntax_and_manifest_integrity.js`
34. `node tests/test_tab_switch_and_storage_persistence.js`
35. `node tests/test_theme_toggle.js`
36. `node tests/test_timer_and_dual_media_tracking.js`
37. `node tests/test_tracking_modes_and_audible_bg_media.js`
38. `node tests/test_unified_timeline_scrubber.js`
39. `node tests/test_volume_timeline_fullscreen_controls.js`

---

## 🛡️ 3. Security, AST & Encoding Compliance Audit

1. **AST & Syntax Compilation:**
   Execute `node -c` on all root and modular scripts to verify zero parse errors:
   - `node -c background.js`
   - `node -c content_media.js`
   - `node -c inject_main_world.js`
   - `node -c fullscreen_controller.js`
   - `node -c dashboard/dashboard.js`
   - `node -c popup/popup.js`
2. **Secret Scan:**
   Run `gitleaks detect --redact` across git history and working tree (0 findings required).
3. **W3C Trusted Types Audit:**
   Verify 0 assignments to `innerHTML` across newly modified or created source files.
4. **UTF-8 with BOM Verification:**
   Verify first 3 bytes of every modified file match `0xEF, 0xBB, 0xBF`.

---

## 🏆 4. Phase Completion & Grade A+ Certification Criteria

The Level 4 QA Subagent may issue Grade A+ signoff ONLY when:
- [ ] 39/39 test suites pass with exit code 0.
- [ ] Line counts of root entrypoints confirm facade slimming:
  - `background.js` < 350 lines
  - `content_media.js` < 250 lines
  - `inject_main_world.js` < 200 lines
  - `fullscreen_controller.js` < 150 lines
  - `dashboard/dashboard.js` < 400 lines
  - `popup/popup.js` < 350 lines
- [ ] Gitleaks reports 0 secret exposures.
- [ ] All files verified UTF-8 with BOM.
- [ ] Formal QA report submitted to Level 2 Manager.
