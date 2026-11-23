# System Design & Architecture Tokens: Manifest V3 Time Tracking Reconciliation

> **Task Container:** `temp_prompt/robust_time_tracking_reconciliation/`  
> **Document Type:** System Architecture & Design Tokens Specification  
> **Lead Department:** Dept 04 UI/UX & System Design (`departments_archive/04_ui_ux_design_system_dept.md`)  
> **Governing Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Scope & Design Philosophy

While this task primarily operates at the background engine and telemetry layer, strict system design principles govern:
1. **Timing & Cadence Tokens:** Predictable, collision-free intervals preventing event-loop congestion.
2. **State Machine Tokens:** Clear, unambiguous operational states for tracking lifecycle.
3. **Storage Identifiers:** Standardized keys with clean namespace isolation.
4. **UI Status & Telemetry Indicators:** Standardized color tokens and status chips for live tracking state (Popup & HUD).

---

## ⏱️ 2. Architectural Timing & Cadence Tokens

```javascript
export const TRACKING_TIMING_TOKENS = {
  // Content script keepalive heartbeat interval
  KEEPALIVE_HEARTBEAT_INTERVAL_MS: 15_000, // 15 seconds
  
  // Maximum bounded drift credited on single Service Worker wakeup
  MAX_RECONCILE_DRIFT_MS: 45_000,          // 45 seconds
  
  // OS Sleep / Hibernation threshold gap (gaps > 60s trigger sleep recovery)
  SLEEP_THRESHOLD_MS: 60_000,              // 60 seconds
  
  // Content script port reconnection backoff limits
  PORT_RECONNECT_INITIAL_DELAY_MS: 1_000,  // 1 second
  PORT_RECONNECT_MAX_DELAY_MS: 8_000,      // 8 seconds
  PORT_RECONNECT_BACKOFF_FACTOR: 2.0,
  
  // Periodic storage flush alarm period
  STORAGE_FLUSH_ALARM_PERIOD_MIN: 5,       // 5 minutes
  
  // Storage auto-save debounce delay
  STORAGE_SAVE_DEBOUNCE_MS: 3_000          // 3 seconds
};
```

---

## 🗄️ 3. Storage & Port Namespace Tokens

```javascript
export const TRACKING_IDENTIFIER_TOKENS = {
  // Storage keys
  STORAGE_KEY_ACTIVE_SESSION: 'sentinel_active_session',
  STORAGE_KEY_TRACKING_PAUSED: 'sentinel_tracking_paused',
  STORAGE_KEY_BLACKLIST: 'tracking_blacklist',
  STORAGE_KEY_ACTIVITY_DATA: 'activity_data',
  
  // Keepalive Port identifier
  PORT_NAME_KEEPALIVE: 'sentinel_tracking_keepalive',
  
  // Message IPC Types
  IPC_TYPE_HEARTBEAT: 'KEEPALIVE_HEARTBEAT',
  IPC_TYPE_DISCONNECT: 'KEEPALIVE_DISCONNECT',
  IPC_TYPE_SESSION_RECONCILED: 'TRACKING_SESSION_RECONCILED'
};
```

---

## 🚦 4. Finite State Machine Tokens

The active tab tracking lifecycle conforms to the following deterministic states:

| State Token | Visual Status Chip (Popup / HUD) | Description |
| :--- | :--- | :--- |
| `STATE_TRACKING_ACTIVE` | 🟢 Active Tracking (`#10B981`) | Tab is in foreground, window focused, user active, not blacklisted. Keepalive port connected. |
| `STATE_TRACKING_IDLE` | 🟡 User Idle (`#F59E0B`) | `chrome.idle` state is `'idle'` or `'locked'`. Counters frozen. |
| `STATE_TRACKING_PAUSED` | ⏸️ Tracking Paused (`#6366F1`) | User manually paused tracking via Popup or Dashboard toggle. |
| `STATE_TRACKING_BLACKLISTED` | 🛡️ Privacy Blacklisted (`#64748B`) | Host matches blacklist (`localhost`, intranet, etc.). Keepalive suppressed. |
| `STATE_TRACKING_BACKGROUND` | ⚪ Background Tab (`#334155`) | Tab is open but hidden (`visibilityState === 'hidden'`). No keepalive port. |

---

## 🎯 5. Telemetry & Data Hub Stream Contract

When streaming real-time activity deltas over WebSocket (port 65432) or internal IPC:

```json
{
  "type": "ACTIVITY_DELTA",
  "client_id": "sentinel_browser_chrome",
  "domain": "developer.mozilla.org",
  "seconds": 15,
  "tracking_type": "foreground",
  "is_reconciled": false,
  "timestamp": 1732400015000
}
```

If the seconds were recovered via wakeup reconciliation:
- `"is_reconciled": true`
- This allows the Video Detector HUD and analytics engine to log reconciliation events for diagnostic transparency.

---
