# Phase 2: Inactivity Detector, Alarms & Fade/Pause Relay

> **Phase Reference:** `phase_02_inactivity_detector_and_timer.md`  
> **Milestone:** 2 of 5  
> **Assigned Role:** Core Background Specialist  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Architecture Standard:** Manifest V3 Non-Persistent Service Worker Architecture  
> **Governing Document:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/TRD.md)  

---

## 🎯 1. Phase Objective

Connect the sleep timer state engine to the physical browser environment. Schedule deterministic wakeups using `chrome.alarms` (`sentinel_sleep_timer_alarm`), implement a resilient multi-tab playback pause dispatcher (`dispatchGlobalMediaAction`), implement linear volume fade-out in [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js), and link `chrome.idle.onStateChanged` with the Inactivity Auto-Sleep Sentinel.

---

## 📦 2. Prerequisites & Inputs

- Completion of Phase 1 (`phase_01_storage_and_state_engine.md`).
- Active state machine models in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js).
- Ensure all modifications maintain UTF-8 with BOM standard (`0xEF, 0xBB, 0xBF`).

---

## 🔗 3. Technical Context & File Anchors

- **Target File 1:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L1880-L1910)
  - Anchor: `browserAPI.alarms.onAlarm.addListener` (add sleep timer alarm handler).
- **Target File 2:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L1860-L1875)
  - Anchor: `browserAPI.idle.onStateChanged.addListener` (integrate inactivity auto-sleep logic).
- **Target File 3:** [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js#L750-L820)
  - Anchor: Message listener handling media actions (`PAUSE_MEDIA`, `FADE_AND_PAUSE`).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Alarm Scheduling in `background.js`
In [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
Implement `scheduleSleepTimerAlarms(state)`:
```javascript
const SLEEP_ALARM_NAME = 'sentinel_sleep_timer_alarm';
const SLEEP_FADE_ALARM_NAME = 'sentinel_sleep_fade_alarm';

async function scheduleSleepTimerAlarms(state) {
  try {
    await browserAPI.alarms.clear(SLEEP_ALARM_NAME);
    await browserAPI.alarms.clear(SLEEP_FADE_ALARM_NAME);

    if (state.state !== 'RUNNING') return;

    const now = Date.now();
    const remainingMs = state.targetTime - now;

    if (remainingMs <= 0) {
      await triggerSleepTimerExpiration();
      return;
    }

    // Schedule final cutoff alarm
    browserAPI.alarms.create(SLEEP_ALARM_NAME, { when: state.targetTime });

    // Schedule fade alarm if enabled
    if (state.enableFadeOut && remainingMs > (state.fadeDurationSeconds * 1000)) {
      const fadeTarget = state.targetTime - (state.fadeDurationSeconds * 1000);
      browserAPI.alarms.create(SLEEP_FADE_ALARM_NAME, { when: fadeTarget });
    }
  } catch (err) {
    console.error('[MediaSentinel] Error scheduling sleep alarms:', err);
  }
}
```
Update `setSleepTimer()` from Phase 1 to call `await scheduleSleepTimerAlarms(sleepTimerState)`.
Update `cancelSleepTimer()` to clear both alarms via `browserAPI.alarms.clear()`.

### Step 2.2: Alarm Expiration & Fade Dispatchers in `background.js`
In `browserAPI.alarms.onAlarm.addListener` in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
```javascript
if (alarm.name === SLEEP_ALARM_NAME) {
  await triggerSleepTimerExpiration();
} else if (alarm.name === SLEEP_FADE_ALARM_NAME) {
  await triggerSleepTimerFade();
}
```
Implement `triggerSleepTimerExpiration()`:
```javascript
async function triggerSleepTimerExpiration() {
  await ensureStorageLoaded();
  console.info('[MediaSentinel] 🌙 Sleep timer expired! Pausing media streams and freezing counters.');

  sleepTimerState.state = 'TRIGGERED';
  sleepTimerState.triggeredAt = Date.now();
  await saveSleepTimerState();

  // Clear badge
  clearBadgeCountdown();

  // Broadcast global pause to all media tabs
  if (sleepTimerState.pauseMedia) {
    await dispatchGlobalMediaAction('PAUSE_ALL');
  }

  // Freeze active tracking intervals
  if (sleepTimerState.pauseTracking) {
    commitActiveInterval();
    scheduleStorageSave(true);
  }

  // Notify frontend views
  safeSendRuntimeMessage({
    action: 'SLEEP_TIMER_EXPIRED',
    state: sleepTimerState
  });
}

async function triggerSleepTimerFade() {
  await ensureStorageLoaded();
  if (sleepTimerState.state !== 'RUNNING') return;
  sleepTimerState.state = 'FADING';
  await saveSleepTimerState();

  // Send fade instruction to active media tabs
  for (const [tabId, session] of activeMediaSessions.entries()) {
    if (session.isPlaying) {
      safeSendTabMessage(tabId, {
        action: 'FADE_AND_PAUSE',
        fadeDurationSeconds: sleepTimerState.fadeDurationSeconds
      });
    }
  }
}
```

### Step 2.3: Global Multi-Tab Media Dispatcher
Implement `dispatchGlobalMediaAction(command)` in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
```javascript
async function dispatchGlobalMediaAction(command = 'TOGGLE') {
  let anyPlaying = false;
  for (const session of activeMediaSessions.values()) {
    if (session.isPlaying) {
      anyPlaying = true;
      break;
    }
  }

  const targetAction = (command === 'PAUSE_ALL' || (command === 'TOGGLE' && anyPlaying)) ? 'PAUSE' : 'RESUME';

  for (const [tabId, session] of activeMediaSessions.entries()) {
    if (targetAction === 'PAUSE' && session.isPlaying) {
      session.isPlaying = false;
      safeSendTabMessage(tabId, { action: 'PAUSE_MEDIA' });
    } else if (targetAction === 'RESUME' && !session.isPlaying) {
      session.isPlaying = true;
      session.lastHeartbeat = Date.now();
      safeSendTabMessage(tabId, { action: 'RESUME_MEDIA' });
    }
  }

  return { success: true, actionExecuted: targetAction };
}
```
Add runtime message handler for `'TOGGLE_GLOBAL_MEDIA'` invoking `dispatchGlobalMediaAction(message.command)`.

### Step 2.4: Volume Fade Attenuation in `content_media.js`
In [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js):
Add message listener handling `FADE_AND_PAUSE`:
```javascript
let fadeIntervalId = null;

function executeSmoothFadeAndPause(fadeDurationSec = 30) {
  const mediaElements = Array.from(document.querySelectorAll('video, audio')).filter(el => !el.paused);
  if (mediaElements.length === 0) return;

  if (fadeIntervalId) clearInterval(fadeIntervalId);

  const steps = 15;
  const stepIntervalMs = (fadeDurationSec * 1000) / steps;
  let currentStep = 0;

  // Cache initial volumes
  const initialVolumes = mediaElements.map(el => ({ el, vol: el.volume }));

  fadeIntervalId = setInterval(() => {
    currentStep++;
    const factor = Math.max(0, 1 - (currentStep / steps));

    initialVolumes.forEach(({ el, vol }) => {
      try {
        el.volume = vol * factor;
      } catch (e) {}
    });

    if (currentStep >= steps) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
      initialVolumes.forEach(({ el, vol }) => {
        try {
          el.pause();
          el.volume = vol; // Restore original volume for when user resumes
        } catch (e) {}
      });
    }
  }, stepIntervalMs);
}
```
Attach to `browserAPI.runtime.onMessage` listener:
```javascript
if (request.action === 'FADE_AND_PAUSE') {
  executeSmoothFadeAndPause(request.fadeDurationSeconds || 30);
  sendResponse({ received: true });
} else if (request.action === 'PAUSE_MEDIA') {
  if (fadeIntervalId) clearInterval(fadeIntervalId);
  document.querySelectorAll('video, audio').forEach(el => {
    try { el.pause(); } catch (e) {}
  });
  sendResponse({ paused: true });
}
```

### Step 2.5: Inactivity Auto-Sleep Sentinel Integration
In `browserAPI.idle.onStateChanged.addListener` in [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js):
```javascript
browserAPI.idle.onStateChanged.addListener(async (newState) => {
  await ensureStorageLoaded();
  if (newState === 'idle' || newState === 'locked') {
    commitActiveInterval();
    isUserActive = false;
    scheduleStorageSave(true);

    // Inactivity Auto-Sleep Check
    if (sleepTimerSettings.enableInactivityAutoSleep) {
      let mediaPlaying = false;
      for (const session of activeMediaSessions.values()) {
        if (session.isPlaying) {
          mediaPlaying = true;
          break;
        }
      }
      if (mediaPlaying) {
        console.info('[MediaSentinel] Inactivity detected while media is streaming. Pausing unattended playback.');
        await dispatchGlobalMediaAction('PAUSE_ALL');
      }
    }
  } else if (newState === 'active') {
    isUserActive = true;
    intervalStartTime = Date.now();
  }
  sendActivityUpdateToHUD();
});
```

---

## 🚫 5. Architectural Constraints & Boundaries

- All `safeSendTabMessage` calls must use `.catch(() => {})` error absorption.
- Volume fade must restore original element volume after pausing so that subsequent resumption plays at original loudness.
- Do NOT modify `popup.html` or `dashboard.html` in this phase.

---

## 📋 6. Deliverables Manifest

1. Updated [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) with alarms scheduler, expiration dispatcher, and idle auto-sleep integration.
2. Updated [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) with `FADE_AND_PAUSE` and `PAUSE_MEDIA` handlers.

---

## 🧪 7. Local Verification Gate

Execute the syntax and manifest integrity suite:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
**Exit Criterion:** Command exits with code 0; all syntax checks pass.
