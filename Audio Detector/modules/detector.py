# -*- coding: utf-8 -*-
"""
detector.py: Detection Orchestration, General Player Classification, and Decision Logic.

Coordinates WASAPI audio metering, multi-layered audio forensics,
dedicated legacy and modern WMP classifiers, and live dashboard rendering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

import sys
import os
import time
import re
import atexit
import ctypes
import subprocess
import threading
from ctypes import wintypes, byref, POINTER
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Set, Any

from .constants import (
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS,
    DEDICATED_VIDEO_ONLY_APPS,
    DUAL_PURPOSE_MEDIA_PLAYERS,
    BROWSER_PROCESSES,
    is_system_ignored_title,
    is_system_ignored_class,
    get_clean_player_name,
    PSUTIL_AVAILABLE,
    ProcessMediaClassification,
    classify_open_files,
    classify_text_for_media_type
)
from .wasapi import (
    ole32,
    kernel32,
    get_process_name_by_pid,
    get_live_wasapi_audio_state
)
from .wmp_classic import (
    user32,
    WNDENUMPROC,
    get_hwnds_for_pid,
    get_window_titles_for_pid,
    check_wmp_video_window,
    clean_wmp_window_title,
    extract_media_from_cmdline,
    WMPStabilizedState,
    reset_wmp_stabilizer,
    classify_wmp_legacy
)
from .wmp_modern import (
    MODERN_WMP_PROCESSES,
    is_modern_wmp_process,
    classify_wmp_modern
)
from .dashboard import (
    _clean_title,
    render_dashboard_card,
    render_simple_card,
    format_duration,
    render_activity_timeline
)

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore


def _resolve(name: str, fallback: Any) -> Any:
    """Checks if a symbol has been monkeypatched on root audio_detector module."""
    mod = sys.modules.get("audio_detector")
    if mod is not None and hasattr(mod, name):
        val = getattr(mod, name)
        if val is not None:
            return val
    return fallback


# ==============================================================================
# Console VT Mode & Win32 Window Enumeration
# ==============================================================================

def enable_windows_vt_mode() -> None:
    """Enables Win32 Virtual Terminal Processing for smooth ANSI rendering in standard cmd.exe without spawning subshells."""
    if sys.platform == "win32" and kernel32:
        try:
            STD_OUTPUT_HANDLE = -11
            ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
            INVALID_HANDLE_VALUE = -1

            h_out = kernel32.GetStdHandle(STD_OUTPUT_HANDLE)
            if h_out and h_out != INVALID_HANDLE_VALUE and h_out != ctypes.c_void_p(INVALID_HANDLE_VALUE).value:
                mode = wintypes.DWORD()
                if kernel32.GetConsoleMode(h_out, byref(mode)):
                    new_mode = mode.value | ENABLE_VIRTUAL_TERMINAL_PROCESSING
                    kernel32.SetConsoleMode(h_out, new_mode)
        except Exception:
            pass


def get_all_desktop_window_titles() -> List[Tuple[int, str, str]]:
    """
    Returns a list of tuples: (pid, process_name, window_title)
    for all visible desktop windows, strictly ignoring system/utility windows.
    """
    u32 = _resolve("user32", user32)
    if not u32:
        return []

    results: List[Tuple[int, str, str]] = []

    def enum_cb(hwnd, lparam):
        if not u32.IsWindowVisible(hwnd):
            return True
        cls_buf = ctypes.create_unicode_buffer(256)
        c_ret = u32.GetClassNameW(hwnd, cls_buf, 256)
        cls_name = cls_buf.value.strip() if c_ret > 0 else ""
        if is_system_ignored_class(cls_name):
            return True

        cpid = wintypes.DWORD()
        u32.GetWindowThreadProcessId(hwnd, byref(cpid))
        length = u32.GetWindowTextLengthW(hwnd)
        if length > 0 and cpid.value > 0:
            buf = ctypes.create_unicode_buffer(length + 1)
            u32.GetWindowTextW(hwnd, buf, length + 1)
            t = buf.value.strip()
            if t and not is_system_ignored_title(t):
                pname = get_process_name_by_pid(cpid.value)
                results.append((cpid.value, pname, t))
        return True

    cb = WNDENUMPROC(enum_cb)
    u32.EnumWindows(cb, 0)
    return results


# ==============================================================================
# Background Daemon Poller for 'powercfg /requests' Display Wake Locks
# ==============================================================================

_powercfg_lock = threading.Lock()
_cached_display_requests: Set[str] = set()
_powercfg_stop_event = threading.Event()
_powercfg_thread: Optional[threading.Thread] = None


def _powercfg_poller_worker():
    """Background daemon thread to query powercfg /requests without blocking the main loop."""
    startupinfo = None
    creationflags = 0
    if sys.platform == "win32":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = 0
        creationflags = 0x08000000

    while not _powercfg_stop_event.is_set():
        try:
            p = subprocess.run(
                ["powercfg", "/requests"],
                capture_output=True,
                text=True,
                errors="replace",
                timeout=1.0,
                startupinfo=startupinfo,
                creationflags=creationflags
            )
            if p.returncode == 0 and p.stdout:
                res: Set[str] = set()
                lines = p.stdout.splitlines()
                in_display = False
                for line in lines:
                    s = line.strip()
                    if s == "DISPLAY:":
                        in_display = True
                        continue
                    elif in_display and s.endswith(":") and s.isupper():
                        break
                    elif in_display:
                        if s and s.lower() != "none.":
                            m = re.findall(r"([a-zA-Z0-9_\-\.]+\.exe)", s, re.IGNORECASE)
                            for proc in m:
                                res.add(proc.lower())
                with _powercfg_lock:
                    global _cached_display_requests
                    _cached_display_requests = res
        except Exception:
            pass

        for _ in range(25):
            if _powercfg_stop_event.is_set():
                break
            time.sleep(0.1)


def start_powercfg_poller():
    """Starts the background powercfg poller thread if not already active."""
    global _powercfg_thread
    if not _powercfg_thread or not _powercfg_thread.is_alive():
        _powercfg_stop_event.clear()
        _powercfg_thread = threading.Thread(target=_powercfg_poller_worker, daemon=True, name="PowercfgPoller")
        _powercfg_thread.start()


def stop_powercfg_poller():
    """Signals the powercfg poller thread to stop."""
    _powercfg_stop_event.set()


start_powercfg_poller()
atexit.register(stop_powercfg_poller)


def get_system_power_display_requests() -> Set[str]:
    """Returns cached set of processes holding active Windows DISPLAY wake locks."""
    with _powercfg_lock:
        return set(_cached_display_requests)


# ==============================================================================
# WinRT GSMTC Telemetry & Background Watcher
# ==============================================================================

@dataclass
class GSMTCInfo:
    source_app: str = ""
    playback_type: int = 0  # 1 = Music, 2 = Video, 0 = Unknown
    title: str = ""
    artist: str = ""
    album: str = ""
    status: int = 0         # 4 = Playing, 5 = Paused


_last_gsmtc_time: float = 0.0
_cached_gsmtc_info: Optional[GSMTCInfo] = None
_gsmtc_lock = threading.Lock()


def query_gsmtc_powershell(force: bool = False) -> Optional[GSMTCInfo]:
    """Queries Windows Global System Media Transport Controls (GSMTC) via PowerShell."""
    global _last_gsmtc_time, _cached_gsmtc_info
    now = time.time()
    with _gsmtc_lock:
        if not force and (now - _last_gsmtc_time) < 2.0:
            return _cached_gsmtc_info

    ps_code = (
        "try { "
        "Add-Type -AssemblyName System.Runtime.WindowsRuntime; "
        "[Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media,ContentType=WindowsRuntime] | Out-Null; "
        "$asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync(); "
        "$mgr = $asyncOp.GetAwaiter().GetResult(); "
        "$cur = $mgr.GetCurrentSession(); "
        "if ($cur) { "
        "$p = $cur.TryGetMediaPropertiesAsync().GetAwaiter().GetResult(); "
        "$info = $cur.GetPlaybackInfo(); "
        "$app = $cur.SourceAppUserModelId; "
        "$pt = [int]$p.PlaybackType; "
        "$st = [int]$info.PlaybackStatus; "
        "Write-Output \"$app|$pt|$st|$($p.Title)|$($p.Artist)|$($p.AlbumTitle)\" "
        "} else { Write-Output 'NONE' } "
        "} catch { Write-Output 'NONE' }"
    )

    startupinfo = None
    creationflags = 0
    if sys.platform == "win32":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = 0  # SW_HIDE (prevent powershell console flicker)
        creationflags = 0x08000000   # CREATE_NO_WINDOW

    result_info: Optional[GSMTCInfo] = None
    try:
        p = subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_code],
            capture_output=True,
            text=True,
            errors="replace",
            timeout=1.2,
            startupinfo=startupinfo,
            creationflags=creationflags
        )
        if p.returncode == 0 and p.stdout:
            raw = p.stdout.strip()
            if raw and raw != "NONE" and "|" in raw:
                parts = raw.split("|", 5)
                if len(parts) >= 4:
                    app = parts[0]
                    ptype = int(parts[1]) if parts[1].isdigit() else 0
                    st = int(parts[2]) if parts[2].isdigit() else 0
                    title = parts[3]
                    artist = parts[4] if len(parts) > 4 else ""
                    album = parts[5] if len(parts) > 5 else ""
                    result_info = GSMTCInfo(
                        source_app=app,
                        playback_type=ptype,
                        title=title,
                        artist=artist,
                        album=album,
                        status=st
                    )
    except Exception:
        pass

    with _gsmtc_lock:
        _cached_gsmtc_info = result_info
        _last_gsmtc_time = now

    return result_info


class GSMTCWatcher:
    """Background polling worker for Windows GSMTC to keep UI tick latency at ~0ms."""
    def __init__(self, poll_interval: float = 1.0):
        self.poll_interval = poll_interval
        self._cached_info: Optional[GSMTCInfo] = None
        self._lock = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self):
        if not self._running:
            self._running = True
            self._thread = threading.Thread(target=self._worker, daemon=True, name="GSMTCWatcherThread")
            self._thread.start()

    def stop(self):
        self._running = False

    def _worker(self):
        while self._running:
            try:
                info = query_gsmtc_powershell(force=True)
                with self._lock:
                    self._cached_info = info
            except Exception:
                pass

            for _ in range(int(self.poll_interval * 10)):
                if not self._running:
                    break
                time.sleep(0.1)

    def get_info(self) -> Optional[GSMTCInfo]:
        with self._lock:
            return self._cached_info


# ==============================================================================
# General Player Forensic Classifiers
# ==============================================================================

def classify_pure_audio(
    pid: int,
    proc_name: str,
    peak: float
) -> Optional[ProcessMediaClassification]:
    """Classifies dedicated pure audio applications (Spotify, foobar2000, AIMP, etc.)."""
    pname_lower = proc_name.lower().strip()
    if pname_lower in KNOWN_PURE_AUDIO_APPS:
        app_name = KNOWN_PURE_AUDIO_APPS[pname_lower]
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=True,
            is_video=False,
            classification="AUDIO",
            reason=f"Dedicated audio application: {app_name}"
        )
    return None


def classify_dedicated_video(
    pid: int,
    proc_name: str,
    peak: float
) -> Optional[ProcessMediaClassification]:
    """Classifies dedicated video applications (Netflix, Films & TV, Stremio, etc.)."""
    pname_lower = proc_name.lower().strip()
    if pname_lower in DEDICATED_VIDEO_ONLY_APPS:
        app_name = DEDICATED_VIDEO_ONLY_APPS[pname_lower]
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=True,
            classification="VIDEO",
            reason=f"Dedicated video application: {app_name}"
        )
    return None


def classify_dual_purpose_player(
    pid: int,
    proc_name: str,
    peak: float,
    window_titles: List[str]
) -> Optional[ProcessMediaClassification]:
    """Classifies dual-purpose players (VLC, MPC, PotPlayer) playing audio without display wake locks."""
    pname_lower = proc_name.lower().strip()
    if pname_lower in DUAL_PURPOSE_MEDIA_PLAYERS:
        app_name = DUAL_PURPOSE_MEDIA_PLAYERS[pname_lower]
        first_title = window_titles[0] if window_titles else ""
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=True,
            is_video=False,
            classification="AUDIO",
            reason=f"Media player playing audio without display wake lock: {app_name} ('{first_title}')",
            window_title=first_title
        )
    return None


def classify_browser(
    pid: int,
    proc_name: str,
    peak: float
) -> Optional[ProcessMediaClassification]:
    """Classifies web browser processes (Chrome, Edge, Firefox) by scanning open tab titles."""
    pname_lower = proc_name.lower().strip()
    if pname_lower in BROWSER_PROCESSES:
        all_titles = get_all_desktop_window_titles()
        for b_pid, b_pname, b_title in all_titles:
            if b_pname == pname_lower:
                b_class, b_reason = classify_text_for_media_type(b_title)
                if b_class == "AUDIO":
                    return ProcessMediaClassification(
                        pid=pid,
                        proc_name=proc_name,
                        peak_value=peak,
                        is_audio=True,
                        is_video=False,
                        classification="AUDIO",
                        reason=f"Browser audio tab detected: '{b_title}' ({b_reason})",
                        window_title=b_title
                    )
                elif b_class == "VIDEO":
                    return ProcessMediaClassification(
                        pid=pid,
                        proc_name=proc_name,
                        peak_value=peak,
                        is_audio=False,
                        is_video=True,
                        classification="VIDEO",
                        reason=f"Browser video tab detected: '{b_title}' ({b_reason})",
                        window_title=b_title
                    )

        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=False,
            classification="UNKNOWN",
            reason="Browser sound active without verified audio format"
        )
    return None


def classify_active_audio_process(
    pid: int,
    proc_name: str,
    peak: float,
    display_requests: Set[str],
    gsmtc_info: Optional[GSMTCInfo] = None
) -> ProcessMediaClassification:
    """
    Evaluates an active audio session process through all forensic layers:
      1. Peak Level Check (> 0.0001)
      2. Windows Media Player Legacy (wmplayer.exe) Dedicated Classifier
      3. Windows Media Player Modern (microsoft.media.player.exe / music.ui.exe) Dedicated Classifier
      4. Known Pure Audio Apps (Spotify, foobar, AIMP, etc.)
      5. Dedicated Video-Only Apps (Netflix, Films & TV, Stremio)
      6. Open Files Inspection (psutil)
      7. Process Command Line (psutil)
      8. Window Titles (EnumWindows)
      9. Display Wake Locks (powercfg /requests [DISPLAY])
      10. GSMTC PlaybackType & Metadata (1=Music, 2=Video)
      11. Dual-purpose player heuristics
      12. Web browser heuristics
    """
    pname_lower = proc_name.lower().strip()

    # Dedicated forensic classifier for Windows Media Player Legacy (wmplayer.exe)
    if pname_lower == "wmplayer.exe":
        wmp_legacy_fn = _resolve("classify_wmp_legacy", classify_wmp_legacy)
        return wmp_legacy_fn(
            pid=pid,
            proc_name=proc_name,
            peak=peak,
            display_requests=display_requests,
            gsmtc_info=gsmtc_info
        )

    # Dedicated forensic classifier for Windows Media Player Modern (Windows 10/11)
    if is_modern_wmp_process(pname_lower):
        return classify_wmp_modern(
            pid=pid,
            proc_name=proc_name,
            peak=peak,
            display_requests=display_requests,
            gsmtc_info=gsmtc_info
        )

    if peak <= 0.0001:
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=False,
            classification="SILENT",
            reason=f"Audio meter peak is silent ({peak:.4f})"
        )

    # 1. Known Pure Audio App -> 100% AUDIO
    pure_audio_res = classify_pure_audio(pid, proc_name, peak)
    if pure_audio_res:
        return pure_audio_res

    # 2. Dedicated Video-Only App -> 100% VIDEO
    video_app_res = classify_dedicated_video(pid, proc_name, peak)
    if video_app_res:
        return video_app_res

    # 3. Open Files Inspection (psutil)
    is_psutil = _resolve("PSUTIL_AVAILABLE", PSUTIL_AVAILABLE)
    open_file_paths: List[str] = []
    cmdline_args: List[str] = []
    if is_psutil and psutil:
        try:
            proc = psutil.Process(pid)
            cmdline_args = proc.cmdline()
            open_files = proc.open_files()
            open_file_paths = [f.path for f in open_files]
        except Exception:
            pass

    if open_file_paths:
        file_class, ext, matched_path = classify_open_files(open_file_paths)
        if file_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Open video file handle detected: '{ext}' ({os.path.basename(matched_path or '')})",
                file_path=matched_path
            )
        elif file_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Open audio file handle detected: '{ext}' ({os.path.basename(matched_path or '')})",
                file_path=matched_path
            )

    # 4. Command Line Inspection
    if cmdline_args:
        cmd_text = " ".join(cmdline_args)
        cmd_class, cmd_reason = classify_text_for_media_type(cmd_text)
        if cmd_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Command line indicates video: {cmd_reason}"
            )
        elif cmd_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Command line indicates audio: {cmd_reason}"
            )

    # 5. Window Titles Inspection
    get_titles_fn = _resolve("get_window_titles_for_pid", get_window_titles_for_pid)
    window_titles = get_titles_fn(pid)
    for title in window_titles:
        t_class, t_reason = classify_text_for_media_type(title)
        if t_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Window title indicates video: '{title}' ({t_reason})",
                window_title=title
            )
        elif t_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Window title indicates audio: '{title}' ({t_reason})",
                window_title=title
            )

    # 6. Display Wake Lock Inspection (powercfg /requests)
    has_display_lock = (pname_lower in display_requests or "applicationframehost.exe" in display_requests)
    if has_display_lock and pname_lower != "wmplayer.exe":
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=True,
            classification="VIDEO",
            reason=f"Active Windows DISPLAY wake lock (video rendering detected for {proc_name})"
        )

    # 7. GSMTC (Global System Media Transport Controls) Inspection
    if gsmtc_info and (getattr(gsmtc_info, "status", 0) == 4 or getattr(gsmtc_info, "status", 0) == 0):
        if getattr(gsmtc_info, "playback_type", 0) == 2:  # Video
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"GSMTC reports PlaybackType=Video (Title: '{getattr(gsmtc_info, 'title', '')}')"
            )
        elif getattr(gsmtc_info, "playback_type", 0) == 1:  # Music (Audio)
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"GSMTC reports PlaybackType=Music/Audio (Title: '{getattr(gsmtc_info, 'title', '')}', Artist: '{getattr(gsmtc_info, 'artist', '')}')"
            )
        elif getattr(gsmtc_info, "title", ""):
            g_class, g_reason = classify_text_for_media_type(gsmtc_info.title)
            if g_class == "VIDEO":
                return ProcessMediaClassification(
                    pid=pid,
                    proc_name=proc_name,
                    peak_value=peak,
                    is_audio=False,
                    is_video=True,
                    classification="VIDEO",
                    reason=f"GSMTC Title indicates video: {g_reason}"
                )
            elif g_class == "AUDIO":
                return ProcessMediaClassification(
                    pid=pid,
                    proc_name=proc_name,
                    peak_value=peak,
                    is_audio=True,
                    is_video=False,
                    classification="AUDIO",
                    reason=f"GSMTC Title indicates audio: {g_reason}"
                )

    # 8. Dual-Purpose Media Player Heuristic
    dual_player_res = classify_dual_purpose_player(pid, proc_name, peak, window_titles)
    if dual_player_res:
        return dual_player_res

    # 9. Web Browser Heuristic
    browser_res = classify_browser(pid, proc_name, peak)
    if browser_res:
        return browser_res

    return ProcessMediaClassification(
        pid=pid,
        proc_name=proc_name,
        peak_value=peak,
        is_audio=False,
        is_video=False,
        classification="UNKNOWN",
        reason=f"Unrecognized process ({proc_name}) with active sound"
    )


# ==============================================================================
# Sentinel Decision Engine & Master Inactivity Evaluator
# ==============================================================================

@dataclass
class AudioDetectionResult:
    is_audio_playing: bool
    active_audio_sources: List[ProcessMediaClassification] = field(default_factory=list)
    ignored_video_sources: List[ProcessMediaClassification] = field(default_factory=list)
    other_sources: List[ProcessMediaClassification] = field(default_factory=list)
    master_peak: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_audio_playing": self.is_audio_playing,
            "master_peak": self.master_peak,
            "active_audio_sources": [
                {
                    "pid": s.pid,
                    "proc_name": s.proc_name,
                    "peak_value": s.peak_value,
                    "classification": s.classification,
                    "reason": s.reason,
                    "file_path": s.file_path,
                    "window_title": s.window_title
                } for s in self.active_audio_sources
            ],
            "ignored_video_sources": [
                {
                    "pid": s.pid,
                    "proc_name": s.proc_name,
                    "peak_value": s.peak_value,
                    "classification": s.classification,
                    "reason": s.reason,
                    "file_path": s.file_path,
                    "window_title": s.window_title
                } for s in self.ignored_video_sources
            ]
        }


def extract_media_details(res: AudioDetectionResult, gsmtc_info: Optional[GSMTCInfo] = None) -> Tuple[str, str]:
    """
    Extracts the display audio title/filename and clean player application name
    from the detection result and GSMTC metadata.
    Returns: (audio_title, player_name)
    """
    if not res.is_audio_playing or not res.active_audio_sources:
        return ("", "")

    # Pick the primary active audio source (prefer highest peak)
    top_source = max(res.active_audio_sources, key=lambda s: s.peak_value)
    player_name = get_clean_player_name(top_source.proc_name)
    audio_title = ""

    # Priority 0: Specialized extraction for Windows Media Player Legacy (wmplayer.exe)
    if top_source.proc_name.lower() == "wmplayer.exe":
        if top_source.window_title:
            cleaned = clean_wmp_window_title(top_source.window_title)
            if cleaned and not is_system_ignored_title(cleaned):
                audio_title = cleaned
            elif (
                not is_system_ignored_title(top_source.window_title) and
                top_source.window_title.lower() not in ("windows media player", "media player", "now playing", "windows media player legacy")
            ):
                audio_title = top_source.window_title
        if (not audio_title or is_system_ignored_title(audio_title)) and top_source.file_path:
            audio_title = os.path.basename(top_source.file_path)

    # Priority A: WinRT GSMTC MediaProperties (Title and Artist)
    if (not audio_title or is_system_ignored_title(audio_title)) and gsmtc_info and gsmtc_info.title:
        if not is_system_ignored_title(gsmtc_info.title):
            if gsmtc_info.artist:
                audio_title = f"{gsmtc_info.title} - {gsmtc_info.artist}"
            else:
                audio_title = gsmtc_info.title

    # Priority B: Open audio file handle
    if (not audio_title or is_system_ignored_title(audio_title)) and top_source.file_path:
        audio_title = os.path.basename(top_source.file_path)

    # Priority C: Window Title inspection
    if (not audio_title or is_system_ignored_title(audio_title)) and top_source.window_title:
        title = top_source.window_title.strip()
        for suffix in [
            " - VLC media player", " - Windows Media Player", " - Google Chrome",
            " - Microsoft​ Edge", " - Mozilla Firefox", " - AIMP", " - foobar2000"
        ]:
            if title.lower().endswith(suffix.lower()):
                title = title[:len(title) - len(suffix)].strip()
        if title and not is_system_ignored_title(title):
            audio_title = title

    # Priority D: Fallback title
    if not audio_title or is_system_ignored_title(audio_title):
        audio_title = "Active Audio Stream"

    return (audio_title, player_name)


# ==============================================================================
# Audio Activity Tracker (60m Ring Buffer & Durations)
# ==============================================================================

class AudioActivityTracker:
    """
    Stateful rolling activity tracker for audio playback:
      1. Continuous Audio Play Duration (seconds audio remained continuously playing).
      2. Continuous Audio Pause/Stop Duration (seconds audio remained paused/stopped/idle).
      3. 60-Minute Historical Activity Ring Buffer (minute-by-minute activity history).
    """

    def __init__(self, history_minutes: int = 60):
        self.history_minutes = history_minutes
        self.reset()

    def reset(self):
        """Resets tracker state."""
        self._last_eval_time: Optional[float] = None
        self._last_is_audio_playing: Optional[bool] = None
        self._continuous_play_seconds: float = 0.0
        self._continuous_pause_seconds: float = 0.0
        self._minute_activity: Dict[int, float] = {}

    def update(
        self,
        is_audio_playing: bool,
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

        if is_audio_playing:
            if self._last_is_audio_playing is not True:
                # Switched to playing: start play timer fresh from dt
                self._continuous_play_seconds = dt
            else:
                self._continuous_play_seconds += dt
            self._continuous_pause_seconds = 0.0
            self._last_is_audio_playing = True
            self._minute_activity[curr_m] = self._minute_activity.get(curr_m, 0.0) + dt
        else:
            if self._last_is_audio_playing is not False:
                # Switched to paused/stopped: start pause timer fresh from dt
                self._continuous_pause_seconds = dt
            else:
                self._continuous_pause_seconds += dt
            self._continuous_play_seconds = 0.0
            self._last_is_audio_playing = False

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
_activity_tracker = AudioActivityTracker()


def get_activity_tracker() -> AudioActivityTracker:
    """Returns the global AudioActivityTracker singleton."""
    return _activity_tracker


def reset_activity_tracker():
    """Resets the global AudioActivityTracker singleton."""
    _activity_tracker.reset()


def extract_simplified_media_info(
    res: AudioDetectionResult,
    gsmtc_info: Optional[GSMTCInfo] = None,
    idle_seconds: float = 0.0,
    idle_threshold: float = 60.0,
    audio_peak: Optional[float] = None,
    continuous_play_seconds: Optional[float] = None,
    continuous_pause_seconds: Optional[float] = None,
    activity_history_60m: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Extracts strictly the user-requested fields from the evaluation:
      - Audio Playing            : YES (हाँ) / NO (ना)
      - Media Type               : VIDEO / AUDIO / NONE
      - Playback State           : PLAYING / PAUSED / STOPPED
      - Active Player / App      : Friendly app name or None
      - Media Title              : currently playing track or video name (or None)
      - Continuous Play Duration : seconds audio remained playing
      - Continuous Pause Duration: seconds audio remained paused/stopped
      - Audio Peak Meter         : peak level (0.0 to 1.0)
      - 60m Activity History     : 60-element activity ratio list
      - 60s Idle Timer & Progress Bar
      - Is Audio Playing?        : TRUE / FALSE
      - Is Windows Idle?         : TRUE / FALSE
    """
    is_threshold_met = (idle_seconds >= idle_threshold) if idle_threshold > 0 else True

    tracker = _resolve("get_activity_tracker", get_activity_tracker)()
    peak = float(getattr(res, "master_peak", 0.0))
    resolved_peak = peak if audio_peak is None else float(audio_peak)
    cont_play = tracker.continuous_play_seconds if continuous_play_seconds is None else float(continuous_play_seconds)
    cont_pause = tracker.continuous_pause_seconds if continuous_pause_seconds is None else float(continuous_pause_seconds)
    hist_60m = tracker.get_history_60m() if activity_history_60m is None else list(activity_history_60m)

    # Case 1: Active Pure Audio Playback
    if res.is_audio_playing and res.active_audio_sources:
        title, player = extract_media_details(res, gsmtc_info)
        src_peak = res.active_audio_sources[0].peak_value
        peak_val = resolved_peak if audio_peak is not None else (src_peak if src_peak > 0 else peak)
        return {
            "audio_playing": True,
            "media_type": "AUDIO",
            "playback_state": "PLAYING",
            "active_player": player or "Audio Player",
            "media_title": _clean_title(title),
            "is_audio_playing": True,
            "is_windows_idle": False,
            "audio_peak": peak_val,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": hist_60m
        }

    # Case 2: Video Playback Active (Peak audio > 0 with video candidate - treated as idle for audio)
    if res.ignored_video_sources:
        top_video = res.ignored_video_sources[0]
        v_player = get_clean_player_name(top_video.proc_name)
        v_title = top_video.window_title
        if v_title and is_system_ignored_title(v_title):
            v_title = ""
        if not v_title and top_video.file_path:
            v_title = os.path.basename(top_video.file_path)
        if not v_title and gsmtc_info and gsmtc_info.title and not is_system_ignored_title(gsmtc_info.title):
            v_title = gsmtc_info.title
        if not v_title:
            v_title = "Video Stream"

        return {
            "audio_playing": False,
            "media_type": "VIDEO",
            "playback_state": "PLAYING",
            "active_player": v_player,
            "media_title": _clean_title(v_title),
            "is_audio_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": resolved_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": hist_60m
        }

    # Case 3: WinRT GSMTC session exists (paused or playing)
    if gsmtc_info and (gsmtc_info.title or gsmtc_info.source_app):
        st = gsmtc_info.status
        if st == 4:
            p_state = "PLAYING"
        elif st == 5:
            p_state = "PAUSED"
        else:
            p_state = "STOPPED"

        m_type = "VIDEO" if gsmtc_info.playback_type == 2 else "AUDIO"
        g_player = get_clean_player_name(gsmtc_info.source_app)
        g_title = gsmtc_info.title
        if g_title and is_system_ignored_title(g_title):
            g_title = ""
        if g_title and gsmtc_info.artist:
            g_title = f"{g_title} - {gsmtc_info.artist}"

        return {
            "audio_playing": False,
            "media_type": m_type,
            "playback_state": p_state,
            "active_player": g_player,
            "media_title": _clean_title(g_title),
            "is_audio_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": resolved_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": hist_60m
        }

    # Case 4: Process / Desktop window heuristics (paused players or empty players)
    desktop_windows = get_all_desktop_window_titles()
    empty_player: Optional[str] = None
    for pid, proc_name, w_title in desktop_windows:
        p_lower = proc_name.lower()
        if is_system_ignored_title(w_title):
            continue
        is_media_app = (
            p_lower in KNOWN_PURE_AUDIO_APPS or
            p_lower in DUAL_PURPOSE_MEDIA_PLAYERS or
            p_lower in DEDICATED_VIDEO_ONLY_APPS
        )
        if is_media_app:
            t_class, _ = classify_text_for_media_type(w_title)
            disp_title = clean_wmp_window_title(w_title) if p_lower == "wmplayer.exe" else w_title
            if not disp_title or is_system_ignored_title(disp_title):
                disp_title = w_title
            if is_system_ignored_title(disp_title):
                continue
            if t_class == "AUDIO":
                return {
                    "audio_playing": False,
                    "media_type": "AUDIO",
                    "playback_state": "PAUSED",
                    "active_player": get_clean_player_name(proc_name),
                    "media_title": _clean_title(disp_title),
                    "is_audio_playing": False,
                    "is_windows_idle": is_threshold_met,
                    "audio_peak": resolved_peak,
                    "continuous_play_seconds": cont_play,
                    "continuous_pause_seconds": cont_pause,
                    "activity_history_60m": hist_60m
                }
            elif t_class == "VIDEO":
                return {
                    "audio_playing": False,
                    "media_type": "VIDEO",
                    "playback_state": "PAUSED",
                    "active_player": get_clean_player_name(proc_name),
                    "media_title": _clean_title(disp_title),
                    "is_audio_playing": False,
                    "is_windows_idle": is_threshold_met,
                    "audio_peak": resolved_peak,
                    "continuous_play_seconds": cont_play,
                    "continuous_pause_seconds": cont_pause,
                    "activity_history_60m": hist_60m
                }
            elif not empty_player:
                empty_player = get_clean_player_name(proc_name)

    if empty_player:
        return {
            "audio_playing": False,
            "media_type": "NONE",
            "playback_state": "STOPPED",
            "active_player": empty_player,
            "media_title": "None",
            "is_audio_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": resolved_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": hist_60m
        }

    # Case 5: Complete silence and no media player detected
    return {
        "audio_playing": False,
        "media_type": "NONE",
        "playback_state": "STOPPED",
        "active_player": "None",
        "media_title": "None",
        "is_audio_playing": False,
        "is_windows_idle": is_threshold_met,
        "audio_peak": resolved_peak,
        "continuous_play_seconds": cont_play,
        "continuous_pause_seconds": cont_pause,
        "activity_history_60m": hist_60m
    }


_UNSET = object()


class AudioDetector:
    """
    Main detector class coordinating WASAPI, process inspection,
    and multi-layered audio vs video classification.
    """

    def __init__(self):
        pass

    def check(self, gsmtc_info: Any = _UNSET) -> AudioDetectionResult:
        """
        Executes a complete single-pass check.
        Returns AudioDetectionResult.
        """
        wasapi_fn = _resolve("get_live_wasapi_audio_state", get_live_wasapi_audio_state)
        power_fn = _resolve("get_system_power_display_requests", get_system_power_display_requests)
        classify_fn = _resolve("classify_active_audio_process", classify_active_audio_process)

        wasapi = wasapi_fn()
        master_peak = wasapi["master_peak"]
        active_pids = wasapi["active_pids"]
        pid_to_name = wasapi["pid_to_name"]

        # If master peak is silent and no active PIDs, return immediately
        if not active_pids and master_peak <= 0.0001:
            return AudioDetectionResult(
                is_audio_playing=False,
                master_peak=master_peak
            )

        display_requests = power_fn()
        if gsmtc_info is _UNSET:
            gsmtc_query_fn = _resolve("query_gsmtc_powershell", query_gsmtc_powershell)
            gsmtc_info = gsmtc_query_fn()

        audio_sources: List[ProcessMediaClassification] = []
        video_sources: List[ProcessMediaClassification] = []
        other_sources: List[ProcessMediaClassification] = []

        for pid, peak in active_pids.items():
            proc_name = pid_to_name.get(pid, get_process_name_by_pid(pid))
            res = classify_fn(
                pid=pid,
                proc_name=proc_name,
                peak=peak,
                display_requests=display_requests,
                gsmtc_info=gsmtc_info
            )
            if res.is_audio:
                audio_sources.append(res)
            elif res.is_video:
                video_sources.append(res)
            else:
                other_sources.append(res)

        is_audio = (len(audio_sources) > 0)

        return AudioDetectionResult(
            is_audio_playing=is_audio,
            active_audio_sources=audio_sources,
            ignored_video_sources=video_sources,
            other_sources=other_sources,
            master_peak=master_peak
        )

    def get_dashboard_data(
        self,
        gsmtc_info: Any = _UNSET,
        idle_seconds: float = 0.0,
        threshold: float = 60.0
    ) -> Dict[str, Any]:
        """Executes a single check and returns the full dashboard data dictionary."""
        if gsmtc_info is _UNSET:
            gsmtc_query_fn = _resolve("query_gsmtc_powershell", query_gsmtc_powershell)
            gsmtc_info = gsmtc_query_fn()
        res = self.check(gsmtc_info=gsmtc_info)
        tracker = _resolve("get_activity_tracker", get_activity_tracker)()
        tracker_metrics = tracker.update(res.is_audio_playing)

        info = extract_simplified_media_info(
            res,
            gsmtc_info=gsmtc_info,
            idle_seconds=idle_seconds,
            idle_threshold=threshold,
            audio_peak=res.master_peak,
            continuous_play_seconds=tracker_metrics["continuous_play_seconds"],
            continuous_pause_seconds=tracker_metrics["continuous_pause_seconds"],
            activity_history_60m=tracker_metrics["activity_history_60m"]
        )
        is_idle = (idle_seconds >= threshold) if not res.is_audio_playing else False
        return {
            "timestamp": time.time(),
            "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
            "audio_playing": res.is_audio_playing,
            "audio_playing_str": "YES (हाँ)" if res.is_audio_playing else "NO (ना)",
            "media_type": info["media_type"],
            "playback_state": info["playback_state"],
            "active_player": info["active_player"],
            "media_title": info["media_title"],
            "continuous_play_seconds": tracker_metrics["continuous_play_seconds"],
            "continuous_pause_seconds": tracker_metrics["continuous_pause_seconds"],
            "audio_peak": info["audio_peak"],
            "idle_seconds": idle_seconds,
            "idle_threshold": threshold,
            "activity_history_60m": tracker_metrics["activity_history_60m"],
            "is_audio_playing": res.is_audio_playing,
            "is_windows_idle": is_idle
        }


def is_audio_playing() -> bool:
    """Module-level convenience function returning True if audio is playing."""
    detector = AudioDetector()
    return detector.check().is_audio_playing


def run_live_tracker(interval: float = 0.1, threshold: float = 60.0):
    """
    Runs continuous live monitoring loop with STRICT in-place overwriting:
      - Enables VT mode via pure Win32 kernel32 API (no os.system subshell).
      - Renders and displays clean default dashboard IMMEDIATELY (<1ms) before heavy checks.
      - Clears screen ONCE on initial startup and hides cursor with zero banner flash.
      - Never scrolls or appends lines down the terminal.
      - Always overwrites in-place using ANSI \033[H.
      - Graceful Ctrl+C restores terminal cursor.
    """
    enable_windows_vt_mode()

    cleaned_up = False

    def cleanup():
        nonlocal cleaned_up
        if not cleaned_up:
            cleaned_up = True
            sys.stdout.write("\033[?25h\033[J\n")
            sys.stdout.flush()

    atexit.register(cleanup)

    # Render and display the clean default dashboard frame IMMEDIATELY (0ms latency, zero delay/flash)
    initial_card_data = {
        "timestamp": time.time(),
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
        "audio_playing": False,
        "audio_playing_str": "NO (ना)",
        "media_type": "NONE",
        "playback_state": "STOPPED",
        "active_player": "None",
        "media_title": "None",
        "continuous_play_seconds": 0.0,
        "continuous_pause_seconds": 0.0,
        "audio_peak": 0.0,
        "idle_seconds": 0.0,
        "idle_threshold": threshold,
        "activity_history_60m": [0.0] * 60,
        "is_audio_playing": False,
        "is_windows_idle": False
    }
    initial_card = render_dashboard_card(initial_card_data, in_place=True)
    # Clear screen ONCE and print initial frame with cursor hidden
    sys.stdout.write(f"\033[2J\033[H\033[?25l{initial_card}\033[J")
    sys.stdout.flush()

    detector = AudioDetector()
    gsmtc_watcher = GSMTCWatcher(poll_interval=1.0)
    gsmtc_watcher.start()

    start_mono = time.monotonic()
    idle_start_mono = start_mono
    was_audio_playing = False

    try:
        while True:
            t_frame_start = time.monotonic()
            latest_gsmtc = gsmtc_watcher.get_info()
            res = detector.check(gsmtc_info=latest_gsmtc)
            is_a_playing = res.is_audio_playing

            now_wall = time.time()
            tracker = _resolve("get_activity_tracker", get_activity_tracker)()
            tracker_metrics = tracker.update(is_a_playing, now=now_wall)

            now_mono = time.monotonic()
            if is_a_playing:
                idle_start_mono = now_mono
                idle_sec = 0.0
                is_windows_idle = False
            else:
                if was_audio_playing:
                    idle_start_mono = now_mono
                idle_sec = min(threshold, max(0.0, now_mono - idle_start_mono))
                is_windows_idle = (idle_sec >= threshold)

            was_audio_playing = is_a_playing

            media_info = extract_simplified_media_info(
                res=res,
                gsmtc_info=latest_gsmtc,
                idle_seconds=idle_sec,
                idle_threshold=threshold,
                audio_peak=res.master_peak,
                continuous_play_seconds=tracker_metrics["continuous_play_seconds"],
                continuous_pause_seconds=tracker_metrics["continuous_pause_seconds"],
                activity_history_60m=tracker_metrics["activity_history_60m"]
            )

            card_data = {
                "timestamp": now_wall,
                "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now_wall)),
                "audio_playing": is_a_playing,
                "audio_playing_str": "YES (हाँ)" if is_a_playing else "NO (ना)",
                "media_type": media_info["media_type"],
                "playback_state": media_info["playback_state"],
                "active_player": media_info["active_player"],
                "media_title": media_info["media_title"],
                "continuous_play_seconds": tracker_metrics["continuous_play_seconds"],
                "continuous_pause_seconds": tracker_metrics["continuous_pause_seconds"],
                "audio_peak": media_info["audio_peak"],
                "idle_seconds": idle_sec,
                "idle_threshold": threshold,
                "activity_history_60m": tracker_metrics["activity_history_60m"],
                "is_audio_playing": is_a_playing,
                "is_windows_idle": is_windows_idle
            }

            rendered_card = render_dashboard_card(card_data, in_place=True)
            frame = f"\033[H{rendered_card}\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            t_elapsed = time.monotonic() - t_frame_start
            to_sleep = max(0.01, interval - t_elapsed)
            time.sleep(to_sleep)

    except KeyboardInterrupt:
        cleanup()
        sys.exit(0)
    finally:
        cleanup()
        gsmtc_watcher.stop()


def run_single_check(threshold: float = 60.0, idle_seconds: Optional[float] = None, json_output: bool = False) -> int:
    """Executes a single evaluation check and returns standard exit code (0: Idle, 1: Audio Playing/Busy)."""
    detector = AudioDetector()
    res = detector.check()
    is_a_playing = res.is_audio_playing

    now_wall = time.time()
    tracker = _resolve("get_activity_tracker", get_activity_tracker)()
    tracker_metrics = tracker.update(is_a_playing, now=now_wall)

    if is_a_playing:
        idle_sec = 0.0
        is_idle = False
    else:
        idle_sec = threshold if idle_seconds is None else max(0.0, idle_seconds)
        is_idle = (idle_sec >= threshold)

    media_info = extract_simplified_media_info(
        res,
        idle_seconds=idle_sec,
        idle_threshold=threshold,
        audio_peak=res.master_peak,
        continuous_play_seconds=tracker_metrics["continuous_play_seconds"],
        continuous_pause_seconds=tracker_metrics["continuous_pause_seconds"],
        activity_history_60m=tracker_metrics["activity_history_60m"]
    )
    card_data = {
        "timestamp": now_wall,
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now_wall)),
        "audio_playing": is_a_playing,
        "audio_playing_str": "YES (हाँ)" if is_a_playing else "NO (ना)",
        "media_type": media_info["media_type"],
        "playback_state": media_info["playback_state"],
        "active_player": media_info["active_player"],
        "media_title": media_info["media_title"],
        "continuous_play_seconds": tracker_metrics["continuous_play_seconds"],
        "continuous_pause_seconds": tracker_metrics["continuous_pause_seconds"],
        "audio_peak": media_info["audio_peak"],
        "idle_seconds": idle_sec,
        "idle_threshold": threshold,
        "activity_history_60m": tracker_metrics["activity_history_60m"],
        "is_audio_playing": is_a_playing,
        "is_windows_idle": is_idle
    }
    if json_output:
        import json
        print(json.dumps(card_data, indent=2, ensure_ascii=False))
    else:
        print(render_dashboard_card(card_data, in_place=False))
    return 1 if is_a_playing else 0


__all__ = [
    "enable_windows_vt_mode",
    "get_all_desktop_window_titles",
    "get_system_power_display_requests",
    "start_powercfg_poller",
    "stop_powercfg_poller",
    "GSMTCInfo",
    "query_gsmtc_powershell",
    "GSMTCWatcher",
    "classify_pure_audio",
    "classify_dedicated_video",
    "classify_dual_purpose_player",
    "classify_browser",
    "classify_active_audio_process",
    "AudioDetectionResult",
    "extract_media_details",
    "AudioActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",
    "extract_simplified_media_info",
    "AudioDetector",
    "is_audio_playing",
    "run_live_tracker",
    "run_single_check",
]
