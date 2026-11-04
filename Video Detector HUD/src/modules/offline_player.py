# -*- coding: utf-8 -*-
"""
modules/offline_player.py: Modular Offline Media Player Timeline, Duration & Play/Pause Sentinel.
Delegates to specialized modular packages in `src/players/`:
  - `players/vlc/`: VLC Media Player
  - `players/films_tv/`: Films & TV (Movies & TV UWP)
  - `players/mpc_classic/`: Media Player Classic (MPC-HC/BE) & Legacy WMP
  - `players/media_player_modern/`: Windows 11 Modern Media Player
  - `players/potplayer/`: Daum PotPlayer
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import re
import time
from typing import Dict, Any, Optional, Tuple, List

# Ensure 'src' is in sys.path
_this_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.dirname(_this_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

# Import core parsers, caches, and functions from players.base_player
from players.base_player import (
    VIDEO_FILE_EXTENSIONS,
    AUDIO_FILE_EXTENSIONS,
    STANDARD_PLAYBACK_SPEEDS,
    TIMELINE_REGEX,
    PAUSE_REGEX,
    _TIME_LABEL_REGEX,
    _file_duration_cache,
    _file_metadata_cache,
    _playback_progress_cache,
    _playback_velocity_cache,
    _mock_offline_timeline,
    _mock_statusbar_data,
    _mock_trackbar_data,
    set_mock_offline_timeline,
    set_mock_statusbar_data,
    set_mock_trackbar_data,
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
    extract_statusbar_info,
    extract_statusbar_timeline,
    get_process_media_file_info,
    update_offline_player_progress,
    reset_playback_progress_cache
)


def extract_vlc_uia_timeline(hwnd: int) -> Optional[Tuple[float, float, float, str]]:
    """Helper wrapper for backward compatibility."""
    from players.vlc.vlc_detector import extract_vlc_uia_timeline as _vlc_uia
    return _vlc_uia(hwnd)


def get_vlc_mru_recent_video(title: Optional[str] = None) -> Optional[str]:
    """Helper wrapper for backward compatibility."""
    from players.vlc.vlc_detector import get_vlc_mru_recent_video as _vlc_mru
    return _vlc_mru(title)


def inspect_offline_player_timeline(
    title: str,
    proc_name: str,
    hwnd: Optional[int] = None,
    pid: Optional[int] = None,
    is_playing: bool = True,
    detected_file: Optional[str] = None,
    detected_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Master modular inspector for offline media players.
    Routes to specialized sub-packages in `src/players/`:
      - VLC -> players.vlc
      - Films & TV -> players.films_tv
      - MPC-HC, MPC-BE, WMP Legacy -> players.mpc_classic
      - Modern Media Player -> players.media_player_modern
      - PotPlayer -> players.potplayer
    Falls back to shared offline player extraction for generic/unsupported engines.
    """
    # 0. Check global mock for hermetic testing
    from players import base_player
    if base_player._mock_offline_timeline is not None:
        return dict(base_player._mock_offline_timeline)

    raw_title = title or ""
    clean_title = raw_title
    is_title_paused = detect_pause_in_title(raw_title)

    pos_sec = 0.0
    dur_sec = 0.0
    progress = 0.0
    time_str = "00:00 / 00:00"
    file_path: Optional[str] = detected_path
    file_name: Optional[str] = detected_file
    video_res = "1080p FHD (16:9 Aspect)"
    width = 1920
    height = 1080
    aspect_ratio = "16:9"

    p_low = proc_name.lower().strip()
    t_low = raw_title.lower().strip()

    # Unwrap UWP ApplicationFrameHost
    if p_low == "applicationframehost.exe":
        if any(k in t_low for k in ["films & tv", "movies & tv", "video.ui", "film & tv", "films and tv", "movies and tv"]) or ("films" in t_low and "tv" in t_low):
            p_low = "video.ui.exe"
        elif "media player" in t_low or "groove music" in t_low or t_low in ("music library", "video library", "play queue", "home", "settings"):
            p_low = "microsoft.media.player.exe"

    # ==============================================================================
    # 1. Modular Sub-Package Delegation
    # ==============================================================================

    # 1.1 VLC Media Player
    if "vlc" in p_low or "vlc" in t_low:
        from players.vlc.vlc_detector import inspect_vlc_timeline
        return inspect_vlc_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.2 Microsoft Films & TV / Movies & TV UWP
    if "video.ui" in p_low or any(k in t_low for k in ["films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv"]) or ("films" in t_low and "tv" in t_low):
        from players.films_tv.films_tv_detector import inspect_films_tv_timeline
        return inspect_films_tv_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.3 Media Player Classic (MPC-HC, MPC-BE) & Legacy Windows Media Player
    if ("mpc" in p_low or "wmplayer" in p_low or
        any(k in t_low for k in ["mpc-hc", "mpc-be", "media player classic", "windows media player"])):
        from players.mpc_classic.mpc_classic_detector import inspect_mpc_classic_timeline
        return inspect_mpc_classic_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.4 Windows 11 Modern Media Player
    if ("microsoft.media.player" in p_low or "music.ui" in p_low or
        ("media player" in t_low and "classic" not in t_low and "vlc" not in t_low and "potplayer" not in t_low)):
        from players.media_player_modern.modern_wmp_detector import inspect_modern_wmp_timeline
        return inspect_modern_wmp_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.5 Daum PotPlayer
    if "potplayer" in p_low or "potplayer" in t_low:
        from players.potplayer.potplayer_detector import inspect_potplayer_timeline
        return inspect_potplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.6 MPV & mpv.net
    if "mpv" in p_low or "mpv" in t_low:
        from players.mpv.mpv_detector import inspect_mpv_timeline
        return inspect_mpv_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.7 KMPlayer
    if "kmplayer" in p_low or "kmplayer" in t_low:
        from players.kmplayer.kmplayer_detector import inspect_kmplayer_timeline
        return inspect_kmplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.8 GOM Player
    if "gom" in p_low or "gom" in t_low:
        from players.gomplayer.gomplayer_detector import inspect_gomplayer_timeline
        return inspect_gomplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.9 SMPlayer
    if "smplayer" in p_low or "smplayer" in t_low:
        from players.smplayer.smplayer_detector import inspect_smplayer_timeline
        return inspect_smplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.10 Kodi Media Center
    if "kodi" in p_low or "kodi" in t_low:
        from players.kodi.kodi_detector import inspect_kodi_timeline
        return inspect_kodi_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.11 BS.Player
    if "bsplayer" in p_low or "bs.player" in t_low or "bsplayer" in t_low:
        from players.bsplayer.bsplayer_detector import inspect_bsplayer_timeline
        return inspect_bsplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # 1.12 5KPlayer
    if "5kplayer" in p_low or "5kplayer" in t_low:
        from players.fivekplayer.fivekplayer_detector import inspect_fivekplayer_timeline
        return inspect_fivekplayer_timeline(
            title=raw_title,
            proc_name=p_low,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )

    # ==============================================================================
    # 2. Generic Fallback Extraction (For MPV, KMPlayer, GOM, etc.)
    # ==============================================================================
    proc_key = f"{p_low}_{pid or 0}"

    if detected_path and os.path.isfile(detected_path):
        meta = get_media_file_metadata(detected_path)
        if meta.get("duration", 0.0) > 0:
            dur_sec = meta["duration"]
        if meta.get("width", 0) > 0 and meta.get("height", 0) > 0:
            width = meta["width"]
            height = meta["height"]
            aspect_ratio = meta["aspect_ratio"]
            video_res = meta["video_resolution"]
        if not file_name:
            file_name = os.path.basename(detected_path)
        if not clean_title:
            clean_title = file_name

    res_title = extract_timeline_from_text(raw_title)
    if res_title:
        pos_sec, dur_sec, progress, time_str, clean_title = res_title
    else:
        clean_title = PAUSE_REGEX.sub('', clean_title).strip(' -[]()–—:\t\n')

    OFFLINE_PLAYER_SUFFIXES = [
        " - VLC media player", " - VLC", " - PotPlayer", " - Daum PotPlayer",
        " - MPC-HC x64", " - MPC-BE x64", " - MPC-HC (64-bit)", " - MPC-BE (64-bit)",
        " - MPC-HC", " - MPC-BE", " - Media Player Classic - Home Cinema",
        " - Media Player Classic - Black Edition", " - Media Player Classic",
        " - mpv.net", " - mpvnet", " - mpv",
        " - KMPlayer 64X", " - KMPlayer (64-bit)", " - KMPlayer64", " - KMPlayer", " - KMP",
        " - GOM Player Plus", " - GOM Player", " - GOMPlayer", " - GOM 64",
        " - SMPlayer v.", " - SMPlayer",
        " - Kodi Media Center", " - Kodi",
        " - BS.Player PRO", " - BS.Player", " - BSPlayer",
        " - 5KPlayer 64-bit", " - 5KPlayer",
        " - Windows Media Player (Legacy)", " - Windows Media Player", " - Media Player",
        " - Films & TV", " - Movies & TV", " - Film & TV", " - Films and TV", " - Movies and TV", " - Video"
    ]

    for suffix in OFFLINE_PLAYER_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if clean_title.lower().startswith("now playing:"):
        clean_title = clean_title[12:].strip()
    elif clean_title.lower().startswith("now playing -"):
        clean_title = clean_title[13:].strip()

    if not file_name and any(clean_title.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
        file_name = clean_title

    # Child status bar inspection
    if hwnd:
        sb_info = extract_statusbar_info(hwnd)
        if sb_info.get("timeline"):
            sb_pos, sb_dur, sb_prog, sb_str = sb_info["timeline"]
            if dur_sec <= 0 and sb_dur > 0:
                dur_sec = sb_dur
                pos_sec = sb_pos
                progress = sb_prog
                time_str = sb_str
            elif pos_sec <= 0 and sb_pos > 0:
                pos_sec = sb_pos
                if dur_sec > 0:
                    progress = min(1.0, max(0.0, pos_sec / dur_sec))
                    time_str = format_seek_timeline(pos_sec, dur_sec)

        if sb_info.get("is_paused"):
            is_title_paused = True
        elif sb_info.get("is_playing"):
            is_title_paused = False

    # Check process file handles
    if pid and pid > 0:
        fpath, fname, fext = get_process_media_file_info(pid, title=raw_title)
        if fpath:
            file_path = fpath
            file_name = fname
            meta = get_media_file_metadata(fpath)
            if meta.get("duration", 0.0) > 0 and dur_sec <= 0:
                dur_sec = meta["duration"]
            if meta.get("width", 0) > 0 and meta.get("height", 0) > 0:
                width = meta["width"]
                height = meta["height"]
                aspect_ratio = meta["aspect_ratio"]
                video_res = meta["video_resolution"]
            if not clean_title:
                clean_title = fname

    if not file_path:
        candidate_fname = file_name or clean_title
        if candidate_fname and any(candidate_fname.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
            file_name = candidate_fname
            if os.path.isfile(candidate_fname):
                file_path = os.path.abspath(candidate_fname)
            else:
                user_home = os.path.expanduser("~")
                for folder in ["Videos", "Downloads", "Desktop"]:
                    chk = os.path.join(user_home, folder, candidate_fname)
                    if os.path.isfile(chk):
                        file_path = chk
                        break
            if file_path:
                meta = get_media_file_metadata(file_path)
                if meta.get("duration", 0.0) > 0 and dur_sec <= 0:
                    dur_sec = meta["duration"]
                if meta.get("width", 0) > 0 and meta.get("height", 0) > 0:
                    width = meta["width"]
                    height = meta["height"]
                    aspect_ratio = meta["aspect_ratio"]
                    video_res = meta["video_resolution"]

    # Trackbar position
    if hwnd:
        tb = extract_trackbar_position(hwnd)
        if tb:
            tb_pos, tb_min, tb_max = tb
            if tb_max > tb_min:
                if dur_sec > 0:
                    pos_sec = round((tb_pos - tb_min) / float(tb_max - tb_min) * dur_sec, 2)
                    progress = min(1.0, max(0.0, pos_sec / dur_sec))
                    time_str = format_seek_timeline(pos_sec, dur_sec)
                elif dur_sec <= 0 and tb_max >= 30:
                    dur_sec = float(tb_max)
                    pos_sec = float(tb_pos)
                    progress = min(1.0, max(0.0, pos_sec / dur_sec))
                    time_str = format_seek_timeline(pos_sec, dur_sec)

    now = time.time()
    if dur_sec > 0:
        from players.base_player import _playback_progress_cache
        cached = _playback_progress_cache.get(proc_key)
        if pos_sec > 0.0:
            _playback_progress_cache[proc_key] = {"pos": pos_sec, "last_ts": now}
        elif cached:
            pos_sec = cached["pos"]
        else:
            _playback_progress_cache[proc_key] = {"pos": 0.0, "last_ts": now}

        progress = min(1.0, max(0.0, pos_sec / dur_sec))
        time_str = format_seek_timeline(pos_sec, dur_sec)

    speed = calculate_playback_speed_velocity(proc_key, pos_sec, now, is_playing)

    for suffix in OFFLINE_PLAYER_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if clean_title.lower().startswith("now playing:"):
        clean_title = clean_title[12:].strip()
    elif clean_title.lower().startswith("now playing -"):
        clean_title = clean_title[13:].strip()

    return {
        "seek_position_sec": round(pos_sec, 2),
        "seek_duration_sec": round(dur_sec, 2),
        "seek_progress": round(progress, 4),
        "seek_time_str": time_str,
        "clean_title": clean_title or raw_title,
        "is_paused": is_title_paused,
        "detected_file": file_name,
        "detected_path": file_path,
        "video_resolution": video_res,
        "resolution_label": format_video_resolution(width, height)[0],
        "width": width,
        "height": height,
        "aspect_ratio": aspect_ratio,
        "playback_speed": speed
    }
