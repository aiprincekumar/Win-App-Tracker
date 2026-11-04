# -*- coding: utf-8 -*-
"""
wmp_modern.py: Dedicated Classifier for Modern Windows 10/11 Media Player (microsoft.media.player.exe / music.ui.exe).

Specialized forensic classifier for UWP/WinUI Modern Media Player:
  1. WinRT GSMTC PlaybackType Telemetry (1=Music vs 2=Video).
  2. Windows DISPLAY wake locks (ApplicationFrameHost.exe / microsoft.media.player.exe).
  3. Open file handles and window titles.
  4. Heuristic audio fallback when rendering audio streams without display locks.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

import sys
import os
from typing import Set, Optional, List, Any

from .constants import (
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    is_system_ignored_title,
    PSUTIL_AVAILABLE,
    ProcessMediaClassification,
    classify_open_files,
    classify_text_for_media_type
)
from .wmp_classic import get_window_titles_for_pid

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore

MODERN_WMP_PROCESSES: Set[str] = {
    "microsoft.media.player.exe",
    "music.ui.exe",
    "zune.exe"
}


def _resolve(name: str, fallback: Any) -> Any:
    """Checks if a symbol has been monkeypatched on root audio_detector module."""
    mod = sys.modules.get("audio_detector")
    if mod is not None and hasattr(mod, name):
        val = getattr(mod, name)
        if val is not None:
            return val
    return fallback


def is_modern_wmp_process(proc_name: str) -> bool:
    """Checks if a process name belongs to Windows 10/11 Modern Media Player."""
    return proc_name.lower().strip() in MODERN_WMP_PROCESSES


def classify_wmp_modern(
    pid: int,
    proc_name: str,
    peak: float,
    display_requests: Set[str],
    gsmtc_info: Optional[Any] = None
) -> ProcessMediaClassification:
    """
    Classifies Windows Modern Media Player (microsoft.media.player.exe / music.ui.exe).
    """
    pname_lower = proc_name.lower().strip()

    if peak <= 0.0001:
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=False,
            classification="SILENT",
            reason=f"Audio meter peak is silent ({peak:.4f})"
        )

    # 1. GSMTC Telemetry Priority
    if gsmtc_info and (getattr(gsmtc_info, "status", 0) == 4 or getattr(gsmtc_info, "status", 0) == 0):
        if getattr(gsmtc_info, "playback_type", 0) == 2:  # Video
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Modern Media Player GSMTC reports PlaybackType=Video (Title: '{getattr(gsmtc_info, 'title', '')}')",
                window_title=getattr(gsmtc_info, "title", None) or None
            )
        elif getattr(gsmtc_info, "playback_type", 0) == 1:  # Music (Audio)
            artist = getattr(gsmtc_info, "artist", "")
            title = getattr(gsmtc_info, "title", "")
            disp_title = f"{title} - {artist}" if artist else title
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Modern Media Player GSMTC reports PlaybackType=Music/Audio (Title: '{title}')",
                window_title=disp_title or None
            )

    # 2. Display Wake Lock Inspection (UWP frame or direct process)
    has_display_lock = (
        pname_lower in display_requests or
        "applicationframehost.exe" in display_requests
    )
    if has_display_lock:
        return ProcessMediaClassification(
            pid=pid,
            proc_name=proc_name,
            peak_value=peak,
            is_audio=False,
            is_video=True,
            classification="VIDEO",
            reason=f"Active Windows DISPLAY wake lock (video rendering detected for Modern Media Player {proc_name})"
        )

    # 3. Open Files Inspection (psutil)
    is_psutil = _resolve("PSUTIL_AVAILABLE", PSUTIL_AVAILABLE)
    open_file_paths: List[str] = []
    cmdline_args: List[str] = []
    if is_psutil and psutil and pid > 0:
        try:
            proc = psutil.Process(pid)
            cmdline_args = proc.cmdline()
            open_files = proc.open_files()
            open_file_paths = [f.path for f in open_files]
        except Exception:
            pass

    if open_file_paths:
        file_class, ext, matched_path = classify_open_files(open_file_paths)
        if file_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Modern Media Player open video file detected: '{ext}' ({os.path.basename(matched_path or '')})",
                file_path=matched_path
            )
        elif file_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Modern Media Player open audio file detected: '{ext}' ({os.path.basename(matched_path or '')})",
                file_path=matched_path
            )

    # 4. Command Line Inspection
    if cmdline_args:
        cmd_text = " ".join(cmdline_args)
        cmd_class, cmd_reason = classify_text_for_media_type(cmd_text)
        if cmd_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Modern Media Player cmdline indicates video: {cmd_reason}"
            )
        elif cmd_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Modern Media Player cmdline indicates audio: {cmd_reason}"
            )

    # 5. Window Titles Inspection
    get_titles_fn = _resolve("get_window_titles_for_pid", get_window_titles_for_pid)
    window_titles = get_titles_fn(pid)
    for title in window_titles:
        if is_system_ignored_title(title):
            continue
        t_class, t_reason = classify_text_for_media_type(title)
        if t_class == "VIDEO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=False,
                is_video=True,
                classification="VIDEO",
                reason=f"Modern Media Player title indicates video: '{title}' ({t_reason})",
                window_title=title
            )
        elif t_class == "AUDIO":
            return ProcessMediaClassification(
                pid=pid,
                proc_name=proc_name,
                peak_value=peak,
                is_audio=True,
                is_video=False,
                classification="AUDIO",
                reason=f"Modern Media Player title indicates audio: '{title}' ({t_reason})",
                window_title=title
            )

    # 6. Fallback: Sound is playing with no video indicators -> AUDIO
    first_title = window_titles[0] if window_titles else (getattr(gsmtc_info, "title", "") if gsmtc_info else "")
    return ProcessMediaClassification(
        pid=pid,
        proc_name=proc_name,
        peak_value=peak,
        is_audio=True,
        is_video=False,
        classification="AUDIO",
        reason=f"Modern Media Player playing audio without display wake lock ('{first_title}')",
        window_title=first_title or None
    )
