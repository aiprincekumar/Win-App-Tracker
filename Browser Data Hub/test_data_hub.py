# -*- coding: utf-8 -*-
"""
Browser Data Hub/test_data_hub.py: Automated Unit & Concurrency Test Suite.
Department 08: Quality Assurance & Testing & Department 06: Backend & API Engineering.

Validates:
  1. SQLite WAL mode initialization and database schema integrity.
  2. Multi-browser concurrent database writes (Chrome + Edge simultaneously writing deltas).
  3. Atomic upserts for domain activity and media sessions.
  4. RFC 6455 WebSocket handshake and masked frame exchange over standard library sockets.
  5. Multi-browser simultaneous WebSocket sessions and analytics queries ('all' vs 'chrome' vs 'edge').
  6. Real-time live state queries for HUD integration.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Browser Data Hub
"""

import sys
import os
import time
import json
import base64
import struct
import socket
import hashlib
import tempfile
import unittest
import threading
import urllib.request
from typing import Dict, Any, Optional, Tuple

from browser_data_hub import (
    DataHubDB,
    LiveStateCache,
    BrowserDataHubServer,
    DEFAULT_HUB_HOST,
    WS_GUID,
    OPCODE_TEXT,
    OPCODE_CLOSE,
    OPCODE_PING,
    OPCODE_PONG
)


class RawWebSocketClient:
    """Minimal RFC 6455 compliant WebSocket client using pure Python Standard Library."""

    def __init__(self, host: str, port: int) -> None:
        self.host = host
        self.port = port
        self.sock: Optional[socket.socket] = None

    def connect(self, timeout: float = 5.0) -> bool:
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.settimeout(timeout)
        self.sock.connect((self.host, self.port))

        # Perform RFC 6455 handshake
        sec_key = base64.b64encode(os.urandom(16)).decode("ascii")
        req = (
            f"GET / HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {sec_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n"
            f"\r\n"
        )
        self.sock.sendall(req.encode("ascii"))

        # Read response headers
        res = bytearray()
        while b"\r\n\r\n" not in res:
            chunk = self.sock.recv(1024)
            if not chunk:
                return False
            res.extend(chunk)

        res_str = res.decode("utf-8", errors="replace")
        return "101 Switching Protocols" in res_str

    def send_json(self, data: Dict[str, Any]) -> None:
        """Sends masked text frame to server."""
        payload = json.dumps(data).encode("utf-8")
        mask_key = os.urandom(4)

        masked_payload = bytearray(len(payload))
        for i in range(len(payload)):
            masked_payload[i] = payload[i] ^ mask_key[i % 4]

        frame = bytearray()
        frame.append(0x80 | OPCODE_TEXT)  # FIN + text

        p_len = len(payload)
        if p_len <= 125:
            frame.append(0x80 | p_len)  # MASK = 1
        elif p_len <= 65535:
            frame.append(0x80 | 126)
            frame.extend(struct.pack(">H", p_len))
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack(">Q", p_len))

        frame.extend(mask_key)
        frame.extend(masked_payload)
        self.sock.sendall(bytes(frame))

    def recv_json(self, timeout: float = 5.0) -> Optional[Dict[str, Any]]:
        """Reads unmasked server frame and parses JSON."""
        self.sock.settimeout(timeout)
        header = self._read_exact(2)
        if not header:
            return None

        opcode = header[0] & 0x0F
        is_masked = bool(header[1] & 0x80)
        len_indicator = header[1] & 0x7F

        if len_indicator <= 125:
            payload_len = len_indicator
        elif len_indicator == 126:
            len_bytes = self._read_exact(2)
            payload_len = struct.unpack(">H", len_bytes)[0]
        else:
            len_bytes = self._read_exact(8)
            payload_len = struct.unpack(">Q", len_bytes)[0]

        mask = self._read_exact(4) if is_masked else None
        data = self._read_exact(payload_len)
        if not data:
            return None

        if is_masked and mask:
            unmasked = bytearray(payload_len)
            for i in range(payload_len):
                unmasked[i] = data[i] ^ mask[i % 4]
            data = bytes(unmasked)

        return json.loads(data.decode("utf-8", errors="replace"))

    def _read_exact(self, n: int) -> Optional[bytes]:
        buf = bytearray()
        while len(buf) < n:
            chunk = self.sock.recv(n - len(buf))
            if not chunk:
                return None
            buf.extend(chunk)
        return bytes(buf)

    def close(self) -> None:
        if self.sock:
            try:
                self.sock.close()
            except Exception:
                pass
            self.sock = None


class TestBrowserDataHub(unittest.TestCase):
    """Full test suite covering database, concurrency, WebSocket server, and analytics."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.mkdtemp(prefix="data_hub_test_")
        self.db_path = os.path.join(self.temp_dir, "test_browser_activity.db")
        self.db = DataHubDB(self.db_path)

    def tearDown(self) -> None:
        try:
            # Close connection if held
            conn = getattr(self.db._tls, "conn", None)
            if conn:
                conn.close()
        except Exception:
            pass
        # Clean up files
        for ext in ["", "-wal", "-shm"]:
            f = self.db_path + ext
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass
        try:
            os.rmdir(self.temp_dir)
        except Exception:
            pass

    def test_01_wal_mode_and_schema_initialization(self) -> None:
        """Verifies that WAL mode and all 3 tables with indexes are properly initialized."""
        conn = self.db._get_connection()
        cur = conn.execute("PRAGMA journal_mode;")
        journal_mode = cur.fetchone()[0]
        self.assertEqual(journal_mode.lower(), "wal", "SQLite should be running in WAL mode")

        # Verify tables exist
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = {r[0] for r in cur.fetchall()}
        self.assertIn("browser_clients", tables)
        self.assertIn("domain_activity", tables)
        self.assertIn("media_sessions", tables)

    def test_02_atomic_upsert_activity_delta(self) -> None:
        """Verifies atomic delta accumulation on the same domain and date."""
        total1 = self.db.upsert_activity_delta("chrome", "youtube.com", 15, "2026-11-04")
        self.assertEqual(total1, 15)

        total2 = self.db.upsert_activity_delta("chrome", "youtube.com", 25, "2026-11-04")
        self.assertEqual(total2, 40)

        # Different browser on the same domain
        edge_total = self.db.upsert_activity_delta("edge", "youtube.com", 30, "2026-11-04")
        self.assertEqual(edge_total, 30)

    def test_03_concurrent_multi_browser_writes(self) -> None:
        """Stresses SQLite with 10 concurrent threads simultaneously writing deltas for Chrome & Edge."""
        errors = []
        threads = []
        iterations_per_thread = 20

        def worker(browser_type: str, domain: str) -> None:
            try:
                for _ in range(iterations_per_thread):
                    self.db.upsert_activity_delta(browser_type, domain, 5, "2026-11-04")
                    time.sleep(0.001)
            except Exception as e:
                errors.append(e)

        # 5 Chrome threads and 5 Edge threads
        for i in range(5):
            t = threading.Thread(target=worker, args=("chrome", f"site{i}.com"))
            threads.append(t)
            t2 = threading.Thread(target=worker, args=("edge", f"site{i}.com"))
            threads.append(t2)

        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(errors), 0, f"Concurrent database writes generated errors: {errors}")

        # Check total time recorded
        analytics = self.db.query_analytics("all", "2026-11-04")
        expected_total = 10 * iterations_per_thread * 5
        self.assertEqual(analytics["today_seconds"], expected_total)

    def test_04_media_session_lifecycle(self) -> None:
        """Verifies media session creation, duration expansion, and finalization."""
        # 1. Start media session
        self.db.upsert_media_session(
            session_id="sess_yt_1",
            browser_type="chrome",
            domain="youtube.com",
            title="Antigravity Architecture Overview",
            url="https://youtube.com/watch?v=123",
            watch_duration_seconds=10.0,
            peak_volume=0.9,
            average_volume=0.8,
            resolution_label="1080p60",
            started_at=1000.0,
            ended_at=None
        )

        # 2. Update duration
        self.db.upsert_media_session(
            session_id="sess_yt_1",
            browser_type="chrome",
            domain="youtube.com",
            watch_duration_seconds=65.5,
            peak_volume=1.0,
            average_volume=0.85,
            started_at=1000.0,
            ended_at=1065.5
        )

        analytics = self.db.query_analytics("chrome", "2026-11-04")
        recent = analytics["recent_media_sessions"]
        self.assertTrue(len(recent) >= 1)
        self.assertEqual(recent[0]["session_id"], "sess_yt_1")
        self.assertEqual(recent[0]["watch_duration_seconds"], 65.5)
        self.assertEqual(recent[0]["peak_volume"], 1.0)

    def test_05_unified_and_filtered_analytics(self) -> None:
        """Tests that 'all', 'chrome', and 'edge' filters return exact expected distributions."""
        target_date = "2026-11-04"
        prev_date = "2026-11-03"
        self.db.upsert_activity_delta("chrome", "youtube.com", 2000, prev_date)
        self.db.upsert_activity_delta("chrome", "github.com", 3600, target_date)
        self.db.upsert_activity_delta("chrome", "google.com", 1800, target_date)
        self.db.upsert_activity_delta("edge", "microsoft.com", 2400, target_date)
        self.db.upsert_activity_delta("edge", "github.com", 1200, target_date)

        # All browsers
        all_res = self.db.query_analytics("all", target_date)
        self.assertEqual(all_res["today_seconds"], 3600 + 1800 + 2400 + 1200)
        self.assertEqual(all_res["browser_breakdown"]["chrome"], 5400)
        self.assertEqual(all_res["browser_breakdown"]["edge"], 3600)
        self.assertEqual(all_res["all_time_seconds"], 2000 + 3600 + 1800 + 2400 + 1200)
        self.assertEqual(all_res["total_tracked_days"], 2)
        self.assertEqual(all_res["first_tracked_date"], "2026-11-03")
        all_time_domains = {d["domain"]: d["seconds"] for d in all_res["all_time_domain_distribution"]}
        today_domains = {d["domain"]: d["seconds"] for d in all_res["domain_distribution"]}
        self.assertIn("youtube.com", all_time_domains)
        self.assertNotIn("youtube.com", today_domains)

        # Chrome only
        chrome_res = self.db.query_analytics("chrome", target_date)
        self.assertEqual(chrome_res["today_seconds"], 5400)
        chrome_domains = {d["domain"]: d["seconds"] for d in chrome_res["domain_distribution"]}
        self.assertEqual(chrome_domains["github.com"], 3600)
        self.assertEqual(chrome_domains["google.com"], 1800)
        self.assertNotIn("microsoft.com", chrome_domains)

        # Edge only
        edge_res = self.db.query_analytics("edge", target_date)
        self.assertEqual(edge_res["today_seconds"], 3600)
        edge_domains = {d["domain"]: d["seconds"] for d in edge_res["domain_distribution"]}
        self.assertEqual(edge_domains["microsoft.com"], 2400)
        self.assertEqual(edge_domains["github.com"], 1200)
        self.assertNotIn("google.com", edge_domains)

    def test_06_websocket_server_e2e_communication(self) -> None:
        """Tests live RFC 6455 WebSocket communication, client registration, sync, and queries."""
        test_port = 65439
        server = BrowserDataHubServer(host="127.0.0.1", port=test_port, db_path=self.db_path)
        self.assertTrue(server.start(), "Server must start on test port")

        try:
            time.sleep(0.1)

            # 1. Connect Chrome Client
            chrome_client = RawWebSocketClient("127.0.0.1", test_port)
            self.assertTrue(chrome_client.connect(), "Chrome client handshake must succeed")

            test_user = os.environ.get("USERNAME", "TestUser")
            chrome_client.send_json({
                "type": "REGISTER_CLIENT",
                "client_id": "chrome_subagent_test",
                "browser_type": "chrome",
                "os_user": test_user
            })
            reg_res = chrome_client.recv_json()
            self.assertTrue(reg_res.get("success"))
            self.assertEqual(reg_res.get("browser_type"), "chrome")

            # 2. Connect Edge Client simultaneously
            edge_client = RawWebSocketClient("127.0.0.1", test_port)
            self.assertTrue(edge_client.connect(), "Edge client handshake must succeed")

            edge_client.send_json({
                "type": "REGISTER_CLIENT",
                "client_id": "edge_subagent_test",
                "browser_type": "edge",
                "os_user": test_user
            })
            edge_reg = edge_client.recv_json()
            self.assertTrue(edge_reg.get("success"))
            self.assertEqual(edge_reg.get("browser_type"), "edge")

            # 3. Send Delta from Chrome
            chrome_client.send_json({
                "type": "SYNC_ACTIVITY_DELTA",
                "browser_type": "chrome",
                "domain": "netflix.com",
                "seconds": 50,
                "date_str": "2026-11-04"
            })
            sync_res = chrome_client.recv_json()
            self.assertTrue(sync_res.get("success"))
            self.assertEqual(sync_res.get("total_seconds"), 50)

            # 4. Send Active Media Session from Edge
            edge_client.send_json({
                "type": "SYNC_MEDIA_SESSION",
                "session_id": "sess_edge_vid",
                "browser_type": "edge",
                "domain": "vimeo.com",
                "title": "Edge Media Playing",
                "duration": 12.0,
                "peak_vol": 0.95,
                "resolution": "4K",
                "is_playing": True,
                "has_video": True
            })
            media_res = edge_client.recv_json()
            self.assertTrue(media_res.get("success"))

            # 5. Query Live State (for HUD integration)
            chrome_client.send_json({"type": "QUERY_LIVE_STATE"})
            live_res = chrome_client.recv_json()
            self.assertTrue(live_res.get("success"))
            live_data = live_res.get("data", {})
            self.assertTrue(live_data.get("has_active_video"))
            self.assertEqual(live_data.get("active_streams_count"), 1)
            self.assertEqual(live_data.get("active_streams")[0]["domain"], "vimeo.com")

            # 6. Query Analytics via WebSocket
            edge_client.send_json({
                "type": "QUERY_ANALYTICS",
                "browser": "all",
                "date_str": "2026-11-04"
            })
            analytics_res = edge_client.recv_json()
            self.assertTrue(analytics_res.get("success"))
            data = analytics_res.get("data", {})
            self.assertTrue(data.get("today_seconds") >= 50)

            # 7. Heartbeat
            chrome_client.send_json({"type": "HEARTBEAT", "client_id": "chrome_subagent_test"})
            hb_res = chrome_client.recv_json()
            self.assertTrue(hb_res.get("success"))

            chrome_client.close()
            edge_client.close()

        finally:
            server.stop()

    def test_07_dual_tracking_foreground_and_background_media(self) -> None:
        db_file = os.path.join(self.temp_dir, "test_dual_tracking.db")
        db = DataHubDB(db_file)
        today = "2026-11-05"

        try:
            db.upsert_activity_delta("chrome", "youtube.com", 600, today, tracking_type="foreground")
            db.upsert_activity_delta("chrome", "youtube.com", 1200, today, tracking_type="background_media")
            db.upsert_activity_delta("chrome", "wikipedia.org", 300, today, tracking_type="foreground")

            res_all = db.query_analytics("all", today, tracking_mode="all")
            self.assertEqual(res_all["today_seconds"], 2100)
            self.assertEqual(res_all["today_foreground_seconds"], 900)
            self.assertEqual(res_all["today_background_media_seconds"], 1200)

            dist_all = {d["domain"]: d for d in res_all["domain_distribution"]}
            self.assertEqual(dist_all["youtube.com"]["seconds"], 1800)
            self.assertEqual(dist_all["youtube.com"]["foreground_seconds"], 600)
            self.assertEqual(dist_all["youtube.com"]["background_media_seconds"], 1200)
            self.assertEqual(dist_all["wikipedia.org"]["seconds"], 300)
            self.assertEqual(dist_all["wikipedia.org"]["foreground_seconds"], 300)
            self.assertEqual(dist_all["wikipedia.org"]["background_media_seconds"], 0)

            res_fg = db.query_analytics("all", today, tracking_mode="foreground")
            self.assertEqual(res_fg["today_seconds"], 900)
            dist_fg = {d["domain"]: d for d in res_fg["domain_distribution"]}
            self.assertEqual(dist_fg["youtube.com"]["seconds"], 600)
            self.assertEqual(dist_fg["wikipedia.org"]["seconds"], 300)

            res_bg = db.query_analytics("all", today, tracking_mode="background_media")
            self.assertEqual(res_bg["today_seconds"], 1200)
            dist_bg = {d["domain"]: d for d in res_bg["domain_distribution"]}
            self.assertEqual(dist_bg["youtube.com"]["seconds"], 1200)
            self.assertEqual(dist_bg["wikipedia.org"]["seconds"], 0)
        finally:
            db.close()

    def test_08_http_dashboard_and_health_endpoints(self) -> None:
        """Verifies HTTP GET /dashboard, /health, /status, and /api/analytics endpoints."""
        test_port = 65438
        server = BrowserDataHubServer(host="127.0.0.1", port=test_port, db_path=self.db_path)
        self.assertTrue(server.start(), "Server must start on test port")

        try:
            time.sleep(0.1)

            # 1. Test /health
            req = urllib.request.Request(f"http://127.0.0.1:{test_port}/health")
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertEqual(data.get("status"), "healthy")
                self.assertEqual(data.get("service"), "Browser Data Hub")

            # 2. Test /dashboard
            req = urllib.request.Request(f"http://127.0.0.1:{test_port}/dashboard")
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                html_body = resp.read().decode("utf-8")
                self.assertIn("Browser Data Hub Dashboard", html_body)
                self.assertIn("SQLite WAL Mode", html_body)

            # 3. Test /api/analytics
            req = urllib.request.Request(f"http://127.0.0.1:{test_port}/api/analytics")
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertIn("browser_breakdown", data)
                self.assertIn("today_seconds", data)
        finally:
            server.stop()


def run_all_tests() -> bool:
    """Entry point for automated test runner."""
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBrowserDataHub)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
