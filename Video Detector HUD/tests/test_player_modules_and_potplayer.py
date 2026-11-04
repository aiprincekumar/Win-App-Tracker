# -*- coding: utf-8 -*-
"""
tests/test_player_modules_and_potplayer.py: Unit Tests for Modular Player Subsystems & Daum PotPlayer.
Verifies:
  1. Daum PotPlayer platform classification, process recognition, and dual-purpose handling.
  2. PotPlayer custom title formats:
     - "[Paused] Movie.mp4 - PotPlayer"
     - "Movie.mp4 - PotPlayer [00:15 / 05:30]"
     - "Movie.mp4 - PotPlayer (00:15 / 05:30)"
     - "[Stopped] Movie.mp4 - PotPlayer"
     - "PotPlayer" (Empty / Idle state)
  3. All 5 dedicated modular detectors:
     - VLCDetector (`players.vlc.vlc_detector`)
     - FilmsTvDetector (`players.films_tv.films_tv_detector`)
     - MPCClassicDetector (`players.mpc_classic.mpc_classic_detector`)
     - ModernWMPDetector (`players.media_player_modern.modern_wmp_detector`)
     - PotPlayerDetector (`players.potplayer.potplayer_detector`)
  4. Real-time telemetry card contract:
     Verifies all 9 mandatory metrics are present:
     - Title, File Path, Play/Pause/Mute status, Seek Time, Total Duration,
       Scrub Progress %, Resolution, Playback Speed, Audio Volume.
  5. Suffix stripping and clean_title extraction across all engines.

Department 02: Solution Architecture & Department 08: QA & Testing.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import unittest
import os
import sys

# Ensure 'src' and project root are in sys.path
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_src_dir = os.path.join(_root_dir, "src")
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
if _root_dir not in sys.path:
    sys.path.insert(0, _root_dir)

from modules.classifier import extract_platform_tag, classify_media_window
from modules.config import DUAL_PURPOSE_MEDIA_PLAYERS
from modules.offline_player import (
    inspect_offline_player_timeline,
    reset_playback_progress_cache,
    set_mock_offline_timeline
)
from players.vlc.vlc_detector import VLCDetector, inspect_vlc_timeline
from players.films_tv.films_tv_detector import FilmsTvDetector, inspect_films_tv_timeline
from players.mpc_classic.mpc_classic_detector import MPCClassicDetector, inspect_mpc_classic_timeline
from players.media_player_modern.modern_wmp_detector import ModernWMPDetector, inspect_modern_wmp_timeline
from players.potplayer.potplayer_detector import PotPlayerDetector, inspect_potplayer_timeline
from players.base_player import make_scrub_bar


class TestPlayerModulesAndPotPlayer(unittest.TestCase):

    def setUp(self):
        reset_playback_progress_cache()
        set_mock_offline_timeline(None)

    def tearDown(self):
        reset_playback_progress_cache()
        set_mock_offline_timeline(None)

    # =========================================================================
    # 1. PotPlayer Platform & Classifier Tests
    # =========================================================================

    def test_potplayer_platform_tag(self):
        """Tests that extract_platform_tag accurately identifies PotPlayer processes and titles."""
        self.assertEqual(extract_platform_tag("Avatar.mp4 - PotPlayer", "potplayer64.exe"), "PotPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mp4 - PotPlayer", "potplayermini64.exe"), "PotPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mp4 - PotPlayer", "potplayermini.exe"), "PotPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mp4 - PotPlayer", "potplayer.exe"), "PotPlayer")
        self.assertEqual(extract_platform_tag("PotPlayer", "potplayer64.exe"), "PotPlayer")

    def test_potplayer_dual_purpose_catalog(self):
        """Verifies PotPlayer executables are mapped in DUAL_PURPOSE_MEDIA_PLAYERS."""
        self.assertIn("potplayer.exe", DUAL_PURPOSE_MEDIA_PLAYERS)
        self.assertIn("potplayer64.exe", DUAL_PURPOSE_MEDIA_PLAYERS)
        self.assertIn("potplayermini64.exe", DUAL_PURPOSE_MEDIA_PLAYERS)
        self.assertIn("potplayermini.exe", DUAL_PURPOSE_MEDIA_PLAYERS)

    def test_potplayer_classify_video_vs_audio(self):
        """Verifies PotPlayer classifies video files as VIDEO and audio files as PURE_AUDIO."""
        # Video file playing
        v_res = classify_media_window("potplayermini64.exe", "1234", "Gladiator_4K.mkv - PotPlayer")
        self.assertEqual(v_res["type"], "VIDEO")
        self.assertEqual(v_res["app_name"], "PotPlayer")

        # Audio file playing
        a_res = classify_media_window("potplayermini64.exe", "1234", "Song_Acoustic.mp3 - PotPlayer")
        self.assertEqual(a_res["type"], "PURE_AUDIO")
        self.assertEqual(a_res["app_name"], "PotPlayer")

        # Empty player
        e_res = classify_media_window("potplayermini64.exe", "1234", "PotPlayer")
        self.assertEqual(e_res["type"], "EMPTY_PLAYER")

    # =========================================================================
    # 2. PotPlayer Dedicated Timeline & Title Parsing Tests
    # =========================================================================

    def test_potplayer_embedded_brackets_timeline(self):
        """Tests PotPlayer window titles with embedded bracket timeline format."""
        tl = inspect_potplayer_timeline(
            title="Dune_Part_Two.mp4 - PotPlayer [00:45 / 02:46:00]",
            proc_name="potplayermini64.exe"
        )
        self.assertEqual(tl["clean_title"], "Dune_Part_Two.mp4")
        self.assertEqual(tl["seek_position_sec"], 45.0)
        self.assertEqual(tl["seek_duration_sec"], 9960.0)
        self.assertFalse(tl["is_paused"])
        self.assertIn("00:45 / 02:46:00", tl["seek_time_str"])

    def test_potplayer_paused_title(self):
        """Tests PotPlayer window titles with explicit [Paused] indicator."""
        tl = inspect_potplayer_timeline(
            title="[Paused] Oppenheimer_1080p.mkv - PotPlayer",
            proc_name="potplayermini64.exe"
        )
        self.assertEqual(tl["clean_title"], "Oppenheimer_1080p.mkv")
        self.assertTrue(tl["is_paused"])

    def test_potplayer_stopped_title(self):
        """Tests PotPlayer window titles with explicit [Stopped] indicator."""
        tl = inspect_potplayer_timeline(
            title="[Stopped] Interstellar.mp4 - PotPlayer",
            proc_name="potplayer64.exe"
        )
        self.assertEqual(tl["clean_title"], "Interstellar.mp4")
        self.assertTrue(tl["is_paused"])

    def test_potplayer_offline_player_module_delegation(self):
        """Tests that inspect_offline_player_timeline cleanly delegates to potplayer detector."""
        tl = inspect_offline_player_timeline(
            title="Matrix_Resurrections.mkv - PotPlayer [01:10 / 02:28:00]",
            proc_name="potplayermini64.exe"
        )
        self.assertEqual(tl["clean_title"], "Matrix_Resurrections.mkv")
        self.assertEqual(tl["seek_position_sec"], 70.0)
        self.assertEqual(tl["seek_duration_sec"], 8880.0)

    # =========================================================================
    # 3. Dedicated Player Modules & Detector Class Tests
    # =========================================================================

    def test_vlc_detector_class(self):
        """Verifies VLCDetector metadata and inspection capabilities."""
        detector = VLCDetector()
        self.assertEqual(detector.player_name, "VLC Media Player")
        self.assertTrue(detector.matches_process("vlc.exe"))
        self.assertTrue(detector.matches_process("unknown.exe", "Big Buck Bunny - VLC media player"))

        tl = detector.inspect_timeline("Big Buck Bunny - VLC media player", "vlc.exe")
        self.assertEqual(tl["clean_title"], "Big Buck Bunny")
        self.assertFalse(tl["is_paused"])

    def test_films_tv_detector_class(self):
        """Verifies FilmsTvDetector metadata and inspection capabilities."""
        detector = FilmsTvDetector()
        self.assertEqual(detector.player_name, "Films & TV")
        self.assertTrue(detector.matches_process("video.ui.exe"))
        self.assertTrue(detector.matches_process("ApplicationFrameHost.exe", "Wildlife.mp4 - Films & TV"))

        tl = detector.inspect_timeline("Wildlife.mp4 - Films & TV", "video.ui.exe")
        self.assertEqual(tl["clean_title"], "Wildlife.mp4")

    def test_mpc_classic_detector_class(self):
        """Verifies MPCClassicDetector metadata and inspection capabilities."""
        detector = MPCClassicDetector()
        self.assertEqual(detector.player_name, "Media Player Classic & Legacy WMP")
        self.assertTrue(detector.matches_process("mpc-hc64.exe"))
        self.assertTrue(detector.matches_process("mpc-be64.exe"))
        self.assertTrue(detector.matches_process("wmplayer.exe"))

        tl = detector.inspect_timeline("[00:30 / 10:00] Nature_Doc.mp4 - MPC-HC", "mpc-hc64.exe")
        self.assertEqual(tl["clean_title"], "Nature_Doc.mp4")
        self.assertEqual(tl["seek_position_sec"], 30.0)

    def test_modern_wmp_detector_class(self):
        """Verifies ModernWMPDetector metadata and inspection capabilities."""
        detector = ModernWMPDetector()
        self.assertEqual(detector.player_name, "Modern Windows Media Player")
        self.assertTrue(detector.matches_process("microsoft.media.player.exe"))
        self.assertTrue(detector.matches_process("music.ui.exe"))

        tl = detector.inspect_timeline("Concert_Live.mp4 - Media Player", "microsoft.media.player.exe")
        self.assertEqual(tl["clean_title"], "Concert_Live.mp4")

    def test_potplayer_detector_class(self):
        """Verifies PotPlayerDetector metadata and inspection capabilities."""
        detector = PotPlayerDetector()
        self.assertEqual(detector.player_name, "Daum PotPlayer")
        self.assertTrue(detector.matches_process("potplayermini64.exe"))
        self.assertTrue(detector.matches_process("potplayer64.exe"))

        tl = detector.inspect_timeline("Demo_Clip.mp4 - PotPlayer", "potplayermini64.exe")
        self.assertEqual(tl["clean_title"], "Demo_Clip.mp4")

    # =========================================================================
    # 4. Mandatory 9 Telemetry Metrics & Scrub Bar Verification
    # =========================================================================

    def test_scrub_bar_generation(self):
        """Tests terminal scrub bar generation math."""
        bar_0 = make_scrub_bar(0.0, width=10)
        self.assertEqual(bar_0, "[░░░░░░░░░░] 0.0%")

        bar_50 = make_scrub_bar(0.5, width=10)
        self.assertEqual(bar_50, "[█████░░░░░] 50.0%")

        bar_100 = make_scrub_bar(1.0, width=10)
        self.assertEqual(bar_100, "[██████████] 100.0%")

    def test_cli_card_rendering_contains_all_9_metrics(self):
        """
        Verifies that render_cli_card formats and includes all 9 required metrics:
          1. Title
          2. File Path
          3. Play/Pause/Mute status
          4. Seek Time
          5. Total Duration
          6. Scrub Progress %
          7. Resolution
          8. Playback Speed
          9. Audio Volume
        """
        detector = PotPlayerDetector()
        sample_telem = {
            "player_name": "Daum PotPlayer",
            "proc_name": "potplayermini64.exe",
            "pid": 5512,
            "hwnd": 0x00120400,
            "class_name": "PotPlayer64",
            "window_title": "Interstellar_IMAX.mkv - PotPlayer",
            "clean_title": "Interstellar_IMAX.mkv",
            "file_name": "Interstellar_IMAX.mkv",
            "file_path": "C:\\Movies\\Interstellar_IMAX.mkv",
            "file_exists": True,
            "play_status": "▶ PLAYING",
            "play_status_color": "\033[92m",
            "is_playing": True,
            "is_paused": False,
            "is_muted": False,
            "seek_position_sec": 3600.0,
            "seek_duration_sec": 10140.0,
            "seek_progress": 0.355,
            "seek_progress_pct": 35.5,
            "seek_time_str": "01:00:00 / 02:49:00",
            "scrub_bar": "[████████░░░░░░░░░░░░] 35.5%",
            "video_resolution": "4K UHD (16:9 Aspect)",
            "resolution_label": "4K UHD",
            "aspect_ratio": "16:9",
            "width": 3840,
            "height": 2160,
            "playback_speed": 1.00,
            "playback_speed_str": "1.00x",
            "audio_volume_pct": 90,
            "master_volume_pct": 100,
            "peak_amplitude": 0.2450,
            "display_wake_lock": True,
            "timestamp": "12:00:00"
        }

        card = detector.render_cli_card(sample_telem)

        # 1. Title
        self.assertIn("Interstellar_IMAX.mkv", card)
        # 2. File Path
        self.assertIn("C:\\Movies\\Interstellar_IMAX.mkv", card)
        # 3. Play/Pause/Mute status
        self.assertIn("PLAYING", card)
        # 4 & 5. Seek Time & Total Duration
        self.assertIn("01:00:00 / 02:49:00", card)
        self.assertIn("3600.0s / 10140.0s", card)
        # 6. Scrub Progress %
        self.assertIn("35.5%", card)
        # 7. Resolution
        self.assertIn("4K UHD (16:9 Aspect)", card)
        # 8. Playback Speed
        self.assertIn("1.00x", card)
        # 9. Audio Volume
        self.assertIn("90%", card)
        self.assertIn("Audio Volume:", card)


if __name__ == "__main__":
    unittest.main()
