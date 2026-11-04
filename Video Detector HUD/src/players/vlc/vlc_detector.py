# -*- coding: utf-8 -*-
"""
players/vlc/vlc_detector.py: VLC Media Player Dedicated Telemetry & Standalone Diagnostic Sentinel.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import re
import time
import urllib.parse
from typing import Dict, Any, Optional, Tuple, List

# Ensure 'src' is in sys.path
_this_dir = os.path.dirname(os.path.abspath(__file__))
_players_dir = os.path.dirname(_this_dir)
_src_dir = os.path.dirname(_players_dir)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

from modules.config import VIDEO_FILE_EXTENSIONS
from modules.win32_api import user32
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
    _TIME_LABEL_REGEX
)

_uia_instance = None
_uia_cond_text = None
_uia_init_attempted = False

VLC_SUFFIXES = [" - VLC media player", " - VLC"]


def _get_vlc_uia_text_condition():
    """Lazily loads and initializes UIAutomation COM instance for VLC Qt text controls."""
    global _uia_instance, _uia_cond_text, _uia_init_attempted
    if _uia_init_attempted:
        return _uia_instance, _uia_cond_text
    _uia_init_attempted = True
    try:
        import comtypes.client
        from comtypes.gen import UIAutomationClient
        _uia_instance = comtypes.client.CreateObject(
            UIAutomationClient.CUIAutomation,
            interface=UIAutomationClient.IUIAutomation
        )
        _uia_cond_text = _uia_instance.CreatePropertyCondition(
            UIAutomationClient.UIA_ControlTypePropertyId, 50020
        )
    except Exception:
        try:
            import comtypes.client
            sys_root = os.environ.get('SystemRoot', r'C:\Windows')
            uia_dll = os.path.join(sys_root, 'System32', 'UIAutomationCore.dll')
            if os.path.exists(uia_dll):
                comtypes.client.GetModule(uia_dll)
            else:
                comtypes.client.GetModule('UIAutomationCore.dll')
            from comtypes.gen import UIAutomationClient
            _uia_instance = comtypes.client.CreateObject(
                UIAutomationClient.CUIAutomation,
                interface=UIAutomationClient.IUIAutomation
            )
            _uia_cond_text = _uia_instance.CreatePropertyCondition(
                UIAutomationClient.UIA_ControlTypePropertyId, 50020
            )
        except Exception:
            _uia_instance = None
            _uia_cond_text = None
    return _uia_instance, _uia_cond_text


def extract_vlc_uia_timeline(hwnd: int) -> Optional[Tuple[float, float, float, str]]:
    """
    Directly extracts VLC current position and remaining duration / total duration
    via Windows UI Automation (<50ms).
    VLC exposes two Text controls on its control toolbar:
      - Current elapsed time: e.g. "00:02" or "01:23:45"
      - Remaining or total duration: e.g. "-07:00" or "07:02"
    Returns (pos_sec, dur_sec, progress, time_str) or None.
    """
    if not hwnd or not user32.IsWindow(hwnd):
        return None

    uia, cond_text = _get_vlc_uia_text_condition()
    if not uia or not cond_text:
        return None

    try:
        from comtypes.gen import UIAutomationClient
        root = uia.ElementFromHandle(hwnd)
        if not root:
            return None

        elements = root.FindAll(UIAutomationClient.TreeScope_Descendants, cond_text)
        if not elements or elements.Length == 0:
            return None

        found_times: List[str] = []
        for i in range(elements.Length):
            el = elements.GetElement(i)
            if not el:
                continue
            try:
                name = el.CurrentName
                if name:
                    clean_name = name.strip()
                    if _TIME_LABEL_REGEX.match(clean_name):
                        found_times.append(clean_name)
            except Exception:
                pass

        if not found_times:
            return None

        from players.base_player import parse_timestamp_seconds
        pos_sec = parse_timestamp_seconds(found_times[0])
        dur_sec = 0.0

        if len(found_times) >= 2:
            sec_label = found_times[1]
            if sec_label.startswith('-'):
                rem_sec = parse_timestamp_seconds(sec_label.lstrip('-'))
                dur_sec = pos_sec + rem_sec
            else:
                dur_sec = parse_timestamp_seconds(sec_label)

        if dur_sec > 0:
            progress = min(1.0, max(0.0, pos_sec / dur_sec))
            time_str = format_seek_timeline(pos_sec, dur_sec)
            return pos_sec, dur_sec, progress, time_str
        elif pos_sec > 0:
            return pos_sec, 0.0, 0.0, format_seek_timeline(pos_sec, 0.0)

    except Exception:
        pass

    return None


def get_vlc_mru_recent_video(title: Optional[str] = None) -> Optional[str]:
    """
    Reads recently opened media from VLC's Qt configuration (%APPDATA%\\vlc\\vlc-qt-interface.ini).
    Matches against window title if provided.
    """
    try:
        ini_path = os.path.expandvars(r'%APPDATA%\vlc\vlc-qt-interface.ini')
        if not os.path.isfile(ini_path):
            return None

        with open(ini_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        m = re.search(r'list=([^\r\n]+)', content)
        if not m:
            return None

        clean_title = (title or "").lower()
        items = [i.strip(' "\'') for i in m.group(1).split(',')]
        for item in items:
            if not item:
                continue
            if item.startswith('file:///'):
                clean_path = urllib.parse.unquote(item[8:])
            elif item.startswith('file://'):
                clean_path = urllib.parse.unquote(item[7:])
            else:
                clean_path = urllib.parse.unquote(item)
            clean_path = os.path.normpath(clean_path)

            if os.path.isfile(clean_path):
                bname = os.path.basename(clean_path).lower()
                if clean_title and clean_title not in ("vlc media player", "vlc") and (bname in clean_title or clean_title in bname):
                    return clean_path
    except Exception:
        pass
    return None


def inspect_vlc_timeline(
    title: str,
    proc_name: str = "vlc.exe",
    hwnd: Optional[int] = None,
    pid: Optional[int] = None,
    is_playing: bool = True,
    detected_file: Optional[str] = None,
    detected_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dedicated VLC Media Player inspection engine.
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
    proc_key = f"vlc.exe_{pid or 0}"

    # 1. Extract timeline from title if present
    res_title = extract_timeline_from_text(raw_title)
    if res_title:
        pos_sec, dur_sec, progress, time_str, clean_title = res_title
    else:
        clean_title = PAUSE_REGEX.sub('', clean_title).strip(' -[]()–—:\t\n')

    # 2. Clean VLC suffixes
    for suffix in VLC_SUFFIXES:
        if clean_title.lower().endswith(suffix.lower()):
            clean_title = clean_title[:-len(suffix)].strip()
            break

    if not file_name and any(clean_title.lower().endswith(ext) for ext in VIDEO_FILE_EXTENSIONS):
        file_name = clean_title

    # 3. Dedicated VLC UI Automation text extraction
    if hwnd:
        uia_tl = extract_vlc_uia_timeline(hwnd)
        if uia_tl:
            u_pos, u_dur, u_prog, u_str = uia_tl
            if u_pos > 0 or pos_sec <= 0:
                pos_sec = u_pos
            if u_dur > 0 and dur_sec <= 0:
                dur_sec = u_dur
                progress = u_prog
                time_str = u_str

    # 4. Check process handles and VLC MRU
    if pid and pid > 0:
        fpath, fname, fext = get_process_media_file_info(pid, title=raw_title)
        if fpath:
            file_path = fpath
            file_name = fname
        else:
            vlc_mru = get_vlc_mru_recent_video(raw_title)
            if vlc_mru:
                file_path = vlc_mru
                file_name = os.path.basename(vlc_mru)

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
        if not clean_title or clean_title.lower() in ("vlc media player", "vlc"):
            clean_title = file_name

    # 5. Format progress & timeline
    if dur_sec > 0:
        progress = min(1.0, max(0.0, pos_sec / dur_sec))
        time_str = format_seek_timeline(pos_sec, dur_sec)

    now = time.time()
    speed = calculate_playback_speed_velocity(proc_key, pos_sec, now, is_playing)

    for suffix in VLC_SUFFIXES:
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


class VLCDetector(BasePlayerDetector):
    """Modular Player Detector for VideoLAN VLC Media Player."""

    player_name = "VLC Media Player"
    process_names = ("vlc.exe",)
    window_classes = ("Qt5QWindowIcon", "Qt6QWindowIcon", "VLC")
    title_keywords = ("vlc media player", " - vlc")
    suffixes = tuple(VLC_SUFFIXES)

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
        return inspect_vlc_timeline(
            title=title,
            proc_name=proc_name,
            hwnd=hwnd,
            pid=pid,
            is_playing=is_playing,
            detected_file=detected_file,
            detected_path=detected_path
        )


if __name__ == "__main__":
    detector = VLCDetector()
    detector.run_cli()
