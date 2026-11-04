# -*- coding: utf-8 -*-
"""
players/mpc_classic/mpc_classic_detector.py: Media Player Classic (MPC-HC/BE) & Legacy WMP Dedicated Telemetry & Diagnostic Sentinel.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import time
from typing import Dict, Any, Optional, Tuple, List

# Ensure 'src' is in sys.path
_this_dir = os.path.dirname(os.path.abspath(__file__))
_players_dir = os.path.dirname(_this_dir)
_src_dir = os.path.dirname(_players_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from modules.config import VIDEO_FILE_EXTENSIONS
from modules.wmp_surface import detect_wmp_legacy_video_surface
from players.base_player import (
    BasePlayerDetector,
    PAUSE_REGEX,
    extract_timeline_from_text,
    detect_pause_in_title,
    format_seek_timeline,
    format_video_resolution,
    get_media_file_metadata,
    calculate_playback_speed_velocity,
    get_process_media_file_info,
    extract_statusbar_info,
    extract_trackbar_position
)

MPC_WMP_SUFFIXES = [
    " - MPC-HC x64", " - MPC-BE x64", " - MPC-HC (64-bit)", " - MPC-BE (64-bit)",
    " - MPC-HC", " - MPC-BE", " - Media Player Classic - Home Cinema",
    " - Media Player Classic - Black Edition", " - Media Player Classic",
    " - Windows Media Player (Legacy)", " - Windows Media Player"
]


def inspect_mpc_classic_timeline(
    title: str,
    proc_name: str = "mpc-hc64.exe",
    hwnd: Optional[int] = None,
    pid: Optional[int] = None,
    is_playing: bool = True,
    detected_file: Optional[str] = None,
    detected_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dedicated Media Player Classic (MPC-HC, MPC-BE) & Legacy WMP inspection engine.
    Extracts:
      - seek_position_sec, seek_duration_sec, seek_progress, seek_time_str
      - clean_title, is_paused, detected_file, detected_path
      - video_resolution, width, height, aspect_ratio, playback_speed
    """
    raw_title = title or ""
    clean_title = raw_title
    is_title_paused = detect_pause_in_title(raw_title)

    pos_sec = 0.0
    dur_sec = 0.0
    progress = 0.0
    time_str = "00:00 / 00:00"
    file_path: Optional[str] = detected_path
    file_name: Optional[str] = detected_file
    width = 1920
    height = 1080
    aspect_ratio = "16:9"
    video_res = "1080p FHD (16:9 Aspect)"
    p_clean = proc_name.lower().strip()
    proc_key = f"{p_clean}_{pid or 0}"

    # 1. Extract timeline from title if present
    res_title = extract_timeline_from_text(raw_title)
    if res_title:
        pos_sec, dur_sec, progress, time_str, clean_title = res_title
    else:
        clean_title = PAUSE_REGEX.sub('', clean_title).strip(' -[]()–—:\t\n')

    # 2. Clean player suffixes from clean_title
    for suffix in MPC_WMP_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if clean_title.lower().startswith("now playing:"):
        clean_title = clean_title[12:].strip()
    elif clean_title.lower().startswith("now playing -"):
        clean_title = clean_title[13:].strip()

    if not file_name and any(clean_title.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
        file_name = clean_title

    # 3. Check Win32 child status bar (msctls_statusbar32)
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

    # 4. Check Win32 trackbar/slider (msctls_trackbar32)
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

    # 5. Check process handles and command line
    if pid and pid > 0:
        fpath, fname, fext = get_process_media_file_info(pid, title=raw_title)
        if fpath:
            file_path = fpath
            file_name = fname

    if not file_path and file_name:
        if os.path.isfile(file_name):
            file_path = os.path.abspath(file_name)
        else:
            user_home = os.path.expanduser("~")
            for folder in ["Videos", "Downloads", "Desktop"]:
                chk = os.path.join(user_home, folder, file_name)
                if os.path.isfile(chk):
                    file_path = chk
                    break

    if file_path and os.path.isfile(file_path):
        meta = get_media_file_metadata(file_path)
        if meta.get("duration", 0.0) > 0 and dur_sec <= 0:
            dur_sec = meta["duration"]
        if meta.get("width", 0) > 0 and meta.get("height", 0) > 0:
            width = meta["width"]
            height = meta["height"]
            aspect_ratio = meta["aspect_ratio"]
            video_res = meta["video_resolution"]
        if not file_name:
            file_name = os.path.basename(file_path)
        if not clean_title or clean_title.lower() in ("windows media player", "media player classic", "mpc-hc", "mpc-be"):
            clean_title = file_name

    # 6. Format progress & timeline
    if dur_sec > 0:
        progress = min(1.0, max(0.0, pos_sec / dur_sec))
        time_str = format_seek_timeline(pos_sec, dur_sec)

    now = time.time()
    speed = calculate_playback_speed_velocity(proc_key, pos_sec, now, is_playing)

    # Clean leftover suffixes
    for suffix in MPC_WMP_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if not clean_title:
        clean_title = file_name or raw_title

    return {
        "seek_position_sec": round(pos_sec, 2),
        "seek_duration_sec": round(dur_sec, 2),
        "seek_progress": round(progress, 4),
        "seek_time_str": time_str,
        "clean_title": clean_title,
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


class MPCClassicDetector(BasePlayerDetector):
    """Modular Player Detector for MPC-HC, MPC-BE, and Legacy Windows Media Player."""

    player_name = "Media Player Classic & Legacy WMP"
    process_names = ("mpc-hc.exe", "mpc-hc64.exe", "mpc-be.exe", "mpc-be64.exe", "wmplayer.exe")
    window_classes = ("MediaPlayerClassicW", "MPC-BE", "WMPAppHost", "WMPlayerApp")
    title_keywords = ("mpc-hc", "mpc-be", "media player classic", "windows media player")
    suffixes = tuple(MPC_WMP_SUFFIXES)

    def inspect_timeline(
        self,
        title: str,
        proc_name: str,
        hwnd: Optional[int] = None,
        pid: Optional[int] = None,
        is_playing: bool = True,
        detected_file: Optional[str] = None,
        detected_path: Optional[str] = None
    ) -> Dict[str, Any]:
        return inspect_mpc_classic_timeline(
            title=title,
            proc_name=proc_name,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )


if __name__ == "__main__":
    detector = MPCClassicDetector()
    detector.run_cli()
