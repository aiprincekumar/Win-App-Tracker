# -*- coding: utf-8 -*-
"""
game_idle_detector.py: Backward-compatible entry point for Game Inactivity Sentinel.
Delegates directly to modules package.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from modules import (
    WindowsGameEngine,
    WindowsGameDetector,
    GameInfo,
    ProcessInfo,
    decrypt_dpapi_blob,
    classify_game_genre,
    detect_active_player,
    _clean_title,
    GameActivityTracker,
    get_activity_tracker,
    reset_activity_tracker,
    get_wasapi_master_audio_peak,
    get_live_wasapi_audio_state,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    format_duration,
    render_activity_timeline,
    extract_simplified_game_info,
    render_simple_card,
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
    "_clean_title",
    "GameActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",
    "get_wasapi_master_audio_peak",
    "get_live_wasapi_audio_state",
    "enable_windows_vt_mode",
    "hide_cursor",
    "show_cursor",
    "format_duration",
    "render_activity_timeline",
    "extract_simplified_game_info",
    "render_simple_card",
    "run_sentinel_loop",
    "main"
]

if __name__ == "__main__":
    main()
