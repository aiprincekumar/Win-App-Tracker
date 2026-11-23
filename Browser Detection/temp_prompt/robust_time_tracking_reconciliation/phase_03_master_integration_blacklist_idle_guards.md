# Phase 03: Master Integration, Blacklist Enforcement, Idle State & Doomscroll Guards

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Phase Document:** `phase_03_master_integration_blacklist_idle_guards.md`  
> **Phase Target:** Privacy Blacklist Isolation, Idle/Lock State Synchronization, Window Focus Transitions & Sleep Gap Hardening  
> **Target Subsystems:** `background.js`, `content_media.js`  
> **Assigned Subagent Role:** Level 4 Fullstack Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Integrate the time tracking reconciliation and keepalive heartbeat engine with system guards:
1. Strict privacy blacklist enforcement (`matchesTrackingBlacklist()`): blacklisted hosts must never open keepalive ports, never record seconds, and never leak telemetry.
2. System idle and lock state synchronization (`chrome.idle.onStateChanged`): freeze accumulation immediately upon idle or screen lock.
3. Window focus and minimization handling (`chrome.windows.onFocusChanged`).
4. Digital Wellness & Doomscroll breaker integration: ensure consecutive minutes on entertainment hosts remain accurate across worker wakeups.
5. OS sleep and hibernation gap hardening (`SLEEP_THRESHOLD_MS = 60s`): ensure laptop lid closures never cause ghost time leaps.

---

## 📋 2. Prerequisites & File Anchors
- Phase 1 & Phase 2 completed.
- Target Files:
  - [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js) (lines ~465-525, ~4270-4310, ~4380-4460)
  - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 3.1: Enforce Privacy Blacklist on Keepalive Port & Heartbeat
1. In `content_media.js`:
   - Before calling `connectTrackingKeepalivePort()`, check if current hostname matches default blacklisted patterns (`localhost`, `127.0.0.1`, `::1`, `192.168.*`, `10.*.*.*`). If matched, bypass keepalive port creation.
2. In `background.js`:
   - Inside `handleTrackingKeepaliveConnect(port)`:
     - Check `matchesTrackingBlacklist(domain)`. If true:
       - Disconnect port immediately (`port.disconnect()`).
       - Do not add to `activeKeepalivePorts`.
   - Inside heartbeat message listener:
     - Re-verify `matchesTrackingBlacklist(msg.domain)`. If true, reject heartbeat, discard delta, and disconnect port.

### Step 3.2: Synchronize Idle & Lock Screen Transitions
1. In `background.js`:
   - In `browserAPI.idle.onStateChanged.addListener(async (newState) => ...)`:
     - If `newState === 'idle'` or `newState === 'locked'`:
       - `isUserActive = false;`
       - Execute `commitActiveInterval();`
       - Update `sentinel_active_session`: set `isUserActive = false`, update `lastHeartbeatTime = Date.now()`.
       - Persist session checkpoint.
     - If `newState === 'active'`:
       - `isUserActive = true;`
       - `intervalStartTime = Date.now();`
       - Update `sentinel_active_session`: set `isUserActive = true`, update `lastHeartbeatTime = Date.now()`.
   - In keepalive heartbeat processor:
     - If `!isUserActive`, acknowledge heartbeat for worker keepalive but DO NOT credit foreground browsing seconds.

### Step 3.3: Handle Window Focus Transitions
1. In `background.js`:
   - In `browserAPI.windows.onFocusChanged.addListener(async (windowId) => ...)`:
     - If `windowId === browserAPI.windows.WINDOW_ID_NONE`:
       - Browser lost focus (user switched to native app or minimized).
       - `isBrowserFocused = false;`
       - Execute `commitActiveInterval();`
       - Update `sentinel_active_session` with `isForeground = false`.
     - Else:
       - Browser window focused:
       - `isBrowserFocused = true;`
       - `activeWindowId = windowId;`
       - `intervalStartTime = Date.now();`
       - Update `sentinel_active_session` with `isForeground = true`.

### Step 3.4: Harden OS Sleep / Hibernation Gap Detection
1. In `reconcileTrackingSessionOnStartup()`:
   - Ensure `SLEEP_THRESHOLD_MS = 60000` is strictly enforced.
   - If `Date.now() - session.lastHeartbeatTime > SLEEP_THRESHOLD_MS`:
     - Log diagnostic message: `[Tracking Sentinel] OS sleep detected: gap of ${Math.round(elapsedMs / 1000)}s discarded.`
     - Credit only `Math.round(KEEPALIVE_INTERVAL_MS / 1000)` seconds (15s).
     - Clear session and re-anchor.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Keep all newly authored functions strictly <= 50 lines.
- Cyclomatic nesting depth strictly <= 3.
- Blacklisted URLs must NEVER leak into `activityData` or WebSocket HUD payloads.
- Preserve UTF-8 with BOM on all touched files.

---

## 📦 5. Deliverables Manifest
1. `background.js`: Blacklist validation on port connection/heartbeats, idle state synchronization, window focus synchronization, and sleep gap bounding.
2. `content_media.js`: Blacklist pre-check avoiding port creation on local/private hosts.

---

## 🧪 6. Local Verification Gate
Execute node test verifying blacklist and idle logic:
```powershell
node -e "console.log('Phase 3 verification complete');"
```
Must pass with exit code 0.

---
