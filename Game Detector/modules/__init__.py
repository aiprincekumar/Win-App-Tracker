# -*- coding: utf-8 -*-
"""
Game Detector Modular Package.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Public API Exports for Windows Native Game Inactivity Sentinel.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

from .config import (
    STD_OUTPUT_HANDLE,
    ENABLE_VIRTUAL_TERMINAL_PROCESSING,
    PROCESS_QUERY_LIMITED_INFORMATION,
    PROCESS_QUERY_INFORMATION,
    TH32CS_SNAPPROCESS,
    C_RESET,
    C_BOLD,
    C_DIM,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY,
    C_BG_GREEN,
    C_BG_CYAN,
    C_BG_GRAY,
    CLR_RESET,
    CLR_BOLD,
    CLR_DIM,
    CLR_CYAN,
    CLR_GREEN,
    CLR_YELLOW,
    CLR_RED,
    CLR_WHITE,
    CLR_BG_GREEN,
    CLR_BG_CYAN,
    CLR_BG_GRAY,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    decrypt_dpapi_blob
)

from .tracker import (
    GameActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)

from .engine import (
    WindowsGameEngine,
    WindowsGameDetector,
    GameInfo,
    ProcessInfo,
    classify_game_genre,
    detect_active_player,
    _clean_title,
    get_wasapi_master_audio_peak,
    get_live_wasapi_audio_state
)

from .dashboard import (
    format_duration,
    render_activity_timeline,
    extract_simplified_game_info,
    render_simple_card
)

from .sentinel import (
    run_sentinel_loop,
    main
)

__all__ = [
    # Config & Styling
    "STD_OUTPUT_HANDLE",
    "ENABLE_VIRTUAL_TERMINAL_PROCESSING",
    "PROCESS_QUERY_LIMITED_INFORMATION",
    "PROCESS_QUERY_INFORMATION",
    "TH32CS_SNAPPROCESS",
    "C_RESET",
    "C_BOLD",
    "C_DIM",
    "C_RED",
    "C_GREEN",
    "C_YELLOW",
    "C_CYAN",
    "C_WHITE",
    "C_GRAY",
    "C_BG_GREEN",
    "C_BG_CYAN",
    "C_BG_GRAY",
    "CLR_RESET",
    "CLR_BOLD",
    "CLR_DIM",
    "CLR_CYAN",
    "CLR_GREEN",
    "CLR_YELLOW",
    "CLR_RED",
    "CLR_WHITE",
    "CLR_BG_GREEN",
    "CLR_BG_CYAN",
    "CLR_BG_GRAY",
    "enable_windows_vt_mode",
    "hide_cursor",
    "show_cursor",
    "decrypt_dpapi_blob",

    # Tracker
    "GameActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",

    # Engine
    "WindowsGameEngine",
    "WindowsGameDetector",
    "GameInfo",
    "ProcessInfo",
    "classify_game_genre",
    "detect_active_player",
    "_clean_title",
    "get_wasapi_master_audio_peak",
    "get_live_wasapi_audio_state",

    # Dashboard & UI
    "format_duration",
    "render_activity_timeline",
    "extract_simplified_game_info",
    "render_simple_card",

    # Sentinel
    "run_sentinel_loop",
    "main"
]
