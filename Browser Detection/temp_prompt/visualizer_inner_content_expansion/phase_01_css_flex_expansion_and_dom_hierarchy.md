# Phase 1 Execution Prompt: CSS Flexbox Expansion Engine & DOM Alignment
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective

Refactor the internal CSS flexbox layout and DOM classes of the **Real-Time Spectrum Visualizer** in `dashboard/dashboard.html`, `dashboard/styles/media.css`, and `dashboard/dashboard.css`:
1. Expand the inner UI content to fill the outer container vertically without leaving dead space.
2. **STRICT INVARIANT:** DO NOT modify outer container bounds, bento grid spans (`bento-span-4 bento-row-span-2`), outer card padding, borders, or `min-height: 380px`.
3. Eliminate the hardcoded `height: 130px; min-height: 120px;` from `.visualizer-canvas-container`, replacing it with elastic flex-grow (`flex: 1 1 auto; height: 100%; min-height: 180px;`).
4. Ensure `.visualizer-card-body` and `.visualizer-panel` have `flex: 1 1 auto; height: 100%; min-height: 0;` and unbroken vertical flex distribution.
5. Provide matching dark and light mode (`body.theme-light`) CSS token coverage.

---

## 📂 2. Target Files & Anchors

- **HTML Document:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L737-L815)
- **Primary Media Stylesheet:** [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1010-L1150)
- **Consolidated Stylesheet:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L3605-L3660) & [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L5920-L6400)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 1.1: Verify DOM Class Anchor in `dashboard/dashboard.html`
In line 738 of `dashboard/dashboard.html`:
Ensure the card element contains the `visualizer-hero-card` class alongside existing bento classes:
```html
<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2 visualizer-hero-card">
```
Verify that `visualizer-card-header`, `visualizer-card-body`, `visualizer-panel`, `visualizer-controls-bar`, `visualizer-canvas-container`, and `vu-meters-container` maintain clean semantic nesting.

### Step 1.2: Refactor CSS in `dashboard/styles/media.css`
Update the visualizer container rules:
1. **`.visualizer-card-body`**:
   ```css
   .visualizer-card-body,
   #heroAudioLabStatus .visualizer-card-body {
     display: flex !important;
     flex-direction: column !important;
     flex: 1 1 auto !important;
     height: 100% !important;
     min-height: 0 !important;
     justify-content: space-between !important;
     gap: 8px !important;
     padding-top: 0.5rem;
   }
   ```
2. **`.visualizer-panel`**:
   ```css
   .visualizer-hero-card .visualizer-panel,
   #heroAudioLabStatus .visualizer-panel {
     background: transparent !important;
     border: none !important;
     padding: 0 !important;
     margin-top: 0 !important;
     flex: 1 1 auto !important;
     display: flex !important;
     flex-direction: column !important;
     justify-content: space-between !important;
     height: 100% !important;
     min-height: 0 !important;
     gap: 8px !important;
   }
   ```
3. **`.visualizer-canvas-container`**:
   ```css
   .visualizer-canvas-container,
   #heroAudioLabStatus .visualizer-canvas-container {
     width: 100% !important;
     flex: 1 1 auto !important;
     height: 100% !important;
     min-height: 180px !important;
     background: var(--viz-canvas-bg, rgba(10, 15, 28, 0.85));
     border-radius: 10px;
     overflow: hidden;
     border: 1px solid var(--viz-canvas-border, rgba(99, 102, 241, 0.2));
     box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);
     position: relative;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   ```
4. **`.vu-meters-container`**:
   ```css
   .vu-meters-container,
   #heroAudioLabStatus .vu-meters-container {
     flex-shrink: 0 !important;
     margin-top: auto !important;
     padding: 6px 12px !important;
     gap: 4px !important;
   }
   ```

### Step 1.3: Synchronize `dashboard/dashboard.css`
Mirror the exact changes in `dashboard/dashboard.css` (or run `node scripts/build_css_modules.js` if configured).

---

## 🚦 4. Verification Gate

Execute verification check:
```powershell
node tests/test_visualizer_toolbar_buttons_fix.js
node tests/test_visualizer_compact_fullscreen_embed.js
```
Must pass with exit code 0.
