# -*- coding: utf-8 -*-
"""
players/bsplayer: Dedicated BS.Player Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .bsplayer_detector import (
    BSPlayerDetector,
    inspect_bsplayer_timeline
)

__all__ = ["BSPlayerDetector", "inspect_bsplayer_timeline"]
