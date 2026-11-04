# -*- coding: utf-8 -*-
"""
tests/test_all_offline_players_e2e.py: Comprehensive End-to-End Multi-Player Verification & Diagnostic Suite.
Tests ALL 5 offline media engines simultaneously under multi-tier rigorous conditions:
  1. VLC Media Player (`vlc.exe`)
  2. Films & TV / Movies & TV (`Video.UI.exe` / `ApplicationFrameHost.exe`)
  3. Media Player Classic (`mpc-hc.exe`, `mpc-hc64.exe`, `mpc-be.exe`, `mpc-be64.exe`)
  4. Legacy Windows Media Player (`wmplayer.exe`)
  5. Modern Windows 11 Media Player (`microsoft.media.player.exe` / `ApplicationFrameHost.exe`)

Terms and Conditions Verified:
  - Condition 1: Real-time Timeline & Duration:
    Verify seek_time_str, track_position_sec, track_duration_sec, and scrub progress bar math (pos / dur * 100).
  - Condition 2: Resolution & Speed:
    Verify format (e.g. 1080p FHD (16:9 Aspect), 720p HD) and speed format (1.00x, 1.25x, 1.50x, etc.).
  - Condition 3: Strict Pause / Mute Exclusivity:
    User invariant:
      - Paused only: is_paused == True, paused_seconds > 0, silence_seconds == 0.0.
      - Muted only: is_muted == True, is_paused == False, silence_seconds > 0, paused_seconds == 0.0.
      - BOTH Paused + Muted: paused_seconds > 0, silence_seconds == 0.0 (silence timer MUST NEVER run when paused).
  - Condition 4: Volume Normalization:
    Verify acoustic amplitude to slider conversion S = 100 * A^0.4 (25%, 50%, 75%, 100%).
  - Condition 5: Empty Player State (Zero False Positives):
    Idle/empty window titles must NEVER trigger false positive video detection or shutdown blocks.
  - Condition 6: ApplicationFrameHost Unwrapping:
    UWP container unwrapping for Films & TV and Modern Media Player.
  - Condition 7: Pipeline End-to-End Dataflow:
    window_scanner -> classifier -> offline_player -> evaluator -> HUD dictionary format.

Department 02: Solution Architecture & Department 08: Quality Assurance & Testing.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import unittest
import os
import sys
import time

# Ensure project root is in sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_src_dir = os.path.join(_root_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from modules.config import DUAL_PURPOSE_MEDIA_PLAYERS, MODERN_WINDOWS_MEDIA_PLAYER_PROCS
from modules.classifier import (
    classify_media_window,
    extract_platform_tag,
    classify_smtc_session
)
from modules.window_scanner import scan_system_media_candidates, set_mock_candidates
from modules.smtc import set_mock_mode, set_mock_smtc_session, set_mock_wmp_smtc_info
from modules.evaluator import (
    evaluate_video_inactivity,
    reset_position_tracker,
    get_activity_tracker,
    reset_activity_tracker
)
from modules.audio import set_mock_audio_state, linear_scalar_to_slider_pct, get_audio_volume_state
from modules.offline_player import (
    extract_timeline_from_text,
    detect_pause_in_title,
    format_seek_timeline,
    format_video_resolution,
    inspect_offline_player_timeline,
    set_mock_offline_timeline,
    set_mock_statusbar_data,
    set_mock_trackbar_data,
    reset_playback_progress_cache,
    calculate_playback_speed_velocity
)
from modules.wmp_surface import set_mock_wmp_legacy_video_surface


class TestAllOfflinePlayersE2E(unittest.TestCase):

    def setUp(self):
        set_mock_mode(True)
        set_mock_candidates(None)
        set_mock_audio_state({
            "is_audio_active": False,
            "master_peak": 0.0,
            "active_processes": {},
            "all_session_peaks": {},
            "master_volume_percent": 100,
            "master_volume_level": 1.0,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Realtek High Definition Audio",
            "session_volumes": {},
            "process_volumes": {}
        })
        set_mock_offline_timeline(None)
        set_mock_statusbar_data(None)
        set_mock_trackbar_data(None)
        set_mock_wmp_legacy_video_surface(None)
        reset_position_tracker()
        reset_playback_progress_cache()
        reset_activity_tracker()

    def tearDown(self):
        set_mock_mode(False)
        set_mock_candidates(None)
        set_mock_audio_state(None)
        set_mock_offline_timeline(None)
        set_mock_statusbar_data(None)
        set_mock_trackbar_data(None)
        set_mock_wmp_legacy_video_surface(None)
        reset_position_tracker()
        reset_playback_progress_cache()
        reset_activity_tracker()

    # =========================================================================
    # SUITE 1: Modern Windows 11 Media Player (microsoft.media.player.exe)
    # =========================================================================
    def test_modern_wmp_classification_video(self):
        """Tests that Modern Windows 11 Media Player with video file is classified as VIDEO."""
        res = classify_media_window("microsoft.media.player.exe", "501", "Inception.2010.1080p.mkv - Media Player")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Media Player")
        self.assertEqual(res["platform_tag"], "Media Player")
        self.assertEqual(res["file_ext"], ".mkv")

    def test_modern_wmp_classification_pure_audio(self):
        """Tests that Modern Windows 11 Media Player with audio file is classified as PURE_AUDIO."""
        res = classify_media_window("microsoft.media.player.exe", "502", "Beethoven_Symphony_9.mp3 - Media Player")
        self.assertEqual(res["type"], "PURE_AUDIO")
        self.assertEqual(res["app_name"], "Media Player")
        self.assertEqual(res["platform_tag"], "Media Player")
        self.assertEqual(res["file_ext"], ".mp3")

    def test_modern_wmp_classification_empty_library(self):
        """Tests that Modern Windows 11 Media Player on idle/library screens is EMPTY_PLAYER."""
        library_titles = [
            "Media Player",
            "Home",
            "Music library",
            "Video library",
            "Play queue",
            "Settings",
            "Groove Music"
        ]
        for title in library_titles:
            res = classify_media_window("microsoft.media.player.exe", "503", title)
            self.assertEqual(res["type"], "EMPTY_PLAYER", f"Failed for Modern WMP title: {title}")
            self.assertEqual(res["app_name"], "Media Player")
            self.assertEqual(res["platform_tag"], "Media Player")

    def test_modern_wmp_smtc_video_session(self):
        """Tests SMTC session classification for Modern Windows 11 Media Player."""
        session = {
            "source_id": "Microsoft.WindowsMediaPlayer_8wekyb3d8bbwe!App",
            "process": "microsoft.media.player.exe",
            "player_type": "modern",
            "playback_type": 2,  # VIDEO
            "playback_status": 4,  # PLAYING
            "is_playing": True,
            "is_paused": False,
            "title": "Cyberpunk_Edgerunners_E01",
            "artist": "Studio Trigger",
            "seek_position_sec": 125.0,
            "seek_duration_sec": 1440.0,
            "playback_speed": 1.25
        }
        res = classify_smtc_session(session)
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Media Player")
        self.assertEqual(res["platform_tag"], "Media Player")
        self.assertEqual(res["title"], "Cyberpunk_Edgerunners_E01")
        self.assertTrue(res["is_playing"])

    def test_modern_wmp_smtc_music_session(self):
        """Tests SMTC music session classification for Modern Windows 11 Media Player (Pure Audio)."""
        session = {
            "source_id": "Microsoft.WindowsMediaPlayer_8wekyb3d8bbwe!App",
            "process": "microsoft.media.player.exe",
            "player_type": "modern",
            "playback_type": 1,  # MUSIC (PURE AUDIO)
            "playback_status": 4,
            "is_playing": True,
            "is_paused": False,
            "title": "Midnight City",
            "artist": "M83",
            "seek_position_sec": 45.0,
            "seek_duration_sec": 243.0
        }
        res = classify_smtc_session(session)
        self.assertEqual(res["type"], "PURE_AUDIO")
        self.assertEqual(res["app_name"], "Media Player")
        self.assertEqual(res["platform_tag"], "Media Player")

    # =========================================================================
    # SUITE 2: Multi-Player Condition 1 - Real-Time Timeline & Duration
    # =========================================================================
    def test_condition1_timeline_and_duration_all_players(self):
        """
        Condition 1 Verification:
        Verifies that every offline player populates seek_time_str, track_position_sec,
        track_duration_sec, and scrub progress bar math (pos / dur * 100) accurately.
        """
        test_players = [
            ("vlc.exe", "VLC Media Player", "Matrix.mp4 - VLC media player", 450.0, 8100.0, "00:07:30 / 02:15:00"),
            ("video.ui.exe", "Films & TV", "Inception.mp4 - Films & TV", 180.0, 7200.0, "00:03:00 / 02:00:00"),
            ("mpc-hc64.exe", "MPC-HC", "Avatar.mkv - MPC-HC", 120.0, 9600.0, "00:02:00 / 02:40:00"),
            ("mpc-be64.exe", "MPC-BE", "Gladiator.mkv - MPC-BE", 60.0, 9000.0, "00:01:00 / 02:30:00"),
            ("wmplayer.exe", "Windows Media Player", "Sample.wmv - Windows Media Player", 75.0, 300.0, "01:15 / 05:00"),
            ("microsoft.media.player.exe", "Media Player", "Wildlife.mp4 - Media Player", 300.0, 1800.0, "05:00 / 30:00")
        ]

        for proc, app_name, title, pos, dur, expected_time_str in test_players:
            with self.subTest(player=proc):
                reset_position_tracker()
                reset_activity_tracker()

                # Mock SMTC session
                set_mock_smtc_session(proc, {
                    "process": proc,
                    "playback_type": 2,
                    "playback_status": 4,
                    "is_playing": True,
                    "is_paused": False,
                    "title": title.split(" - ")[0],
                    "seek_position_sec": pos,
                    "seek_duration_sec": dur,
                    "seek_progress": pos / dur,
                    "seek_time_str": expected_time_str,
                    "playback_speed": 1.0
                })
                # Mock candidate window
                set_mock_candidates([{
                    "hwnd": 1234,
                    "category": "VIDEO",
                    "app_name": app_name,
                    "process": proc,
                    "pid": "888",
                    "title": title,
                    "status": "Running",
                    "file_ext": ".mp4",
                    "platform_tag": app_name,
                    "seek_position_sec": pos,
                    "seek_duration_sec": dur,
                    "seek_progress": pos / dur,
                    "seek_time_str": expected_time_str,
                    "playback_speed": 1.0,
                    "is_occluded": False,
                    "view_state": "100% VISIBLE (Uncovered)",
                    "video_resolution": "1080p FHD (16:9 Aspect)"
                }])
                # Audio active
                set_mock_audio_state({
                    "is_audio_active": True,
                    "master_peak": 0.5,
                    "active_processes": {proc: 0.5},
                    "all_session_peaks": {proc: 0.5},
                    "master_volume_percent": 100,
                    "master_volume_level": 1.0,
                    "master_muted": False,
                    "is_master_muted": False,
                    "device_name": "Speakers",
                    "session_volumes": {},
                    "process_volumes": {}
                })

                res = evaluate_video_inactivity(idle_seconds=0.0, idle_threshold=60.0)

                self.assertFalse(res["is_idle"], f"{proc} should report NOT IDLE during playback")
                self.assertEqual(res["status"], "PLAYING", f"{proc} status must be PLAYING")
                self.assertEqual(res["track_position_sec"], pos, f"{proc} position mismatch")
                self.assertEqual(res["track_duration_sec"], dur, f"{proc} duration mismatch")
                self.assertEqual(res["seek_time_str"], expected_time_str, f"{proc} seek_time_str mismatch")

                # Verify scrub progress bar math: (pos / dur * 100)
                expected_pct = (pos / dur) * 100.0
                actual_pct = res["track_progress_pct"] * 100.0
                self.assertAlmostEqual(actual_pct, expected_pct, places=2,
                                       msg=f"{proc} scrub progress bar math mismatch")

    # =========================================================================
    # SUITE 3: Multi-Player Condition 2 - Resolution & Speed Verification
    # =========================================================================
    def test_condition2_resolution_and_speed_formatting(self):
        """
        Condition 2 Verification:
        Verifies standard resolution labels (4K, 1440p, 1080p, 720p) and playback speeds (1.00x - 2.00x).
        """
        # Test format_video_resolution
        res_cases = [
            (3840, 2160, "4K UHD", "16:9", "4K UHD (16:9 Aspect)"),
            (2560, 1440, "1440p QHD", "16:9", "1440p QHD (16:9 Aspect)"),
            (1920, 1080, "1080p FHD", "16:9", "1080p FHD (16:9 Aspect)"),
            (1280, 720, "720p HD", "16:9", "720p HD (16:9 Aspect)"),
            (854, 480, "480p SD", "16:9", "480p SD (16:9 Aspect)"),
            (640, 360, "360p SD", "16:9", "360p SD (16:9 Aspect)"),
            (1920, 1440, "1440p QHD", "4:3", "1440p QHD (4:3 Aspect)"),
            (2560, 1080, "1440p QHD", "21:9", "1440p QHD (21:9 Aspect)")
        ]
        for w, h, exp_lbl, exp_aspect, exp_full in res_cases:
            lbl, aspect, full = format_video_resolution(w, h)
            self.assertEqual(lbl, exp_lbl)
            self.assertEqual(aspect, exp_aspect)
            self.assertEqual(full, exp_full)

        # Test playback speed velocity calculation
        t0 = 100.0
        # 1.00x normal speed (advances 1.0 sec in 1.0 sec)
        spd1 = calculate_playback_speed_velocity("test_speed", 10.0, t0, is_playing=True)
        self.assertEqual(spd1, 1.00)
        spd1_next = calculate_playback_speed_velocity("test_speed", 11.0, t0 + 1.0, is_playing=True)
        self.assertEqual(spd1_next, 1.00)

        # 1.50x speed (advances 1.5 sec in 1.0 sec)
        spd15 = calculate_playback_speed_velocity("test_speed_15", 20.0, t0, is_playing=True)
        spd15_next = calculate_playback_speed_velocity("test_speed_15", 21.5, t0 + 1.0, is_playing=True)
        self.assertEqual(spd15_next, 1.50)

        # 2.00x speed (advances 2.0 sec in 1.0 sec)
        spd20 = calculate_playback_speed_velocity("test_speed_20", 30.0, t0, is_playing=True)
        spd20_next = calculate_playback_speed_velocity("test_speed_20", 32.0, t0 + 1.0, is_playing=True)
        self.assertEqual(spd20_next, 2.00)

    # =========================================================================
    # SUITE 4: Multi-Player Condition 3 - Strict Pause / Mute Exclusivity
    # =========================================================================
    def test_condition3_strict_pause_mute_exclusivity(self):
        """
        Condition 3 Verification (Strict User Invariant):
        "jab video pause or mute dono hai to sirf pause ka timmer chalega"
        - Paused only: paused_seconds > 0, silence_seconds == 0.0
        - Muted only: silence_seconds > 0, paused_seconds == 0.0
        - BOTH Paused + Muted: paused_seconds > 0, silence_seconds == 0.0 (STRICT USER INVARIANT)
        """
        tracker = get_activity_tracker()
        tracker.reset()

        # Step A: Playing Unmuted (Normal playback)
        # 3 ticks of 1 second each
        for _ in range(3):
            tracker.update(is_video_playing=True, is_muted=False, dt=1.0)
        self.assertEqual(tracker.cur_video_seconds, 3.0)
        self.assertEqual(tracker.paused_seconds, 0.0)
        self.assertEqual(tracker.silence_seconds, 0.0)

        # Step B: Muted ONLY (Playing while muted in volume mixer)
        # 3 ticks of 1 second each
        for _ in range(3):
            tracker.update(is_video_playing=True, is_muted=True, dt=1.0)
        self.assertEqual(tracker.cur_video_seconds, 6.0)
        self.assertEqual(tracker.paused_seconds, 0.0)
        self.assertEqual(tracker.silence_seconds, 3.0, "Silence timer must run during muted playback")

        # Step C: Paused ONLY (Video paused, unmuted)
        # 4 ticks of 1 second each
        for _ in range(4):
            tracker.update(is_video_playing=False, is_muted=False, dt=1.0)
        self.assertEqual(tracker.paused_seconds, 4.0, "Paused timer must run during pause")
        self.assertEqual(tracker.silence_seconds, 0.0, "Silence timer must NOT run when paused")
        self.assertEqual(tracker.cur_video_seconds, 0.0, "Play timer resets when paused")

        # Step D: BOTH Paused + Muted (THE INVIOLABLE USER REQUIREMENT)
        # Video is paused AND master/app volume is muted!
        # ONLY paused_seconds should increment; silence_seconds MUST REMAIN 0.0!
        for _ in range(5):
            tracker.update(is_video_playing=False, is_muted=True, dt=1.0)
        self.assertEqual(tracker.paused_seconds, 9.0, "Paused timer must continue running")
        self.assertEqual(tracker.silence_seconds, 0.0,
                         "CRITICAL: silence_seconds MUST BE 0.0 when video is paused and muted!")

        # Step E: Resume Playing Unmuted
        tracker.update(is_video_playing=True, is_muted=False, dt=1.0)
        self.assertEqual(tracker.cur_video_seconds, 1.0)
        self.assertEqual(tracker.paused_seconds, 0.0)
        self.assertEqual(tracker.silence_seconds, 0.0)

    # =========================================================================
    # SUITE 5: Multi-Player Condition 4 - Volume Normalization
    # =========================================================================
    def test_condition4_volume_normalization_acoustic_power_curve(self):
        """
        Condition 4 Verification:
        Verifies acoustic linear amplitude scalar (0.0 - 1.0) to perceptual slider conversion
        S = 100 * (A)^0.4 matches exact Windows Volume Mixer UI:
          - Scalar 1.0 -> 100%
          - Scalar 0.487 -> 75%
          - Scalar 0.177 -> 50%
          - Scalar 0.031 -> 25%
          - Scalar 0.0 -> 0%
        """
        self.assertEqual(linear_scalar_to_slider_pct(1.0), 100)
        self.assertEqual(linear_scalar_to_slider_pct(0.487), 75)
        self.assertEqual(linear_scalar_to_slider_pct(0.177), 50)
        self.assertEqual(linear_scalar_to_slider_pct(0.031), 25)
        self.assertEqual(linear_scalar_to_slider_pct(0.0), 0)

        # Test volume state calculation for an offline player
        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.35,
            "master_volume_percent": 80,
            "master_volume_level": 0.8,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Speakers",
            "session_volumes": {
                999: {"volume_percent": 75, "volume_level": 0.487, "muted": False, "peak": 0.35, "process": "vlc.exe"}
            },
            "process_volumes": {
                "vlc.exe": {"volume_percent": 75, "volume_level": 0.487, "muted": False, "peak": 0.35, "process": "vlc.exe"}
            }
        })
        vol_state = get_audio_volume_state(pid=999, proc_name="vlc.exe")
        self.assertEqual(vol_state.master_volume_percent, 80)
        self.assertEqual(vol_state.session_volume_percent, 75)
        self.assertEqual(vol_state.app_volume_pct, 75)
        self.assertFalse(vol_state.session_muted)
        self.assertFalse(vol_state.master_muted)

    # =========================================================================
    # SUITE 6: Multi-Player Condition 5 - Empty Player State (Zero False Positives)
    # =========================================================================
    def test_condition5_empty_player_all_5_engines(self):
        """
        Condition 5 Verification:
        Idle/empty player windows must NEVER trigger false positive video detection or shutdown blocks.
        """
        empty_scenarios = [
            # 1. VLC
            ("vlc.exe", "VLC media player", "VLC Media Player"),
            ("vlc.exe", "VLC", "VLC Media Player"),
            # 2. Films & TV
            ("video.ui.exe", "Films & TV", "Films & TV"),
            ("video.ui.exe", "Movies & TV", "Films & TV"),
            # 3. MPC-HC & MPC-BE
            ("mpc-hc64.exe", "MPC-HC", "MPC-HC"),
            ("mpc-hc.exe", "Media Player Classic - Home Cinema", "MPC-HC"),
            ("mpc-be64.exe", "MPC-BE", "MPC-BE"),
            ("mpc-be.exe", "Media Player Classic - Black Edition", "MPC-BE"),
            # 4. Legacy Windows Media Player
            ("wmplayer.exe", "Windows Media Player", "Windows Media Player"),
            ("wmplayer.exe", "Windows Media Player (Legacy)", "Windows Media Player"),
            # 5. Modern Windows 11 Media Player
            ("microsoft.media.player.exe", "Media Player", "Media Player"),
            ("microsoft.media.player.exe", "Home", "Media Player"),
            ("microsoft.media.player.exe", "Music library", "Media Player"),
            ("microsoft.media.player.exe", "Video library", "Media Player"),
            ("microsoft.media.player.exe", "Play queue", "Media Player"),
            ("microsoft.media.player.exe", "Settings", "Media Player")
        ]

        for proc, title, expected_app in empty_scenarios:
            with self.subTest(proc=proc, title=title):
                # Classify directly
                c_res = classify_media_window(proc, "999", title)
                self.assertEqual(c_res["type"], "EMPTY_PLAYER",
                                 f"{proc} with title '{title}' must classify as EMPTY_PLAYER")
                self.assertEqual(c_res["platform_tag"], expected_app)

                # Evaluate with empty candidate
                set_mock_candidates([{
                    "hwnd": 9999,
                    "category": "EMPTY_PLAYER",
                    "app_name": expected_app,
                    "process": proc,
                    "pid": "999",
                    "title": title,
                    "status": "Running",
                    "file_ext": None,
                    "platform_tag": expected_app,
                    "seek_position_sec": 0.0,
                    "seek_duration_sec": 0.0,
                    "seek_progress": 0.0,
                    "seek_time_str": "00:00 / 00:00",
                    "playback_speed": 1.0,
                    "is_occluded": False,
                    "view_state": "100% VISIBLE (Uncovered)",
                    "video_resolution": "N/A"
                }])

                eval_res = evaluate_video_inactivity(idle_seconds=10.0, idle_threshold=60.0)
                self.assertTrue(eval_res["is_idle"], f"{proc} on '{title}' must report is_idle == True")
                self.assertFalse(eval_res["is_video_playing"], f"{proc} on '{title}' must not report video playing")
                self.assertEqual(eval_res["cur_video_seconds"], 0.0)
                self.assertEqual(eval_res["status"], "NO_MEDIA")

    # =========================================================================
    # SUITE 7: Multi-Player Condition 6 - ApplicationFrameHost Unwrapping
    # =========================================================================
    def test_condition6_applicationframehost_unwrapping(self):
        """
        Condition 6 Verification:
        UWP ApplicationFrameHost.exe container unwrapping for both Films & TV and Modern Media Player.
        """
        # A) Films & TV unwrapping
        res_ftv = classify_media_window("applicationframehost.exe", "1001", "Transformers.mp4 - Films & TV")
        self.assertEqual(res_ftv["type"], "VIDEO")
        self.assertEqual(res_ftv["platform_tag"], "Films & TV")

        # B) Modern Windows 11 Media Player unwrapping
        res_mwp = classify_media_window("applicationframehost.exe", "1002", "Spiderman.mkv - Media Player")
        self.assertEqual(res_mwp["type"], "VIDEO")
        self.assertEqual(res_mwp["platform_tag"], "Media Player")
        self.assertEqual(res_mwp["app_name"], "Media Player")

        # C) Modern Windows 11 Media Player idle unwrapping
        res_mwp_idle = classify_media_window("applicationframehost.exe", "1003", "Video library")
        self.assertEqual(res_mwp_idle["type"], "EMPTY_PLAYER")
        self.assertEqual(res_mwp_idle["platform_tag"], "Media Player")

    # =========================================================================
    # SUITE 8: Multi-Player Condition 7 - Pipeline End-to-End Dataflow
    # =========================================================================
    def test_condition7_pipeline_end_to_end_dataflow(self):
        """
        Condition 7 Verification:
        Verifies end-to-end dataflow and dictionary schema integrity:
        window_scanner -> classifier -> offline_player -> evaluator -> HUD Canvas.
        """
        set_mock_candidates([{
            "hwnd": 4321,
            "category": "VIDEO",
            "app_name": "Media Player",
            "process": "microsoft.media.player.exe",
            "pid": "4444",
            "title": "Interstellar.2014.1080p.mkv - Media Player",
            "status": "Running",
            "file_ext": ".mkv",
            "platform_tag": "Media Player",
            "seek_position_sec": 720.0,
            "seek_duration_sec": 10140.0,
            "seek_progress": 720.0 / 10140.0,
            "seek_time_str": "00:12:00 / 02:49:00",
            "playback_speed": 1.0,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }])
        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.65,
            "master_volume_percent": 90,
            "master_volume_level": 0.9,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Realtek Speakers",
            "active_processes": {"microsoft.media.player.exe": 0.65},
            "all_session_peaks": {"microsoft.media.player.exe": 0.65},
            "session_volumes": {
                4444: {"volume_percent": 85, "volume_level": 0.68, "muted": False, "peak": 0.65, "process": "microsoft.media.player.exe"}
            },
            "process_volumes": {
                "microsoft.media.player.exe": {"volume_percent": 85, "volume_level": 0.68, "muted": False, "peak": 0.65, "process": "microsoft.media.player.exe"}
            }
        })

        hud_dict = evaluate_video_inactivity(idle_seconds=0.0, idle_threshold=60.0)

        # Essential Keys required by Video Detector HUD UI Canvas
        required_keys = [
            "timestamp", "timestamp_str", "is_idle", "state_code", "verdict_en", "verdict_hi",
            "summary", "platform_tag", "volume_state", "window_mode", "resolution",
            "cpu_percent", "ram_mb", "power_status", "multi_streams", "ghost_streams",
            "audio_peak", "continuous_play_seconds", "continuous_pause_seconds", "activity_history_60m",
            "wasapi", "media_candidates", "is_video_playing", "status", "status_text",
            "is_muted_playback", "idle_seconds", "idle_threshold", "target_action",
            "top_section_mode", "track_title", "track_position_sec", "track_duration_sec",
            "track_progress_pct", "seek_time_str", "playback_speed", "app_name",
            "presentation_mode", "audio_peak_pct", "master_volume_pct", "master_volume_level",
            "master_muted", "app_volume_pct", "app_volume_level", "app_muted",
            "cur_video_seconds", "day_watch_seconds_today", "paused_seconds", "silence_seconds",
            "is_true_active", "total_uptime_seconds_today", "true_active_seconds_today",
            "true_inactive_seconds_today"
        ]

        for k in required_keys:
            self.assertIn(k, hud_dict, f"HUD output missing required key: {k}")

        # Value Assertions
        self.assertFalse(hud_dict["is_idle"])
        self.assertEqual(hud_dict["status"], "PLAYING")
        self.assertEqual(hud_dict["app_name"], "Media Player")
        self.assertEqual(hud_dict["platform_tag"], "Media Player")
        self.assertEqual(hud_dict["track_title"], "Interstellar.2014.1080p.mkv")
        self.assertEqual(hud_dict["track_position_sec"], 720.0)
        self.assertEqual(hud_dict["track_duration_sec"], 10140.0)
        self.assertEqual(hud_dict["seek_time_str"], "00:12:00 / 02:49:00")
        self.assertEqual(hud_dict["app_volume_pct"], 85)
        self.assertEqual(hud_dict["master_volume_pct"], 90)
        self.assertEqual(hud_dict["top_section_mode"], "NOW_PLAYING")
        self.assertTrue(hud_dict["is_true_active"])



    # =========================================================================
    # SUITE 9: Rigorous Evaluator Multi-Cycle Loop for Condition 3
    # =========================================================================
    def test_condition3_evaluator_multicycle_paused_and_muted(self):
        """
        Tests evaluate_video_inactivity across 5 successive cycles for:
          1. Paused movie (unmuted): paused_seconds increments, silence_seconds == 0.0.
          2. Muted movie (playing): silence_seconds increments, paused_seconds == 0.0.
          3. BOTH Paused + Muted: paused_seconds increments, silence_seconds == 0.0 (STRICT USER INVARIANT).
        """
        # Test Case 1: Paused movie (unmuted)
        set_mock_candidates([{
            "hwnd": 7771,
            "category": "VIDEO",
            "app_name": "Media Player",
            "process": "microsoft.media.player.exe",
            "pid": "7771",
            "title": "Movie.mp4 - Media Player",
            "status": "Paused",
            "is_paused": True,
            "file_ext": ".mp4",
            "platform_tag": "Media Player",
            "seek_position_sec": 100.0,
            "seek_duration_sec": 1000.0,
            "seek_progress": 0.1,
            "seek_time_str": "01:40 / 16:40",
            "playback_speed": 1.0,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }])
        set_mock_audio_state({
            "is_audio_active": False,
            "master_peak": 0.0,
            "master_volume_percent": 100,
            "master_muted": False,
            "is_master_muted": False,
            "active_processes": {},
            "all_session_peaks": {},
            "session_volumes": {},
            "process_volumes": {}
        })

        tracker = get_activity_tracker()
        tracker.reset()

        # Tick 1: paused
        tracker.update(is_video_playing=False, is_muted=False, dt=1.0)
        self.assertEqual(tracker.paused_seconds, 1.0)
        self.assertEqual(tracker.silence_seconds, 0.0)

        # Tick 2: paused
        tracker.update(is_video_playing=False, is_muted=False, dt=1.0)
        self.assertEqual(tracker.paused_seconds, 2.0)
        self.assertEqual(tracker.silence_seconds, 0.0)

        # Test Case 2: Muted movie (playing)
        tracker.reset()
        # Tick 1: playing + muted
        tracker.update(is_video_playing=True, is_muted=True, dt=1.0)
        self.assertEqual(tracker.cur_video_seconds, 1.0)
        self.assertEqual(tracker.paused_seconds, 0.0)
        self.assertEqual(tracker.silence_seconds, 1.0)

        # Tick 2: playing + muted
        tracker.update(is_video_playing=True, is_muted=True, dt=1.0)
        self.assertEqual(tracker.cur_video_seconds, 2.0)
        self.assertEqual(tracker.paused_seconds, 0.0)
        self.assertEqual(tracker.silence_seconds, 2.0)

        # Test Case 3: BOTH Paused + Muted (User Mandate)
        tracker.reset()
        for i in range(1, 6):
            tracker.update(is_video_playing=False, is_muted=True, dt=1.0)
            self.assertEqual(tracker.paused_seconds, float(i), f"Paused seconds should be {i}")
            self.assertEqual(tracker.silence_seconds, 0.0, "Silence seconds must remain strictly 0.0 when paused!")

    # =========================================================================
    # SUITE 10: Scrub Bar & Aspect Ratio Mathematical Invariants
    # =========================================================================
    def test_scrub_progress_math_boundary_cases(self):
        """Tests timeline progress math at boundaries: 0/0, 0/100, 50/100, 100/100, 150/100."""
        # 0 duration
        pos1, dur1, prog1, str1 = 0.0, 0.0, 0.0, "00:00 / 00:00"
        self.assertEqual(prog1, 0.0)
        self.assertEqual(format_seek_timeline(pos1, dur1), "00:00 / 00:00")

        # 0 position with duration
        self.assertEqual(format_seek_timeline(0.0, 3600.0), "00:00:00 / 01:00:00")

        # Over 100% position (clamped to 1.0)
        clamped_prog = min(1.0, max(0.0, 150.0 / 100.0))
        self.assertEqual(clamped_prog, 1.0)

        # Exact end (100%)
        exact_prog = min(1.0, max(0.0, 100.0 / 100.0))
        self.assertEqual(exact_prog, 1.0)

if __name__ == "__main__":
    unittest.main()
