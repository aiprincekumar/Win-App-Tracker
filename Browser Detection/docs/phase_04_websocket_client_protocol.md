# Phase 04: Localhost WebSocket Client Protocol (`ws://127.0.0.1:65432`)

> **Phase ID:** `phase_04_websocket_client_protocol`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 06: Backend & API Engineering  
> **Assigned Role:** `network_protocol_engineer`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Establish a resilient, low-latency, zero-configuration WebSocket Client bridge inside `background.js` targeting the desktop Python host server:
`ws://127.0.0.1:65432`

This protocol enables real-time synchronization between the browser extension and `Video Detector HUD`, streaming live media state changes, active domains, and playback telemetry with sub-30ms latency.

---

## 2. Core Protocol Requirements

### 2.1 Connection Lifecycle & Auto-Reconnect Engine
- **Target Endpoint:** `ws://127.0.0.1:65432` (Loopback interface only, maximum security).
- **Exponential Backoff Reconnect:**
  If the Python HUD is not currently running, the extension must NOT flood the console or crash. It applies an exponential reconnect backoff:
  - Initial retry: 2s -> 4s -> 8s -> max 15s.
  - Reset to 2s upon successful handshake.
- **Heartbeat & Keep-Alive (`PING` / `PONG`):**
  Send a lightweight ping message every 10 seconds to maintain connection vibrancy and verify socket health.

### 2.2 Standardized JSON Message Envelopes

#### 1. Media Telemetry Dispatch (`BROWSER_MEDIA_TELEMETRY`)
Sent immediately when video/audio starts playing, pauses, buffers, changes volume, or alters resolution:
```json
{
  "type": "BROWSER_MEDIA_TELEMETRY",
  "client": "MediaSentinelExtension",
  "browser": "Chrome",
  "timestamp": 1730680000000,
  "payload": {
    "activeMediaTabsCount": 1,
    "primaryMedia": {
      "tabId": 1042,
      "domain": "youtube.com",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up",
      "mediaType": "video",
      "state": "playing",
      "isPlaying": true,
      "isMuted": false,
      "volume": 0.90,
      "playbackRate": 1.0,
      "resolution": "1920x1080",
      "resolutionLabel": "1080p FHD",
      "currentTime": 45.2,
      "duration": 213.0
    },
    "allActiveMedia": [
      {
        "tabId": 1042,
        "domain": "youtube.com",
        "title": "Rick Astley - Never Gonna Give You Up",
        "mediaType": "video",
        "state": "playing",
        "resolution": "1920x1080"
      }
    ]
  }
}
```

#### 2. Browser Activity Update (`BROWSER_ACTIVITY_UPDATE`)
Sent when active domain changes, user goes idle, or window focus transitions:
```json
{
  "type": "BROWSER_ACTIVITY_UPDATE",
  "timestamp": 1730680000000,
  "payload": {
    "activeDomain": "youtube.com",
    "isBrowserFocused": true,
    "isUserActive": true,
    "todayDomainSeconds": 3840,
    "todayTotalSeconds": 7200
  }
}
```

#### 3. Command Queries from Python Host
The Python HUD can query the browser at any time:
- Incoming: `{"cmd": "QUERY_MEDIA_STATE"}`
  - Response: Immediate snapshot of all active media elements across all tabs.
- Incoming: `{"cmd": "PING"}`
  - Response: `{"type": "PONG", "timestamp": ...}`

---

## 3. Acceptance Criteria & Test Gate

- [ ] WebSocket client automatically connects to `ws://127.0.0.1:65432` upon startup.
- [ ] If Python host is closed, gracefully backs off without crashing or logging unhandled rejections.
- [ ] Automatically reconnects within 2-4 seconds when Python host starts up.
- [ ] Correctly serializes and validates all outgoing message envelopes.
- [ ] Popup UI can query connection status (`connected` vs `disconnected`).
