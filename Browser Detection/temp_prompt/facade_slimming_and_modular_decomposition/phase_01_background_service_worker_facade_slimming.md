# Phase 01: Background Service Worker Facade Slimming

> **Task ID:** TASK-MODULAR-SPLIT-006-P01  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 Backend & Systems Engineer (`backend_systems_engineer`)  
> **Target Files:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js), [`src/background/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/background)  
> **Prerequisites:** Clean git status, memory.md anchored  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Deconstruct the monolithic inline logic remaining in `background.js` (currently 3,450 lines) into dedicated domain modules under `src/background/` and transform `background.js` into a lightweight, pure service worker facade (< 250 lines). The facade must orchestrate background telemetry, storage persistence, WebSocket HUD connectivity, and IPC message routing while maintaining 100% backward compatibility for Chrome MV3 service worker execution and Node.js VM AST tests.

---

## 📂 2. Target File Map & Line Anchors

- **Root Facade:** `background.js` (Lines 1-3450)
- **Subsystem Destination Modules:**
  - `src/background/config/config_manager.js` (Configuration & retry ladders)
  - `src/background/state/state_manager.js` (Tracking state & active tab memory)
  - `src/background/storage/storage_manager.js` (Chrome storage flush & load)
  - `src/background/storage/sleep_timer_storage.js` (Sleep timer persistence)
  - `src/background/ws/silent_probe.js` (HTTP port 65432 probe)
  - `src/background/ws/reconnect_ladder.js` (Exponential backoff ladder)
  - `src/background/ws/offline_queue.js` (Offline telemetry buffer)
  - `src/background/ws/data_hub_client.js` (WebSocket HUD client)
  - `src/background/telemetry/domain_tracker.js` (Per-domain active time tracker)
  - `src/background/telemetry/delta_streamer.js` (Delta streaming to views)
  - `src/background/telemetry/sleep_timer_engine.js` (Sleep countdown engine)
  - `src/background/handlers/tab_listeners.js` (Chrome tabs lifecycle events)
  - `src/background/handlers/alarm_handlers.js` (Periodic alarms & flushes)
  - `src/background/handlers/idle_handlers.js` (System lock & idle events)
  - `src/background/handlers/message_router.js` (Runtime IPC message dispatching)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

1. **Verify Existing Modules in `src/background/`:**
   Inspect each module in `src/background/` to ensure all necessary helper methods, classes, and logic from the monolith are fully encapsulated and exported.
2. **Implement Universal Module Loader in `background.js`:**
   In `background.js`, maintain the Universal Module Definition pattern:
   ```javascript
   const browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime 
     ? globalThis.browser 
     : globalThis.chrome;
   ```
   Safely import or resolve modules using CommonJS `require` when executed in Node.js test harnesses, or via global namespace / `importScripts` when executed in MV3 service worker.
3. **Slim Root `background.js`:**
   Replace the 3,000+ lines of duplicate inline functions with clean delegation calls to the respective subsystem managers:
   - Global unhandled promise rejection handler (lines 72-91).
   - `isRestrictedTabUrl()` (lines 100-118) -> delegates to `src/core/url-utils.js` or `src/shared/formatters.js`.
   - `safeSendRuntimeMessage()` & `safeSendTabMessage()` -> delegates to `src/core/safe-messaging.js`.
   - WebSocket client initialization -> delegates to `src/background/ws/data_hub_client.js`.
   - Event listener registrations -> delegates to `src/background/handlers/*`.
4. **Preserve Global Namespace Integrity:**
   Ensure `globalThis.SentinelBackgroundModules` and all expected global functions remain accessible for test harnesses that execute `vm.runInContext(code, sandbox)`.
5. **Verify UTF-8 BOM:**
   Ensure `background.js` is saved with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **DO NOT** modify `manifest.json` permissions or service worker registration path.
- **DO NOT** introduce bundler requirements (webpack, rollup, esbuild). Zero-build execution must be preserved.
- **DO NOT** use `innerHTML` anywhere.
- **DO NOT** touch dashboard or popup files in this phase.

---

## 🧪 5. Local Verification Gate

Run the following test suites to verify Phase 01 completion:
```bash
node tests/test_syntax_and_manifest_integrity.js
node tests/test_timer_and_dual_media_tracking.js
node tests/test_tracking_modes_and_audible_bg_media.js
node tests/test_extension_delta_sync.js
```
**Gate Requirement:** All commands must exit with code 0 and report 0 errors. Line count of `background.js` must be under 350 lines.
