# Phase 2: Debounced Storage Persistence, MV3 Lifecycle Hydration, and Active Session Sync

> **Document Type:** Dedicated Phase Instruction Specification  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Target Subsystem:** Service Worker Storage Persistence & Telemetry Sync (`background.js`)  
> **Target Subagent Role:** Level 4 Backend Engineer  
> **Lead Department:** Department 04 (Backend & System Architecture)  
> **Execution Gate:** Local Verification Gate (Phase 2 Gate Clean Exit Code 0)  

---

## 🎯 1. Phase Objective

The objective of Phase 2 is to ensure that `mediaHistory` is persistently and atomically saved alongside `activityData` to prevent data loss across Chrome MV3 service worker terminations, and that `GET_DASHBOARD_DATA` dynamically synchronizes in-flight active playing sessions before responding:
1. Integrate `CONFIG.MEDIA_HISTORY_STORAGE_KEY` directly into `saveStorageData()` and `scheduleStorageSave()` so that every debounced persistence cycle flushes both activity data and media history atomically.
2. In `GET_DASHBOARD_DATA`, iterate over all currently playing `activeMediaSessions`, compute in-flight elapsed duration, and upsert them into `mediaHistory` so the dashboard immediately reflects live active playback.
3. Harden `loadStorageData()` to ensure complete hydration of `mediaHistory` from local storage with schema safety, deduplication, and FIFO capping.
4. Add runtime suspend hooks (`browserAPI.runtime.onSuspend`) to flush all media sessions before service worker shutdown.

---

## 📦 2. Prerequisites & Inputs

- File: `background.js` (Completed Phase 1 telemetry fixes)
- Memory: `memory.md`
- Test Suite: `tests/test_tab_switch_and_storage_persistence.js`

---

## 🔍 3. Technical Context & File Anchors

### File Anchor 1: `saveStorageData` (`background.js` lines 1488-1506)
Currently only persists:
```javascript
await browserAPI.storage.local.set({ 
  [CONFIG.STORAGE_KEY]: activityData,
  [`${CONFIG.STORAGE_KEY}_backup`]: {
    domainsCount: Object.keys(activityData.domains || {}).length,
    lastUpdated: activityData.lastUpdated
  }
});
```
`mediaHistory` is NOT included here! It was only saved in `saveMediaHistory()`, which was only called on explicit session finalization.

### File Anchor 2: `GET_DASHBOARD_DATA` (`background.js` lines 2953-2985)
Currently calls:
```javascript
await ensureStorageLoaded();
commitActiveInterval();
cleanStaleTabMedia();
scheduleStorageSave(false);
```
It does NOT sync active playing sessions into `mediaHistory` before responding. If a user is currently watching a 20-minute video, that video is not in `mediaHistory` (or has stale duration) until it pauses or finishes!

### File Anchor 3: `loadStorageData` (`background.js` lines 993-1075)
Loads `CONFIG.MEDIA_HISTORY_STORAGE_KEY`, but needs validation to ensure corrupted entries or non-array values are gracefully sanitized into an empty array or valid history entries.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Atomically Persist `mediaHistory` in `saveStorageData` (`background.js`)
Update `saveStorageData()` in `background.js` to include `CONFIG.MEDIA_HISTORY_STORAGE_KEY`:
```javascript
async function saveStorageData() {
  if (!isStorageLoaded) return;
  if (isSaving) return;
  isSaving = true;
  try {
    activityData.lastUpdated = Date.now();
    if (!Array.isArray(mediaHistory)) {
      mediaHistory = [];
    }
    if (mediaHistory.length > CONFIG.MAX_MEDIA_HISTORY) {
      mediaHistory = mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY);
    }
    await browserAPI.storage.local.set({ 
      [CONFIG.STORAGE_KEY]: activityData,
      [CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory,
      [`${CONFIG.STORAGE_KEY}_backup`]: {
        domainsCount: Object.keys(activityData.domains || {}).length,
        mediaCount: mediaHistory.length,
        lastUpdated: activityData.lastUpdated
      }
    });
  } catch (e) {
    console.error('[MediaSentinel] Error saving storage:', e);
  } finally {
    isSaving = false;
  }
}
```

### Step 2.2: Add Live Active Session Synchronization in `GET_DASHBOARD_DATA` (`background.js`)
In the `GET_DASHBOARD_DATA` message handler:
Before building the response object, add an active session synchronization block:
```javascript
if (message.type === 'GET_DASHBOARD_DATA') {
  (async () => {
    await ensureStorageLoaded();
    commitActiveInterval();
    cleanStaleTabMedia();

    // Synchronize all currently playing active media sessions into mediaHistory
    const now = Date.now();
    for (const [, session] of activeMediaSessions.entries()) {
      if (session && session.isPlaying) {
        const elapsedMs = now - session.lastHeartbeat;
        const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
        if (elapsedSec > 0) {
          session.watchDuration += elapsedSec;
          session.lastHeartbeat += (elapsedSec * 1000);
          session.lastUpdated = now;
        }
        updateMediaHistoryEntry(session, false);
      }
    }

    scheduleStorageSave(false);
```
*Impact:* This ensures that whenever the popup or dashboard queries `GET_DASHBOARD_DATA`, every currently playing video is immediately up-to-date in `mediaHistory` with its live elapsed seconds.

### Step 2.3: Add Graceful MV3 Suspension Flush (`background.js`)
Locate or add `browserAPI.runtime.onSuspend` listener in `background.js`:
```javascript
if (browserAPI.runtime && browserAPI.runtime.onSuspend) {
  browserAPI.runtime.onSuspend.addListener(() => {
    const now = Date.now();
    for (const [tabId, session] of activeMediaSessions.entries()) {
      if (session && session.isPlaying) {
        const elapsedMs = now - session.lastHeartbeat;
        const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
        if (elapsedSec > 0) {
          session.watchDuration += elapsedSec;
          session.lastHeartbeat += (elapsedSec * 1000);
          session.lastUpdated = now;
          updateMediaHistoryEntry(session, false);
        }
      }
    }
    saveStorageData();
  });
}
```

### Step 2.4: Ensure `saveMediaHistory` Delegates to `saveStorageData` or Capped Save
Verify that `saveMediaHistory()` uses the unified capping logic and safe error handling:
```javascript
async function saveMediaHistory() {
  try {
    if (!Array.isArray(mediaHistory)) mediaHistory = [];
    if (mediaHistory.length > CONFIG.MAX_MEDIA_HISTORY) {
      mediaHistory = mediaHistory.slice(0, CONFIG.MAX_MEDIA_HISTORY);
    }
    await browserAPI.storage.local.set({ [CONFIG.MEDIA_HISTORY_STORAGE_KEY]: mediaHistory });
  } catch (e) {
    console.error('[MediaSentinel] Error saving media history:', e);
  }
}
```

---

## 🛡️ 5. Architectural Constraints & Boundaries

- **Atomic Storage Operation:** Always write both keys in a single `set()` call in `saveStorageData()` to prevent race conditions or mismatched timestamps.
- **Bounds Checking:** Hard limit `mediaHistory.length <= CONFIG.MAX_MEDIA_HISTORY` (500) at all times.
- **Preserve Message Signatures:** Do not change any field names returned in the `GET_DASHBOARD_DATA` response object.

---

## 📋 6. Deliverables Manifest

- `background.js` (Unified storage persistence, active session sync in `GET_DASHBOARD_DATA`, suspend flush hook)

---

## 🚦 7. Local Verification Gate

Execute the following commands in the workspace:
1. Syntax integrity check:
   ```powershell
   node -c background.js
   ```
2. Existing storage persistence test suite:
   ```powershell
   node tests/test_tab_switch_and_storage_persistence.js
   ```
Must pass 100% clean with exit code 0.
