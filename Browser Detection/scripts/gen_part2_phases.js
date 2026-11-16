// scripts/gen_part2_phases.js
const { writeBomFile } = require('./build_uiux_prompts');

// 1. phase_01_bento_grid_and_topbar_restoration.md
const p1Content = `# Phase 01: Bento Grid & Top App Bar Restoration
## Subsystem Execution Specification: 5-Card Subgrid & Consolidated Export Hub

> **Phase:** 01 of 04  
> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORE-PHASE-01\`  
> **Target Subsystems:** Bento Grid Key Metrics & Top App Bar Header  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** \`dashboard/dashboard.html\`, \`dashboard/dashboard.css\`, \`dashboard/dashboard.js\`  
> **Pre-Condition:** Application code locked; all prompt specifications certified.  
> **Authorization Token:** \`AUTH-MGR-20261117-UIUX-RESTORE-001\`  

---

## 🎯 1. Phase 1 Objectives

1. **Eliminate 5th Card Bento Grid Wrap:** Encapsulate the 5 metric cards (\`#lblMetricToday\`, \`#lblMetricTotal\`, \`#lblMetricDomains\`, \`#lblMetricMedia\`, \`#metricProductivityScore\`) inside a dedicated container \`.metrics-bento-row.bento-span-12\` driven by a responsive 5-column subgrid.
2. **Consolidate Top App Bar Export Actions:** Remove loose \`#btnPrintPdf\` and \`#btnDownloadHtmlDigest\` buttons from \`.app-bar-right\`. Create a unified \`#btnExportMenu\` (\`[📥 Export ▾]\`) trigger opening an elegant glassmorphism dropdown menu containing PDF, Offline HTML, Time CSV, and Media CSV export actions.
3. **Prevent Navbar Flex Wrapping:** Fix flex alignment and media query breakpoints so that the header never wraps or overlaps on screens from 1024px to 4K.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 1.1: Restructure Key Metrics HTML in \`dashboard/dashboard.html\`
Locate lines 210-270 in \`dashboard/dashboard.html\` (inside \`#paneTracking\`). Replace the 5 individual \`.bento-span-3\` elements with:

\`\`\`html
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
\`\`\`

### Step 1.2: Restructure Top App Bar Actions in \`dashboard/dashboard.html\`
In \`.top-app-bar .app-bar-right\`, remove standalone \`#btnPrintPdf\` and \`#btnDownloadHtmlDigest\`. Insert:

\`\`\`html
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
\`\`\`

### Step 1.3: Add Styles in \`dashboard/styles/layout.css\` & \`dashboard/styles/metrics.css\`
\`\`\`css
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
\`\`\`

### Step 1.4: Wire JS Interactions in \`dashboard/dashboard.js\`
\`\`\`javascript
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
\`\`\`

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] On desktop (>=1200px), all 5 metric cards fit cleanly in ONE row. Zero wrap.
- [ ] Top App Bar contains only 1 Export trigger button (\`#btnExportMenu\`).
- [ ] Clicking \`#btnExportMenu\` displays the 4 export choices; clicking PDF triggers \`window.print\`; clicking HTML Report triggers download.
- [ ] Esc key cleanly closes the dropdown.
- [ ] All 44 workspace tests continue to pass with exit code 0.
`;

// 2. phase_02_sidebar_and_pomodoro_redesign.md
const p2Content = `# Phase 02: Sidebar De-Clutter & Pomodoro Re-Architecture
## Subsystem Execution Specification: Extract Pomodoro & Standardize Compact Sidebar

> **Phase:** 02 of 04  
> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORE-PHASE-02\`  
> **Target Subsystems:** Sidebar Navigation & Pomodoro Focus Sentinel  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** \`dashboard/dashboard.html\`, \`dashboard/dashboard.css\`, \`dashboard/dashboard.js\`  
> **Pre-Condition:** Phase 1 complete; application code locked during prompt stage.  
> **Authorization Token:** \`AUTH-MGR-20261117-UIUX-RESTORE-002\`  

---

## 🎯 1. Phase 2 Objectives

1. **De-Clutter Sidebar Navigation:** Completely remove the bulky \`#widgetPomodoroSentinel\` from \`<aside class="sidebar">\`. Restore the clean visual rhythm of the 3 primary navigation tabs and the 2 compact status cards.
2. **Re-Architect Pomodoro Sentinel in Top App Bar:** Position an ultra-compact interactive pill (\`#pomodoroNavPill\`) inside the Top App Bar (\`.app-bar-right\`). The pill displays a live icon (🧘), countdown timer (\`25:00\`), and mode badge (\`Focus\`).
3. **Interactive Glassmorphism Popover Modal:** Clicking \`#pomodoroNavPill\` toggles a floating glassmorphism card (\`#pomodoroPopoverModal\`) with circular/linear progress bar and full controls (Start, Pause, Reset, Mode toggle).
4. **Standardize Sidebar HUD Cards:** Enforce an ergonomic 64px fixed-height micro-card layout for SQLite Data Hub and Video Detector HUD cards to guarantee zero sidebar overflow on 768px height displays.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 2.1: Remove Bulky Widget from Sidebar in \`dashboard/dashboard.html\`
Locate lines 45-56 in \`dashboard/dashboard.html\`:
\`\`\`html
<!-- REMOVE THIS ENTIRE BULKY BLOCK FROM SIDEBAR -->
<div id="widgetPomodoroSentinel" class="sidebar-hud-card pomodoro-card">
  ...
</div>
\`\`\`
Delete it from \`<aside class="sidebar">\`.

### Step 2.2: Insert Pomodoro Pill in Top App Bar in \`dashboard/dashboard.html\`
In \`.top-app-bar .app-bar-right\`, before the Export Dropdown, insert:

\`\`\`html
<!-- RESTORED: Compact Pomodoro Interactive Pill in Top Bar -->
<div class="pomodoro-pill-container">
  <button type="button" id="pomodoroNavPill" class="pomodoro-nav-pill" aria-haspopup="true" aria-expanded="false" title="Focus Sentinel & Pomodoro">
    <span class="pomodoro-pill-icon">🧘</span>
    <span id="pomodoroPillClock" class="pomodoro-pill-time">25:00</span>
    <span id="pomodoroPillBadge" class="badge-focus-micro">Focus</span>
  </button>

  <!-- Floating Glassmorphism Popover Modal -->
  <div id="pomodoroPopoverModal" class="pomodoro-popover-card liquid-glass-card hidden" role="dialog" aria-modal="false" aria-label="Pomodoro Controls">
    <div class="pomodoro-popover-header">
      <div class="pomodoro-popover-title-group">
        <span class="pomodoro-popover-title">🧘 Focus Sentinel</span>
        <span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>
      </div>
      <button type="button" id="btnPomodoroPopoverClose" class="btn-icon-close" aria-label="Close">✕</button>
    </div>
    <div class="pomodoro-popover-body">
      <div id="pomodoroTimeDisplay" class="pomodoro-big-time">25:00</div>
      <div class="pomodoro-progress-track">
        <div id="pomodoroProgressBar" class="pomodoro-progress-fill" style="width: 100%;"></div>
      </div>
      <div class="pomodoro-popover-actions">
        <button type="button" id="btnStartPomodoro" class="btn-pomodoro primary">▶️ Start</button>
        <button type="button" id="btnPausePomodoro" class="btn-pomodoro">⏸️ Pause</button>
        <button type="button" id="btnResetPomodoro" class="btn-pomodoro">🔄 Reset</button>
      </div>
    </div>
  </div>
</div>
\`\`\`

### Step 2.3: Update Styles in \`dashboard/styles/layout.css\`
\`\`\`css
/* Top Bar Pomodoro Interactive Pill */
.pomodoro-pill-container {
  position: relative;
  display: inline-block;
}

.pomodoro-nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--glass-surface-bg);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-primary);
}

.pomodoro-nav-pill:hover, .pomodoro-nav-pill:focus-visible {
  background: var(--glass-surface-hover);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.pomodoro-pill-time {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
}

.badge-focus-micro {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
  border-radius: 9999px;
  font-weight: 600;
}

/* Floating Popover */
.pomodoro-popover-card {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 300px;
  padding: 1.25rem;
  background: var(--glass-surface-hover);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-card-hover-shadow);
  z-index: 1000;
}

.pomodoro-big-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
  color: var(--text-primary);
  margin: 0.75rem 0 0.5rem;
}

.pomodoro-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.pomodoro-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan));
  transition: width 300ms ease;
}

.pomodoro-popover-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
\`\`\`

### Step 2.4: Sync JS Timer Events
In \`src/dashboard/features/wellbeing_blacklist_feature.js\` or \`dashboard.js\`:
- Update \`updatePomodoroUI()\` to update both \`#pomodoroTimeDisplay\` and \`#pomodoroPillClock\`.
- Ensure \`#btnStartPomodoro\`, \`#btnPausePomodoro\`, \`#btnResetPomodoro\` remain fully bound.
- Wire click on \`#pomodoroNavPill\` to toggle \`#pomodoroPopoverModal\`.

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] Sidebar navigation has zero vertical scrollbars on 768px height viewport.
- [ ] \`#pomodoroNavPill\` ticks every second in top bar.
- [ ] Clicking pill opens popover smoothly; Start/Pause/Reset operate cleanly.
- [ ] Clicking outside closes the popover.
`;

// 3. phase_03_heatmap_and_domain_table_refinement.md
const p3Content = `# Phase 03: Heatmap & Domain Table Aesthetic Refinement
## Subsystem Execution Specification: Compact Chrono Matrix & Table Badge Popover

> **Phase:** 03 of 04  
> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORE-PHASE-03\`  
> **Target Subsystems:** 168-Cell Hourly Activity Heatmap & Domain Table  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** \`dashboard/dashboard.html\`, \`src/dashboard/components/domain_table.js\`, \`dashboard/styles/tracking.css\`  
> **Pre-Condition:** Phases 1 and 2 certified; zero application code edits during prompt stage.  
> **Authorization Token:** \`AUTH-MGR-20261117-UIUX-RESTORE-003\`  

---

## 🎯 1. Phase 3 Objectives

1. **Refine 168-Cell Activity Heatmap:** Re-architect \`#cardHourlyHeatmap\` into a sleek, compact GitHub/Linear-style contribution matrix. Reduce card height from 380px to <= 240px, use 16px rounded cells, milestone hour marks (00, 04, 08, 12, 16, 20), and a floating glassmorphism tooltip on hover.
2. **Eliminate Native HTML \`<select>\` from Domain Table:** Remove crude inline dropdowns from table rows. Replace with an ergonomic \`.badge-productivity\` pill that opens a sleek 3-option popover on click.
3. **Consolidate Table Row Actions:** Group ⭐ favorite star and 📝 notes buttons into an elegant \`.cell-quick-actions\` hover cluster, restoring a compact 42px row height and uniform text alignment.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 3.1: Compact Heatmap DOM & CSS Architecture
In \`dashboard/styles/tracking.css\`, update heatmap layout:

\`\`\`css
/* Linear-Style Compact Heatmap */
.heatmap-card-compact {
  padding: 1.25rem;
}

.chrono-heatmap-wrapper {
  overflow-x: auto;
  padding: 0.5rem 0;
  width: 100%;
}

.chrono-heatmap-grid-compact {
  display: grid;
  grid-template-columns: 44px repeat(24, 16px);
  gap: 3px;
  align-items: center;
  justify-content: start;
}

.heatmap-cell {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.heatmap-cell:hover {
  transform: scale(1.3);
  z-index: 10;
  box-shadow: 0 0 8px var(--accent-emerald);
}

/* Floating Glassmorphism Tooltip */
.heatmap-floating-tooltip {
  position: fixed;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-primary);
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
\`\`\`

### Step 3.2: Domain Table Productivity Pill Popover in \`src/dashboard/components/domain_table.js\`
Replace the inline \`<select class="productivity-select">\` creation with:

\`\`\`javascript
// RESTORED: Ergonomic Badge Pill
function createProductivityCell(domain, category) {
  const td = document.createElement('td');
  td.className = 'col-productivity';

  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = \`badge-productivity cat-\${category || 'neutral'}\`;
  badge.setAttribute('data-domain', domain);
  badge.setAttribute('data-cat', category || 'neutral');
  badge.title = 'Click to classify domain';

  const dot = document.createElement('span');
  dot.className = 'prod-dot';
  const label = document.createElement('span');
  label.className = 'prod-label';
  label.textContent = formatCategoryName(category || 'neutral');
  const chevron = document.createElement('span');
  chevron.className = 'prod-chevron';
  chevron.textContent = '▾';

  badge.appendChild(dot);
  badge.appendChild(label);
  badge.appendChild(chevron);

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    openProductivityPopover(badge, domain, category);
  });

  td.appendChild(badge);
  return td;
}
\`\`\`

### Step 3.3: Sleek Hover Action Cluster
In \`src/dashboard/components/domain_table.js\`:

\`\`\`javascript
function createActionsCell(domain, isStarred, hasNote) {
  const td = document.createElement('td');
  td.className = 'col-actions text-right';

  const cluster = document.createElement('div');
  cluster.className = 'cell-quick-actions';

  // Star Button
  const btnStar = document.createElement('button');
  btnStar.type = 'button';
  btnStar.className = \`btn-row-star \${isStarred ? 'starred' : ''}\`;
  btnStar.title = isStarred ? 'Unstar domain' : 'Star domain';
  btnStar.textContent = isStarred ? '★' : '☆';
  btnStar.addEventListener('click', () => toggleStarDomain(domain));

  // Note Button
  const btnNote = document.createElement('button');
  btnNote.type = 'button';
  btnNote.className = \`btn-row-note \${hasNote ? 'has-note' : ''}\`;
  btnNote.title = hasNote ? 'View/edit domain note' : 'Add domain note';
  btnNote.textContent = '📝';
  btnNote.addEventListener('click', () => openDomainNoteModal(domain));

  cluster.appendChild(btnStar);
  cluster.appendChild(btnNote);
  td.appendChild(cluster);
  return td;
}
\`\`\`

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] 168-cell heatmap takes less than 240px vertical space with clean 16px cells.
- [ ] Domain table row height is exactly 42px without vertical bulging.
- [ ] Productivity dropdown no longer uses OS-native select; clicking badge opens sleek popover.
- [ ] Category changes persist to \`chrome.storage.local\` and update productivity score immediately.
- [ ] All 44 test suites remain green.
`;

// 4. phase_04_media_pane_and_settings_unification.md
const p4Content = `# Phase 04: Media Pane, Settings Unification & CSS Modularization
## Subsystem Execution Specification: Tab Strip, Ambient Canvas & Modular Architecture

> **Phase:** 04 of 04  
> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORE-PHASE-04\`  
> **Target Subsystems:** Media Pane Multi-Tab Deck, Audio Visualizer, Settings Cards & CSS Tree  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** \`dashboard/dashboard.html\`, \`dashboard/dashboard.css\`, \`dashboard/styles/*\`  
> **Pre-Condition:** Phases 1-3 complete; zero code mutation during prompt stage.  
> **Authorization Token:** \`AUTH-MGR-20261117-UIUX-RESTORE-004\`  

---

## 🎯 1. Phase 4 Objectives

1. **Convert Multi-Tab Deck into Carousel Chip Strip:** Transform \`#multiTabMediaDeck\` from bulky stacked cards into a sleek horizontal chip bar (\`.media-tab-strip\`) docked above the Hero Player.
2. **Embed Ambient Audio Visualizer:** Place \`#canvasMediaAudioVisualizer\` directly inside the Hero Media card as an ambient backdrop with a clean toggle button, eliminating vertical page sprawl.
3. **Standardize Settings Cards:** Unify all settings cards (Sleep Timer, Backup/Sync, Wellbeing, Daily Budgets, Blacklist) to the \`.settings-section-card\` token specification with uniform inputs and buttons.
4. **Refactor Modular CSS Architecture:** Eliminate 1466-line bloat dumped into \`dashboard.css\`. Structure styles into 6 clean domain stylesheets in \`dashboard/styles/\` imported via clean aggregator rules.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 4.1: Media Tab Strip in \`dashboard/dashboard.html\`
\`\`\`html
<!-- RESTORED: Horizontal Media Tab Chip Strip -->
<div id="multiTabMediaDeck" class="media-tab-strip bento-span-12" role="tablist" aria-label="Active Media Tabs">
  <!-- Dynamic media tab chips: [Favicon | Tab Title | Play/Pause | Volume] -->
</div>
\`\`\`

### Step 4.2: Ambient Hero Canvas in \`dashboard/dashboard.html\`
Inside \`#heroMediaCard\`, embed the visualizer canvas behind the controls:
\`\`\`html
<div class="hero-player-container">
  <!-- Ambient Audio Visualizer Canvas Backdrop -->
  <canvas id="canvasMediaAudioVisualizer" class="hero-ambient-visualizer-canvas" width="600" height="120" aria-hidden="true"></canvas>
  
  <div class="hero-player-content">
    <!-- Existing Hero metadata, title, scrubber, and playback buttons -->
  </div>
</div>
\`\`\`

### Step 4.3: Unify Settings Form Tokens
In \`dashboard/styles/settings.css\`:
\`\`\`css
.settings-section-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--glass-surface-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  margin-bottom: 1.5rem;
}

.settings-form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.form-control-input {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 150ms ease;
}

.form-control-input:focus {
  border-color: var(--accent-emerald);
  outline: none;
}
\`\`\`

### Step 4.4: Master \`dashboard.css\` Modular Aggregator
\`\`\`css
/* dashboard.css - Clean Modular Aggregator */
@import url('styles/tokens.css');
@import url('styles/layout.css');
@import url('styles/metrics.css');
@import url('styles/tracking.css');
@import url('styles/media.css');
@import url('styles/settings.css');
@import url('styles/components.css');
\`\`\`

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] Multi-tab media chips render horizontally with 0 CLS.
- [ ] Audio visualizer runs smoothly at 60fps inside hero player with zero layout displacement.
- [ ] All settings forms display identical typography, spacing, inputs, and button hierarchy.
- [ ] \`dashboard.css\` contains only clean imports or modular overrides with zero duplicate declarations.
- [ ] 100% of workspace test suites (44/44) pass with exit code 0.
`;

// 5. SUMMARY.md
const sumContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration
## Executive Architecture Summary & Handoff Dossier

> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORATION-001\`  
> **Milestone Status:** SPECIFICATION_LOCKED / PHASE_PROMPTS_READY  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Ephemeral Container:** \`temp_prompt/dashboard_ui_ux_restoration/\`  
> **Project Memory Anchor:** [\`project_ui_ux_restoration_memory.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_ui_ux_restoration_memory.md)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist  

---

## 📊 1. Forensic Impact Comparison: Before vs. After Blueprint

| Evaluation Metric | Cluttered State (Post Phase 1-4) | Restored Blueprint State (Target) | Improvement Delta |
| :--- | :--- | :--- | :--- |
| **Bento Grid Metric Symmetrical Alignment** | 5th card wraps alone; 9 columns of empty gap | Dedicated 5-column responsive subgrid; 0 empty gaps | **100% Symmetrical** |
| **Sidebar Vertical Scrollbar** | Scrollbar forced by 180px bulky Pomodoro card | 0 scrollbars; clean 3 tabs + 2 micro HUD cards | **Zero Overflow** |
| **Top App Bar Button Count** | 6 loose buttons; wraps on <= 1366px screens | 4 clean items with consolidated Export dropdown | **Zero Navbar Wrap** |
| **Heatmap Vertical Height** | 380px tall card pushing table below fold | 240px compact Linear matrix with 16px cells | **37% Height Reduction** |
| **Domain Table Row Height** | 58px+ due to OS-native select & loose icons | 42px standardized ergonomic row height | **28% Height Reduction** |
| **Media Pane Vertical Height** | Stacked full-size tab cards + standalone canvas | Horizontal chip strip + ambient hero canvas | **45% Height Reduction** |
| **Settings Styling Uniformity** | 4 competing button styles & mismatched inputs | 100% tokenized design system forms | **100% Uniform** |
| **CSS Architecture Bloat** | 1466 lines dumped into \`dashboard.css\` + 4 files | Modular domain stylesheets via clean \`@import\` | **Zero Duplication** |

---

## 🚦 2. Handoff Instructions for Level 4 Execution Sub-Agents

1. **Implementation Execution Order:**
   - Execute Phase 1 first (\`phase_01_bento_grid_and_topbar_restoration.md\`). Run test suites.
   - Execute Phase 2 next (\`phase_02_sidebar_and_pomodoro_redesign.md\`). Run test suites.
   - Execute Phase 3 next (\`phase_03_heatmap_and_domain_table_refinement.md\`). Run test suites.
   - Execute Phase 4 next (\`phase_04_media_pane_and_settings_unification.md\`). Run test suites.
2. **Strict Invariant:** Do not alter any backend IPC, storage schema, or analytical algorithms in \`background.js\` or feature managers. All edits are strictly UI/UX layout, DOM ergonomics, and CSS modularization!
3. **Test Gate:** All 44 test suites must exit with code 0 after each phase.
`;

writeBomFile('temp_prompt/dashboard_ui_ux_restoration/phase_01_bento_grid_and_topbar_restoration.md', p1Content);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/phase_02_sidebar_and_pomodoro_redesign.md', p2Content);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/phase_03_heatmap_and_domain_table_refinement.md', p3Content);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/phase_04_media_pane_and_settings_unification.md', p4Content);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/SUMMARY.md', sumContent);
