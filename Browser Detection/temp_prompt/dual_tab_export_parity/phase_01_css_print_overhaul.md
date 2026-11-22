# Phase 1: CSS Print Overhaul & Multi-Tab Isolation

> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Phase:** 01 of 04  
> **Target Subsystem:** Dashboard Print Engine (`@media print`)  
> **Target Files:**  
> - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)  
> - [`dashboard/styles/backup_digest.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/backup_digest.css)  
> **Lead Role:** Level 4 Frontend Subagent  
> **Status:** `COMPLETED`  

---

## 🎯 1. Phase Objective
Unhide `#paneMedia` in `@media print` so that Media Analytics appears in printed PDFs alongside Time Tracking, format `#mediaMetricsGrid` into a symmetrical 5-column grid (2 rows of 5), unhide and format `#cardChronoHeatmap` for print view, insert an explicit page break before `#paneMedia`, and strictly suppress interactive media widgets. Ensure `dashboard/styles/backup_digest.css` does not exceed the 650-line CI ceiling per Universal Rule 28.

---

## 📋 2. Prerequisites & Inputs
1. Active workspace: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
2. Anchored memory: [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
3. Architecture specifications: [`TRD.md`](TRD.md) and [`DESIGN.md`](DESIGN.md)

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `dashboard/dashboard.css` (Lines 7520 - 7575)
- `#paneTracking` is styled with `display: block !important; opacity: 1 !important; visibility: visible !important;`.
- `#paneMedia` is currently grouped under `display: none !important;`:
  ```css
  #paneSettings,
  #paneMedia,
  #paneAutomations,
  #paneStudio {
    display: none !important;
  }
  ```
- Non-printable suppression list currently lacks `#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, `.heatmap-controls-row`, and `#btnScrollTopMediaHistory`.

### 3.2 `dashboard/styles/backup_digest.css` (Lines 420 - 621)
- Currently measures 621 lines.
- Contains modular mirror of `@media print` rules. Must stay strictly under 650 lines.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Unhide `#paneMedia` in `dashboard/dashboard.css`
1. Update `#paneTracking` rule to also include `#paneMedia`:
   ```css
   #paneTracking,
   #paneMedia {
     display: block !important;
     opacity: 1 !important;
     visibility: visible !important;
     width: 100% !important;
     max-width: 100% !important;
     padding: 0 !important;
     margin: 0 !important;
     box-sizing: border-box !important;
     overflow: visible !important;
   }
   ```
2. Remove `#paneMedia` from the hidden tabs group:
   ```css
   #paneSettings,
   #paneAutomations,
   #paneStudio {
     display: none !important;
   }
   ```
3. Add page break before `#paneMedia`:
   ```css
   #paneMedia {
     page-break-before: always !important;
     break-before: page !important;
   }
   ```

### Step 2: Format `#mediaMetricsGrid` (5x2 Grid) in `dashboard/dashboard.css`
1. Group `#mediaMetricsGrid` and `.kpi-grid-5x2` with `.metrics-grid` in the print grid declaration:
   ```css
   .metrics-grid,
   #mediaMetricsGrid,
   .kpi-grid-5x2 {
     display: grid !important;
     grid-template-columns: repeat(5, 1fr) !important;
     gap: 8px !important;
     margin-bottom: 12px !important;
     width: 100% !important;
     page-break-inside: auto !important;
     break-inside: auto !important;
   }
   ```
2. Ensure individual cards carry atomic page-break avoidance:
   ```css
   .metrics-grid .metric-card,
   #mediaMetricsGrid .metric-card {
     width: 100% !important;
     max-width: 100% !important;
     min-width: 0 !important;
     padding: 8px 10px !important;
     margin: 0 !important;
     box-sizing: border-box !important;
     page-break-inside: avoid !important;
     break-inside: avoid !important;
   }
   ```

### Step 3: Format `#cardChronoHeatmap` in `dashboard/dashboard.css`
1. Ensure `#cardChronoHeatmap` is protected from page break clipping:
   ```css
   #cardChronoHeatmap {
     display: block !important;
     width: 100% !important;
     max-width: 100% !important;
     page-break-inside: avoid !important;
     break-inside: avoid !important;
     margin-bottom: 14px !important;
   }

   .chrono-heatmap-container,
   .chrono-heatmap-wrapper {
     overflow: visible !important;
     width: 100% !important;
   }

   .chrono-heatmap-grid {
     display: grid !important;
     grid-template-columns: minmax(36px, 48px) repeat(24, minmax(0, 1fr)) !important;
     gap: 2px !important;
     width: 100% !important;
   }
   ```

### Step 4: Suppress Interactive Media Widgets in `dashboard/dashboard.css`
Add the following selectors to the print suppression block:
```css
#multiTabMediaDeckContainer,
#heroMediaPlayerCard,
#heroAudioLabStatus,
.heatmap-controls-row,
.heatmap-mode-toggles,
#heatmapWowBadge,
#heatmapCellTooltip,
.media-deck-header-actions,
.hero-controls-group,
.hero-progress-section,
.hero-volume-section,
.hero-advanced-row,
.audio-lab-widget,
#btnScrollTopMediaHistory
```

### Step 5: Synchronize `dashboard/styles/backup_digest.css` & Enforce Line Ceiling
1. Apply identical print rules to `dashboard/styles/backup_digest.css`.
2. Group selectors cleanly to keep line additions under 25 lines.
3. Verify file length: `(Get-Content 'dashboard/styles/backup_digest.css').Length <= 650`.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- **DO NOT** modify screen-media CSS rules outside `@media print`.
- **DO NOT** edit JavaScript files in this phase.
- **DO NOT** exceed 650 lines in `backup_digest.css`.

---

## 📦 6. Deliverables Manifest
1. `dashboard/dashboard.css`: Updated `@media print` with `#paneMedia` unhiding, 5x2 media grid, heatmap styling, and interactive widget suppression.
2. `dashboard/styles/backup_digest.css`: Synchronized `@media print` definitions keeping length <= 650 lines.

---

## 🚦 7. Local Verification Gate
```powershell
# 1. Verify backup_digest.css line count
node -e "const lines = require('fs').readFileSync('dashboard/styles/backup_digest.css', 'utf8').split('\n').length; console.log('Lines:', lines); if (lines > 650) process.exit(1);"

# 2. Run initial print regression test
node tests/test_print_pagination_overhaul.js
```
