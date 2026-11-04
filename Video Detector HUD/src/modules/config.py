# -*- coding: utf-8 -*-
"""
modules/config.py: Constants, configurations, application catalogs, and regex patterns
for Windows Video-Only Inactivity Sentinel.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import re
from enum import IntEnum
from typing import Optional

# ==============================================================================
# Project Root & Directory Topology (Zero-Scan Standard)
# ==============================================================================

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PARENT_DIR = os.path.dirname(_CURRENT_DIR)
if os.path.basename(_PARENT_DIR).lower() == 'src':
    PROJECT_ROOT = os.path.dirname(_PARENT_DIR)
else:
    PROJECT_ROOT = _PARENT_DIR

CONFIG_DIR = os.path.join(PROJECT_ROOT, 'config')
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
REPORTS_DIR = os.path.join(PROJECT_ROOT, 'reports')
WEB_DIR = os.path.join(PROJECT_ROOT, 'web')
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'scripts')
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')
from typing import Optional

# ==============================================================================
# HUD Operating Modes, Dimensions & Dynamic Theme Palette
# ==============================================================================

class HUDOperatingMode(IntEnum):
    COLLAPSE = 1
    MINI = 2
    NORMAL = 3

# HUD Geometry Constants (Fixed 240px width strictly locked)
HUD_WIDTH = 240
MODE_COLLAPSE = 1      # Height: 28px
MODE_MINI = 2          # Height: 90px (Default Boot Mode)
MODE_NORMAL = 3        # Height: 460px (All 7 Sections)

DEFAULT_OPERATING_MODE = 2  # Mini Mode (HUDOperatingMode.MINI)
DEFAULT_OPACITY = 0.80

MODE_HEIGHTS = {
    MODE_COLLAPSE: 28,
    MODE_MINI: 90,
    MODE_NORMAL: 460,
    HUDOperatingMode.COLLAPSE: 28,
    HUDOperatingMode.MINI: 90,
    HUDOperatingMode.NORMAL: 460
}

# Opacity Levels (Default: 80% Cyber-Glass)
OPACITY_CYCLE = [1.00, 0.80, 0.60, 0.40]

# Dynamic Theme Colors
COLOR_BG_DARK = "#0F172A"       # Deep slate background
COLOR_CARD_BG = "#1E293B"       # Translucent card fill
COLOR_CARD_BORDER = "#334155"   # Card stroke border
COLOR_TEXT_PRIMARY = "#F8FAFC"  # High contrast crisp white
COLOR_TEXT_MUTED = "#94A3B8"    # Subdued secondary text

COLOR_EMERALD = "#10B981"       # Playing: Neon Emerald Green
COLOR_CYAN = "#06B6D4"          # Complementary Neon Cyan
COLOR_ORANGE = "#F97316"        # Idle: Pure Neon Orange
COLOR_AMBER = "#F59E0B"         # Paused: Rich Amber
COLOR_ALERT_RED = "#EF4444"     # Target Inactivity Alert: Bright Light Red
COLOR_VIOLET = "#8B5CF6"        # Audio Muted: Electric Violet


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
    "microsoft.media.player.exe": "Media Player",
    "zune.exe": "Windows Media Player / Zune",
    "music.ui.exe": "Groove Music / Media Player"
}

# DUAL-PURPOSE MEDIA PLAYERS (Can play BOTH Audio AND Video)
# MUST inspect file extension, title, and display wake locks!
DUAL_PURPOSE_MEDIA_PLAYERS = {
    "microsoft.media.player.exe": "Media Player",
    "zune.exe": "Windows Media Player / Zune",
    "music.ui.exe": "Groove Music / Media Player",
    "wmplayer.exe": "Windows Media Player",
    "vlc.exe": "VLC Media Player",
    "potplayer.exe": "PotPlayer",
    "potplayer64.exe": "PotPlayer",
    "potplayermini64.exe": "PotPlayer",
    "potplayermini.exe": "PotPlayer",
    "mpc-hc.exe": "MPC-HC",
    "mpc-hc64.exe": "MPC-HC",
    "mpc-be.exe": "MPC-BE",
    "mpc-be64.exe": "MPC-BE",
    "kmplayer.exe": "KMPlayer",
    "kmplayer64.exe": "KMPlayer",
    "gom.exe": "GOM Player",
    "gom64.exe": "GOM Player",
    "mpv.exe": "MPV Player",
    "mpvnet.exe": "mpv.net",
    "kodi.exe": "Kodi",
    "smplayer.exe": "SMPlayer",
    "bsplayer.exe": "BSPlayer",
    "5kplayer.exe": "5KPlayer",
    "iina.exe": "IINA"
}

# DEDICATED VIDEO-ONLY PLATFORMS / APPS
DEDICATED_VIDEO_ONLY_APPS = {
    "video.ui.exe": "Films & TV",
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
