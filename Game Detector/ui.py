# -*- coding: utf-8 -*-
"""
ui.py: Backward-compatible root re-export module for UI and Card Renderer.
Delegates directly to modules.dashboard and modules.config.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from modules.config import (
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
from modules.dashboard import (
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
