# Phase 2: Temporal Aggregation (Forced 7d Rolling Window) & Mode Differentiation

> **Document Type:** Standalone Executable Phase Prompt  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Phase Identifier:** `PHASE-02-TEMPORAL-AGGREGATION-MODES`  
> **Target Subsystems:** `src/dashboard/features/temporal_productivity_feature.js`, `dashboard/dashboard.js`, `dashboard/dashboard.css`  
> **Responsible Subagent:** Level 4 Frontend Engineer Subagent  
> **Allocated Department:** Dept 05 (Frontend Engineering)  
> **Allocated Skills:** `frontend-patterns`, `code-simplification`  
> **Required Authorization:** `AUTH-MGR-*` token issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Refactor `aggregateChronoHeatmap` in `src/dashboard/features/temporal_productivity_feature.js` to strictly enforce a rolling 7-day window (`Today - 6d` through `Today`), preventing external date picker selections (such as single-day or 30-day queries) from destabilizing the 7x24 matrix. Additionally, implement complete visual and metric differentiation between Focus Browsing Time (Emerald palette) and Media Watch Time (Violet/Fuchsia palette), synchronizing mode toggle buttons, legend labels, tooltips, and Week-over-Week delta calculations.

---

## 🛠️ 2. File Anchors & Technical Context

- `src/dashboard/features/temporal_productivity_feature.js`: Lines 335–540 (`aggregateChronoHeatmap`), lines 565–645 (`renderChronoHeatmap`).
- `dashboard/dashboard.js`: Lines 2920–3010 (heatmap setup and mode button event listeners).
- `dashboard/dashboard.css`: Lines 2455–2500 (tier 0–4 color definitions for Focus & Media modes).

---

## 📋 3. Step-by-Step Surgical Implementation Instructions

### Step 2.1: Enforce Strict 7-Day Rolling Window in `aggregateChronoHeatmap`
1. In `src/dashboard/features/temporal_productivity_feature.js`, refactor the date calculation inside `aggregateChronoHeatmap`:
   ```javascript
   // Heatmap strictly visualizes the rolling 7-day window (Today - 6d through Today)
   const today = new Date();
   const formatYMD = (d) => {
     const y = d.getFullYear();
     const m = String(d.getMonth() + 1).padStart(2, '0');
     const day = String(d.getDate()).padStart(2, '0');
     return `${y}-${m}-${day}`;
   };
   const todayStr = formatYMD(today);
   const rollingStart = new Date(today);
   rollingStart.setDate(rollingStart.getDate() - 6);
   const startDate = formatYMD(rollingStart);
   const endDate = todayStr;
   const targetDates = getDatesInRange(startDate, endDate);
   ```
2. Ensure the resulting matrix has exactly 7 rows corresponding to Monday (0) through Sunday (6).
3. Compute WoW metrics by comparing `totalActiveTime` (or `totalMediaTime` depending on active mode) against the preceding 7-day window (`Today - 13d` to `Today - 7d`).

### Step 2.2: Implement Dual Mode Color Palettes in CSS
In `dashboard/dashboard.css` and `dashboard/styles/tracking.css`:
1. Add explicit tokens and classes for Media mode:
   ```css
   /* Focus Mode (Emerald) */
   .chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell[data-intensity="0"],
   .chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell[data-intensity="0"] { background: rgba(255, 255, 255, 0.04); }
   .chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell[data-intensity="1"],
   .chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell[data-intensity="1"] { background: rgba(16, 185, 129, 0.25); }
   .chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell[data-intensity="2"],
   .chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell[data-intensity="2"] { background: rgba(16, 185, 129, 0.50); }
   .chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell[data-intensity="3"],
   .chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell[data-intensity="3"] { background: rgba(16, 185, 129, 0.75); }
   .chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell[data-intensity="4"],
   .chrono-heatmap-grid:not([data-active-mode="media"]) .heatmap-cell[data-intensity="4"] { background: #10b981; }

   /* Media Mode (Violet / Fuchsia) */
   .chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell[data-intensity="0"] { background: rgba(255, 255, 255, 0.04); }
   .chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell[data-intensity="1"] { background: rgba(168, 85, 247, 0.25); }
   .chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell[data-intensity="2"] { background: rgba(168, 85, 247, 0.50); }
   .chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell[data-intensity="3"] { background: rgba(168, 85, 247, 0.75); }
   .chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell[data-intensity="4"] { background: #ec4899; box-shadow: 0 0 8px rgba(236, 72, 153, 0.4); }
   ```
2. Add light-theme mirrors for both Focus and Media modes under `body.theme-light`.

### Step 2.3: Wire Mode Toggling & Dynamic Re-Rendering in `renderChronoHeatmap`
1. In `renderChronoHeatmap`:
   - Set attribute `grid.setAttribute('data-active-mode', activeMode);`
   - Calculate cell intensity based on the active mode:
     `const sec = activeMode === 'media' ? (bucket.mediaSeconds || 0) : (bucket.activeSeconds || 0);`
     `const intensity = getIntensityTier(sec);`
   - Format tooltip to explicitly state mode:
     `title = "${dayFullNames[d]} ${hourStr}\n${activeMode === 'media' ? 'Media Watch Time' : 'Focus Time'}: ${durStr}\nTop: ${topDom}";`
2. In `dashboard/dashboard.js`:
   - Ensure clicking `#btnHeatmapModeFocus` and `#btnHeatmapModeMedia` invokes `renderChronoHeatmap` with the selected mode and updates the active class.
   - Synchronize `#valHeatmapWow` with the mode-specific WoW percentage.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Rule 28 Compliance:** Helper functions extracted (such as date range resolution or mode toggle handlers) must not exceed 50 lines. Max nesting depth <= 3.
- **W3C Trusted Types Compliance:** Zero `innerHTML` assignments.
- **UTF-8 with BOM Standard:** Maintain BOM on all modified files.

---

## 🧪 5. Local Verification Gate

Execute mode and rolling window verification:
```powershell
node -e "const f = require('./src/dashboard/features/temporal_productivity_feature.js'); const m = f.aggregateChronoHeatmap({}, 'today'); console.log('7 Rows:', m.length === 7 && m[0].length === 24);"
```
Ensure exit code 0.
