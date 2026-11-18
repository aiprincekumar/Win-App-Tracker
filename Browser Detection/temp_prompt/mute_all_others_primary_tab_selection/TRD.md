# Technical Requirements Document (TRD): Primary Media Tab Selection for Mute All Others

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Target Subsystems:** `background.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js`  
> **Lead Departments:** Dept 04 (Core Logic / Backend) & Dept 05 (Frontend Engineering)  

---

## 🏛️ 1. Technical Architecture & Component Interaction

The "Mute All Others" feature relies on coordinated execution between:
1. **Dashboard Visualizer Feature (`src/dashboard/features/media_deck_visualizer_feature.js`):**
   - Captures user intent from `#btnMuteAllOthers` click.
   - Evaluates local stream models to find the candidate primary tab if not provided.
   - Dispatches IPC message `MEDIA_STREAM_MUTE_ALL_OTHERS` (or `..._CLEAR`).
   - Updates local stream models and toggles UI styling/i18n text.
2. **Background Service Worker (`background.js`):**
   - Receives IPC message and validates/resolves `primaryTabId`.
   - Executes 3-tier candidate resolution if `primaryTabId` is missing/invalid.
   - Captures pre-mute snapshot in `muteOthersPreviousMuteStates` Map (`Map<number, boolean>`).
   - Calls `browserAPI.tabs.update(primaryTabId, { muted: false })` and `safeSendTabMessage(primaryTabId, { type: 'MEDIA_CONTROL', action: 'unmute' })`.
   - Collects candidate other tabs via `collectCandidateTabs(primaryTabId)` and mutes each tab (Chrome tab-level + in-page DOM level).
   - Broadcasts `LIVE_MEDIA_UPDATE` with updated `synthesizeGlobalMediaState()`.

---

## 🔍 2. Candidate Primary Tab Resolution Specification

### 2.1 Backend Algorithm (`resolveCandidatePrimaryTab(preferredTabId)`)
To avoid bloating `handleMuteAllOthersExecution` beyond the 50-line limit, implement a dedicated helper:

```javascript
/**
 * Resolves candidate primary media tab for Mute All Others following 3-tier hierarchy:
 * 1. Actively playing media (isPlaying === true || audible === true)
 * 2. Most recent media activity/timestamp
 * 3. Currently active focused browser tab
 * @param {number|string|null} preferredTabId
 * @returns {Promise<number>} resolved primary tabId, or 0 if none found
 */
async function resolveCandidatePrimaryTab(preferredTabId) {
  let targetId = Number(preferredTabId) || 0;
  if (targetId) return targetId;

  // Tier 1: Actively playing media in tabMediaMap, activeMediaSessions, or browser audible tabs
  for (const [tId, mediaState] of tabMediaMap.entries()) {
    if (mediaState && (mediaState.anyPlaying || (mediaState.primaryMedia && mediaState.primaryMedia.isPlaying))) {
      return Number(tId);
    }
  }
  if (typeof activeMediaSessions !== 'undefined' && activeMediaSessions.size > 0) {
    for (const [tId, sess] of activeMediaSessions.entries()) {
      if (sess && sess.isPlaying) return Number(tId);
    }
  }
  if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    try {
      const audibleTabs = await browserAPI.tabs.query({ audible: true });
      if (audibleTabs && audibleTabs[0] && audibleTabs[0].id) {
        if (!isRestrictedTabUrl || !audibleTabs[0].url || !isRestrictedTabUrl(audibleTabs[0].url)) {
          return audibleTabs[0].id;
        }
      }
    } catch (_) {}
  }

  // Tier 2: Most recent playback timestamp from activeMediaSessions or mediaHistory
  let mostRecentTabId = 0;
  let latestTimestamp = 0;
  if (typeof activeMediaSessions !== 'undefined') {
    for (const [tId, sess] of activeMediaSessions.entries()) {
      const ts = sess.lastUpdated || sess.lastHeartbeat || 0;
      if (ts > latestTimestamp) {
        latestTimestamp = ts;
        mostRecentTabId = Number(tId);
      }
    }
  }
  if (!mostRecentTabId && Array.isArray(mediaHistory) && mediaHistory.length > 0) {
    for (const item of mediaHistory) {
      const tid = Number(item.tabId);
      if (tid && (tabMediaMap.has(tid) || tabMediaMap.has(String(tid)))) {
        mostRecentTabId = tid;
        break;
      }
    }
  }
  if (mostRecentTabId) return mostRecentTabId;

  // Tier 3: Currently active focused browser tab
  if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    try {
      const active = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      if (active && active[0] && active[0].id) {
        if (!isRestrictedTabUrl || !active[0].url || !isRestrictedTabUrl(active[0].url)) {
          return active[0].id;
        }
      }
    } catch (_) {}
  }

  // Fallback: first tab in tabMediaMap or any open tab
  if (tabMediaMap && tabMediaMap.size > 0) {
    return Number(tabMediaMap.keys().next().value) || 0;
  }
  return 0;
}
```

### 2.2 Frontend Visualizer Algorithm (`src/dashboard/features/media_deck_visualizer_feature.js`)
In `handleMuteAllOthers(streamsList, primaryTabId, options)`:
```javascript
let targetId = Number(primaryTabId || currentSoloTabId || 0);
if (!targetId) {
  // Tier 1: Actively playing stream
  const activeStream = list.find(s => s && (s.isPlaying || s.audible));
  if (activeStream && activeStream.tabId) {
    targetId = Number(activeStream.tabId);
  }
}
if (!targetId) {
  // Tier 2: Most recent playback activity
  const sortedByRecent = [...list].sort((a, b) => {
    const tsA = a.lastUpdated || a.timestamp || a.started_at || 0;
    const tsB = b.lastUpdated || b.timestamp || b.started_at || 0;
    return tsB - tsA;
  });
  if (sortedByRecent[0] && sortedByRecent[0].tabId) {
    targetId = Number(sortedByRecent[0].tabId);
  }
}
// Tier 3: Leave as 0 or null to allow background service worker to resolve active focused window tab
```

---

## 🔒 3. Concurrency, Error Handling & CSP Controls
1. **Error Resiliency:** All `browserAPI.tabs.update` and `browserAPI.tabs.query` calls must be wrapped in `try/catch` and `.catch(() => {})` handlers to prevent unhandled rejection crashes if a tab closes mid-execution.
2. **Map Type Coercion:** Ensure `Number(tabId)` conversion is consistently applied so numeric keys in `tabMediaMap` and `muteOthersPreviousMuteStates` don't collide or fail lookup due to string vs number mismatches.
3. **Line Limit Constraint:** `background.js` functions must each be <= 50 lines. The candidate resolution logic is cleanly factored into `resolveCandidatePrimaryTab` to keep `handleMuteAllOthersExecution` compact (~25 lines).
4. **Encoding:** File mutations must preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
