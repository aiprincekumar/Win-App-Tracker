# -*- coding: utf-8 -*-
"""
Win App Tracker.py: Advanced Windows Idle & True Active Media Playback Sentinel.

Detects:
  1. User physical inactivity (keyboard & mouse) via Win32 GetLastInputInfo.
  2. TRUE Active Media Playback (YouTube, Netflix, Spotify, VLC, Edge, Chrome, etc.)
     using Windows Core Audio API (WASAPI) real-time audio session metering.
     - If video is PAUSED or audio is silent, it is treated as IDLE.
     - If video/audio is ACTIVELY streaming, it is flagged as IN USE.
  3. Foreground window fullscreen states and Windows power execution wake locks.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker
"""

import sys
import os
import time
import json
import csv
import io
import re
import argparse
import subprocess
import threading
import atexit
import ctypes
from ctypes import wintypes, Structure, sizeof, byref, POINTER, c_float, c_int, c_uint, c_ulong, c_void_p
from typing import Dict, List, Optional, Tuple, Any

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ==============================================================================
# 1. Win32 Structures & API Bindings
# ==============================================================================

class LASTINPUTINFO(Structure):
    _fields_ = [
        ("cbSize", wintypes.UINT),
        ("dwTime", wintypes.DWORD)
    ]

class RECT(Structure):
    _fields_ = [
        ("left", wintypes.LONG),
        ("top", wintypes.LONG),
        ("right", wintypes.LONG),
        ("bottom", wintypes.LONG)
    ]

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32
ole32 = ctypes.windll.ole32

# Configure Win32 function signatures
user32.GetLastInputInfo.argtypes = [ctypes.POINTER(LASTINPUTINFO)]
user32.GetLastInputInfo.restype = wintypes.BOOL

kernel32.GetTickCount64.restype = ctypes.c_ulonglong

user32.GetForegroundWindow.restype = wintypes.HWND
user32.GetWindowTextLengthW.argtypes = [wintypes.HWND]
user32.GetWindowTextLengthW.restype = ctypes.c_int
user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
user32.GetWindowTextW.restype = ctypes.c_int
user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
user32.GetWindowThreadProcessId.restype = wintypes.DWORD
user32.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(RECT)]
user32.GetWindowRect.restype = wintypes.BOOL
user32.GetSystemMetrics.argtypes = [ctypes.c_int]
user32.GetSystemMetrics.restype = ctypes.c_int

SM_CXSCREEN = 0
SM_CYSCREEN = 1
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

# ==============================================================================
# 2. Windows Core Audio API (WASAPI) COM Interface Definitions
# ==============================================================================

class GUID(Structure):
    _fields_ = [
        ("Data1", wintypes.DWORD),
        ("Data2", wintypes.WORD),
        ("Data3", wintypes.WORD),
        ("Data4", ctypes.c_ubyte * 8)
    ]

def _make_guid(s: str) -> GUID:
    g = GUID()
    ole32.IIDFromString(s, byref(g))
    return g

CLSID_MMDeviceEnumerator   = _make_guid("{BCDE0395-E52F-467C-8E3D-C4579291692E}")
IID_IMMDeviceEnumerator    = _make_guid("{A95664D2-9614-4F35-A746-DE8DB63617E6}")
IID_IAudioSessionManager2  = _make_guid("{77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F}")
IID_IAudioSessionControl2  = _make_guid("{bfb7ff88-7239-4fc9-8fa2-07c950be9c6d}")
IID_IAudioMeterInformation = _make_guid("{C02216F6-8C67-4B5B-9D00-D008E73E0064}")

def _call_com_method(this_ptr: c_void_p, vtable_index: int, restype: Any, argtypes: List[Any], *args) -> Any:
    """Dispatches a direct COM vtable method call."""
    vtable = ctypes.cast(this_ptr, POINTER(POINTER(c_void_p))).contents
    fn = ctypes.WINFUNCTYPE(restype, c_void_p, *argtypes)(vtable[vtable_index])
    return fn(this_ptr, *args)

def _get_process_name_by_pid(pid: int) -> str:
    """Resolves a process ID to its executable image name using Win32 API."""
    if pid <= 0:
        return "System"
    h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
    if not h_proc:
        return f"PID:{pid}"
    try:
        buf = ctypes.create_unicode_buffer(1024)
        size = wintypes.DWORD(1024)
        if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf, byref(size)):
            return os.path.basename(buf.value).lower()
    except Exception:
        pass
    finally:
        kernel32.CloseHandle(h_proc)
    return f"PID:{pid}"

# Track recent active audio playback timestamps to smooth micro-silence in speech/music (2.5s window)
_audio_history_lock = threading.Lock()
_process_last_audio_active: Dict[str, float] = {}

def get_live_wasapi_audio_state() -> Dict[str, Any]:
    """
    Directly queries Windows Core Audio API (WASAPI) across all active render endpoints.
    Measures real-time peak audio levels for every individual audio session and endpoint.
    
    Returns:
        {
            "master_peak": float,
            "is_any_audio_active": bool,
            "active_processes": Dict[str, float],   # process_name -> peak
            "all_session_peaks": Dict[str, float]   # process_name -> peak
        }
    """
    ole32.CoInitialize(None)
    try:
        p_enumerator = c_void_p()
        hr = ole32.CoCreateInstance(
            byref(CLSID_MMDeviceEnumerator),
            None,
            1,  # CLSCTX_INPROC_SERVER
            byref(IID_IMMDeviceEnumerator),
            byref(p_enumerator)
        )
        if hr != 0 or not p_enumerator.value:
            return {
                "master_peak": 0.0,
                "is_any_audio_active": False,
                "active_processes": {},
                "all_session_peaks": {}
            }

        # EnumAudioEndpoints: index 3 (dataFlow=0 eRender, dwStateMask=1 DEVICE_STATE_ACTIVE)
        p_device_col = c_void_p()
        _call_com_method(p_enumerator, 3, ctypes.c_long, [c_int, c_uint, POINTER(c_void_p)], 0, 1, byref(p_device_col))

        dev_count = c_uint(0)
        _call_com_method(p_device_col, 3, ctypes.c_long, [POINTER(c_uint)], byref(dev_count))

        max_master_peak = 0.0
        session_peaks: Dict[str, float] = {}
        active_processes: Dict[str, float] = {}
        now = time.time()

        for d in range(dev_count.value):
            p_dev = c_void_p()
            _call_com_method(p_device_col, 4, ctypes.c_long, [c_uint, POINTER(c_void_p)], d, byref(p_dev))

            # Query endpoint master meter
            p_meter = c_void_p()
            _call_com_method(p_dev, 3, ctypes.c_long, [POINTER(GUID), c_uint, c_void_p, POINTER(c_void_p)], byref(IID_IAudioMeterInformation), 1, None, byref(p_meter))
            if p_meter.value:
                ep_peak = c_float(0.0)
                _call_com_method(p_meter, 3, ctypes.c_long, [POINTER(c_float)], byref(ep_peak))
                _call_com_method(p_meter, 2, ctypes.c_ulong, [])
                if ep_peak.value > max_master_peak:
                    max_master_peak = ep_peak.value

            # Query audio session manager
            p_mgr = c_void_p()
            hr_mgr = _call_com_method(p_dev, 3, ctypes.c_long, [POINTER(GUID), c_uint, c_void_p, POINTER(c_void_p)], byref(IID_IAudioSessionManager2), 1, None, byref(p_mgr))
            if hr_mgr == 0 and p_mgr.value:
                p_sess_enum = c_void_p()
                _call_com_method(p_mgr, 5, ctypes.c_long, [POINTER(c_void_p)], byref(p_sess_enum))
                if p_sess_enum.value:
                    s_count = c_int(0)
                    _call_com_method(p_sess_enum, 3, ctypes.c_long, [POINTER(c_int)], byref(s_count))
                    for s in range(s_count.value):
                        p_sess = c_void_p()
                        _call_com_method(p_sess_enum, 4, ctypes.c_long, [c_int, POINTER(c_void_p)], s, byref(p_sess))

                        # Query IAudioSessionControl2 for PID & system sound status
                        p_ctrl2 = c_void_p()
                        _call_com_method(p_sess, 0, ctypes.c_long, [POINTER(GUID), POINTER(c_void_p)], byref(IID_IAudioSessionControl2), byref(p_ctrl2))

                        pid = wintypes.DWORD(0)
                        is_system_sound = False
                        if p_ctrl2.value:
                            _call_com_method(p_ctrl2, 14, ctypes.c_long, [POINTER(wintypes.DWORD)], byref(pid))
                            is_sys_hr = _call_com_method(p_ctrl2, 15, ctypes.c_long, [])
                            if is_sys_hr == 0:
                                is_system_sound = True
                            _call_com_method(p_ctrl2, 2, ctypes.c_ulong, [])

                        # Query peak meter for this session
                        p_smeter = c_void_p()
                        _call_com_method(p_sess, 0, ctypes.c_long, [POINTER(GUID), POINTER(c_void_p)], byref(IID_IAudioMeterInformation), byref(p_smeter))
                        s_peak = c_float(0.0)
                        if p_smeter.value:
                            _call_com_method(p_smeter, 3, ctypes.c_long, [POINTER(c_float)], byref(s_peak))
                            _call_com_method(p_smeter, 2, ctypes.c_ulong, [])

                        _call_com_method(p_sess, 2, ctypes.c_ulong, [])

                        if pid.value > 0 and not is_system_sound:
                            proc_name = _get_process_name_by_pid(pid.value)
                            peak_val = max(0.0, float(s_peak.value))
                            session_peaks[proc_name] = max(session_peaks.get(proc_name, 0.0), peak_val)

                    _call_com_method(p_sess_enum, 2, ctypes.c_ulong, [])
                _call_com_method(p_mgr, 2, ctypes.c_ulong, [])
            _call_com_method(p_dev, 2, ctypes.c_ulong, [])

        _call_com_method(p_device_col, 2, ctypes.c_ulong, [])
        _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])

        # Update smoothing history for active playback detection (2.5 second smoothing window)
        with _audio_history_lock:
            for p_name, pk in session_peaks.items():
                if pk > 0.0001:
                    _process_last_audio_active[p_name] = now

            for p_name, last_ts in list(_process_last_audio_active.items()):
                # If audio was active within the last 2.5 seconds, consider it actively playing
                if (now - last_ts) <= 2.5:
                    current_pk = session_peaks.get(p_name, 0.0)
                    active_processes[p_name] = max(current_pk, 0.01)
                else:
                    # Stale active entry, remove
                    _process_last_audio_active.pop(p_name, None)

        is_audio_active = len(active_processes) > 0 or max_master_peak > 0.001

        return {
            "master_peak": max_master_peak,
            "is_any_audio_active": is_audio_active,
            "active_processes": active_processes,
            "all_session_peaks": session_peaks
        }
    except Exception:
        return {
            "master_peak": 0.0,
            "is_any_audio_active": False,
            "active_processes": {},
            "all_session_peaks": {}
        }
    finally:
        ole32.CoUninitialize()

# ==============================================================================
# 3. Known Media Players & Streaming Platforms Catalog
# ==============================================================================

MEDIA_PLAYER_PROCESSES = {
    "vlc.exe": "VLC Media Player",
    "mpv.exe": "MPV Player",
    "potplayer.exe": "PotPlayer",
    "potplayermini64.exe": "PotPlayer",
    "potplayermini.exe": "PotPlayer",
    "mpc-hc.exe": "Media Player Classic",
    "mpc-hc64.exe": "Media Player Classic",
    "mpc-be.exe": "MPC-BE",
    "mpc-be64.exe": "MPC-BE",
    "wmplayer.exe": "Windows Media Player",
    "spotify.exe": "Spotify",
    "foobar2000.exe": "foobar2000",
    "aimp.exe": "AIMP",
    "kmplayer.exe": "KMPlayer",
    "kmplayer64.exe": "KMPlayer",
    "gom.exe": "GOM Player",
    "gom64.exe": "GOM Player",
    "music.ui.exe": "Windows Media Player",
    "video.ui.exe": "Windows Films & TV",
    "itunes.exe": "Apple iTunes",
    "kodi.exe": "Kodi Media Center",
    "stremio.exe": "Stremio",
    "plex.exe": "Plex Media Player",
    "plexmediaplayer.exe": "Plex Media Player",
    "audacity.exe": "Audacity",
    "bsplayer.exe": "BSPlayer"
}

BROWSER_PROCESSES = {
    "chrome.exe": "Google Chrome",
    "msedge.exe": "Microsoft Edge",
    "firefox.exe": "Mozilla Firefox",
    "brave.exe": "Brave Browser",
    "opera.exe": "Opera Browser",
    "opera_gx.exe": "Opera GX",
    "vivaldi.exe": "Vivaldi",
    "arc.exe": "Arc Browser",
    "waterfox.exe": "Waterfox"
}

# Substrings in window titles indicating video or audio media candidate tabs
MEDIA_TITLE_PATTERNS = [
    re.compile(r"-\s*youtube\b", re.IGNORECASE),
    re.compile(r"\byoutube\s*-", re.IGNORECASE),
    re.compile(r"\bnetflix\b", re.IGNORECASE),
    re.compile(r"\btwitch\b", re.IGNORECASE),
    re.compile(r"\bprime\s*video\b", re.IGNORECASE),
    re.compile(r"\bdisney\+\b", re.IGNORECASE),
    re.compile(r"\bhotstar\b", re.IGNORECASE),
    re.compile(r"\bjiocinema\b", re.IGNORECASE),
    re.compile(r"\bhulu\b", re.IGNORECASE),
    re.compile(r"\bcrunchyroll\b", re.IGNORECASE),
    re.compile(r"\bdailymotion\b", re.IGNORECASE),
    re.compile(r"\bvimeo\b", re.IGNORECASE),
    re.compile(r"\bspotify\b", re.IGNORECASE),
    re.compile(r"\bsoundcloud\b", re.IGNORECASE),
    re.compile(r"\bapple\s*music\b", re.IGNORECASE),
    re.compile(r"\bdeezer\b", re.IGNORECASE),
    re.compile(r"\btidal\b", re.IGNORECASE),
    re.compile(r"\bzoom\s*meeting\b", re.IGNORECASE),
    re.compile(r"\bgoogle\s*meet\b", re.IGNORECASE),
    re.compile(r"\bmicrosoft\s*teams\b", re.IGNORECASE),
    re.compile(r"\bplaying\b", re.IGNORECASE),
    re.compile(r"\bvideo\s*player\b", re.IGNORECASE),
    re.compile(r"\.mp4\b|\.mkv\b|\.avi\b|\.mov\b|\.webm\b|\.mp3\b|\.flac\b|\.wav\b|\.m4v\b|\.ts\b|\.wmv\b", re.IGNORECASE)
]

# ==============================================================================
# 4. User Input (Keyboard & Mouse) Tracking
# ==============================================================================

def get_user_idle_seconds() -> float:
    """
    Computes exact elapsed seconds since the last physical keyboard or mouse event
    using Win32 GetLastInputInfo.
    """
    lii = LASTINPUTINFO()
    lii.cbSize = sizeof(LASTINPUTINFO)
    if not user32.GetLastInputInfo(byref(lii)):
        return 0.0

    tick_now = kernel32.GetTickCount64()
    tick_32 = tick_now & 0xFFFFFFFF
    elapsed_ms = tick_32 - lii.dwTime
    if elapsed_ms < 0:
        elapsed_ms += 0x100000000

    return max(0.0, elapsed_ms / 1000.0)

# ==============================================================================
# 5. Process & Window Scanner (Foreground & Background)
# ==============================================================================

def scan_candidate_media_windows() -> List[Dict[str, Any]]:
    """
    Scans running processes and top-level window titles using tasklist /v /fo csv.
    Gathers candidate media players and browser windows.
    """
    candidates: List[Dict[str, Any]] = []

    try:
        proc = subprocess.run(
            ["tasklist", "/v", "/fo", "csv"],
            capture_output=True,
            text=True,
            errors="replace",
            timeout=5.0
        )
        if proc.returncode != 0 or not proc.stdout:
            return candidates

        reader = csv.DictReader(io.StringIO(proc.stdout))
        for row in reader:
            image_name = (row.get("Image Name") or "").strip().lower()
            pid_str = (row.get("PID") or "").strip()
            window_title = (row.get("Window Title") or "").strip()
            status = (row.get("Status") or "").strip()

            if not window_title or window_title.upper() == "N/A" or window_title.lower() == "olemainthreadwndname":
                continue

            # 1. Dedicated Media Players
            if image_name in MEDIA_PLAYER_PROCESSES:
                candidates.append({
                    "category": "MEDIA_PLAYER",
                    "app_name": MEDIA_PLAYER_PROCESSES[image_name],
                    "process": image_name,
                    "pid": pid_str,
                    "title": window_title,
                    "status": status
                })
                continue

            # 2. Web Browsers
            if image_name in BROWSER_PROCESSES:
                browser_name = BROWSER_PROCESSES[image_name]
                for pattern in MEDIA_TITLE_PATTERNS:
                    if pattern.search(window_title):
                        candidates.append({
                            "category": "BROWSER_MEDIA",
                            "app_name": browser_name,
                            "process": image_name,
                            "pid": pid_str,
                            "title": window_title,
                            "status": status
                        })
                        break

    except Exception:
        pass

    return candidates

# ==============================================================================
# 6. Foreground Window & Fullscreen State Inspection
# ==============================================================================

def get_foreground_window_info() -> Dict[str, Any]:
    """Inspects current foreground window: title, pid, and fullscreen status."""
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return {"hwnd": 0, "title": "", "pid": 0, "is_fullscreen": False}

    length = user32.GetWindowTextLengthW(hwnd)
    title = ""
    if length > 0:
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value

    pid = wintypes.DWORD(0)
    user32.GetWindowThreadProcessId(hwnd, byref(pid))

    rect = RECT()
    is_fullscreen = False
    if user32.GetWindowRect(hwnd, byref(rect)):
        screen_w = user32.GetSystemMetrics(SM_CXSCREEN)
        screen_h = user32.GetSystemMetrics(SM_CYSCREEN)
        width = rect.right - rect.left
        height = rect.bottom - rect.top
        if width >= screen_w and height >= screen_h and rect.left <= 0 and rect.top <= 0:
            is_fullscreen = True

    return {
        "hwnd": hwnd,
        "title": title,
        "pid": pid.value,
        "is_fullscreen": is_fullscreen
    }

# ==============================================================================
# 7. Background Scanner Worker for Rapid Loop Refresh
# ==============================================================================

_candidate_cache: List[Dict[str, Any]] = []
_cache_lock = threading.Lock()
_background_scanner_stop_event = threading.Event()
_background_scanner_started = False

def _background_scanner_worker(interval: float = 2.5):
    """Refreshes candidate media window titles periodically."""
    global _candidate_cache
    while not _background_scanner_stop_event.is_set():
        try:
            candidates = scan_candidate_media_windows()
            with _cache_lock:
                _candidate_cache = candidates
        except Exception:
            pass
        _background_scanner_stop_event.wait(interval)

def start_background_scanner(interval: float = 2.5):
    """Starts the candidate window scanner thread without blocking main thread."""
    global _background_scanner_started
    if not _background_scanner_started:
        _background_scanner_started = True
        _background_scanner_stop_event.clear()
        t = threading.Thread(target=_background_scanner_worker, args=(interval,), daemon=True)
        t.start()

def stop_background_scanner():
    """Signals background scanner to stop."""
    _background_scanner_stop_event.set()

# ==============================================================================
# 8. Core Evaluation Engine: True Active Playback & Idle State
# ==============================================================================

def evaluate_system_idle_state(idle_threshold: float = 30.0,
                               activity_recent_threshold: float = 8.0,
                               use_cache: bool = False) -> Dict[str, Any]:
    """
    Performs definitive idle state evaluation:
      1. Physical user input activity (mouse & keyboard).
      2. Windows Core Audio API (WASAPI) audio metering:
         - Verifies if any candidate media app (Chrome, Edge, VLC, Spotify, etc.)
           is ACTUALLY outputting audio.
         - If video is PAUSED (audio peak == 0.0), it is classified as IDLE!
         - Only when audio is actively playing, it is flagged as IN USE.
      3. Foreground fullscreen states.
    """
    user_idle_seconds = get_user_idle_seconds()

    # Retrieve candidate windows (cached or live)
    if use_cache and _background_scanner_started:
        with _cache_lock:
            candidates = list(_candidate_cache)
    else:
        candidates = scan_candidate_media_windows()

    # Query real-time WASAPI audio levels (sub-millisecond COM query)
    audio_state = get_live_wasapi_audio_state()
    active_audio_procs = audio_state.get("active_processes", {})
    master_peak = audio_state.get("master_peak", 0.0)

    foreground = get_foreground_window_info()

    # Correlate candidates with live audio output
    actively_playing_media: List[Dict[str, Any]] = []
    paused_media: List[Dict[str, Any]] = []

    matched_active_procs = set()

    for item in candidates:
        proc = item.get("process", "").lower()
        peak = active_audio_procs.get(proc, 0.0)

        # Check if process has active audio
        if peak > 0.0001:
            item_copy = dict(item)
            item_copy["peak"] = peak
            item_copy["playback_status"] = "PLAYING"
            actively_playing_media.append(item_copy)
            matched_active_procs.add(proc)
        else:
            item_copy = dict(item)
            item_copy["peak"] = 0.0
            item_copy["playback_status"] = "PAUSED"
            paused_media.append(item_copy)

    # Check any active audio processes not matched by window title regex (e.g. background Spotify / streaming)
    for p_name, pk in active_audio_procs.items():
        if p_name not in matched_active_procs and (p_name in MEDIA_PLAYER_PROCESSES or p_name in BROWSER_PROCESSES):
            app_label = MEDIA_PLAYER_PROCESSES.get(p_name) or BROWSER_PROCESSES.get(p_name) or p_name
            actively_playing_media.append({
                "category": "AUDIO_STREAM",
                "app_name": app_label,
                "process": p_name,
                "pid": "N/A",
                "title": f"Active Audio Stream ({app_label})",
                "status": "Running",
                "peak": pk,
                "playback_status": "PLAYING"
            })
            matched_active_procs.add(p_name)

    # Contextual note about paused media if present
    paused_note_en = ""
    paused_note_hi = ""
    if paused_media:
        first_paused = paused_media[0]
        p_app = first_paused.get("app_name", "Media Player")
        paused_note_en = f" [Video is paused / silent in {p_app}]"
        paused_note_hi = f" [{p_app} में वीडियो पॉज/शांत है]"

    # --------------------------------------------------------------------------
    # Decision Matrix
    # --------------------------------------------------------------------------

    # 1. Recent Keyboard / Mouse Activity
    if user_idle_seconds < activity_recent_threshold:
        return {
            "is_idle": False,
            "condition": "BUSY",
            "reason_code": "USER_ACTIVE",
            "primary_reason": f"Windows is NOT in idle condition: User is using this PC (Keyboard/Mouse active {user_idle_seconds:.1f}s ago)",
            "hindi_reason": f"विंडोज इन यूज़ है: यूजर इस कंप्यूटर को सक्रिय रूप से यूज़ कर रहा है (कीबोर्ड/माउस {user_idle_seconds:.1f}s पहले सक्रिय था)",
            "user_idle_seconds": user_idle_seconds,
            "idle_threshold": idle_threshold,
            "media_playing": False,
            "actively_playing_media": actively_playing_media,
            "paused_media": paused_media,
            "foreground": foreground,
            "audio_state": audio_state
        }

    # 2. True Active Media Playback Detected
    if actively_playing_media:
        first_active = actively_playing_media[0]
        app_name = first_active.get("app_name", "Application")
        title = first_active.get("title", "")
        pk = first_active.get("peak", 0.0)

        title_display = f" ('{title}')" if title else ""
        return {
            "is_idle": False,
            "condition": "BUSY",
            "reason_code": "MEDIA_PLAYING",
            "primary_reason": f"Windows is NOT in idle condition: Video/Audio is actively playing in {app_name}{title_display}",
            "hindi_reason": f"विंडोज इन यूज़ है: {app_name} में वीडियो/ऑडियो एक्टिवली प्ले हो रहा है{title_display}",
            "user_idle_seconds": user_idle_seconds,
            "idle_threshold": idle_threshold,
            "media_playing": True,
            "actively_playing_media": actively_playing_media,
            "paused_media": paused_media,
            "foreground": foreground,
            "audio_state": audio_state
        }

    # 3. User Inactivity Still Within Idle Buffer (< Threshold)
    if user_idle_seconds < idle_threshold:
        return {
            "is_idle": False,
            "condition": "BUSY",
            "reason_code": "IDLE_BUFFER_PENDING",
            "primary_reason": f"Windows is NOT in idle condition: User inactive for {user_idle_seconds:.1f}s (Waiting for {idle_threshold:.0f}s threshold){paused_note_en}",
            "hindi_reason": f"विंडोज इन यूज़ है: यूजर {user_idle_seconds:.1f}s से शांत है (आइडियल थ्रेशोल्ड {idle_threshold:.0f}s की प्रतीक्षा है){paused_note_hi}",
            "user_idle_seconds": user_idle_seconds,
            "idle_threshold": idle_threshold,
            "media_playing": False,
            "actively_playing_media": [],
            "paused_media": paused_media,
            "foreground": foreground,
            "audio_state": audio_state
        }

    # 4. Truly IDLE: User inactive >= threshold, and no active audio playing
    return {
        "is_idle": True,
        "condition": "IDLE",
        "reason_code": "SYSTEM_IDLE",
        "primary_reason": f"Windows IS in idle condition (Idle Duration: {user_idle_seconds:.1f}s / {idle_threshold:.0f}s){paused_note_en}",
        "hindi_reason": f"विंडोज आइडियल स्थिति में है (आइडियल समय: {user_idle_seconds:.1f}s / {idle_threshold:.0f}s){paused_note_hi}",
        "user_idle_seconds": user_idle_seconds,
        "idle_threshold": idle_threshold,
        "media_playing": False,
        "actively_playing_media": [],
        "paused_media": paused_media,
        "foreground": foreground,
        "audio_state": audio_state
    }

# ==============================================================================
# 9. UI Formatting & Terminal Presentation
# ==============================================================================

CLR_RESET   = "\033[0m"
CLR_BOLD    = "\033[1m"
CLR_RED     = "\033[91m"
CLR_GREEN   = "\033[92m"
CLR_YELLOW  = "\033[93m"
CLR_CYAN    = "\033[96m"
CLR_WHITE   = "\033[97m"

STD_OUTPUT_HANDLE = -11
ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004

def enable_windows_vt_mode() -> None:
    """Enables Win32 Virtual Terminal Processing for smooth ANSI rendering."""
    if sys.platform == "win32":
        try:
            os.system("")  # Initialize Windows terminal ANSI support
            h_out = kernel32.GetStdHandle(STD_OUTPUT_HANDLE)
            if h_out and h_out != -1:
                mode = wintypes.DWORD()
                if kernel32.GetConsoleMode(h_out, byref(mode)):
                    new_mode = mode.value | ENABLE_VIRTUAL_TERMINAL_PROCESSING
                    kernel32.SetConsoleMode(h_out, new_mode)
        except Exception:
            pass

def hide_cursor() -> None:
    """Hides console cursor to eliminate blinking cursor artifacts."""
    try:
        sys.stdout.write("\033[?25l")
        sys.stdout.flush()
    except Exception:
        pass

def show_cursor() -> None:
    """Restores console cursor visibility."""
    try:
        sys.stdout.write("\033[?25h")
        sys.stdout.flush()
    except Exception:
        pass

# Ensure console cursor is always restored on process termination
atexit.register(show_cursor)

def render_state_banner(result: Dict[str, Any], in_place: bool = False) -> str:
    """Renders formatted ASCII/ANSI status dashboard banner."""
    lines = []
    is_idle = result.get("is_idle", False)
    primary_reason = result.get("primary_reason", "")
    hindi_reason = result.get("hindi_reason", "")
    idle_sec = result.get("user_idle_seconds", 0.0)
    threshold = result.get("idle_threshold", 30.0)
    active_media = result.get("actively_playing_media", [])
    paused_media = result.get("paused_media", [])
    audio_state = result.get("audio_state", {})
    master_peak = audio_state.get("master_peak", 0.0)

    lines.append("=" * 76)
    if is_idle:
        lines.append(f"{CLR_GREEN}{CLR_BOLD}  [OK / IDLE] WINDOWS IS IN IDLE CONDITION{CLR_RESET}")
    else:
        lines.append(f"{CLR_RED}{CLR_BOLD}  [IN USE / BUSY] WINDOWS IS NOT IN IDLE CONDITION{CLR_RESET}")
    lines.append("=" * 76)

    color = CLR_GREEN if is_idle else CLR_YELLOW
    lines.append(f"  {CLR_BOLD}English Verdict:{CLR_RESET}  {color}{primary_reason}{CLR_RESET}")
    lines.append(f"  {CLR_BOLD}Hindi Verdict:  {CLR_RESET}  {color}{hindi_reason}{CLR_RESET}")
    lines.append("-" * 76)

    # Detailed Telemetry
    lines.append(f"  * Keyboard / Mouse Inactivity : {CLR_CYAN}{idle_sec:.1f} seconds{CLR_RESET} (Threshold: {threshold:.0f}s)")

    if active_media:
        lines.append(f"  * Active Audio/Video Playback : {CLR_RED}ACTIVELY PLAYING ({len(active_media)} stream){CLR_RESET}")
        for m in active_media:
            lines.append(f"    - {CLR_BOLD}{m.get('app_name')}{CLR_RESET}: {m.get('title')} (Peak Audio: {m.get('peak', 0.0):.3f})")
    else:
        lines.append(f"  * Active Audio/Video Playback : {CLR_GREEN}None (Audio Silent / Master Peak: {master_peak:.4f}){CLR_RESET}")

    if paused_media:
        lines.append(f"  * Paused Media Windows        : {CLR_YELLOW}{len(paused_media)} paused/silent stream(s) [TREATED AS IDLE]{CLR_RESET}")
        for p in paused_media[:2]:
            lines.append(f"    - {CLR_BOLD}{p.get('app_name')}{CLR_RESET}: {p.get('title')}")

    lines.append("=" * 76)
    if in_place:
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)

# ==============================================================================
# 10. Execution Modes: Single-Check & Live Monitoring Loop
# ==============================================================================

def run_single_check(threshold: float, json_output: bool) -> int:
    """Executes a single evaluation check and returns standard exit code."""
    res = evaluate_system_idle_state(idle_threshold=threshold)
    if json_output:
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        print(render_state_banner(res, in_place=False))
    return 0 if res.get("is_idle") else 1

def run_monitoring_loop(threshold: float, interval: float):
    """Executes continuous real-time terminal UI loop with flicker-free in-place rendering."""
    enable_windows_vt_mode()

    # Clear console screen ONCE on initial startup and hide blinking cursor
    sys.stdout.write("\033[2J\033[H")
    hide_cursor()
    sys.stdout.flush()

    start_background_scanner(interval=max(1.5, interval))

    try:
        while True:
            # 1. Calculate state BEFORE touching the screen buffer
            res = evaluate_system_idle_state(idle_threshold=threshold, use_cache=True)
            banner = render_state_banner(res, in_place=True)

            # 2. Build full frame in memory: reposition cursor to (1,1) via \033[H without \033[2J
            frame_lines = [
                f"\033[H{CLR_CYAN}{CLR_BOLD}Windows Idle & True Media Sentinel (Live Telemetry){CLR_RESET}\033[K",
                f"Idle Threshold: {threshold:.0f}s | Poll Interval: {interval:.1f}s | Press Ctrl+C to exit.\033[K",
                banner,
                f"  {CLR_WHITE}Press Ctrl+C to stop monitoring.{CLR_RESET}\033[K\n\033[J"
            ]
            frame = "\n".join(frame_lines)

            # 3. Single atomic write to stdout - Zero screen erase, Zero flicker
            sys.stdout.write(frame)
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    finally:
        # Restore cursor visibility and stop background scanner
        show_cursor()
        stop_background_scanner()
        print(f"\n{CLR_YELLOW}[SENTINEL] Idle monitoring stopped by user.{CLR_RESET}\n")

# ==============================================================================
# 11. Main CLI Entry Point (Default: Live Monitoring Loop)
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Windows Idle & True Active Media Playback Sentinel",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Usage:
  python Win App Tracker.py                  (Directly launches live sentinel loop)
  python Win App Tracker.py --check-once     (Runs single evaluation and exits)
  python Win App Tracker.py --threshold 60   (Sets custom idle threshold in seconds)
        """
    )
    parser.add_argument(
        "--check-once",
        action="store_true",
        help="Run evaluation once and exit (Exit code 0: Idle, Exit code 1: In use)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=30.0,
        help="Idle threshold in seconds (default: 30.0)"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Monitoring poll interval in seconds (default: 1.0)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output structured JSON payload"
    )

    args = parser.parse_args()

    # Enable ANSI terminal colors & VT processing in Windows console
    enable_windows_vt_mode()

    if args.check_once:
        code = run_single_check(threshold=args.threshold, json_output=args.json)
        sys.exit(code)
    else:
        # Default directly to running the live monitoring loop!
        run_monitoring_loop(threshold=args.threshold, interval=args.interval)

if __name__ == "__main__":
    main()
