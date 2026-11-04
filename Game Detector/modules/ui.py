# -*- coding: utf-8 -*-
"""
ui.py: UI & Dashboard API Re-export Module for backward compatibility.
Department 04: UI/UX Design System.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

from .config import (
    enable_windows_vt_mode,
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
    CLR_BG_GRAY
)
from .dashboard import (
    format_duration,
    render_activity_timeline,
    extract_simplified_game_info,
    render_simple_card
)

__all__ = [
    "enable_windows_vt_mode",
    "format_duration",
    "render_activity_timeline",
    "extract_simplified_game_info",
    "render_simple_card",
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
    "CLR_BG_GRAY"
]
