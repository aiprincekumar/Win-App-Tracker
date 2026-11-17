# Technical Requirements Document (TRD) — Interactive WebSocket Connection Status Cards

> **Task ID:** `TASK-WS-CARD-NAV-001`  
> **Feature:** Interactive WebSocket Connection Status Cards & Deep-Link Navigation to Settings  
> **Target Module:** Web Activity & Media Sentinel (MV3 Extension Dashboard)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** Architecture Certified (Level 3C Specialist)  

---

## 🏛️ 1. High-Level Design (HLD)

The dashboard architecture consists of a sidebar navigation column (`<aside class="sidebar">`) containing tabs and status indicators, alongside a main stage (`<main class="main-stage">`) displaying tab panes (`#paneTracking`, `#paneMedia`, `#paneWellbeing`, `#paneSettings`).

```
+-----------------------------------------------------------------------------------+
|  SIDEBAR                                 |  MAIN STAGE (Settings Tab Pane)        |
|                                          |                                        |
|  [⏱️ Time Tracking]                      |  #paneSettings                         |
|  [🎬 Media Analytics]                    |    #tabContentSettings (Bento Grid)    |
|  [🧘 Focus & Wellbeing]                  |      ...                               |
|  [⚙️ Settings & Data]                     |      #cardHardwareBridges              |
|                                          |        #rowBridgeHub                   |
|  [Sidebar HUD Group]                     |          [⚡ Reconnect Hub]             |
|    #wellbeingLiveMicroWidget             |                                        |
|    #sidebarDataHubCard  --- (Deep Link) ---> #rowBridgeHub                         |
|    #sidebarHudCard      --- (Deep Link) ---> #rowBridgeHud                         |
|                                          |          [⚡ Reconnect HUD]             |
+-----------------------------------------------------------------------------------+
```

When an event triggers on `#sidebarDataHubCard` or `#sidebarHudCard`, the execution pipeline executes:
1. **Event Capture & Validation:** Intercept `click` or `keydown` (`Enter`, `' '`).
2. **Tab Transition:** Call `switchTab('settings')`, making `#paneSettings` visible and updating sidebar tab active classes.
3. **Viewport Alignment:** After a minimal delay (ensuring DOM visibility), invoke `scrollIntoView({ behavior: 'smooth', block: 'center' })` on the target row (`#rowBridgeHub` or `#rowBridgeHud`).
4. **Focus Management:** Invoke `.focus({ preventScroll: true })` on the target action button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`).
5. **Visual Feedback:** Apply transient CSS animation classes (`.service-row-highlight` and `.highlight-pulse`) and register a 2000ms cleanup timer.

---

## ⚙️ 2. Low-Level Design (LLD)

### 2.1 Target DOM Identifiers & Selectors

| Role / Function | DOM Identifier | CSS Class | Target Element |
| :--- | :--- | :--- | :--- |
| **Data Hub Sidebar Card** | `sidebarDataHubCard` | `.sidebar-hud-card.interactive-hud-card` | Container in sidebar |
| **HUD Sidebar Card** | `sidebarHudCard` | `.sidebar-hud-card.interactive-hud-card` | Container in sidebar |
| **Hardware Bridges Card** | `cardHardwareBridges` | `.settings-card.settings-section-card` | Bento card in `#paneSettings` |
| **Data Hub Service Row** | `rowBridgeHub` | `.bridge-service-row` | Row in `#cardHardwareBridges` |
| **HUD Service Row** | `rowBridgeHud` | `.bridge-service-row` | Row in `#cardHardwareBridges` |
| **Data Hub Reconnect Button** | `btnSidebarReconnectHub` | `.btn-hud-reconnect.btn-bridge-action` | Action button in `#rowBridgeHub` |
| **HUD Reconnect Button** | `btnSidebarReconnect` | `.btn-hud-reconnect.btn-bridge-action` | Action button in `#rowBridgeHud` |

### 2.2 Deep-Link Controller Function Specification

```javascript
/**
 * Global timer references for transient highlight cleanup.
 */
let highlightCleanupTimers = {
  hub: null,
  hud: null
};

/**
 * Navigates from a sidebar WebSocket status card deep into the Settings tab
 * and aligns viewport/focus on the corresponding service bridge control.
 * 
 * @param {'hub'|'hud'} serviceType - Target service identifier ('hub' for SQLite Data Hub, 'hud' for Video Detector HUD)
 */
function navigateToBridgeService(serviceType) {
  // 1. Play haptic feedback if available
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }

  // 2. Switch active tab to Settings
  if (typeof switchTab === 'function') {
    switchTab('settings');
  }

  // 3. Resolve DOM target elements
  const isHub = (serviceType === 'hub');
  const targetRowId = isHub ? 'rowBridgeHub' : 'rowBridgeHud';
  const targetBtnId = isHub ? 'btnSidebarReconnectHub' : 'btnSidebarReconnect';

  const targetRow = document.getElementById(targetRowId);
  const targetBtn = document.getElementById(targetBtnId);

  // 4. Deferred viewport scrolling & focus handoff (ensures pane is visible)
  const prefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia) 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const scrollOptions = {
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center'
  };

  setTimeout(() => {
    if (targetRow) {
      targetRow.scrollIntoView(scrollOptions);

      // Clean up previous animation timer if user clicks repeatedly
      const timerKey = isHub ? 'hub' : 'hud';
      if (highlightCleanupTimers[timerKey]) {
        clearTimeout(highlightCleanupTimers[timerKey]);
      }

      // Add transient highlight glow
      targetRow.classList.remove('service-row-highlight');
      // Force reflow for CSS animation restart
      void targetRow.offsetWidth;
      targetRow.classList.add('service-row-highlight');

      if (targetBtn) {
        targetBtn.classList.remove('highlight-pulse');
        void targetBtn.offsetWidth;
        targetBtn.classList.add('highlight-pulse');
        targetBtn.focus({ preventScroll: true });
      }

      // 5. Automatic cleanup after animation completion (2000ms)
      highlightCleanupTimers[timerKey] = setTimeout(() => {
        if (targetRow) targetRow.classList.remove('service-row-highlight');
        if (targetBtn) targetBtn.classList.remove('highlight-pulse');
        highlightCleanupTimers[timerKey] = null;
      }, 2000);
    }
  }, 60);
}
```

### 2.3 Event Listener Binding Architecture

In `dashboard/dashboard.js` within `initializeEventListeners()`:
```javascript
  // Sidebar Interactive Telemetry Cards (WebSocket Deep-Link Navigation)
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

---

## 🔒 3. Error Handling & Architectural Guardrails

1. **Missing Element Guards:** All DOM operations must guard against `null` returns using standard defensive checks (`if (targetRow) { ... }`).
2. **Double Click / Rapid Retrigger Resilience:** If a user clicks between the cards in rapid succession, `clearTimeout(highlightCleanupTimers[timerKey])` prevents premature removal of the animation class on the newly targeted element.
3. **W3C Trusted Types Compliance:** Only `classList.add()`, `classList.remove()`, `.focus()`, and `.scrollIntoView()` are invoked. Zero string-to-DOM conversions or `innerHTML` assignments.
4. **Encoding Standard:** All files must maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding standard per Universal Rules 5 & 8.
