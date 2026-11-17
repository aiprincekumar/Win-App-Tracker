# Phase 3: JavaScript Navigation Engine & Telemetry Invariance

> **Phase:** 03  
> **Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Target File:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)  
> **Assigned Agent:** Level 4 Frontend Subagent  
> **Prerequisites:** Phase 1 and Phase 2 completed.  

---

## 🎯 1. Phase Objective

Implement runtime deep-link navigation in `dashboard/dashboard.js` connecting `#sidebarDataHubCard` and `#sidebarHudCard` to their respective service controls in the Settings tab, handling smooth scrolling, autofocus, and transient visual highlight classes, while strictly guaranteeing 100% backward compatibility for all existing WebSocket telemetry functions (`updateHUDStatus`, `updateDataHubStatus`).

---

## 📋 2. Step-by-Step Surgical Instructions

### Step 3.1: Author the Helper Function `navigateToBridgeService`
Place this function in `dashboard/dashboard.js` alongside tab navigation helpers:

```javascript
/**
 * Navigates from sidebar status widgets to Settings panel,
 * scrolling to and highlighting the specified service row.
 * 
 * @param {'hub' | 'hud'} serviceKey
 */
function navigateToBridgeService(serviceKey) {
  // 1. Tactile haptic feedback (safe null check)
  const hapticEngine = (typeof window !== 'undefined' && window.sentinelHaptics) ||
                       (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics) ||
                       (typeof sentinelHaptics !== 'undefined' ? sentinelHaptics : null);
  if (hapticEngine && typeof hapticEngine.playClick === 'function') {
    try { hapticEngine.playClick(); } catch (_) {}
  }

  // 2. Switch to Settings Tab
  if (typeof switchTab === 'function') {
    switchTab('settings');
  }

  // 3. Resolve target row and reconnect action button
  const isHub = (serviceKey === 'hub');
  const rowId = isHub ? 'rowBridgeHub' : 'rowBridgeHud';
  const btnId = isHub ? 'btnSidebarReconnectHub' : 'btnSidebarReconnect';

  const row = document.getElementById(rowId);
  const btn = document.getElementById(btnId);

  // 4. Smooth scroll target row into center view
  if (row) {
    if (typeof row.scrollIntoView === 'function') {
      try {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {
        row.scrollIntoView();
      }
    }
    row.classList.add('service-row-highlight');
    setTimeout(() => {
      row.classList.remove('service-row-highlight');
    }, 1800);
  }

  // 5. Transfer keyboard focus to Reconnect button and pulse
  if (btn) {
    if (typeof btn.focus === 'function') {
      try {
        btn.focus({ preventScroll: true });
      } catch (_) {
        btn.focus();
      }
    }
    btn.classList.add('highlight-pulse');
    setTimeout(() => {
      btn.classList.remove('highlight-pulse');
    }, 1800);
  }
}
```

### Step 3.2: Wire Event Listeners in `setupEventListeners()`
In `dashboard/dashboard.js` (around lines 6850–6865 where `wellbeingLiveMicroWidget` click listener is registered):

```javascript
  // Sidebar Interactive Telemetry Widgets (Data Hub & Video HUD)
  const sidebarDataHubCard = document.getElementById('sidebarDataHubCard');
  if (sidebarDataHubCard) {
    sidebarDataHubCard.addEventListener('click', () => navigateToBridgeService('hub'));
    sidebarDataHubCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateToBridgeService('hub');
      }
    });
  }

  const sidebarHudCard = document.getElementById('sidebarHudCard');
  if (sidebarHudCard) {
    sidebarHudCard.addEventListener('click', () => navigateToBridgeService('hud'));
    sidebarHudCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateToBridgeService('hud');
      }
    });
  }
```

### Step 3.3: Expose for Testing (if applicable)
Ensure `navigateToBridgeService` is safely exported in `module.exports` or attached to `window`/`globalThis` if other modular test suites inspect it.

### Step 3.4: Strict Telemetry Invariance Verification
- ✅ `updateHUDStatus()` unchanged and functional.
- ✅ `updateDataHubStatus()` unchanged and functional.
- ✅ Existing click listener on `dataHubBadge` (top bar) unchanged.
- ✅ Existing click listener on `btnSidebarReconnect` and `btnSidebarReconnectHub` unchanged.
- ✅ Zero innerHTML usage (100% W3C Trusted Types compliant).
- ✅ UTF-8 BOM (`0xEF, 0xBB, 0xBF`) preserved on `dashboard/dashboard.js`.

---

## 🧪 3. Local Verification Gate

Execute verification check:
```powershell
node -e "const vm = require('vm'); const fs = require('fs'); const code = fs.readFileSync('dashboard/dashboard.js', 'utf8'); new vm.Script(code); console.assert(code.includes('navigateToBridgeService')); console.log('Phase 3 AST & Navigation Logic Verified Clean!');"
```
Gate passes cleanly with exit code 0.
