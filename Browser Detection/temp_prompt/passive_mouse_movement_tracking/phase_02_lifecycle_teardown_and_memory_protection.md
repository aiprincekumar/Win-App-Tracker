# Phase 02: Lifecycle Teardown & Event Listener Cleanup

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Phase Document:** `phase_02_lifecycle_teardown_and_memory_protection.md`  
> **Phase Target:** Deterministic Event Listener Unregistration & Memory Leak Elimination in `teardownMediaSentinel`  
> **Target Subsystem:** `content_media.js` (~lines 250–325)  
> **Assigned Subagent Role:** Level 4 Frontend / Systems Subagent  
> **Governance:** Universal Rule 28 (< 50 lines per function, max nesting depth <= 3), Universal Rule 5/8 (UTF-8 with BOM)  

---

## 🎯 1. Phase Objective
Integrate clean lifecycle deregistration of all user activity event listeners into `teardownMediaSentinel()` in `content_media.js`. When an extension is reloaded, updated, uninstalled, or when a frame unloads, ensure 100% of attached window event listeners are detached using `removeEventListener`, preventing dangling closures and DOM memory leaks.

---

## 📋 2. Prerequisites & File Anchors
- Phase 1 completed (`phase_01_throttled_passive_mouse_tracking.md`).
- Read and adhere to:
  - [`temp_prompt/passive_mouse_movement_tracking/TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/passive_mouse_movement_tracking/TRD.md)
- Target File:
  - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Author Modular Unregistration Helper
Inside `content_media.js` (near `teardownMediaSentinel`):
Implement a focused helper `detachUserActivityListeners()`:
```javascript
function detachUserActivityListeners() {
  if (!Array.isArray(userActivityListeners)) return;
  for (const item of userActivityListeners) {
    try {
      if (item && item.target && typeof item.target.removeEventListener === 'function') {
        item.target.removeEventListener(item.event, item.handler, item.options);
      }
    } catch (_) {}
  }
  userActivityListeners = [];
}
```

### Step 2.2: Integrate into `teardownMediaSentinel()`
In `teardownMediaSentinel()` (~lines 290–320):
1. Invoke `detachUserActivityListeners()` alongside existing observer and timer cleanups.
2. Ensure `userActivityListeners` is set to an empty array so subsequent calls are idempotent.

---

## 🚫 4. Architectural Constraints & Rule 28 Boundaries
- Keep `detachUserActivityListeners` under 25 lines.
- Nesting depth strictly <= 3.
- Defensive try/catch wrapping around each `removeEventListener` call to prevent uncaught DOM exceptions.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. `content_media.js`: Enhanced `teardownMediaSentinel()` with deterministic listener unregistration.

---

## 🧪 6. Local Verification Gate
- Run syntax check:
  `node -c content_media.js`
- Verify context teardown cleanly clears `userActivityListeners`.
