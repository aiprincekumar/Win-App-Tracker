# Phase 04: Independent QA Verification & Master Regression Testing

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Phase Document:** `phase_04_verification_standalone_suite_regression.md`  
> **Phase Target:** Standalone 7-Battery Verification Suite, Master Test Runner Regression, AppSec Audit & Grade A+ Certification  
> **Target Subsystems:** `tests/test_time_tracking_reconciliation_and_keepalive.js`, `run_all_tests.js`  
> **Assigned Subagent Role:** Level 4 QA Verification Subagent  
> **Governance:** Universal Rule 4/18 (Independent QA), Universal Rule 12/15 (Gitleaks), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Author a comprehensive 7-battery standalone verification test suite (`tests/test_time_tracking_reconciliation_and_keepalive.js`) asserting the complete functional lifecycle of the storage session schema, wakeup reconciliation, keepalive port communication, sleep gap bounding, and privacy blacklist guards. Verify zero regressions across the entire project by running `run_all_tests.js`, confirm zero secret leaks via `gitleaks detect --redact`, and certify UTF-8 with BOM across all touched files to award Grade A+ certification.

---

## 📋 2. Prerequisites & File Anchors
- Phases 1, 2, and 3 completed.
- Target Files:
  - Create: `tests/test_time_tracking_reconciliation_and_keepalive.js`
  - Run: [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 4.1: Author Standalone Test Suite `tests/test_time_tracking_reconciliation_and_keepalive.js`
Structure the test suite into 7 distinct, isolated test batteries:

1. **Battery 1: Session Schema & Storage Serialization:**
   - Assert storage keys: `sentinel_active_session`.
   - Validate session schema: `domain`, `tabId`, `windowId`, `sessionStartTime`, `lastHeartbeatTime`, `lastCommittedTime`, `isForeground`, `isUserActive`.
   - Verify serialization and deserialization via mock storage area (`storage.session` and `storage.local`).
2. **Battery 2: Service Worker Wakeup Reconciliation Logic:**
   - Mock existing session with `lastHeartbeatTime = Date.now() - 30_000` (30s elapsed).
   - Execute `reconcileTrackingSessionOnStartup()`.
   - Assert exactly 30 seconds are credited to `activityData.domains[domain]`.
   - Assert `lastHeartbeatTime` is updated to current time.
   - Assert elapsed duration exceeding `MAX_RECONCILE_DRIFT_MS` (e.g. 50s) is capped at 45s.
3. **Battery 3: OS Sleep / Hibernation Gap Detection:**
   - Mock existing session with `lastHeartbeatTime = Date.now() - 14_400_000` (4 hours elapsed sleep).
   - Execute `reconcileTrackingSessionOnStartup()`.
   - Assert sleep gap is detected (`> SLEEP_THRESHOLD_MS = 60_000`).
   - Assert only 15 seconds (1 heartbeat interval) are credited, and the 4-hour gap is discarded.
   - Assert session is cleared from storage to mark clean boundary.
4. **Battery 4: Keepalive Port Lifecycle & Heartbeat Transmission:**
   - Mock active tab opening keepalive port (`name: 'sentinel_tracking_keepalive'`).
   - Emit periodic `KEEPALIVE_HEARTBEAT` messages.
   - Assert background records active port in `activeKeepalivePorts`.
   - Assert active domain accumulates time in real time.
   - Simulate port `disconnect()` and verify immediate interval commitment and port map cleanup.
5. **Battery 5: Privacy Blacklist & Domain Exclusion Gating:**
   - Test blacklist matching against `localhost`, `127.0.0.1`, and wildcard patterns.
   - Assert content script skips port creation on blacklisted domains.
   - Assert background disconnects incoming port immediately if domain matches blacklist.
   - Assert zero seconds are ever credited to blacklisted domains.
6. **Battery 6: Idle State & Window Focus Transitions:**
   - Trigger `chrome.idle.onStateChanged('idle')`: assert `isUserActive` becomes false and interval is committed.
   - Trigger heartbeat while idle: assert heartbeat is acknowledged for keepalive but zero browsing seconds are credited.
   - Trigger `chrome.windows.onFocusChanged(WINDOW_ID_NONE)`: assert interval is paused during browser blur.
7. **Battery 7: Context Invalidation & Graceful Port Teardown:**
   - Simulate extension context invalidation (`chrome.runtime.id = undefined` / lastError).
   - Assert content script catches error, clears interval timers, and prevents uncaught console exceptions.

### Step 4.2: Execute Standalone Verification Suite
Run:
```powershell
node tests/test_time_tracking_reconciliation_and_keepalive.js
```
Must pass 7/7 batteries with 100% exit code 0.

### Step 4.3: Execute Master Regression Suite
Run:
```powershell
node run_all_tests.js
```
Must pass all test suites (118+ suites) with 0 failures and exit code 0.

### Step 4.4: AppSec & Credential Scan
Run:
```powershell
gitleaks detect --redact
```
Must confirm 0 secret leaks.

### Step 4.5: UTF-8 with BOM & Code Modularity Certification
- Ensure all newly created or edited files have UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- Ensure all new functions comply with Rule 28 (<= 50 lines, max depth <= 3).

---

## 🚫 4. Architectural Constraints & QA Invariants
- Tests must be deterministic with zero flaky asynchronous timeouts.
- Never mock away the actual reconciliation math; test the real algorithms.
- Exit code 0 is strictly mandatory.

---

## 📦 5. Deliverables Manifest
1. `tests/test_time_tracking_reconciliation_and_keepalive.js`: 7-battery standalone test suite.
2. Complete test execution logs proving exit code 0.
3. Gitleaks scan report proving 0 leaks.

---

## 🧪 6. Local Verification Gate
Execute standalone test suite:
```powershell
node tests/test_time_tracking_reconciliation_and_keepalive.js
```
Must output: `ALL 7 BATTERIES PASSED (Exit Code: 0)`.

---
