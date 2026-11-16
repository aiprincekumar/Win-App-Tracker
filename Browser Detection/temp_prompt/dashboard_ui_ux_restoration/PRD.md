# Web Activity & Media Sentinel - Dashboard UI/UX Restoration PRD
## Product Requirements Document: Seamless Aesthetic Restoration & Feature Harmony

> **Document Type:** Product Requirements Document (PRD)  
> **Target System:** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **Document Status:** READY_FOR_REVIEW / SPECIFICATION_LOCKED  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** Universal Rule 22 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Master Reference:** [`dashboard_ui_ux_restoration_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  

---

## 🎯 1. Product Vision & Executive Objective

The primary objective of this restoration project is to **restore the pristine, symmetrical iOS 26 Liquid Glass & Bento Grid visual elegance** (from commit `ef7d720`) while **preserving 100% of the functional capabilities** of the 8 features implemented during Phases 1 through 4:

1. **Zero Aesthetic Compromise:** No feature should appear "bolted on" or awkwardly shoved into vacant spaces. Every control must feel native, intentional, and ergonomically balanced.
2. **Zero Functional Regression:** Every single feature (Temporal Heatmap, Productivity Scoring, Multi-Tab Deck, Audio Visualizer, Backup/Restore, Executive Digest, Domain Notes/Starred, Pomodoro Focus Sentinel, and Daily Budgets) must remain 100% operational, fully wired to storage and IPC.
3. **Responsive Mathematical Harmony:** Ensure standard displays (1080p, 1440p, laptops at 1366x768) render without broken horizontal wrapping, ugly vertical scrollbars in sidebars, or bloated table rows.

---

## 🔍 2. Detailed Problem Breakdown & User Pain Points

### Pain Point 1: Broken Bento Grid (5 Metric Cards in a 12-Column Grid)
- **Problem:** Bento Grid uses 12 columns. In Phase 1, a 5th card was added (`#metricProductivityScore`) with class `bento-span-3`. Four cards take $4 \times 3 = 12$ columns. The 5th card wraps to the next line alone, spanning 3 columns while leaving 9 columns of empty whitespace!
- **User Impact:** Looks broken, unprofessional, and visually lopsided.
- **Requirement:** Key metrics must render as an unbroken, symmetrical row of 5 cards on desktop screens (>=1200px), transitioning to 3 columns on tablet, and 2 columns on mobile, without leaving trailing empty columns.

### Pain Point 2: Top App Bar Button Crowding
- **Problem:** `#btnPrintPdf` and `#btnDownloadHtmlDigest` were added directly into the `.app-bar-right` flex container next to browser filter, tracking filter, theme toggle, and refresh buttons.
- **User Impact:** Header wraps into two vertical rows on screens <= 1366px, pushing content down and misaligning title with actions.
- **Requirement:** Consolidate all export and reporting actions into a single sleek `[📥 Export ▾]` glassmorphism dropdown button that houses PDF, Standalone HTML, Time CSV, and Media CSV.

### Pain Point 3: Sidebar Pollution by Pomodoro Widget
- **Problem:** `#widgetPomodoroSentinel` was inserted into `<aside class="sidebar">`. With a large card header, 2.2rem clock readout, and 3 chunky control buttons, it pushed the Data Hub and HUD status cards off the bottom of standard screens.
- **User Impact:** Forces vertical scrolling in the sidebar, which is a major design violation in modern desktop apps.
- **Requirement:** Extract Pomodoro from sidebar. Relocate into an ultra-compact Top App Bar interactive status pill (`#pomodoroNavPill`) with a click-to-open glassmorphism popover, restoring the clean, unpolluted sidebar.

### Pain Point 4: 168-Cell Heatmap Vertical Sprawl
- **Problem:** `#cardHourlyHeatmap` was inserted as an enormous full-width card with large cells, cramped hour labels (0 to 23), and excessive vertical padding, pushing the Domain Analytics table below the fold.
- **User Impact:** Users must scroll past a giant grid just to see their website usage table.
- **Requirement:** Redesign as a compact Linear/GitHub-style contribution matrix: 16px cells, milestone hour marks (00, 04, 08, 12, 16, 20), smooth floating hover tooltip with glassmorphism, and a toggleable card header.

### Pain Point 5: Domain Table Clutter
- **Problem:** Each domain table row contains a native HTML `<select>` dropdown for productivity classification, plus a ⭐ star button and a 📝 note button.
- **User Impact:** Native `<select>` elements render with crude OS default styling, inflating row height from 42px to 58px+, distorting vertical alignment, and introducing visual noise.
- **Requirement:** Replace native `<select>` with a sleek, compact `.badge-productivity` pill (colored dot + category label) that triggers a lightweight popover on click. Group star and notes into an elegant `.cell-quick-actions` hover cluster that only reveals on mouse hover (or when active).

### Pain Point 6: Media Pane Clutter & Visualizer Stacking
- **Problem:** Multi-Tab Deck rendered large standalone cards for each tab above the Hero player. The Audio Visualizer canvas was placed in a separate box with heavy borders, stretching the Media Pane vertically.
- **User Impact:** Hero media controls are shoved down; user cannot view both the visualizer and media history simultaneously without excessive scrolling.
- **Requirement:** Convert Multi-Tab Deck into a sleek horizontal chip carousel strip (`.media-tab-strip`) docked above the Hero player. Integrate the Audio Visualizer canvas directly into the Hero card background as an ambient visualizer with an on/off toggle.

### Pain Point 7: Inconsistent Settings Form Elements
- **Problem:** Settings cards added in Phases 3 and 4 used haphazard CSS classes (`.styled-input`, `.btn-save-primary`, `.budget-input-row`, `.conflict-modal-card`) that clashed with the base design system.
- **User Impact:** Settings view looks fragmented and disjointed across tabs.
- **Requirement:** Enforce uniform `.settings-section-card`, `.settings-form-row`, `.form-control-input`, and standardized button classes across all settings cards.

### Pain Point 8: CSS Bloat & File Fragmentation
- **Problem:** 1466 lines dumped into `dashboard.css` + 4 standalone CSS files (`tracking.css`, `media.css`, `backup_digest.css`, `wellbeing_blacklist.css`) with overlapping rules and un-scoped classes.
- **Requirement:** Refactor stylesheets into cleanly scoped domain files in `dashboard/styles/` imported via master `dashboard.css`.

---

## 📋 3. Functional Requirements & Acceptance Criteria

### FR-01: Responsive 5-Card Metrics Row
- Key metrics container must use `.metrics-bento-row.bento-span-12`.
- Exactly 5 cards rendered: Today Browsing, All-Time Browsing, Tracked Domains, Media Consumed, Productivity Score.
- On screen widths $\ge 1200\text{px}$: 5 equal columns, 0 wrapping.
- On screen widths $768\text{px} - 1199\text{px}$: 3 columns with elegant auto-fit.
- On screen widths $< 768\text{px}$: 2 columns.
- All numbers animated smoothly with kinetic number roller (`animateNumberRoll`).

### FR-02: Consolidated Export Dropdown Hub
- Single action button: `<button id="btnExportMenu" class="btn-action-outline">📥 Export ▾</button>`.
- Clicking toggles `#exportDropdownMenu` with glassmorphism card.
- Menu contains:
  1. 🖨️ Save PDF Executive Digest (`#btnPrintPdf`)
  2. 🌐 Standalone HTML Report (`#btnDownloadHtmlDigest`)
  3. 📊 CSV Time Tracking (`#btnExportTimeCsv`)
  4. 🎬 CSV Media History (`#btnExportMediaCsv`)
- Esc key and click-outside automatically dismisses the dropdown.

### FR-03: Top App Bar Pomodoro Status Pill
- Ultra-compact pill: `<div id="pomodoroNavPill" class="pomodoro-nav-pill">`.
- Shows: State icon (🧘), countdown clock (`25:00`), mode badge (`Focus`).
- Clicking opens `#pomodoroPopoverModal` positioned right beneath the pill with Start, Pause, Reset, and Duration adjustments.
- Sidebar is completely freed from the large Pomodoro card.

### FR-04: Linear-Style 168-Cell Chrono Heatmap
- Total card height reduced by 40% (max-height: 260px).
- Cell size: 16px x 16px with 3px border-radius and 3px gap.
- Hour milestone labels: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00.
- Interactive tooltip on hover showing Day, Hour, Duration, and Top Domain.
- Zero horizontal scrollbar on viewport widths $\ge 1024\text{px}$.

### FR-05: Clean Ergonomic Domain Table
- Productivity column displays `.badge-productivity` pill (dot + text).
- Clicking badge opens a lightweight 3-choice popover (Productive, Neutral, Distracting).
- Favicon, domain name, and category properly aligned with 42px row height.
- Star (⭐) and Notes (📝) clustered in `.cell-quick-actions` on the right, visible on row hover or if already active.
- Table remains 100% accessible via keyboard navigation.

### FR-06: Compact Media Tab Strip & Ambient Visualizer
- Multi-Tab deck rendered as a horizontal scrollable chip bar (`.media-tab-strip`) directly above Hero Player.
- Active tab chip highlighted with glowing border and live EQ bars.
- Audio Visualizer canvas (`#canvasMediaAudioVisualizer`) rendered inside Hero Player card behind media metadata, with a `[📊 Visualizer]` toggle button.

### FR-07: Standardized Settings Architecture
- All settings cards use `.settings-section-card.liquid-glass-card`.
- All text inputs and dropdowns use `.form-control-input`.
- All buttons adhere to design system hierarchy (`.btn-action-primary`, `.btn-action-secondary`, `.btn-action-danger`).

### FR-08: Clean Modular Stylesheets
- Refactored CSS files:
  - `dashboard/styles/tokens.css`
  - `dashboard/styles/layout.css`
  - `dashboard/styles/metrics.css`
  - `dashboard/styles/tracking.css`
  - `dashboard/styles/media.css`
  - `dashboard/styles/settings.css`
  - `dashboard/styles/components.css`
- Master `dashboard.css` imports all modules with zero duplicate rules.
