# Phase 06: Python Host WebSocket Server (`modules/browser_ws_server.py`)

> **Phase ID:** `phase_06_python_host_integration`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 06: Backend & API Engineering & Department 02: Systems Engineering  
> **Assigned Role:** `python_backend_engineer`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Build `modules/browser_ws_server.py`, a pure Python standard-library implementation of the RFC 6455 WebSocket Server protocol. It binds to `127.0.0.1:65432`, accepts connections from the browser extension, parses binary and text frames (with unmasking per RFC 6455 Section 5.3), caches real-time browser media state in a thread-safe singleton, and exposes clean getter functions for `Video Detector HUD` (`modules/evaluator.py`).

---

## 2. Technical Architecture & Invariants

### 2.1 Zero External Dependencies
- Must strictly use Python built-in standard library:
  - `socket`, `threading`, `hashlib`, `base64`, `struct`, `json`, `time`, `typing`.
- Zero requirement for `pip install websockets` or `pip install twisted`. This ensures 100% out-of-the-box operation on any Windows machine running `Run_Video_Detector_HUD.bat`.

### 2.2 RFC 6455 Handshake & Framing Engine
1. **HTTP Upgrade Handshake:**
   - Detects `GET / HTTP/1.1` with `Upgrade: websocket` and `Connection: Upgrade`.
   - Extracts `Sec-WebSocket-Key`.
   - Appends standard GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`.
   - Computes SHA-1 hash, encodes to Base64, and returns `HTTP/1.1 101 Switching Protocols` with `Sec-WebSocket-Accept`.
2. **Frame Parsing & Unmasking:**
   - Decodes Opcode (0x1 = Text, 0x8 = Close, 0x9 = Ping, 0xA = Pong).
   - Extracts 4-byte masking key (clients MUST mask all frames per RFC 6455).
   - Unmasks payload using XOR byte operation: `payload[i] ^ mask[i % 4]`.
   - Decodes UTF-8 JSON payload.
3. **Frame Outgoing Serialization:**
   - Encodes text response into RFC 6455 server-to-client frame (unmasked per specification).

### 2.3 Thread-Safe State Cache (`BrowserMediaStateCache`)
- Thread-safe class holding the latest telemetry received from any connected browser:
  - `has_active_video: bool`
  - `has_active_audio: bool`
  - `active_media_tabs: int`
  - `primary_domain: str`
  - `primary_title: str`
  - `primary_resolution: str`
  - `primary_volume: float`
  - `is_muted: bool`
  - `playback_state: str` ('playing', 'paused', 'idle')
  - `last_heartbeat_timestamp: float`
- Auto-invalidation: If no heartbeat or update arrives for > 15 seconds, marks state as `stale`/`disconnected`.

### 2.4 Evaluator Integration Hook
Exposes simple, bullet-proof queries for `modules/evaluator.py`:
```python
from modules.browser_ws_server import get_cached_browser_media_state

# In evaluator loop:
browser_state = get_cached_browser_media_state()
if browser_state.get("is_playing") and not browser_state.get("is_muted"):
    # Video is actively running in Chrome/Edge!
    # Update HUD state and prevent system sleep!
```

---

## 3. Acceptance Criteria & Test Gate

- [ ] Python WebSocket server starts cleanly on `127.0.0.1:65432` in a background daemon thread.
- [ ] Handles client connections, disconnections, and abrupt drops without unhandled exceptions.
- [ ] Correctly computes WebSocket handshake accept hash.
- [ ] Unmasks client frames and accurately deserializes JSON telemetry.
- [ ] Standalone test runner (`python -m modules.browser_ws_server --test`) confirms full loopback functionality.
