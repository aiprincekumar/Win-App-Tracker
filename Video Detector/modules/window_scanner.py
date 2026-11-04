# -*- coding: utf-8 -*-
"""
modules/window_scanner.py: High-Performance Win32 System Windows Scanner (<5ms).
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import ctypes
from ctypes import wintypes, byref
from typing import List, Dict, Any

from .config import is_system_ignored_class, is_system_ignored_title
from .win32_api import (
    user32,
    WNDENUMPROC,
    _get_process_name_by_pid,
    resolve_uwp_real_process
)
from .classifier import classify_media_window


def scan_system_media_candidates() -> List[Dict[str, Any]]:
    """
    Scans all running top-level windows using ultra-fast Win32 EnumWindows API (<2ms).
    Replaces slow subprocess tasklist /v (which caused 3-10 second blank screen delays).
    Accurately discovers media windows, resolves UWP child processes, and classifies each.
    """
    candidates: List[Dict[str, Any]] = []
    pid_cache: Dict[int, str] = {}
    seen_windows = set()

    def enum_cb(hwnd, lparam):
        if not user32.IsWindowVisible(hwnd):
            return True

        # Filter out common background Win32 system windows by window class
        cls_buf = ctypes.create_unicode_buffer(256)
        c_ret = user32.GetClassNameW(hwnd, cls_buf, 256)
        cls_name = cls_buf.value.strip() if c_ret > 0 else ""
        if is_system_ignored_class(cls_name):
            return True

        length = user32.GetWindowTextLengthW(hwnd)
        if length <= 0:
            return True

        buf = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buf, length + 1)
        title = buf.value.strip()
        if not title:
            return True

        # Filter out common background Win32 system windows by window title
        if is_system_ignored_title(title):
            return True

        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, byref(pid))
        pid_val = pid.value

        if pid_val not in pid_cache:
            pid_cache[pid_val] = _get_process_name_by_pid(pid_val)
        proc_name = pid_cache[pid_val]

        # Handle UWP ApplicationFrameHost wrapping Modern Windows Media Player or Films & TV
        t_low = title.lower()
        if proc_name == "applicationframehost.exe":
            real_pid, real_proc = resolve_uwp_real_process(hwnd)
            if real_proc:
                proc_name = real_proc
                pid_val = real_pid
            elif "media player" in t_low:
                proc_name = "microsoft.media.player.exe"
            elif any(k in t_low for k in ["films & tv", "movies & tv"]):
                proc_name = "video.ui.exe"

        # Unique window key to avoid duplicate window frames
        win_key = (proc_name, pid_val, title)
        if win_key in seen_windows:
            return True
        seen_windows.add(win_key)

        classification = classify_media_window(proc_name, str(pid_val), title, hwnd=hwnd)
        c_type = classification.get("type", "UNKNOWN")

        if c_type in ("VIDEO", "PURE_AUDIO", "EMPTY_PLAYER"):
            final_title = title
            if title.lower() in ("media player", "windows media player"):
                if classification.get("smtc_title"):
                    final_title = classification.get("smtc_title")
                elif classification.get("file_name"):
                    final_title = classification.get("file_name")
            candidates.append({
                "category": c_type,
                "app_name": classification.get("app_name", proc_name),
                "process": proc_name,
                "pid": str(pid_val),
                "title": final_title,
                "status": "Running",
                "file_ext": classification.get("file_ext", None),
                "rationale": classification.get("rationale", "")
            })

        return True

    try:
        enum_proc = WNDENUMPROC(enum_cb)
        user32.EnumWindows(enum_proc, 0)
    except Exception:
        pass

    return candidates
