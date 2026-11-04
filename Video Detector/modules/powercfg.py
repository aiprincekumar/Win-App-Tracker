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
from typing import Set

_powercfg_lock = threading.Lock()
_cached_display_requests: Set[str] = set()
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
                res: Set[str] = set()
                lines = p.stdout.splitlines()
                in_display = False
                for line in lines:
                    s = line.strip()
                    if s == "DISPLAY:":
                        in_display = True
                        continue
                    elif in_display and s.endswith(":") and s.isupper():
                        break
                    elif in_display:
                        if s and s.lower() != "none.":
                            m = re.findall(r"([a-zA-Z0-9_\-\.]+\.exe)", s, re.IGNORECASE)
                            for proc in m:
                                res.add(proc.lower())
                with _powercfg_lock:
                    global _cached_display_requests
                    _cached_display_requests = res
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
    with _powercfg_lock:
        return set(_cached_display_requests)


# Start poller thread on module load
start_powercfg_poller()
atexit.register(stop_powercfg_poller)
