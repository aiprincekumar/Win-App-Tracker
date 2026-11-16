# Phase 01: Bento Grid & Top App Bar Restoration
## Subsystem Execution Specification: 5-Card Subgrid & Consolidated Export Hub

> **Phase:** 01 of 04  
> **Task ID:** `TASK-DASHBOARD-UIUX-RESTORE-PHASE-01`  
> **Target Subsystems:** Bento Grid Key Metrics & Top App Bar Header  
> **Master Reference:** [`dashboard_ui_ux_restoration_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`  
> **Pre-Condition:** Application code locked; all prompt specifications certified.  
> **Authorization Token:** `AUTH-MGR-20261117-UIUX-RESTORE-001`  

---

## 🎯 1. Phase 1 Objectives

1. **Eliminate 5th Card Bento Grid Wrap:** Encapsulate the 5 metric cards (`#lblMetricToday`, `#lblMetricTotal`, `#lblMetricDomains`, `#lblMetricMedia`, `#metricProductivityScore`) inside a dedicated container `.metrics-bento-row.bento-span-12` driven by a responsive 5-column subgrid.
2. **Consolidate Top App Bar Export Actions:** Remove loose `#btnPrintPdf` and `#btnDownloadHtmlDigest` buttons from `.app-bar-right`. Create a unified `#btnExportMenu` (`[📥 Export ▾]`) trigger opening an elegant glassmorphism dropdown menu containing PDF, Offline HTML, Time CSV, and Media CSV export actions.
3. **Prevent Navbar Flex Wrapping:** Fix flex alignment and media query breakpoints so that the header never wraps or overlaps on screens from 1024px to 4K.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 1.1: Restructure Key Metrics HTML in `dashboard/dashboard.html`
Locate lines 210-270 in `dashboard/dashboard.html` (inside `#paneTracking`). Replace the 5 individual `.bento-span-3` elements with:

```html
<!-- RESTORED: Symmetrical 5-Metric Subgrid Container -->
<div class="metrics-bento-row bento-span-12" role="region" aria-label="Key Performance Indicators">
  <!-- Metric 1: Today's Browsing -->
  <div class="metric-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricToday" class="metric-label">Today's Browsing Time</span>
      <span class="metric-icon-box cyan">⏱️</span>
    </div>
    <div class="metric-body">
      <div id="metricTodayTime" class="metric-value">0h 00m</div>
      <div class="metric-subtext">Active tab focus time</div>
    </div>
  </div>

  <!-- Metric 2: Total Time -->
  <div class="metric-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricTotal" class="metric-label">Total Time Tracked</span>
      <span class="metric-icon-box violet">📊</span>
    </div>
    <div class="metric-body">
      <div id="metricTotalTime" class="metric-value">0h 00m</div>
      <div class="metric-subtext">Across all sessions</div>
    </div>
  </div>

  <!-- Metric 3: Tracked Domains -->
  <div class="metric-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricDomains" class="metric-label">Tracked Domains</span>
      <span class="metric-icon-box amber">🌐</span>
    </div>
    <div class="metric-body">
      <div id="metricDomainCount" class="metric-value">0</div>
      <div class="metric-subtext">Unique websites logged</div>
    </div>
  </div>

  <!-- Metric 4: Media Consumed -->
  <div class="metric-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricMedia" class="metric-label">Media Consumed</span>
      <span class="metric-icon-box emerald">🎬</span>
    </div>
    <div class="metric-body">
      <div id="metricMediaTime" class="metric-value">0h 00m</div>
      <div class="metric-subtext">Audio & video playback</div>
    </div>
  </div>

  <!-- Metric 5: Productivity Index (Feature 2) -->
  <div id="metricProductivityScore" class="metric-card liquid-glass-card">
    <div class="metric-header">
      <span id="lblMetricProductivity" class="metric-label">Productivity Index</span>
      <span class="metric-icon-box rose">⚡</span>
    </div>
    <div class="metric-body">
      <div id="metricProductivityValue" class="metric-value">--</div>
      <div class="metric-subtext" id="metricProductivityLabel">Calculating ratio...</div>
    </div>
  </div>
</div>
```

### Step 1.2: Restructure Top App Bar Actions in `dashboard/dashboard.html`
In `.top-app-bar .app-bar-right`, remove standalone `#btnPrintPdf` and `#btnDownloadHtmlDigest`. Insert:

```html
<!-- RESTORED: Consolidated Export Dropdown Hub -->
<div class="export-dropdown-container">
  <button type="button" id="btnExportMenu" class="btn-action-outline btn-export-trigger" aria-haspopup="true" aria-expanded="false" title="Export & Reports">
    <span class="action-btn-icon">📥</span>
    <span id="btnExportMenuText">Export</span>
    <span class="dropdown-chevron">▾</span>
  </button>
  <div id="exportDropdownMenu" class="export-dropdown-menu liquid-glass-card hidden" role="menu" aria-label="Export Formats">
    <button type="button" id="btnPrintPdf" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">🖨️</span>
      <div class="menu-item-info">
        <span class="menu-item-title" id="btnPrintPdfText">Save PDF Executive Digest</span>
        <span class="menu-item-desc">Print-optimized multi-page report</span>
      </div>
    </button>
    <button type="button" id="btnDownloadHtmlDigest" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">📄</span>
      <div class="menu-item-info">
        <span class="menu-item-title" id="btnDownloadHtmlDigestText">Offline HTML Report</span>
        <span class="menu-item-desc">Self-contained interactive dashboard</span>
      </div>
    </button>
    <div class="dropdown-divider"></div>
    <button type="button" id="btnExportTimeCsv" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">📊</span>
      <div class="menu-item-info">
        <span class="menu-item-title">Export Time Data (CSV)</span>
        <span class="menu-item-desc">RFC 4180 raw tabular records</span>
      </div>
    </button>
    <button type="button" id="btnExportMediaCsv" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">🎬</span>
      <div class="menu-item-info">
        <span class="menu-item-title">Export Media History (CSV)</span>
        <span class="menu-item-desc">Full audio/video play records</span>
      </div>
    </button>
  </div>
</div>
```

### Step 1.3: Add Styles in `dashboard/styles/layout.css` & `dashboard/styles/metrics.css`
```css
/* 5-Column Symmetrical Subgrid */
.metrics-bento-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}

.metrics-bento-row .metric-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: 16px;
}

@media (max-width: 1280px) {
  .metrics-bento-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .metrics-bento-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .metrics-bento-row {
    grid-template-columns: 1fr;
  }
}

/* Consolidated Export Dropdown */
.export-dropdown-container {
  position: relative;
  display: inline-block;
}

.export-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--glass-surface-hover);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  box-shadow: var(--glass-card-hover-shadow);
  backdrop-filter: var(--glass-backdrop-blur);
  padding: 0.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.export-dropdown-menu.hidden {
  display: none;
}

.export-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  text-align: left;
  transition: background 150ms ease;
  width: 100%;
}

.export-menu-item:hover, .export-menu-item:focus-visible {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 4px 0;
}
```

### Step 1.4: Wire JS Interactions in `dashboard/dashboard.js`
```javascript
// Initialize Export Dropdown Hub
function setupExportDropdown() {
  const btnExportMenu = document.getElementById('btnExportMenu');
  const exportDropdownMenu = document.getElementById('exportDropdownMenu');
  
  if (!btnExportMenu || !exportDropdownMenu) return;

  btnExportMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = btnExportMenu.getAttribute('aria-expanded') === 'true';
    btnExportMenu.setAttribute('aria-expanded', !isExpanded);
    exportDropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!exportDropdownMenu.contains(e.target) && !btnExportMenu.contains(e.target)) {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exportDropdownMenu.classList.add('hidden');
      btnExportMenu.setAttribute('aria-expanded', 'false');
    }
  });
}
```

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] On desktop (>=1200px), all 5 metric cards fit cleanly in ONE row. Zero wrap.
- [ ] Top App Bar contains only 1 Export trigger button (`#btnExportMenu`).
- [ ] Clicking `#btnExportMenu` displays the 4 export choices; clicking PDF triggers `window.print`; clicking HTML Report triggers download.
- [ ] Esc key cleanly closes the dropdown.
- [ ] All 44 workspace tests continue to pass with exit code 0.
