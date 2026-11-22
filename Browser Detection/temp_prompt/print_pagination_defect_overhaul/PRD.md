# Product Requirements Document (PRD) - Print Pagination Defect Overhaul

> **Document:** `temp_prompt/print_pagination_defect_overhaul/PRD.md`  
> **Initiative:** Print & PDF Pagination Defect Overhaul  
> **Target Audiences:** Executives, Productivity Analysts, Engineering Teams, End Users  

---

## 👤 1. User Personas & Problem Scenarios

### Persona 1: Executive / Manager (Primary Consumer)
- **Goal:** Prints monthly or weekly Web Activity Digests directly to PDF or physical paper for performance reviews.
- **Pain Point:** Currently, Page 1 prints only the report title followed by a massive blank void, with all metrics and tables abruptly pushed to Page 2. Reports look broken and unprofessional.

### Persona 2: Privacy-Conscious Knowledge Worker (Local Archiver)
- **Goal:** Exports standalone offline HTML reports (`Web-Activity-Executive-Digest-*.html`) and prints them to keep local PDF records without cloud dependencies.
- **Pain Point:** Printing the standalone report splits charts across page boundaries or forces premature breaks before large tables, resulting in multi-page waste.

---

## 🎯 2. INVEST-Compliant User Stories

### User Story 1 (US-01: Continuous Executive Page 1 Layout)
> **As an** executive reviewing the activity digest,  
> **I want** the executive header and the KPI summary cards to print continuously on Page 1 without premature page breaks,  
> **So that** the first page provides an immediate, cohesive overview of productivity without awkward white space.  
- **INVEST Checklist:** Independent ✅, Negotiable ✅, Valuable ✅, Estimable ✅, Small ✅, Testable ✅.

### User Story 2 (US-02: Multi-Page Table Continuity & Repeated Headers)
> **As an** analyst inspecting a list of 50+ visited domains,  
> **I want** the domain data table to break naturally across multiple printed pages with repeated column headers (`thead`),  
> **So that** tabular data remains readable and contextual across all printed sheets.  
- **INVEST Checklist:** Independent ✅, Negotiable ✅, Valuable ✅, Estimable ✅, Small ✅, Testable ✅.

### User Story 3 (US-03: Standalone Offline Report Print Parity)
> **As an** offline user printing the exported standalone HTML digest,  
> **I want** the offline report's `@media print` styling to match the in-browser print quality,  
> **So that** both print mechanisms produce identical, high-density executive documents.  
- **INVEST Checklist:** Independent ✅, Negotiable ✅, Valuable ✅, Estimable ✅, Small ✅, Testable ✅.

---

## 📊 3. MoSCoW Feature Prioritization

### Must Have (P0)
- Conversion of `.bento-grid-container` to `display: block !important` in print media.
- Removal of `break-inside: avoid !important` from `.metrics-grid`, `.analytics-hero-card`, and `.chart-section`.
- Preservation of `break-inside: avoid !important` on individual `.metric-card`, `.print-summary-card`, and table `tr`.
- Complete suppression of non-printable elements (`display: none !important`).
- Repetition of `thead` across multi-page tables (`display: table-header-group !important`).

### Should Have (P1)
- Compact print vertical rhythm (reducing margins from 24px+ to 8-12px and paddings from 20px+ to 6-10px).
- Scaled print typography (headings 1.15rem -> 1rem; metrics 1.35rem -> 1.15rem; table text 0.88rem -> 0.8rem).
- Border consolidation using `border-collapse: collapse !important`.

### Could Have (P2)
- Monochromatic / high-contrast border enhancement (`#cbd5e1`) for black-and-white physical printing.
- Micro page-numbering and timestamp watermark in print footer.

### Won't Have (P3 - Out of Scope)
- Changes to screen layout, screen responsiveness, or runtime interactivity.
- Alterations to backend telemetry data structures or serialization logic.

---

## 📜 4. Given-When-Then Acceptance Criteria Contracts

### Contract 1: In-Browser Dashboard Print Page 1 Packing
- **Given** the user is viewing the tracking dashboard with active time and domain metrics loaded,
- **When** the user invokes browser print (`Ctrl+P` or clicking Print PDF),
- **Then** the Executive Header and the first tier of KPI summary cards must render consecutively on Page 1 with no blank void exceeding 20mm beneath the header.

### Contract 2: No Container-Level Break Avoidance
- **Given** the `@media print` stylesheets (`dashboard.css`, `backup_digest.css`, and `backup_hub_digest_feature.js`),
- **When** inspected for break control directives,
- **Then** `.metrics-grid`, `.analytics-hero-card`, and `.chart-section` must NOT possess `break-inside: avoid !important`, while `.metric-card` and `tr` MUST possess `break-inside: avoid !important`.

### Contract 3: Standalone Digest Print Isolation
- **Given** an exported standalone executive HTML file opened in any modern browser,
- **When** the print preview dialog is rendered,
- **Then** the `.no-print` button must be hidden (`display: none`), the container borders/shadows must be reset (`box-shadow: none; border: none; padding: 0`), and the table headers must repeat across page boundaries.
