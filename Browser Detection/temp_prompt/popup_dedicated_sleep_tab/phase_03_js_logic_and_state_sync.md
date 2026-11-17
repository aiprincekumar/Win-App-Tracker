# Phase 03: JavaScript Logic, Dial Math & State Synchronization

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Phase:** `03 of 05`  
> **Target File:** `popup/popup.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Local Test Gate:** `node -c popup/popup.js`  

---

## 🎯 1. Phase Objective

The objective of Phase 03 is to wire all interactive capabilities for the 7th Sleep Tab inside `popup/popup.js`:
1. Register `'sleep'` in the `switchTopTab` function registry.
2. Bind click event listeners to `#mainTabSleep`.
3. Update footer button `#btnSleepTimerTrigger` so clicking it switches directly to `#viewSleepPane` (`switchTopTab('sleep', true)`).
4. Implement reactive SVG radial ring rendering (`stroke-dashoffset` math with circumference `339.292`).
5. Implement quick extenders (`+5m` and `+15m`) adding time to running timers without resetting state.
6. Wire duration presets (`15m`, `30m`, `45m`, `60m`, `90m`, `120m`), custom minute input, start/pause toggle, and cancel/reset button.
7. Wire sleep automation toggles (`#toggleSleepEndOfVideo`, `#toggleSleepFadeCurve`, `#toggleSleepInactivitySentinel`).
8. Add internationalization keys `tab_sleep` in both English and Hindi dictionaries.
9. Ensure AST clean compilation with zero syntax errors and zero CSP violations.

---

## 📋 2. Prerequisites & Inputs

- Specifications:
  - [`PRD.md`](PRD.md) (Sections 2.3, 2.4, 2.5, 2.6)
  - [`TRD.md`](TRD.md) (Sections 3 & 4)
- Target file: `popup/popup.js`

---

## 🔍 3. Technical Context & File Anchors

1. **`switchTopTab` Anchor (approx. lines 400-470):**
   ```javascript
   const tabs = [
     { key: 'media', btn: document.getElementById('mainTabMedia'), pane: document.getElementById('viewMediaPane') },
     { key: 'audio', btn: document.getElementById('mainTabAudio'), pane: document.getElementById('viewAudioPane') },
     { key: 'tools', btn: document.getElementById('mainTabTools'), pane: document.getElementById('viewToolsPane') },
     { key: 'studio', btn: document.getElementById('mainTabStudio'), pane: document.getElementById('viewStudioPane') },
     { key: 'tracking', btn: document.getElementById('mainTabTracking'), pane: document.getElementById('viewTrackingPane') },
     { key: 'domains', btn: document.getElementById('mainTabDomains'), pane: document.getElementById('viewDomainsPane') }
   ];
   ```
   *Target edit:* Add the 7th tab descriptor:
   ```javascript
   { key: 'sleep', btn: document.getElementById('mainTabSleep'), pane: document.getElementById('viewSleepPane') }
   ```

2. **Event Listeners Binding Anchor (approx lines 2300-2450):**
   Locate where `#mainTabTools` and `#mainTabDomains` are bound:
   ```javascript
   const mainTabDomains = document.getElementById('mainTabDomains');
   if (mainTabDomains) mainTabDomains.addEventListener('click', () => switchTopTab('domains', true));
   ```
   *Target edit:* Add click listener for `#mainTabSleep`:
   ```javascript
   const mainTabSleep = document.getElementById('mainTabSleep');
   if (mainTabSleep) mainTabSleep.addEventListener('click', () => switchTopTab('sleep', true));
   ```

3. **Footer `#btnSleepTimerTrigger` Anchor:**
   Previously, `#btnSleepTimerTrigger` opened `#sleepTimerPopover`.
   *Target edit:* Update handler so clicking `#btnSleepTimerTrigger` invokes `switchTopTab('sleep', true)`. (Also toggle or close `#sleepTimerPopover` if open).

4. **i18n Dictionary Anchors (`I18N_POPUP`):**
   - In `I18N_POPUP.en`: Add `tab_sleep: 'Sleep'`
   - In `I18N_POPUP.hi`: Add `tab_sleep: 'स्लीप'`
   - In `applyPopupLanguage`: Add `setTxt('topTabSleepText', 'tab_sleep');`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Expand `switchTopTab`
In `popup/popup.js`, add `sleep` to the `tabs` array in `switchTopTab`:
```javascript
{ key: 'sleep', btn: document.getElementById('mainTabSleep'), pane: document.getElementById('viewSleepPane') }
```
When tab key is `'sleep'`, ensure `#mainTabSleep` gets `active` and `aria-selected="true"`, and `#viewSleepPane` gets `active`.

### Step 2: Implement Radial Dial Math & Renderer
Add the SVG dial rendering functions:
```javascript
const SLEEP_DIAL_CIRCUMFERENCE = 339.292; // 2 * Math.PI * 54

function updateRadialSleepDial(remainingMs, totalDurationMs) {
  const progressCircle = document.getElementById('sleepDialProgress');
  if (!progressCircle) return;

  if (totalDurationMs <= 0 || remainingMs <= 0) {
    progressCircle.style.strokeDashoffset = String(SLEEP_DIAL_CIRCUMFERENCE);
    return;
  }

  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));
  const offset = SLEEP_DIAL_CIRCUMFERENCE * (1 - ratio);
  progressCircle.style.strokeDashoffset = String(offset.toFixed(2));
}

function renderSleepTabState(timer) {
  const countdownEl = document.getElementById('sleepDialCountdown');
  const targetTimeEl = document.getElementById('sleepDialTargetTime');
  const badgeEl = document.getElementById('sleepDialStatusBadge');
  const toggleBtnText = document.getElementById('btnSleepToggleRunText');
  const toggleBtnIcon = document.getElementById('btnSleepToggleRunIcon');
  const activeDot = document.getElementById('tabSleepActiveDot');
  const footerDot = document.getElementById('sleepTimerActiveDot');

  if (!timer || timer.state === 'IDLE' || timer.state === 'CANCELLED' || !timer.targetTime) {
    if (countdownEl) countdownEl.textContent = '00:00';
    if (targetTimeEl) targetTimeEl.textContent = 'No active timer';
    if (badgeEl) {
      badgeEl.textContent = 'IDLE';
      badgeEl.className = 'sleep-status-badge idle';
    }
    if (toggleBtnText) toggleBtnText.textContent = 'Start';
    if (toggleBtnIcon) toggleBtnIcon.textContent = '▶';
    if (activeDot) activeDot.classList.add('hidden');
    if (footerDot) footerDot.classList.add('hidden');
    updateRadialSleepDial(0, 1);
    return;
  }

  const now = Date.now();
  const remainingMs = Math.max(0, timer.targetTime - now);
  const totalMs = timer.durationMs || (timer.durationMinutes * 60 * 1000) || 1;

  // Format MM:SS or HH:MM:SS
  const totalSecs = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (countdownEl) countdownEl.textContent = timeStr;
  
  // Format projected end clock time
  if (targetTimeEl) {
    const d = new Date(timer.targetTime);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    targetTimeEl.textContent = `Sleep at ${h}:${m} ${ampm}`;
  }

  // Update badge and controls based on state
  if (badgeEl) {
    badgeEl.textContent = timer.state;
    badgeEl.className = `sleep-status-badge ${timer.state.toLowerCase()}`;
  }

  if (toggleBtnText && toggleBtnIcon) {
    if (timer.state === 'RUNNING') {
      toggleBtnText.textContent = 'Pause';
      toggleBtnIcon.textContent = '⏸';
    } else {
      toggleBtnText.textContent = 'Resume';
      toggleBtnIcon.textContent = '▶';
    }
  }

  if (activeDot) activeDot.classList.remove('hidden');
  if (footerDot) footerDot.classList.remove('hidden');

  updateRadialSleepDial(remainingMs, totalMs);
}
```

### Step 3: Implement Quick Extenders (+5m & +15m)
```javascript
function extendSleepTimerMinutes(minsToAdd) {
  const extraMs = minsToAdd * 60 * 1000;
  browserAPI.storage.local.get(['sentinel_sleep_timer'], (res) => {
    let timer = res.sentinel_sleep_timer;
    const now = Date.now();
    if (timer && timer.state === 'RUNNING' && timer.targetTime > now) {
      timer.durationMinutes = (timer.durationMinutes || 0) + minsToAdd;
      timer.durationMs = (timer.durationMs || 0) + extraMs;
      timer.targetTime += extraMs;
      timer.lastUpdated = now;
    } else {
      timer = {
        state: 'RUNNING',
        durationMinutes: minsToAdd,
        durationMs: extraMs,
        startTime: now,
        targetTime: now + extraMs,
        pauseMedia: true,
        pauseTracking: true,
        enableFadeOut: true,
        fadeDurationSeconds: 30,
        lastUpdated: now,
        endOfVideo: false
      };
    }
    browserAPI.storage.local.set({ sentinel_sleep_timer: timer }, () => {
      try {
        browserAPI.runtime.sendMessage({ action: 'EXTEND_SLEEP_TIMER', extraMinutes: minsToAdd });
      } catch (e) {}
      renderSleepTabState(timer);
    });
  });
}
```

### Step 4: Wire All Event Handlers
In `setupEventListeners()`:
1. `#mainTabSleep`: Click invokes `switchTopTab('sleep', true)`.
2. `#btnSleepTimerTrigger`: Click invokes `switchTopTab('sleep', true)`.
3. `#btnSleepExtend5m`: Click invokes `extendSleepTimerMinutes(5)`.
4. `#btnSleepExtend15m`: Click invokes `extendSleepTimerMinutes(15)`.
5. `#btnSleepReset`: Resets timer by dispatching `CANCEL_SLEEP_TIMER` and setting state to `IDLE`.
6. `#btnSleepToggleRun`: Toggles between `RUNNING` and `PAUSED`.
7. `.sleep-tab-preset-btn`: Click reads `data-minutes` and dispatches `SET_SLEEP_TIMER`.
8. `#btnSetSleepCustom`: Click reads `#inputSleepCustomMinutes` and sets timer.
9. Toggles (`#toggleSleepEndOfVideo`, `#toggleSleepFadeCurve`, `#toggleSleepInactivitySentinel`): Update settings in `sentinel_sleep_settings`.

### Step 5: Add i18n Dictionary Keys
Update `I18N_POPUP.en` and `I18N_POPUP.hi`:
```javascript
// en
tab_sleep: 'Sleep',
// hi
tab_sleep: 'स्लीप',
```
In `applyPopupLanguage()`:
```javascript
setTxt('topTabSleepText', 'tab_sleep');
```

---

## ⚠️ 5. Architectural Constraints & Boundaries

- **Zero innerHTML:** Use `textContent` and SVG DOM attribute manipulation exclusively.
- **Maintain AST Compilation:** Zero syntax errors; verify with `node -c popup/popup.js`.
- **Zero Backend Changes:** Operate purely through existing `browserAPI.storage.local` and message passing.

---

## 📦 6. Deliverables Manifest

- `popup/popup.js`: Integrated with 7th tab switching, radial dial math, quick extend handlers, presets, and i18n keys.

---

## 🧪 7. Local Verification Gate

Execute in PowerShell:
```powershell
node -c popup/popup.js
```
Must compile cleanly with exit code 0.
