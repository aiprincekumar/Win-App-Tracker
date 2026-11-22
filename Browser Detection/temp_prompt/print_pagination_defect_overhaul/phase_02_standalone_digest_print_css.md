# Phase 02: Standalone Digest Print CSS Overhaul

> **Document:** `temp_prompt/print_pagination_defect_overhaul/phase_02_standalone_digest_print_css.md`  
> **Phase:** 02 of 03  
> **Target Files:**  
> - `src/dashboard/features/backup_hub_digest_feature.js` (Lines ~824-1065 inside `EXECUTIVE_DIGEST_CSS`)  
> **Assigned Role:** Level 4 Frontend Engineering Specialist  
> **Authorization Token:** `AUTH-MGR-<timestamp>-print-p2`  

---

## 🎯 1. Phase Objective

Refactor the embedded `@media print` rules inside `EXECUTIVE_DIGEST_CSS` within `backup_hub_digest_feature.js`. Remove premature `break-inside: avoid` on the composite `.chart-section`, compact the 4-card KPI summary grid, calibrate donut chart dimensions, and guarantee resilient multi-page table fragmentation with repeated headers.

---

## 📦 2. Prerequisites & Inputs

- Successful completion of Phase 01.
- Read and anchor to:
  - `temp_prompt/print_pagination_defect_overhaul/INDEX.md`
  - `temp_prompt/print_pagination_defect_overhaul/TRD.md`
- Target file verified:
  - `src/dashboard/features/backup_hub_digest_feature.js`

---

## 🔍 3. Technical Context & File Anchors

- **`src/dashboard/features/backup_hub_digest_feature.js`:**
  - Lines ~824-854: Screen layout defaults (`.digest-container`).
  - Lines ~901-933: Screen `.metrics-grid` and `.metric-card`.
  - Lines ~940-958: Screen `.chart-section` and `.donut-wrapper`.
  - Lines ~988-1009: Screen `table`, `th`, `td`.
  - Lines ~1051-1065: Current `@media print` definition containing:
    ```css
    tr, .metric-card, .chart-section { page-break-inside: avoid !important; break-inside: avoid !important; }
    ```

---

## 🔨 4. Surgical Step-by-Step Instructions

### Step 1: Remove `break-inside: avoid` from `.chart-section`
In `EXECUTIVE_DIGEST_CSS` under `@media print`:
Replace:
```css
tr, .metric-card, .chart-section { page-break-inside: avoid !important; break-inside: avoid !important; }
```
With:
```css
/* Allow chart section and table to break naturally */
.chart-section, table {
  page-break-inside: auto !important;
  break-inside: auto !important;
}

/* Atomic protection strictly on rows and individual metric cards */
tr, .metric-card {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
```

### Step 2: Compact `.metrics-grid` in Print Media
Add print-specific metric card tuning:
```css
.metrics-grid {
  gap: 8px !important;
  margin-bottom: 12px !important;
  page-break-inside: auto !important;
  break-inside: auto !important;
}

.metric-card {
  padding: 8px 10px !important;
}

.metric-val {
  font-size: 1.15rem !important;
}
```

### Step 3: Compact `.chart-section` Dimensions
Prevent `.chart-section` from forcing an artificial page break by compacting padding and dimensions:
```css
.chart-section {
  padding: 10px 14px !important;
  margin-bottom: 14px !important;
  gap: 16px !important;
  background: #fafafa !important;
  border: 1px solid var(--border-strong) !important;
}

.donut-wrapper {
  width: 110px !important;
  height: 110px !important;
}

.donut-wrapper svg {
  width: 110px !important;
  height: 110px !important;
}
```

### Step 4: Robust Table Formatting & Repeated Headers
Ensure table fragmentation is impervious to clipping:
```css
table {
  page-break-inside: auto !important;
  break-inside: auto !important;
  width: 100% !important;
  border-collapse: collapse !important;
  margin-bottom: 14px !important;
}

th {
  padding: 6px 8px !important;
  font-size: 0.72rem !important;
  background: #f1f5f9 !important;
  border-bottom: 2px solid var(--border-strong) !important;
}

td {
  padding: 5px 8px !important;
  font-size: 0.8rem !important;
  border-bottom: 1px solid var(--border) !important;
}

thead { display: table-header-group !important; }
tbody { display: table-row-group !important; }
tfoot { display: table-footer-group !important; }
```

### Step 5: Header, Titles, and Container Reset
```css
.header {
  padding-bottom: 12px !important;
  margin-bottom: 14px !important;
  break-after: avoid !important;
}

.section-title {
  margin: 14px 0 8px 0 !important;
  font-size: 1rem !important;
  break-after: avoid !important;
  page-break-after: avoid !important;
}

.digest-container {
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}
```

---

## 🛡️ 5. Architectural Constraints & Boundaries

- **Universal Rule 28:** Do not modify surrounding functions; restrict edits to `EXECUTIVE_DIGEST_CSS`.
- **W3C Trusted Types:** No dynamic HTML string injections without escaping.
- **UTF-8 with BOM:** Preserve file encoding.

---

## 📋 6. Deliverables Manifest

- `src/dashboard/features/backup_hub_digest_feature.js` (Updated `EXECUTIVE_DIGEST_CSS`)

---

## 🚦 7. Local Verification Gate

- Run test script:
  ```powershell
  node tests/test_export_reports_data_and_layout_fix.js
  ```
- Verify absence of `.chart-section` from `break-inside: avoid`:
  ```powershell
  Select-String -Path "src/dashboard/features/backup_hub_digest_feature.js" -Pattern "\.chart-section.*break-inside:\s*avoid"
  ```
  (Must return 0 matches).
