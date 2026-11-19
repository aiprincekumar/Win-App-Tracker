# 🌙 Phase 1: Micro-Widget HTML Markup & CSS Keyframes/Styling

> **Phase Identifier:** Phase 1 of 4  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Target Execution Strategy:** Strategy A — Fully Autonomous Execution  
> **Assigned Role:** Level 4 UI/Frontend Engineer  

---

## 🎯 1. Phase Objective
Verify, refine, and finalize the HTML semantic markup for `#sleepLiveMicroWidget` in the left navigation sidebar of `dashboard/dashboard.html`, and implement the required CSS classes, hover micro-interactions, and deep-link glow animations in `dashboard/styles/layout.css` and `dashboard/styles/components.css`.

---

## 📦 2. Prerequisites & Inputs
- Workspace root: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Existing Focus Sentinel micro-widget in `dashboard/dashboard.html` lines 79-95.
- CSS files: `dashboard/styles/layout.css`, `dashboard/styles/components.css`.

---

## 🔍 3. Technical Context & File Anchors
- [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L90-L120): Inside `.sidebar-hud-group`, beneath `#wellbeingLiveMicroWidget` and above `#sidebarDataHubCard`.
- [`dashboard/styles/components.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/components.css#L180-L240): Deep-link navigation highlight keyframes and pulsing button animations.
- [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css#L250-L280): Sidebar micro-widget card hover and layout transitions.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Verify HTML Markup in `dashboard/dashboard.html`
Ensure the following markup block is cleanly placed inside `<div class="sidebar-hud-group">`:
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

### Step 1.2: Add Micro-HUD Styles in `dashboard/styles/layout.css`
Add `.sleep-micro-hud` styling matching `.wellbeing-micro-hud`:
```css
.sleep-micro-hud {
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.18s ease, box-shadow 0.18s ease;
  margin-bottom: 12px;
}

.sleep-micro-hud:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.15);
}
```

### Step 1.3: Add Keyframes & Classes in `dashboard/styles/components.css`
Add `@keyframes sleepSentinelGlow`, `@keyframes sleepStartBtnPulse`, `.sleep-card-highlight`, `.highlight-pulse`, and `@media (prefers-reduced-motion: reduce)` overrides per `DESIGN.md`.

---

## 🚧 5. Constraints & Boundaries
- Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited files.
- Zero innerHTML usage.
- Do not alter existing layout styling for `.wellbeing-micro-hud` or `#sidebarDataHubCard`.

---

## 📄 6. Deliverables Manifest
- Modified: `dashboard/dashboard.html`
- Modified: `dashboard/styles/layout.css`
- Modified: `dashboard/styles/components.css`

---

## ✅ 7. Local Verification Gate
Run in terminal:
```powershell
node -e "
const fs = require('fs');
const html = fs.readFileSync('dashboard/dashboard.html', 'utf8');
const comp = fs.readFileSync('dashboard/styles/components.css', 'utf8');
const lay = fs.readFileSync('dashboard/styles/layout.css', 'utf8');
if (!html.includes('id=\"sleepLiveMicroWidget\"')) throw new Error('Missing sleepLiveMicroWidget in HTML');
if (!comp.includes('@keyframes sleepSentinelGlow')) throw new Error('Missing sleepSentinelGlow');
if (!comp.includes('.sleep-card-highlight')) throw new Error('Missing sleep-card-highlight');
if (!lay.includes('.sleep-micro-hud')) throw new Error('Missing .sleep-micro-hud');
console.log('Phase 1 Verification Gate Passed!');
"
```
