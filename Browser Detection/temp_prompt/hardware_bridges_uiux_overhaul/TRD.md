# Technical Requirements Document (TRD): Local Services & Hardware Bridges UI/UX Overhaul

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Lead Departments:** Dept 02 Solution Architecture, Dept 05 Frontend Engineering  

---

## 🏗️ 1. Exact DOM Architecture & ID Registry

The redesigned `#cardHardwareBridges` component inside `dashboard/dashboard.html` must adhere to the following DOM structure:

```html
<div id="cardHardwareBridges" class="settings-card bento-card liquid-glass-card bento-span-6 settings-section-card" role="region" aria-labelledby="headingHardwareBridges">
  <div class="settings-card-header">
    <span class="settings-card-icon" aria-hidden="true">🔌</span>
    <div class="settings-card-title-group">
      <h3 id="headingHardwareBridges" class="settings-card-title">Local Services & Hardware Bridges</h3>
      <span id="subHardwareBridges" class="settings-card-sub">WebSocket daemons, SQLite storage engine, and peripheral telemetry</span>
    </div>
  </div>
  <div class="settings-card-body">
    <!-- Service 1: SQLite Data Hub Daemon -->
    <div class="bridge-service-row" id="rowBridgeHub">
      <div class="bridge-service-meta">
        <div class="bridge-service-name-wrap">
          <span class="bridge-service-icon" aria-hidden="true">💾</span>
          <span id="nameBridgeHub" class="bridge-service-name">SQLite Data Hub Daemon</span>
          <span id="portBridgeHub" class="bridge-port-badge">Port 65433 (WAL)</span>
          <div id="bridgeHubStatusBadge" class="bridge-status-pill offline" role="status" aria-live="polite">
            <span id="bridgeHubStatusDot" class="bridge-status-dot" aria-hidden="true"></span>
            <span id="bridgeHubStatusText" class="bridge-status-text">Offline</span>
          </div>
        </div>
        <span id="descBridgeHub" class="bridge-service-desc">Local high-concurrency event telemetry & persistent database store</span>
      </div>
      <div class="bridge-service-actions">
        <button id="btnSidebarReconnectHub" class="btn-hud-reconnect btn-bridge-action" type="button" title="Reconnect to SQLite Data Hub" aria-label="Reconnect to SQLite Data Hub">
          <span class="btn-bridge-icon" aria-hidden="true">⚡</span>
          <span class="btn-bridge-label">Reconnect Hub</span>
        </button>
      </div>
    </div>

    <!-- Service 2: Video Detector HUD Bridge -->
    <div class="bridge-service-row" id="rowBridgeHud">
      <div class="bridge-service-meta">
        <div class="bridge-service-name-wrap">
          <span class="bridge-service-icon" aria-hidden="true">🖥️</span>
          <span id="nameBridgeHud" class="bridge-service-name">Video Detector HUD Bridge</span>
          <span id="portBridgeHud" class="bridge-port-badge">Port 65432</span>
          <div id="bridgeHudStatusBadge" class="bridge-status-pill offline" role="status" aria-live="polite">
            <span id="bridgeHudStatusDot" class="bridge-status-dot" aria-hidden="true"></span>
            <span id="bridgeHudStatusText" class="bridge-status-text">Offline</span>
          </div>
        </div>
        <span id="descBridgeHud" class="bridge-service-desc">Real-time overlay bridge for Windows desktop video sentinel</span>
      </div>
      <div class="bridge-service-actions">
        <button id="btnSidebarReconnect" class="btn-hud-reconnect btn-bridge-action" type="button" title="Reconnect to Video Detector HUD" aria-label="Reconnect to Video Detector HUD">
          <span class="btn-bridge-icon" aria-hidden="true">⚡</span>
          <span class="btn-bridge-label">Reconnect HUD</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

### Canonical DOM ID Registry
1. `#cardHardwareBridges`: Container element.
2. `#headingHardwareBridges`: Card title.
3. `#subHardwareBridges`: Card subtitle.
4. `#nameBridgeHub`, `#portBridgeHub`, `#descBridgeHub`: SQLite service details.
5. `#bridgeHubStatusBadge`, `#bridgeHubStatusDot`, `#bridgeHubStatusText`: SQLite real-time status pill.
6. `#btnSidebarReconnectHub`: Reconnect button for SQLite hub (backward-compatible ID).
7. `#nameBridgeHud`, `#portBridgeHud`, `#descBridgeHud`: HUD bridge service details.
8. `#bridgeHudStatusBadge`, `#bridgeHudStatusDot`, `#bridgeHudStatusText`: HUD bridge real-time status pill.
9. `#btnSidebarReconnect`: Reconnect button for HUD bridge (backward-compatible ID).

---

## ⚙️ 2. Finite State Machine Contracts

Each bridge service operates under a 3-state finite state machine:

| State | Status Pill Class | Dot Animation | Text (EN / HI) | Button Label (EN / HI) | Haptic Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`online`** | `.bridge-status-pill.online` | Green emerald pulse (0.6s) | `Connected` / `कनेक्टेड` | `✅ Connected` / `✅ कनेक्टेड` | `playSuccessChime()` |
| **`starting`** | `.bridge-status-pill.starting` | Amber gold pulse (1.0s) | `Connecting...` / `कनेक्ट हो रहा है...` | `⏳ Connecting...` / `⏳ कनेक्ट हो रहा है...` | `playClick()` |
| **`offline`** | `.bridge-status-pill.offline` | Muted slate/red static | `Offline` / `ऑफ़लाइन` | `⚡ Reconnect Hub` / `⚡ पुनः कनेक्ट करें` | `playWarnTone()` |

---

## 🔒 3. W3C Trusted Types & DOM Manipulation Standard

- Strictly prohibited: `.innerHTML`, `.outerHTML`, `document.write()`, `insertAdjacentHTML()`.
- Allowed manipulation methods:
  - Text: `element.textContent = newText;`
  - Classes: `element.className = 'bridge-status-pill ' + stateClass;` or `element.classList.add/remove(...)`
  - Attributes: `element.setAttribute('aria-label', localizedLabel);`
  - Children: `element.appendChild(childNode);`

---

## 🌐 4. Bilingual i18n Dictionary Schema

The following symmetrical keys must be added to `DASHBOARD_UIUX_I18N` in `dashboard/dashboard.js`:

```javascript
// English (en)
hardware_bridges_title: 'Local Services & Hardware Bridges',
hardware_bridges_sub: 'WebSocket daemons, SQLite storage engine, and peripheral telemetry',
bridge_hub_name: 'SQLite Data Hub Daemon',
bridge_hub_port: 'Port 65433 (WAL)',
bridge_hub_desc: 'Local high-concurrency event telemetry & persistent database store',
bridge_hud_name: 'Video Detector HUD Bridge',
bridge_hud_port: 'Port 65432',
bridge_hud_desc: 'Real-time overlay bridge for Windows desktop video sentinel',
btn_reconnect_hub: '⚡ Reconnect Hub',
btn_reconnect_hud: '⚡ Reconnect HUD',
btn_hub_connected: '✅ Connected',
btn_hud_connected: '✅ Connected',
btn_connecting: '⏳ Connecting...',
bridge_status_online: 'Connected',
bridge_status_starting: 'Connecting...',
bridge_status_offline: 'Offline',

// Hindi (hi)
hardware_bridges_title: 'स्थानीय सेवाएँ और हार्डवेयर सेतु',
hardware_bridges_sub: 'वेबसॉकेट डेमॉन, SQLite स्टोरेज इंजन, और परिधीय टेलीमेट्री',
bridge_hub_name: 'SQLite डेटा हब डेमॉन',
bridge_hub_port: 'पोर्ट 65433 (WAL)',
bridge_hub_desc: 'स्थानीय उच्च-समवर्ती घटना टेलीमेट्री और स्थायी डेटाबेस संग्रह',
bridge_hud_name: 'वीडियो डिटेक्टर HUD ब्रिज',
bridge_hud_port: 'पोर्ट 65432',
bridge_hud_desc: 'विंडोज डेस्कटॉप वीडियो प्रहरी के लिए रीयल-टाइम ओवरले सेतु',
btn_reconnect_hub: '⚡ हब पुनः कनेक्ट करें',
btn_reconnect_hud: '⚡ HUD पुनः कनेक्ट करें',
btn_hub_connected: '✅ कनेक्टेड',
btn_hud_connected: '✅ कनेक्टेड',
btn_connecting: '⏳ कनेक्ट हो रहा है...',
bridge_status_online: 'कनेक्टेड',
bridge_status_starting: 'कनेक्ट हो रहा है...',
bridge_status_offline: 'ऑफ़लाइन',
```
