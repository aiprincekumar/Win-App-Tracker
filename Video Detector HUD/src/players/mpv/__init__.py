# -*- coding: utf-8 -*-
"""
players/mpv: Dedicated MPV & mpv.net Modular Telemetry Subsystem.
Department 02: Solution Architecture & Department 06: Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from .mpv_detector import (
    MPVDetector,
    inspect_mpv_timeline
)

__all__ = ["MPVDetector", "inspect_mpv_timeline"]
