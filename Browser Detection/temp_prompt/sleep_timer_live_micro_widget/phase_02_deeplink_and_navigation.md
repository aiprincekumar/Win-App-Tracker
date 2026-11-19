# 🌙 Phase 2: Deep-Linking, Smooth Scroll & CTA Focus Controller

> **Phase Identifier:** Phase 2 of 4  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Execution  
> **Assigned Role:** Level 4 UI/Frontend Engineer  

---

## 🎯 1. Phase Objective
Implement the `navigateToSleepSentinel()` navigation controller in `dashboard/dashboard.js`, wire click and keyboard event listeners (`Enter`, `Space`) on `#sleepLiveMicroWidget`, and export the function across all execution scopes (`window`, `globalThis`, and `module.exports`).

---

## 📦 2. Prerequisites & Inputs
- Phase 1 completed clean.
- Existing `navigateToFocusSentinel()` implementation in `dashboard/dashboard.js` lines 4850-4902 as reference.
- Target elements: `#cardSleepSentinelHub` (fallback `#widgetSleepSentinel`) and `#btnDashSleepToggle` (fallback `#btnStartSleepTimer`).

---

## 🔍 3. Technical Context & File Anchors
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L4850-L4902): Placement of `navigateToSleepSentinel()` directly below `navigateToFocusSentinel()`.
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L9460-L9480): Event listener wiring inside `initEventListeners()`.
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L12200-L12560): Global and modular exports.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Add `sleepHighlightTimerId` and `navigateToSleepSentinel()` in `dashboard/dashboard.js`
Place right below `navigateToFocusSentinel()`:
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

### Step 2.2: Bind Event Listeners in `initEventListeners()`
In `dashboard/dashboard.js` inside `initEventListeners()`, wire `#sleepLiveMicroWidget`:
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

### Step 2.3: Expose `navigateToSleepSentinel` Across All Scopes
1. Add `navigateToSleepSentinel` to `module.exports` object in `dashboard/dashboard.js`.
2. Add `window.navigateToSleepSentinel = navigateToSleepSentinel;` in `if (typeof window !== 'undefined')`.
3. Add `globalThis.navigateToSleepSentinel = navigateToSleepSentinel;` in `if (typeof globalThis !== 'undefined')`.

---

## 🚧 5. Constraints & Boundaries
- Function line count must remain <= 50 lines (Universal Rule 28).
- Nesting depth <= 3.
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
if (!code.includes('function navigateToSleepSentinel')) throw new Error('Missing navigateToSleepSentinel');
if (!code.includes('sleepLiveMicroWidget')) throw new Error('Missing sleepLiveMicroWidget event binding');
if (!code.includes('globalThis.navigateToSleepSentinel = navigateToSleepSentinel')) throw new Error('Missing globalThis export');
console.log('Phase 2 Verification Gate Passed!');
"
```
