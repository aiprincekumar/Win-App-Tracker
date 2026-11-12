# Phase 1: Storage Schema & Sleep Timer State Engine

> **Phase Reference:** `phase_01_storage_and_state_engine.md`  
> **Milestone:** 1 of 5  
> **Assigned Role:** Core Background Specialist  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Architecture Standard:** Manifest V3 Non-Persistent Service Worker Architecture  
> **Governing Document:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/TRD.md)  

---

## 🎯 1. Phase Objective

Establish the persistent data foundation and state transition engine for the **Web Activity & Media Sentinel** Sleep Timer subsystem. Implement storage serialization in `chrome.storage.local`, initialize in-memory state models in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js), and construct the runtime IPC message router to service `SET_SLEEP_TIMER`, `CANCEL_SLEEP_TIMER`, and `GET_SLEEP_TIMER_STATE` requests from frontend views.

---

## 📦 2. Prerequisites & Inputs

- Verify existing permissions in [`manifest.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/manifest.json) (`alarms`, `idle`, `storage`, `action`).
- Read and adhere to the storage schemas defined in [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/TRD.md) Section 2.
- Ensure all modifications maintain UTF-8 with BOM standard (`0xEF, 0xBB, 0xBF`).

---

## 🔗 3. Technical Context & File Anchors

- **Target File 1:** [`manifest.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/manifest.json#L7-L15)
  - Anchor: `permissions` array (ensure `storage`, `alarms`, `idle` are active).
- **Target File 2:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L210-L240)
  - Anchor: `CONFIG` object definition (add sleep timer configuration constants).
- **Target File 3:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L860-L930)
  - Anchor: Storage loading and synchronization functions (`ensureStorageLoaded`, `saveStorageData`).
- **Target File 4:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L1450-L1600)
  - Anchor: `browserAPI.runtime.onMessage.addListener` handler router.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Verify & Anchor Manifest Permissions
In [`manifest.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/manifest.json):
- Confirm `permissions` includes `"storage"`, `"alarms"`, and `"idle"`.
- Ensure `action` definition supports dynamic badge text and color manipulation.

### Step 1.2: Define Canonical Data Constants & Schemas in `background.js`
In [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
Define immutable default schemas:
```javascript
const DEFAULT_SLEEP_SETTINGS = Object.freeze({
  defaultDurationMinutes: 30,
  enableAudioFadeOut: true,
  fadeDurationSeconds: 30,
  enableInactivityAutoSleep: false,
  inactivityThresholdMinutes: 15,
  showBadgeCountdown: true,
  pulseOnCritical: true
});

const INITIAL_SLEEP_TIMER_STATE = Object.freeze({
  state: 'IDLE', // 'IDLE' | 'RUNNING' | 'PAUSED' | 'FADING' | 'TRIGGERED' | 'CANCELLED'
  durationMinutes: 0,
  durationMs: 0,
  startTime: 0,
  targetTime: 0,
  pauseMedia: true,
  pauseTracking: true,
  enableFadeOut: true,
  fadeDurationSeconds: 30,
  lastUpdated: 0
});

let sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE };
let sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS };
```

### Step 1.3: Implement Storage Persistence & Hydration
Implement storage helper routines in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
```javascript
async function loadSleepTimerData() {
  try {
    const data = await browserAPI.storage.local.get(['sentinel_sleep_timer', 'sentinel_sleep_settings']);
    if (data.sentinel_sleep_settings) {
      sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS, ...data.sentinel_sleep_settings };
    }
    if (data.sentinel_sleep_timer) {
      sleepTimerState = { ...INITIAL_SLEEP_TIMER_STATE, ...data.sentinel_sleep_timer };
      // Check if target time already expired while service worker was inactive
      const now = Date.now();
      if (sleepTimerState.state === 'RUNNING' && sleepTimerState.targetTime <= now) {
        sleepTimerState.state = 'TRIGGERED';
        sleepTimerState.triggeredAt = now;
        await saveSleepTimerState();
      }
    }
  } catch (err) {
    console.error('[MediaSentinel] Failed to load sleep timer storage:', err);
  }
}

async function saveSleepTimerState() {
  try {
    sleepTimerState.lastUpdated = Date.now();
    await browserAPI.storage.local.set({ sentinel_sleep_timer: sleepTimerState });
  } catch (err) {
    console.error('[MediaSentinel] Failed to save sleep timer state:', err);
  }
}

async function saveSleepTimerSettings(newSettings) {
  try {
    sleepTimerSettings = { ...DEFAULT_SLEEP_SETTINGS, ...newSettings };
    await browserAPI.storage.local.set({ sentinel_sleep_settings: sleepTimerSettings });
  } catch (err) {
    console.error('[MediaSentinel] Failed to save sleep settings:', err);
  }
}
```
Hook `loadSleepTimerData()` into `ensureStorageLoaded()` so data is hydrated on startup.

### Step 1.4: Implement State Transition Handlers
In [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
```javascript
async function setSleepTimer(durationMinutes, options = {}) {
  const mins = Math.max(1, Math.min(1440, parseInt(durationMinutes, 10) || 30));
  const now = Date.now();
  const durationMs = mins * 60 * 1000;

  sleepTimerState = {
    state: 'RUNNING',
    durationMinutes: mins,
    durationMs: durationMs,
    startTime: now,
    targetTime: now + durationMs,
    pauseMedia: options.pauseMedia !== undefined ? !!options.pauseMedia : true,
    pauseTracking: options.pauseTracking !== undefined ? !!options.pauseTracking : true,
    enableFadeOut: options.enableFadeOut !== undefined ? !!options.enableFadeOut : sleepTimerSettings.enableAudioFadeOut,
    fadeDurationSeconds: options.fadeDurationSeconds || sleepTimerSettings.fadeDurationSeconds,
    lastUpdated: now
  };

  await saveSleepTimerState();
  updateBadgeCountdown(sleepTimerState);
  return sleepTimerState;
}

async function cancelSleepTimer() {
  sleepTimerState = {
    ...INITIAL_SLEEP_TIMER_STATE,
    state: 'CANCELLED',
    lastUpdated: Date.now()
  };
  await saveSleepTimerState();
  clearBadgeCountdown();
  return { success: true };
}
```

### Step 1.5: Register IPC Actions in Message Listener
In `browserAPI.runtime.onMessage.addListener` in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
Add message handlers for:
- `'SET_SLEEP_TIMER'`: invokes `setSleepTimer(message.durationMinutes, message.options)` and returns `{ success: true, state: sleepTimerState }`.
- `'CANCEL_SLEEP_TIMER'`: invokes `cancelSleepTimer()` and returns `{ success: true }`.
- `'GET_SLEEP_TIMER_STATE'`: returns `{ success: true, state: sleepTimerState, settings: sleepTimerSettings }`.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Out of Scope for Phase 1:** Do NOT modify `popup.html`, `popup.js`, `dashboard.html`, or `dashboard.js` yet.
- **Out of Scope for Phase 1:** Do NOT trigger content-script video pauses yet (reserved for Phase 2).
- **Invariance:** Storage keys must be exactly `sentinel_sleep_timer` and `sentinel_sleep_settings`.
- **Integrity:** Maintain existing telemetry, WebSocket, and Data Hub functions without regression.

---

## 📋 6. Deliverables Manifest

1. Updated [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) with sleep timer schemas, storage methods, state transitions, and IPC message handlers.
2. Verified [`manifest.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/manifest.json) permissions.

---

## 🧪 7. Local Verification Gate

Execute the syntax and manifest integrity suite to ensure zero parse errors and valid manifest schema:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
**Exit Criterion:** Command exits with code 0; all in-memory AST and syntax tests pass with 100% success.
