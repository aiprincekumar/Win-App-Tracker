# -*- coding: utf-8 -*-
"""
modules/win32_api.py: Win32 API bindings, COM vtable dispatchers, and process helpers.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import sys
import os
import time
import atexit
import ctypes
from ctypes import wintypes, Structure, sizeof, byref, POINTER, c_void_p
from typing import Dict, Tuple, Optional, Any, List

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32
ole32 = ctypes.windll.ole32

try:
    dwmapi = ctypes.windll.dwmapi
except Exception:
    dwmapi = None

DWMWA_CLOAKED = 14

def is_window_cloaked(hwnd: int) -> bool:
    """
    Returns True if the window is cloaked (e.g. on an inactive virtual desktop,
    or a suspended UWP window hidden from view).
    """
    if not hwnd or hwnd <= 0 or not dwmapi:
        return False
    try:
        cloaked = wintypes.DWORD(0)
        hr = dwmapi.DwmGetWindowAttribute(
            wintypes.HWND(hwnd),
            wintypes.DWORD(DWMWA_CLOAKED),
            byref(cloaked),
            sizeof(cloaked)
        )
        return hr == 0 and cloaked.value != 0
    except Exception:
        return False


PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
COINIT_MULTITHREADED = 0x2
STD_OUTPUT_HANDLE = -11
ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004

# Initialize COM once as Multithreaded (MTA) at process startup
# Eliminates per-call CoInitialize/CoUninitialize overhead and prevents STA RPC deadlocks with audiosrv
_com_init_hr = ole32.CoInitializeEx(None, COINIT_MULTITHREADED)
if _com_init_hr in (0, 1):  # S_OK (0) or S_FALSE (1)
    atexit.register(ole32.CoUninitialize)

# Function prototype signatures for 64-bit safety
WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

user32.EnumWindows.argtypes = [WNDENUMPROC, wintypes.LPARAM]
user32.EnumWindows.restype = wintypes.BOOL

user32.EnumChildWindows.argtypes = [wintypes.HWND, WNDENUMPROC, wintypes.LPARAM]
user32.EnumChildWindows.restype = wintypes.BOOL

user32.FindWindowExW.argtypes = [wintypes.HWND, wintypes.HWND, wintypes.LPCWSTR, wintypes.LPCWSTR]
user32.FindWindowExW.restype = wintypes.HWND

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

user32.GetWindowRect.argtypes = [wintypes.HWND, POINTER(wintypes.RECT)]
user32.GetWindowRect.restype = wintypes.BOOL

class MONITORINFO(Structure):
    _fields_ = [
        ("cbSize", wintypes.DWORD),
        ("rcMonitor", wintypes.RECT),
        ("rcWork", wintypes.RECT),
        ("dwFlags", wintypes.DWORD),
    ]

user32.MonitorFromWindow.argtypes = [wintypes.HWND, wintypes.DWORD]
user32.MonitorFromWindow.restype = wintypes.HMONITOR

user32.GetMonitorInfoW.argtypes = [wintypes.HMONITOR, POINTER(MONITORINFO)]
user32.GetMonitorInfoW.restype = wintypes.BOOL

user32.IsIconic.argtypes = [wintypes.HWND]
user32.IsIconic.restype = wintypes.BOOL

user32.GetWindowLongW.argtypes = [wintypes.HWND, ctypes.c_int]
user32.GetWindowLongW.restype = wintypes.LONG

MONITOR_DEFAULTTONEAREST = 2
GWL_STYLE = -16
WS_POPUP = 0x80000000
WS_CAPTION = 0x00C00000
WS_THICKFRAME = 0x00040000



# ==============================================================================
# COM Interface Definitions & Helpers
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
IID_IAudioEndpointVolume   = _make_guid("{5CDF2C82-841E-4546-9722-0CF74078229A}")
IID_ISimpleAudioVolume     = _make_guid("{87CE5498-68D6-44E5-9215-6DA47EF883D8}")


def _call_com_method(this_ptr: c_void_p, vtable_index: int, restype: Any, argtypes: List[Any], *args) -> Any:
    """Dispatches a direct COM vtable method call."""
    vtable = ctypes.cast(this_ptr, POINTER(POINTER(c_void_p))).contents
    fn = ctypes.WINFUNCTYPE(restype, c_void_p, *argtypes)(vtable[vtable_index])
    return fn(this_ptr, *args)


_proc_name_cache: Dict[int, Tuple[float, str]] = {}


def _get_process_name_by_pid(pid: int) -> str:
    """Resolves a process ID to its executable image name using Win32 API with caching."""
    if pid <= 0:
        return "System"
    now = time.time()
    if pid in _proc_name_cache:
        ts, name = _proc_name_cache[pid]
        if (now - ts) < 5.0:
            return name

    h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
    if not h_proc:
        return f"PID:{pid}"
    try:
        buf_len = wintypes.DWORD(1024)
        buf = ctypes.create_unicode_buffer(buf_len.value)
        if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf, byref(buf_len)):
            name = os.path.basename(buf.value).lower()
            _proc_name_cache[pid] = (now, name)
            return name
        return f"PID:{pid}"
    finally:
        kernel32.CloseHandle(h_proc)


_uwp_cache: Dict[int, Tuple[int, str]] = {}


def reset_uwp_cache() -> None:
    """Clears the cached UWP window process resolutions for testing isolation."""
    global _uwp_cache
    _uwp_cache.clear()


def resolve_uwp_real_process(hwnd: int, title: Optional[str] = None) -> Tuple[Optional[int], Optional[str]]:
    """
    For UWP apps framed inside ApplicationFrameHost.exe (e.g. Modern Windows Media Player,
    Films & TV, Groove Music), robustly locates the actual hosted UWP process:
      1. Direct query via user32.FindWindowExW for 'Windows.UI.Core.CoreWindow'.
      2. Child enumeration via user32.EnumChildWindows searching for hosted process != ApplicationFrameHost.exe.
      3. Window title inspection and psutil process correlation fallback (Films & TV -> video.ui.exe).
    Caches results per hwnd to avoid redundant child enumeration.
    """
    if hwnd in _uwp_cache:
        cpid, cpname = _uwp_cache[hwnd]
        if _get_process_name_by_pid(cpid) == cpname:
            return cpid, cpname
        else:
            _uwp_cache.pop(hwnd, None)

    result = [None, None]

    # 1. Direct FindWindowExW query for Windows.UI.Core.CoreWindow child
    try:
        core_hwnd = user32.FindWindowExW(hwnd, 0, ctypes.c_wchar_p("Windows.UI.Core.CoreWindow"), None)
        if core_hwnd:
            cpid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(core_hwnd, byref(cpid))
            if cpid.value:
                cpname = _get_process_name_by_pid(cpid.value)
                if cpname and cpname != "applicationframehost.exe":
                    result[0] = cpid.value
                    result[1] = cpname
    except Exception:
        pass

    # 2. EnumChildWindows traversal if direct lookup didn't find hosted process
    if not result[0] or not result[1]:
        def child_cb(chwnd, lparam):
            cpid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(chwnd, byref(cpid))
            if cpid.value:
                cpname = _get_process_name_by_pid(cpid.value)
                if cpname and cpname != "applicationframehost.exe":
                    result[0] = cpid.value
                    result[1] = cpname
                    return False  # Stop enumeration once real process is found
            return True

        child_proc = WNDENUMPROC(child_cb)
        try:
            user32.EnumChildWindows(hwnd, child_proc, 0)
        except Exception:
            pass

    # 3. Fallback: inspect title or window text and correlate with psutil
    if not result[1]:
        t_text = title
        if not t_text and hwnd:
            try:
                length = user32.GetWindowTextLengthW(hwnd)
                if length > 0:
                    buf = ctypes.create_unicode_buffer(length + 1)
                    user32.GetWindowTextW(hwnd, buf, length + 1)
                    t_text = buf.value.strip()
            except Exception:
                pass

        if t_text:
            t_low = t_text.lower()
            target_proc = None
            if any(k in t_low for k in ["films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video.ui"]) or ("films" in t_low and "tv" in t_low):
                target_proc = "video.ui.exe"
            elif "media player" in t_low or "groove music" in t_low or t_low in ("music library", "video library", "play queue", "home", "settings"):
                target_proc = "microsoft.media.player.exe"

            if target_proc:
                result[1] = target_proc
                try:
                    import psutil
                    for p in psutil.process_iter(['pid', 'name']):
                        if p.info['name'].lower() == target_proc:
                            result[0] = p.info['pid']
                            break
                except Exception:
                    pass

        # 4. Check SMTC session title match or open media files for running UWP players
        if not result[1]:
            try:
                import psutil
                running_uwp = {}
                for p in psutil.process_iter(['pid', 'name']):
                    p_name = p.info['name'].lower()
                    if p_name in ('video.ui.exe', 'microsoft.media.player.exe'):
                        running_uwp[p_name] = p.info['pid']

                if running_uwp:
                    # Match against SMTC session titles
                    from .smtc import get_all_smtc_sessions
                    smtc_all = get_all_smtc_sessions()
                    for proc_name, s_data in smtc_all.items():
                        if proc_name in running_uwp:
                            s_title = (s_data.get('title') or '').lower()
                            if s_title and t_text and (s_title in t_text.lower() or t_text.lower() in s_title):
                                result[0] = running_uwp[proc_name]
                                result[1] = proc_name
                                break

                    # Match against open file handles of running UWP media players
                    if not result[1] and t_text:
                        for proc_name, p_pid in running_uwp.items():
                            try:
                                proc_obj = psutil.Process(p_pid)
                                for of in proc_obj.open_files():
                                    bname = os.path.basename(of.path).lower()
                                    if bname and (bname in t_text.lower() or t_text.lower() in bname):
                                        result[0] = p_pid
                                        result[1] = proc_name
                                        break
                                if result[1]:
                                    break
                            except Exception:
                                pass
            except Exception:
                pass

    if result[0] and result[1]:
        _uwp_cache[hwnd] = (result[0], result[1])
    return result[0], result[1]


def enable_windows_vt_mode() -> None:
    """Enables Win32 Virtual Terminal Processing for smooth ANSI rendering."""
    if sys.platform == "win32":
        try:
            h_out = kernel32.GetStdHandle(STD_OUTPUT_HANDLE)
            if h_out and h_out != -1:
                mode = wintypes.DWORD()
                if kernel32.GetConsoleMode(h_out, byref(mode)):
                    new_mode = mode.value | ENABLE_VIRTUAL_TERMINAL_PROCESSING
                    kernel32.SetConsoleMode(h_out, new_mode)
        except Exception:
            pass


def inspect_window_presentation(hwnd: int) -> Dict[str, Any]:
    """
    Inspects window geometry, styles, and monitor bounding rectangle.
    Returns:
      {
        "mode": "FULLSCREEN_CINEMA" | "BORDERLESS_MAXIMIZED" | "WINDOWED" | "MINIMIZED",
        "width": int,
        "height": int,
        "monitor_res": str (e.g. "1920x1080")
      }
    """
    if not hwnd or hwnd <= 0:
        return {
            "mode": "WINDOWED",
            "width": 0,
            "height": 0,
            "monitor_res": "1920x1080"
        }

    try:
        if user32.IsIconic(hwnd):
            hmon = user32.MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST)
            mon_w, mon_h = 1920, 1080
            if hmon:
                mi = MONITORINFO()
                mi.cbSize = sizeof(MONITORINFO)
                if user32.GetMonitorInfoW(hmon, byref(mi)):
                    mon_w = mi.rcMonitor.right - mi.rcMonitor.left
                    mon_h = mi.rcMonitor.bottom - mi.rcMonitor.top
            return {
                "mode": "MINIMIZED",
                "width": 0,
                "height": 0,
                "monitor_res": f"{mon_w}x{mon_h}"
            }

        rect = wintypes.RECT()
        if not user32.GetWindowRect(hwnd, byref(rect)):
            return {
                "mode": "WINDOWED",
                "width": 0,
                "height": 0,
                "monitor_res": "1920x1080"
            }

        win_w = max(0, rect.right - rect.left)
        win_h = max(0, rect.bottom - rect.top)

        hmon = user32.MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST)
        mon_w, mon_h = 1920, 1080
        rc_mon = wintypes.RECT(0, 0, 1920, 1080)
        if hmon:
            mi = MONITORINFO()
            mi.cbSize = sizeof(MONITORINFO)
            if user32.GetMonitorInfoW(hmon, byref(mi)):
                rc_mon = mi.rcMonitor
                mon_w = rc_mon.right - rc_mon.left
                mon_h = rc_mon.bottom - rc_mon.top

        # Check if window covers the monitor
        covers_monitor = (
            rect.left <= rc_mon.left and
            rect.top <= rc_mon.top and
            rect.right >= rc_mon.right and
            rect.bottom >= rc_mon.bottom
        )

        style = user32.GetWindowLongW(hwnd, GWL_STYLE)
        has_caption = bool(style & WS_CAPTION)
        has_thickframe = bool(style & WS_THICKFRAME)
        is_popup = bool(style & WS_POPUP)

        if covers_monitor:
            if is_popup or (not has_caption and not has_thickframe):
                mode = "FULLSCREEN_CINEMA"
            else:
                mode = "BORDERLESS_MAXIMIZED"
        else:
            mode = "WINDOWED"

        return {
            "mode": mode,
            "width": win_w,
            "height": win_h,
            "monitor_res": f"{mon_w}x{mon_h}"
        }
    except Exception:
        return {
            "mode": "WINDOWED",
            "width": 0,
            "height": 0,
            "monitor_res": "1920x1080"
        }

