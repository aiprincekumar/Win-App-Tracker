# -*- coding: utf-8 -*-
"""
players/kmplayer: Dedicated KMPlayer Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .kmplayer_detector import (
    KMPlayerDetector,
    inspect_kmplayer_timeline
)

__all__ = ["KMPlayerDetector", "inspect_kmplayer_timeline"]
