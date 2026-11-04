# -*- coding: utf-8 -*-
"""
modules/powercfg.py: Windows Power Requests & Display Wake Lock Poller Subsystem (Decoupled & Non-blocking).
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import sys
import time
import subprocess
import threading
import atexit
import re
import ctypes
from ctypes import wintypes, Structure, byref
from typing import Set, Dict, Any, List

class SYSTEM_POWER_STATUS(Structure):
    _fields_ = [
        ("ACLineStatus", ctypes.c_ubyte),
        ("BatteryFlag", ctypes.c_ubyte),
        ("BatteryLifePercent", ctypes.c_ubyte),
        ("SystemStatusFlag", ctypes.c_ubyte),
        ("BatteryLifeTime", wintypes.DWORD),
        ("BatteryFullLifeTime", wintypes.DWORD),
    ]

kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None

_powercfg_lock = threading.Lock()
_cached_display_requests: Set[str] = set()
_cached_system_requests: Set[str] = set()
_powercfg_stop_event = threading.Event()
_powercfg_thread: threading.Thread = None


def _powercfg_poller_worker():
    """
    Background daemon thread to query powercfg /requests without blocking the main loop.
    Prevents thread freezes if Windows power service is temporarily busy.
    """
    startupinfo = None
    creationflags = 0
    if sys.platform == "win32":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = 0  # SW_HIDE
        creationflags = 0x08000000   # CREATE_NO_WINDOW

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
                disp_res: Set[str] = set()
                sys_res: Set[str] = set()
                lines = p.stdout.splitlines()
                current_section = None
                for line in lines:
                    s = line.strip()
                    if s.endswith(":") and s[:-1].isupper():
                        current_section = s[:-1]
                        continue
                    if current_section == "DISPLAY":
                        if s and s.lower() != "none.":
                            m = re.findall(r"([a-zA-Z0-9_\-\.]+\.exe)", s, re.IGNORECASE)
                            for proc in m:
                                disp_res.add(proc.lower())
                    elif current_section == "SYSTEM":
                        if s and s.lower() != "none.":
                            m = re.findall(r"([a-zA-Z0-9_\-\.]+\.exe)", s, re.IGNORECASE)
                            for proc in m:
                                sys_res.add(proc.lower())
                with _powercfg_lock:
                    global _cached_display_requests, _cached_system_requests
                    _cached_display_requests = disp_res
                    _cached_system_requests = sys_res
        except Exception:
            pass

        # Poll every 2.5 seconds, checking stop_event every 100ms
        for _ in range(25):
            if _powercfg_stop_event.is_set():
                break
            time.sleep(0.1)


def start_powercfg_poller():
    """Starts the background powercfg poller thread if not already running."""
    global _powercfg_thread
    if _powercfg_thread is None or not _powercfg_thread.is_alive():
        _powercfg_stop_event.clear()
        _powercfg_thread = threading.Thread(target=_powercfg_poller_worker, daemon=True, name="PowercfgPoller")
        _powercfg_thread.start()


def stop_powercfg_poller():
    """Signals the powercfg poller thread to cleanly terminate."""
    _powercfg_stop_event.set()


def get_system_power_display_requests() -> Set[str]:
    """
    Returns cached set of processes holding active Windows DISPLAY wake locks.
    Completely non-blocking (<0.001ms) - executes zero subprocesses on the evaluation path.
    """
    if _powercfg_thread is None or not _powercfg_thread.is_alive():
        start_powercfg_poller()
    with _powercfg_lock:
        return set(_cached_display_requests)


def get_system_power_system_requests() -> Set[str]:
    """Returns cached set of processes holding active Windows SYSTEM wake locks."""
    if _powercfg_thread is None or not _powercfg_thread.is_alive():
        start_powercfg_poller()
    with _powercfg_lock:
        return set(_cached_system_requests)


def get_power_requests_status() -> Dict[str, Any]:
    """Returns display and system sleep lock status from powercfg."""
    if _powercfg_thread is None or not _powercfg_thread.is_alive():
        start_powercfg_poller()
    with _powercfg_lock:
        disp = list(_cached_display_requests)
        sys_req = list(_cached_system_requests)
    return {
        "display_locked": bool(disp),
        "system_locked": bool(sys_req),
        "display_requests": disp,
        "system_requests": sys_req
    }


def get_power_source_status() -> Dict[str, Any]:
    """
    Queries Win32 GetSystemPowerStatus to determine AC mains vs Battery state.
    Returns:
      {
        "on_ac": bool,
        "battery_percent": int,
        "is_charging": bool,
        "has_battery": bool,
        "power_status_str": str
      }
    """
    if sys.platform != "win32" or not kernel32:
        return {
            "on_ac": True,
            "battery_percent": 100,
            "is_charging": False,
            "has_battery": False,
            "power_status_str": "AC Mains (Mock)"
        }

    try:
        sps = SYSTEM_POWER_STATUS()
        ret = kernel32.GetSystemPowerStatus(byref(sps))
        if not ret:
            return {
                "on_ac": True,
                "battery_percent": 100,
                "is_charging": False,
                "has_battery": False,
                "power_status_str": "AC Mains"
            }

        on_ac = (sps.ACLineStatus == 1) or (sps.ACLineStatus == 255 and sps.BatteryFlag == 128)
        has_battery = ((sps.BatteryFlag & 128) == 0 and sps.BatteryFlag != 255)
        battery_pct = int(sps.BatteryLifePercent) if sps.BatteryLifePercent <= 100 else 100
        is_charging = bool(sps.BatteryFlag & 8)

        if not has_battery:
            power_status_str = "AC Mains (Desktop)"
        elif on_ac:
            if is_charging:
                power_status_str = f"AC Mains (Charging {battery_pct}%)"
            else:
                power_status_str = f"AC Mains ({battery_pct}%)"
        else:
            power_status_str = f"Battery ({battery_pct}%)"

        return {
            "on_ac": on_ac,
            "battery_percent": battery_pct,
            "is_charging": is_charging,
            "has_battery": has_battery,
            "power_status_str": power_status_str
        }
    except Exception:
        return {
            "on_ac": True,
            "battery_percent": 100,
            "is_charging": False,
            "has_battery": False,
            "power_status_str": "AC Mains"
        }



# Poller thread is started on-demand when requested by the sentinel engine
atexit.register(stop_powercfg_poller)
