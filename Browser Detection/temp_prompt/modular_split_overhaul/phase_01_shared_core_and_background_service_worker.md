# Phase 01: Shared Core & Background Service Worker Modular Split

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_01_shared_core_and_background_service_worker.md`](phase_01_shared_core_and_background_service_worker.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 06 (Backend & API Engineering) & Dept 02 (Solution Architecture)  
> **Target Agent Role:** Level 4 Backend & Systems Engineer  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Decompose the oversized **3,132-line monolithic `background.js`** service worker into modular, single-responsibility domain subsystems under `src/background/` and consolidate foundational cross-tier utilities under `src/shared/` and `src/core/`. Establish a high-performance root `background.js` facade that retains 100% backward compatibility with Manifest V3 service worker lifecycle requirements and all existing unit tests.

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Decision Gate cleared by Level 2 Manager; active `AUTH-MGR-*` authorization token issued.
- **Target Files:**
  - `background.js` (3,132 lines) — [background.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L1-L3132)
  - `src/shared/constants.js` — [constants.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/shared/constants.js)
  - `src/shared/contracts.js` — [contracts.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/shared/contracts.js)
  - `src/shared/formatters.js` — [formatters.js](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/shared/formatters.js)
  - Existing modules in `src/background/` (`config/`, `handlers/`, `state/`, `storage/`, `telemetry/`, `ws/`)

---

## 🔍 3. Technical Context & File Anchors

In `background.js`:
- Lines 1-30: Manifest V3 service worker preamble and conditional `require` / global loader bridge.
- Lines 35-250: WebSocket client connection logic for port 65432 (Video Detector HUD) and port 65433 (SQLite Data Hub).
- Lines 251-650: Silent HTTP probe, exponential backoff reconnect ladder, and pause guards.
- Lines 651-1400: Tab activity tracking (`tabs.onActivated`, `tabs.onUpdated`, `idle.onStateChanged`, domain active accumulator).
- Lines 1401-2100: Media telemetry aggregation, dual-media tracking state, and broadcast pipeline.
- Lines 2101-2600: Chrome Alarms dispatching (flush alarms, sleep timer ticker, daily rollup).
- Lines 2601-3132: `chrome.runtime.onMessage` router and storage reconciliation helpers.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: Consolidate Shared Utilities & Contracts**
   - Ensure `src/shared/constants.js` exports canonical ports (`HUD_PORT = 65432`, `HUB_PORT = 65433`), retry ladders, and alarm names.
   - Ensure `src/shared/contracts.js` defines all IPC message schemas (`QUERY_STATE`, `RECONNECT_WS`, `SET_MEDIA_VOLUME`, `TOGGLE_PLAYBACK`, `MEDIA_TELEMETRY`).
   - Ensure `src/shared/formatters.js` provides RFC 4180 CSV cell escaping and time duration formatting.

2. **Step 2: Modularize WebSocket & Data Hub Clients (`src/background/ws/`)**
   - Wire `src/background/ws/silent_probe.js`: Silent HTTP probe before WebSocket creation to prevent `ERR_CONNECTION_REFUSED` console spam.
   - Wire `src/background/ws/reconnect_ladder.js`: Backoff ladder `[5000, 15000, 30000, 60000, 120000]` ms with 3-failure pause guard.
   - Wire `src/background/ws/data_hub_client.js`: WebSocket connection management for HUD (port 65432) and Data Hub (port 65433).

3. **Step 3: Modularize State & Telemetry Engines (`src/background/telemetry/`)**
   - Wire `src/background/telemetry/domain_tracker.js`: High-precision domain active time tracking and idle state pause logic.
   - Wire `src/background/telemetry/sleep_timer_engine.js`: Sleep timer countdown, auto-pause alarm, and notification dispatch.
   - Wire `src/background/state/state_manager.js`: In-memory session accumulator and delta calculator.

4. **Step 4: Modularize Storage & Lifecycle Handlers (`src/background/handlers/` & `storage/`)**
   - Wire `src/background/handlers/tab_listeners.js`: Safe tab event listeners (`onActivated`, `onUpdated`, `onRemoved`).
   - Wire `src/background/handlers/idle_handlers.js`: System idle detection handler (`idle.onStateChanged`).
   - Wire `src/background/handlers/message_router.js`: Clean `chrome.runtime.onMessage` routing dispatch table.
   - Wire `src/background/storage/storage_manager.js`: `chrome.storage.local` persistence with debounced flush.

5. **Step 5: Assemble Root Facade in `background.js`**
   - Update `background.js` to act as a slim entrypoint orchestrator importing and initializing the subsystems.
   - Ensure it passes Node syntax check `node -c background.js` and AST parse `new vm.Script(...)`.
   - Maintain UTF-8 BOM encoding (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries

- **Out of Scope:** Modifying `popup/` or `dashboard/` files during this phase.
- **Invariant:** Do NOT remove any existing IPC message handling actions supported by `background.js`.
- **W3C Standard:** Zero `eval()` or dynamic code generation.

---

## 📦 6. Deliverables Manifest

- `src/shared/constants.js` (Consolidated)
- `src/shared/contracts.js` (Consolidated)
- `src/shared/formatters.js` (Consolidated)
- `src/background/ws/data_hub_client.js` (Updated/Refactored)
- `src/background/ws/silent_probe.js` (Updated/Refactored)
- `src/background/ws/reconnect_ladder.js` (Updated/Refactored)
- `src/background/telemetry/domain_tracker.js` (Updated/Refactored)
- `src/background/telemetry/sleep_timer_engine.js` (Updated/Refactored)
- `src/background/handlers/message_router.js` (Updated/Refactored)
- `src/background/handlers/tab_listeners.js` (Updated/Refactored)
- `background.js` (Slim root facade orchestrator)

---

## 🧪 7. Local Verification Gate

The executing agent must run and pass the following tests with exit code 0 before declaring Phase 1 complete:
```powershell
node -c background.js
node tests/test_syntax_and_manifest_integrity.js
node tests/test_timer_and_dual_media_tracking.js
node tests/test_tracking_modes_and_audible_bg_media.js
node tests/test_event_deduplication.js
node tests/test_extension_delta_sync.js
```
