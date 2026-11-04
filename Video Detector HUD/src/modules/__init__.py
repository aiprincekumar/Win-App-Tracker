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
    get_live_wasapi_audio_state,
    set_mock_audio_state
)

from .powercfg import (
    get_system_power_display_requests,
    start_powercfg_poller,
    stop_powercfg_poller,
    _powercfg_stop_event
)

from .smtc import (
    HAS_WINSDK_SMTC,
    get_all_smtc_sessions,
    get_smtc_session,
    get_wmp_smtc_info,
    set_mock_smtc_session,
    set_mock_mode,
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
    classify_media_window,
    classify_smtc_session
)

from .window_scanner import (
    scan_system_media_candidates,
    set_mock_candidates
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

from .storage import (
    DEFAULT_DB_PATH,
    StorageManager
)

from .analytics import (
    AnalyticsEngine,
    format_duration_hms,
    format_duration_hud
)

from .exporter import (
    ReportExporter
)

from .countdown import (
    AutoShutdownController,
    format_countdown_mm_ss,
    STATE_STANDBY,
    STATE_GRACE,
    STATE_WARNING,
    STATE_TRIGGERED,
    STATE_SNOOZED
)

from .hud_canvas import (
    HUDCanvas,
    draw_shadow_text
)

from .hud_window import (
    HUDWindow,
    enable_per_monitor_dpi_v2
)

from .hud_docking import (
    HUDDockingManager,
    HUDConfigManager,
    DEFAULT_CONFIG
)

from .tray import (
    SystemTrayController,
    create_status_icon,
    COLOR_ACTIVE,
    COLOR_IDLE,
    COLOR_COUNTDOWN
)

from .web_server import (
    SentinelWebServer,
    SentinelHTTPRequestHandler,
    SentinelThreadingHTTPServer,
    get_local_lan_ip,
    generate_pin
)

from .browser_ws_server import (
    BrowserMediaStateCache,
    BrowserWSServer,
    start_browser_ws_server,
    stop_browser_ws_server,
    get_browser_ws_server,
    get_cached_browser_media_state,
    get_cached_browser_activity_state,
    is_browser_video_playing,
    DEFAULT_WS_HOST,
    DEFAULT_WS_PORT
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
    "HAS_WINSDK_SMTC", "get_all_smtc_sessions", "get_smtc_session",
    "get_wmp_smtc_info", "set_mock_smtc_session", "set_mock_wmp_smtc_info",
    "start_smtc_poller", "stop_smtc_poller", "_smtc_stop_event",

    # WMP Surface
    "detect_wmp_legacy_video_surface", "set_mock_wmp_legacy_video_surface",

    # Classifier
    "extract_file_extension", "classify_media_window", "classify_smtc_session",

    # Window Scanner
    "scan_system_media_candidates",

    # Evaluator
    "evaluate_video_inactivity", "VideoActivityTracker", "get_activity_tracker", "reset_activity_tracker",

    # Dashboard UI
    "_clean_title", "extract_simplified_media_info", "render_simple_card",
    "format_duration", "render_activity_timeline",

    # Phase 02: Storage & Persistence
    "DEFAULT_DB_PATH", "StorageManager",

    # Phase 02: Analytics & Metrics
    "AnalyticsEngine", "format_duration_hms", "format_duration_hud",

    # Phase 02: Multi-Format Reports
    "ReportExporter",

    # Phase 03: Native HUD Overlay & Auto-Shutdown
    "AutoShutdownController", "format_countdown_mm_ss",
    "STATE_STANDBY", "STATE_GRACE", "STATE_WARNING", "STATE_TRIGGERED", "STATE_SNOOZED",
    "HUDCanvas", "draw_shadow_text",
    "HUDWindow", "enable_per_monitor_dpi_v2",

    # Phase 04: HUD Docking, Snapping & System Tray
    "HUDDockingManager", "HUDConfigManager", "DEFAULT_CONFIG",
    "SystemTrayController", "create_status_icon",
    "COLOR_ACTIVE", "COLOR_IDLE", "COLOR_COUNTDOWN",

    # Phase 05: Lightweight Web Dashboard & Remote Control
    "SentinelWebServer", "SentinelHTTPRequestHandler", "SentinelThreadingHTTPServer",
    "get_local_lan_ip", "generate_pin",

    # Phase 06: Browser WebSocket Bridge
    "BrowserMediaStateCache", "BrowserWSServer",
    "start_browser_ws_server", "stop_browser_ws_server", "get_browser_ws_server",
    "get_cached_browser_media_state", "get_cached_browser_activity_state",
    "is_browser_video_playing", "DEFAULT_WS_HOST", "DEFAULT_WS_PORT"
]

from .offline_player import (
    inspect_offline_player_timeline,
    set_mock_offline_timeline,
    format_seek_timeline,
    extract_timeline_from_text,
    get_media_file_duration_com
)
