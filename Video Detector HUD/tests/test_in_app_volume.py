# -*- coding: utf-8 -*-
"""
tests/test_in_app_volume.py: Comprehensive Verification Suite for Pure In-App Volume & UI Automation.
Validates:
  1. Pure in-app volume extraction across all tiers:
     - Tier 0: Direct mock override (test isolation)
     - Tier 1: Win32 UI Automation (IUIAutomation) volume slider
     - Tier 2: Win32 msctls_trackbar32 child control enumeration
     - Tier 3: WASAPI ISimpleAudioVolume pure session query (never master-multiplied)
     - Tier 4: Status bar / Window text OSD fallback
  2. Elimination of Master Volume dependency:
     - App volume at 75% with master volume at 20% -> reports exactly 75% (not 15%)
     - App volume at 25% with master volume at 100% -> reports exactly 25%
     - App volume at 50% with master muted -> reports 50%, is_app_muted is False
  3. App-level Mute State Isolation:
     - In-app slider at 0% or muted -> is_app_muted is True, play_status reports MUTED
     - Master muted -> does not mute app-level telemetry
  4. ANSI Diagnostic Terminal Card Formatting:
     - Prominently displays: 🔊 App Volume: 75% (App Muted: NO) [Internal Player Level]
     - Distinguishes System Audio Master on separate line
  5. Multi-Player Detector Fleet Integration:
     - VLC, MPC-HC, PotPlayer, MPV, Modern Media Player, Films & TV

Department 02: Solution Architecture & Department 08: QA & Testing.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import unittest
import os
import sys

# Ensure 'src' and root are in sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_src_dir = os.path.join(_root_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from modules.audio import (
    get_detailed_audio_state,
    get_audio_volume_state,
    set_mock_audio_state
)
from modules.evaluator import evaluate_video_inactivity, evaluate_media_state
from modules.window_scanner import set_mock_candidates
from players.base_player import (
    BasePlayerDetector,
    get_app_internal_volume,
    extract_uia_volume_slider,
    extract_trackbar_volume,
    extract_wasapi_session_volume,
    extract_statusbar_volume,
    set_mock_app_volume,
    set_mock_trackbar_volume,
    set_mock_uia_volume,
    set_mock_statusbar_data,
    set_mock_offline_timeline,
    set_mock_window_mode,
    reset_playback_progress_cache
)

# Fleet detectors
from players.vlc.vlc_detector import VLCDetector
from players.mpc_classic.mpc_classic_detector import MPCClassicDetector
from players.potplayer.potplayer_detector import PotPlayerDetector
from players.mpv.mpv_detector import MPVDetector
from players.media_player_modern.modern_wmp_detector import ModernWMPDetector
from players.films_tv.films_tv_detector import FilmsTvDetector


class DummyTestDetector(BasePlayerDetector):
    player_name = "Test Media Player"
    process_names = ("testplayer.exe",)
    window_classes = ("TestPlayerWndClass",)

    def inspect_timeline(self, title, proc_name, hwnd=None, pid=None, is_playing=True, detected_file=None, detected_path=None):
        return {
            "seek_position_sec": 120.0,
            "seek_duration_sec": 300.0,
            "seek_progress": 0.4,
            "seek_time_str": "02:00 / 05:00",
            "clean_title": "Test Media File",
            "is_paused": False,
            "detected_file": "TestMedia.mp4",
            "detected_path": None,
            "video_resolution": "1080p FHD (16:9 Aspect)",
            "resolution_label": "1080p FHD",
            "playback_speed": 1.0
        }


class TestInAppVolumeArchitecture(unittest.TestCase):

    def setUp(self):
        reset_playback_progress_cache()
        set_mock_audio_state(None)
        set_mock_app_volume(None)
        set_mock_trackbar_volume(None)
        set_mock_uia_volume(None)
        set_mock_statusbar_data(None)
        set_mock_offline_timeline(None)
        set_mock_window_mode(None)

    def tearDown(self):
        reset_playback_progress_cache()
        set_mock_audio_state(None)
        set_mock_app_volume(None)
        set_mock_trackbar_volume(None)
        set_mock_uia_volume(None)
        set_mock_statusbar_data(None)
        set_mock_offline_timeline(None)
        set_mock_window_mode(None)

    # =========================================================================
    # 1. Elimination of Master Volume Dependency Tests
    # =========================================================================

    def test_app_volume_independent_from_master_volume_75_percent(self):
        """
        Validates that when the in-app slider is set to 75% and master volume is 20%,
        the detector reports 75% and does NOT multiply by master volume (which would yield 15%).
        """
        set_mock_audio_state({
            "master_volume_percent": 20,
            "master_volume_level": 0.20,
            "master_muted": False,
            "master_peak": 0.05,
            "session_volumes": {},
            "process_volumes": {}
        })
        set_mock_app_volume(volume_percent=75, is_muted=False, source="UIAutomation")

        detector = DummyTestDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x1234,
            "pid": 9999,
            "proc_name": "testplayer.exe",
            "title": "Test Media File",
            "class_name": "TestPlayerWndClass"
        }]

        telem = detector.get_realtime_telemetry()
        self.assertIsNotNone(telem)
        # In-App Volume must be EXACTLY 75%
        self.assertEqual(telem["app_volume_percent"], 75)
        self.assertEqual(telem["audio_volume_pct"], 75)
        self.assertFalse(telem["is_app_muted"])
        self.assertFalse(telem["is_muted"])
        # Master volume must remain separate
        self.assertEqual(telem["master_volume_pct"], 20)
        self.assertFalse(telem["is_master_muted"])

    def test_app_volume_independent_when_master_volume_muted(self):
        """
        Validates that when system master volume is MUTED, the app's internal volume
        remains unmuted if the in-app slider is at 50%.
        """
        set_mock_audio_state({
            "master_volume_percent": 0,
            "master_volume_level": 0.0,
            "master_muted": True,
            "master_peak": 0.0,
            "session_volumes": {},
            "process_volumes": {}
        })
        set_mock_app_volume(volume_percent=50, is_muted=False, source="Trackbar32")

        detector = DummyTestDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x1234,
            "pid": 9999,
            "proc_name": "testplayer.exe",
            "title": "Test Media File",
            "class_name": "TestPlayerWndClass"
        }]

        telem = detector.get_realtime_telemetry()
        self.assertIsNotNone(telem)
        self.assertEqual(telem["app_volume_percent"], 50)
        self.assertFalse(telem["is_app_muted"], "In-app mute state must not be corrupted by master mute!")
        self.assertFalse(telem["is_muted"])
        self.assertTrue(telem["is_master_muted"])

    def test_app_volume_at_25_percent_with_master_at_100_percent(self):
        """
        Validates that 25% in-app volume reports exactly 25% without acoustic peak distortion.
        """
        set_mock_audio_state({
            "master_volume_percent": 100,
            "master_volume_level": 1.0,
            "master_muted": False,
            "master_peak": 0.02, # Small peak that previously confused acoustic estimators
            "session_volumes": {},
            "process_volumes": {}
        })
        set_mock_app_volume(volume_percent=25, is_muted=False, source="UIAutomation:RangeValue")

        detector = DummyTestDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x1234,
            "pid": 9999,
            "proc_name": "testplayer.exe",
            "title": "Test Media File",
            "class_name": "TestPlayerWndClass"
        }]

        telem = detector.get_realtime_telemetry()
        self.assertEqual(telem["app_volume_percent"], 25)
        self.assertEqual(telem["audio_volume_pct"], 25)
        self.assertFalse(telem["is_app_muted"])

    # =========================================================================
    # 2. Tiered Extraction Logic Tests
    # =========================================================================

    def test_tier1_uia_volume_extraction_mock(self):
        """Verifies Tier 1 UI Automation volume slider extraction."""
        set_mock_uia_volume((85, False, "UIAutomation:RangeValue"))
        res = extract_uia_volume_slider(0x1234)
        self.assertIsNotNone(res)
        pct, muted, src = res
        self.assertEqual(pct, 85)
        self.assertFalse(muted)
        self.assertEqual(src, "UIAutomation:RangeValue")

        # Test in unified get_app_internal_volume
        vol_info = get_app_internal_volume(hwnd=0x1234, pid=123, proc_name="player.exe")
        self.assertEqual(vol_info["volume_percent"], 85)
        self.assertFalse(vol_info["is_muted"])
        self.assertTrue(vol_info["is_app_level"])

    def test_tier2_trackbar_volume_extraction_mock(self):
        """Verifies Tier 2 msctls_trackbar32 volume control extraction."""
        set_mock_trackbar_volume((60, False, "Trackbar32"))
        res = extract_trackbar_volume(0x1234)
        self.assertIsNotNone(res)
        pct, muted, src = res
        self.assertEqual(pct, 60)
        self.assertFalse(muted)
        self.assertEqual(src, "Trackbar32")

    def test_tier3_wasapi_pure_session_volume(self):
        """
        Verifies Tier 3 WASAPI ISimpleAudioVolume query extracts pure session volume
        without master multiplication.
        """
        set_mock_audio_state({
            "master_volume_percent": 30,
            "master_volume_level": 0.30,
            "master_muted": False,
            "session_volumes": {
                7788: {
                    "volume_percent": 90,
                    "volume_level": 0.90,
                    "muted": False,
                    "is_muted": False,
                    "peak": 0.15,
                    "process": "vlc.exe",
                    "pid": 7788
                }
            },
            "process_volumes": {
                "vlc.exe": {
                    "volume_percent": 90,
                    "volume_level": 0.90,
                    "muted": False,
                    "is_muted": False,
                    "peak": 0.15,
                    "process": "vlc.exe",
                    "pid": 7788
                }
            }
        })
        res = extract_wasapi_session_volume(pid=7788, proc_name="vlc.exe")
        self.assertIsNotNone(res)
        pct, muted, src = res
        self.assertEqual(pct, 90)
        self.assertFalse(muted)
        self.assertEqual(src, "WASAPISession")

        # Unified query fallback when hwnd is None
        vol_info = get_app_internal_volume(hwnd=None, pid=7788, proc_name="vlc.exe")
        self.assertEqual(vol_info["volume_percent"], 90)
        self.assertFalse(vol_info["is_muted"])
        self.assertEqual(vol_info["source"], "WASAPISession")

    def test_tier4_statusbar_volume_osd_parsing(self):
        """Verifies Tier 4 status bar OSD volume percentage and mute detection."""
        set_mock_statusbar_data({
            "seek_position_sec": 10.0,
            "seek_duration_sec": 100.0,
            "status": "Playing",
            "raw_text": "Playing | Volume: 70% | 00:10 / 01:40"
        })
        res = extract_statusbar_volume(0x1234)
        self.assertIsNotNone(res)
        pct, muted, src = res
        self.assertEqual(pct, 70)
        self.assertFalse(muted)
        self.assertEqual(src, "StatusBarOSD")

        # Test muted status text
        set_mock_statusbar_data({
            "seek_position_sec": 10.0,
            "seek_duration_sec": 100.0,
            "status": "Playing",
            "raw_text": "Playing | Volume: 0% [Muted]"
        })
        res_muted = extract_statusbar_volume(0x1234)
        self.assertIsNotNone(res_muted)
        pct_m, muted_m, _ = res_muted
        self.assertEqual(pct_m, 0)
        self.assertTrue(muted_m)

    # =========================================================================
    # 3. In-App Mute State Priority Tests
    # =========================================================================

    def test_in_app_mute_triggers_muted_play_status(self):
        """Verifies that in-app mute causes play_status to report MUTED."""
        set_mock_app_volume(volume_percent=0, is_muted=True, source="UIAutomation")
        detector = DummyTestDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x1234,
            "pid": 9999,
            "proc_name": "testplayer.exe",
            "title": "Test Media File",
            "class_name": "TestPlayerWndClass"
        }]

        telem = detector.get_realtime_telemetry()
        self.assertTrue(telem["is_app_muted"])
        self.assertTrue(telem["is_muted"])
        self.assertEqual(telem["app_volume_percent"], 0)
        self.assertIn("MUTED", telem["play_status"])

    # =========================================================================
    # 4. Prominent ANSI Diagnostic Card Display Tests
    # =========================================================================

    def test_ansi_cli_card_prominent_in_app_volume_display(self):
        """
        Verifies that render_cli_card prominently renders:
        '🔊 App Volume: 75% (App Muted: NO) [Internal Player Level]'
        and keeps Master Volume on a separate line.
        """
        detector = DummyTestDetector()
        mock_telem = {
            "player_name": "VLC Media Player",
            "proc_name": "vlc.exe",
            "pid": 5555,
            "hwnd": 0xABCDEF,
            "class_name": "Qt5QWindowIcon",
            "window_title": "BigBuckBunny.mp4 - VLC media player",
            "clean_title": "BigBuckBunny.mp4",
            "file_name": "BigBuckBunny.mp4",
            "file_path": "C:\\Videos\\BigBuckBunny.mp4",
            "file_exists": True,
            "window_mode": "WINDOWED",
            "is_focused": True,
            "play_status": "▶ PLAYING",
            "play_status_color": "\033[92m",
            "is_playing": True,
            "is_paused": False,
            "is_muted": False,
            "is_app_muted": False,
            "app_volume_percent": 75,
            "audio_volume_pct": 75,
            "app_volume_source": "UIAutomation:RangeValue",
            "master_volume_pct": 40,
            "is_master_muted": False,
            "seek_position_sec": 60.0,
            "seek_duration_sec": 600.0,
            "seek_progress": 0.1,
            "seek_progress_pct": 10.0,
            "seek_time_str": "01:00 / 10:00",
            "scrub_bar": "[██░░░░░░░░░░░░░░░░░░] 10.0%",
            "video_resolution": "1080p FHD (16:9 Aspect)",
            "resolution_label": "1080p FHD",
            "aspect_ratio": "16:9",
            "width": 1920,
            "height": 1080,
            "playback_speed": 1.0,
            "playback_speed_str": "1.00x",
            "peak_amplitude": 0.1234,
            "display_wake_lock": True,
            "timestamp": "12:34:56"
        }

        card = detector.render_cli_card(mock_telem)

        # Prominent In-App Volume display assertion
        self.assertIn("🔊 App Volume: 75% (App Muted: NO) [Internal Player Level]", card)
        # Separate System Audio assertion
        self.assertIn("Master: 40% (Master Muted: NO)", card)
        self.assertIn("Audio Volume:", card)

    # =========================================================================
    # 5. Multi-Player Detector Fleet Integration Tests
    # =========================================================================

    def test_vlc_detector_realtime_telemetry_in_app_volume(self):
        """Verifies VLC detector correctly maps in-app volume."""
        set_mock_app_volume(volume_percent=80, is_muted=False, source="UIAutomation")
        detector = VLCDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x1111,
            "pid": 2222,
            "proc_name": "vlc.exe",
            "title": "Movie.mkv - VLC media player",
            "class_name": "Qt5QWindowIcon"
        }]
        telem = detector.get_realtime_telemetry()
        self.assertIsNotNone(telem)
        self.assertEqual(telem["app_volume_percent"], 80)
        self.assertEqual(telem["audio_volume_pct"], 80)
        card = detector.render_cli_card(telem)
        self.assertIn("🔊 App Volume: 80% (App Muted: NO) [Internal Player Level]", card)

    def test_mpc_classic_detector_realtime_telemetry_in_app_volume(self):
        """Verifies MPC-HC detector correctly maps in-app volume via trackbar."""
        set_mock_app_volume(volume_percent=65, is_muted=False, source="Trackbar32")
        detector = MPCClassicDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x3333,
            "pid": 4444,
            "proc_name": "mpc-hc64.exe",
            "title": "Show.mp4 - MPC-HC",
            "class_name": "MPC-HC"
        }]
        telem = detector.get_realtime_telemetry()
        self.assertIsNotNone(telem)
        self.assertEqual(telem["app_volume_percent"], 65)
        card = detector.render_cli_card(telem)
        self.assertIn("🔊 App Volume: 65% (App Muted: NO) [Internal Player Level]", card)

    def test_potplayer_detector_realtime_telemetry_in_app_volume(self):
        """Verifies PotPlayer detector correctly maps in-app volume."""
        set_mock_app_volume(volume_percent=45, is_muted=False, source="UIAutomation")
        detector = PotPlayerDetector()
        detector.find_active_windows = lambda: [{
            "hwnd": 0x5555,
            "pid": 6666,
            "proc_name": "potplayer64.exe",
            "title": "Anime.mkv - PotPlayer",
            "class_name": "PotPlayer64"
        }]
        telem = detector.get_realtime_telemetry()
        self.assertIsNotNone(telem)
        self.assertEqual(telem["app_volume_percent"], 45)

    def test_modern_wmp_and_films_tv_uwp_in_app_volume(self):
        """Verifies Modern Media Player and Films & TV UWP map in-app volume."""
        set_mock_app_volume(volume_percent=90, is_muted=False, source="WASAPISession")
        wmp = ModernWMPDetector()
        wmp.find_active_windows = lambda: [{
            "hwnd": 0x7777,
            "pid": 8888,
            "proc_name": "microsoft.media.player.exe",
            "title": "Media Player",
            "class_name": "ApplicationFrameWindow"
        }]
        telem_wmp = wmp.get_realtime_telemetry()
        self.assertIsNotNone(telem_wmp)
        self.assertEqual(telem_wmp["app_volume_percent"], 90)

        ftv = FilmsTvDetector()
        ftv.find_active_windows = lambda: [{
            "hwnd": 0x9999,
            "pid": 1010,
            "proc_name": "video.ui.exe",
            "title": "Films & TV",
            "class_name": "ApplicationFrameWindow"
        }]
        telem_ftv = ftv.get_realtime_telemetry()
        self.assertIsNotNone(telem_ftv)
        self.assertEqual(telem_ftv["app_volume_percent"], 90)

    # =========================================================================
    # 6. Evaluator & Idle Detection Pipeline Integration Tests
    # =========================================================================

    def test_evaluator_uses_in_app_volume(self):
        """Verifies evaluate_media_state receives and respects in-app volume."""
        set_mock_audio_state({
            "master_volume_percent": 15,
            "master_volume_level": 0.15,
            "master_muted": False,
            "master_peak": 0.05,
            "active_processes": {"vlc.exe": 0.05},
            "all_session_peaks": {"vlc.exe": 0.05},
            "session_volumes": {},
            "process_volumes": {}
        })
        set_mock_app_volume(volume_percent=75, is_muted=False, source="UIAutomation")

        candidates = [{
            "hwnd": 1234,
            "pid": 5000,
            "process": "vlc.exe",
            "app_name": "VLC Media Player",
            "title": "Test Video - VLC media player",
            "platform_tag": "vlc",
            "category": "VIDEO",
            "is_video_window": True,
            "is_occluded": False
        }]
        set_mock_candidates(candidates)

        media_st = evaluate_media_state(idle_seconds=5.0, idle_threshold=60.0)
        self.assertEqual(media_st.app_volume_pct, 75)
        self.assertEqual(media_st.master_volume_pct, 15)
        self.assertFalse(media_st.app_muted)
        set_mock_candidates(None)


if __name__ == "__main__":
    unittest.main()
