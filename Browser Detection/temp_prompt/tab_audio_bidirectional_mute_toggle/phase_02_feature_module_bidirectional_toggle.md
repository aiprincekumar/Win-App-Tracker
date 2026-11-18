# Phase 2: Frontend Feature Module Two-Way Toggle Logic
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Target File:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js)  
> **Assigned Agent Role:** Level 4 Frontend Engineer  
> **Mandatory Guidelines:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`), 100% W3C Trusted Types Safe

---

## 🎯 1. Phase Objective
Upgrade the frontend feature module to support stateful two-way toggling for Solo Tab, Mute All Others, and Mute All, maintaining cache consistency, optimistic updates, and dispatching appropriate IPC actions to the service worker.

---

## 📝 2. Surgical Step-by-Step Instructions

### Step 1: Add State Variables
In `media_deck_visualizer_feature.js`:
```javascript
let isMuteAllOthersActive = false;
let isMuteAllActive = false;
```

### Step 2: Refine `handleSoloTab(soloTabId, options)`
- When toggling ON: set `currentSoloTabId = targetId`, send `MEDIA_STREAM_SOLO`.
- When toggling OFF: set `currentSoloTabId = null`, send `MEDIA_STREAM_SOLO_CLEAR`.
- Optimistically update `cachedStreams` and re-render deck cards.

### Step 3: Upgrade `handleMuteAllOthers(streamsList, primaryTabId, options)`
- If `isMuteAllOthersActive === true`:
  - Toggle OFF: set `isMuteAllOthersActive = false`.
  - Dispatch IPC action `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR`.
  - Optimistically restore/unmute non-primary cached streams.
- If `isMuteAllOthersActive === false`:
  - Toggle ON: set `isMuteAllOthersActive = true`.
  - Dispatch IPC action `MEDIA_STREAM_MUTE_ALL_OTHERS`.
  - Optimistically mute non-primary cached streams.
- Trigger `renderMultiTabMediaDeck` if container is available.

### Step 4: Implement `handleMuteAll(streamsList, options)`
- If `isMuteAllActive === true`:
  - Toggle OFF: set `isMuteAllActive = false`.
  - Dispatch IPC action `MEDIA_STREAM_MUTE_ALL_CLEAR`.
  - Optimistically unmute all cached streams.
- If `isMuteAllActive === false`:
  - Toggle ON: set `isMuteAllActive = true`.
  - Dispatch IPC action `MEDIA_STREAM_MUTE_ALL`.
  - Optimistically mute all cached streams.
- Trigger `renderMultiTabMediaDeck` if container is available.

### Step 5: Export Getters, Setters, and Handlers
Expose on `MediaDeckVisualizerFeature`:
```javascript
handleSoloTab,
handleMuteAllOthers,
handleMuteAll,
getIsMuteAllOthersActive: () => isMuteAllOthersActive,
setIsMuteAllOthersActive: (val) => { isMuteAllOthersActive = Boolean(val); },
getIsMuteAllActive: () => isMuteAllActive,
setIsMuteAllActive: (val) => { isMuteAllActive = Boolean(val); },
```

---

## 🔒 3. Local Verification Gate
- Unit test verifying toggle states transition from false -> true -> false.
- Confirm `MEDIA_STREAM_MUTE_ALL_OTHERS` and `MEDIA_STREAM_MUTE_ALL` message dispatch.
