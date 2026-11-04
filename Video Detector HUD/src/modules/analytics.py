# -*- coding: utf-8 -*-
"""
modules/analytics.py: Watch-Time, Per-App & 24h Heatmap Aggregation Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import datetime
import time
from typing import Dict, Any, List, Optional

from .storage import StorageManager


def format_duration_hms(seconds: int) -> str:
    """Formats seconds into fixed '00h 00m 00s' string."""
    s = int(max(0, seconds))
    h = s // 3600
    m = (s % 3600) // 60
    sec = s % 60
    return f"{h:02d}h {m:02d}m {sec:02d}s"


def format_duration_hud(seconds: int) -> str:
    """Formats seconds into concise '00h 00m' string for HUD overlay."""
    s = int(max(0, seconds))
    h = s // 3600
    m = (s % 3600) // 60
    return f"{h:02d}h {m:02d}m"


class AnalyticsEngine:
    """
    Computes high-speed aggregates, daily/weekly watch summaries,
    per-app distributions, and 24-hour activity heatmaps from SQLite storage.
    """

    def __init__(self, storage: StorageManager):
        self.storage = storage

    def get_daily_summary(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Aggregates video seconds, pure audio seconds, and idle seconds for target date (default: today).
        Returns formatted strings (e.g., '03h 42m 15s', HUD '02h 45m') and integer totals.
        """
        if not target_date:
            target_date = time.strftime("%Y-%m-%d")

        with self.storage._lock:
            cursor = self.storage._conn.cursor()
            cursor.execute("""
                SELECT
                    COALESCE(SUM(video_seconds), 0) AS total_video,
                    COALESCE(SUM(audio_seconds), 0) AS total_audio,
                    COALESCE(SUM(idle_seconds), 0) AS total_idle
                FROM hourly_aggregates
                WHERE date_hour LIKE ?;
            """, (f"{target_date}%",))
            row = cursor.fetchone()

            video_sec = int(row["total_video"]) if row else 0
            audio_sec = int(row["total_audio"]) if row else 0
            idle_sec = int(row["total_idle"]) if row else 0
            total_sec = video_sec + audio_sec + idle_sec

            return {
                "date": target_date,
                "video_seconds": video_sec,
                "audio_seconds": audio_sec,
                "idle_seconds": idle_sec,
                "total_monitored_seconds": total_sec,
                "video_formatted": format_duration_hms(video_sec),
                "video_hud_formatted": format_duration_hud(video_sec),
                "audio_formatted": format_duration_hms(audio_sec),
                "audio_hud_formatted": format_duration_hud(audio_sec),
                "idle_formatted": format_duration_hms(idle_sec),
                "idle_hud_formatted": format_duration_hud(idle_sec),
            }

    def get_weekly_summary(self, reference_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Aggregates the past 7 days of watch time by day and by app.
        """
        if reference_date:
            try:
                base_dt = datetime.datetime.strptime(reference_date, "%Y-%m-%d").date()
            except ValueError:
                base_dt = datetime.date.today()
        else:
            base_dt = datetime.date.today()

        days_list: List[Dict[str, Any]] = []
        total_video = 0
        total_audio = 0
        total_idle = 0

        # Collect past 7 days ending on reference_date
        for offset in range(6, -1, -1):
            day_str = (base_dt - datetime.timedelta(days=offset)).strftime("%Y-%m-%d")
            summary = self.get_daily_summary(day_str)
            days_list.append(summary)
            total_video += summary["video_seconds"]
            total_audio += summary["audio_seconds"]
            total_idle += summary["idle_seconds"]

        # Aggregate per-app playback for the 7-day period
        cutoff_str = (base_dt - datetime.timedelta(days=6)).strftime("%Y-%m-%d 00:00:00")
        with self.storage._lock:
            cursor = self.storage._conn.cursor()
            cursor.execute("""
                SELECT
                    app_name,
                    platform,
                    COALESCE(SUM(duration_seconds), 0) AS total_dur,
                    media_category
                FROM watch_sessions
                WHERE session_start >= ?
                GROUP BY app_name, platform
                ORDER BY total_dur DESC;
            """, (cutoff_str,))
            by_app = []
            for r in cursor.fetchall():
                dur = int(r["total_dur"])
                by_app.append({
                    "app_name": r["app_name"] or "Unknown Player",
                    "platform": r["platform"] or "Unknown Platform",
                    "duration_seconds": dur,
                    "duration_formatted": format_duration_hms(dur),
                    "duration_hud": format_duration_hud(dur),
                    "media_category": r["media_category"] or "VIDEO"
                })

        return {
            "reference_date": base_dt.strftime("%Y-%m-%d"),
            "days": days_list,
            "by_app": by_app,
            "total_video_seconds": total_video,
            "total_audio_seconds": total_audio,
            "total_idle_seconds": total_idle,
            "video_formatted": format_duration_hms(total_video),
            "video_hud_formatted": format_duration_hud(total_video),
            "audio_formatted": format_duration_hms(total_audio),
            "idle_formatted": format_duration_hms(total_idle),
        }

    def get_per_app_breakdown(self, days: int = 1) -> List[Dict[str, Any]]:
        """
        Groups watch duration by app_name and platform, sorted by descending duration.
        """
        with self.storage._lock:
            cursor = self.storage._conn.cursor()
            if days > 0:
                cutoff = (datetime.date.today() - datetime.timedelta(days=days - 1)).strftime("%Y-%m-%d 00:00:00")
                cursor.execute("""
                    SELECT
                        app_name,
                        platform,
                        COALESCE(SUM(duration_seconds), 0) AS total_dur,
                        media_category
                    FROM watch_sessions
                    WHERE session_start >= ?
                    GROUP BY app_name, platform
                    ORDER BY total_dur DESC;
                """, (cutoff,))
            else:
                cursor.execute("""
                    SELECT
                        app_name,
                        platform,
                        COALESCE(SUM(duration_seconds), 0) AS total_dur,
                        media_category
                    FROM watch_sessions
                    GROUP BY app_name, platform
                    ORDER BY total_dur DESC;
                """)

            breakdown = []
            for r in cursor.fetchall():
                dur = int(r["total_dur"])
                breakdown.append({
                    "app_name": r["app_name"] or "Unknown Player",
                    "platform": r["platform"] or "Unknown Platform",
                    "duration_seconds": dur,
                    "duration_formatted": format_duration_hms(dur),
                    "duration_hud": format_duration_hud(dur),
                    "media_category": r["media_category"] or "VIDEO"
                })
            return breakdown

    def get_24h_heatmap(self, target_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Returns an array of 24 items representing the 24 hourly buckets of target_date.
        [{"hour": 0, "video_sec": 0, "audio_sec": 120, "idle_sec": 3480}, ...]
        """
        if not target_date:
            target_date = time.strftime("%Y-%m-%d")

        with self.storage._lock:
            cursor = self.storage._conn.cursor()
            cursor.execute("""
                SELECT date_hour, video_seconds, audio_seconds, idle_seconds
                FROM hourly_aggregates
                WHERE date_hour LIKE ?
                ORDER BY date_hour ASC;
            """, (f"{target_date}%",))
            rows = cursor.fetchall()

        # Map existing database rows by hour integer
        hour_data_map: Dict[int, Dict[str, int]] = {}
        for r in rows:
            date_hour_str = str(r["date_hour"])
            try:
                # Format: 'YYYY-MM-DD HH:00'
                hour_part = date_hour_str.split(" ")[1].split(":")[0]
                h_int = int(hour_part)
                hour_data_map[h_int] = {
                    "video": int(r["video_seconds"]),
                    "audio": int(r["audio_seconds"]),
                    "idle": int(r["idle_seconds"])
                }
            except Exception:
                continue

        heatmap = []
        for h in range(24):
            data = hour_data_map.get(h, {"video": 0, "audio": 0, "idle": 0})
            v_sec = data["video"]
            a_sec = data["audio"]
            i_sec = data["idle"]
            heatmap.append({
                "hour": h,
                "hour_label": f"{h:02d}:00",
                "video_sec": v_sec,
                "audio_sec": a_sec,
                "idle_sec": i_sec,
                "video_formatted": format_duration_hms(v_sec),
                "video_hud": format_duration_hud(v_sec),
                "audio_formatted": format_duration_hms(a_sec),
                "idle_formatted": format_duration_hms(i_sec)
            })

        return heatmap

    def get_peak_usage_hour(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculates the peak video watch hour for the day."""
        heatmap = self.get_24h_heatmap(target_date)
        peak_item = max(heatmap, key=lambda x: x["video_sec"])
        h = peak_item["hour"]
        h_next = (h + 1) % 24
        return {
            "hour": h,
            "hour_range": f"{h:02d}:00 - {h_next:02d}:00",
            "video_sec": peak_item["video_sec"],
            "video_formatted": peak_item["video_formatted"]
        }

    def get_top_platform(self, days: int = 1) -> Dict[str, Any]:
        """Identifies top streaming platform by total watch duration."""
        apps = self.get_per_app_breakdown(days=days)
        if not apps:
            return {
                "platform": "None",
                "duration_seconds": 0,
                "formatted": "00h 00m 00s"
            }
        top = apps[0]
        return {
            "platform": top.get("platform", "Generic Player"),
            "app_name": top.get("app_name", "None"),
            "duration_seconds": top.get("duration_seconds", 0),
            "formatted": top.get("duration_formatted", "00h 00m 00s")
        }

    def get_daily_event_counters(self, target_date: Optional[str] = None) -> Dict[str, int]:
        """Retrieves Section 5 daily event counters from SQLite storage."""
        return self.storage.get_daily_events(target_date)

    def record_daily_event(self, event_type: str, target_date: Optional[str] = None) -> None:
        """Atomically increments a daily event in storage."""
        self.storage.record_event(event_type, target_date)


class DailyEventDetector:
    """
    Edge-triggered state transition detector for Windows Video Inactivity Sentinel.
    Detects state changes between polling cycles:
      - Plays: transition from stopped/paused to playing.
      - Pauses: transition from playing to paused/stopped.
      - Mutes: transition from unmuted to muted.
      - Unmutes: transition from muted to unmuted.
      - Cinema/Fullscreen: transition to FULLSCREEN_CINEMA.
      - Window/PIP: transition from fullscreen to WINDOWED or BORDERLESS_MAXIMIZED.
      - Minimized: transition to MINIMIZED.
      - Idle Resets: transition where idle timer resets (e.g., from >= 5s back to < 1s).
    """

    def __init__(self, storage: StorageManager):
        self.storage = storage
        self._last_playing: Optional[bool] = None
        self._last_muted: Optional[bool] = None
        self._last_presentation: Optional[str] = None
        self._last_idle_seconds: float = 0.0

    def process_cycle(
        self,
        is_playing: bool,
        is_muted: bool,
        presentation_mode: str,
        idle_seconds: float,
        date_str: Optional[str] = None
    ) -> Dict[str, int]:
        """
        Evaluates current polling cycle telemetry against prior state.
        Edge-triggers and persists transitions to daily_event_counters in storage.
        Returns the updated daily counters dictionary.
        """
        # 1. Play / Pause edge detection
        if self._last_playing is not None:
            if not self._last_playing and is_playing:
                self.storage.record_event("plays", date_str)
            elif self._last_playing and not is_playing:
                self.storage.record_event("pauses", date_str)
        self._last_playing = is_playing

        # 2. Mute / Unmute edge detection
        if self._last_muted is not None:
            if not self._last_muted and is_muted:
                self.storage.record_event("mutes", date_str)
            elif self._last_muted and not is_muted:
                self.storage.record_event("unmutes", date_str)
        self._last_muted = is_muted

        # 3. Presentation mode edge detection (Fullscreen vs Window/PIP vs Minimized)
        if self._last_presentation is not None and presentation_mode != self._last_presentation:
            if presentation_mode == "FULLSCREEN_CINEMA":
                self.storage.record_event("fullscreen", date_str)
            elif presentation_mode in ("WINDOWED", "BORDERLESS_MAXIMIZED"):
                self.storage.record_event("window_pip", date_str)
            elif presentation_mode == "MINIMIZED":
                self.storage.record_event("minimized", date_str)
        self._last_presentation = presentation_mode

        # 4. Idle Timer Reset edge detection
        if self._last_idle_seconds >= 5.0 and idle_seconds < 1.0:
            self.storage.record_event("idle_resets", date_str)
        self._last_idle_seconds = idle_seconds

        return self.get_daily_events(date_str)

    def get_daily_events(self, date_str: Optional[str] = None) -> Dict[str, int]:
        """Queries daily event counters from SQLite storage."""
        return self.storage.get_daily_events(date_str)


_default_storage = None
_default_event_detector = None


def get_event_detector(storage: Optional[StorageManager] = None) -> DailyEventDetector:
    """Returns a DailyEventDetector instance, using a shared singleton by default."""
    global _default_storage, _default_event_detector
    if storage is not None:
        return DailyEventDetector(storage)
    if _default_event_detector is None:
        if _default_storage is None:
            _default_storage = StorageManager()
        _default_event_detector = DailyEventDetector(_default_storage)
    return _default_event_detector


def get_today_event_counters(date_str: Optional[str] = None) -> Dict[str, int]:
    """Convenience helper to retrieve today's event counters."""
    detector = get_event_detector()
    return detector.get_daily_events(date_str)

