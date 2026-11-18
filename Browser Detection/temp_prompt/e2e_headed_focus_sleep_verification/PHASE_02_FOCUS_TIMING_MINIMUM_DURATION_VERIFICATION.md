# Phase 02: Interactive Focus Timing Minimum Duration (1m) Verification

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Phase:** 02 of 04  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/PHASE_02_FOCUS_TIMING_MINIMUM_DURATION_VERIFICATION.md`  
> **Lead Role:** Level 4 Frontend / QA Subagent  
> **Authorization Token:** Required (`AUTH-MGR-*`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS`  
> **Tested Feature:** Focus Timing Subsystem (Minimum Duration = 1 Minute / 60 Seconds)

---

## 🎯 1. Phase Objective

In the active visible Google Chrome instance, interactively test the Focus Timing subsystem at its minimum allowable duration of **1 minute (60 seconds)** across both the Dashboard and Popup views. Assert live visual countdown rendering, SVG radial dial progression, pause/resume behavior, and state machine integrity.

---

## 📋 2. Prerequisites & Input Context

- Headed Chrome instance running with loaded extension (from Phase 01).
- Extension Dashboard open at `chrome-extension://${extensionId}/dashboard/dashboard.html`.
- Focus Subsystem Contract: `background.js` line 2013 (`mins = (!isNaN(rawMins) && rawMins > 0) ? rawMins : defMins`).
- DOM Anchors:
  - Dashboard: `#sidebarBtnWellbeing`, `#widgetPomodoroSentinel`, `#dashFocusDialProgress`, `#pomodoroTimeDisplay`, `#btnStartPomodoro`, `#btnPausePomodoro`, `#btnResetPomodoro`, `#pomodoroModeBadge`.
  - Popup: `#cardPopupFocusTimer`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`.

---

## 🔧 3. Surgical Step-by-Step Instructions

1. **Navigate to Wellbeing & Focus View:**
   - In Dashboard tab, click `#sidebarBtnWellbeing`.
   - Wait for `#widgetPomodoroSentinel` to become visible in viewport.
2. **Trigger 1-Minute Focus Block:**
   - Dispatch `START_FOCUS_TIMER` IPC with `durationMinutes: 1, mode: 'focus'`.
   - Verify `#pomodoroModeBadge` text changes to reflect active Focus session.
   - Assert `#pomodoroTimeDisplay` displays `01:00`.
3. **Assert Real-Time Countdown on Visible Screen:**
   - Wait 2-3 seconds and sample `#pomodoroTimeDisplay`.
   - Assert time has visibly decremented (e.g., `00:59`, `00:58`, etc.).
   - Verify SVG dial `#dashFocusDialProgress` has updated its `stroke-dashoffset` from the full circumference (339.292).
4. **Verify Pause and Resume Interactions:**
   - Click `#btnPausePomodoro` or evaluate `PAUSE_FOCUS_TIMER`.
   - Verify state transitions to `PAUSED_FOCUS`.
   - Confirm clock stops ticking while paused.
   - Click `#btnStartPomodoro` or evaluate `RESUME_FOCUS_TIMER`.
   - Confirm countdown resumes.
5. **Verify Popup View Parity:**
   - Open a tab to `chrome-extension://${extensionId}/popup/popup.html`.
   - Inspect `#popupFocusClock` and confirm it matches the active remaining time.
6. **Reset / Complete Session:**
   - Trigger `#btnResetPomodoro` or dispatch `RESET_FOCUS_TIMER`.
   - Assert `#pomodoroTimeDisplay` returns to idle state and badge resets.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Strict Boundary Check:** Verify that values <= 0 or invalid strings are guarded and fallback safely. Minimum allowable valid duration is 1 minute.
- **Zero Layout Shifts:** Verify no layout breakage occurs in `#widgetPomodoroSentinel` during active countdown.

---

## 📦 5. Deliverables Manifest

- Script update in `tests/qa_headed_interactive_verification.js` covering Battery 2 (Focus Timing 1m verification).
- Log output certifying visible countdown and state transitions.

---

## 🧪 6. Local Verification Gate

- Execute runner: `node tests/qa_headed_interactive_verification.js`
- **Pass Criteria:**
  - 1m focus block starts cleanly.
  - Visible countdown ticks on screen.
  - Radial SVG dial animates.
  - Pause, resume, and reset succeed with exit code 0.
