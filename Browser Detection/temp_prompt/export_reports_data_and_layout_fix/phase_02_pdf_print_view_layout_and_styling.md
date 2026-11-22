# Phase 02: PDF Print View Layout & Styling Overhaul

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 02 of 04  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_02_pdf_print_view_layout_and_styling.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css`, `dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/backup_hub_digest_feature.js`  

---

## 🎯 1. Phase Objective
The objective of Phase 02 is to resolve all layout, visual formatting, and tab-visibility defects in the PDF Print view:
1. **Tab-Independent Print Visibility:** Ensure that clicking "Save PDF Executive Digest" from ANY tab (including `#paneSettings`, `#paneMedia`, or topbar dropdown) forces the main tracking report container (`#paneTracking` / `#tabContentTimeTracking`) to be visible and printable in `@media print`.
2. **Pristine White-Paper Print Stylesheet:** Overhaul `@media print` rules in `dashboard/styles/backup_digest.css` (and mirrored in `dashboard.css`) to eliminate dark background bleed, translucent gradients, and low-contrast text. Enforce pure white surfaces (`#ffffff`), dark slate typography (`#0f172a`), distinct borders (`#cbd5e1`), and high-contrast table styling.
3. **Multi-Page Pagination & Page-Break Discipline:** Implement `@page { size: A4 portrait; margin: 15mm 12mm; }` and strict `page-break-inside: avoid; break-inside: avoid;` across cards, charts, and table rows to prevent awkward clipping across page boundaries.
4. **Header Data Hydration:** In `backup_hub_digest_feature.js`'s `triggerPrintPdf()`, dynamically hydrate `#printReportTitle`, `#printReportPeriod`, `#printStatTotalTime`, `#printStatTopDomain`, `#printStatProductivity`, and `#printStatMediaTime` with real formatted strings.

---

## 📋 2. Prerequisites & Environment State
- Successful completion and verification of Phase 01 (data binding & hydration).
- Existing files to inspect and modify:
  - [`dashboard/styles/backup_digest.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/backup_digest.css)
  - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
  - [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `dashboard/styles/backup_digest.css` Anchors
- **Lines 330–458:** `@media print` block. Currently hides `.sidebar`, `.dashboard-header-actions`, etc. Fails to force `#paneTracking { display: block !important; }`. If `#paneTracking` lacks class `active` (because the user opened the dropdown while viewing Settings), `#paneTracking` is hidden (`display: none`), printing blank pages!
- **Lines 447–458:** Table borders and card rules need comprehensive high-contrast overrides for metric cards, category badges, donut chart text, and progress bars.

### 3.2 `src/dashboard/features/backup_hub_digest_feature.js` Anchors
- **Lines 821–850:** `triggerPrintPdf(options)`. It creates or populates `#printExecutiveHeader`, setting `totalTime`, `topDomain`, `productivity`, `mediaTime`. Must also populate `#printReportPeriod` from `options.reportingPeriod` and `#printReportTitle` from `options.title`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Enforce Tab-Independent Print Visibility in CSS
In `dashboard/styles/backup_digest.css` (and mirrored in `dashboard/dashboard.css` under the `@media print` section):
1. Add explicit display rule for `#paneTracking`:
   ```css
   @media print {
     /* Force tracking analytics panel visible in print even if another tab was active */
     #paneTracking {
       display: block !important;
       opacity: 1 !important;
       visibility: visible !important;
     }

     /* Ensure other tabs remain strictly hidden during report print */
     #paneSettings,
     #paneMedia,
     #paneAutomations,
     #paneStudio {
       display: none !important;
     }
   }
   ```

### Step 2.2: Refactor `@media print` Paper Geometry & Typography
In `dashboard/styles/backup_digest.css` (and `dashboard.css`):
1. Define `@page`:
   ```css
   @page {
     size: A4 portrait;
     margin: 15mm 12mm 15mm 12mm;
   }
   ```
2. Reset container colors, backgrounds, and drop shadows:
   ```css
   @media print {
     html, body, .dashboard-layout, .main-content, .tab-content-container {
       background: #ffffff !important;
       color: #0f172a !important;
       box-shadow: none !important;
     }

     /* Executive Header Styling */
     .print-executive-header {
       display: block !important;
       border-bottom: 2px solid #0f172a !important;
       padding-bottom: 14px !important;
       margin-bottom: 20px !important;
       break-after: avoid;
       page-break-after: avoid;
     }

     .print-summary-grid {
       display: grid !important;
       grid-template-columns: repeat(4, 1fr) !important;
       gap: 12px !important;
       margin-top: 14px !important;
     }

     .print-summary-card {
       background: #f8fafc !important;
       border: 1px solid #cbd5e1 !important;
       border-radius: 6px !important;
       padding: 10px 12px !important;
     }

     .print-stat-label {
       color: #64748b !important;
       font-size: 0.72rem !important;
       font-weight: 700 !important;
       text-transform: uppercase !important;
     }

     .print-stat-value {
       color: #0f172a !important;
       font-size: 1.25rem !important;
       font-weight: 800 !important;
       font-variant-numeric: tabular-nums !important;
     }
   }
   ```

### Step 2.3: Avoid Awkward Page Breaks Across Cards, Charts & Tables
Add strict break avoidance rules in `@media print`:
```css
@media print {
  .print-executive-header,
  .metrics-grid,
  .metric-card,
  .donut-chart-container,
  .data-table-card,
  .table-responsive-container,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  thead {
    display: table-header-group !important;
  }

  /* Domain Table Styling for Clean Monochrome & Color Printing */
  table.modern-data-table {
    border-collapse: collapse !important;
    width: 100% !important;
    border: 1px solid #cbd5e1 !important;
  }

  table.modern-data-table th {
    background: #f1f5f9 !important;
    color: #475569 !important;
    border-bottom: 2px solid #cbd5e1 !important;
    font-weight: 700 !important;
    font-size: 0.75rem !important;
    text-transform: uppercase !important;
    padding: 8px 10px !important;
  }

  table.modern-data-table td {
    color: #0f172a !important;
    border-bottom: 1px solid #e2e8f0 !important;
    padding: 8px 10px !important;
    font-size: 0.85rem !important;
  }
}
```

### Step 2.4: Enhance `triggerPrintPdf` in `backup_hub_digest_feature.js`
In `triggerPrintPdf(options)`:
1. Ensure `#printReportPeriod` is updated with `options.reportingPeriod || 'All Recorded Time'`.
2. Ensure `#printReportTitle` is updated if `options.title` is passed.
3. Update `#printStatTotalTime`, `#printStatTopDomain`, `#printStatProductivity`, `#printStatMediaTime` with the values passed in `options`.
4. Ensure `aria-hidden="false"` is set on `#printExecutiveHeader` before calling `win.print()`.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Universal Rule 28 Compliance:** Functions in JS must remain $\le 50$ lines with cyclomatic depth $\le 3$.
- **Universal Rule 5 & 8 (UTF-8 with BOM):** All touched CSS and JS files must have UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).
- **Screen Styles Unchanged:** `@media screen` rules and Dark Mode styles must remain 100% unaffected. All print styles must be scoped inside `@media print` blocks.

---

## 📦 6. Deliverables Manifest
- Modified: [`dashboard/styles/backup_digest.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/backup_digest.css)
- Modified: [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
- Modified: [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)

---

## ✅ 7. Local Verification Gate
Execute the following verification script in the project root:
```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('dashboard/styles/backup_digest.css', 'utf8');
if (!css.includes('#paneTracking') || !css.includes('display: block !important')) {
  throw new Error('#paneTracking display override missing in @media print');
}
if (!css.includes('page-break-inside: avoid')) {
  throw new Error('page-break-inside rules missing in @media print');
}
console.log('✅ Phase 02 Print CSS Verification Passed!');
"
```
Command must exit with code 0.
