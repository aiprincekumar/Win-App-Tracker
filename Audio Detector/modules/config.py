# -*- coding: utf-8 -*-
"""
config.py: Audio Inactivity Sentinel Configuration & Constants.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Audio Detector
"""

from .constants import (
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS,
    DEDICATED_VIDEO_ONLY_APPS,
    DUAL_PURPOSE_MEDIA_PLAYERS,
    BROWSER_PROCESSES,
    BROWSER_AUDIO_PATTERNS,
    BROWSER_VIDEO_PATTERNS,
    VIDEO_TITLE_TAGS,
    AUDIO_TITLE_TAGS,
    WMP_VIDEO_WINDOW_CLASSES,
    SYSTEM_IGNORED_TITLES,
    SYSTEM_IGNORED_CLASSES,
    is_system_ignored_title,
    is_system_ignored_class,
    get_clean_player_name,
    PSUTIL_AVAILABLE,
    PYCAW_AVAILABLE,
    ProcessMediaClassification,
    classify_open_files,
    classify_text_for_media_type
)

from .dashboard import (
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
    C_BG_GRAY
)

__all__ = [
    "AUDIO_EXTENSIONS",
    "VIDEO_EXTENSIONS",
    "KNOWN_PURE_AUDIO_APPS",
    "DEDICATED_VIDEO_ONLY_APPS",
    "DUAL_PURPOSE_MEDIA_PLAYERS",
    "BROWSER_PROCESSES",
    "BROWSER_AUDIO_PATTERNS",
    "BROWSER_VIDEO_PATTERNS",
    "VIDEO_TITLE_TAGS",
    "AUDIO_TITLE_TAGS",
    "WMP_VIDEO_WINDOW_CLASSES",
    "SYSTEM_IGNORED_TITLES",
    "SYSTEM_IGNORED_CLASSES",
    "is_system_ignored_title",
    "is_system_ignored_class",
    "get_clean_player_name",
    "PSUTIL_AVAILABLE",
    "PYCAW_AVAILABLE",
    "ProcessMediaClassification",
    "classify_open_files",
    "classify_text_for_media_type",
    "enable_windows_vt_mode",
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
    "C_BG_GRAY"
]
