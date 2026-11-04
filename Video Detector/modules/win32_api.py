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


def resolve_uwp_real_process(hwnd: int) -> Tuple[Optional[int], Optional[str]]:
    """
    For UWP apps framed inside ApplicationFrameHost.exe (e.g. Modern Windows Media Player,
    Films & TV, Groove Music), enumerates child windows to locate the actual hosted UWP process.
    Caches results per hwnd to avoid redundant child enumeration.
    """
    if hwnd in _uwp_cache:
        cpid, cpname = _uwp_cache[hwnd]
        if _get_process_name_by_pid(cpid) == cpname:
            return cpid, cpname
        else:
            _uwp_cache.pop(hwnd, None)

    result = [None, None]

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
    user32.EnumChildWindows(hwnd, child_proc, 0)
    if result[0] and result[1]:
        _uwp_cache[hwnd] = (result[0], result[1])
    return result[0], result[1]


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
