# Phase 01: PDF Print Layout Page-Break & Table Flow Overhaul

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 01 of 03  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_01_page_break_overhaul.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css`  

---

## 🎯 1. Phase Objective
The objective of Phase 01 is to overhaul the `@media print` CSS engine across `dashboard/styles/backup_digest.css` and `dashboard/dashboard.css` to guarantee clean, unclipped, multi-page PDF generation in A4 landscape mode:
1. **Container Break Relaxation:** Remove `page-break-inside: avoid !important;` and `break-inside: avoid !important;` from multi-row table containers (`.domain-table-container`, `.table-card`, `.data-table-card`, `.table-responsive-container`). Set them to `break-inside: auto !important;` so that browsers paginate rows across pages without clipping content or forcing massive whitespace.
2. **Row & Cell Break Protection:** Enforce `page-break-inside: avoid !important; break-inside: avoid !important;` strictly on individual table rows (`tr`).
3. **Repeating Table Headers:** Guarantee `thead { display: table-header-group !important; }` and `tbody { display: table-row-group !important; }` so that table column headers appear at the top of every printed page.
4. **Anti-Orphan Headings:** Prevent section titles and headers from appearing isolated at the bottom of a page by setting `break-after: avoid !important; page-break-after: avoid !important;` on `h1, h2, h3, .section-title, .print-executive-header`.
5. **Card & Bento Protection:** Ensure standalone KPI cards (`.metric-card`, `.print-summary-card`, `.analytics-hero-card`), charts (`.chart-section`, `.donut-chart-container`), and `.print-executive-header` retain `break-inside: avoid !important;`.
6. **Landscape Overflow Reset:** Ensure `html, body, .dashboard-layout, .main-stage, .main-content` have `overflow: visible !important; width: 100% !important; max-width: 100% !important; height: auto !important; max-height: none !important;`.

---

## 📋 2. Prerequisites & Inputs
- Review existing print rules in:
  - [`dashboard/styles/backup_digest.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/backup_digest.css) (Lines 335–560)
  - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css) (Lines 7490–7620)
- UTF-8 with BOM must be preserved on all modified files.

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `dashboard/styles/backup_digest.css`
- **Lines 505–519:** Currently groups `.data-table-card, .table-card, .domain-table-container, .table-responsive-container, tr` under `page-break-inside: avoid !important;`.
  - Fix: Separate table containers from rows.
  - Set table containers to `break-inside: auto !important; page-break-inside: auto !important;`.
  - Retain `break-inside: avoid !important; page-break-inside: avoid !important;` for `tr`.
- **Lines 520–523:** `thead { display: table-header-group !important; }`. Ensure `tbody { display: table-row-group !important; }` and `tfoot { display: table-footer-group !important; }` are also explicitly declared.
- **Lines 411–417:** `.print-executive-header` has `break-after: avoid; page-break-after: avoid;`. Expand anti-orphan rules to include `.section-title`, `h1, h2, h3`.

### 3.2 `dashboard/dashboard.css`
- Lines 7495–7620: Synchronize the exact same print rules to maintain complete parity between the modular companion stylesheet and monolithic main stylesheet.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Refactor Table Container Break Rules in `backup_digest.css`
Replace:
```css
  /* Keep cards and table rows together without awkward page breaks */
  .print-executive-header,
  .metrics-grid,
  .metric-card,
  .analytics-hero-card,
  .donut-chart-container,
  .data-table-card,
  .table-card,
  .domain-table-container,
  .table-responsive-container,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
```
With:
```css
  /* Allow multi-page table containers to flow naturally across pages */
  .data-table-card,
  .table-card,
  .domain-table-container,
  .table-responsive-container {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

  /* Keep discrete cards, charts, headers, and individual rows together without mid-element breaks */
  .print-executive-header,
  .metrics-grid,
  .metric-card,
  .analytics-hero-card,
  .donut-chart-container,
  .chart-section,
  .print-summary-card,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Anti-orphan rules for headings */
  h1, h2, h3, .section-title, .print-executive-header {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  /* Repeat table headers cleanly on every printed page */
  thead {
    display: table-header-group !important;
  }
  tbody {
    display: table-row-group !important;
  }
```

### Step 1.2: Synchronize in `dashboard/dashboard.css`
Apply the identical clean page-break rules in `dashboard/dashboard.css` within the `@media print` block.

---

## 🛡️ 5. Architectural Constraints & Boundaries
- **No mutations to screen CSS:** Only modify rules inside `@media print` or `.print-executive-header`. The screen dashboard layout and dark mode styling must remain 100% untouched.
- **UTF-8 with BOM:** Files must maintain `0xEF, 0xBB, 0xBF` preamble.

---

## 📦 6. Deliverables Manifest
- Updated [`dashboard/styles/backup_digest.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/backup_digest.css)
- Updated [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)

---

## 🧪 7. Local Verification Gate
Run:
```bash
node tests/test_export_reports_data_and_layout_fix.js
```
Expected: Battery 2 passes with verified `break-inside: auto` on containers and `break-inside: avoid` on `tr`.
