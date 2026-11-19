# Phase 4: SQLite Database Hub Schema Migration (`hourly_buckets_json`) & Sync

> **Document Type:** Standalone Executable Phase Prompt  
> **Workspace Container:** `temp_prompt/chrono_heatmap_overhaul/`  
> **Phase Identifier:** `PHASE-04-SQLITE-HUB-SCHEMA-SYNC`  
> **Target Subsystems:** `background.js`, `src/background/ws/data_hub_client.js`  
> **Responsible Subagent:** Level 4 Backend Engineer Subagent  
> **Allocated Department:** Dept 06 (Database & Systems Architecture)  
> **Allocated Skills:** `backend-patterns`, `mcp-server-patterns`  
> **Required Authorization:** `AUTH-MGR-*` token issued by Level 2 Manager  

---

## 🎯 1. Phase Objective

Upgrade the WebSocket bridge telemetry client in `background.js` and `src/background/ws/data_hub_client.js` to serialize and synchronize intraday hourly activity distributions via `hourly_buckets_json`. This enables the Standalone Multi-Browser SQLite Data Hub daemon (`ws://127.0.0.1:65433`) to persist 24-hour activity profiles into SQLite table schemas, ensuring that cross-browser analytics dashboards can query complete 24h x 7d heatmaps across Chrome, Edge, and other browsers with full fidelity.

---

## 🛠️ 2. File Anchors & Technical Context

- `background.js`: Lines 816–855 (`flushOfflineSyncQueue`), lines 860–895 (`streamActivityDelta`), lines 5635–5655 (`SYNC_HISTORY_UPSERT` IPC handler).
- `src/background/ws/data_hub_client.js`: Lines 45–100 (`sendDataHubMessage`, `queryDataHub`).

---

## 📋 3. Step-by-Step Surgical Implementation Instructions

### Step 4.1: Extend `SYNC_HISTORY_UPSERT` Payload with `hourly_buckets_json`
In `background.js` (around line 5640):
1. In the `SYNC_HISTORY_UPSERT` message handler:
   ```javascript
   if (msgType === 'SYNC_HISTORY_UPSERT' || message.action === 'SYNC_HISTORY_UPSERT') {
     (async () => {
       await ensureStorageLoaded();
       const history = message.tracking_history || message.data || {};
       const dateStr = message.date || getTodayDateString();
       const dayEntry = history[dateStr] || {};
       const hourlyBuckets = dayEntry.hourlyBuckets || {};
       const hourlyBucketsJson = JSON.stringify(hourlyBuckets);

       if (dataHubConnected && dataHubWs && dataHubWs.readyState === WebSocket.OPEN) {
         sendDataHubMessage({
           type: 'SYNC_HISTORY_UPSERT',
           client_id: clientId,
           date_str: dateStr,
           tracking_history: history,
           hourly_buckets_json: hourlyBucketsJson,
           timestamp: Date.now()
         });
         sendResponse({ success: true, forwardedToHub: true });
       } else {
         sendResponse({ success: true, forwardedToHub: false, offline: true });
       }
     })();
     return true;
   }
   ```

### Step 4.2: Add Dedicated `SYNC_HOURLY_BUCKETS` Broadcast
1. In `background.js`:
   Create a modular helper `syncHourlyBucketsToDataHub(dateStr, hourlyBuckets)` (<= 30 lines per Universal Rule 28):
   - Validates socket connection (`dataHubConnected && dataHubWs && dataHubWs.readyState === WebSocket.OPEN`).
   - Only includes populated buckets (reduces JSON payload size).
   - Transmits payload:
     ```javascript
     {
       type: 'SYNC_HOURLY_BUCKETS',
       browser_type: detectedBrowser,
       client_id: clientId,
       date_str: dateStr,
       hourly_buckets_json: JSON.stringify(hourlyBuckets),
       timestamp: Date.now()
     }
     ```
2. Trigger `syncHourlyBucketsToDataHub` during periodic storage flush alarms (`flushActiveTracking`) or when the local hour transitions.

### Step 4.3: Handle Offline Queueing & Schema Backwards Compatibility
1. Ensure that if the Data Hub is offline (`ws://127.0.0.1:65433` unreachable):
   - Zero console errors or unhandled exceptions are raised.
   - Delta updates remain queued in `offlineSyncQueue` up to the max threshold (1,000 items).
   - Reconnection adheres strictly to the exponential backoff ladder (`[5000, 15000, 30000, 60000, 120000]`).
2. Verify that incoming `ANALYTICS_RESPONSE` messages from Data Hub containing `hourly_buckets_json` can be parsed without throwing when legacy rows return `null` or `"{}"`.

---

## 🚫 4. Architectural Constraints & Boundaries

- **Rule 28 Function Modularity:** Helper functions must remain <= 50 lines.
- **Fail-Safe Offline Mode:** The browser extension must operate 100% autonomously and safely even when the SQLite Data Hub process is terminated or uninstalled.
- **Payload Compression:** Do not transmit 24 empty `{ activeSeconds: 0 }` objects; prune empty entries prior to serialization.
- **UTF-8 with BOM Standard:** Preserve BOM on all modified files.

---

## 🧪 5. Local Verification Gate

Execute payload verification test:
```powershell
node -e "const bg = require('fs').readFileSync('background.js', 'utf8'); console.log('hourly_buckets_json present:', bg.includes('hourly_buckets_json'));"
```
Ensure exit code 0.
