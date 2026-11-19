<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Phase 4 Standalone Execution Prompt

> **Phase Identifier:** `PHASE-04-QA-VERIFICATION`  
> **Target Subagent Role:** Level 4 Independent QA & Verification Specialist  
> **Target Workspaces & Files:**  
> - New Test Suite: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\tests\test_focus_block_circular_dial.js`  
> - Master Test Runner: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\run_all_tests.js`  
> **Prerequisites:** Phases 1, 2, and 3 implementation completed  
> **Verification Gate:** 100% Test Passage (Exit Code 0), 0 Gitleaks Leaks, Grade A+ Certification

---

## 🎯 1. Phase Objective

Construct a dedicated, comprehensive 8-battery automated test suite (`tests/test_focus_block_circular_dial.js`) to rigorously verify the new Focus Block circular radial countdown dial. Execute the suite alongside existing focus tests and master regression runners, certify 100% W3C Trusted Types zero-innerHTML safety, verify UTF-8 with BOM parity, and confirm 0 secret leaks.

---

## 📂 2. Target Test Suite Specification

Create `tests/test_focus_block_circular_dial.js` containing the following 8 test batteries:

### Battery 1: DOM Hierarchy & Legacy ID Preservation
- Assert `#cardPopupFocusTimer` resides inside `#viewFocusPane` -> `#cardFocusWellness`.
- Assert 100% presence of legacy IDs: `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, `#txtPopupActiveGoal`.

### Battery 2: SVG Dial Elements, Coordinates & Geometry
- Assert `<svg id="popupFocusDialSvg">` exists with `viewBox="0 0 140 140"`.
- Assert track circle has `cx="70" cy="70" r="54"`.
- Assert `#popupFocusDialProgress` has `cx="70" cy="70" r="54"`, `stroke-dasharray="339.292"`, and `transform="rotate(-90 70 70)"`.

### Battery 3: Dynamic SVG Linear Gradients Defs
- Assert `<linearGradient id="focusGlowGradient">` exists with emerald/cyan/blue stops (`#10b981`, `#06b6d4`, `#3b82f6`).
- Assert `<linearGradient id="breakGlowGradient">` exists with amber/gold stops (`#f59e0b`, `#fbbf24`).

### Battery 4: Depleting Stroke Offset Mathematical Precision
- Verify the depleting formula: $\text{offset} = 339.292 \times (1 - \text{remaining} / \text{total})$.
- Assert exact boundary offsets:
  - 100% remaining (1500s / 1500s) -> `0.000`
  - 75% remaining (1125s / 1500s) -> `84.823`
  - 50% remaining (750s / 1500s) -> `169.646`
  - 25% remaining (375s / 1500s) -> `254.469`
  - 0% remaining (0s / 1500s) -> `339.292`
  - Negative clamp (< 0s) -> `339.292`
  - Overflow clamp (> 1500s) -> `0.000`

### Battery 5: Cyber-Dark CSS Architecture & Theme Tokens
- Assert `popup/popup.css` contains `.popup-focus-card`, `.popup-focus-dial-wrapper`, `.popup-focus-svg-dial`, `.popup-focus-dial-track`, `.popup-focus-dial-progress`, `.popup-focus-dial-content`, `.popup-focus-dial-state`.
- Assert light theme overrides `[data-theme="light"] .popup-focus-card` and `[data-theme="light"] .popup-focus-dial-track`.

### Battery 6: JavaScript Controller Binding & Rule 28 Modularity
- Assert `popup/popup.js` binds `#popupFocusDialProgress` and calculates offset with constant `339.292`.
- Assert all Focus controller functions in `popup/popup.js` are <= 50 lines with nesting depth <= 3 per Universal Rule 28.

### Battery 7: W3C Trusted Types Zero-innerHTML Audit
- Assert 0 occurrences of `.innerHTML` or `.outerHTML` in `popup/popup.js` Focus routines.

### Battery 8: Pomodoro Backend IPC & Storage Contracts Preservation
- Assert `START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER` remain actively dispatched in `popup.js`.
- Assert `sentinel_focus_timer` storage change listener is intact.

---

## 🔨 3. Test Runner Execution Protocol

1. **Execute Dedicated Test Suite:**
   ```powershell
   node tests/test_focus_block_circular_dial.js
   ```
2. **Execute Baseline Subsystem Tests:**
   ```powershell
   node tests/test_focus_time_phase1_uiux.js
   node tests/test_focus_time_subsystem.js
   ```
3. **Execute Master Test Suite:**
   ```powershell
   node run_all_tests.js
   ```
4. **Execute Secret Leak Scan:**
   ```powershell
   gitleaks detect --redact
   ```
5. **Verify UTF-8 with BOM:**
   Verify that all touched files (`popup/popup.html`, `popup/popup.css`, `popup/popup.js`, and `tests/test_focus_block_circular_dial.js`) start with BOM bytes `0xEF, 0xBB, 0xBF`.

---

## 🚦 4. Deliverables & Signoff Gate

- **Deliverables:**
  - `tests/test_focus_block_circular_dial.js`
  - Verified test logs showing 100% exit code 0 across all suites.
- **Formal Signoff Criteria:**
  - Grade A+ Certification issued to Level 2 Manager.
