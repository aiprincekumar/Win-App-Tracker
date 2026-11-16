# Phase 1: Temporal Engine & Productivity Classifier (Features 1 & 2)
## Standalone Executable Implementation Specification

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001` (Phase 1)  
> **Target Subsystems:** Feature 1 (Chrono-Distribution Heatmap) & Feature 2 (Productivity Classifier)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Required Skills:** `frontend-patterns`, `react-patterns`, `javascript`, `web-design-guidelines`  
> **Target Test Gate:** `tests/test_dashboard_features_phase1.js` (Must pass with Exit Code 0)  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Parent Ephemeral:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🎯 1. Phase Objective

Implement **Feature 1 (Custom Temporal Range & Chrono-Distribution Heatmap)** and **Feature 2 (Productivity Scoring & Smart Domain Classifier)** inside the Sentinel Dashboard.
This enables users to:
1. Filter telemetry across `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, and `Custom Range`.
2. Inspect hourly activity in a 7x24 matrix (168 cells) with Focus vs. Media mode toggling, hover popovers, and Week-over-Week (WoW) delta metrics.
3. Classify domains into 5 categories (`work`, `learning`, `entertainment`, `social`, `utility`) and view an aggregated 0-100 Productivity Score with a radial gauge.
4. Manually reassign any domain's category via a 1-click inline dropdown in the domain analytics table, persisting overrides to `chrome.storage.local`.

---

## 📦 2. Prerequisites & Environment State

- Working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`.
- Active memory anchors: [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) and [`project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md).
- Existing certified codebase: `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`, and `src/dashboard/features/dashboard_feature_manager.js`.

---

## 🔍 3. Technical Context & File Anchors

- `dashboard/dashboard.html`:
  - Locate `#tabTimeTracking` and `.time-filter-buttons` (lines 40-75). Add subtab buttons for `Yesterday`, `7 Days`, `30 Days`, `Custom Range`.
  - Add container `#cardChronoHeatmap` below top metrics grid.
  - In `#paneTracking`, add `#cardProductivityScore` in `.metrics-grid` with radial gauge `#svgProductivityGauge` and score readout.
  - In `#domainAnalyticsTable`, add `<th>Category</th>` after Domain column.
- `dashboard/dashboard.js`:
  - Merge `DASHBOARD_FUTURE_I18N` keys for Features 1 and 2 into `DASHBOARD_I18N.en` and `DASHBOARD_I18N.hi`.
  - Implement `aggregateChronoHeatmap(rawHistory, range)`.
  - Implement `renderChronoHeatmap(matrix, mode)`.
  - Implement `calculateProductivityScore(timeByCategory, totalActiveTime)`.
  - Implement `renderProductivityGauge(score, tier)`.
  - Implement `handleCategoryOverride(domain, newCategory)` with `chrome.storage.local.set({ domain_category_overrides: ... })`.
- `dashboard/dashboard.css`:
  - Add heatmap grid styles (`.chrono-heatmap-grid`, `.heatmap-cell`, `.tier-0` to `.tier-4`).
  - Add category badge styles (`.badge-cat-work`, `.badge-cat-learning`, etc.).
  - Add radial gauge animations.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Internationalization Updates
1. Open `dashboard/dashboard.js`.
2. Locate `DASHBOARD_I18N` definition.
3. Insert all keys specified in Section 9 of `dashboard_future_features_prompt.md` for Features 1 & 2 into both `en` and `hi` dictionaries:
   - `subtab_yesterday`, `subtab_7days`, `subtab_30days`, `subtab_custom`
   - `heatmap_title`, `heatmap_mode_focus`, `heatmap_mode_media`, `heatmap_wow_delta`
   - `productivity_title`, `productivity_badge_focus`, `productivity_badge_balanced`, `productivity_badge_distracted`
   - `cat_work`, `cat_learning`, `cat_entertainment`, `cat_social`, `cat_utility`

### Step 2: Temporal Filter & Heatmap UI Container
1. Open `dashboard/dashboard.html`.
2. In the time tracking filter controls, add:
   ```html
   <button class="subtab-btn" data-range="yesterday" id="btnFilterYesterday">⏪ Yesterday</button>
   <button class="subtab-btn" data-range="7d" id="btnFilter7Days">📊 Last 7 Days</button>
   <button class="subtab-btn" data-range="30d" id="btnFilter30Days">🗓️ Last 30 Days</button>
   <button class="subtab-btn" data-range="custom" id="btnFilterCustom">🎯 Custom</button>
   <div id="customDateRangePicker" class="custom-date-picker hidden">
     <input type="date" id="inputCustomStart">
     <input type="date" id="inputCustomEnd">
     <button id="btnApplyCustomRange" class="btn btn-sm btn-primary">Apply</button>
   </div>
   ```
3. Add `#cardChronoHeatmap` with mode toggles (Focus vs Media) and a 7x24 grid container `#heatmapGridContainer`.

### Step 3: Productivity Score Gauge UI & Table Column
1. In `dashboard/dashboard.html`, add `#cardProductivityScore` to `.metrics-grid`:
   - Include radial SVG circle gauge `#svgProductivityGauge`.
   - Score readout text `#valProductivityScore` (0-100).
   - Badge `#badgeProductivityTier` (Deep Focus / Balanced / Distracted).
2. In `#domainAnalyticsTable`, add a `<th>Category</th>` header and update table row rendering to insert an inline category `<select class="domain-cat-select">` with options for `work`, `learning`, `entertainment`, `social`, `utility`.

### Step 4: Logic Implementation in `dashboard/dashboard.js`
1. Load `domain_category_overrides` from `chrome.storage.local`.
2. In `renderDomainTable()`, read category per domain (checking override first, then built-in domain dictionary, defaulting to `utility` or `work`).
3. Attach change listener to `.domain-cat-select` calling `handleCategoryOverride(domain, newCategory)`:
   - Updates in-memory override map.
   - Saves to `chrome.storage.local`.
   - Re-computes productivity score and updates `#valProductivityScore` and gauge without page reload.
4. Implement `aggregateChronoHeatmap(rawHistory, range)`:
   - Iterates dates in range.
   - Populates 7 rows (Mon-Sun) x 24 columns (0-23h).
   - Computes WoW change comparing to previous equivalent cycle.
5. Implement `renderChronoHeatmap(matrix, mode)`:
   - Emits 168 cells with `data-intensity="0"..."4"`.
   - Configures hover tooltip with day name, hour window, time, and dominant domain.
   - Uses `document.createElement` exclusively (W3C Trusted Types Safe).

### Step 5: Styling in `dashboard/dashboard.css`
1. Add `.chrono-heatmap-grid` with `grid-template-columns: repeat(24, 1fr)`.
2. Define `.heatmap-cell[data-intensity="0"]` through `[data-intensity="4"]` according to `DESIGN.md`.
3. Add category badge and select styling.
4. Verify dark and light theme contrast compliance.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

- **NO raw innerHTML:** Strict prohibition on `element.innerHTML = ...`. Use `document.createElement`, `textContent`, and safe DOM methods.
- **NO modification to existing media playback logic:** Do not touch hero player play/pause or Web Audio DSP node wiring in this phase.
- **NO external libraries:** Zero external CDN scripts or npm dependencies. All algorithms must be pure JavaScript.

---

## 📋 6. Deliverables Manifest

1. `dashboard/dashboard.html` (Heatmap grid, temporal subtabs, productivity gauge, category column).
2. `dashboard/dashboard.js` (Aggregation algorithm, scoring formula, category overrides, i18n keys).
3. `dashboard/dashboard.css` (Heatmap cells, intensity tiers, category badges).
4. `tests/test_dashboard_features_phase1.js` (Automated verification test suite).

---

## 🧪 7. Local Verification Gate (Test Gate 1)

Execute the dedicated test suite:
```powershell
node tests/test_dashboard_features_phase1.js
node -c dashboard/dashboard.js
```

### Acceptance Criteria:
1. `tests/test_dashboard_features_phase1.js` exits with code 0.
2. Heatmap matrix correctly computes 168 cells from synthetic telemetry across Yesterday, 7d, 30d, and custom ranges.
3. Changing a domain category dynamically updates the productivity score and persists to `chrome.storage.local`.
4. Node.js AST check (`node -c`) reports 0 syntax errors.
5. All files verified UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
