# -*- coding: utf-8 -*-
"""
engine.py: Backward-compatible root re-export module for Windows Native Game Detection Engine.
Delegates directly to modules.engine and modules.tracker.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from modules.config import decrypt_dpapi_blob
from modules.tracker import (
    GameActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)
from modules.engine import (
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
]
