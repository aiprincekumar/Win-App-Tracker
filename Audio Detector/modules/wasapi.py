# -*- coding: utf-8 -*-
"""
wasapi.py: Low-Level COM vtable & Windows Core Audio API Session Metering.

Directly queries Windows Core Audio API (WASAPI) COM interfaces without external C++ DLLs
using pure ctypes. Supports master metering and per-session peak telemetry.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

import sys
import os
import time
import threading
import atexit
import ctypes
from ctypes import wintypes, Structure, byref, POINTER, c_float, c_int, c_uint, c_ulong, c_void_p
from typing import Dict, List, Tuple, Any, Optional

from .constants import PSUTIL_AVAILABLE

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore

ole32 = ctypes.windll.ole32 if sys.platform == "win32" else None
kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None

COINIT_MULTITHREADED = 0x2
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

# Initialize COM once as Multithreaded (MTA) at process startup
_com_init_hr = ole32.CoInitializeEx(None, COINIT_MULTITHREADED) if ole32 else None
if _com_init_hr in (0, 1):
    atexit.register(ole32.CoUninitialize)


def _resolve(name: str, fallback: Any) -> Any:
    """Checks if a symbol has been monkeypatched on root audio_detector module."""
    mod = sys.modules.get("audio_detector")
    if mod is not None and hasattr(mod, name):
        val = getattr(mod, name)
        if val is not None:
            return val
    return fallback


_proc_name_cache: Dict[int, Tuple[float, str]] = {}


def get_process_name_by_pid(pid: int) -> str:
    """Resolves PID to executable name using Win32 API or psutil with 5-second caching."""
    if pid <= 0:
        return "System"
    now = time.time()
    if pid in _proc_name_cache:
        ts, name = _proc_name_cache[pid]
        if (now - ts) < 5.0:
            return name

    name = ""
    is_psutil = _resolve("PSUTIL_AVAILABLE", PSUTIL_AVAILABLE)
    if is_psutil and psutil:
        try:
            name = psutil.Process(pid).name().lower()
        except Exception:
            pass
    if not name and kernel32:
        h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if h_proc:
            try:
                buf_len = wintypes.DWORD(1024)
                buf = ctypes.create_unicode_buffer(buf_len.value)
                if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf, byref(buf_len)):
                    name = os.path.basename(buf.value).lower()
            finally:
                kernel32.CloseHandle(h_proc)
    if not name:
        name = f"pid:{pid}"

    _proc_name_cache[pid] = (now, name)
    return name


_get_process_name_by_pid = get_process_name_by_pid


# ==============================================================================
# WASAPI COM Native Interface Definitions (Pure ctypes - 0 dependencies)
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
    if ole32:
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


# Audio peak smoothing state (2.0s window to handle brief musical rests or beat breaks)
_audio_history_lock = threading.Lock()
_process_last_audio_active: Dict[int, float] = {}


def get_live_wasapi_audio_state() -> Dict[str, Any]:
    """
    Directly queries Windows Core Audio API (WASAPI) COM interfaces for active audio sessions.
    Returns:
      {
        "master_peak": float,
        "active_pids": Dict[int, float],       # pid -> peak value
        "active_processes": Dict[str, float],  # proc_name -> peak value
        "pid_to_name": Dict[int, str]          # pid -> proc_name
      }
    """
    if not ole32:
        return {"master_peak": 0.0, "active_pids": {}, "active_processes": {}, "pid_to_name": {}}

    co_inited = False
    if _com_init_hr not in (0, 1):
        hr = ole32.CoInitializeEx(None, 0)
        co_inited = (hr in (0, 1))

    now = time.time()
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
            return {"master_peak": 0.0, "active_pids": {}, "active_processes": {}, "pid_to_name": {}}

        # EnumAudioEndpoints(eRender=0, DEVICE_STATE_ACTIVE=1, &pDevices)
        p_device_col = c_void_p()
        hr = _call_com_method(p_enumerator, 3, ctypes.c_long, [c_int, wintypes.DWORD, POINTER(c_void_p)], 0, 1, byref(p_device_col))
        if hr != 0 or not p_device_col.value:
            _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])
            return {"master_peak": 0.0, "active_pids": {}, "active_processes": {}, "pid_to_name": {}}

        dev_count = c_uint(0)
        _call_com_method(p_device_col, 3, ctypes.c_long, [POINTER(c_uint)], byref(dev_count))

        master_peak = 0.0
        active_pids: Dict[int, float] = {}
        active_processes: Dict[str, float] = {}
        pid_to_name: Dict[int, str] = {}

        for dev_idx in range(dev_count.value):
            p_device = c_void_p()
            hr = _call_com_method(p_device_col, 4, ctypes.c_long, [c_uint, POINTER(c_void_p)], dev_idx, byref(p_device))
            if hr != 0 or not p_device.value:
                continue

            # Query device endpoint peak
            p_endpoint_meter = c_void_p()
            hr = _call_com_method(
                p_device, 3, ctypes.c_long,
                [POINTER(GUID), wintypes.DWORD, c_void_p, POINTER(c_void_p)],
                byref(IID_IAudioMeterInformation), 1, None, byref(p_endpoint_meter)
            )
            if hr == 0 and p_endpoint_meter.value:
                peak_f = c_float(0.0)
                _call_com_method(p_endpoint_meter, 3, ctypes.c_long, [POINTER(c_float)], byref(peak_f))
                if peak_f.value > master_peak:
                    master_peak = float(peak_f.value)
                _call_com_method(p_endpoint_meter, 2, ctypes.c_ulong, [])

            # Activate session manager
            p_mgr = c_void_p()
            hr = _call_com_method(
                p_device, 3, ctypes.c_long,
                [POINTER(GUID), wintypes.DWORD, c_void_p, POINTER(c_void_p)],
                byref(IID_IAudioSessionManager2), 1, None, byref(p_mgr)
            )
            if hr != 0 or not p_mgr.value:
                _call_com_method(p_device, 2, ctypes.c_ulong, [])
                continue

            # GetSessionEnumerator
            p_sess_enum = c_void_p()
            hr = _call_com_method(p_mgr, 5, ctypes.c_long, [POINTER(c_void_p)], byref(p_sess_enum))
            if hr == 0 and p_sess_enum.value:
                sess_count = c_int(0)
                _call_com_method(p_sess_enum, 3, ctypes.c_long, [POINTER(c_int)], byref(sess_count))

                for s_idx in range(sess_count.value):
                    p_session = c_void_p()
                    hr = _call_com_method(p_sess_enum, 4, ctypes.c_long, [c_int, POINTER(c_void_p)], s_idx, byref(p_session))
                    if hr != 0 or not p_session.value:
                        continue

                    # Query IAudioSessionControl2 for PID
                    p_ctrl2 = c_void_p()
                    hr = _call_com_method(
                        p_session, 0, ctypes.c_long,
                        [POINTER(GUID), POINTER(c_void_p)],
                        byref(IID_IAudioSessionControl2), byref(p_ctrl2)
                    )
                    pid_val = 0
                    if hr == 0 and p_ctrl2.value:
                        c_pid = wintypes.DWORD(0)
                        _call_com_method(p_ctrl2, 14, ctypes.c_long, [POINTER(wintypes.DWORD)], byref(c_pid))
                        pid_val = int(c_pid.value)
                        _call_com_method(p_ctrl2, 2, ctypes.c_ulong, [])

                    # Query IAudioMeterInformation for peak
                    p_meter = c_void_p()
                    hr = _call_com_method(
                        p_session, 0, ctypes.c_long,
                        [POINTER(GUID), POINTER(c_void_p)],
                        byref(IID_IAudioMeterInformation), byref(p_meter)
                    )
                    sess_peak = 0.0
                    if hr == 0 and p_meter.value:
                        peak_val = c_float(0.0)
                        _call_com_method(p_meter, 3, ctypes.c_long, [POINTER(c_float)], byref(peak_val))
                        sess_peak = float(peak_val.value)
                        _call_com_method(p_meter, 2, ctypes.c_ulong, [])

                    _call_com_method(p_session, 2, ctypes.c_ulong, [])

                    if pid_val > 0:
                        proc_name = get_process_name_by_pid(pid_val)
                        pid_to_name[pid_val] = proc_name

                        with _audio_history_lock:
                            if sess_peak > 0.0001:
                                _process_last_audio_active[pid_val] = now
                            else:
                                last_active = _process_last_audio_active.get(pid_val, 0.0)
                                if (now - last_active) < 2.0:
                                    sess_peak = max(sess_peak, 0.05)

                        if sess_peak > 0.0001:
                            if pid_val not in active_pids or sess_peak > active_pids[pid_val]:
                                active_pids[pid_val] = sess_peak
                            if proc_name not in active_processes or sess_peak > active_processes[proc_name]:
                                active_processes[proc_name] = sess_peak

                _call_com_method(p_sess_enum, 2, ctypes.c_ulong, [])

            _call_com_method(p_mgr, 2, ctypes.c_ulong, [])
            _call_com_method(p_device, 2, ctypes.c_ulong, [])

        _call_com_method(p_device_col, 2, ctypes.c_ulong, [])
        _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])

        return {
            "master_peak": master_peak,
            "active_pids": active_pids,
            "active_processes": active_processes,
            "pid_to_name": pid_to_name
        }
    except Exception:
        return {"master_peak": 0.0, "active_pids": {}, "active_processes": {}, "pid_to_name": {}}
    finally:
        if co_inited and ole32:
            try:
                ole32.CoUninitialize()
            except Exception:
                pass
