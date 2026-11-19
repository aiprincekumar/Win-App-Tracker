<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Product Requirements Document (PRD)

> **Specification & Governance:**
> - **Task Identifier:** `TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001`
> - **Lead Department:** Department 01 (Product Requirements) & Department 05 (Frontend Engineering)
> - **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Reference Media:** `C:/Users/Atul Verma/.gemini/antigravity/brain/456af0b4-7b0c-47a0-9757-d8fb92638e6e/.user_uploaded/media_1795047758364_f1a77e3e.png`

---

## 👥 1. User Personas & Value Proposition

### 1.1 Target Personas
1. **The Deep Work Software Engineer (Alex):**
   - *Needs:* Immediate, distraction-free visual feedback on remaining focus intervals without reading tiny digits or opening full-page dashboards.
   - *Pain Point:* The old rectangular timer looks dated and doesn't communicate elapsed proportion at a quick glance.
2. **The Mindful Browser & Student (Maya):**
   - *Needs:* Clear visual distinction between active focus sessions (calm emerald neon) and recovery break sessions (warm amber glow), matching the Sleep tab dial.
   - *Pain Point:* Disjointed aesthetics between the sleek Sleep tab radial ring and the plain Focus Block.
3. **The System Maintainer & QA Engineer (Dev Team):**
   - *Needs:* Zero regressions, zero broken tests, 100% backward-compatible DOM tree, and strict adherence to W3C Trusted Types zero-innerHTML safety.

---

## 📋 2. Functional Requirements (FR)

- **FR-1: Radial SVG Dial Container:**
  The `#cardPopupFocusTimer` in `popup/popup.html` must contain an SVG circular countdown dial (`<svg id="popupFocusDialSvg">`) with a track circle (`<circle class="popup-focus-dial-track">`) and an active depleting stroke meter circle (`<circle id="popupFocusDialProgress">`).
- **FR-2: Depleting Radial Stroke Meter:**
  The dial must visually deplete as time progresses. At timer start ($t = T_{\text{total}}$), the stroke is 100% full (`strokeDashoffset = 0`). At timer completion ($t = 0$), the stroke is 100% depleted (`strokeDashoffset = 339.292`).
- **FR-3: Centered Telemetry Overlay:**
  The numeric clock display (`<span id="popupFocusClock">25:00</span>`) must be centered directly inside the SVG ring along with an informative mode subtitle (`<span id="popupFocusDialState">Deep Focus</span>`).
- **FR-4: Header Status Badge & Active Goal Chip:**
  The card header must feature the title `🧘 Focus Block` and status badge (`#popupFocusBadge`), displaying `25m`, `Active`, `Break`, or `Paused`. If an active goal is set, the `#popupActiveGoalChip` and `#txtPopupActiveGoal` must remain seamlessly positioned.
- **FR-5: Action Control Buttons:**
  The card must provide accessible action buttons: Primary Toggle (`#btnPopupFocusToggle`, switching between ▶️ Start/Resume and ⏸️ Pause) and Secondary Reset (`#btnPopupFocusReset`, displaying 🔄).
- **FR-6: Dynamic State-Aware Color Glows:**
  The SVG dial meter must dynamically render:
  - Neon Emerald/Cyan gradient (`#focusGlowGradient`) during Focus intervals.
  - Warm Amber/Orange gradient (`#breakGlowGradient`) during Break intervals.
  - Muted Slate stroke during Paused or Idle states.
- **FR-7: Theme Parity:**
  Full visual styling must be supported for both dark cyber-mesh mode and light mode (`[data-theme="light"]`), guaranteeing WCAG 2.1 AA 4.5:1 contrast compliance.
- **FR-8: Strict Backend Logic & IPC Preservation:**
  The component must communicate exclusively through existing Chrome runtime IPC actions (`START_FOCUS_TIMER`, `PAUSE_FOCUS_TIMER`, `RESUME_FOCUS_TIMER`, `RESET_FOCUS_TIMER`) and listen to `sentinel_focus_timer` storage changes without mutating background state machine contracts.

---

## 🔒 3. Non-Functional Requirements (NFR)

- **NFR-1 (Constitutional Backward Compatibility):**
  All existing DOM IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, `#txtPopupActiveGoal`) and CSS classes (`.popup-focus-card`, `.popup-focus-badge`, `.popup-focus-clock`, `.popup-focus-btn`) must be preserved verbatim.
- **NFR-2 (W3C Trusted Types Compliance):**
  Zero assignments to `.innerHTML` or `.outerHTML`. All DOM modifications must utilize `.textContent`, `.style.*`, `.setAttribute()`, or `.classList`.
- **NFR-3 (Performance & 60fps Smoothness):**
  Dial depletion must update via hardware-accelerated CSS `stroke-dashoffset` transitions (`0.35s ease`), preventing any main-thread UI jank.
- **NFR-4 (Compact Popup Geometry):**
  The entire Focus Block card must fit within the extension popup's bounded width (~380px) and vertical height without causing scroll overflow.
- **NFR-5 (Encoding Standard):**
  All files touched must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding.
- **NFR-6 (Automated Verification Gate):**
  100% passage across all existing and new test suites with exit code 0.

---

## 🎯 4. INVEST User Stories

1. **US-1 (Visual Telemetry):**
   *As a* user engaging in deep work,  
   *I want to* see a circular depleting ring around my focus countdown clock in the popup,  
   *So that* I can perceive how much of my 25-minute focus session remains at an instant glance.
2. **US-2 (State Awareness):**
   *As a* user taking a scheduled break,  
   *I want* the ring to adapt its color from emerald focus to warm amber break,  
   *So that* I clearly recognize my current working mode.
3. **US-3 (Seamless Control):**
   *As a* user interrupted during a session,  
   *I want to* click the toggle button to pause and resume without losing my place or ring position,  
   *So that* my focus metrics remain accurate.

---

## 📊 5. MoSCoW Prioritization

| Priority | Requirement Code | Feature Scope Description |
| :--- | :--- | :--- |
| **Must Have** | FR-1, FR-2, FR-3, FR-5, NFR-1, NFR-2, NFR-4 | SVG circular dial ($r=54$, $C=339.292$), depleting stroke offset math, centered clock digits, preserved toggle/reset buttons, zero innerHTML, legacy ID retention. |
| **Must Have** | FR-6, FR-8, NFR-3 | Dynamic emerald/amber gradient defs, background IPC synchronization, smooth CSS transitions. |
| **Should Have** | FR-4, FR-7, NFR-5 | Sub-label mode telemetry (`#popupFocusDialState`), light theme overrides with WCAG 2.1 AA contrast. |
| **Could Have** | - | Quick +5m / +10m extenders in popup (deferred to future expansion to maintain clean layout). |
| **Won't Have** | - | Full-screen Zen mode inside the extension popup (already housed on the Dashboard). |

---

## 🧪 6. Rigorous Given-When-Then Acceptance Criteria

### Scenario 1: Initial Idle State
- **Given:** The popup is opened and the Focus timer is IDLE.
- **When:** The Focus tab (`#mainTabFocus`) is selected.
- **Then:** `#cardPopupFocusTimer` renders the SVG dial with `stroke-dashoffset = 0` (full ring), `#popupFocusClock` displays `25:00`, `#popupFocusBadge` displays `25m` with class `idle`, and `#btnPopupFocusToggle` displays `▶️` with title `Start Focus`.

### Scenario 2: Starting a Focus Session
- **Given:** The timer is IDLE at 25:00.
- **When:** The user clicks `#btnPopupFocusToggle`.
- **Then:** Chrome runtime sends message `{ action: 'START_FOCUS_TIMER', durationMinutes: 25, mode: 'focus' }`, `#popupFocusBadge` updates to `Active` with class `running`, `#btnPopupFocusToggle` updates to `⏸️` with title `Pause Focus`, and `#popupFocusDialProgress` applies the emerald gradient `url(#focusGlowGradient)`.

### Scenario 3: Countdown Stroke Depletion
- **Given:** A 25-minute (1500 seconds) focus session is running.
- **When:** 375 seconds elapse (1125 seconds remaining, 75% remaining).
- **Then:** `renderPopupFocusTick()` calculates $\text{offset} = 339.292 \times (1 - 1125 / 1500) = 84.823$, `#popupFocusDialProgress.style.strokeDashoffset` is set to `84.823`, and `#popupFocusClock` displays `18:45`.

### Scenario 4: Pausing & Resuming the Timer
- **Given:** A focus session is actively running.
- **When:** The user clicks `#btnPopupFocusToggle`.
- **Then:** Chrome runtime sends `{ action: 'PAUSE_FOCUS_TIMER' }`, the 1s ticker interval is cleared, `#popupFocusBadge` displays `Paused` with class `paused`, `#btnPopupFocusToggle` displays `▶️` with title `Resume Focus`, and the dial offset remains statically frozen at its current position.
- **When:** The user clicks `#btnPopupFocusToggle` again.
- **Then:** Chrome runtime sends `{ action: 'RESUME_FOCUS_TIMER' }`, the ticker resumes, and the dial continues depleting smoothly.

### Scenario 5: Resetting the Timer
- **Given:** A session is running or paused.
- **When:** The user clicks `#btnPopupFocusReset`.
- **Then:** Chrome runtime sends `{ action: 'RESET_FOCUS_TIMER' }`, `#popupFocusDialProgress.style.strokeDashoffset` resets to `0` (or `0.000`), `#popupFocusClock` resets to `25:00`, and `#popupFocusBadge` resets to `25m idle`.

### Scenario 6: Backward Compatibility Guarantee
- **Given:** Automated test suites `tests/test_focus_time_phase1_uiux.js` and `tests/test_focus_time_subsystem.js` execute.
- **When:** Assertion batteries query `#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`, `#popupActiveGoalChip`, and `#txtPopupActiveGoal`.
- **Then:** All elements are found in the DOM within `#viewFocusPane` and all assertions PASS with 100% success.
