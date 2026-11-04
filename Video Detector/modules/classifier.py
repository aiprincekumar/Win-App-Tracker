# -*- coding: utf-8 -*-
"""
modules/classifier.py: Deep Video vs Pure Audio Heuristic Classifier Engine.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

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
from .smtc import get_wmp_smtc_info
from .wmp_surface import detect_wmp_legacy_video_surface


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


def classify_media_window(image_name: str, pid: str, window_title: str, hwnd: Optional[int] = None) -> Dict[str, Any]:
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

    # 2. Dedicated video-only applications (Movies & TV, Netflix, Stremio)
    if img in DEDICATED_VIDEO_ONLY_APPS:
        return {
            "type": "VIDEO",
            "app_name": DEDICATED_VIDEO_ONLY_APPS[img],
            "rationale": f"Dedicated video platform app ({DEDICATED_VIDEO_ONLY_APPS[img]})"
        }

    # 3. Modern Windows 10 & 11 Media Player (Microsoft.Media.Player.exe / ZuneMusic)
    if img in MODERN_WINDOWS_MEDIA_PLAYER_PROCS:
        app_name = MODERN_WINDOWS_MEDIA_PLAYER_PROCS[img]
        display_requests = get_system_power_display_requests()
        has_display_request = (img in display_requests or "applicationframehost.exe" in display_requests)

        # METHOD 1: Windows Native SMTC API Check (Dedicated to Modern Windows Media Player)
        smtc_info = get_wmp_smtc_info("modern")
        if smtc_info:
            p_type = smtc_info.get("playback_type", 0)
            smtc_title = smtc_info.get("title") or window_title
            ext = extract_file_extension(window_title)

            # PlaybackType.Music (1) -> Confirmed PURE AUDIO -> Ignored
            if p_type == 1:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Music (Pure Audio) in Modern Windows Media Player ('{smtc_title}')"
                }
            # PlaybackType.Video (2) -> Confirmed VIDEO -> Treated as Video
            elif p_type == 2:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Video in Modern Windows Media Player ('{smtc_title}')"
                }

        # Fallback to existing checks if SMTC is Unknown (0) or session not yet created
        # A) Explicit video file extension in title -> VIDEO
        for ext in VIDEO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing video file ({ext}) in Modern Windows Media Player"
                }

        # B) Explicit video resolution/release metadata -> VIDEO
        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode", "s01", "s02", "e01", "e02"]):
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Video release metadata detected in Modern Windows Media Player"
            }

        # C) Windows DISPLAY wake lock active -> VIDEO
        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Active Windows DISPLAY wake lock (video rendering) in Modern Windows Media Player"
            }

        # D) Explicit audio file extensions -> PURE_AUDIO
        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing pure audio file ({ext}) in Modern Windows Media Player"
                }

        # E) Pure audio keywords in metadata
        if any(w in title_lower for w in ["track ", "artist", "album", "podcast", "radio stream", "playlist", "audio", "song"]):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Audio track metadata detected in Modern Windows Media Player"
            }

        # F) Internal SMTC transport window or popup host
        if "smtc" in title_lower or title_lower == "pop-uphost":
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Modern Media Player background audio transport (SMTC)"
            }

        # G) Bare player name or songs without extension (Modern Media Player is Windows 11 default music player)
        # Playing without video extension or DISPLAY lock is certified PURE AUDIO!
        if title_lower in ("media player", "groove music") or title_lower.startswith("media player"):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Modern Windows Media Player in audio mode ('{window_title}')"
            }

        return {
            "type": "PURE_AUDIO",
            "app_name": app_name,
            "rationale": f"Audio track playback in Modern Windows Media Player ('{window_title}')"
        }

    # 4. Legacy Windows Media Player (wmplayer.exe)
    if img == "wmplayer.exe":
        app_name = "Windows Media Player (Legacy)"
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
                    "file_ext": ext,
                    "smtc_title": smtc_info.get("title"),
                    "rationale": f"Native Windows SMTC API confirmed PlaybackType.Music (Pure Audio) in Legacy Windows Media Player ('{smtc_title}')"
                }
            # PlaybackType.Video (2) -> Confirmed VIDEO -> Treated as Video
            elif p_type == 2:
                return {
                    "type": "VIDEO",
                    "app_name": app_name,
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
                    "file_ext": ext,
                    "rationale": f"Playing video file ({ext}) in Legacy Windows Media Player"
                }

        if any(w in title_lower for w in ["1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "season", "episode"]):
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Video release metadata detected in Legacy Windows Media Player"
            }

        if has_display_request:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "rationale": f"Active Windows DISPLAY wake lock in Legacy Windows Media Player"
            }

        for ext in AUDIO_FILE_EXTENSIONS:
            if ext in title_lower:
                return {
                    "type": "PURE_AUDIO",
                    "app_name": app_name,
                    "file_ext": ext,
                    "rationale": f"Playing pure audio file ({ext}) in Legacy Windows Media Player"
                }

        # DEDICATED METHOD 2: Child Window Video Rendering Surface & Process File Inspection
        # Solves Legacy WMP extension-stripping and missing SMTC by inspecting EVR/DirectShow renderers
        is_video_surface, surface_rationale, detected_ext, detected_filename = detect_wmp_legacy_video_surface(hwnd, pid)
        if is_video_surface:
            return {
                "type": "VIDEO",
                "app_name": app_name,
                "file_ext": detected_ext or extract_file_extension(window_title),
                "file_name": detected_filename,
                "rationale": surface_rationale
            }
        elif detected_ext and (detected_ext in AUDIO_FILE_EXTENSIONS):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "file_ext": detected_ext,
                "file_name": detected_filename,
                "rationale": surface_rationale
            }

        if any(w in title_lower for w in ["track ", "artist", "album", "podcast", "radio stream"]):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Audio track metadata detected in Legacy Windows Media Player"
            }

        if title_lower == "windows media player" or title_lower.startswith("windows media player "):
            return {
                "type": "PURE_AUDIO",
                "app_name": app_name,
                "rationale": f"Legacy Windows Media Player in audio mode ('{window_title}')"
            }

        return {
            "type": "PURE_AUDIO",
            "app_name": app_name,
            "rationale": f"Audio track playback in Legacy Windows Media Player ('{window_title}')"
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

    return {"type": "UNKNOWN"}
