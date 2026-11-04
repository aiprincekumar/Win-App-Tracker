# -*- coding: utf-8 -*-
"""
config.py: Virtual Terminal Mode, ANSI Styling Palette & Console Control.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

import sys
import os
import atexit
import ctypes
from ctypes import wintypes, byref

STD_OUTPUT_HANDLE = -11
ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004

C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_DIM    = "\033[2m"
C_RED    = "\033[91m"
C_GREEN  = "\033[92m"
C_YELLOW = "\033[93m"
C_CYAN   = "\033[96m"
C_WHITE  = "\033[97m"
C_GRAY   = "\033[90m"

kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None
user32 = ctypes.windll.user32 if sys.platform == "win32" else None


def enable_windows_vt_mode() -> None:
    """Enables Win32 Virtual Terminal Processing for smooth in-place ANSI rendering."""
    if sys.platform == "win32" and kernel32:
        try:
            os.system("")  # Initialize Windows terminal ANSI support
            h_out = kernel32.GetStdHandle(STD_OUTPUT_HANDLE)
            if h_out and h_out != -1:
                mode = wintypes.DWORD()
                if kernel32.GetConsoleMode(h_out, byref(mode)):
                    new_mode = mode.value | ENABLE_VIRTUAL_TERMINAL_PROCESSING
                    kernel32.SetConsoleMode(h_out, new_mode)
        except Exception:
            pass


def hide_cursor() -> None:
    """Hides console cursor to eliminate blinking cursor artifacts."""
    try:
        sys.stdout.write("\033[?25l")
        sys.stdout.flush()
    except Exception:
        pass


def show_cursor() -> None:
    """Restores console cursor visibility."""
    try:
        sys.stdout.write("\033[?25h")
        sys.stdout.flush()
    except Exception:
        pass


atexit.register(show_cursor)
