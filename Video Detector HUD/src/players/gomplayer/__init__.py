# -*- coding: utf-8 -*-
"""
players/gomplayer: Dedicated GOM Player Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .gomplayer_detector import (
    GOMPlayerDetector,
    inspect_gomplayer_timeline
)

__all__ = ["GOMPlayerDetector", "inspect_gomplayer_timeline"]
