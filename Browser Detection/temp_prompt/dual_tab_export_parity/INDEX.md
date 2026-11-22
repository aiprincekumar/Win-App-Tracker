# Dual-Tab Export Parity Overhaul - Tracking Index & Diagnostic Dossier

> **Task Container:** `temp_prompt/dual_tab_export_parity/`  
> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:**  
> 1. Dashboard In-Browser Print Engine (`dashboard/dashboard.css`, `dashboard/styles/backup_digest.css`)  
> 2. Standalone Offline Executive Digest Generator (`src/dashboard/features/backup_hub_digest_feature.js`)  
> 3. Dashboard Telemetry & Integration Engine (`dashboard/dashboard.js`)  
> 4. Test Automation & QA Verification (`tests/test_dual_tab_export_parity.js`, `run_all_tests.js`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  

---

## 📋 1. Executive Problem & Solution Summary

### Problem Dossier
Users generating PDF/print reports or exporting the Standalone Offline Executive HTML Digest experience severe feature and telemetry disparity between on-screen dashboard tabs and printed/exported documents:
1. **Missing Media Analytics in Print View:** In `@media print` (`dashboard/dashboard.css` & `dashboard/styles/backup_digest.css`), `#paneMedia` is unconditionally suppressed (`display: none !important;`), completely omitting all video watch time, streaming volume, and media history from printed PDFs.
2. **Missing Chrono Heatmap in Print View:** `#cardChronoHeatmap` lacks dedicated print rules. In print view, the 7x24 hourly distribution matrix is either clipped, broken across margins, or rendered with low contrast, omitting critical circadian productivity telemetry.
3. **Interactive Widget Pollution:** If `#paneMedia` is enabled without surgical suppression, real-time interactive widgets (`#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, canvas visualizers, scrubber tracks, mode buttons) render blank frames or cluttered interactive artifacts.
4. **Single-Tab Limitation in Standalone HTML Digest:** The offline single-file report (`src/dashboard/features/backup_hub_digest_feature.js`) only renders Time Tracking metrics and a basic media table. It lacks the symmetrical 10-KPI Media Grid (Total Watch, Avg Watch, Sessions, Top Platform, Live Streams, Avg/Peak/Low Volume, Muted Sessions, Longest Media) and lacks the 7x24 Chrono-Activity Heatmap matrix.
5. **Dashboard Integration & Extraction Gaps:** `dashboard/dashboard.js` only extracts Time Tracking DOM metrics in `getActiveReportMetrics`. Media KPI DOM metrics and active heatmap distributions are omitted from the export payload, causing the standalone digest to fall back to empty placeholder data.

### Architectural Solution
1. **Phase 1: CSS Print Overhaul (`dashboard/dashboard.css` & `dashboard/styles/backup_digest.css`):**
   - Unhide `#paneMedia` with `display: block !important; opacity: 1 !important; visibility: visible !important;`.
   - Structure `#mediaMetricsGrid` into a high-density 5-column CSS grid (`grid-template-columns: repeat(5, 1fr) !important;`) with atomic leaf avoidance (`break-inside: avoid !important;`).
   - Format `#cardChronoHeatmap` for print: force container visibility, calibrate high-contrast print intensity tiers, ensure full-width horizontal matrix (`repeat(24, 1fr)`), and protect grid from mid-row fragmentation.
   - Strictly suppress interactive media widgets (`#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, `.heatmap-controls-row`, `#heatmapCellTooltip`).
   - Enforce clean page transitions between Part 1 (Tracking) and Part 2 (Media) via `page-break-before: always !important; break-before: page !important;`.
   - Maintain `backup_digest.css` strictly under the 650-line CI limit (Universal Rule 28).
2. **Phase 2: Standalone Executive HTML Digest Feature Overhaul (`src/dashboard/features/backup_hub_digest_feature.js`):**
   - Restructure `generateExecutiveDigestHtml` into a two-part executive dossier:
     * **Part 1 (Time Tracking & Circadian Focus):** 10-KPI Tracking Grid, 7x24 Chrono-Activity Heatmap (rendered via SVG/CSS matrix with legend), and Top Proportions & Domain Telemetry Table.
     * **Part 2 (Media Analytics & Audio Streaming):** Symmetrical 10-KPI Media Grid (Row 1: Total Watch, Avg Watch, Sessions, Top Platform, Streams; Row 2: Avg Volume, Peak Volume, Low Volume, Muted Sessions, Longest Media) and Detailed Media Playback History Table.
   - Implement `renderChronoHeatmapSection` and `renderExecutiveMediaMetricsGrid` with clean sub-functions (<= 50 lines, max depth <= 3).
   - Expand `extractDigestKpiMetrics` to extract both tracking and media metrics.
   - Maintain zero `innerHTML` and strict W3C HTML escaping.
3. **Phase 3: Dashboard Integration (`dashboard/dashboard.js`):**
   - Expand `getActiveReportMetrics` to scrape the 10 live Media KPI DOM elements with safe fallback to `dashboardData.mediaHistory`.
   - Extract active Chrono Heatmap matrix data from runtime memory (`window.__CHRONO_HEATMAP_DATA__` or aggregated activity records).
   - Pass complete telemetry dataset to `downloadStandaloneHtmlDigest` in `handleExportHtmlDigestClick`.
   - Condition DOM before print dialog in `triggerPrintPdf`.
4. **Phase 4: Independent QA Verification & Test Automation (`tests/test_dual_tab_export_parity.js`):**
   - Author 6-battery automated test suite verifying print rules, standalone HTML structure, dual-tab parity, media KPI extraction, heatmap rendering, and Universal Rule 28 compliance.
   - Run full regression suite (`node run_all_tests.js`) verifying 117/117 pass with exit code 0.
   - Run `gitleaks detect --redact` (0 leaks).
   - Perform autonomous micro-commits and push intelligence per Rule 15.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target Scope | Assigned Agent | Status | QA Signoff |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | CSS Print Overhaul & Multi-Tab Isolation | `dashboard/dashboard.css`, `dashboard/styles/backup_digest.css` | Level 4 Frontend Subagent | `COMPLETED` | Gate 1 Pass |
| **02** | Standalone Executive Digest Feature Overhaul | `src/dashboard/features/backup_hub_digest_feature.js` | Level 4 Fullstack Subagent | `COMPLETED` | Gate 2 Pass |
| **03** | Dashboard Integration & Telemetry Extraction | `dashboard/dashboard.js` | Level 4 Frontend Subagent | `COMPLETED` | Gate 3 Pass |
| **04** | Independent QA Verification & Test Automation | `tests/test_dual_tab_export_parity.js`, `run_all_tests.js` | Level 4 QA Subagent | `COMPLETED` | Grade A+ Pass |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.css` | `#paneMedia` is suppressed with `display: none !important;` in `@media print`, omitting all media analytics from PDF exports. | Unhide `#paneMedia` (`display: block !important;`), insert section break (`break-before: page !important;`), format `#mediaMetricsGrid` into 5x2 CSS grid, suppress interactive widgets (`#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`). | Printed PDF includes both Time Tracking and Media Analytics sections with zero interactive widget clutter. | Phase 1 | `node tests/test_dual_tab_export_parity.js` |
| **2** | `dashboard/styles/backup_digest.css` | Modular stylesheet mirrors `dashboard.css` print definitions and lacks media tab unhiding and heatmap print rules. Line count (621 lines) must not exceed 650 lines. | Synchronize `@media print` rules with `dashboard.css` while consolidating selectors to maintain file length <= 650 lines (strictly respecting Universal Rule 28). | Dual-tab print styling is guaranteed whether loading monolithic or modular CSS; CI line-limit check passes. | Phase 1 | `node tests/test_dual_tab_export_parity.js` |
| **3** | `dashboard/dashboard.css` | `#cardChronoHeatmap` lacks print rules; cells, grid, and legend are vulnerable to overflow and low print contrast. | Add print rules for `#cardChronoHeatmap` and `.chrono-heatmap-grid`: `break-inside: avoid !important;`, `width: 100% !important;`, suppress interactive mode toggles and tooltips, apply high-contrast print intensity tier borders. | 7x24 heatmap renders crisply on Page 1 or Page 2 without horizontal overflow or clipping. | Phase 1 | `node tests/test_dual_tab_export_parity.js` |
| **4** | `src/dashboard/features/backup_hub_digest_feature.js` | `generateExecutiveDigestHtml` only generates Part 1 tracking grid and basic media table; 10-KPI Media Grid and Chrono Heatmap are completely missing. | Architect `renderChronoHeatmapSection` and `renderExecutiveMediaMetricsGrid` (2 rows of 5 cards). Integrate both into `generateExecutiveDigestHtml` under structured Part 1 and Part 2 sections. | Standalone offline HTML digest delivers 100% feature and visual parity with the live dashboard across both tabs. | Phase 2 | `node tests/test_dual_tab_export_parity.js` |
| **5** | `dashboard/dashboard.js` | `getActiveReportMetrics` only extracts tracking metrics from DOM; media metrics and heatmap state are omitted from the export payload. | Expand `getActiveReportMetrics` to extract 10 media KPI values (`mediaMetricTotalWatch`, `mediaMetricAvgWatch`, etc.) and export heatmap dataset to `exportOptions.mediaMetrics` and `exportOptions.chronoHeatmap`. | Real-time active media stats and hourly circadian distribution correctly hydrate the downloaded HTML report. | Phase 3 | `node tests/test_dual_tab_export_parity.js` |
| **6** | `tests/test_dual_tab_export_parity.js` | No automated regression test currently certifies dual-tab export parity or 10-KPI media grid rendering in exports. | Author comprehensive standalone test suite with 6 rigorous test batteries validating print rules, standalone HTML generation, telemetry extraction, and Rule 28 compliance. | Prevents future regressions and certifies complete system parity with exit code 0. | Phase 4 | `node run_all_tests.js` |

---

## 🛡️ 4. Artifact Manifest

- [`SUMMARY.md`](SUMMARY.md): Executive Architecture Summary & Risk Mitigation Roadmap
- [`PRD.md`](PRD.md): Product Requirements Document & INVEST Acceptance Criteria Contracts
- [`TRD.md`](TRD.md): Technical Requirements Document, Data Contracts & CSS Rules Engine Spec
- [`DESIGN.md`](DESIGN.md): Print Tokens, 2x5 Grid Geometry & Heatmap Contrast Specifications
- [`phase_01_css_print_overhaul.md`](phase_01_css_print_overhaul.md): Phase 1 Executable Subagent Prompt
- [`phase_02_html_digest_dual_tab.md`](phase_02_html_digest_dual_tab.md): Phase 2 Executable Subagent Prompt
- [`phase_03_dashboard_integration.md`](phase_03_dashboard_integration.md): Phase 3 Executable Subagent Prompt
- [`phase_04_qa_verification_test_automation.md`](phase_04_qa_verification_test_automation.md): Phase 4 Executable Subagent Prompt
