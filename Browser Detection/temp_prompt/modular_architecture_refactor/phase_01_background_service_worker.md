# Phase 01: Background Service Worker Modularization

> **Phase Identifier:** `PHASE-01-BACKGROUND-SW`  
> **Target Subsystem:** Background Service Worker (`background.js`, `src/background/`, `src/shared/`)  
> **Lead Role:** Level 4 Backend & Systems Engineer  
> **Assigned Model:** `flash` (per Dynamic Matrix Dept 06)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/modular_architecture_refactor/phase_01_background_service_worker.md`

---

## 🎯 1. Phase Objective
Deconstruct the monolithic `background.js` (105 KB, ~2,500 lines) into clean, decoupled, single-responsibility ES modules under `src/shared/` and `src/background/`. Establish `background.js` as the slim, declarative root entry point and orchestrator while guaranteeing 100% backward compatibility with all runtime messaging handlers, tab listeners, storage persistence, and automated test hooks.

---

## 📦 2. Prerequisites & Inputs
- **Environment:** Node.js v25.6.1, Manifest V3 `"type": "module"` configured in `manifest.json`.
- **Target Files:**
  - `background.js` (Root service worker)
  - `manifest.json` (Service worker declaration)
- **Baseline Test:** `node tests/test_syntax_and_manifest_integrity.js` must pass before and after.

---

## ⚓ 3. Technical Context & File Anchors

In `background.js`:
- Lines 55–215: Safe messaging helpers (`isRestrictedTabUrl`, `safeSendRuntimeMessage`, `safeSendTabMessage`)
- Lines 216–357: Configuration and speed ladder constants (`CONFIG`, `SPEED_LADDER`, `calculateNextLadderSpeed`)
- Lines 358–409: Browser detection & client initialization (`detectBrowserType`, `initClientIdAndBrowser`)
- Lines 410–614: Data Hub WebSocket connection, exponential backoff, and reconnect logic (`connectDataHub`, `handleDataHubFailure`, `scheduleDataHubReconnect`)
- Lines 615–730: Offline delta sync queue & streaming (`flushOfflineSyncQueue`, `saveOfflineQueue`, `streamActivityDelta`, `streamMediaSessionUpdate`)
- Lines 731–839: Domain extraction & URL parsing (`getTodayDateString`, `isInternalDomain`, `extractDomain`, `getFaviconUrl`)
- Lines 840–987: Storage loading, dirty tracking, and batch saving (`loadStorageData`, `scheduleStorageSave`, `ensureStorageLoaded`)
- Lines 988–1250: Sleep timer state, alarms scheduling, fade ladder, and expiration handlers (`loadSleepTimerData`, `setSleepTimer`, `triggerSleepTimerExpiration`)
- Lines 1251–2500: Chrome event listeners (`chrome.runtime.onMessage`, `chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, `chrome.tabs.onRemoved`, `chrome.alarms.onAlarm`, `chrome.idle.onStateChanged`)

---

## 🔨 4. Surgical Step-by-Step Implementation Instructions

### Step 1.1: Create Shared Foundation Modules (`src/shared/`)
1. Create `src/shared/constants.js`:
   - Export default configurations, timing thresholds, retry ladder intervals `[5000, 15000, 30000, 60000, 120000]`.
   - Export speed ladder `[0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0]`.
2. Create `src/shared/contracts.js`:
   - Export all IPC action types (`ACTIONS`), storage keys (`STORAGE_KEYS`), and default state objects.
3. Create `src/shared/formatters.js`:
   - Export `getTodayDateString()`, `extractDomain(url)`, `isInternalDomain(domain)`, `getFaviconUrl(domain)`.

### Step 1.2: Create Background Subsystems (`src/background/`)
1. **Config Subsystem (`src/background/config/config_manager.js`):**
   - Encapsulate `CONFIG` object, environment detection, and browser type detection (`detectBrowserType`).
2. **Storage Subsystem (`src/background/storage/`):**
   - Create `src/background/storage/storage_manager.js`: Encapsulate `loadStorageData()`, `scheduleStorageSave()`, and `ensureStorageLoaded()`.
   - Create `src/background/storage/sleep_timer_storage.js`: Encapsulate `loadSleepTimerData()`, `saveSleepTimerState()`, and `saveSleepTimerSettings()`.
3. **WebSocket Subsystem (`src/background/ws/`):**
   - Create `src/background/ws/silent_probe.js`: Encapsulate pre-flight HTTP probe (`probePortLive`) to eliminate `ERR_CONNECTION_REFUSED`.
   - Create `src/background/ws/offline_queue.js`: Encapsulate `flushOfflineSyncQueue()`, `saveOfflineQueue()`, and offline delta persistence.
   - Create `src/background/ws/data_hub_client.js`: Encapsulate WebSocket lifecycle, exponential retry ladder, incoming/outgoing messaging.
4. **Telemetry Subsystem (`src/background/telemetry/`):**
   - Create `src/background/telemetry/delta_streamer.js`: Encapsulate `streamActivityDelta()` and `streamMediaSessionUpdate()`.
   - Create `src/background/telemetry/sleep_timer_engine.js`: Encapsulate `setSleepTimer()`, `cancelSleepTimer()`, fade volume step calculation, and expiration.
5. **Handlers Subsystem (`src/background/handlers/`):**
   - Create `src/background/handlers/tab_listeners.js`: Encapsulate `chrome.tabs.onActivated`, `onUpdated`, `onRemoved`.
   - Create `src/background/handlers/alarm_handlers.js`: Encapsulate `chrome.alarms.onAlarm` listeners.
   - Create `src/background/handlers/message_router.js`: Encapsulate `chrome.runtime.onMessage` dispatch table.

### Step 1.3: Refactor Root `background.js` as Orchestrator
1. Import all modular subsystems via native ES module imports (`import ... from './src/background/...'`).
2. Initialize subsystems upon service worker startup.
3. Expose/re-export all legacy functions (`isRestrictedTabUrl`, `safeSendRuntimeMessage`, `safeSendTabMessage`, `calculateNextLadderSpeed`, `connectDataHub`, `setSleepTimer`, etc.) so that AST parsing and tests in `tests/` continue to pass 100%.

---

## 🚫 5. Architectural Constraints & Boundaries
- **No Bundler Requirement:** Do not introduce Webpack/Rollup; use native ES module imports supported natively by MV3 (`"type": "module"`).
- **Zero Breaking API Changes:** All IPC message payloads and storage structures must remain strictly identical.
- **Out of Scope:** Do not modify popup HTML or content script files in this phase.

---

## 📋 6. Deliverables Manifest
- `src/shared/constants.js`
- `src/shared/contracts.js`
- `src/shared/formatters.js`
- `src/background/config/config_manager.js`
- `src/background/storage/storage_manager.js`
- `src/background/storage/sleep_timer_storage.js`
- `src/background/ws/silent_probe.js`
- `src/background/ws/offline_queue.js`
- `src/background/ws/data_hub_client.js`
- `src/background/telemetry/delta_streamer.js`
- `src/background/telemetry/sleep_timer_engine.js`
- `src/background/handlers/tab_listeners.js`
- `src/background/handlers/alarm_handlers.js`
- `src/background/handlers/message_router.js`
- Refactored `background.js` orchestrator

---

## 🚦 7. Local Verification Gate
Execute the following verification commands; all must exit with code 0:
```powershell
node -c background.js
node -c src/shared/constants.js
node -c src/shared/contracts.js
node -c src/background/config/config_manager.js
node -c src/background/storage/storage_manager.js
node -c src/background/ws/data_hub_client.js
node -c src/background/handlers/message_router.js
node tests/test_syntax_and_manifest_integrity.js
node tests/test_extension_delta_sync.js
node tests/test_sleep_timer_and_ui_controls.js
```
