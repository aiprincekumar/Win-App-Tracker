# Print Pagination Defect Overhaul - Tracking Index & Diagnostic Dossier

> **Task Container:** `temp_prompt/print_pagination_defect_overhaul/`  
> **Governance:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:**  
> 1. Dashboard In-Browser Print Engine (`dashboard/dashboard.css`, `dashboard/styles/backup_digest.css`)  
> 2. Standalone Offline Executive Digest Generator (`src/dashboard/features/backup_hub_digest_feature.js`)  
> **Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`  

---

## 📋 1. Executive Problem & Solution Summary

### Problem Dossier
Users report severe print pagination defects when printing or generating PDFs from both the live dashboard in-browser print mechanism and the standalone offline HTML executive report:
1. **Premature Page Breaks & Blank Voids on Page 1:** Chromium/WebKit print fragmentation engines encounter large composite containers (`.metrics-grid`, `.analytics-hero-card`, `.chart-section`) carrying `break-inside: avoid !important`. Because these large containers cannot fit in the remaining space of Page 1 beneath the executive header, the print renderer inserts premature page breaks, leaving Page 1 with only a header and an empty void.
2. **CSS Grid Pagination Fragmentation Bugs:** `.bento-grid-container` maintains `display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));` in `@media print`. Print engines cannot split multi-row CSS grids across page margins, causing content truncation, lateral clipping, and orphan sections.
3. **Bloated Vertical Spacing & Non-Compact Rhythm:** Screen-oriented paddings (20px-36px) and margins (24px-32px) waste over 35-45% of printable A4 landscape real estate (~718px printable height), triggering cascading page breaks.
4. **Table Pagination Fragility:** Domain tables need strict `border-collapse: collapse !important`, `thead { display: table-header-group !important; }`, and explicit leaf-level row protection (`tr { break-inside: avoid !important; }`).

### Architectural Solution
1. **Phase 1:** Refactor `@media print` in `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css`. Convert `.bento-grid-container` to `display: block !important`. Demote `break-inside: avoid` from large composite wrappers (`.metrics-grid`, `.analytics-hero-card`, `.chart-section`, `.donut-chart-container`) to `break-inside: auto !important`. Scope `break-inside: avoid !important` strictly to atomic leaves (`.metric-card`, `.print-summary-card`, `tr`). Guarantee 100% suppression of interactive/hidden UI elements.
2. **Phase 2:** Refactor `EXECUTIVE_DIGEST_CSS` in `src/dashboard/features/backup_hub_digest_feature.js`. Remove `break-inside: avoid` from `.chart-section`. Compact the 4-card `.metrics-grid` and chart wrapper. Ensure robust multi-page table fragmentation with `thead` repetition and cell border stability.
3. **Phase 3:** Calibrate vertical rhythm (compact 8-12px margins, 6-10px paddings, 1rem section headers, 0.8rem table text) across both targets and construct an automated verification battery in `tests/test_print_pagination_overhaul.js`.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target Scope | Assigned Agent | Status | QA Signoff |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | Dashboard Print CSS Overhaul | `dashboard/dashboard.css`, `dashboard/styles/backup_digest.css` | Level 4 Frontend Subagent | `PENDING` | Gate 1 Pass |
| **02** | Standalone Digest Print CSS Overhaul | `src/dashboard/features/backup_hub_digest_feature.js` | Level 4 Frontend Subagent | `PENDING` | Gate 2 Pass |
| **03** | Vertical Rhythm, Borders & QA Battery | All target CSS + `tests/test_print_pagination_overhaul.js` | Level 4 QA Subagent | `PENDING` | Grade A+ Pass |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.css` | `.metrics-grid`, `.analytics-hero-card`, and `.chart-section` carry `break-inside: avoid !important`, forcing early page breaks before Page 1 fills. `.bento-grid-container` uses `display: grid`. | Convert `.bento-grid-container` to `display: block !important`. Change `.metrics-grid` & `.analytics-hero-card` to `break-inside: auto !important`. Confine `break-inside: avoid` to `.metric-card` and `tr`. | Grid items flow sequentially; KPI cards sit immediately below executive header without void. | Phase 1 | `node tests/test_print_pagination_overhaul.js` |
| **2** | `dashboard/styles/backup_digest.css` | Duplicate print definitions mirroring `dashboard.css` suffer identical `break-inside: avoid` on `.metrics-grid` and unconstrained CSS grid behavior. | Synchronize print block with `dashboard.css`: `display: block` on bento grid container, atomic card avoidance, tight KPI flex/grid. | Guarantees stylesheet parity whether loaded via bundle or modular link. | Phase 1 | `node tests/test_print_pagination_overhaul.js` |
| **3** | `src/dashboard/features/backup_hub_digest_feature.js` | `EXECUTIVE_DIGEST_CSS` applies `break-inside: avoid !important` to `.chart-section`, which is ~220px tall and causes immediate page break onto Page 2. | Change `.chart-section` to `break-inside: auto !important`. Compact chart padding from 20px to 10px 14px, reduce donut height to 110px, tighten gap to 16px. | Chart and legend flow naturally or split cleanly without creating blank void after KPI cards. | Phase 2 | `node tests/test_print_pagination_overhaul.js` |
| **4** | `src/dashboard/features/backup_hub_digest_feature.js` | Loose table and header paddings (10px 12px) cause early overflow on multi-domain reports. | Apply `border-collapse: collapse !important;`, compact table headers & cells (`padding: 4px 8px !important; font-size: 0.8rem;`), ensure `thead` repeat. | Domain activity table flows across 2+ pages cleanly with repeated headers and zero row clipping. | Phase 2 | `node tests/test_print_pagination_overhaul.js` |
| **5** | Cross-file Print Media | Vertical rhythm margin/padding bloat (24px-32px margins) drains vertical budget. | Standardize print vertical rhythm: 12px section margins, 6-10px element paddings, 1rem headings. Add test suite. | 40% vertical height saved, fitting header + KPIs + chart cleanly on Page 1. | Phase 3 | `node tests/test_print_pagination_overhaul.js` |

---

## 🛡️ 4. Artifact Manifest

- [`SUMMARY.md`](SUMMARY.md): Executive Architecture Summary & Risk Mitigation
- [`PRD.md`](PRD.md): Product Requirements Document & INVEST User Stories
- [`TRD.md`](TRD.md): Technical Requirements Document & CSS Rules Engine Spec
- [`DESIGN.md`](DESIGN.md): Print Design Tokens, Geometry & Typography Standard
- [`phase_01_dashboard_print_css.md`](phase_01_dashboard_print_css.md): Phase 1 Executable Prompt
- [`phase_02_standalone_digest_print_css.md`](phase_02_standalone_digest_print_css.md): Phase 2 Executable Prompt
- [`phase_03_vertical_rhythm_and_qa.md`](phase_03_vertical_rhythm_and_qa.md): Phase 3 Executable Prompt
