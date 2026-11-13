# Phase 03: Dashboard & Popup UI Modular Architecture

> **Phase Identifier:** `PHASE-03-POPUP-DASHBOARD-UI`  
> **Target Subsystem:** Extension Popup & Analytics Dashboard (`popup/popup.js`, `dashboard/dashboard.js`, `src/popup/`, `src/dashboard/`)  
> **Lead Role:** Level 4 Frontend Engineer  
> **Assigned Model:** `flash` (per Dynamic Matrix Dept 05)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/phase_03_dashboard_and_popup_ui.md`

---

## 🎯 1. Phase Objective
Refactor the two massive UI script files (`popup/popup.js` 143 KB, ~3,200 lines and `dashboard/dashboard.js` 135 KB, ~3,000 lines) into modern, componentized, domain-driven modules under `src/popup/` and `src/dashboard/`. Maintain the strict 420px max-width layout, single-row 7-button footer toolbar, reactive SQLite Data Hub synchronization, multi-browser filtering (Chrome, Edge, Firefox, All), and 4-Pillar Hub navigation while ensuring all UI tests pass cleanly.

---

## 📦 2. Prerequisites & Inputs
- **Prerequisite Phases:** Phase 01 (`src/shared/` and background IPC) and Phase 02 (Media actions bridge) completed.
- **Target Files:**
  - `popup/popup.js`, `popup/popup.html`, `popup/popup.css`
  - `dashboard/dashboard.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`
- **Baseline Tests:** `node tests/test_four_pillar_hub_ui.js` and `node tests/test_dashboard_multi_browser_filter.js` must pass.

---

## ⚓ 3. Technical Context & File Anchors

1. **In `popup/popup.js`:**
   - Lines 50–200: Global state management (`mediaState`, `trackingState`, `currentTab`, `dataHubAnalytics`, `selectedBrowserFilter`)
   - Lines 201–450: Background IPC & SQLite Data Hub messaging (`QUERY_DATA_HUB`, `DATA_HUB_STATUS_CHANGED`, `QUERY_STATE`)
   - Lines 451–750: Tab navigation & tab switching (`switchTab`, `mainTabMedia`, `mainTabAudio`, `mainTabStudio`, `mainTabTracking`)
   - Lines 751–1100: Media player pane rendering (`renderMediaCard`, progress scrubbers, volume controls)
   - Lines 1101–1500: Audio Lab pane rendering (0-200% volume boost, 5-band graphic equalizer sliders, presets)
   - Lines 1501–1900: Studio Vault pane rendering (timestamp notes, clip bookmarks, screenshot gallery)
   - Lines 1901–2400: Focus & tracking pane rendering (`processDomainStats`, `renderStatsPills`, `renderDonutChart`)
   - Lines 2401–2800: Sleep Timer modal and UI controls (`openSleepTimerModal`, duration presets, volume fade toggle)
   - Lines 2801–3200: Single-row footer toolbar controls & event bindings

2. **In `dashboard/dashboard.js`:**
   - Lines 50–300: Multi-browser filter state and dropdown synchronization (`browserFilterSelect`, `syncBrowserFilter`)
   - Lines 301–700: Date range filtering (Today, 7 Days, 30 Days, Custom range)
   - Lines 701–1400: SVG & Canvas analytics chart renderers (Donut charts, activity histograms)
   - Lines 1401–2100: Domain analytics detailed table (sorting, search, pagination)
   - Lines 2101–3000: Data Hub WebSocket live synchronization and offline fallback

---

## 🔨 4. Surgical Step-by-Step Implementation Instructions

### Step 3.1: Modularize Popup Architecture (`src/popup/`)
1. Create `src/popup/state/popup_state.js`:
   - Centralize popup reactive state: active tab, current media track, tracking stats, browser filter.
2. Create `src/popup/services/`:
   - `ipc_service.js`: Wrapper for `chrome.runtime.sendMessage` with promise rejection guards.
   - `data_hub_service.js`: Coordinates `QUERY_DATA_HUB` requests and status change notifications.
   - `storage_service.js`: Persists and restores tab state and browser filter selection.
3. Create `src/popup/components/`:
   - `header_badges.js`: Renders HUD connection badge, Data Hub badge, and quick settings popover.
   - `footer_toolbar.js`: Manages the strict single-row 7-button layout without layout shift.
   - `stats_pills.js`: Renders today's seconds, daily average, and total session pills.
4. Create `src/popup/tabs/`:
   - `tab_media.js`: Player pane controls, track title, seekbar, in-card micro-actions.
   - `tab_audio.js`: 0-200% boost slider, 5-band EQ sliders (60Hz, 250Hz, 1kHz, 4kHz, 16kHz), vocal clarity toggle.
   - `tab_studio.js`: Timestamp note capture, clips bookmark list, screenshot gallery.
   - `tab_tracking.js`: Focus ratio gauge, domain breakdown table, donut chart, doomscroll breaker.

### Step 3.2: Modularize Dashboard Architecture (`src/dashboard/`)
1. Create `src/dashboard/state/dashboard_state.js`:
   - Manages selected browser filter (`all`, `chrome`, `edge`, `firefox`), active time range, and domain query.
2. Create `src/dashboard/services/analytics_service.js`:
   - Processes raw SQLite rows into aggregated domain statistics, totals, and daily averages.
3. Create `src/dashboard/filters/browser_filter.js`:
   - Manages `#browserFilterSelect` options and two-way storage synchronization.
4. Create `src/dashboard/charts/`:
   - `donut_chart.js`: Renders interactive domain share donut chart.
   - `time_series_chart.js`: Renders daily/hourly activity histograms.
5. Create `src/dashboard/components/domain_table.js`:
   - Renders sortable, searchable, paginated domain analytics table.

### Step 3.3: Maintain Root Entry Compatibility
1. Structure `popup/popup.js` and `dashboard/dashboard.js` as clean orchestrators that load the modules while preserving exact function names checked by tests (`processDomainStats`, `renderDonutChart`, `getFaviconUrl`, `updateBrowserFilterOptions`, etc.).
2. Ensure brace balance and zero syntax warnings (`node -c`).

---

## 🚫 5. Architectural Constraints & Boundaries
- **Strict 420px Max Width:** No module may introduce horizontal overflow or break CSS sizing constraints in `popup.css`.
- **W3C Trusted Types Compliance:** Zero assignments to `innerHTML`. All chart labels, table rows, and pills must be built using `document.createElement` and `textContent`.
- **Footer Toolbar Single Row:** The 7-button layout in the footer must remain in a single row without wrapping.

---

## 📋 6. Deliverables Manifest
- `src/popup/state/popup_state.js`
- `src/popup/services/ipc_service.js`
- `src/popup/services/data_hub_service.js`
- `src/popup/services/storage_service.js`
- `src/popup/components/header_badges.js`
- `src/popup/components/footer_toolbar.js`
- `src/popup/components/stats_pills.js`
- `src/popup/tabs/tab_media.js`
- `src/popup/tabs/tab_audio.js`
- `src/popup/tabs/tab_studio.js`
- `src/popup/tabs/tab_tracking.js`
- `src/dashboard/state/dashboard_state.js`
- `src/dashboard/services/analytics_service.js`
- `src/dashboard/filters/browser_filter.js`
- `src/dashboard/charts/donut_chart.js`
- `src/dashboard/charts/time_series_chart.js`
- `src/dashboard/components/domain_table.js`
- Refactored `popup/popup.js` and `dashboard/dashboard.js`

---

## 🚦 7. Local Verification Gate
Execute the following verification commands; all must exit with code 0:
```powershell
node -c popup/popup.js
node -c dashboard/dashboard.js
node tests/test_four_pillar_hub_ui.js
node tests/test_six_tab_popup_architecture.js
node tests/test_popup_sqlite_data_hub_sync.js
node tests/test_dashboard_multi_browser_filter.js
node tests/test_header_status_badges.js
node tests/test_tab_switch_and_storage_persistence.js
```
