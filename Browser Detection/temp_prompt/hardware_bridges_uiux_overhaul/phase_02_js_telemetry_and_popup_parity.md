# Phase 2 Execution Prompt: JavaScript Telemetry State Machine, Reconnect Logic & Popup Parity

> **Phase:** 2 of 3  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Departments:** Dept 05 Frontend Engineering, Dept 06 Backend & Real-time Integration  
> **Authorization State:** REQUIRES_AUTH_MGR_TOKEN  

---

## 🎯 Phase Objective
Wire the real-time telemetry state machine in `dashboard/dashboard.js` to update inline status badges (`#bridgeHubStatusBadge` and `#bridgeHudStatusBadge`) and button states within `#cardHardwareBridges` during service state transitions. Integrate tactile procedural audio feedback via `SentinelHapticAudioEngine`, establish symmetrical bilingual i18n dictionary entries for English and Hindi, and verify visual/state parity with popup header badges in `src/popup/components/header_badges.js` and `popup/popup.html`.

---

## 📂 File Anchors & Prerequisites
- **Target Files:**
  - `dashboard/dashboard.js` (Functions: `updateHUDStatus`, `triggerDataHubConnectAndLaunch`, `DASHBOARD_UIUX_I18N`)
  - `src/popup/components/header_badges.js`
  - `popup/popup.html`
- **Dependencies:**
  - Phase 1 markup and CSS styles must be in place.
  - W3C Trusted Types: zero `.innerHTML` assignments.

---

## 🛠️ Step-by-Step Instructions

### Step 1: Update `updateHUDStatus(status)` in `dashboard/dashboard.js`
Extend `updateHUDStatus(status)` to synchronize `#bridgeHudStatusBadge`, `#bridgeHudStatusDot`, and `#bridgeHudStatusText`:
```javascript
// Synchronize inline card badge
const bridgeHudBadge = document.getElementById('bridgeHudStatusBadge');
const bridgeHudDot = document.getElementById('bridgeHudStatusDot');
const bridgeHudText = document.getElementById('bridgeHudStatusText');

if (status === true || status === 'online') {
  if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill online';
  if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_online') || 'Connected';
  if (window.SentinelHapticAudioEngine) SentinelHapticAudioEngine.playSuccessChime();
} else if (status === 'starting') {
  if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill starting';
  if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_starting') || 'Connecting...';
} else {
  if (bridgeHudBadge) bridgeHudBadge.className = 'bridge-status-pill offline';
  if (bridgeHudText) bridgeHudText.textContent = t('bridge_status_offline') || 'Offline';
}
```

### Step 2: Update SQLite Hub Telemetry & Reconnect in `dashboard/dashboard.js`
In `triggerDataHubConnectAndLaunch()` and status callback handlers:
1. Update `#bridgeHubStatusBadge`, `#bridgeHubStatusDot`, and `#bridgeHubStatusText` to `.starting`, `.online`, or `.offline`.
2. Connect `SentinelHapticAudioEngine.playClick()` on reconnect button click.
3. Connect `SentinelHapticAudioEngine.playSuccessChime()` when SQLite Data Hub health-check reports online.

### Step 3: Populate Symmetrical Bilingual Dictionary (`DASHBOARD_UIUX_I18N`)
Add the following keys to both `en` and `hi` sections in `DASHBOARD_UIUX_I18N`:
- `hardware_bridges_title`
- `hardware_bridges_sub`
- `bridge_hub_name`
- `bridge_hub_port`
- `bridge_hub_desc`
- `bridge_hud_name`
- `bridge_hud_port`
- `bridge_hud_desc`
- `btn_reconnect_hub`
- `btn_reconnect_hud`
- `bridge_status_online`
- `bridge_status_starting`
- `bridge_status_offline`

### Step 4: Verify Parity with Popup Header Badges
Inspect `src/popup/components/header_badges.js` and `popup/popup.html`:
- Ensure status states match: `.ws-badge.connected` aligns with emerald glow, `.ws-badge.starting` aligns with amber pulse, `.ws-badge.disconnected` aligns with slate/red.
- Verify ARIA labels and tooltips convey identical meaning.

---

## 🧪 Local Verification Gate
- [ ] `node -c dashboard/dashboard.js` AST parses with 0 errors.
- [ ] Mock DOM test verifies state transitions update inline status pill classes and text.
- [ ] 100% dictionary symmetry between English and Hindi keys in `DASHBOARD_UIUX_I18N`.
- [ ] UTF-8 BOM byte sequence certified on all edited files.
