# -*- coding: utf-8 -*-
"""
video_detector.py: Windows Video-Only Inactivity Sentinel (CLI Entry Point).
Department 02: Solution Architecture & Department 06: Systems Engineering.

Modular Architecture:
  Core functionality is decoupled into the 'modules' package:
    - modules.config: Catalogs, file extensions, regexes, ANSI themes
    - modules.win32_api: Win32 structures, COM dispatch, process resolution, VT mode
    - modules.audio: WASAPI Core Audio COM queries & peak meter smoothing
    - modules.powercfg: Background powercfg poller thread & display wake locks
    - modules.smtc: Windows Native SMTC poller & mock hooks
    - modules.wmp_surface: Legacy WMP EVR/DirectShow video surface scanner
    - modules.classifier: Deep video vs pure audio heuristic classifier
    - modules.window_scanner: Win32 EnumWindows media candidate scanner
    - modules.evaluator: Master inactivity evaluator & state machine
    - modules.dashboard: ANSI terminal UI card renderer & data extractor

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Video Detector
"""

import sys
import os

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from video_idle_detector import (
    main,
    run_single_check,
    run_sentinel_loop,
    evaluate_video_inactivity,
    render_simple_card,
    extract_simplified_media_info
)

__all__ = [
    "main",
    "run_single_check",
    "run_sentinel_loop",
    "evaluate_video_inactivity",
    "render_simple_card",
    "extract_simplified_media_info"
]

if __name__ == "__main__":
    main()
