<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Live Tracking Board & Problem-Solution Dossier

> **Specification & Governance:**
> - **Task Identifier:** `TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001`
> - **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)
> - **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Generation Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Primary Reference Artifact:** `C:/Users/Atul Verma/.gemini/antigravity/brain/456af0b4-7b0c-47a0-9757-d8fb92638e6e/.user_uploaded/media_1795047758364_f1a77e3e.png`

---

## 📋 1. Executive Problem-Solution Summary

### Problem Context & Defect Analysis
The user requested:
> *"Revamp Focus Block UI/UX with SVG circular countdown ring/dial (sleep timer style radial dial with depleting stroke), modern cyber-dark UI, maintaining strict backend logic preservation."*
> Based on user-uploaded screenshot `media_1795047758364_f1a77e3e.png`:
> - In `popup/popup.html` (`#viewFocusPane` -> `#cardFocusWellness`), the current `#cardPopupFocusTimer` displays a plain rectangular digital clock (`25:00`) alongside basic play/reset square buttons.
> - While the Sleep Timer tab (`#cardSleepHeroRing`) and Dashboard Focus Sentinel (`#dashFocusDialProgress`) already feature futuristic circular SVG countdown dials, the primary Focus Block in the Extension Popup lacks this visual fidelity.
> - The rectangular layout feels dated and lacks immediate peripheral visual telemetry of elapsed vs. remaining focus time.
> - Previous test suites (`test_focus_time_phase1_uiux.js` and `test_focus_time_subsystem.js`) require specific DOM IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, `#txtPopupActiveGoal`) and CSS classes (`.popup-focus-card`, `.popup-focus-badge`, `.popup-focus-clock`, `.popup-focus-btn`) to remain 100% intact.

### The Surgical Solution
1. **Phase 1: DOM Structure & SVG Radial Dial Markup (`popup/popup.html`)**
   - Transform `#cardPopupFocusTimer` into a sleek cyber-dark hero card housing a centered SVG radial countdown dial (`viewBox="0 0 140 140"`, radius $r = 54$, circumference $C = 339.292$).
   - Include SVG defs for neon emerald/cyan focus gradient (`#focusGlowGradient`) and amber break gradient (`#breakGlowGradient`).
   - Position background track circle (`.popup-focus-dial-track`) and dynamic depleting meter circle (`#popupFocusDialProgress`).
   - Overlay centered telemetry housing `#popupFocusClock` and sub-badge `#popupFocusDialState`.
   - Preserve all existing legacy element IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, `#txtPopupActiveGoal`) to guarantee 0 regressions across existing test batteries.
2. **Phase 2: Modern Cyber-Dark CSS & Radial Ring Styling (`popup/popup.css`)**
   - Style `#cardPopupFocusTimer` with Liquid Glass cyber-dark aesthetic: `rgba(15, 23, 42, 0.75)` backdrop blur, cyan/emerald border neon glow, and refined box shadows.
   - Style the SVG dial wrapper with centered absolute overlay for digits.
   - Style `.popup-focus-dial-track` with subtle dark track stroke `rgba(255, 255, 255, 0.08)`.
   - Style `#popupFocusDialProgress` with `stroke-dasharray="339.292"`, `stroke-dashoffset="0"`, smooth CSS transition `stroke-dashoffset 0.35s ease`, and `stroke-linecap="round"`.
   - Style action buttons `#btnPopupFocusToggle` and `#btnPopupFocusReset` with cyber capsule hover glows and accessible click states.
   - Provide clean light-mode overrides (`[data-theme="light"]`) ensuring WCAG 2.1 AA 4.5:1 contrast compliance.
3. **Phase 3: JavaScript Dial Animation & State Binding (`popup/popup.js`)**
   - Bind `#popupFocusDialProgress` and `#popupFocusDialState` in `popup.js`.
   - Integrate depleting stroke formula into `renderPopupFocusTick()` and `syncPopupFocusState()`:
     $$\text{offset} = C \times \left(1 - \frac{\text{remaining}}{\text{total}}\right) \quad (\text{where } C = 339.292)$$
   - Switch dial stroke gradient dynamically between focus mode (`url(#focusGlowGradient)`) and break mode (`url(#breakGlowGradient)`).
   - Maintain 100% strict preservation of background Chrome runtime messaging (`START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`) and `storage.onChanged` listeners.
   - Enforce 100% W3C Trusted Types compliance with zero innerHTML mutations.
4. **Phase 4: Independent QA Test Suite & Regression Verification (`tests/` & `run_all_tests.js`)**
   - Construct dedicated 8-battery test suite `tests/test_focus_block_circular_dial.js`.
   - Validate 100% passage of `tests/test_focus_time_phase1_uiux.js` and `tests/test_focus_time_subsystem.js`.
   - Execute master regression suite `node run_all_tests.js` ensuring 0 regressions.
   - Verify `gitleaks detect --redact` reports 0 secret leaks.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Primary Target Files | Target Subagent | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | DOM Structure & SVG Dial Markup | `popup/popup.html` | Frontend Specialist (Level 4) | `PENDING` | Gate 1 Required |
| **02** | Cyber-Dark CSS & Dial Styling | `popup/popup.css` | Frontend Specialist (Level 4) | `PENDING` | Gate 2 Required |
| **03** | JS Animation & State Binding | `popup/popup.js` | Frontend Specialist (Level 4) | `PENDING` | Gate 3 Required |
| **04** | Independent QA Verification Suite | `tests/test_focus_block_circular_dial.js` | QA Test Specialist (Level 4) | `PENDING` | Certified Grade A+ |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `popup/popup.html` | `#cardPopupFocusTimer` contains plain rectangular layout (`popup-focus-body`) with numeric text only; lacks sleep-timer style SVG circular dial. | Re-architect inner markup to incorporate `<svg id="popupFocusDialSvg">` ($r=54$, $C=339.292$) with track and `#popupFocusDialProgress`, while preserving all existing legacy IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, etc.). | Delivers radial dial visualization while preserving 100% backward compatibility with existing tests. | Phase 1 | `node tests/test_focus_time_phase1_uiux.js` |
| **2** | `popup/popup.css` | CSS only specifies rectangular container styles for `.popup-focus-card` and `.popup-focus-body`; lacks radial dial positioning, SVG track, progress ring, and cyber-dark neon glow styling. | Implement `.popup-focus-dial-wrapper`, `.popup-focus-svg-dial`, `.popup-focus-dial-track`, `.popup-focus-dial-progress`, `.popup-focus-dial-content`, and cyber-dark glass tokens. | Establishes modern cyber-dark visual aesthetic matching the Sleep Sentinel radial dial. | Phase 2 | `node tests/test_focus_time_phase1_uiux.js` |
| **3** | `popup/popup.css` | Light theme rules in `popup.css` do not cover radial focus dial track and progress rings. | Add light theme overrides under `[data-theme="light"] .popup-focus-card` with high-contrast emerald/slate values. | Guarantees WCAG 2.1 AA compliance across light and dark user modes. | Phase 2 | `node tests/test_focus_time_phase1_uiux.js` |
| **4** | `popup/popup.js` | `syncPopupFocusState` and `renderPopupFocusTick` only mutate `#popupFocusClock.textContent`; do not update SVG `strokeDashoffset` on `#popupFocusDialProgress`. | Query `#popupFocusDialProgress` and update `style.strokeDashoffset = (C * (1 - remaining / total)).toFixed(3)`. Add gradient mode switching. | Delivers smooth 1s depleting dial ring animation synchronized with countdown clock. | Phase 3 | `node tests/test_focus_time_phase1_uiux.js` |
| **5** | `popup/popup.js` | Dial state label `#popupFocusDialState` is absent from runtime update loop. | Safely update `#popupFocusDialState.textContent` using W3C Trusted Types zero-innerHTML standard. | Provides clear mode telemetry ("Deep Work", "Break Time", "Paused"). | Phase 3 | `node tests/test_focus_time_phase1_uiux.js` |
| **6** | `tests/test_focus_block_circular_dial.js` | No existing dedicated unit test validates the new popup SVG radial dial geometry, depleting offset math, and cyber-dark classes. | Author comprehensive 8-battery test suite verifying DOM structure, SVG attributes, offset calculation, theme CSS, and IPC preservation. | Guarantees automated regression protection and Grade A+ certification. | Phase 4 | `node tests/test_focus_block_circular_dial.js` |

---

## 🛡️ 4. Non-Negotiable Constitutional Constraints
1. **Main Agent (CEO) & Level 2 Manager Zero-Code Hard Lock:** All implementation, file edits, and test executions must be delegated exclusively to dedicated Level 4 Subagents with valid `AUTH-MGR-*` tokens.
2. **Backward Compatibility Invariant:** Legacy DOM IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, `#txtPopupActiveGoal`) and classes (`.popup-focus-card`, `.popup-focus-badge`, `.popup-focus-clock`, `.popup-focus-btn`) MUST remain accessible in the DOM to prevent breaking existing automation or tests.
3. **W3C Trusted Types Compliance:** 0 assignments to `innerHTML` or `outerHTML`. All DOM modifications must use `createElement`, `createElementNS`, `textContent`, `setAttribute`, or `classList`.
4. **Backend Logic & IPC Preservation:** Chrome runtime messaging (`START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`) and `storage.onChanged` handlers must not be modified or bypassed.
5. **Encoding Standard:** All generated and modified files must be UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
