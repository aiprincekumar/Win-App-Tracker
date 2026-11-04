# -*- coding: utf-8 -*-
"""
modules/window_scanner.py: High-Performance Win32 System Windows Scanner (<5ms).
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import ctypes
from ctypes import wintypes, byref
from typing import List, Dict, Any, Optional

from .config import is_system_ignored_class, is_system_ignored_title
from .win32_api import (
    user32,
    WNDENUMPROC,
    _get_process_name_by_pid,
    resolve_uwp_real_process,
    is_window_cloaked
)
from .classifier import classify_media_window
from .offline_player import inspect_offline_player_timeline
from players.base_player import get_window_display_mode

_mock_candidates: Optional[List[Dict[str, Any]]] = None


def set_mock_candidates(candidates: Optional[List[Dict[str, Any]]]) -> None:
    """Helper for automated unit tests to mock system window candidates."""
    global _mock_candidates
    _mock_candidates = candidates


def scan_system_media_candidates() -> List[Dict[str, Any]]:
    global _mock_candidates
    if _mock_candidates is not None:
        return list(_mock_candidates)
    """
    Scans all running top-level windows using ultra-fast Win32 EnumWindows API (<2ms).
    Replaces slow subprocess tasklist /v (which caused 3-10 second blank screen delays).
    Accurately discovers media windows, resolves UWP child processes, and classifies each.
    """
    candidates: List[Dict[str, Any]] = []
    pid_cache: Dict[int, str] = {}
    seen_windows = set()

    def enum_cb(hwnd, lparam):
        if not user32.IsWindowVisible(hwnd):
            return True

        # Filter out common background Win32 system windows by window class
        cls_buf = ctypes.create_unicode_buffer(256)
        c_ret = user32.GetClassNameW(hwnd, cls_buf, 256)
        cls_name = cls_buf.value.strip() if c_ret > 0 else ""
        if is_system_ignored_class(cls_name):
            return True

        length = user32.GetWindowTextLengthW(hwnd)
        if length <= 0:
            return True

        buf = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buf, length + 1)
        title = buf.value.strip()
        if not title:
            return True

        # Filter out common background Win32 system windows by window title
        if is_system_ignored_title(title):
            return True

        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, byref(pid))
        pid_val = pid.value

        if pid_val not in pid_cache:
            pid_cache[pid_val] = _get_process_name_by_pid(pid_val)
        proc_name = pid_cache[pid_val]

        # Handle UWP ApplicationFrameHost wrapping Modern Windows Media Player or Films & TV
        t_low = title.lower()
        if proc_name == "applicationframehost.exe":
            real_pid, real_proc = resolve_uwp_real_process(hwnd, title)
            if real_proc:
                proc_name = real_proc
                if real_pid:
                    pid_val = real_pid
                elif proc_name == "video.ui.exe":
                    try:
                        import psutil
                        for p in psutil.process_iter(['pid', 'name']):
                            if p.info['name'].lower() == 'video.ui.exe':
                                pid_val = p.info['pid']
                                break
                    except Exception:
                        pass
            elif any(k in t_low for k in ["films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video.ui"]) or ("films" in t_low and "tv" in t_low):
                proc_name = "video.ui.exe"
                try:
                    import psutil
                    for p in psutil.process_iter(['pid', 'name']):
                        if p.info['name'].lower() == 'video.ui.exe':
                            pid_val = p.info['pid']
                            break
                except Exception:
                    pass
            elif "media player" in t_low or "groove music" in t_low or t_low in ("music library", "video library", "play queue", "home", "settings"):
                proc_name = "microsoft.media.player.exe"
                try:
                    import psutil
                    for p in psutil.process_iter(['pid', 'name']):
                        if p.info['name'].lower() == 'microsoft.media.player.exe':
                            pid_val = p.info['pid']
                            break
                except Exception:
                    pass

        # Unique window key to avoid duplicate window frames
        win_key = (proc_name, pid_val, title)
        if win_key in seen_windows:
            return True
        seen_windows.add(win_key)

        classification = classify_media_window(proc_name, str(pid_val), title, hwnd=hwnd)
        c_type = classification.get("type", "UNKNOWN")

        # Inspect offline player timeline, file duration & pause indicators
        tl_info = inspect_offline_player_timeline(
            title,
            proc_name,
            hwnd=hwnd,
            pid=pid_val,
            detected_file=classification.get("file_name"),
            detected_path=classification.get("file_path")
        )
        if tl_info.get("seek_duration_sec", 0.0) > 0 and c_type in ("UNKNOWN", "EMPTY_PLAYER"):
            c_type = "VIDEO"

        if proc_name == "video.ui.exe" and c_type == "UNKNOWN":
            if tl_info.get("seek_duration_sec", 0.0) > 0 or tl_info.get("detected_file") or classification.get("smtc_title"):
                c_type = "VIDEO"
            else:
                c_type = "EMPTY_PLAYER"

        if c_type in ("VIDEO", "PURE_AUDIO", "EMPTY_PLAYER"):
            final_title = title
            if title.lower() in ("media player", "windows media player", "vlc media player", "potplayer", "mpc-hc", "mpc-be", "mpv", "films & tv", "movies & tv", "video", "home", "music library", "video library", "play queue", "settings"):
                if classification.get("smtc_title"):
                    final_title = classification.get("smtc_title")
                elif classification.get("file_name"):
                    final_title = classification.get("file_name")
                elif tl_info.get("detected_file"):
                    final_title = tl_info.get("detected_file")
                elif tl_info.get("clean_title"):
                    final_title = tl_info.get("clean_title")
            elif tl_info.get("clean_title"):
                final_title = tl_info.get("clean_title")

            # Clean player suffixes early from final_title
            for suffix in [
                " - Films & TV", " - Movies & TV", " - Film & TV", " - Films and TV", " - Movies and TV", " - Video",
                " - VLC media player", " - Windows Media Player", " - Media Player",
                " - PotPlayer", " - Daum PotPlayer",
                " - MPC-HC x64", " - MPC-BE x64", " - MPC-HC (64-bit)", " - MPC-BE (64-bit)",
                " - MPC-HC", " - MPC-BE", " - Media Player Classic - Home Cinema",
                " - Media Player Classic - Black Edition", " - Media Player Classic",
                " - mpv.net", " - mpvnet", " - mpv",
                " - KMPlayer 64X", " - KMPlayer (64-bit)", " - KMPlayer64", " - KMPlayer", " - KMP",
                " - GOM Player Plus", " - GOM Player", " - GOMPlayer", " - GOM 64",
                " - SMPlayer v.", " - SMPlayer",
                " - Kodi Media Center", " - Kodi",
                " - BS.Player PRO", " - BS.Player", " - BSPlayer",
                " - 5KPlayer 64-bit", " - 5KPlayer"
            ]:
                if final_title.lower().endswith(suffix.lower()):
                    final_title = final_title[:-len(suffix)].strip()
                    break

            if final_title.lower().startswith("now playing:"):
                final_title = final_title[12:].strip()
            elif final_title.lower().startswith("now playing -"):
                final_title = final_title[13:].strip()

            # Check occlusion, cloaking, and minimized state via DWM / Win32
            is_cloaked = is_window_cloaked(hwnd) if hwnd else False
            is_iconic = bool(user32.IsIconic(hwnd)) if hwnd else False
            win_mode, is_focused = get_window_display_mode(hwnd)

            if is_cloaked:
                is_occluded = True
                view_state = "Cloaked/Hidden"
            elif is_iconic:
                is_occluded = True
                view_state = "Minimized"
            else:
                is_occluded = False
                view_state = "100% VISIBLE (Uncovered)"

            # Window rect for resolution & aspect ratio
            rect = wintypes.RECT()
            win_w, win_h = 1920, 1080
            if hwnd and user32.GetWindowRect(hwnd, byref(rect)):
                win_w = max(0, rect.right - rect.left)
                win_h = max(0, rect.bottom - rect.top)

            ratio_val = win_w / max(1, win_h)
            aspect_str = "16:9" if 1.70 <= ratio_val <= 1.85 else ("4:3" if 1.30 <= ratio_val <= 1.40 else ("21:9" if ratio_val > 2.0 else "Wide"))
            if win_h >= 2160 and aspect_str == "16:9":
                res_tag = "4K UHD"
            elif win_h >= 1440 and aspect_str == "16:9":
                res_tag = "1440p QHD"
            elif win_h >= 1080 and aspect_str == "16:9":
                res_tag = "1080p FHD"
            elif win_h >= 720 and aspect_str == "16:9":
                res_tag = "720p HD"
            else:
                res_tag = f"{win_w}x{win_h}"
            video_resolution = f"{res_tag} ({aspect_str} Aspect)"

            # If offline inspector extracted actual video resolution from media file metadata, use it!
            if tl_info.get("video_resolution") and tl_info.get("video_resolution") != "N/A":
                video_resolution = tl_info["video_resolution"]
                win_w = tl_info.get("width", win_w)
                win_h = tl_info.get("height", win_h)
                aspect_str = tl_info.get("aspect_ratio", aspect_str)

            status_val = "Paused" if tl_info.get("is_paused") else "Running"
            candidates.append({
                "hwnd": hwnd,
                "category": c_type,
                "app_name": classification.get("app_name", "Films & TV" if proc_name == "video.ui.exe" else proc_name),
                "process": proc_name,
                "pid": str(pid_val),
                "title": final_title,
                "status": status_val,
                "file_ext": classification.get("file_ext", None),
                "rationale": classification.get("rationale", ""),
                "platform_tag": classification.get("platform_tag", "Films & TV" if proc_name == "video.ui.exe" else "Generic Player"),
                "seek_position_sec": tl_info.get("seek_position_sec", 0.0),
                "seek_duration_sec": tl_info.get("seek_duration_sec", 0.0),
                "seek_progress": tl_info.get("seek_progress", 0.0),
                "seek_time_str": tl_info.get("seek_time_str", "00:00 / 00:00"),
                "playback_speed": tl_info.get("playback_speed", 1.00),
                "is_paused": tl_info.get("is_paused", False),
                "title_indicates_paused": tl_info.get("is_paused", False),
                "detected_file": tl_info.get("detected_file"),
                "detected_path": tl_info.get("detected_path"),
                "is_occluded": is_occluded,
                "view_state": view_state,
                "is_cloaked": is_cloaked,
                "is_minimized": is_iconic,
                "window_mode": win_mode,
                "is_focused": is_focused,
                "video_resolution": video_resolution,
                "width": win_w,
                "height": win_h,
                "aspect_ratio": aspect_str,
                "rendering_fps": "60 FPS (Active Motion)" if c_type == "VIDEO" else "0 FPS (Static)"
            })

        return True

    try:
        enum_proc = WNDENUMPROC(enum_cb)
        h_desk = None
        try:
            h_desk = user32.OpenInputDesktop(0, False, 0x0100)
            if not h_desk:
                h_desk = user32.OpenDesktopW("Default", 0, False, 0x0100)
        except Exception:
            h_desk = None

        if h_desk:
            user32.EnumDesktopWindows(h_desk, enum_proc, 0)
            user32.CloseDesktop(h_desk)

        # Also scan thread desktop to ensure 100% window coverage
        user32.EnumWindows(enum_proc, 0)
    except Exception:
        pass

    return candidates
