# PDF Export Exact Parity Overhaul - Tracking Index & Diagnostic Dossier

> **Task Container:** `temp_prompt/pdf_export_exact_parity/`  
> **Task ID:** `TASK-PDF-EXPORT-EXACT-PARITY-001`  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:**  
> 1. Dashboard In-Browser Print Engine (`src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/dashboard.js`)  
> 2. Standalone Executive Digest Embedded Stylesheet & Pagination (`src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css`)  
> 3. Dashboard Integration & Telemetry Extraction Engine (`dashboard/dashboard.js`)  
> 4. Test Automation & Independent QA Verification (`tests/test_pdf_export_exact_parity.js`, `run_all_tests.js`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  

---

## 📋 1. Executive Problem & Solution Summary

### Problem Dossier
The user reported a critical defect in the dashboard export workflow:
> *"HTML एक्सपोर्ट सही है, लेकिन PDF एक्सपोर्ट बिल्कुल भी सही नहीं है। PDF एक्सपोर्ट भी बिल्कुल सेम वैसा ही होना चाहिए जैसा कि फर्स्ट पेज में है डैशबोर्ड के।"*  
> *(HTML export is correct, but PDF export is not right at all. PDF export must also be exactly identical to how it is in the first page of the dashboard / HTML export.)*

#### Root Cause Analysis
1. **Flawed Printing Mechanism (`window.print()` on Live SPA DOM):** Currently, when the user clicks **"Print / Save as PDF"** (`#btnPrintPdf`), `triggerPrintPdf` directly calls `window.print()` on the live, interactive single-page dashboard window. The live dashboard contains navigation sidebars, tab switches, dynamic canvas visualizers, audio player docks, toolbars, and complex containers (`.bento-grid-container`, flex wrappers) that interact unpredictably with `@media print` rules across different Chromium/Blink builds.
2. **Tab Inactivity & DOM Mismatch:** Because `#paneOverview` and `#paneMedia` are separate tabs in the interactive dashboard, printing the live page often leads to inactive panels being hidden, truncated, or displaying empty artifacts. In contrast, the **Standalone HTML Digest** (`generateExecutiveDigestHtml`) generates a pristine, unified, static document containing all telemetry from both Time Tracking and Media Analytics in a clean, sequential flow.
3. **Pagination & Layout Disparity:** In native dashboard printing, elements bleed across page boundaries, leaving awkward gaps or omitting key charts and media cards. The user expects the PDF export to look **100% identical** to the clean Standalone Executive HTML Digest, starting with Part 1 (Time Tracking, 10-KPI cards, Chrono Activity Heatmap, Donut Chart, and Domain Table) on Page 1, followed strictly by Part 2 (Media Analytics & 10-KPI Media Grid) on a new page.

### Architectural Solution: Isolated Iframe Print Engine
Instead of dumping the messy interactive dashboard DOM to `window.print()`, `triggerPrintPdf` is refactored to:
1. **Generate the Approved Executive Digest HTML:** Call `generateExecutiveDigestHtml(data, options)` with the exact live metrics from `getActiveReportMetrics(options)`, matching what `downloadStandaloneHtmlDigest` generates.
2. **Print via Isolated Hidden Iframe:** Inject the generated static HTML document into a sandboxed, hidden `<iframe>` (`id="sentinelPrintIframe"`), wait for iframe rendering, focus the iframe window, and invoke `iframe.contentWindow.print()`. This forces the browser to print the clean, dedicated executive digest rather than the SPA DOM.
3. **Graceful Fallback:** If iframe creation is blocked (e.g., restricted iframe environment), gracefully fall back to a temporary offscreen print container or standard fallback.
4. **Pristine Two-Part CSS Pagination:**
   - **Part 1 (Time Tracking - Starts on Page 1):** Executive Header, 10-KPI Tracking Grid (2x5), Chrono Activity Heatmap (24h x 7d), Top Activity Proportions (Donut chart & legend), and Domain Activity Table.
   - **Part 2 (Media Analytics - Strictly Starts on Page 2):** Enforced page break (`break-before: page !important; page-break-before: always !important;`), Section Title, 10-KPI Media Grid (2x5), Media Playback Watch History table, and verification footer.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target Scope | Assigned Agent | Status | QA Signoff |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | Isolated Iframe Print Engine & Digest Parity | `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/dashboard.js` | Level 4 Fullstack Subagent | `PAUSED` | Awaiting Gate 1 |
| **02** | CSS Pagination & Two-Part Layout Refinement | `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/styles/backup_digest.css`, `dashboard/dashboard.css` | Level 4 Frontend Subagent | `PAUSED` | Awaiting Gate 2 |
| **03** | Independent QA Verification & Test Automation | `tests/test_pdf_export_exact_parity.js`, `run_all_tests.js` | Level 4 QA Subagent | `PAUSED` | Awaiting Grade A+ |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `src/dashboard/features/backup_hub_digest_feature.js` | `triggerPrintPdf` directly calls `win.print()` on live dashboard window, causing messy SPA layout, broken tab states, and major visual disparity from HTML export. | Refactor `triggerPrintPdf` to call `generateExecutiveDigestHtml(data, options)`, write into hidden iframe (`#sentinelPrintIframe`), focus, and trigger `iframe.contentWindow.print()` with post-print cleanup and dedicated container fallback. | PDF export prints the exact same clean, structured document as the HTML export with 100% parity. | Phase 1 | `node tests/test_pdf_export_exact_parity.js` |
| **2** | `dashboard/dashboard.js` | `triggerPrintPdf` and `handleExportPdfClick` only pass basic scalar stats (`totalTime`, `topDomain`) to `_BackupHubDigest.triggerPrintPdf`, lacking full live telemetry (`mediaMetrics`, `chronoHeatmap`, `activityData`, `mediaHistory`). | Enrich `triggerPrintPdf` in `dashboard.js` to assemble full telemetry payload (matching `downloadStandaloneHtmlDigest`) and pass payload + options to `_BackupHubDigest.triggerPrintPdf`. | Iframe print engine receives 100% hydrated live dashboard data for both Time Tracking and Media Analytics. | Phase 1 | `node tests/test_pdf_export_exact_parity.js` |
| **3** | `src/dashboard/features/backup_hub_digest_feature.js` | `EXECUTIVE_DIGEST_CSS` print media query needs strict landscape margins, zero page-1 voids, table header repetition, and robust cross-browser page break rules. | Refine `@media print` rules in `EXECUTIVE_DIGEST_CSS`: enforce `@page { size: A4 landscape; margin: 10mm 12mm; }`, `.part-media-section { break-before: page !important; page-break-before: always !important; }`, atomic card avoidance, and table header grouping. | Part 1 renders crisply on Page 1; Part 2 begins cleanly on Page 2 without awkward page breaks or blank white voids. | Phase 2 | `node tests/test_pdf_export_exact_parity.js` |
| **4** | `dashboard/styles/backup_digest.css` & `dashboard/dashboard.css` | Print rules in dashboard stylesheets must support fallback container printing and maintain line length <= 650 lines per Universal Rule 28. | Synchronize print rules in `backup_digest.css` and `dashboard.css` with iframe/fallback selectors while ensuring file line counts remain strictly within CI ceilings. | Clean printing guaranteed in all execution paths without triggering CI modularity violations. | Phase 2 | `node tests/test_pdf_export_exact_parity.js` |
| **5** | `tests/test_pdf_export_exact_parity.js` | No existing automated test suite specifically asserts iframe print engine execution, fallback handling, full data hydration, and exact HTML-to-PDF parity. | Author dedicated 6-battery test suite validating iframe creation, HTML generation, print invocation, 2-part page breaks, and regression compliance. | Certifies 100% bug fix validation and guarantees zero regressions across future releases. | Phase 3 | `node run_all_tests.js` |

---

## 🛡️ 4. Artifact Manifest

- [`SUMMARY.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/SUMMARY.md): Executive Architecture Summary & Technical Objectives
- [`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/PRD.md): Product Requirements Document & INVEST Acceptance Criteria Contracts
- [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/TRD.md): Technical Requirements Document, Iframe Print Engine & Data Contracts
- [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/DESIGN.md): Print Tokens, 2x5 Grid Geometry & Page Break Specifications
- [`phase_01_print_engine_digest_parity.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/phase_01_print_engine_digest_parity.md): Phase 1 Executable Subagent Prompt (Iframe Engine & Telemetry Hydration)
- [`phase_02_css_pagination_and_layout_refinement.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/phase_02_css_pagination_and_layout_refinement.md): Phase 2 Executable Subagent Prompt (CSS Pagination & Two-Part Layout)
- [`phase_03_qa_verification_test_automation.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/pdf_export_exact_parity/phase_03_qa_verification_test_automation.md): Phase 3 Executable Subagent Prompt (QA Verification & Master Regression)
