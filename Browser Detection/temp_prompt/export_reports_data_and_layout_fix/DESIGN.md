# Design System & UI Specification (DESIGN.md): Export Reports & Print View

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Document Type:** Design System & UI Specification  
> **Container:** `temp_prompt/export_reports_data_and_layout_fix/`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Dept 04 (UI/UX Design Systems & Visual Engineering)  

---

## 🎨 1. Design Philosophy & Visual Tokens

The Web Activity & Media Sentinel reporting design language emphasizes:
1. **Executive Clarity:** Crisp, professional, publication-ready typography and structured grid systems suitable for sharing with managers, clients, or retaining in archives.
2. **Pristine Paper Contrast (WCAG AAA):** Pure white backgrounds (`#ffffff`), dark slate body text (`#0f172a`), subtle slate borders (`#cbd5e1`), and zero ink-wasting dark blocks.
3. **100% Offline Portability:** Standalone HTML documents require zero external network fonts or icons, relying exclusively on modern system font stacks and clean vector SVGs.

### 1.1 Color Tokens Palette

| Token Name | Hex Code | Role / Usage in Print & Standalone HTML |
| :--- | :--- | :--- |
| `--surface-paper` | `#ffffff` | Primary background for printable pages and standalone container |
| `--surface-muted` | `#f8fafc` | Card background, table header fill, and metric tile fill |
| `--surface-hover` | `#f1f5f9` | Table row alternate striping and hover elevation |
| `--border-subtle` | `#e2e8f0` | Dividers, section breaks, and chart background tracks |
| `--border-strong` | `#cbd5e1` | Metric card borders, table borders, and header underline |
| `--text-primary` | `#0f172a` | Primary headings, KPI numbers, and table domain labels |
| `--text-secondary`| `#475569` | Metric labels, subtext, reporting period, and timestamps |
| `--text-muted` | `#64748b` | Rank numbers, column headers, and checksum values |
| `--color-work` | `#0284c7` | Sky blue badge for work and productivity domains |
| `--color-learning`| `#059669` | Emerald green badge for education and learning domains |
| `--color-social` | `#d946ef` | Fuchsia badge for social media and communications |
| `--color-media` | `#f59e0b` | Amber badge for video, music, and streaming domains |
| `--color-utility` | `#64748b` | Slate badge for system, search, and developer utilities |

---

## 📄 2. `@media print` CSS Specification for Dashboard

### 2.1 Page Setup & Container Overrides
```css
@page {
  size: A4 portrait;
  margin: 15mm 12mm 15mm 12mm;
}

@media print {
  /* Global Reset to Pure White Surface */
  *, *::before, *::after {
    background-color: transparent !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  html, body, .dashboard-layout, .main-content, .tab-content-container {
    background: #ffffff !important;
    color: #0f172a !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Force Analytics Content Visible Regardless of Inactive Tab */
  #paneTracking {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Hide Interactive and Non-Printable Elements */
  .sidebar,
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
  #paneSettings,
  #paneMedia,
  #customDateRangePicker,
  #btnSidebarReconnectHub,
  #dataHubBadge,
  .table-search-filter,
  .table-sort-wrapper,
  .table-pagination-footer {
    display: none !important;
  }
}
```

### 2.2 Executive Print Header & KPI Grid
```css
@media print {
  .print-executive-header {
    display: block !important;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 14px;
    margin-bottom: 20px;
    page-break-after: avoid;
    break-after: avoid;
  }

  .print-brand-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .print-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
  }

  .print-date {
    font-size: 0.85rem;
    color: #475569;
    font-weight: 500;
  }

  .print-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 14px;
  }

  .print-summary-card {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px;
    padding: 10px 12px;
  }

  .print-stat-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.5px;
  }

  .print-stat-value {
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }
}
```

### 2.3 Page-Break Discipline
```css
@media print {
  .print-executive-header,
  .metrics-grid,
  .metric-card,
  .donut-chart-container,
  .data-table-card,
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  thead {
    display: table-header-group;
  }
}
```

---

## 🌐 3. Standalone Offline HTML Report Specification

The offline HTML report template generated by `generateExecutiveDigestHtml` must incorporate the following visual hierarchy:

```
+-----------------------------------------------------------------------------------+
|  [SHIELD LOGO] Web Activity & Media Sentinel Executive Digest     [PRINT BUTTON]  |
|  Reporting Period: Today (2026-11-22)  *  Generated: 2026-11-22 06:00:00          |
+-----------------------------------------------------------------------------------+
|  +-------------------+  +-------------------+  +-------------------+  +---------+ |
|  | TOTAL ACTIVE TIME |  | TOP FOCUS DOMAIN  |  | PRODUCTIVITY SCORE|  | MEDIA   | |
|  |     3h 45m        |  |    github.com     |  |     88 / 100      |  | 1h 10m  | |
|  | 12 active domains |  | 42% focus share   |  | Grade: Excellent  |  | 4 videos| |
|  +-------------------+  +-------------------+  +-------------------+  +---------+ |
+-----------------------------------------------------------------------------------+
|  ACTIVITY PROPORTIONS (TOP 5 DOMAINS)                                             |
|  +----------------------+  +----------------------------------------------------+ |
|  |                      |  | [emerald dot] github.com       2h 15m (60.0%)      | |
|  |   [SVG DONUT CHART]  |  | [cyan dot]    youtube.com      1h 10m (31.1%)      | |
|  |                      |  | [indigo dot]  stackoverflow.com  20m (8.9%)        | |
|  +----------------------+  +----------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
|  DETAILED DOMAIN TELEMETRY (TOP 25)                                               |
|  +------+-------------------+---------------+------------+---------+------------+ |
|  | Rank | Domain Name       | Category      | Duration   | Share % | Sessions   | |
|  +------+-------------------+---------------+------------+---------+------------+ |
|  | #1   | github.com        | [WORK]        | 2h 15m     | 60.0%   | 8 sessions | |
|  | #2   | youtube.com       | [ENTERTAINMENT| 1h 10m     | 31.1%   | 4 sessions | |
|  +------+-------------------+---------------+------------+---------+------------+ |
+-----------------------------------------------------------------------------------+
|  Web Activity & Media Sentinel  *  Checksum: 0x9A2F4B1C  *  100% Offline Single-File |
+-----------------------------------------------------------------------------------+
```

### 3.1 Integrated Print Button (`.no-print`)
The standalone report contains a dedicated floating utility button in the header:
```html
<button class="no-print btn-print-report" onclick="window.print()">
  🖨️ Print / Save PDF
</button>
```
With CSS:
```css
.btn-print-report {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-print-report:hover {
  background: #1e293b;
}
@media print {
  .no-print {
    display: none !important;
  }
}
```

### 3.2 Category Pill Badges
```css
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.badge.work { background: #e0f2fe; color: #0369a1; }
.badge.learning { background: #dcfce7; color: #15803d; }
.badge.social { background: #fce7f3; color: #be185d; }
.badge.entertainment { background: #fef3c7; color: #b45309; }
.badge.utility { background: #f1f5f9; color: #475569; }
```
