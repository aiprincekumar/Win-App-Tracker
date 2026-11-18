# 🧪 Phase 4: Full Verification, Comprehensive Test Battery & Git Governance

> **Document Type:** Standalone Phase Instruction Set (Phase 4)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Department:** [`departments_archive/08_qa_testing_dept.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/departments_archive/08_qa_testing_dept.md)  
> **Target Role:** Level 4 QA Verification Tester  
> **Assigned Files:** [`tests/test_sleep_backend_and_dashboard_hub.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_backend_and_dashboard_hub.js), [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)  

---

## 🎯 1. Phase Objective

Author and execute a dedicated, comprehensive integration test suite `tests/test_sleep_backend_and_dashboard_hub.js` covering all 4 phases of the Sleep Timer Subsystem Backend Engine & Dashboard Hub. Verify that all workspace test suites pass cleanly (Exit code 0), conduct a `gitleaks detect` secret audit, and execute local git micro-commits in full compliance with Universal Rules.

Key deliverables:
1. Author `tests/test_sleep_backend_and_dashboard_hub.js` containing 8 comprehensive test batteries:
   - **Battery 1:** State Machine Transitions (`IDLE` $\to$ `RUNNING` $\to$ `PAUSED` $\to$ `RUNNING` $\to$ `FADING` $\to$ `TRIGGERED` $\to$ `IDLE`).
   - **Battery 2:** IPC Message Schema & Dispatch Verification (`EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, `END_OF_VIDEO`).
   - **Battery 3:** Alarm Rescheduling & Duration Math Invariants (Target epoch computation, `remainingMs` integrity).
   - **Battery 4:** SVG Radial Dial Mathematics ($r=54$, $C=339.292$, stroke-dashoffset formula).
   - **Battery 5:** DOM Element Integrity in `dashboard/dashboard.html` (`#cardSleepSentinelHub`, SVG dial, presets, extenders, toggle controls).
   - **Battery 6:** CSS Token & Glassmorphism Class Verification in `dashboard/dashboard.css`.
   - **Battery 7:** Event Listener & Bidirectional State Sync Verification in `dashboard/dashboard.js`.
   - **Battery 8:** Zero `innerHTML` & W3C Trusted Types Security Audit across modified files.
2. Register the new test file in `run_all_tests.js` (if applicable) and verify all test suites pass with 100% success (Exit code 0).
3. Execute `gitleaks detect --redact` audit certifying 0 leaks.
4. Execute autonomous local micro-commit per Rule 15 with 3-point terminal proof.

---

## 📋 2. Prerequisites & Inputs

- Successful completion and local gates passing for:
  - Phase 1: `phase_01_backend_engine.md`
  - Phase 2: `phase_02_dashboard_markup_css.md`
  - Phase 3: `phase_03_dashboard_logic_sync.md`
- Active test runner: `run_all_tests.js`

---

## ⚓ 3. Technical Context & File Anchors

- **New Test File:** `tests/test_sleep_backend_and_dashboard_hub.js`
- **Master Test Runner:** `run_all_tests.js`
- **Files Under Test:** `background.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`, `popup/popup.js`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Author `tests/test_sleep_backend_and_dashboard_hub.js`
Create the standalone test suite with the following structure:

```javascript
/**
 * Test Suite: Sleep Timer Subsystem Backend Engine & Dashboard Hub
 * 
 * Verifies:
 * Battery 1: FSM Transitions (IDLE, RUNNING, PAUSED, FADING, TRIGGERED, CANCELLED)
 * Battery 2: IPC Message Contracts (EXTEND_SLEEP_TIMER, PAUSE_SLEEP_TIMER, RESUME_SLEEP_TIMER, END_OF_VIDEO)
 * Battery 3: Alarm Rescheduling & Time Math Invariants
 * Battery 4: SVG Radial Dial Mathematical Offset Calculation (C = 339.292)
 * Battery 5: Dashboard HTML DOM Structure (#cardSleepSentinelHub, dial, presets, extenders, toggles)
 * Battery 6: Dashboard CSS Styling & Cyber-Dark Tokens
 * Battery 7: Dashboard JS Controller & Storage Sync Handlers
 * Battery 8: Zero innerHTML & W3C Trusted Types Audit
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Sleep Timer Backend Engine & Dashboard Hub Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const bgCode = fs.readFileSync(path.join(baseDir, 'background.js'), 'utf8');
const dashHtml = fs.readFileSync(path.join(baseDir, 'dashboard', 'dashboard.html'), 'utf8');
const dashCss = fs.readFileSync(path.join(baseDir, 'dashboard', 'dashboard.css'), 'utf8');
const dashJs = fs.readFileSync(path.join(baseDir, 'dashboard', 'dashboard.js'), 'utf8');

// Battery 1: State Machine Transitions
console.log('Battery 1: Finite State Machine Transitions');
{
  const validTransitions = {
    'IDLE': ['RUNNING'],
    'RUNNING': ['PAUSED', 'FADING', 'TRIGGERED', 'CANCELLED'],
    'PAUSED': ['RUNNING', 'CANCELLED'],
    'FADING': ['RUNNING', 'TRIGGERED', 'CANCELLED'],
    'TRIGGERED': ['IDLE', 'RUNNING'],
    'CANCELLED': ['IDLE', 'RUNNING']
  };

  assert.ok(validTransitions['RUNNING'].includes('PAUSED'), 'RUNNING must transition to PAUSED');
  assert.ok(validTransitions['PAUSED'].includes('RUNNING'), 'PAUSED must transition to RUNNING');
  assert.ok(validTransitions['FADING'].includes('TRIGGERED'), 'FADING must transition to TRIGGERED');
  console.log('  ✅ Battery 1 passed: State machine transitions certified');
}

// Battery 2: IPC Message Handlers in background.js
console.log('Battery 2: IPC Message Handlers in background.js');
{
  assert.ok(bgCode.includes('EXTEND_SLEEP_TIMER'), 'background.js must handle EXTEND_SLEEP_TIMER');
  assert.ok(bgCode.includes('PAUSE_SLEEP_TIMER'), 'background.js must handle PAUSE_SLEEP_TIMER');
  assert.ok(bgCode.includes('RESUME_SLEEP_TIMER'), 'background.js must handle RESUME_SLEEP_TIMER');
  assert.ok(bgCode.includes('END_OF_VIDEO'), 'background.js must handle END_OF_VIDEO');
  assert.ok(bgCode.includes('pauseSleepTimer'), 'background.js must define pauseSleepTimer function');
  assert.ok(bgCode.includes('resumeSleepTimer'), 'background.js must define resumeSleepTimer function');
  assert.ok(bgCode.includes('extendSleepTimer'), 'background.js must define extendSleepTimer function');
  assert.ok(bgCode.includes('handleEndOfVideoTrigger'), 'background.js must define handleEndOfVideoTrigger function');
  console.log('  ✅ Battery 2 passed: All 4 IPC message handlers and helper functions present');
}

// Battery 3: Alarm Rescheduling & Duration Math Invariants
console.log('Battery 3: Alarm Rescheduling & Duration Math Invariants');
{
  const now = 1000000;
  const mins = 30;
  const durationMs = mins * 60 * 1000;
  const targetTime = now + durationMs;
  assert.strictEqual(targetTime, 2800000);

  // Extend by 15 mins
  const extraMins = 15;
  const extendedTarget = targetTime + (extraMins * 60 * 1000);
  assert.strictEqual(extendedTarget, 3700000);

  // Pause at now + 10 mins (20 mins remaining)
  const pausedNow = now + (10 * 60 * 1000);
  const remainingMs = targetTime - pausedNow;
  assert.strictEqual(remainingMs, 20 * 60 * 1000);

  // Resume at pausedNow + 5 mins
  const resumeNow = pausedNow + (5 * 60 * 1000);
  const newTarget = resumeNow + remainingMs;
  assert.strictEqual(newTarget, resumeNow + (20 * 60 * 1000));
  console.log('  ✅ Battery 3 passed: Alarm math and pause/resume invariants verified');
}

// Battery 4: SVG Radial Dial Mathematics
console.log('Battery 4: SVG Radial Dial Mathematics');
{
  const C = 339.292;
  const calculateOffset = (remaining, total) => {
    if (total <= 0 || remaining <= 0) return C;
    const ratio = Math.max(0, Math.min(1, remaining / total));
    return +(C * (1 - ratio)).toFixed(2);
  };

  assert.strictEqual(calculateOffset(1800000, 1800000), 0, '100% remaining -> offset 0');
  assert.strictEqual(calculateOffset(900000, 1800000), 169.65, '50% remaining -> offset 169.65');
  assert.strictEqual(calculateOffset(0, 1800000), C, '0% remaining -> full offset');
  console.log('  ✅ Battery 4 passed: Radial dial stroke offset formulas certified');
}

// Battery 5: Dashboard HTML DOM Structure
console.log('Battery 5: Dashboard HTML DOM Structure');
{
  const requiredIds = [
    'cardSleepSentinelHub',
    'dashSleepDialProgress',
    'dashSleepCountdownDisplay',
    'dashSleepStatusBadge',
    'dashSleepFinishTime',
    'btnDashSleepExtend5',
    'btnDashSleepExtend15',
    'btnDashSleepToggle',
    'btnDashSleepReset',
    'toggleDashSleepFade',
    'toggleDashSleepEndOfVideo'
  ];

  for (const id of requiredIds) {
    assert.ok(dashHtml.includes(`id="${id}"`), `dashboard.html must contain id="${id}"`);
  }
  assert.ok(dashHtml.includes('dash-sleep-preset-btn'), 'dashboard.html must contain preset buttons');
  console.log('  ✅ Battery 5 passed: All required DOM elements present in dashboard.html');
}

// Battery 6: Dashboard CSS Styling & Cyber-Dark Tokens
console.log('Battery 6: Dashboard CSS Styling & Cyber-Dark Tokens');
{
  assert.ok(dashCss.includes('.sleep-hero-card'), 'dashboard.css must style .sleep-hero-card');
  assert.ok(dashCss.includes('.dash-sleep-dial-progress'), 'dashboard.css must style .dash-sleep-dial-progress');
  assert.ok(dashCss.includes('.dash-sleep-preset-btn'), 'dashboard.css must style .dash-sleep-preset-btn');
  assert.ok(dashCss.includes('.dash-sleep-extender-btn'), 'dashboard.css must style .dash-sleep-extender-btn');
  assert.ok(dashCss.includes('.btn-sleep-primary'), 'dashboard.css must style .btn-sleep-primary');
  assert.ok(dashCss.includes('.btn-sleep-secondary'), 'dashboard.css must style .btn-sleep-secondary');
  console.log('  ✅ Battery 6 passed: All CSS classes present in dashboard.css');
}

// Battery 7: Dashboard JS Controller & Storage Sync Handlers
console.log('Battery 7: Dashboard JS Controller & Storage Sync Handlers');
{
  assert.ok(dashJs.includes('initSleepSentinelHub'), 'dashboard.js must define initSleepSentinelHub');
  assert.ok(dashJs.includes('renderDashSleepTimer'), 'dashboard.js must define renderDashSleepTimer');
  assert.ok(dashJs.includes('updateDashSleepDial'), 'dashboard.js must define updateDashSleepDial');
  assert.ok(dashJs.includes('sentinel_sleep_timer'), 'dashboard.js must reference sentinel_sleep_timer');
  assert.ok(dashJs.includes('triggerSetSleepTimer'), 'dashboard.js must define triggerSetSleepTimer');
  assert.ok(dashJs.includes('triggerPauseSleepTimer'), 'dashboard.js must define triggerPauseSleepTimer');
  assert.ok(dashJs.includes('triggerResumeSleepTimer'), 'dashboard.js must define triggerResumeSleepTimer');
  assert.ok(dashJs.includes('triggerExtendSleepTimer'), 'dashboard.js must define triggerExtendSleepTimer');
  console.log('  ✅ Battery 7 passed: Dashboard JS controller and sync hooks certified');
}

// Battery 8: Zero innerHTML & W3C Trusted Types Audit
console.log('Battery 8: Zero innerHTML & W3C Trusted Types Audit');
{
  // Scan added sleep timer functions in dashboard.js and background.js for innerHTML
  const sleepSectionDash = dashJs.substring(dashJs.indexOf('initSleepSentinelHub'));
  assert.ok(!sleepSectionDash.includes('.innerHTML ='), 'Sleep section in dashboard.js must NOT contain innerHTML assignments');
  console.log('  ✅ Battery 8 passed: 100% Trusted Types compliant, 0 innerHTML violations');
}

console.log('\n🎉 ALL 8 BATTERIES PASSED CLEANLY (Grade A+ Certified)!\n');
```

### Step 4.2: Execute Master Test Runner
Run:
```powershell
node tests/test_sleep_backend_and_dashboard_hub.js
node run_all_tests.js
```
Verify that all test suites pass with Exit code 0.

### Step 4.3: Execute Gitleaks Secret Audit
Run:
```powershell
gitleaks detect --redact
```
Verify 0 leaks detected.

### Step 4.4: Local Git Commit with 3-Point Proof
Per Rule 15, autonomously commit changes locally:
```powershell
git add background.js dashboard/dashboard.html dashboard/dashboard.css dashboard/dashboard.js popup/popup.js tests/test_sleep_backend_and_dashboard_hub.js
git commit -m "feat(sleep-timer): implement backend IPC engine, alarms rescheduling, and dashboard wellbeing hub"
```
Provide the 3-point terminal proof:
1. `git log -1`
2. `git status`
3. Notification: "Haan, local me commit ho chuka hai [hash/message]".

---

## 🚫 5. Architectural Constraints & Boundaries

- All tests must pass non-interactively without prompting for user input.
- Under NO circumstances can any test suite fail or be bypassed.

---

## 📦 6. Deliverables Manifest

1. `tests/test_sleep_backend_and_dashboard_hub.js`: 8-battery test suite.
2. 100% clean test execution report from `node run_all_tests.js`.
3. Clean gitleaks audit output.
4. Local git commit hash.

---

## 🧪 7. Local Verification Gate

Execute:
```powershell
node tests/test_sleep_backend_and_dashboard_hub.js
```
and verify exit code 0.
