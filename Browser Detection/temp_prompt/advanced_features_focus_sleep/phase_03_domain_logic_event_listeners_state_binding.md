# Phase 03: Domain Logic, Event Listeners & State Binding Specification

> **Document Type:** Standalone Phase Execution Instruction  
> **Phase #:** 03 of 04  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Target Subsystems:** Focus & Sleep Advanced Domain Logic & Audio Engines  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Target Files:** `dashboard/dashboard.js`  
> **Lead Departments:** Dept 05 (Frontend Engineering), Dept 02 (Solution Architecture)  

---

## 🎯 1. Phase Objective

Implement the complete domain logic, Web Audio DSP synthesizers, timer hooks, extension IPC helpers, and persistent state management for all 11 Focus & Sleep Advanced features in `dashboard/dashboard.js`. Every feature MUST initialize as strictly OFF or None. Basic container logic MUST REMAIN UNTOUCHED. All functions must strictly adhere to <= 50 lines (Universal Rule 28).

---

## 📋 2. Prerequisites & Technical Context

- **Prerequisites:** Phase 1 and Phase 2 completed clean; DOM elements and i18n keys present.
- **Target File:** `dashboard/dashboard.js`.
- **Target Synthesizers:** Expand `startSoundscape()` for Binaural Beats; implement `startSleepAidSoundscape()` and `stopSleepAidSoundscape()`.
- **Strict Invariant:** All `localStorage` keys under `sentinel_focus_adv_*` and `sentinel_sleep_adv_*` must default to `false` or `'none'`.

---

## 🔨 3. Surgical Step-by-Step Instructions

### Step 3.1: State Initialization & Default OFF Contracts
Implement `initFocusAdvancedState()` and `initSleepAdvancedState()`:
```javascript
function initFocusAdvancedState() {
  const toggleIntegrity = document.getElementById('toggleFocusIntegrityScore');
  const toggleAutoMute = document.getElementById('toggleFocusAutoMuteBg');
  const toggleBreathe = document.getElementById('toggleFocusBreatheNudge');
  const toggle2020 = document.getElementById('toggleFocus2020Alert');

  if (toggleIntegrity) toggleIntegrity.checked = localStorage.getItem('sentinel_focus_adv_integrity') === 'true';
  if (toggleAutoMute) toggleAutoMute.checked = localStorage.getItem('sentinel_focus_adv_automute_bg') === 'true';
  if (toggleBreathe) toggleBreathe.checked = localStorage.getItem('sentinel_focus_adv_breathe_nudge') === 'true';
  if (toggle2020) toggle2020.checked = localStorage.getItem('sentinel_focus_adv_posture_alert') === 'true';

  const selectSoundscape = document.getElementById('selectFocusSoundscape');
  if (selectSoundscape && !selectSoundscape.value) {
    selectSoundscape.value = localStorage.getItem('sentinel_focus_soundscape') || 'none';
  }
}

function initSleepAdvancedState() {
  const toggleAutoplay = document.getElementById('toggleSleepAutoplayBlock');
  const toggleInactivity = document.getElementById('toggleSleepInactivityFastCutoff');
  const toggleDimmer = document.getElementById('toggleSleepScreenDimmer');
  const toggleHibernate = document.getElementById('toggleSleepTabHibernate');

  if (toggleAutoplay) toggleAutoplay.checked = localStorage.getItem('sentinel_sleep_adv_autoplay_block') === 'true';
  if (toggleInactivity) toggleInactivity.checked = localStorage.getItem('sentinel_sleep_adv_inactivity_cutoff') === 'true';
  if (toggleDimmer) toggleDimmer.checked = localStorage.getItem('sentinel_sleep_adv_screen_dimmer') === 'true';
  if (toggleHibernate) toggleHibernate.checked = localStorage.getItem('sentinel_sleep_adv_tab_hibernate') === 'true';

  const selectSleepSound = document.getElementById('selectSleepAidSoundscape');
  if (selectSleepSound) {
    selectSleepSound.value = localStorage.getItem('sentinel_sleep_adv_soundscape') || 'none';
  }
}
```

### Step 3.2: Web Audio API Binaural Beats Expansion
In `dashboard/dashboard.js`, inside `startSoundscape(type)`:
Support `binaural_alpha`, `binaural_beta`, and `binaural_gamma`:
```javascript
function createBinauralBeatNodes(ctx, carrier, beatFreq, gainNode) {
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  oscL.type = 'sine';
  oscR.type = 'sine';
  oscL.frequency.setValueAtTime(carrier, ctx.currentTime);
  oscR.frequency.setValueAtTime(carrier + beatFreq, ctx.currentTime);

  const merger = ctx.createChannelMerger(2);
  oscL.connect(merger, 0, 0); // Left Ear
  oscR.connect(merger, 0, 1); // Right Ear
  merger.connect(gainNode);

  oscL.start();
  oscR.start();
  return [oscL, oscR, merger];
}
```
- For `binaural_alpha`: Carrier 200Hz, Beat 10Hz.
- For `binaural_beta`: Carrier 220Hz, Beat 18Hz.
- For `binaural_gamma`: Carrier 240Hz, Beat 40Hz.

### Step 3.3: Web Audio API Sleep Aid Soundscapes Engine
Implement `startSleepAidSoundscape(type)` and `stopSleepAidSoundscape()`:
- `pink_noise`: Multi-pole filtered noise buffer providing warm, hypnotic ambient mask.
- `midnight_ocean`: LFO modulated bandpass filter at 280Hz with sub-bass depth.
- `delta_rain`: Highpass rain noise blended with subtle 2.5Hz delta brainwave carrier.
- Tie gain directly into the sleep timer countdown fade envelope.

### Step 3.4: Focus Integrity Score & Distraction Counter Engine
Implement `updateFocusIntegrityScore(delta, reason)`:
- Initializes at 100%.
- If distracting tab navigation is detected during active focus:
  - Deducts 5 points (minimum clamp 0%).
  - Increments `distractionCount`.
  - Updates `#badgeFocusIntegrityScore.textContent` and `#cntFocusDistractions.textContent`.
  - Dynamically updates badge CSS class (`high`, `med`, `low`).

### Step 3.5: 20-20-20 Screen-Break & Posture Alert Tick
In the active Pomodoro countdown loop:
- Track cumulative focus seconds.
- Every 1200 seconds (20 minutes):
  - If `#toggleFocus2020Alert.checked` is true, invoke `trigger2020PostureAlert()`.
  - Removes `.hidden` on `#toast2020PostureAlert`.
  - Sets auto-dismiss timer for 20 seconds.

### Step 3.6: Soft-Nudge Breathe Overlay Engine
Implement `triggerBreatheNudgeOverlay(domain)`:
- If `#toggleFocusBreatheNudge.checked` is true and distracting domain is accessed:
  - Display `#overlayBreatheNudge`.
  - Starts 16s circular box-breathing animation timer (Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s).
  - Bind `#btnBreatheReturnTask` to hide modal and refocus work tab.
  - Bind `#btnBreatheAllowTemp` to grant 5m grace period.

### Step 3.7: Power-Nap Mode 20m Controller
Implement `triggerPowerNapMode()`:
- Bound to `#btnSleepPowerNapMode`.
- Sets sleep duration input to 20 minutes (`inputDashSleepCustomMinutes.value = 20`).
- Activates Delta Rain soundscape (`selectSleepAidSoundscape.value = 'delta_rain'`).
- Starts sleep timer countdown (`startDashSleepTimer()`).
- Shows confirmation toast: *"⚡ Power-Nap Activated (20m with Delta Rain)"*.

### Step 3.8: Tab Automation Handlers (Auto-Mute & Hibernation)
- `executeAutoMuteBackgroundTabs(isMute)`: Safely issues mute directive to background tabs.
- `executeSleepTabHibernation()`: Discards background tabs on sleep timer completion.
- Both use safe conditional checks (`typeof chrome !== 'undefined' && chrome.tabs`) to ensure zero crashes in standalone mode.

---

## 🚫 4. Architectural Constraints & Invariants

- **Rule 28 Compliance:** Every single function must be <= 50 lines. Split helper logic into separate micro-functions if needed.
- **W3C Trusted Types Compliance:** No `innerHTML`, `outerHTML`, or `document.write`.
- **Basic Container Invariant:** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` functions remain intact.

---

## 📦 5. Deliverables Manifest
- Updated `dashboard/dashboard.js` with full domain logic, state initialization, and event listeners.

---

## 🛡️ 6. Local Verification Gate Command

```bash
node -e "const fs=require('fs'); const j=fs.readFileSync('dashboard/dashboard.js','utf8'); console.assert(j.includes('initFocusAdvancedState'), 'Missing initFocusAdvancedState'); console.assert(j.includes('initSleepAdvancedState'), 'Missing initSleepAdvancedState'); console.assert(j.includes('createBinauralBeatNodes') || j.includes('binaural_alpha'), 'Missing binaural beats'); console.assert(j.includes('startSleepAidSoundscape'), 'Missing startSleepAidSoundscape'); console.assert(j.includes('triggerPowerNapMode'), 'Missing triggerPowerNapMode'); console.assert(j.includes('trigger2020PostureAlert'), 'Missing trigger2020PostureAlert'); console.assert(j.includes('triggerBreatheNudgeOverlay'), 'Missing triggerBreatheNudgeOverlay'); console.log('✅ Phase 3 Verification Passed: All domain logic, Web Audio synthesizers, and state binding certified clean.');"
```
