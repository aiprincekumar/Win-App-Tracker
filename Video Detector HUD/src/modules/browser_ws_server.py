# -*- coding: utf-8 -*-
"""
modules/browser_ws_server.py: Pure Python Zero-Dependency RFC 6455 WebSocket Server Bridge.
Department 06: Backend & API Engineering & Department 02: Systems Engineering.

Features:
  - 100% Python Standard Library (socket, threading, hashlib, base64, struct, json, time).
  - RFC 6455 Compliant WebSocket Handshake and Frame Encoder/Decoder (Unmasking, Ping/Pong, Close).
  - High-performance, thread-safe media telemetry state cache (BrowserMediaStateCache).
  - Direct integration hook for Video Detector HUD (modules/evaluator.py).
  - Automatic stale-detection and connection auto-recovery.
  - Built-in standalone loopback test runner (--test).

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Video Detector HUD
"""

import sys
import os
import time
import json
import base64
import struct
import socket
import hashlib
import threading
from typing import Dict, List, Optional, Any, Set, Tuple

DEFAULT_WS_HOST = "127.0.0.1"
DEFAULT_WS_PORT = 65432
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# RFC 6455 Opcodes
OPCODE_CONTINUATION = 0x0
OPCODE_TEXT         = 0x1
OPCODE_BINARY       = 0x2
OPCODE_CLOSE        = 0x8
OPCODE_PING         = 0x9
OPCODE_PONG         = 0xA


class BrowserMediaStateCache:
    """
    Thread-safe memory ledger caching real-time media telemetry and activity updates
    transmitted by the 'Web Activity & Media Sentinel' browser extension.
    """

    def __init__(self, stale_timeout: float = 15.0) -> None:
        self._lock = threading.RLock()
        self._stale_timeout = stale_timeout
        self.reset()

    def reset(self) -> None:
        """Resets the state cache to default idle values."""
        with self._lock:
            self.is_connected = False
            self.client_name = "MediaSentinel"
            self.client_version = "1.0.0"
            self.browser_type = "Browser"
            self.connected_clients_count = 0
            self.last_heartbeat_timestamp = 0.0
            self.last_telemetry_timestamp = 0.0

            # Media Telemetry
            self.has_active_video = False
            self.has_active_audio = False
            self.active_media_tabs = 0
            self.primary_domain = ""
            self.primary_title = ""
            self.primary_resolution = ""
            self.primary_volume = 1.0
            self.primary_volume_percent = 100
            self.is_muted = False
            self.playback_state = "idle"  # 'playing', 'paused', 'buffering', 'idle'
            self.playback_rate = 1.0
            self.current_time = 0.0
            self.duration = 0.0
            self.progress_percent = 0.0
            self.primary_media: Optional[Dict[str, Any]] = None
            self.all_active_media: List[Dict[str, Any]] = []

            # Activity Tracking
            self.active_domain = ""
            self.is_browser_focused = False
            self.is_user_active = False
            self.today_domain_seconds = 0
            self.today_total_seconds = 0

    def on_client_registered(self, client_info: Dict[str, Any]) -> None:
        with self._lock:
            self.is_connected = True
            self.client_name = str(client_info.get("client", "MediaSentinel"))
            self.client_version = str(client_info.get("version", "1.0.0"))
            self.browser_type = str(client_info.get("browser", "Chrome"))
            self.last_heartbeat_timestamp = time.time()

    def on_media_telemetry(self, data: Dict[str, Any]) -> None:
        """Ingests BROWSER_MEDIA_TELEMETRY payload sent by the extension."""
        with self._lock:
            now = time.time()
            self.is_connected = True
            self.last_heartbeat_timestamp = now
            self.last_telemetry_timestamp = now

            payload = data.get("payload") or {}
            self.active_media_tabs = int(payload.get("activeMediaTabsCount", 0))
            self.has_active_video = bool(payload.get("hasPlayingVideo", False))
            self.has_active_audio = bool(payload.get("hasPlayingAudio", False))
            self.all_active_media = list(payload.get("allActiveMedia", []))

            pm = payload.get("primaryMedia")
            if not pm and self.all_active_media:
                pm = self.all_active_media[0]
            self.primary_media = pm
            if pm and isinstance(pm, dict):
                self.primary_domain = str(pm.get("domain", ""))
                self.primary_title = str(pm.get("title", ""))
                self.primary_resolution = str(pm.get("resolutionLabel", ""))
                
                raw_vol = pm.get("volume")
                try:
                    self.primary_volume = float(raw_vol) if raw_vol is not None else 1.0
                except (ValueError, TypeError):
                    self.primary_volume = 1.0
                self.primary_volume = max(0.0, min(1.0, self.primary_volume))

                raw_pct = pm.get("volumePercent")
                try:
                    self.primary_volume_percent = int(raw_pct) if raw_pct is not None else int(round(self.primary_volume * 100))
                except (ValueError, TypeError):
                    self.primary_volume_percent = int(round(self.primary_volume * 100))
                self.primary_volume_percent = max(0, min(100, self.primary_volume_percent))

                self.is_muted = bool(pm.get("isMuted", False) or self.primary_volume <= 0.001 or self.primary_volume_percent == 0)
                self.playback_state = str(pm.get("state", "playing" if pm.get("isPlaying") else "paused"))
                self.playback_rate = float(pm.get("playbackRate", 1.0))
                self.current_time = float(pm.get("currentTime", 0.0))
                self.duration = float(pm.get("duration", 0.0))
                self.progress_percent = float(pm.get("progressPercent", 0.0))
            else:
                self.primary_domain = ""
                self.primary_title = ""
                self.primary_resolution = ""
                self.primary_volume = 1.0
                self.primary_volume_percent = 100
                self.is_muted = False
                self.playback_state = "idle"
                self.playback_rate = 1.0
                self.current_time = 0.0
                self.duration = 0.0
                self.progress_percent = 0.0

    def on_activity_update(self, data: Dict[str, Any]) -> None:
        """Ingests BROWSER_ACTIVITY_UPDATE payload sent by the extension."""
        with self._lock:
            self.is_connected = True
            self.last_heartbeat_timestamp = time.time()
            payload = data.get("payload") or {}
            self.active_domain = str(payload.get("activeDomain", "Idle"))
            self.is_browser_focused = bool(payload.get("isBrowserFocused", False))
            self.is_user_active = bool(payload.get("isUserActive", False))
            self.today_domain_seconds = int(payload.get("todayDomainSeconds", 0))
            self.today_total_seconds = int(payload.get("todayTotalSeconds", 0))

    def on_heartbeat(self) -> None:
        with self._lock:
            self.is_connected = True
            self.last_heartbeat_timestamp = time.time()

    def get_media_state(self) -> Dict[str, Any]:
        """
        Retrieves snapshot of current browser media state.
        Automatically invalidates video playing state if telemetry has gone stale (>15s).
        """
        with self._lock:
            now = time.time()
            is_stale = (now - self.last_heartbeat_timestamp > self._stale_timeout) if self.last_heartbeat_timestamp > 0 else True
            if self.connected_clients_count <= 0:
                is_stale = True

            effective_has_video = self.has_active_video and (not is_stale)
            effective_has_audio = self.has_active_audio and (not is_stale)
            effective_connected = self.is_connected and (not is_stale) and (self.connected_clients_count > 0)

            return {
                "is_connected": effective_connected,
                "connected_clients_count": self.connected_clients_count,
                "client_name": self.client_name,
                "browser_type": self.browser_type,
                "has_active_video": effective_has_video,
                "has_active_audio": effective_has_audio,
                "active_media_tabs": self.active_media_tabs if not is_stale else 0,
                "primary_domain": self.primary_domain if not is_stale else "",
                "primary_title": self.primary_title if not is_stale else "",
                "primary_resolution": self.primary_resolution if not is_stale else "",
                "primary_volume": self.primary_volume if not is_stale else 1.0,
                "primary_volume_percent": self.primary_volume_percent if not is_stale else 100,
                "volume_percent": self.primary_volume_percent if not is_stale else 100,
                "is_muted": self.is_muted if not is_stale else False,
                "playback_state": self.playback_state if not is_stale else "idle",
                "playback_rate": self.playback_rate,
                "current_time": self.current_time,
                "duration": self.duration,
                "progress_percent": self.progress_percent if not is_stale else 0.0,
                "primary_media": self.primary_media if not is_stale else None,
                "all_active_media": self.all_active_media if not is_stale else [],
                "last_heartbeat_age_sec": max(0.0, now - self.last_heartbeat_timestamp) if self.last_heartbeat_timestamp > 0 else 999.0
            }

    def get_activity_state(self) -> Dict[str, Any]:
        with self._lock:
            now = time.time()
            return {
                "active_domain": self.active_domain,
                "is_browser_focused": self.is_browser_focused,
                "is_user_active": self.is_user_active,
                "today_domain_seconds": self.today_domain_seconds,
                "today_total_seconds": self.today_total_seconds,
                "last_heartbeat_age_sec": max(0.0, now - self.last_heartbeat_timestamp) if self.last_heartbeat_timestamp > 0 else 999.0
            }

    def is_video_playing(self) -> bool:
        """Fast query: returns True if HTML5 video is actively playing in any browser tab."""
        return self.get_media_state()["has_active_video"]


class BrowserWSServer:
    """
    Standard-Library RFC 6455 WebSocket Server.
    Runs daemonized background listener on 127.0.0.1:65432.
    """

    def __init__(self, host: str = DEFAULT_WS_HOST, port: int = DEFAULT_WS_PORT) -> None:
        self.host = host
        self.port = port
        self.cache = BrowserMediaStateCache()
        self._server_socket: Optional[socket.socket] = None
        self._clients: Set[socket.socket] = set()
        self._clients_lock = threading.RLock()
        self._is_running = False
        self._listener_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()

    @property
    def is_running(self) -> bool:
        return self._is_running

    def start(self) -> bool:
        """Binds socket and launches listener daemon thread."""
        if self._is_running:
            return True

        try:
            self._server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self._server_socket.bind((self.host, self.port))
            self._server_socket.listen(16)
            self._server_socket.settimeout(1.0)
            self._is_running = True
            self._stop_event.clear()

            self._listener_thread = threading.Thread(
                target=self._listen_loop,
                name="BrowserWS-Listener",
                daemon=True
            )
            self._listener_thread.start()
            return True
        except Exception as e:
            self._is_running = False
            if self._server_socket:
                try:
                    self._server_socket.close()
                except Exception:
                    pass
                self._server_socket = None
            return False

    def stop(self) -> None:
        """Cleanly stops server and terminates all client sockets."""
        self._is_running = False
        self._stop_event.set()

        with self._clients_lock:
            for s in list(self._clients):
                try:
                    self._send_frame(s, b"", OPCODE_CLOSE)
                    s.close()
                except Exception:
                    pass
            self._clients.clear()
            self.cache.connected_clients_count = 0

        if self._server_socket:
            try:
                self._server_socket.close()
            except Exception:
                pass
            self._server_socket = None

    def _listen_loop(self) -> None:
        while self._is_running and not self._stop_event.is_set():
            try:
                client_sock, client_addr = self._server_socket.accept()
                client_sock.settimeout(30.0)
                client_thread = threading.Thread(
                    target=self._handle_client,
                    args=(client_sock, client_addr),
                    name=f"BrowserWS-Client-{client_addr[1]}",
                    daemon=True
                )
                client_thread.start()
            except socket.timeout:
                continue
            except Exception:
                if not self._is_running:
                    break

    def _read_exact(self, sock: socket.socket, num_bytes: int) -> Optional[bytes]:
        """Reads exact number of bytes from socket, handling fragmented packets."""
        data = bytearray()
        while len(data) < num_bytes:
            try:
                chunk = sock.recv(num_bytes - len(data))
                if not chunk:
                    return None
                data.extend(chunk)
            except Exception:
                return None
        return bytes(data)

    def _compute_accept_header(self, key: str) -> str:
        """Calculates RFC 6455 Sec-WebSocket-Accept token."""
        concat = key.strip() + WS_GUID
        sha = hashlib.sha1(concat.encode("utf-8")).digest()
        return base64.b64encode(sha).decode("ascii")

    def _do_handshake(self, sock: socket.socket) -> bool:
        """Parses HTTP Upgrade request and returns 101 Switching Protocols response."""
        try:
            req_data = bytearray()
            while b"\r\n\r\n" not in req_data:
                chunk = sock.recv(4096)
                if not chunk:
                    return False
                req_data.extend(chunk)
                if len(req_data) > 65536:
                    return False

            req_str = req_data.decode("utf-8", errors="replace")
            lines = req_str.split("\r\n")
            headers = {}
            for line in lines[1:]:
                if ":" in line:
                    k, v = line.split(":", 1)
                    headers[k.strip().lower()] = v.strip()

            ws_key = headers.get("sec-websocket-key")
            if not ws_key:
                return False

            accept_token = self._compute_accept_header(ws_key)
            response = (
                "HTTP/1.1 101 Switching Protocols\r\n"
                "Upgrade: websocket\r\n"
                "Connection: Upgrade\r\n"
                f"Sec-WebSocket-Accept: {accept_token}\r\n"
                "\r\n"
            )
            sock.sendall(response.encode("ascii"))
            return True
        except Exception:
            return False

    def _parse_frame(self, sock: socket.socket) -> Tuple[Optional[int], Optional[bytes]]:
        """
        Parses an incoming client-to-server RFC 6455 frame.
        Clients MUST mask all frames; payload is unmasked with XOR key.
        """
        header = self._read_exact(sock, 2)
        if not header:
            return None, None

        b0, b1 = header[0], header[1]
        opcode = b0 & 0x0F
        is_masked = bool(b1 & 0x80)
        len_indicator = b1 & 0x7F

        if len_indicator <= 125:
            payload_len = len_indicator
        elif len_indicator == 126:
            len_bytes = self._read_exact(sock, 2)
            if not len_bytes:
                return None, None
            payload_len = struct.unpack(">H", len_bytes)[0]
        else:  # 127
            len_bytes = self._read_exact(sock, 8)
            if not len_bytes:
                return None, None
            payload_len = struct.unpack(">Q", len_bytes)[0]

        mask_key = None
        if is_masked:
            mask_key = self._read_exact(sock, 4)
            if not mask_key:
                return None, None

        raw_data = self._read_exact(sock, payload_len)
        if raw_data is None:
            return None, None

        if is_masked and mask_key:
            # RFC 6455 XOR unmasking
            unmasked = bytearray(payload_len)
            for i in range(payload_len):
                unmasked[i] = raw_data[i] ^ mask_key[i % 4]
            payload = bytes(unmasked)
        else:
            payload = raw_data

        return opcode, payload

    def _create_frame(self, payload: bytes, opcode: int = OPCODE_TEXT) -> bytes:
        """Constructs unmasked server-to-client RFC 6455 frame."""
        frame = bytearray()
        # Byte 0: FIN (0x80) + Opcode
        frame.append(0x80 | (opcode & 0x0F))

        p_len = len(payload)
        # Server frames to client MUST NOT be masked (mask bit = 0)
        if p_len <= 125:
            frame.append(p_len)
        elif p_len <= 65535:
            frame.append(126)
            frame.extend(struct.pack(">H", p_len))
        else:
            frame.append(127)
            frame.extend(struct.pack(">Q", p_len))

        frame.extend(payload)
        return bytes(frame)

    def _send_frame(self, sock: socket.socket, payload: bytes, opcode: int = OPCODE_TEXT) -> bool:
        """Encodes and sends an unmasked frame over socket."""
        try:
            frame_bytes = self._create_frame(payload, opcode=opcode)
            sock.sendall(frame_bytes)
            return True
        except Exception:
            return False

    def send_json(self, sock: socket.socket, msg_dict: Dict[str, Any]) -> bool:
        """Sends JSON payload as RFC 6455 text frame."""
        try:
            raw = json.dumps(msg_dict, ensure_ascii=False).encode("utf-8")
            return self._send_frame(sock, raw, opcode=OPCODE_TEXT)
        except Exception:
            return False

    def broadcast(self, msg_dict: Dict[str, Any]) -> int:
        """Broadcasts JSON frame to all active connected clients."""
        raw = json.dumps(msg_dict, ensure_ascii=False).encode("utf-8")
        frame = self._create_frame(raw, opcode=OPCODE_TEXT)
        success_count = 0

        with self._clients_lock:
            dead_sockets = []
            for s in self._clients:
                try:
                    s.sendall(frame)
                    success_count += 1
                except Exception:
                    dead_sockets.append(s)

            for ds in dead_sockets:
                self._clients.discard(ds)
                try:
                    ds.close()
                except Exception:
                    pass
            self.cache.connected_clients_count = len(self._clients)

        return success_count

    def _handle_client(self, sock: socket.socket, addr: Tuple[str, int]) -> None:
        """Handles single client connection lifecycle, handshake, and telemetry stream."""
        if not self._do_handshake(sock):
            try:
                sock.close()
            except Exception:
                pass
            return

        with self._clients_lock:
            self._clients.add(sock)
            self.cache.connected_clients_count = len(self._clients)

        try:
            while self._is_running and not self._stop_event.is_set():
                opcode, payload = self._parse_frame(sock)
                if opcode is None:
                    break

                if opcode == OPCODE_CLOSE:
                    # Echo close frame back
                    self._send_frame(sock, b"", opcode=OPCODE_CLOSE)
                    break
                elif opcode == OPCODE_PING:
                    # RFC 6455: Must reply with Pong containing exact application data
                    self._send_frame(sock, payload, opcode=OPCODE_PONG)
                elif opcode == OPCODE_PONG:
                    self.cache.on_heartbeat()
                elif opcode == OPCODE_TEXT:
                    self._dispatch_client_message(sock, payload)

        except Exception:
            pass
        finally:
            with self._clients_lock:
                self._clients.discard(sock)
                self.cache.connected_clients_count = len(self._clients)
            try:
                sock.close()
            except Exception:
                pass

    def _dispatch_client_message(self, sock: socket.socket, raw_payload: bytes) -> None:
        """Parses and updates cache based on message type."""
        try:
            text = raw_payload.decode("utf-8", errors="replace")
            msg = json.loads(text)
            if not isinstance(msg, dict):
                return

            m_type = msg.get("type")
            if m_type == "REGISTER_CLIENT":
                self.cache.on_client_registered(msg)
                # Acknowledge registration with current HUD query
                self.send_json(sock, {"cmd": "QUERY_MEDIA_STATE", "ack": True})
            elif m_type == "BROWSER_MEDIA_TELEMETRY":
                self.cache.on_media_telemetry(msg)
            elif m_type == "BROWSER_ACTIVITY_UPDATE":
                self.cache.on_activity_update(msg)
            elif m_type == "PONG":
                self.cache.on_heartbeat()

        except Exception:
            pass


# -----------------------------------------------------------------------------
# Global Singleton & Exported Interface
# -----------------------------------------------------------------------------
_server_singleton: Optional[BrowserWSServer] = None
_singleton_lock = threading.Lock()


def get_browser_ws_server() -> Optional[BrowserWSServer]:
    """Retrieves current global WebSocket server instance."""
    return _server_singleton


class DataHubLiveSubscriber:
    """
    Decoupled client that queries Standalone Data Hub (ws://127.0.0.1:65433)
    for real-time active video/media playback state across all browsers.
    Runs completely in the background without blocking HUD UI or main evaluation loop.
    """
    def __init__(self, host: str = "127.0.0.1", port: int = 65433) -> None:
        self.host = host
        self.port = port
        self._lock = threading.RLock()
        self._stop_event = threading.Event()
        self._latest_hub_state: Dict[str, Any] = {}
        self._is_connected = False
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, name="HUD-DataHub-Subscriber", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()

    def get_latest_state(self) -> Dict[str, Any]:
        with self._lock:
            return dict(self._latest_hub_state)

    def is_connected(self) -> bool:
        with self._lock:
            return self._is_connected

    def _run_loop(self) -> None:
        while not self._stop_event.is_set():
            sock = None
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2.0)
                sock.connect((self.host, self.port))

                sec_key = base64.b64encode(os.urandom(16)).decode('ascii')
                handshake_req = (
                    f"GET / HTTP/1.1\r\n"
                    f"Host: {self.host}:{self.port}\r\n"
                    f"Upgrade: websocket\r\n"
                    f"Connection: Upgrade\r\n"
                    f"Sec-WebSocket-Key: {sec_key}\r\n"
                    f"Sec-WebSocket-Version: 13\r\n\r\n"
                )
                sock.sendall(handshake_req.encode('ascii'))

                resp_data = bytearray()
                while b"\r\n\r\n" not in resp_data:
                    chunk = sock.recv(1024)
                    if not chunk:
                        break
                    resp_data.extend(chunk)

                if b"101 Switching Protocols" not in resp_data:
                    sock.close()
                    time.sleep(2.0)
                    continue

                with self._lock:
                    self._is_connected = True

                # Poll QUERY_LIVE_STATE every 1.5 seconds
                while not self._stop_event.is_set():
                    req_payload = json.dumps({"type": "QUERY_LIVE_STATE"}).encode('utf-8')
                    mask = os.urandom(4)
                    p_len = len(req_payload)
                    hdr = bytearray([0x81])
                    if p_len <= 125:
                        hdr.append(0x80 | p_len)
                    elif p_len <= 65535:
                        hdr.append(0x80 | 126)
                        hdr.extend(struct.pack(">H", p_len))
                    else:
                        hdr.append(0x80 | 127)
                        hdr.extend(struct.pack(">Q", p_len))
                    hdr.extend(mask)
                    masked = bytearray(req_payload[i] ^ mask[i % 4] for i in range(p_len))
                    sock.sendall(bytes(hdr) + bytes(masked))

                    # Read response
                    hdr_in = sock.recv(2)
                    if not hdr_in:
                        break
                    b1 = hdr_in[1]
                    rlen = b1 & 0x7F
                    if rlen == 126:
                        lb = sock.recv(2)
                        rlen = struct.unpack(">H", lb)[0]
                    elif rlen == 127:
                        lb = sock.recv(8)
                        rlen = struct.unpack(">Q", lb)[0]

                    res_bytes = bytearray()
                    while len(res_bytes) < rlen:
                        c = sock.recv(rlen - len(res_bytes))
                        if not c:
                            break
                        res_bytes.extend(c)

                    if len(res_bytes) == rlen:
                        msg = json.loads(res_bytes.decode('utf-8', errors='replace'))
                        if msg.get("type") == "LIVE_STATE_RESPONSE":
                            with self._lock:
                                self._latest_hub_state = msg.get("data") or {}

                    time.sleep(1.5)

            except Exception:
                with self._lock:
                    self._is_connected = False
            finally:
                if sock:
                    try:
                        sock.close()
                    except Exception:
                        pass
                time.sleep(2.5)


_datahub_subscriber: Optional[DataHubLiveSubscriber] = None


def start_browser_ws_server(host: str = DEFAULT_WS_HOST, port: int = DEFAULT_WS_PORT) -> BrowserWSServer:
    """Idempotently starts and returns global Browser WebSocket Server."""
    global _server_singleton, _datahub_subscriber
    with _singleton_lock:
        if _server_singleton is None or not _server_singleton.is_running:
            server = BrowserWSServer(host=host, port=port)
            if server.start():
                _server_singleton = server
            else:
                _server_singleton = server  # Will show not running

        # Start decoupled Standalone Data Hub subscriber in background
        if _datahub_subscriber is None:
            _datahub_subscriber = DataHubLiveSubscriber()
            _datahub_subscriber.start()

        return _server_singleton


def stop_browser_ws_server() -> None:
    """Stops global Browser WebSocket Server."""
    global _server_singleton, _datahub_subscriber
    with _singleton_lock:
        if _datahub_subscriber is not None:
            _datahub_subscriber.stop()
            _datahub_subscriber = None

        if _server_singleton is not None:
            _server_singleton.stop()
            _server_singleton = None


_mock_browser_media_state: Optional[Dict[str, Any]] = None


def set_mock_browser_media_state(data: Optional[Dict[str, Any]]) -> None:
    """Helper for unit tests to mock browser media telemetry."""
    global _mock_browser_media_state
    _mock_browser_media_state = data


def get_cached_browser_media_state() -> Dict[str, Any]:
    """Exposes current thread-safe browser media telemetry snapshot."""
    global _server_singleton, _mock_browser_media_state, _datahub_subscriber
    if _mock_browser_media_state is not None:
        return dict(_mock_browser_media_state)

    # 1. Local port 65432 state
    local_state = _server_singleton.cache.get_media_state() if (_server_singleton and _server_singleton.cache) else {}

    # 2. Standalone Data Hub (port 65433) live state
    hub_live = _datahub_subscriber.get_latest_state() if _datahub_subscriber else {}

    # If local HUD port 65432 has active playing video, use it directly
    if local_state.get("is_connected") and local_state.get("has_active_video"):
        return local_state

    # If Standalone Data Hub reports active video from ANY browser (Chrome, Edge, Brave):
    if hub_live.get("has_active_video"):
        pm = hub_live.get("primary_stream") or {}
        b_type = str(pm.get("browser_type", "Browser")).title()
        return {
            "is_connected": True,
            "connected_clients_count": hub_live.get("connected_clients_count", 1),
            "client_name": "MediaSentinel",
            "browser_type": b_type,
            "has_active_video": True,
            "has_active_audio": hub_live.get("has_active_audio", True),
            "active_media_tabs": hub_live.get("active_streams_count", 1),
            "primary_domain": str(pm.get("domain", "")),
            "primary_title": str(pm.get("title", "")),
            "primary_resolution": str(pm.get("resolution_label", "")),
            "primary_volume": float(pm.get("peak_volume", 1.0)),
            "primary_volume_percent": int(round(float(pm.get("peak_volume", 1.0)) * 100)),
            "volume_percent": int(round(float(pm.get("peak_volume", 1.0)) * 100)),
            "is_muted": False,
            "playback_state": "playing" if pm.get("is_playing") else "paused",
            "playback_rate": 1.0,
            "current_time": 0.0,
            "duration": float(pm.get("watch_duration_seconds", 0.0)),
            "primary_media": pm,
            "all_active_media": hub_live.get("active_streams", []),
            "last_heartbeat_age_sec": 0.0
        }

    # Return local state if connected
    if local_state.get("is_connected"):
        return local_state

    return {
        "is_connected": False,
        "connected_clients_count": 0,
        "client_name": "MediaSentinel",
        "browser_type": "None",
        "has_active_video": False,
        "has_active_audio": False,
        "active_media_tabs": 0,
        "primary_domain": "",
        "primary_title": "",
        "primary_resolution": "",
        "primary_volume": 1.0,
        "primary_volume_percent": 100,
        "volume_percent": 100,
        "is_muted": False,
        "playback_state": "idle",
        "playback_rate": 1.0,
        "current_time": 0.0,
        "duration": 0.0,
        "primary_media": None,
        "all_active_media": [],
        "last_heartbeat_age_sec": 999.0
    }


def get_cached_browser_activity_state() -> Dict[str, Any]:
    """Exposes current thread-safe browser web activity snapshot."""
    global _server_singleton
    if _server_singleton and _server_singleton.cache:
        return _server_singleton.cache.get_activity_state()
    return {
        "active_domain": "",
        "is_browser_focused": False,
        "is_user_active": False,
        "today_domain_seconds": 0,
        "today_total_seconds": 0,
        "last_heartbeat_age_sec": 999.0
    }


def is_browser_video_playing() -> bool:
    """Convenience getter returning True if HTML5 video is playing in browser."""
    return get_cached_browser_media_state().get("has_active_video", False)


# -----------------------------------------------------------------------------
# Standalone Unit & Loopback Test Runner (--test)
# -----------------------------------------------------------------------------
def run_loopback_test() -> bool:
    """
    Executes automated loopback test of RFC 6455 handshake, client masking,
    telemetry caching, and clean disconnect using built-in sockets.
    """
    test_port = 65439
    print(f"[*] Starting RFC 6455 WebSocket Loopback Test on 127.0.0.1:{test_port}...")

    server = BrowserWSServer(host="127.0.0.1", port=test_port)
    if not server.start():
        print(f"[FAIL] Could not start BrowserWSServer on port {test_port}")
        return False

    time.sleep(0.1)

    try:
        # Create raw client socket
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect(("127.0.0.1", test_port))

        # Send HTTP Upgrade Handshake
        test_key = base64.b64encode(b"RFC6455_TEST_NONCE").decode("ascii")
        expected_accept = server._compute_accept_header(test_key)
        handshake_req = (
            f"GET / HTTP/1.1\r\n"
            f"Host: 127.0.0.1:{test_port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {test_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        client.sendall(handshake_req.encode("ascii"))

        # Receive 101 Response
        resp = client.recv(2048).decode("ascii", errors="replace")
        assert "101 Switching Protocols" in resp, "Missing 101 Switching Protocols"
        assert f"Sec-WebSocket-Accept: {expected_accept}" in resp, "Invalid Accept key calculation"
        print("  [+] RFC 6455 Handshake & SHA-1 computation: PASSED")

        # Helper to send masked client frame
        def send_client_frame(payload_bytes: bytes, opcode: int = OPCODE_TEXT):
            frame = bytearray()
            frame.append(0x80 | (opcode & 0x0F))
            p_len = len(payload_bytes)
            mask_key = b"\x12\x34\x56\x78"

            if p_len <= 125:
                frame.append(0x80 | p_len)
            elif p_len <= 65535:
                frame.append(0x80 | 126)
                frame.extend(struct.pack(">H", p_len))
            else:
                frame.append(0x80 | 127)
                frame.extend(struct.pack(">Q", p_len))

            frame.extend(mask_key)
            # Mask payload
            masked_data = bytearray(p_len)
            for i in range(p_len):
                masked_data[i] = payload_bytes[i] ^ mask_key[i % 4]
            frame.extend(masked_data)
            client.sendall(bytes(frame))

        # 1. Send REGISTER_CLIENT
        reg_payload = json.dumps({
            "type": "REGISTER_CLIENT",
            "client": "MediaSentinel Test",
            "browser": "Chrome",
            "version": "1.0.0"
        }).encode("utf-8")
        send_client_frame(reg_payload)
        time.sleep(0.1)

        # Read QUERY_MEDIA_STATE acknowledgment frame from server
        ack_hdr = client.recv(2)
        assert len(ack_hdr) == 2, "Failed to read ack header"
        assert (ack_hdr[0] & 0x0F) == OPCODE_TEXT, "Expected Text opcode for ack"
        ack_len = ack_hdr[1] & 0x7F
        ack_payload = client.recv(ack_len)
        ack_msg = json.loads(ack_payload.decode("utf-8"))
        assert ack_msg.get("cmd") == "QUERY_MEDIA_STATE", "Expected QUERY_MEDIA_STATE command"
        print("  [+] Server Registration ACK & Query Command: PASSED")

        # 2. Send BROWSER_MEDIA_TELEMETRY with video playing
        media_payload = json.dumps({
            "type": "BROWSER_MEDIA_TELEMETRY",
            "client": "MediaSentinel Test",
            "browser": "Chrome",
            "payload": {
                "activeMediaTabsCount": 1,
                "hasPlayingVideo": True,
                "hasPlayingAudio": False,
                "primaryMedia": {
                    "tabId": 42,
                    "domain": "youtube.com",
                    "title": "Quantum Physics in 4K UHD",
                    "mediaType": "video",
                    "state": "playing",
                    "isPlaying": True,
                    "isMuted": False,
                    "volume": 0.85,
                    "playbackRate": 1.0,
                    "videoWidth": 3840,
                    "videoHeight": 2160,
                    "resolutionLabel": "4K UHD (2160p)",
                    "currentTime": 145.2,
                    "duration": 720.0
                }
            }
        }).encode("utf-8")
        send_client_frame(media_payload)
        time.sleep(0.1)

        # Check state cache
        cached = server.cache.get_media_state()
        assert cached["is_connected"] is True, "Cache is_connected failed"
        assert cached["has_active_video"] is True, "Cache has_active_video failed"
        assert cached["primary_domain"] == "youtube.com", "Cache primary_domain failed"
        assert cached["primary_title"] == "Quantum Physics in 4K UHD", "Cache title failed"
        assert cached["primary_resolution"] == "4K UHD (2160p)", "Cache resolution failed"
        assert cached["is_muted"] is False, "Cache is_muted failed"
        assert abs(cached["primary_volume"] - 0.85) < 0.01, "Cache primary_volume failed"
        assert cached["volume_percent"] == 85, "Cache volume_percent failed"
        print("  [+] BROWSER_MEDIA_TELEMETRY Cache Ingestion: PASSED")

        # 3. Send Ping frame
        send_client_frame(b"ping-payload", opcode=OPCODE_PING)
        # Read Pong response from server
        pong_hdr = client.recv(2)
        assert len(pong_hdr) == 2, "Failed to read Pong header"
        assert (pong_hdr[0] & 0x0F) == OPCODE_PONG, "Expected Pong opcode"
        pong_len = pong_hdr[1] & 0x7F
        pong_payload = client.recv(pong_len)
        assert pong_payload == b"ping-payload", "Pong payload mismatch"
        print("  [+] RFC 6455 Ping/Pong Heartbeat Echo: PASSED")

        # 4. Clean Close
        send_client_frame(b"", opcode=OPCODE_CLOSE)
        client.close()
        print("  [+] RFC 6455 Client Termination: PASSED")

        print("\n[SUCCESS] ALL RFC 6455 WebSocket Loopback Tests PASSED! Grade A+")
        return True

    except Exception as e:
        print(f"\n[FAIL] Test exception: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        server.stop()


if __name__ == "__main__":
    if "--test" in sys.argv:
        success = run_loopback_test()
        sys.exit(0 if success else 1)
    else:
        print("[*] Starting standalone Browser WebSocket Server on 127.0.0.1:65432...")
        srv = BrowserWSServer()
        if srv.start():
            print("[+] WebSocket Server listening on ws://127.0.0.1:65432. Press Ctrl+C to stop.")
            try:
                while True:
                    time.sleep(1.0)
                    st = srv.cache.get_media_state()
                    if st["is_connected"]:
                        print(f"  [Telemetry] Active Video: {st['has_active_video']} | Domain: {st['primary_domain']} | Title: {st['primary_title'][:30]}")
            except KeyboardInterrupt:
                pass
            finally:
                srv.stop()
                print("[*] WebSocket Server stopped cleanly.")
        else:
            print("[ERROR] Failed to bind WebSocket Server.")
            sys.exit(1)
