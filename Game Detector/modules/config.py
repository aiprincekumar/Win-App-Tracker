# -*- coding: utf-8 -*-
"""
config.py: Configuration, ANSI Styling Palette, Win32 Constants & DPAPI Helpers.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os
import atexit
import ctypes
from ctypes import wintypes
from typing import Optional

# Ensure UTF-8 output stream on Windows console
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Win32 Constants
STD_OUTPUT_HANDLE = -11
ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
PROCESS_QUERY_INFORMATION = 0x0400
TH32CS_SNAPPROCESS = 0x00000002

user32 = ctypes.windll.user32 if sys.platform == "win32" else None
kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None
crypt32 = ctypes.windll.crypt32 if sys.platform == "win32" else None
ole32 = ctypes.windll.ole32 if sys.platform == "win32" else None

# ANSI Color Codes
C_RESET    = "\033[0m"
C_BOLD     = "\033[1m"
C_DIM      = "\033[2m"
C_RED      = "\033[91m"
C_GREEN    = "\033[92m"
C_YELLOW   = "\033[93m"
C_CYAN     = "\033[96m"
C_WHITE    = "\033[97m"
C_GRAY     = "\033[90m"
C_BG_GREEN = "\033[42m\033[30m"
C_BG_CYAN  = "\033[46m\033[30m"
C_BG_GRAY  = "\033[100m\033[37m"

# Legacy compatibility aliases
CLR_RESET    = C_RESET
CLR_BOLD     = C_BOLD
CLR_DIM      = C_DIM
CLR_CYAN     = C_CYAN
CLR_GREEN    = C_GREEN
CLR_YELLOW   = C_YELLOW
CLR_RED      = C_RED
CLR_WHITE    = C_WHITE
CLR_BG_GREEN = C_BG_GREEN
CLR_BG_CYAN  = C_BG_CYAN
CLR_BG_GRAY  = C_BG_GRAY


def enable_windows_vt_mode() -> None:
    """Enables Win32 Virtual Terminal Processing for smooth in-place ANSI rendering."""
    if sys.platform == "win32" and kernel32:
        try:
            h_out = kernel32.GetStdHandle(STD_OUTPUT_HANDLE)
            if h_out and h_out != -1:
                mode = wintypes.DWORD()
                if kernel32.GetConsoleMode(h_out, ctypes.byref(mode)):
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

# Crypt32 DPAPI Data Structures
class DATA_BLOB(ctypes.Structure):
    _fields_ = [
        ("cbData", wintypes.DWORD),
        ("pbData", ctypes.POINTER(ctypes.c_byte))
    ]


if crypt32:
    crypt32.CryptUnprotectData.argtypes = [
        ctypes.POINTER(DATA_BLOB),
        ctypes.POINTER(wintypes.LPWSTR),
        ctypes.POINTER(DATA_BLOB),
        ctypes.c_void_p,
        ctypes.c_void_p,
        wintypes.DWORD,
        ctypes.POINTER(DATA_BLOB)
    ]
    crypt32.CryptUnprotectData.restype = wintypes.BOOL


def decrypt_dpapi_blob(blob_bytes: bytes) -> Optional[str]:
    """
    Decrypts Windows DPAPI parent encrypted byte blobs (CryptUnprotectData).
    Returns decoded plaintext string or None if decryption fails.
    """
    if not crypt32 or not blob_bytes or not isinstance(blob_bytes, (bytes, bytearray)):
        return None

    try:
        in_blob = DATA_BLOB()
        in_blob.cbData = len(blob_bytes)
        in_blob.pbData = ctypes.cast(
            (ctypes.c_byte * len(blob_bytes))(*blob_bytes),
            ctypes.POINTER(ctypes.c_byte)
        )

        out_blob = DATA_BLOB()
        success = crypt32.CryptUnprotectData(
            ctypes.byref(in_blob),
            None,
            None,
            None,
            None,
            0,
            ctypes.byref(out_blob)
        )

        if not success or not out_blob.pbData or out_blob.cbData <= 0:
            return None

        raw_data = ctypes.string_at(out_blob.pbData, out_blob.cbData)

        # Free buffer allocated by LocalAlloc in crypt32
        if kernel32:
            kernel32.LocalFree(out_blob.pbData)

        # Attempt UTF-16LE decoding (standard for Windows Unicode DPAPI registry strings)
        try:
            return raw_data.decode("utf-16le").rstrip("\x00")
        except UnicodeDecodeError:
            try:
                return raw_data.decode("utf-8").rstrip("\x00")
            except UnicodeDecodeError:
                return raw_data.decode("latin1").rstrip("\x00")
    except Exception:
        return None
