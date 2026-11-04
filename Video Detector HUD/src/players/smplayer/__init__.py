# -*- coding: utf-8 -*-
"""
players/smplayer: Dedicated SMPlayer Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .smplayer_detector import (
    SMPlayerDetector,
    inspect_smplayer_timeline
)

__all__ = ["SMPlayerDetector", "inspect_smplayer_timeline"]
