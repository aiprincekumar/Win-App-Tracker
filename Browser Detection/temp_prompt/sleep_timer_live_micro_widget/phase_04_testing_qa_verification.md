# 🌙 Phase 4: Unit & Integration Test Battery and Master Regression Run

> **Phase Identifier:** Phase 4 of 4  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Execution  
> **Assigned Role:** Level 4 QA Verification Specialist  

---

## 🎯 1. Phase Objective
Author a dedicated, comprehensive 7-battery automated test suite in `tests/test_sleep_timer_live_micro_widget.js`, verify 100% pass rate with exit code 0, and run the master test runner `node run_all_tests.js` to ensure zero regressions across the entire project.

---

## 📦 2. Prerequisites & Inputs
- Phases 1, 2, and 3 completed clean.
- Existing test patterns: `tests/test_sleep_backend_and_dashboard_hub.js`, `tests/test_bidirectional_mute_toggle_phase3.js`.

---

## 🔍 3. Technical Context & File Anchors
- Target Test File: `tests/test_sleep_timer_live_micro_widget.js`
- Master Test Runner: `run_all_tests.js`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Author `tests/test_sleep_timer_live_micro_widget.js`
Implement 7 rigorous test batteries:
1. **Battery 1: DOM Markup & Accessibility Attributes:**
   - Assert presence of `#sleepLiveMicroWidget` in `dashboard/dashboard.html`.
   - Assert `role="button"`, `tabindex="0"`, `aria-label`, `title`, and inner elements `#sleepMicroStatusDot`, `#sleepMicroClock`, `#sleepMicroMode`.
2. **Battery 2: CSS Stylesheets, Keyframes & Reduced Motion:**
   - Verify `@keyframes sleepSentinelGlow`, `@keyframes sleepStartBtnPulse` in `components.css`.
   - Verify `.sleep-card-highlight`, `.highlight-pulse`, `.sleep-micro-hud` in `layout.css`.
   - Verify `@media (prefers-reduced-motion: reduce)` overrides disable animations.
3. **Battery 3: `navigateToSleepSentinel()` Navigation & Deep-Linking:**
   - Mock DOM environment with `document.getElementById`, `scrollIntoView`, and class lists.
   - Assert `switchTab('wellbeing')` is called.
   - Assert `scrollIntoView({ behavior: 'smooth', block: 'center' })` is invoked.
   - Assert `.sleep-card-highlight` is added to `#cardSleepSentinelHub`.
   - Assert `#btnDashSleepToggle` receives `.highlight-pulse` and `.focus({ preventScroll: true })`.
   - Assert 2000ms timer cleans up highlight classes.
4. **Battery 4: Keyboard Event Delegation:**
   - Simulate `keydown` events for `Enter` and `' '` (Space) triggering `navigateToSleepSentinel()`.
   - Ensure non-activation keys (e.g. `Tab`, `ArrowDown`) do not trigger navigation.
5. **Battery 5: Real-Time Telemetry Synchronization Across States:**
   - Mock `currentDashSleepTimer` across IDLE, RUNNING, PAUSED, FADING, and CANCELLED states.
   - Assert `#sleepMicroClock` matches formatted time string.
   - Assert `#sleepMicroMode` reflects `Sleep Idle`, `Sleep Active`, `Sleep Fading`, `Sleep Paused`.
   - Assert `#sleepMicroStatusDot` has proper classes (`hud-dot idle`, `hud-dot online`, `hud-dot warn`).
6. **Battery 6: Global Scope & Module Exports:**
   - Assert `navigateToSleepSentinel` is exported in `window`, `globalThis`, and `module.exports`.
7. **Battery 7: Security & Trusted Types Zero-innerHTML:**
   - Verify no instances of `.innerHTML =` are used for micro-widget telemetry or navigation highlighting.

### Step 4.2: Execute Master Regression Suite
Run `node run_all_tests.js` in terminal.
Verify that all suites pass with exit code 0.

### Step 4.3: Rules & Gitleaks Pre-Commit Check
Verify `gitleaks detect --redact` has 0 leaks.
Verify UTF-8 with BOM on all touched files.

---

## 🚧 5. Constraints & Boundaries
- All mock tests must be self-contained and run cleanly under Node.js without browser dependencies.
- Exit code must be strictly 0 on all tests.

---

## 📄 6. Deliverables Manifest
- Created: `tests/test_sleep_timer_live_micro_widget.js`
- Verified: `node run_all_tests.js` (Grade A+ certification)

---

## ✅ 7. Local Verification Gate
Run in terminal:
```powershell
node tests/test_sleep_timer_live_micro_widget.js
node run_all_tests.js
```
Expected output: 100% test passage, 0 failures, Exit code 0.
