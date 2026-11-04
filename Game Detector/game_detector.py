# -*- coding: utf-8 -*-
"""
game_detector.py: Windows Native Game Idle & Inactivity Sentinel (CLI Entry Point).
Department 02: Solution Architecture & Department 06: Backend & API Engineering.

Modular Architecture:
  Core functionality is decoupled into the 'modules' package:
    - modules.config: Configuration, ANSI styling, Win32 constants, DPAPI helpers.
    - modules.tracker: Continuous game duration & 60m rolling activity tracking.
    - modules.engine: WindowsGameEngine, Win32 focus, Toolhelp32, WASAPI peak.
    - modules.dashboard: ANSI card, 8-field extraction, and visual timeline.
    - modules.sentinel: Master sentinel loop and runner.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os
import argparse

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure directory is on path
_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

# Public API Re-exports from modules package
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
    main as sentinel_main
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


def main():
    """Parses command-line arguments and launches Game Sentinel."""
    parser = argparse.ArgumentParser(
        description="Specialized Windows Game Inactivity Sentinel (8-Field In-Place Dashboard)."
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.1,
        help="Refresh interval in seconds (default: 0.1s for smooth ~100ms updates)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=60.0,
        help="Inactivity idle threshold in seconds (default: 60.0s)"
    )
    args = parser.parse_args()
    run_sentinel_loop(interval=args.interval, threshold=args.threshold)


if __name__ == "__main__":
    main()
