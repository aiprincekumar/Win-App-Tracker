# -*- coding: utf-8 -*-
"""
modules: Specialized Windows Video-Only Inactivity Sentinel Modular Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .config import (
    C_RESET,
    C_BOLD,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_GRAY,
    AUDIO_FILE_EXTENSIONS,
    VIDEO_FILE_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS,
    MODERN_WINDOWS_MEDIA_PLAYER_PROCS,
    DUAL_PURPOSE_MEDIA_PLAYERS,
    DEDICATED_VIDEO_ONLY_APPS,
    BROWSER_PROCESSES,
    BROWSER_PURE_AUDIO_PATTERNS,
    BROWSER_VIDEO_PATTERNS,
    SYSTEM_IGNORED_TITLES,
    SYSTEM_IGNORED_CLASSES,
    is_system_ignored_title,
    is_system_ignored_class
)

from .win32_api import (
    user32,
    kernel32,
    ole32,
    WNDENUMPROC,
    GUID,
    _make_guid,
    _call_com_method,
    _get_process_name_by_pid,
    resolve_uwp_real_process,
    enable_windows_vt_mode
)

from .audio import (
    get_live_wasapi_audio_state
)

from .powercfg import (
    get_system_power_display_requests,
    start_powercfg_poller,
    stop_powercfg_poller,
    _powercfg_stop_event
)

from .smtc import (
    HAS_WINSDK_SMTC,
    get_wmp_smtc_info,
    set_mock_wmp_smtc_info,
    start_smtc_poller,
    stop_smtc_poller,
    _smtc_stop_event
)

from .wmp_surface import (
    detect_wmp_legacy_video_surface,
    set_mock_wmp_legacy_video_surface
)

from .classifier import (
    extract_file_extension,
    classify_media_window
)

from .window_scanner import (
    scan_system_media_candidates
)

from .evaluator import (
    evaluate_video_inactivity,
    VideoActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)

from .dashboard import (
    _clean_title,
    extract_simplified_media_info,
    render_simple_card,
    format_duration,
    render_activity_timeline
)

__all__ = [
    # Config
    "C_RESET", "C_BOLD", "C_RED", "C_GREEN", "C_YELLOW", "C_CYAN", "C_GRAY",
    "AUDIO_FILE_EXTENSIONS", "VIDEO_FILE_EXTENSIONS",
    "KNOWN_PURE_AUDIO_APPS", "MODERN_WINDOWS_MEDIA_PLAYER_PROCS",
    "DUAL_PURPOSE_MEDIA_PLAYERS", "DEDICATED_VIDEO_ONLY_APPS",
    "BROWSER_PROCESSES", "BROWSER_PURE_AUDIO_PATTERNS", "BROWSER_VIDEO_PATTERNS",
    "SYSTEM_IGNORED_TITLES", "SYSTEM_IGNORED_CLASSES",
    "is_system_ignored_title", "is_system_ignored_class",

    # Win32 & COM
    "user32", "kernel32", "ole32", "WNDENUMPROC", "GUID",
    "_make_guid", "_call_com_method", "_get_process_name_by_pid",
    "resolve_uwp_real_process", "enable_windows_vt_mode",

    # Audio
    "get_live_wasapi_audio_state",

    # Powercfg
    "get_system_power_display_requests", "start_powercfg_poller",
    "stop_powercfg_poller", "_powercfg_stop_event",

    # SMTC
    "HAS_WINSDK_SMTC", "get_wmp_smtc_info", "set_mock_wmp_smtc_info",
    "start_smtc_poller", "stop_smtc_poller", "_smtc_stop_event",

    # WMP Surface
    "detect_wmp_legacy_video_surface", "set_mock_wmp_legacy_video_surface",

    # Classifier
    "extract_file_extension", "classify_media_window",

    # Window Scanner
    "scan_system_media_candidates",

    # Evaluator
    "evaluate_video_inactivity", "VideoActivityTracker", "get_activity_tracker", "reset_activity_tracker",

    # Dashboard UI
    "_clean_title", "extract_simplified_media_info", "render_simple_card",
    "format_duration", "render_activity_timeline"
]
