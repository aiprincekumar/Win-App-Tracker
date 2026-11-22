# Product Requirements Document (PRD): Export Reports Data Population & Layout Fix

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Document Type:** Product Requirements Document (PRD)  
> **Container:** `temp_prompt/export_reports_data_and_layout_fix/`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Dept 01 (Product Requirements & Management)  

---

## 👤 1. User Personas

1. **The Executive / Knowledge Worker (Primary Persona):**
   - *Needs:* Wants to export a weekly or monthly productivity report as a PDF to share with managers or retain for personal auditing.
   - *Pain Point:* Currently clicks "Save PDF" or "Offline HTML Report" and receives a report with empty zeros (`0h 00m`, `--`, empty chart), giving the impression that tracking failed.
2. **The Offline Researcher / Privacy Enthusiast:**
   - *Needs:* Requires a standalone, air-gapped HTML archive of their browser telemetry that can be opened without internet access, viewed in any browser, and re-imported if needed.
   - *Pain Point:* Downloaded HTML file currently has no activity data, an empty SVG circle, zero table rows, and looks unformatted and broken.
3. **The Multi-Tasking Sentinel User:**
   - *Needs:* Often works within the Settings or Backup Hub tabs. When they decide to export a report from the Settings backup tile or the topbar export menu, they expect the full report to print cleanly regardless of what tab was active on their screen.

---

## 📋 2. Functional Requirements (FR)

- **FR-01: Multi-Schema Telemetry Normalization:** The reporting system must seamlessly ingest and aggregate data from:
  1. Modern Chrome storage schema (`activityData.domains` object dictionary with `seconds`, `sessionCount`, `category`, and nested `days`).
  2. Legacy day-keyed snapshot schema (`{ [dateStr]: { totalActiveTime, domains: { ... } } }`).
  3. Pre-aggregated dashboard items array (`stats.items`).
- **FR-02: Live Telemetry Hydration in PDF Export (`triggerPrintPdf`):**
  - Extract live computed values for Total Active Time, Top Focus Domain, Productivity Index, and Media Consumed from active dashboard memory or DOM.
  - Automatically populate the `#printReportPeriod` label with the active temporal filter (e.g., "Range: Today", "Range: Last 7 Days", "All Recorded Time").
- **FR-03: Tab-Independent PDF Print Visibility:**
  - When PDF export is triggered, `@media print` must force the primary report analytics container (`#paneTracking`) to display, even if the user was on `#paneSettings`, `#paneMedia`, or another tab.
- **FR-04: High-Contrast Print Layout Standards:**
  - PDF print output must render on a pure white `#ffffff` background with crisp dark navy `#0f172a` typography and slate `#cbd5e1` borders.
  - Cards, charts, and table rows must avoid awkward page breaks across printed sheets (`page-break-inside: avoid;`).
- **FR-05: Standalone Offline HTML Report Overhaul:**
  - `generateExecutiveDigestHtml()` must generate a modern single-file HTML document featuring:
    - Executive Header with brand badge, report title, date range, and generation timestamp.
    - Quick "🖨️ Print / Save as PDF" action button (hidden during print).
    - 4-card Bento Summary Grid (Total Active Time, Top Domain, Productivity Index, Media Consumed).
    - SVG Proportional Donut Chart (top 5 domains with colored slices and legend).
    - Top Activity Distribution Bars.
    - Full Domain Telemetry Data Table with Rank, Domain, Category Badge, Duration, Share %, and Sessions.
    - Media Consumption Table (when media history exists).
    - Embedded JSON payload script `<script id="sentinel-digest-payload" type="application/json">` for bidirectional data portability.
- **FR-06: Graceful Empty-State Handling:**
  - If zero activity is recorded in the selected period, the report must display an informative, elegant empty state ("No activity recorded for this period") rather than broken `--`, `NaN`, or empty boxes.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-01: 100% Offline Air-Gapped Operation:** The standalone HTML report must have zero external network requests (`0` external CDNs, fonts, or tracking scripts). All CSS, SVG graphics, and scripts must be 100% inline.
- **NFR-02: Universal Rule 28 Code Modularity:** All new or refactored functions in `dashboard.js` and `backup_hub_digest_feature.js` must strictly adhere to the $\le 50$ line limit and cyclomatic nesting depth $\le 3$.
- **NFR-03: UTF-8 with BOM Standard:** All modified or newly created source files must contain the UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).
- **NFR-04: W3C Trusted Types & Security:** Zero `innerHTML` or `outerHTML` assignments in dynamic DOM hydration. All dynamic values in the HTML report string must be HTML-escaped to prevent XSS.
- **NFR-05: Performance & File Size:** Standalone HTML report file size must remain $< 150 \text{ KB}$ for typical 30-day tracking datasets. HTML generation time must execute in $< 100 \text{ ms}$.
- **NFR-06: Print Fidelity (WCAG AAA Contrast):** Text and data visualizations in print mode must achieve $\ge 7:1$ contrast ratio against white paper.

---

## 📖 4. INVEST-Compliant User Stories & Acceptance Criteria

### User Story 1: Accurate Real Data in PDF Executive Digest
> **As an** active browser user,  
> **I want** the "Save PDF Executive Digest" option to print my actual tracked browsing time, top domain, productivity score, and domain table,  
> **So that** I have a true, professional document representing my real digital activity.

#### Acceptance Criteria (Given-When-Then):
- **Scenario 1.1: Live Dashboard Data Binding**
  - **Given** the user has tracked 3h 45m of active browsing across GitHub, YouTube, and StackOverflow,
  - **When** the user clicks "Save PDF Executive Digest" from the topbar export menu,
  - **Then** `#printStatTotalTime` must display `"3h 45m"`, `#printStatTopDomain` must display the highest active domain, `#printStatProductivity` must display the computed score (e.g. `"88 / 100"`), and the domain table must render all tracked domains.
- **Scenario 1.2: Exporting from Settings Tab**
  - **Given** the user is viewing the Settings / Backup Hub tab (`#paneSettings`),
  - **When** the user clicks "Save PDF Executive Digest",
  - **Then** the print stylesheet forces `#paneTracking` to `display: block !important;` so the full report prints without blank pages.

### User Story 2: Standalone HTML Report with Full Domain Telemetry & Media History
> **As an** air-gapped user,  
> **I want** the downloaded "Offline HTML Report" to render my complete domain statistics, SVG donut chart, and media watch duration,  
> **So that** I can inspect my historical data offline in any browser without needing the extension active.

#### Acceptance Criteria (Given-When-Then):
- **Scenario 2.1: Modern `activityData.domains` Schema Ingestion**
  - **Given** the extension storage contains modern `activityData.domains` with 12 tracked websites,
  - **When** the user downloads the offline HTML report and opens it in a browser,
  - **Then** the summary metrics, top 5 SVG donut chart, and 12 table rows must be completely populated with accurate times and percentages.
- **Scenario 2.2: Media Watch Duration Ingestion**
  - **Given** `mediaHistory` contains sessions with `watchDuration` totaling 1h 20m,
  - **When** the offline HTML report is generated,
  - **Then** the Media Consumed KPI card must display `"1h 20m"` (not `"0m"`).
- **Scenario 2.3: Quick Print Utility within HTML Report**
  - **Given** the user opens the standalone HTML report in Chrome/Firefox/Edge,
  - **When** the user clicks the "🖨️ Print / Save as PDF" button at the top of the report,
  - **Then** `window.print()` is triggered, and the print button itself is hidden via `@media print`.

### User Story 3: Graceful Handling of Empty or New Datasets
> **As a** newly onboarded user with zero tracked history,  
> **I want** exported reports to show an elegant "No Activity Recorded" state,  
> **So that** the report looks polished and clear rather than displaying broken `NaN`, `undefined`, or empty cutoffs.

#### Acceptance Criteria (Given-When-Then):
- **Scenario 3.1: Zero Activity Export**
  - **Given** a fresh installation with 0 seconds of activity,
  - **When** the user exports PDF or HTML digest,
  - **Then** total time displays `"0m"`, top domain displays `"None"`, the donut chart displays a clean empty circle, and the table displays a friendly `"No activity recorded for this period"` banner.
