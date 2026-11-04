# -*- coding: utf-8 -*-
"""
Audio Detector Modular Package.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Public API Exports for Windows Native Audio Inactivity Sentinel.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Audio Detector
"""

from .constants import (
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS,
    DEDICATED_VIDEO_ONLY_APPS,
    DUAL_PURPOSE_MEDIA_PLAYERS,
    BROWSER_PROCESSES,
    BROWSER_AUDIO_PATTERNS,
    BROWSER_VIDEO_PATTERNS,
    VIDEO_TITLE_TAGS,
    AUDIO_TITLE_TAGS,
    WMP_VIDEO_WINDOW_CLASSES,
    SYSTEM_IGNORED_TITLES,
    SYSTEM_IGNORED_CLASSES,
    is_system_ignored_title,
    is_system_ignored_class,
    get_clean_player_name,
    PSUTIL_AVAILABLE,
    PYCAW_AVAILABLE,
    ProcessMediaClassification,
    classify_open_files,
    classify_text_for_media_type
)

from .wasapi import (
    ole32,
    kernel32,
    get_process_name_by_pid,
    _get_process_name_by_pid,
    get_live_wasapi_audio_state
)

from .wmp_classic import (
    user32,
    ensure_desktop_access,
    get_hwnds_for_pid,
    get_window_titles_for_pid,
    check_wmp_video_window,
    clean_wmp_window_title,
    extract_media_from_cmdline,
    WMPStabilizedState,
    reset_wmp_stabilizer,
    classify_wmp_legacy
)

from .wmp_modern import (
    MODERN_WMP_PROCESSES,
    is_modern_wmp_process,
    classify_wmp_modern
)

from .dashboard import (
    _clean_title,
    format_duration,
    render_activity_timeline,
    make_progress_bar,
    render_live_line,
    render_dashboard_card,
    render_simple_card
)

from .detector import (
    enable_windows_vt_mode,
    get_all_desktop_window_titles,
    get_system_power_display_requests,
    start_powercfg_poller,
    stop_powercfg_poller,
    GSMTCInfo,
    query_gsmtc_powershell,
    GSMTCWatcher,
    classify_pure_audio,
    classify_dedicated_video,
    classify_dual_purpose_player,
    classify_browser,
    classify_active_audio_process,
    AudioDetectionResult,
    extract_media_details,
    AudioActivityTracker,
    get_activity_tracker,
    reset_activity_tracker,
    extract_simplified_media_info,
    AudioDetector,
    is_audio_playing,
    run_live_tracker,
    run_single_check
)

__all__ = [
    # constants
    "AUDIO_EXTENSIONS",
    "VIDEO_EXTENSIONS",
    "KNOWN_PURE_AUDIO_APPS",
    "DEDICATED_VIDEO_ONLY_APPS",
    "DUAL_PURPOSE_MEDIA_PLAYERS",
    "BROWSER_PROCESSES",
    "BROWSER_AUDIO_PATTERNS",
    "BROWSER_VIDEO_PATTERNS",
    "VIDEO_TITLE_TAGS",
    "AUDIO_TITLE_TAGS",
    "WMP_VIDEO_WINDOW_CLASSES",
    "SYSTEM_IGNORED_TITLES",
    "SYSTEM_IGNORED_CLASSES",
    "is_system_ignored_title",
    "is_system_ignored_class",
    "get_clean_player_name",
    "PSUTIL_AVAILABLE",
    "PYCAW_AVAILABLE",
    "ProcessMediaClassification",
    "classify_open_files",
    "classify_text_for_media_type",
    # wasapi
    "ole32",
    "kernel32",
    "get_process_name_by_pid",
    "_get_process_name_by_pid",
    "get_live_wasapi_audio_state",
    # wmp_classic
    "user32",
    "ensure_desktop_access",
    "get_hwnds_for_pid",
    "get_window_titles_for_pid",
    "check_wmp_video_window",
    "clean_wmp_window_title",
    "extract_media_from_cmdline",
    "WMPStabilizedState",
    "reset_wmp_stabilizer",
    "classify_wmp_legacy",
    # wmp_modern
    "MODERN_WMP_PROCESSES",
    "is_modern_wmp_process",
    "classify_wmp_modern",
    # dashboard
    "_clean_title",
    "format_duration",
    "render_activity_timeline",
    "make_progress_bar",
    "render_live_line",
    "render_dashboard_card",
    "render_simple_card",
    # detector
    "enable_windows_vt_mode",
    "get_all_desktop_window_titles",
    "get_system_power_display_requests",
    "start_powercfg_poller",
    "stop_powercfg_poller",
    "GSMTCInfo",
    "query_gsmtc_powershell",
    "GSMTCWatcher",
    "classify_pure_audio",
    "classify_dedicated_video",
    "classify_dual_purpose_player",
    "classify_browser",
    "classify_active_audio_process",
    "AudioDetectionResult",
    "extract_media_details",
    "AudioActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",
    "extract_simplified_media_info",
    "AudioDetector",
    "is_audio_playing",
    "run_live_tracker",
    "run_single_check"
]
