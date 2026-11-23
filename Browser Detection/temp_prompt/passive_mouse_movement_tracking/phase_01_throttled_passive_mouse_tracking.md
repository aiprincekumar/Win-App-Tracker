# Phase 01: Throttled Passive Mouse Movement Tracking Implementation

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Phase Document:** `phase_01_throttled_passive_mouse_tracking.md`  
> **Phase Target:** Passive Pointer Movement Listener, VueUse `useIdle` Pattern & 500ms Micro-Throttle Gate  
> **Target Subsystem:** `content_media.js` (~lines 60–75, ~lines 1365–1390)  
> **Assigned Subagent Role:** Level 4 Frontend / Systems Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Refactor user activity detection in `content_media.js` by expanding event coverage to include pointer/mouse movements (`pointermove` with fallback to `mousemove`) and touch events (`touchstart`), adhering to the VueUse `useIdle` pattern. Introduce a high-performance 500ms micro-throttle gate to prevent main-thread jank, while preserving the 10-second cooldown on `PAGE_USER_INTERACTION` background IPC messages.

---

## 📋 2. Prerequisites & File Anchors
- Read and adhere to:
  - [`temp_prompt/passive_mouse_movement_tracking/TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/passive_mouse_movement_tracking/TRD.md)
  - [`temp_prompt/passive_mouse_movement_tracking/DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/passive_mouse_movement_tracking/DESIGN.md)
- Target File:
  - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Declare State Variables for Micro-Throttling & Listeners
Near top of `content_media.js` (around line 62):
- Ensure `let lastThrottledTick = 0;` is declared.
- Ensure `let userActivityListeners = [];` is declared for lifecycle tracking.

### Step 1.2: Refactor `setupUserActivityListeners()`
In `content_media.js` (~line 1365):
1. **Define Throttled Callback:**
   ```javascript
   const onUserInteraction = () => {
     if (isContextInvalidated || !isExtensionContextValid()) {
       teardownMediaSentinel();
       return;
     }
     const now = Date.now();
     // Micro-throttle to bound execution under high-frequency pointer streams (500ms)
     if (now - lastThrottledTick < 500) {
       return;
     }
     lastThrottledTick = now;

     // 10s cooldown for background IPC transmission
     if (now - lastActivityTimestamp >= 10000) {
       lastActivityTimestamp = now;
       safeSendMessage({
         type: 'PAGE_USER_INTERACTION',
         payload: {
           domain: window.location.hostname,
           timestamp: now
         }
       });
     }
   };
   ```
2. **Configure Event Set:**
   Include `['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']`.
   If `window.PointerEvent` is not supported, fallback `pointermove` -> `mousemove` and `pointerdown` -> `mousedown`.
3. **Register Passive Listeners with Capture:**
   Register each event with `{ passive: true, capture: true }`.
   Append `{ target: window, event: evtName, handler: onUserInteraction, options }` to `userActivityListeners`.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Keep `setupUserActivityListeners` under 45 lines.
- Nesting depth must not exceed 3 levels.
- Never call `preventDefault()` or `stopPropagation()` inside passive listeners.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. `content_media.js`: Refactored `setupUserActivityListeners` with throttled pointer tracking and listener registry.

---

## 🧪 6. Local Verification Gate
- Run syntax check:
  `node -c content_media.js`
- Verify no runtime errors or breaking changes.
