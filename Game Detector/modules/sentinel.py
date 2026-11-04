# -*- coding: utf-8 -*-
"""
sentinel.py: Windows Native Game Inactivity Sentinel Live Monitoring Loop.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import time
import atexit
from typing import Dict, Any, Optional

from .config import (
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    C_RESET,
    C_YELLOW
)
from .engine import WindowsGameEngine
from .tracker import GameActivityTracker
from .dashboard import extract_simplified_game_info, render_simple_card


def run_sentinel_loop(interval: float = 0.1, threshold: float = 60.0):
    """
    Runs the continuous Windows Native Game Inactivity Sentinel loop with
    smooth, flicker-free in-place ANSI terminal rendering (~100ms refresh tick).
    Paints initial frame at 0ms BEFORE engine initialization.
    """
    enable_windows_vt_mode()

    initial_now = time.time()
    initial_card_data = {
        "timestamp": initial_now,
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(initial_now)),
        "game_playing": False,
        "game_playing_str": "NO (ना)",
        "game_type": "None",
        "playback_state": "STOPPED",
        "active_player": "None",
        "game_title": "None",
        "continuous_play_seconds": 0.0,
        "continuous_pause_seconds": 0.0,
        "audio_peak": 0.0,
        "idle_seconds": 0.0,
        "idle_threshold": threshold,
        "activity_history_60m": [0.0] * 60,
        "is_game_playing": False,
        "is_windows_idle": False
    }

    initial_rendered = render_simple_card(initial_card_data, in_place=True)
    sys.stdout.write(f"\033[2J\033[H\033[?25l{initial_rendered}\033[J")
    sys.stdout.flush()

    gid_mod = sys.modules.get("game_idle_detector")
    EngineCls = getattr(gid_mod, "WindowsGameEngine", WindowsGameEngine) if gid_mod else WindowsGameEngine
    detector = EngineCls()
    detector.start_background_scanner(scan_interval=1.0)
    tracker = GameActivityTracker()

    def cleanup():
        try:
            detector.stop_background_scanner()
        except Exception:
            pass
        show_cursor()

    atexit.register(cleanup)

    first_frame = False
    start_time = initial_now
    idle_start_time = start_time
    was_game_playing = False

    try:
        while True:
            now = time.time()
            raw_eval = detector.evaluate_game_inactivity()
            p_state = raw_eval.get("playback_state", "STOPPED")
            is_g_playing = (p_state == "PLAYING")

            tracker_res = tracker.update(is_g_playing, now=now)
            raw_eval["continuous_play_seconds"] = tracker_res["continuous_play_seconds"]
            raw_eval["continuous_pause_seconds"] = tracker_res["continuous_pause_seconds"]
            raw_eval["activity_history_60m"] = tracker_res["activity_history_60m"]

            if is_g_playing:
                idle_start_time = now
                idle_sec = 0.0
                is_windows_idle = False
            else:
                if was_game_playing:
                    idle_start_time = now
                idle_sec = min(threshold, max(0.0, now - idle_start_time))
                is_windows_idle = (idle_sec >= threshold)

            was_game_playing = is_g_playing

            game_info = extract_simplified_game_info(raw_eval, idle_seconds=idle_sec, idle_threshold=threshold)

            card_data = {
                "timestamp": now,
                "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
                "game_playing": game_info["game_playing"],
                "game_playing_str": "YES (हाँ)" if game_info["game_playing"] else "NO (ना)",
                "game_type": game_info["game_type"],
                "playback_state": game_info["playback_state"],
                "active_player": game_info["active_player"],
                "game_title": game_info["game_title"],
                "continuous_play_seconds": game_info.get("continuous_play_seconds", 0.0),
                "continuous_pause_seconds": game_info.get("continuous_pause_seconds", 0.0),
                "audio_peak": game_info.get("audio_peak", 0.0),
                "idle_seconds": idle_sec,
                "idle_threshold": threshold,
                "activity_history_60m": game_info.get("activity_history_60m", []),
                "is_game_playing": game_info["is_game_playing"],
                "is_windows_idle": game_info["is_windows_idle"]
            }

            rendered_card = render_simple_card(card_data, in_place=True)
            if first_frame:
                frame = f"\033[2J\033[H\033[?25l{rendered_card}\033[J"
                first_frame = False
            else:
                frame = f"\033[H{rendered_card}\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


def main():
    """Directly starts Windows Native Game Inactivity Sentinel live monitoring."""
    run_sentinel_loop(interval=0.1, threshold=60.0)
