# Technical Requirements Document (TRD): WebSocket Status Interactivity & Navigation

> **Task Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Lead Departments:** Dept 05 Frontend Engineering, Dept 08 QA & Testing  
> **Target Files:**
> - `dashboard/dashboard.html`
> - `dashboard/dashboard.css`
> - `dashboard/styles/layout/header_sidebar.css`
> - `dashboard/styles/settings.css`
> - `dashboard/dashboard.js`
> - `tests/test_sidebar_websocket_interactivity.js`

---

## 🏛️ 1. Technical Architecture & File Modifications

### 1.1 `dashboard/dashboard.html` Markup Specification
Target section: Lines 89–112 (Sidebar Compact Telemetry HUD Cluster).

```html
<!-- Canonical DOM Markup Blueprint -->
<!-- Sidebar Footer Data Hub Status Widget (Interactive Telemetry) -->
<div id="sidebarDataHubCard"
     class="sidebar-hud-card interactive-hud-card"
     role="button"
     tabindex="0"
     title="SQLite Data Hub (ws://127.0.0.1:65433 WAL) - Click to manage or reconnect in Settings"
     aria-label="SQLite Data Hub Status Indicator. Click or press Enter to configure in Settings">
  <div class="hud-card-header">
    <span class="hud-card-title">SQLite Data Hub</span>
    <span id="dataHubSidebarDot" class="hud-dot offline" aria-label="SQLite Data Hub Status"></span>
  </div>
  <div class="hud-card-body">
    <span class="hud-address">ws://127.0.0.1:65433 (WAL)</span>
    <span id="dataHubSidebarLabel" class="hud-status-text hud-status-hidden" aria-hidden="true">Hub Offline</span>
  </div>
</div>

<!-- Sidebar Footer HUD Status Widget (Interactive Telemetry) -->
<div id="sidebarHudCard"
     class="sidebar-hud-card interactive-hud-card"
     role="button"
     tabindex="0"
     title="Video Detector HUD (ws://127.0.0.1:65432) - Click to manage or reconnect in Settings"
     aria-label="Video Detector HUD Status Indicator. Click or press Enter to configure in Settings">
  <div class="hud-card-header">
    <span class="hud-card-title">Video Detector HUD</span>
    <span id="hudStatusDot" class="hud-dot offline" aria-label="Video Detector HUD Status"></span>
  </div>
  <div class="hud-card-body">
    <span class="hud-address">ws://127.0.0.1:65432</span>
    <span id="hudStatusLabel" class="hud-status-text hud-status-hidden" aria-hidden="true">HUD Offline</span>
  </div>
</div>
```

---

### 1.2 CSS Styling & Keyframe Animations Specification

#### A. Sidebar Card Micro-Interactions (`header_sidebar.css` & `dashboard.css`)
```css
/* Interactive Sidebar HUD Card */
.sidebar-hud-card[role="button"],
.sidebar-hud-card.interactive-hud-card {
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.sidebar-hud-card[role="button"]:hover,
.sidebar-hud-card.interactive-hud-card:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.sidebar-hud-card[role="button"]:active,
.sidebar-hud-card.interactive-hud-card:active {
  transform: scale(0.98);
}

.sidebar-hud-card[role="button"]:focus-visible,
.sidebar-hud-card.interactive-hud-card:focus-visible {
  outline: 2px solid var(--accent-primary, #6366f1);
  outline-offset: 2px;
}
```

#### B. Highlight Beacon & Pulse Keyframe (`settings.css` & `dashboard.css`)
```css
/* Service Row Transient Pulse Highlight */
@keyframes serviceRowHighlightGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--border-dim);
  }
  25% {
    box-shadow: 0 0 16px 2px rgba(99, 102, 241, 0.45);
    border-color: rgba(99, 102, 241, 0.85);
    background-color: rgba(99, 102, 241, 0.08);
  }
  60% {
    box-shadow: 0 0 12px 1px rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.6);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--border-dim);
  }
}

.bridge-service-row.service-row-highlight {
  animation: serviceRowHighlightGlow 1.8s ease-out forwards;
}

/* Reconnect Button Transient Pulse Keyframe */
@keyframes reconnectBtnPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(99, 102, 241, 0);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 0 14px 2px rgba(99, 102, 241, 0.6);
  }
}

.btn-hud-reconnect.highlight-pulse {
  animation: reconnectBtnPulse 0.9s ease-in-out 2;
}
```

---

### 1.3 JavaScript Navigation Logic (`dashboard/dashboard.js`)

```javascript
/**
 * Deep-link navigates from sidebar HUD cards to the Settings panel,
 * centering and highlighting the corresponding service reconnect row.
 * 
 * @param {'hub' | 'hud'} serviceKey
 */
function navigateToBridgeService(serviceKey) {
  // 1. Play haptic click if available
  const hapticEngine = (typeof window !== 'undefined' && window.sentinelHaptics) ||
                       (typeof globalThis !== 'undefined' && globalThis.sentinelHaptics) ||
                       (typeof sentinelHaptics !== 'undefined' ? sentinelHaptics : null);
  if (hapticEngine && typeof hapticEngine.playClick === 'function') {
    hapticEngine.playClick();
  }

  // 2. Switch to Settings tab
  if (typeof switchTab === 'function') {
    switchTab('settings');
  }

  // 3. Locate target DOM elements
  const isHub = (serviceKey === 'hub');
  const rowId = isHub ? 'rowBridgeHub' : 'rowBridgeHud';
  const btnId = isHub ? 'btnSidebarReconnectHub' : 'btnSidebarReconnect';

  const row = document.getElementById(rowId);
  const btn = document.getElementById(btnId);

  // 4. Smooth scroll and focus
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('service-row-highlight');
    setTimeout(() => {
      row.classList.remove('service-row-highlight');
    }, 1800);
  }

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

// In setupEventListeners():
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

---

## 🔒 2. Telemetry Invariance Contract

Under no circumstances may `navigateToBridgeService` modify or overwrite:
- `updateHUDStatus(status)` (lines 3728–3800)
- `updateDataHubStatus(isConnected, registeredBrowsers)` (lines 3802–3860)
- Existing event listeners on `#btnSidebarReconnectHub` and `#btnSidebarReconnect`
- Topbar badge handlers for `#dataHubBadge`
