# Phase 02: Comprehensive Landscape Telemetry Table Columns (Domain & Media)

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 02 of 03  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_02_landscape_table_columns.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 Frontend Engineer  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/dashboard.css`  

---

## 🎯 1. Phase Objective
The objective of Phase 02 is to expand the telemetry tables in both the Standalone Offline HTML Report template (`generateExecutiveDigestHtml`) and the dashboard PDF print view to take full advantage of the A4 landscape format (1140px width):
1. **Domain Telemetry Table Expansion:**
   - Expand from 6 columns to 8 comprehensive columns:
     1. `Rank` (e.g., `#1`)
     2. `Domain & Host` (domain name with high-contrast text)
     3. `Category` (badged category: Work, Learning, Entertainment, Social, Utility)
     4. `Active Duration` (formatted using `formatHoursMinutes(d.activeTime)`)
     5. `Proportion Share` (percentage share of total active browsing)
     6. `Total Sessions` (integer count)
     7. `Avg Session Duration` (computed as `d.activeTime / Math.max(1, d.sessions || 1)`, formatted as `formatHoursMinutes` or `Xm Ys`)
     8. `Productivity Impact` (Productive / Leisure / Neutral based on category)
2. **Media Playback Telemetry Table Expansion:**
   - Expand from 5 columns to 7 comprehensive columns:
     1. `#` (index)
     2. `Media Title` (title string)
     3. `Platform / Source` (utility badge for platform / domain)
     4. `Watch Duration` (formatted media duration)
     5. `Playback Share` (computed as `(dur / totalMediaSeconds * 100).toFixed(1)%` if `totalMediaSeconds > 0`, else `0%`)
     6. `Audio State` (badged Audible vs Muted)
     7. `Playback Status / Type` (badged Streaming / Foreground / Recorded)
3. **Responsive Table & Typography Styles:**
   - Update `EXECUTIVE_DIGEST_CSS` within `backup_hub_digest_feature.js` and `@media print` in `dashboard/dashboard.css` with responsive percentage widths, high-contrast header borders, and badge tokens.

---

## 📋 2. Prerequisites & Inputs
- Completion of Phase 01 (page-break overhaul).
- Existing files:
  - [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
  - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
- Strict compliance with Universal Rule 28 ($\le 50$ lines per function, depth $\le 3$).

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `src/dashboard/features/backup_hub_digest_feature.js`
- **Lines 710–724 (`renderDomainRows`):**
  - Currently renders 6 `<td>` cells.
  - Refactor to compute average session duration and productivity impact.
  - Render 8 `<td>` cells corresponding to the expanded headers.
- **Lines 729–744 (`renderMediaRows`):**
  - Currently renders 5 `<td>` cells.
  - Refactor to compute `playbackShare` from `totalMediaSeconds` and playback type.
  - Render 7 `<td>` cells corresponding to the expanded headers.
- **Lines 748–766 (`renderMediaSection`):**
  - Update `<thead>` to reflect the 7 columns: `#`, `Media Title`, `Platform / Source`, `Watch Duration`, `Playback Share`, `Audio State`, `Playback Status`.
- **Lines 1067–1082 (`renderProportionsAndTable`):**
  - Update domain `<thead>` to reflect the 8 columns: `Rank`, `Domain & Host`, `Category`, `Active Duration`, `Proportion Share`, `Total Sessions`, `Avg Session`, `Productivity Impact`.
- **Lines 771–1002 (`EXECUTIVE_DIGEST_CSS`):**
  - Add badge styles for `.badge.productive`, `.badge.neutral`, `.badge.leisure`, `.badge.audible`, `.badge.muted`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Add Helper for Productivity & Session Metrics
In `src/dashboard/features/backup_hub_digest_feature.js`:
```javascript
function getProductivityBadge(category) {
  const cat = (category || '').toLowerCase();
  if (cat === 'work' || cat === 'learning') return '<span class="badge work">Productive</span>';
  if (cat === 'entertainment' || cat === 'social') return '<span class="badge entertainment">Leisure</span>';
  return '<span class="badge utility">Neutral</span>';
}
```

### Step 2.2: Expand `renderDomainRows`
Update `renderDomainRows(sortedDomains, totalActiveSeconds)` to output:
- `Rank`: `#${i + 1}`
- `Domain & Host`: `escapeHtml(d.domain)`
- `Category`: badged category
- `Active Duration`: `formatHoursMinutes(d.activeTime)`
- `Proportion Share`: `${pct}%`
- `Total Sessions`: `${d.sessions}`
- `Avg Session Duration`: `formatHoursMinutes(Math.round(d.activeTime / Math.max(1, d.sessions || 1)))`
- `Productivity Impact`: `getProductivityBadge(d.category)`

Ensure the function line count stays $\le 40$ lines.

### Step 2.3: Expand `renderMediaRows` and `renderMediaSection`
Pass `totalMediaSeconds` into `renderMediaRows` (or compute share):
- `#`: `#${i + 1}`
- `Media Title`: `escapeHtml(title)`
- `Platform / Source`: badged platform
- `Watch Duration`: `formatHoursMinutes(dur)`
- `Playback Share`: `${sharePct}%`
- `Audio State`: badged audible / muted
- `Playback Status`: badged `Active / Recorded`

### Step 2.4: Update `dashboard/dashboard.css`
Add column alignment, badge styling, and table layout rules in `@media print` matching the landscape table specifications.

---

## 🛡️ 5. Architectural Constraints & Boundaries
- **Universal Rule 28:** All helper functions must be $\le 50$ lines with cyclomatic depth $\le 3$.
- **W3C Trusted Types & Zero innerHTML assignments:** All string interpolations must use `escapeHtml()`.
- **UTF-8 with BOM:** Files must start with `0xEF, 0xBB, 0xBF`.

---

## 📦 6. Deliverables Manifest
- Updated [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
- Updated [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)

---

## 🧪 7. Local Verification Gate
Run:
```bash
node tests/test_export_reports_data_and_layout_fix.js
```
Expected: Battery 3 passes with verified 8-column domain telemetry and 7-column media telemetry assertions.
