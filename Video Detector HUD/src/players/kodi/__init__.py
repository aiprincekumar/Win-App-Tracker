# -*- coding: utf-8 -*-
"""
players/kodi: Dedicated Kodi Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .kodi_detector import (
    KodiDetector,
    inspect_kodi_timeline
)

__all__ = ["KodiDetector", "inspect_kodi_timeline"]
