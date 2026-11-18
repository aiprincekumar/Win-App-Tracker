# 🚀 Phase 1: Sleep Timer Backend Engine & IPC Protocol Stabilization

> **Document Type:** Standalone Phase Instruction Set (Phase 1)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Department:** [`departments_archive/04_backend_systems_dept.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/departments_archive/04_backend_systems_dept.md)  
> **Target Role:** Level 4 Backend Systems Engineer  
> **Assigned Files:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)  

---

## 🎯 1. Phase Objective

Stabilize and complete the background service worker's Sleep Timer Subsystem engine in `background.js`. Specifically:
1. Implement official runtime message handlers for `EXTEND_SLEEP_TIMER`, `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, and `END_OF_VIDEO`.
2. Implement backend helper functions: `extendSleepTimer(extraMinutes)`, `pauseSleepTimer()`, `resumeSleepTimer()`, and `handleEndOfVideoTrigger(tabId)`.
3. Ensure accurate cancellation, recalculation, and rescheduling of MV3 alarms (`sentinel_sleep_timer_alarm`, `sentinel_sleep_fade_alarm`).
4. Persist updated timer states to `chrome.storage.local` under key `sentinel_sleep_timer`.
5. Broadcast real-time state changes (`SLEEP_TIMER_STATE_CHANGED`) to all active frontend views (Popup and Dashboard).

---

## 📋 2. Prerequisites & Inputs

- Read and understand:
  - [`PRD.md`](PRD.md) (INVEST user stories & acceptance contracts).
  - [`TRD.md`](TRD.md) (IPC schemas, alarm formulas & state transitions).
  - Existing `background.js` lines 1260-1455 and lines 4010-4065.

---

## ⚓ 3. Technical Context & File Anchors

- **Target File:** `background.js`
- **Alarm Management Anchor:** Lines ~1264-1292 (`scheduleSleepTimerAlarms(state)`).
- **Timer Execution Anchor:** Lines ~1295-1348 (`triggerSleepTimerExpiration()`, `triggerSleepTimerFade()`).
- **Timer Mutators Anchor:** Lines ~1350-1396 (`setSleepTimer()`, `cancelSleepTimer()`).
- **Runtime Message Dispatcher Anchor:** Lines ~4010-4065 (`msgType === 'SET_SLEEP_TIMER'`, `CANCEL_SLEEP_TIMER`, `GET_SLEEP_TIMER_STATE`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Implement `pauseSleepTimer()` Helper Function
In `background.js`, alongside `cancelSleepTimer()`, add:
```javascript
/**
 * Pauses active sleep timer, preserves remaining time, and cancels pending alarms
 */
async function pauseSleepTimer() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'RUNNING' && sleepTimerState.state !== 'FADING') {
    return { success: false, error: 'Timer is not active', state: sleepTimerState };
  }

  const now = Date.now();
  const remainingMs = Math.max(0, sleepTimerState.targetTime - now);

  try {
    await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
    await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);
  } catch (_) {}

  sleepTimerState = {
    ...sleepTimerState,
    state: 'PAUSED',
    remainingMs: remainingMs,
    pausedAt: now,
    lastUpdated: now
  };

  await saveSleepTimerState();
  clearActionBadge();

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}
```

### Step 1.2: Implement `resumeSleepTimer()` Helper Function
In `background.js`, add:
```javascript
/**
 * Resumes paused sleep timer, calculates new target epoch, and reschedules alarms
 */
async function resumeSleepTimer() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'PAUSED') {
    return { success: false, error: 'Timer is not paused', state: sleepTimerState };
  }

  const now = Date.now();
  const remainingMs = sleepTimerState.remainingMs || (sleepTimerState.durationMinutes * 60 * 1000) || 60000;
  const newTargetTime = now + remainingMs;

  sleepTimerState = {
    ...sleepTimerState,
    state: 'RUNNING',
    startTime: now - ((sleepTimerState.durationMs || 1800000) - remainingMs),
    targetTime: newTargetTime,
    lastUpdated: now
  };
  delete sleepTimerState.remainingMs;
  delete sleepTimerState.pausedAt;

  await saveSleepTimerState();
  await scheduleSleepTimerAlarms(sleepTimerState);

  if (sleepTimerSettings.showBadgeCountdown) {
    updateActionBadge(remainingMs, sleepTimerState.durationMs || remainingMs);
  }

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}
```

### Step 1.3: Implement `extendSleepTimer(extraMinutes)` Helper Function
In `background.js`, add:
```javascript
/**
 * Extends active or paused sleep timer by extra minutes and reschedules alarms
 */
async function extendSleepTimer(extraMinutes) {
  await ensureStorageLoaded();
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd <= 0) {
    return { success: false, error: 'Invalid extraMinutes', state: sleepTimerState };
  }
  const extraMs = minsToAdd * 60 * 1000;
  const now = Date.now();

  if (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING') {
    sleepTimerState.durationMinutes = (sleepTimerState.durationMinutes || 0) + minsToAdd;
    sleepTimerState.durationMs = (sleepTimerState.durationMs || 0) + extraMs;
    sleepTimerState.targetTime += extraMs;
    sleepTimerState.lastUpdated = now;
    if (sleepTimerState.state === 'FADING') {
      sleepTimerState.state = 'RUNNING'; // Return to running if extension pushes out past fade window
    }
    await saveSleepTimerState();
    await scheduleSleepTimerAlarms(sleepTimerState);
  } else if (sleepTimerState.state === 'PAUSED') {
    sleepTimerState.durationMinutes = (sleepTimerState.durationMinutes || 0) + minsToAdd;
    sleepTimerState.durationMs = (sleepTimerState.durationMs || 0) + extraMs;
    sleepTimerState.remainingMs = (sleepTimerState.remainingMs || 0) + extraMs;
    sleepTimerState.lastUpdated = now;
    await saveSleepTimerState();
  } else {
    // If IDLE or CANCELLED, start new timer with minsToAdd
    return await setSleepTimer(minsToAdd);
  }

  safeSendRuntimeMessage({
    type: 'SLEEP_TIMER_STATE_CHANGED',
    action: 'SLEEP_TIMER_STATE_CHANGED',
    state: sleepTimerState
  });

  return { success: true, state: sleepTimerState };
}
```

### Step 1.4: Implement `handleEndOfVideoTrigger(tabId)` Helper Function
In `background.js`, add:
```javascript
/**
 * Triggers immediate sleep expiration if timer has endOfVideo enabled
 */
async function handleEndOfVideoTrigger(tabId) {
  await ensureStorageLoaded();
  if (sleepTimerState.state === 'RUNNING' || sleepTimerState.state === 'FADING') {
    if (sleepTimerState.endOfVideo || sleepTimerSettings.endOfVideo) {
      console.info(`[MediaSentinel] 🎬 End of video reached on tab ${tabId}. Triggering sleep cutoff.`);
      await triggerSleepTimerExpiration();
      return { success: true, triggered: true, state: sleepTimerState };
    }
  }
  return { success: false, triggered: false, state: sleepTimerState };
}
```

### Step 1.5: Register IPC Handlers in `browserAPI.runtime.onMessage`
In `background.js` around line 4030, add handlers for `PAUSE_SLEEP_TIMER`, `RESUME_SLEEP_TIMER`, `EXTEND_SLEEP_TIMER`, and `END_OF_VIDEO`:
```javascript
  if (msgType === 'PAUSE_SLEEP_TIMER' || message.action === 'PAUSE_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await pauseSleepTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'RESUME_SLEEP_TIMER' || message.action === 'RESUME_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const res = await resumeSleepTimer();
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'EXTEND_SLEEP_TIMER' || message.action === 'EXTEND_SLEEP_TIMER') {
    (async () => {
      await ensureStorageLoaded();
      const mins = message.extraMinutes || message.minutes || 15;
      const res = await extendSleepTimer(mins);
      sendResponse(res);
    })();
    return true;
  }

  if (msgType === 'END_OF_VIDEO' || message.action === 'END_OF_VIDEO') {
    (async () => {
      await ensureStorageLoaded();
      const res = await handleEndOfVideoTrigger(sender.tab ? sender.tab.id : null);
      sendResponse(res);
    })();
    return true;
  }
```

---

## 🚫 5. Architectural Constraints & Boundaries

- **Do NOT mutate existing global state variable names** (`sleepTimerState`, `sleepTimerSettings`, `SLEEP_ALARM_NAME`).
- **Do NOT introduce `setTimeout` or `setInterval` for alarm triggers** in `background.js`; MV3 service worker execution must rely strictly on `browserAPI.alarms`.
- **Do NOT modify unrelated IPC handlers** (e.g. tracking, dataHub, audioLab).

---

## 📦 6. Deliverables Manifest

1. `background.js`: Contains `pauseSleepTimer()`, `resumeSleepTimer()`, `extendSleepTimer()`, `handleEndOfVideoTrigger()`, and their corresponding IPC message listeners.
2. Synchronized `safeSendRuntimeMessage` broadcast calls.

---

## 🧪 7. Local Verification Gate

Execute:
```powershell
node -e "const bg = require('./background.js'); console.log('background.js syntax check passed');"
```
and verify exit code 0.
