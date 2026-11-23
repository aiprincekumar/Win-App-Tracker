# Technical Requirements Document (TRD): Passive Mouse Movement Tracking

> **Task Container:** `temp_prompt/passive_mouse_movement_tracking/`  
> **Document Type:** Technical Requirements Document (TRD)  
> **Lead Architecture Department:** Dept 02 Solution Architecture (`departments_archive/02_solution_architecture_dept.md`) & Dept 05 Frontend Engineering  
> **Governing Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏛️ 1. Architecture Overview & High-Level Design (HLD)

### VueUse `useIdle` Architecture Reference
In VueUse, `useIdle` binds listeners for user interaction events:
```ts
const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];
```
To minimize main-thread impact, event listeners are registered as passive:
```ts
window.addEventListener(event, onActivity, { passive: true, capture: true });
```
In our in-page media and activity sentinel (`content_media.js`), we adopt this exact architectural paradigm while tuning throttle constants specifically for browser extensions in Manifest V3.

---

## ⚙️ 2. Low-Level Design (LLD) & Data Contracts

### 2.1 Event Roster
The following interaction events are registered:
1. `pointerdown`
2. `pointermove` (with fallback to `mousemove` if PointerEvent is unsupported)
3. `keydown`
4. `wheel`
5. `touchstart`

### 2.2 Micro-Throttle vs IPC Cooldown Gating
To guarantee zero performance degradation under high-frequency pointer streams:
- `ACTIVITY_THROTTLE_MS = 500`: Minimum elapsed time between in-memory timestamp updates.
- `ACTIVITY_IPC_COOLDOWN_MS = 10000`: Minimum elapsed time between `PAGE_USER_INTERACTION` IPC dispatches to background.

```javascript
let lastActivityTimestamp = Date.now();
let lastThrottledTick = 0;
let userActivityListeners = [];

function setupUserActivityListeners() {
  const onUserInteraction = (evt) => {
    if (isContextInvalidated || !isExtensionContextValid()) {
      teardownMediaSentinel();
      return;
    }
    const now = Date.now();
    // Micro-throttle fast exit
    if (now - lastThrottledTick < 500) {
      return;
    }
    lastThrottledTick = now;

    // Background IPC rate limit
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

  const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];
  const options = { passive: true, capture: true };

  events.forEach((evtName) => {
    try {
      window.addEventListener(evtName, onUserInteraction, options);
      userActivityListeners.push({ target: window, event: evtName, handler: onUserInteraction, options });
    } catch (_) {}
  });
}
```

### 2.3 Teardown Lifecycle Contract
Inside `teardownMediaSentinel()`:
```javascript
if (Array.isArray(userActivityListeners)) {
  for (const item of userActivityListeners) {
    try {
      if (item.target && typeof item.target.removeEventListener === 'function') {
        item.target.removeEventListener(item.event, item.handler, item.options);
      }
    } catch (_) {}
  }
  userActivityListeners = [];
}
```

---

## 🔒 3. Non-Functional Requirements & Performance Budgets

1. **CPU & Frame Budget:**
   - Single event tick execution time must be strictly < 0.05ms.
   - 0 layout recalculations or DOM writes triggered by interaction listeners.
2. **Memory Leak Prevention:**
   - 100% of attached listeners must be removed on `teardownMediaSentinel()`.
   - WeakSet / clean scoping for handler closures.
3. **Universal Rule 28 Compliance:**
   - Each newly authored or refactored function must not exceed 50 lines.
   - Cyclomatic nesting depth must not exceed 3 levels.
4. **AppSec & Encoding Standards:**
   - Zero innerHTML assignments (W3C Trusted Types compliant).
   - UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) preserved on disk.
