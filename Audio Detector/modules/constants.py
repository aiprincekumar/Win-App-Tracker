# -*- coding: utf-8 -*-
"""
constants.py: Universal Media Extensions, Player Whitelists, Regex, and Windows Filters.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

import os
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Pattern, Tuple

# ==============================================================================
# Optional Libraries & Fallbacks (psutil, pycaw, comtypes)
# ==============================================================================

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    psutil = None  # type: ignore
    PSUTIL_AVAILABLE = False

try:
    import comtypes
    from pycaw.pycaw import AudioUtilities, IAudioMeterInformation
    PYCAW_AVAILABLE = True
except ImportError:
    PYCAW_AVAILABLE = False


# ==============================================================================
# File Extension Sets & Catalogs
# ==============================================================================

AUDIO_EXTENSIONS: Set[str] = {
    ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus",
    ".alac", ".aiff", ".mid", ".midi", ".ape", ".ac3", ".dts", ".amr",
    ".mka", ".mod", ".aif", ".oga", ".voc", ".mp2", ".mp1", ".m4b",
    ".m4p", ".cue", ".ra", ".ram"
}

VIDEO_EXTENSIONS: Set[str] = {
    ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v",
    ".3gp", ".ts", ".mpg", ".mpeg", ".vob", ".ogv", ".m2ts", ".mts",
    ".3g2", ".divx", ".asf", ".f4v", ".rmvb", ".rm", ".wtv"
}

# Known PURE AUDIO applications (Never treated as video)
KNOWN_PURE_AUDIO_APPS: Dict[str, str] = {
    "spotify.exe": "Spotify",
    "foobar2000.exe": "foobar2000",
    "aimp.exe": "AIMP",
    "audacity.exe": "Audacity",
    "deezer.exe": "Deezer",
    "tidal.exe": "Tidal",
    "amazon music.exe": "Amazon Music",
    "apple music.exe": "Apple Music",
    "itunes.exe": "Apple iTunes",
    "musicbee.exe": "MusicBee",
    "winamp.exe": "Winamp",
    "rhythmbox.exe": "Rhythmbox",
    "clementine.exe": "Clementine"
}

# Dedicated Video-Only Applications (Always treated as video / idle)
DEDICATED_VIDEO_ONLY_APPS: Dict[str, str] = {
    "video.ui.exe": "Windows Films & TV",
    "stremio.exe": "Stremio",
    "netflix.exe": "Netflix App",
    "plex.exe": "Plex Media Player",
    "plexmediaplayer.exe": "Plex Media Player"
}

# Dual-Purpose Media Players (Can play either Audio or Video)
DUAL_PURPOSE_MEDIA_PLAYERS: Dict[str, str] = {
    "wmplayer.exe": "Windows Media Player",
    "microsoft.media.player.exe": "Windows Media Player",
    "zune.exe": "Windows Media Player",
    "music.ui.exe": "Groove Music / Media Player",
    "vlc.exe": "VLC Media Player",
    "potplayer.exe": "PotPlayer",
    "potplayer64.exe": "PotPlayer",
    "potplayermini64.exe": "PotPlayer",
    "potplayermini.exe": "PotPlayer",
    "mpc-hc.exe": "Media Player Classic",
    "mpc-hc64.exe": "Media Player Classic",
    "mpc-be.exe": "MPC-BE",
    "mpc-be64.exe": "MPC-BE",
    "kmplayer.exe": "KMPlayer",
    "kmplayer64.exe": "KMPlayer",
    "gom.exe": "GOM Player",
    "gom64.exe": "GOM Player",
    "mpv.exe": "MPV Player",
    "kodi.exe": "Kodi",
    "smplayer.exe": "SMPlayer",
    "bsplayer.exe": "BSPlayer",
    "iina.exe": "IINA"
}

# Web Browsers
BROWSER_PROCESSES: Dict[str, str] = {
    "chrome.exe": "Google Chrome",
    "msedge.exe": "Microsoft Edge",
    "firefox.exe": "Mozilla Firefox",
    "brave.exe": "Brave Browser",
    "opera.exe": "Opera Browser",
    "opera_gx.exe": "Opera GX",
    "vivaldi.exe": "Vivaldi",
    "arc.exe": "Arc Browser",
    "waterfox.exe": "Waterfox"
}

# Audio Streaming / Pure Audio Tab Patterns
BROWSER_AUDIO_PATTERNS: List[Pattern] = [
    re.compile(r"\byoutube\s*music\b", re.IGNORECASE),
    re.compile(r"\bspotify\b", re.IGNORECASE),
    re.compile(r"\bsoundcloud\b", re.IGNORECASE),
    re.compile(r"\bapple\s*music\b", re.IGNORECASE),
    re.compile(r"\bdeezer\b", re.IGNORECASE),
    re.compile(r"\btidal\b", re.IGNORECASE),
    re.compile(r"\bgaana\b", re.IGNORECASE),
    re.compile(r"\bwynk\b", re.IGNORECASE),
    re.compile(r"\bjiosaavn\b", re.IGNORECASE),
    re.compile(r"\bpandora\b", re.IGNORECASE),
    re.compile(r"\bpodcast\b", re.IGNORECASE),
    re.compile(r"\bradio\b", re.IGNORECASE),
    re.compile(r"\bbandcamp\b", re.IGNORECASE),
    re.compile(r"\baudiobook\b", re.IGNORECASE)
]

# Video Streaming / Video Tab Patterns
BROWSER_VIDEO_PATTERNS: List[Pattern] = [
    re.compile(r"-\s*youtube\b", re.IGNORECASE),
    re.compile(r"\byoutube\s*-", re.IGNORECASE),
    re.compile(r"\bnetflix\b", re.IGNORECASE),
    re.compile(r"\btwitch\b", re.IGNORECASE),
    re.compile(r"\bprime\s*video\b", re.IGNORECASE),
    re.compile(r"\bdisney\+\b", re.IGNORECASE),
    re.compile(r"\bhotstar\b", re.IGNORECASE),
    re.compile(r"\bjiocinema\b", re.IGNORECASE),
    re.compile(r"\bhulu\b", re.IGNORECASE),
    re.compile(r"\bcrunchyroll\b", re.IGNORECASE),
    re.compile(r"\bdailymotion\b", re.IGNORECASE),
    re.compile(r"\bvimeo\b", re.IGNORECASE),
    re.compile(r"\bmx\s*player\b", re.IGNORECASE),
    re.compile(r"\bsonyliv\b", re.IGNORECASE),
    re.compile(r"\bzee5\b", re.IGNORECASE),
    re.compile(r"\bbilibili\b", re.IGNORECASE),
    re.compile(r"\btiktok\b", re.IGNORECASE)
]

# Video release tags in titles
VIDEO_TITLE_TAGS: List[str] = [
    "1080p", "720p", "4k", "2160p", "hdr", "bluray", "webrip", "hdrip",
    "dvdrip", "x264", "x265", "hevc", "season", "episode", "s01", "s02",
    "s03", "e01", "e02", "e03", "trailer"
]

# Audio tags in titles
AUDIO_TITLE_TAGS: List[str] = [
    "track ", "artist", "album", "podcast", "radio stream", "playlist",
    "audio song", "remix song", "mp3 download", "acoustic version", "flac"
]

# Dedicated video rendering surface window classes for Windows Media Player Legacy (wmplayer.exe)
WMP_VIDEO_WINDOW_CLASSES: Set[str] = {
    "wmp video window",
    "videorenderer",
    "avi_renderer",
    "activemovie window",
    "directshow video window",
    "evrvideohandler",
    "enhancedvideorenderer"
}

# ==============================================================================
# Windows System and Utility Window Ignored Sets
# ==============================================================================

SYSTEM_IGNORED_TITLES: Set[str] = {
    "default ime",
    "msctfime ui",
    "olemainthreadwndname",
    "dde server window",
    "gdi+ window",
    "systemresourcehost",
    "mediacontextprxy"
}

SYSTEM_IGNORED_CLASSES: Set[str] = {
    "ime",
    "msctfime ui",
    "olemainthreadwndclass",
    "compluspredefinedworkerclass"
}


def is_system_ignored_title(title: Optional[str]) -> bool:
    """Checks if a window title corresponds to a Windows system/utility hidden window."""
    if not title:
        return True
    t_clean = title.strip().lower()
    if not t_clean:
        return True
    if t_clean in SYSTEM_IGNORED_TITLES:
        return True
    if t_clean.startswith("gdi+ window"):
        return True
    return False


def is_system_ignored_class(class_name: Optional[str]) -> bool:
    """Checks if a window class corresponds to a Windows system/utility window class."""
    if not class_name:
        return False
    return class_name.strip().lower() in SYSTEM_IGNORED_CLASSES


def get_clean_player_name(proc_name: str) -> str:
    """Returns a clean user-friendly display name for an audio player process."""
    if not proc_name:
        return "Unknown Player"
    p = proc_name.lower().strip()
    if p in KNOWN_PURE_AUDIO_APPS:
        return KNOWN_PURE_AUDIO_APPS[p]
    if p in DUAL_PURPOSE_MEDIA_PLAYERS:
        return DUAL_PURPOSE_MEDIA_PLAYERS[p]
    if p in BROWSER_PROCESSES:
        return BROWSER_PROCESSES[p]
    if p in DEDICATED_VIDEO_ONLY_APPS:
        return DEDICATED_VIDEO_ONLY_APPS[p]

    base = os.path.splitext(proc_name)[0]
    return base.capitalize() if base else "Unknown Player"


# ==============================================================================
# Process Media Classification & Forensics Data Structures
# ==============================================================================

@dataclass
class ProcessMediaClassification:
    pid: int
    proc_name: str
    peak_value: float
    is_audio: bool
    is_video: bool
    classification: str  # 'AUDIO', 'VIDEO', 'SILENT', 'UNKNOWN'
    reason: str
    file_path: Optional[str] = None
    window_title: Optional[str] = None


def classify_open_files(file_paths: List[str]) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Examines file paths opened by a process.
    Returns:
      (classification, extension, file_path)
      where classification is 'VIDEO', 'AUDIO', or 'NONE'.
    """
    audio_found: Optional[Tuple[str, str]] = None

    for fp in file_paths:
        ext = os.path.splitext(fp)[1].lower()
        # If any video file format is open, it takes immediate priority -> VIDEO
        if ext in VIDEO_EXTENSIONS:
            return ("VIDEO", ext, fp)
        # Record audio format if found
        if ext in AUDIO_EXTENSIONS and not audio_found:
            audio_found = (ext, fp)

    if audio_found:
        return ("AUDIO", audio_found[0], audio_found[1])

    return ("NONE", None, None)


def classify_text_for_media_type(text: str) -> Tuple[str, str]:
    """
    Inspects arbitrary text (window title, cmdline, GSMTC title) for audio vs video indicators.
    Returns:
      (classification, reason) where classification is 'VIDEO', 'AUDIO', or 'UNKNOWN'
    """
    if not text:
        return ("UNKNOWN", "Empty text")

    text_lower = text.lower()

    # 1. Explicit video extension in text -> VIDEO
    for ext in VIDEO_EXTENSIONS:
        if ext in text_lower:
            return ("VIDEO", f"Video file format detected in title/cmd: '{ext}'")

    # 2. Explicit audio extension in text -> AUDIO
    for ext in AUDIO_EXTENSIONS:
        if ext in text_lower:
            return ("AUDIO", f"Audio file format detected in title/cmd: '{ext}'")

    # 3. Audio streaming patterns (YouTube Music, Spotify, SoundCloud, etc.)
    for pattern in BROWSER_AUDIO_PATTERNS:
        if pattern.search(text_lower):
            return ("AUDIO", f"Audio streaming keyword pattern matched: '{pattern.pattern}'")

    # 4. Video streaming patterns (YouTube video, Netflix, Twitch, etc.)
    for pattern in BROWSER_VIDEO_PATTERNS:
        if pattern.search(text_lower):
            return ("VIDEO", f"Video streaming keyword pattern matched: '{pattern.pattern}'")

    # 5. Video release quality tags
    for tag in VIDEO_TITLE_TAGS:
        if tag in text_lower:
            return ("VIDEO", f"Video release quality tag matched: '{tag}'")

    # 6. Audio tags
    for tag in AUDIO_TITLE_TAGS:
        if tag in text_lower:
            return ("AUDIO", f"Audio metadata tag matched: '{tag}'")

    return ("UNKNOWN", "No matching pattern")
