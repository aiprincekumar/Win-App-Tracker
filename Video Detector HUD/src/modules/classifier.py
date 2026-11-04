# -*- coding: utf-8 -*-
"""
modules/classifier.py: Deep Video vs Pure Audio Heuristic Classifier Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import re
from typing import Dict, Any, Optional

from .config import (
    AUDIO_FILE_EXTENSIONS,
    VIDEO_FILE_EXTENSIONS,
    KNOWN_PURE_AUDIO_APPS,
    MODERN_WINDOWS_MEDIA_PLAYER_PROCS,
    DUAL_PURPOSE_MEDIA_PLAYERS,
    DEDICATED_VIDEO_ONLY_APPS,
    BROWSER_PROCESSES,
    BROWSER_PURE_AUDIO_PATTERNS,
    BROWSER_VIDEO_PATTERNS
)
from .powercfg import get_system_power_display_requests
from .smtc import get_wmp_smtc_info, get_smtc_session
from .wmp_surface import detect_wmp_legacy_video_surface


PLATFORM_PATTERNS = [
    (r'youtube\.com|YouTube', 'YouTube'),
    (r'netflix\.com|Netflix', 'Netflix'),
    (r'primevideo\.com|Amazon Prime|Prime Video', 'Prime Video'),
    (r'hotstar\.com|Disney\+|Disney\+ Hotstar', 'Disney+ Hotstar'),
    (r'twitch\.tv|Twitch', 'Twitch'),
    (r'jiocinema\.com|JioCinema', 'JioCinema'),
    (r'crunchyroll\.com|Crunchyroll', 'Crunchyroll'),
    (r'vimeo\.com|Vimeo', 'Vimeo'),
    (r'\.(mp4|mkv|avi|mov|webm|flv|m4v|ts|wmv|mpg)($|\s|-)', 'Local Video File'),
]


def extract_platform_tag(window_title: str, process_name: str) -> str:
    """
    Classifies the media source platform into:
      - 'YouTube', 'Netflix', 'Prime Video', 'Disney+ Hotstar', 'Twitch', 'JioCinema',
        'Crunchyroll', 'Vimeo', 'Spotify', 'Local Video File', 'Local Audio File',
        'Web Stream', or 'Generic Player'.
    """
    title = window_title or ""
    title_lower = title.lower()
    proc = (process_name or "").lower()

    # 0.0 VLC Media Player dedicated detection
    if proc == "vlc.exe" or "vlc" in proc or (
        (" - vlc media player" in title_lower or title_lower in ("vlc media player", "vlc") or title_lower.startswith("vlc media player"))
        and proc not in BROWSER_PROCESSES
    ):
        return "VLC Media Player"

    # 0. Films & TV / Movies & TV dedicated player
    if (proc in ("video.ui.exe", "applicationframehost.exe") or 
        any(k in title_lower for k in ["films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video.ui"]) or
        ("films" in title_lower and "tv" in title_lower)):
        return "Films & TV"

    # 0.1 MPC-HC detection
    if proc in ("mpc-hc.exe", "mpc-hc64.exe") or "mpc-hc" in proc:
        return "MPC-HC"
    if ((" - mpc-hc" in title_lower or title_lower.startswith("mpc-hc") or "media player classic" in title_lower)
        and proc not in BROWSER_PROCESSES and "black" not in title_lower and "be" not in title_lower):
        return "MPC-HC"

    # 0.2 MPC-BE detection
    if proc in ("mpc-be.exe", "mpc-be64.exe") or "mpc-be" in proc:
        return "MPC-BE"
    if ((" - mpc-be" in title_lower or title_lower.startswith("mpc-be") or "black edition" in title_lower)
        and proc not in BROWSER_PROCESSES):
        return "MPC-BE"

    # 0.3 Modern Windows Media Player (Windows 11)
    if proc in ("microsoft.media.player.exe", "music.ui.exe") or (
        (" - media player" in title_lower or title_lower == "media player" or title_lower.strip() in ("video library", "music library", "play queue", "home", "settings"))
        and proc not in BROWSER_PROCESSES
        and proc not in ("vlc.exe", "mpc-hc.exe", "mpc-hc64.exe", "mpc-be.exe", "mpc-be64.exe", "potplayer.exe", "potplayer64.exe")
    ):
        return "Media Player"

    # 0.4 Windows Media Player (Legacy)
    if proc in ("wmplayer.exe", "zune.exe") or "wmplayer" in proc:
        return "Windows Media Player"
    if ((" - windows media player" in title_lower or title_lower == "windows media player" or title_lower.startswith("windows media player"))
        and proc not in BROWSER_PROCESSES):
        return "Windows Media Player"

    # 0.5 Daum PotPlayer dedicated detection
    if proc in ("potplayer.exe", "potplayer64.exe", "potplayermini64.exe", "potplayermini.exe") or "potplayer" in proc:
        return "PotPlayer"
    if ((" - potplayer" in title_lower or title_lower.startswith("potplayer") or title_lower == "potplayer")
        and proc not in BROWSER_PROCESSES):
        return "PotPlayer"

    # 0.6 MPV / mpv.net detection
    if proc in ("mpv.exe", "mpvnet.exe") or "mpv" in proc:
        return "MPV"
    if ((" - mpv" in title_lower or title_lower.startswith("mpv") or title_lower in ("mpv", "mpv.net", "mpvnet"))
        and proc not in BROWSER_PROCESSES):
        return "MPV"

    # 0.7 KMPlayer detection
    if proc in ("kmplayer.exe", "kmplayer64.exe") or "kmplayer" in proc:
        return "KMPlayer"
    if ((" - kmplayer" in title_lower or title_lower.startswith("kmplayer") or title_lower in ("kmplayer", "kmplayer64", "kmp"))
        and proc not in BROWSER_PROCESSES):
        return "KMPlayer"

    # 0.8 GOM Player detection
    if proc in ("gom.exe", "gom64.exe") or "gom" in proc:
        return "GOM Player"
    if ((" - gom player" in title_lower or title_lower.startswith("gom player") or title_lower in ("gom player", "gom", "gomplayer"))
        and proc not in BROWSER_PROCESSES):
        return "GOM Player"

    # 0.9 SMPlayer detection
    if proc in ("smplayer.exe",) or "smplayer" in proc:
        return "SMPlayer"
    if ((" - smplayer" in title_lower or title_lower.startswith("smplayer") or title_lower == "smplayer")
        and proc not in BROWSER_PROCESSES):
        return "SMPlayer"

    # 0.10 Kodi Media Center detection
    if proc in ("kodi.exe",) or "kodi" in proc:
        return "Kodi"
    if ((" - kodi" in title_lower or title_lower.startswith("kodi") or title_lower in ("kodi", "kodi media center"))
        and proc not in BROWSER_PROCESSES):
        return "Kodi"

    # 0.11 BS.Player detection
    if proc in ("bsplayer.exe",) or "bsplayer" in proc:
        return "BSPlayer"
    if ((" - bs.player" in title_lower or " - bsplayer" in title_lower or title_lower in ("bsplayer", "bs.player"))
        and proc not in BROWSER_PROCESSES):
        return "BSPlayer"

    # 0.12 5KPlayer detection
    if proc in ("5kplayer.exe",) or "5kplayer" in proc:
        return "5KPlayer"
    if ((" - 5kplayer" in title_lower or title_lower.startswith("5kplayer") or title_lower == "5kplayer")
        and proc not in BROWSER_PROCESSES):
        return "5KPlayer"

    # 1. Direct Web/Platform regex matching from authoritative catalog
    for pat, tag in PLATFORM_PATTERNS:
        if tag == 'Local Video File':
            continue
        if re.search(pat, title, re.IGNORECASE):
            return tag

    # 2. Spotify detection
    if "spotify" in proc or "spotify" in title_lower:
        return "Spotify"

    # 3. Local Video Files (extension in title)
    for ext in VIDEO_FILE_EXTENSIONS:
        if ext in title_lower:
            return "Local Video File"

    # 4. Local Audio Files (extension in title)
    for ext in AUDIO_FILE_EXTENSIONS:
        if ext in title_lower:
            return "Local Audio File"

    # 5. Dedicated Video Apps
    if proc in DEDICATED_VIDEO_ONLY_APPS:
        app = DEDICATED_VIDEO_ONLY_APPS[proc]
        if "netflix" in app.lower():
            return "Netflix"
        return app

    # 6. Browser fallback (if running in browser but not matched above)
    if proc in BROWSER_PROCESSES:
        return "Web Stream"

    # 7. Dual-purpose and modern players
    if proc in DUAL_PURPOSE_MEDIA_PLAYERS or proc in MODERN_WINDOWS_MEDIA_PLAYER_PROCS:
        return "Generic Player"

    if proc in KNOWN_PURE_AUDIO_APPS:
        return "Local Audio File"

    return "Generic Player"


def extract_file_extension(title: str) -> Optional[str]:
    """Extracts any known media file extension present in the window title."""
    lower = title.lower()
    for ext in AUDIO_FILE_EXTENSIONS:
        if ext in lower:
            return ext
    for ext in VIDEO_FILE_EXTENSIONS:
        if ext in lower:
            return ext
    return None


def _classify_media_window_core(image_name: str, pid: str, window_title: str, hwnd: Optional[int] = None) -> Dict[str, Any]:
    """
    Classifies a window into:
      - 'VIDEO': Confirmed video playback candidate.
      - 'PURE_AUDIO': Audio playback candidate (MUST BE IGNORED).
      - 'EMPTY_PLAYER': Player open but idle/stopped.
      - 'UNKNOWN': Non-media or unrecognized window.
    Along with a detailed rationale explaining the classification.
    """
    img = image_name.lower()
    title_lower = window_title.lower()

    # 1. Known pure-audio applications (Spotify, foobar2000, AIMP, etc.)
    if img in KNOWN_PURE_AUDIO_APPS:
        return {
            "type": "PURE_AUDIO",
            "app_name": KNOWN_PURE_AUDIO_APPS[img],
            "rationale": f"Known dedicated audio app ({KNOWN_PURE_AUDIO_APPS[img]})"
        }

    # 1.5. UWP ApplicationFrameHost wrapping Films & TV or Modern Media Player
    if img == "applicationframehost.exe":
        real_pid, real_proc = None, None
        if hwnd:
            try:
                from .win32_api import resolve_uwp_real_process
                real_pid, real_proc = resolve_uwp_real_process(hwnd, window_title)
            except Exception:
                pass

        is_films_tv = (
            (real_proc == "video.ui.exe") or
            any(k in title_lower for k in ["films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video.ui"]) or
            ("films" in title_lower and "tv" in title_lower)
        )

        is_modern_player = (
            (real_proc in ("microsoft.media.player.exe", "music.ui.exe")) or
            "media player" in title_lower or
            "groove music" in title_lower or
            title_lower.strip() in ("video library", "music library", "play queue", "home", "settings")
        ) and not is_films_tv

        if is_films_tv:
            smtc_info = None
            try:
                # smtc functions imported at module level
                smtc_info = get_wmp_smtc_info("films_tv") or get_smtc_session("video.ui.exe")
            except Exception:
                pass

            smtc_t = smtc_info.get("title") if smtc_info else None
            ext = extract_file_extension(window_title)
            is_bare = title_lower.strip() in ("films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video")

            # Check open files if bare title or missing filename
            proc_file, proc_fname, proc_fext = None, None, None
            try:
                from .offline_player import get_process_media_file_info
                pid_int = int(pid) if str(pid).isdigit() else None
                if pid_int:
                    proc_file, proc_fname, proc_fext = get_process_media_file_info(pid_int)
                elif pid is None or pid == "N/A":
                    import psutil
                    for p in psutil.process_iter(['pid', 'name']):
                        if p.info['name'].lower() == 'video.ui.exe':
                            proc_file, proc_fname, proc_fext = get_process_media_file_info(p.info['pid'])
                            if proc_fname:
                                break
            except Exception:
                pass

            has_smtc_active = bool(smtc_info and (
                smtc_info.get("playback_type") == 2 or
                smtc_info.get("seek_duration_sec", 0.0) > 0 or
                smtc_info.get("is_playing") or
                smtc_info.get("is_paused")
            ))

            if is_bare and not smtc_t and not ext and not proc_fname and not has_smtc_active:
                return {
                    "type": "EMPTY_PLAYER",
                    "app_name": "Films & TV",
                    "platform_tag": "Films & TV",
                    "rationale": f"Films & TV application open on library/home screen ('{window_title}')"
                }

            final_fn = proc_fname or smtc_t
            return {
                "type": "VIDEO",
                "app_name": "Films & TV",
                "file_ext": ext or proc_fext,
                "file_name": final_fn,
                "file_path": proc_file,
                "smtc_title": smtc_t,
                "platform_tag": "Films & TV",
                "rationale": f"Films & TV video playback detected in UWP container ('{window_title}')"
            }

        elif is_modern_player:
            img = "microsoft.media.player.exe"

    # 2. Dedicated video-only applications (Films & TV, Movies & TV, Netflix, Stremio)
    if img in DEDICATED_VIDEO_ONLY_APPS or img == "video.ui.exe":
        app_name = "Films & TV" if img == "video.ui.exe" else DEDICATED_VIDEO_ONLY_APPS.get(img, "Films & TV")
        smtc_info = None
        try:
            # smtc functions imported at module level
            smtc_info = get_wmp_smtc_info("films_tv") or get_smtc_session("video.ui.exe")
        except Exception:
            pass

        smtc_t = smtc_info.get("title") if smtc_info else None
        ext = extract_file_extension(window_title)
        is_bare = title_lower.strip() in ("films & tv", "movies & tv", "film & tv", "films and tv", "movies and tv", "video")

        proc_file, proc_fname, proc_fext = None, None, None
        try:
            from .offline_player import get_process_media_file_info
            pid_int = int(pid) if str(pid).isdigit() else None
            if pid_int:
                proc_file, proc_fname, proc_fext = get_process_media_file_info(pid_int)
            elif pid is None or pid == "N/A":
                import psutil
                for p in psutil.process_iter(['pid', 'name']):
                    if p.info['name'].lower() == 'video.ui.exe':
                        proc_file, proc_fname, proc_fext = get_process_media_file_info(p.info['pid'])
                        if proc_fname:
                            break
        except Exception:
            pass

        has_smtc_active = bool(smtc_info and (
            smtc_info.get("playback_type") == 2 or
            smtc_info.get("seek_duration_sec", 0.0) > 0 or
            smtc_info.get("is_playing") or
            smtc_info.get("is_paused")
        ))

        if is_bare and not smtc_t and not ext and not proc_fname and not has_smtc_active:
            return {
                "type": "EMPTY_PLAYER",
                "app_name": app_name,
                "platform_tag": "Films & TV" if img == "video.ui.exe" else app_name,
                "rationale": f"{app_name} application open on library/home screen ('{window_title}')"
            }

        final_fn = proc_fname or smtc_t
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "file_ext": ext or proc_fext,
            "file_name": final_fn,
            "file_path": proc_file,
            "smtc_title": smtc_t,
            "platform_tag": "Films & TV" if img == "video.ui.exe" else app_name,
            "rationale": f"Dedicated video platform app ({app_name})"
        }

    # 3. Modern Windows 10 & 11 Media Player (Microsoft.Media.Player.exe / ZuneMusic)
    if img in MODERN_WINDOWS_MEDIA_PLAYER_PROCS:
        app_name = MODERN_WINDOWS_MEDIA_PLAYER_PROCS[img]
        display_requests = get_system_power_display_requests()
        has_display_request = (img in display_requests or "applicationframehost.exe" in display_requests)

        # METHOD 1: Windows Native SMTC API Check (Dedicated to Modern Windows Media Player)
        smtc_info = get_wmp_smtc_info("modern")
        if not smtc_info:
            try:
                from .smtc import get_smtc_session
                smtc_info = get_smtc_session("microsoft.media.player.exe")
            except Exception:
                pass

        proc_file, proc_fname, proc_fext = None, None, None
        try:
            from .offline_player import get_process_media_file_info
            pid_int = int(pid) if str(pid).isdigit() else None
            if pid_int:
                proc_file, proc_fname, proc_fext = get_process_media_file_info(pid_int)
            elif pid is None or pid == "N/A":
                import psutil
                for p in psutil.process_iter(['pid', 'name']):
                    if p.info['name'].lower() == 'microsoft.media.player.exe':
                        proc_file, proc_fname, proc_fext = get_process_media_file_info(p.info['pid'])
                        if proc_fname:
                            break
        except Exception:
            pass

        if smtc_info:
            p_type = smtc_info.get("playback_type", 0)
            smtc_title = smtc_info.get("title") or window_title
            ext = extract_file_extension(window_title)

            # PlaybackType.Music (1) -> Confirmed PURE AUDIO -> Ignored
            if p_type == 1:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "platform_tag": "Media Player",
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Music (Pure Audio) in Modern Windows Media Player ('{smtc_title}')"
                }
            # PlaybackType.Video (2) or active seek duration -> Confirmed VIDEO -> Treated as Video
            elif p_type == 2 or smtc_info.get("seek_duration_sec", 0.0) > 0 or smtc_info.get("is_playing") or smtc_info.get("is_paused"):
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "platform_tag": "Media Player",
                    "file_ext": ext or proc_fext,
                    "file_name": proc_fname or smtc_info.get("title"),
                    "file_path": proc_file,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed Playback in Modern Windows Media Player ('{smtc_title}')"
                }

        # If open video file is directly detected in process file handles -> VIDEO!
        if proc_file and proc_fext:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "file_ext": proc_fext,
                "file_name": proc_fname,
                "file_path": proc_file,
                "smtc_title": smtc_info.get("title") if smtc_info else None,
                "rationale": f"Modern Windows Media Player opened video file '{proc_fname}' ({proc_fext})"
            }

        # Idle / library screen titles:
        # Playing: video_title.mp4 - Media Player, etc.
        # Idle / Library: Media Player, Home, Music library, Video library, Play queue, Settings
        modern_empty_titles = (
            "media player", "home", "music library", "video library", "play queue", "settings", "groove music"
        )
        t_clean = title_lower.strip()
        is_bare = (t_clean in modern_empty_titles or any(t_clean == b or t_clean.startswith(b + " -") or t_clean.startswith(b + " ") for b in modern_empty_titles))
        ext = extract_file_extension(window_title)

        has_smtc_active = bool(smtc_info and (
            smtc_info.get("playback_type") == 2 or
            smtc_info.get("seek_duration_sec", 0.0) > 0 or
            smtc_info.get("is_playing") or
            smtc_info.get("is_paused")
        ))

        if is_bare and not ext and not has_display_request and not proc_fname and not has_smtc_active:
            return {
                "type": "EMPTY_PLAYER",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Modern Windows Media Player open on library/home screen ('{window_title}')"
            }

        # Fallback to existing checks if SMTC is Unknown (0) or session not yet created
        # A) Explicit video file extension in title -> VIDEO
        for v_ext in VIDEO_FILE_EXTENSIONS:
            if v_ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "platform_tag": "Media Player",
                    "file_ext": v_ext,
                    "rationale": f"Playing video file ({v_ext}) in Modern Windows Media Player"
                }

        # B) Explicit video resolution/release metadata -> VIDEO
        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode", "s01", "s02", "e01", "e02"]):
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Video release metadata detected in Modern Windows Media Player"
            }

        # C) Windows DISPLAY wake lock active -> VIDEO
        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Active Windows DISPLAY wake lock (video rendering) in Modern Windows Media Player"
            }

        # D) Explicit audio file extensions -> PURE_AUDIO
        for a_ext in AUDIO_FILE_EXTENSIONS:
            if a_ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "platform_tag": "Media Player",
                    "file_ext": a_ext,
                    "rationale": f"Playing pure audio file ({a_ext}) in Modern Windows Media Player"
                }

        # E) Pure audio keywords in metadata
        if any(w in title_lower for w in ["track ", "artist", "album", "podcast", "radio stream", "playlist", "audio", "song"]):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Audio track metadata detected in Modern Windows Media Player"
            }

        # F) Internal SMTC transport window or popup host
        if "smtc" in title_lower or title_lower == "pop-uphost":
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Modern Media Player background audio transport (SMTC)"
            }

        # G) Video or media file without extension loaded into player:
        if " - media player" in title_lower or " - windows media player" in title_lower:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": "Media Player",
                "rationale": f"Media stream loaded in Modern Windows Media Player ('{window_title}')"
            }

        return {
            "type": "PURE_AUDIO",
            "app_name": app_name,
            "platform_tag": "Media Player",
            "rationale": f"Audio track playback in Modern Windows Media Player ('{window_title}')"
        }

    # 4. Legacy Windows Media Player (wmplayer.exe)
    if img == "wmplayer.exe":
        app_name = "Windows Media Player"
        display_requests = get_system_power_display_requests()
        has_display_request = (img in display_requests)

        # METHOD 1: Windows Native SMTC API Check (Dedicated to Legacy Windows Media Player)
        smtc_info = get_wmp_smtc_info("legacy")
        if smtc_info:
            p_type = smtc_info.get("playback_type", 0)
            smtc_title = smtc_info.get("title") or window_title
            ext = extract_file_extension(window_title)

            # PlaybackType.Music (1) -> Confirmed PURE AUDIO -> Ignored
            if p_type == 1:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "platform_tag": app_name,
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Music (Pure Audio) in Legacy Windows Media Player ('{smtc_title}')"
                }
            # PlaybackType.Video (2) -> Confirmed VIDEO -> Treated as Video
            elif p_type == 2:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "platform_tag": app_name,
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Video in Legacy Windows Media Player ('{smtc_title}')"
                }

        # Fallback to existing checks
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "platform_tag": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing video file ({ext}) in Legacy Windows Media Player"
                }

        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode"]):
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": app_name,
                "rationale": f"Video release metadata detected in Legacy Windows Media Player"
            }

        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": app_name,
                "rationale": f"Active Windows DISPLAY wake lock in Legacy Windows Media Player"
            }

        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "platform_tag": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing pure audio file ({ext}) in Legacy Windows Media Player"
                }

        # DEDICATED METHOD 2: Child Window Video Rendering Surface & Process File Inspection
        # Solves Legacy WMP extension-stripping and missing SMTC by inspecting EVR/DirectShow renderers
        surface_res = detect_wmp_legacy_video_surface(hwnd, pid)
        is_video_surface = surface_res[0]
        surface_rationale = surface_res[1]
        detected_ext = surface_res[2]
        detected_filename = surface_res[3]
        detected_filepath = getattr(surface_res, "detected_path", None) or getattr(surface_res, "detected_filepath", None)
        if is_video_surface:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "platform_tag": app_name,
                "file_ext": detected_ext or extract_file_extension(window_title),
                "file_name": detected_filename,
                "file_path": detected_filepath,
                "rationale": surface_rationale
            }
        elif detected_ext and (detected_ext in AUDIO_FILE_EXTENSIONS):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "platform_tag": app_name,
                "file_ext": detected_ext,
                "file_name": detected_filename,
                "file_path": detected_filepath,
                "rationale": surface_rationale
            }

        # Bare player title with NO media loaded -> EMPTY_PLAYER!
        if title_lower.strip() in ("windows media player", "windows media player (legacy)"):
            return {
                "type": "EMPTY_PLAYER",
                "app_name": app_name,
                "platform_tag": app_name,
                "rationale": f"Legacy Windows Media Player open on library/home screen with no media loaded ('{window_title}')"
            }

        if any(w in title_lower for w in ["track ", "artist", "album", "podcast", "radio stream"]):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "platform_tag": app_name,
                "rationale": f"Audio track metadata detected in Legacy Windows Media Player"
            }

        if title_lower.startswith("windows media player "):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "platform_tag": app_name,
                "rationale": f"Legacy Windows Media Player in audio mode ('{window_title}')"
            }

        return {
            "type": "PURE_AUDIO",
            "app_name": app_name,
            "platform_tag": app_name,
            "rationale": f"Audio track playback in Legacy Windows Media Player ('{window_title}')"
        }

    # 4.5. Media Player Classic (MPC-HC and MPC-BE)
    if img in ("mpc-hc.exe", "mpc-hc64.exe", "mpc-be.exe", "mpc-be64.exe"):
        is_be = "be" in img
        player_name = "MPC-BE" if is_be else "MPC-HC"
        display_requests = get_system_power_display_requests()
        has_display_request = (img in display_requests)

        # A) Explicit audio file extension in window title -> PURE_AUDIO
        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": player_name,
                    "platform_tag": player_name,
                    "file_ext": ext,
                    "rationale": f"Playing pure audio file ({ext}) in {player_name}"
                }

        # B) Bare / empty / stopped player title with no media loaded -> EMPTY_PLAYER
        bare_titles = (
            "mpc-hc", "mpc-hc64", "mpc-be", "mpc-be64",
            "media player classic", "media player classic - home cinema",
            "media player classic home cinema", "media player classic - black edition",
            "media player classic black edition", "mpc-hc x64", "mpc-be x64",
            "mpc-hc (64-bit)", "mpc-be (64-bit)", "ready", "stopped", "[stopped]"
        )
        t_strip = title_lower.strip()
        if (t_strip in bare_titles or
            any(t_strip == b or t_strip.startswith(b + " ") or t_strip.startswith(b + " -") for b in bare_titles) or
            t_strip in ("", "ready", "stopped", "[stopped]")):
            tl_check = None
            if hwnd:
                try:
                    from .offline_player import extract_statusbar_timeline
                    tl_check = extract_statusbar_timeline(hwnd)
                except Exception:
                    pass
            if not tl_check or tl_check[1] <= 0:
                return {
                    "type": "EMPTY_PLAYER",
                    "app_name": player_name,
                    "platform_tag": player_name,
                    "rationale": f"{player_name} open with no media loaded ('{window_title}')"
                }

        # C) Explicit video file extension in window title -> VIDEO
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": player_name,
                    "platform_tag": player_name,
                    "file_ext": ext,
                    "rationale": f"Playing video file ({ext}) in {player_name}"
                }

        # D) Embedded timestamps or video metadata -> VIDEO
        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode", "s01", "s02", "e01", "e02"]) or re.search(r'\d{1,2}:\d{2}\s*[\/|\\]\s*\d{1,2}:\d{2}', title_lower):
            return {
                "type": "VIDEO",
                "app_name": player_name,
                "platform_tag": player_name,
                "rationale": f"Video title metadata/timeline detected in {player_name}"
            }

        # E) Windows DISPLAY wake lock active -> VIDEO
        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": player_name,
                "platform_tag": player_name,
                "rationale": f"Active Windows DISPLAY wake lock (video rendering) in {player_name}"
            }

        return {
            "type": "VIDEO",
            "app_name": player_name,
            "platform_tag": player_name,
            "rationale": f"Media stream loaded in {player_name} ('{window_title}')"
        }

    # 5. Dual-Purpose Media Players (VLC, PotPlayer, MPC, KMPlayer, GOM, MPV, etc.)
    if img in DUAL_PURPOSE_MEDIA_PLAYERS:
        app_name = DUAL_PURPOSE_MEDIA_PLAYERS[img]
        display_requests = get_system_power_display_requests()
        has_display_request = (img in display_requests)

        # Check for explicit audio file extensions in window title
        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing pure audio file ({ext}) in {app_name}"
                }

        # Check for explicit video file extensions in window title
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing video file ({ext}) in {app_name}"
                }

        # Check for pure audio keywords in title (e.g., "song", "track", "album", "podcast")
        if any(w in title_lower for w in ["track ", "artist", "album", "podcast", "radio stream", "playlist", "audio"]):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Audio track title metadata detected in {app_name}"
            }

        # Check for video keywords in title
        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode", "s01", "s02", "e01", "e02"]):
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Video release metadata detected in {app_name}"
            }

        # Check for active DISPLAY power request (video prevents monitor sleep)
        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Active Windows DISPLAY wake lock (video rendering) in {app_name}"
            }

        # If title is just the bare player name (e.g. "VLC media player", "PotPlayer")
        bare_names = [
            "vlc media player", "vlc", "potplayer", "media player classic",
            "mpc-hc", "mpc-be", "kmplayer", "gom player", "gom", "mpv",
            "mpv.net", "mpvnet", "smplayer", "kodi", "kodi media center",
            "bsplayer", "bs.player", "5kplayer",
            "windows media player", "media player"
        ]
        if any(title_lower == b or title_lower.startswith(b + " ") or title_lower.startswith(b + " -") for b in bare_names):
            return {
                "type": "EMPTY_PLAYER",
                "app_name": app_name,
                "rationale": f"Player is open but no media is active ({app_name})"
            }

        # Fallback for dual-purpose player playing an unextended title
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "rationale": f"Media stream loaded in {app_name} ('{window_title}')"
        }

    # 6. Web Browsers (Chrome, Edge, Firefox, Brave, Opera)
    if img in BROWSER_PROCESSES:
        app_name = BROWSER_PROCESSES[img]

        # A) Explicit Pure Audio Tab (YouTube Music, Spotify Web, SoundCloud, etc.)
        for pat in BROWSER_PURE_AUDIO_PATTERNS:
            if pat.search(window_title):
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "rationale": f"Browser tab matches pure audio platform ({pat.pattern}) in {app_name}"
                }

        # B) Explicit Audio file extension in browser title
        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Browser playing pure audio file ({ext}) in {app_name}"
                }

        # C) Video file extension in browser title
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Browser playing video file ({ext}) in {app_name}"
                }

        # D) Explicit Video Platform Tab (YouTube, Netflix, Prime Video, Twitch, etc.)
        for pat in BROWSER_VIDEO_PATTERNS:
            if pat.search(window_title):
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "rationale": f"Browser tab matches video platform ({pat.pattern}) in {app_name}"
                }

        # E) Fullscreen Cinema or Borderless Maximized presentation
        if hwnd:
            try:
                from .win32_api import inspect_window_presentation
                pres = inspect_window_presentation(hwnd)
                if pres.get("mode") in ("FULLSCREEN_CINEMA", "BORDERLESS_MAXIMIZED"):
                    return {
                        "type": "VIDEO",
                        "app_name": app_name,
                        "rationale": f"Browser is in fullscreen presentation ({pres['mode']}) in {app_name}"
                    }
            except Exception:
                pass

    return {"type": "UNKNOWN"}


def classify_smtc_session(session: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classifies an SMTC session into:
      - 'VIDEO': Active or paused video playback (YouTube, Netflix, video player, etc.)
      - 'PURE_AUDIO': Dedicated music/audio playback (Spotify, YouTube Music, local audio)
      - 'UNKNOWN': Unrecognized session
    """
    proc = session.get("process", "").lower()
    title = (session.get("title") or "").strip()
    artist = (session.get("artist") or "").strip()
    title_lower = title.lower()
    combined_text = f"{title} {artist}".strip()
    p_type = session.get("playback_type", 0)
    p_status = session.get("playback_status", 0)
    is_playing = (p_status == 4)
    is_paused = (p_status == 5)

    # 1. Known pure audio applications (Spotify, etc.)
    if proc in KNOWN_PURE_AUDIO_APPS:
        return {
            "type": "PURE_AUDIO",
            "app_name": KNOWN_PURE_AUDIO_APPS[proc],
            "title": f"{title} - {artist}".strip(" -") if artist else title,
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": "Spotify" if "spotify" in proc else "Local Audio File",
            "rationale": f"Dedicated audio application ({KNOWN_PURE_AUDIO_APPS[proc]})"
        }

    # 2. Modern or Legacy Windows Media Player
    if proc in MODERN_WINDOWS_MEDIA_PLAYER_PROCS:
        app_name = "Media Player" if proc == "microsoft.media.player.exe" else "Windows Media Player"
        tag = "Media Player" if proc == "microsoft.media.player.exe" else "Windows Media Player"
        if p_type == 1:
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": "SMTC PlaybackType.Music in Modern Windows Media Player"
            }
        elif p_type == 2:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": "SMTC PlaybackType.Video in Modern Windows Media Player"
            }
        else:
            for ext in AUDIO_FILE_EXTENSIONS:
                if ext in title_lower:
                    return {
                        "type": "PURE_AUDIO",
                        "app_name": app_name,
                        "title": title,
                        "artist": artist,
                        "is_playing": is_playing,
                        "is_paused": is_paused,
                        "platform_tag": tag,
                        "rationale": f"Audio file ({ext}) in Modern Windows Media Player"
                    }
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "title": title or "Windows Media Player",
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": f"Active media session in Modern Windows Media Player ('{title}')"
            }

    if proc == "wmplayer.exe":
        app_name = "Windows Media Player"
        tag = "Windows Media Player"
        if p_type == 1:
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": "SMTC PlaybackType.Music in Legacy WMP"
            }
        elif p_type == 2:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": "SMTC PlaybackType.Video in Legacy WMP"
            }
        else:
            for ext in AUDIO_FILE_EXTENSIONS:
                if ext in title_lower:
                    return {
                        "type": "PURE_AUDIO",
                        "app_name": app_name,
                        "title": title,
                        "artist": artist,
                        "is_playing": is_playing,
                        "is_paused": is_paused,
                        "platform_tag": tag,
                        "rationale": f"Audio file ({ext}) in Legacy WMP"
                    }
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "title": title or "Windows Media Player",
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": f"Active media session in Legacy WMP ('{title}')"
            }

    # 2.5. MPC-HC & MPC-BE SMTC sessions
    if proc in ("mpc-hc.exe", "mpc-hc64.exe") or "mpc-hc" in proc:
        app_name = "MPC-HC"
        tag = "MPC-HC"
        if p_type == 1 or any(ext in title_lower for ext in AUDIO_FILE_EXTENSIONS):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": f"SMTC audio playback in {app_name}"
            }
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "title": title or "MPC-HC Playback",
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": tag,
            "rationale": f"SMTC video playback in {app_name}"
        }

    if proc in ("mpc-be.exe", "mpc-be64.exe") or "mpc-be" in proc:
        app_name = "MPC-BE"
        tag = "MPC-BE"
        if p_type == 1 or any(ext in title_lower for ext in AUDIO_FILE_EXTENSIONS):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": tag,
                "rationale": f"SMTC audio playback in {app_name}"
            }
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "title": title or "MPC-BE Playback",
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": tag,
            "rationale": f"SMTC video playback in {app_name}"
        }

    # 3. Dedicated Video Apps (Films & TV, Netflix, etc.)
    if proc in DEDICATED_VIDEO_ONLY_APPS or proc == "video.ui.exe":
        app_name = "Films & TV" if proc == "video.ui.exe" else DEDICATED_VIDEO_ONLY_APPS[proc]
        tag = "Films & TV" if proc == "video.ui.exe" else ("Netflix" if "netflix" in proc else "Local Video File")
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "title": title,
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": tag,
            "rationale": f"Dedicated video application ({app_name})"
        }

    # 4. Web Browsers (Chrome, Edge, Firefox, Brave, Opera)
    if proc in BROWSER_PROCESSES:
        app_name = BROWSER_PROCESSES[proc]
        if any(pat.search(combined_text) for pat in BROWSER_PURE_AUDIO_PATTERNS):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": f"{title} - {artist}".strip(" -") if artist else title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": extract_platform_tag(combined_text, proc),
                "rationale": f"Browser media matches pure audio platform ({combined_text})"
            }

        tag = extract_platform_tag(combined_text, proc)
        if tag in ("Generic Player", "Web Stream"):
            if "youtube" in combined_text.lower():
                tag = "YouTube"
            elif "netflix" in combined_text.lower():
                tag = "Netflix"
            elif "prime" in combined_text.lower():
                tag = "Prime Video"
            elif "twitch" in combined_text.lower():
                tag = "Twitch"
            elif "hotstar" in combined_text.lower():
                tag = "Disney+ Hotstar"
            else:
                tag = "YouTube" if title else "Web Stream"

        return {
            "type": "VIDEO",
            "app_name": app_name,
            "title": title or "Web Video Stream",
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": tag,
            "rationale": f"Web video playback session in {app_name} ('{title}')"
        }

    # 5. Dual-purpose players (VLC, MPV, PotPlayer, MPC, etc.)
    if proc in DUAL_PURPOSE_MEDIA_PLAYERS:
        app_name = DUAL_PURPOSE_MEDIA_PLAYERS[proc]
        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "title": title,
                    "artist": artist,
                    "is_playing": is_playing,
                    "is_paused": is_paused,
                    "platform_tag": "Local Audio File",
                    "rationale": f"Audio file ({ext}) in {app_name}"
                }
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "title": title,
                    "artist": artist,
                    "is_playing": is_playing,
                    "is_paused": is_paused,
                    "platform_tag": "Local Video File",
                    "rationale": f"Video file ({ext}) in {app_name}"
                }
        if p_type == 1:
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "title": title,
                "artist": artist,
                "is_playing": is_playing,
                "is_paused": is_paused,
                "platform_tag": "Local Audio File",
                "rationale": f"SMTC PlaybackType.Music in {app_name}"
            }
        return {
            "type": "VIDEO",
            "app_name": app_name,
            "title": title,
            "artist": artist,
            "is_playing": is_playing,
            "is_paused": is_paused,
            "platform_tag": "Local Video File",
            "rationale": f"Media stream loaded in {app_name}"
        }

    return {
        "type": "VIDEO" if p_type == 2 else ("PURE_AUDIO" if p_type == 1 else "VIDEO"),
        "app_name": proc,
        "title": title or f"Media Session ({proc})",
        "artist": artist,
        "is_playing": is_playing,
        "is_paused": is_paused,
        "platform_tag": "Generic Player",
        "rationale": f"SMTC session for {proc}"
    }


def classify_media_window(image_name: str, pid: str, window_title: str, hwnd: Optional[int] = None) -> Dict[str, Any]:
    """
    Classifies a window into VIDEO, PURE_AUDIO, EMPTY_PLAYER, or UNKNOWN,
    and enriches the result with authoritative platform_tag metadata.
    """
    res = _classify_media_window_core(image_name, pid, window_title, hwnd)
    if "platform_tag" not in res:
        res["platform_tag"] = extract_platform_tag(window_title, image_name)
    return res

