# Phase 4: Comprehensive QA Verification, Regression Testing & Signoff

> **Phase Identifier:** `phase_04_verification_regression_and_qa_signoff`  
> **Workspace Container:** `temp_prompt/kpi_expansion_10x2/`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Target Subsystems:** `tests/test_kpi_expansion_10x2.js`, `src/dashboard/features/focus_advanced_suite.js`, `run_all_tests.js`  

---

## 🎯 1. Phase Objective

Author and execute a dedicated 8-battery automated test suite (`tests/test_kpi_expansion_10x2.js`) validating all 20 KPI cards, responsive CSS rules, calculation math, zero-innerHTML compliance, and bilingual parity; resolve the pre-existing Rule 28 function length violation in `src/dashboard/features/focus_advanced_suite.js` to restore master regression suite integrity; verify 100% passage across all test suites in `run_all_tests.js` (Exit Code 0); perform a Gitleaks secret scan; and execute autonomous local micro-commits per Universal Rule 15.

---

## 📋 2. Prerequisites & Inputs

- Completion of Phases 1, 2, and 3.
- Target files:
  - `tests/test_kpi_expansion_10x2.js` (To be created)
  - [`src/dashboard/features/focus_advanced_suite.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/focus_advanced_suite.js)
  - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 4.1: Author Dedicated Test Battery `tests/test_kpi_expansion_10x2.js`
Create an 8-battery test suite:
1. **Battery 1 (Time Tracking DOM Hierarchy):** Verify that `#trackingMetricsGrid` has `.kpi-grid-5x2` and contains all 10 cards (`#cardTodayTime`, `#cardDailyAvg`, `#cardTotalTime`, `#cardProductivityScore`, `#cardFocusAnalytics`, `#cardTopDomain`, `#cardActiveDomains`, `#cardDistractionTime`, `#cardPeakHour`, `#cardLongestSession`).
2. **Battery 2 (Media Analytics DOM Hierarchy):** Verify that `#mediaMetricsGrid` has `.kpi-grid-5x2` and contains all 10 cards (`#cardMediaTotalWatch`, `#cardMediaAvgWatch`, `#cardMediaSessions`, `#cardMediaTopPlatform`, `#cardMediaActiveStreams`, `#cardMediaAvgVolume`, `#cardMediaPeakVolume`, `#cardMediaLowVolume`, `#cardMediaMutedSessions`, `#cardMediaLongestSession`).
3. **Battery 3 (CSS Grid & Responsive Tokens):** Verify `dashboard.css` contains `.kpi-grid-5x2` with `repeat(5, minmax(0, 1fr))` and responsive breakpoints for 1100px, 768px, and 480px.
4. **Battery 4 (Time Tracking Pure Aggregation Algorithms):** Assert `computeActiveDomainsCount`, `computeDistractionStats`, `computePeakActivityHour`, and `computeLongestContinuousSession` return mathematically accurate values for synthetic datasets.
5. **Battery 5 (Media Analytics Pure Aggregation Algorithms):** Assert `computeTopMediaPlatform`, `computeActiveLiveStreamsCount`, `computeMutedSessionsCount`, and `computeLongestMediaSession` return correct values.
6. **Battery 6 (W3C Trusted Types Zero-innerHTML Compliance):** Scan `dashboard.js` and ensure none of the 20 KPI element IDs are manipulated via `.innerHTML`.
7. **Battery 7 (Bilingual i18n Parity):** Verify all 16 new keys exist in both `locales/en.json` and `locales/hi.json` with non-empty string values.
8. **Battery 8 (Universal Rule 28 Function Length Audit):** Verify all functions in newly added blocks in `dashboard.js` are strictly <= 50 lines.

---

### Step 4.2: Resolve Pre-existing Rule 28 Violation in `focus_advanced_suite.js`
In `src/dashboard/features/focus_advanced_suite.js`, refactor `bindFocusAdvancedEventListeners` (currently 54 lines) by splitting it into two modular helpers:
- `bindFocusModeSelectors(els, state)` (<= 25 lines)
- `bindFocusActionButtons(els, state)` (<= 25 lines)
- `bindFocusAdvancedEventListeners(els, state)` (calls both helpers, <= 15 lines)

This immediately resolves the failure in `tests/test_advanced_features_focus_sleep.js`.

---

### Step 4.3: Execute Full Master Regression Suite
Execute `node run_all_tests.js` and verify:
- Total test files: ~90 test files
- Result: 100% PASSED (0 failures)
- Exit code: 0

---

### Step 4.4: SRE & Security Audits
1. Verify UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all modified files (`dashboard.html`, `dashboard.css`, `dashboard.js`, `locales/en.json`, `locales/hi.json`, `tests/test_kpi_expansion_10x2.js`, `focus_advanced_suite.js`).
2. Run Gitleaks secret scan: `gitleaks detect --redact` (0 leaks allowed).
3. Universal Rule 15: Autonomously micro-commit local changes.

---

## 🔒 4. Constraints & Invariants

- Master test suite `run_all_tests.js` MUST achieve 100% PASS with exit code 0.
- Zero regression tolerated across all existing tabs, sleep timer, audio lab, visualizer, or popup features.
- Clean working tree verification via `git status`.

---

## 📦 5. Deliverables Manifest

- `tests/test_kpi_expansion_10x2.js` (8-battery automated verification suite)
- `src/dashboard/features/focus_advanced_suite.js` (Refactored to comply with Rule 28)
- Test execution terminal proof with exit code 0

---

## ✅ 6. Local Verification Gate

```powershell
node tests/test_kpi_expansion_10x2.js
node run_all_tests.js
```
