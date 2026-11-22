# Phase 03: Universal Rule 28 Compliance & QA Test Suite Synchronization

> **Initiative:** Web Activity & Media Sentinel - Report Export System Hardening  
> **Phase Number:** 03 of 03  
> **Document:** `temp_prompt/export_reports_data_and_layout_fix/phase_03_qa_and_rule28_compliance.md`  
> **Task ID:** `TASK-EXPORT-REPORTS-DATA-LAYOUT-FIX-001`  
> **Primary Subagent Role:** Level 4 QA Verification Tester  
> **Governing Framework:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystems:** `tests/test_export_reports_data_and_layout_fix.js`, `src/dashboard/features/backup_hub_digest_feature.js`, `run_all_tests.js`  

---

## 🎯 1. Phase Objective
The objective of Phase 03 is to achieve full automated QA verification, regression prevention, and constitutional compliance signoff:
1. **Synchronize Battery 2 (PDF Print View Layout):**
   - Assert `break-inside: auto !important` or `page-break-inside: auto` on table container classes (`.data-table-card`, `.table-card`, `.domain-table-container`, `.table-responsive-container`).
   - Assert `break-inside: avoid` / `page-break-inside: avoid` on `tr`, `.print-executive-header`, `.metric-card`.
   - Assert `break-after: avoid` or `page-break-after: avoid` on headings (`.section-title`, `.print-executive-header`).
   - Assert `thead { display: table-header-group` across both `dashboard/styles/backup_digest.css` and `dashboard/dashboard.css`.
2. **Synchronize Battery 3 (Standalone Executive HTML Digest Template):**
   - Assert all 8 domain table headers: `Rank`, `Domain`, `Category`, `Duration`, `Share`, `Sessions`, `Avg Session`, `Productivity`.
   - Assert all 7 media table headers: `#`, `Media Title`, `Platform`, `Watch Duration`, `Playback Share`, `Audio State`, `Playback Status`.
   - Verify sample row output contains formatted avg session duration, productivity badges, and playback share.
3. **Universal Rule 28 AST/Line Audit (Battery 5):**
   - Audit all functions in `src/dashboard/features/backup_hub_digest_feature.js` starting from line 480 (including `renderDomainRows`, `renderMediaRows`, `renderMediaSection`, `getProductivityBadge`, `renderExecutiveMetricsGrid`, `generateExecutiveDigestHtml`) to certify that EVERY function is $\le 50$ lines and cyclomatic nesting depth is $\le 3$.
4. **UTF-8 with BOM Certification:**
   - Verify that all touched files (`backup_hub_digest_feature.js`, `backup_digest.css`, `dashboard.css`, `test_export_reports_data_and_layout_fix.js`) begin with byte sequence `[0xEF, 0xBB, 0xBF]`.
5. **Master Test Runner Signoff:**
   - Execute `node run_all_tests.js` to certify that all project test suites pass with 0 failures and exit code 0.

---

## 📋 2. Prerequisites & Inputs
- Completion of Phase 01 (page-break CSS overhaul) and Phase 02 (landscape table columns).
- Target files:
  - [`tests/test_export_reports_data_and_layout_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_export_reports_data_and_layout_fix.js)
  - [`src/dashboard/features/backup_hub_digest_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/backup_hub_digest_feature.js)
  - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `tests/test_export_reports_data_and_layout_fix.js`
- **Lines 94–109 (Battery 2):**
  - Update assertions:
    ```javascript
    assert(css.includes('page-break-inside: auto') || css.includes('break-inside: auto'), `${fileLabel} must set table container break-inside: auto`);
    assert(css.includes('page-break-inside: avoid') || css.includes('break-inside: avoid'), `${fileLabel} must set tr break-inside: avoid`);
    assert(css.includes('table-header-group'), `${fileLabel} must set thead display: table-header-group`);
    ```
- **Lines 112–140 (Battery 3):**
  - Update assertions:
    ```javascript
    assert(generatedHtml.includes('Avg Session') || generatedHtml.includes('Avg Duration'), 'Must include Avg Session column');
    assert(generatedHtml.includes('Productivity') || generatedHtml.includes('Impact'), 'Must include Productivity Impact column');
    assert(generatedHtml.includes('Playback Share') || generatedHtml.includes('Share'), 'Must include Playback Share column');
    ```
- **Lines 160–204 (Battery 5):**
  - Keep the automated line-counting loop and depth-checker running over `backup_hub_digest_feature.js`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Update Battery 2 Assertions in `test_export_reports_data_and_layout_fix.js`
Enhance Battery 2 to strictly verify both container break relaxation and row protection.

### Step 3.2: Update Battery 3 Assertions in `test_export_reports_data_and_layout_fix.js`
Enhance Battery 3 to verify the expanded 8-column domain telemetry table and 7-column media telemetry table in `generatedHtml`.

### Step 3.3: Run Standalone Test Suite
```bash
node tests/test_export_reports_data_and_layout_fix.js
```
Confirm all 6 batteries report green checkmarks and output:
`🎉 ALL 6 BATTERIES IN EXPORT FIX QA SUITE PASSED CLEANLY!` with Exit Code 0.

### Step 3.4: Run Master Regression Suite
```bash
node run_all_tests.js
```
Confirm all test suites pass with 0 failures and exit code 0.

---

## 🛡️ 5. Architectural Constraints & Boundaries
- Zero false positives in tests.
- Absolute UTF-8 with BOM integrity (`0xEF, 0xBB, 0xBF`).
- Zero secret leaks (`gitleaks detect --redact`).

---

## 📦 6. Deliverables Manifest
- Updated [`tests/test_export_reports_data_and_layout_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_export_reports_data_and_layout_fix.js)
- Test execution terminal proof with exit code 0.

---

## 🧪 7. Local Verification Gate
Execute:
```bash
node tests/test_export_reports_data_and_layout_fix.js
node run_all_tests.js
```
Expected: Exit code 0 across both suites.
