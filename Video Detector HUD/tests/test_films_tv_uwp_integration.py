# -*- coding: utf-8 -*-
"""
tests/test_films_tv_uwp_integration.py: Hermetic Unit Tests for UWP Films & TV (video.ui.exe)
Integration: Window Scanner, Classifier, SMTC Timeline, Evaluator, and HUD Pipeline.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add project root to sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_src_dir = os.path.join(_root_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from modules.win32_api import resolve_uwp_real_process, reset_uwp_cache
from modules.classifier import classify_media_window, extract_platform_tag, classify_smtc_session
from modules.window_scanner import scan_system_media_candidates, set_mock_candidates
from modules.smtc import set_mock_mode, set_mock_smtc_session
from modules.evaluator import evaluate_video_inactivity, reset_position_tracker
from modules.audio import set_mock_audio_state
from modules.offline_player import reset_playback_progress_cache, set_mock_offline_timeline


class TestFilmsTVUWPIntegration(unittest.TestCase):

    def setUp(self):
        reset_uwp_cache()
        set_mock_mode(True)
        set_mock_candidates(None)
        set_mock_audio_state(None)
        set_mock_offline_timeline(None)
        reset_position_tracker()
        reset_playback_progress_cache()

    def tearDown(self):
        reset_uwp_cache()
        set_mock_mode(False)
        set_mock_candidates(None)
        set_mock_audio_state(None)
        set_mock_offline_timeline(None)
        reset_position_tracker()
        reset_playback_progress_cache()

    def test_uwp_resolve_fallback_title_films_tv(self):
        """Tests that resolve_uwp_real_process resolves ApplicationFrameHost window title to video.ui.exe."""
        pid, proc = resolve_uwp_real_process(99999, title="Wild_Animals_4K.mp4 - Films & TV")
        self.assertEqual(proc, "video.ui.exe")

    def test_uwp_resolve_fallback_title_movies_tv(self):
        """Tests that resolve_uwp_real_process resolves ApplicationFrameHost window title with Movies & TV."""
        pid, proc = resolve_uwp_real_process(99998, title="Action_Movie.mkv - Movies & TV")
        self.assertEqual(proc, "video.ui.exe")

    def test_platform_tag_films_tv(self):
        """Tests extract_platform_tag recognizes video.ui.exe and Films & TV titles."""
        self.assertEqual(extract_platform_tag("Doc.mp4 - Films & TV", "applicationframehost.exe"), "Films & TV")
        self.assertEqual(extract_platform_tag("Films & TV", "applicationframehost.exe"), "Films & TV")
        self.assertEqual(extract_platform_tag("Doc.mp4", "video.ui.exe"), "Films & TV")
        self.assertEqual(extract_platform_tag("Clip.mov - Movies & TV", "video.ui.exe"), "Films & TV")

    def test_classifier_applicationframehost_films_tv(self):
        """Tests classify_media_window classifies ApplicationFrameHost hosting Films & TV as VIDEO."""
        res = classify_media_window("applicationframehost.exe", "10236", "Inception_Trailer.mp4 - Films & TV")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Films & TV")
        self.assertEqual(res["platform_tag"], "Films & TV")

    def test_classifier_applicationframehost_bare_home_screen(self):
        """Tests classify_media_window classifies bare 'Films & TV' without video as EMPTY_PLAYER."""
        res = classify_media_window("applicationframehost.exe", "10236", "Films & TV")
        self.assertEqual(res["type"], "EMPTY_PLAYER")
        self.assertEqual(res["app_name"], "Films & TV")

    def test_classifier_video_ui_direct(self):
        """Tests classify_media_window classifies video.ui.exe with video file as VIDEO."""
        res = classify_media_window("video.ui.exe", "12345", "Interstellar_IMAX.mp4")
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Films & TV")
        self.assertEqual(res["platform_tag"], "Films & TV")

    def test_smtc_classify_films_tv(self):
        """Tests classify_smtc_session classifies video.ui.exe SMTC session as VIDEO."""
        sess = {
            "source_id": "Microsoft.ZuneVideo_8wekyb3d8bbwe!Microsoft.ZuneVideo",
            "process": "video.ui.exe",
            "title": "Avatar_The_Way_Of_Water.mp4",
            "artist": "",
            "playback_type": 2,
            "playback_status": 4,
            "seek_position_sec": 30.0,
            "seek_duration_sec": 600.0,
            "seek_time_str": "00:30 / 10:00",
            "playback_speed": 1.0
        }
        res = classify_smtc_session(sess)
        self.assertEqual(res["type"], "VIDEO")
        self.assertEqual(res["app_name"], "Films & TV")
        self.assertEqual(res["platform_tag"], "Films & TV")

    def test_evaluator_films_tv_playback_pipeline(self):
        """End-to-end evaluation pipeline test with mocked Films & TV candidate and SMTC."""
        # Mock window scanner candidate
        cand = {
            "hwnd": 123456,
            "category": "VIDEO",
            "app_name": "Films & TV",
            "process": "video.ui.exe",
            "pid": "10555",
            "title": "Nature_Documentary.mp4",
            "status": "Running",
            "file_ext": ".mp4",
            "rationale": "Films & TV video playback detected",
            "platform_tag": "Films & TV",
            "seek_position_sec": 15.0,
            "seek_duration_sec": 340.0,
            "seek_progress": 0.0441,
            "seek_time_str": "00:15 / 05:40",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)",
            "width": 1920,
            "height": 1080,
            "aspect_ratio": "16:9",
            "rendering_fps": "60 FPS (Active Motion)"
        }
        set_mock_candidates([cand])

        # Mock SMTC session
        set_mock_smtc_session("video.ui.exe", {
            "source_id": "Microsoft.ZuneVideo_8wekyb3d8bbwe!Microsoft.ZuneVideo",
            "process": "video.ui.exe",
            "title": "Nature_Documentary.mp4",
            "artist": "",
            "playback_type": 2,
            "playback_status": 4,  # Playing
            "is_playing": True,
            "is_paused": False,
            "seek_position_sec": 15.0,
            "seek_duration_sec": 340.0,
            "seek_progress": 0.0441,
            "seek_time_str": "00:15 / 05:40",
            "playback_speed": 1.00
        })

        # Mock WASAPI audio peak
        set_mock_audio_state({
            "master_peak": 0.35,
            "master_volume_percent": 80,
            "master_volume_level": 0.8,
            "master_muted": False,
            "device_name": "Speakers",
            "active_processes": {"video.ui.exe": 0.35},
            "all_session_peaks": {"video.ui.exe": 0.35}
        })

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

        eval_res = evaluate_video_inactivity()
        self.assertTrue(eval_res["is_video_playing"])
        self.assertFalse(eval_res["is_idle"])
        self.assertEqual(eval_res["platform_tag"], "Films & TV")
        self.assertEqual(eval_res["app_name"], "Films & TV")
        self.assertEqual(eval_res["track_title"], "Nature_Documentary.mp4")
        self.assertEqual(eval_res["seek_time_str"], "00:15 / 05:40")
        self.assertEqual(eval_res["video_resolution"], "1080p FHD (16:9 Aspect)")
        self.assertEqual(eval_res["playback_speed"], 1.0)
        self.assertAlmostEqual(eval_res["track_position_sec"], 15.0, places=1)
        self.assertAlmostEqual(eval_res["track_duration_sec"], 340.0, places=1)

    def test_evaluator_films_tv_paused_pipeline(self):
        """Tests that when Films & TV is paused in SMTC, evaluator reports PAUSED status and IDLE=True."""
        cand = {
            "hwnd": 123456,
            "category": "VIDEO",
            "app_name": "Films & TV",
            "process": "video.ui.exe",
            "pid": "10555",
            "title": "Nature_Documentary.mp4",
            "status": "Paused",
            "file_ext": ".mp4",
            "rationale": "Films & TV video playback detected",
            "platform_tag": "Films & TV",
            "seek_position_sec": 45.0,
            "seek_duration_sec": 340.0,
            "seek_progress": 0.132,
            "seek_time_str": "00:45 / 05:40",
            "playback_speed": 1.00,
            "is_paused": True,
            "title_indicates_paused": True,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        set_mock_smtc_session("video.ui.exe", {
            "source_id": "Microsoft.ZuneVideo_8wekyb3d8bbwe!Microsoft.ZuneVideo",
            "process": "video.ui.exe",
            "title": "Nature_Documentary.mp4",
            "artist": "",
            "playback_type": 2,
            "playback_status": 5,  # Paused
            "is_playing": False,
            "is_paused": True,
            "seek_position_sec": 45.0,
            "seek_duration_sec": 340.0,
            "seek_progress": 0.132,
            "seek_time_str": "00:45 / 05:40",
            "playback_speed": 1.00
        })

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

        eval_res = evaluate_video_inactivity()
        self.assertFalse(eval_res["is_video_playing"])
        self.assertTrue(eval_res["is_idle"])
        self.assertEqual(eval_res["status"], "PAUSED")
        self.assertEqual(eval_res["platform_tag"], "Films & TV")
        self.assertEqual(eval_res["track_title"], "Nature_Documentary.mp4")
        self.assertEqual(eval_res["seek_time_str"], "00:45 / 05:40")


    def test_evaluator_films_tv_bare_title_with_active_smtc(self):
        """Tests that Windows 11 Films & TV with static bare title 'Films & TV' and active SMTC is detected as PLAYING video."""
        cand = {
            "hwnd": 6882532,
            "category": "EMPTY_PLAYER",
            "app_name": "Films & TV",
            "process": "applicationframehost.exe",
            "pid": "10236",
            "title": "Films & TV",
            "status": "Running",
            "file_ext": None,
            "rationale": "Films & TV open",
            "platform_tag": "Films & TV",
            "seek_position_sec": 0.0,
            "seek_duration_sec": 0.0,
            "seek_progress": 0.0,
            "seek_time_str": "00:00 / 00:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        set_mock_smtc_session("video.ui.exe", {
            "source_id": "Microsoft.ZuneVideo_8wekyb3d8bbwe!Microsoft.ZuneVideo",
            "process": "video.ui.exe",
            "title": "Quantum_Physics_Explained.mp4",
            "artist": "",
            "playback_type": 2,
            "playback_status": 4,  # Playing
            "is_playing": True,
            "is_paused": False,
            "seek_position_sec": 75.0,
            "seek_duration_sec": 600.0,
            "seek_progress": 0.125,
            "seek_time_str": "01:15 / 10:00",
            "playback_speed": 1.00
        })

        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.15,
            "active_processes": {"video.ui.exe": 0.15},
            "all_session_peaks": {"video.ui.exe": 0.15},
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
        self.assertEqual(eval_res["platform_tag"], "Films & TV")
        self.assertEqual(eval_res["track_title"], "Quantum_Physics_Explained.mp4")
        self.assertEqual(eval_res["seek_time_str"], "01:15 / 10:00")
        self.assertIn("Films & TV", eval_res["verdict_en"])

    def test_evaluator_modern_media_player_bare_title_with_active_smtc(self):
        """Tests that Windows 11 Modern Media Player with static bare title 'Media Player' and active SMTC is detected as PLAYING video."""
        cand = {
            "hwnd": 2557058,
            "category": "EMPTY_PLAYER",
            "app_name": "Media Player",
            "process": "applicationframehost.exe",
            "pid": "10236",
            "title": "Media Player",
            "status": "Running",
            "file_ext": None,
            "rationale": "Media Player open",
            "platform_tag": "Media Player",
            "seek_position_sec": 0.0,
            "seek_duration_sec": 0.0,
            "seek_progress": 0.0,
            "seek_time_str": "00:00 / 00:00",
            "playback_speed": 1.00,
            "is_paused": False,
            "title_indicates_paused": False,
            "is_occluded": False,
            "view_state": "100% VISIBLE (Uncovered)",
            "video_resolution": "1080p FHD (16:9 Aspect)"
        }
        set_mock_candidates([cand])

        set_mock_smtc_session("microsoft.media.player.exe", {
            "source_id": "Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic",
            "process": "microsoft.media.player.exe",
            "title": "Machine_Learning_Course.mp4",
            "artist": "",
            "playback_type": 2,
            "playback_status": 4,  # Playing
            "is_playing": True,
            "is_paused": False,
            "seek_position_sec": 120.0,
            "seek_duration_sec": 1200.0,
            "seek_progress": 0.10,
            "seek_time_str": "02:00 / 20:00",
            "playback_speed": 1.00
        })

        set_mock_audio_state({
            "is_audio_active": True,
            "master_peak": 0.22,
            "active_processes": {"microsoft.media.player.exe": 0.22},
            "all_session_peaks": {"microsoft.media.player.exe": 0.22},
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
        self.assertEqual(eval_res["platform_tag"], "Media Player")
        self.assertEqual(eval_res["track_title"], "Machine_Learning_Course.mp4")
        self.assertEqual(eval_res["seek_time_str"], "02:00 / 20:00")
        self.assertIn("Media Player", eval_res["verdict_en"])


if __name__ == "__main__":
    unittest.main()

