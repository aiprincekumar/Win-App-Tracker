# Phase 2: CSS Pagination & Two-Part Layout Refinement

> **Phase ID:** `PHASE-02-CSS-PAGINATION-AND-LAYOUT-REFINEMENT`  
> **Target Subsystems:** `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css`  
> **Assigned Agent:** Level 4 Frontend Execution Subagent  
> **Prerequisites:** Phase 1 Completed & Verified (Gate 1 Pass).  
> **Governance:** Universal Rule 28 (`backup_digest.css` line count <= 650 lines; functions <= 50 lines, max depth <= 3).  

---

## 🎯 1. Phase Objective
Refine the print stylesheet embedded inside `generateExecutiveDigestHtml` (`EXECUTIVE_DIGEST_CSS`) and synchronize supporting print definitions in `dashboard/styles/backup_digest.css` and `dashboard/dashboard.css`. Guarantee that:
1. **Part 1 (Time Tracking & Circadian Focus)** occupies Page 1 cleanly without premature breaks or blank voids.
2. **Part 2 (Media Analytics & Streaming Telemetry)** strictly begins on a fresh page via `break-before: page !important; page-break-before: always !important;`.
3. Multi-page data tables cleanly repeat their header rows (`thead { display: table-header-group !important; }`) and prevent mid-row tearing (`tr { break-inside: avoid !important; }`).
4. `dashboard/styles/backup_digest.css` remains strictly under the 650-line CI ceiling.

---

## 📂 2. Target Files & Line Anchors

1. **`src/dashboard/features/backup_hub_digest_feature.js`:**
   - Anchor: Lines 824–1226 (`const EXECUTIVE_DIGEST_CSS`).
   - Action: Calibrate `@media print` rules, landscape `@page` settings, `.part-tracking-section`, and `.part-media-section`.
2. **`dashboard/styles/backup_digest.css`:**
   - Anchor: Lines 550–636 (`@media print` section).
   - Action: Harmonize iframe and standalone print definitions while keeping total file line count <= 650 lines.
3. **`dashboard/dashboard.css`:**
   - Anchor: `@media print` rules.
   - Action: Synchronize page break contracts and container visibility for fallback mode.

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 2.1: Refine `EXECUTIVE_DIGEST_CSS` in `backup_hub_digest_feature.js`
In `src/dashboard/features/backup_hub_digest_feature.js` (inside `EXECUTIVE_DIGEST_CSS`):
1. **Landscape `@page` Configuration:**
   ```css
   @page {
     size: A4 landscape;
     margin: 10mm 12mm 10mm 12mm;
   }
   ```
2. **Part 1 Guard (Page 1 Integrity):**
   ```css
   .part-tracking-section {
     display: block !important;
     width: 100% !important;
     break-after: avoid !important;
     page-break-after: avoid !important;
   }
   ```
   - Keep 10-KPI cards compact: `padding: 6px 10px !important;` with `.metric-val { font-size: 1.15rem !important; }`.
   - Protect Chrono Heatmap: `.chrono-heatmap-section { break-inside: avoid !important; page-break-inside: avoid !important; margin-bottom: 12px !important; }`.
   - Set donut chart wrapper to compact dimensions: `width: 100px !important; height: 100px !important;`.
3. **Part 2 Strict Page Break Before (Starts on Page 2):**
   ```css
   .part-media-section {
     display: block !important;
     width: 100% !important;
     page-break-before: always !important;
     break-before: page !important;
     margin-top: 0 !important;
     padding-top: 8px !important;
   }
   ```
   - Protect 10-KPI Media Grid from fragmentation: `.media-metrics-grid { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 8px !important; margin-bottom: 12px !important; break-inside: avoid !important; page-break-inside: avoid !important; }`.
4. **Table Pagination & Fragmentation Guards:**
   ```css
   table {
     width: 100% !important;
     border-collapse: collapse !important;
     page-break-inside: auto !important;
     break-inside: auto !important;
     margin-bottom: 14px !important;
   }
   thead { display: table-header-group !important; }
   tbody { display: table-row-group !important; }
   tr {
     page-break-inside: avoid !important;
     break-inside: avoid !important;
   }
   th, td {
     padding: 5px 8px !important;
     font-size: 0.8rem !important;
   }
   ```

---

### Step 2.2: Harmonize Stylesheets & Enforce Line Count Ceilings
1. **`dashboard/styles/backup_digest.css`:**
   - Ensure print rules support `#sentinelPrintIframe` and fallback container `#printFallbackContainer`.
   - Measure total lines: `(Get-Content dashboard/styles/backup_digest.css).Length`.
   - **CRITICAL INVARIANT:** Must strictly measure <= 650 lines. Consolidate redundant whitespace or selectors if needed to preserve sufficient CI headroom.
2. **`dashboard/dashboard.css`:**
   - Synchronize print declarations for `.part-media-section` and `#sentinelPrintIframe`.

---

## 🚫 4. Architectural Boundaries & Constraints
- **Strict Prohibition on CSS Regressions:** Do NOT break or mutate Dark Mode styles (`media.css`, `visualizer_deck.css`, `wellbeing_blacklist.css`).
- **Zero Blank Void Guarantee:** Avoid assigning `break-inside: avoid !important` to multi-component parent wrappers. Restrict avoidance exclusively to atomic cards (`.metric-card`, `tr`) and single sections (`.chrono-heatmap-section`).
- **File Length Ceiling:** `backup_digest.css` MUST NOT exceed 650 lines under any circumstance.

---

## 🧪 5. Local Verification Gate
Execute PowerShell check to verify stylesheet lines:
```powershell
powershell -Command "$lines = (Get-Content 'dashboard/styles/backup_digest.css').Length; Write-Host ('backup_digest.css lines: ' + $lines); if ($lines -gt 650) { exit 1 } else { exit 0 }"
```
Verify that `EXECUTIVE_DIGEST_CSS` contains both `size: A4 landscape` and `page-break-before: always !important` for `.part-media-section`.
