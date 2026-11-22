# Phase 3: Independent QA Verification & Test Automation

> **Phase ID:** `PHASE-03-QA-VERIFICATION-TEST-AUTOMATION`  
> **Target Subsystems:** `tests/test_pdf_export_exact_parity.js`, `run_all_tests.js`  
> **Assigned Agent:** Level 4 QA Subagent  
> **Prerequisites:** Phase 1 and Phase 2 Completed & Certified.  
> **Governance:** Independent QA Verification Hard Lock, Universal Rule 15 (Autonomous Micro-Commit & Push Intelligence).  

---

## 🎯 1. Phase Objective
Author and execute a dedicated 6-battery automated test suite (`tests/test_pdf_export_exact_parity.js`) that exhaustively verifies the isolated iframe print engine, full telemetry hydration, intentional two-part pagination, and 100% exact parity between the standalone HTML export and the PDF print engine. Certify zero regressions across the entire test suite (`node run_all_tests.js`), verify zero secret leaks (`gitleaks detect --redact`), and commit changes locally.

---

## 📂 2. Target Files & Test Batteries

1. **`tests/test_pdf_export_exact_parity.js`:**
   - **Battery 1: Iframe Print Engine & Fallback Mechanism:**
     - Assert `getOrCreatePrintIframe` correctly creates or recycles `#sentinelPrintIframe`.
     - Assert stealth styling (offscreen, `opacity: 0`, `pointerEvents: 'none'`, `zIndex: -9999`).
     - Assert `printHtmlViaIframe` writes to iframe document and calls `focus()` and `print()`.
     - Assert graceful fallback behavior when iframe access is denied.
   - **Battery 2: Telemetry Hydration & Full Field Coverage:**
     - Pass rich mocked telemetry data (10 tracking KPIs, 10 media KPIs, 7x24 chrono heatmap, domain rows, media history).
     - Assert all 20 KPI cards render in the generated HTML.
     - Assert all 168 heatmap cells and day/hour labels are present.
     - Assert domain table rows and media history rows are populated.
   - **Battery 3: Two-Part Page Break & Pagination Contract:**
     - Assert `.part-tracking-section` and `.part-media-section` exist in sequential order.
     - Assert `EXECUTIVE_DIGEST_CSS` contains `@page { size: A4 landscape; ... }`.
     - Assert `.part-media-section` contains `page-break-before: always !important` and `break-before: page !important`.
     - Assert table rules include `thead { display: table-header-group !important; }`.
   - **Battery 4: 100% HTML vs PDF Print Document Parity:**
     - Generate HTML via `generateExecutiveDigestHtml(data, options)`.
     - Invoke `triggerPrintPdf(options)` with mock doc/win.
     - Assert the HTML content ingested into the iframe matches `generateExecutiveDigestHtml` character-for-character.
   - **Battery 5: Dashboard Wiring & Telemetry Extraction:**
     - Assert `dashboard.js` `triggerPrintPdf` packages `data`, `metrics`, `mediaMetrics`, and `chronoHeatmap`.
     - Assert `handleExportPdfClick` invokes `triggerPrintPdf()` and handles status/error toasts.
     - Assert idempotency flags (`__exportBound`, `__digestBound`).
   - **Battery 6: Universal Rule 28 & UTF-8 with BOM Standard:**
     - Check `dashboard/styles/backup_digest.css` line count <= 650 lines.
     - Check all newly created functions <= 50 lines and nesting depth <= 3.
     - Verify UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) across all touched files.

2. **Master Regression Runner:**
   - Command: `node run_all_tests.js`.
   - Acceptance: 100% test suites pass cleanly with Exit Code 0 (0 failures).

3. **AppSec & Secret Audit:**
   - Command: `gitleaks detect --redact`.
   - Acceptance: 0 secret leaks detected across commit history and working tree.

---

## 🔨 3. Surgical Execution Steps for QA Subagent

1. **Author `tests/test_pdf_export_exact_parity.js`:**
   - Implement clean mock DOM objects (`document.createElement`, `document.getElementById`, `window.print`).
   - Run batteries 1 through 6 sequentially with informative assertions and emoji checkmarks.
2. **Execute Standalone Suite:**
   ```bash
   node tests/test_pdf_export_exact_parity.js
   ```
   Verify 6/6 batteries pass cleanly with Exit Code 0.
3. **Execute Master Test Runner:**
   ```bash
   node run_all_tests.js
   ```
   Verify all test suites pass with zero failures.
4. **Execute AppSec Gate:**
   ```bash
   gitleaks detect --redact
   ```
   Confirm zero secret leaks detected.
5. **Verify UTF-8 BOM on Touched Files:**
   Ensure each modified or created file starts with `0xEF, 0xBB, 0xBF`.
6. **Autonomous Git Operations (Rule 15):**
   - Autonomous local micro-commit on completion.
   - Report: `"Haan, local me commit ho chuka hai [commit_hash/commit_message]"`.
   - Perform online upstream check (`git ls-remote --exit-code origin`). If online upstream exists and changes >= 3 files, push cleanly.

---

## 🛡️ 4. Local Verification Gate
- Exit code 0 on `node tests/test_pdf_export_exact_parity.js`.
- Exit code 0 on `node run_all_tests.js`.
- 0 leaks on `gitleaks detect --redact`.
