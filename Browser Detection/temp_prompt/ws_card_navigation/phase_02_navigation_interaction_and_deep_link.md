# Phase 2 Execution Prompt: Navigation Interaction & Deep-Link Controller

> **Phase:** 2 of 3  
> **Phase Name:** Deep-Link Navigation Controller, Focus Handoff & Event Wiring  
> **Target Role:** Level 4 Frontend Engineer  
> **Assigned Scope:** Implement `navigateToBridgeService()` and wire `click` + `keydown` event listeners in `dashboard/dashboard.js`.  
> **Target File:**
> - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)

---

## 🎯 Phase Objective
Implement a robust, modular deep-link navigation controller in `dashboard/dashboard.js` that orchestrates:
1. Tab switching to Settings (`switchTab('settings')`).
2. Smooth scrolling directly to the specific connection service row (`#rowBridgeHub` or `#rowBridgeHud`).
3. Direct focus handoff to the corresponding action button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`), preparing it for an immediate second click or Enter/Space trigger.
4. Applying transient glow/pulse animation classes (`.service-row-highlight` and `.highlight-pulse`) with automatic 2000ms cleanup.
5. Binding `click` and `keydown` (`Enter`, `Space` with `preventDefault()`) listeners to `#sidebarDataHubCard` and `#sidebarHudCard`.

---

## 📋 Prerequisites & Context
- Universal Rule 5 & 8: Maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- Universal Rule 1: Exclusive execution authority by Level 4 Frontend Engineer.
- Existing functions: `switchTab(tabKey)` is defined around line 3932 in `dashboard/dashboard.js`.
- Existing listener registration: `initializeEventListeners()` runs around line 6850 in `dashboard/dashboard.js`.
- Respect `prefers-reduced-motion` for instant scroll (`behavior: 'auto'`).

---

## 🛠️ Surgical Step-by-Step Instructions

### Step 1: Implement `navigateToBridgeService(serviceType)`
Add the navigation controller and cleanup timer tracking in `dashboard/dashboard.js`:

```javascript
// Global tracking for bridge highlight cleanup timers
let bridgeHighlightTimers = {
  hub: null,
  hud: null
};

/**
 * Deep-links from sidebar WebSocket status cards directly to the
 * corresponding hardware bridge row and action button in the Settings pane.
 * 
 * @param {'hub'|'hud'} serviceType - 'hub' for SQLite Data Hub, 'hud' for Video Detector HUD
 */
function navigateToBridgeService(serviceType) {
  // 1. Audio / Haptic feedback if available
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }

  // 2. Switch tab to Settings
  if (typeof switchTab === 'function') {
    switchTab('settings');
  }

  // 3. Determine target elements
  const isHub = (serviceType === 'hub');
  const targetRowId = isHub ? 'rowBridgeHub' : 'rowBridgeHud';
  const targetBtnId = isHub ? 'btnSidebarReconnectHub' : 'btnSidebarReconnect';

  const targetRow = document.getElementById(targetRowId);
  const targetBtn = document.getElementById(targetBtnId);

  // 4. Deferred scroll & focus to allow tab transition to render
  const prefersReduced = (typeof window !== 'undefined' && window.matchMedia) 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const scrollOpts = {
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'center'
  };

  setTimeout(() => {
    if (targetRow) {
      if (typeof targetRow.scrollIntoView === 'function') {
        targetRow.scrollIntoView(scrollOpts);
      }

      // Clear any pending timer for this service
      const timerKey = isHub ? 'hub' : 'hud';
      if (bridgeHighlightTimers[timerKey]) {
        clearTimeout(bridgeHighlightTimers[timerKey]);
      }

      // Restart highlight animations
      targetRow.classList.remove('service-row-highlight');
      void targetRow.offsetWidth; // Force CSS reflow
      targetRow.classList.add('service-row-highlight');

      if (targetBtn) {
        targetBtn.classList.remove('highlight-pulse');
        void targetBtn.offsetWidth;
        targetBtn.classList.add('highlight-pulse');
        if (typeof targetBtn.focus === 'function') {
          targetBtn.focus({ preventScroll: true });
        }
      }

      // Cleanup after 2000ms
      bridgeHighlightTimers[timerKey] = setTimeout(() => {
        if (targetRow) targetRow.classList.remove('service-row-highlight');
        if (targetBtn) targetBtn.classList.remove('highlight-pulse');
        bridgeHighlightTimers[timerKey] = null;
      }, 2000);
    }
  }, 60);
}
```

### Step 2: Wire Event Listeners in `dashboard/dashboard.js`
Inside the main event initialization block (e.g., around lines 6850-6865 where sidebar tab click listeners are attached):

```javascript
  // Sidebar WebSocket Status Cards — Deep-Link to Settings
  const sidebarDataHubCard = document.getElementById('sidebarDataHubCard');
  if (sidebarDataHubCard) {
    sidebarDataHubCard.addEventListener('click', () => {
      navigateToBridgeService('hub');
    });
    sidebarDataHubCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        navigateToBridgeService('hub');
      }
    });
  }

  const sidebarHudCard = document.getElementById('sidebarHudCard');
  if (sidebarHudCard) {
    sidebarHudCard.addEventListener('click', () => {
      navigateToBridgeService('hud');
    });
    sidebarHudCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        navigateToBridgeService('hud');
      }
    });
  }
```

### Step 3: Export `navigateToBridgeService` for Automated Testing
In the module export block at the bottom of `dashboard/dashboard.js` (around line 8600):
```javascript
  navigateToBridgeService,
```

---

## 🚦 Local Verification Gate
Execute:
1. Syntax validation:
   `node -c dashboard/dashboard.js`
2. UTF-8 BOM verification:
   Ensure file starts with `0xEF, 0xBB, 0xBF`.
Pass Criteria: `node -c dashboard/dashboard.js` exits with code 0 without any syntax errors.
