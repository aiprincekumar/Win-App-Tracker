# -*- coding: utf-8 -*-
"""
AntiGravity Detector Modular Package.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Public API Exports for Windows Native AntiGravity Agent Inactivity Sentinel.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

from .config import (
    DEFAULT_BRAIN_DIR,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    C_RESET,
    C_BOLD,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY
)

from .tracker import (
    AgentActivityTracker,
    get_agent_tracker,
    reset_agent_tracker
)

from .analyzer import (
    AntigravitySessionAnalyzer
)

from .dashboard import (
    format_duration,
    render_activity_timeline,
    render_simple_card
)

from .sentinel import (
    evaluate_antigravity_state,
    run_single_check,
    run_monitoring_loop,
    run_antigravity_sentinel
)

__all__ = [
    "DEFAULT_BRAIN_DIR",
    "enable_windows_vt_mode",
    "hide_cursor",
    "show_cursor",
    "C_RESET",
    "C_BOLD",
    "C_RED",
    "C_GREEN",
    "C_YELLOW",
    "C_CYAN",
    "C_WHITE",
    "C_GRAY",
    "AgentActivityTracker",
    "get_agent_tracker",
    "reset_agent_tracker",
    "AntigravitySessionAnalyzer",
    "format_duration",
    "render_activity_timeline",
    "render_simple_card",
    "evaluate_antigravity_state",
    "run_single_check",
    "run_monitoring_loop",
    "run_antigravity_sentinel"
]
