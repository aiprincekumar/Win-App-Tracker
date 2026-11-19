# Phase 1: UI/UX Layout Overhaul (CSS Grid 24-Col Full Width, Zero Scrollbar)

> **Document Type:** Standalone Executable Phase Prompt  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Phase Identifier:** `PHASE-01-HEATMAP-UIUX-LAYOUT`  
> **Target Subsystems:** `dashboard/dashboard.css`, `dashboard/styles/tracking.css`, `dashboard/dashboard.html`  
> **Responsible Subagent:** Level 4 Frontend Engineer Subagent  
> **Allocated Department:** Dept 05 (Frontend Engineering)  
> **Allocated Skills:** `frontend-patterns`, `shadcn-ui`, `make-interfaces-feel-better`  
> **Required Authorization:** `AUTH-MGR-*` token issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Overhaul the CSS Grid architecture of the 7x24 Chrono-Activity Heatmap to deliver a responsive, fluid layout spanning 100% of the parent card width. Completely eliminate the horizontal scrollbar caused by fixed `repeat(24, minmax(14px, 20px))` column definitions and `overflow-x: auto`. Ensure full alignment of hour labels (00–23) and day labels (Mon–Sun) across both dark and light modes.

---

## 🛠️ 2. File Anchors & Technical Context

- `dashboard/dashboard.css`: Lines 8206–8240 (`.heatmap-card-compact`, `.chrono-heatmap-wrapper`, `.chrono-heatmap-grid`, `.heatmap-cell`) and Lines 2415–2500 (`.chrono-heatmap-container`).
- `dashboard/styles/tracking.css`: Lines 1131–1165 and Lines 745–830.
- `dashboard/dashboard.html`: Lines 537–575 (`#cardChronoHeatmap`, `#heatmapGridContainer`, `.heatmap-legend-bar`).

---

## 📋 3. Step-by-Step Surgical Implementation Instructions

### Step 1.1: Refactor Heatmap Wrapper to Eliminate Overflow
In both `dashboard/dashboard.css` and `dashboard/styles/tracking.css`:
1. Locate `.chrono-heatmap-wrapper` (around line 8210 / line 1135).
2. Change `overflow-x: auto;` to `overflow-x: hidden !important;`.
3. Set `width: 100% !important;` and `box-sizing: border-box;`.
4. Ensure padding is balanced: `padding: 0.5rem 0;`.

### Step 1.2: Implement Fluid 24-Column CSS Grid
In both `dashboard/dashboard.css` and `dashboard/styles/tracking.css`:
1. Locate `.chrono-heatmap-grid` (around line 8216 / line 1141).
2. Replace:
   ```css
   grid-template-columns: 44px repeat(24, minmax(14px, 20px)) !important;
   justify-content: start;
   ```
   with:
   ```css
   grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr)) !important;
   width: 100% !important;
   box-sizing: border-box !important;
   gap: 3px !important;
   align-items: center;
   ```
3. Remove `justify-content: start;` so the 24 columns stretch to fill the exact full width of the parent container.

### Step 1.3: Responsive Fluid Cell Geometry
1. In `.heatmap-cell`:
   - Set `width: 100% !important;`
   - Remove `max-width: 20px !important;`
   - Set `height: clamp(14px, 1.8vw, 22px) !important;`
   - Set `border-radius: 3px !important;`
   - Ensure `transition: transform 120ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 120ms ease;`
2. In `.heatmap-hour-label`:
   - Set `text-align: center;`
   - Set `font-size: clamp(9px, 0.75vw, 11px);`
   - Set `font-family: var(--font-mono, monospace);`
3. In `.heatmap-day-label`:
   - Set `font-size: clamp(10px, 0.8vw, 12px);`
   - Set `font-weight: 600;`

### Step 1.4: Dual Theme Hover & Focus Rings
1. Add hover zoom effects:
   ```css
   .heatmap-cell:hover, .heatmap-cell:focus-visible {
     transform: scale(1.22) !important;
     z-index: 10;
     outline: none;
   }
   ```
2. Ensure `.chrono-heatmap-grid[data-active-mode="focus"] .heatmap-cell:hover` casts emerald glow (`box-shadow: 0 0 10px var(--accent-emerald, #10b981) !important;`).
3. Ensure `.chrono-heatmap-grid[data-active-mode="media"] .heatmap-cell:hover` casts fuchsia/violet glow (`box-shadow: 0 0 10px var(--accent-magenta, #ec4899) !important;`).

---

## 🚫 4. Architectural Constraints & Boundaries

- **Zero JavaScript Logic Mutations:** Do not alter data aggregation or matrix calculations in this phase; focus strictly on CSS styling and HTML attributes.
- **Universal Rule 28:** Any helper CSS rule or style block must remain concise and well-commented.
- **W3C Zero-innerHTML:** Do not inject HTML via strings.
- **UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF` encoding on all touched files.

---

## 🧪 5. Local Verification Gate

Execute layout verification:
```powershell
node -e "const css = require('fs').readFileSync('dashboard/dashboard.css', 'utf8'); console.log('Scrollbar removed:', css.includes('overflow-x: hidden') && css.includes('repeat(24, minmax(0, 1fr))'));"
```
Ensure exit code 0.
