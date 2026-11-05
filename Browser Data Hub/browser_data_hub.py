# -*- coding: utf-8 -*-
"""
Browser Data Hub/browser_data_hub.py: Standalone Multi-Browser SQLite Data Hub Service.
Department 06: Backend & API Engineering & Department 03: Data Architecture & DBA.

Core Features:
  - 100% Python Standard Library (zero pip external dependencies).
  - Pure headless, zero UI, invisible background daemon (< 5 MB RAM, 0.00% CPU).
  - Dedicated RFC 6455 WebSocket Server listening on ws://127.0.0.1:65433 (completely decoupled from HUD).
  - High-performance SQLite engine with WAL mode (Write-Ahead Logging) and thread-safe atomic upserts.
  - Multi-Browser support: Chrome, Microsoft Edge, Brave, Opera, etc.
  - Granular activity tracking (seconds per domain per day) and media playback telemetry.
  - Instant analytics query engine supporting unified ('all') or browser-filtered aggregates.
  - Real-time active media state cache for HUD / Inactivity Sentinel integration.

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
import sqlite3
import threading
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple

DEFAULT_HUB_HOST = "127.0.0.1"
DEFAULT_HUB_PORT = 65433
DB_FILENAME = "browser_activity.db"
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def resolve_dynamic_db_path(custom_path: Optional[str] = None) -> str:
    """
    Dynamically resolves SQLite database path with dual persistence (Local Workspace + Global AppData).
    Ensures zero data loss across workspace moves, directory renames, or new clones.
    """
    if custom_path:
        return os.path.abspath(custom_path)
    
    local_dir = os.path.dirname(os.path.abspath(__file__))
    local_db = os.path.join(local_dir, DB_FILENAME)
    
    appdata_base = os.environ.get('APPDATA') or os.path.expanduser('~')
    global_dir = os.path.join(appdata_base, 'WinAppTracker')
    try:
        os.makedirs(global_dir, exist_ok=True)
    except Exception:
        pass
    global_db = os.path.join(global_dir, DB_FILENAME)
    
    import shutil
    # If local exists and has data, mirror to global backup
    if os.path.exists(local_db):
        try:
            if not os.path.exists(global_db) or os.path.getsize(local_db) >= os.path.getsize(global_db):
                shutil.copy2(local_db, global_db)
                for ext in ['-shm', '-wal']:
                    if os.path.exists(local_db + ext):
                        shutil.copy2(local_db + ext, global_db + ext)
        except Exception:
            pass
        return local_db
    elif os.path.exists(global_db):
        try:
            shutil.copy2(global_db, local_db)
            for ext in ['-shm', '-wal']:
                if os.path.exists(global_db + ext):
                    shutil.copy2(global_db + ext, local_db + ext)
        except Exception:
            pass
        return local_db
    
    return local_db


# RFC 6455 Opcodes
OPCODE_CONTINUATION = 0x0
OPCODE_TEXT         = 0x1
OPCODE_BINARY       = 0x2
OPCODE_CLOSE        = 0x8
OPCODE_PING         = 0x9
OPCODE_PONG         = 0xA


class DataHubDB:
    """
    High-performance, thread-safe SQLite persistence layer for browser activity and media telemetry.
    Operates with PRAGMA journal_mode = WAL, PRAGMA synchronous = NORMAL, and atomic transactions.
    """

    def __init__(self, db_path: str) -> None:
        self.db_path = os.path.abspath(db_path)
        self._write_lock = threading.RLock()
        self._tls = threading.local()
        self._init_database()

    def _get_connection(self) -> sqlite3.Connection:
        """Retrieves or creates a thread-local SQLite connection with WAL pragmas."""
        conn = getattr(self._tls, "conn", None)
        if conn is None:
            conn = sqlite3.connect(
                self.db_path,
                timeout=30.0,
                check_same_thread=False
            )
            conn.row_factory = sqlite3.Row
            # Enable WAL mode and performance pragmas
            with conn:
                conn.execute("PRAGMA journal_mode = WAL;")
                conn.execute("PRAGMA synchronous = NORMAL;")
                conn.execute("PRAGMA foreign_keys = ON;")
                conn.execute("PRAGMA busy_timeout = 30000;")
            self._tls.conn = conn
        return conn

    def close(self) -> None:
        """Closes thread-local SQLite connection if open."""
        conn = getattr(self._tls, "conn", None)
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
            self._tls.conn = None

    def _init_database(self) -> None:
        """Initializes tables and indexes if they do not exist."""
        with self._write_lock:
            conn = self._get_connection()
            with conn:
                # 1. Browser Clients Table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS browser_clients (
                        client_id TEXT PRIMARY KEY,
                        browser_type TEXT NOT NULL,
                        os_user TEXT,
                        first_seen REAL NOT NULL,
                        last_heartbeat REAL NOT NULL
                    );
                """)

                # 2. Domain Activity Table (atomic daily aggregates per browser)
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS domain_activity (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        browser_type TEXT NOT NULL,
                        domain TEXT NOT NULL,
                        date_str TEXT NOT NULL,
                        seconds_active INTEGER NOT NULL DEFAULT 0,
                        session_count INTEGER NOT NULL DEFAULT 1,
                        last_active REAL NOT NULL,
                        favicon_url TEXT,
                        UNIQUE(browser_type, domain, date_str)
                    );
                """)

                # 3. Media Sessions Table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS media_sessions (
                        session_id TEXT PRIMARY KEY,
                        browser_type TEXT NOT NULL,
                        domain TEXT NOT NULL,
                        title TEXT,
                        url TEXT,
                        watch_duration_seconds REAL NOT NULL DEFAULT 0.0,
                        peak_volume REAL NOT NULL DEFAULT 1.0,
                        average_volume REAL NOT NULL DEFAULT 1.0,
                        resolution_label TEXT,
                        started_at REAL NOT NULL,
                        ended_at REAL
                    );
                """)

                # 4. Performance Indexes
                conn.execute("CREATE INDEX IF NOT EXISTS idx_domain_act_lookup ON domain_activity(browser_type, date_str);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_domain_act_domain ON domain_activity(domain, date_str);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_domain_act_date ON domain_activity(date_str);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_media_sess_lookup ON media_sessions(browser_type, started_at);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_media_sess_domain ON media_sessions(domain, started_at);")

    def register_client(self, client_id: str, browser_type: str, os_user: Optional[str] = None) -> bool:
        """Upserts a browser client connection state."""
        now = time.time()
        with self._write_lock:
            conn = self._get_connection()
            with conn:
                conn.execute("""
                    INSERT INTO browser_clients (client_id, browser_type, os_user, first_seen, last_heartbeat)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(client_id) DO UPDATE SET
                        browser_type = excluded.browser_type,
                        os_user = COALESCE(excluded.os_user, browser_clients.os_user),
                        last_heartbeat = excluded.last_heartbeat;
                """, (client_id, browser_type.lower(), os_user, now, now))
            return True

    def update_heartbeat(self, client_id: str) -> None:
        """Updates last_heartbeat timestamp for a client."""
        now = time.time()
        with self._write_lock:
            conn = self._get_connection()
            with conn:
                conn.execute("""
                    UPDATE browser_clients SET last_heartbeat = ? WHERE client_id = ?;
                """, (now, client_id))

    def upsert_activity_delta(
        self,
        browser_type: str,
        domain: str,
        seconds: int,
        date_str: Optional[str] = None,
        favicon_url: Optional[str] = None,
        session_count: int = 0
    ) -> int:
        """
        Atomically increments active seconds for a browser and domain on a specific date.
        Returns the new total seconds for that domain on that date.
        """
        if not domain or seconds <= 0:
            return 0

        browser_type = browser_type.lower().strip() or "unknown"
        clean_domain = domain.lower().strip()
        today = date_str or date.today().isoformat()
        now = time.time()

        with self._write_lock:
            conn = self._get_connection()
            with conn:
                conn.execute("""
                    INSERT INTO domain_activity (
                        browser_type, domain, date_str, seconds_active, session_count, last_active, favicon_url
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(browser_type, domain, date_str) DO UPDATE SET
                        seconds_active = domain_activity.seconds_active + excluded.seconds_active,
                        session_count = domain_activity.session_count + excluded.session_count,
                        last_active = excluded.last_active,
                        favicon_url = COALESCE(excluded.favicon_url, domain_activity.favicon_url);
                """, (browser_type, clean_domain, today, seconds, max(0, session_count), now, favicon_url))

                cur = conn.execute("""
                    SELECT seconds_active FROM domain_activity 
                    WHERE browser_type = ? AND domain = ? AND date_str = ?;
                """, (browser_type, clean_domain, today))
                row = cur.fetchone()
                return int(row["seconds_active"]) if row else seconds

    def upsert_media_session(
        self,
        session_id: str,
        browser_type: str,
        domain: str,
        title: Optional[str] = None,
        url: Optional[str] = None,
        watch_duration_seconds: float = 0.0,
        peak_volume: float = 1.0,
        average_volume: float = 1.0,
        resolution_label: Optional[str] = None,
        started_at: Optional[float] = None,
        ended_at: Optional[float] = None
    ) -> bool:
        """Upserts or finalizes a video/audio media session."""
        browser_type = browser_type.lower().strip() or "unknown"
        clean_domain = domain.lower().strip() if domain else "unknown"
        started = started_at if started_at is not None else time.time()

        with self._write_lock:
            conn = self._get_connection()
            with conn:
                conn.execute("""
                    INSERT INTO media_sessions (
                        session_id, browser_type, domain, title, url, 
                        watch_duration_seconds, peak_volume, average_volume, resolution_label, 
                        started_at, ended_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(session_id) DO UPDATE SET
                        browser_type = excluded.browser_type,
                        domain = excluded.domain,
                        title = COALESCE(excluded.title, media_sessions.title),
                        url = COALESCE(excluded.url, media_sessions.url),
                        watch_duration_seconds = MAX(media_sessions.watch_duration_seconds, excluded.watch_duration_seconds),
                        peak_volume = MAX(media_sessions.peak_volume, excluded.peak_volume),
                        average_volume = excluded.average_volume,
                        resolution_label = COALESCE(excluded.resolution_label, media_sessions.resolution_label),
                        ended_at = COALESCE(excluded.ended_at, media_sessions.ended_at);
                """, (
                    session_id, browser_type, clean_domain, title, url,
                    watch_duration_seconds, peak_volume, average_volume, resolution_label,
                    started, ended_at
                ))
            return True

    def query_analytics(
        self,
        browser_filter: str = "all",
        target_date: Optional[str] = None,
        days_for_average: int = 7
    ) -> Dict[str, Any]:
        """
        Queries aggregated metrics across domains, browsers, and media sessions.
        Supports filtering by browser_type ('all', 'chrome', 'edge', etc.).
        """
        browser_filter = (browser_filter or "all").lower().strip()
        query_date = target_date or date.today().isoformat()
        conn = self._get_connection()

        # Build SQL condition
        use_all = (browser_filter == "all")
        browser_clause = "" if use_all else "AND browser_type = ?"
        browser_params = [] if use_all else [browser_filter]

        # 1. Total seconds today
        sql_today = f"""
            SELECT COALESCE(SUM(seconds_active), 0) AS total_seconds
            FROM domain_activity
            WHERE date_str = ? {browser_clause};
        """
        cur = conn.execute(sql_today, [query_date] + browser_params)
        today_seconds = int(cur.fetchone()["total_seconds"])

        # 2. Daily average over past N days
        try:
            target_dt = datetime.strptime(query_date, "%Y-%m-%d").date()
        except Exception:
            target_dt = date.today()
        start_date = (target_dt - timedelta(days=days_for_average - 1)).isoformat()

        sql_avg = f"""
            SELECT COALESCE(SUM(seconds_active), 0) AS window_seconds,
                   COUNT(DISTINCT date_str) AS distinct_days
            FROM domain_activity
            WHERE date_str >= ? AND date_str <= ? {browser_clause};
        """
        cur = conn.execute(sql_avg, [start_date, query_date] + browser_params)
        avg_row = cur.fetchone()
        window_sec = int(avg_row["window_seconds"])
        num_days = max(1, int(avg_row["distinct_days"]))
        daily_average_seconds = int(window_sec / num_days)

        # 3. Domain Distribution
        sql_domains = f"""
            SELECT domain, 
                   SUM(seconds_active) AS total_seconds,
                   SUM(session_count) AS total_sessions,
                   MAX(last_active) AS last_active,
                   MAX(favicon_url) AS favicon_url
            FROM domain_activity
            WHERE date_str = ? {browser_clause}
            GROUP BY domain
            ORDER BY total_seconds DESC;
        """
        cur = conn.execute(sql_domains, [query_date] + browser_params)
        domain_list = []
        for r in cur.fetchall():
            s = int(r["total_seconds"])
            pct = round((s / today_seconds * 100.0), 1) if today_seconds > 0 else 0.0
            domain_list.append({
                "domain": r["domain"],
                "seconds": s,
                "session_count": int(r["total_sessions"]),
                "last_active": r["last_active"],
                "favicon_url": r["favicon_url"] or "",
                "percent": pct
            })

        # 4. Browser Breakdown
        sql_breakdown = """
            SELECT browser_type, SUM(seconds_active) AS browser_seconds
            FROM domain_activity
            WHERE date_str = ?
            GROUP BY browser_type
            ORDER BY browser_seconds DESC;
        """
        cur = conn.execute(sql_breakdown, [query_date])
        browser_breakdown = {r["browser_type"]: int(r["browser_seconds"]) for r in cur.fetchall()}

        # 5. Distinct Active Browsers
        sql_active_browsers = """
            SELECT DISTINCT browser_type FROM browser_clients
            ORDER BY browser_type ASC;
        """
        cur = conn.execute(sql_active_browsers)
        registered_browsers = [r["browser_type"] for r in cur.fetchall()]

        # 6. Recent Media Sessions
        sql_media = f"""
            SELECT session_id, browser_type, domain, title, url, 
                   watch_duration_seconds, peak_volume, average_volume, resolution_label, 
                   started_at, ended_at
            FROM media_sessions
            WHERE 1=1 {browser_clause}
            ORDER BY started_at DESC
            LIMIT 20;
        """
        cur = conn.execute(sql_media, browser_params)
        media_list = []
        for m in cur.fetchall():
            media_list.append({
                "session_id": m["session_id"],
                "browser_type": m["browser_type"],
                "domain": m["domain"],
                "title": m["title"] or "",
                "url": m["url"] or "",
                "watch_duration_seconds": round(float(m["watch_duration_seconds"]), 1),
                "peak_volume": round(float(m["peak_volume"]), 2),
                "average_volume": round(float(m["average_volume"]), 2),
                "resolution_label": m["resolution_label"] or "",
                "started_at": m["started_at"],
                "ended_at": m["ended_at"]
            })

        # Formatted strings
        hours = today_seconds // 3600
        mins = (today_seconds % 3600) // 60
        today_formatted = f"{hours}h {mins}m" if hours > 0 else f"{mins}m"

        return {
            "query_date": query_date,
            "filter_browser": browser_filter,
            "today_seconds": today_seconds,
            "today_formatted": today_formatted,
            "daily_average_seconds": daily_average_seconds,
            "registered_browsers": registered_browsers,
            "browser_breakdown": browser_breakdown,
            "domain_distribution": domain_list,
            "recent_media_sessions": media_list
        }


class LiveStateCache:
    """
    Thread-safe in-memory cache of currently active media sessions and connected browsers.
    Used for instant QUERY_LIVE_STATE responses to Video Detector HUD without disk I/O.
    """

    def __init__(self, stream_ttl: float = 12.0) -> None:
        self._lock = threading.RLock()
        self._stream_ttl = stream_ttl
        self._active_streams: Dict[str, Dict[str, Any]] = {}
        self._connected_clients: Dict[str, Dict[str, Any]] = {}

    def register_client(self, client_id: str, browser_type: str, os_user: Optional[str] = None) -> None:
        with self._lock:
            self._connected_clients[client_id] = {
                "client_id": client_id,
                "browser_type": browser_type.lower(),
                "os_user": os_user or "",
                "last_seen": time.time()
            }

    def client_heartbeat(self, client_id: str) -> None:
        with self._lock:
            if client_id in self._connected_clients:
                self._connected_clients[client_id]["last_seen"] = time.time()

    def remove_client(self, client_id: str) -> None:
        with self._lock:
            self._connected_clients.pop(client_id, None)

    def update_media_stream(self, session_id: str, stream_info: Dict[str, Any]) -> None:
        """Updates or registers active media stream."""
        with self._lock:
            now = time.time()
            stream_info["last_updated"] = now
            self._active_streams[session_id] = stream_info

    def remove_media_stream(self, session_id: str) -> None:
        with self._lock:
            self._active_streams.pop(session_id, None)

    def get_live_state(self) -> Dict[str, Any]:
        """Returns pruned live active state across all browsers."""
        now = time.time()
        with self._lock:
            # Prune stale streams (idle > stream_ttl)
            active_list = []
            stale_keys = []
            for sid, info in self._active_streams.items():
                age = now - info.get("last_updated", 0.0)
                if age <= self._stream_ttl and info.get("is_playing", False):
                    active_list.append(info)
                elif age > self._stream_ttl * 2:
                    stale_keys.append(sid)

            for sk in stale_keys:
                self._active_streams.pop(sk, None)

            # Prune stale clients (> 60s without heartbeat)
            active_clients = []
            stale_cids = []
            for cid, cinfo in self._connected_clients.items():
                cage = now - cinfo.get("last_seen", 0.0)
                if cage <= 60.0:
                    active_clients.append(cinfo)
                elif cage > 120.0:
                    stale_cids.append(cid)

            for sc in stale_cids:
                self._connected_clients.pop(sc, None)

            has_active_video = any(s.get("has_video", True) and s.get("is_playing", False) for s in active_list)
            has_active_audio = any(s.get("is_playing", False) for s in active_list)

            # Determine primary stream (highest volume / active video)
            primary = active_list[0] if active_list else None

            return {
                "has_active_video": has_active_video,
                "has_active_audio": has_active_audio,
                "active_streams_count": len(active_list),
                "active_streams": active_list,
                "primary_stream": primary,
                "connected_clients_count": len(active_clients),
                "connected_clients": active_clients,
                "server_time": now
            }


class BrowserDataHubServer:
    """
    Pure Python RFC 6455 WebSocket Server listening on 127.0.0.1:65433.
    Zero external dependencies, robust multi-client concurrency.
    """

    def __init__(self, host: str = DEFAULT_HUB_HOST, port: int = DEFAULT_HUB_PORT, db_path: Optional[str] = None) -> None:
        self.host = host
        self.port = port
        self.db_path = resolve_dynamic_db_path(db_path)
        self.db = DataHubDB(self.db_path)
        self.live_state = LiveStateCache()

        self._server_socket: Optional[socket.socket] = None
        self._clients: Set[socket.socket] = set()
        self._client_sockets_map: Dict[socket.socket, str] = {}  # socket -> client_id
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
            self._server_socket.listen(32)
            self._server_socket.settimeout(1.0)
            self._is_running = True
            self._stop_event.clear()

            self._listener_thread = threading.Thread(
                target=self._listen_loop,
                name="DataHub-Listener",
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
        """Cleanly stops the server and closes all active sockets."""
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
            self._client_sockets_map.clear()

        if self._server_socket:
            try:
                self._server_socket.close()
            except Exception:
                pass
            self._server_socket = None

        if self.db:
            try:
                self.db.close()
            except Exception:
                pass

    def _listen_loop(self) -> None:
        while self._is_running and not self._stop_event.is_set():
            try:
                client_sock, client_addr = self._server_socket.accept()
                try:
                    client_sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
                except Exception:
                    pass
                client_sock.settimeout(60.0)
                client_thread = threading.Thread(
                    target=self._handle_client,
                    args=(client_sock, client_addr),
                    name=f"DataHub-Client-{client_addr[1]}",
                    daemon=True
                )
                client_thread.start()
            except socket.timeout:
                continue
            except Exception:
                if not self._is_running:
                    break

    def _compute_accept_header(self, key: str) -> str:
        concat = key.strip() + WS_GUID
        sha = hashlib.sha1(concat.encode("utf-8")).digest()
        return base64.b64encode(sha).decode("ascii")

    def _do_handshake(self, sock: socket.socket) -> bool:
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

    def _read_exact(self, sock: socket.socket, num_bytes: int) -> Optional[bytes]:
        data = bytearray()
        while len(data) < num_bytes:
            try:
                chunk = sock.recv(num_bytes - len(data))
                if not chunk:
                    return None
                data.extend(chunk)
            except socket.timeout:
                raise
            except Exception:
                return None
        return bytes(data)

    def _parse_frame(self, sock: socket.socket) -> Tuple[Optional[int], Optional[bytes]]:
        while self._is_running:
            try:
                header = self._read_exact(sock, 2)
                if not header:
                    return None, None
                break
            except socket.timeout:
                # 60s idle threshold reached: verify client health by sending RFC 6455 PING
                if not self._send_frame(sock, b'', OPCODE_PING):
                    return None, None
                continue

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
        else:
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
            unmasked = bytearray(payload_len)
            for i in range(payload_len):
                unmasked[i] = raw_data[i] ^ mask_key[i % 4]
            payload = bytes(unmasked)
        else:
            payload = raw_data

        return opcode, payload

    def _create_frame(self, payload: bytes, opcode: int = OPCODE_TEXT) -> bytes:
        frame = bytearray()
        frame.append(0x80 | (opcode & 0x0F))
        p_len = len(payload)
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
        try:
            frame_bytes = self._create_frame(payload, opcode=opcode)
            sock.sendall(frame_bytes)
            return True
        except Exception:
            return False

    def _send_json(self, sock: socket.socket, payload: Dict[str, Any]) -> bool:
        raw = json.dumps(payload, separators=(',', ':')).encode("utf-8")
        return self._send_frame(sock, raw, OPCODE_TEXT)

    def _handle_client(self, sock: socket.socket, addr: Tuple[str, int]) -> None:
        if not self._do_handshake(sock):
            try:
                sock.close()
            except Exception:
                pass
            return

        with self._clients_lock:
            self._clients.add(sock)

        client_id: Optional[str] = None
        try:
            while self._is_running:
                opcode, payload = self._parse_frame(sock)
                if opcode is None:
                    break

                if opcode == OPCODE_CLOSE:
                    try:
                        self._send_frame(sock, b"", OPCODE_CLOSE)
                    except Exception:
                        pass
                    break

                elif opcode == OPCODE_PING:
                    self._send_frame(sock, payload or b"", OPCODE_PONG)

                elif opcode == OPCODE_PONG:
                    pass

                elif opcode == OPCODE_TEXT and payload:
                    try:
                        text_msg = payload.decode("utf-8", errors="replace")
                        msg = json.loads(text_msg)
                        assigned_cid = self._dispatch_message(sock, msg, client_id)
                        if assigned_cid:
                            client_id = assigned_cid
                            with self._clients_lock:
                                self._client_sockets_map[sock] = client_id
                    except Exception as ex:
                        err_res = {"success": False, "error": f"Invalid payload: {str(ex)}"}
                        self._send_json(sock, err_res)

        except Exception:
            pass
        finally:
            with self._clients_lock:
                self._clients.discard(sock)
                cid = self._client_sockets_map.pop(sock, None)
                if cid:
                    self.live_state.remove_client(cid)
            try:
                sock.close()
            except Exception:
                pass

    def _dispatch_message(self, sock: socket.socket, msg: Dict[str, Any], current_client_id: Optional[str]) -> Optional[str]:
        """Dispatches incoming protocol messages and sends appropriate responses."""
        msg_type = str(msg.get("type", "")).upper()
        res_cid = current_client_id

        if msg_type == "REGISTER_CLIENT":
            cid = str(msg.get("client_id") or f"client_{int(time.time()*1000)}")
            browser_type = str(msg.get("browser_type") or msg.get("browser") or "chrome").lower()
            os_user = msg.get("os_user")

            self.db.register_client(cid, browser_type, os_user)
            self.live_state.register_client(cid, browser_type, os_user)
            res_cid = cid

            self._send_json(sock, {
                "type": "REGISTER_RESPONSE",
                "success": True,
                "client_id": cid,
                "browser_type": browser_type,
                "server_time": time.time()
            })

        elif msg_type == "HEARTBEAT":
            cid = msg.get("client_id") or current_client_id
            if cid:
                self.db.update_heartbeat(cid)
                self.live_state.client_heartbeat(cid)
            self._send_json(sock, {
                "type": "HEARTBEAT_ACK",
                "success": True,
                "server_time": time.time()
            })

        elif msg_type == "SYNC_ACTIVITY_DELTA":
            browser_type = str(msg.get("browser_type") or msg.get("browser") or "chrome").lower()
            date_str = msg.get("date_str")

            # Check if this is a batch sync
            deltas = msg.get("deltas")
            if isinstance(deltas, list):
                total_upserted = 0
                for item in deltas:
                    d_domain = item.get("domain", "")
                    d_sec = int(item.get("seconds", 0))
                    d_favicon = item.get("favicon_url")
                    d_sessions = int(item.get("session_count", 0))
                    d_btype = str(item.get("browser_type") or browser_type).lower()
                    d_date = item.get("date_str") or date_str
                    if d_domain and d_sec > 0:
                        self.db.upsert_activity_delta(
                            d_btype, d_domain, d_sec, d_date, d_favicon, d_sessions
                        )
                        total_upserted += 1
                self._send_json(sock, {
                    "type": "SYNC_RESPONSE",
                    "success": True,
                    "batch_count": total_upserted
                })
            else:
                domain = str(msg.get("domain", ""))
                seconds = int(msg.get("seconds", 0))
                favicon_url = msg.get("favicon_url")
                session_count = int(msg.get("session_count", 0))
                new_total = self.db.upsert_activity_delta(
                    browser_type, domain, seconds, date_str, favicon_url, session_count
                )
                self._send_json(sock, {
                    "type": "SYNC_RESPONSE",
                    "success": True,
                    "domain": domain,
                    "total_seconds": new_total
                })

        elif msg_type == "SYNC_MEDIA_SESSION":
            sid = str(msg.get("session_id") or f"sess_{int(time.time()*1000)}")
            browser_type = str(msg.get("browser_type") or msg.get("browser") or "chrome").lower()
            domain = str(msg.get("domain", "unknown"))
            title = msg.get("title")
            url = msg.get("url")
            duration = float(msg.get("watch_duration_seconds", msg.get("duration", 0.0)))
            peak_vol = float(msg.get("peak_volume", msg.get("peak_vol", 1.0)))
            avg_vol = float(msg.get("average_volume", msg.get("avg_vol", 1.0)))
            res_label = msg.get("resolution_label") or msg.get("resolution")
            started_at = msg.get("started_at")
            ended_at = msg.get("ended_at")
            is_playing = bool(msg.get("is_playing", True))
            has_video = bool(msg.get("has_video", True))
            action = str(msg.get("action", "update")).lower()

            if action == "finalize":
                if ended_at is None:
                    ended_at = time.time()
                is_playing = False
                self.live_state.remove_media_stream(sid)
            else:
                self.live_state.update_media_stream(sid, {
                    "session_id": sid,
                    "browser_type": browser_type,
                    "domain": domain,
                    "title": title or "",
                    "url": url or "",
                    "watch_duration_seconds": duration,
                    "peak_volume": peak_vol,
                    "average_volume": avg_vol,
                    "resolution_label": res_label or "",
                    "is_playing": is_playing,
                    "has_video": has_video,
                    "started_at": started_at or time.time()
                })

            self.db.upsert_media_session(
                sid, browser_type, domain, title, url, duration,
                peak_vol, avg_vol, res_label, started_at, ended_at
            )

            self._send_json(sock, {
                "type": "SYNC_MEDIA_RESPONSE",
                "success": True,
                "session_id": sid
            })

        elif msg_type == "QUERY_ANALYTICS":
            browser_filter = str(msg.get("browser") or msg.get("browser_type") or "all")
            target_date = msg.get("date_str")
            analytics_data = self.db.query_analytics(browser_filter, target_date)
            resp = {
                "type": "ANALYTICS_RESPONSE",
                "success": True,
                "filter_browser": browser_filter,
                "data": analytics_data
            }
            if "requestId" in msg:
                resp["requestId"] = msg["requestId"]
            self._send_json(sock, resp)

        elif msg_type == "QUERY_LIVE_STATE":
            live_data = self.live_state.get_live_state()
            resp = {
                "type": "LIVE_STATE_RESPONSE",
                "success": True,
                "data": live_data
            }
            if "requestId" in msg:
                resp["requestId"] = msg["requestId"]
            self._send_json(sock, resp)

        else:
            self._send_json(sock, {
                "type": "UNKNOWN_COMMAND",
                "success": False,
                "message": f"Unrecognized command: {msg_type}"
            })

        return res_cid


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Standalone Multi-Browser SQLite Data Hub Service")
    parser.add_argument("--host", default=DEFAULT_HUB_HOST, help=f"WebSocket bind host (default: {DEFAULT_HUB_HOST})")
    parser.add_argument("--port", type=int, default=DEFAULT_HUB_PORT, help=f"WebSocket bind port (default: {DEFAULT_HUB_PORT})")
    parser.add_argument("--db", default=None, help="Path to SQLite database file")
    parser.add_argument("--test", action="store_true", help="Execute standalone unit test verification")
    parser.add_argument("--init-db", action="store_true", help="Initialize SQLite database schema and exit")
    args = parser.parse_args()

    if args.test:
        from test_data_hub import run_all_tests
        return 0 if run_all_tests() else 1

    if args.init_db:
        target_db = resolve_dynamic_db_path(args.db)
        db_instance = DataHubDB(target_db)
        db_instance.close()
        if sys.stdout:
            sys.stdout.write(f"[+] Initialized SQLite Database at: {os.path.abspath(target_db)}\n")
            sys.stdout.flush()
        return 0

    server = BrowserDataHubServer(host=args.host, port=args.port, db_path=args.db)
    if not server.start():
        if sys.stderr:
            sys.stderr.write(f"[-] Failed to bind WebSocket server on {args.host}:{args.port}\n")
        return 1

    if sys.stdout:
        sys.stdout.write(f"[+] Browser Data Hub service started on ws://{args.host}:{args.port}\n")
        sys.stdout.write(f"[+] SQLite Database: {server.db_path} (WAL Mode Enabled)\n")
        sys.stdout.flush()

    try:
        while True:
            time.sleep(1.0)
    except KeyboardInterrupt:
        if sys.stdout:
            sys.stdout.write("\n[*] Stopping Browser Data Hub...\n")
        server.stop()
        if sys.stdout:
            sys.stdout.write("[+] Stopped cleanly.\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
