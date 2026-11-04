# -*- coding: utf-8 -*-
"""
players/fivekplayer: Dedicated 5KPlayer Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .fivekplayer_detector import (
    FiveKPlayerDetector,
    inspect_fivekplayer_timeline
)

__all__ = ["FiveKPlayerDetector", "inspect_fivekplayer_timeline"]
