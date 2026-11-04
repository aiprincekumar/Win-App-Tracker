# -*- coding: utf-8 -*-
"""
modules/evaluator.py: Master Video Inactivity Evaluator and Decision Matrix Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import sys
import time
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Tuple

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from .audio import (
    get_live_wasapi_audio_state,
    get_audio_volume_state,
    get_default_audio_device_name,
    AudioVolumeState
)
from .window_scanner import scan_system_media_candidates
from .classifier import classify_media_window, extract_platform_tag, classify_smtc_session
from .win32_api import inspect_window_presentation
from .powercfg import get_power_source_status
from .hardware_telemetry import get_process_cpu_and_ram
from .smtc import get_all_smtc_sessions, sanitize_media_title
from .config import BROWSER_PROCESSES, HUDOperatingMode, DEFAULT_OPERATING_MODE
from .analytics import get_event_detector
from .browser_ws_server import get_cached_browser_media_state
from .offline_player import (
    inspect_offline_player_timeline,
    update_offline_player_progress,
    format_seek_timeline,
    extract_timeline_from_text,
    reset_playback_progress_cache
)

_last_known_speeds: Dict[str, float] = {}
_position_tracker: Dict[str, Dict[str, Any]] = {}


def reset_position_tracker() -> None:
    """Resets evaluation cycle position history for test isolation."""
    global _position_tracker
    _position_tracker.clear()
    reset_playback_progress_cache()


GENERIC_WINDOW_TITLES = {
    "google chrome", "chrome", "microsoft edge", "edge", "mozilla firefox", "firefox",
    "brave", "opera", "opera gx", "new tab", "about:blank", "windows media player",
    "media player", "vlc media player", "potplayer", "mpc-hc", "mpc-be", "mpv",
    "films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video"
}


def _is_generic_title(title: str) -> bool:
    if not title:
        return True
    t = title.strip().lower()
    if t in GENERIC_WINDOW_TITLES:
        return True
    if any(t.endswith(f" - {g}") for g in ["google chrome", "microsoft edge", "mozilla firefox", "brave"]):
        prefix = t.split(" - ")[0].strip()
        if prefix in ("new tab", "home", "about:blank", "start", "speed dial"):
            return True
    return False


@dataclass
class MediaState:
    is_idle: bool
    state_code: str
    verdict_en: str
    verdict_hi: str
    summary: str
    platform_tag: str
    volume_state: AudioVolumeState
    window_mode: str
    resolution: str
    cpu_percent: float
    ram_mb: float
    power_status: Dict[str, Any]
    multi_streams: List[Dict[str, Any]]
    ghost_streams: List[Dict[str, Any]]
    continuous_play_seconds: float
    continuous_pause_seconds: float
    timestamp: float

    # New Telemetry Fields for v3.0 Redesign
    is_video_playing: bool = False
    status: str = "IDLE"
    status_text: str = "IDLE"
    is_muted_playback: bool = False
    idle_seconds: float = 0.0
    idle_threshold: float = 60.0
    target_action: str = "AUTO-SHUTDOWN"
    idle_resets_today: int = 0
    is_approaching_action: bool = False
    top_section_mode: str = "IDLE_SENTINEL"

    # Section 1: Track Timeline & Speed
    track_title: str = "Sentinel Standby"
    track_position_sec: float = 0.0
    track_duration_sec: float = 0.0
    track_progress_pct: float = 0.0
    seek_time_str: str = "00:00 / 00:00"
    playback_speed: float = 1.00
    app_name: str = "System"
    presentation_mode: str = "WINDOWED"

    # Section 2: Triple Volume Monitoring
    audio_peak_pct: int = 0
    master_volume_pct: int = 100
    master_muted: bool = False
    app_volume_pct: int = 100
    app_muted: bool = False

    # Section 3: Timers
    cur_video_seconds: float = 0.0
    day_watch_seconds_today: int = 0
    paused_seconds: float = 0.0
    silence_seconds: float = 0.0

    # Section 4: True Active Accounting
    is_true_active: bool = False
    total_uptime_seconds_today: int = 0
    true_active_seconds_today: int = 0
    true_inactive_seconds_today: int = 0
    active_ratio: float = 0.0
    active_ratio_pct: int = 0

    # Section 5: Daily Events Matrix
    daily_event_counts: Optional[Dict[str, int]] = None

    # Section 6: Source & Hardware Routing
    media_source_tag: str = "Web Stream"
    output_device_name: str = "Speakers / Headphones"
    peak_run_seconds_today: int = 0

    # Section 7: Motion & Display Specs
    video_fps: int = 60
    rendering_fps: str = "0 FPS (Static)"
    view_state: str = "100% Visible/Uncovered"
    is_occluded: bool = False
    video_resolution: str = "1920x1080 (16:9)"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)



class VideoActivityTracker:
    """
    Maintains persistent metrics across evaluation cycles:
      1. Continuous Video Play Duration (cur_video_seconds).
      2. Continuous Video Pause/Stop Duration (paused_seconds).
      3. Silence Duration (seconds active video played while muted or silent).
      4. True Active vs Inactive Accounting (triple-condition gate).
      5. 60-Minute Historical Activity Ring Buffer (minute-by-minute activity history).
    """

    def __init__(self, history_minutes: int = 60):
        self.history_minutes = history_minutes
        self.reset()

    def reset(self):
        """Resets tracker state."""
        self._last_tick = time.time()
        self._last_eval_time: Optional[float] = None
        self._last_is_video_playing: Optional[bool] = None
        self._continuous_play_seconds: float = 0.0
        self._continuous_pause_seconds: float = 0.0
        self._minute_activity: Dict[int, float] = {}

        # True Active Accounting State
        self.total_uptime_seconds: int = 0
        self.true_active_seconds: int = 0
        self.true_inactive_seconds: int = 0
        self.current_streak_seconds: int = 0
        self.peak_streak_seconds: int = 0
        self.is_last_active: bool = False
        self.today_watch_seconds: int = 0
        self.silence_seconds: float = 0.0

    def tick(
        self,
        is_playing: bool,
        is_muted: bool,
        is_on_screen: bool,
        is_minimized: bool = False,
        dt: Optional[float] = None
    ) -> Tuple[bool, int, int, int]:
        """
        Executes strict True Active Accounting tick.
        Triple condition: is_playing and (not is_muted) and (not is_minimized) and is_on_screen
        """
        now = time.time()
        if dt is None:
            delta = int(now - self._last_tick)
            if delta < 1:
                return self.is_last_active, self.total_uptime_seconds, self.true_active_seconds, self.true_inactive_seconds
            self._last_tick = now
        else:
            delta = int(dt)
            self._last_tick = now

        self.total_uptime_seconds += delta

        # Inviolable Triple Condition: Playing + Unmuted + On-Screen (and not minimized)
        is_active = bool(is_playing and (not is_muted) and (not is_minimized) and is_on_screen)
        self.is_last_active = is_active

        if is_active:
            self.true_active_seconds += delta
            self.current_streak_seconds += delta
            if self.current_streak_seconds > self.peak_streak_seconds:
                self.peak_streak_seconds = self.current_streak_seconds
        else:
            self.true_inactive_seconds += delta
            self.current_streak_seconds = 0

        if is_playing:
            self.today_watch_seconds += delta
            if is_muted:
                self.silence_seconds += delta
            else:
                self.silence_seconds = 0.0
        else:
            # Video is PAUSED/STOPPED:
            # User explicit requirement: "jab video pause or mute dono hai to sirf pause ka timmer chalega"
            # Pause timer takes strict exclusivity over mute/silence timer.
            # ONLY paused_seconds increments; silence_seconds must NOT increment and remains 0.0!
            self.silence_seconds = 0.0

        return is_active, self.total_uptime_seconds, self.true_active_seconds, self.true_inactive_seconds

    def update(
        self,
        is_video_playing: bool,
        now: Optional[float] = None,
        dt: Optional[float] = None,
        is_muted: bool = False,
        is_on_screen: bool = True,
        is_minimized: bool = False
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
            self.silence_seconds = 0.0

        # Prune minutes older than history_minutes
        cutoff = curr_m - self.history_minutes
        self._minute_activity = {k: v for k, v in self._minute_activity.items() if k >= cutoff}

        if dt > 0:
            self.tick(is_video_playing, is_muted, is_on_screen, is_minimized, dt=dt)

        return {
            "continuous_play_seconds": self._continuous_play_seconds,
            "continuous_pause_seconds": self._continuous_pause_seconds,
            "cur_video_seconds": self._continuous_play_seconds,
            "paused_seconds": self._continuous_pause_seconds,
            "silence_seconds": self.silence_seconds,
            "today_watch_seconds": self.today_watch_seconds,
            "total_uptime_seconds": self.total_uptime_seconds,
            "true_active_seconds": self.true_active_seconds,
            "true_inactive_seconds": self.true_inactive_seconds,
            "is_true_active": self.is_last_active,
            "active_ratio": self.active_ratio,
            "active_ratio_pct": self.active_ratio_pct,
            "peak_streak_seconds": self.peak_streak_seconds,
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

    @property
    def cur_video_seconds(self) -> float:
        return self._continuous_play_seconds

    @property
    def paused_seconds(self) -> float:
        return self._continuous_pause_seconds

    @property
    def active_ratio(self) -> float:
        return self.true_active_seconds / max(1, self.total_uptime_seconds)

    @property
    def active_ratio_pct(self) -> int:
        return int(round(self.active_ratio * 100))


# Global singleton instance
_tracker = VideoActivityTracker()


def get_activity_tracker() -> VideoActivityTracker:
    """Returns the global VideoActivityTracker singleton."""
    return _tracker


def reset_activity_tracker():
    """Resets the global VideoActivityTracker singleton."""
    _tracker.reset()


def evaluate_video_inactivity(idle_seconds: float = 0.0, idle_threshold: float = 60.0) -> Dict[str, Any]:
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

    # Windows Native SMTC transport control sessions (Chrome, Edge, Spotify, VLC, MPV, WMP, etc.)
    smtc_sessions = get_all_smtc_sessions(wait_initial=True)

    candidates = scan_system_media_candidates()
    power_status = get_power_source_status()

    # Index candidates by process
    cand_by_proc: Dict[str, Dict[str, Any]] = {c["process"]: c for c in candidates}

    # 1. Merge SMTC media sessions into candidates
    for proc_name, s_info in smtc_sessions.items():
        s_class = classify_smtc_session(s_info)
        s_type = s_class.get("type", "UNKNOWN")
        if s_type not in ("VIDEO", "PURE_AUDIO"):
            continue

        s_title = sanitize_media_title(s_class.get("title") or s_info.get("title") or "")
        s_playing = s_info.get("is_playing", False)
        s_paused = s_info.get("is_paused", False)
        s_platform = s_class.get("platform_tag", "Generic Player")
        s_speed = float(s_info.get("playback_speed", 0.0))
        if s_speed > 0.05:
            _last_known_speeds[proc_name] = s_speed
        else:
            s_speed = _last_known_speeds.get(proc_name, 1.00)

        # Match candidate by exact process or normalized player name
        matched_candidate = None
        for cand_item in candidates:
            cp = cand_item["process"].lower().strip()
            ct = cand_item.get("title", "").lower()
            ca = cand_item.get("app_name", "").lower()
            if cp == proc_name:
                matched_candidate = cand_item
                break
            if proc_name == "microsoft.media.player.exe" and (
                "media.player" in cp or "zune" in cp or
                ("applicationframehost" in cp and ("media player" in ct or "media player" in ca)) or
                "media player" in ca
            ):
                matched_candidate = cand_item
                break
            if proc_name in ("mpc-hc.exe", "mpc-hc64.exe") and ("mpc-hc" in cp or "mediaplayerclassic" in cp or "mpc-hc" in ca):
                matched_candidate = cand_item
                break
            if proc_name in ("mpc-be.exe", "mpc-be64.exe") and ("mpc-be" in cp or "mpc-be" in ca):
                matched_candidate = cand_item
                break
            if proc_name == "wmplayer.exe" and ("wmplayer" in cp or "windows media player" in ct or "windows media player" in ca):
                matched_candidate = cand_item
                break
            if proc_name == "video.ui.exe" and (
                "video.ui" in cp or
                ("applicationframehost" in cp and any(k in ct for k in ["films & tv", "movies & tv", "films and tv", "movies and tv"])) or
                any(k in ct for k in ["films & tv", "movies & tv", "films and tv", "movies and tv"]) or
                "films & tv" in ca
            ):
                matched_candidate = cand_item
                break
            if proc_name in cp or cp in proc_name:
                matched_candidate = cand_item
                break

        if matched_candidate:
            c = matched_candidate
            if s_title and (_is_generic_title(c.get("title", "")) or not c.get("title") or s_playing or s_paused):
                c["title"] = s_title
            c["smtc_playing"] = s_playing
            c["smtc_paused"] = s_paused
            c["smtc_type"] = s_type
            s_dur = float(s_info.get("seek_duration_sec", 0.0))
            s_pos = float(s_info.get("seek_position_sec", 0.0))
            if s_dur > 0.0:
                c["seek_duration_sec"] = s_dur
            if s_pos > 0.0 or s_dur > 0.0:
                c["seek_position_sec"] = s_pos
            dur = float(c.get("seek_duration_sec", 0.0))
            pos = float(c.get("seek_position_sec", 0.0))
            if dur > 0.0:
                c["seek_progress"] = min(1.0, max(0.0, pos / dur))
                c["seek_time_str"] = format_seek_timeline(pos, dur)
            elif s_info.get("seek_time_str"):
                c["seek_time_str"] = s_info.get("seek_time_str")
            c["playback_speed"] = s_speed
            if s_type == "VIDEO" and c.get("category") in ("UNKNOWN", "EMPTY_PLAYER"):
                c["category"] = "VIDEO"
            elif s_type == "PURE_AUDIO":
                c["category"] = "PURE_AUDIO"
            if s_platform != "Generic Player":
                c["platform_tag"] = s_platform
        else:
            candidates.append({
                "hwnd": None,
                "category": s_type,
                "app_name": s_class.get("app_name", proc_name),
                "process": proc_name,
                "pid": "N/A",
                "title": s_title or f"Media Session ({proc_name})",
                "status": "Playing" if s_playing else "Paused",
                "file_ext": None,
                "rationale": s_class.get("rationale", "Active SMTC media session"),
                "platform_tag": s_platform,
                "smtc_playing": s_playing,
                "smtc_paused": s_paused,
                "smtc_type": s_type,
                "seek_position_sec": s_info.get("seek_position_sec", 0.0),
                "seek_duration_sec": s_info.get("seek_duration_sec", 0.0),
                "seek_progress": s_info.get("seek_progress", 0.0),
                "seek_time_str": s_info.get("seek_time_str", "00:00 / 00:00"),
                "playback_speed": s_speed,
                "is_occluded": False,
                "view_state": "100% VISIBLE (Uncovered)",
                "video_resolution": "1080p FHD (16:9 Aspect)",
                "rendering_fps": "60 FPS (Active Motion)" if s_playing else "0 FPS (Static)"
            })

    # 2. Account for active audio processes in WASAPI not yet in candidates
    for proc_name, peak in active_audio_procs.items():
        if any(c["process"] == proc_name for c in candidates):
            continue

        classification = classify_media_window(proc_name, "N/A", proc_name)
        c_type = classification.get("type", "UNKNOWN")
        if c_type in ("VIDEO", "PURE_AUDIO", "EMPTY_PLAYER"):
            candidates.append({
                "hwnd": None,
                "category": c_type,
                "app_name": classification.get("app_name", proc_name),
                "process": proc_name,
                "pid": "N/A",
                "title": f"Background Audio ({classification.get('app_name', proc_name)})",
                "status": "Running",
                "file_ext": None,
                "rationale": classification.get("rationale", "Background audio emitter"),
                "platform_tag": classification.get("platform_tag", "Generic Player")
            })
        elif proc_name in BROWSER_PROCESSES:
            app_name = BROWSER_PROCESSES[proc_name]
            candidates.append({
                "hwnd": None,
                "category": "VIDEO",
                "app_name": app_name,
                "process": proc_name,
                "pid": "N/A",
                "title": f"Active Web Media ({app_name})",
                "status": "Playing",
                "file_ext": None,
                "rationale": f"Active browser audio output in {app_name}",
                "platform_tag": "Web Stream"
            })


    # 3. Ingest real-time browser media telemetry via RFC 6455 WebSocket Bridge
    browser_state = get_cached_browser_media_state()
    browser_reported_vol_pct: Optional[int] = None
    browser_reported_muted: Optional[bool] = None
    if browser_state.get("is_connected"):
        has_browser_video = browser_state.get("has_active_video", False)
        pm = browser_state.get("primary_media") or {}
        b_type = browser_state.get("browser_type", "Chrome")
        b_proc = "msedge.exe" if "Edge" in b_type else "chrome.exe"
        b_app = f"Microsoft {b_type}" if "Edge" in b_type else f"Google {b_type}"

        pm_title = pm.get("title") or browser_state.get("primary_title") or f"Browser Media ({b_type})"
        pm_domain = pm.get("domain") or browser_state.get("primary_domain") or "Web"
        pm_platform = pm_domain.title() if pm_domain else "Web Stream"
        if "youtube" in pm_domain.lower():
            pm_platform = "YouTube"
        elif "netflix" in pm_domain.lower():
            pm_platform = "Netflix"
        elif "twitch" in pm_domain.lower():
            pm_platform = "Twitch"
        elif "hotstar" in pm_domain.lower() or "disney" in pm_domain.lower():
            pm_platform = "Disney+ Hotstar"
        elif "primevideo" in pm_domain.lower():
            pm_platform = "Prime Video"

        pm_is_playing = bool(pm.get("isPlaying", has_browser_video))
        # Extract normalized volume level and percentage from browser telemetry
        raw_vol = pm.get("volume")
        if raw_vol is None:
            raw_vol = browser_state.get("primary_volume", 1.0)
        try:
            pm_volume = float(raw_vol)
        except (ValueError, TypeError):
            pm_volume = 1.0
        pm_volume = max(0.0, min(1.0, pm_volume))

        raw_vol_pct = pm.get("volumePercent")
        if raw_vol_pct is None:
            raw_vol_pct = browser_state.get("primary_volume_percent", browser_state.get("volume_percent"))
        try:
            pm_volume_pct = int(raw_vol_pct) if raw_vol_pct is not None else int(round(pm_volume * 100))
        except (ValueError, TypeError):
            pm_volume_pct = int(round(pm_volume * 100))
        pm_volume_pct = max(0, min(100, pm_volume_pct))

        pm_is_muted = bool(pm.get("isMuted", False) or browser_state.get("is_muted", False) or pm_volume <= 0.001 or pm_volume_pct == 0)

        browser_reported_vol_pct = pm_volume_pct
        browser_reported_muted = pm_is_muted
        has_browser_telemetry_active = True
        pm_res = pm.get("resolutionLabel") or browser_state.get("primary_resolution") or "1080p FHD"
        pm_curr = float(pm.get("currentTime", 0.0) or browser_state.get("current_time", 0.0))
        pm_dur = float(pm.get("duration", 0.0) or browser_state.get("duration", 0.0))
        pm_rate = float(pm.get("playbackRate", 1.0) or browser_state.get("playback_rate", 1.0))

        if pm_dur > 0:
            m_c, s_c = divmod(int(pm_curr), 60)
            m_d, s_d = divmod(int(pm_dur), 60)
            pm_time_str = f"{m_c:02d}:{s_c:02d} / {m_d:02d}:{s_d:02d}"
            pm_progress = min(1.0, max(0.0, pm_curr / pm_dur))
        else:
            pm_time_str = "Live Stream" if pm_is_playing else "00:00 / 00:00"
            pm_progress = 0.0

        matched_browser = False
        for c in candidates:
            if c["process"].lower().strip() in (b_proc, "chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe"):
                matched_browser = True
                if has_browser_video:
                    c["category"] = "VIDEO"
                    c["status"] = "Playing" if pm_is_playing else "Paused"
                    c["title"] = pm_title
                    c["platform_tag"] = pm_platform
                    c["video_resolution"] = pm_res
                    c["seek_position_sec"] = pm_curr
                    c["seek_duration_sec"] = pm_dur
                    c["seek_time_str"] = pm_time_str
                    c["seek_progress"] = pm_progress
                    c["playback_speed"] = pm_rate
                    c["is_muted_playback"] = pm_is_muted
                    c["browser_volume"] = pm_volume
                    c["browser_volume_pct"] = pm_volume_pct
                    c["browser_muted"] = pm_is_muted
                    c["rationale"] = f"In-Page HTML5 Media Sentinel ({pm_domain})"
                    c["browser_telemetry_attached"] = True
                elif browser_state.get("has_active_audio"):
                    c["category"] = "PURE_AUDIO"
                    c["status"] = "Playing" if pm_is_playing else "Paused"
                    c["title"] = pm_title
                    c["platform_tag"] = pm_platform
                    c["browser_volume"] = pm_volume
                    c["browser_volume_pct"] = pm_volume_pct
                    c["browser_muted"] = pm_is_muted
                    c["rationale"] = f"In-Page HTML5 Audio Stream ({pm_domain})"
                    c["browser_telemetry_attached"] = True
                break

        if not matched_browser and (has_browser_video or browser_state.get("has_active_audio")):
            c_type = "VIDEO" if has_browser_video else "PURE_AUDIO"
            candidates.append({
                "hwnd": None,
                "category": c_type,
                "app_name": b_app,
                "process": b_proc,
                "pid": "N/A",
                "title": pm_title,
                "status": "Playing" if pm_is_playing else "Paused",
                "file_ext": None,
                "rationale": f"Live In-Page Media Sentinel ({pm_domain})",
                "platform_tag": pm_platform,
                "video_resolution": pm_res,
                "seek_position_sec": pm_curr,
                "seek_duration_sec": pm_dur,
                "seek_progress": pm_progress,
                "seek_time_str": pm_time_str,
                "playback_speed": pm_rate,
                "is_muted_playback": pm_is_muted,
                "browser_volume": pm_volume,
                "browser_volume_pct": pm_volume_pct,
                "browser_muted": pm_is_muted,
                "is_occluded": False,
                "view_state": "100% VISIBLE (Active Web Media)",
                "rendering_fps": "60 FPS (Active Motion)" if pm_is_playing else "0 FPS (Static)",
                "smtc_playing": pm_is_playing,
                "smtc_paused": not pm_is_playing,
                "audio_active": pm_is_playing and not pm_is_muted,
                "browser_telemetry_attached": True
            })
    else:
        browser_state = get_cached_browser_media_state()

    active_video_items: List[Dict[str, Any]] = []
    paused_video_items: List[Dict[str, Any]] = []
    pure_audio_items: List[Dict[str, Any]] = []
    empty_player_items: List[Dict[str, Any]] = []

    for c in candidates:
        p_name = c["process"].lower().strip()
        c_type = c["category"]
        pk = all_peaks.get(p_name, 0.0)
        # Correlate WASAPI audio peaks across UWP ApplicationFrameHost container and actual rendering process
        if pk <= 0.0001:
            cand_t = c.get("title", "").lower()
            cand_app = c.get("app_name", "").lower()
            if p_name == "applicationframehost.exe":
                if any(k in cand_t for k in ["films", "tv", "movie"]) or "films" in cand_app:
                    pk = max(pk, all_peaks.get("video.ui.exe", 0.0))
                elif "media player" in cand_t or "media player" in cand_app:
                    pk = max(pk, all_peaks.get("microsoft.media.player.exe", 0.0))
            elif p_name == "video.ui.exe":
                pk = max(pk, all_peaks.get("applicationframehost.exe", 0.0))
            elif p_name == "microsoft.media.player.exe":
                pk = max(pk, all_peaks.get("applicationframehost.exe", 0.0))

        is_audio_active = (p_name in active_audio_procs) or (pk > 0.0001)
        if not is_audio_active and p_name == "applicationframehost.exe":
            if "video.ui.exe" in active_audio_procs or "microsoft.media.player.exe" in active_audio_procs:
                is_audio_active = True

        c["audio_peak"] = pk
        c["audio_active"] = is_audio_active

        # Presentation and geometry inspection
        hwnd = c.get("hwnd")
        pres = inspect_window_presentation(hwnd) if hwnd else {"mode": "WINDOWED", "width": c.get("width", 0), "height": c.get("height", 0), "monitor_res": "1920x1080"}
        c["window_mode"] = pres["mode"]
        c["resolution"] = c.get("video_resolution") or pres["monitor_res"]
        c["width"] = pres["width"] or c.get("width", 0)
        c["height"] = pres["height"] or c.get("height", 0)
        if "view_state" not in c:
            c["view_state"] = "100% VISIBLE (Uncovered)" if pres["mode"] != "MINIMIZED" else "Minimized"
        if "is_occluded" not in c:
            c["is_occluded"] = (pres["mode"] == "MINIMIZED")

        # Platform tagging
        if not c.get("platform_tag") or c.get("platform_tag") == "None":
            c["platform_tag"] = extract_platform_tag(c.get("title", ""), p_name)

        c["cpu_percent"] = 0.0
        c["ram_mb"] = 0.0
        c["hw_accel"] = False

        # Upgrade EMPTY_PLAYER if audio is active or file detected
        if c_type == "EMPTY_PLAYER" and (is_audio_active or c.get("detected_file") or c.get("detected_path")):
            c_type = "VIDEO"
            c["category"] = "VIDEO"

        # Fallback offline player timeline inspection if duration is missing
        if c.get("seek_duration_sec", 0.0) <= 0.0 and c_type in ("VIDEO", "EMPTY_PLAYER"):
            tl_res = inspect_offline_player_timeline(
                c.get("title", ""),
                p_name,
                hwnd=hwnd,
                pid=int(c.get("pid", 0)) if str(c.get("pid", "")).isdigit() else None,
                detected_file=c.get("detected_file"),
                detected_path=c.get("detected_path")
            )
            if tl_res.get("seek_duration_sec", 0.0) > 0.0:
                c["seek_position_sec"] = tl_res["seek_position_sec"]
                c["seek_duration_sec"] = tl_res["seek_duration_sec"]
                c["seek_progress"] = tl_res["seek_progress"]
                c["seek_time_str"] = tl_res["seek_time_str"]
                if tl_res.get("clean_title") and (_is_generic_title(c.get("title", "")) or not c.get("title")):
                    c["title"] = tl_res["clean_title"]
                if tl_res.get("video_resolution") and tl_res.get("video_resolution") != "N/A":
                    c["video_resolution"] = tl_res["video_resolution"]
                    c["resolution"] = tl_res["video_resolution"]
                if tl_res.get("playback_speed"):
                    c["playback_speed"] = tl_res["playback_speed"]
                if c_type == "EMPTY_PLAYER":
                    c_type = "VIDEO"
                    c["category"] = "VIDEO"

        # Check process mute and system mute
        proc_vols = wasapi_state.get("process_volumes", {})
        is_app_muted = bool(p_name in proc_vols and proc_vols[p_name].get("muted", False))
        is_system_muted = bool(wasapi_state.get("master_muted", False))
        c["is_app_muted"] = is_app_muted

        # Position-Delta Ground Truth Tracking
        now = time.time()
        cand_key = f"{p_name}_{c.get('pid') or c.get('hwnd') or 0}"
        cur_pos = float(c.get("seek_position_sec", 0.0))
        dur_sec = float(c.get("seek_duration_sec", 0.0))

        prev_tracking = _position_tracker.get(cand_key)
        is_pos_advancing = False
        advancing_streak = 0
        static_streak = 0

        if prev_tracking and dur_sec > 0:
            d_pos = cur_pos - prev_tracking["last_pos"]
            if d_pos < -2.0:
                # Seek backward -> active seek
                is_pos_advancing = True
                advancing_streak = 1
                static_streak = 0
            elif d_pos > 0.05:
                # Video position is clearly advancing forward
                is_pos_advancing = True
                advancing_streak = prev_tracking.get("advancing_streak", 0) + 1
                static_streak = 0
            else:
                is_pos_advancing = False
                static_streak = prev_tracking.get("static_streak", 0) + 1
                advancing_streak = 0
        elif cur_pos > 0 and dur_sec > 0:
            is_pos_advancing = False

        # Video playback detection distinguishing PLAYING vs PAUSED vs MUTED
        is_smtc_playing = c.get("smtc_playing", False)
        is_smtc_paused = c.get("smtc_paused", False)
        title_paused = bool(c.get("title_indicates_paused", False) or c.get("is_paused", False) or (c.get("status") == "Paused"))

        is_playing = False
        is_muted_playback = False

        if c.get("browser_telemetry_attached"):
            is_playing = bool(c.get("status") == "Playing")
            is_muted_playback = bool(c.get("is_muted_playback", False) or is_app_muted or is_system_muted)
        elif is_smtc_paused or title_paused:
            # Explicit pause reported by SMTC or window title
            is_playing = False
            is_muted_playback = False
        elif is_audio_active or pk > 0.0001:
            # Live WASAPI audio output confirmed -> PLAYING
            is_playing = True
            is_muted_playback = False
        elif is_pos_advancing:
            # Video position is advancing forward on screen, but audio peak is 0 or mixer is muted:
            # Bulletproof Ground Truth: Video is playing muted!
            is_playing = True
            is_muted_playback = True
        elif is_smtc_playing:
            # SMTC reports active playback
            if static_streak >= 2 and not (is_app_muted or is_system_muted) and pk <= 0.0001:
                # Position has been static for 2+ cycles and audio is silent -> PAUSED
                is_playing = False
                is_muted_playback = False
            else:
                is_playing = True
                is_muted_playback = bool(is_app_muted or is_system_muted or (pk <= 0.0001 and not is_audio_active))
        elif is_app_muted or is_system_muted:
            # Active video surface/window is muted in Windows Volume Mixer
            if is_pos_advancing:
                # Video is actively advancing on screen while mixer is muted -> MUTED PLAYBACK
                is_playing = True
                is_muted_playback = True
            elif prev_tracking and not is_pos_advancing:
                # Position is verified static across checks (delta pos == 0) -> strictly PAUSED!
                is_playing = False
                is_muted_playback = False
            elif not is_smtc_paused and not title_paused and not prev_tracking:
                # First observation of muted window without prior history
                is_playing = True
                is_muted_playback = True
            else:
                # Paused while mixer is muted -> strictly PAUSED!
                is_playing = False
                is_muted_playback = False
        else:
            # Offline player is open with zero audio output, not muted in mixer, position static -> PAUSED!
            is_playing = False
            is_muted_playback = False

        # Update offline progression and timeline progress
        has_explicit_timeline = bool(c.get("smtc_playing") or c.get("smtc_paused") or extract_timeline_from_text(c.get("title", "")))
        if dur_sec > 0:
            if is_playing and not has_explicit_timeline:
                prog_info = update_offline_player_progress(
                    proc_name=p_name,
                    pid=int(c.get("pid", 0)) if str(c.get("pid", "")).isdigit() else 0,
                    dur_sec=dur_sec,
                    is_playing=True,
                    speed=float(c.get("playback_speed", 1.0)),
                    current_pos=cur_pos
                )
                c["seek_position_sec"] = prog_info["pos_sec"]
                c["seek_progress"] = prog_info["progress"]
                c["seek_time_str"] = prog_info["time_str"]
                cur_pos = prog_info["pos_sec"]
            else:
                prog_info = update_offline_player_progress(
                    proc_name=p_name,
                    pid=int(c.get("pid", 0)) if str(c.get("pid", "")).isdigit() else 0,
                    dur_sec=dur_sec,
                    is_playing=False,
                    speed=float(c.get("playback_speed", 1.0)),
                    current_pos=cur_pos
                )
                c["seek_position_sec"] = prog_info["pos_sec"]
                c["seek_progress"] = prog_info["progress"]
                c["seek_time_str"] = prog_info["time_str"]
                cur_pos = prog_info["pos_sec"]

        _position_tracker[cand_key] = {
            "last_pos": cur_pos,
            "last_ts": now,
            "advancing_streak": advancing_streak,
            "static_streak": static_streak,
            "is_advancing": is_pos_advancing,
            "was_playing": is_playing,
            "was_muted": is_muted_playback
        }

        c["is_playing"] = is_playing
        c["is_muted_playback"] = is_muted_playback
        c["rendering_fps"] = "60 FPS (Active Motion)" if (c_type == "VIDEO" and is_playing) else "0 FPS (Static)"

        if c_type == "VIDEO":
            if is_playing:
                active_video_items.append(c)
            else:
                paused_video_items.append(c)
        elif c_type == "PURE_AUDIO":
            c["audio_active"] = is_playing
            pure_audio_items.append(c)
        elif c_type == "EMPTY_PLAYER":
            empty_player_items.append(c)


    status = "IDLE"
    status_text = "IDLE"

    # Decision Matrix:
    # 1. Any VIDEO actively playing with audio or muted -> BUSY (NOT IDLE)
    if active_video_items:
        top_video = active_video_items[0]
        app_name = top_video["app_name"]
        title = top_video["title"]
        pk = top_video["audio_peak"]
        is_muted_pb = top_video.get("is_muted_playback", False)

        is_idle = False
        if is_muted_pb:
            state_code = "VIDEO_MUTED"
            status = "MUTED"
            status_text = "MUTED"
            verdict_en = f"[BUSY] Windows is NOT in idle condition: Video is playing muted in {app_name} ('{title}')"
            verdict_hi = f"[व्यस्त / NOT IDLE] विंडोज आइडल कंडीशन में नहीं है: {app_name} में वीडियो म्यूटेड चल रहा है ('{title}')"
            summary_msg = f"Playing muted video in {app_name} [MUTED]"
        else:
            state_code = "VIDEO_PLAYING"
            status = "PLAYING"
            status_text = "PLAYING"
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
        status = "PLAYING"
        status_text = "PLAYING"
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
        status = "PAUSED"
        status_text = "PAUSED"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: Video is paused in {app_name} ('{title}')"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: {app_name} में वीडियो पॉज है ('{title}')"
        summary_msg = f"Video is paused in {app_name}"

    # 4. Pure audio app is open but silent
    elif pure_audio_items:
        first_audio = pure_audio_items[0]
        app_name = first_audio["app_name"]

        is_idle = True
        state_code = "PURE_AUDIO_SILENT"
        status = "SILENT"
        status_text = "SILENT"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: Audio app {app_name} is silent [Pure Audio Ignored]"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: ऑडियो ऐप {app_name} शांत है [प्योर ऑडियो इग्नोर]"
        summary_msg = f"Audio app {app_name} is silent"

    # 5. Empty Player open (no media loaded, library/home screen) -> IDLE
    elif empty_player_items:
        first_empty = empty_player_items[0]
        app_name = first_empty.get("app_name", "Media Player")
        title = first_empty.get("title", "")
        is_idle = True
        state_code = "NO_MEDIA"
        status = "NO_MEDIA"
        status_text = "NO_MEDIA"
        verdict_en = f"[OK / IDLE] Windows IS in idle condition: No video is currently playing ({app_name} is open with no media loaded)"
        verdict_hi = f"[ओके / IDLE] विंडोज आइडल कंडीशन में है: {app_name} खुला है लेकिन कोई मीडिया लोड नहीं है ('{title}')"
        summary_msg = f"{app_name} open on home/library screen with no media playing"

    # 6. No media candidate at all -> IDLE
    else:
        is_idle = True
        state_code = "NO_MEDIA"
        status = "NO_MEDIA"
        status_text = "NO_MEDIA"
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

    # Multi-video streams enumeration
    multi_streams = active_video_items + paused_video_items

    # Ghost streams: Any session with active audio whose window is minimized or headless
    ghost_streams = [
        c for c in candidates
        if c.get("audio_active") and (c.get("window_mode") == "MINIMIZED" or not c.get("hwnd"))
    ]

    top_item = None
    if active_video_items:
        top_item = active_video_items[0]
    elif paused_video_items:
        top_item = paused_video_items[0]
    elif pure_audio_items:
        top_item = pure_audio_items[0]
    elif empty_player_items:
        top_item = empty_player_items[0]

    platform_tag = top_item.get("platform_tag", "None") if top_item else "None"
    window_mode = top_item.get("window_mode", "None") if top_item else "None"
    resolution = top_item.get("resolution", "N/A") if top_item else "N/A"
    cpu_percent = top_item.get("cpu_percent", 0.0) if top_item else 0.0
    ram_mb = top_item.get("ram_mb", 0.0) if top_item else 0.0

    top_pid = None
    top_proc = None
    if top_item:
        top_proc = top_item.get("process")
        if not top_proc and top_item.get("app_name"):
            top_proc = top_item.get("app_name")
        if str(top_item.get("pid", "")).isdigit():
            p_val = int(top_item["pid"])
            if p_val > 0:
                top_pid = p_val
    target_browser_vol_pct: Optional[int] = None
    target_browser_muted: Optional[bool] = None

    is_browser_item = False
    if top_item:
        proc_str = str(top_item.get("process", "")).lower().strip()
        app_str = str(top_item.get("app_name", "")).lower().strip()
        is_browser_item = bool(
            top_item.get("browser_telemetry_attached") or
            proc_str in BROWSER_PROCESSES or
            any(b in app_str for b in ("chrome", "edge", "firefox", "brave", "opera", "browser"))
        )

    if is_browser_item and browser_reported_vol_pct is not None:
        target_browser_vol_pct = browser_reported_vol_pct
        target_browser_muted = browser_reported_muted
    elif top_item and top_item.get("browser_volume_pct") is not None:
        target_browser_vol_pct = int(top_item["browser_volume_pct"])
        target_browser_muted = bool(top_item.get("browser_muted", False))
    elif is_browser_item and browser_state.get("is_connected"):
        raw_b_pct = browser_state.get("volume_percent", browser_state.get("primary_volume_percent"))
        if raw_b_pct is not None:
            target_browser_vol_pct = int(raw_b_pct)
        else:
            target_browser_vol_pct = int(round(float(browser_state.get("primary_volume", 1.0)) * 100))
        target_browser_muted = bool(browser_state.get("is_muted", False) or target_browser_vol_pct == 0)

    target_app_vol_pct = None
    target_app_muted = None
    if top_item and top_item.get("hwnd"):
        try:
            from players.base_player import get_app_internal_volume
            internal_vol = get_app_internal_volume(
                hwnd=top_item.get("hwnd"),
                pid=top_pid,
                proc_name=top_proc
            )
            if internal_vol.get("is_app_level"):
                target_app_vol_pct = internal_vol.get("volume_percent")
                target_app_muted = internal_vol.get("is_muted")
        except Exception:
            pass

    volume_state = get_audio_volume_state(
        pid=top_pid,
        proc_name=top_proc,
        browser_volume_pct=target_browser_vol_pct,
        browser_muted=target_browser_muted,
        app_volume_pct=target_app_vol_pct,
        app_muted=target_app_muted
    )

    now = time.time()
    is_video_playing = bool(active_video_items)

    # True Active Condition checks
    is_muted = bool(
        volume_state.master_muted or
        volume_state.session_muted or
        (state_code == "VIDEO_MUTED") or
        (top_item and (top_item.get("is_app_muted") or top_item.get("is_muted_playback") or top_item.get("browser_muted")))
    )
    is_minimized = (window_mode == "MINIMIZED")
    is_occluded = bool(top_item.get("is_occluded", False) if top_item else False)
    is_on_screen = bool((not is_minimized) and (not is_occluded))
    is_true_active = bool(is_video_playing and (not is_muted) and (not is_minimized) and is_on_screen)

    tracker_state = _tracker.update(
        is_video_playing,
        now=now,
        is_muted=is_muted,
        is_on_screen=is_on_screen,
        is_minimized=is_minimized
    )

    if is_video_playing or state_code in ("VIDEO_PLAYING", "VIDEO_MUTED"):
        top_section_mode = "NOW_PLAYING"
    elif state_code == "VIDEO_PAUSED" and paused_video_items:
        top_section_mode = "VIDEO_PAUSED"
    else:
        top_section_mode = "IDLE_SENTINEL"
    is_approaching_action = bool(idle_seconds >= (0.80 * max(1.0, idle_threshold)))

    event_detector = get_event_detector()
    daily_events = event_detector.process_cycle(
        is_playing=is_video_playing,
        is_muted=is_muted,
        presentation_mode=window_mode,
        idle_seconds=idle_seconds
    )
    if tracker_state.get("peak_streak_seconds", 0) > 0:
        event_detector.storage.update_peak_run(tracker_state["peak_streak_seconds"])

    event_detector.storage.update_uptime_accounting(
        true_active=tracker_state["true_active_seconds"],
        true_inactive=tracker_state["true_inactive_seconds"],
        total_uptime=tracker_state["total_uptime_seconds"]
    )

    raw_track_title = top_item.get("title", "Sentinel Standby") if top_item else "Sentinel Standby"
    for suffix in [
        " - Films & TV", " - Movies & TV", " - Film & TV", " - Films and TV", " - Movies and TV", " - Video",
        " - VLC media player", " - VLC", " - Windows Media Player", " - Media Player"
    ]:
        if raw_track_title.lower().endswith(suffix.lower()):
            raw_track_title = raw_track_title[:-len(suffix)].strip()
            break
    track_title = sanitize_media_title(raw_track_title)
    track_position_sec = float(top_item.get("seek_position_sec", 0.0) if top_item else 0.0)
    track_duration_sec = float(top_item.get("seek_duration_sec", 0.0) if top_item else 0.0)
    track_progress_pct = float(top_item.get("seek_progress", 0.0) if top_item else 0.0)
    seek_time_str = str(top_item.get("seek_time_str", "00:00 / 00:00") if top_item else "00:00 / 00:00")

    cur_spd = float(top_item.get("playback_speed", 0.0) if top_item else 0.0)
    proc_key = top_item.get("process", "default") if top_item else "default"
    if cur_spd > 0.05:
        _last_known_speeds[proc_key] = cur_spd
        playback_speed = cur_spd
    else:
        playback_speed = _last_known_speeds.get(proc_key, 1.00)

    item_app_name = sanitize_media_title(str(top_item.get("app_name", "System") if top_item else "System"))
    view_state = str(top_item.get("view_state", "100% Visible/Uncovered") if top_item else "100% Visible/Uncovered")
    raw_res = top_item.get("video_resolution") if top_item else None
    if raw_res:
        video_res = str(raw_res)
    elif "1920x1080" in resolution:
        video_res = "1080p FHD (16:9 Aspect)"
    else:
        video_res = f"{resolution} (16:9 Aspect)"
    rendering_fps = "60 FPS (Active Motion)" if is_video_playing else "0 FPS (Static)"
    device_name = get_default_audio_device_name()

    return {
        "timestamp": now,
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
        "is_idle": is_idle,
        "state_code": state_code,
        "verdict_en": verdict_en,
        "verdict_hi": verdict_hi,
        "summary": summary_msg,
        "platform_tag": platform_tag,
        "volume_state": volume_state,
        "window_mode": window_mode,
        "resolution": resolution,
        "cpu_percent": cpu_percent,
        "ram_mb": ram_mb,
        "power_status": power_status,
        "multi_streams": multi_streams,
        "ghost_streams": ghost_streams,
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
        },

        # Section 1 & General Sentinel State
        "is_video_playing": is_video_playing,
        "status": status,
        "status_text": status_text,
        "is_muted_playback": bool(state_code == "VIDEO_MUTED"),
        "idle_seconds": idle_seconds,
        "idle_threshold": idle_threshold,
        "target_action": "AUTO-SHUTDOWN",
        "idle_resets_today": daily_events.get("idle_resets", 0),
        "is_approaching_action": is_approaching_action,
        "top_section_mode": top_section_mode,
        "track_title": track_title,
        "track_position_sec": track_position_sec,
        "track_duration_sec": track_duration_sec,
        "track_progress_pct": track_progress_pct,
        "seek_time_str": seek_time_str,
        "playback_speed": playback_speed,
        "app_name": item_app_name,
        "presentation_mode": window_mode,

        # Section 2: Triple Volume Monitoring
        "audio_peak_pct": int(round(current_audio_peak * 100)),
        "master_volume_pct": volume_state.master_volume_percent,
        "master_volume_level": volume_state.master_volume_level,
        "master_muted": volume_state.master_muted,
        "is_master_muted": volume_state.master_muted,
        "app_volume_pct": volume_state.app_volume_pct,
        "app_volume_level": volume_state.app_volume_level,
        "app_muted": volume_state.session_muted,
        "is_app_muted": volume_state.session_muted,
        "peak_amplitude": volume_state.peak_amplitude,

        # Section 3: Watch Timers
        "cur_video_seconds": tracker_state["cur_video_seconds"],
        "day_watch_seconds_today": tracker_state["today_watch_seconds"],
        "paused_seconds": tracker_state["paused_seconds"],
        "silence_seconds": tracker_state["silence_seconds"],

        # Section 4: True Active Accounting
        "is_true_active": is_true_active,
        "total_uptime_seconds_today": tracker_state["total_uptime_seconds"],
        "true_active_seconds_today": tracker_state["true_active_seconds"],
        "true_inactive_seconds_today": tracker_state["true_inactive_seconds"],
        "active_ratio": tracker_state["active_ratio"],
        "active_ratio_pct": tracker_state["active_ratio_pct"],

        # Section 5: Daily Events Matrix
        "daily_event_counts": daily_events,

        # Section 6: Source & Hardware Routing
        "media_source_tag": platform_tag if platform_tag != "None" else "Web Stream",
        "output_device_name": device_name,
        "peak_run_seconds_today": tracker_state["peak_streak_seconds"],

        # Section 7: Motion & Display Specs
        "video_fps": 60,
        "rendering_fps": rendering_fps,
        "view_state": view_state,
        "is_occluded": is_occluded,
        "video_resolution": video_res,
        "browser_telemetry": browser_state
    }


def evaluate_media_state(idle_seconds: float = 0.0, idle_threshold: float = 60.0) -> MediaState:
    """Evaluates system state and returns a structured MediaState dataclass instance."""
    data = evaluate_video_inactivity(idle_seconds=idle_seconds, idle_threshold=idle_threshold)
    return MediaState(
        is_idle=data["is_idle"],
        state_code=data["state_code"],
        verdict_en=data["verdict_en"],
        verdict_hi=data["verdict_hi"],
        summary=data["summary"],
        platform_tag=data["platform_tag"],
        volume_state=data["volume_state"],
        window_mode=data["window_mode"],
        resolution=data["resolution"],
        cpu_percent=data["cpu_percent"],
        ram_mb=data["ram_mb"],
        power_status=data["power_status"],
        multi_streams=data["multi_streams"],
        ghost_streams=data["ghost_streams"],
        continuous_play_seconds=data["continuous_play_seconds"],
        continuous_pause_seconds=data["continuous_pause_seconds"],
        timestamp=data["timestamp"],

        # Redesign Telemetry Fields
        is_video_playing=data["is_video_playing"],
        status=data.get("status", "IDLE"),
        status_text=data.get("status_text", "IDLE"),
        is_muted_playback=data.get("is_muted_playback", False),
        idle_seconds=data["idle_seconds"],
        idle_threshold=data["idle_threshold"],
        target_action=data["target_action"],
        idle_resets_today=data["idle_resets_today"],
        is_approaching_action=data["is_approaching_action"],
        top_section_mode=data["top_section_mode"],

        track_title=data["track_title"],
        track_position_sec=data["track_position_sec"],
        track_duration_sec=data["track_duration_sec"],
        track_progress_pct=data["track_progress_pct"],
        seek_time_str=data["seek_time_str"],
        playback_speed=data["playback_speed"],
        app_name=data["app_name"],
        presentation_mode=data["presentation_mode"],

        audio_peak_pct=data["audio_peak_pct"],
        master_volume_pct=data["master_volume_pct"],
        master_muted=data["master_muted"],
        app_volume_pct=data["app_volume_pct"],
        app_muted=data["app_muted"],

        cur_video_seconds=data["cur_video_seconds"],
        day_watch_seconds_today=data["day_watch_seconds_today"],
        paused_seconds=data["paused_seconds"],
        silence_seconds=data["silence_seconds"],

        is_true_active=data["is_true_active"],
        total_uptime_seconds_today=data["total_uptime_seconds_today"],
        true_active_seconds_today=data["true_active_seconds_today"],
        true_inactive_seconds_today=data["true_inactive_seconds_today"],
        active_ratio=data["active_ratio"],
        active_ratio_pct=data["active_ratio_pct"],

        daily_event_counts=data["daily_event_counts"],

        media_source_tag=data["media_source_tag"],
        output_device_name=data["output_device_name"],
        peak_run_seconds_today=data["peak_run_seconds_today"],

        video_fps=data["video_fps"],
        rendering_fps=data["rendering_fps"],
        view_state=data["view_state"],
        is_occluded=data["is_occluded"],
        video_resolution=data["video_resolution"]
    )


def get_media_state(idle_seconds: float = 0.0, idle_threshold: float = 60.0) -> MediaState:
    """Convenience alias for evaluate_media_state()."""
    return evaluate_media_state(idle_seconds=idle_seconds, idle_threshold=idle_threshold)


