# 🚀 Phase 2 Execution Prompt: Complete Backend Logic, State Machine, Tracking Algorithms & Storage Persistence

> **Phase:** 2 of 2  
> **Initiative:** Focus Time & Focus Sentinel Subsystem End-to-End Implementation  
> **Container Directory:** [`temp_prompt/focus_time/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subagent Role:** Level 4 Backend & QA Engineer  
> **Department Rule:** Dept 04 Storage & Persistence Engine & Dept 08 QA & Testing  

---

## 🎯 1. Phase Objective

The objective of **Phase 2** is to build the complete, production-grade backend logic, state machine, alarms scheduling, cross-tab media pause relay, daily metrics accumulation, and bidirectional broadcast synchronization for the **Focus Time & Focus Sentinel Subsystem**, accompanied by an exhaustive 8-battery automated test suite.

By the conclusion of Phase 2:
1. Focus sessions will persist across tab closures, refreshes, and service worker sleep/wake cycles via `chrome.alarms` and `chrome.storage.local`.
2. Starting a focus session will dispatch media pause commands to all playing tabs.
3. Completing a focus block will synthesize a gentle harmonic Web Audio chime (528 Hz / 660 Hz), increment daily focus metrics, and transition to break mode.
4. All client surfaces (Dashboard Hero Card, Tab A KPI Grid, Sidebar HUD, and Popup Mini-Timer) will reflect identical synchronized state.
5. The complete subsystem will be certified by `tests/test_focus_time_subsystem.js` with 100% passing tests and exit code 0.

---

## 🔗 2. File Context & Line Anchors

- [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) — Service worker runtime, alarms listener, and message router.
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) — Dashboard client controller and storage listeners.
- [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) — Popup mini-timer client controller.
- [`src/dashboard/features/wellbeing_blacklist_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/wellbeing_blacklist_feature.js#L369-L450) — Legacy Pomodoro controller to be replaced or enhanced with IPC bridge.
- [`tests/test_focus_time_subsystem.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_focus_time_subsystem.js) — New dedicated test suite.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Define Schemas, Constants & Initial State in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
1. Add Focus Timer constants:
   ```javascript
   const FOCUS_TIMER_ALARM_NAME = 'sentinel_focus_timer_alarm';
   const FOCUS_BREAK_ALARM_NAME = 'sentinel_focus_break_alarm';

   const DEFAULT_FOCUS_SETTINGS = Object.freeze({
     focusDurationMinutes: 25,
     shortBreakMinutes: 5,
     longBreakMinutes: 15,
     sessionsBeforeLongBreak: 4,
     autoPauseMedia: true,
     soundChime: true,
     autoStartBreak: false,
     autoStartNextFocus: false,
     showBadgeCountdown: true
   });

   const INITIAL_FOCUS_TIMER_STATE = Object.freeze({
     state: 'IDLE', // 'IDLE' | 'RUNNING_FOCUS' | 'PAUSED_FOCUS' | 'RUNNING_BREAK' | 'PAUSED_BREAK' | 'COMPLETED'
     mode: 'focus', // 'focus' | 'break'
     durationMinutes: 25,
     remainingSeconds: 1500,
     targetTime: null,
     sessionStartedAt: null,
     pausedAt: null,
     completedSessionsToday: 0,
     autoPauseMedia: true,
     soundChime: true,
     updatedAt: Date.now()
   });
   ```
2. Initialize runtime memory variables:
   ```javascript
   let focusTimerState = { ...INITIAL_FOCUS_TIMER_STATE };
   let focusTimerSettings = { ...DEFAULT_FOCUS_SETTINGS };
   ```
3. Hydrate state in `hydrateFromStorage()`:
   - Read keys: `'sentinel_focus_timer'`, `'sentinel_focus_settings'`, `'daily_focus_metrics'`.
   - If `sentinel_focus_timer` is present and state is `RUNNING_FOCUS`, calculate `remainingSeconds = Math.max(0, Math.round((targetTime - Date.now()) / 1000))`. If targetTime has elapsed while dormant, trigger the alarm completion handler immediately.

---

### Step 2.2: Implement `FocusTimerEngine` & FSM in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
Implement the core lifecycle functions:
1. `startFocusTimer(durationMinutes, mode = 'focus')`:
   - `durationMinutes = durationMinutes || focusTimerSettings.focusDurationMinutes;`
   - `const durationMs = durationMinutes * 60 * 1000;`
   - `const now = Date.now();`
   - `const targetTime = now + durationMs;`
   - `focusTimerState = { ...focusTimerState, state: mode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK', mode, durationMinutes, remainingSeconds: durationMinutes * 60, targetTime, sessionStartedAt: now, pausedAt: null, updatedAt: now };`
   - Schedule alarm: `chrome.alarms.create(mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME, { when: targetTime });`
   - If `focusTimerState.autoPauseMedia`, execute `pauseAllMediaTabs()`.
   - Persist to storage and broadcast `FOCUS_TIMER_STATE_CHANGED`.
2. `pauseFocusTimer()`:
   - Compute `remainingSeconds = Math.max(0, Math.round((focusTimerState.targetTime - Date.now()) / 1000));`
   - Clear alarms: `chrome.alarms.clear(FOCUS_TIMER_ALARM_NAME); chrome.alarms.clear(FOCUS_BREAK_ALARM_NAME);`
   - Update `focusTimerState.state = focusTimerState.mode === 'focus' ? 'PAUSED_FOCUS' : 'PAUSED_BREAK';`
   - Update `focusTimerState.pausedAt = Date.now(); focusTimerState.remainingSeconds = remainingSeconds; focusTimerState.targetTime = null;`
   - Persist and broadcast state.
3. `resumeFocusTimer()`:
   - Compute `targetTime = Date.now() + focusTimerState.remainingSeconds * 1000;`
   - Arm alarm: `chrome.alarms.create(focusTimerState.mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME, { when: targetTime });`
   - Update `focusTimerState.state = focusTimerState.mode === 'focus' ? 'RUNNING_FOCUS' : 'RUNNING_BREAK';`
   - Update `focusTimerState.targetTime = targetTime; focusTimerState.pausedAt = null;`
   - Persist and broadcast state.
4. `extendFocusTimer(extraMinutes)`:
   - Add extra seconds: `focusTimerState.remainingSeconds += extraMinutes * 60;`
   - If running: `focusTimerState.targetTime += extraMinutes * 60000;` Reschedule alarm: `chrome.alarms.create(..., { when: focusTimerState.targetTime });`
   - Persist and broadcast state.
5. `resetFocusTimer()`:
   - Clear all alarms.
   - Restore initial state with default preset duration.
   - Persist and broadcast state.

---

### Step 2.3: Implement IPC Message Router Handlers in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
Inside `chrome.runtime.onMessage.addListener`, add cases for:
- `START_FOCUS_TIMER` -> calls `startFocusTimer()`
- `PAUSE_FOCUS_TIMER` -> calls `pauseFocusTimer()`
- `RESUME_FOCUS_TIMER` -> calls `resumeFocusTimer()`
- `RESET_FOCUS_TIMER` -> calls `resetFocusTimer()`
- `EXTEND_FOCUS_TIMER` -> calls `extendFocusTimer(msg.extraMinutes)`
- `GET_FOCUS_TIMER_STATE` -> returns current state, settings, and today's accumulated focus metrics
- `SAVE_FOCUS_SETTINGS` -> updates `focusTimerSettings`, saves to storage
- `GET_FOCUS_METRICS` -> returns `daily_focus_metrics`

---

### Step 2.4: Implement Cross-Tab Media Pausing in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
```javascript
async function pauseAllMediaTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url || isRestrictedTabUrl(tab.url)) continue;
      safeSendTabMessage(tab.id, { action: 'PAUSE' });
    }
  } catch (err) {
    console.warn('[FocusSentinel] Media pause dispatch error:', err);
  }
}
```

---

### Step 2.5: Implement Alarm Completion & Daily Metrics Accumulation in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)
Inside `chrome.alarms.onAlarm.addListener`:
```javascript
if (alarm.name === FOCUS_TIMER_ALARM_NAME) {
  handleFocusTimerExpired();
} else if (alarm.name === FOCUS_BREAK_ALARM_NAME) {
  handleFocusBreakExpired();
}
```
In `handleFocusTimerExpired()`:
1. Calculate today's date key: `const todayKey = new Date().toISOString().split('T')[0];`
2. Increment `daily_focus_metrics`:
   - Add `focusTimerState.durationMinutes * 60` seconds to `daily_focus_metrics[todayKey].totalFocusSeconds`.
   - Increment `completedSessions`.
   - Append to `sessionHistory`.
   - Save to `chrome.storage.local`.
3. If notification enabled: `chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🧘 Focus Block Completed!', message: 'Great job! Time to take a restful break.' });`
4. Transition state to `RUNNING_BREAK` (if `autoStartBreak`) or `COMPLETED`.
5. Broadcast `FOCUS_TIMER_COMPLETED` and `FOCUS_TIMER_STATE_CHANGED`.

---

### Step 2.6: Frontend Bidirectional Sync & Web Audio Chime in [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) and [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
1. In `dashboard/dashboard.js`:
   - Replace local `setInterval` with runtime messages:
     * Clicking Start sends `START_FOCUS_TIMER`.
     * Clicking Pause sends `PAUSE_FOCUS_TIMER`.
     * Clicking Resume sends `RESUME_FOCUS_TIMER`.
     * Clicking Reset sends `RESET_FOCUS_TIMER`.
     * Clicking +5m/+15m sends `EXTEND_FOCUS_TIMER`.
   - Listen for `chrome.storage.onChanged`:
     * When `sentinel_focus_timer` changes, update dial progress, clock, finish time, and status badges.
     * When `daily_focus_metrics` changes, update `#trackMetricFocusTime` and `#trackMetricFocusSessions` in Tab A.
   - Implement `playSyntheticFocusChime()` with Web Audio API (528 Hz / 660 Hz).
2. In `popup/popup.js`:
   - Hook `#btnPopupFocusToggle` to send `START_FOCUS_TIMER` / `PAUSE_FOCUS_TIMER` / `RESUME_FOCUS_TIMER`.
   - Listen for `chrome.storage.onChanged` to keep `#popupFocusClock` and `#popupFocusBadge` in sync.

---

### Step 2.7: Comprehensive 8-Battery Test Suite Creation in [`tests/test_focus_time_subsystem.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_focus_time_subsystem.js)
Author an automated test suite executed via Node.js containing 8 test batteries:
- **Battery 1: Finite State Machine Transitions:** Tests transitions from IDLE -> RUNNING_FOCUS -> PAUSED_FOCUS -> RESUME -> COMPLETED -> RUNNING_BREAK -> IDLE.
- **Battery 2: IPC Message Handlers Contract:** Verifies message handlers respond with valid payloads for START, PAUSE, RESUME, RESET, EXTEND, and GET_STATE.
- **Battery 3: Alarm Rescheduling & Epoch Math Invariants:** Verifies `targetTime = now + remainingMs`, alarm creation with exact epoch timestamps, and zero-drift duration rehydration.
- **Battery 4: SVG Radial Dial Mathematical Offset Calculation:** Tests formula `offset = 339.292 * (1 - remaining / total)` across 100%, 75%, 50%, 25%, and 0% remaining time.
- **Battery 5: Dashboard DOM Structure & Bento Cards:** Verifies `#widgetPomodoroSentinel`, `dashFocusDialProgress`, `#pomodoroTimeDisplay`, `#cardFocusAnalytics`, and sidebar HUD elements in `dashboard.html`.
- **Battery 6: Popup DOM Structure Integrity:** Verifies `#cardPopupFocusTimer`, `#popupFocusClock`, and action buttons in `popup.html`.
- **Battery 7: Daily Focus Metrics & Storage Persistence:** Tests accumulation of completed session seconds and session count increments in `daily_focus_metrics`.
- **Battery 8: Zero innerHTML & W3C Trusted Types Audit:** Asserts 0 assignments to `.innerHTML` in all modified Focus Time routines across `background.js`, `dashboard.js`, and `popup.js`.

---

## 🚫 4. Strict Scope Boundaries & Out-of-Scope Declarations

- **Sleep Sentinel Hub (`#cardSleepSentinelHub`):** DO NOT modify or overwrite sleep alarms, sleep settings, or sleep dial logic.
- **Doomscroll Breaker (`#doomscrollBreakerCard`):** DO NOT modify doomscroll interval checking or nudge alarms.
- **Domain Budgets & Tracking Blacklist:** DO NOT modify budget checking routines or blacklist filtering.
- **Media Deck & Audio Lab:** DO NOT modify any equalizer filters, visualizers, or media playback logs.

---

## 📦 5. Deliverables Manifest

1. Updated [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) with `FocusTimerEngine`, alarms, IPC handlers, media pause, and storage schemas.
2. Updated [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) wired to IPC messages, storage listeners, and Web Audio chime.
3. Updated [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) wired to IPC messages and storage listeners.
4. New comprehensive test suite [`tests/test_focus_time_subsystem.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_focus_time_subsystem.js) with 8 batteries.

---

## 🧪 6. Local Verification Gate

Execute the following commands before requesting Phase 2 signoff:
1. **Focus Time Subsystem Test Battery:**
   ```bash
   node tests/test_focus_time_subsystem.js
   ```
   *Pass Criterion:* Exit code 0, 8 of 8 batteries pass (100% success).
2. **Full Extension Syntax, Manifest & File Integrity Suite:**
   ```bash
   node tests/test_syntax_and_manifest_integrity.js
   ```
   *Pass Criterion:* Exit code 0, all 15 tests pass with 0 parse errors.
