# Phase 1: Background Service Worker Remote Command Router & Tab Navigation Wiring

> **Phase Identifier:** `PHASE-01-BACKGROUND-IPC`  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Assigned Role:** Level 4 Backend Engineer  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Target File:** [`background.js`](file:///C:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/background.js)

---

## 🎯 1. Phase Objective
Extend the background service worker's `handleRemoteMediaCommandExecution(tabId, command, value)` function to robustly support `seek_to`, `seek_absolute`, `seek_percent`, `seek_relative`, and `switch_tab` / `focus_tab`. Ensure `activateAndFocusTab` is accessible at top-level background scope to handle window un-minimization and tab focusing. Guarantee that executing any remote media command immediately updates the internal `tabMediaMap` and broadcasts `LIVE_MEDIA_UPDATE` to all connected views.

---

## 📋 2. Prerequisites & Environment Inputs
- Clean working directory on branch `main`.
- Node.js runtime `v25.6.1` available.
- Existing 55 test suites passing clean (`node run_all_tests.js`).

---

## 🔍 3. Technical Context & File Anchors
- **File:** `background.js`
- **Anchor 1 (Lines 2378-2438):** `handleRemoteMediaCommandExecution(tabId, command, value)`
- **Anchor 2 (Lines 3432-3467):** `activateAndFocusTab` definition currently scoped inside `JUMP_TO_MEDIA_TAB` handler.
- **Anchor 3 (Lines 3889-3898):** `DASHBOARD_REMOTE_MEDIA_CMD` message listener calling `handleRemoteMediaCommandExecution`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Promote `activateAndFocusTab` to Top-Level Background Scope
1. Define `async function activateAndFocusTab(tabId, windowId)` at top-level helper scope in `background.js` (above `handleRemoteMediaCommandExecution`).
2. Implement robust un-minimization logic:
   - Check `browserAPI.windows.get(winId)`. If `state === 'minimized'`, invoke `browserAPI.windows.update(winId, { state: 'normal', focused: true })`.
   - Update tab active status: `browserAPI.tabs.update(numTabId, { active: true })`.
   - Return `{ success: true, tabId: numTabId, windowId: winId }`.
3. Export to `globalThis.activateAndFocusTab` and `SentinelBackgroundModules.activateAndFocusTab` for testability.

### Step 2: Add Handlers in `handleRemoteMediaCommandExecution`
In `handleRemoteMediaCommandExecution(tabId, command, value)`:
1. **Handle `switch_tab` / `focus_tab`:**
   ```javascript
   if (command === 'switch_tab' || command === 'focus_tab') {
     const focusResult = await activateAndFocusTab(targetId);
     return { success: Boolean(focusResult && focusResult.success), tabId: targetId, command, focusResult };
   }
   ```
2. **Handle `seek_to` / `seek_absolute`:**
   ```javascript
   case 'seek_to':
   case 'seek_absolute': {
     const targetSec = Math.max(0, Number(value) || 0);
     if (pm) pm.currentTime = targetSec;
     safeSendTabMessage(targetId, {
       type: 'MEDIA_CONTROL',
       action: 'seek_to',
       data: { positionSeconds: targetSec, seconds: targetSec }
     });
     break;
   }
   ```
3. **Handle `seek_percent`:**
   ```javascript
   case 'seek_percent': {
     const pct = Math.max(0, Math.min(100, Number(value) || 0));
     if (pm && Number.isFinite(pm.duration) && pm.duration > 0) {
       pm.currentTime = (pct / 100) * pm.duration;
     }
     safeSendTabMessage(targetId, {
       type: 'MEDIA_CONTROL',
       action: 'seek_percent',
       data: { percent: pct }
     });
     break;
   }
   ```
4. **Broadcast Update:** Ensure `safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() })` fires upon completion of all commands.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- DO NOT alter any existing command signatures (`play`, `pause`, `toggle`, `mute`, `unmute`, `solo`, `seek`).
- DO NOT touch database persistence logic or WebSocket server bridges.
- Maintain 100% UTF-8 with BOM on `background.js`.

---

## 📦 6. Deliverables Manifest
- Updated `background.js` with expanded command handlers and top-level `activateAndFocusTab`.

---

## 🧪 7. Local Verification Gate
Execute the following verification commands:
```powershell
node -c background.js
node -e "const bg = require('./background.js'); console.log('Syntax & Exports OK');"
```
Both commands must exit with code 0.
