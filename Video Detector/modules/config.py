# -*- coding: utf-8 -*-
"""
modules/config.py: Constants, configurations, application catalogs, and regex patterns
for Windows Video-Only Inactivity Sentinel.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import re
from typing import Optional

# ==============================================================================
# ANSI Color Palette for Terminal UI & Reporting
# ==============================================================================
C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_RED    = "\033[91m"
C_GREEN  = "\033[92m"
C_YELLOW = "\033[93m"
C_CYAN   = "\033[96m"
C_GRAY   = "\033[90m"

# ==============================================================================
# Audio & Video File Extensions & Catalogs
# ==============================================================================

# Explicit Pure Audio File Extensions (Case-insensitive)
AUDIO_FILE_EXTENSIONS = (
    ".mp3", ".wav", ".flac", ".aac", ".m4a", ".ogg", ".oga", ".wma",
    ".opus", ".alac", ".aiff", ".aif", ".mid", ".midi", ".ape",
    ".ac3", ".dts", ".mka", ".ra", ".ram", ".voc", ".amr", ".mp2",
    ".mp1", ".m4b", ".m4p", ".cue"
)

# Explicit Video File Extensions (Case-insensitive)
VIDEO_FILE_EXTENSIONS = (
    ".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".m4v", ".ts",
    ".wmv", ".mpg", ".mpeg", ".m2ts", ".mts", ".3gp", ".3g2", ".vob",
    ".divx", ".asf", ".f4v", ".rmvb", ".rm", ".ogv", ".wtv"
)

# Known PURE AUDIO applications (Never treated as video)
KNOWN_PURE_AUDIO_APPS = {
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

# Modern Windows 10 & 11 Media Player executables
MODERN_WINDOWS_MEDIA_PLAYER_PROCS = {
    "microsoft.media.player.exe": "Windows Media Player",
    "zune.exe": "Windows Media Player / Zune",
    "music.ui.exe": "Groove Music / Media Player"
}

# DUAL-PURPOSE MEDIA PLAYERS (Can play BOTH Audio AND Video)
# MUST inspect file extension, title, and display wake locks!
DUAL_PURPOSE_MEDIA_PLAYERS = {
    "microsoft.media.player.exe": "Windows Media Player",
    "zune.exe": "Windows Media Player / Zune",
    "music.ui.exe": "Groove Music / Media Player",
    "wmplayer.exe": "Windows Media Player (Legacy)",
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

# DEDICATED VIDEO-ONLY PLATFORMS / APPS
DEDICATED_VIDEO_ONLY_APPS = {
    "video.ui.exe": "Windows Films & TV",
    "stremio.exe": "Stremio",
    "netflix.exe": "Netflix App",
    "plex.exe": "Plex Media Player",
    "plexmediaplayer.exe": "Plex Media Player"
}

# WEB BROWSERS
BROWSER_PROCESSES = {
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

# Web Browser Pure Audio Tab Indicators (Spotify Web, YouTube Music, SoundCloud, podcasts)
BROWSER_PURE_AUDIO_PATTERNS = [
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
    re.compile(r"\bbandcamp\b", re.IGNORECASE)
]

# Web Browser Video Tab Indicators
BROWSER_VIDEO_PATTERNS = [
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

# ==============================================================================
# Windows System and Utility Window Ignored Sets
# ==============================================================================

SYSTEM_IGNORED_TITLES = {
    "default ime",
    "msctfime ui",
    "olemainthreadwndname",
    "dde server window",
    "gdi+ window",
    "systemresourcehost",
    "mediacontextprxy"
}

SYSTEM_IGNORED_CLASSES = {
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
