# -*- coding: utf-8 -*-
"""
video_detector_hud.py: Windows Video-Only Inactivity Sentinel & HUD Overlay (CLI Entry Point).
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
    - modules.hud_window: Transparent Cyber-Glass desktop HUD overlay
    - modules.hud_canvas: HUD GDI rendering canvas
    - modules.hud_docking: 20px magnetic docking & edge snapping
    - modules.tray: Windows system tray controller & context menu
    - modules.web_server: Lightweight localhost web dashboard & remote control
    - modules.analytics: Daily session watch time analytics & SQLite storage

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Video Detector HUD
"""

import sys
import os
import ctypes

# 0. Windows URI Protocol Handling: Strip protocol arguments (e.g. videohud://launch)
sys.argv = [arg for arg in sys.argv if not (isinstance(arg, str) and (arg.startswith("videohud:") or arg.startswith("videohud://")))]

# 1. Zero-Flicker Instant Console Window Suppression for Windows GUI/HUD modes
if sys.platform == "win32":
    _cli_flags = {"--cli", "-h", "--help", "--check-once", "--export", "--json"}
    if not any(arg in sys.argv for arg in _cli_flags):
        try:
            _hwnd = ctypes.windll.kernel32.GetConsoleWindow()
            if _hwnd:
                ctypes.windll.user32.ShowWindow(_hwnd, 0)  # 0 = SW_HIDE
        except Exception:
            pass

# 2. Pythonw / GUI Safe Stream Wrapper (Prevents NoneType write/flush crashes)
class _SafeStream:
    """Safe stream logger for sys.stdout / sys.stderr under pythonw.exe."""
    def __init__(self, filename="hud_pythonw.log"):
        self.filename = filename
    def write(self, *args, **kwargs):
        if args and args[0]:
            try:
                log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), self.filename)
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(str(args[0]))
            except Exception:
                pass
    def flush(self): pass
    def reconfigure(self, **kwargs): pass

if sys.stdout is None:
    sys.stdout = _SafeStream()
if sys.stderr is None:
    sys.stderr = _SafeStream()

_current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(_current_dir)
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
