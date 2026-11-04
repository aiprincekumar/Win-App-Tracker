# -*- coding: utf-8 -*-
"""
players: Modular Media Player Detection, Telemetry & Diagnostics Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .base_player import (
    BasePlayerDetector,
    parse_timestamp_seconds,
    format_seek_timeline,
    format_video_resolution,
    extract_mp4_metadata,
    extract_shell_video_metadata,
    get_media_file_metadata,
    calculate_playback_speed_velocity,
    extract_timeline_from_text,
    detect_pause_in_title,
    get_media_file_duration_com,
    get_media_file_duration_shell,
    get_media_file_duration,
    extract_trackbar_position,
    extract_trackbar_volume,
    extract_uia_volume_slider,
    extract_wasapi_session_volume,
    extract_statusbar_volume,
    get_app_internal_volume,
    extract_statusbar_info,
    extract_statusbar_timeline,
    get_process_media_file_info,
    update_offline_player_progress,
    reset_playback_progress_cache,
    set_mock_offline_timeline,
    set_mock_statusbar_data,
    set_mock_trackbar_data,
    set_mock_app_volume,
    set_mock_trackbar_volume,
    set_mock_uia_volume,
    set_mock_window_mode,
    get_window_display_mode,
    make_scrub_bar
)

from .vlc.vlc_detector import (
    VLCDetector,
    inspect_vlc_timeline,
    extract_vlc_uia_timeline,
    get_vlc_mru_recent_video
)

from .films_tv.films_tv_detector import (
    FilmsTvDetector,
    inspect_films_tv_timeline
)

from .mpc_classic.mpc_classic_detector import (
    MPCClassicDetector,
    inspect_mpc_classic_timeline
)

from .media_player_modern.modern_wmp_detector import (
    ModernWMPDetector,
    inspect_modern_wmp_timeline
)

from .potplayer.potplayer_detector import (
    PotPlayerDetector,
    inspect_potplayer_timeline
)

from .mpv.mpv_detector import (
    MPVDetector,
    inspect_mpv_timeline
)

from .kmplayer.kmplayer_detector import (
    KMPlayerDetector,
    inspect_kmplayer_timeline
)

from .gomplayer.gomplayer_detector import (
    GOMPlayerDetector,
    inspect_gomplayer_timeline
)

from .smplayer.smplayer_detector import (
    SMPlayerDetector,
    inspect_smplayer_timeline
)

from .kodi.kodi_detector import (
    KodiDetector,
    inspect_kodi_timeline
)

from .bsplayer.bsplayer_detector import (
    BSPlayerDetector,
    inspect_bsplayer_timeline
)

from .fivekplayer.fivekplayer_detector import (
    FiveKPlayerDetector,
    inspect_fivekplayer_timeline
)

__all__ = [
    "BasePlayerDetector",
    "parse_timestamp_seconds",
    "format_seek_timeline",
    "format_video_resolution",
    "extract_mp4_metadata",
    "extract_shell_video_metadata",
    "get_media_file_metadata",
    "calculate_playback_speed_velocity",
    "extract_timeline_from_text",
    "detect_pause_in_title",
    "get_media_file_duration_com",
    "get_media_file_duration_shell",
    "get_media_file_duration",
    "extract_trackbar_position",
    "extract_trackbar_volume",
    "extract_uia_volume_slider",
    "extract_wasapi_session_volume",
    "extract_statusbar_volume",
    "get_app_internal_volume",
    "extract_statusbar_info",
    "extract_statusbar_timeline",
    "get_process_media_file_info",
    "update_offline_player_progress",
    "reset_playback_progress_cache",
    "set_mock_offline_timeline",
    "set_mock_statusbar_data",
    "set_mock_trackbar_data",
    "set_mock_app_volume",
    "set_mock_trackbar_volume",
    "set_mock_uia_volume",
    "set_mock_window_mode",
    "get_window_display_mode",
    "make_scrub_bar",
    "VLCDetector",
    "inspect_vlc_timeline",
    "extract_vlc_uia_timeline",
    "get_vlc_mru_recent_video",
    "FilmsTvDetector",
    "inspect_films_tv_timeline",
    "MPCClassicDetector",
    "inspect_mpc_classic_timeline",
    "ModernWMPDetector",
    "inspect_modern_wmp_timeline",
    "PotPlayerDetector",
    "inspect_potplayer_timeline",
    "MPVDetector",
    "inspect_mpv_timeline",
    "KMPlayerDetector",
    "inspect_kmplayer_timeline",
    "GOMPlayerDetector",
    "inspect_gomplayer_timeline",
    "SMPlayerDetector",
    "inspect_smplayer_timeline",
    "KodiDetector",
    "inspect_kodi_timeline",
    "BSPlayerDetector",
    "inspect_bsplayer_timeline",
    "FiveKPlayerDetector",
    "inspect_fivekplayer_timeline",
]
