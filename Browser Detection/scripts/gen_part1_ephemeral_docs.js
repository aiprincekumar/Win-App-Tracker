// scripts/gen_part1_ephemeral_docs.js
const { writeBomFile } = require('./build_uiux_prompts');

// 1. INDEX.md
const indexContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration & Refinement
## Live Tracking Board & Problem-Solution Dossier (8 Subsystems Across 4 Phases)

> **Task ID:** \`TASK-DASHBOARD-UIUX-RESTORATION-001\`  
> **Target Workspace:** [\`c:\\Users\\Atul Verma\\Desktop\\Win App Tracker\\Browser Detection\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (\`prompt_generation_specialist\`)  
> **Governance Standard:** [\`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md\`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md) & Universal Rule 22  
> **Master Specification Anchor:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Project Memory Anchor:** [\`project_ui_ux_restoration_memory.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_ui_ux_restoration_memory.md) एवं [\`project_feature_memory.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md)  
> **Ephemeral Container:** \`temp_prompt/dashboard_ui_ux_restoration/\`  
> **Decision Gate Assessment:** \`PROMPT_FILES_REQUIRED = YES\` (Complex Multi-Module UI/UX Refinement & Layout Stabilization)  
> **Recommended Execution Strategy:** \`STRATEGY_A_AUTONOMOUS\` (Autonomous Forward Momentum, Autonomy Score: 1.0)  
> **Active Status:** SPECIFICATION_LOCKED (Ready for Level 4 Implementation Delegation)

---

## 📌 1. Executive Problem-Solution Dossier (Forensic Audit & Remediation)

### 1.1 Architectural Context & Current UI/UX Clutter Analysis
During the implementation of Phases 1 through 4 (Features 1 to 8), high-powered capabilities were added to the Web Activity & Media Sentinel dashboard. However, rapid DOM insertions disrupted the original liquid-glass Bento Grid architecture (commit \`ef7d720\`), resulting in visual clutter, inconsistent sizing, awkward wrapping, and CSS bloat.

The table below summarizes the 8 core clutter vectors identified during the deep UI/UX forensic audit and their corresponding restorative architectural solutions:

| Clutter Vector # | Component / Surface | Forensic Flaw Identified | Architectural Restorative Blueprint | Phase Target |
| :---: | :--- | :--- | :--- | :---: |
| **01** | **Bento Grid Metric Cards** | 12-column grid broken by 5th metric card (\`#metricProductivityScore\`) spanning 3 cols, causing an awkward 1-card wrap with 9 empty columns. | Encapsulate key metrics in a dedicated \`.metrics-bento-row.bento-span-12\` container using a responsive 5-column subgrid (\`repeat(5, 1fr)\` on desktop, 3 on tablet, 2 on mobile) to maintain clean horizontal symmetry. | **Phase 1** |
| **02** | **Top App Bar Actions** | PDF (\`#btnPrintPdf\`) and Report (\`#btnDownloadHtmlDigest\`) export buttons crammed into top app bar flex row, causing overflow and misaligned buttons on standard screens. | Consolidate export actions into an elegant single dropdown button (\`#btnExportMenu\`, \`[📥 Export ▾]\`) opening a glassmorphism popover with PDF, Standalone HTML, Time CSV, and Media CSV options. | **Phase 1** |
| **03** | **Sidebar Navigation** | Large Pomodoro widget (\`#widgetPomodoroSentinel\`) shoved directly into the sidebar between nav items and HUD cards, forcing vertical scrollbars and cluttering hierarchy. | Relocate Pomodoro Sentinel to an ultra-compact status pill in the Top App Bar (\`#pomodoroNavPill\`) with click-to-open glassmorphism control popover, restoring clean sidebar navigation. | **Phase 2** |
| **04** | **Sidebar HUD Cards** | Data Hub and HUD status cards squished by oversized widgets, with repetitive button margins. | Standardize \`.sidebar-hud-card\` to a compact 64px micro-card height with subtle status dots, hover glow, and consistent typography. | **Phase 2** |
| **05** | **168-Cell Activity Heatmap** | 7x24 hourly heatmap (\`#cardHourlyHeatmap\`) renders as an oversized bulky block with cramped numbers, awkward cell aspect-ratios, and horizontal scrollbars. | Redesign as a sleek GitHub/Linear-style compact contribution matrix with 16px rounded cells, milestone hour labels (00, 04, 08, 12, 16, 20), smooth floating hover tooltip, and compact legend. | **Phase 3** |
| **06** | **Domain Table Row Clutter** | Native HTML \`<select class="productivity-select">\`, ⭐ favorite button, and 📝 note button crammed into individual table cells, inflating row heights and causing visual jitter. | Replace clunky native dropdown with an ergonomic \`.badge-productivity\` pill opening a lightweight popover on click; group favorite star and notes into a sleek \`.cell-quick-actions\` hover cluster. | **Phase 3** |
| **07** | **Media Pane Multi-Tab Deck & Visualizer** | Multi-tab deck added large bulky cards pushing hero player down; audio visualizer canvas plopped with heavy borders, stretching the layout vertically. | Convert Multi-Tab Deck into a sleek horizontal chip strip (\`.media-tab-strip\`) above hero player; embed Audio Visualizer canvas as an ambient background layer inside hero card with toggle. | **Phase 4** |
| **08** | **Settings Forms & CSS Bloat** | Inconsistent form classes (\`.styled-input\`, \`.btn-save-primary\`, \`.budget-input-row\`) and 1466 CSS lines dumped into \`dashboard.css\` + 4 fragmented files. | Unify Settings cards to \`.settings-section-card\` design tokens; refactor CSS into modular domain stylesheets (\`tokens.css\`, \`layout.css\`, \`tracking.css\`, \`media.css\`, \`settings.css\`) via \`@import\`. | **Phase 4** |

---

## 🗺️ 2. Phase-by-Phase Restoration & Refinement Roadmap

\`\`\`mermaid
flowchart TD
    subgraph Phase1["Phase 1: Bento Grid & Top App Bar Restoration"]
        P1_1["Encapsulate Key Metrics in 5-Col Subgrid"]
        P1_2["Consolidate PDF & HTML Export into Dropdown"]
        P1_3["Eliminate Navbar Flex Wrapping"]
    end

    subgraph Phase2["Phase 2: Sidebar De-Clutter & Pomodoro Re-Architecture"]
        P2_1["Extract Pomodoro to Top App Bar Compact Pill"]
        P2_2["Build Glassmorphism Pomodoro Control Popover"]
        P2_3["Standardize Compact Sidebar HUD Cards"]
    end

    subgraph Phase3["Phase 3: Heatmap & Domain Table Aesthetic Refinement"]
        P3_1["Linear/GitHub-Style 168-Cell Heatmap Matrix"]
        P3_2["Replace Table Native Select with Badge Popover"]
        P3_3["Sleek Hover Action Cluster for Star & Notes"]
    end

    subgraph Phase4["Phase 4: Media Deck, Settings & CSS Modular Architecture"]
        P4_1["Multi-Tab Strip Carousel above Hero Player"]
        P4_2["Ambient Integrated Audio Visualizer Canvas"]
        P4_3["Settings Form Standardization & Modular CSS Split"]
    end

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
\`\`\`

---

## 📂 3. Architectural File Manifest

The complete prompt dossier and phase-wise execution blueprints comprise the following files:

| File Name | File Purpose | Document Status |
| :--- | :--- | :---: |
| [\`INDEX.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/INDEX.md) | Master Tracking Board & Problem-Solution Matrix (This File) | ✅ **LOCKED** |
| [\`PRD.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/PRD.md) | Product Requirements Document: Restoration Goals & Acceptance Criteria | ✅ **LOCKED** |
| [\`TRD.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/TRD.md) | Technical Requirements Document: Subgrid Math, Popover Engine & CSS Tree | ✅ **LOCKED** |
| [\`DESIGN.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/DESIGN.md) | Design System Specification: Liquid Glass 2.0 Tokens & 60fps Micro-Motion | ✅ **LOCKED** |
| [\`phase_01_bento_grid_and_topbar_restoration.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/phase_01_bento_grid_and_topbar_restoration.md) | Phase 1 Execution Prompt: 5-Card Metric Subgrid & Export Dropdown | ✅ **LOCKED** |
| [\`phase_02_sidebar_and_pomodoro_redesign.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/phase_02_sidebar_and_pomodoro_redesign.md) | Phase 2 Execution Prompt: Sidebar De-Clutter & Top Bar Pomodoro Pill | ✅ **LOCKED** |
| [\`phase_03_heatmap_and_domain_table_refinement.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/phase_03_heatmap_and_domain_table_refinement.md) | Phase 3 Execution Prompt: Compact Heatmap & Table Badge Popover | ✅ **LOCKED** |
| [\`phase_04_media_pane_and_settings_unification.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/phase_04_media_pane_and_settings_unification.md) | Phase 4 Execution Prompt: Tab Strip, Ambient Visualizer & Modular CSS | ✅ **LOCKED** |
| [\`SUMMARY.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/SUMMARY.md) | Final Executive Architecture Summary & QA Verification Gate | ✅ **LOCKED** |

---

## 🚦 4. Live Decision Gate State Machine

- **Current State:** \`READY_FOR_MANAGER_DECISION\`
- **Preceding Milestone:** Full Forensic UI/UX Audit & Prompt File Architecture Complete
- **Next Transition:** Manager Issues \`AUTH-MGR-20261117-UIUX-RESTORE-001\` -> Dispatch to Level 4 Execution Sub-Agent
- **Hard Lock Enforcement:** Application code files remain 100% UNTOUCHED during this specification phase.
`;

// 2. PRD.md
const prdContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration PRD
## Product Requirements Document: Seamless Aesthetic Restoration & Feature Harmony

> **Document Type:** Product Requirements Document (PRD)  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **Document Status:** READY_FOR_REVIEW / SPECIFICATION_LOCKED  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** Universal Rule 22 & [\`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md\`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  

---

## 🎯 1. Product Vision & Executive Objective

The primary objective of this restoration project is to **restore the pristine, symmetrical iOS 26 Liquid Glass & Bento Grid visual elegance** (from commit \`ef7d720\`) while **preserving 100% of the functional capabilities** of the 8 features implemented during Phases 1 through 4:

1. **Zero Aesthetic Compromise:** No feature should appear "bolted on" or awkwardly shoved into vacant spaces. Every control must feel native, intentional, and ergonomically balanced.
2. **Zero Functional Regression:** Every single feature (Temporal Heatmap, Productivity Scoring, Multi-Tab Deck, Audio Visualizer, Backup/Restore, Executive Digest, Domain Notes/Starred, Pomodoro Focus Sentinel, and Daily Budgets) must remain 100% operational, fully wired to storage and IPC.
3. **Responsive Mathematical Harmony:** Ensure standard displays (1080p, 1440p, laptops at 1366x768) render without broken horizontal wrapping, ugly vertical scrollbars in sidebars, or bloated table rows.

---

## 🔍 2. Detailed Problem Breakdown & User Pain Points

### Pain Point 1: Broken Bento Grid (5 Metric Cards in a 12-Column Grid)
- **Problem:** Bento Grid uses 12 columns. In Phase 1, a 5th card was added (\`#metricProductivityScore\`) with class \`bento-span-3\`. Four cards take $4 \\times 3 = 12$ columns. The 5th card wraps to the next line alone, spanning 3 columns while leaving 9 columns of empty whitespace!
- **User Impact:** Looks broken, unprofessional, and visually lopsided.
- **Requirement:** Key metrics must render as an unbroken, symmetrical row of 5 cards on desktop screens (>=1200px), transitioning to 3 columns on tablet, and 2 columns on mobile, without leaving trailing empty columns.

### Pain Point 2: Top App Bar Button Crowding
- **Problem:** \`#btnPrintPdf\` and \`#btnDownloadHtmlDigest\` were added directly into the \`.app-bar-right\` flex container next to browser filter, tracking filter, theme toggle, and refresh buttons.
- **User Impact:** Header wraps into two vertical rows on screens <= 1366px, pushing content down and misaligning title with actions.
- **Requirement:** Consolidate all export and reporting actions into a single sleek \`[📥 Export ▾]\` glassmorphism dropdown button that houses PDF, Standalone HTML, Time CSV, and Media CSV.

### Pain Point 3: Sidebar Pollution by Pomodoro Widget
- **Problem:** \`#widgetPomodoroSentinel\` was inserted into \`<aside class="sidebar">\`. With a large card header, 2.2rem clock readout, and 3 chunky control buttons, it pushed the Data Hub and HUD status cards off the bottom of standard screens.
- **User Impact:** Forces vertical scrolling in the sidebar, which is a major design violation in modern desktop apps.
- **Requirement:** Extract Pomodoro from sidebar. Relocate into an ultra-compact Top App Bar interactive status pill (\`#pomodoroNavPill\`) with a click-to-open glassmorphism popover, restoring the clean, unpolluted sidebar.

### Pain Point 4: 168-Cell Heatmap Vertical Sprawl
- **Problem:** \`#cardHourlyHeatmap\` was inserted as an enormous full-width card with large cells, cramped hour labels (0 to 23), and excessive vertical padding, pushing the Domain Analytics table below the fold.
- **User Impact:** Users must scroll past a giant grid just to see their website usage table.
- **Requirement:** Redesign as a compact Linear/GitHub-style contribution matrix: 16px cells, milestone hour marks (00, 04, 08, 12, 16, 20), smooth floating hover tooltip with glassmorphism, and a toggleable card header.

### Pain Point 5: Domain Table Clutter
- **Problem:** Each domain table row contains a native HTML \`<select>\` dropdown for productivity classification, plus a ⭐ star button and a 📝 note button.
- **User Impact:** Native \`<select>\` elements render with crude OS default styling, inflating row height from 42px to 58px+, distorting vertical alignment, and introducing visual noise.
- **Requirement:** Replace native \`<select>\` with a sleek, compact \`.badge-productivity\` pill (colored dot + category label) that triggers a lightweight popover on click. Group star and notes into an elegant \`.cell-quick-actions\` hover cluster that only reveals on mouse hover (or when active).

### Pain Point 6: Media Pane Clutter & Visualizer Stacking
- **Problem:** Multi-Tab Deck rendered large standalone cards for each tab above the Hero player. The Audio Visualizer canvas was placed in a separate box with heavy borders, stretching the Media Pane vertically.
- **User Impact:** Hero media controls are shoved down; user cannot view both the visualizer and media history simultaneously without excessive scrolling.
- **Requirement:** Convert Multi-Tab Deck into a sleek horizontal chip carousel strip (\`.media-tab-strip\`) docked above the Hero player. Integrate the Audio Visualizer canvas directly into the Hero card background as an ambient visualizer with an on/off toggle.

### Pain Point 7: Inconsistent Settings Form Elements
- **Problem:** Settings cards added in Phases 3 and 4 used haphazard CSS classes (\`.styled-input\`, \`.btn-save-primary\`, \`.budget-input-row\`, \`.conflict-modal-card\`) that clashed with the base design system.
- **User Impact:** Settings view looks fragmented and disjointed across tabs.
- **Requirement:** Enforce uniform \`.settings-section-card\`, \`.settings-form-row\`, \`.form-control-input\`, and standardized button classes across all settings cards.

### Pain Point 8: CSS Bloat & File Fragmentation
- **Problem:** 1466 lines dumped into \`dashboard.css\` + 4 standalone CSS files (\`tracking.css\`, \`media.css\`, \`backup_digest.css\`, \`wellbeing_blacklist.css\`) with overlapping rules and un-scoped classes.
- **Requirement:** Refactor stylesheets into cleanly scoped domain files in \`dashboard/styles/\` imported via master \`dashboard.css\`.

---

## 📋 3. Functional Requirements & Acceptance Criteria

### FR-01: Responsive 5-Card Metrics Row
- Key metrics container must use \`.metrics-bento-row.bento-span-12\`.
- Exactly 5 cards rendered: Today Browsing, All-Time Browsing, Tracked Domains, Media Consumed, Productivity Score.
- On screen widths $\\ge 1200\\text{px}$: 5 equal columns, 0 wrapping.
- On screen widths $768\\text{px} - 1199\\text{px}$: 3 columns with elegant auto-fit.
- On screen widths $< 768\\text{px}$: 2 columns.
- All numbers animated smoothly with kinetic number roller (\`animateNumberRoll\`).

### FR-02: Consolidated Export Dropdown Hub
- Single action button: \`<button id="btnExportMenu" class="btn-action-outline">📥 Export ▾</button>\`.
- Clicking toggles \`#exportDropdownMenu\` with glassmorphism card.
- Menu contains:
  1. 🖨️ Save PDF Executive Digest (\`#btnPrintPdf\`)
  2. 🌐 Standalone HTML Report (\`#btnDownloadHtmlDigest\`)
  3. 📊 CSV Time Tracking (\`#btnExportTimeCsv\`)
  4. 🎬 CSV Media History (\`#btnExportMediaCsv\`)
- Esc key and click-outside automatically dismisses the dropdown.

### FR-03: Top App Bar Pomodoro Status Pill
- Ultra-compact pill: \`<div id="pomodoroNavPill" class="pomodoro-nav-pill">\`.
- Shows: State icon (🧘), countdown clock (\`25:00\`), mode badge (\`Focus\`).
- Clicking opens \`#pomodoroPopoverModal\` positioned right beneath the pill with Start, Pause, Reset, and Duration adjustments.
- Sidebar is completely freed from the large Pomodoro card.

### FR-04: Linear-Style 168-Cell Chrono Heatmap
- Total card height reduced by 40% (max-height: 260px).
- Cell size: 16px x 16px with 3px border-radius and 3px gap.
- Hour milestone labels: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00.
- Interactive tooltip on hover showing Day, Hour, Duration, and Top Domain.
- Zero horizontal scrollbar on viewport widths $\\ge 1024\\text{px}$.

### FR-05: Clean Ergonomic Domain Table
- Productivity column displays \`.badge-productivity\` pill (dot + text).
- Clicking badge opens a lightweight 3-choice popover (Productive, Neutral, Distracting).
- Favicon, domain name, and category properly aligned with 42px row height.
- Star (⭐) and Notes (📝) clustered in \`.cell-quick-actions\` on the right, visible on row hover or if already active.
- Table remains 100% accessible via keyboard navigation.

### FR-06: Compact Media Tab Strip & Ambient Visualizer
- Multi-Tab deck rendered as a horizontal scrollable chip bar (\`.media-tab-strip\`) directly above Hero Player.
- Active tab chip highlighted with glowing border and live EQ bars.
- Audio Visualizer canvas (\`#canvasMediaAudioVisualizer\`) rendered inside Hero Player card behind media metadata, with a \`[📊 Visualizer]\` toggle button.

### FR-07: Standardized Settings Architecture
- All settings cards use \`.settings-section-card.liquid-glass-card\`.
- All text inputs and dropdowns use \`.form-control-input\`.
- All buttons adhere to design system hierarchy (\`.btn-action-primary\`, \`.btn-action-secondary\`, \`.btn-action-danger\`).

### FR-08: Clean Modular Stylesheets
- Refactored CSS files:
  - \`dashboard/styles/tokens.css\`
  - \`dashboard/styles/layout.css\`
  - \`dashboard/styles/metrics.css\`
  - \`dashboard/styles/tracking.css\`
  - \`dashboard/styles/media.css\`
  - \`dashboard/styles/settings.css\`
  - \`dashboard/styles/components.css\`
- Master \`dashboard.css\` imports all modules with zero duplicate rules.
`;

// 3. TRD.md
const trdContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration TRD
## Technical Requirements Document: DOM Contracts, Subgrid Mechanics & Event Lifecycles

> **Document Type:** Technical Requirements Document (TRD)  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **Document Status:** READY_FOR_REVIEW / SPECIFICATION_LOCKED  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** Universal Rule 22 & [\`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md\`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Master Reference:** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  

---

## 🏛️ 1. Technical Architecture & DOM Topology

\`\`\`mermaid
flowchart TD
    subgraph DashboardLayout["Dashboard Master Layout (12-Column Bento Grid)"]
        Sidebar["Sidebar Navigation (Clean 3-Tab Nav + 2 Compact HUD Cards)"]
        TopBar["Top App Bar (Title + Filters + Pomodoro Pill + Export Hub + Refresh)"]
        Stage["Main Stage Content Container"]

        subgraph TrackingPane["Time Tracking Pane (#paneTracking)"]
            MetricsRow["Metrics Bento Row (.metrics-bento-row.bento-span-12) -> 5 Equal Subgrid Cards"]
            HeatmapCard["Hourly Heatmap Card (.bento-span-12) -> Linear-Style 168-Cell Matrix"]
            DomainCard["Domain Analytics Card (.bento-span-12) -> Table with Badge Popover & Hover Cluster"]
        end

        subgraph MediaPane["Media Analytics Pane (#paneMedia)"]
            TabStrip["Media Tab Strip (.media-tab-strip.bento-span-12) -> Horizontal Chip Carousel"]
            HeroPlayer["Hero Live Player (.bento-span-8) -> Embedded Ambient Visualizer Canvas"]
            AudioLab["Audio Lab DSP (.bento-span-4) -> 5-Band EQ & Enhancements"]
            MediaHistory["Media History Table (.bento-span-12)"]
        end

        subgraph SettingsPane["Settings & Data Pane (#paneSettings)"]
            SettingsGrid["Unified Settings Cards Grid (Sleep, Backup, Wellbeing, Blacklist, Budgets)"]
        end
    end

    Sidebar --> Stage
    TopBar --> Stage
    Stage --> TrackingPane
    Stage --> MediaPane
    Stage --> SettingsPane
\`\`\`

---

## 📐 2. DOM Restructuring Blueprints

### Blueprint 1: 5-Card Key Metrics Subgrid Container
In \`dashboard.html\`, wrap the 5 metric cards inside a dedicated subgrid container:

\`\`\`html
<!-- RESTORED: 5-Metric Symmetrical Subgrid Row -->
<div class="metrics-bento-row bento-span-12" role="region" aria-label="Key Performance Indicators">
  <!-- Card 1: Today Browsing -->
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

  <!-- Card 2: All-Time Browsing -->
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

  <!-- Card 3: Tracked Domains -->
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

  <!-- Card 4: Media Consumption -->
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

  <!-- Card 5: Productivity Score (Restored Symmetrical Integration) -->
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

**CSS Subgrid Mechanics:**
\`\`\`css
.metrics-bento-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
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
\`\`\`

---

### Blueprint 2: Consolidated Export Dropdown Hub
In \`dashboard.html\`, replace loose export buttons in Top App Bar with a unified export hub:

\`\`\`html
<!-- RESTORED: Consolidated Export Dropdown Hub -->
<div class="export-dropdown-container">
  <button id="btnExportMenu" class="btn-action-outline btn-export-trigger" aria-haspopup="true" aria-expanded="false" title="Export & Reports">
    <span class="action-btn-icon">📥</span>
    <span id="btnExportMenuText">Export</span>
    <span class="dropdown-chevron">▾</span>
  </button>
  <div id="exportDropdownMenu" class="export-dropdown-menu liquid-glass-card hidden" role="menu" aria-label="Export Formats">
    <button id="btnPrintPdf" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">🖨️</span>
      <div class="menu-item-info">
        <span class="menu-item-title" id="btnPrintPdfText">Save PDF Executive Digest</span>
        <span class="menu-item-desc">Print-optimized multi-page report</span>
      </div>
    </button>
    <button id="btnDownloadHtmlDigest" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">📄</span>
      <div class="menu-item-info">
        <span class="menu-item-title" id="btnDownloadHtmlDigestText">Offline HTML Report</span>
        <span class="menu-item-desc">Self-contained interactive dashboard</span>
      </div>
    </button>
    <div class="dropdown-divider"></div>
    <button id="btnExportTimeCsv" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">📊</span>
      <div class="menu-item-info">
        <span class="menu-item-title">Export Time Data (CSV)</span>
        <span class="menu-item-desc">RFC 4180 raw tabular records</span>
      </div>
    </button>
    <button id="btnExportMediaCsv" class="export-menu-item" role="menuitem">
      <span class="menu-item-icon">🎬</span>
      <div class="menu-item-info">
        <span class="menu-item-title">Export Media History (CSV)</span>
        <span class="menu-item-desc">Full audio/video play records</span>
      </div>
    </button>
  </div>
</div>
\`\`\`

---

### Blueprint 3: Top App Bar Pomodoro Status Pill & Popover
Extract \`#widgetPomodoroSentinel\` from sidebar. In \`dashboard.html\`, place the pill in \`.app-bar-right\`:

\`\`\`html
<!-- RESTORED: Pomodoro Interactive Pill in Top App Bar -->
<div class="pomodoro-pill-container">
  <button id="pomodoroNavPill" class="pomodoro-nav-pill" aria-haspopup="true" aria-expanded="false" title="Pomodoro Focus Sentinel">
    <span class="pomodoro-pill-icon">🧘</span>
    <span id="pomodoroPillClock" class="pomodoro-pill-time">25:00</span>
    <span id="pomodoroPillBadge" class="badge-focus-micro">Focus</span>
  </button>

  <!-- Interactive Glassmorphism Popover Modal -->
  <div id="pomodoroPopoverModal" class="pomodoro-popover-card liquid-glass-card hidden" role="dialog" aria-label="Pomodoro Focus Controls">
    <div class="pomodoro-popover-header">
      <div class="pomodoro-popover-title-group">
        <span class="pomodoro-popover-title">🧘 Focus Sentinel & Pomodoro</span>
        <span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>
      </div>
      <button id="btnPomodoroPopoverClose" class="btn-icon-close" aria-label="Close">✕</button>
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

---

### Blueprint 4: Compact Linear-Style 168-Cell Heatmap Matrix
Refactor \`#cardHourlyHeatmap\` in \`dashboard.html\`:

\`\`\`html
<!-- RESTORED: Compact Linear-Style Chrono-Heatmap Card -->
<div id="cardHourlyHeatmap" class="bento-card liquid-glass-card bento-span-12 heatmap-card-compact">
  <div class="bento-card-header">
    <div class="header-left">
      <h3 id="txtHeatmapTitle" class="bento-card-title">🕒 24-Hour Activity Heatmap</h3>
      <span id="txtHeatmapSub" class="bento-card-sub">Hourly focus intensity matrix (Past 7 Days)</span>
    </div>
    <div class="header-right heatmap-header-controls">
      <!-- Mode Switcher Pill -->
      <div class="segmented-control-mini" role="radiogroup" aria-label="Heatmap Mode">
        <button type="button" id="btnHeatmapModeFocus" class="seg-btn active" role="radio" aria-checked="true">Focus</button>
        <button type="button" id="btnHeatmapModeMedia" class="seg-btn" role="radio" aria-checked="false">Media</button>
      </div>
      <!-- Intensity Legend -->
      <div class="heatmap-legend-mini">
        <span class="legend-lbl">Less</span>
        <span class="legend-cell tier-0"></span>
        <span class="legend-cell tier-1"></span>
        <span class="legend-cell tier-2"></span>
        <span class="legend-cell tier-3"></span>
        <span class="legend-cell tier-4"></span>
        <span class="legend-lbl">More</span>
      </div>
    </div>
  </div>

  <div class="chrono-heatmap-wrapper">
    <div id="hourlyHeatmapGrid" class="chrono-heatmap-grid-compact" role="grid" aria-label="Activity Matrix">
      <!-- 7 rows x 24 columns generated dynamically by temporal_productivity_feature.js -->
    </div>
  </div>
</div>
\`\`\`

---

### Blueprint 5: Clean Domain Table with Productivity Badge Popover
In \`src/dashboard/components/domain_table.js\`, eliminate inline \`<select>\` elements:

\`\`\`javascript
// RESTORED: Render sleek productivity pill badge instead of crude native <select>
function renderProductivityBadge(domain, currentCategory) {
  const catKey = currentCategory || 'neutral';
  const colorMap = {
    'work': 'emerald',
    'learning': 'cyan',
    'entertainment': 'rose',
    'social': 'amber',
    'utilities': 'violet',
    'neutral': 'slate'
  };
  const color = colorMap[catKey] || 'slate';
  
  return \`
    <button type="button" class="badge-productivity \${color}" data-domain="\${domain}" data-category="\${catKey}" title="Click to change category">
      <span class="prod-dot"></span>
      <span class="prod-text">\${formatCategoryName(catKey)}</span>
      <span class="prod-chevron">▾</span>
    </button>
  \`;
}
\`\`\`

Hover Action Cluster:
\`\`\`html
<div class="cell-quick-actions">
  <button type="button" class="btn-cell-star \${isStarred ? 'active' : ''}" data-domain="\${domain}" title="\${isStarred ? 'Unstar domain' : 'Star domain'}">
    \${isStarred ? '★' : '☆'}
  </button>
  <button type="button" class="btn-cell-note \${hasNote ? 'has-note' : ''}" data-domain="\${domain}" title="\${hasNote ? 'Edit project note' : 'Add project note'}">
    📝
  </button>
</div>
\`\`\`

---

## ⚡ 3. Popover & Event Lifecycle Architecture

All new dropdowns and popovers (\`#exportDropdownMenu\`, \`#pomodoroPopoverModal\`, \`.productivity-popover\`) must adhere to strict single-active popover management:

\`\`\`javascript
// Global Popover Manager Contract
class DashboardPopoverManager {
  static open(popoverElement, triggerElement) {
    this.closeAll();
    popoverElement.classList.remove('hidden');
    triggerElement.setAttribute('aria-expanded', 'true');
    this.activePopover = popoverElement;
    this.activeTrigger = triggerElement;
  }

  static closeAll() {
    if (this.activePopover) {
      this.activePopover.classList.add('hidden');
      if (this.activeTrigger) this.activeTrigger.setAttribute('aria-expanded', 'false');
      this.activePopover = null;
      this.activeTrigger = null;
    }
  }

  static initGlobalListeners() {
    document.addEventListener('click', (e) => {
      if (this.activePopover && !this.activePopover.contains(e.target) && !this.activeTrigger?.contains(e.target)) {
        this.closeAll();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  }
}
\`\`\`
`;

// 4. DESIGN.md
const designContent = `# Web Activity & Media Sentinel - Dashboard Design System 2.0
## iOS 26 Liquid Glass & Bento Grid Aesthetic Specification

> **Document Type:** Design System Specification & Visual Style Guide  
> **System Name:** Sentinel Liquid Glass 2.0 Design System  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **Document Status:** CANONICAL_DESIGN_SPECIFICATION  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** Universal Rule 22 & Universal Rule 5 (UTF-8 BOM)  

---

## 🎨 1. Core Materiality & Specular Depth

The design system is modeled after the refined translucent materiality of **iOS 26 Liquid Glass**, featuring dynamic backdrop blur, specular refraction borders, multi-tier elevation shadows, and chromatic accents:

\`\`\`css
:root {
  /* Dynamic Liquid Glass Surface */
  --glass-surface-bg: rgba(15, 23, 42, 0.65);
  --glass-surface-hover: rgba(30, 41, 59, 0.80);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-focus: rgba(16, 185, 129, 0.50);
  --glass-specular-highlight: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%);
  --glass-backdrop-blur: blur(24px);
  --glass-saturation: saturate(190%);
  --glass-card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-card-hover-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.48);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  /* Accent System */
  --accent-emerald: #10b981;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-rose: #f43f5e;
  --accent-amber: #f59e0b;
}

[data-theme="light"], .theme-light {
  --glass-surface-bg: rgba(255, 255, 255, 0.75);
  --glass-surface-hover: rgba(241, 245, 249, 0.85);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-border-focus: rgba(16, 185, 129, 0.60);
  --glass-specular-highlight: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.30) 100%);
  --glass-card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.06);

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #475569;
  --text-dim: #64748b;
}
\`\`\`

---

## 📐 2. The 12-Column Bento Grid & 5-Column Subgrid Math

The dashboard stage uses a strict 12-column responsive grid architecture:

\`\`\`css
.bento-grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.25rem;
  width: 100%;
}

.bento-span-12 { grid-column: span 12; }
.bento-span-8  { grid-column: span 8; }
.bento-span-6  { grid-column: span 6; }
.bento-span-4  { grid-column: span 4; }
.bento-span-3  { grid-column: span 3; }
\`\`\`

### The Key Metrics Subgrid Rule:
Whenever an odd number of metric cards (e.g. 5 cards) must be rendered in a single row, **NEVER assign \`.bento-span-3\` directly to each card**!  
Instead, wrap them in a container spanning the full 12 columns:
\`\`\`css
.metrics-bento-row.bento-span-12 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}
\`\`\`
This achieves mathematical perfection: all 5 cards occupy exactly $20\\%$ of the width with identical spacing and height.

---

## 🕹️ 3. 60fps Micro-Motion & Spring Physics

All transitions must adhere to the high-performance GPU-accelerated bezier curve:

\`\`\`css
/* Spring Bezier Curve */
:root {
  --motion-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-fast: 150ms var(--motion-spring);
  --motion-normal: 250ms var(--motion-spring);
  --motion-slow: 400ms var(--motion-spring);
}

.liquid-glass-card {
  transition: transform var(--motion-fast), box-shadow var(--motion-fast), border-color var(--motion-fast);
}

.liquid-glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-card-hover-shadow);
  border-color: rgba(255, 255, 255, 0.16);
}
\`\`\`

---

## ♿ 4. WCAG 2.1 AAA Accessibility & Focus Rings

1. **Contrast Ratio:** All primary text must exceed 7.0:1 contrast ratio against the glass background in both light and dark themes.
2. **Dual-Ring Focus Indicator:**
\`\`\`css
:focus-visible {
  outline: 2px solid var(--accent-emerald);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
}
\`\`\`
`;

writeBomFile('temp_prompt/dashboard_ui_ux_restoration/INDEX.md', indexContent);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/PRD.md', prdContent);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/TRD.md', trdContent);
writeBomFile('temp_prompt/dashboard_ui_ux_restoration/DESIGN.md', designContent);
