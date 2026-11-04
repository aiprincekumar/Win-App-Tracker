# -*- coding: utf-8 -*-
"""
keyboard_mouse_detector.py: Specialized Windows Keyboard & Mouse Inactivity Sentinel (CLI Entry Point).
Department 06: Backend & API Engineering & Department 02: Systems Engineering Compliant.

Modular Architecture:
  Core functionality is decoupled into the 'modules' package:
    - modules.config: Virtual Terminal mode, ANSI styling palette, cursor visibility.
    - modules.win32_api: Win32 GetLastInputInfo, low-level input hooks, device tracking.
    - modules.tracker: Continuous duration & 60m rolling activity tracking.
    - modules.dashboard: ANSI card and timeline rendering.
    - modules.sentinel: Master evaluation & monitoring loops.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
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

# Public API Re-exports for 100% backward compatibility
from modules import (
    STD_OUTPUT_HANDLE,
    ENABLE_VIRTUAL_TERMINAL_PROCESSING,
    C_RESET,
    C_BOLD,
    C_DIM,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    LASTINPUTINFO,
    POINT,
    HOOKPROC,
    start_input_hooks,
    stop_input_hooks,
    is_input_hooks_active,
    get_user_idle_seconds,
    get_device_idle_seconds,
    set_mock_source_activity,
    set_mock_user_idle_seconds,
    reset_source_state,
    InputActivityTracker,
    get_activity_tracker,
    reset_activity_tracker,
    format_duration,
    render_activity_timeline,
    render_simple_card,
    evaluate_keyboard_mouse_state,
    run_single_check,
    run_monitoring_loop
)

__all__ = [
    "STD_OUTPUT_HANDLE",
    "ENABLE_VIRTUAL_TERMINAL_PROCESSING",
    "C_RESET",
    "C_BOLD",
    "C_DIM",
    "C_RED",
    "C_GREEN",
    "C_YELLOW",
    "C_CYAN",
    "C_WHITE",
    "C_GRAY",
    "enable_windows_vt_mode",
    "hide_cursor",
    "show_cursor",
    "LASTINPUTINFO",
    "POINT",
    "HOOKPROC",
    "start_input_hooks",
    "stop_input_hooks",
    "is_input_hooks_active",
    "get_user_idle_seconds",
    "get_device_idle_seconds",
    "set_mock_source_activity",
    "set_mock_user_idle_seconds",
    "reset_source_state",
    "InputActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",
    "format_duration",
    "render_activity_timeline",
    "render_simple_card",
    "evaluate_keyboard_mouse_state",
    "run_single_check",
    "run_monitoring_loop",
    "main"
]


def main():
    """Parses command-line arguments and launches Keyboard & Mouse Sentinel."""
    parser = argparse.ArgumentParser(
        description="Specialized Windows Keyboard & Mouse Inactivity Sentinel (In-Place Dashboard)."
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.1,
        help="Refresh interval in seconds (default: 0.1s for ultra-fast, smooth tracking)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=60.0,
        help="Inactivity idle threshold in seconds (default: 60.0s)"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Single check execution (prints formatted card and exits with 0: Idle, 1: Active)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Structured JSON output of evaluation card data"
    )
    args = parser.parse_args()

    if args.once or args.json:
        sys.exit(run_single_check(threshold=args.threshold, json_output=args.json))

    run_monitoring_loop(threshold=args.threshold, interval=args.interval)


if __name__ == "__main__":
    main()
