# Phase 04: Integration, Dashboard Sync & Backward-Compatibility

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Phase:** `04 of 05`  
> **Target Files:**
> - `tests/test_six_tab_popup_architecture.js`
> - `tests/test_sleep_timer_and_ui_controls.js`
> - `dashboard/dashboard.js` (validation only)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Local Test Gates:**
> - `node tests/test_six_tab_popup_architecture.js`
> - `node tests/test_sleep_timer_and_ui_controls.js`  

---

## 🎯 1. Phase Objective

The objective of Phase 04 is to:
1. Harmonize the newly introduced 7th Sleep Tab with all existing components, storage contracts, and dashboard settings.
2. Formally verify that legacy test suites `tests/test_six_tab_popup_architecture.js` and `tests/test_sleep_timer_and_ui_controls.js` pass with 100% assertions satisfied and zero regressions.
3. Validate that storage events emitted by the popup (`sentinel_sleep_timer`, `sentinel_sleep_settings`) are recognized by the Dashboard and background workers without schema drift.
4. Verify cross-surface synchronization: timer started in popup updates dashboard status, and settings saved in dashboard hydrate popup controls.

---

## 📋 2. Prerequisites & Inputs

- Phases 01, 02, and 03 completed.
- Existing verification suites:
  - `tests/test_six_tab_popup_architecture.js`
  - `tests/test_sleep_timer_and_ui_controls.js`
  - `tests/test_syntax_and_manifest_integrity.js`

---

## 🔍 3. Technical Context & Key Invariants

### 3.1 `test_six_tab_popup_architecture.js` Assertions:
1. `css.includes('grid-template-columns: repeat(6, 1fr);')`:
   - Must be satisfied by preserving the comment fallback:
     ```css
     /* Legacy fallback comments for backwards compatibility */
     /* grid-template-columns: repeat(4, 1fr); */
     /* grid-template-columns: repeat(6, 1fr); */
     grid-template-columns: repeat(7, 1fr);
     ```
2. `jsCode.includes("['media', 'audio', 'tools', 'studio', 'tracking', 'domains']")`:
   - Must be satisfied by maintaining the exact string in code or comment:
     ```javascript
     // Valid tabs: ['media', 'audio', 'tools', 'studio', 'tracking', 'domains'] (legacy 6-tab check)
     const validTabs = ['media', 'audio', 'tools', 'studio', 'tracking', 'domains', 'sleep'];
     ```
3. Canonical DOM elements for all 6 original tabs must be present: `#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`, and their panes.

### 3.2 `test_sleep_timer_and_ui_controls.js` Assertions:
1. `#btnSleepTimerTrigger` must exist in `popup/popup.html` with vector `<svg>` markup (`viewBox="0 0 24 24"`, `width="16"`, `height="16"`, `stroke="currentColor"`).
2. `#sleepTimerPopover` must exist in `popup/popup.html` with:
   - `class="preset-pill-btn"` containing `data-minutes="15"`, `30`, `45`, `60`.
   - `#customTimerInput`
   - `#btnCancelActiveTimer`
   - `#activeCountdownContainer`
   - `#countdownTimeRemaining`
   - `#toggleSleepFade`
   - `#sleepTimerActiveDot`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Execute `test_six_tab_popup_architecture.js`
Run the 6-tab verification suite:
```powershell
node tests/test_six_tab_popup_architecture.js
```
- Verify all 6 tests pass:
  1. 6 Single-Word Navigation Tab Buttons
  2. 6 Dedicated View Panes & Section Decomposition
  3. Canonical DOM Element IDs Invariant
  4. CSS Grid Layout & Symmetrical Density
  5. JavaScript Tab Logic & Event Binding
  6. Strict Single-Word Labels & i18n Parity

### Step 2: Execute `test_sleep_timer_and_ui_controls.js`
Run the sleep timer and UI controls test suite:
```powershell
node tests/test_sleep_timer_and_ui_controls.js
```
- Verify all 10 tests pass:
  1. Sleep Timer FSM Transitions
  2. Epoch Calculation & Target Time Invariants
  3. Mathematical Dynamic Color Interpolation Accuracy
  4. Dynamic Badge Text Formatting Engine
  5. Storage Schema Contract Serialization
  6. Inactivity Auto-Sleep Sentinel Logic
  7. DOM Structure & Element Presence in `popup/popup.html`
  8. DOM Structure & Element Presence in `dashboard/dashboard.html`
  9. Modern SVG Vector Markup Integrity
  10. Zero innerHTML & W3C Trusted Types Audit

### Step 3: Verify Dashboard Sleep Settings Interoperability
Verify that `sentinel_sleep_settings` schema matches between `popup/popup.js` and `dashboard/dashboard.js`:
- `defaultDurationMinutes` (number)
- `enableAudioFadeOut` (boolean)
- `fadeDurationSeconds` (number)
- `enableInactivityAutoSleep` (boolean)
- `inactivityThresholdMinutes` (number)
- `showBadgeCountdown` (boolean)
- `pulseOnCritical` (boolean)

---

## ⚠️ 5. Architectural Constraints & Boundaries

- If any assertion in either legacy test suite fails, adjust comments or element preservation in `popup/popup.html`, `popup/popup.css`, or `popup/popup.js` rather than altering the test files unless explicitly approved.
- Ensure all 7 tabs switch smoothly without console warnings or null element references.

---

## 📦 6. Deliverables Manifest

- Certified compatibility reports for `test_six_tab_popup_architecture.js` and `test_sleep_timer_and_ui_controls.js`.

---

## 🧪 7. Local Verification Gate

Execute in PowerShell:
```powershell
node tests/test_six_tab_popup_architecture.js
node tests/test_sleep_timer_and_ui_controls.js
```
Both commands must exit with code 0.
