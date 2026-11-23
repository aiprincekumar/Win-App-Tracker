# Phase 03: Standalone Testing & Master Regression Verification

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Phase Document:** `phase_03_standalone_testing_and_regression_verification.md`  
> **Phase Target:** Standalone 5-Battery Automated Test Suite & Master Regression Verification  
> **Target Subsystems:** `tests/test_passive_mouse_movement_activity.js`, `run_all_tests.js`  
> **Assigned Subagent Role:** Level 4 QA Verification Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Author an automated, deterministic standalone verification test suite (`tests/test_passive_mouse_movement_activity.js`) that verifies passive pointer movement tracking, 500ms micro-throttling, 10s IPC message cooldown, and complete event listener detachment on teardown. Run the master test runner (`node run_all_tests.js`) to guarantee 100% regression-free execution across all project test suites.

---

## 📋 2. Prerequisites & File Anchors
- Phase 1 completed (`phase_01_throttled_passive_mouse_tracking.md`).
- Phase 2 completed (`phase_02_lifecycle_teardown_and_memory_protection.md`).
- Read and adhere to:
  - [`temp_prompt/passive_mouse_movement_tracking/TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/passive_mouse_movement_tracking/TRD.md)
- Target Files:
  - `tests/test_passive_mouse_movement_activity.js` (New test suite)
  - `run_all_tests.js`

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 3.1: Author Standalone Test Suite (`tests/test_passive_mouse_movement_activity.js`)
Structure the test suite into 5 distinct batteries:
1. **Battery 1: Event Listener Registration & Passive Flag Verification:**
   - Verify that `window.addEventListener` is called with `passive: true` and `capture: true` for `pointermove`, `pointerdown`, `keydown`, `wheel`, and `touchstart`.
2. **Battery 2: Micro-Throttle (500ms) Rate Limiting:**
   - Simulate a burst of 50 `pointermove` events within 100ms.
   - Verify that the internal handler exits early without recalculating or triggering IPC.
3. **Battery 3: IPC Transmission & 10s Rate-Limit Cadence:**
   - Advance time beyond 10,000ms and fire a `pointermove` event.
   - Verify that `PAGE_USER_INTERACTION` is sent with `{ domain, timestamp }`.
   - Fire another event after 2,000ms and verify NO additional IPC message is sent.
4. **Battery 4: Context Invalidation Teardown:**
   - Invoke `teardownMediaSentinel()`.
   - Verify that `window.removeEventListener` is called for all registered event types and that the internal listener registry is cleared.
5. **Battery 5: Syntax & Universal Rule 28 Compliance:**
   - Verify AST syntax and function line count constraints on `content_media.js`.

### Step 3.2: Execute Master Regression Suite
Execute `node run_all_tests.js` to ensure that all existing suites (including keepalive, media tracking, dashboard, and popup suites) pass with 0 failures and exit code 0.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Zero skipped tests.
- Standalone test suite must run headlessly in Node.js with mock DOM/Window APIs.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. `tests/test_passive_mouse_movement_activity.js`: Standalone test suite covering Batteries 1 through 5.
2. Master test execution log certifying 100% test passage.

---

## 🧪 6. Verification Gate
- Run standalone suite:
  `node tests/test_passive_mouse_movement_activity.js`
- Run master suite:
  `node run_all_tests.js`
- Both commands must exit with Code 0.
