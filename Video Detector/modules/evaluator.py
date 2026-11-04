# -*- coding: utf-8 -*-
"""
modules/evaluator.py: Master Video Inactivity Evaluator and Decision Matrix Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import time
from typing import Dict, List, Any, Optional

from .audio import get_live_wasapi_audio_state
from .window_scanner import scan_system_media_candidates
from .classifier import classify_media_window


class VideoActivityTracker:
    """
    Maintains persistent metrics across evaluation cycles:
      1. Continuous Video Play Duration (seconds video played without interruption).
      2. Continuous Video Pause/Stop Duration (seconds video remained paused/stopped).
      3. 60-Minute Historical Activity Ring Buffer (minute-by-minute activity history).
    """

    def __init__(self, history_minutes: int = 60):
        self.history_minutes = history_minutes
        self.reset()

    def reset(self):
        """Resets tracker state."""
        self._last_eval_time: Optional[float] = None
        self._last_is_video_playing: Optional[bool] = None
        self._continuous_play_seconds: float = 0.0
        self._continuous_pause_seconds: float = 0.0
        self._minute_activity: Dict[int, float] = {}

    def update(
        self,
        is_video_playing: bool,
        now: Optional[float] = None,
        dt: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates the tracker with the latest evaluation verdict.
        """
        if now is None:
            now = time.time()

        if dt is None:
            if self._last_eval_time is None:
                dt = 0.0
            else:
                dt = max(0.0, now - self._last_eval_time)
        self._last_eval_time = now

        curr_m = int(now // 60)

        if is_video_playing:
            if self._last_is_video_playing is not True:
                # Switched to playing: start play timer fresh from dt
                self._continuous_play_seconds = dt
            else:
                self._continuous_play_seconds += dt
            self._continuous_pause_seconds = 0.0
            self._last_is_video_playing = True
            self._minute_activity[curr_m] = self._minute_activity.get(curr_m, 0.0) + dt
        else:
            if self._last_is_video_playing is not False:
                # Switched to paused/stopped: start pause timer fresh from dt
                self._continuous_pause_seconds = dt
            else:
                self._continuous_pause_seconds += dt
            self._continuous_play_seconds = 0.0
            self._last_is_video_playing = False

        # Prune minutes older than history_minutes
        cutoff = curr_m - self.history_minutes
        self._minute_activity = {k: v for k, v in self._minute_activity.items() if k >= cutoff}

        return {
            "continuous_play_seconds": self._continuous_play_seconds,
            "continuous_pause_seconds": self._continuous_pause_seconds,
            "activity_history_60m": self.get_history_60m(now)
        }

    def get_history_60m(self, now: Optional[float] = None) -> List[float]:
        """
        Returns a 60-element list representing activity ratios (0.0 to 1.0)
        for each minute from (now - 59 minutes) to now.
        """
        if now is None:
            now = time.time()
        curr_m = int(now // 60)
        history = []
        for m in range(curr_m - self.history_minutes + 1, curr_m + 1):
            sec = self._minute_activity.get(m, 0.0)
            history.append(min(1.0, max(0.0, sec / 60.0)))
        return history

    def seed_history_for_testing(self, history: List[float], now: Optional[float] = None):
        """Helper to seed history buffer for automated QA tests."""
        if now is None:
            now = time.time()
        curr_m = int(now // 60)
        self._minute_activity.clear()
        for idx, val in enumerate(history[-self.history_minutes:]):
            m = curr_m - len(history) + 1 + idx
            self._minute_activity[m] = float(val) * 60.0

    @property
    def continuous_play_seconds(self) -> float:
        return self._continuous_play_seconds

    @property
    def continuous_pause_seconds(self) -> float:
        return self._continuous_pause_seconds


# Global singleton instance
_tracker = VideoActivityTracker()


def get_activity_tracker() -> VideoActivityTracker:
    """Returns the global VideoActivityTracker singleton."""
    return _tracker


def reset_activity_tracker():
    """Resets the global VideoActivityTracker singleton."""
    _tracker.reset()


def evaluate_video_inactivity() -> Dict[str, Any]:
    """
    Evaluates whether VIDEO is currently playing on Windows:
      1. Queries WASAPI audio peak metering.
      2. Scans open media windows and classifies each into VIDEO vs PURE_AUDIO.
      3. Correlates active audio peaks with classified media processes.
      4. Synthesizes bilingual verdict.
    """
    wasapi_state = get_live_wasapi_audio_state()
    active_audio_procs = wasapi_state.get("active_processes", {})
    all_peaks = wasapi_state.get("all_session_peaks", {})
    master_peak = wasapi_state.get("master_peak", 0.0)

    candidates = scan_system_media_candidates()

    # Ensure any active audio process from WASAPI is accounted for if not captured by EnumWindows
    # (e.g., audio playing minimized to tray, background music, or headless streams)
    for proc_name, peak in active_audio_procs.items():
        if any(c["process"] == proc_name for c in candidates):
            continue

        classification = classify_media_window(proc_name, "N/A", proc_name)
        c_type = classification.get("type", "UNKNOWN")
        if c_type in ("VIDEO", "PURE_AUDIO", "EMPTY_PLAYER"):
            bg_title = classification.get("smtc_title") or f"Background / Minimized ({classification.get('app_name', proc_name)})"
            candidates.append({
                "category": c_type,
                "app_name": classification.get("app_name", proc_name),
                "process": proc_name,
                "pid": "N/A",
                "title": bg_title,
                "status": "Running",
                "file_ext": None,
                "rationale": classification.get("rationale", "Background audio emitter")
            })

    active_video_items: List[Dict[str, Any]] = []
    paused_video_items: List[Dict[str, Any]] = []
    pure_audio_items: List[Dict[str, Any]] = []
    empty_player_items: List[Dict[str, Any]] = []

    for c in candidates:
        p_name = c["process"]
        c_type = c["category"]
        pk = all_peaks.get(p_name, 0.0)
        is_audio_active = p_name in active_audio_procs or pk > 0.0001
        c["audio_peak"] = pk
        c["audio_active"] = is_audio_active

        if c_type == "VIDEO":
            if is_audio_active:
                active_video_items.append(c)
            else:
                paused_video_items.append(c)
        elif c_type == "PURE_AUDIO":
            pure_audio_items.append(c)
        elif c_type == "EMPTY_PLAYER":
            empty_player_items.append(c)

    # Decision Matrix:
    # 1. Any VIDEO actively playing with audio -> BUSY (NOT IDLE)
    if active_video_items:
        top_video = active_video_items[0]
        app_name = top_video["app_name"]
        title = top_video["title"]
        pk = top_video["audio_peak"]

        is_idle = False
        state_code = "VIDEO_PLAYING"
        verdict_en = f"[BUSY] Windows is NOT in idle condition: Video is actively playing in {app_name} ('{title}')"
        verdict_hi = f"[व्यस्त / NOT IDLE] विंडोज आइडल कंडीशन में नहीं है: {app_name} में वीडियो एक्टिवली प्ले हो रहा है ('{title}')"
        summary_msg = f"Actively playing video in {app_name} (Peak: {pk:.1%})"

    # 2. Pure Audio is playing (e.g. Modern Windows Media Player, VLC playing MP3, or Spotify) -> IDLE (Pure audio ignored!)
    elif pure_audio_items and any(item.get("audio_active") for item in pure_audio_items):
        active_audio = next(item for item in pure_audio_items if item.get("audio_active"))
        app_name = active_audio["app_name"]
        title = active_audio["title"]
        rationale = active_audio["rationale"]

        is_idle = True
        state_code = "PURE_AUDIO_IGNORED"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: Audio is playing in {app_name} ('{title}') [Pure Audio Ignored - Video Not Playing]"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: {app_name} में ऑडियो चल रहा है ('{title}') [प्योर ऑडियो इग्नोर - वीडियो नहीं चल रहा]"
        summary_msg = f"Pure audio detected ({rationale}) - Ignored, video is not playing"

    # 3. Video is open but PAUSED / SILENT -> IDLE
    elif paused_video_items:
        top_paused = paused_video_items[0]
        app_name = top_paused["app_name"]
        title = top_paused["title"]

        is_idle = True
        state_code = "VIDEO_PAUSED"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: Video is paused / silent in {app_name} ('{title}')"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: {app_name} में वीडियो पॉज / शांत है ('{title}')"
        summary_msg = f"Video is paused/silent in {app_name}"

    # 4. Pure audio app is open but silent
    elif pure_audio_items:
        first_audio = pure_audio_items[0]
        app_name = first_audio["app_name"]

        is_idle = True
        state_code = "PURE_AUDIO_SILENT"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: Audio app {app_name} is silent [Pure Audio Ignored]"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: ऑडियो ऐप {app_name} शांत है [प्योर ऑडियो इग्नोर]"
        summary_msg = f"Audio app {app_name} is silent"

    # 5. No media candidate at all -> IDLE
    else:
        is_idle = True
        state_code = "NO_MEDIA"
        verdict_en = "[OK / IDLE] Windows IS in idle condition: No video is currently playing"
        verdict_hi = "[ओके / IDLE] विंडोज आइडल कंडीशन में है: वर्तमान में कोई वीडियो प्ले नहीं हो रहा है"
        summary_msg = "No media applications or video streams active"

    # Audio peak determination
    if active_video_items:
        current_audio_peak = active_video_items[0].get("audio_peak", master_peak)
    elif pure_audio_items and any(item.get("audio_active") for item in pure_audio_items):
        active_audio_item = next(item for item in pure_audio_items if item.get("audio_active"))
        current_audio_peak = active_audio_item.get("audio_peak", master_peak)
    else:
        current_audio_peak = master_peak

    now = time.time()
    is_video_playing = bool(active_video_items)
    tracker_state = _tracker.update(is_video_playing, now=now)

    return {
        "timestamp": now,
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
        "is_idle": is_idle,
        "state_code": state_code,
        "verdict_en": verdict_en,
        "verdict_hi": verdict_hi,
        "summary": summary_msg,
        "audio_peak": current_audio_peak,
        "continuous_play_seconds": tracker_state["continuous_play_seconds"],
        "continuous_pause_seconds": tracker_state["continuous_pause_seconds"],
        "activity_history_60m": tracker_state["activity_history_60m"],
        "wasapi": {
            "master_peak": master_peak,
            "active_audio_processes": active_audio_procs,
            "all_session_peaks": all_peaks
        },
        "media_candidates": {
            "active_videos": active_video_items,
            "paused_videos": paused_video_items,
            "pure_audio": pure_audio_items,
            "empty_players": empty_player_items
        }
    }
