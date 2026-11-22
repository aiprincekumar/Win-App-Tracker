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
   - *Pain Point:* Needs multi-page reports to paginate cleanly without tables clipping or section titles getting orphaned at page bottoms.
2. **The Offline Researcher / Privacy Enthusiast:**
   - *Needs:* Requires a standalone, air-gapped HTML archive of their browser telemetry that can be opened without internet access, viewed in any browser, and re-imported if needed.
   - *Pain Point:* Requires comprehensive landscape telemetry data tables that detail domains, session metrics, productivity impact, and media streaming history.
3. **The Multi-Tasking Sentinel User:**
   - *Needs:* Frequently triggers export from different tabs (Settings, Backup Hub, Topbar) and expects reliable, tab-independent rendering with complete telemetry fidelity.

---

## 📋 2. Functional Requirements (FR)

- **FR-01: Multi-Schema Telemetry Normalization:**
  - Ingest modern `activityData.domains`, day-keyed snapshot records, and pre-computed items arrays seamlessly into uniform telemetry objects.
- **FR-02: Live Telemetry Hydration in PDF Export (`triggerPrintPdf`):**
  - Extract live computed values for Total Active Time, Top Focus Domain, Productivity Index, and Media Consumed from active dashboard state.
  - Automatically populate `#printReportPeriod` with the active filter.
- **FR-03: Tab-Independent PDF Print Visibility:**
  - Force `#paneTracking` to display in `@media print` even if triggered while viewing `#paneSettings` or other tabs.
- **FR-04: PDF Print Layout Page-Break Overhaul:**
  - Enforce `break-inside: auto !important;` on table containers (`.domain-table-container`, `.table-card`, `.data-table-card`, `.table-responsive-container`) so multi-row tables paginate across multiple A4 landscape pages smoothly.
  - Enforce `break-inside: avoid !important;` strictly on table rows (`tr`), discrete KPI cards, and charts.
  - Enforce anti-orphan rules on section headings (`h1, h2, h3, .section-title, .print-executive-header { break-after: avoid !important; }`).
  - Repeat table headers cleanly on every printed sheet using `thead { display: table-header-group !important; }`.
- **FR-05: Comprehensive Landscape Telemetry Table Columns:**
  - **Domain Telemetry Table (8 Columns):**
    1. `Rank` (#1, #2...)
    2. `Domain & Host` (domain name)
    3. `Category` (badged category)
    4. `Active Duration` (formatted time)
    5. `Proportion Share` (% of active browsing)
    6. `Total Sessions` (count)
    7. `Avg Session Duration` (formatted average duration per session)
    8. `Productivity Impact` (Productive, Leisure, Neutral badge)
  - **Media Playback & Streaming Telemetry Table (7 Columns):**
    1. `#` (index)
    2. `Media Title` (title string)
    3. `Platform / Source` (utility badge)
    4. `Watch Duration` (formatted media duration)
    5. `Playback Share` (% of total media time)
    6. `Audio State` (Audible / Muted badge)
    7. `Playback Status / Type` (Streaming / Local / Recorded)
- **FR-06: Graceful Empty-State Handling & Offline Portability:**
  - Display clean, reassuring empty states when no activity exists.
  - Embed serialized JSON payload in `<script id="sentinel-digest-payload" type="application/json">` for complete data portability.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-01: 100% Offline Air-Gapped Operation:** Zero external network calls (0 CDNs, fonts, or scripts).
- **NFR-02: Universal Rule 28 Code Modularity:** All modified functions must be $\le 50$ lines with nesting depth $\le 3$.
- **NFR-03: UTF-8 with BOM Standard:** All touched files must contain the UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).
- **NFR-04: W3C Trusted Types & Security:** Zero `innerHTML`/`outerHTML` assignments. All template variables safely escaped with `escapeHtml()`.
- **NFR-05: Performance:** HTML digest generation under 50ms; standalone HTML size $< 150 \text{ KB}$.
