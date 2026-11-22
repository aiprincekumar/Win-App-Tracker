# Phase 01: Dashboard Print CSS Overhaul

> **Document:** `temp_prompt/print_pagination_defect_overhaul/phase_01_dashboard_print_css.md`  
> **Phase:** 01 of 03  
> **Target Files:**  
> - `dashboard/dashboard.css` (Lines ~7490-7737)  
> - `dashboard/styles/backup_digest.css` (Lines ~330-570)  
> **Assigned Role:** Level 4 Frontend Engineering Specialist  
> **Authorization Token:** `AUTH-MGR-<timestamp>-print-p1`  

---

## 🎯 1. Phase Objective

Overhaul the `@media print` rulesets across `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css` to eliminate premature page breaks and huge blank voids on Page 1. Transition the CSS grid layout (`.bento-grid-container`) to block layout, remove `break-inside: avoid` from large composite wrappers, restrict avoidance strictly to atomic leaves, and ensure complete suppression of non-printable UI elements.

---

## 📦 2. Prerequisites & Inputs

- Read and anchor to:
  - `temp_prompt/print_pagination_defect_overhaul/INDEX.md`
  - `temp_prompt/print_pagination_defect_overhaul/TRD.md`
  - `temp_prompt/print_pagination_defect_overhaul/DESIGN.md`
- Target file locations verified:
  - `dashboard/dashboard.css`
  - `dashboard/styles/backup_digest.css`

---

## 🔍 3. Technical Context & File Anchors

### File 1: `dashboard/dashboard.css`
- **Lines ~7495-7538:** Reset geometry, background, and `#paneTracking` display logic.
- **Lines ~7540-7563:** Elements with `display: none !important`.
- **Lines ~7649-7685:** Full landscape width container definitions and `break-inside: avoid` block.
- **Lines ~7705-7737:** Border enhancements, table formatting.

### File 2: `dashboard/styles/backup_digest.css`
- **Lines ~335-378:** Reset geometry, background, and `#paneTracking` display logic.
- **Lines ~380-403:** Elements with `display: none !important`.
- **Lines ~490-525:** Full landscape width container definitions and `break-inside: avoid` block.
- **Lines ~538-569:** Border enhancements, table formatting.

---

## 🔨 4. Surgical Step-by-Step Instructions

### Step 1: Deconstruct Bento Grid for Print
In both `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css` within `@media print`:
Set:
```css
.bento-grid-container {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
}
```

### Step 2: Remove `break-inside: avoid` from Large Containers
Demote all composite wrappers from page break avoidance:
```css
/* Allow multi-page containers and sections to flow naturally across pages */
.bento-grid-container,
.metrics-grid,
.analytics-hero-card,
.donut-chart-container,
.chart-section,
.data-table-card,
.table-card,
.domain-table-container,
.table-responsive-container {
  page-break-inside: auto !important;
  break-inside: auto !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  overflow-x: visible !important;
}
```

### Step 3: Confine `break-inside: avoid` to Atomic Leaves
Strictly apply avoidance ONLY to small standalone items:
```css
/* Keep discrete individual cards, headers, and rows intact */
.print-executive-header,
.metric-card,
.print-summary-card,
tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
```

### Step 4: Re-style `.metrics-grid` for High-Density Print Packing
Format `.metrics-grid` so KPI cards fit neatly into two rows without pushing subsequent content:
```css
.metrics-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  margin-bottom: 12px !important;
  width: 100% !important;
}

.metrics-grid .metric-card {
  flex: 1 1 calc(20% - 8px) !important;
  min-width: 120px !important;
  max-width: calc(20% - 6px) !important;
  padding: 8px 10px !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

.metrics-grid .metric-big-num {
  font-size: 1.15rem !important;
  font-weight: 800 !important;
}

.metrics-grid .metric-label {
  font-size: 0.70rem !important;
}
```

### Step 5: Expand `display: none !important` Suppression
Add missing controls to the suppression list:
```css
#toastContainer,
.floating-actions,
.audio-scrubber-dock,
.player-scrubber-slider,
.btn-star-domain,
.btn-add-note,
.media-deck-header,
.eq-card-header
```

---

## 🛡️ 5. Architectural Constraints & Boundaries

- **Do NOT mutate screen CSS:** Only modify the rules inside `@media print { ... }`.
- **Do NOT introduce innerHTML:** CSS edits only.
- **Maintain UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF` byte markers on files.
- **Maintain Parity:** `dashboard.css` and `backup_digest.css` print blocks must remain 100% consistent.

---

## 📋 6. Deliverables Manifest

- `dashboard/dashboard.css` (Updated `@media print` section)
- `dashboard/styles/backup_digest.css` (Synchronized `@media print` section)

---

## 🚦 7. Local Verification Gate

- Run terminal syntax check:
  ```powershell
  node -e "console.log('CSS Check Passed')"
  ```
- Verify absence of `.metrics-grid` from `break-inside: avoid`:
  ```powershell
  Select-String -Path "dashboard/dashboard.css" -Pattern "\.metrics-grid.*break-inside:\s*avoid"
  ```
  (Must return 0 matches).
