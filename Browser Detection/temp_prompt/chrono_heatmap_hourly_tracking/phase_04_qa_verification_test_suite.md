# Phase 04: QA Verification & Master Regression Test Suite

> **Document Type:** Standalone Phase Execution Prompt  
> **Phase #:** 04  
> **Target Subsystem:** Test Automation (`tests/test_chrono_heatmap_hourly_tracking.js` & `run_all_tests.js`)  
> **Assigned Subagent Role:** Level 4 QA Verification Tester  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Phase Objective
Author a comprehensive 7-battery standalone test suite `tests/test_chrono_heatmap_hourly_tracking.js` validating all 3 runtime layers (backend telemetry, dashboard aggregation, temporal heatmap calculation & fallback) and verify that the master test suite `node run_all_tests.js` passes with 100% green exit code 0.

---

## 📋 2. Test Battery Blueprint

The test file `tests/test_chrono_heatmap_hourly_tracking.js` must implement the following 7 test batteries:

1. **Battery 1 (Backend Active Telemetry Recording):**
   - Mock `activityData` and invoke `commitActiveInterval()`.
   - Assert `activityData.domains[activeDomain].days[today].hourlyBuckets[currentHour].activeSeconds` matches elapsed seconds.
2. **Battery 2 (Backend Media Delta Recording):**
   - Invoke `commitBackgroundMediaDelta('spotify.com', 450)`.
   - Assert `hourlyBuckets[currentHour].backgroundMediaSeconds === 450`.
3. **Battery 3 (Dashboard History Aggregation with Single Domain):**
   - Pass mock domain with `hourlyBuckets` to the dashboard transformer.
   - Assert `historyMap[dateStr].hourlyBuckets[h]` aggregates `activeTime` and `mediaTime` accurately.
4. **Battery 4 (Competitive Top Domain Resolution):**
   - Provide hour 14 with domain A (100s) and domain B (500s).
   - Assert `historyMap[dateStr].hourlyBuckets[14].topDomain === 'domainB.com'`.
5. **Battery 5 (Temporal Heatmap Telemetry Mode):**
   - Call `aggregateChronoHeatmap()` with real hourly buckets.
   - Assert `matrix[dayOfWeek][h].activeSeconds` and `mediaSeconds` match exact hour buckets.
6. **Battery 6 (Temporal Heatmap Fallback Mode with Empty `{}` Buckets):**
   - Call `aggregateChronoHeatmap()` with `hourlyBuckets: {}` and `domains: { 'github.com': { seconds: 800 } }`.
   - Assert that instead of 0, active seconds are distributed across hours 10 to 17 (100s each).
7. **Battery 7 (Master Regression Suite):**
   - Run `node run_all_tests.js` and assert all existing test suites pass cleanly with Exit Code 0.

---

## 🛡️ 3. Execution Standard & Verification Command
```powershell
node tests/test_chrono_heatmap_hourly_tracking.js
node run_all_tests.js
```
Expected output: 100% of test batteries PASS with exit code 0.
