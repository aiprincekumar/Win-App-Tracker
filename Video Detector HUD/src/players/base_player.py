# -*- coding: utf-8 -*-
"""
players/base_player.py: Common Base Architecture, Telemetry Parsers, and Standalone CLI Diagnostics.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import re
import time
import struct
import urllib.parse
import ctypes
from ctypes import wintypes, byref
from typing import Dict, Any, Optional, Tuple, List, Set

# Ensure 'src' is in sys.path
_this_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.dirname(_this_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        if sys.stdout and hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if sys.stderr and hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

# ANSI Color Palette for Terminal UI & Reporting
C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_RED    = "\033[91m"
C_GREEN  = "\033[92m"
C_YELLOW = "\033[93m"
C_CYAN   = "\033[96m"
C_GRAY   = "\033[90m"

# Standard video & audio extensions
VIDEO_FILE_EXTENSIONS = (
    ".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".m4v", ".ts",
    ".wmv", ".mpg", ".mpeg", ".m2ts", ".mts", ".3gp", ".3g2", ".vob",
    ".divx", ".asf", ".f4v", ".rmvb", ".rm", ".ogv", ".wtv"
)

AUDIO_FILE_EXTENSIONS = (
    ".mp3", ".wav", ".flac", ".aac", ".m4a", ".ogg", ".oga", ".wma",
    ".opus", ".alac", ".aiff", ".aif", ".mid", ".midi", ".ape",
    ".ac3", ".dts", ".mka", ".ra", ".ram", ".voc", ".amr", ".mp2",
    ".mp1", ".m4b", ".m4p", ".cue"
)

# Standard playback speed anchors
STANDARD_PLAYBACK_SPEEDS = [0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00]

# Timeline regex matching: [01:23 / 10:45], (00:01:23 / 01:45:00), 01:23/10:45, 00:01:23 / -00:43:47
TIMELINE_REGEX = re.compile(
    r'[\(\[]?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[\/|\\]\s*(-?\d{1,2}:\d{2}(?::\d{2})?)\s*[\)\]]?'
)

# Pause/Stop indicator regex
PAUSE_REGEX = re.compile(
    r'[\(\[]\s*(?:pause[d]?|stop(?:ped)?)\s*[\)\]]|^[\[\(]?(?:pause[d]?|stop(?:ped)?)[\]\)]?\s*[-–—:]\s*|\s*[-–—:]\s*[\[\(]?(?:pause[d]?|stop(?:ped)?)[\]\)]?$',
    re.IGNORECASE
)

_TIME_LABEL_REGEX = re.compile(r'^-?(\d{1,2}:\d{2}(?::\d{2})?)$')

# Process & File Caches
_file_duration_cache: Dict[str, float] = {}
_file_metadata_cache: Dict[str, Dict[str, Any]] = {}
_playback_progress_cache: Dict[str, Dict[str, float]] = {}
_playback_velocity_cache: Dict[str, Dict[str, float]] = {}
_mock_offline_timeline: Optional[Dict[str, Any]] = None
_mock_statusbar_data: Optional[Dict[str, Any]] = None
_mock_trackbar_data: Optional[Tuple[int, int, int]] = None
_mock_window_mode: Optional[Tuple[str, bool]] = None
_mock_app_volume: Optional[Dict[str, Any]] = None
_mock_trackbar_volume: Optional[Tuple[int, bool, str]] = None
_mock_uia_volume: Optional[Tuple[int, bool, str]] = None

_user32 = ctypes.windll.user32 if sys.platform == "win32" else None
WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM) if sys.platform == "win32" else None


def set_mock_app_volume(
    volume_percent: Optional[int] = None,
    is_muted: Optional[bool] = False,
    source: str = "Mock"
) -> None:
    """Helper for unit tests to mock in-app internal volume and mute state."""
    global _mock_app_volume
    if volume_percent is None:
        _mock_app_volume = None
    else:
        _mock_app_volume = {
            "volume_percent": int(volume_percent),
            "is_muted": bool(is_muted or volume_percent == 0),
            "source": source,
            "is_app_level": True
        }


def set_mock_trackbar_volume(data: Optional[Tuple[int, bool, str]]) -> None:
    """Helper for unit tests to mock msctls_trackbar32 volume data."""
    global _mock_trackbar_volume
    _mock_trackbar_volume = data


def set_mock_uia_volume(data: Optional[Tuple[int, bool, str]]) -> None:
    """Helper for unit tests to mock UI Automation volume slider data."""
    global _mock_uia_volume
    _mock_uia_volume = data


def set_mock_window_mode(mode: Optional[str] = None, is_focused: Optional[bool] = None) -> None:
    """Helper for unit tests to mock window display mode and focus state."""
    global _mock_window_mode
    if mode is None and is_focused is None:
        _mock_window_mode = None
    else:
        _mock_window_mode = (mode or "WINDOWED", bool(is_focused))


def get_window_display_mode(hwnd: Optional[int]) -> Tuple[str, bool]:
    """
    Inspects Win32 window dimensions, styles, iconic state, and foreground status.
    Returns:
        (window_mode, is_focused):
            window_mode: 'FULLSCREEN' | 'BORDERLESS' | 'WINDOWED' | 'MINIMIZED'
            is_focused: bool (True if window currently has active system focus)
    """
    global _mock_window_mode
    if _mock_window_mode is not None:
        return _mock_window_mode

    if not hwnd or not _user32 or not _user32.IsWindow(hwnd):
        return "WINDOWED", False

    try:
        fg = _user32.GetForegroundWindow()
        is_focused = bool(fg and (fg == hwnd))
    except Exception:
        is_focused = False

    try:
        if _user32.IsIconic(hwnd):
            return "MINIMIZED", is_focused
    except Exception:
        pass

    try:
        rect = wintypes.RECT()
        if not _user32.GetWindowRect(hwnd, byref(rect)):
            return "WINDOWED", is_focused

        win_w = rect.right - rect.left
        win_h = rect.bottom - rect.top

        # Retrieve monitor bounds containing the window (MONITOR_DEFAULTTONEAREST = 2)
        hmon = _user32.MonitorFromWindow(hwnd, 2)
        mon_w, mon_h = 0, 0
        mon_left, mon_top = 0, 0

        if hmon:
            class MONITORINFO(ctypes.Structure):
                _fields_ = [
                    ("cbSize", wintypes.DWORD),
                    ("rcMonitor", wintypes.RECT),
                    ("rcWork", wintypes.RECT),
                    ("dwFlags", wintypes.DWORD)
                ]
            mi = MONITORINFO()
            mi.cbSize = ctypes.sizeof(MONITORINFO)
            if _user32.GetMonitorInfoW(hmon, byref(mi)):
                mon_w = mi.rcMonitor.right - mi.rcMonitor.left
                mon_h = mi.rcMonitor.bottom - mi.rcMonitor.top
                mon_left = mi.rcMonitor.left
                mon_top = mi.rcMonitor.top

        if mon_w <= 0 or mon_h <= 0:
            mon_w = _user32.GetSystemMetrics(0)  # SM_CXSCREEN
            mon_h = _user32.GetSystemMetrics(1)  # SM_CYSCREEN
            mon_left, mon_top = 0, 0

        # Retrieve window styles (GWL_STYLE = -16)
        style = _user32.GetWindowLongW(hwnd, -16)
        has_caption = bool((style & 0x00C00000) == 0x00C00000)
        has_thickframe = bool((style & 0x00040000) == 0x00040000)

        # Fullscreen / Borderless check
        covers_monitor = (win_w >= mon_w and win_h >= mon_h and rect.left <= mon_left and rect.top <= mon_top)
        if covers_monitor:
            if not has_caption:
                return "FULLSCREEN", is_focused
            else:
                return "BORDERLESS", is_focused

        if not has_caption and not has_thickframe and win_w >= mon_w - 4 and win_h >= mon_h - 4:
            return "FULLSCREEN", is_focused

        return "WINDOWED", is_focused
    except Exception:
        return "WINDOWED", is_focused


def set_mock_offline_timeline(data: Optional[Dict[str, Any]]) -> None:
    """Helper for unit tests to mock offline player timeline output."""
    global _mock_offline_timeline
    _mock_offline_timeline = data


def set_mock_statusbar_data(data: Optional[Dict[str, Any]]) -> None:
    """Helper for unit tests to mock status bar timeline and playback status."""
    global _mock_statusbar_data
    _mock_statusbar_data = data


def set_mock_trackbar_data(data: Optional[Tuple[int, int, int]]) -> None:
    """Helper for unit tests to mock trackbar slider position."""
    global _mock_trackbar_data
    _mock_trackbar_data = data


def parse_timestamp_seconds(time_str: str) -> float:
    """Converts MM:SS or HH:MM:SS string into total seconds."""
    if not time_str:
        return 0.0
    try:
        parts = [int(p) for p in time_str.strip().split(':')]
        if len(parts) == 3:
            return float(parts[0] * 3600 + parts[1] * 60 + parts[2])
        elif len(parts) == 2:
            return float(parts[0] * 60 + parts[1])
        elif len(parts) == 1:
            return float(parts[0])
    except (ValueError, TypeError):
        pass
    return 0.0


def format_seek_timeline(pos_sec: float, dur_sec: float) -> str:
    """Formats playback seek position and duration into MM:SS / MM:SS or HH:MM:SS / HH:MM:SS."""
    p = int(max(0, pos_sec))
    d = int(max(0, dur_sec))
    if d >= 3600 or p >= 3600:
        return f"{p // 3600:02d}:{(p % 3600) // 60:02d}:{p % 60:02d} / {d // 3600:02d}:{(d % 3600) // 60:02d}:{d % 60:02d}"
    return f"{p // 60:02d}:{p % 60:02d} / {d // 60:02d}:{d % 60:02d}"


def format_video_resolution(width: int, height: int) -> Tuple[str, str, str]:
    """
    Given width and height, returns (res_label, aspect_ratio_str, full_resolution_str).
    e.g. (1920, 1080) -> ("1080p FHD", "16:9", "1080p FHD (16:9 Aspect)")
    """
    if width <= 0 or height <= 0:
        return "N/A", "16:9", "N/A"

    ratio = width / max(1, height)
    if 1.70 <= ratio <= 1.85:
        aspect = "16:9"
    elif 1.30 <= ratio <= 1.40:
        aspect = "4:3"
    elif ratio >= 2.0:
        aspect = "21:9"
    elif 0.50 <= ratio <= 0.60:
        aspect = "9:16 (Vertical)"
    else:
        aspect = f"{round(ratio, 2)}:1"

    if height >= 2160 or width >= 3840:
        res_label = "4K UHD"
    elif height >= 1440 or width >= 2560:
        res_label = "1440p QHD"
    elif height >= 1080 or width >= 1920:
        res_label = "1080p FHD"
    elif height >= 720 or width >= 1280:
        res_label = "720p HD"
    elif height >= 480 or width >= 854:
        res_label = "480p SD"
    elif height >= 360 or width >= 640:
        res_label = "360p SD"
    else:
        res_label = f"{width}x{height}"

    full_res = f"{res_label} ({aspect} Aspect)" if "Aspect" not in aspect else f"{res_label} ({aspect})"
    return res_label, aspect, full_res


def extract_mp4_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """Direct binary parser for MP4/M4V/MOV ISO Base Media container atoms (<0.5ms)."""
    if not file_path or not os.path.isfile(file_path):
        return None

    try:
        file_size = os.path.getsize(file_path)
        if file_size < 16:
            return None

        with open(file_path, "rb") as f:
            timescale = 0
            duration = 0
            width = 0
            height = 0

            while f.tell() < file_size:
                hdr = f.read(8)
                if len(hdr) < 8:
                    break
                atom_size, atom_type = struct.unpack(">I4s", hdr)
                atom_name = atom_type.decode("latin1", errors="replace")

                data_size = atom_size - 8
                if atom_size == 1:
                    ext_hdr = f.read(8)
                    if len(ext_hdr) < 8:
                        break
                    atom_size = struct.unpack(">Q", ext_hdr)[0]
                    data_size = atom_size - 16
                elif atom_size == 0:
                    data_size = file_size - f.tell()

                if atom_name == "moov":
                    moov_end = f.tell() + data_size
                    while f.tell() < moov_end:
                        sub_hdr = f.read(8)
                        if len(sub_hdr) < 8:
                            break
                        sub_size, sub_type = struct.unpack(">I4s", sub_hdr)
                        sub_name = sub_type.decode("latin1", errors="replace")
                        sub_data_size = sub_size - 8

                        if sub_size == 1:
                            sub_ext = f.read(8)
                            if len(sub_ext) < 8:
                                break
                            sub_size = struct.unpack(">Q", sub_ext)[0]
                            sub_data_size = sub_size - 16

                        if sub_name == "mvhd":
                            mvhd_data = f.read(min(sub_data_size, 120))
                            if len(mvhd_data) >= 20:
                                version = mvhd_data[0]
                                if version == 0 and len(mvhd_data) >= 20:
                                    timescale, duration = struct.unpack(">II", mvhd_data[12:20])
                                elif version == 1 and len(mvhd_data) >= 32:
                                    timescale, duration = struct.unpack(">IQ", mvhd_data[20:32])
                            rem = sub_data_size - len(mvhd_data)
                            if rem > 0:
                                f.seek(rem, os.SEEK_CUR)

                        elif sub_name == "trak":
                            trak_end = f.tell() + sub_data_size
                            while f.tell() < trak_end:
                                trk_hdr = f.read(8)
                                if len(trk_hdr) < 8:
                                    break
                                trk_size, trk_type = struct.unpack(">I4s", trk_hdr)
                                trk_name = trk_type.decode("latin1", errors="replace")
                                trk_data_size = trk_size - 8

                                if trk_size == 1:
                                    trk_ext = f.read(8)
                                    if len(trk_ext) < 8:
                                        break
                                    trk_size = struct.unpack(">Q", trk_ext)[0]
                                    trk_data_size = trk_size - 16

                                if trk_name == "tkhd":
                                    tkhd_data = f.read(min(trk_data_size, 120))
                                    if len(tkhd_data) >= 84:
                                        version = tkhd_data[0]
                                        if version == 0 and len(tkhd_data) >= 84:
                                            w_fixed, h_fixed = struct.unpack(">II", tkhd_data[76:84])
                                        elif version == 1 and len(tkhd_data) >= 96:
                                            w_fixed, h_fixed = struct.unpack(">II", tkhd_data[88:96])
                                        else:
                                            w_fixed, h_fixed = 0, 0
                                        trk_w, trk_h = w_fixed >> 16, h_fixed >> 16
                                        if trk_w > 0 and trk_h > 0 and (width == 0 or height == 0):
                                            width, height = trk_w, trk_h
                                    rem = trk_data_size - len(tkhd_data)
                                    if rem > 0:
                                        f.seek(rem, os.SEEK_CUR)
                                else:
                                    if trk_data_size > 0:
                                        f.seek(trk_data_size, os.SEEK_CUR)

                            f.seek(trak_end)
                        else:
                            if sub_data_size > 0:
                                f.seek(sub_data_size, os.SEEK_CUR)

                    break
                else:
                    if data_size > 0:
                        f.seek(data_size, os.SEEK_CUR)

            dur_sec = (duration / timescale) if (timescale and timescale > 0) else 0.0
            if dur_sec > 0 or (width > 0 and height > 0):
                return {
                    "duration": round(dur_sec, 2),
                    "width": width,
                    "height": height
                }
    except Exception:
        pass
    return None


def extract_shell_video_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """Extracts video duration and frame width/height via native Windows Shell Property System."""
    if not file_path or not os.path.isfile(file_path):
        return None

    try:
        import comtypes.client
        abs_path = os.path.abspath(file_path)
        dir_name = os.path.dirname(abs_path)
        base_name = os.path.basename(abs_path)
        shell = comtypes.client.CreateObject('Shell.Application')
        folder = shell.Namespace(dir_name)
        if not folder:
            return None
        item = folder.ParseName(base_name)
        if not item:
            return None

        dur_sec = 0.0
        width = 0
        height = 0

        len_str = folder.GetDetailsOf(item, 27)
        if len_str:
            clean_len = len_str.replace('\u200e', '').replace('\u200f', '').strip()
            dur_sec = parse_timestamp_seconds(clean_len)

        w_str = folder.GetDetailsOf(item, 316)
        if w_str:
            clean_w = w_str.replace('\u200e', '').replace('\u200f', '').strip()
            if clean_w.isdigit():
                width = int(clean_w)

        h_str = folder.GetDetailsOf(item, 314)
        if h_str:
            clean_h = h_str.replace('\u200e', '').replace('\u200f', '').strip()
            if clean_h.isdigit():
                height = int(clean_h)

        if dur_sec <= 0 or width <= 0 or height <= 0:
            for idx in [27, 28, 29, 314, 315, 316, 317]:
                name = (folder.GetDetailsOf(None, idx) or "").lower()
                val = (folder.GetDetailsOf(item, idx) or "").replace('\u200e', '').replace('\u200f', '').strip()
                if not val:
                    continue
                if dur_sec <= 0 and any(k in name for k in ['length', 'duration', 'अवधि']):
                    dur_sec = parse_timestamp_seconds(val)
                elif width <= 0 and any(k in name for k in ['width', 'चौड़ाई']) and val.isdigit():
                    width = int(val)
                elif height <= 0 and any(k in name for k in ['height', 'ऊंचाई']) and val.isdigit():
                    height = int(val)

        if dur_sec > 0 or (width > 0 and height > 0):
            return {
                "duration": round(dur_sec, 2),
                "width": width,
                "height": height
            }
    except Exception:
        pass
    return None


def get_media_file_duration_com(file_path: str) -> float:
    """Queries exact duration via native Windows COM WMPlayer.OCX."""
    if not file_path or not os.path.exists(file_path):
        return 0.0
    abs_path = os.path.abspath(file_path)
    if abs_path in _file_duration_cache:
        return _file_duration_cache[abs_path]

    try:
        import comtypes.client
        wmp = comtypes.client.CreateObject('WMPlayer.OCX')
        media = wmp.newMedia(abs_path)
        if media and hasattr(media, 'duration') and media.duration and media.duration > 0:
            dur = float(media.duration)
            _file_duration_cache[abs_path] = dur
            return dur
    except Exception:
        pass
    return 0.0


def get_media_file_duration_shell(file_path: str) -> float:
    """Fallback duration query using native Windows Shell.Application."""
    if not file_path or not os.path.exists(file_path):
        return 0.0
    abs_path = os.path.abspath(file_path)
    if abs_path in _file_duration_cache:
        return _file_duration_cache[abs_path]

    try:
        import comtypes.client
        dir_name = os.path.dirname(abs_path)
        base_name = os.path.basename(abs_path)
        shell = comtypes.client.CreateObject('Shell.Application')
        folder = shell.Namespace(dir_name)
        if folder:
            item = folder.ParseName(base_name)
            if item:
                len_str = folder.GetDetailsOf(item, 27)
                if len_str:
                    sec = parse_timestamp_seconds(len_str)
                    if sec > 0:
                        _file_duration_cache[abs_path] = sec
                        return sec
    except Exception:
        pass
    return 0.0


def get_media_file_duration(file_path: str) -> float:
    """Queries exact duration via WMPlayer.OCX with Shell.Application fallback."""
    d = get_media_file_duration_com(file_path)
    if d > 0:
        return d
    return get_media_file_duration_shell(file_path)


def get_media_file_metadata(file_path: str) -> Dict[str, Any]:
    """Master media file metadata reader with LRU memory caching."""
    if not file_path or not os.path.isfile(file_path):
        return {
            "duration": 0.0,
            "width": 0,
            "height": 0,
            "aspect_ratio": "16:9",
            "resolution_label": "N/A",
            "video_resolution": "N/A"
        }

    abs_path = os.path.abspath(file_path)
    if abs_path in _file_metadata_cache:
        return _file_metadata_cache[abs_path]

    dur_sec = 0.0
    width = 0
    height = 0

    mp4_meta = extract_mp4_metadata(abs_path)
    if mp4_meta:
        dur_sec = mp4_meta.get("duration", 0.0)
        width = mp4_meta.get("width", 0)
        height = mp4_meta.get("height", 0)

    if dur_sec <= 0 or width <= 0 or height <= 0:
        shell_meta = extract_shell_video_metadata(abs_path)
        if shell_meta:
            if dur_sec <= 0:
                dur_sec = shell_meta.get("duration", 0.0)
            if width <= 0:
                width = shell_meta.get("width", 0)
            if height <= 0:
                height = shell_meta.get("height", 0)

    if dur_sec <= 0:
        dur_sec = get_media_file_duration(abs_path)

    res_label, aspect_str, full_res = format_video_resolution(width, height)
    result = {
        "duration": round(dur_sec, 2),
        "width": width,
        "height": height,
        "aspect_ratio": aspect_str,
        "resolution_label": res_label,
        "video_resolution": full_res
    }
    _file_metadata_cache[abs_path] = result
    if dur_sec > 0:
        _file_duration_cache[abs_path] = dur_sec

    return result


def extract_timeline_from_text(text: str) -> Optional[Tuple[float, float, float, str, str]]:
    """Extracts (pos_sec, dur_sec, progress, time_str, clean_title) from text."""
    if not text:
        return None
    m = TIMELINE_REGEX.search(text)
    if not m:
        return None

    pos_sec = parse_timestamp_seconds(m.group(1))
    raw_dur_str = m.group(2).strip()
    if raw_dur_str.startswith('-'):
        rem_sec = parse_timestamp_seconds(raw_dur_str.lstrip('-'))
        dur_sec = pos_sec + rem_sec
    else:
        dur_sec = parse_timestamp_seconds(raw_dur_str)

    progress = min(1.0, max(0.0, pos_sec / dur_sec)) if dur_sec > 0 else 0.0
    time_str = format_seek_timeline(pos_sec, dur_sec)

    clean = TIMELINE_REGEX.sub('', text)
    clean = PAUSE_REGEX.sub('', clean).strip(' -[]()–—:\t\n')

    return pos_sec, dur_sec, progress, time_str, clean


def detect_pause_in_title(title: str) -> bool:
    """Detects explicit pause or stopped indicators in window titles."""
    if not title:
        return False
    t_low = title.lower()
    return bool(
        PAUSE_REGEX.search(title) or
        "[paused]" in t_low or "(paused)" in t_low or
        "[stopped]" in t_low or "(stopped)" in t_low or
        "- paused" in t_low or "- stopped" in t_low or
        t_low.startswith("paused") or t_low.startswith("stopped")
    )


def calculate_playback_speed_velocity(
    proc_key: str,
    cur_pos: float,
    now: float,
    is_playing: bool
) -> float:
    """Calculates timeline progression velocity (delta pos / delta t) across updates."""
    cached = _playback_velocity_cache.get(proc_key)
    if not cached:
        _playback_velocity_cache[proc_key] = {
            "pos": cur_pos,
            "ts": now,
            "speed": 1.00
        }
        return 1.00

    last_pos = cached.get("pos", cur_pos)
    last_ts = cached.get("ts", now)
    last_speed = cached.get("speed", 1.00)

    dt = now - last_ts
    d_pos = cur_pos - last_pos

    if not is_playing or d_pos <= 0.02 or dt < 0.4:
        _playback_velocity_cache[proc_key]["pos"] = cur_pos
        _playback_velocity_cache[proc_key]["ts"] = now
        return last_speed

    if d_pos > (dt * 3.5) or d_pos < -1.0:
        _playback_velocity_cache[proc_key]["pos"] = cur_pos
        _playback_velocity_cache[proc_key]["ts"] = now
        return last_speed

    raw_velocity = d_pos / max(0.1, dt)
    if 0.15 <= raw_velocity <= 2.5:
        closest = min(STANDARD_PLAYBACK_SPEEDS, key=lambda s: abs(s - raw_velocity))
        if abs(closest - raw_velocity) <= 0.22:
            snapped = closest
        else:
            snapped = round(raw_velocity, 2)
    else:
        snapped = last_speed

    _playback_velocity_cache[proc_key] = {
        "pos": cur_pos,
        "ts": now,
        "speed": snapped
    }
    return snapped


def extract_trackbar_position(hwnd: int) -> Optional[Tuple[int, int, int]]:
    """Inspects Win32 child windows for msctls_trackbar32. Returns (pos, min_range, max_range)."""
    global _mock_trackbar_data
    if _mock_trackbar_data is not None:
        return _mock_trackbar_data

    if not hwnd or not _user32 or not _user32.IsWindow(hwnd):
        return None

    found: Optional[Tuple[int, int, int]] = None

    def enum_tb(chwnd, lp):
        nonlocal found
        if found is not None:
            return True
        cls_buf = ctypes.create_unicode_buffer(128)
        _user32.GetClassNameW(chwnd, cls_buf, 128)
        c_low = cls_buf.value.lower()
        if "trackbar" in c_low or "slider" in c_low:
            pos = _user32.SendMessageW(chwnd, 0x0400, 0, 0)
            min_v = _user32.SendMessageW(chwnd, 0x0401, 0, 0)
            max_v = _user32.SendMessageW(chwnd, 0x0402, 0, 0)
            if max_v > min_v and 0 <= pos <= max_v:
                found = (pos, min_v, max_v)
        return True

    try:
        _user32.EnumChildWindows(hwnd, WNDENUMPROC(enum_tb), 0)
    except Exception:
        pass
    return found


def extract_trackbar_volume(hwnd: int) -> Optional[Tuple[int, bool, str]]:
    """
    Tier 2: Win32 child window enumeration for msctls_trackbar32 controls.
    Distinguishes the volume slider from seek bars:
      - Volume sliders typically have range 0..100 (or compact width < 160px).
      - Seek sliders typically have larger range or wider bounds (width > 220px).
    Returns (volume_pct, is_muted, 'Trackbar32') or None.
    """
    global _mock_trackbar_volume
    if _mock_trackbar_volume is not None:
        return _mock_trackbar_volume

    if not hwnd or not _user32 or not _user32.IsWindow(hwnd):
        return None

    candidates: List[Tuple[int, int, int, int, int]] = []  # (score, pos, min_v, max_v, width)

    def enum_tb_vol(chwnd, lp):
        cls_buf = ctypes.create_unicode_buffer(128)
        _user32.GetClassNameW(chwnd, cls_buf, 128)
        c_low = cls_buf.value.lower()
        if "trackbar" in c_low or "slider" in c_low:
            pos = _user32.SendMessageW(chwnd, 0x0400, 0, 0)
            min_v = _user32.SendMessageW(chwnd, 0x0401, 0, 0)
            max_v = _user32.SendMessageW(chwnd, 0x0402, 0, 0)
            if max_v > min_v:
                rect = wintypes.RECT()
                _user32.GetWindowRect(chwnd, ctypes.byref(rect))
                w = max(0, rect.right - rect.left)

                score = 0
                if min_v == 0 and max_v == 100:
                    score += 50
                if 0 < w < 160:
                    score += 30
                elif w > 220:
                    score -= 30

                candidates.append((score, pos, min_v, max_v, w))
        return True

    try:
        _user32.EnumChildWindows(hwnd, WNDENUMPROC(enum_tb_vol), 0)
    except Exception:
        pass

    if not candidates:
        return None

    candidates.sort(key=lambda c: (-c[0], c[4]))
    best = candidates[0]
    score, pos, min_v, max_v, w = best

    if score < 0 and (max_v - min_v) != 100:
        return None

    pct = int(round((pos - min_v) / (max_v - min_v) * 100.0))
    pct = max(0, min(100, pct))
    return pct, (pct == 0), "Trackbar32"


_uia_instance = None
_uia_init_failed = False


def _get_uia():
    """Lazily loads and initializes UIAutomation COM instance."""
    global _uia_instance, _uia_init_failed
    if _uia_instance is not None:
        return _uia_instance
    if _uia_init_failed:
        return None
    try:
        import comtypes.client
        from comtypes.gen import UIAutomationClient
        _uia_instance = comtypes.client.CreateObject(
            UIAutomationClient.CUIAutomation,
            interface=UIAutomationClient.IUIAutomation
        )
        return _uia_instance
    except Exception:
        try:
            import comtypes.client
            sys_root = os.environ.get('SystemRoot', r'C:\Windows')
            uia_dll = os.path.join(sys_root, 'System32', 'UIAutomationCore.dll')
            if os.path.exists(uia_dll):
                comtypes.client.GetModule(uia_dll)
            else:
                comtypes.client.GetModule('UIAutomationCore.dll')
            from comtypes.gen import UIAutomationClient
            _uia_instance = comtypes.client.CreateObject(
                UIAutomationClient.CUIAutomation,
                interface=UIAutomationClient.IUIAutomation
            )
            return _uia_instance
        except Exception:
            _uia_init_failed = True
            return None


def extract_uia_volume_slider(hwnd: int) -> Optional[Tuple[int, bool, str]]:
    """
    Tier 1: Win32 UI Automation (IUIAutomation) scan for volume slider control.
    Finds slider elements (ControlType.Slider = 50015) in the player's window tree.
    Extracts RangeValuePattern or ValuePattern and checks for mute toggle buttons.
    Returns (volume_pct, is_muted, 'UIAutomation') or None.
    """
    global _mock_uia_volume
    if _mock_uia_volume is not None:
        return _mock_uia_volume

    if not hwnd or not _user32 or not _user32.IsWindow(hwnd):
        return None

    uia = _get_uia()
    if not uia:
        return None

    try:
        from comtypes.gen import UIAutomationClient
        root = uia.ElementFromHandle(hwnd)
        if not root:
            return None

        cond_slider = uia.CreatePropertyCondition(
            UIAutomationClient.UIA_ControlTypePropertyId,
            UIAutomationClient.UIA_SliderControlTypeId
        )
        sliders = root.FindAll(UIAutomationClient.TreeScope_Descendants, cond_slider)
        if not sliders or sliders.Length == 0:
            return None

        candidates = []
        for i in range(sliders.Length):
            s = sliders.GetElement(i)
            if not s:
                continue
            name = (s.CurrentName or "").lower().strip()
            auto_id = (s.CurrentAutomationId or "").lower().strip()
            help_txt = (s.CurrentHelpText or "").lower().strip()
            cls_name = (s.CurrentClassName or "").lower().strip()

            score = 0
            # Explicit volume keywords
            for kw in ("volume", "vol", "sound", "lautstärke", "audio"):
                if kw in name or kw in auto_id or kw in help_txt or kw in cls_name:
                    score += 100
                    break

            # Seek / timeline keywords to penalize
            for kw in ("seek", "timeline", "position", "progress", "time"):
                if kw in name or kw in auto_id or kw in help_txt:
                    score -= 100
                    break

            # Geometry heuristic
            try:
                rect = s.CurrentBoundingRectangle
                width = max(0, rect.right - rect.left)
            except Exception:
                width = 0

            if 0 < width < 180:
                score += 30
            elif width > 220:
                score -= 30

            candidates.append((score, width, s))

        if not candidates:
            return None

        candidates.sort(key=lambda c: (-c[0], c[1]))
        best_score, best_w, best_slider = candidates[0]

        if best_score < 0 and len(candidates) == 1 and best_w > 250:
            return None

        vol_pct = None

        # 1. Try RangeValuePattern
        p_rv = best_slider.GetCurrentPattern(UIAutomationClient.UIA_RangeValuePatternId)
        if p_rv:
            try:
                rv = p_rv.QueryInterface(UIAutomationClient.IUIAutomationRangeValuePattern)
                c_val = rv.CurrentValue
                min_v = rv.CurrentMinimum
                max_v = rv.CurrentMaximum
                if max_v > min_v:
                    pct = int(round((c_val - min_v) / (max_v - min_v) * 100.0))
                    vol_pct = max(0, min(100, pct))
            except Exception:
                pass

        # 2. Try ValuePattern
        if vol_pct is None:
            p_v = best_slider.GetCurrentPattern(UIAutomationClient.UIA_ValuePatternId)
            if p_v:
                try:
                    vp = p_v.QueryInterface(UIAutomationClient.IUIAutomationValuePattern)
                    v_str = (vp.CurrentValue or "").strip()
                    m = re.search(r'([0-9]+(?:\.[0-9]+)?)', v_str)
                    if m:
                        num = float(m.group(1))
                        if "%" in v_str or num > 1.0:
                            pct = int(round(num))
                        else:
                            pct = int(round(num * 100.0))
                        vol_pct = max(0, min(100, pct))
                except Exception:
                    pass

        if vol_pct is None:
            return None

        # Check for mute toggle or mute button
        is_muted = (vol_pct == 0)
        if not is_muted:
            try:
                cond_btn = uia.CreatePropertyCondition(
                    UIAutomationClient.UIA_ControlTypePropertyId,
                    UIAutomationClient.UIA_ButtonControlTypeId
                )
                buttons = root.FindAll(UIAutomationClient.TreeScope_Descendants, cond_btn)
                if buttons:
                    for b_idx in range(min(15, buttons.Length)):
                        b = buttons.GetElement(b_idx)
                        if not b:
                            continue
                        b_name = (b.CurrentName or "").lower().strip()
                        b_auto = (b.CurrentAutomationId or "").lower().strip()
                        if "mute" in b_name or "mute" in b_auto:
                            if "unmute" in b_name or "unmute" in b_auto:
                                is_muted = True
                                break
                            p_tog = b.GetCurrentPattern(UIAutomationClient.UIA_TogglePatternId)
                            if p_tog:
                                tp = p_tog.QueryInterface(UIAutomationClient.IUIAutomationTogglePattern)
                                if tp.CurrentToggleState == 1:  # ToggleState_On
                                    is_muted = True
                                    break
            except Exception:
                pass

        return vol_pct, is_muted, "UIAutomation"
    except Exception:
        pass
    return None


def extract_wasapi_session_volume(
    pid: Optional[int] = None,
    proc_name: Optional[str] = None
) -> Optional[Tuple[int, bool, str]]:
    """
    Tier 3: Windows Core Audio API (WASAPI) ISimpleAudioVolume query.
    Directly extracts the application's audio session volume and mute state.
    Strictly independent: NEVER multiplied by or replaced with Master System Volume!
    Returns (volume_pct, is_muted, 'WASAPISession') or None.
    """
    try:
        from modules.audio import get_live_wasapi_audio_state
        live = get_live_wasapi_audio_state()
        sess = None
        if pid and pid in live.get("session_volumes", {}):
            sess = live["session_volumes"][pid]
        elif proc_name:
            clean = proc_name.lower().strip()
            if clean in live.get("process_volumes", {}):
                sess = live["process_volumes"][clean]
            else:
                for s_pid, s_data in live.get("session_volumes", {}).items():
                    if s_data.get("process", "").lower() == clean:
                        sess = s_data
                        break
        if sess:
            vol_pct = int(sess.get("volume_percent", 100))
            is_muted = bool(sess.get("muted", False) or sess.get("is_muted", False) or vol_pct == 0)
            return vol_pct, is_muted, "WASAPISession"
    except Exception:
        pass
    return None


def extract_statusbar_volume(hwnd: int) -> Optional[Tuple[int, bool, str]]:
    """
    Tier 4: Status bar OSD volume text inspector.
    Checks msctls_statusbar32 parts for volume percentage and mute strings.
    """
    try:
        info = extract_statusbar_info(hwnd)
        raw_text = info.get("raw_text", "")
        if raw_text:
            m = re.search(r'(?:volume|vol)[\s:]*([0-9]{1,3})%', raw_text, re.IGNORECASE)
            is_m = bool(re.search(r'\b(?:mute|muted|silence)\b', raw_text, re.IGNORECASE))
            if m:
                val = max(0, min(100, int(m.group(1))))
                return val, is_m or (val == 0), "StatusBarOSD"
    except Exception:
        pass
    return None


def get_app_internal_volume(
    hwnd: Optional[int] = None,
    pid: Optional[int] = None,
    player_name: Optional[str] = None,
    proc_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Unified In-App Internal Volume Detection Sentinel.
    Prioritizes internal application-level volume controls:
      - Tier 0: Direct mock override (for unit testing)
      - Tier 1: Win32 UI Automation (IUIAutomation) volume slider
      - Tier 2: Win32 msctls_trackbar32 child control enumeration
      - Tier 3: WASAPI ISimpleAudioVolume (pure app session volume, NEVER master-multiplied)
      - Tier 4: Status bar / Window text OSD volume fallback
      - Default: 100% unmuted fallback
    Strict Guarantee:
      App Volume is NEVER multiplied by or replaced with Master System Volume!
    Returns:
      {
        "volume_percent": int (0 - 100),
        "is_muted": bool (app-level mute only),
        "source": str,
        "is_app_level": bool
      }
    """
    global _mock_app_volume
    if _mock_app_volume is not None:
        return dict(_mock_app_volume)

    # Tier 1: Win32 UI Automation volume slider scan
    if hwnd:
        uia_res = extract_uia_volume_slider(hwnd)
        if uia_res is not None:
            pct, muted, src = uia_res
            return {
                "volume_percent": pct,
                "is_muted": muted,
                "source": src,
                "is_app_level": True
            }

    # Tier 2: Win32 msctls_trackbar32 child control enumeration
    if hwnd:
        tb_res = extract_trackbar_volume(hwnd)
        if tb_res is not None:
            pct, muted, src = tb_res
            return {
                "volume_percent": pct,
                "is_muted": muted,
                "source": src,
                "is_app_level": True
            }

    # Tier 3: WASAPI ISimpleAudioVolume pure session query
    wasapi_res = extract_wasapi_session_volume(pid=pid, proc_name=proc_name)
    if wasapi_res is not None:
        pct, muted, src = wasapi_res
        return {
            "volume_percent": pct,
            "is_muted": muted,
            "source": src,
            "is_app_level": True
        }

    # Tier 4: Status bar / Window text OSD volume check
    if hwnd:
        sb_res = extract_statusbar_volume(hwnd)
        if sb_res is not None:
            pct, muted, src = sb_res
            return {
                "volume_percent": pct,
                "is_muted": muted,
                "source": src,
                "is_app_level": True
            }

    # Default fallback
    return {
        "volume_percent": 100,
        "is_muted": False,
        "source": "Default",
        "is_app_level": False
    }


def extract_statusbar_info(hwnd: int) -> Dict[str, Any]:
    """Comprehensive status bar inspector for MPC-HC, MPC-BE, WMP, PotPlayer."""
    global _mock_statusbar_data
    if _mock_statusbar_data is not None:
        p = float(_mock_statusbar_data.get("seek_position_sec", 0.0))
        d = float(_mock_statusbar_data.get("seek_duration_sec", 0.0))
        tl = _mock_statusbar_data.get("timeline")
        if not tl and d > 0:
            prog = min(1.0, max(0.0, p / d))
            tl = (p, d, prog, format_seek_timeline(p, d))
        st = _mock_statusbar_data.get("status")
        is_p = bool(_mock_statusbar_data.get("is_paused", False) or st in ("Paused", "Stopped"))
        is_pl = bool(_mock_statusbar_data.get("is_playing", False) or st == "Playing")
        return {
            "timeline": tl,
            "status": st or ("Paused" if is_p else ("Playing" if is_pl else None)),
            "is_paused": is_p,
            "is_playing": is_pl,
            "raw_text": _mock_statusbar_data.get("raw_text", "")
        }

    if not hwnd or not _user32 or not _user32.IsWindow(hwnd):
        return {
            "timeline": None,
            "status": None,
            "is_paused": False,
            "is_playing": False,
            "raw_text": ""
        }

    collected_strings: List[str] = []

    def enum_child(chwnd, lp):
        cls_buf = ctypes.create_unicode_buffer(128)
        _user32.GetClassNameW(chwnd, cls_buf, 128)
        if "statusbar" in cls_buf.value.lower():
            txt_len = _user32.SendMessageW(chwnd, 0x000E, 0, 0)
            if 0 < txt_len < 1024:
                buf = ctypes.create_unicode_buffer(txt_len + 1)
                _user32.SendMessageW(chwnd, 0x000D, txt_len + 1, buf)
                val = buf.value.strip()
                if val and val not in collected_strings:
                    collected_strings.append(val)

            try:
                num_parts = _user32.SendMessageW(chwnd, 0x0406, 0, 0)
                if 0 < num_parts <= 16:
                    for i in range(num_parts):
                        p_len = _user32.SendMessageW(chwnd, 0x040C, i, 0) & 0xFFFF
                        if 0 < p_len < 1024:
                            p_buf = ctypes.create_unicode_buffer(p_len + 1)
                            _user32.SendMessageW(chwnd, 0x040D, i, p_buf)
                            pval = p_buf.value.strip()
                            if pval and pval not in collected_strings:
                                collected_strings.append(pval)
            except Exception:
                pass
        return True

    try:
        _user32.EnumChildWindows(hwnd, WNDENUMPROC(enum_child), 0)
    except Exception:
        pass

    found_timeline: Optional[Tuple[float, float, float, str]] = None
    status_tag: Optional[str] = None
    is_paused = False
    is_playing = False

    for s in collected_strings:
        s_low = s.lower().strip()
        if "paused" in s_low:
            status_tag = "Paused"
            is_paused = True
        elif "stopped" in s_low:
            status_tag = "Stopped"
            is_paused = True
        elif "playing" in s_low and not is_paused:
            status_tag = "Playing"
            is_playing = True

        if not found_timeline:
            res = extract_timeline_from_text(s)
            if res:
                found_timeline = (res[0], res[1], res[2], res[3])

    return {
        "timeline": found_timeline,
        "status": status_tag,
        "is_paused": is_paused,
        "is_playing": is_playing,
        "raw_text": " | ".join(collected_strings)
    }


def extract_statusbar_timeline(hwnd: int) -> Optional[Tuple[float, float, float, str]]:
    """Inspects Win32 child windows for status bar timeline."""
    info = extract_statusbar_info(hwnd)
    return info.get("timeline")


def get_process_media_file_info(pid: int, title: Optional[str] = None) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Inspects process command line and open file handles to locate active video files."""
    if not pid or pid <= 0:
        return None, None, None

    if HAS_PSUTIL:
        try:
            proc = psutil.Process(pid)
            try:
                for arg in proc.cmdline():
                    clean_arg = arg.strip('\'"')
                    if clean_arg.startswith('file:///'):
                        clean_arg = urllib.parse.unquote(clean_arg[8:])
                    elif clean_arg.startswith('file://'):
                        clean_arg = urllib.parse.unquote(clean_arg[7:])
                    arg_low = clean_arg.lower()
                    for ext in VIDEO_FILE_EXTENSIONS:
                        if arg_low.endswith(ext):
                            clean_norm = os.path.normpath(clean_arg)
                            return clean_norm, os.path.basename(clean_norm), ext
            except Exception:
                pass

            try:
                for f in proc.open_files():
                    path_low = f.path.lower()
                    for ext in VIDEO_FILE_EXTENSIONS:
                        if path_low.endswith(ext):
                            norm_f = os.path.normpath(f.path)
                            return norm_f, os.path.basename(norm_f), ext
            except Exception:
                pass
        except Exception:
            pass

    return None, None, None


def update_offline_player_progress(
    proc_name: str,
    pid: int,
    dur_sec: float,
    is_playing: bool,
    speed: float = 1.0,
    current_pos: float = 0.0
) -> Dict[str, Any]:
    """Real-time progress updater for offline players."""
    now = time.time()
    proc_key = f"{proc_name.lower().strip()}_{pid or 0}"
    cached = _playback_progress_cache.get(proc_key)

    if cached:
        last_pos = cached.get("pos", current_pos)
        last_ts = cached.get("last_ts", now)
        if current_pos > 0 and abs(current_pos - last_pos) > 1.5:
            pos_sec = min(dur_sec, current_pos) if dur_sec > 0 else current_pos
        elif is_playing:
            elapsed = max(0.0, min(10.0, now - last_ts))
            pos_sec = min(dur_sec, last_pos + (elapsed * speed)) if dur_sec > 0 else last_pos + (elapsed * speed)
        else:
            pos_sec = last_pos
    else:
        pos_sec = min(dur_sec, current_pos) if dur_sec > 0 else current_pos

    _playback_progress_cache[proc_key] = {"pos": pos_sec, "last_ts": now}
    progress = min(1.0, max(0.0, pos_sec / dur_sec)) if dur_sec > 0 else 0.0
    time_str = format_seek_timeline(pos_sec, dur_sec)

    return {
        "pos_sec": round(pos_sec, 2),
        "dur_sec": round(dur_sec, 2),
        "progress": round(progress, 4),
        "time_str": time_str
    }


def reset_playback_progress_cache():
    """Resets the offline progress cache, metadata cache, and mocks."""
    global _playback_progress_cache, _file_duration_cache, _file_metadata_cache, _playback_velocity_cache
    global _mock_offline_timeline, _mock_statusbar_data, _mock_trackbar_data, _mock_window_mode
    global _mock_app_volume, _mock_trackbar_volume, _mock_uia_volume
    _playback_progress_cache.clear()
    _playback_velocity_cache.clear()
    _mock_offline_timeline = None
    _mock_statusbar_data = None
    _mock_trackbar_data = None
    _mock_window_mode = None
    _mock_app_volume = None
    _mock_trackbar_volume = None
    _mock_uia_volume = None


def make_scrub_bar(progress: float, width: int = 24) -> str:
    """Renders a clean terminal scrub progress bar."""
    prog = max(0.0, min(1.0, float(progress)))
    filled = int(round(prog * width))
    empty = width - filled
    return f"[{'█' * filled}{'░' * empty}] {prog * 100:.1f}%"


# ==============================================================================
# Base Player Detector Class & Standalone CLI Diagnostics Engine
# ==============================================================================

class BasePlayerDetector:
    """
    Abstract base class for modular media player detectors.
    Provides common window scanning, telemetry aggregation, ANSI card formatting,
    and 1s interval standalone diagnostic CLI loop.
    """

    player_name: str = "Media Player"
    process_names: Tuple[str, ...] = ()
    window_classes: Tuple[str, ...] = ()
    title_keywords: Tuple[str, ...] = ()
    suffixes: Tuple[str, ...] = ()

    def matches_process(self, proc_name: str, window_title: str = "") -> bool:
        """Determines if the given process or window belongs to this player."""
        p_low = (proc_name or "").lower().strip()
        t_low = (window_title or "").lower().strip()
        for p in self.process_names:
            if p.lower() in p_low:
                return True
        for kw in self.title_keywords:
            if kw.lower() in t_low:
                return True
        return False

    def find_active_windows(self) -> List[Dict[str, Any]]:
        """
        Enumerates system windows and finds all instances matching this player.
        Returns a list of dicts: [{'hwnd': int, 'pid': int, 'proc_name': str, 'title': str, 'class_name': str}].
        """
        results: List[Dict[str, Any]] = []
        if not _user32:
            return results

        from modules.win32_api import _get_process_name_by_pid, is_window_cloaked

        def enum_cb(hwnd, lparam):
            if not _user32.IsWindowVisible(hwnd) or is_window_cloaked(hwnd):
                return True

            cls_buf = ctypes.create_unicode_buffer(256)
            c_ret = _user32.GetClassNameW(hwnd, cls_buf, 256)
            cls_name = cls_buf.value.strip() if c_ret > 0 else ""

            length = _user32.GetWindowTextLengthW(hwnd)
            if length <= 0:
                return True
            buf = ctypes.create_unicode_buffer(length + 1)
            _user32.GetWindowTextW(hwnd, buf, length + 1)
            title = buf.value.strip()
            if not title:
                return True

            pid = wintypes.DWORD()
            _user32.GetWindowThreadProcessId(hwnd, byref(pid))
            pid_val = pid.value
            proc_name = _get_process_name_by_pid(pid_val)

            matched = False
            p_low = proc_name.lower().strip()
            c_low = cls_name.lower().strip()
            t_low = title.lower().strip()

            for pn in self.process_names:
                if pn.lower() in p_low:
                    matched = True
                    break

            if not matched:
                for cn in self.window_classes:
                    if cn.lower() in c_low:
                        matched = True
                        break

            if not matched:
                for kw in self.title_keywords:
                    if kw.lower() in t_low:
                        matched = True
                        break

            if matched:
                results.append({
                    "hwnd": hwnd,
                    "pid": pid_val,
                    "proc_name": proc_name,
                    "title": title,
                    "class_name": cls_name
                })
            return True

        try:
            _user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
        except Exception:
            pass
        return results

    def inspect_timeline(
        self,
        title: str,
        proc_name: str,
        hwnd: Optional[int] = None,
        pid: Optional[int] = None,
        is_playing: bool = True,
        detected_file: Optional[str] = None,
        detected_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Player-specific timeline & playback inspection. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement inspect_timeline()")

    def get_realtime_telemetry(self) -> Optional[Dict[str, Any]]:
        """
        Polls the system for active instances of this player and returns complete telemetry.
        Returns None if player is not currently running.
        """
        windows = self.find_active_windows()
        if not windows:
            return None

        primary_win = windows[0]
        hwnd = primary_win["hwnd"]
        pid = primary_win["pid"]
        proc_name = primary_win["proc_name"]
        raw_title = primary_win["title"]
        cls_name = primary_win["class_name"]

        tl = self.inspect_timeline(
            title=raw_title,
            proc_name=proc_name,
            hwnd=hwnd,
            pid=pid,
            is_playing=True
        )

        from modules.audio import get_detailed_audio_state
        from modules.powercfg import get_system_power_display_requests

        # Tiered In-App Internal Volume & Mute Extraction
        app_vol_info = get_app_internal_volume(
            hwnd=hwnd,
            pid=pid,
            player_name=self.player_name,
            proc_name=proc_name
        )
        if tl.get("app_volume_pct") is not None:
            app_vol = int(tl["app_volume_pct"])
            is_app_muted = bool(tl.get("is_app_muted", app_vol == 0))
            app_vol_source = tl.get("app_volume_source", "PlayerTimelineEngine")
        else:
            app_vol = app_vol_info.get("volume_percent", 100)
            is_app_muted = app_vol_info.get("is_muted", False)
            app_vol_source = app_vol_info.get("source", "Default")

        # WASAPI Master Audio & Peak Monitoring (Strictly Independent from In-App Volume)
        audio_st = get_detailed_audio_state(
            target_pid=pid,
            target_proc=proc_name,
            app_volume_pct=app_vol,
            app_muted=is_app_muted
        )
        master_vol = audio_st.get("master_volume_pct", 100)
        is_master_muted = audio_st.get("is_master_muted", False)
        peak = audio_st.get("peak_amplitude", 0.0)

        # Mute state is strictly evaluated at IN-APP level!
        # App volume must NEVER be muted or replaced due to system master volume.
        is_muted = is_app_muted

        display_reqs = get_system_power_display_requests()
        has_display_lock = any(p in proc_name.lower() for p in display_reqs)

        win_mode, is_focused = get_window_display_mode(hwnd)

        is_paused = tl.get("is_paused", False)
        dur_sec = tl.get("seek_duration_sec", 0.0)
        pos_sec = tl.get("seek_position_sec", 0.0)
        progress = tl.get("seek_progress", 0.0)
        clean_title = tl.get("clean_title") or raw_title
        file_path = tl.get("detected_path")
        file_name = tl.get("detected_file")

        if is_paused:
            status_text = "⏸ PAUSED"
            status_color = C_YELLOW
        elif is_muted:
            status_text = "🔇 MUTED (In-App Player Volume)"
            status_color = C_YELLOW
        elif dur_sec > 0 or (file_path and os.path.isfile(file_path)) or peak > 0.001 or has_display_lock:
            status_text = "▶ PLAYING"
            status_color = C_GREEN
        else:
            status_text = "⏹ IDLE / STOPPED (No Media Loaded)"
            status_color = C_GRAY

        scrub_bar = make_scrub_bar(progress)

        return {
            "player_name": self.player_name,
            "proc_name": proc_name,
            "pid": pid,
            "hwnd": hwnd,
            "class_name": cls_name,
            "window_title": raw_title,
            "clean_title": clean_title,
            "file_name": file_name,
            "file_path": file_path,
            "file_exists": bool(file_path and os.path.isfile(file_path)),
            "window_mode": win_mode,
            "is_focused": is_focused,
            "play_status": status_text,
            "play_status_color": status_color,
            "is_playing": not is_paused and status_text.startswith("▶"),
            "is_paused": is_paused,
            "is_muted": is_muted,
            "is_app_muted": is_app_muted,
            "app_volume_percent": app_vol,
            "audio_volume_pct": app_vol,
            "app_volume_source": app_vol_source,
            "master_volume_pct": master_vol,
            "is_master_muted": is_master_muted,
            "seek_position_sec": pos_sec,
            "seek_duration_sec": dur_sec,
            "seek_progress": progress,
            "seek_progress_pct": round(progress * 100.0, 2),
            "seek_time_str": tl.get("seek_time_str", format_seek_timeline(pos_sec, dur_sec)),
            "scrub_bar": scrub_bar,
            "video_resolution": tl.get("video_resolution", "N/A"),
            "resolution_label": tl.get("resolution_label", "N/A"),
            "aspect_ratio": tl.get("aspect_ratio", "16:9"),
            "width": tl.get("width", 0),
            "height": tl.get("height", 0),
            "playback_speed": tl.get("playback_speed", 1.00),
            "playback_speed_str": f"{tl.get('playback_speed', 1.00):.2f}x",
            "peak_amplitude": peak,
            "display_wake_lock": has_display_lock,
            "timestamp": time.strftime("%H:%M:%S")
        }

    def render_cli_card(self, telem: Optional[Dict[str, Any]]) -> str:
        """Renders a formatted ANSI diagnostic terminal card for standalone testing."""
        sep = "=" * 80
        thin = "-" * 80
        lines = []
        lines.append(f"{C_CYAN}{sep}{C_RESET}")
        lines.append(f"{C_BOLD}{C_CYAN}  {self.player_name.upper()} - REAL-TIME TELEMETRY DIAGNOSTIC SENTINEL{C_RESET}")
        lines.append(f"{C_CYAN}{sep}{C_RESET}")

        if not telem:
            lines.append(f"  {C_YELLOW}Status:{C_RESET}           ⏸ WAITING FOR PLAYER TO LAUNCH...")
            lines.append(f"  {C_GRAY}Monitored Procs:{C_RESET}  {', '.join(self.process_names) or 'N/A'}")
            lines.append(f"  {C_GRAY}Window Classes:{C_RESET}   {', '.join(self.window_classes) or 'N/A'}")
            lines.append(f"  {C_CYAN}Action:{C_RESET}           Please start {self.player_name} and play a video file.")
            lines.append(f"{C_CYAN}{thin}{C_RESET}")
            lines.append(f"  {C_GRAY}[Live Diagnostic: 1s refresh interval | Press Ctrl+C to exit]{C_RESET}")
            lines.append(f"{C_CYAN}{sep}{C_RESET}")
            return "\n".join(lines)

        col = telem["play_status_color"]
        focus_str = f"{C_GREEN}Active / Focused{C_RESET}" if telem.get("is_focused") else f"{C_GRAY}Background{C_RESET}"
        mode_str = telem.get("window_mode", "WINDOWED")
        if mode_str == "FULLSCREEN":
            mode_badge = f"{C_GREEN}FULLSCREEN{C_RESET}"
        elif mode_str == "BORDERLESS":
            mode_badge = f"{C_CYAN}BORDERLESS{C_RESET}"
        elif mode_str == "MINIMIZED":
            mode_badge = f"{C_YELLOW}MINIMIZED{C_RESET}"
        else:
            mode_badge = f"{C_GRAY}WINDOWED{C_RESET}"

        lines.append(f"  {C_BOLD}Status:{C_RESET}           {col}{C_BOLD}{telem['play_status']}{C_RESET}")
        lines.append(f"  {C_BOLD}Window Mode:{C_RESET}      {mode_badge} ({focus_str})")
        lines.append(f"  {C_BOLD}Window Title:{C_RESET}     {telem['window_title']}")
        lines.append(f"  {C_BOLD}Clean Media:{C_RESET}      {telem['clean_title']}")

        path_disp = telem["file_path"] or "N/A (Stream / In-Memory)"
        if telem["file_exists"]:
            path_disp += f" {C_GREEN}[VERIFIED ON DISK]{C_RESET}"
        lines.append(f"  {C_BOLD}Media Path:{C_RESET}       {path_disp}")

        lines.append(f"  {C_BOLD}Timeline:{C_RESET}         {C_CYAN}{telem['seek_time_str']}{C_RESET} ({telem['seek_position_sec']:.1f}s / {telem['seek_duration_sec']:.1f}s)")
        lines.append(f"  {C_BOLD}Scrub Progress:{C_RESET}   {C_GREEN}{telem['scrub_bar']}{C_RESET}")
        lines.append(f"  {C_BOLD}Resolution:{C_RESET}       {telem['video_resolution']} [{telem['width']}x{telem['height']}]")
        lines.append(f"  {C_BOLD}Playback Speed:{C_RESET}   {telem['playback_speed_str']}")

        vol_pct = telem.get('app_volume_percent', telem.get('audio_volume_pct', 100))
        muted_str = 'YES' if telem.get('is_app_muted', telem.get('is_muted', False)) else 'NO'
        src_tag = telem.get('app_volume_source', 'Internal Player Level')
        lines.append(f"  {C_BOLD}Audio Volume:{C_RESET}     🔊 App Volume: {vol_pct}% (App Muted: {muted_str}) [Internal Player Level]")

        m_vol = telem.get('master_volume_pct', 100)
        m_muted_str = 'YES' if telem.get('is_master_muted', False) else 'NO'
        peak_str = f"{telem.get('peak_amplitude', 0.0):.4f}"
        lines.append(f"  {C_GRAY}System Audio:{C_RESET}     Master: {m_vol}% (Master Muted: {m_muted_str}) | Source: {src_tag} | Peak: {peak_str}")

        lines.append(f"  {C_BOLD}Process Info:{C_RESET}     {telem['proc_name']} (PID: {telem['pid']} | HWND: 0x{telem['hwnd']:08X} | Class: {telem['class_name']})")
        lock_str = f"{C_GREEN}ACTIVE (Preventing Display Sleep){C_RESET}" if telem["display_wake_lock"] else f"{C_GRAY}None (Normal Idle){C_RESET}"
        lines.append(f"  {C_BOLD}Display Lock:{C_RESET}     {lock_str}")
        lines.append(f"  {C_BOLD}Last Updated:{C_RESET}     {telem['timestamp']}")

        lines.append(f"{C_CYAN}{thin}{C_RESET}")
        lines.append(f"  {C_GRAY}[Live Diagnostic: 1s refresh interval | Press Ctrl+C to exit]{C_RESET}")
        lines.append(f"{C_CYAN}{sep}{C_RESET}")
        return "\n".join(lines)

    def run_cli(self):
        """Standalone 1s interactive CLI loop with clear screen and graceful exit."""
        from modules.win32_api import enable_windows_vt_mode
        enable_windows_vt_mode()
        print(f"\nStarting {self.player_name} Standalone Telemetry Diagnostic Sentinel...")
        print("Press Ctrl+C at any time to exit.\n")
        try:
            while True:
                telem = self.get_realtime_telemetry()
                sys.stdout.write("\033[2J\033[H")
                sys.stdout.write(self.render_cli_card(telem))
                sys.stdout.write("\n")
                sys.stdout.flush()
                time.sleep(1.0)
        except KeyboardInterrupt:
            print(f"\n{C_YELLOW}[Sentinel Stopped]{C_RESET} {self.player_name} diagnostic session closed cleanly.")
