# Phase 1: Background Service Worker Telemetry & Session Management Overhaul

> **Document Type:** Dedicated Phase Instruction Specification  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Target Subsystem:** Background Service Worker Telemetry (`background.js`)  
> **Target Subagent Role:** Level 4 Backend Engineer  
> **Lead Department:** Department 04 (Backend & System Architecture)  
> **Execution Gate:** Local Verification Gate (Phase 1 Gate Clean Exit Code 0)  

---

## 🎯 1. Phase Objective

The objective of Phase 1 is to eliminate the root causes in `background.js` that cause media sessions to fail duration tracking during foreground playback and fail to track individual videos during SPA (YouTube) in-tab navigation:
1. Fix the heartbeat stomping bug in the 5-second delta loop (`CONFIG.DELTA_BATCH_INTERVAL_MS`), ensuring that `session.watchDuration` accumulates accurately for active media sessions playing in foreground tabs.
2. Ensure `commitBackgroundMediaDelta` is strictly restricted to background tabs (`!isForeground`) to prevent double-counting active browsing time, while `session.watchDuration` accumulates for all active playing media.
3. Implement SPA / YouTube video navigation detection inside `trackMediaSession`: when an incoming media update in an existing tab belongs to a different video URL or video ID, automatically finalize the previous video session into `mediaHistory` and spawn a clean new session.
4. Update `tabs.onUpdated` to reliably detect navigation and url updates on SPA media pages.

---

## 📦 2. Prerequisites & Inputs

- File: `background.js` (Target modifications)
- Memory: `memory.md` (Anchored state)
- Test Suite: `tests/test_timer_and_dual_media_tracking.js`

---

## 🔍 3. Technical Context & File Anchors

### File Anchor 1: Interval Delta Loop (`background.js` lines 3955-3982)
Currently lines 3959-3978 read:
```javascript
const isForeground = (tabId === activeTabId && isBrowserFocused);
if (!isForeground) {
  if (isTrackingPaused) {
    // When time tracking is paused, freeze background media delta accumulation
    session.lastHeartbeat = now;
  } else {
    const elapsedMs = now - session.lastHeartbeat;
    const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
    if (elapsedSec > 0) {
      session.watchDuration += elapsedSec;
      session.lastHeartbeat += (elapsedSec * 1000);
      session.lastUpdated = now;
      commitBackgroundMediaDelta(session.domain, elapsedSec);
      updateMediaHistoryEntry(session, false);
    }
  }
} else {
  // Tab is in foreground; keep lastHeartbeat synced with now
  session.lastHeartbeat = now;
}
```
**Problem:** When `isForeground` is true, `session.lastHeartbeat = now;` is executed without adding anything to `session.watchDuration`. And because `lastHeartbeat` is constantly stomped to `now` every 5 seconds, any subsequent duration calculation in `trackMediaSession` produces 0.

### File Anchor 2: `trackMediaSession` (`background.js` lines 1570-1635)
When a user is on YouTube in the same tab and clicks a new video, `trackMediaSession` receives the new video's payload. But because `session` exists (`activeMediaSessions.get(tabId)`), it only updates `session.title = title`, never checks if `url` changed, never finalizes the previous video, and continues reusing the old session!

### File Anchor 3: `tabs.onUpdated` (`background.js` lines 2650-2663)
Only checks `changeInfo.status === 'loading' && changeInfo.url` to finalize media, which is NOT fired on SPA HTML5 `pushState` navigation!

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Fix Foreground Duration Accrual in Delta Loop (`background.js`)
Locate the 5-second interval loop in `background.js` (Section 3: Commit background media sessions).
Replace the `if (!isForeground)` branching so that `watchDuration` accumulates for ALL active playing sessions:
```javascript
const isForeground = (tabId === activeTabId && isBrowserFocused);
if (isTrackingPaused) {
  session.lastHeartbeat = now;
} else {
  const elapsedMs = now - session.lastHeartbeat;
  const elapsedSec = Math.max(0, Math.min(30, Math.floor(elapsedMs / 1000)));
  if (elapsedSec > 0) {
    session.watchDuration += elapsedSec;
    session.lastHeartbeat += (elapsedSec * 1000);
    session.lastUpdated = now;
    if (!isForeground) {
      commitBackgroundMediaDelta(session.domain, elapsedSec);
    }
    updateMediaHistoryEntry(session, false);
  }
}
```

### Step 1.2: Implement Video ID / URL Change Detection in `trackMediaSession` (`background.js`)
Add a helper function to extract canonical video identifiers:
```javascript
function extractCanonicalMediaId(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    if (u.searchParams && u.searchParams.has('v')) return u.searchParams.get('v');
    if (u.pathname.includes('/shorts/')) return u.pathname.split('/shorts/')[1].split('/')[0];
    return `${u.hostname}${u.pathname}`;
  } catch (_) {
    return url;
  }
}
```
In `trackMediaSession(tabId, payload)`:
When `session` exists and `pm && pm.isPlaying`:
Check if incoming URL/ID is different:
```javascript
const incomingUrl = payload.url || (pm && pm.url) || '';
const existingCanonical = extractCanonicalMediaId(session.url);
const incomingCanonical = extractCanonicalMediaId(incomingUrl);
const isDifferentMedia = Boolean(
  incomingUrl && 
  session.url && 
  incomingCanonical && 
  existingCanonical && 
  incomingCanonical !== existingCanonical
);

if (isDifferentMedia) {
  // Finalize the preceding video session and write to mediaHistory
  finalizeMediaSession(tabId);
  // Reset session to null so a new session object is cleanly created below
  session = null;
}
```
If `session` is reset to null, execution seamlessly falls through to the `newSession` creation block, initializing a brand new session with a new unique ID, initial duration 0, and new video metadata!

### Step 1.3: Enhance `tabs.onUpdated` for SPA Navigation (`background.js`)
In `browserAPI.tabs.onUpdated.addListener`:
When `changeInfo.url` is present:
```javascript
if (changeInfo.url && activeMediaSessions.has(tabId)) {
  const existingSession = activeMediaSessions.get(tabId);
  if (existingSession && existingSession.url) {
    const prevKey = extractCanonicalMediaId(existingSession.url);
    const newKey = extractCanonicalMediaId(changeInfo.url);
    if (prevKey && newKey && prevKey !== newKey) {
      finalizeMediaSession(tabId);
    }
  }
}
```

---

## 🛡️ 5. Architectural Constraints & Boundaries

- **No Double-Counting Domain Time:** `commitBackgroundMediaDelta` must NEVER be called when `isForeground` is true. Foreground browsing time is strictly recorded by `commitActiveInterval()`.
- **Preserve Fractional Milliseconds:** Always advance `session.lastHeartbeat += (elapsedSec * 1000)` rather than setting `lastHeartbeat = now` to prevent timer drift.
- **Maintain Minimum Duration Gate:** Do not remove the `watchDuration >= 1` guard in `finalizeMediaSession` to avoid junk/zero-second entries.

---

## 📋 6. Deliverables Manifest

- `background.js` (Updated telemetry loop, SPA transition detection, canonical media ID extraction)

---

## 🚦 7. Local Verification Gate

Execute the following commands in the workspace:
1. Syntax integrity check:
   ```powershell
   node -c background.js
   ```
2. Existing media tracking test suite:
   ```powershell
   node tests/test_timer_and_dual_media_tracking.js
   ```
Must pass 100% clean with exit code 0.
