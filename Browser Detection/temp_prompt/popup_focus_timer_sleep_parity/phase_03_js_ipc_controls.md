# Phase 3: JavaScript State & IPC Controls Specification

> **Phase Identifier:** `PHASE-03-JS-IPC-CONTROLS`  
> **Parent Task:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Target Subagent:** Level 4 Fullstack / IPC Subagent (`fullstack_engineer`)  
> **Target Files:** `popup/popup.js`, `background.js`  
> **Lead Department:** Department 05 (Frontend Engineering) & Department 02 (Architecture & Systems)  

---

## 🎯 1. Phase Objective

Connect all Focus Block interactive elements to state management and IPC messaging:
1. Support negative delta (`-5m`) with safe clamping ($\ge 60\text{s}$) in `background.js` `extendFocusTimer()`.
2. Connect `#btnPopupFocusReduce5m`, `#btnPopupFocusExtend5m`, `#btnPopupFocusExtend15m`, and `#btnPopupFocusReset` in `popup/popup.js`.
3. Upgrade `#btnPopupFocusToggle` to update `#btnPopupFocusToggleIcon` and `#btnPopupFocusToggleText`.
4. Implement preset chip click listeners with `.active` highlight synchronization.
5. Implement Custom Duration input handler (`#inputFocusCustomMinutes` + `#btnSetFocusCustom`).
6. Dynamically compute and format Target Finish Time (`#popupFocusDialFinishTime`) on every tick and state change.
7. Maintain 100% W3C Trusted Types zero-innerHTML safety.

---

## 🛠️ 2. Background Service Worker Refactoring (`background.js`)

Locate `async function extendFocusTimer(extraMinutes = 5)` in `background.js` (~line 2143):

```javascript
async function extendFocusTimer(extraMinutes = 5) {
  await ensureStorageLoaded();
  const minsToAdd = parseInt(extraMinutes, 10);
  if (isNaN(minsToAdd) || minsToAdd === 0) {
    return { success: false, error: 'Invalid extraMinutes', state: focusTimerState };
  }

  const extraSec = minsToAdd * 60;
  const currentSec = focusTimerState.remainingSeconds || (focusTimerState.durationMinutes || 25) * 60;
  const newSec = Math.max(60, currentSec + extraSec); // Enforce minimum 60s floor
  
  focusTimerState.remainingSeconds = newSec;
  focusTimerState.durationMinutes = Math.max(1, Math.round(newSec / 60));

  const now = Date.now();
  if (focusTimerState.state === 'RUNNING_FOCUS' || focusTimerState.state === 'RUNNING_BREAK') {
    focusTimerState.targetTime = now + (newSec * 1000);
    try {
      await browserAPI.alarms.clear(FOCUS_TIMER_ALARM_NAME);
      await browserAPI.alarms.clear(FOCUS_BREAK_ALARM_NAME);
    } catch (_) {}
    try {
      browserAPI.alarms.create(
        focusTimerState.mode === 'focus' ? FOCUS_TIMER_ALARM_NAME : FOCUS_BREAK_ALARM_NAME,
        { when: focusTimerState.targetTime }
      );
    } catch (_) {}
    if (focusTimerSettings.showBadgeCountdown) {
      updateFocusActionBadge(focusTimerState.targetTime - now);
    }
  }

  await saveFocusTimerState();
  broadcastFocusTimerState('FOCUS_TIMER_STATE_CHANGED');
  return { success: true, state: focusTimerState };
}
```

---

## 🛠️ 3. Popup View Controller Updates (`popup/popup.js`)

Locate the Focus Controller section around lines 3390-3560:

### 3.1 DOM Element References
```javascript
  const btnPopupFocusToggle = document.getElementById('btnPopupFocusToggle');
  const btnPopupFocusToggleIcon = document.getElementById('btnPopupFocusToggleIcon');
  const btnPopupFocusToggleText = document.getElementById('btnPopupFocusToggleText');
  const btnPopupFocusReduce5m = document.getElementById('btnPopupFocusReduce5m');
  const btnPopupFocusExtend5m = document.getElementById('btnPopupFocusExtend5m');
  const btnPopupFocusExtend15m = document.getElementById('btnPopupFocusExtend15m');
  const btnPopupFocusReset = document.getElementById('btnPopupFocusReset');
  const popupFocusDialFinishTime = document.getElementById('popupFocusDialFinishTime');
  const inputFocusCustomMinutes = document.getElementById('inputFocusCustomMinutes');
  const btnSetFocusCustom = document.getElementById('btnSetFocusCustom');
  const focusPresetButtons = document.querySelectorAll('.focus-tab-preset-btn');
```

### 3.2 Target Finish Time Formatter
```javascript
  function formatPopupFocusFinishTime(targetTime, isRunning, isPaused) {
    if (!popupFocusDialFinishTime) return;
    if (!isRunning && !isPaused) {
      popupFocusDialFinishTime.textContent = 'No active timer';
      return;
    }
    if (!targetTime || targetTime <= Date.now()) {
      popupFocusDialFinishTime.textContent = 'Finishing soon...';
      return;
    }
    const d = new Date(targetTime);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    popupFocusDialFinishTime.textContent = `Finish: ${hours}:${minutes} ${ampm}`;
  }
```

### 3.3 Dynamic Active Preset Highlighting
```javascript
  function updateFocusPresetHighlights(currentMinutes) {
    const mins = currentMinutes || popupFocusBackendState.durationMinutes || 25;
    document.querySelectorAll('.focus-tab-preset-btn').forEach(btn => {
      const btnMins = parseInt(btn.getAttribute('data-minutes'), 10);
      btn.classList.toggle('active', btnMins === mins);
    });
  }
```

### 3.4 Button Event Listeners & Time Adjustment
```javascript
  function adjustPopupFocusMinutes(deltaMinutes) {
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
      browserAPI.runtime.sendMessage({
        action: 'EXTEND_FOCUS_TIMER',
        extraMinutes: deltaMinutes
      }, (res) => {
        if (res && res.state) {
          syncPopupFocusState(res.state);
          const sign = deltaMinutes > 0 ? `+${deltaMinutes}` : `${deltaMinutes}`;
          showPopupToast(`Focus time adjusted: ${sign}m`);
        }
      });
    }
  }

  if (btnPopupFocusReduce5m) {
    btnPopupFocusReduce5m.addEventListener('click', () => adjustPopupFocusMinutes(-5));
  }
  if (btnPopupFocusExtend5m) {
    btnPopupFocusExtend5m.addEventListener('click', () => adjustPopupFocusMinutes(5));
  }
  if (btnPopupFocusExtend15m) {
    btnPopupFocusExtend15m.addEventListener('click', () => adjustPopupFocusMinutes(15));
  }

  // Presets Handlers
  document.querySelectorAll('.focus-tab-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.getAttribute('data-minutes'), 10);
      if (!mins) return;
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
        browserAPI.runtime.sendMessage({
          action: 'START_FOCUS_TIMER',
          durationMinutes: mins,
          mode: 'focus'
        }, (res) => {
          if (res && res.state) {
            syncPopupFocusState(res.state);
            showPopupToast(`Focus started: ${mins}m`);
          }
        });
      }
    });
  });

  // Custom Duration Handler
  const handleSetFocusCustom = () => {
    if (!inputFocusCustomMinutes) return;
    const rawVal = parseInt(inputFocusCustomMinutes.value, 10);
    if (isNaN(rawVal) || rawVal < 1) {
      showPopupToast('Enter valid duration (1-720 min)');
      return;
    }
    const mins = Math.min(720, rawVal);
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.sendMessage) {
      browserAPI.runtime.sendMessage({
        action: 'START_FOCUS_TIMER',
        durationMinutes: mins,
        mode: 'focus'
      }, (res) => {
        if (res && res.state) {
          syncPopupFocusState(res.state);
          showPopupToast(`Focus set: ${mins}m`);
        }
      });
    }
  };

  if (btnSetFocusCustom) {
    btnSetFocusCustom.addEventListener('click', handleSetFocusCustom);
  }
  if (inputFocusCustomMinutes) {
    inputFocusCustomMinutes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSetFocusCustom();
    });
  }
```

### 3.5 Button Label & Icon Synchronization in `updatePopupFocusBadgesAndButtons`
```javascript
  if (btnPopupFocusToggle) {
    if (isRunning) {
      if (btnPopupFocusToggleIcon) btnPopupFocusToggleIcon.textContent = '⏸';
      if (btnPopupFocusToggleText) btnPopupFocusToggleText.textContent = 'Pause';
      btnPopupFocusToggle.title = 'Pause Focus';
    } else if (isPaused) {
      if (btnPopupFocusToggleIcon) btnPopupFocusToggleIcon.textContent = '▶';
      if (btnPopupFocusToggleText) btnPopupFocusToggleText.textContent = 'Resume';
      btnPopupFocusToggle.title = 'Resume Focus';
    } else {
      if (btnPopupFocusToggleIcon) btnPopupFocusToggleIcon.textContent = '▶';
      if (btnPopupFocusToggleText) btnPopupFocusToggleText.textContent = 'Start';
      btnPopupFocusToggle.title = 'Start Focus';
    }
  }
```

---

## 🔒 4. W3C Trusted Types & Rule 28 Compliance
- Zero `innerHTML` property assignments.
- All dynamic text updates must use `.textContent`.
- Helper functions must remain $\le 50$ lines with nesting depth $\le 3$.
