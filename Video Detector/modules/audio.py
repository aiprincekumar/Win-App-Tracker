# -*- coding: utf-8 -*-
"""
modules/audio.py: Windows Core Audio API (WASAPI) COM Interface & Peak Metering Subsystem.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import time
import threading
import ctypes
from ctypes import wintypes, byref, POINTER, c_float, c_int, c_uint, c_void_p
from typing import Dict, Any

from .win32_api import (
    ole32,
    GUID,
    CLSID_MMDeviceEnumerator,
    IID_IMMDeviceEnumerator,
    IID_IAudioSessionManager2,
    IID_IAudioSessionControl2,
    IID_IAudioMeterInformation,
    _call_com_method,
    _get_process_name_by_pid
)

# Audio peak smoothing state (2.5 second window to handle short pauses / silent scenes in movies)
_audio_history_lock = threading.Lock()
_process_last_audio_active: Dict[str, float] = {}


def get_live_wasapi_audio_state() -> Dict[str, Any]:
    """
    Directly queries Windows Core Audio API (WASAPI) COM interfaces for active audio sessions.
    Returns dictionary with active audio process names and peak audio levels.
    Operates under process-wide Multithreaded COM (MTA) without per-frame apartment switching.
    """
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
            return {"master_peak": 0.0, "active_processes": {}, "all_session_peaks": {}}

        # EnumAudioEndpoints(eRender=0, DEVICE_STATE_ACTIVE=1, &pDevices)
        p_device_col = c_void_p()
        hr = _call_com_method(p_enumerator, 3, ctypes.c_long, [c_int, wintypes.DWORD, POINTER(c_void_p)], 0, 1, byref(p_device_col))
        if hr != 0 or not p_device_col.value:
            _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])
            return {"master_peak": 0.0, "active_processes": {}, "all_session_peaks": {}}

        dev_count = c_uint(0)
        _call_com_method(p_device_col, 3, ctypes.c_long, [POINTER(c_uint)], byref(dev_count))

        session_peaks: Dict[str, float] = {}
        active_processes: Dict[str, float] = {}
        max_master_peak = 0.0

        for d in range(dev_count.value):
            p_dev = c_void_p()
            _call_com_method(p_device_col, 4, ctypes.c_long, [c_uint, POINTER(c_void_p)], d, byref(p_dev))

            # Query master meter for this endpoint
            p_meter = c_void_p()
            _call_com_method(p_dev, 3, ctypes.c_long, [POINTER(GUID), wintypes.DWORD, c_void_p, POINTER(c_void_p)], byref(IID_IAudioMeterInformation), 1, None, byref(p_meter))
            if p_meter.value:
                peak = c_float(0.0)
                _call_com_method(p_meter, 3, ctypes.c_long, [POINTER(c_float)], byref(peak))
                max_master_peak = max(max_master_peak, float(peak.value))
                _call_com_method(p_meter, 2, ctypes.c_ulong, [])

            # Activate IAudioSessionManager2
            p_mgr = c_void_p()
            _call_com_method(p_dev, 3, ctypes.c_long, [POINTER(GUID), wintypes.DWORD, c_void_p, POINTER(c_void_p)], byref(IID_IAudioSessionManager2), 1, None, byref(p_mgr))
            if p_mgr.value:
                p_sess_enum = c_void_p()
                _call_com_method(p_mgr, 5, ctypes.c_long, [POINTER(c_void_p)], byref(p_sess_enum))
                if p_sess_enum.value:
                    s_count = c_int(0)
                    _call_com_method(p_sess_enum, 3, ctypes.c_long, [POINTER(c_int)], byref(s_count))
                    for s in range(s_count.value):
                        p_sess = c_void_p()
                        _call_com_method(p_sess_enum, 4, ctypes.c_long, [c_int, POINTER(c_void_p)], s, byref(p_sess))

                        # Query IAudioSessionControl2 for PID
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
                if (now - last_ts) <= 2.5:
                    current_pk = session_peaks.get(p_name, 0.0)
                    active_processes[p_name] = max(current_pk, 0.01)
                else:
                    _process_last_audio_active.pop(p_name, None)

        return {
            "master_peak": max_master_peak,
            "active_processes": active_processes,
            "all_session_peaks": session_peaks
        }
    except Exception:
        return {
            "master_peak": 0.0,
            "active_processes": {},
            "all_session_peaks": {}
        }
