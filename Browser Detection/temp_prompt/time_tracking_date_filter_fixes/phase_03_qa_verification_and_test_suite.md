# Phase 3: QA Verification, Automated Test Suite Authoring & Master Regression Verification

> **Workspace Container:** `temp_prompt/time_tracking_date_filter_fixes/`  
> **Document:** `phase_03_qa_verification_and_test_suite.md`  
> **Target Subsystem:** QA Automated Test Suite & Regression Testing  
> **Target Files:** `tests/test_time_tracking_date_filter_logic.js`, `run_all_tests.js`  
> **Assigned Role:** Level 4 QA Verification Tester  

---

## 🎯 1. Phase Objective
Author and execute a dedicated, comprehensive automated test suite `tests/test_time_tracking_date_filter_logic.js` validating all 5 temporal subtabs (`today`, `yesterday`, `7d`, `30d`, `custom`), date arithmetic edge cases (month rollovers, leap years), metric slice calculations, donut center label i18n translations, and zero regression across the existing test suite.

---

## 📋 2. Prerequisites & Inputs
- Completion of Phase 1 and Phase 2 implementations.
- Access to [`tests/run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js).

---

## 🔍 3. Test Battery Architecture
Author `tests/test_time_tracking_date_filter_logic.js` covering the following 6 test batteries:

1. **Battery 1: Deterministic Date Math & Fallbacks:**
   - Verify `parseYMD` and `formatYMD` accurately roundtrip dates without timezone shifting.
   - Verify `getDatesInRangeFallback` produces exact consecutive date arrays across month boundaries (e.g. `2026-02-27` to `2026-03-02`).
   - Verify `yesterday`, `7d`, and `30d` produce exact day count arrays relative to `todayStr`.

2. **Battery 2: Today vs Yesterday Filtering:**
   - Supply mock `activityData` with distinct domain seconds on `2026-11-18` vs `2026-11-19`.
   - Assert `processTimeTrackingData` outputs exact day-specific seconds when switched between `'today'` and `'yesterday'`.

3. **Battery 3: Multi-Day Range Rolling Sums (7 Days & 30 Days):**
   - Provide multi-day activity data across 35 days.
   - Assert `7d` sums exactly the last 7 calendar days ending on `todayStr`.
   - Assert `30d` sums exactly the last 30 calendar days ending on `todayStr`.
   - Verify non-overlapping historical data outside the window is excluded.

4. **Battery 4: Range-Specific Foreground & Background Media Breakdown:**
   - Verify `foregroundSeconds`, `backgroundMediaSeconds`, and `combinedSeconds` in `items` reflect the date window totals rather than all-time totals.

5. **Battery 5: Donut Center Label & Bilingual Parity:**
   - Assert `renderDonutChart` displays the correct sub-label for each subtab (`today`, `yesterday`, `7d`, `30d`, `custom`, `daily`, `total`).
   - Assert all 4 new keys exist in both English and Hindi dictionaries in `DASHBOARD_I18N`.

6. **Battery 6: UTF-8 with BOM & Trusted Types DOM Inspection:**
   - Assert `dashboard/dashboard.js` and `dashboard/dashboard.html` retain UTF-8 with BOM byte prefix (`0xEF, 0xBB, 0xBF`).
   - Assert zero `innerHTML` patterns in the refactored code.

---

## 🛠️ 4. Execution Commands
```powershell
# 1. Run the dedicated test battery
node tests/test_time_tracking_date_filter_logic.js

# 2. Run the master regression suite
node run_all_tests.js
```

---

## 📦 5. Deliverables Manifest
- `tests/test_time_tracking_date_filter_logic.js` with 6 fully passing test batteries.
- Terminal proof showing Exit Code 0 and Grade A+ test signoff.

---

## 🧪 6. Local Verification Gate
The dedicated test file and master regression tests must pass cleanly:
```powershell
node tests/test_time_tracking_date_filter_logic.js
```
Must report `ALL BATTERIES PASSED (Exit Code 0)`.
