# Phase 01: Storage Session Schema & Service Worker Lifecycle Reconciliation Engine

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Phase Document:** `phase_01_storage_session_schema_and_reconciliation.md`  
> **Phase Target:** Persistent Session Data Contract, SW Wakeup Reconciliation & Suspension Checkpoint  
> **Target Subsystems:** `background.js`, `src/background/state/state_manager.js`, `src/background/storage/storage_manager.js`  
> **Assigned Subagent Role:** Level 4 Backend Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Implement the persistent storage session schema (`sentinel_active_session`) and Service Worker lifecycle reconciliation engine in `background.js` (and companion modular state/storage managers). When the Manifest V3 Service Worker wakes up from suspension, it must read the persistent session, calculate bounded elapsed duration (`MAX_RECONCILE_DRIFT_MS = 45s`), detect sleep gaps (`SLEEP_THRESHOLD_MS = 60s`), and commit recovered browsing time accurately without dropping seconds or creating time leaps.

---

## 📋 2. Prerequisites & File Anchors
- Read and adhere to:
  - [`C:\Users\Atul Verma\.gemini\config\rules\foundation_core.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/foundation_core.md)
  - [`C:\Users\Atul Verma\.gemini\config\rules\dynamic_departments_matrix.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/dynamic_departments_matrix.md)
  - [`C:\Users\Atul Verma\.gemini\config\rules\CODE_MODULARITY_AND_SCALABLE_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/CODE_MODULARITY_AND_SCALABLE_ARCHITECTURE.md)
  - [`temp_prompt/robust_time_tracking_reconciliation/TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/robust_time_tracking_reconciliation/TRD.md)
- Target Files:
  - [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) (lines ~455-470, ~2900-2960, ~4390-4410)
  - [`src/background/state/state_manager.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/background/state/state_manager.js)
  - [`src/background/storage/storage_manager.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/background/storage/storage_manager.js)
  - Create modular feature if needed: `src/background/features/time_tracking_reconciliation_feature.js`

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Define Session Data Contract & Storage Helper
1. In `src/background/features/time_tracking_reconciliation_feature.js` (or modular helper in `src/background/`):
   - Define constants:
     - `KEEPALIVE_INTERVAL_MS = 15000;`
     - `MAX_RECONCILE_DRIFT_MS = 45000;`
     - `SLEEP_THRESHOLD_MS = 60000;`
     - `STORAGE_KEY_ACTIVE_SESSION = 'sentinel_active_session';`
   - Implement `getSessionStorageArea()`: prefers `browserAPI.storage.session` when available; falls back to `browserAPI.storage.local`.
   - Implement `saveActiveSessionCheckpoint(sessionData)`: writes active session snapshot to storage with `lastHeartbeatTime = Date.now()`.
   - Implement `clearActiveSessionCheckpoint()`: safely removes `STORAGE_KEY_ACTIVE_SESSION`.

### Step 1.2: Implement `reconcileTrackingSessionOnStartup()`
1. Implement the reconciliation function:
   - Read `sentinel_active_session` from the session storage area.
   - If no valid session exists, return early.
   - Calculate `elapsedMs = Date.now() - session.lastHeartbeatTime`.
   - **Case Sleep Gap (`elapsedMs > SLEEP_THRESHOLD_MS`):**
     - User closed laptop or OS slept. Credit at most 15 seconds (`Math.round(KEEPALIVE_INTERVAL_MS / 1000)`).
     - Call `commitDomainDelta(session.domain, 15, { isReconciled: true })`.
     - Remove `sentinel_active_session` to finalize boundary.
   - **Case Normal SW Suspension (`0 < elapsedMs <= SLEEP_THRESHOLD_MS`):**
     - Calculate `validSec = Math.min(Math.floor(elapsedMs / 1000), Math.floor(MAX_RECONCILE_DRIFT_MS / 1000))`.
     - If `validSec > 0`, credit domain seconds to `activityData`.
     - Update session `lastHeartbeatTime = Date.now()` and re-persist checkpoint.
   - Anchor `intervalStartTime = Date.now()` in `background.js`.

### Step 1.3: Wire Top-Level Wakeup & Suspension Guard in `background.js`
1. Top-Level Worker Initialization:
   - Call `reconcileTrackingSessionOnStartup()` inside initial startup flow (e.g. adjacent to `loadStorageData()`).
2. Enhance `browserAPI.runtime.onSuspend`:
   - Before worker enters sleep, execute `commitActiveInterval()`.
   - If `activeDomain` is active, call `saveActiveSessionCheckpoint()` with latest timestamps.
   - Call `saveStorageData()` to ensure all seconds are committed to disk.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Keep all new feature functions strictly <= 50 lines.
- Cyclomatic nesting depth strictly <= 3.
- NEVER perform blind storage writes; ensure storage keys are namespaced.
- Do NOT break existing `activityData.domains` schema.
- Preserve UTF-8 with BOM on all touched files.

---

## 📦 5. Deliverables Manifest
1. `src/background/features/time_tracking_reconciliation_feature.js`: Modular reconciliation engine.
2. `background.js`: Top-level integration on worker startup and `runtime.onSuspend`.
3. Standalone test verification for Phase 1 functions.

---

## 🧪 6. Local Verification Gate
Execute node test or unit test:
```powershell
node -e "const f = require('./src/background/features/time_tracking_reconciliation_feature.js'); console.log('Phase 1 loaded successfully');"
```
Must pass with exit code 0.

---
