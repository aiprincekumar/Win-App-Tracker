# -*- coding: utf-8 -*-
"""
players/kodi/kodi_detector.py: Kodi Dedicated Telemetry & Diagnostic Sentinel.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import time
import re
from typing import Dict, Any, Optional, Tuple, List

# Ensure 'src' is in sys.path
_this_dir = os.path.dirname(os.path.abspath(__file__))
_players_dir = os.path.dirname(_this_dir)
_src_dir = os.path.dirname(_players_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from modules.config import VIDEO_FILE_EXTENSIONS
from modules.smtc import get_smtc_session
from players.base_player import (
    BasePlayerDetector,
    PAUSE_REGEX,
    extract_timeline_from_text,
    detect_pause_in_title,
    format_seek_timeline,
    format_video_resolution,
    get_media_file_metadata,
    calculate_playback_speed_velocity,
    get_process_media_file_info
)

KODI_SUFFIXES = [
    " - Kodi Media Center", " - Kodi", "Kodi Media Center", "Kodi"
]

_KODI_TIMELINE_REGEX = re.compile(
    r'[\[\(]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[\/|\\]\s*(-?\d{1,2}:\d{2}(?::\d{2})?)\s*[\]\)]'
)


def inspect_kodi_timeline(
    title: str,
    proc_name: str = "kodi.exe",
    hwnd: Optional[int] = None,
    pid: Optional[int] = None,
    is_playing: bool = True,
    detected_file: Optional[str] = None,
    detected_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dedicated Kodi inspection engine.
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

    # 1. Embedded bracket timeline in title: e.g. "Movie.mkv [01:23 / 10:45] - Kodi"
    m_tl = _KODI_TIMELINE_REGEX.search(clean_title)
    if m_tl:
        from players.base_player import parse_timestamp_seconds
        pos_sec = parse_timestamp_seconds(m_tl.group(1))
        raw_dur = m_tl.group(2).strip()
        if raw_dur.startswith('-'):
            rem_sec = parse_timestamp_seconds(raw_dur.lstrip('-'))
            dur_sec = pos_sec + rem_sec
        else:
            dur_sec = parse_timestamp_seconds(raw_dur)
        clean_title = _KODI_TIMELINE_REGEX.sub('', clean_title).strip()

    # 2. Extract standard timeline from title if not already parsed
    if pos_sec <= 0.0 and dur_sec <= 0.0:
        res_title = extract_timeline_from_text(raw_title)
        if res_title:
            pos_sec, dur_sec, progress, time_str, clean_title = res_title
        else:
            clean_title = PAUSE_REGEX.sub('', clean_title).strip(' -[]()–—:\t\n')
    else:
        clean_title = PAUSE_REGEX.sub('', clean_title).strip(' -[]()–—:\t\n')

    # 3. Clean Kodi suffixes
    for suffix in KODI_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if clean_title.lower().startswith("now playing:"):
        clean_title = clean_title[12:].strip()
    elif clean_title.lower().startswith("now playing -"):
        clean_title = clean_title[13:].strip()

    if not file_name and any(clean_title.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
        file_name = clean_title

    # 4. Check Windows SMTC session (Kodi exposes SMTC on Windows 10/11)
    try:
        smtc_sess = get_smtc_session("kodi") or get_smtc_session(p_clean)
        if smtc_sess:
            s_dur = float(smtc_sess.get("seek_duration_sec", 0.0))
            s_pos = float(smtc_sess.get("seek_position_sec", 0.0))
            if s_dur > 0.0 and dur_sec <= 0:
                dur_sec = s_dur
                pos_sec = s_pos
                progress = smtc_sess.get("seek_progress", min(1.0, max(0.0, pos_sec / dur_sec)))
                time_str = smtc_sess.get("seek_time_str", format_seek_timeline(pos_sec, dur_sec))
            if smtc_sess.get("is_paused"):
                is_title_paused = True
            smtc_t = (smtc_sess.get("title") or "").strip()
            if smtc_t and (not clean_title or clean_title.lower() in ("kodi", "kodi media center")):
                clean_title = smtc_t
            if not file_name and smtc_t and any(smtc_t.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
                file_name = smtc_t
    except Exception:
        pass

    # 5. Check process command line & open file handles
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
        if not clean_title or clean_title.lower() in ("kodi", "kodi media center"):
            clean_title = file_name

    # 6. Format progress & timeline
    if dur_sec > 0:
        progress = min(1.0, max(0.0, pos_sec / dur_sec))
        time_str = format_seek_timeline(pos_sec, dur_sec)

    now = time.time()
    speed = calculate_playback_speed_velocity(proc_key, pos_sec, now, is_playing)

    # Clean leftover suffixes
    for suffix in KODI_SUFFIXES:
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


class KodiDetector(BasePlayerDetector):
    """Modular Player Detector for Kodi."""

    player_name = "Kodi Media Center"
    process_names = ("kodi.exe",)
    window_classes = ("Kodi", "KodiPE", "SDL_app")
    title_keywords = ("kodi", "kodi media center")
    suffixes = tuple(KODI_SUFFIXES)

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
        return inspect_kodi_timeline(
            title=title,
            proc_name=proc_name,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )


if __name__ == "__main__":
    detector = KodiDetector()
    detector.run_cli()
