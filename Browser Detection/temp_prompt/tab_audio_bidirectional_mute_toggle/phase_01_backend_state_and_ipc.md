# Phase 1: Backend Service Worker State & Bidirectional IPC Architecture
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Target File:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)  
> **Assigned Agent Role:** Level 4 Backend Engineer  
> **Mandatory Guidelines:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`), 100% W3C Trusted Types Safe

---

## 🎯 1. Phase Objective
Implement stateful prior-mute snapshots and bidirectional toggle execution logic in the MV3 background service worker (`background.js`), including handlers for:
1. Solo Tab mode state snapshot and revert.
2. Mute All Others mode state snapshot and restore.
3. Mute All mode state snapshot and restore.
4. IPC listener routing and `LIVE_MEDIA_UPDATE` telemetry broadcast.

---

## 📝 2. Surgical Step-by-Step Instructions

### Step 1: Add Snapshot Maps at File Scope
In `background.js`, define persistent snapshot maps:
```javascript
const soloPreviousMuteStates = new Map();
const muteOthersPreviousMuteStates = new Map();
const muteAllPreviousMuteStates = new Map();
```

### Step 2: Upgrade Solo Tab Execution & Revert
- In `handleSoloTabExecution(soloTabId)`:
  - Clear `soloPreviousMuteStates`.
  - Prior to muting non-solo tabs, query all current tabs and record their current `mutedInfo.muted` state in `soloPreviousMuteStates`.
  - Unmute the target tab.
  - Mute all candidate other tabs.
- In `handleSoloTabClearExecution()`:
  - If `soloPreviousMuteStates.size > 0`, iterate over the snapshot: for each `[tId, wasMuted]`, set `browserAPI.tabs.update(tId, { muted: wasMuted })` and update `tabMediaMap`.
  - If no snapshot exists, default to unmuting all tabs.
  - Clear `soloPreviousMuteStates`.
  - Broadcast `LIVE_MEDIA_UPDATE`.

### Step 3: Implement Mute All Others Handlers
- Implement `handleMuteAllOthersExecution(primaryTabId)`:
  - Record pre-mute state of all non-primary tabs into `muteOthersPreviousMuteStates`.
  - Mute all non-primary tabs.
  - Broadcast `LIVE_MEDIA_UPDATE`.
- Implement `handleMuteAllOthersClearExecution()`:
  - Restore each non-primary tab to its recorded pre-mute state.
  - Clear `muteOthersPreviousMuteStates`.
  - Broadcast `LIVE_MEDIA_UPDATE`.

### Step 4: Implement Mute All Handlers
- Implement `handleMuteAllExecution()`:
  - Record pre-mute state of all active media tabs into `muteAllPreviousMuteStates`.
  - Mute all active media tabs.
  - Broadcast `LIVE_MEDIA_UPDATE`.
- Implement `handleMuteAllClearExecution()`:
  - Restore each tab to unmuted (or its recorded pre-mute state).
  - Clear `muteAllPreviousMuteStates`.
  - Broadcast `LIVE_MEDIA_UPDATE`.

### Step 5: Route IPC Messages
In the `chrome.runtime.onMessage.addListener` block:
- Add handlers for:
  - `MEDIA_STREAM_MUTE_ALL_OTHERS` -> `handleMuteAllOthersExecution(message.primaryTabId)`
  - `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR` -> `handleMuteAllOthersClearExecution()`
  - `MEDIA_STREAM_MUTE_ALL` -> `handleMuteAllExecution()`
  - `MEDIA_STREAM_MUTE_ALL_CLEAR` -> `handleMuteAllClearExecution()`

### Step 6: Export Functions to Global Scope
Ensure all newly added execution functions are exported on `globalThis` and `globalThis.SentinelBackgroundModules`.

---

## 🔒 3. Local Verification Gate
- Run VM-based sandbox test simulating snapshot capture, tab muting, and clean revert.
- Verify zero exceptions and correct return values.
