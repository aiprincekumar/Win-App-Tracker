# -*- coding: utf-8 -*-
"""
modules/web_server.py: Lightweight Localhost Web Dashboard & Wi-Fi Remote Control Server.
Department 06: Backend & API Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import gzip
import http.server
import json
import mimetypes
import os
import random
import re
import secrets
import socket
import sys
import threading
import time
import urllib.parse
from typing import Dict, Any, Optional, List, Callable

from .countdown import AutoShutdownController, STATE_STANDBY
from .storage import StorageManager
from .analytics import AnalyticsEngine
from .exporter import ReportExporter
from .evaluator import evaluate_video_inactivity
from .audio import get_live_wasapi_audio_state
from .powercfg import get_system_power_display_requests
from .hardware_telemetry import get_process_cpu_and_ram


def get_local_lan_ip() -> str:
    """
    Detects the primary local LAN IP address of this machine.
    Uses UDP socket probe (zero network packets sent) with fallback to hostname.
    """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith("127."):
            return ip
    except Exception:
        pass

    try:
        host = socket.gethostname()
        ip = socket.gethostbyname(host)
        if ip and not ip.startswith("127."):
            return ip
    except Exception:
        pass

    return "127.0.0.1"


def generate_pin() -> str:
    """Generates an ephemeral, cryptographically secure 4-digit PIN."""
    return f"{secrets.randbelow(9000) + 1000}"


class SentinelHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    """
    High-performance, zero-dependency REST & SSE request handler.
    Serves static cyber-glass assets and processes bi-directional remote commands.
    """
    server_version = "SentinelWeb/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        """Suppresses default stderr request logging to preserve terminal HUD cleanliness."""
        return

    @property
    def server_instance(self) -> "SentinelWebServer":
        return getattr(self.server, "web_server_instance", None)

    def _get_request_pin(self, parsed_url: urllib.parse.ParseResult) -> Optional[str]:
        """Extracts PIN from URL query param, custom header, Authorization header, or cookie."""
        # 1. Query parameter: ?pin=1234
        query_params = urllib.parse.parse_qs(parsed_url.query)
        if "pin" in query_params and query_params["pin"]:
            return query_params["pin"][0].strip()

        # 2. Custom header: X-PIN: 1234
        x_pin = self.headers.get("X-PIN")
        if x_pin:
            return x_pin.strip()

        # 3. Authorization header: Bearer 1234
        auth = self.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            return auth.split(" ", 1)[1].strip()

        # 4. Cookie: sentinel_pin=1234
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            cookies = [c.strip() for c in cookie_header.split(";")]
            for c in cookies:
                if c.startswith("sentinel_pin="):
                    return c.split("=", 1)[1].strip()

        return None

    def _is_authorized(self, parsed_url: urllib.parse.ParseResult) -> bool:
        """
        Validates authentication for LAN-protected endpoints.
        If server PIN is configured, rejects unauthorized requests with 401.
        """
        server = self.server_instance
        if not server or not server.pin:
            return True

        # Check client IP
        client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
        is_loopback = client_ip in ("127.0.0.1", "::1", "localhost")

        # If bind_lan is active or enforce_pin_all is True, PIN is strictly enforced
        if server.bind_lan or server.enforce_pin:
            # Check provided PIN
            provided_pin = self._get_request_pin(parsed_url)
            if provided_pin == server.pin:
                return True
            return False

        # If not bind_lan and not enforcing pin, loopback is allowed
        if is_loopback:
            return True

        provided_pin = self._get_request_pin(parsed_url)
        return provided_pin == server.pin

    def _send_unauthorized(self, is_json: bool = True) -> None:
        """Sends standard HTTP 401 Unauthorized response."""
        server = self.server_instance
        pin_hint = "4-digit PIN required"
        if is_json:
            payload = {
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": f"Unauthorized: {pin_hint}",
                    "details": "Provide valid PIN via ?pin=XXXX query param, X-PIN header, or Cookie."
                },
                "status": 401
            }
            body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
            self.send_response(401)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("WWW-Authenticate", 'Bearer realm="Sentinel LAN Remote"')
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        else:
            html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>401 Unauthorized - Sentinel Remote</title>
  <style>
    body {{ background: #0F172A; color: #F8FAFC; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
    .card {{ background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 32px; max-width: 360px; text-align: center; box-shadow: 0 0 24px rgba(239, 68, 68, 0.2); }}
    h2 {{ color: #EF4444; margin-top: 0; font-size: 1.4rem; }}
    p {{ color: #94A3B8; font-size: 0.9rem; line-height: 1.4; }}
    input {{ width: 100%; box-sizing: border-box; padding: 12px; margin: 16px 0; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #FFF; font-size: 1.2rem; text-align: center; letter-spacing: 4px; }}
    button {{ width: 100%; padding: 12px; background: #10B981; border: none; border-radius: 8px; color: #FFF; font-weight: bold; cursor: pointer; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 Access Locked</h2>
    <p>This Sentinel Web Dashboard is protected by a 4-digit PIN. Please enter PIN to access remote control.</p>
    <form method="GET" action="/">
      <input type="password" name="pin" maxlength="6" placeholder="• • • •" autofocus required />
      <button type="submit">Authenticate</button>
    </form>
  </div>
</body>
</html>"""
            body = html.encode("utf-8")
            self.send_response(401)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("WWW-Authenticate", 'Bearer realm="Sentinel LAN Remote"')
            self.end_headers()
            self.wfile.write(body)

    def _send_json(self, payload: Dict[str, Any], status: int = 200, cookie_pin: Optional[str] = None) -> None:
        """Serializes and transmits JSON response with gzip compression and CORS headers."""
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        # Gzip compression if requested by client and content is substantial
        accept_encoding = self.headers.get("Accept-Encoding", "")
        if "gzip" in accept_encoding and len(data) > 256:
            data = gzip.compress(data)
            is_gzipped = True
        else:
            is_gzipped = False

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        if is_gzipped:
            self.send_header("Content-Encoding", "gzip")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-PIN, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        if cookie_pin:
            self.send_header("Set-Cookie", f"sentinel_pin={cookie_pin}; Path=/; SameSite=Strict")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        """Handles CORS preflight checks cleanly."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-PIN, Authorization")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self) -> None:
        """Routes GET requests across REST APIs, SSE stream, and static assets."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. API: Server-Sent Events (SSE) stream
        if path == "/api/telemetry/events":
            if not self._is_authorized(parsed):
                self._send_unauthorized(is_json=True)
                return
            self._handle_sse_stream()
            return

        # 2. API: Instantaneous Status Snapshot
        if path == "/api/status":
            if not self._is_authorized(parsed):
                self._send_unauthorized(is_json=True)
                return
            server = self.server_instance
            snapshot = server.get_status_snapshot() if server else {}
            # Check if pin was supplied in query, persist via Set-Cookie
            query_pin = urllib.parse.parse_qs(parsed.query).get("pin", [None])[0]
            self._send_json(snapshot, status=200, cookie_pin=query_pin)
            return

        # 3. API: Analytics Today Summary & 24h Heatmap
        if path == "/api/analytics/today":
            if not self._is_authorized(parsed):
                self._send_unauthorized(is_json=True)
                return
            server = self.server_instance
            analytics_data = server.get_analytics_today() if server else {"success": True, "summary": {}, "heatmap": []}
            self._send_json(analytics_data, status=200)
            return

        # 4. API: Standalone HTML Report Export
        if path == "/api/export/html":
            if not self._is_authorized(parsed):
                self._send_unauthorized(is_json=True)
                return
            server = self.server_instance
            html_content = server.export_report_html() if server else "<h1>No Report Available</h1>"
            body = html_content.encode("utf-8")

            # Check gzip
            accept_encoding = self.headers.get("Accept-Encoding", "")
            if "gzip" in accept_encoding and len(body) > 256:
                body = gzip.compress(body)
                is_gzipped = True
            else:
                is_gzipped = False

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            if is_gzipped:
                self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Disposition", 'attachment; filename="video_sentinel_report.html"')
            self.end_headers()
            self.wfile.write(body)
            return

        # 5. Static Assets (/ , /index.html, /style.css, /app.js, etc.)
        self._serve_static_asset(path, parsed)

    def do_POST(self) -> None:
        """Processes remote control actions (abort, snooze, pause, threshold)."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if not self._is_authorized(parsed):
            self._send_unauthorized(is_json=True)
            return

        # Read JSON body if present
        content_length = int(self.headers.get("Content-Length", 0))
        body_dict: Dict[str, Any] = {}
        if content_length > 0:
            try:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                if raw_body.strip():
                    body_dict = json.loads(raw_body)
            except Exception:
                pass

        server = self.server_instance
        if not server:
            self._send_json({"success": False, "error": "Server instance not attached"}, status=500)
            return

        # Route POST Endpoints
        if path == "/api/control/abort":
            result = server.control_abort()
            self._send_json(result, status=200)
            return

        if path == "/api/control/snooze":
            seconds = body_dict.get("seconds", 900)
            try:
                seconds = int(seconds)
            except Exception:
                seconds = 900
            result = server.control_snooze(seconds=seconds)
            self._send_json(result, status=200)
            return

        if path == "/api/control/pause":
            paused_val = body_dict.get("paused")
            result = server.control_pause(paused=paused_val)
            self._send_json(result, status=200)
            return

        if path == "/api/control/threshold":
            delta = body_dict.get("delta")
            new_th = body_dict.get("threshold")
            result = server.control_threshold(delta=delta, threshold=new_th)
            self._send_json(result, status=200)
            return

        # Not Found
        self._send_json({"success": False, "error": "Endpoint not found", "path": path}, status=404)

    def _serve_static_asset(self, path: str, parsed: urllib.parse.ParseResult) -> None:
        """Serves static files from web/ folder with MIME verification, caching, and path sanitization."""
        server = self.server_instance
        _m_dir = os.path.dirname(os.path.abspath(__file__))
        _p_dir = os.path.dirname(_m_dir)
        _r_dir = os.path.dirname(_p_dir) if os.path.basename(_p_dir).lower() == "src" else _p_dir
        web_root = server.web_dir if server else os.path.join(_r_dir, "web")

        if path in ("", "/", "/index.html"):
            # Check authentication if LAN PIN is required for root page
            if not self._is_authorized(parsed):
                self._send_unauthorized(is_json=False)
                return
            rel_path = "index.html"
        else:
            rel_path = path.lstrip("/")

        # Path traversal guard
        clean_path = os.path.normpath(rel_path)
        if clean_path.startswith("..") or os.path.isabs(clean_path):
            self.send_error(403, "Forbidden")
            return

        full_path = os.path.join(web_root, clean_path)
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            self.send_error(404, "File Not Found")
            return

        # MIME determination
        ext = os.path.splitext(full_path)[1].lower()
        mime_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".ico": "image/x-icon"
        }
        content_type = mime_types.get(ext, mimetypes.guess_type(full_path)[0] or "application/octet-stream")

        try:
            with open(full_path, "rb") as f:
                data = f.read()
        except Exception:
            self.send_error(500, "Error reading file")
            return

        # Cache control header
        if ext in (".css", ".js", ".svg", ".png"):
            cache_control = "public, max-age=3600"
        else:
            cache_control = "no-cache, must-revalidate"

        # Gzip compression for static assets
        accept_encoding = self.headers.get("Accept-Encoding", "")
        if "gzip" in accept_encoding and len(data) > 256 and ext in (".html", ".css", ".js", ".svg", ".json"):
            data = gzip.compress(data)
            is_gzipped = True
        else:
            is_gzipped = False

        query_pin = urllib.parse.parse_qs(parsed.query).get("pin", [None])[0]

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if is_gzipped:
            self.send_header("Content-Encoding", "gzip")
        self.send_header("Cache-Control", cache_control)
        if query_pin:
            self.send_header("Set-Cookie", f"sentinel_pin={query_pin}; Path=/; SameSite=Strict")
        self.end_headers()
        self.wfile.write(data)

    def _handle_sse_stream(self) -> None:
        """Streams real-time telemetry updates to client at 1 Hz via Server-Sent Events."""
        server = self.server_instance
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "keep-alive")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        # Continuous push loop
        while server and not server._stop_event.is_set():
            try:
                snapshot = server.get_status_snapshot()
                sse_payload = f"data: {json.dumps(snapshot, ensure_ascii=False)}\n\n"
                self.wfile.write(sse_payload.encode("utf-8"))
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, socket.error):
                # Client disconnected cleanly
                break
            except Exception:
                break

            # 1 Hz cadence
            time.sleep(1.0)


class SentinelThreadingHTTPServer(http.server.ThreadingHTTPServer):
    """Multi-threaded HTTP Server with socket address reuse and clean teardown guarantees."""
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, server_address, RequestHandlerClass, web_server_instance: "SentinelWebServer"):
        self.web_server_instance = web_server_instance
        super().__init__(server_address, RequestHandlerClass)


class SentinelWebServer:
    """
    High-Performance, Multi-Threaded Native Web Dashboard & Remote Control Server.
    Provides REST APIs, SSE telemetry streaming, and bi-directional command synchronization.
    """

    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = 8765,
        bind_lan: bool = False,
        pin: Optional[str] = None,
        countdown_controller: Optional[AutoShutdownController] = None,
        storage: Optional[StorageManager] = None,
        analytics: Optional[AnalyticsEngine] = None,
        web_dir: Optional[str] = None,
        enforce_pin: bool = False,
        on_state_change: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> None:
        self.bind_lan = bool(bind_lan)
        self.host = "0.0.0.0" if self.bind_lan else host
        self.port = int(port)
        self.pin = str(pin) if pin else (generate_pin() if self.bind_lan else None)
        self.enforce_pin = enforce_pin or (self.pin is not None and self.bind_lan)

        self.countdown_controller = countdown_controller
        self.storage = storage
        self.analytics = analytics
        self.on_state_change = on_state_change

        # Web assets directory
        if web_dir:
            self.web_dir = os.path.abspath(web_dir)
        else:
            _m_dir = os.path.dirname(os.path.abspath(__file__))
            _p_dir = os.path.dirname(_m_dir)
            _r_dir = os.path.dirname(_p_dir) if os.path.basename(_p_dir).lower() == "src" else _p_dir
            self.web_dir = os.path.join(_r_dir, "web")

        # Sentinel control state
        self.is_paused: bool = False
        self.idle_threshold: float = 60.0
        if self.countdown_controller:
            self.idle_threshold = self.countdown_controller.grace_threshold_seconds

        # Synchronization & Cached State
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._cached_state: Dict[str, Any] = {}

        # HTTP Server handle
        self.httpd: Optional[SentinelThreadingHTTPServer] = None
        self._server_thread: Optional[threading.Thread] = None

    def get_access_url(self) -> str:
        """Returns the human-friendly URL with PIN for web access."""
        display_host = get_local_lan_ip() if self.bind_lan else ("localhost" if self.host in ("127.0.0.1", "0.0.0.0") else self.host)
        url = f"http://{display_host}:{self.port}/"
        if self.pin:
            url += f"?pin={self.pin}"
        return url

    def start(self) -> None:
        """Starts HTTP server on daemon background thread without blocking."""
        self._stop_event.clear()
        self.httpd = SentinelThreadingHTTPServer(
            (self.host, self.port),
            SentinelHTTPRequestHandler,
            web_server_instance=self
        )
        self._server_thread = threading.Thread(
            target=self.httpd.serve_forever,
            name="SentinelWebServerThread",
            daemon=True
        )
        self._server_thread.start()

    def stop(self, timeout: float = 0.5) -> bool:
        """
        Cleanly terminates web server, releases port and closes sockets in < 500ms.
        Guarantees zero lingering socket bind errors or zombie threads.
        """
        self._stop_event.set()
        if self.httpd:
            try:
                # Trigger shutdown asynchronously to prevent self-deadlock
                threading.Thread(target=self.httpd.shutdown, daemon=True).start()
            except Exception:
                pass
            try:
                self.httpd.server_close()
            except Exception:
                pass

        if self._server_thread and self._server_thread.is_alive():
            self._server_thread.join(timeout=timeout)

        return True

    def update_state(
        self,
        card_data: Optional[Dict[str, Any]] = None,
        raw_eval: Optional[Dict[str, Any]] = None,
        countdown_state: Optional[Dict[str, Any]] = None
    ) -> None:
        """Updates internal live telemetry snapshot from the sentinel loop."""
        with self._lock:
            if card_data:
                self._cached_state["card_data"] = card_data
            if raw_eval:
                self._cached_state["raw_eval"] = raw_eval
            if countdown_state:
                self._cached_state["countdown_state"] = countdown_state

        if self.on_state_change:
            try:
                self.on_state_change(self.get_status_snapshot())
            except Exception:
                pass

    def get_status_snapshot(self) -> Dict[str, Any]:
        """
        Constructs and returns complete real-time JSON telemetry payload conforming to specification:
        - verdict ('BUSY' / 'IDLE')
        - confidence
        - primary stream
        - secondary streams
        - ghost streams
        - countdown status
        - power status
        - idle status
        """
        with self._lock:
            card_data = self._cached_state.get("card_data")
            raw_eval = self._cached_state.get("raw_eval")
            countdown_state = self._cached_state.get("countdown_state")

        # Fallback to instantaneous evaluation if not populated yet
        if not raw_eval or not card_data:
            try:
                raw_eval = evaluate_video_inactivity()
            except Exception:
                raw_eval = {}

        active_videos = raw_eval.get("media_candidates", {}).get("active_videos", [])
        is_v_playing = bool(active_videos)
        if card_data:
            is_v_playing = card_data.get("is_video_playing", is_v_playing)

        # Countdown Controller State
        if not countdown_state:
            if self.countdown_controller:
                countdown_state = self.countdown_controller.get_state()
            else:
                countdown_state = {
                    "state": STATE_STANDBY,
                    "is_warning": False,
                    "is_triggered": False,
                    "is_snoozed": False,
                    "remaining_grace": self.idle_threshold,
                    "remaining_countdown": 0.0,
                    "total_countdown": 60.0,
                    "countdown_progress": 1.0,
                    "formatted_countdown": "00:00",
                    "snooze_remaining": 0.0,
                    "shutdown_executed": False
                }

        # Primary Stream & Secondary Streams
        primary_stream = {}
        secondary_streams = []
        if active_videos:
            primary = active_videos[0]
            hw = primary.get("hardware", {})
            vol = primary.get("audio_volume", {})
            fullscr = primary.get("presentation", {})
            primary_stream = {
                "title": primary.get("clean_title") or primary.get("title") or "Unknown Stream",
                "player": primary.get("process_name", "Unknown Player"),
                "platform": primary.get("platform_tag", "Local Video File"),
                "volume_percent": vol.get("session_volume_percent", 100),
                "muted": vol.get("session_muted", False),
                "fullscreen": fullscr.get("mode", "WINDOWED"),
                "media_type": "VIDEO",
                "playback_state": "PLAYING",
                "continuous_play_seconds": card_data.get("continuous_play_seconds", 0.0) if card_data else 0.0,
                "cpu_percent": hw.get("cpu_percent", 0.0),
                "ram_mb": hw.get("ram_mb", 0.0)
            }
            if len(active_videos) > 1:
                for sec in active_videos[1:]:
                    secondary_streams.append({
                        "title": sec.get("clean_title") or sec.get("title"),
                        "player": sec.get("process_name"),
                        "platform": sec.get("platform_tag")
                    })
        elif card_data and card_data.get("media_title") not in (None, "None"):
            primary_stream = {
                "title": card_data.get("media_title"),
                "player": card_data.get("active_player"),
                "platform": "Streaming Media",
                "volume_percent": 100,
                "muted": False,
                "fullscreen": "WINDOWED",
                "media_type": card_data.get("media_type", "None"),
                "playback_state": card_data.get("playback_state", "STOPPED"),
                "continuous_play_seconds": card_data.get("continuous_play_seconds", 0.0)
            }

        # Ghost Streams Audit
        ghost_streams = raw_eval.get("ghost_streams", [])

        # Power Status
        power_status = raw_eval.get("power_status", {
            "on_ac": True,
            "battery_percent": 100,
            "power_source_str": "AC Mains (Desktop)",
            "display_locked": False,
            "system_locked": False
        })

        verdict = "BUSY" if is_v_playing else "IDLE"
        confidence = 0.95 if is_v_playing else 1.0

        now = time.time()
        idle_sec = card_data.get("idle_seconds", 0.0) if card_data else 0.0

        return {
            "success": True,
            "verdict": verdict,
            "confidence": confidence,
            "is_video_playing": is_v_playing,
            "is_paused": self.is_paused,
            "primary_stream": primary_stream,
            "secondary_streams": secondary_streams,
            "ghost_streams": ghost_streams,
            "countdown_status": countdown_state,
            "countdown": countdown_state,
            "power_status": power_status,
            "power": power_status,
            "idle_seconds": round(idle_sec, 1),
            "idle_threshold": self.idle_threshold,
            "timestamp": now,
            "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
        }

    def get_analytics_today(self) -> Dict[str, Any]:
        """Fetches daily summary and 24h heatmap from AnalyticsEngine."""
        today_str = time.strftime("%Y-%m-%d")
        if self.analytics:
            daily = self.analytics.get_daily_summary(today_str)
            heatmap = self.analytics.get_24h_heatmap(today_str)
            peak = self.analytics.get_peak_usage_hour(today_str)
        else:
            daily = {
                "date": today_str,
                "video_seconds": 0,
                "audio_seconds": 0,
                "idle_seconds": 0,
                "video_formatted": "00h 00m 00s",
                "audio_formatted": "00h 00m 00s",
                "idle_formatted": "00h 00m 00s"
            }
            heatmap = [{"hour": h, "hour_label": f"{h:02d}:00", "video_sec": 0, "audio_sec": 0, "idle_sec": 0} for h in range(24)]
            peak = {"hour": 0, "hour_range": "00:00 - 01:00", "video_sec": 0, "video_formatted": "00h 00m 00s"}

        return {
            "success": True,
            "date": today_str,
            "summary": daily,
            "heatmap": heatmap,
            "peak_usage": peak
        }

    def export_report_html(self) -> str:
        """Generates or returns self-contained Cyber-Glass HTML report."""
        if self.analytics and self.storage:
            exporter = ReportExporter(self.analytics, self.storage)
            tmp_path = exporter.export_html()
            try:
                with open(tmp_path, "r", encoding="utf-8-sig") as f:
                    return f.read()
            except Exception:
                with open(tmp_path, "r", encoding="utf-8", errors="replace") as f:
                    return f.read()
        return "<html><body><h1>Report unavailable (Storage not attached)</h1></body></html>"

    def control_abort(self) -> Dict[str, Any]:
        """Aborts active countdown immediately."""
        if self.countdown_controller:
            res = self.countdown_controller.abort()
        else:
            res = {"state": STATE_STANDBY}
        return {
            "success": True,
            "action": "abort",
            "message": "Shutdown countdown aborted successfully",
            "countdown": res
        }

    def control_snooze(self, seconds: int = 900) -> Dict[str, Any]:
        """Snoozes active countdown by specified seconds (default: 15m / 900s)."""
        if self.countdown_controller:
            res = self.countdown_controller.snooze(seconds=seconds)
        else:
            res = {"state": "SNOOZED", "snooze_remaining": seconds}
        return {
            "success": True,
            "action": "snooze",
            "seconds": seconds,
            "message": f"Shutdown postponed by {seconds // 60} minutes",
            "countdown": res
        }

    def control_pause(self, paused: Optional[bool] = None) -> Dict[str, Any]:
        """Toggles or sets sentinel pause state."""
        if paused is None:
            self.is_paused = not self.is_paused
        else:
            self.is_paused = bool(paused)
        return {
            "success": True,
            "action": "pause",
            "is_paused": self.is_paused,
            "message": "Sentinel paused" if self.is_paused else "Sentinel resumed"
        }

    def control_threshold(self, delta: Optional[float] = None, threshold: Optional[float] = None) -> Dict[str, Any]:
        """Adjusts the countdown threshold dynamically."""
        if threshold is not None:
            self.idle_threshold = max(10.0, float(threshold))
        elif delta is not None:
            self.idle_threshold = max(10.0, self.idle_threshold + float(delta))

        if self.countdown_controller:
            self.countdown_controller.grace_threshold_seconds = self.idle_threshold

        return {
            "success": True,
            "action": "threshold",
            "threshold": self.idle_threshold,
            "message": f"Inactivity threshold adjusted to {self.idle_threshold}s"
        }
