# ⚡ Phase 3: Dashboard Hub Logic, SVG Dial & Bidirectional State Sync

> **Document Type:** Standalone Phase Instruction Set (Phase 3)  
> **Initiative:** Sleep Timer Subsystem Backend Engine & Dashboard Hub  
> **Container Directory:** [`temp_prompt/sleep_backend_and_dashboard_hub/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Department:** [`departments_archive/05_frontend_engineering_dept.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/departments_archive/05_frontend_engineering_dept.md)  
> **Target Role:** Level 4 Frontend Engineer  
> **Assigned Files:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js), [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  

---

## 🎯 1. Phase Objective

Implement full interactive logic, radial countdown dial animation, and real-time bidirectional state synchronization in `dashboard/dashboard.js`.

Key deliverables:
1. Initialize the Sleep Sentinel Hub controller `initSleepSentinelHub()` on dashboard load.
2. Bind interactive events to duration presets (15-120m), extenders (+5m, +15m), Start/Pause/Resume toggle (`#btnDashSleepToggle`), Reset button (`#btnDashSleepReset`), and feature checkboxes (`#toggleDashSleepFade`, `#toggleDashSleepEndOfVideo`).
3. Implement `renderDashSleepTimer(timer)` and `updateDashSleepDial(remainingMs, totalMs, isRunning, isPaused, isFading)` using exact mathematical offset formulas ($C = 339.292$).
4. Implement a 1-second active ticker interval when timer state is `RUNNING` or `FADING`.
5. Listen to `chrome.storage.onChanged` on key `sentinel_sleep_timer` to immediately synchronize UI when timer changes occur from popup or background.
6. Listen to `chrome.runtime.onMessage` for `SLEEP_TIMER_STATE_CHANGED` and `SLEEP_TIMER_EXPIRED`.
7. Harmonize `popup/popup.js` pause/resume/extend actions to send standard runtime messages to `background.js`.

---

## 📋 2. Prerequisites & Inputs

- Read and understand:
  - [`TRD.md`](TRD.md) (IPC message formats & storage contracts).
  - [`DESIGN.md`](DESIGN.md) (Geometry: $r=54$, $C=339.292$, stroke-dashoffset formulas).
  - Existing `dashboard/dashboard.js` structure and initialization hooks.

---

## ⚓ 3. Technical Context & File Anchors

- **Target File:** `dashboard/dashboard.js`
- **Controller Initialization Anchor:** In `DOMContentLoaded` or main dashboard initialization pipeline (where `initAudioLab()` and `initWellbeing()` are wired).
- **Popup File:** `popup/popup.js`
- **Popup Event Handlers Anchor:** Lines ~2540-2585 and ~3718-3755.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Add Sleep Sentinel Hub Module in `dashboard/dashboard.js`
In `dashboard/dashboard.js`, author the self-contained Sleep Sentinel Hub controller:

```javascript
// =============================================================================
// Sleep Sentinel Hub & Radial Dial Controller (Dashboard Wellbeing Pane)
// =============================================================================
const DASH_SLEEP_CIRCUMFERENCE = 339.292; // 2 * Math.PI * 54
let currentDashSleepTimer = null;
let dashSleepTickerInterval = null;
let selectedDashSleepMinutes = 30;

/**
 * Updates SVG radial progress circle stroke-dashoffset and color
 */
function updateDashSleepDial(remainingMs, totalDurationMs, isRunning, isPaused, isFading) {
  const circle = document.getElementById('dashSleepDialProgress');
  if (!circle) return;

  if (totalDurationMs <= 0 || remainingMs <= 0 || (!isRunning && !isPaused && !isFading)) {
    circle.setAttribute('stroke-dashoffset', String(DASH_SLEEP_CIRCUMFERENCE));
    circle.style.stroke = '#38bdf8';
    return;
  }

  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));
  const offset = DASH_SLEEP_CIRCUMFERENCE * (1 - ratio);
  circle.setAttribute('stroke-dashoffset', String(offset.toFixed(2)));

  if (isFading) {
    circle.style.stroke = '#c084fc';
  } else if (isPaused) {
    circle.style.stroke = '#fbbf24';
  } else if (ratio < 0.15) {
    circle.style.stroke = '#ef4444';
  } else if (ratio < 0.5) {
    circle.style.stroke = '#eab308';
  } else {
    circle.style.stroke = '#38bdf8';
  }
}

/**
 * Renders sleep timer state into the dashboard hub DOM elements
 */
function renderDashSleepTimer(timer) {
  currentDashSleepTimer = timer || { state: 'IDLE' };
  const countdownEl = document.getElementById('dashSleepCountdownDisplay');
  const finishTimeEl = document.getElementById('dashSleepFinishTime');
  const badgeEl = document.getElementById('dashSleepStatusBadge');
  const activeDot = document.getElementById('dashSleepActiveDot');
  const btnToggle = document.getElementById('btnDashSleepToggle');
  const btnToggleIcon = document.getElementById('btnDashSleepToggleIcon');
  const btnToggleText = document.getElementById('btnDashSleepToggleText');

  const isIdle = !timer || timer.state === 'IDLE' || timer.state === 'CANCELLED' || !timer.targetTime;

  if (isIdle) {
    if (countdownEl) countdownEl.textContent = '00:00';
    if (finishTimeEl) finishTimeEl.textContent = 'No active timer';
    if (badgeEl) {
      badgeEl.textContent = 'IDLE';
      badgeEl.className = 'dash-sleep-badge idle';
    }
    if (activeDot) activeDot.classList.add('hidden');
    if (btnToggleIcon) btnToggleIcon.textContent = '▶️';
    if (btnToggleText) btnToggleText.textContent = 'Start Sleep Timer';
    if (btnToggle) btnToggle.className = 'btn-sleep-primary';
    updateDashSleepDial(0, 1, false, false, false);
    stopDashSleepTicker();
    return;
  }

  const now = Date.now();
  const isPaused = timer.state === 'PAUSED';
  const isRunning = timer.state === 'RUNNING';
  const isFading = timer.state === 'FADING';

  const remainingMs = isPaused
    ? (timer.remainingMs || Math.max(0, timer.targetTime - (timer.pausedAt || now)))
    : Math.max(0, timer.targetTime - now);
  const totalMs = timer.durationMs || (timer.durationMinutes * 60 * 1000) || 1;

  const totalSecs = Math.max(0, Math.ceil(remainingMs / 1000));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const timeStr = hrs > 0
    ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (countdownEl) countdownEl.textContent = timeStr;

  if (finishTimeEl) {
    const projectedTarget = isPaused ? (now + remainingMs) : timer.targetTime;
    const d = new Date(projectedTarget);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    finishTimeEl.textContent = `Sleep at ${h}:${m} ${ampm}`;
  }

  if (badgeEl) {
    badgeEl.textContent = timer.state;
    badgeEl.className = `dash-sleep-badge ${timer.state.toLowerCase()}`;
  }

  if (activeDot) activeDot.classList.toggle('hidden', isIdle);

  if (btnToggleText && btnToggleIcon) {
    if (isRunning || isFading) {
      btnToggleIcon.textContent = '⏸️';
      btnToggleText.textContent = 'Pause Timer';
    } else if (isPaused) {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Resume Timer';
    } else {
      btnToggleIcon.textContent = '▶️';
      btnToggleText.textContent = 'Start Sleep Timer';
    }
  }

  // Highlight active preset button if match
  document.querySelectorAll('.dash-sleep-preset-btn').forEach(btn => {
    const minsPreset = parseInt(btn.getAttribute('data-minutes'), 10);
    btn.classList.toggle('active', minsPreset === timer.durationMinutes);
  });

  updateDashSleepDial(remainingMs, totalMs, isRunning, isPaused, isFading);

  if ((isRunning || isFading) && !dashSleepTickerInterval) {
    startDashSleepTicker();
  } else if (isPaused) {
    stopDashSleepTicker();
  }
}

function startDashSleepTicker() {
  stopDashSleepTicker();
  dashSleepTickerInterval = setInterval(() => {
    if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
      const now = Date.now();
      if (currentDashSleepTimer.targetTime <= now) {
        stopDashSleepTicker();
        fetchSleepTimerState();
      } else {
        renderDashSleepTimer(currentDashSleepTimer);
      }
    } else {
      stopDashSleepTicker();
    }
  }, 1000);
}

function stopDashSleepTicker() {
  if (dashSleepTickerInterval) {
    clearInterval(dashSleepTickerInterval);
    dashSleepTickerInterval = null;
  }
}

/**
 * Fetches latest sleep timer and settings from browser runtime / storage
 */
function fetchSleepTimerState() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_SLEEP_TIMER_STATE' }, (res) => {
        if (res && res.success && res.state) {
          renderDashSleepTimer(res.state);
        } else {
          loadSleepTimerFromStorage();
        }
      });
    } else {
      loadSleepTimerFromStorage();
    }
  } catch (_) {
    loadSleepTimerFromStorage();
  }
}

function loadSleepTimerFromStorage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sentinel_sleep_timer', 'sentinel_sleep_settings'], (res) => {
        if (res && res.sentinel_sleep_timer) {
          renderDashSleepTimer(res.sentinel_sleep_timer);
        }
        if (res && res.sentinel_sleep_settings) {
          syncSleepSettingsToggles(res.sentinel_sleep_settings);
        }
      });
    }
  } catch (_) {}
}

function syncSleepSettingsToggles(settings) {
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade && typeof settings.enableAudioFadeOut === 'boolean') {
    toggleFade.checked = settings.enableAudioFadeOut;
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo && typeof settings.endOfVideo === 'boolean') {
    toggleEndOfVideo.checked = settings.endOfVideo;
  }
}

/**
 * Initializes listeners, presets, and sync hooks for Sleep Sentinel Hub
 */
function initSleepSentinelHub() {
  // Preset buttons (15m, 30m, 45m, 60m, 90m, 120m)
  document.querySelectorAll('.dash-sleep-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-sleep-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDashSleepMinutes = parseInt(btn.getAttribute('data-minutes'), 10) || 30;
      
      // If timer is idle, update big display to selected minutes
      if (!currentDashSleepTimer || currentDashSleepTimer.state === 'IDLE' || currentDashSleepTimer.state === 'CANCELLED') {
        const countdownEl = document.getElementById('dashSleepCountdownDisplay');
        if (countdownEl) countdownEl.textContent = `${String(selectedDashSleepMinutes).padStart(2, '0')}:00`;
      } else {
        // If already running or paused, clicking preset immediately sets new duration
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  });

  // Extender buttons (+5m, +15m)
  const btnExtend5 = document.getElementById('btnDashSleepExtend5');
  if (btnExtend5) {
    btnExtend5.addEventListener('click', () => triggerExtendSleepTimer(5));
  }
  const btnExtend15 = document.getElementById('btnDashSleepExtend15');
  if (btnExtend15) {
    btnExtend15.addEventListener('click', () => triggerExtendSleepTimer(15));
  }

  // Toggle button (Start / Pause / Resume)
  const btnToggle = document.getElementById('btnDashSleepToggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING')) {
        triggerPauseSleepTimer();
      } else if (currentDashSleepTimer && currentDashSleepTimer.state === 'PAUSED') {
        triggerResumeSleepTimer();
      } else {
        triggerSetSleepTimer(selectedDashSleepMinutes);
      }
    });
  }

  // Reset button
  const btnReset = document.getElementById('btnDashSleepReset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      triggerCancelSleepTimer();
    });
  }

  // Toggles change events
  const toggleFade = document.getElementById('toggleDashSleepFade');
  if (toggleFade) {
    toggleFade.addEventListener('change', () => {
      updateSleepSetting('enableAudioFadeOut', toggleFade.checked);
    });
  }
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  if (toggleEndOfVideo) {
    toggleEndOfVideo.addEventListener('change', () => {
      updateSleepSetting('endOfVideo', toggleEndOfVideo.checked);
    });
  }

  // Storage listener for cross-view synchronization
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.sentinel_sleep_timer) {
        renderDashSleepTimer(changes.sentinel_sleep_timer.newValue);
      }
    });
  }

  // Runtime message listener for live broadcast events
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && (msg.type === 'SLEEP_TIMER_STATE_CHANGED' || msg.type === 'SLEEP_TIMER_EXPIRED')) {
        renderDashSleepTimer(msg.state);
      }
    });
  }

  // Initial state hydration
  fetchSleepTimerState();
}

function triggerSetSleepTimer(minutes) {
  const toggleFade = document.getElementById('toggleDashSleepFade');
  const enableFade = toggleFade ? toggleFade.checked : true;
  const toggleEndOfVideo = document.getElementById('toggleDashSleepEndOfVideo');
  const endVideo = toggleEndOfVideo ? toggleEndOfVideo.checked : false;

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'SET_SLEEP_TIMER',
      action: 'SET_SLEEP_TIMER',
      durationMinutes: minutes,
      enableFade: enableFade,
      options: { enableFadeOut: enableFade, endOfVideo: endVideo }
    }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerPauseSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'PAUSE_SLEEP_TIMER', action: 'PAUSE_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerResumeSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'RESUME_SLEEP_TIMER', action: 'RESUME_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerExtendSleepTimer(extraMinutes) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'EXTEND_SLEEP_TIMER',
      action: 'EXTEND_SLEEP_TIMER',
      extraMinutes: extraMinutes
    }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function triggerCancelSleepTimer() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'CANCEL_SLEEP_TIMER', action: 'CANCEL_SLEEP_TIMER' }, (res) => {
      if (res && res.success && res.state) {
        renderDashSleepTimer(res.state);
      }
    });
  }
}

function updateSleepSetting(key, value) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['sentinel_sleep_settings'], (res) => {
      const settings = (res && res.sentinel_sleep_settings) || {};
      settings[key] = value;
      chrome.storage.local.set({ sentinel_sleep_settings: settings });
    });
  }
}
```

### Step 3.2: Hook `initSleepSentinelHub()` into Dashboard Startup
In `dashboard/dashboard.js`, inside the DOM ready handler (or main initialization sequence), call:
```javascript
initSleepSentinelHub();
```

### Step 3.3: Harmonize `popup/popup.js` Pause & Resume
In `popup/popup.js` lines 3720-3754, ensure that clicking `btnSleepToggleRun` also dispatches `PAUSE_SLEEP_TIMER` and `RESUME_SLEEP_TIMER` via `browserAPI.runtime.sendMessage` so `background.js` alarms are immediately adjusted in lockstep.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero innerHTML:** All display mutations must use `.textContent` and `.setAttribute`.
- **Memory Leak Prevention:** Ensure `dashSleepTickerInterval` is safely stopped and cleared whenever the timer is `IDLE`, `PAUSED`, or `TRIGGERED`.
- **Do not interfere with Pomodoro timer interval** (`#widgetPomodoroSentinel`).

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.js`: Contains `initSleepSentinelHub()`, `renderDashSleepTimer()`, `updateDashSleepDial()`, preset listeners, and storage/runtime sync listeners.
2. `popup/popup.js`: Verified IPC alignment for pause/resume.

---

## 🧪 7. Local Verification Gate

Execute:
```powershell
node -e "const fs = require('fs'); const code = fs.readFileSync('dashboard/dashboard.js', 'utf8'); if (!code.includes('initSleepSentinelHub') || !code.includes('DASH_SLEEP_CIRCUMFERENCE')) throw new Error('Missing sleep hub logic'); console.log('Dashboard logic check passed');"
```
and verify exit code 0.
