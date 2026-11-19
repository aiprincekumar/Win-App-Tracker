# Phase 5: Master Test Suites & QA Verification (Zero Regression)

> **Document Type:** Standalone Executable Phase Prompt  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Phase Identifier:** `PHASE-05-MASTER-QA-VERIFICATION`  
> **Target Subsystems:** `tests/test_chrono_heatmap_overhaul.js`, `run_all_tests.js`  
> **Responsible Subagent:** Level 4 QA Verification Tester Subagent  
> **Allocated Department:** Dept 08 (QA & Testing)  
> **Allocated Skills:** `test-driven-development`, `verification-loop`  
> **Required Authorization:** `AUTH-MGR-*` token issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Develop and execute a comprehensive 7-battery automated verification test suite: `tests/test_chrono_heatmap_overhaul.js`. Verify all architectural pillars implemented in Phases 1 through 4: fluid CSS Grid geometry, rolling 7-day aggregation, focus vs media mode dual-palette rendering, intelligent historical backfill conservation math, and SQLite Data Hub WebSocket synchronization. Run the full master regression test runner `node run_all_tests.js` to certify 100% clean passage across all 102+ test files with exit code 0.

---

## 🛠️ 2. Test Battery Blueprint (`tests/test_chrono_heatmap_overhaul.js`)

The test suite must implement 7 distinct, self-contained verification batteries:

### Battery 1: UI/UX CSS Grid Layout & Scrollbar Elimination
- Verify `.chrono-heatmap-wrapper` contains `overflow-x: hidden !important`.
- Verify `.chrono-heatmap-grid` specifies `repeat(24, minmax(0, 1fr)) !important` and `width: 100%`.
- Verify `.heatmap-cell` defines fluid width and responsive `clamp()` height.

### Battery 2: Enforced 7-Day Rolling Window Matrix Aggregation
- Provide mock history containing 30 days of data.
- Invoke `aggregateChronoHeatmap(mockHistory, 'today')` and `aggregateChronoHeatmap(mockHistory, '30d')`.
- Assert that both calls return exactly 7 rows (Monday to Sunday) and 24 columns (00 to 23).
- Assert that target date range is strictly `[Today - 6d .. Today]`.

### Battery 3: Mode Differentiation & Dual Palette Switching
- Verify Focus mode renders cells with emerald attributes/classes (`data-mode="focus"`, emerald tokens).
- Verify Media mode renders cells with violet/fuchsia attributes/classes (`data-mode="media"`, violet tokens).
- Assert tooltip text updates dynamically based on mode ("Focus Time" vs "Media Watch Time").
- Assert Week-over-Week delta is calculated accurately for each mode.

### Battery 4: Diurnal Historical Backfill & Mathematical Conservation
- Feed a historical day with 7,200 active seconds and 3,600 media seconds lacking hourly buckets.
- Execute `backfillHistoricalHourlyBuckets(dayData, dateStr)`.
- Assert sum of `activeSeconds` across all 24 hours equals exactly 7,200 (0 drift).
- Assert sum of `mediaSeconds` across all 24 hours equals exactly 3,600 (0 drift).
- Assert waking peak hours (10:00–12:00, 14:00–17:00) contain the highest active focus time.
- Assert evening hours (18:00–23:00) contain the highest media watch time.

### Battery 5: SQLite Database Hub Schema & WebSocket Sync Payloads
- Inspect `background.js` and `data_hub_client.js` source code.
- Assert presence of `hourly_buckets_json` in `SYNC_HISTORY_UPSERT` and delta messages.
- Assert presence of `SYNC_HOURLY_BUCKETS` broadcast helper.
- Verify graceful offline fallback when WebSocket is in disconnected state.

### Battery 6: Universal Rule 28 Modularity & W3C Trusted Types Compliance
- Scan all modified files (`dashboard.css`, `dashboard.js`, `temporal_productivity_feature.js`, `background.js`).
- Assert that every modified/new function has <= 50 lines and cyclomatic nesting depth <= 3.
- Assert 0 occurrences of `.innerHTML =` across touched files.

### Battery 7: UTF-8 with BOM Encoding Integrity
- Assert that all modified and created files start with BOM bytes `0xEF, 0xBB, 0xBF`.

---

## 📋 3. Step-by-Step QA Execution Instructions

1. **Author Standalone Test Suite:**
   Create `tests/test_chrono_heatmap_overhaul.js` implementing all 7 batteries using Node.js `assert` and `fs`.
2. **Execute Dedicated Test Suite:**
   ```powershell
   node tests/test_chrono_heatmap_overhaul.js
   ```
   Assert all 7 batteries pass with `Exit Code 0`.
3. **Execute Full Project Regression Runner:**
   ```powershell
   node run_all_tests.js
   ```
   Assert that all 102+ test files pass 100% clean with 0 failures.
4. **Secret Scanning & Security Verification:**
   ```powershell
   gitleaks detect --redact
   ```
   Assert 0 secret leaks found.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Zero-Skip QA Policy:** Under no circumstances may any phase or task be signed off without raw terminal output proving exit code 0.
- **Master Regression Non-Negotiable:** Any regression in existing test files triggers an immediate rollback and bugfix.
- **UTF-8 with BOM Standard:** The test file itself must be encoded in UTF-8 with BOM.

---

## 🧪 5. Local Verification Gate

Final Certification Command:
```powershell
node tests/test_chrono_heatmap_overhaul.js
node run_all_tests.js
```
Expected Output: `ALL BATTERIES PASSED (Exit Code 0)`.
