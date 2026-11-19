# 🌙 Technical Requirements Document (TRD): Sleep Timer Live Micro-Widget

> **Document Type:** Technical Architecture & Interface Specification  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Initiative:** Sleep Timer Live Micro-Widget in Left Navigation Panel Matching Focus Sentinel  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏗️ 1. Architecture & Interface Specifications

### 1.1 DOM Hierarchy & Element Contracts
The sidebar micro-widget resides in `dashboard/dashboard.html` within `<div class="sidebar-hud-group">`:

```html
<!-- Sidebar Sleep Sentinel Live Micro-Widget HUD -->
<div id="sleepLiveMicroWidget"
     class="sidebar-hud-card sleep-micro-hud interactive-hud-card"
     role="button"
     tabindex="0"
     aria-label="Sleep Sentinel State (Click to switch to Focus &amp; Sleep Hub)"
     title="Sleep Sentinel State (Click to switch to Focus &amp; Sleep Hub)"
     style="cursor: pointer;">
  <div class="hud-card-header">
    <span class="hud-card-title">🌙 Sleep Sentinel</span>
    <span id="sleepMicroStatusDot" class="hud-dot idle" aria-label="Sleep Sentinel Status"></span>
  </div>
  <div class="hud-card-body">
    <span id="sleepMicroClock" class="hud-micro-clock">00:00</span>
    <span id="sleepMicroMode" class="hud-micro-mode">Sleep Idle</span>
  </div>
</div>
```

### 1.2 Target Target Elements for Deep-Linking
- **Card Target:** `#cardSleepSentinelHub` (Primary target container) or fallback `#widgetSleepSentinel`.
- **Primary CTA Button:** `#btnDashSleepToggle` (Primary start/pause toggle) or fallback `#btnStartSleepTimer`.

---

## ⚡ 2. State Transition & Telemetry Contract

The Sleep Timer operates on a finite state machine: `IDLE`, `RUNNING`, `PAUSED`, `FADING`, `CANCELLED`.

| State | Status Dot Class (`#sleepMicroStatusDot`) | Mode Text (`#sleepMicroMode`) | Clock Text (`#sleepMicroClock`) |
| :--- | :--- | :--- | :--- |
| `IDLE` | `hud-dot idle` | `Sleep Idle` | `00:00` |
| `RUNNING` | `hud-dot online` | `Sleep Active` | Calculated remaining `MM:SS` or `HH:MM:SS` |
| `FADING` | `hud-dot warn` | `Sleep Fading` | Calculated remaining `MM:SS` |
| `PAUSED` | `hud-dot warn` | `Sleep Paused` | Static remaining `MM:SS` at time of pause |
| `CANCELLED` | `hud-dot idle` | `Sleep Idle` | `00:00` |

---

## 💻 3. Implementation Code Signatures & Logic Contracts

### 3.1 Deep-Linking Controller: `navigateToSleepSentinel()`
Must be implemented in `dashboard/dashboard.js` with signature and algorithm:

```javascript
let sleepHighlightTimerId = null;

/**
 * Deep-links directly to Sleep Sentinel Hub card and highlights the primary toggle button
 */
function navigateToSleepSentinel() {
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }
  if (typeof switchTab === 'function') {
    switchTab('wellbeing');
  }
  const card = (typeof document !== 'undefined')
    ? (document.getElementById('cardSleepSentinelHub') || document.getElementById('widgetSleepSentinel'))
    : null;
  const btn = (typeof document !== 'undefined')
    ? (document.getElementById('btnDashSleepToggle') || document.getElementById('btnStartSleepTimer'))
    : null;
  if (!card) return;

  if (sleepHighlightTimerId) {
    clearTimeout(sleepHighlightTimerId);
    sleepHighlightTimerId = null;
  }

  const prefersReduced = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  setTimeout(() => {
    if (typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
    }
    card.classList.remove('sleep-card-highlight');
    if (btn) btn.classList.remove('highlight-pulse');
    void card.offsetWidth;
    if (btn) void btn.offsetWidth;

    card.classList.add('sleep-card-highlight');
    if (btn) {
      btn.classList.add('highlight-pulse');
      if (typeof btn.focus === 'function') {
        btn.focus({ preventScroll: true });
      }
    }

    sleepHighlightTimerId = setTimeout(() => {
      if (card) card.classList.remove('sleep-card-highlight');
      if (btn) btn.classList.remove('highlight-pulse');
      sleepHighlightTimerId = null;
    }, 2000);
  }, 60);
}
```

### 3.2 Event Wiring
In `initEventListeners()`:
```javascript
const sleepMicroWidget = document.getElementById('sleepLiveMicroWidget');
if (sleepMicroWidget) {
  sleepMicroWidget.addEventListener('click', () => navigateToSleepSentinel());
  sleepMicroWidget.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      navigateToSleepSentinel();
    }
  });
}
```

### 3.3 Telemetry Updates in `renderDashSleepTimer(timer)`
Within `renderDashSleepTimer(timer)`:
```javascript
const microClock = document.getElementById('sleepMicroClock');
const microMode = document.getElementById('sleepMicroMode');
const microDot = document.getElementById('sleepMicroStatusDot');

if (isIdle) {
  if (microClock) microClock.textContent = '00:00';
  if (microMode) microMode.textContent = 'Sleep Idle';
  if (microDot) microDot.className = 'hud-dot idle';
  // ... rest of idle logic
} else {
  // when timer is running / fading / paused:
  if (microClock) microClock.textContent = timeStr;
  if (microMode) {
    microMode.textContent = isRunning
      ? 'Sleep Active'
      : (isFading ? 'Sleep Fading' : (isPaused ? 'Sleep Paused' : 'Sleep Idle'));
  }
  if (microDot) {
    microDot.className = 'hud-dot ' + (isRunning ? 'online' : ((isFading || isPaused) ? 'warn' : 'idle'));
  }
  // ... rest of active logic
}
```

---

## 🔒 4. Governance & Constraints

1. **Universal Rule 28 Compliance:**
   - Any new functions introduced must be strictly <= 50 lines.
   - Nesting depth must not exceed 3 levels.
2. **Zero innerHTML:**
   - All text must be updated via `textContent`.
   - CSS styling must be applied via `classList.add`/`classList.remove`.
3. **Global Scope Exposures:**
   - Expose `navigateToSleepSentinel` on both `window` and `globalThis` if defined.
   - Export `navigateToSleepSentinel` in `module.exports` for Node test environments.
4. **Encoding:**
   - Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all modified source files.
