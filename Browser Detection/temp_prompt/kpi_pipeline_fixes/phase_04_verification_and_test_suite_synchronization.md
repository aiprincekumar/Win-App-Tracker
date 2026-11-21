# Phase 4: Verification & Test Suite Synchronization

> **Phase Spec File:** `temp_prompt/kpi_pipeline_fixes/phase_04_verification_and_test_suite_synchronization.md`  
> **Initiative:** Web Activity & Media Sentinel - KPI Telemetry Pipeline Stabilization  
> **Target Subsystem:** Test Suites & Master QA Certification  
> **Assigned Department:** Dept 08 Quality Assurance & Testing & Dept 10 AppSec & InfoSec  
> **Execution Gate:** Independent QA Verification Subagent Execution  

---

## 🎯 1. Phase Objective

Author and execute a dedicated standalone verification suite (`tests/test_kpi_pipeline_fixes.js`) covering all 3 KPI pipeline corrections across 7 testing batteries. Synchronize with master test runner (`run_all_tests.js`), perform security credential audit (`gitleaks`), and certify Grade A+ signoff.

---

## 📂 2. Target Test Deliverables

- **Standalone Test Suite:** `tests/test_kpi_pipeline_fixes.js`
- **Master Test Runner:** `run_all_tests.js`
- **Security Audit:** `gitleaks detect --redact`
- **Encoding Audit:** UTF-8 with BOM verification

---

## 🧪 3. Standalone Test Suite Battery Specifications

The new test suite `tests/test_kpi_pipeline_fixes.js` must implement the following 7 batteries:

### Battery 1: Peak Activity Hour Extraction & Formatting
- Test `computePeakActivityHour` with domain `hourlyBuckets` (e.g. hour 14 has 3600s, hour 10 has 1200s) -> expects `'14:00 - 15:00'`.
- Test midnight window (hour 23 has 1800s) -> expects `'23:00 - 00:00'`.
- Test empty payload -> expects `'--:--'`.
- Test all zero values -> expects `'--:--'`.

### Battery 2: Muted Session Recording & KPI Aggregation
- Test `computeMutedSessionsCount` with `isMuted: true` session.
- Test with `averageVolume: 0` session.
- Test with `volumeSamples: [0, 0, 0]` session.
- Test unmuted session (`averageVolume: 80`, `isMuted: false`) -> verify excluded.

### Battery 3: Live Stream Classification & Extraction
- Test `computeActiveLiveStreamsCount` with `isLive: true`.
- Test with `duration: Infinity`.
- Test with `isLiveStream: true`.
- Test standard VOD session (`duration: 600`) -> verify excluded.

### Battery 4: Multi-Tab Streams Integration
- Test `getAllActiveMediaStreams` synthetic simulation produces `isLive` on streams from `tabMediaMap`.
- Test sanitization filter retains live streams with `duration: Infinity` or `duration: 0`.

### Battery 5: Backward Compatibility & Fallback Hierarchy
- Test legacy `data.hourlyBreakdown` payload.
- Test legacy `data.hourlyActivity` array payload.
- Test malformed objects, undefined todayStr, null stats -> zero unhandled exceptions.

### Battery 6: Universal Rule 28 Structural Compliance
- Verify all modified/new functions in `time_tracking_kpi_feature.js`, `media_analytics_kpi_feature.js`, `dashboard.js`, and `background.js` are <= 50 lines with nesting depth <= 3.

### Battery 7: W3C Trusted Types & UTF-8 with BOM Encoding
- Verify zero `innerHTML` modifications on KPI card targets.
- Verify byte signature `0xEF, 0xBB, 0xBF` across all modified files.

---

## 🏁 4. Master QA Verification Gate

- Run standalone suite: `node tests/test_kpi_pipeline_fixes.js` (Must pass 7/7 batteries, 100% exit code 0).
- Run master test runner: `node run_all_tests.js` (Must pass 100% of test suites with exit code 0).
- Run secret scanner: `gitleaks detect --redact` (Must return 0 leaks).
