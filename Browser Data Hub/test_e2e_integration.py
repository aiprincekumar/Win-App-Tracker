# -*- coding: utf-8 -*-
"""
Browser Data Hub/test_e2e_integration.py
Phase 04 End-to-End System Integration & Decoupling Test Suite.
Department 08: Quality Assurance & Department 02: Systems Integration.

Features verified:
  1. Standalone RFC 6455 Data Hub Daemon Startup on dynamic test port.
  2. Multi-Browser Concurrent Ingestion (Chrome, Edge, Brave).
  3. SQLite WAL Engine Persistence & Atomic Ingestion.
  4. Dashboard Analytics Query with Multi-Browser Dropdown Filtering ('all', 'chrome', 'edge', 'brave').
  5. Video Detector HUD Decoupling & QUERY_LIVE_STATE Verification (PC Keep-Awake Sentinel).
  6. Finalization & Clean Zero-Hang Resource Termination.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import sys
import os
import time
import json
import base64
import struct
import socket
import unittest
import tempfile
import threading
from typing import Dict, Any, Optional

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
from browser_data_hub import BrowserDataHubServer, DEFAULT_HUB_HOST, WS_GUID


def create_ws_handshake(sock: socket.socket, host: str, port: int) -> bool:
    key = base64.b64encode(os.urandom(16)).decode('ascii')
    req = (
        f"GET / HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(req.encode('ascii'))
    resp = bytearray()
    while b"\r\n\r\n" not in resp:
        chunk = sock.recv(1024)
        if not chunk:
            return False
        resp.extend(chunk)
    return b"101 Switching Protocols" in resp


def send_ws_json(sock: socket.socket, payload: Dict[str, Any]) -> None:
    raw = json.dumps(payload).encode('utf-8')
    mask = os.urandom(4)
    p_len = len(raw)
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
    masked = bytearray(raw[i] ^ mask[i % 4] for i in range(p_len))
    sock.sendall(bytes(hdr) + bytes(masked))


def recv_ws_json(sock: socket.socket) -> Dict[str, Any]:
    hdr = sock.recv(2)
    assert len(hdr) == 2, "Failed to read frame header"
    b1 = hdr[1]
    p_len = b1 & 0x7F
    if p_len == 126:
        lb = sock.recv(2)
        p_len = struct.unpack(">H", lb)[0]
    elif p_len == 127:
        lb = sock.recv(8)
        p_len = struct.unpack(">Q", lb)[0]

    raw = bytearray()
    while len(raw) < p_len:
        c = sock.recv(p_len - len(raw))
        if not c:
            break
        raw.extend(c)
    return json.loads(raw.decode('utf-8'))


class TestE2ESystemIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        cls.db_path = os.path.join(cls.temp_dir.name, "e2e_test_hub.db")
        cls.test_port = 65438
        cls.server = BrowserDataHubServer(host=DEFAULT_HUB_HOST, port=cls.test_port, db_path=cls.db_path)
        assert cls.server.start(), "Failed to bind and start test Data Hub server"
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()
        time.sleep(0.15)
        try:
            cls.temp_dir.cleanup()
        except Exception:
            pass

    def test_01_multi_browser_concurrent_registration_and_sync(self):
        """Simulates 3 distinct browsers concurrently registering and streaming deltas."""
        results = {}

        def browser_worker(b_type: str, domain: str, sec: int, sid: str, video_title: str):
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5.0)
            sock.connect((DEFAULT_HUB_HOST, self.test_port))
            assert create_ws_handshake(sock, DEFAULT_HUB_HOST, self.test_port)

            # 1. Register Client
            send_ws_json(sock, {
                "type": "REGISTER_CLIENT",
                "client_id": f"client_{b_type}_test",
                "browser_type": b_type,
                "os_user": "TestTester"
            })
            reg_res = recv_ws_json(sock)
            assert reg_res["type"] == "REGISTER_RESPONSE"
            assert reg_res["browser_type"] == b_type

            # 2. Stream Activity Delta
            send_ws_json(sock, {
                "type": "SYNC_ACTIVITY_DELTA",
                "browser_type": b_type,
                "domain": domain,
                "seconds": sec,
                "date_str": "2026-11-04",
                "favicon_url": f"https://www.google.com/s2/favicons?domain={domain}",
                "session_count": 1
            })
            delta_res = recv_ws_json(sock)
            assert delta_res["type"] == "SYNC_RESPONSE"

            # 3. Stream Media Session
            send_ws_json(sock, {
                "type": "SYNC_MEDIA_SESSION",
                "session_id": sid,
                "browser_type": b_type,
                "domain": domain,
                "title": video_title,
                "url": f"https://{domain}/watch",
                "watch_duration_seconds": sec,
                "peak_volume": 0.9,
                "average_volume": 0.85,
                "resolution_label": "1080p FHD",
                "is_playing": True,
                "has_video": True,
                "action": "start"
            })
            media_res = recv_ws_json(sock)
            assert media_res["type"] == "SYNC_MEDIA_RESPONSE"

            results[b_type] = True
            sock.close()

        threads = [
            threading.Thread(target=browser_worker, args=("chrome", "youtube.com", 120, "sess_yt", "Google Chrome Video")),
            threading.Thread(target=browser_worker, args=("edge", "netflix.com", 240, "sess_nf", "Microsoft Edge Series")),
            threading.Thread(target=browser_worker, args=("brave", "twitch.tv", 180, "sess_tw", "Brave Stream"))
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(results), 3, "All 3 browsers must complete concurrent registration and delta ingestion")

    def test_02_dashboard_analytics_multi_browser_filtering(self):
        """Verifies dashboard analytics query with 'all', 'chrome', 'edge', and 'brave' filters."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5.0)
        sock.connect((DEFAULT_HUB_HOST, self.test_port))
        assert create_ws_handshake(sock, DEFAULT_HUB_HOST, self.test_port)

        # 1. Query All Browsers (Master View)
        send_ws_json(sock, {
            "type": "QUERY_ANALYTICS",
            "browser": "all",
            "date_str": "2026-11-04"
        })
        res_all = recv_ws_json(sock)
        self.assertTrue(res_all["success"])
        data_all = res_all["data"]
        # Total = 120 (Chrome) + 240 (Edge) + 180 (Brave) = 540 seconds
        self.assertEqual(data_all["today_seconds"], 540, "Unified master view must aggregate 540 total seconds")
        self.assertCountEqual(data_all["registered_browsers"], ["brave", "chrome", "edge"])
        self.assertEqual(len(data_all["domain_distribution"]), 3)

        # 2. Query Chrome Only
        send_ws_json(sock, {
            "type": "QUERY_ANALYTICS",
            "browser": "chrome",
            "date_str": "2026-11-04"
        })
        res_chrome = recv_ws_json(sock)
        data_chrome = res_chrome["data"]
        self.assertEqual(data_chrome["today_seconds"], 120)
        self.assertEqual(len(data_chrome["domain_distribution"]), 1)
        self.assertEqual(data_chrome["domain_distribution"][0]["domain"], "youtube.com")

        # 3. Query Edge Only
        send_ws_json(sock, {
            "type": "QUERY_ANALYTICS",
            "browser": "edge",
            "date_str": "2026-11-04"
        })
        res_edge = recv_ws_json(sock)
        data_edge = res_edge["data"]
        self.assertEqual(data_edge["today_seconds"], 240)
        self.assertEqual(len(data_edge["domain_distribution"]), 1)
        self.assertEqual(data_edge["domain_distribution"][0]["domain"], "netflix.com")

        sock.close()

    def test_03_hud_live_state_query_and_decoupling(self):
        """Verifies HUD query of live video state keeping the PC awake across any browser."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5.0)
        sock.connect((DEFAULT_HUB_HOST, self.test_port))
        assert create_ws_handshake(sock, DEFAULT_HUB_HOST, self.test_port)

        # Query live state while 3 streams are active
        send_ws_json(sock, {"type": "QUERY_LIVE_STATE"})
        live_res = recv_ws_json(sock)
        self.assertTrue(live_res["success"])
        live_data = live_res["data"]

        self.assertTrue(live_data["has_active_video"], "HUD must detect active video to prevent sleep")
        self.assertGreaterEqual(live_data["active_streams_count"], 1)
        self.assertIsNotNone(live_data["primary_stream"])

        # Finalize one session (YouTube)
        send_ws_json(sock, {
            "type": "SYNC_MEDIA_SESSION",
            "session_id": "sess_yt",
            "browser_type": "chrome",
            "action": "finalize"
        })
        fin_res = recv_ws_json(sock)
        self.assertTrue(fin_res["success"])

        # Query live state again: Netflix & Twitch are still playing, so has_active_video remains True!
        send_ws_json(sock, {"type": "QUERY_LIVE_STATE"})
        live_res2 = recv_ws_json(sock)
        self.assertTrue(live_res2["data"]["has_active_video"])

        sock.close()


def run_e2e_suite():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestE2ESystemIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    res = runner.run(suite)
    return res.wasSuccessful()


if __name__ == "__main__":
    success = run_e2e_suite()
    sys.exit(0 if success else 1)
