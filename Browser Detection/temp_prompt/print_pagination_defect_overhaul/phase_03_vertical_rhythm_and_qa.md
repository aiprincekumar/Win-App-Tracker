# Phase 03: Vertical Rhythm, Borders & QA Verification Battery

> **Document:** `temp_prompt/print_pagination_defect_overhaul/phase_03_vertical_rhythm_and_qa.md`  
> **Phase:** 03 of 03  
> **Target Files:**  
> - `tests/test_print_pagination_overhaul.js` (New comprehensive QA test suite)  
> - `dashboard/dashboard.css` (Vertical rhythm fine-tuning)  
> - `dashboard/styles/backup_digest.css` (Vertical rhythm fine-tuning)  
> - `src/dashboard/features/backup_hub_digest_feature.js` (Final verification)  
> **Assigned Role:** Level 4 QA Verification Specialist  
> **Authorization Token:** `AUTH-MGR-<timestamp>-print-p3`  

---

## 🎯 1. Phase Objective

Harmonize the overall print vertical rhythm, calibrate table border-collapse and compact spacing across both targets, and construct a comprehensive automated QA test suite (`tests/test_print_pagination_overhaul.js`) to certify zero regression, zero premature page breaks, and complete suppression of non-printable elements.

---

## 📦 2. Prerequisites & Inputs

- Successful completion of Phase 01 and Phase 02 deliverables.
- Verified files:
  - `dashboard/dashboard.css`
  - `dashboard/styles/backup_digest.css`
  - `src/dashboard/features/backup_hub_digest_feature.js`

---

## 🔍 3. Technical Context & Specifications

### Vertical Rhythm Budget Matrix
- **Print Header Margin Bottom:** `<= 14px`
- **KPI Summary Grid Margin Bottom:** `<= 14px`
- **Section Title Margin Top/Bottom:** `<= 14px` / `<= 8px`
- **Table Cell Padding:** `<= 6px 8px`
- **Table Margin Bottom:** `<= 16px`
- **Footer Margin Top:** `<= 16px`

---

## 🔨 4. Surgical Step-by-Step Instructions

### Step 1: Author Comprehensive QA Test Suite
Create `tests/test_print_pagination_overhaul.js` with 5 testing batteries:

#### Battery 1: CSS Grid Deconstruction & Block Overrides
- Read `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css`.
- Assert `.bento-grid-container` has `display: block !important` inside `@media print`.
- Assert neither file leaves `.bento-grid-container` as `display: grid` in print.

#### Battery 2: Premature Page-Break Avoidance Audit
- Assert `.metrics-grid` is NOT included in `break-inside: avoid` or `page-break-inside: avoid` in any target file.
- Assert `.analytics-hero-card` is NOT included in `break-inside: avoid`.
- Assert `.chart-section` is NOT included in `break-inside: avoid`.
- Assert `.metric-card` and `tr` ARE present with `break-inside: avoid !important`.

#### Battery 3: Non-Printable UI Leakage Prevention
- Assert `.sidebar`, `.top-app-bar`, `.btn`, `.btn-action-outline`, `.temporal-subtabs`, `.no-print`, `#toastContainer`, and player scrubbers have `display: none !important`.

#### Battery 4: Multi-Page Table Fragmentation & Border Collapse
- Assert `table` has `border-collapse: collapse !important` and `break-inside: auto !important`.
- Assert `thead` has `display: table-header-group !important`.
- Assert `tbody` has `display: table-row-group !important`.

#### Battery 5: Standalone HTML Digest Embedded CSS Audit
- Assert `EXECUTIVE_DIGEST_CSS` in `backup_hub_digest_feature.js` contains:
  - `.chart-section` with `break-inside: auto !important`.
  - Compact table cell padding `<= 8px`.
  - `.digest-container` with `border: none !important; box-shadow: none !important; padding: 0 !important;`.

#### Battery 6: Universal Rule 28 & UTF-8 with BOM Standard
- Assert zero files exceed function line limits.
- Assert UTF-8 BOM (`0xEF, 0xBB, 0xBF`) on all modified files.

### Step 2: Execute Test Suite
Run:
```powershell
node tests/test_print_pagination_overhaul.js
```
All batteries must pass cleanly with exit code `0`.

---

## 🛡️ 5. Architectural Constraints & Boundaries

- All test assertions must produce deterministic console outputs with exact battery names.
- Zero flaky timers or network dependencies.
- Full Grade A+ verification report generated upon completion.

---

## 📋 6. Deliverables Manifest

- `tests/test_print_pagination_overhaul.js`
- Automated test output logs confirming 100% pass across all 6 batteries.

---

## 🚦 7. Local Verification Gate

```powershell
node tests/test_print_pagination_overhaul.js
node tests/test_export_reports_data_and_layout_fix.js
```
Both test suites must return exit code 0.
