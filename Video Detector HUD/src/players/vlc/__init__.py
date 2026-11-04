# -*- coding: utf-8 -*-
"""
players/vlc: Dedicated VLC Media Player Modular Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
"""

from .vlc_detector import (
    VLCDetector,
    inspect_vlc_timeline,
    extract_vlc_uia_timeline,
    get_vlc_mru_recent_video
)
