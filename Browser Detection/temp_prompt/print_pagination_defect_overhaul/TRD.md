# Technical Requirements Document (TRD) - Print Pagination Defect Overhaul

> **Document:** `temp_prompt/print_pagination_defect_overhaul/TRD.md`  
> **Target Subsystems:** CSS Print Engines (`dashboard.css`, `backup_digest.css`, `backup_hub_digest_feature.js`)  
> **Governance:** Universal Rule 28 Compliance, W3C CSS Paged Media Module Level 3  

---

## 🏗️ 1. High-Level Design (HLD)

The print rendering engine operates on a declarative CSS ruleset triggered by `@media print` media queries. The core architectural challenge is preventing Chromium / Blink from introducing artificial pagination gaps.

```
+-------------------------------------------------------------------------+
|                              @page (A4 Landscape)                       |
|                             10mm 12mm 10mm 12mm                         |
+-------------------------------------------------------------------------+
| 1. Executive Header (.print-executive-header)                           |
|    - margin-bottom: 12px !important; break-after: avoid;                |
+-------------------------------------------------------------------------+
| 2. KPI Summary Cards (.metrics-grid / .print-summary-grid)              |
|    - break-inside: auto !important; (Allows natural page flow)          |
|    - .metric-card / .print-summary-card: break-inside: avoid !important |
|    - gap: 8px !important; padding: 6px 10px !important;                |
+-------------------------------------------------------------------------+
| 3. Analytics Chart / Hero Section (.analytics-hero-card / .chart-sec)   |
|    - break-inside: auto !important;                                     |
|    - Compact heights & margins (margin-bottom: 12px !important)         |
+-------------------------------------------------------------------------+
| 4. Multi-Page Domain Table (table / .modern-data-table)                 |
|    - break-inside: auto !important; border-collapse: collapse !important|
|    - thead { display: table-header-group !important; }                  |
|    - tbody { display: table-row-group !important; }                     |
|    - tr { break-inside: avoid !important; } (Atomic avoidance)         |
|    - td, th { padding: 4px 8px !important; } (High density)            |
+-------------------------------------------------------------------------+
| 5. Print Footer (.footer / print metadata)                              |
|    - break-inside: avoid !important; margin-top: 16px !important;       |
+-------------------------------------------------------------------------+
```

---

## 🔧 2. Low-Level Design (LLD) Specifications

### 2.1 CSS Rule Refactoring in `dashboard/dashboard.css` & `dashboard/styles/backup_digest.css`

#### 1. Container Unlocking & Grid Deconstruction
```css
/* Unwind CSS grid container for print */
.bento-grid-container {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
}

/* Allow composite wrappers to break across pages naturally */
.bento-grid-container,
.metrics-grid,
.analytics-hero-card,
.chart-section,
.donut-chart-container,
.data-table-card,
.table-card,
.domain-table-container,
.table-responsive-container {
  page-break-inside: auto !important;
  break-inside: auto !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* Atomic leaf protection: strictly on small standalone items */
.print-executive-header,
.metric-card,
.print-summary-card,
tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
```

#### 2. Layout Transformation of `.metrics-grid` in Print
```css
/* High-density horizontal KPI flow */
.metrics-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  margin-bottom: 14px !important;
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
```

#### 3. Complete Non-Printable UI Elimination
```css
.sidebar,
.top-app-bar,
.dashboard-header-actions,
.btn,
.btn-action-outline,
.temporal-subtabs,
.search-container,
.browser-filter-container,
.modal-backdrop,
.omni-modal-overlay,
.sticky-mini-player-dock,
.settings-card,
#heroAudioLabStatus,
#canvasAudioVisualizer,
#customDateRangePicker,
#btnSidebarReconnectHub,
#dataHubBadge,
.table-search-filter,
.table-sort-wrapper,
.table-pagination-footer,
.no-print,
#toastContainer,
.floating-actions,
.audio-scrubber-dock,
.player-scrubber-slider,
.btn-star-domain,
.btn-add-note,
.media-deck-header,
.eq-card-header {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
```

### 2.2 CSS Rule Refactoring in `src/dashboard/features/backup_hub_digest_feature.js`

Within `EXECUTIVE_DIGEST_CSS`:
```css
@media print {
  @page {
    size: A4 landscape;
    margin: 10mm 12mm 10mm 12mm;
  }
  body {
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #0f172a !important;
  }
  .digest-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .no-print {
    display: none !important;
  }
  .header {
    padding-bottom: 12px !important;
    margin-bottom: 14px !important;
    break-after: avoid !important;
  }
  .metrics-grid {
    gap: 8px !important;
    margin-bottom: 14px !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
  }
  .metric-card {
    padding: 8px 10px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .metric-val {
    font-size: 1.15rem !important;
  }
  .chart-section {
    padding: 10px 14px !important;
    margin-bottom: 14px !important;
    gap: 16px !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
  }
  .donut-wrapper {
    width: 110px !important;
    height: 110px !important;
  }
  .section-title {
    margin: 14px 0 8px 0 !important;
    font-size: 1rem !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
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
  }
  td {
    padding: 5px 8px !important;
    font-size: 0.8rem !important;
  }
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  thead { display: table-header-group !important; }
  tbody { display: table-row-group !important; }
  tfoot { display: table-footer-group !important; }
  .footer {
    margin-top: 14px !important;
    padding-top: 8px !important;
    break-inside: avoid !important;
  }
}
```

---

## 🔒 3. Architectural Constraints & Compliance Standards

1. **Universal Rule 28 Compliance:**
   - Any helper functions modified in JavaScript must stay `<= 50` lines in length.
   - Maximum cyclomatic nesting depth must not exceed `3`.
2. **UTF-8 with BOM Standard:**
   - All modified files must be preserved or written with UTF-8 BOM encoding (`0xEF, 0xBB, 0xBF`).
3. **W3C Trusted Types Compliance:**
   - Zero `innerHTML` or `outerHTML` mutations. All CSS modifications are static stylesheet declarations or sanitized string template constants.
4. **Zero-Scan Principle:**
   - Subagents must not perform blind recursive directory searches; all targets are anchored directly.
