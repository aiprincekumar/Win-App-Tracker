<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Phase 3 Standalone Execution Prompt

> **Phase Identifier:** `PHASE-03-JS-DIAL-ANIMATION`  
> **Target Subagent Role:** Level 4 Frontend Engineering Specialist  
> **Target Workspaces & Files:**  
> - Primary Target: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.js`  
> - Reference Pattern: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\tests\test_focus_time_subsystem.js` (Battery 4 mathematical offset calculation)  
> **Prerequisites:** Phase 1 (DOM) and Phase 2 (CSS) completed and verified  
> **Verification Gate:** `node tests/test_focus_time_phase1_uiux.js` & `node tests/test_focus_time_subsystem.js` (100% PASS, Exit Code 0)

---

## 🎯 1. Phase Objective

Connect the SVG circular countdown dial `#popupFocusDialProgress` in `popup/popup.js`. Dynamically calculate and update the depleting `strokeDashoffset` in both `renderPopupFocusTick()` and `syncPopupFocusState()`, dynamically switch between focus and break glow gradients, update the telemetry label `#popupFocusDialState`, and ensure 100% strict preservation of the Pomodoro backend messaging contract (`START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`).

---

## 📂 2. File Anchors & Context

- **Target File:** `popup/popup.js`
- **Location Anchor:** Lines ~3400 to ~3545 (inside the Focus Timer controller setup).
- **Existing Elements Query:**
  - `popupFocusClock = document.getElementById('popupFocusClock');`
  - `popupFocusBadge = document.getElementById('popupFocusBadge');`
  - `btnPopupFocusToggle = document.getElementById('btnPopupFocusToggle');`
  - `btnPopupFocusReset = document.getElementById('btnPopupFocusReset');`

---

## 🔨 3. Surgical Implementation Instructions

### Step 3.1: Query New DOM Elements and Define Mathematical Constant
At the start of the Focus controller block (near line ~3413):
```javascript
  const popupFocusDialProgress = document.getElementById('popupFocusDialProgress');
  const popupFocusDialState = document.getElementById('popupFocusDialState');
  const POPUP_FOCUS_CIRCUMFERENCE = 339.292; // 2 * Math.PI * 54 for r=54
```

### Step 3.2: Implement Modular Helper `updatePopupFocusDialProgress`
Add a dedicated, modular helper function (<= 25 lines) to calculate and apply the depleting stroke offset:
```javascript
  function updatePopupFocusDialProgress(remaining, totalDuration) {
    if (!popupFocusDialProgress) return;
    const total = Math.max(1, totalDuration || (popupFocusBackendState.durationMinutes || 25) * 60);
    const rem = Math.max(0, Math.min(total, remaining));
    const ratio = rem / total;
    const offset = Math.max(0, Math.min(POPUP_FOCUS_CIRCUMFERENCE, +(POPUP_FOCUS_CIRCUMFERENCE * (1 - ratio)).toFixed(3)));
    popupFocusDialProgress.style.strokeDashoffset = String(offset);

    // Dynamic gradient switching based on mode
    if (popupFocusBackendState && popupFocusBackendState.mode === 'break') {
      popupFocusDialProgress.setAttribute('stroke', 'url(#breakGlowGradient)');
    } else {
      popupFocusDialProgress.setAttribute('stroke', 'url(#focusGlowGradient)');
    }
  }
```

### Step 3.3: Wire Helper into `renderPopupFocusTick()`
In `renderPopupFocusTick()` (lines ~3429 to ~3438), call `updatePopupFocusDialProgress`:
```javascript
  function renderPopupFocusTick() {
    let remaining = popupFocusBackendState.remainingSeconds;
    const isRunning = (popupFocusBackendState.state === 'RUNNING_FOCUS' || popupFocusBackendState.state === 'RUNNING_BREAK');
    if (isRunning && popupFocusBackendState.targetTime) {
      remaining = Math.max(0, Math.round((popupFocusBackendState.targetTime - Date.now()) / 1000));
    }
    if (popupFocusClock) {
      popupFocusClock.textContent = formatPopupFocusClock(remaining);
    }
    updatePopupFocusDialProgress(remaining, (popupFocusBackendState.durationMinutes || 25) * 60);
  }
```

### Step 3.4: Wire Helper and Sub-label into `syncPopupFocusState(bgState)`
In `syncPopupFocusState(bgState)` (lines ~3440 to ~3493), invoke `updatePopupFocusDialProgress` and update `#popupFocusDialState`:
```javascript
  // After updating popupFocusClock.textContent...
  updatePopupFocusDialProgress(remaining, (popupFocusBackendState.durationMinutes || 25) * 60);

  if (popupFocusDialState) {
    if (isRunning) {
      popupFocusDialState.textContent = popupFocusBackendState.mode === 'break' ? 'Break Time' : 'Deep Focus';
    } else if (isPaused) {
      popupFocusDialState.textContent = 'Paused';
    } else {
      popupFocusDialState.textContent = 'Ready';
    }
  }
```

---

## 🛡️ 4. Constitutional Constraints & Boundaries

1. **W3C Trusted Types Compliance:**
   - 0 assignments to `.innerHTML` or `.outerHTML`. Only `.textContent`, `.style.strokeDashoffset`, and `.setAttribute()` are permitted.
2. **Universal Rule 28 Modularity Invariant:**
   - Keep all modified/added functions under 50 lines in length with nesting depth <= 3.
3. **Backend Logic Preservation Invariant:**
   - Do NOT alter runtime messaging calls (`START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`).
   - Do NOT modify storage listeners or background alarm orchestration.
4. **Encoding Standard:**
   - UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚦 5. Deliverables & Verification Gate

- **Deliverable:** Updated `popup/popup.js`.
- **Local Verification Commands:**
  ```powershell
  node tests/test_focus_time_phase1_uiux.js
  node tests/test_focus_time_subsystem.js
  ```
- **Acceptance Criteria:**
  - Both test suites pass 100% cleanly with exit code 0.
