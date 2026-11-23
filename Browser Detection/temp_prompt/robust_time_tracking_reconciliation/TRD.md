# Technical Requirements Document (TRD): Manifest V3 Robust Time Tracking Reconciliation & Keepalive

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Document Type:** Technical Requirements Document (TRD)  
> **Lead Department:** Dept 02 Solution Architecture (`departments_archive/02_solution_architecture_dept.md`) & Dept 06 Backend & API Engineering (`departments_archive/06_backend_api_engineering_dept.md`)  
> **Governing Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏗️ 1. Architecture Overview & Component Boundaries

The system consists of three architectural layers working in tight coordination:

1. **Ephemeral Service Worker Storage & Reconciliation Layer (`background.js`, `src/background/storage/`):**  
   Maintains a persistent session anchor in `chrome.storage.session` (fast, memory-mapped, cleared on browser close) with automatic fallback to `chrome.storage.local`. Reconciles uncommitted elapsed time across worker wakeups and bounds clock drift.
2. **Foreground Content Script Keepalive Channel (`content_media.js`):**  
   Maintains a long-lived Port (`chrome.runtime.connect`) named `'sentinel_tracking_keepalive'` on the active foreground tab. Transmits lightweight heartbeat telemetry every 15 seconds, preventing the Service Worker from idling while the user is actively reading.
3. **Event Gating & Lifecycle Management Layer (`background.js`):**  
   Coordinates tab switches, window blur/minimization, idle states (`chrome.idle`), and privacy blacklist matching, ensuring heartbeats are rejected and intervals are committed whenever tracking conditions become invalid.

---

## 💾 2. Storage Data Contracts & Schema Specification

### 2.1 Persistent Active Session Schema (`sentinel_active_session`)
Persisted under storage key `'sentinel_active_session'`:

```typescript
interface ActiveTrackingSession {
  domain: string;            // e.g., "developer.mozilla.org"
  url: string;               // e.g., "https://developer.mozilla.org/en-US/docs/Web"
  tabId: number;             // Active tab ID
  windowId: number;          // Active window ID
  sessionStartTime: number;  // Epoch ms when continuous domain session started
  lastHeartbeatTime: number; // Epoch ms of last validated heartbeat from content script
  lastCommittedTime: number; // Epoch ms of last committed seconds to activityData
  isForeground: boolean;     // True if tab is foreground visible
  isUserActive: boolean;     // True if user is not idle or locked
  heartbeatCount: number;    // Monotonically increasing heartbeat counter
  schemaVersion: number;     // 1
}
```

### 2.2 Storage Engine Selection
```javascript
// Resilient storage selector: Prefer chrome.storage.session, fallback to chrome.storage.local
function getSessionStorageArea() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
    return chrome.storage.session;
  }
  return browserAPI.storage.local;
}
```

---

## 🧮 3. Mathematical Reconciliation Equations & Drift Bounding

### 3.1 Constants & Parameters
- `KEEPALIVE_INTERVAL_MS = 15_000` (15 seconds between content script heartbeats)
- `MAX_RECONCILE_DRIFT_MS = 45_000` (45 seconds maximum credited elapsed duration per wake)
- `SLEEP_THRESHOLD_MS = 60_000` (60 seconds: gap indicative of OS sleep or hibernation)

### 3.2 Reconciliation Algorithm (SW Startup & Wakeup)
Upon Service Worker top-level initialization or event wake:

```javascript
async function reconcileTrackingSessionOnStartup() {
  const storage = getSessionStorageArea();
  const res = await storage.get(['sentinel_active_session']);
  const session = res?.sentinel_active_session;
  
  if (!session || !session.domain || !session.lastHeartbeatTime) {
    return;
  }

  const now = Date.now();
  const elapsedMs = now - session.lastHeartbeatTime;

  // Case A: Machine was asleep or hibernated (> 60s gap)
  if (elapsedMs > SLEEP_THRESHOLD_MS) {
    // Credit only up to the expected interval duration (15s) beyond last heartbeat
    const creditedSeconds = Math.round(KEEPALIVE_INTERVAL_MS / 1000);
    commitDomainDelta(session.domain, creditedSeconds);
    // Finalize session boundary
    await storage.remove(['sentinel_active_session']);
    return;
  }

  // Case B: Normal Service Worker wakeup after short suspension (<= 45s)
  if (elapsedMs > 0) {
    const validSec = Math.min(Math.floor(elapsedMs / 1000), Math.floor(MAX_RECONCILE_DRIFT_MS / 1000));
    if (validSec > 0 && !matchesTrackingBlacklist(session.domain) && session.isUserActive) {
      commitDomainDelta(session.domain, validSec);
      session.lastHeartbeatTime = now;
      session.lastCommittedTime = now;
      await storage.set({ sentinel_active_session: session });
    }
  }
}
```

---

## 🔌 4. Content Script Keepalive Port Protocol

### 4.1 Connection Lifecycle
- **Trigger:** Content script runs on all pages (`run_at: "document_start"`). When `document.visibilityState === 'visible'` and domain is NOT blacklisted:
  ```javascript
  const port = chrome.runtime.connect({ name: 'sentinel_tracking_keepalive' });
  ```
- **Heartbeat Message:** Emitted every 15,000 ms via `setInterval`:
  ```json
  {
    "type": "KEEPALIVE_HEARTBEAT",
    "domain": "developer.mozilla.org",
    "url": "https://developer.mozilla.org/...",
    "visibilityState": "visible",
    "hasFocus": true,
    "timestamp": 1732400000000
  }
  ```
- **Tab Inactivity / Hide:** When `document.addEventListener('visibilitychange')` detects `'hidden'`, content script pauses heartbeats and disconnects the port.
- **Port Disconnection & Error Handling:**  
  On `port.onDisconnect`:
  - If `chrome.runtime.lastError` indicates extension context invalidation, gracefully teardown.
  - If tab remains visible and context is valid, reconnect with exponential backoff (initial delay 1000ms, max 8000ms).

### 4.2 Background Port Management
- `browserAPI.runtime.onConnect.addListener((port) => ...)`:
  - If `port.name !== 'sentinel_tracking_keepalive'`, ignore.
  - Extract sender `tabId` and `windowId` from `port.sender`.
  - Maintain active port map: `const activeKeepalivePorts = new Map(); // tabId -> port`.
  - On incoming `HEARTBEAT`:
    1. Validate domain against `matchesTrackingBlacklist(domain)`. If blacklisted, disconnect port immediately.
    2. Validate user state (`isUserActive && !isTrackingPaused`).
    3. Update `sentinel_active_session` and commit active interval delta.
  - On `port.onDisconnect`:
    1. Commit any remaining delta for this tab.
    2. Remove from `activeKeepalivePorts`.

---

## 🛡️ 5. Edge Cases & Defensive Architecture

1. **Multiple Windows / Monitors:**  
   Only the window that currently holds browser focus (`isBrowserFocused && windowId === activeWindowId`) credits active time. Non-focused windows' heartbeats are acknowledged for keepalive but do NOT accumulate foreground seconds.
2. **User Idle / Lock Screen:**  
   `chrome.idle.onStateChanged`:  
   - `'idle'` or `'locked'`: immediately set `isUserActive = false`, call `commitActiveInterval()`, and persist session with `isUserActive = false`. Incoming heartbeats while idle are recorded as idle pings without accumulating time.  
   - `'active'`: reset `isUserActive = true`, reset `intervalStartTime = Date.now()`.
3. **Extension Reload / Context Invalidation:**  
   Content script wraps all port calls in `isExtensionContextValid()` guards to eliminate uncaught `Extension context invalidated` errors.
4. **Service Worker Suspension Guard:**  
   `runtime.onSuspend.addListener`:  
   - Executes `commitActiveInterval()`.  
   - Updates `sentinel_active_session.lastHeartbeatTime = Date.now()`.  
   - Synchronously triggers `saveStorageData()` before suspension.

---

## 📏 6. Universal Rule 28 Modularity & Clean Architecture

- File length target: < 500 lines per feature file.
- Modular extraction: Subsystem functions are encapsulated cleanly into `src/background/features/time_tracking_reconciliation_feature.js` or dedicated modular handlers.
- Function length ceiling: strictly <= 50 lines per newly authored function.
- Cyclomatic complexity: nesting depth strictly <= 3.
- Security: zero `innerHTML` mutations; strictly safe DOM manipulation or headless telemetry logic.

---
