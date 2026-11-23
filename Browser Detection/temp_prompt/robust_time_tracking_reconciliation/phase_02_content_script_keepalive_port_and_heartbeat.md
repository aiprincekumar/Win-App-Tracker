# Phase 02: Content Script Keepalive Port & Foreground Heartbeat Engine

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Phase Document:** `phase_02_content_script_keepalive_port_and_heartbeat.md`  
> **Phase Target:** Long-Lived Keepalive Port, Visibility Gating, Heartbeat Ping Cadence & Background Disconnect Lifecycle  
> **Target Subsystems:** `content_media.js`, `background.js`, `src/content/`  
> **Assigned Subagent Role:** Level 4 Fullstack Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Implement the foreground keepalive port connection and heartbeat engine. In `content_media.js` (and modular content architecture), establish a long-lived Port (`chrome.runtime.connect({ name: 'sentinel_tracking_keepalive' })`) on active foreground tabs emitting heartbeats every 15 seconds. In `background.js`, listen via `runtime.onConnect`, track active ports, process periodic heartbeats to credit active seconds, and handle port disconnection (`onDisconnect`) deterministically when the user navigates, switches tabs, or closes the window.

---

## 📋 2. Prerequisites & File Anchors
- Phase 1 completed (`phase_01_storage_session_schema_and_reconciliation.md`).
- Read and adhere to:
  - [`temp_prompt/robust_time_tracking_reconciliation/TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/robust_time_tracking_reconciliation/TRD.md)
  - [`temp_prompt/robust_time_tracking_reconciliation/DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/robust_time_tracking_reconciliation/DESIGN.md)
- Target Files:
  - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) (lines ~60-80, ~160-210, ~2380-2400)
  - [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Implement Content Script Keepalive Port in `content_media.js`
1. Modular State:
   - `let keepalivePort = null;`
   - `let keepaliveTimer = null;`
   - `let reconnectTimeout = null;`
2. Implement `connectTrackingKeepalivePort()`:
   - Guard: Check `isExtensionContextValid()`. If false or top-level frame is hidden (`document.visibilityState !== 'visible'`), return immediately.
   - If `keepalivePort` is already open, do not duplicate.
   - Connect: `keepalivePort = chrome.runtime.connect({ name: 'sentinel_tracking_keepalive' });`
   - Wire `keepalivePort.onDisconnect`:
     - Clean up `keepalivePort = null;`
     - If context is still valid and tab is still visible, schedule reconnection using exponential backoff (1s initial, 8s max).
3. Implement `sendKeepaliveHeartbeat()`:
   - Transmit payload:
     ```javascript
     keepalivePort.postMessage({
       type: 'KEEPALIVE_HEARTBEAT',
       domain: window.location.hostname,
       url: window.location.href,
       visibilityState: document.visibilityState,
       hasFocus: document.hasFocus ? document.hasFocus() : true,
       timestamp: Date.now()
     });
     ```
4. Start 15-second heartbeat interval:
   - `keepaliveTimer = setInterval(sendKeepaliveHeartbeat, 15000);`
5. Listen for `document.addEventListener('visibilitychange')`:
   - If `document.visibilityState === 'hidden'`: disconnect port, clear timer.
   - If `document.visibilityState === 'visible'`: invoke `connectTrackingKeepalivePort()`.
6. Integrate into `teardownMediaSentinel()`:
   - Clear `keepaliveTimer` and disconnect `keepalivePort` on page unload / frame teardown.

### Step 2.2: Implement Background Port Handler in `background.js`
1. Maintain Port Map:
   - `const activeKeepalivePorts = new Map(); // tabId -> { port, domain, lastPing }`
2. Implement `handleTrackingKeepaliveConnect(port)`:
   - Filter `if (port.name !== 'sentinel_tracking_keepalive') return;`
   - Extract `tabId = port.sender?.tab?.id` and `windowId = port.sender?.tab?.windowId`.
   - Store in `activeKeepalivePorts`.
   - Wire `port.onMessage.addListener(async (msg) => ...)`:
     - If `msg.type === 'KEEPALIVE_HEARTBEAT'`:
       - Validate active state: verify `tabId === activeTabId` and `windowId === activeWindowId`.
       - If user is active and domain is not blacklisted, commit delta (15s) or call `commitActiveInterval()`.
       - Update `lastHeartbeatTime` in `sentinel_active_session`.
   - Wire `port.onDisconnect.addListener(() => ...)`:
     - Commit any remaining delta for this tab.
     - Remove `tabId` from `activeKeepalivePorts`.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Only the **top frame** (`window === window.top`) should establish the keepalive port. Sub-frames must NOT establish duplicate keepalive ports.
- Never spam port connections: enforce minimum 15-second interval and exponential backoff on disconnect.
- Keep all functions <= 50 lines; nesting depth <= 3.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. `content_media.js`: Keepalive port connection, heartbeat timer, visibility change listener, graceful teardown.
2. `background.js`: `runtime.onConnect` keepalive handler, active port map, heartbeat processing, disconnect cleanup.

---

## 🧪 6. Local Verification Gate
Execute syntax and sanity check:
```powershell
node -e "const fs = require('fs'); fs.readFileSync('content_media.js'); fs.readFileSync('background.js'); console.log('Syntax check PASS');"
```
Must pass with exit code 0.

---
