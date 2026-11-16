# Phase 3: Precision Timeline Scrubber & Kinetic Number Rollers
## Standalone Executable Phase Instruction Specification

> **Phase Identifier:** `PHASE-03-PRECISION-SCRUBBER-AND-KINETIC-ROLLERS`  
> **Subsystems Implemented:** System 4 (Precision Timeline Scrubber) & System 5 (Kinetic Rollers & Staggered Micro-Motion)  
> **Target Files:** `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`  
> **Test Gate:** `tests/test_dashboard_uiux_phase3.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Authorization Prerequisite:** Phase 2 Certified Clean + Active `AUTH-MGR-*` token  

---

## 🎯 1. Phase Objective

Upgrade the hero media player seek slider into a **Precision Timeline Scrubber** with sub-second floating frosted-glass time tooltips, chapter tick markers, and elastic spring thumb physics. Simultaneously implement **60fps GPU-accelerated kinetic odometer number rolling** for all core telemetry metrics and 40ms staggered card entrance animations.

---

## 📋 2. Prerequisites & Inputs

1. **Prior Phase Deliverables:**
   - Phase 1 (Bento Grid, Liquid Glass) and Phase 2 (Omni Palette, Hotkeys) certified clean.
2. **Design Specifications:**
   - Scrubber logic and kinetic cubic-bezier parameters in [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_uiux_enhancement/TRD.md) Section 5 and 6.
   - Master prompt: [`dashboard_ui_ux_enhancement_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_enhancement_prompt.md).

---

## 🔍 3. Technical Context & File Anchors

- **`dashboard/dashboard.html`:**
  - Wrap `#heroMediaSeekSlider` inside a `.scrubber-wrapper` container.
  - Add `#scrubberTooltip` element.
  - Add `#scrubberChapterTicksContainer`.
- **`dashboard/dashboard.css`:**
  - Style `.scrubber-wrapper`, `.scrubber-floating-tooltip`, `.chapter-tick`.
  - Add custom `::-webkit-slider-thumb` styling with elastic `:active` expansion.
  - Add `@keyframes cardStaggerEntrance` for 40ms staggered transitions.
- **`dashboard/dashboard.js`:**
  - Implement `initPrecisionScrubber(scrubberEl, tooltipEl, durationSec)`.
  - Implement `animateNumberRoll(el, startVal, targetVal, durationMs)`.
  - Attach kinetic number rolling to telemetry metrics on data load/refresh.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Wrap `#heroMediaSeekSlider` & Add Tooltip Markup in `dashboard.html`
Modify the seek slider container:
```html
<div class="scrubber-wrapper" id="heroMediaScrubberWrapper">
  <input type="range" id="heroMediaSeekSlider" class="hero-seek-slider" min="0" max="100" value="0" step="0.1" aria-label="Media timeline seek slider" />
  <div id="scrubberTooltip" class="scrubber-floating-tooltip hidden">00:00</div>
  <div id="scrubberChapterTicksContainer" class="scrubber-ticks-container"></div>
</div>
```

### Step 2: Implement Precision Tooltip Math in `dashboard.js`
Add `initPrecisionScrubber`:
```javascript
function initPrecisionScrubber(scrubberEl, tooltipEl, durationSec = 0) {
  if (!scrubberEl || !tooltipEl) return;

  function updateTooltipPosition(e) {
    const rect = scrubberEl.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? (offsetX / rect.width) : 0;
    const hoverSeconds = percent * (durationSec || 100);

    tooltipEl.style.left = `${offsetX}px`;
    tooltipEl.textContent = formatHHMMSS(hoverSeconds);
    tooltipEl.classList.remove('hidden');

    if (window.sentinelHaptics) {
      window.sentinelHaptics.playTick();
    }
  }

  scrubberEl.addEventListener('mousemove', updateTooltipPosition);
  scrubberEl.addEventListener('mouseleave', () => {
    tooltipEl.classList.add('hidden');
  });

  // Keyboard Seeking Support
  scrubberEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (window.sentinelHaptics) window.sentinelHaptics.playTick();
    }
  });
}
```

### Step 3: Implement 600ms Kinetic Odometer Number Rollers
Add `animateNumberRoll` helper in `dashboard.js`:
```javascript
function animateNumberRoll(el, startVal, targetVal, durationMs = 600, unitSuffix = '') {
  if (!el) return;
  const startTime = performance.now();
  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeOutQuart(progress);
    const current = Math.round(startVal + (targetVal - startVal) * eased);
    el.textContent = `${current}${unitSuffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}
```
Attach `animateNumberRoll` to telemetry numbers (`#trackMetricTodayTime`, `#trackMetricDailyAvg`, `#trackMetricTotalTime`) upon receiving telemetry state updates.

### Step 4: CSS Scrubber & Staggered Motion in `dashboard.css`
```css
/* Scrubber Wrapper & Floating Tooltip */
.scrubber-wrapper {
  position: relative;
  width: 100%;
  padding: 8px 0;
}

.scrubber-floating-tooltip {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: opacity 120ms ease;
  z-index: 20;
}

/* Elastic Slider Thumb Physics */
.hero-seek-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent-primary, #10b981);
  box-shadow: 0 0 10px var(--color-accent-primary, #10b981);
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hero-seek-slider:active::-webkit-slider-thumb {
  transform: scale(1.45);
}

/* Staggered Card Entrance Animation */
@keyframes cardEntranceFadeUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.bento-card {
  animation: cardEntranceFadeUp 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--card-index, 0) * 40ms);
}
```

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero Layout Reflows:** Tooltip positioning MUST use `transform: translateX(-50%)` and `style.left`. Do NOT modify width, margin, or padding in mousemove loops.
- **Audio Guard:** `playTick()` should only fire when tooltip percent shifts noticeably (e.g., >= 1% change) to avoid flooding Web Audio queues.

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.html`: Scrubber wrapper and floating tooltip container.
2. `dashboard/dashboard.js`: `initPrecisionScrubber` and `animateNumberRoll`.
3. `dashboard/dashboard.css`: Scrubber styling, elastic slider thumb, and staggered animations.
4. `tests/test_dashboard_uiux_phase3.js`: Test runner verifying tooltip math, chapter tick placement, and rolling odometer loops.

---

## 🧪 7. Local Verification Gate

Execute the Phase 3 test suite:
```bash
node tests/test_dashboard_uiux_phase3.js
```
**Gate Certification Criteria:**
- Exit code must be `0`.
- Mousemove coordinate math passes all assertion tolerances.
- `node -c dashboard/dashboard.js` passes with 0 syntax errors.
