# -*- coding: utf-8 -*-
"""
modules/hardware_telemetry.py: Real-time Process Hardware Metrics & GPU Acceleration Inspector.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import time
import ctypes
from ctypes import wintypes, Structure, sizeof, byref
from typing import Dict, Any

try:
    import psutil
    _HAS_PSUTIL = True
except ImportError:
    psutil = None
    _HAS_PSUTIL = False

# Win32 fallbacks if psutil is not available
class PROCESS_MEMORY_COUNTERS_EX(Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("PageFaultCount", wintypes.DWORD),
        ("PeakWorkingSetSize", ctypes.c_size_t),
        ("WorkingSetSize", ctypes.c_size_t),
        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
        ("PagefileUsage", ctypes.c_size_t),
        ("PeakPagefileUsage", ctypes.c_size_t),
        ("PrivateUsage", ctypes.c_size_t),
    ]

kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None
psapi = ctypes.windll.psapi if sys.platform == "win32" else None

ACCEL_MODULES = {
    "d3d11.dll", "dxva2.dll", "nvapi64.dll", "d3d9.dll",
    "d3d12.dll", "amdvlk64.dll", "vulkan-1.dll", "nvencodeapi64.dll"
}

# Cache for psutil Process instances and telemetry results
_proc_cache: Dict[int, Any] = {}
_hw_accel_cache: Dict[int, Any] = {}


def get_process_cpu_and_ram(pid: int) -> Dict[str, Any]:
    """
    Retrieves low-overhead CPU usage percentage and Working Set RAM (MB) for target PID.
    Detects GPU hardware acceleration (DirectX / DirectShow / NVAPI / Vulkan).
    Completely non-blocking (<0.1ms per call) with cached process objects.
    """
    if not pid or pid <= 0:
        return {"cpu_percent": 0.0, "ram_mb": 0.0, "hw_accel": False}

    now = time.time()

    # 1. Preferred path: psutil
    if _HAS_PSUTIL:
        try:
            if pid not in _proc_cache:
                _proc_cache[pid] = psutil.Process(pid)
            p = _proc_cache[pid]

            # Fast non-blocking cpu and memory
            ram_mb = round(p.memory_info().rss / (1024.0 * 1024.0), 1)
            cpu_pct = round(p.cpu_percent(interval=None), 1)

            # Cached hardware acceleration check (valid for 10 seconds)
            hw_accel = False
            if pid in _hw_accel_cache and (now - _hw_accel_cache[pid][0]) < 10.0:
                hw_accel = _hw_accel_cache[pid][1]
            else:
                try:
                    maps = p.memory_maps()
                    for m in maps:
                        if os.path.basename(m.path).lower() in ACCEL_MODULES:
                            hw_accel = True
                            break
                    _hw_accel_cache[pid] = (now, hw_accel)
                except Exception:
                    _hw_accel_cache[pid] = (now, False)

            return {
                "cpu_percent": cpu_pct,
                "ram_mb": ram_mb,
                "hw_accel": hw_accel
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            _proc_cache.pop(pid, None)
            _hw_accel_cache.pop(pid, None)
            return {"cpu_percent": 0.0, "ram_mb": 0.0, "hw_accel": False}
        except Exception:
            pass

    # 2. Pure Win32 fallback if psutil is unavailable or fails
    if kernel32 and psapi:
        PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
        h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if not h_proc:
            return {"cpu_percent": 0.0, "ram_mb": 0.0, "hw_accel": False}
        try:
            counters = PROCESS_MEMORY_COUNTERS_EX()
            counters.cb = sizeof(PROCESS_MEMORY_COUNTERS_EX)
            ram_mb = 0.0
            if psapi.GetProcessMemoryInfo(h_proc, byref(counters), sizeof(counters)):
                ram_mb = round(counters.WorkingSetSize / (1024.0 * 1024.0), 1)
            return {
                "cpu_percent": 0.0,
                "ram_mb": ram_mb,
                "hw_accel": False
            }
        finally:
            kernel32.CloseHandle(h_proc)

    return {"cpu_percent": 0.0, "ram_mb": 0.0, "hw_accel": False}
