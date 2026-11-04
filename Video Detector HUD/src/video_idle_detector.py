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
import ctypes

# 1. Zero-Flicker Instant Console Window Suppression for Windows GUI/HUD modes
if sys.platform == "win32":
    _cli_flags = {"--cli", "-h", "--help", "--check-once", "--export", "--json"}
    if not any(arg in sys.argv for arg in _cli_flags):
        try:
            _hwnd = ctypes.windll.kernel32.GetConsoleWindow()
            if _hwnd:
                ctypes.windll.user32.ShowWindow(_hwnd, 0)  # 0 = SW_HIDE
        except Exception:
            pass

# 2. Pythonw / GUI Safe Stream Wrapper (Prevents NoneType write/flush crashes)
class _SafeStream:
    """Safe no-op replacement for sys.stdout / sys.stderr when running under pythonw.exe."""
    def write(self, *args, **kwargs): pass
    def flush(self): pass
    def reconfigure(self, **kwargs): pass

if sys.stdout is None:
    sys.stdout = _SafeStream()
if sys.stderr is None:
    sys.stderr = _SafeStream()

import time
import json
import argparse
import atexit
import threading
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
    HAS_WINSDK_SMTC, get_all_smtc_sessions, get_smtc_session, get_wmp_smtc_info,
    set_mock_smtc_session, set_mock_wmp_smtc_info,
    start_smtc_poller, stop_smtc_poller, _smtc_stop_event,

    # WMP Surface
    detect_wmp_legacy_video_surface, set_mock_wmp_legacy_video_surface,

    # Classifier
    extract_file_extension, classify_media_window, classify_smtc_session,

    # Window Scanner
    scan_system_media_candidates,

    # Evaluator
    evaluate_video_inactivity, VideoActivityTracker, get_activity_tracker, reset_activity_tracker,

    # Dashboard UI
    _clean_title, extract_simplified_media_info, render_simple_card,
    format_duration, render_activity_timeline,

    # Storage & Reports (Phase 02)
    StorageManager, AnalyticsEngine, ReportExporter,

    # Countdown Controller & Native HUD Overlay (Phase 03)
    AutoShutdownController, format_countdown_mm_ss,
    STATE_STANDBY, STATE_GRACE, STATE_WARNING, STATE_TRIGGERED, STATE_SNOOZED,
    HUDCanvas, draw_shadow_text,
    HUDWindow, enable_per_monitor_dpi_v2,

    # Docking & System Tray (Phase 04)
    HUDDockingManager, HUDConfigManager, DEFAULT_CONFIG,
    SystemTrayController, create_status_icon,
    COLOR_ACTIVE, COLOR_IDLE, COLOR_COUNTDOWN,

    # Web Dashboard (Phase 05)
    SentinelWebServer, get_local_lan_ip,

    # Browser WebSocket Bridge (Phase 06)
    start_browser_ws_server, stop_browser_ws_server,
    get_cached_browser_media_state, is_browser_video_playing
)


def run_sentinel_loop(
    interval: float = 1.0,
    threshold: float = 60.0,
    enable_web: bool = False,
    web_port: int = 8765,
    bind_lan: bool = False,
    web_pin: Optional[str] = None
):
    """
    Runs continuous live monitoring loop with STRICT in-place overwriting:
      - Clears screen ONCE at startup (\033[2J\033[H).
      - Hides blinking cursor (\033[?25l) on startup, restores on exit (\033[?25h).
      - Moves cursor to home (\033[H) on each frame with zero downward growth.
      - Erases each line to end with \033[K and screen tail with \033[J.
      - Never scrolls or appends lines down the terminal.
      - Runs lightweight localhost web dashboard & remote control if enable_web=True.
    """
    enable_windows_vt_mode()
    storage = StorageManager()
    analytics = AnalyticsEngine(storage)

    countdown_ctrl = AutoShutdownController(
        grace_threshold_seconds=threshold,
        dry_run=True
    )

    web_server = None
    if enable_web:
        web_server = SentinelWebServer(
            host="0.0.0.0" if bind_lan else "127.0.0.1",
            port=web_port,
            bind_lan=bind_lan,
            pin=web_pin,
            countdown_controller=countdown_ctrl,
            storage=storage,
            analytics=analytics
        )
        web_server.start()
        sys.stdout.write(f"\n  Web Dashboard live at: {web_server.get_access_url()}\n")

    def cleanup():
        _powercfg_stop_event.set()
        _smtc_stop_event.set()
        stop_browser_ws_server()
        if web_server:
            web_server.stop()
        storage.close()
        # Restore cursor and clear to end
        sys.stdout.write("\033[?25h\033[J\n")
        sys.stdout.flush()

    start_browser_ws_server()
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

            # Update countdown state machine
            countdown_state = countdown_ctrl.tick(
                is_video_playing=is_v_playing or (web_server and web_server.is_paused),
                delta_time=interval
            )

            # Sync live state with web server
            if web_server:
                web_server.update_state(card_data=card_data, raw_eval=raw_eval, countdown_state=countdown_state)

            # STRICT In-Place overwrite: \033[H resets cursor to (1,1), \033[J clears below
            rendered_card = render_simple_card(card_data, in_place=True)
            frame = f"\033[H{rendered_card}\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            # Record persistence tick in hourly aggregates and active media sessions
            try:
                storage.log_tick({
                    "timestamp": now,
                    "is_video_playing": is_v_playing,
                    "video_playing": is_v_playing,
                    "active_player": media_info.get("active_player"),
                    "platform_tag": media_info.get("platform_tag"),
                    "media_title": media_info.get("media_title"),
                    "media_type": media_info.get("media_type"),
                    "is_windows_idle": is_windows_idle,
                    "tick_seconds": interval
                })
            except Exception:
                pass

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


def run_hud_mode(
    interval: float = 1.0,
    threshold: float = 60.0,
    enable_web: bool = False,
    web_port: int = 8765,
    bind_lan: bool = False,
    web_pin: Optional[str] = None
):
    """
    Launches Native Transparent Desktop HUD with background WASAPI/Win32 sensor thread
    and system tray controller.
    """
    enable_windows_vt_mode()
    storage = StorageManager()
    analytics = AnalyticsEngine(storage)

    countdown_ctrl = AutoShutdownController(
        grace_threshold_seconds=threshold,
        dry_run=True
    )

    web_server = None
    if enable_web:
        web_server = SentinelWebServer(
            host="0.0.0.0" if bind_lan else "127.0.0.1",
            port=web_port,
            bind_lan=bind_lan,
            pin=web_pin,
            countdown_controller=countdown_ctrl,
            storage=storage,
            analytics=analytics
        )
        web_server.start()
    start_browser_ws_server()

    stop_event = threading.Event()
    active_threshold = [threshold]

    def on_threshold_changed(new_thresh: float):
        active_threshold[0] = float(new_thresh)
        countdown_ctrl.set_threshold(new_thresh)
        if web_server:
            web_server.idle_threshold = new_thresh

    def on_snooze():
        countdown_ctrl.snooze(900)

    def on_cancel():
        countdown_ctrl.abort()

    def on_exit():
        stop_browser_ws_server()
        stop_event.set()
        stop_browser_ws_server()
        if hud and hud.root:
            try:
                hud.root.quit()
            except Exception:
                pass

    try:
        hud = HUDWindow(
            on_threshold_hook=on_threshold_changed,
            controller=countdown_ctrl,
            on_snooze_hook=on_snooze,
            on_cancel_hook=on_cancel,
            on_exit_hook=on_exit
        )
        # If CLI threshold was default (60.0) but saved hud_config has custom preference, honor saved config
        if threshold == 60.0 and hud.current_threshold != 60.0:
            active_threshold[0] = hud.current_threshold
        else:
            hud.set_threshold(active_threshold[0])
        countdown_ctrl.set_threshold(active_threshold[0])
    except Exception as e:
        sys.stderr.write(f"HUD Window initialization failed ({e}), falling back to CLI mode.\n")
        run_sentinel_loop(
            interval=interval,
            threshold=threshold,
            enable_web=enable_web,
            web_port=web_port,
            bind_lan=bind_lan,
            web_pin=web_pin
        )
        return

    start_browser_ws_server()
    tray = SystemTrayController(
        on_show_hide=hud.toggle_visibility,
        on_snooze=None,
        on_export_report=hud.export_html_report,
        on_dashboard=hud.open_dashboard,
        on_exit=on_exit
    )
    tray.start()

    def sensor_worker():
        try:
            ole32.CoInitializeEx(None, 0x2)  # COINIT_MULTITHREADED
        except Exception:
            pass
        start_smtc_poller()
        start_powercfg_poller()
        idle_start_time = time.time()
        was_video_playing = False
        while not stop_event.is_set():
            now = time.time()
            try:
                cur_threshold = active_threshold[0]
                raw_eval = evaluate_video_inactivity()
                active_videos = raw_eval.get("media_candidates", {}).get("active_videos", [])
                is_v_playing = bool(active_videos)

                if is_v_playing:
                    idle_start_time = now
                    idle_sec = 0.0
                    is_windows_idle = False
                else:
                    if was_video_playing:
                        idle_start_time = now
                    idle_sec = max(0.0, now - idle_start_time)
                    is_windows_idle = (idle_sec >= cur_threshold)

                was_video_playing = is_v_playing
                media_info = extract_simplified_media_info(raw_eval, idle_seconds=idle_sec, idle_threshold=cur_threshold)

                # Update countdown state machine
                countdown_state = countdown_ctrl.tick(
                    is_video_playing=is_v_playing or (web_server and web_server.is_paused),
                    delta_time=interval
                )

                # Daily analytics
                try:
                    today_stats = analytics.get_daily_summary()
                    today_watch_str = today_stats.get("video_hud_formatted", "00h 00m")
                except Exception:
                    today_watch_str = "00h 00m"

                is_warning = (countdown_state.get("state") == STATE_WARNING)
                is_muted_pb = bool(
                    raw_eval.get("is_muted_playback", False) or
                    raw_eval.get("state_code") == "VIDEO_MUTED" or
                    raw_eval.get("status") == "MUTED"
                )

                hud_state = dict(raw_eval)
                hud_state.update({
                    "is_video_playing": is_v_playing,
                    "status": "MUTED" if (is_v_playing and is_muted_pb) else ("ACTIVE" if is_v_playing else ("WARNING" if is_warning else "IDLE")),
                    "app_name": raw_eval.get("app_name") or media_info.get("active_player") or "Sentinel",
                    "title": raw_eval.get("track_title") or media_info.get("media_title") or "No Active Media",
                    "track_title": raw_eval.get("track_title") or media_info.get("media_title") or "No Active Media",
                    "platform": media_info.get("platform_tag") or "None",
                    "presentation_mode": raw_eval.get("presentation_mode", "WINDOWED") if isinstance(raw_eval.get("presentation_mode"), str) else raw_eval.get("presentation_mode", {}).get("mode", "WINDOWED"),
                    "audio_volume": raw_eval.get("app_volume_pct", raw_eval.get("master_volume_pct", 100)),
                    "is_muted": raw_eval.get("app_muted", raw_eval.get("is_app_muted", False)),
                    "peak_amplitude": media_info.get("audio_peak", 0.0),
                    "idle_seconds": idle_sec,
                    "idle_threshold": cur_threshold,
                    "today_watch_time": today_watch_str,
                    "watch_time": today_watch_str,
                    "is_warning": is_warning,
                    "countdown_str": countdown_state.get("remaining_str", format_countdown_mm_ss(countdown_state.get("remaining_countdown", cur_threshold))),
                    "formatted_countdown": countdown_state.get("formatted_countdown", f"{idle_sec:4.1f}s / {cur_threshold:.0f}s"),
                    "countdown_remaining": countdown_state.get("remaining_countdown", cur_threshold),
                    "countdown_total": countdown_state.get("total_countdown", cur_threshold)
                })

                hud.push_state(hud_state)

                # Tray update
                if is_warning:
                    tray_status = "WARNING"
                elif is_v_playing:
                    tray_status = "MUTED" if is_muted_pb else "ACTIVE"
                else:
                    tray_status = "IDLE"

                tray_title = f"Sentinel: {tray_status} | {media_info.get('active_player', 'None')}"
                tray.update_state(state=tray_status, tooltip=tray_title[:120])

                # Web server sync
                if web_server:
                    card_data = {
                        "timestamp": now,
                        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
                        "video_playing": is_v_playing,
                        "video_playing_str": "YES (हाँ)" if is_v_playing else "NO (ना)",
                        "media_type": media_info.get("media_type", "None"),
                        "playback_state": media_info.get("playback_state", "IDLE"),
                        "active_player": media_info.get("active_player", "None"),
                        "media_title": media_info.get("media_title", "None"),
                        "continuous_play_seconds": media_info.get("continuous_play_seconds", 0.0),
                        "continuous_pause_seconds": media_info.get("continuous_pause_seconds", 0.0),
                        "audio_peak": media_info.get("audio_peak", 0.0),
                        "activity_history_60m": media_info.get("activity_history_60m", []),
                        "idle_seconds": idle_sec,
                        "idle_threshold": threshold,
                        "is_video_playing": is_v_playing,
                        "is_windows_idle": is_windows_idle
                    }
                    web_server.update_state(card_data=card_data, raw_eval=raw_eval, countdown_state=countdown_state)

                # Record persistence tick
                storage.log_tick({
                    "timestamp": now,
                    "is_video_playing": is_v_playing,
                    "video_playing": is_v_playing,
                    "active_player": media_info.get("active_player"),
                    "platform_tag": media_info.get("platform_tag"),
                    "media_title": media_info.get("media_title"),
                    "media_type": media_info.get("media_type"),
                    "is_windows_idle": is_windows_idle,
                    "tick_seconds": interval
                })
            except Exception:
                pass

            stop_event.wait(interval)

    worker_thread = threading.Thread(target=sensor_worker, daemon=True, name="HUD-SensorWorker")
    worker_thread.start()

    try:
        hud.root.mainloop()
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        stop_event.set()
        stop_browser_ws_server()
        _powercfg_stop_event.set()
        _smtc_stop_event.set()
        tray.stop()
        stop_browser_ws_server()
        if web_server:
            web_server.stop()
        storage.close()
        hud.close()


def run_headless_mode(
    interval: float = 1.0,
    threshold: float = 60.0,
    enable_web: bool = False,
    web_port: int = 8765,
    bind_lan: bool = False,
    web_pin: Optional[str] = None
):
    """
    Launches Background Daemon with System Tray only (no Desktop HUD window).
    """
    storage = StorageManager()
    analytics = AnalyticsEngine(storage)

    countdown_ctrl = AutoShutdownController(
        grace_threshold_seconds=threshold,
        dry_run=True
    )

    web_server = None
    if enable_web:
        web_server = SentinelWebServer(
            host="0.0.0.0" if bind_lan else "127.0.0.1",
            port=web_port,
            bind_lan=bind_lan,
            pin=web_pin,
            countdown_controller=countdown_ctrl,
            storage=storage,
            analytics=analytics
        )
        web_server.start()
    start_browser_ws_server()

    stop_event = threading.Event()

    def on_snooze():
        countdown_ctrl.snooze(900)

    def on_export():
        try:
            import webbrowser
            exporter = ReportExporter(analytics=analytics, storage=storage)
            report_path = exporter.export_html()
            if report_path and os.path.exists(report_path):
                webbrowser.open("file://" + os.path.abspath(report_path))
        except Exception:
            pass

    def on_dashboard():
        import webbrowser
        webbrowser.open(f"http://localhost:{web_port}")

    def on_exit():
        stop_browser_ws_server()
        stop_event.set()

    start_browser_ws_server()
    start_browser_ws_server()
    tray = SystemTrayController(
        on_show_hide=None,
        on_snooze=on_snooze,
        on_export_report=on_export,
        on_dashboard=on_dashboard,
        on_exit=on_exit
    )
    tray.start()

    idle_start_time = time.time()
    was_video_playing = False

    print("Windows Video-Only Inactivity Sentinel running in Background Tray Daemon mode.")
    print("Right-click the system tray icon to view status, snooze, or exit.")
    if web_server:
        print(f"Web Dashboard live at: {web_server.get_access_url()}")

    try:
        while not stop_event.is_set():
            now = time.time()
            try:
                cur_threshold = web_server.idle_threshold if web_server else threshold
                raw_eval = evaluate_video_inactivity()
                active_videos = raw_eval.get("media_candidates", {}).get("active_videos", [])
                is_v_playing = bool(active_videos)

                if is_v_playing:
                    idle_start_time = now
                    idle_sec = 0.0
                    is_windows_idle = False
                else:
                    if was_video_playing:
                        idle_start_time = now
                    idle_sec = max(0.0, now - idle_start_time)
                    is_windows_idle = (idle_sec >= cur_threshold)

                was_video_playing = is_v_playing
                media_info = extract_simplified_media_info(raw_eval, idle_seconds=idle_sec, idle_threshold=cur_threshold)

                countdown_state = countdown_ctrl.tick(
                    is_video_playing=is_v_playing or (web_server and web_server.is_paused),
                    delta_time=interval
                )

                is_warning = (countdown_state.get("state") == STATE_WARNING)

                if is_warning:
                    tray_status = "WARNING"
                elif is_v_playing:
                    tray_status = "ACTIVE"
                else:
                    tray_status = "IDLE"

                tray_title = f"Sentinel: {tray_status} | {media_info.get('active_player', 'None')}"
                tray.update_state(state=tray_status, tooltip=tray_title[:120])

                if web_server:
                    card_data = {
                        "timestamp": now,
                        "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
                        "video_playing": is_v_playing,
                        "video_playing_str": "YES (हाँ)" if is_v_playing else "NO (ना)",
                        "media_type": media_info.get("media_type", "None"),
                        "playback_state": media_info.get("playback_state", "IDLE"),
                        "active_player": media_info.get("active_player", "None"),
                        "media_title": media_info.get("media_title", "None"),
                        "continuous_play_seconds": media_info.get("continuous_play_seconds", 0.0),
                        "continuous_pause_seconds": media_info.get("continuous_pause_seconds", 0.0),
                        "audio_peak": media_info.get("audio_peak", 0.0),
                        "activity_history_60m": media_info.get("activity_history_60m", []),
                        "idle_seconds": idle_sec,
                        "idle_threshold": cur_threshold,
                        "is_video_playing": is_v_playing,
                        "is_windows_idle": is_windows_idle
                    }
                    web_server.update_state(card_data=card_data, raw_eval=raw_eval, countdown_state=countdown_state)

                storage.log_tick({
                    "timestamp": now,
                    "is_video_playing": is_v_playing,
                    "video_playing": is_v_playing,
                    "active_player": media_info.get("active_player"),
                    "platform_tag": media_info.get("platform_tag"),
                    "media_title": media_info.get("media_title"),
                    "media_type": media_info.get("media_type"),
                    "is_windows_idle": is_windows_idle,
                    "tick_seconds": interval
                })
            except Exception:
                pass

            stop_event.wait(interval)
    except KeyboardInterrupt:
        pass
    finally:
        stop_event.set()
        stop_browser_ws_server()
        _powercfg_stop_event.set()
        _smtc_stop_event.set()
        tray.stop()
        stop_browser_ws_server()
        if web_server:
            web_server.stop()
        storage.close()


def run_web_mode(
    interval: float = 1.0,
    threshold: float = 60.0,
    web_port: int = 8765,
    bind_lan: bool = False,
    web_pin: Optional[str] = None
):
    """
    Launches Web Dashboard mode and opens browser to the dashboard URL.
    """
    import webbrowser
    web_url = f"http://localhost:{web_port}"
    print("=" * 70)
    print("  WINDOWS VIDEO-ONLY INACTIVITY SENTINEL - WEB DASHBOARD")
    print("=" * 70)
    print(f"  Web Dashboard live at: {web_url}")
    print("  Press Ctrl+C to terminate sentinel.")
    print("=" * 70)
    try:
        webbrowser.open(web_url)
    except Exception:
        pass

    run_headless_mode(
        interval=interval,
        threshold=threshold,
        enable_web=True,
        web_port=web_port,
        bind_lan=bind_lan,
        web_pin=web_pin
    )


def main():
    parser = argparse.ArgumentParser(
        description="Specialized Windows Video-Only Inactivity Sentinel (विंडोज वीडियो आइडल डिटेक्टर)"
    )
    parser.add_argument(
        "--cli",
        action="store_true",
        help="Launch High-Density ANSI Terminal Dashboard (CLI mode)"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Launch Background Daemon with System Tray only (no Desktop HUD window)"
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
    parser.add_argument(
        "--export",
        choices=["html", "csv", "json"],
        default=None,
        help="Generate and export analytics audit report in specified format (html, csv, json) then exit"
    )
    parser.add_argument(
        "--export-path",
        type=str,
        default=None,
        help="Custom destination file path for --export (optional)"
    )
    parser.add_argument(
        "--web",
        action="store_true",
        help="Launch the lightweight localhost web dashboard & remote control"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8765,
        help="Port number for the web dashboard server (default: 8765)"
    )
    parser.add_argument(
        "--lan",
        action="store_true",
        help="Bind web server to 0.0.0.0 and enable Wi-Fi / mobile remote control"
    )
    parser.add_argument(
        "--pin",
        type=str,
        default=None,
        help="4-digit PIN for remote authentication (auto-generated if omitted with --lan)"
    )

    args = parser.parse_args()

    # Phase 02: Report Export Mode
    if args.export:
        storage = StorageManager()
        analytics = AnalyticsEngine(storage)
        exporter = ReportExporter(analytics, storage)

        if args.export == "html":
            out_file = exporter.export_html(args.export_path)
        elif args.export == "csv":
            out_file = exporter.export_csv(args.export_path)
        elif args.export == "json":
            out_file = exporter.export_json(args.export_path)
        else:
            out_file = exporter.export_html(args.export_path)

        storage.close()
        print(f"Report exported successfully: {out_file}")
        sys.exit(0)

    # JSON mode or single check mode
    if args.json or args.check_once:
        sys.exit(run_single_check(threshold=args.threshold, idle_seconds=args.idle_sec, json_output=args.json))

    # Route based on execution mode flags
    if args.cli:
        run_sentinel_loop(
            interval=args.interval,
            threshold=args.threshold,
            enable_web=args.web,
            web_port=args.port,
            bind_lan=args.lan,
            web_pin=args.pin
        )
    elif args.headless:
        run_headless_mode(
            interval=args.interval,
            threshold=args.threshold,
            enable_web=args.web,
            web_port=args.port,
            bind_lan=args.lan,
            web_pin=args.pin
        )
    elif args.web:
        run_web_mode(
            interval=args.interval,
            threshold=args.threshold,
            web_port=args.port,
            bind_lan=args.lan,
            web_pin=args.pin
        )
    else:
        # Default: Native Transparent Desktop HUD
        run_hud_mode(
            interval=args.interval,
            threshold=args.threshold,
            enable_web=args.web,
            web_port=args.port,
            bind_lan=args.lan,
            web_pin=args.pin
        )


if __name__ == "__main__":
    main()
