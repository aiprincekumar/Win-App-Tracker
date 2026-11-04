# -*- coding: utf-8 -*-
"""
Game Detector package: Windows Native Game Idle & Inactivity Sentinel.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Public API Exports for Windows Native Game Inactivity Sentinel.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

from .modules import (
    WindowsGameEngine,
    WindowsGameDetector,
    GameInfo,
    ProcessInfo,
    decrypt_dpapi_blob,
    classify_game_genre,
    detect_active_player,
    GameActivityTracker,
    get_wasapi_master_audio_peak,
    enable_windows_vt_mode,
    render_simple_card,
    extract_simplified_game_info,
    format_duration,
    render_activity_timeline,
    run_sentinel_loop,
    main
)

__all__ = [
    "WindowsGameEngine",
    "WindowsGameDetector",
    "GameInfo",
    "ProcessInfo",
    "decrypt_dpapi_blob",
    "classify_game_genre",
    "detect_active_player",
    "GameActivityTracker",
    "get_wasapi_master_audio_peak",
    "enable_windows_vt_mode",
    "render_simple_card",
    "extract_simplified_game_info",
    "format_duration",
    "render_activity_timeline",
    "run_sentinel_loop",
    "main"
]
