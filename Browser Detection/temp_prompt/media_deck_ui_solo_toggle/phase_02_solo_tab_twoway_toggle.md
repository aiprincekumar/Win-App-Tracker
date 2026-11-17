# Phase 2 Execution Prompt: Solo Tab Two-Way Toggle Logic in Feature & Background

> **Execution Directive for Level 4 Fullstack Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 04 Backend Architecture & Dept 05 Frontend Engineering.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🎯 1. Phase Objective
Implement a responsive two-way toggle for Solo Tab mode:
1. In `src/dashboard/features/media_deck_visualizer_feature.js`:
   - When the user clicks `btnSolo` on an active solo tab (`targetId === currentSoloTabId`), toggle OFF solo mode: reset `currentSoloTabId = null`, unmute all streams in `cachedStreams`, send `MEDIA_STREAM_SOLO_CLEAR` / `soloTabId: null` to the background, and re-render the deck.
   - When the user clicks `btnSolo` on an un-soloed tab (`targetId !== currentSoloTabId`), execute standard solo mode as before.
2. In `background.js`:
   - Implement handler for `MEDIA_STREAM_SOLO_CLEAR` (and support `soloTabId === null || soloTabId === 0` in `handleSoloTabExecution` or a dedicated helper `handleSoloTabClearExecution`).
   - Unmute all active media tabs via `browserAPI.tabs.update(id, { muted: false })` and send `MEDIA_CONTROL` unmute.
   - Update `tabMediaMap` so all `isMuted` flags are `false`.
   - Broadcast `LIVE_MEDIA_UPDATE`.

---

## 📂 2. Target Files & Anchors
- **Dashboard Feature Logic:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L141-L177)
- **Background Service Worker:** [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L2310-L2370) and [`background.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js#L3930-L3938)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 2.1: Update `handleSoloTab` in `media_deck_visualizer_feature.js`
In `src/dashboard/features/media_deck_visualizer_feature.js`:
1. Check if the target tab is currently soloed:
   ```javascript
   const isAlreadySolo = (currentSoloTabId === targetId);

   if (isAlreadySolo) {
     // Deactivate Solo Mode (Two-Way Toggle Off)
     currentSoloTabId = null;

     // Optimistically unmute all cached streams
     cachedStreams.forEach(s => {
       s.isMuted = false;
     });

     if (options.containerEl && options.doc) {
       renderMultiTabMediaDeck(cachedStreams, options.containerEl, options);
     }

     if (api && api.runtime && typeof api.runtime.sendMessage === 'function') {
       return new Promise((resolve) => {
         try {
           api.runtime.sendMessage({
             action: 'MEDIA_STREAM_SOLO_CLEAR',
             soloTabId: null
           }, (res) => {
             resolve(res || { success: true, cleared: true, soloTabId: null });
           });
         } catch (_) {
           resolve({ success: true, cleared: true, simulated: true, soloTabId: null });
         }
       });
     }

     return Promise.resolve({ success: true, cleared: true, localOnly: true, soloTabId: null });
   }
   ```
2. If `!isAlreadySolo`, proceed with the existing solo activation logic (`currentSoloTabId = targetId`, mute other tabs, unmute `targetId`, send `MEDIA_STREAM_SOLO`).

### Step 2.2: Add Background Clear Handler in `background.js`
1. In `background.js` message listener (around line 3930):
   ```javascript
   if (msgType === 'MEDIA_STREAM_SOLO_CLEAR') {
     (async () => {
       await ensureStorageLoaded();
       const result = await handleSoloTabClearExecution();
       sendResponse(result);
     })();
     return true;
   }
   ```
2. Implement `handleSoloTabClearExecution()` in `background.js` (around line 2370):
   ```javascript
   async function handleSoloTabClearExecution() {
     let unmutedCount = 0;

     // 1. Unmute all tabs in tabMediaMap
     for (const [tId, mediaData] of tabMediaMap.entries()) {
       const numId = Number(tId);
       if (numId) {
         try {
           if (browserAPI.tabs && typeof browserAPI.tabs.update === 'function') {
             await browserAPI.tabs.update(numId, { muted: false }).catch(() => {});
           }
         } catch (_) {}
         safeSendTabMessage(numId, { type: 'MEDIA_CONTROL', action: 'unmute' });
         if (mediaData && mediaData.primaryMedia) {
           mediaData.primaryMedia.isMuted = false;
         }
         unmutedCount++;
       }
     }

     // 2. Query any other audible/muted tabs and unmute them
     try {
       if (browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
         const allTabs = await browserAPI.tabs.query({});
         if (Array.isArray(allTabs)) {
           for (const t of allTabs) {
             if (t && t.id && t.mutedInfo && t.mutedInfo.muted) {
               await browserAPI.tabs.update(t.id, { muted: false }).catch(() => {});
               safeSendTabMessage(t.id, { type: 'MEDIA_CONTROL', action: 'unmute' });
               unmutedCount++;
             }
           }
         }
       }
     } catch (_) {}

     safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });
     return { success: true, cleared: true, soloTabId: null, unmutedCount };
   }
   ```
3. Export `handleSoloTabClearExecution` to `globalThis` and `SentinelBackgroundModules`.
4. Also update `handleSoloTabExecution(soloTabId)` so if `soloTabId === null || soloTabId === 0 || !soloTabId`, it safely forwards to `handleSoloTabClearExecution()`.

---

## 🧪 4. Local Verification Gate
- Test `handleSoloTab` toggles between soloed (target unmuted, others muted) and un-soloed (all unmuted, `currentSoloTabId === null`).
- Test `handleSoloTabClearExecution` properly unmutes all tabs and returns `{ success: true, cleared: true }`.
- Verify UTF-8 with BOM on all edited files.
