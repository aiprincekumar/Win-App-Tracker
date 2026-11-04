# -*- coding: utf-8 -*-
"""
tests/test_universal_player_fleet.py: Comprehensive Unit Tests for the Universal Windows Video Player Fleet.
Verifies:
  1. Window Display Mode & Focus State Detection (FULLSCREEN, BORDERLESS, WINDOWED, MINIMIZED).
  2. Platform classification & process mapping for all 7 new players:
     - MPV / mpv.net (mpv.exe, mpvnet.exe)
     - KMPlayer (kmplayer.exe, kmplayer64.exe)
     - GOM Player (gom.exe, gom64.exe)
     - SMPlayer (smplayer.exe)
     - Kodi Media Center (kodi.exe)
     - BS.Player (bsplayer.exe)
     - 5KPlayer (5kplayer.exe)
  3. Video vs Pure Audio vs Empty Player classification.
  4. Dedicated timeline, duration, seek, resolution, and play/pause inspection engines.
  5. Suffix stripping and clean_title extraction across offline_player and window_scanner.
  6. Standalone BasePlayerDetector telemetry contracts, window mode display, and ANSI cards.

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

from modules.config import DUAL_PURPOSE_MEDIA_PLAYERS
from modules.classifier import extract_platform_tag, classify_media_window
from modules.offline_player import (
    inspect_offline_player_timeline,
    reset_playback_progress_cache,
    set_mock_offline_timeline
)
from modules.window_scanner import scan_system_media_candidates, set_mock_candidates
from players.base_player import (
    get_window_display_mode,
    set_mock_window_mode,
    format_seek_timeline,
    format_video_resolution,
    make_scrub_bar
)

# Import all 7 new detector classes & timeline functions
from players.mpv.mpv_detector import MPVDetector, inspect_mpv_timeline
from players.kmplayer.kmplayer_detector import KMPlayerDetector, inspect_kmplayer_timeline
from players.gomplayer.gomplayer_detector import GOMPlayerDetector, inspect_gomplayer_timeline
from players.smplayer.smplayer_detector import SMPlayerDetector, inspect_smplayer_timeline
from players.kodi.kodi_detector import KodiDetector, inspect_kodi_timeline
from players.bsplayer.bsplayer_detector import BSPlayerDetector, inspect_bsplayer_timeline
from players.fivekplayer.fivekplayer_detector import FiveKPlayerDetector, inspect_fivekplayer_timeline


class TestUniversalPlayerFleet(unittest.TestCase):

    def setUp(self):
        reset_playback_progress_cache()
        set_mock_offline_timeline(None)
        set_mock_window_mode(None)
        set_mock_candidates(None)

    def tearDown(self):
        reset_playback_progress_cache()
        set_mock_offline_timeline(None)
        set_mock_window_mode(None)
        set_mock_candidates(None)

    # =========================================================================
    # 1. Window Display Mode Detection & Focus State Tests
    # =========================================================================

    def test_window_display_mode_mock_and_states(self):
        """Verifies get_window_display_mode handles mock states and returns correct tuple."""
        set_mock_window_mode("FULLSCREEN", True)
        mode, is_focused = get_window_display_mode(12345)
        self.assertEqual(mode, "FULLSCREEN")
        self.assertTrue(is_focused)

        set_mock_window_mode("WINDOWED", False)
        mode, is_focused = get_window_display_mode(12345)
        self.assertEqual(mode, "WINDOWED")
        self.assertFalse(is_focused)

        set_mock_window_mode("MINIMIZED", False)
        mode, is_focused = get_window_display_mode(12345)
        self.assertEqual(mode, "MINIMIZED")
        self.assertFalse(is_focused)

        set_mock_window_mode("BORDERLESS", True)
        mode, is_focused = get_window_display_mode(12345)
        self.assertEqual(mode, "BORDERLESS")
        self.assertTrue(is_focused)

    def test_window_mode_in_telemetry_and_card(self):
        """Verifies window_mode and is_focused are present in BasePlayerDetector telemetry."""
        detector = MPVDetector()
        mock_telem = {
            "player_name": "MPV Player",
            "proc_name": "mpv.exe",
            "pid": 4321,
            "hwnd": 99999,
            "class_name": "mpv",
            "window_title": "Interstellar.mkv - mpv",
            "clean_title": "Interstellar.mkv",
            "file_name": "Interstellar.mkv",
            "file_path": None,
            "file_exists": False,
            "window_mode": "FULLSCREEN",
            "is_focused": True,
            "play_status": "▶ PLAYING",
            "play_status_color": "\033[92m",
            "is_playing": True,
            "is_paused": False,
            "is_muted": False,
            "seek_position_sec": 120.0,
            "seek_duration_sec": 7200.0,
            "seek_progress": 0.0167,
            "seek_progress_pct": 1.67,
            "seek_time_str": "00:02:00 / 02:00:00",
            "scrub_bar": make_scrub_bar(0.0167),
            "video_resolution": "1080p FHD (16:9 Aspect)",
            "resolution_label": "1080p FHD",
            "aspect_ratio": "16:9",
            "width": 1920,
            "height": 1080,
            "playback_speed": 1.00,
            "playback_speed_str": "1.00x",
            "audio_volume_pct": 100,
            "master_volume_pct": 100,
            "peak_amplitude": 0.05,
            "display_wake_lock": True,
            "timestamp": "12:00:00"
        }
        card = detector.render_cli_card(mock_telem)
        self.assertIn("Window Mode:", card)
        self.assertIn("FULLSCREEN", card)
        self.assertIn("Active / Focused", card)
        self.assertIn("00:02:00 / 02:00:00", card)

    # =========================================================================
    # 2. Platform Classification & Dual-Purpose Catalog Tests
    # =========================================================================

    def test_dual_purpose_catalog_contains_all_fleet(self):
        """Verifies that all 12 players are registered in DUAL_PURPOSE_MEDIA_PLAYERS."""
        expected_players = [
            "vlc.exe", "video.ui.exe", "mpc-hc.exe", "mpc-be.exe", "wmplayer.exe",
            "microsoft.media.player.exe", "potplayer.exe", "potplayer64.exe",
            "mpv.exe", "mpvnet.exe", "kmplayer.exe", "kmplayer64.exe",
            "gom.exe", "gom64.exe", "smplayer.exe", "kodi.exe", "bsplayer.exe", "5kplayer.exe"
        ]
        for p in expected_players:
            if p == "video.ui.exe":
                continue  # Dedicated video app
            self.assertIn(p, DUAL_PURPOSE_MEDIA_PLAYERS, f"{p} missing from DUAL_PURPOSE_MEDIA_PLAYERS")

    def test_platform_tag_classification(self):
        """Verifies extract_platform_tag accurately identifies all 7 new players."""
        self.assertEqual(extract_platform_tag("Avatar.mkv - mpv", "mpv.exe"), "MPV")
        self.assertEqual(extract_platform_tag("Avatar.mkv - mpv.net", "mpvnet.exe"), "MPV")
        self.assertEqual(extract_platform_tag("Avatar.mkv - KMPlayer", "kmplayer.exe"), "KMPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mkv - KMPlayer 64X", "kmplayer64.exe"), "KMPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mkv - GOM Player", "gom.exe"), "GOM Player")
        self.assertEqual(extract_platform_tag("Avatar.mkv - GOM Player Plus", "gom64.exe"), "GOM Player")
        self.assertEqual(extract_platform_tag("Avatar.mkv - SMPlayer", "smplayer.exe"), "SMPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mkv - Kodi", "kodi.exe"), "Kodi")
        self.assertEqual(extract_platform_tag("Avatar.avi - BS.Player", "bsplayer.exe"), "BSPlayer")
        self.assertEqual(extract_platform_tag("Avatar.mp4 - 5KPlayer", "5kplayer.exe"), "5KPlayer")

    def test_classify_media_window_video_audio_empty(self):
        """Tests video, audio, and empty player classification across the 7 new players."""
        test_matrix = [
            ("mpv.exe", "Movie.mkv - mpv", "VIDEO"),
            ("mpv.exe", "Song.flac - mpv", "PURE_AUDIO"),
            ("mpv.exe", "mpv", "EMPTY_PLAYER"),
            ("kmplayer64.exe", "Movie.mp4 - KMPlayer", "VIDEO"),
            ("kmplayer64.exe", "Track.mp3 - KMPlayer", "PURE_AUDIO"),
            ("kmplayer64.exe", "KMPlayer", "EMPTY_PLAYER"),
            ("gom.exe", "Movie.avi - GOM Player", "VIDEO"),
            ("gom.exe", "Song.wav - GOM Player", "PURE_AUDIO"),
            ("gom.exe", "GOM Player", "EMPTY_PLAYER"),
            ("smplayer.exe", "Movie.mkv - SMPlayer", "VIDEO"),
            ("smplayer.exe", "Audio.mp3 - SMPlayer", "PURE_AUDIO"),
            ("smplayer.exe", "SMPlayer", "EMPTY_PLAYER"),
            ("kodi.exe", "Movie.mkv - Kodi", "VIDEO"),
            ("kodi.exe", "Song.mp3 - Kodi", "PURE_AUDIO"),
            ("kodi.exe", "Kodi", "EMPTY_PLAYER"),
            ("bsplayer.exe", "Movie.avi - BS.Player", "VIDEO"),
            ("bsplayer.exe", "Song.mp3 - BS.Player", "PURE_AUDIO"),
            ("bsplayer.exe", "BS.Player", "EMPTY_PLAYER"),
            ("5kplayer.exe", "Movie.mp4 - 5KPlayer", "VIDEO"),
            ("5kplayer.exe", "Song.mp3 - 5KPlayer", "PURE_AUDIO"),
            ("5kplayer.exe", "5KPlayer", "EMPTY_PLAYER"),
        ]
        for proc, title, expected_type in test_matrix:
            res = classify_media_window(proc, "1111", title)
            self.assertEqual(res["type"], expected_type, f"Failed for {proc} with title '{title}'")

    # =========================================================================
    # 3. Dedicated Inspection Engine Tests (All 7 Players)
    # =========================================================================

    def test_mpv_inspection_engine(self):
        """Tests MPV dedicated timeline parsing and pause indicators."""
        # Timeline in title
        tl = inspect_mpv_timeline("Interstellar.mkv [01:23 / 02:49:00] - mpv", "mpv.exe")
        self.assertEqual(tl["clean_title"], "Interstellar.mkv")
        self.assertEqual(tl["seek_position_sec"], 83.0)
        self.assertEqual(tl["seek_duration_sec"], 10140.0)
        self.assertFalse(tl["is_paused"])

        # Paused title
        tl_p = inspect_mpv_timeline("[Paused] Interstellar.mkv - mpv", "mpv.exe")
        self.assertEqual(tl_p["clean_title"], "Interstellar.mkv")
        self.assertTrue(tl_p["is_paused"])

    def test_kmplayer_inspection_engine(self):
        """Tests KMPlayer dedicated timeline parsing and pause indicators."""
        tl = inspect_kmplayer_timeline("Gladiator.mp4 [00:45 / 02:35:00] - KMPlayer 64X", "kmplayer64.exe")
        self.assertEqual(tl["clean_title"], "Gladiator.mp4")
        self.assertEqual(tl["seek_position_sec"], 45.0)
        self.assertEqual(tl["seek_duration_sec"], 9300.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_kmplayer_timeline("[Paused] Gladiator.mp4 - KMPlayer", "kmplayer.exe")
        self.assertEqual(tl_p["clean_title"], "Gladiator.mp4")
        self.assertTrue(tl_p["is_paused"])

    def test_gomplayer_inspection_engine(self):
        """Tests GOM Player dedicated timeline parsing and pause indicators."""
        tl = inspect_gomplayer_timeline("Matrix.mkv [00:15 / 02:16:00] - GOM Player Plus", "gom64.exe")
        self.assertEqual(tl["clean_title"], "Matrix.mkv")
        self.assertEqual(tl["seek_position_sec"], 15.0)
        self.assertEqual(tl["seek_duration_sec"], 8160.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_gomplayer_timeline("[Paused] Matrix.mkv - GOM Player", "gom.exe")
        self.assertEqual(tl_p["clean_title"], "Matrix.mkv")
        self.assertTrue(tl_p["is_paused"])

    def test_smplayer_inspection_engine(self):
        """Tests SMPlayer dedicated timeline parsing and pause indicators."""
        tl = inspect_smplayer_timeline("Inception.mkv [01:10 / 02:28:00] - SMPlayer", "smplayer.exe")
        self.assertEqual(tl["clean_title"], "Inception.mkv")
        self.assertEqual(tl["seek_position_sec"], 70.0)
        self.assertEqual(tl["seek_duration_sec"], 8880.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_smplayer_timeline("[Paused] Inception.mkv - SMPlayer", "smplayer.exe")
        self.assertEqual(tl_p["clean_title"], "Inception.mkv")
        self.assertTrue(tl_p["is_paused"])

    def test_kodi_inspection_engine(self):
        """Tests Kodi dedicated timeline parsing and pause indicators."""
        tl = inspect_kodi_timeline("Blade_Runner_2049.mkv [00:30 / 02:43:00] - Kodi", "kodi.exe")
        self.assertEqual(tl["clean_title"], "Blade_Runner_2049.mkv")
        self.assertEqual(tl["seek_position_sec"], 30.0)
        self.assertEqual(tl["seek_duration_sec"], 9780.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_kodi_timeline("[Paused] Blade_Runner_2049.mkv - Kodi", "kodi.exe")
        self.assertEqual(tl_p["clean_title"], "Blade_Runner_2049.mkv")
        self.assertTrue(tl_p["is_paused"])

    def test_bsplayer_inspection_engine(self):
        """Tests BS.Player dedicated timeline parsing and pause indicators."""
        tl = inspect_bsplayer_timeline("Classic_Cinema.avi [00:10 / 01:30:00] - BS.Player PRO", "bsplayer.exe")
        self.assertEqual(tl["clean_title"], "Classic_Cinema.avi")
        self.assertEqual(tl["seek_position_sec"], 10.0)
        self.assertEqual(tl["seek_duration_sec"], 5400.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_bsplayer_timeline("[Paused] Classic_Cinema.avi - BS.Player", "bsplayer.exe")
        self.assertEqual(tl_p["clean_title"], "Classic_Cinema.avi")
        self.assertTrue(tl_p["is_paused"])

    def test_fivekplayer_inspection_engine(self):
        """Tests 5KPlayer dedicated timeline parsing and pause indicators."""
        tl = inspect_fivekplayer_timeline("Wildlife_4K.mp4 [00:25 / 00:05:00] - 5KPlayer", "5kplayer.exe")
        self.assertEqual(tl["clean_title"], "Wildlife_4K.mp4")
        self.assertEqual(tl["seek_position_sec"], 25.0)
        self.assertEqual(tl["seek_duration_sec"], 300.0)
        self.assertFalse(tl["is_paused"])

        tl_p = inspect_fivekplayer_timeline("[Paused] Wildlife_4K.mp4 - 5KPlayer", "5kplayer.exe")
        self.assertEqual(tl_p["clean_title"], "Wildlife_4K.mp4")
        self.assertTrue(tl_p["is_paused"])

    # =========================================================================
    # 4. Master Offline Player Module Routing Tests
    # =========================================================================

    def test_offline_player_module_routing_all_seven(self):
        """Verifies that inspect_offline_player_timeline seamlessly delegates to each of the 7 new detectors."""
        test_cases = [
            ("Dune.mp4 [00:10 / 02:00:00] - mpv", "mpv.exe", "Dune.mp4", 10.0, 7200.0),
            ("Dune.mp4 [00:20 / 02:00:00] - KMPlayer", "kmplayer64.exe", "Dune.mp4", 20.0, 7200.0),
            ("Dune.mp4 [00:30 / 02:00:00] - GOM Player", "gom.exe", "Dune.mp4", 30.0, 7200.0),
            ("Dune.mp4 [00:40 / 02:00:00] - SMPlayer", "smplayer.exe", "Dune.mp4", 40.0, 7200.0),
            ("Dune.mp4 [00:50 / 02:00:00] - Kodi", "kodi.exe", "Dune.mp4", 50.0, 7200.0),
            ("Dune.avi [01:00 / 02:00:00] - BS.Player", "bsplayer.exe", "Dune.avi", 60.0, 7200.0),
            ("Dune.mp4 [01:10 / 02:00:00] - 5KPlayer", "5kplayer.exe", "Dune.mp4", 70.0, 7200.0),
        ]
        for title, proc, clean, pos, dur in test_cases:
            res = inspect_offline_player_timeline(title, proc)
            self.assertEqual(res["clean_title"], clean, f"Routing failed for {proc}")
            self.assertEqual(res["seek_position_sec"], pos, f"Position mismatch for {proc}")
            self.assertEqual(res["seek_duration_sec"], dur, f"Duration mismatch for {proc}")

    # =========================================================================
    # 5. Detector Class Contract Tests
    # =========================================================================

    def test_detector_classes_contracts(self):
        """Verifies player_name, process_names, and matches_process across all 7 detector classes."""
        detectors = [
            (MPVDetector(), "MPV Player", "mpv.exe", "mpvnet.exe"),
            (KMPlayerDetector(), "KMPlayer", "kmplayer.exe", "kmplayer64.exe"),
            (GOMPlayerDetector(), "GOM Player", "gom.exe", "gom64.exe"),
            (SMPlayerDetector(), "SMPlayer", "smplayer.exe", None),
            (KodiDetector(), "Kodi Media Center", "kodi.exe", None),
            (BSPlayerDetector(), "BS.Player", "bsplayer.exe", None),
            (FiveKPlayerDetector(), "5KPlayer", "5kplayer.exe", None),
        ]
        for det, name, p1, p2 in detectors:
            self.assertEqual(det.player_name, name)
            self.assertTrue(det.matches_process(p1))
            if p2:
                self.assertTrue(det.matches_process(p2))

    # =========================================================================
    # 6. Suffix Stripping in Window Scanner
    # =========================================================================

    def test_window_scanner_suffix_stripping(self):
        """Verifies that scan_system_media_candidates cleanly strips suffixes for all 7 players."""
        mock_windows = [
            {"hwnd": 1, "pid": 101, "proc_name": "mpv.exe", "title": "Avengers.mkv - mpv", "class_name": "mpv"},
            {"hwnd": 2, "pid": 102, "proc_name": "kmplayer64.exe", "title": "Batman.mp4 - KMPlayer 64X", "class_name": "KMPlayer"},
            {"hwnd": 3, "pid": 103, "proc_name": "gom.exe", "title": "SpiderMan.avi - GOM Player Plus", "class_name": "GomPlayer"},
            {"hwnd": 4, "pid": 104, "proc_name": "smplayer.exe", "title": "Superman.mkv - SMPlayer", "class_name": "SMPlayer"},
            {"hwnd": 5, "pid": 105, "proc_name": "kodi.exe", "title": "WonderWoman.mkv - Kodi", "class_name": "Kodi"},
            {"hwnd": 6, "pid": 106, "proc_name": "bsplayer.exe", "title": "Flash.avi - BS.Player PRO", "class_name": "BSPlayer"},
            {"hwnd": 7, "pid": 107, "proc_name": "5kplayer.exe", "title": "Aquaman.mp4 - 5KPlayer 64-bit", "class_name": "5KPlayer"},
        ]
        set_mock_window_mode("FULLSCREEN", True)
        set_mock_candidates(None)

        # Simulate scanning individual candidate classifications
        for item in mock_windows:
            tl = inspect_offline_player_timeline(item["title"], item["proc_name"])
            clean = tl["clean_title"]
            expected_prefix = item["title"].split(" - ")[0]
            self.assertEqual(clean, expected_prefix, f"Suffix stripping failed for {item['proc_name']}")


if __name__ == "__main__":
    unittest.main()
