# -*- coding: utf-8 -*-
"""
tests/test_mpc_wmp_integration.py: Hermetic Integration & Unit Test Suite for Phase 2:
MPC-HC, MPC-BE, and Legacy Windows Media Player (wmplayer.exe).
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import unittest
import os
import sys
import time

# Add project root to sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_src_dir = os.path.join(_root_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from modules.classifier import (
    classify_media_window,
    extract_platform_tag,
    classify_smtc_session
)
from modules.window_scanner import scan_system_media_candidates, set_mock_candidates
from modules.smtc import set_mock_mode, set_mock_smtc_session
from modules.evaluator import evaluate_video_inactivity, reset_position_tracker, get_activity_tracker, reset_activity_tracker
from modules.audio import set_mock_audio_state
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


class TestMPCWMPIntegration(unittest.TestCase):

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
            "device_name": "Speakers",
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
    # 1. Platform Tagging Tests
    # =========================================================================
    def test_extract_platform_tag_mpc_hc(self):
        """Tests that extract_platform_tag identifies MPC-HC process and title variants."""
        self.assertEqual(extract_platform_tag("Avatar.mp4 - MPC-HC", "mpc-hc64.exe"), "MPC-HC")
        self.assertEqual(extract_platform_tag("Avatar.mp4", "mpc-hc.exe"), "MPC-HC")
        self.assertEqual(extract_platform_tag("Avatar.mp4 - MPC-HC x64", "mpc-hc64.exe"), "MPC-HC")
        self.assertEqual(extract_platform_tag("[00:15 / 05:30] Movie.mkv - MPC-HC", "mpc-hc64.exe"), "MPC-HC")
        self.assertEqual(extract_platform_tag("Movie.mkv - Media Player Classic", "mpc-hc.exe"), "MPC-HC")

    def test_extract_platform_tag_mpc_be(self):
        """Tests that extract_platform_tag identifies MPC-BE process and title variants."""
        self.assertEqual(extract_platform_tag("Interstellar.mkv - MPC-BE", "mpc-be64.exe"), "MPC-BE")
        self.assertEqual(extract_platform_tag("Interstellar.mkv", "mpc-be.exe"), "MPC-BE")
        self.assertEqual(extract_platform_tag("[01:23 / 10:45] Clip.mp4 - MPC-BE", "mpc-be64.exe"), "MPC-BE")
        self.assertEqual(extract_platform_tag("Media Player Classic - Black Edition", "mpc-be64.exe"), "MPC-BE")

    def test_extract_platform_tag_windows_media_player(self):
        """Tests that extract_platform_tag identifies Legacy and Modern Windows Media Player."""
        self.assertEqual(extract_platform_tag("Wildlife.wmv - Windows Media Player", "wmplayer.exe"), "Windows Media Player")
        self.assertEqual(extract_platform_tag("Windows Media Player", "wmplayer.exe"), "Windows Media Player")
        self.assertEqual(extract_platform_tag("Now Playing: Nature.mp4", "wmplayer.exe"), "Windows Media Player")
        self.assertEqual(extract_platform_tag("Sample.mp4 - Media Player", "microsoft.media.player.exe"), "Media Player")

    # =========================================================================
    # 2. Window Classifier Tests (VIDEO vs PURE_AUDIO vs EMPTY_PLAYER)
    # =========================================================================
    def test_classifier_mpc_hc_video_file(self):
        """Tests that classify_media_window classifies MPC-HC with video file as VIDEO."""
        res = classify_media_window("mpc-hc64.exe", "1010", "Dune_Part_Two_4K.mp4 - MPC-HC")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "MPC-HC")
        self.assertEqual(res["platform_tag"], "MPC-HC")

    def test_classifier_mpc_hc_pure_audio(self):
        """Tests that classify_media_window classifies MPC-HC playing audio file as PURE_AUDIO."""
        res = classify_media_window("mpc-hc64.exe", "1010", "Soundtrack_Theme.mp3 - MPC-HC")
        self.assertEqual(res["type"], "PURE_AUDIO")
        self.assertEqual(res["app_name"], "MPC-HC")
        self.assertEqual(res["platform_tag"], "MPC-HC")

    def test_classifier_mpc_hc_empty_player(self):
        """Tests that bare MPC-HC window with no media loaded classifies as EMPTY_PLAYER."""
        for bare in ["MPC-HC", "MPC-HC x64", "Media Player Classic", "Media Player Classic - Home Cinema", "Stopped"]:
            res = classify_media_window("mpc-hc64.exe", "1010", bare)
            self.assertEqual(res["type"], "EMPTY_PLAYER", f"Failed for bare title: {bare}")
            self.assertEqual(res["app_name"], "MPC-HC")
            self.assertEqual(res["platform_tag"], "MPC-HC")

    def test_classifier_mpc_be_video_file(self):
        """Tests that classify_media_window classifies MPC-BE with video file as VIDEO."""
        res = classify_media_window("mpc-be64.exe", "2020", "Cyberpunk_Edgerunners.mkv - MPC-BE")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "MPC-BE")
        self.assertEqual(res["platform_tag"], "MPC-BE")

    def test_classifier_mpc_be_pure_audio(self):
        """Tests that classify_media_window classifies MPC-BE playing flac audio as PURE_AUDIO."""
        res = classify_media_window("mpc-be64.exe", "2020", "Synthwave_Track.flac - MPC-BE")
        self.assertEqual(res["type"], "PURE_AUDIO")
        self.assertEqual(res["app_name"], "MPC-BE")
        self.assertEqual(res["platform_tag"], "MPC-BE")

    def test_classifier_mpc_be_empty_player(self):
        """Tests that bare MPC-BE window with no media loaded classifies as EMPTY_PLAYER."""
        for bare in ["MPC-BE", "MPC-BE x64", "Media Player Classic - Black Edition", "Stopped"]:
            res = classify_media_window("mpc-be64.exe", "2020", bare)
            self.assertEqual(res["type"], "EMPTY_PLAYER", f"Failed for bare title: {bare}")
            self.assertEqual(res["app_name"], "MPC-BE")
            self.assertEqual(res["platform_tag"], "MPC-BE")

    def test_classifier_wmplayer_video_surface(self):
        """Tests that Legacy wmplayer.exe with detected video surface classifies as VIDEO."""
        set_mock_wmp_legacy_video_surface({
            "is_video": True,
            "reason": "Active EVRVideoHandler video rendering surface",
            "file_ext": ".mp4",
            "file_name": "Wildlife_4K.mp4"
        })
        res = classify_media_window("wmplayer.exe", "3030", "Wildlife_4K.mp4 - Windows Media Player")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Windows Media Player")
        self.assertEqual(res["platform_tag"], "Windows Media Player")

    def test_classifier_wmplayer_pure_audio(self):
        """Tests that Legacy wmplayer.exe playing audio file classifies as PURE_AUDIO."""
        res = classify_media_window("wmplayer.exe", "3030", "Classical_Concerto.mp3 - Windows Media Player")
        self.assertEqual(res["type"], "PURE_AUDIO")
        self.assertEqual(res["app_name"], "Windows Media Player")
        self.assertEqual(res["platform_tag"], "Windows Media Player")

    def test_classifier_wmplayer_empty_player(self):
        """Tests that bare Windows Media Player window with no media classifies as EMPTY_PLAYER."""
        set_mock_wmp_legacy_video_surface({
            "is_video": False,
            "reason": "No video surface",
            "file_ext": None,
            "file_name": None
        })
        res = classify_media_window("wmplayer.exe", "3030", "Windows Media Player")
        self.assertEqual(res["type"], "EMPTY_PLAYER")
        self.assertEqual(res["app_name"], "Windows Media Player")
        self.assertEqual(res["platform_tag"], "Windows Media Player")

    # =========================================================================
    # 3. Timeline & Pause Extraction from Title & Status Bar
    # =========================================================================
    def test_timeline_extraction_standard_timestamps(self):
        """Tests extract_timeline_from_text handles standard MM:SS / MM:SS and HH:MM:SS."""
        res = extract_timeline_from_text("[00:15 / 05:30] BigBuckBunny.mp4 - MPC-HC")
        self.assertIsNotNone(res)
        pos, dur, prog, time_str, clean = res
        self.assertEqual(pos, 15.0)
        self.assertEqual(dur, 330.0)
        self.assertAlmostEqual(prog, 15.0 / 330.0, places=3)
        self.assertEqual(time_str, "00:15 / 05:30")
        self.assertEqual(clean, "BigBuckBunny.mp4 - MPC-HC")

    def test_timeline_extraction_negative_remaining_format(self):
        """Tests extract_timeline_from_text handles MPC-HC/MPC-BE negative remaining time (00:15 / -05:15)."""
        res = extract_timeline_from_text("[00:15 / -05:15] BigBuckBunny.mp4 - MPC-HC")
        self.assertIsNotNone(res)
        pos, dur, prog, time_str, clean = res
        self.assertEqual(pos, 15.0)
        self.assertEqual(dur, 330.0)  # 15s elapsed + 315s remaining = 330s total
        self.assertEqual(time_str, "00:15 / 05:30")

    def test_detect_pause_in_title(self):
        """Tests detect_pause_in_title identifies all real-world MPC-HC/MPC-BE/WMP paused & stopped indicators."""
        self.assertTrue(detect_pause_in_title("[Paused] Movie.mp4 - MPC-HC"))
        self.assertTrue(detect_pause_in_title("(Paused) Movie.mp4 - MPC-HC"))
        self.assertTrue(detect_pause_in_title("Movie.mp4 - MPC-HC [Paused]"))
        self.assertTrue(detect_pause_in_title("[Stopped] Movie.mp4 - MPC-HC"))
        self.assertTrue(detect_pause_in_title("Movie.mp4 - MPC-BE [Stopped]"))
        self.assertTrue(detect_pause_in_title("Paused - Windows Media Player"))
        self.assertTrue(detect_pause_in_title("Stopped - MPC-BE"))
        self.assertFalse(detect_pause_in_title("Movie.mp4 - MPC-HC"))
        self.assertFalse(detect_pause_in_title("Wildlife.wmv - Windows Media Player"))

    def test_inspect_offline_player_timeline_clean_title_and_suffixes(self):
        """Tests inspect_offline_player_timeline strips player suffixes and pause indicators cleanly."""
        tl = inspect_offline_player_timeline(
            title="[00:45 / 10:00] Inception_Trailer.mp4 - MPC-HC",
            proc_name="mpc-hc64.exe"
        )
        self.assertEqual(tl["clean_title"], "Inception_Trailer.mp4")
        self.assertEqual(tl["seek_position_sec"], 45.0)
        self.assertEqual(tl["seek_duration_sec"], 600.0)
        self.assertEqual(tl["seek_time_str"], "00:45 / 10:00")
        self.assertFalse(tl["is_paused"])

    def test_inspect_offline_player_timeline_paused_title(self):
        """Tests inspect_offline_player_timeline flags is_paused=True when title has pause tag."""
        tl = inspect_offline_player_timeline(
            title="[Paused] [02:00 / 20:00] Documentary.mkv - MPC-BE",
            proc_name="mpc-be64.exe"
        )
        self.assertEqual(tl["clean_title"], "Documentary.mkv")
        self.assertEqual(tl["seek_position_sec"], 120.0)
        self.assertEqual(tl["seek_duration_sec"], 1200.0)
        self.assertTrue(tl["is_paused"])

    def test_inspect_offline_player_timeline_statusbar_simulation(self):
        """Tests status bar mock data integration for MPC-HC/MPC-BE."""
        set_mock_statusbar_data({
            "seek_position_sec": 85.0,
            "seek_duration_sec": 1200.0,
            "status": "Playing",
            "is_playing": True,
            "is_paused": False
        })
        tl = inspect_offline_player_timeline(
            title="Sample_Video.mp4 - MPC-HC",
            proc_name="mpc-hc64.exe",
            hwnd=12345
        )
        self.assertEqual(tl["seek_position_sec"], 85.0)
        self.assertEqual(tl["seek_duration_sec"], 1200.0)
        self.assertEqual(tl["seek_time_str"], "01:25 / 20:00")
        self.assertFalse(tl["is_paused"])

    def test_inspect_offline_player_timeline_trackbar_simulation(self):
        """Tests trackbar position mock data integration for MPC-HC."""
        set_mock_trackbar_data((250, 0, 1000))  # 25% progress
        # Pass title with total duration but no position
        tl = inspect_offline_player_timeline(
            title="[00:00 / 08:00] Nature_Clip.mp4 - MPC-HC",
            proc_name="mpc-hc64.exe",
            hwnd=12345
        )
        self.assertEqual(tl["seek_duration_sec"], 480.0)
        self.assertAlmostEqual(tl["seek_position_sec"], 120.0, places=1)  # 25% of 480s = 120s
        self.assertEqual(tl["seek_time_str"], "02:00 / 08:00")

    # =========================================================================
    # 4. SMTC Session Classification for MPC & WMP
    # =========================================================================
    def test_smtc_classify_mpc_hc(self):
        """Tests classify_smtc_session classifies MPC-HC sessions correctly."""
        sess_video = {
            "source_id": "mpc-hc64",
            "process": "mpc-hc64.exe",
            "title": "Gladiator_II.mp4",
            "playback_type": 2,
            "playback_status": 4
        }
        res_v = classify_smtc_session(sess_video)
        self.assertEqual(res_v["type"], "VIDEO")
        self.assertEqual(res_v["app_name"], "MPC-HC")
        self.assertEqual(res_v["platform_tag"], "MPC-HC")

        sess_audio = {
            "source_id": "mpc-hc64",
            "process": "mpc-hc64.exe",
            "title": "Podcast_Episode.mp3",
            "playback_type": 1,
            "playback_status": 4
        }
        res_a = classify_smtc_session(sess_audio)
        self.assertEqual(res_a["type"], "PURE_AUDIO")
        self.assertEqual(res_a["platform_tag"], "MPC-HC")

    def test_smtc_classify_mpc_be(self):
        """Tests classify_smtc_session classifies MPC-BE sessions correctly."""
        sess = {
            "source_id": "mpc-be64",
            "process": "mpc-be64.exe",
            "title": "Interstellar_IMAX.mkv",
            "playback_type": 2,
            "playback_status": 4
        }
        res = classify_smtc_session(sess)
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "MPC-BE")
        self.assertEqual(res["platform_tag"], "MPC-BE")

    def test_smtc_classify_wmplayer(self):
        """Tests classify_smtc_session classifies Legacy Windows Media Player sessions."""
        sess = {
            "source_id": "wmplayer",
            "process": "wmplayer.exe",
            "title": "Home_Video.wmv",
            "playback_type": 2,
            "playback_status": 4
        }
        res = classify_smtc_session(sess)
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Windows Media Player")
        self.assertEqual(res["platform_tag"], "Windows Media Player")

    # =========================================================================
    # 5. Resolution Formatting & Playback Speed Detection
    # =========================================================================
    def test_format_video_resolution(self):
        """Tests format_video_resolution calculates tags and aspect ratios properly."""
        label, aspect, full = format_video_resolution(3840, 2160)
        self.assertEqual(label, "4K UHD")
        self.assertEqual(aspect, "16:9")
        self.assertEqual(full, "4K UHD (16:9 Aspect)")

        label, aspect, full = format_video_resolution(1920, 1080)
        self.assertEqual(label, "1080p FHD")
        self.assertEqual(aspect, "16:9")

        label, aspect, full = format_video_resolution(1280, 720)
        self.assertEqual(label, "720p HD")
        self.assertEqual(aspect, "16:9")

        label, aspect, full = format_video_resolution(1440, 1080)
        self.assertEqual(aspect, "4:3")

    def test_playback_speed_velocity(self):
        """Tests calculate_playback_speed_velocity snaps to standard speeds."""
        key = "test_mpc_proc"
        now = time.time()
        # Initialize
        calculate_playback_speed_velocity(key, cur_pos=0.0, now=now, is_playing=True)
        # Advance 1.5 seconds in 1.0 second elapsed -> 1.5x speed
        speed = calculate_playback_speed_velocity(key, cur_pos=1.5, now=now + 1.0, is_playing=True)
        self.assertEqual(speed, 1.50)

    # =========================================================================
    # 6. End-to-End Evaluator Integration (MPC-HC, MPC-BE, WMP)
    # =========================================================================
    def test_e2e_evaluator_mpc_hc_active_playback(self):
        """End-to-end evaluation pipeline test with actively playing MPC-HC."""
        cand = {
            "hwnd": 11111,
            "category": "VIDEO",
            "app_name": "MPC-HC",
            "process": "mpc-hc64.exe",
            "pid": "5501",
            "title": "Avengers_Endgame.mp4",
            "status": "Running",
            "file_ext": ".mp4",
            "rationale": "Playing video file (.mp4) in MPC-HC",
            "platform_tag": "MPC-HC",
            "seek_position_sec": 120.0,
            "seek_duration_sec": 7200.0,
            "seek_progress": 0.0167,
            "seek_time_str": "02:00 / 02:00:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "4K UHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.42,
            "active_processes": {"mpc-hc64.exe": 0.42},
            "all_session_peaks": {"mpc-hc64.exe": 0.42},
            "master_volume_percent": 90,
            "master_volume_level": 0.9,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Headphones",
            "session_volumes": {"5501": {"volume_percent": 90, "muted": False, "peak": 0.42, "process": "mpc-hc64.exe", "pid": 5501}},
            "process_volumes": {"mpc-hc64.exe": {"volume_percent": 90, "muted": False, "peak": 0.42, "process": "mpc-hc64.exe", "pid": 5501}}
        })

        eval_res = evaluate_video_inactivity()
        self.assertTrue(eval_res["is_video_playing"])
        self.assertFalse(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "PLAYING")
        self.assertEqual(eval_res["platform_tag"], "MPC-HC")
        self.assertEqual(eval_res["track_title"], "Avengers_Endgame.mp4")
        self.assertEqual(eval_res["seek_time_str"], "00:02:00 / 02:00:00")
        self.assertIn("MPC-HC", eval_res["verdict_en"])

    def test_e2e_evaluator_mpc_hc_paused_playback(self):
        """End-to-end evaluation pipeline test with paused MPC-HC (verifying strict silence timer exclusivity)."""
        cand = {
            "hwnd": 11111,
            "category": "VIDEO",
            "app_name": "MPC-HC",
            "process": "mpc-hc64.exe",
            "pid": "5501",
            "title": "Avengers_Endgame.mp4",
            "status": "Paused",
            "file_ext": ".mp4",
            "rationale": "Video is paused in MPC-HC",
            "platform_tag": "MPC-HC",
            "seek_position_sec": 120.0,
            "seek_duration_sec": 7200.0,
            "seek_progress": 0.0167,
            "seek_time_str": "02:00 / 02:00:00",
            "playback_speed": 1.00,
            "is_paused": True,
            "title_indicates_paused": True,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "4K UHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        eval_res = evaluate_video_inactivity()
        self.assertFalse(eval_res["is_video_playing"])
        self.assertTrue(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "PAUSED")
        self.assertEqual(eval_res["platform_tag"], "MPC-HC")
        self.assertEqual(eval_res["seek_time_str"], "00:02:00 / 02:00:00")
        self.assertIn("paused in MPC-HC", eval_res["verdict_en"])

        # Strict silence exclusivity check: silence_seconds MUST be 0.0 when paused
        tracker = get_activity_tracker()
        self.assertEqual(tracker.silence_seconds, 0.0)
        self.assertGreaterEqual(tracker.continuous_pause_seconds, 0.0)

    def test_e2e_evaluator_mpc_be_muted_playback_advancing(self):
        """End-to-end test with MPC-BE playing muted, confirmed via advancing seek position."""
        cand_ident = f"mpc-be64.exe_{6602}"
        now = time.time()
        # Seed first cycle position at 30.0s
        from modules.evaluator import _position_tracker
        _position_tracker[cand_ident] = {
            "last_pos": 30.0,
            "last_ts": now - 1.0,
            "advancing_streak": 1,
            "static_streak": 0,
            "is_advancing": True,
            "was_playing": True,
            "was_muted": True
        }

        # Second cycle position at 32.0s (actively advancing forward while audio is silent)
        cand = {
            "hwnd": 22222,
            "category": "VIDEO",
            "app_name": "MPC-BE",
            "process": "mpc-be64.exe",
            "pid": "6602",
            "title": "Cyberpunk_Edgerunners.mkv",
            "status": "Running",
            "file_ext": ".mkv",
            "rationale": "Video is advancing on screen",
            "platform_tag": "MPC-BE",
            "seek_position_sec": 32.0,
            "seek_duration_sec": 1400.0,
            "seek_progress": 0.0228,
            "seek_time_str": "00:32 / 23:20",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        eval_res = evaluate_video_inactivity()
        self.assertTrue(eval_res["is_video_playing"])
        self.assertFalse(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "MUTED")
        self.assertEqual(eval_res["platform_tag"], "MPC-BE")
        self.assertIn("playing muted in MPC-BE", eval_res["verdict_en"])

    def test_e2e_evaluator_windows_media_player_playback(self):
        """End-to-end evaluation pipeline test with actively playing Legacy Windows Media Player."""
        cand = {
            "hwnd": 33333,
            "category": "VIDEO",
            "app_name": "Windows Media Player",
            "process": "wmplayer.exe",
            "pid": "7703",
            "title": "Wildlife.wmv",
            "status": "Running",
            "file_ext": ".wmv",
            "rationale": "Active video rendering surface detected in Legacy Windows Media Player",
            "platform_tag": "Windows Media Player",
            "seek_position_sec": 10.0,
            "seek_duration_sec": 30.0,
            "seek_progress": 0.3333,
            "seek_time_str": "00:10 / 00:30",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "720p HD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.28,
            "active_processes": {"wmplayer.exe": 0.28},
            "all_session_peaks": {"wmplayer.exe": 0.28},
            "master_volume_percent": 100,
            "master_volume_level": 1.0,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Speakers",
            "session_volumes": {"7703": {"volume_percent": 100, "muted": False, "peak": 0.28, "process": "wmplayer.exe", "pid": 7703}},
            "process_volumes": {"wmplayer.exe": {"volume_percent": 100, "muted": False, "peak": 0.28, "process": "wmplayer.exe", "pid": 7703}}
        })

        eval_res = evaluate_video_inactivity()
        self.assertTrue(eval_res["is_video_playing"])
        self.assertFalse(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "PLAYING")
        self.assertEqual(eval_res["platform_tag"], "Windows Media Player")
        self.assertEqual(eval_res["track_title"], "Wildlife.wmv")
        self.assertEqual(eval_res["seek_time_str"], "00:10 / 00:30")
        self.assertIn("Windows Media Player", eval_res["verdict_en"])

    def test_e2e_evaluator_empty_players_no_false_positive(self):
        """Tests that when MPC-HC or Windows Media Player are open with no media, system is IDLE."""
        cand_mpc = {
            "hwnd": 44444,
            "category": "EMPTY_PLAYER",
            "app_name": "MPC-HC",
            "process": "mpc-hc64.exe",
            "pid": "8804",
            "title": "MPC-HC",
            "status": "Running",
            "file_ext": None,
            "rationale": "MPC-HC open with no media loaded",
            "platform_tag": "MPC-HC",
            "seek_position_sec": 0.0,
            "seek_duration_sec": 0.0,
            "seek_progress": 0.0,
            "seek_time_str": "00:00 / 00:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1920x1080"
        }
        cand_wmp = {
            "hwnd": 55555,
            "category": "EMPTY_PLAYER",
            "app_name": "Windows Media Player",
            "process": "wmplayer.exe",
            "pid": "9905",
            "title": "Windows Media Player",
            "status": "Running",
            "file_ext": None,
            "rationale": "Windows Media Player open on library screen with no media loaded",
            "platform_tag": "Windows Media Player",
            "seek_position_sec": 0.0,
            "seek_duration_sec": 0.0,
            "seek_progress": 0.0,
            "seek_time_str": "00:00 / 00:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1920x1080"
        }
        set_mock_candidates([cand_mpc, cand_wmp])

        eval_res = evaluate_video_inactivity()
        self.assertFalse(eval_res["is_video_playing"])
        self.assertTrue(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "NO_MEDIA")
        self.assertIn("No video is currently playing", eval_res["verdict_en"])


    def test_e2e_evaluator_wmplayer_detected_surface_with_filepath(self):
        """Tests that Legacy wmplayer.exe with detected video surface and path produces full telemetry."""
        cand_wmp = {
            "hwnd": 9090,
            "category": "VIDEO",
            "app_name": "Windows Media Player",
            "process": "wmplayer.exe",
            "pid": "4820",
            "title": "Wildlife_Documentary_4K.mp4",
            "status": "Running",
            "file_ext": ".mp4",
            "rationale": "Active video rendering surface detected in Legacy Windows Media Player (EVRVideoHandler (1920x1080))",
            "platform_tag": "Windows Media Player",
            "seek_position_sec": 15.0,
            "seek_duration_sec": 300.0,
            "seek_progress": 0.05,
            "seek_time_str": "00:15 / 05:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "detected_file": "Wildlife_Documentary_4K.mp4",
            "detected_path": "C:\\Videos\\Wildlife_Documentary_4K.mp4",
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "4K UHD (16:9 Aspect)"
        }
        set_mock_candidates([cand_wmp])

        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.25,
            "active_processes": {"wmplayer.exe": 0.25},
            "all_session_peaks": {"wmplayer.exe": 0.25},
            "master_volume_percent": 100,
            "master_volume_level": 1.0,
            "master_muted": False,
            "is_master_muted": False,
            "device_name": "Speakers",
            "session_volumes": {},
            "process_volumes": {}
        })

        eval_res = evaluate_video_inactivity()
        self.assertTrue(eval_res["is_video_playing"])
        self.assertFalse(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "PLAYING")
        self.assertEqual(eval_res["platform_tag"], "Windows Media Player")
        self.assertEqual(eval_res["track_title"], "Wildlife_Documentary_4K.mp4")
        self.assertEqual(eval_res["seek_time_str"], "00:15 / 05:00")
        self.assertEqual(eval_res["video_resolution"], "4K UHD (16:9 Aspect)")
        self.assertIn("Windows Media Player", eval_res["verdict_en"])


if __name__ == "__main__":
    unittest.main()

