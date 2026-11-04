# -*- coding: utf-8 -*-
"""
modules/storage.py: Embedded SQLite Database Engine with WAL Mode & Thread-Safe Locking.
Department 03: Data Architecture, DBA & Storage.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sqlite3
import threading
import time
from typing import Dict, Any, List, Optional, Tuple

_MODULES_DIR = os.path.dirname(os.path.abspath(__file__))
_PARENT_DIR = os.path.dirname(_MODULES_DIR)
_ROOT_DIR = os.path.dirname(_PARENT_DIR) if os.path.basename(_PARENT_DIR).lower() == "src" else _PARENT_DIR

DEFAULT_DB_PATH = os.path.join(
    _ROOT_DIR,
    "data",
    "analytics.db"
)


class StorageManager:
    """
    High-performance, thread-safe embedded SQLite persistence manager for
    Windows Video Inactivity Sentinel watch sessions, hourly aggregates,
    and daily event counters in data/analytics.db.
    Enforces WAL journal mode, NORMAL synchronous writing, and 5000ms busy timeout.
    """

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            self.db_path = DEFAULT_DB_PATH
        else:
            self.db_path = db_path

        # Auto-create data directory if database is a disk file
        if self.db_path != ":memory:":
            db_dir = os.path.dirname(os.path.abspath(self.db_path))
            os.makedirs(db_dir, exist_ok=True)
            # If analytics.db does not exist yet but legacy video_sentinel.db does, migrate seamlessly
            legacy_db = os.path.join(db_dir, "video_sentinel.db")
            if not os.path.exists(self.db_path) and os.path.exists(legacy_db):
                try:
                    import shutil
                    shutil.copy2(legacy_db, self.db_path)
                except Exception:
                    pass

        self._lock = threading.RLock()
        self._active_session: Optional[Dict[str, Any]] = None

        # Open SQLite connection with multi-threading support enabled
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row

        # Department 03 PRAGMAs: WAL mode, synchronous NORMAL, busy timeout 5000ms
        self._conn.execute("PRAGMA journal_mode = WAL;")
        self._conn.execute("PRAGMA synchronous = NORMAL;")
        self._conn.execute("PRAGMA busy_timeout = 5000;")

        self._init_schema()

    def _init_schema(self) -> None:
        """Initializes tables and high-cardinality indexes adhering to Dept 03 standards."""
        with self._lock:
            cursor = self._conn.cursor()
            # 1. Watch Sessions Table: Individual media playback events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS watch_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_start TEXT NOT NULL,
                    session_end TEXT NOT NULL,
                    duration_seconds INTEGER NOT NULL,
                    app_name TEXT,
                    platform TEXT,
                    window_title TEXT,
                    media_category TEXT
                );
            """)

            # 2. Hourly Aggregates Table: 24h rolling activity buckets
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hourly_aggregates (
                    date_hour TEXT PRIMARY KEY,
                    video_seconds INTEGER NOT NULL DEFAULT 0,
                    audio_seconds INTEGER NOT NULL DEFAULT 0,
                    idle_seconds INTEGER NOT NULL DEFAULT 0
                );
            """)

            # 3. Daily Event Counters Table: Section 5 high-density event tracking
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS daily_event_counters (
                    date_str TEXT PRIMARY KEY,
                    plays INTEGER DEFAULT 0,
                    pauses INTEGER DEFAULT 0,
                    mutes INTEGER DEFAULT 0,
                    unmutes INTEGER DEFAULT 0,
                    fullscreen INTEGER DEFAULT 0,
                    window_pip INTEGER DEFAULT 0,
                    minimized INTEGER DEFAULT 0,
                    idle_resets INTEGER DEFAULT 0,
                    peak_run_seconds INTEGER DEFAULT 0,
                    true_active_seconds INTEGER DEFAULT 0,
                    true_inactive_seconds INTEGER DEFAULT 0,
                    total_uptime_seconds INTEGER DEFAULT 0
                );
            """)

            # 4. High-selectivity composite & single-column indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_watch_sessions_start
                ON watch_sessions(session_start);
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_watch_sessions_app
                ON watch_sessions(app_name);
            """)

            self._conn.commit()

    def record_event(self, event_type: str, date_str: Optional[str] = None) -> None:
        """
        Atomically increments daily counter for:
        plays, pauses, mutes, unmutes, fullscreen, window_pip, minimized, idle_resets.
        """
        if not date_str:
            date_str = time.strftime("%Y-%m-%d")

        valid_cols = {
            "plays", "pauses", "mutes", "unmutes",
            "fullscreen", "window_pip", "minimized", "idle_resets"
        }
        if event_type not in valid_cols:
            return

        with self._lock:
            cursor = self._conn.cursor()
            cursor.execute(f"""
                INSERT INTO daily_event_counters (date_str, {event_type})
                VALUES (?, 1)
                ON CONFLICT(date_str) DO UPDATE SET {event_type} = {event_type} + 1;
            """, (date_str,))
            self._conn.commit()

    def get_daily_events(self, date_str: Optional[str] = None) -> Dict[str, int]:
        """
        Returns today's daily event counters:
        plays, pauses, mutes, unmutes, fullscreen, window_pip, minimized, idle_resets, peak_run_seconds, etc.
        """
        if not date_str:
            date_str = time.strftime("%Y-%m-%d")

        with self._lock:
            cursor = self._conn.cursor()
            cursor.execute("""
                SELECT plays, pauses, mutes, unmutes, fullscreen, window_pip,
                       minimized, idle_resets, peak_run_seconds,
                       true_active_seconds, true_inactive_seconds, total_uptime_seconds
                FROM daily_event_counters
                WHERE date_str = ?;
            """, (date_str,))
            row = cursor.fetchone()
            if row:
                return {
                    "plays": int(row["plays"]),
                    "pauses": int(row["pauses"]),
                    "mutes": int(row["mutes"]),
                    "unmutes": int(row["unmutes"]),
                    "fullscreen": int(row["fullscreen"]),
                    "window_pip": int(row["window_pip"]),
                    "minimized": int(row["minimized"]),
                    "idle_resets": int(row["idle_resets"]),
                    "peak_run_seconds": int(row["peak_run_seconds"]),
                    "true_active_seconds": int(row["true_active_seconds"]),
                    "true_inactive_seconds": int(row["true_inactive_seconds"]),
                    "total_uptime_seconds": int(row["total_uptime_seconds"])
                }
            return {
                "plays": 0, "pauses": 0, "mutes": 0, "unmutes": 0,
                "fullscreen": 0, "window_pip": 0, "minimized": 0, "idle_resets": 0,
                "peak_run_seconds": 0, "true_active_seconds": 0,
                "true_inactive_seconds": 0, "total_uptime_seconds": 0
            }

    def update_peak_run(self, streak_seconds: int, date_str: Optional[str] = None) -> None:
        """Atomically updates peak_run_seconds for the given date if streak_seconds is greater."""
        if not date_str:
            date_str = time.strftime("%Y-%m-%d")

        with self._lock:
            cursor = self._conn.cursor()
            cursor.execute("""
                INSERT INTO daily_event_counters (date_str, peak_run_seconds)
                VALUES (?, ?)
                ON CONFLICT(date_str) DO UPDATE SET peak_run_seconds = MAX(peak_run_seconds, ?);
            """, (date_str, streak_seconds, streak_seconds))
            self._conn.commit()

    def update_uptime_accounting(
        self,
        true_active: int,
        true_inactive: int,
        total_uptime: int,
        date_str: Optional[str] = None
    ) -> None:
        """Updates true active, true inactive, and total uptime counters for the given date."""
        if not date_str:
            date_str = time.strftime("%Y-%m-%d")

        with self._lock:
            cursor = self._conn.cursor()
            cursor.execute("""
                INSERT INTO daily_event_counters (date_str, true_active_seconds, true_inactive_seconds, total_uptime_seconds)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(date_str) DO UPDATE SET
                    true_active_seconds = ?,
                    true_inactive_seconds = ?,
                    total_uptime_seconds = ?;
            """, (date_str, true_active, true_inactive, total_uptime, true_active, true_inactive, total_uptime))
            self._conn.commit()


    def log_tick(self, verdict_data: Dict[str, Any]) -> None:
        """
        Atomically increments the current hour's counter in hourly_aggregates.
        Also tracks in-flight media sessions and automatically commits them upon completion.
        """
        with self._lock:
            ts = float(verdict_data.get("timestamp", time.time()))
            date_hour = time.strftime("%Y-%m-%d %H:00", time.localtime(ts))
            tick_sec = int(verdict_data.get("tick_seconds", 1))

            # Determine activity category from verdict
            is_video = bool(
                verdict_data.get("is_video_playing")
                or verdict_data.get("video_playing")
                or verdict_data.get("category") == "VIDEO"
                or verdict_data.get("media_type") == "VIDEO"
            )
            is_audio = bool(
                verdict_data.get("is_audio_playing")
                or verdict_data.get("audio_playing")
                or verdict_data.get("category") == "PURE_AUDIO"
                or verdict_data.get("media_type") == "AUDIO"
            )
            is_idle = bool(
                verdict_data.get("is_windows_idle")
                or verdict_data.get("is_idle")
                or (not is_video and not is_audio)
            )

            if is_video:
                v_inc, a_inc, i_inc = tick_sec, 0, 0
            elif is_audio:
                v_inc, a_inc, i_inc = 0, tick_sec, 0
            else:
                v_inc, a_inc, i_inc = 0, 0, tick_sec

            # Atomic Upsert for hourly aggregates
            self._conn.execute("""
                INSERT INTO hourly_aggregates (date_hour, video_seconds, audio_seconds, idle_seconds)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(date_hour) DO UPDATE SET
                    video_seconds = video_seconds + excluded.video_seconds,
                    audio_seconds = audio_seconds + excluded.audio_seconds,
                    idle_seconds = idle_seconds + excluded.idle_seconds;
            """, (date_hour, v_inc, a_inc, i_inc))

            # In-flight media session tracking
            if is_video or is_audio:
                app = verdict_data.get("active_player") or verdict_data.get("app_name") or "Unknown Player"
                plat = verdict_data.get("platform_tag") or verdict_data.get("platform") or "Unknown Platform"
                title = verdict_data.get("media_title") or verdict_data.get("window_title") or "Unknown Media"
                cat = "VIDEO" if is_video else "PURE_AUDIO"
                now_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ts))

                if self._active_session is not None:
                    if (self._active_session["app_name"] == app and
                            self._active_session["window_title"] == title and
                            self._active_session["media_category"] == cat):
                        # Continue existing active media session
                        self._active_session["duration_seconds"] += tick_sec
                        self._active_session["session_end"] = now_str
                    else:
                        # Flush completed previous session and start new
                        self._flush_active_session()
                        self._active_session = {
                            "session_start": now_str,
                            "session_end": now_str,
                            "duration_seconds": tick_sec,
                            "app_name": app,
                            "platform": plat,
                            "window_title": title,
                            "media_category": cat
                        }
                else:
                    # Start first media session
                    self._active_session = {
                        "session_start": now_str,
                        "session_end": now_str,
                        "duration_seconds": tick_sec,
                        "app_name": app,
                        "platform": plat,
                        "window_title": title,
                        "media_category": cat
                    }
            else:
                # Media stopped or machine is idle -> finalize in-flight session
                if self._active_session is not None:
                    self._flush_active_session()

            self._conn.commit()

    def _flush_active_session(self) -> None:
        """Commits active in-flight session to watch_sessions table if duration > 0."""
        if self._active_session is not None:
            if self._active_session.get("duration_seconds", 0) > 0:
                self._record_session_unlocked(self._active_session)
            self._active_session = None

    def record_session(self, session_data: Dict[str, Any]) -> int:
        """
        Explicitly commits a completed media session into the watch_sessions table.
        Returns the inserted primary key ID.
        """
        with self._lock:
            return self._record_session_unlocked(session_data)

    def _record_session_unlocked(self, session_data: Dict[str, Any]) -> int:
        cursor = self._conn.cursor()
        cursor.execute("""
            INSERT INTO watch_sessions (
                session_start, session_end, duration_seconds,
                app_name, platform, window_title, media_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (
            str(session_data.get("session_start", "")),
            str(session_data.get("session_end", "")),
            int(session_data.get("duration_seconds", 0)),
            str(session_data.get("app_name", "Unknown")),
            str(session_data.get("platform", "Unknown")),
            str(session_data.get("window_title", "Unknown")),
            str(session_data.get("media_category", "VIDEO"))
        ))
        self._conn.commit()
        return cursor.lastrowid

    def get_sessions(self, limit: int = 100, days: Optional[int] = None) -> List[Dict[str, Any]]:
        """Queries recorded watch sessions ordered by recency."""
        with self._lock:
            cursor = self._conn.cursor()
            if days and days > 0:
                cutoff = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - days * 86400))
                cursor.execute("""
                    SELECT id, session_start, session_end, duration_seconds,
                           app_name, platform, window_title, media_category
                    FROM watch_sessions
                    WHERE session_start >= ?
                    ORDER BY id DESC
                    LIMIT ?;
                """, (cutoff, limit))
            else:
                cursor.execute("""
                    SELECT id, session_start, session_end, duration_seconds,
                           app_name, platform, window_title, media_category
                    FROM watch_sessions
                    ORDER BY id DESC
                    LIMIT ?;
                """, (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_hourly_aggregates(self, date_prefix: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries hourly aggregates with optional date prefix filter (e.g., '2026-11-02')."""
        with self._lock:
            cursor = self._conn.cursor()
            if date_prefix:
                cursor.execute("""
                    SELECT date_hour, video_seconds, audio_seconds, idle_seconds
                    FROM hourly_aggregates
                    WHERE date_hour LIKE ?
                    ORDER BY date_hour ASC;
                """, (f"{date_prefix}%",))
            else:
                cursor.execute("""
                    SELECT date_hour, video_seconds, audio_seconds, idle_seconds
                    FROM hourly_aggregates
                    ORDER BY date_hour ASC;
                """)
            return [dict(r) for r in cursor.fetchall()]

    def close(self) -> None:
        """Safely commits in-flight sessions and releases the SQLite database connection."""
        with self._lock:
            if self._conn:
                try:
                    self._flush_active_session()
                    self._conn.commit()
                    self._conn.close()
                except Exception:
                    pass
                finally:
                    self._conn = None
