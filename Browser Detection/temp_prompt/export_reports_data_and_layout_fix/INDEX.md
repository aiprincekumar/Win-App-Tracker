# Master Index & Problem-Solution Dossier: Export Reports Data Population & Layout Fix

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/export_reports_data_and_layout_fix/`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/dashboard.css`, `dashboard/styles/backup_digest.css`, `src/dashboard/features/backup_hub_digest_feature.js`, `dashboard/dashboard.js`, `tests/test_export_reports_data_and_layout_fix.js`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Context & Objectives
Following the successful implementation of Universal Telemetry Normalization and active metrics hydration, this iteration delivers a comprehensive overhaul of the PDF print engine and landscape reporting presentation:
1. **PDF Print Layout Page-Break Overhaul:**
   - In both `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css`, resolve print pagination defects where large tables or containers are clamped or split mid-row.
   - Enforce `break-inside: auto !important;` on table containers (`.domain-table-container`, `.table-card`, `.data-table-card`, `.table-responsive-container`) so browsers can paginate smoothly across multiple A4 landscape pages.
   - Enforce `break-inside: avoid !important; page-break-inside: avoid !important;` strictly on table rows (`tr`), metric cards (`.metric-card`, `.print-summary-card`), and chart containers (`.chart-section`, `.donut-chart-container`).
   - Enforce anti-orphan rules on section headings (`h1, h2, h3, .section-title, .print-executive-header { break-after: avoid !important; page-break-after: avoid !important; }`).
   - Guarantee `thead { display: table-header-group !important; }` so table headers cleanly repeat at the top of every printed page.
2. **Comprehensive Landscape Telemetry Table Columns (Domain and Media):**
   - Take full advantage of A4 landscape width (1140px / 297mm) by expanding both Domain and Media telemetry tables with rich executive columns.
   - **Domain Telemetry Table:** Expand from 6 to 8 columns: `Rank`, `Domain & Host`, `Category`, `Active Duration`, `Proportion Share`, `Total Sessions`, `Avg Session Duration`, and `Productivity Impact`.
   - **Media Playback & Streaming Telemetry Table:** Expand from 5 to 7 columns: `#`, `Media Title`, `Platform / Source`, `Watch Duration`, `Playback Share`, `Audio State` (Audible/Muted badge), and `Playback Status / Type`.
   - Synchronize CSS styling in `dashboard/dashboard.css`, `backup_digest.css`, and the inline template CSS in `backup_hub_digest_feature.js`.
3. **Universal Rule 28 Compliance & Test Suite Synchronization:**
   - Guarantee all modified/added helper functions in `src/dashboard/features/backup_hub_digest_feature.js` strictly adhere to Universal Rule 28 ($\le 50$ lines, cyclomatic depth $\le 3$).
   - Update `tests/test_export_reports_data_and_layout_fix.js` across Batteries 2, 3, and 5 to assert page-break properties, expanded landscape columns, and Rule 28 compliance.
   - Maintain 100% UTF-8 with BOM encoding across all files.

---

## 🚦 2. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/styles/backup_digest.css` & `dashboard/dashboard.css` | Table containers (`.domain-table-container`, `.table-card`) had `break-inside: avoid !important;`, preventing multi-page table pagination and causing clipped or pushed content in PDF print | Set container `break-inside: auto !important;`, preserve `break-inside: avoid !important;` on `tr`, add `break-after: avoid !important;` on section headings, and ensure `thead { display: table-header-group !important; }` | Clean, multi-page print pagination without clipped rows or orphaned section titles | Phase 1 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **2** | `src/dashboard/features/backup_hub_digest_feature.js` | Domain table in HTML digest template only displays 6 narrow columns, underutilizing available A4 landscape width | Expand Domain Telemetry table to 8 columns: `Rank`, `Domain & Host`, `Category`, `Active Duration`, `Proportion Share`, `Total Sessions`, `Avg Session Duration`, `Productivity Impact` | Rich, comprehensive domain intelligence optimized for landscape export | Phase 2 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **3** | `src/dashboard/features/backup_hub_digest_feature.js` | Media playback table lacks playback share percentage and playback status/type columns | Expand Media table to 7 columns: `#`, `Media Title`, `Platform / Source`, `Watch Duration`, `Playback Share`, `Audio State`, `Playback Status / Type` | Detailed media streaming telemetry matching landscape format | Phase 2 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **4** | `dashboard/dashboard.css` | Print styles lack specialized column width classes and responsive alignment for 8-column domain and 7-column media tables | Add high-contrast print table CSS tokens, alignment classes, and border rules | Crystal-clear typography and tabular numeral alignment in PDF print | Phase 2 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **5** | `src/dashboard/features/backup_hub_digest_feature.js` | Refactored rendering helpers risk violating Universal Rule 28 line count ($\le 50$) or nesting depth ($\le 3$) | Modularize row rendering into focused helper functions: `renderDomainRows`, `renderMediaRows`, `computeSessionAverages` | 100% Rule 28 modularity compliance | Phase 3 | `node tests/test_export_reports_data_and_layout_fix.js` |
| **6** | `tests/test_export_reports_data_and_layout_fix.js` | Existing test assertions only verify legacy 6-column / 5-column headers and omit container `break-inside: auto` checks | Update Battery 2 (page-break assertions), Battery 3 (8-col domain & 7-col media assertions), and Battery 5 (Rule 28 & BOM) | 100% automated regression protection and Grade A+ QA signoff | Phase 3 | `node tests/test_export_reports_data_and_layout_fix.js`<br>`node run_all_tests.js` |

---

## 📅 3. Phase Execution Status Checklist

| Phase # | Phase Name | Primary Target File(s) | Lead Subagent Role | Local Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **Phase 01** | PDF Print Layout Page-Break & Table Flow Overhaul | `dashboard/styles/backup_digest.css`<br>`dashboard/dashboard.css` | Level 4 Frontend Engineer | `node tests/test_export_reports_data_and_layout_fix.js` | ⏳ PENDING |
| **Phase 02** | Comprehensive Landscape Telemetry Table Columns (Domain & Media) | `src/dashboard/features/backup_hub_digest_feature.js`<br>`dashboard/dashboard.css` | Level 4 Frontend Engineer | `node tests/test_export_reports_data_and_layout_fix.js` | ⏳ PENDING |
| **Phase 03** | Universal Rule 28 Compliance & QA Test Suite Synchronization | `tests/test_export_reports_data_and_layout_fix.js`<br>`src/dashboard/features/backup_hub_digest_feature.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_export_reports_data_and_layout_fix.js`<br>`node run_all_tests.js` | ⏳ PENDING |

---

## 🔒 4. Governance & Constitutional Invariants
- **Main Agent (CEO) & Level 2 Manager Zero-Code Hard Lock:** Neither CEO nor Manager may modify codebase files directly. Execution is strictly delegated to Level 4 Execution Subagents.
- **Universal Rule 28 (Code Modularity):** All new or edited functions must strictly remain under 50 lines with nesting depth $\le 3$.
- **Universal Rule 5 & 8 (UTF-8 with BOM):** All modified or created files must strictly maintain UTF-8 with BOM encoding (`0xEF, 0xBB, 0xBF`).
- **W3C Trusted Types Safe:** 100% zero unescaped `innerHTML` or `outerHTML` assignments. All DOM manipulations must use `textContent`, `setAttribute`, or safe template literals with sanitization.
- **Offline Self-Containment:** Standalone HTML reports must operate 100% offline with zero external CDN dependencies (no unpkg, cdnjs, or Google Fonts URLs).
