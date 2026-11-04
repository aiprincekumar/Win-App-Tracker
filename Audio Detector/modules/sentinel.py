# -*- coding: utf-8 -*-
"""
sentinel.py: Master Audio Detection Sentinel Loops & Evaluation Runners.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Audio Detector
"""

import sys
import time
import json
from typing import Dict, Any, Optional

from .config import enable_windows_vt_mode
from .detector import evaluate_audio_inactivity, extract_simplified_audio_info
from .dashboard import render_simple_card


def run_single_check(threshold: float = 60.0, json_output: bool = False) -> int:
    """Executes single evaluation check and returns exit code (0: Idle, 1: Audio Playing)."""
    raw_eval = evaluate_audio_inactivity(idle_threshold=threshold)
    is_a_playing = raw_eval.get("is_audio_playing", False)
    is_idle = raw_eval.get("is_windows_idle", not is_a_playing)

    info = extract_simplified_audio_info(raw_eval, idle_seconds=0.0 if is_a_playing else threshold, idle_threshold=threshold)
    card_data = {
        "audio_playing": info["audio_playing"],
        "audio_type": info["audio_type"],
        "playback_state": info["playback_state"],
        "active_player": info["active_player"],
        "media_title": info["media_title"],
        "idle_seconds": 0.0 if is_a_playing else threshold,
        "idle_threshold": threshold,
        "is_audio_playing": is_a_playing,
        "is_windows_idle": is_idle
    }

    if json_output:
        print(json.dumps(card_data, indent=2, ensure_ascii=False))
    else:
        print(render_simple_card(card_data, in_place=False))

    return 1 if is_a_playing else 0


def run_monitoring_loop(threshold: float = 60.0, interval: float = 0.1) -> None:
    """Executes continuous real-time terminal UI loop with flicker-free in-place rendering."""
    enable_windows_vt_mode()

    sys.stdout.write("\033[2J\033[H\033[?25l")
    sys.stdout.flush()

    start_time = time.time()
    idle_start_time = start_time
    was_audio_playing = False

    try:
        while True:
            now = time.time()
            raw_eval = evaluate_audio_inactivity(idle_threshold=threshold)
            is_a_playing = raw_eval.get("is_audio_playing", False)

            if is_a_playing:
                idle_start_time = now
                idle_sec = 0.0
                is_windows_idle = False
            else:
                if was_audio_playing:
                    idle_start_time = now
                idle_sec = min(threshold, max(0.0, now - idle_start_time))
                is_windows_idle = (idle_sec >= threshold)

            was_audio_playing = is_a_playing

            info = extract_simplified_audio_info(raw_eval, idle_seconds=idle_sec, idle_threshold=threshold)
            card_data = {
                "audio_playing": info["audio_playing"],
                "audio_type": info["audio_type"],
                "playback_state": info["playback_state"],
                "active_player": info["active_player"],
                "media_title": info["media_title"],
                "idle_seconds": idle_sec,
                "idle_threshold": threshold,
                "is_audio_playing": info["is_audio_playing"],
                "is_windows_idle": info["is_windows_idle"]
            }

            rendered = render_simple_card(card_data, in_place=True)
            sys.stdout.write(f"\033[H{rendered}\033[J")
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write("\033[?25h")
        sys.stdout.flush()
