# Phase 2 Execution Prompt: Independent QA Verification & Regression Testing

> **Phase ID:** `PHASE-02-QA-VERIFICATION-REGRESSION`  
> **Target Role:** Level 4 QA Verification Subagent (`subagent`)  
> **Model Directive:** `flash` (Fast, deterministic test verification per Universal Rule 25)  
> **Mandatory Anchor:** `Mandatory: First load and adhere to dynamic_departments_matrix.md (or C:\Users\Atul Verma\.gemini\config\rules\dynamic_departments_matrix.md) and memory.md before executing instructions.`  
> **Allocated Department:** Dept 08 QA & Testing  
> **Primary Target Files:**  
> - `dashboard/dashboard.html`  
> - `dashboard/styles/focus_sleep_advanced.css`  
> - `node run_all_tests.js` (Master Test Suite)  

---

## 🎯 1. Phase Objective

Perform rigorous independent automated QA verification on the refactored Focus & Sleep Advanced Suites. Verify that all 4 modular cards exist, all checkboxes have been replaced with accessible modern toggle switches, layouts are responsive 2-column grids, all legacy IDs are preserved with 0% regression, the basic sections remain untouched, and the master test suite passes 100% clean with exit code 0.

---

## 🧪 2. Verification Batteries (8 Batteries)

### Battery 1: DOM Hierarchy & 4-Card Modular Split Verification
- Verify presence of `#widgetFocusAdvancedPlanner` with class `bento-card` and `bento-span-6`.
- Verify presence of `#widgetFocusAdvancedShields` with class `bento-card` and `bento-span-6`.
- Verify presence of `#widgetSleepAdvancedAcoustics` with class `bento-card` and `bento-span-6`.
- Verify presence of `#widgetSleepAdvancedAutomation` with class `bento-card` and `bento-span-6`.
- Verify that old monolithic containers `#widgetFocusAdvanced` and `#cardSleepAdvanced` have been cleanly replaced.

### Battery 2: ID Preservation & Backward Compatibility Audit
Verify that every single legacy ID exists and is properly addressable:
- Focus: `inputFocusGoal`, `inputFocusCustomMinutes`, `btnApplyCustomMinutes`, `btnFocusExtend5`, `btnFocusExtend15`, `selectFocusSoundscape`, `btnToggleSoundscape`, `sliderSoundscapeVolume`, `txtSoundscapeVolume`, `selectFocusChimeTone`, `btnPreviewChime`, `toggleFocusAutoPauseMedia`, `toggleFocusChime`, `toggleFocusDistractionShield`, `badgeFocusIntegrityScore`, `cntFocusDistractions`, `toggleFocusIntegrityScore`, `toggleFocusAutoMuteBg`, `toggleFocusBreatheNudge`, `toggleFocus2020Alert`.
- Sleep: `btnSleepPowerNapMode`, `inputDashSleepCustomMinutes`, `btnSetDashSleepCustom`, `btnDashSleepExtend5`, `btnDashSleepExtend15`, `selectSleepAidSoundscape`, `btnToggleSleepSoundscape`, `sliderSleepSoundscapeVolume`, `txtSleepSoundscapeVolume`, `toggleDashSleepFade`, `selectDashSleepFadeCurve`, `toggleDashSleepEndOfVideo`, `toggleDashSleepInactivity`, `selectDashSleepTimeoutAction`, `toggleSleepAutoplayBlock`, `toggleSleepInactivityFastCutoff`, `toggleSleepScreenDimmer`, `toggleSleepTabHibernate`.

### Battery 3: Modern Toggle Switch Component Audit
- Verify that toggle inputs are enclosed within `<label class="switch-toggle" ...>` with companion `<span class="slider-round"></span>`.
- Verify that zero legacy unstyled checkboxes exist in the 4 advanced cards.
- Verify presence of keyboard focus indicator styles and ARIA labels.

### Battery 4: Responsive 2-Column CSS Grid Rule Validation
- Verify `.controls-2col-grid` is defined with `grid-template-columns: repeat(2, minmax(0, 1fr))`.
- Verify `@media (max-width: 850px)` collapses `.controls-2col-grid` to `1fr`.
- Verify zero horizontal overflow on standard screen widths.

### Battery 5: Basic Section Non-Interference Audit
- Verify that `#widgetPomodoroSentinel` exists with its SVG dial `#dashFocusDialProgress`, `#pomodoroTimeDisplay`, `#btnStartPomodoro`, `#btnResetPomodoro`, and presets.
- Verify that `#cardSleepSentinelHub` exists with its SVG dial `#dashSleepDialProgress`, `#dashSleepCountdownDisplay`, `#btnDashSleepToggle`, `#btnDashSleepReset`, and presets.

### Battery 6: W3C Trusted Types & Security Audit
- Verify zero use of `innerHTML` or unsanitized DOM insertion in the newly added markup.
- Execute `gitleaks detect --redact` to confirm 0 credential leaks.

### Battery 7: UTF-8 with BOM Encoding Audit
- Confirm that `dashboard/dashboard.html` and `dashboard/styles/focus_sleep_advanced.css` have UTF-8 with BOM signature (`0xEF, 0xBB, 0xBF`).

### Battery 8: Master Regression Test Suite
- Run `node run_all_tests.js`.
- Confirm that all test suites pass with **Exit Code 0** and zero failures.

---

## 📋 3. QA Deliverable & Certification

Create and execute a standalone test script `tests/test_ui_advanced_controls_split.js` verifying Batteries 1 through 7, followed by `node run_all_tests.js`. Deliver the raw test output and a formal Grade A+ QA signoff report to the Level 2 Manager.
