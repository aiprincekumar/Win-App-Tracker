# -*- coding: utf-8 -*-
"""
Keyboard and Mouse Detector Modular Package.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Public API Exports for Windows Native Keyboard & Mouse Inactivity Sentinel.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

from .config import (
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
    show_cursor
)

from .win32_api import (
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
    reset_source_state
)

from .tracker import (
    InputActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)

from .dashboard import (
    format_duration,
    render_activity_timeline,
    render_simple_card
)

from .sentinel import (
    evaluate_keyboard_mouse_state,
    run_single_check,
    run_monitoring_loop
)

__all__ = [
    # Config & Styling
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

    # Win32 & Hooks
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

    # Tracking
    "InputActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",

    # Dashboard
    "format_duration",
    "render_activity_timeline",
    "render_simple_card",

    # Sentinel Loops
    "evaluate_keyboard_mouse_state",
    "run_single_check",
    "run_monitoring_loop"
]
