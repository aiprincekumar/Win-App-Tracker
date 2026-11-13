# Phase 06: E2E Regression Verification & 11-Suite Integrity

> **Phase:** 06 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_06_e2e_verification.md`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Perform independent, end-to-end regression verification across all 11 existing automated test suites plus build and execute a comprehensive new test suite `tests/test_four_pillar_hub_ui.js` that programmatically certifies:
1. Complete DOM presence and ARIA accessibility of all 4 pillars (`Player`, `Audio Lab`, `Studio`, `Focus`).
2. Quick Settings gear button and popover modal integrity.
3. Player in-card micro-actions bar and smart automation switches.
4. Audio Lab 0-200% volume boost slider, 5-band EQ sliders, and enhancement toggles.
5. Studio timestamp note pinning, clips list, and screenshot gallery.
6. Focus Doomscroll breaker and ratio bar.
7. Strict preservation of single-row footer toolbar layout with all 7 invariant buttons intact.
8. Zero W3C Trusted Types CSP violations and zero Node.js syntax errors.

---

## 📋 2. Prerequisites & Inputs
- Phases 01 through 05 completed by Level 4 Frontend Engineer.
- Target files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- All 11 existing test suites in `tests/`.

---

## 🛠️ 3. Verification Test Suite Roster

### The 11 Existing Test Suites:
1. `tests/test_syntax_and_manifest_integrity.js`
2. `tests/test_volume_timeline_fullscreen_controls.js`
3. `tests/test_tab_switch_and_storage_persistence.js`
4. `tests/test_popup_sqlite_data_hub_sync.js`
5. `tests/test_tracking_modes_and_audible_bg_media.js`
6. `tests/test_jump_to_media_tab_and_bottom_toast.js`
7. `tests/test_sleep_timer_and_ui_controls.js`
8. `tests/test_timer_and_dual_media_tracking.js`
9. `tests/test_dashboard_multi_browser_filter.js`
10. `tests/test_extension_delta_sync.js`
11. `tests/test_event_deduplication.js`

### The New 4-Pillar Test Suite:
12. `tests/test_four_pillar_hub_ui.js`

---

## 🧪 4. Implementation of `tests/test_four_pillar_hub_ui.js`
The QA Tester must author `tests/test_four_pillar_hub_ui.js` with the following verification assertions:
- **Test 1: Static Architecture & 4-Pillar Tabs Inspection:**
  - Verify `#mainTabMedia`, `#mainTabAudio`, `#mainTabStudio`, `#mainTabTracking` exist in `popup.html`.
  - Verify `#viewMediaPane`, `#viewAudioPane`, `#viewStudioPane`, `#viewTrackingPane` exist with matching `role="tabpanel"`.
- **Test 2: Header Quick Settings & Invariant Footer:**
  - Verify `#btnQuickSettings` and `#quickSettingsPopover` exist.
  - Verify `<footer class="footer">` contains strictly the 7 expected buttons and zero unwanted children.
- **Test 3: Pillar 1 Player Micro-Actions & Smart Automations:**
  - Verify `#btnCardScreenshot`, `#btnCardCinemaDim`, `#btnCardLoopMedia`, `#btnCardNextTrack`, `#btnCardCopyTimestamp`.
  - Verify `#toggleAutoPauseNewTab`, `#toggleAutoAdSilence`, `#toggleDomainSpeedMemory`.
- **Test 4: Pillar 2 Audio Lab Controls:**
  - Verify `#masterBoostSlider` (min=0, max=200), `#masterBoostReadout`, `#toggleAudioOnlyMode`.
  - Verify `#audioEqPresetSelect` with all 5 presets.
  - Verify all 5 EQ sliders (`#eqBand60`, `#eqBand250`, `#eqBand1000`, `#eqBand4000`, `#eqBand16000`).
  - Verify `#toggleVocalClarity` and `#toggleNightShield`.
- **Test 5: Pillar 3 Studio Vault Controls:**
  - Verify `#studioNoteInput`, `#btnStudioPinNote`, `#studioBookmarksList`, `#studioScreenshotsGrid`, `#studioResumeCard`.
- **Test 6: Pillar 4 Focus & Digital Wellness:**
  - Verify `#cardFocusWellness`, `#focusRatioProductiveBar`, `#focusRatioEntertainmentBar`, `#toggleDoomscrollBreaker`.
- **Test 7: AST Compilation & Zero CSP innerHTML Violations:**
  - `vm.Script` compilation on `popup.js` with zero errors.
  - Assert zero raw `innerHTML` string interpolations.

---

## 📦 5. Deliverables Manifest
- Created: `tests/test_four_pillar_hub_ui.js`
- Executed: All 12 test suites.
- QA Certification Report with Grade A+ signoff.

---

## 🏁 6. Execution & Signoff Command
```powershell
Get-ChildItem -Path tests -Filter "*.js" | ForEach-Object { node $_.FullName }
```
12/12 test suites must pass cleanly with 100% success rate.
