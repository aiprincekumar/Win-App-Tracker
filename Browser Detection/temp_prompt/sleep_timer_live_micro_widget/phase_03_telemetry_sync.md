# 🌙 Phase 3: Live Telemetry Synchronization

> **Phase Identifier:** Phase 3 of 4  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Execution  
> **Assigned Role:** Level 4 Frontend Engineer  

---

## 🎯 1. Phase Objective
Integrate real-time telemetry updates for the left navigation sleep micro-widget (`#sleepMicroClock`, `#sleepMicroMode`, `#sleepMicroStatusDot`) into `renderDashSleepTimer(timer)` in `dashboard/dashboard.js`, ensuring instant reflection of all timer states (IDLE, RUNNING, PAUSED, FADING, CANCELLED).

---

## 📦 2. Prerequisites & Inputs
- Phase 2 completed clean.
- Reference implementation: `wellbeingMicroClock`, `wellbeingMicroMode`, and `wellbeingMicroStatusDot` in `updatePomodoroUI(state)` (`dashboard/dashboard.js` lines 5424-5438).

---

## 🔍 3. Technical Context & File Anchors
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L11287-L11365): Inside `renderDashSleepTimer(timer)`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Locate Elements in `renderDashSleepTimer(timer)`
Add element lookups near the top of `renderDashSleepTimer(timer)`:
```javascript
  const microClock = document.getElementById('sleepMicroClock');
  const microMode = document.getElementById('sleepMicroMode');
  const microDot = document.getElementById('sleepMicroStatusDot');
```

### Step 3.2: Synchronize Idle State
In the `if (isIdle)` block:
```javascript
  if (microClock) microClock.textContent = '00:00';
  if (microMode) microMode.textContent = 'Sleep Idle';
  if (microDot) microDot.className = 'hud-dot idle';
```

### Step 3.3: Synchronize Active, Fading, and Paused States
In the active timer rendering block:
```javascript
  if (microClock) microClock.textContent = timeStr;
  if (microMode) {
    microMode.textContent = isRunning
      ? 'Sleep Active'
      : (isFading ? 'Sleep Fading' : (isPaused ? 'Sleep Paused' : 'Sleep Idle'));
  }
  if (microDot) {
    microDot.className = 'hud-dot ' + (isRunning ? 'online' : ((isFading || isPaused) ? 'warn' : 'idle'));
  }
```

---

## 🚧 5. Constraints & Boundaries
- Zero innerHTML mutations: use `textContent` and `className` exclusively (W3C Trusted Types).
- Function length for `renderDashSleepTimer` must stay within reasonable bounds (Rule 28 modularity).
- Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📄 6. Deliverables Manifest
- Modified: `dashboard/dashboard.js`

---

## ✅ 7. Local Verification Gate
Run in terminal:
```powershell
node -e "
const fs = require('fs');
const code = fs.readFileSync('dashboard/dashboard.js', 'utf8');
if (!code.includes('sleepMicroClock')) throw new Error('Missing sleepMicroClock update');
if (!code.includes('sleepMicroMode')) throw new Error('Missing sleepMicroMode update');
if (!code.includes('sleepMicroStatusDot')) throw new Error('Missing sleepMicroStatusDot update');
console.log('Phase 3 Verification Gate Passed!');
"
```
