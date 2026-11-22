# Product Requirements Document (PRD): Dual-Tab Export Parity Overhaul

> **Initiative:** Dual-Tab Export Parity Overhaul (Time Tracking + Media Analytics + Chrono Heatmap)  
> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Lead Department:** Dept 01 Product Requirements  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Autonomy Model:** `STRATEGY_A_AUTONOMOUS` (Score: 1.0)  

---

## 🎯 1. Product Vision & Value Proposition

Sentinel Web Activity & Media Sentinel is an executive productivity and media telemetry suite. Users rely on its reporting capabilities to generate executive PDFs (`Print / Save PDF`) and share single-file offline HTML digests (`Download Standalone Executive Digest`) with managers, clients, or personal archives.

Currently, these exports only reflect Tab 1 (Time Tracking), completely ignoring Tab 2 (Media Analytics) and the 7x24 Chrono-Activity Heatmap. This defect causes an incomplete reporting experience where video consumption, streaming hours, volume profiles, and circadian focus heatmaps are lost.

**Product Vision:** Both export channels must deliver an executive-grade, two-part dossier containing:
- **Part 1:** Comprehensive Time Tracking Summary (10-KPI Tracking Bento Grid, 7x24 Chrono-Activity Heatmap, Domain Activity Proportions & Detailed Telemetry Table).
- **Part 2:** Media Analytics & Streaming Dossier (10-KPI Symmetrical Media Grid, Media Playback History Table, with all interactive player widgets cleanly suppressed).

---

## 👥 2. User Personas & Use Cases

### Persona 1: Executive / Knowledge Worker (Alex)
- **Goal:** Print a complete weekly digital wellness summary for quarterly review.
- **Pain Point:** When Alex clicks "Print / Save PDF", the printed document only shows active browsing time and website domains; Alex's YouTube educational viewing and media streaming hours are completely invisible because `#paneMedia` was hidden.
- **Resolution:** Alex prints a 2-page or 3-page PDF where Page 1 contains Time Tracking and Chrono Heatmap, and Page 2 cleanly starts with Media Analytics (10-KPI Media Grid and Video History Table).

### Persona 2: Remote Operator / Freelancer (Maya)
- **Goal:** Download an offline HTML digest file to store in local encrypted archives and attach to invoices or weekly status emails.
- **Pain Point:** Maya downloads `Sentinel_Executive_Digest_<date>.html`, opens it in a browser offline, and notices that the Chrono Heatmap and 10 Media KPIs are missing, making the report look unpolished compared to the live dashboard.
- **Resolution:** Maya downloads a single, self-contained offline HTML file featuring high-fidelity screen-accurate styles, the complete 10-KPI Tracking Grid, interactive SVG Chrono Heatmap, Domain Table, 10-KPI Media Grid, and Media Playback Table.

---

## 📊 3. MoSCoW Feature Prioritization

| Priority | Requirement Code | Feature Scope | Description |
| :--- | :--- | :--- | :--- |
| **Must Have** | `REQ-PRINT-MEDIA-UNHIDE` | Unhide `#paneMedia` in `@media print` | Allow Media Analytics panel to render in print view alongside `#paneTracking`. |
| **Must Have** | `REQ-PRINT-MEDIA-GRID` | 5x2 Media KPI Print Grid | Format `#mediaMetricsGrid` into a 5-column CSS grid matching the Tracking KPI layout. |
| **Must Have** | `REQ-PRINT-HEATMAP` | Chrono Heatmap Print Styles | Format `#cardChronoHeatmap` for print view with page-break avoidance and contrast tiers. |
| **Must Have** | `REQ-PRINT-SUPPRESSION` | Interactive Widget Suppression | Hide `#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, scrubber bars, etc. |
| **Must Have** | `REQ-DIGEST-PART1-HEATMAP` | Standalone Digest Chrono Heatmap | Render 7x24 circadian heatmap grid with day/hour labels and legend in offline HTML digest. |
| **Must Have** | `REQ-DIGEST-PART2-MEDIA` | Standalone Digest 10-KPI Media Grid | Render 10-card media bento grid (2 rows of 5) and playback history table in offline HTML digest. |
| **Must Have** | `REQ-JS-EXTRACTION` | Dashboard Telemetry Extraction | Scrape live 10 Media KPIs and Chrono Heatmap data in `dashboard.js` and wire into export handlers. |
| **Must Have** | `REQ-QA-AUTOMATION` | Automated Regression Test Battery | `tests/test_dual_tab_export_parity.js` testing print rules, HTML output, data binding, Rule 28. |
| **Should Have** | `REQ-PRINT-PAGEBREAK` | Page Break Between Tabs | Enforce clean page break (`break-before: page`) before `#paneMedia` in print view. |
| **Should Have** | `REQ-FALLBACK-CALC` | Resilient Data Fallbacks | Fall back to payload calculations if DOM elements are missing (e.g. running headlessly). |
| **Could Have** | `REQ-DIGEST-MEDIA-DONUT` | Platform Distribution Donut | Visual media platform breakdown in standalone digest. |
| **Won't Have** | `REQ-NO-INTERACTIVE` | Interactive Media Playback in Print | Audio/video player controls, seek sliders, and spectrum canvas are non-printable and excluded. |

---

## 📜 4. INVEST-Compliant User Stories

### User Story 1: Dual-Tab Print PDF Parity
- **As an** executive user printing my activity report,
- **I want** the print view to include both my Time Tracking analytics and my Media Analytics with screen-accurate KPI grids,
- **So that** my printed report gives a complete picture of my computer usage without missing media or video watch time.

### User Story 2: Chrono Heatmap Export Visibility
- **As an** operator analyzing circadian productivity patterns,
- **I want** the 7x24 Chrono-Activity Heatmap to appear crisply in both the printed PDF and the downloaded standalone HTML digest,
- **So that** I can review hourly distribution across all 7 days even when offline or viewing paper reports.

### User Story 3: Clean Non-Printable Widget Suppression
- **As a** user generating clean reports,
- **I want** interactive controls (live media deck, remote player card, seek scrubbers, audio FFT visualizer, mode buttons) to be completely suppressed in exports,
- **So that** printed documents and offline reports do not contain non-functional buttons, broken sliders, or phantom whitespace.

### User Story 4: Standalone Offline Single-File Resilience
- **As a** privacy-conscious user archiving reports locally,
- **I want** the downloaded HTML digest to be 100% self-contained with inline SVG and CSS,
- **So that** it renders identically on any device without internet connection or external CDN assets.

---

## 🚦 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: CSS Print View Overhaul (`@media print`)
- **Given** a user triggers `window.print()` from the dashboard,
- **When** the print styles are evaluated by the browser print engine,
- **Then** `#paneTracking` AND `#paneMedia` MUST both be visible (`display: block !important; opacity: 1 !important; visibility: visible !important;`),
- **And** `#paneMedia` MUST have `page-break-before: always !important; break-before: page !important;`,
- **And** `#mediaMetricsGrid` MUST render as a 5-column CSS grid (`grid-template-columns: repeat(5, 1fr) !important;`),
- **And** `#cardChronoHeatmap` MUST be visible with `break-inside: avoid !important;`,
- **And** `#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, and `.heatmap-controls-row` MUST be hidden (`display: none !important; height: 0 !important;`),
- **And** `dashboard/styles/backup_digest.css` MUST remain strictly under 650 lines.

### Contract 2: Standalone Executive HTML Digest Dual-Tab Generation
- **Given** `generateExecutiveDigestHtml(data, options)` is executed with telemetry and media history data,
- **When** the returned HTML string is inspected,
- **Then** it MUST contain Part 1: Tracking Metrics (`metrics-grid`), Chrono Heatmap (`chrono-heatmap-section`), and Domain Breakdown (`modern-data-table`),
- **And** it MUST contain Part 2: Media Analytics heading, 10-KPI Media Grid (`media-metrics-grid` with all 10 cards), and Media History Table,
- **And** all metrics MUST display live values or formatted strings without unescaped HTML or template errors,
- **And** all functions in `backup_hub_digest_feature.js` MUST measure <= 50 lines with nesting depth <= 3 (Rule 28).

### Contract 3: Dashboard Telemetry Wiring
- **Given** live DOM elements for tracking KPIs (`trackMetricTodayTime`), media KPIs (`mediaMetricTotalWatch`, `mediaMetricAvgWatch`, etc.), and Chrono Heatmap are present on the dashboard,
- **When** `handleExportHtmlDigestClick()` or `triggerPrintPdf()` is called,
- **Then** `getActiveReportMetrics()` MUST extract all 10 Media KPI values into the export options,
- **And** `downloadStandaloneHtmlDigest()` MUST receive the dual-tab payload and generate the report successfully.

### Contract 4: Independent QA Test Suite
- **Given** the test runner executes `node tests/test_dual_tab_export_parity.js`,
- **When** all 6 test batteries run,
- **Then** all assertions MUST pass with exit code 0,
- **And** `node run_all_tests.js` MUST confirm 117/117 test suites pass with 0 failures,
- **And** `gitleaks detect --redact` MUST report 0 secrets found.
