# Phase 04: Independent QA Test Suite & Master Regression Specification

> **Document Type:** Standalone Phase Execution Instruction  
> **Phase #:** 04 of 04  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Target Subsystem:** Quality Assurance, Security & Regression Suite  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Target Files:** `tests/test_advanced_features_focus_sleep.js`, `run_all_tests.js`  
> **Lead Departments:** Dept 08 (QA & Testing), Dept 10 (AppSec & InfoSec)  

---

## 🎯 1. Phase Objective

Author and execute a comprehensive 8-battery automated test suite (`tests/test_advanced_features_focus_sleep.js`) validating the DOM architecture, Default OFF guarantees, basic container preservation, CSS design tokens, bilingual i18n parity, Web Audio synthesis safety, and overall system integrity. Verify that all 84+ test suites pass 100% clean with exit code 0 under `node run_all_tests.js`.

---

## 📋 2. Prerequisites & Technical Context

- **Prerequisites:** Phases 1, 2, and 3 completed clean.
- **Test File Location:** `tests/test_advanced_features_focus_sleep.js`.
- **Master Test Runner:** `node run_all_tests.js`.
- **Constitutional Guardrails:** UTF-8 BOM encoding, zero innerHTML assertions, exit code 0 verification with raw terminal proof.

---

## 🧪 3. Detailed 8-Battery Test Specification

### Battery 1: DOM Structural Hierarchy & ID Verification
- Verify presence of `#widgetFocusAdvanced` and `#cardSleepAdvanced`.
- Verify presence of all 5 Focus Advanced DOM elements:
  - `#toggleFocusIntegrityScore`, `#badgeFocusIntegrityScore`, `#cntFocusDistractions`
  - `#toggleFocusAutoMuteBg`
  - `#selectFocusSoundscape` options (`binaural_alpha`, `binaural_beta`, `binaural_gamma`)
  - `#toggleFocusBreatheNudge` and `#overlayBreatheNudge`
  - `#toggleFocus2020Alert` and `#toast2020PostureAlert`
- Verify presence of all 6 Sleep Advanced DOM elements:
  - `#toggleSleepAutoplayBlock`
  - `#selectSleepAidSoundscape` options (`pink_noise`, `midnight_ocean`, `delta_rain`)
  - `#toggleSleepInactivityFastCutoff`
  - `#toggleSleepScreenDimmer` and `#overlaySleepDimmer`
  - `#toggleSleepTabHibernate`
  - `#btnSleepPowerNapMode`

### Battery 2: Default OFF / Inactive Invariant Verification
- Parse `dashboard/dashboard.html` and verify:
  - `#toggleFocusIntegrityScore` does NOT have `checked` attribute.
  - `#toggleFocusAutoMuteBg` does NOT have `checked` attribute.
  - `#selectFocusSoundscape` has option `value="none"` selected.
  - `#toggleFocusBreatheNudge` does NOT have `checked` attribute.
  - `#toggleFocus2020Alert` does NOT have `checked` attribute.
  - `#toggleSleepAutoplayBlock` does NOT have `checked` attribute.
  - `#selectSleepAidSoundscape` has option `value="none"` selected.
  - `#toggleSleepInactivityFastCutoff` does NOT have `checked` attribute.
  - `#toggleSleepScreenDimmer` does NOT have `checked` attribute.
  - `#toggleSleepTabHibernate` does NOT have `checked` attribute.
  - `#btnSleepPowerNapMode` is not active.

### Battery 3: Basic Container Preservation Verification
- Verify `#widgetPomodoroSentinel` is completely intact:
  - Preserves `#txtPomodoroTitle`, `#btnStartPomodoro`, `#pomodoroTimeDisplay`, `#dashFocusDialProgress`.
- Verify `#cardSleepSentinelHub` is completely intact:
  - Preserves `#txtSleepSentinelTitle`, `#btnDashSleepToggle`, `#dashSleepCountdownDisplay`, `#dashSleepDialProgress`.
- Confirm zero breaking ID mutations or deleted elements in basic containers.

### Battery 4: CSS Layout, Bento Grid Classes & Design Tokens
- Parse `dashboard/dashboard.css` and verify:
  - Presence of `.focus-integrity-row`, `.badge-integrity-score`, `.badge-distraction-counter`.
  - Presence of `.breathe-nudge-overlay`, `.breathe-visual-ring`, `@keyframes breatheCycle`.
  - Presence of `.toast-2020-alert`.
  - Presence of `.sleep-power-nap-banner`, `.btn-power-nap`.
  - Presence of `.sleep-soundscape-panel`.
  - Presence of `.screen-dimmer-overlay`.

### Battery 5: Bilingual i18n Dictionary Key Parity
- Parse `dashboard/dashboard.js` and extract `I18N_DICTIONARY.en` and `I18N_DICTIONARY.hi`.
- Verify 100% key parity for all 11 advanced features:
  - `lbl_focus_integrity`, `desc_focus_integrity`
  - `toggle_focus_automute_bg`, `desc_focus_automute_bg`
  - `soundscape_opt_binaural_alpha`, `soundscape_opt_binaural_beta`, `soundscape_opt_binaural_gamma`
  - `toggle_focus_breathe_nudge`, `desc_focus_breathe_nudge`
  - `toggle_focus_2020_alert`, `desc_focus_2020_alert`
  - `toggle_sleep_autoplay_block`, `desc_sleep_autoplay_block`
  - `lbl_sleep_aid_soundscapes`, `desc_sleep_aid_soundscapes`
  - `sleep_soundscape_none`, `sleep_soundscape_pink`, `sleep_soundscape_ocean`, `sleep_soundscape_rain`
  - `toggle_sleep_inactivity_cutoff`, `desc_sleep_inactivity_cutoff`
  - `toggle_sleep_screen_dimmer`, `desc_sleep_screen_dimmer`
  - `toggle_sleep_tab_hibernate`, `desc_sleep_tab_hibernate`
  - `btn_sleep_power_nap`, `desc_sleep_power_nap`

### Battery 6: JavaScript Controller & State Functions Existence
- Parse `dashboard/dashboard.js` and verify function declarations:
  - `initFocusAdvancedState`
  - `initSleepAdvancedState`
  - `updateFocusIntegrityScore`
  - `trigger2020PostureAlert`
  - `triggerBreatheNudgeOverlay`
  - `triggerPowerNapMode`
  - `startSleepAidSoundscape` / `stopSleepAidSoundscape`
- Verify function length limit (<= 50 lines) per Universal Rule 28.

### Battery 7: Web Audio API Synthesis Safety
- Verify mock Web Audio node creation:
  - ChannelMergerNode connection for binaural frequencies.
  - Absence of hardcoded external audio URLs (zero network latency / 404 dependencies).

### Battery 8: Master Test Suite Integration & Clean Run
- Add `test_advanced_features_focus_sleep.js` to `run_all_tests.js`.
- Execute `node run_all_tests.js` and verify 100% passing test suites with exit code 0.

---

## 🚫 4. Architectural Constraints & Invariants

- Must NOT modify or delete existing test suites in `tests/`.
- Must verify exit code 0 with raw terminal output.
- Must ensure test execution completes in < 5 seconds.

---

## 📦 5. Deliverables Manifest
- New test file: `tests/test_advanced_features_focus_sleep.js`.
- Updated test runner: `run_all_tests.js`.
- Raw terminal verification log proving exit code 0.

---

## 🛡️ 6. Local Verification Gate Command

```bash
node tests/test_advanced_features_focus_sleep.js && node run_all_tests.js
```
