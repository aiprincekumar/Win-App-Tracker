# -*- coding: utf-8 -*-
"""
wmp_classic.py: Dedicated Classifier & Anti-Flicker Hysteresis for Windows Media Player Classic / Legacy (wmplayer.exe).

Specialized forensic classifier for wmplayer.exe:
  1. Authoritative Source of Truth:
     - Priority 1: proc.cmdline(). Extracts target audio file (e.g. Song.mp3) launched by user.
     - Priority 2: Main window title of WMPlayerApp. Strips ' - Windows Media Player'.
     - Priority 3: Stable Open File Filter. Only if BOTH cmdline and window title are missing/generic.
  2. Video Classification Gate:
     - Background library scans NEVER cause wmplayer.exe to be classified as VIDEO.
     - VIDEO is ONLY True if:
       a) proc.cmdline() has an explicit video file (.mp4, .mkv, .avi, etc.), OR
       b) Window title has an explicit video extension, OR
       c) Active video renderer child window (check_wmp_video_window) is visible, OR
       d) GSMTC reports PlaybackType=2 (Video).
     - Otherwise, WMP Legacy is 100% AUDIO!
  3. Stable Title Locking (Anti-Flicker):
     - Prevents background library scans from overwriting track title.
  4. State Stabilization / Anti-Flicker Hysteresis (3.0s window):
     - Prevents momentary musical rests from flickering between AUDIO, VIDEO, and IDLE.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

import sys
import os
import time
import threading
import ctypes
from ctypes import wintypes, byref, POINTER
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Set, Any

from .constants import (
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    WMP_VIDEO_WINDOW_CLASSES,
    is_system_ignored_title,
    is_system_ignored_class,
    PSUTIL_AVAILABLE,
    ProcessMediaClassification,
    classify_text_for_media_type
)

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore

user32 = ctypes.windll.user32 if sys.platform == "win32" else None

if user32:
    WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    user32.EnumWindows.argtypes = [WNDENUMPROC, wintypes.LPARAM]
    user32.EnumWindows.restype = wintypes.BOOL
    user32.EnumChildWindows.argtypes = [wintypes.HWND, WNDENUMPROC, wintypes.LPARAM]
    user32.EnumChildWindows.restype = wintypes.BOOL
    user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    user32.GetWindowTextW.restype = ctypes.c_int
    user32.GetWindowTextLengthW.argtypes = [wintypes.HWND]
    user32.GetWindowTextLengthW.restype = ctypes.c_int
    user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, POINTER(wintypes.DWORD)]
    user32.GetWindowThreadProcessId.restype = wintypes.DWORD
    user32.IsWindowVisible.argtypes = [wintypes.HWND]
    user32.IsWindowVisible.restype = wintypes.BOOL
    user32.GetClassNameW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    user32.GetClassNameW.restype = ctypes.c_int
    user32.GetClientRect.argtypes = [wintypes.HWND, POINTER(wintypes.RECT)]
    user32.GetClientRect.restype = wintypes.BOOL


def _resolve(name: str, fallback: Any) -> Any:
    """Checks if a symbol has been monkeypatched on root audio_detector module."""
    mod = sys.modules.get("audio_detector")
    if mod is not None and hasattr(mod, name):
        val = getattr(mod, name)
        if val is not None:
            return val
    return fallback


def ensure_desktop_access():
    """Ensures interactive desktop attachment for Win32 window enumeration."""
    u32 = _resolve("user32", user32)
    if not u32:
        return
    try:
        h_winsta = u32.OpenWindowStationW("WinSta0", False, 0x0000037F)
        if h_winsta:
            u32.SetProcessWindowStation(h_winsta)
        h_desk = u32.OpenDesktopW("default", 0, False, 0x01FF)
        if h_desk:
            u32.SetThreadDesktop(h_desk)
    except Exception:
        pass


ensure_desktop_access()


def get_hwnds_for_pid(target_pid: int) -> List[Any]:
    """Retrieves all top-level HWNDs associated with a given process ID."""
    u32 = _resolve("user32", user32)
    if not u32 or target_pid <= 0:
        return []

    hwnds: List[Any] = []

    def enum_cb(hwnd, lparam):
        cpid = wintypes.DWORD()
        u32.GetWindowThreadProcessId(hwnd, byref(cpid))
        if cpid.value == target_pid:
            hwnds.append(hwnd)
        return True

    cb = WNDENUMPROC(enum_cb)
    u32.EnumWindows(cb, 0)
    return hwnds


def get_window_titles_for_pid(target_pid: int) -> List[str]:
    """
    Retrieves all visible window titles associated with a given process ID.
    Strictly filters out Windows system/utility windows (e.g. 'Default IME', 'MSCTFIME UI')
    and prioritizes main application windows such as 'WMPlayerApp' for wmplayer.exe.
    """
    u32 = _resolve("user32", user32)
    if not u32:
        return []

    wmplayer_titles: List[str] = []
    other_titles: List[str] = []

    def enum_cb(hwnd, lparam):
        if not u32.IsWindowVisible(hwnd):
            return True
        cpid = wintypes.DWORD()
        u32.GetWindowThreadProcessId(hwnd, byref(cpid))
        if cpid.value == target_pid:
            cls_buf = ctypes.create_unicode_buffer(256)
            c_ret = u32.GetClassNameW(hwnd, cls_buf, 256)
            cls_name = cls_buf.value.strip() if c_ret > 0 else ""
            if is_system_ignored_class(cls_name):
                return True

            length = u32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buf = ctypes.create_unicode_buffer(length + 1)
                u32.GetWindowTextW(hwnd, buf, length + 1)
                t = buf.value.strip()
                if t and not is_system_ignored_title(t):
                    if cls_name.lower() == "wmplayerapp":
                        wmplayer_titles.append(t)
                    else:
                        other_titles.append(t)
        return True

    cb = WNDENUMPROC(enum_cb)
    u32.EnumWindows(cb, 0)
    return wmplayer_titles + other_titles


def check_wmp_video_window(pid: int) -> Tuple[bool, str]:
    """
    Checks if wmplayer.exe has an active, visible video rendering child surface.
    When WMP Legacy plays video, it creates dedicated child rendering surfaces
    (e.g., 'WMP Video Window', 'VideoRenderer', 'ActiveMovie Window', etc.) with positive dimensions.
    When playing audio (or visualizations/skin mode), these video rendering surfaces do not exist.
    Returns: (is_video, reason)
    """
    u32 = _resolve("user32", user32)
    if not u32 or pid <= 0:
        return False, ""

    hwnds = get_hwnds_for_pid(pid)
    if not hwnds:
        return False, ""

    found_video_cls: Optional[str] = None
    found_dims: Tuple[int, int] = (0, 0)

    def check_hwnd(hwnd) -> bool:
        nonlocal found_video_cls, found_dims
        try:
            if not u32.IsWindowVisible(hwnd):
                return True

            buf = ctypes.create_unicode_buffer(256)
            ret = u32.GetClassNameW(hwnd, buf, 256)
            if ret > 0:
                cls_name = buf.value.strip().lower()
                is_match = any(v_cls in cls_name for v_cls in WMP_VIDEO_WINDOW_CLASSES)
                if is_match:
                    rect = wintypes.RECT()
                    if u32.GetClientRect(hwnd, byref(rect)):
                        w = rect.right - rect.left
                        h = rect.bottom - rect.top
                        if w > 0 and h > 0:
                            found_video_cls = buf.value.strip()
                            found_dims = (w, h)
                            return False  # stop enumeration
        except Exception:
            pass
        return True

    for top_hwnd in hwnds:
        if not check_hwnd(top_hwnd):
            break

        def child_enum_cb(hwnd, lparam):
            return check_hwnd(hwnd)

        child_cb = WNDENUMPROC(child_enum_cb)
        u32.EnumChildWindows(top_hwnd, child_cb, 0)
        if found_video_cls:
            break

    if found_video_cls:
        w, h = found_dims
        return True, f"WMP Legacy video rendering window class detected: '{found_video_cls}' ({w}x{h})"

    return False, ""


def clean_wmp_window_title(title: str) -> str:
    """
    Strips ' - Windows Media Player' from WMP window title.
    Returns clean track title, or empty string if it was just the application title
    or a Windows system/utility window (e.g. 'Default IME', 'MSCTFIME UI').
    """
    if not title:
        return ""
    t = title.strip()
    if is_system_ignored_title(t):
        return ""
    if t.lower() in ("default ime", "windows media player", "now playing", "media player", "windows media player legacy", ""):
        return ""

    suffixes = [
        " - Windows Media Player",
        " - Media Player",
        " - Windows Media Player Legacy"
    ]
    for suffix in suffixes:
        if t.lower().endswith(suffix.lower()):
            t = t[:len(t) - len(suffix)].strip()
            break

    if is_system_ignored_title(t):
        return ""
    if t.lower() in ("default ime", "windows media player", "now playing", "media player", "windows media player legacy", ""):
        return ""
    return t


def extract_media_from_cmdline(cmdline_args: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Parses command line arguments to identify target media file and its type ('AUDIO' or 'VIDEO').
    Returns: (file_path, media_type) or (None, None).
    """
    if not cmdline_args or len(cmdline_args) <= 1:
        return None, None

    for arg in cmdline_args[1:]:
        clean_arg = arg.strip().strip('"').strip("'")
        if not clean_arg or clean_arg.startswith("/") or clean_arg.startswith("-"):
            continue
        ext = os.path.splitext(clean_arg)[1].lower()
        if ext in AUDIO_EXTENSIONS:
            return clean_arg, "AUDIO"
        if ext in VIDEO_EXTENSIONS:
            return clean_arg, "VIDEO"

    return None, None


# ==============================================================================
# Hysteresis & State Stabilization
# ==============================================================================

_wmp_state_lock = threading.Lock()
_wmp_file_open_times: Dict[Tuple[int, str], float] = {}


@dataclass
class WMPStabilizedState:
    pid: int = 0
    timestamp: float = 0.0
    classification: str = "SILENT"  # 'AUDIO', 'VIDEO', 'SILENT'
    is_audio: bool = False
    is_video: bool = False
    peak_value: float = 0.0
    file_path: Optional[str] = None
    window_title: Optional[str] = None
    locked_title: Optional[str] = None
    cmdline_file: Optional[str] = None
    reason: str = ""


_last_wmp_state: Optional[WMPStabilizedState] = None


def reset_wmp_stabilizer():
    """Resets WMP stabilization state (used for testing or clean restarts)."""
    global _last_wmp_state, _wmp_file_open_times
    with _wmp_state_lock:
        _last_wmp_state = None
        _wmp_file_open_times.clear()


def classify_wmp_legacy(
    pid: int,
    proc_name: str,
    peak: float,
    display_requests: Set[str],
    gsmtc_info: Optional[Any] = None
) -> ProcessMediaClassification:
    """
    Dedicated, specialized forensic classifier for Windows Media Player Legacy (wmplayer.exe).
    """
    global _last_wmp_state, _wmp_file_open_times
    now = time.time()

    is_psutil = _resolve("PSUTIL_AVAILABLE", PSUTIL_AVAILABLE)
    check_video_fn = _resolve("check_wmp_video_window", check_wmp_video_window)
    get_titles_fn = _resolve("get_window_titles_for_pid", get_window_titles_for_pid)

    # Reset state if PID changed
    with _wmp_state_lock:
        if _last_wmp_state and _last_wmp_state.pid != pid:
            _last_wmp_state = None
            _wmp_file_open_times.clear()

    # If peak is silent, evaluate anti-flicker hysteresis (3.0s window)
    if peak <= 0.0001:
        with _wmp_state_lock:
            if _last_wmp_state and (now - _last_wmp_state.timestamp) <= 3.0 and _last_wmp_state.is_audio:
                return ProcessMediaClassification(
                    pid=pid,
                    proc_name=proc_name,
                    peak_value=_last_wmp_state.peak_value,
                    is_audio=_last_wmp_state.is_audio,
                    is_video=_last_wmp_state.is_video,
                    classification=_last_wmp_state.classification,
                    reason=f"{_last_wmp_state.reason} (Stabilized 3.0s window)",
                    file_path=_last_wmp_state.file_path,
                    window_title=_last_wmp_state.locked_title or _last_wmp_state.window_title
                )

        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=False,
            classification="SILENT",
            reason=f"Audio meter peak is silent ({peak:.4f})"
        )

    # Inspect process command line and window titles
    cmdline_args: List[str] = []
    if is_psutil and psutil and pid > 0:
        try:
            proc = psutil.Process(pid)
            cmdline_args = proc.cmdline()
        except Exception:
            cmdline_args = []

    cmd_media_path, cmd_media_type = extract_media_from_cmdline(cmdline_args)

    raw_window_titles = get_titles_fn(pid)
    window_titles = [wt for wt in raw_window_titles if wt and not is_system_ignored_title(wt)]
    clean_title = ""
    for wt in window_titles:
        c = clean_wmp_window_title(wt)
        if c and not is_system_ignored_title(c):
            clean_title = c
            break

    # 1. Video Classification Gate
    is_video_surface, surface_reason = check_video_fn(pid)

    win_has_video_ext = False
    for wt in window_titles:
        c_wt = clean_wmp_window_title(wt) or wt
        if is_system_ignored_title(c_wt):
            continue
        t_class, _ = classify_text_for_media_type(c_wt)
        if t_class == "VIDEO":
            win_has_video_ext = True
            break

    gsmtc_is_video = (
        gsmtc_info is not None and
        (getattr(gsmtc_info, "status", 0) in (4, 0)) and
        getattr(gsmtc_info, "playback_type", 0) == 2
    )

    if is_video_surface or cmd_media_type == "VIDEO" or win_has_video_ext or gsmtc_is_video:
        if is_video_surface:
            v_reason = surface_reason
        elif cmd_media_type == "VIDEO":
            v_reason = f"WMP command line specifies video file: '{os.path.basename(cmd_media_path or '')}'"
        elif win_has_video_ext:
            v_reason = f"WMP window title specifies video file: '{clean_title or (window_titles[0] if window_titles else '')}'"
        else:
            v_title_info = getattr(gsmtc_info, "title", "")
            v_reason = f"GSMTC reports PlaybackType=Video (Title: '{v_title_info}')"

        v_title = clean_title or (os.path.basename(cmd_media_path) if cmd_media_path else "")
        if is_system_ignored_title(v_title):
            v_title = ""
        res = ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=True,
            classification="VIDEO",
            reason=v_reason,
            file_path=cmd_media_path if cmd_media_type == "VIDEO" else None,
            window_title=v_title or None
        )
        with _wmp_state_lock:
            _last_wmp_state = WMPStabilizedState(
                pid=pid,
                timestamp=now,
                classification="VIDEO",
                is_audio=False,
                is_video=True,
                peak_value=peak,
                file_path=res.file_path,
                window_title=v_title or None,
                locked_title=v_title or None,
                reason=v_reason
            )
        return res

    # 2. Pure AUDIO Classification & Authoritative Title Resolution
    prev_locked: Optional[str] = None
    prev_file: Optional[str] = None
    with _wmp_state_lock:
        if _last_wmp_state and _last_wmp_state.is_audio:
            if _last_wmp_state.locked_title and not is_system_ignored_title(_last_wmp_state.locked_title):
                prev_locked = _last_wmp_state.locked_title
            prev_file = _last_wmp_state.file_path

    resolved_title: Optional[str] = None
    resolved_file: Optional[str] = None
    resolved_reason: str = ""

    # Priority 1: cmdline
    if cmd_media_type == "AUDIO" and cmd_media_path:
        cmd_filename = os.path.basename(cmd_media_path)
        resolved_file = cmd_media_path

        if clean_title:
            stem_cmd = os.path.splitext(cmd_filename)[0].lower()
            stem_clean = os.path.splitext(clean_title)[0].lower()
            if stem_clean == stem_cmd or clean_title.lower() == cmd_filename.lower():
                resolved_title = cmd_filename
                resolved_reason = f"WMP audio playback active (cmdline: '{cmd_filename}', display lock excluded)"
            else:
                resolved_title = clean_title
                resolved_reason = f"WMP audio playback active (window title: '{clean_title}', display lock excluded)"
        else:
            resolved_title = cmd_filename
            resolved_reason = f"WMP audio playback active (cmdline: '{cmd_filename}', display lock excluded)"

    # Priority 2: Main window title (when no cmdline audio file)
    elif clean_title:
        resolved_title = clean_title
        resolved_reason = f"WMP audio playback active (window title: '{clean_title}', display lock excluded)"
        resolved_file = prev_file

    # Priority 3: Stable Open File Filter
    else:
        if prev_locked:
            resolved_title = prev_locked
            resolved_file = prev_file
            resolved_reason = f"WMP audio playback active (locked track: '{prev_locked}', display lock excluded)"
        else:
            stable_audio_path: Optional[str] = None
            if is_psutil and psutil and pid > 0:
                try:
                    proc = psutil.Process(pid)
                    open_files = proc.open_files()
                    current_audio_files: List[str] = []
                    for of in open_files:
                        of_ext = os.path.splitext(of.path)[1].lower()
                        if of_ext in AUDIO_EXTENSIONS:
                            current_audio_files.append(of.path)

                    for f_p in current_audio_files:
                        k = (pid, f_p)
                        if k not in _wmp_file_open_times:
                            _wmp_file_open_times[k] = now

                    cur_set = {(pid, f_p) for f_p in current_audio_files}
                    for k in list(_wmp_file_open_times.keys()):
                        if k[0] == pid and k not in cur_set:
                            _wmp_file_open_times.pop(k, None)

                    persistent = [
                        fp for fp in current_audio_files
                        if (now - _wmp_file_open_times.get((pid, fp), now)) >= 1.5
                    ]
                    if persistent:
                        stable_audio_path = persistent[0]
                    elif len(current_audio_files) == 1:
                        stable_audio_path = current_audio_files[0]
                except Exception:
                    pass

            if stable_audio_path:
                resolved_title = os.path.basename(stable_audio_path)
                resolved_file = stable_audio_path
                resolved_reason = f"WMP open audio file handle detected: '{os.path.splitext(stable_audio_path)[1]}' ({resolved_title})"
            else:
                resolved_title = None
                resolved_file = None
                resolved_reason = "WMP Legacy audio playback active (display lock excluded, no video rendering surface)"

    candidate_fallback = None
    for wt in window_titles:
        c = clean_wmp_window_title(wt)
        if c and not is_system_ignored_title(c):
            candidate_fallback = c
            break

    final_title = resolved_title or prev_locked or candidate_fallback or None
    if final_title and is_system_ignored_title(final_title):
        final_title = None
    final_file = resolved_file or prev_file or None

    res = ProcessMediaClassification(
        pid=pid,
        proc_name=proc_name,
        peak_value=peak,
        is_audio=True,
        is_video=False,
        classification="AUDIO",
        reason=resolved_reason,
        file_path=final_file,
        window_title=final_title
    )
    with _wmp_state_lock:
        _last_wmp_state = WMPStabilizedState(
            pid=pid,
            timestamp=now,
            classification="AUDIO",
            is_audio=True,
            is_video=False,
            peak_value=peak,
            file_path=final_file,
            window_title=final_title,
            locked_title=final_title,
            cmdline_file=cmd_media_path,
            reason=resolved_reason
        )
    return res
