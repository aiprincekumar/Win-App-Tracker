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
from dataclasses import dataclass
from typing import Dict, Any, Optional

from .win32_api import (
    ole32,
    GUID,
    CLSID_MMDeviceEnumerator,
    IID_IMMDeviceEnumerator,
    IID_IAudioSessionManager2,
    IID_IAudioSessionControl2,
    IID_IAudioMeterInformation,
    IID_IAudioEndpointVolume,
    IID_ISimpleAudioVolume,
    COINIT_MULTITHREADED,
    _call_com_method,
    _get_process_name_by_pid
)

def linear_scalar_to_slider_pct(scalar: float) -> int:
    """
    Converts Windows Core Audio ISimpleAudioVolume linear amplitude scalar (0.0 - 1.0)
    to Windows Volume Mixer perceptual slider percentage (0 - 100%).
    Windows Volume Mixer uses perceptual power curve: Scalar = (Slider / 100)^2.5.
    Inverting: Slider% = 100 * (Scalar)^(1/2.5) = 100 * (Scalar)^0.4.
    Matches exact Windows Volume Mixer UI:
      - Scalar 1.0 -> 100%
      - Scalar 0.487 -> 75%
      - Scalar 0.177 -> 50%
      - Scalar 0.031 -> 25%
      - Scalar 0.0 -> 0%
    """
    if scalar <= 0.0001:
        return 0
    if scalar >= 0.9999:
        return 100
    val = max(0.0, min(1.0, float(scalar)))
    pct = int(round(pow(val, 0.4) * 100.0))
    return max(0, min(100, pct))


@dataclass
class AudioVolumeState:
    master_volume_percent: int = 100
    master_volume_level: float = 1.0
    master_muted: bool = False
    is_master_muted: bool = False
    session_volume_percent: int = 100
    session_volume_level: float = 1.0
    session_muted: bool = False
    is_app_muted: bool = False
    app_volume_level: float = 1.0
    app_volume_pct: int = 100
    peak_amplitude: float = 0.0
    audio_peak_percent: int = 0

# Audio peak smoothing state (2.5 second window to handle short pauses / silent scenes in movies)
_audio_history_lock = threading.Lock()
_process_last_audio_active: Dict[str, float] = {}
_last_master_volume: int = 100
_last_master_muted: bool = False
_last_session_volumes: Dict[int, Dict[str, Any]] = {}
_last_process_volumes: Dict[str, Dict[str, Any]] = {}
_mock_audio_state: Optional[Dict[str, Any]] = None


def set_mock_audio_state(state: Optional[Dict[str, Any]]) -> None:
    """Helper for automated unit tests to mock WASAPI audio state."""
    global _mock_audio_state, _last_master_volume, _last_master_muted, _last_session_volumes, _last_process_volumes
    _mock_audio_state = state
    if state is not None:
        with _audio_history_lock:
            _last_master_volume = state.get("master_volume_percent", 100)
            _last_master_muted = state.get("master_muted", False)
            _last_session_volumes = dict(state.get("session_volumes", {}))
            _last_process_volumes = dict(state.get("process_volumes", {}))


def get_live_wasapi_audio_state() -> Dict[str, Any]:
    global _mock_audio_state
    if _mock_audio_state is not None:
        return dict(_mock_audio_state)
    """
    Directly queries Windows Core Audio API (WASAPI) COM interfaces for active audio sessions.
    Returns dictionary with active audio process names and peak audio levels.
    Operates under process-wide Multithreaded COM (MTA) without per-frame apartment switching.
    """
    now = time.time()
    try:
        # Guarantee MTA COM apartment initialization for calling thread (sensor_worker / background threads)
        ole32.CoInitializeEx(None, COINIT_MULTITHREADED)
    except Exception:
        pass
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

        # Directly query active default render endpoint (eRender=0, eConsole=0)
        # to obtain true master volume and mute status without looping overwrite
        curr_master_vol = 100
        curr_master_muted = False
        p_default_dev = c_void_p()
        hr_def = _call_com_method(
            p_enumerator, 4, ctypes.c_long,
            [c_int, c_int, POINTER(c_void_p)],
            0, 0, byref(p_default_dev)
        )
        if hr_def == 0 and p_default_dev.value:
            p_def_ep_vol = c_void_p()
            _call_com_method(
                p_default_dev, 3, ctypes.c_long,
                [POINTER(GUID), wintypes.DWORD, c_void_p, POINTER(c_void_p)],
                byref(IID_IAudioEndpointVolume), 1, None, byref(p_def_ep_vol)
            )
            if p_def_ep_vol.value:
                m_vol = c_float(1.0)
                m_mute = wintypes.BOOL(False)
                _call_com_method(p_def_ep_vol, 9, ctypes.c_long, [POINTER(c_float)], byref(m_vol))
                _call_com_method(p_def_ep_vol, 15, ctypes.c_long, [POINTER(wintypes.BOOL)], byref(m_mute))
                curr_master_vol = int(round(m_vol.value * 100))
                curr_master_muted = bool(m_mute.value)
                _call_com_method(p_def_ep_vol, 2, ctypes.c_ulong, [])
            _call_com_method(p_default_dev, 2, ctypes.c_ulong, [])
        else:
            # Fallback to pycaw AudioUtilities.GetSpeakers()
            try:
                from pycaw.pycaw import AudioUtilities
                spk = AudioUtilities.GetSpeakers()
                if spk and hasattr(spk, "EndpointVolume") and spk.EndpointVolume:
                    curr_master_vol = int(round(spk.EndpointVolume.GetMasterVolumeLevelScalar() * 100))
                    curr_master_muted = bool(spk.EndpointVolume.GetMute())
            except Exception:
                pass

        dev_count = c_uint(0)
        _call_com_method(p_device_col, 3, ctypes.c_long, [POINTER(c_uint)], byref(dev_count))

        session_peaks: Dict[str, float] = {}
        session_volumes: Dict[int, Dict[str, Any]] = {}
        process_volumes: Dict[str, Dict[str, Any]] = {}
        active_processes: Dict[str, float] = {}
        max_master_peak = 0.0
        global _last_master_volume, _last_master_muted, _last_session_volumes, _last_process_volumes

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

                        # Query per-session volume and mute
                        p_sm_vol = c_void_p()
                        _call_com_method(p_sess, 0, ctypes.c_long, [POINTER(GUID), POINTER(c_void_p)], byref(IID_ISimpleAudioVolume), byref(p_sm_vol))
                        s_vol_pct = 100
                        s_is_muted = False
                        if p_sm_vol.value:
                            sv = c_float(1.0)
                            sm = wintypes.BOOL(False)
                            _call_com_method(p_sm_vol, 4, ctypes.c_long, [POINTER(c_float)], byref(sv))
                            _call_com_method(p_sm_vol, 6, ctypes.c_long, [POINTER(wintypes.BOOL)], byref(sm))
                            s_vol_pct = linear_scalar_to_slider_pct(sv.value)
                            s_is_muted = bool(sm.value) or (s_vol_pct == 0)
                            _call_com_method(p_sm_vol, 2, ctypes.c_ulong, [])

                        _call_com_method(p_sess, 2, ctypes.c_ulong, [])

                        if pid.value > 0 and not is_system_sound:
                            proc_name = _get_process_name_by_pid(pid.value).lower().strip()
                            peak_val = max(0.0, float(s_peak.value))
                            session_peaks[proc_name] = max(session_peaks.get(proc_name, 0.0), peak_val)
                            session_info = {
                                "volume_percent": s_vol_pct,
                                "volume_level": round(s_vol_pct / 100.0, 2),
                                "muted": s_is_muted,
                                "is_muted": s_is_muted,
                                "peak": peak_val,
                                "process": proc_name,
                                "pid": pid.value
                            }
                            session_volumes[pid.value] = session_info

                            # Aggregate per process name (e.g. Chrome/Edge audio service utility child processes)
                            if proc_name not in process_volumes:
                                process_volumes[proc_name] = session_info
                            else:
                                prev = process_volumes[proc_name]
                                if peak_val > prev.get("peak", 0.0):
                                    process_volumes[proc_name] = session_info
                                elif s_is_muted and not prev.get("muted", False):
                                    process_volumes[proc_name] = session_info
                                elif s_vol_pct != 100 and prev.get("volume_percent") == 100 and prev.get("peak", 0.0) <= 0.0:
                                    process_volumes[proc_name] = session_info

                    _call_com_method(p_sess_enum, 2, ctypes.c_ulong, [])
                _call_com_method(p_mgr, 2, ctypes.c_ulong, [])
            _call_com_method(p_dev, 2, ctypes.c_ulong, [])

        _call_com_method(p_device_col, 2, ctypes.c_ulong, [])
        _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])

        # Update smoothing history for active playback detection (2.5 second smoothing window)
        with _audio_history_lock:
            _last_master_volume = curr_master_vol
            _last_master_muted = curr_master_muted
            _last_session_volumes = session_volumes
            _last_process_volumes = process_volumes
            for p_name, pk in session_peaks.items():
                if pk > 0.0001:
                    _process_last_audio_active[p_name] = now

            for p_name, last_ts in list(_process_last_audio_active.items()):
                if (now - last_ts) <= 2.5:
                    current_pk = session_peaks.get(p_name, 0.0)
                    active_processes[p_name] = max(current_pk, 0.01)
                else:
                    _process_last_audio_active.pop(p_name, None)

        dev_name = get_default_audio_device_name()

        return {
            "master_peak": max_master_peak,
            "master_volume_percent": curr_master_vol,
            "master_volume_level": round(curr_master_vol / 100.0, 2),
            "master_muted": curr_master_muted,
            "is_master_muted": curr_master_muted,
            "device_name": dev_name,
            "active_processes": active_processes,
            "all_session_peaks": session_peaks,
            "session_volumes": session_volumes,
            "process_volumes": process_volumes
        }
    except Exception:
        return {
            "master_peak": 0.0,
            "master_volume_percent": 100,
            "master_volume_level": 1.0,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Speakers / Headphones",
            "active_processes": {},
            "all_session_peaks": {},
            "session_volumes": {},
            "process_volumes": {}
        }


def get_default_audio_device_name() -> str:
    """
    Returns friendly name of the active audio endpoint (e.g. 'Headphones' or 'Speakers').
    Guarantees non-blocking COM execution with fallback to 'Speakers / Headphones'.
    """
    try:
        from pycaw.pycaw import AudioUtilities
        device = AudioUtilities.GetSpeakers()
        if device:
            props = device.OpenPropertyStore(0)  # STGM_READ
            for i in range(props.GetCount()):
                key = props.GetAt(i)
                if str(key.fmtid).upper() == "{A45C254E-DF1C-4EFD-8020-67D146A850E0}" and key.pid == 14:
                    val = props.GetValue(key)
                    if val and val.GetValue():
                        return str(val.GetValue())
    except Exception:
        pass
    return "Speakers / Headphones"


def get_master_volume_info() -> Dict[str, Any]:
    """Returns master audio volume percentage (0-100), level (0.0-1.0), and mute status."""
    with _audio_history_lock:
        vol = _last_master_volume
        muted = _last_master_muted
        return {
            "volume_percent": vol,
            "volume_level": round(vol / 100.0, 2),
            "muted": muted,
            "is_muted": muted
        }


def get_session_volume_info(pid: Optional[int] = None, proc_name: Optional[str] = None) -> Dict[str, Any]:
    """Returns per-session audio volume percentage (0-100), level (0.0-1.0), mute status, and peak level."""
    with _audio_history_lock:
        if pid is not None and pid in _last_session_volumes:
            return _last_session_volumes[pid]
        if proc_name:
            clean_proc = proc_name.lower().strip()
            if clean_proc in _last_process_volumes:
                return _last_process_volumes[clean_proc]
            for s_pid, s_data in _last_session_volumes.items():
                if s_data.get("process", "").lower() == clean_proc:
                    return s_data
    return {
        "volume_percent": 100,
        "volume_level": 1.0,
        "muted": False,
        "is_muted": False,
        "peak": 0.0,
        "process": proc_name or "unknown",
        "pid": pid or 0
    }


def get_detailed_audio_state(
    target_pid: Optional[int] = None,
    target_proc: Optional[str] = None,
    browser_volume_pct: Optional[int] = None,
    browser_muted: Optional[bool] = None,
    app_volume_pct: Optional[int] = None,
    app_muted: Optional[bool] = None
) -> Dict[str, Any]:
    """
    Returns clean dictionary outputs:
      - master_volume_level: float (0.0 - 1.0)
      - master_volume_pct: int (0 - 100)
      - is_master_muted: bool
      - app_volume_level: float (0.0 - 1.0)
      - app_volume_pct: int (0 - 100)
      - is_app_muted: bool
      - peak_amplitude: float (0.0 - 1.0)
      - audio_peak_pct: int (0 - 100)
      - device_name: str
    """
    live = get_live_wasapi_audio_state()
    m_pct = live.get("master_volume_percent", 100)
    m_level = live.get("master_volume_level", round(m_pct / 100.0, 2))
    m_muted = live.get("master_muted", False)
    m_peak = live.get("master_peak", 0.0)

    app_pct = 100
    app_muted_val = False
    app_peak = m_peak

    sess = None
    if target_pid and target_pid in live.get("session_volumes", {}):
        sess = live["session_volumes"][target_pid]
    elif target_proc:
        clean_proc = target_proc.lower().strip()
        if clean_proc in live.get("process_volumes", {}):
            sess = live["process_volumes"][clean_proc]
        else:
            for s_pid, s_data in live.get("session_volumes", {}).items():
                if s_data.get("process", "").lower() == clean_proc:
                    sess = s_data
                    break

    if sess:
        app_pct = sess.get("volume_percent", 100)
        app_muted_val = sess.get("muted", False)
        app_peak = sess.get("peak", m_peak)

    if app_volume_pct is not None:
        try:
            app_pct = max(0, min(100, int(app_volume_pct)))
        except (ValueError, TypeError):
            pass
        if app_muted is not None:
            app_muted_val = bool(app_muted or app_pct == 0)
        elif app_pct == 0:
            app_muted_val = True
        else:
            app_muted_val = False
    elif browser_volume_pct is not None:
        try:
            app_pct = max(0, min(100, int(browser_volume_pct)))
        except (ValueError, TypeError):
            pass
        if browser_muted is not None:
            app_muted_val = bool(browser_muted or app_pct == 0)
        elif app_pct == 0:
            app_muted_val = True

    dev_name = live.get("device_name") or get_default_audio_device_name()

    return {
        "master_volume_level": m_level,
        "master_volume_pct": m_pct,
        "is_master_muted": m_muted,
        "master_muted": m_muted,
        "app_volume_level": round(app_pct / 100.0, 2),
        "app_volume_pct": app_pct,
        "is_app_muted": app_muted_val,
        "app_muted": app_muted_val,
        "peak_amplitude": float(app_peak),
        "audio_peak_pct": int(round(app_peak * 100)),
        "device_name": dev_name
    }


def get_audio_volume_state(
    pid: Optional[int] = None,
    proc_name: Optional[str] = None,
    browser_volume_pct: Optional[int] = None,
    browser_muted: Optional[bool] = None,
    app_volume_pct: Optional[int] = None,
    app_muted: Optional[bool] = None
) -> AudioVolumeState:
    """Builds an AudioVolumeState dataclass instance with master and session audio levels."""
    det = get_detailed_audio_state(
        target_pid=pid,
        target_proc=proc_name,
        browser_volume_pct=browser_volume_pct,
        browser_muted=browser_muted,
        app_volume_pct=app_volume_pct,
        app_muted=app_muted
    )
    return AudioVolumeState(
        master_volume_percent=det["master_volume_pct"],
        master_volume_level=det["master_volume_level"],
        master_muted=det["is_master_muted"],
        is_master_muted=det["is_master_muted"],
        session_volume_percent=det["app_volume_pct"],
        session_volume_level=det["app_volume_level"],
        session_muted=det["is_app_muted"],
        is_app_muted=det["is_app_muted"],
        app_volume_level=det["app_volume_level"],
        app_volume_pct=det["app_volume_pct"],
        peak_amplitude=det["peak_amplitude"],
        audio_peak_percent=det["audio_peak_pct"]
    )


