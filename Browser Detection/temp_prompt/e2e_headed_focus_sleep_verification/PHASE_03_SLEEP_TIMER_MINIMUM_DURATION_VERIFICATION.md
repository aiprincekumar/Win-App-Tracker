# Phase 03: Interactive Sleep Timer Minimum Duration (1m) Verification

> **Task ID:** `TASK-E2E-HEADED-VERIFY-001`  
> **Phase:** 03 of 04  
> **Target Path:** `temp_prompt/e2e_headed_focus_sleep_verification/PHASE_03_SLEEP_TIMER_MINIMUM_DURATION_VERIFICATION.md`  
> **Lead Role:** Level 4 Frontend / QA Subagent  
> **Authorization Token:** Required (`AUTH-MGR-*`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS`  
> **Tested Feature:** Sleep Timer Subsystem (Minimum Allowable Duration = 1 Minute / 60 Seconds)

---

## 🎯 1. Phase Objective

In the active visible Google Chrome instance, interactively test the Sleep Timer subsystem at its minimum allowable duration of **1 minute (60 seconds)** across both the Dashboard Sleep Sentinel Hub and Popup Sleep Timer Popover. Verify real-time clock rendering, radial dial animation, dynamic action badge text formatting, audio fade-out hook, and auto-pause expiration trigger.

---

## 📋 2. Prerequisites & Input Context

- Headed Chrome instance running with loaded extension (from Phase 01).
- Sleep Subsystem Boundary: `background.js` line 1556 (`mins = isNaN(rawMins) ? 30 : Math.max(1, Math.min(1440, rawMins))`).
- Custom Timer Input Boundary: `popup/popup.html` line 905 (`<input type="number" id="customTimerInput" min="1" max="1440" ...>`).
- DOM Anchors:
  - Dashboard: `#cardSleepSentinelHub`, `#dashSleepDialProgress`, `#dashSleepCountdownDisplay`, `#dashSleepStatusBadge`, `#dashSleepActiveDot`, `#btnExtendSleep5m`, `#btnResetSleepTimer`.
  - Popup: `#btnSleepTimerTrigger`, `#sleepTimerPopover`, `#customTimerInput`, `#btnSetCustomTimer`, `#countdownTimeRemaining`, `#countdownStatusBadge`, `#btnCancelActiveTimer`.

---

## 🔧 3. Surgical Step-by-Step Instructions

1. **Verify Sleep Timer via Popup Mode:**
   - In the Popup tab (`popup/popup.html`), locate `#btnSleepTimerTrigger` and click to open `#sleepTimerPopover`.
   - Confirm popover appears (`aria-hidden` becomes false or `.hidden` is removed).
   - In `#customTimerInput`, input `1` (minimum allowable duration).
   - Click `#btnSetCustomTimer`.
2. **Assert Sleep Countdown & Badge Updates:**
   - Verify `#activeCountdownContainer` is revealed.
   - Assert `#countdownTimeRemaining` shows `01:00` and decrements second-by-second (e.g., `00:59`, `00:58`, etc.).
   - Verify `#countdownStatusBadge` displays active state.
   - Verify Chrome action badge displays active time representation (`1m` or seconds `<60s`).
3. **Verify Sleep Sentinel Hub Parity in Dashboard:**
   - Switch to Dashboard tab (`dashboard/dashboard.html`).
   - Inspect `#cardSleepSentinelHub`.
   - Confirm `#dashSleepStatusBadge` displays `RUNNING`.
   - Assert `#dashSleepCountdownDisplay` is synchronously counting down.
   - Confirm SVG radial dial `#dashSleepDialProgress` animates its stroke-dashoffset.
4. **Test Extender and State Control:**
   - Click `#btnSleepExtend5m` or trigger `EXTEND_SLEEP_TIMER` (+5 minutes).
   - Assert remaining time increases by 300 seconds.
   - Test Reset / Cancel (`#btnCancelActiveTimer` or `#btnResetSleepTimer`).
   - Confirm state returns cleanly to `IDLE`, dial resets, and action badge clears.
5. **Verify Audio Fade-Out Hook & Expiration Action:**
   - Start 1-minute timer with audio fade enabled (`enableFadeOut: true, fadeDurationSeconds: 30`).
   - Verify that when countdown passes the 30-second threshold, the state machine triggers `FADING` state.
   - Confirm tab auto-pause and mute hooks fire when reaching expiration (`TRIGGERED` state).

---

## 🚫 4. Architectural Constraints & Boundaries

- **Strict Minimum Boundary:** Values `< 1` must clamp to `1` or fail gracefully. Zero negative duration allowed.
- **Trusted Types Safety:** All DOM mutations must strictly preserve zero innerHTML safety.

---

## 📦 5. Deliverables Manifest

- Script update in `tests/qa_headed_interactive_verification.js` covering Battery 3 (Sleep Timer 1m verification).
- Console log output proving 1-minute sleep countdown and FSM state transitions.

---

## 🧪 6. Local Verification Gate

- Run: `node tests/qa_headed_interactive_verification.js`
- **Pass Criteria:**
  - 1m Sleep Timer successfully set and started.
  - Visible countdown ticks down second-by-second.
  - Badge text updates correctly.
  - Reset and expiration transitions execute cleanly with exit code 0.
