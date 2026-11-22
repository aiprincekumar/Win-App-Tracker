# Phase 4: Independent QA Verification & Test Automation

> **Task ID:** `TASK-DUAL-TAB-EXPORT-PARITY-001`  
> **Phase:** 04 of 04  
> **Target Subsystem:** Test Automation, Master Regression & Git Operations  
> **Target Files:**  
> - [`tests/test_dual_tab_export_parity.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_dual_tab_export_parity.js)  
> - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)  
> **Lead Role:** Level 4 QA Subagent  
> **Status:** `COMPLETED` (Verified & Certified Exit Code 0)  

---

## 🎯 1. Phase Objective
Author a comprehensive standalone test suite `tests/test_dual_tab_export_parity.js` covering 6 rigorous test batteries, execute the master regression test runner (`node run_all_tests.js`), perform a SAST secret audit (`gitleaks detect --redact`), and execute autonomous local micro-commits and push intelligence per Universal Rule 15.

---

## 📋 2. Prerequisites & Inputs
1. Successful completion of Phases 1, 2, and 3.
2. Verified deliverables across `dashboard.css`, `backup_digest.css`, `backup_hub_digest_feature.js`, and `dashboard.js`.
3. Architecture specifications: [`TRD.md`](TRD.md).

---

## 🔍 3. Technical Context & Test Batteries

The new test suite `tests/test_dual_tab_export_parity.js` must implement the following 6 test batteries:

### Battery 1: CSS Print Rules & Media Unhiding
- Inspect `dashboard/dashboard.css` and `dashboard/styles/backup_digest.css`.
- Assert `@media print` contains `#paneMedia` alongside `#paneTracking` with `display: block !important;`.
- Assert `#paneMedia` has `break-before: page` or `page-break-before: always`.
- Assert `#mediaMetricsGrid` or `.kpi-grid-5x2` is formatted with `grid-template-columns: repeat(5, 1fr) !important;`.
- Assert `#cardChronoHeatmap` has `break-inside: avoid !important;`.
- Assert interactive widgets (`#multiTabMediaDeckContainer`, `#heroMediaPlayerCard`, `#heroAudioLabStatus`, `.heatmap-controls-row`) are hidden with `display: none !important;`.

### Battery 2: Standalone HTML Digest Dual-Tab Structure
- Invoke `generateExecutiveDigestHtml(mockData, mockOptions)`.
- Assert the returned HTML contains:
  - Part 1: Tracking Metrics Grid (`metrics-grid`), Chrono Heatmap Section (`chrono-heatmap-section`), and Domain Breakdown Table (`table`).
  - Part 2: Media Analytics heading, 10-KPI Media Grid (`media-metrics-grid`), and Media Playback History Table.
- Assert all 10 tracking and 10 media card values are present in the output.

### Battery 3: Media KPI Telemetry Extraction & Computation
- Pass mock `media_history` array with varying durations, platforms, volumes, and muted states.
- Assert `extractDigestMediaKpiMetrics()` computes exact formatted metrics:
  - Total watch duration, average watch per video, session counts, top platform, volume stats, and muted sessions count.

### Battery 4: Chrono Heatmap SVG/Grid Rendering & Legend
- Assert generated standalone HTML contains 7 day rows (Mon-Sun), 24 hour intervals (00-23), intensity tier classes (`tier-0` to `tier-4`), and legend bar.

### Battery 5: Dashboard Integration Data Binding
- Validate `dashboard/dashboard.js` exports `mediaMetrics` in `getActiveReportMetrics` and passes them to `downloadStandaloneHtmlDigest` via `handleExportHtmlDigestClick`.

### Battery 6: Universal Rule 28 Compliance & AppSec Audit
- Assert `dashboard/styles/backup_digest.css` length is <= 650 lines.
- Assert all functions in `src/dashboard/features/backup_hub_digest_feature.js` are <= 50 lines with nesting depth <= 3.
- Assert zero direct `innerHTML` usage across feature and dashboard additions.
- Assert 100% UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Author `tests/test_dual_tab_export_parity.js`
- Create `tests/test_dual_tab_export_parity.js` with pure Node.js built-ins (`fs`, `path`, `assert`).
- Structure into 6 cleanly separated battery sections with clear PASS/FAIL console reporting.

### Step 2: Execute Standalone Test Suite
```powershell
node tests/test_dual_tab_export_parity.js
```
Expected: 6/6 batteries PASS cleanly with exit code 0.

### Step 3: Execute Master Test Runner
```powershell
node run_all_tests.js
```
Expected: 117/117 test suites PASS with 0 failures, exit code 0.

### Step 4: Pre-Commit Security Audit
```powershell
gitleaks detect --redact
```
Expected: 0 secrets detected.

### Step 5: Autonomous Git Micro-Commit & Remote Push (Universal Rule 15)
1. Verify remote upstream online existence:
   ```powershell
   git ls-remote --exit-code origin
   ```
2. Autonomous local micro-commit:
   ```powershell
   git add dashboard/dashboard.css dashboard/styles/backup_digest.css src/dashboard/features/backup_hub_digest_feature.js dashboard/dashboard.js tests/test_dual_tab_export_parity.js
   git commit -m "feat(reports): achieve dual-tab export parity with 10-KPI media grid and Chrono Heatmap in PDF and HTML digest"
   ```
   Notify: "Haan, local me commit ho chuka hai [commit_hash]".
3. Autonomous push decision: >= 3 files touched -> autonomously push to `origin/main`.
4. Provide 3-point terminal proof:
   - `git log -1`
   - `git push`
   - `git status`

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- Zero test skipping or disabling of existing assertions.
- Do not bypass `gitleaks` secret audit.

---

## 📦 6. Deliverables Manifest
1. `tests/test_dual_tab_export_parity.js`: Standalone automated QA verification suite (6 batteries).
2. Clean test execution log from `node run_all_tests.js` (117/117 PASS).
3. `gitleaks detect --redact` clean scan log (0 leaks).
4. Git commit & push 3-point terminal proof.

---

## 🚦 7. Local Verification Gate
```powershell
# 1. Standalone test suite
node tests/test_dual_tab_export_parity.js

# 2. Master regression runner
node run_all_tests.js

# 3. Secret scan
gitleaks detect --redact
```
