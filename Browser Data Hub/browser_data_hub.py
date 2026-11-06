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
import html
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
                        foreground_seconds INTEGER NOT NULL DEFAULT 0,
                        background_media_seconds INTEGER NOT NULL DEFAULT 0,
                        session_count INTEGER NOT NULL DEFAULT 1,
                        last_active REAL NOT NULL,
                        favicon_url TEXT,
                        UNIQUE(browser_type, domain, date_str)
                    );
                """)

                # Automatic schema migration for existing databases
                cur = conn.execute("PRAGMA table_info(domain_activity);")
                existing_cols = {row["name"] for row in cur.fetchall()}
                if "foreground_seconds" not in existing_cols:
                    conn.execute("ALTER TABLE domain_activity ADD COLUMN foreground_seconds INTEGER NOT NULL DEFAULT 0;")
                    conn.execute("UPDATE domain_activity SET foreground_seconds = seconds_active WHERE foreground_seconds = 0 AND seconds_active > 0;")
                if "background_media_seconds" not in existing_cols:
                    conn.execute("ALTER TABLE domain_activity ADD COLUMN background_media_seconds INTEGER NOT NULL DEFAULT 0;")

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
        session_count: int = 0,
        tracking_type: str = "foreground"
    ) -> int:
        """
        Atomically increments active seconds for a browser and domain on a specific date.
        Supports tracking_type: 'foreground' | 'background_media'.
        Returns the new total seconds for that domain on that date.
        """
        if not domain or seconds <= 0:
            return 0

        browser_type = browser_type.lower().strip() or "unknown"
        clean_domain = domain.lower().strip()
        today = date_str or date.today().isoformat()
        now = time.time()
        tracking_type = (tracking_type or "foreground").lower().strip()

        fg_sec = seconds if tracking_type == "foreground" else 0
        bg_sec = seconds if tracking_type == "background_media" else 0

        with self._write_lock:
            conn = self._get_connection()
            with conn:
                conn.execute("""
                    INSERT INTO domain_activity (
                        browser_type, domain, date_str, seconds_active, foreground_seconds, background_media_seconds, session_count, last_active, favicon_url
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(browser_type, domain, date_str) DO UPDATE SET
                        seconds_active = domain_activity.seconds_active + excluded.seconds_active,
                        foreground_seconds = domain_activity.foreground_seconds + excluded.foreground_seconds,
                        background_media_seconds = domain_activity.background_media_seconds + excluded.background_media_seconds,
                        session_count = domain_activity.session_count + excluded.session_count,
                        last_active = excluded.last_active,
                        favicon_url = COALESCE(excluded.favicon_url, domain_activity.favicon_url);
                """, (browser_type, clean_domain, today, seconds, fg_sec, bg_sec, max(0, session_count), now, favicon_url))

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
        days_for_average: int = 7,
        tracking_mode: str = "all"
    ) -> Dict[str, Any]:
        """
        Queries aggregated metrics across domains, browsers, and media sessions.
        Supports filtering by browser_type ('all', 'chrome', 'edge', etc.)
        and tracking_mode ('all' [Combined], 'foreground' [Active only], 'background_media' [BG Media only]).
        """
        browser_filter = (browser_filter or "all").lower().strip()
        tracking_mode = (tracking_mode or "all").lower().strip()
        query_date = target_date or date.today().isoformat()
        conn = self._get_connection()

        # Build SQL condition
        use_all = (browser_filter == "all")
        browser_clause = "" if use_all else "AND browser_type = ?"
        browser_params = [] if use_all else [browser_filter]

        # Which time column to use for primary metric sorting and sums
        if tracking_mode == "foreground":
            metric_col = "foreground_seconds"
        elif tracking_mode == "background_media":
            metric_col = "background_media_seconds"
        else:
            metric_col = "seconds_active"

        # 1. Total seconds today
        sql_today = f"""
            SELECT COALESCE(SUM(seconds_active), 0) AS total_seconds,
                   COALESCE(SUM(foreground_seconds), 0) AS foreground_seconds,
                   COALESCE(SUM(background_media_seconds), 0) AS background_media_seconds
            FROM domain_activity
            WHERE date_str = ? {browser_clause};
        """
        cur = conn.execute(sql_today, [query_date] + browser_params)
        today_row = cur.fetchone()
        today_combined_sec = int(today_row["total_seconds"])
        today_fg_sec = int(today_row["foreground_seconds"])
        today_bg_sec = int(today_row["background_media_seconds"])

        if tracking_mode == "foreground":
            today_seconds = today_fg_sec
        elif tracking_mode == "background_media":
            today_seconds = today_bg_sec
        else:
            today_seconds = today_combined_sec

        # 2. Daily average over past N days
        try:
            target_dt = datetime.strptime(query_date, "%Y-%m-%d").date()
        except Exception:
            target_dt = date.today()
        start_date = (target_dt - timedelta(days=days_for_average - 1)).isoformat()

        sql_avg = f"""
            SELECT COALESCE(SUM({metric_col}), 0) AS window_seconds,
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
                   SUM({metric_col}) AS selected_seconds,
                   SUM(seconds_active) AS total_seconds,
                   SUM(foreground_seconds) AS foreground_seconds,
                   SUM(background_media_seconds) AS background_media_seconds,
                   SUM(session_count) AS total_sessions,
                   MAX(last_active) AS last_active,
                   MAX(favicon_url) AS favicon_url
            FROM domain_activity
            WHERE date_str = ? {browser_clause}
            GROUP BY domain
            ORDER BY selected_seconds DESC;
        """
        cur = conn.execute(sql_domains, [query_date] + browser_params)
        domain_list = []
        for r in cur.fetchall():
            s = int(r["selected_seconds"])
            pct = round((s / today_seconds * 100.0), 1) if today_seconds > 0 else 0.0
            domain_list.append({
                "domain": r["domain"],
                "seconds": s,
                "foreground_seconds": int(r["foreground_seconds"]),
                "background_media_seconds": int(r["background_media_seconds"]),
                "combined_seconds": int(r["total_seconds"]),
                "session_count": int(r["total_sessions"]),
                "last_active": r["last_active"],
                "favicon_url": r["favicon_url"] or "",
                "percent": pct
            })

        # 3b. All-Time Seconds & History Metadata
        sql_all_time = f"""
            SELECT COALESCE(SUM({metric_col}), 0) AS selected_seconds,
                   COALESCE(SUM(seconds_active), 0) AS total_seconds,
                   COALESCE(SUM(foreground_seconds), 0) AS foreground_seconds,
                   COALESCE(SUM(background_media_seconds), 0) AS background_media_seconds,
                   COUNT(DISTINCT date_str) AS distinct_days,
                   MIN(date_str) AS first_date
            FROM domain_activity
            WHERE 1=1 {browser_clause};
        """
        cur = conn.execute(sql_all_time, browser_params)
        all_row = cur.fetchone()
        all_time_seconds = int(all_row["selected_seconds"]) if all_row else 0
        all_time_combined_sec = int(all_row["total_seconds"]) if all_row else 0
        all_time_fg_sec = int(all_row["foreground_seconds"]) if all_row else 0
        all_time_bg_sec = int(all_row["background_media_seconds"]) if all_row else 0
        total_tracked_days = max(1, int(all_row["distinct_days"])) if all_row and all_row["distinct_days"] else 1
        first_tracked_date = str(all_row["first_date"]) if all_row and all_row["first_date"] else query_date

        # 3c. All-Time Domain Distribution (Across All History Dates)
        sql_all_time_domains = f"""
            SELECT domain, 
                   SUM({metric_col}) AS selected_seconds,
                   SUM(seconds_active) AS total_seconds,
                   SUM(foreground_seconds) AS foreground_seconds,
                   SUM(background_media_seconds) AS background_media_seconds,
                   SUM(session_count) AS total_sessions,
                   MAX(last_active) AS last_active,
                   MAX(favicon_url) AS favicon_url
            FROM domain_activity
            WHERE 1=1 {browser_clause}
            GROUP BY domain
            ORDER BY selected_seconds DESC;
        """
        cur = conn.execute(sql_all_time_domains, browser_params)
        all_time_domain_list = []
        for r in cur.fetchall():
            s = int(r["selected_seconds"])
            pct = round((s / all_time_seconds * 100.0), 1) if all_time_seconds > 0 else 0.0
            all_time_domain_list.append({
                "domain": r["domain"],
                "seconds": s,
                "foreground_seconds": int(r["foreground_seconds"]),
                "background_media_seconds": int(r["background_media_seconds"]),
                "combined_seconds": int(r["total_seconds"]),
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

        all_hours = all_time_seconds // 3600
        all_mins = (all_time_seconds % 3600) // 60
        all_time_formatted = f"{all_hours}h {all_mins}m" if all_hours > 0 else f"{all_mins}m"

        return {
            "query_date": query_date,
            "filter_browser": browser_filter,
            "tracking_mode": tracking_mode,
            "today_seconds": today_seconds,
            "today_foreground_seconds": today_fg_sec,
            "today_background_media_seconds": today_bg_sec,
            "today_combined_seconds": today_combined_sec,
            "all_time_foreground_seconds": all_time_fg_sec,
            "all_time_background_media_seconds": all_time_bg_sec,
            "all_time_combined_seconds": all_time_combined_sec,
            "today_formatted": today_formatted,
            "total_seconds": all_time_seconds,
            "all_time_seconds": all_time_seconds,
            "all_time_formatted": all_time_formatted,
            "daily_average_seconds": daily_average_seconds,
            "first_tracked_date": first_tracked_date,
            "total_tracked_days": total_tracked_days,
            "all_time_domain_distribution": all_time_domain_list,
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

    def _handle_http_request(self, sock: socket.socket, lines: List[str], headers: Dict[str, str]) -> None:
        """
        Serves high-performance HTTP dashboard, health, and analytics JSON endpoints.
        Enables seamless browser inspection via http://127.0.0.1:65433/dashboard.
        """
        try:
            if not lines:
                return
            req_line = lines[0].strip()
            parts = req_line.split()
            method = parts[0].upper() if len(parts) > 0 else "GET"
            full_path = parts[1] if len(parts) > 1 else "/"
            path = full_path.split("?")[0]

            if method == "OPTIONS":
                cors_headers = (
                    "HTTP/1.1 204 No Content\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                    "Access-Control-Allow-Headers: Content-Type\r\n"
                    "Content-Length: 0\r\n"
                    "Connection: close\r\n\r\n"
                )
                sock.sendall(cors_headers.encode("ascii"))
                return

            if path in ("/health", "/status", "/api/status"):
                with self._clients_lock:
                    clients_count = len(self._clients)
                live_info = self.live_state.get_live_state()
                payload = {
                    "status": "healthy",
                    "service": "Browser Data Hub",
                    "port": self.port,
                    "host": self.host,
                    "db_wal": True,
                    "connected_clients": clients_count,
                    "active_media_streams": len(live_info.get("active_media", [])),
                    "server_time": time.time()
                }
                body = json.dumps(payload, indent=2).encode("utf-8")
                resp = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: application/json; charset=utf-8\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    f"Content-Length: {len(body)}\r\n"
                    "Connection: close\r\n\r\n"
                ).encode("ascii") + body
                sock.sendall(resp)
                return

            if path == "/api/live":
                live_info = self.live_state.get_live_state()
                body = json.dumps(live_info, indent=2).encode("utf-8")
                resp = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: application/json; charset=utf-8\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    f"Content-Length: {len(body)}\r\n"
                    "Connection: close\r\n\r\n"
                ).encode("ascii") + body
                sock.sendall(resp)
                return

            if path == "/api/analytics":
                analytics = self.db.query_analytics("all")
                body = json.dumps(analytics, indent=2).encode("utf-8")
                resp = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: application/json; charset=utf-8\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    f"Content-Length: {len(body)}\r\n"
                    "Connection: close\r\n\r\n"
                ).encode("ascii") + body
                sock.sendall(resp)
                return

            if path in ("/", "/dashboard", "/index.html"):
                html_content = self._render_http_dashboard_html()
                body = html_content.encode("utf-8")
                resp = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: text/html; charset=utf-8\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    f"Content-Length: {len(body)}\r\n"
                    "Connection: close\r\n\r\n"
                ).encode("ascii") + body
                sock.sendall(resp)
                return

            not_found = b"404 Not Found"
            resp = (
                "HTTP/1.1 404 Not Found\r\n"
                "Content-Type: text/plain; charset=utf-8\r\n"
                f"Content-Length: {len(not_found)}\r\n"
                "Connection: close\r\n\r\n"
            ).encode("ascii") + not_found
            sock.sendall(resp)
        except Exception:
            pass

    def _render_http_dashboard_html(self) -> str:
        """Renders live HTML dashboard for Browser Data Hub with modern glassmorphism styling."""
        try:
            today_str = date.today().isoformat()
            analytics = self.db.query_analytics("all", today_str)
            live_info = self.live_state.get_live_state()

            today_sec = analytics.get("today_seconds", 0)
            all_time_sec = analytics.get("all_time_seconds", 0)
            tracked_days = analytics.get("total_tracked_days", 1)
            reg_browsers = analytics.get("registered_browsers", [])
            domain_dist = analytics.get("domain_distribution", [])
            live_media = live_info.get("active_media", [])

            def fmt_time(sec):
                sec = int(sec)
                h = sec // 3600
                m = (sec % 3600) // 60
                s = sec % 60
                if h > 0:
                    return f"{h}h {m:02d}m {s:02d}s"
                elif m > 0:
                    return f"{m}m {s:02d}s"
                return f"{s}s"

            today_str_fmt = fmt_time(today_sec)
            all_time_str_fmt = fmt_time(all_time_sec)
            daily_avg_sec = round(all_time_sec / max(1, tracked_days))
            daily_avg_fmt = fmt_time(daily_avg_sec)

            browsers_html = " ".join(f'<span class="badge badge-browser">{html.escape(b.title())}</span>' for b in reg_browsers) or '<span class="text-muted">None</span>'

            # Domain rows
            domain_rows = ""
            for idx, d in enumerate(domain_dist[:15]):
                dom_sec = d.get("seconds", 0)
                dom_pct = round((dom_sec / today_sec * 100), 1) if today_sec > 0 else 0
                dom_name = html.escape(str(d.get("domain", "")))
                dom_btype = html.escape(str(d.get("browser_type", "all")).title())
                dom_sess = d.get("session_count", 1)
                domain_rows += f"""
                <tr>
                    <td style="color:#64748b; font-weight:600;">#{idx+1}</td>
                    <td><strong>{dom_name}</strong></td>
                    <td><span class="badge">{dom_btype}</span></td>
                    <td><span class="pill-time">{fmt_time(dom_sec)}</span></td>
                    <td>{dom_pct}%</td>
                    <td>{dom_sess}</td>
                </tr>"""

            if not domain_rows:
                domain_rows = '<tr><td colspan="6" style="text-align:center; padding:32px; color:#94a3b8;">No browsing activity recorded today yet. Open any tab in Chrome or Edge to start tracking!</td></tr>'

            # Live media rows
            media_rows = ""
            for m in live_media:
                m_title = html.escape(str(m.get("title") or "Web Stream"))
                m_dom = html.escape(str(m.get("domain") or "web"))
                m_res = html.escape(str(m.get("resolution") or "Standard"))
                m_dur = fmt_time(int(m.get("duration", 0)))
                m_state = "▶ Playing" if m.get("is_playing") else "⏸ Paused"
                media_rows += f"""
                <tr>
                    <td><strong>{m_dom}</strong></td>
                    <td>{m_title}</td>
                    <td><span class="badge badge-media">{m_res}</span></td>
                    <td>{m_dur}</td>
                    <td><span class="badge badge-status">{m_state}</span></td>
                </tr>"""

            if not media_rows:
                media_rows = '<tr><td colspan="5" style="text-align:center; padding:24px; color:#94a3b8;">No active video/audio streams playing right now.</td></tr>'

            return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Browser Data Hub • Standalone Dashboard</title>
<style>
:root {{
  --bg: #0b0f19;
  --surface: #131c2e;
  --border: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --primary: #38bdf8;
  --success: #10b981;
  --accent: #818cf8;
  --card-bg: rgba(19, 28, 46, 0.7);
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: radial-gradient(circle at top left, #1e1b4b 0%, #0b0f19 50%, #030712 100%);
  color: var(--text);
  min-height: 100vh;
  padding: 32px 24px;
}}
.container {{ max-width: 1100px; margin: 0 auto; }}
.header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}}
.title-group h1 {{
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}}
.title-group p {{ color: var(--text-muted); font-size: 14px; margin-top: 4px; }}
.badges {{ display: flex; gap: 8px; align-items: center; }}
.badge {{
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
}}
.badge-status {{
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  border-color: rgba(16, 185, 129, 0.3);
}}
.badge-browser {{
  background: rgba(129, 140, 248, 0.15);
  color: var(--accent);
  border-color: rgba(129, 140, 248, 0.3);
}}
.badge-media {{
  background: rgba(244, 114, 182, 0.15);
  color: #f472b6;
  border-color: rgba(244, 114, 182, 0.3);
}}
.grid-cards {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}}
.card {{
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}}
.card-label {{ font-size: 13px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }}
.card-value {{ font-size: 28px; font-weight: 700; color: #fff; margin-top: 8px; }}
.card-sub {{ font-size: 12px; color: var(--text-muted); margin-top: 6px; }}
.section-title {{ font-size: 18px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }}
.table-card {{
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}}
table {{ width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }}
th {{
  background: rgba(15, 23, 42, 0.8);
  padding: 12px 16px;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}}
td {{ padding: 14px 16px; border-bottom: 1px solid rgba(30, 41, 59, 0.6); }}
tr:last-child td {{ border-bottom: none; }}
.pill-time {{
  display: inline-block;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}}
.footer-info {{
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 32px;
}}
.btn {{
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}}
.btn:hover {{ opacity: 0.9; }}
</style>
<script>
setTimeout(() => {{ window.location.reload(); }}, 5000);
</script>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="title-group">
      <h1>Browser Data Hub Dashboard</h1>
      <p>Standalone Multi-Browser Telemetry & SQLite WAL Service</p>
    </div>
    <div class="badges">
      <span class="badge badge-status">● PORT {self.port} ACTIVE</span>
      <span class="badge">SQLite WAL Mode</span>
      <button class="btn" onclick="window.location.reload()">↻ Refresh</button>
    </div>
  </div>

  <div class="grid-cards">
    <div class="card">
      <div class="card-label">Today's Total Time</div>
      <div class="card-value">{today_str_fmt}</div>
      <div class="card-sub">{len(domain_dist)} active domain(s) today</div>
    </div>
    <div class="card">
      <div class="card-label">Daily Average Time</div>
      <div class="card-value">{daily_avg_fmt}</div>
      <div class="card-sub">Across {tracked_days} tracked day(s)</div>
    </div>
    <div class="card">
      <div class="card-label">All-Time Tracked</div>
      <div class="card-value">{all_time_str_fmt}</div>
      <div class="card-sub">Since {analytics.get("first_tracked_date", today_str)}</div>
    </div>
    <div class="card">
      <div class="card-label">Active Browsers</div>
      <div class="card-value" style="font-size: 20px; margin-top: 12px;">{browsers_html}</div>
      <div class="card-sub">{len(reg_browsers)} registered client(s)</div>
    </div>
  </div>

  <div class="section-title">
    <span>🌐 Today's Top Domains</span>
    <span style="font-size: 13px; color: var(--text-muted);">Auto-updating every 5s</span>
  </div>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Domain</th>
          <th>Browser</th>
          <th>Time Tracked</th>
          <th>Ratio</th>
          <th>Sessions</th>
        </tr>
      </thead>
      <tbody>
        {domain_rows}
      </tbody>
    </table>
  </div>

  <div class="section-title">
    <span>🎬 Live In-Flight Media Streams</span>
    <span style="font-size: 13px; color: var(--text-muted);">{len(live_media)} active</span>
  </div>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Platform / Domain</th>
          <th>Title</th>
          <th>Resolution</th>
          <th>Playback Time</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        {media_rows}
      </tbody>
    </table>
  </div>

  <div class="footer-info">
    <p>⚡ Connected via <code>ws://{self.host}:{self.port}</code> and <code>http://{self.host}:{self.port}/dashboard</code></p>
    <p style="margin-top: 6px;">Developed by <strong>Atul Verma</strong> (aiprincekumar)</p>
  </div>
</div>
</body>
</html>"""
        except Exception as e:
            return f"<html><body><h1>Browser Data Hub Active</h1><p>Error rendering full template: {html.escape(str(e))}</p></body></html>"


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
                self._handle_http_request(sock, lines, headers)
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
                    d_tracking_type = item.get("tracking_type") or "foreground"
                    if d_domain and d_sec > 0:
                        self.db.upsert_activity_delta(
                            d_btype, d_domain, d_sec, d_date, d_favicon, d_sessions, d_tracking_type
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
                tracking_type = msg.get("tracking_type") or "foreground"
                new_total = self.db.upsert_activity_delta(
                    browser_type, domain, seconds, date_str, favicon_url, session_count, tracking_type
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
            target_date = msg.get("date_str") or msg.get("date")
            tracking_mode = str(msg.get("tracking_mode") or msg.get("trackingMode") or "all")
            analytics_data = self.db.query_analytics(browser_filter, target_date, tracking_mode=tracking_mode)
            resp = {
                "type": "ANALYTICS_RESPONSE",
                "success": True,
                "filter_browser": browser_filter,
            "tracking_mode": tracking_mode,
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
