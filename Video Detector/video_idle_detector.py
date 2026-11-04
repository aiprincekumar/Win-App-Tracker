# -*- coding: utf-8 -*-
"""
video_idle_detector.py: Specialized Windows Video-Only Inactivity Sentinel.

Core Purpose:
  - Specifically detects whether VIDEO is actively playing on Windows.
  - ACCURATELY DIFFERENTIATES between VIDEO playback and PURE AUDIO playback,
    even inside dual-purpose media players (VLC, PotPlayer, Windows Media Player,
    Modern Windows 10/11 Media Player, MPC-HC, MPC-BE, KMPlayer, GOM Player, MPV)
    and web browsers (Chrome, Edge, Firefox).
  - A media player playing an audio file (e.g., VLC playing song.mp3 or track.flac,
    or Modern Windows Media Player playing songs/albums/playlists)
    is recognized as PURE AUDIO and IGNORED (Treated as IDLE).
  - A media player playing a video file (e.g., VLC playing movie.mp4 or clip.mkv,
    or Modern Media Player playing video files) is recognized as VIDEO.
  - Video that is PAUSED or SILENT is treated as IDLE.
  - Active video (WASAPI audio peak > 0.0001 with active video stream) is reported as BUSY.
  - Ultra-fast startup: Pure Win32 EnumWindows callback (<5ms) replaces slow tasklist /v (3-10s).
  - Instant terminal UI initialization with zero blank screen lag.

Architecture:
  - Modular Monolith architecture adhering to Department 02 Systems Engineering standards.
  - Subsystems decoupled into dedicated modules inside `modules/`:
      * `modules/config.py`: Catalogs, file extensions, regexes, ANSI themes
      * `modules/win32_api.py`: Win32 structures, COM dispatch, process resolution, VT mode
      * `modules/audio.py`: WASAPI Core Audio COM queries & peak meter smoothing
      * `modules/powercfg.py`: Background powercfg poller thread & display wake locks
      * `modules/smtc.py`: Windows Native SMTC poller & mock hooks
      * `modules/wmp_surface.py`: Legacy WMP EVR/DirectShow video surface scanner
      * `modules/classifier.py`: Deep video vs pure audio heuristic classifier
      * `modules/window_scanner.py`: Win32 EnumWindows media candidate scanner
      * `modules/evaluator.py`: Master inactivity evaluator & state machine
      * `modules/dashboard.py`: ANSI terminal UI card renderer & data extractor

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / video_idle_detector
"""

import sys
import os
import time
import json
import argparse
import atexit
from typing import Dict, List, Optional, Tuple, Any, Set

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure current directory is in sys.path for direct script execution and package imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import and re-export all subsystems for 100% backward compatibility
from modules import (
    # Config
    C_RESET, C_BOLD, C_RED, C_GREEN, C_YELLOW, C_CYAN, C_GRAY,
    AUDIO_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS, MODERN_WINDOWS_MEDIA_PLAYER_PROCS,
    DUAL_PURPOSE_MEDIA_PLAYERS, DEDICATED_VIDEO_ONLY_APPS,
    BROWSER_PROCESSES, BROWSER_PURE_AUDIO_PATTERNS, BROWSER_VIDEO_PATTERNS,
    SYSTEM_IGNORED_TITLES, SYSTEM_IGNORED_CLASSES,
    is_system_ignored_title, is_system_ignored_class,

    # Win32 & COM
    user32, kernel32, ole32, WNDENUMPROC, GUID,
    _make_guid, _call_com_method, _get_process_name_by_pid,
    resolve_uwp_real_process, enable_windows_vt_mode,

    # Audio
    get_live_wasapi_audio_state,

    # Powercfg
    get_system_power_display_requests, start_powercfg_poller,
    stop_powercfg_poller, _powercfg_stop_event,

    # SMTC
    HAS_WINSDK_SMTC, get_wmp_smtc_info, set_mock_wmp_smtc_info,
    start_smtc_poller, stop_smtc_poller, _smtc_stop_event,

    # WMP Surface
    detect_wmp_legacy_video_surface, set_mock_wmp_legacy_video_surface,

    # Classifier
    extract_file_extension, classify_media_window,

    # Window Scanner
    scan_system_media_candidates,

    # Evaluator
    evaluate_video_inactivity, VideoActivityTracker, get_activity_tracker, reset_activity_tracker,

    # Dashboard UI
    _clean_title, extract_simplified_media_info, render_simple_card,
    format_duration, render_activity_timeline
)


def run_sentinel_loop(interval: float = 1.0, threshold: float = 60.0):
    """
    Runs continuous live monitoring loop with STRICT in-place overwriting:
      - Clears screen ONCE at startup (\033[2J\033[H).
      - Hides blinking cursor (\033[?25l) on startup, restores on exit (\033[?25h).
      - Moves cursor to home (\033[H) on each frame with zero downward growth.
      - Erases each line to end with \033[K and screen tail with \033[J.
      - Never scrolls or appends lines down the terminal.
    """
    enable_windows_vt_mode()

    def cleanup():
        _powercfg_stop_event.set()
        _smtc_stop_event.set()
        # Restore cursor and clear to end
        sys.stdout.write("\033[?25h\033[J\n")
        sys.stdout.flush()

    atexit.register(cleanup)

    # Render and display the clean default initial dashboard frame IMMEDIATELY (0ms latency, zero delay/flash)
    initial_now = time.time()
    initial_card_data = {
        "timestamp": initial_now,
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(initial_now)),
        "video_playing": False,
        "video_playing_str": "NO (ना)",
        "media_type": "None",
        "playback_state": "STOPPED",
        "active_player": "None",
        "media_title": "None",
        "continuous_play_seconds": 0.0,
        "continuous_pause_seconds": 0.0,
        "audio_peak": 0.0,
        "activity_history_60m": [0.0] * 60,
        "idle_seconds": 0.0,
        "idle_threshold": threshold,
        "is_video_playing": False,
        "is_windows_idle": False
    }
    initial_card = render_simple_card(initial_card_data, in_place=True)
    # Clear screen ONCE and print initial frame with cursor hidden
    sys.stdout.write(f"\033[2J\033[H\033[?25l{initial_card}\033[J")
    sys.stdout.flush()

    start_time = initial_now
    idle_start_time = start_time
    was_video_playing = False

    try:
        while True:
            now = time.time()
            raw_eval = evaluate_video_inactivity()

            active_videos = raw_eval.get("media_candidates", {}).get("active_videos", [])
            is_v_playing = bool(active_videos)

            if is_v_playing:
                idle_start_time = now
                idle_sec = 0.0
                is_windows_idle = False
            else:
                if was_video_playing:
                    # Video just transitioned from active to inactive: start timer fresh from 0.0s
                    idle_start_time = now
                idle_sec = max(0.0, now - idle_start_time)
                is_windows_idle = (idle_sec >= threshold)

            was_video_playing = is_v_playing

            media_info = extract_simplified_media_info(raw_eval, idle_seconds=idle_sec, idle_threshold=threshold)

            card_data = {
                "timestamp": now,
                "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
                "video_playing": is_v_playing,
                "video_playing_str": "YES (हाँ)" if is_v_playing else "NO (ना)",
                "media_type": media_info["media_type"],
                "playback_state": media_info["playback_state"],
                "active_player": media_info["active_player"],
                "media_title": media_info["media_title"],
                "continuous_play_seconds": media_info.get("continuous_play_seconds", 0.0),
                "continuous_pause_seconds": media_info.get("continuous_pause_seconds", 0.0),
                "audio_peak": media_info.get("audio_peak", 0.0),
                "activity_history_60m": media_info.get("activity_history_60m", []),
                "idle_seconds": idle_sec,
                "idle_threshold": threshold,
                "is_video_playing": is_v_playing,
                "is_windows_idle": is_windows_idle
            }

            # STRICT In-Place overwrite: \033[H resets cursor to (1,1), \033[J clears below
            rendered_card = render_simple_card(card_data, in_place=True)
            frame = f"\033[H{rendered_card}\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


def run_single_check(threshold: float = 60.0, idle_seconds: Optional[float] = None, json_output: bool = False) -> int:
    """
    Executes a single evaluation check and returns standard exit code (0: Idle, 1: Video Playing/Busy).
    """
    raw_eval = evaluate_video_inactivity()
    active_videos = raw_eval.get("media_candidates", {}).get("active_videos", [])
    is_v_playing = bool(active_videos)

    if is_v_playing:
        idle_sec = 0.0
        is_windows_idle = False
    else:
        idle_sec = threshold if idle_seconds is None else max(0.0, idle_seconds)
        is_windows_idle = (idle_sec >= threshold)

    media_info = extract_simplified_media_info(raw_eval, idle_seconds=idle_sec, idle_threshold=threshold)

    cont_pause = media_info.get("continuous_pause_seconds", 0.0)
    if not is_v_playing and idle_seconds is not None and cont_pause == 0.0:
        cont_pause = idle_seconds

    card_data = {
        "timestamp": time.time(),
        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
        "video_playing": is_v_playing,
        "video_playing_str": "YES (हाँ)" if is_v_playing else "NO (ना)",
        "media_type": media_info["media_type"],
        "playback_state": media_info["playback_state"],
        "active_player": media_info["active_player"],
        "media_title": media_info["media_title"],
        "continuous_play_seconds": media_info.get("continuous_play_seconds", 0.0),
        "continuous_pause_seconds": cont_pause,
        "audio_peak": media_info.get("audio_peak", 0.0),
        "activity_history_60m": media_info.get("activity_history_60m", []),
        "idle_seconds": idle_sec,
        "idle_threshold": threshold,
        "is_video_playing": is_v_playing,
        "is_windows_idle": is_windows_idle
    }

    if json_output:
        print(json.dumps(card_data, indent=2, ensure_ascii=False))
    else:
        print(render_simple_card(card_data, in_place=False))

    return 1 if (is_v_playing or not is_windows_idle) else 0


def main():
    parser = argparse.ArgumentParser(
        description="Specialized Windows Video-Only Inactivity Sentinel (विंडोज वीडियो आइडल डिटेक्टर)"
    )
    parser.add_argument(
        "--check-once",
        action="store_true",
        help="Perform a single evaluation and exit immediately (Exit Code 0: Idle, Exit Code 1: Busy/Video Playing)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=60.0,
        help="Idle buffer duration threshold in seconds (default: 60.0s)"
    )
    parser.add_argument(
        "--idle-sec",
        type=float,
        default=None,
        help="Simulate elapsed idle duration in seconds for single check"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Update interval in seconds for continuous monitoring (default: 1.0s)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output the evaluation result as structured JSON and exit"
    )

    args = parser.parse_args()

    # JSON mode or single check mode
    if args.json or args.check_once:
        sys.exit(run_single_check(threshold=args.threshold, idle_seconds=args.idle_sec, json_output=args.json))

    # Continuous interactive dashboard
    run_sentinel_loop(interval=args.interval, threshold=args.threshold)


if __name__ == "__main__":
    main()
