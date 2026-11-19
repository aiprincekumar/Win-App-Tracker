# TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Task Identifier:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Directory Scope:** `temp_prompt/popup_focus_timer_sleep_parity/PRD.md`  
> **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  

---

## 🎯 1. User Persona & Problem Statement

### User Persona
- **Deep Worker & Digital Wellness Power User:** Uses the Chrome extension to maintain intense focus sessions, block distracting websites, and manage pomodoro cycles directly from the popup without needing to keep the full dashboard open.
- **Sleep & Focus Automation Enthusiast:** Highly appreciative of the Bedtime Sentinel (Sleep Timer) controls and expects an identical, intuitive control surface for the Focus Block.

### Problem Statement
In the current extension popup, the Sleep Timer provides a rich control surface:
- Real-time projected target completion time
- Quick increment buttons (`+5m`, `+15m`)
- Quick presets (15m to 120m)
- Custom minute input form
- Start/Pause/Reset controls

In contrast, the Focus Block in the popup only contains a circular dial and two basic buttons (Start/Pause and Reset). Users cannot quickly extend a productive session, trim time from an oversized session (`-5m`), select standard pomodoro durations with a single click, or type a custom focus duration in popup mode.

---

## 📋 2. Functional Requirements (FR)

### FR-1: Quick Actions Row
- **FR-1.1:** Provide a primary Start/Pause/Resume toggle button (`#btnPopupFocusToggle`) with dynamic icon (`▶` / `⏸`) and descriptive text (`Start` / `Pause` / `Resume`).
- **FR-1.2:** Provide a `-5m` decrement button (`#btnPopupFocusReduce5m`) allowing users to subtract 5 minutes from active or paused focus sessions.
- **FR-1.3:** Provide a `+5m` increment button (`#btnPopupFocusExtend5m`) allowing users to add 5 minutes to active or paused focus sessions.
- **FR-1.4:** Provide a `+15m` increment button (`#btnPopupFocusExtend15m`) allowing users to add 15 minutes to active or paused focus sessions.
- **FR-1.5:** Provide a Reset button (`#btnPopupFocusReset`) that resets the timer back to its configured initial state.

### FR-2: Target Finish Time Display
- **FR-2.1:** Display a dedicated target finish time element (`#popupFocusDialFinishTime`) inside the radial dial telemetry overlay.
- **FR-2.2:** When the timer is IDLE or RESET, display `"No active timer"`.
- **FR-2.3:** When the timer is RUNNING or PAUSED, format and display the projected finish time as `"Finish: HH:MM AM/PM"` (e.g. `"Finish: 04:15 PM"`).

### FR-3: Duration Preset Chips Grid
- **FR-3.1:** Render 6 duration preset buttons: `15m`, `25m`, `30m`, `45m`, `50m`, and `60m`.
- **FR-3.2:** Clicking a preset when IDLE updates the duration and displays the new countdown time immediately.
- **FR-3.3:** The currently active duration preset button must receive an `.active` CSS class with an emerald glow highlight.

### FR-4: Custom Duration Input Form
- **FR-4.1:** Provide a numeric input field (`#inputFocusCustomMinutes`) with placeholder `"Min (1-720)"`, `min="1"`, `max="720"`.
- **FR-4.2:** Provide a "Set" button (`#btnSetFocusCustom`) that validates the input, clamps to $1 \le \text{minutes} \le 720$, sets the focus duration, and triggers a confirmation toast.
- **FR-4.3:** Support pressing `Enter` inside `#inputFocusCustomMinutes` to trigger the Set action.

### FR-5: Backend Delta Arithmetic & Clamping
- **FR-5.1:** Update `extendFocusTimer(deltaMinutes)` in `background.js` to support negative delta values (e.g., `-5`).
- **FR-5.2:** Enforce a safety floor: if decrementing would reduce remaining time below 60 seconds (1 minute), clamp to 60 seconds (or 1 minute) to prevent premature expiration or negative countdowns.
- **FR-5.3:** Reschedule Chrome alarms (`FOCUS_TIMER_ALARM_NAME`) and update badge countdowns accordingly.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-1 (Performance):** Zero UI thread blocking; countdown renders via `setInterval(1000)` with $\le 2\text{ms}$ execution overhead per tick.
- **NFR-2 (W3C Trusted Types Compliance):** 100% zero-innerHTML mutations. All element updates must use `textContent`, `setAttribute`, or standard DOM nodes.
- **NFR-3 (Regression Immunity):** 100% pass rate across all existing 83+ automated test suites in `node run_all_tests.js`.
- **NFR-4 (Accessibility):** Full WCAG 2.1 AA compliance: all buttons must have descriptive `title` and `aria-label` attributes; color contrast ratio $\ge 4.5:1$.
- **NFR-5 (File Encoding):** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited files.

---

## 🏆 4. MoSCoW Feature Prioritization

| Priority | Feature Description |
| :--- | :--- |
| **Must Have** | Quick Actions Row with `-5m`, `+5m`, `+15m`, Toggle, Reset. |
| **Must Have** | Target Finish Time readout ("Finish: HH:MM AM/PM" / "No active timer"). |
| **Must Have** | Duration Preset Chips (15m, 25m, 30m, 45m, 50m, 60m) with active state highlighting. |
| **Must Have** | Custom Duration Input Form with validation (1-720 min) and "Set" button. |
| **Must Have** | Background `extendFocusTimer` negative delta handling with $\ge 60\text{s}$ clamping. |
| **Should Have** | Keyboard accessibility (Enter key on custom input). |
| **Should Have** | Toast feedback on time adjustment and custom duration set. |
| **Could Have** | Visual pulse animation on target finish time when time is adjusted. |
| **Won't Have** | Full audio equalizer controls in Focus tab (belongs to Audio Lab). |

---

## 🧪 5. INVEST User Stories & Acceptance Criteria Contracts

### Story 1: On-the-Fly Focus Adjustment
> **As a** user actively in a focus block,  
> **I want to** click `-5m`, `+5m`, or `+15m` in the popup,  
> **So that** I can adjust my remaining focus session dynamically without resetting or losing progress.

#### Acceptance Criteria (Given-When-Then):
- **Scenario 1.1:** Extending an active focus timer by 5 minutes.
  - **Given** an active focus timer is running with 20:00 remaining,
  - **When** the user clicks `#btnPopupFocusExtend5m`,
  - **Then** the remaining time increases to 25:00, the background alarm is pushed forward by 5 minutes, and the target finish time readout updates accordingly.
- **Scenario 1.2:** Decrementing an active focus timer by 5 minutes.
  - **Given** an active focus timer is running with 20:00 remaining,
  - **When** the user clicks `#btnPopupFocusReduce5m`,
  - **Then** the remaining time decreases to 15:00, the background alarm is moved earlier by 5 minutes, and the target finish time readout updates accordingly.
- **Scenario 1.3:** Decrementing near the lower limit.
  - **Given** an active focus timer has 3:00 remaining,
  - **When** the user clicks `#btnPopupFocusReduce5m`,
  - **Then** the remaining time is clamped safely to 1:00 (60 seconds) rather than becoming negative or triggering expiration.

### Story 2: One-Click Duration Selection via Presets
> **As a** user preparing for a focus session,  
> **I want to** select one of the preset chips (e.g. 25m, 45m, 60m),  
> **So that** I don't have to manually configure my standard working intervals.

#### Acceptance Criteria:
- **Given** the focus timer is in IDLE state,
- **When** the user clicks the `45m` preset chip,
- **Then** the clock displays `45:00`, the badge displays `45m`, and the `45m` chip acquires the `.active` class.
