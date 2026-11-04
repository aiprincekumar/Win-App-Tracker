# -*- coding: utf-8 -*-
"""
win32_api.py: Win32 Input API Bindings, Low-Level Hooks & Hardware Device Tracking.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

import sys
import time
import atexit
import threading
import ctypes
from ctypes import wintypes, Structure, sizeof, byref
from typing import Optional, Tuple

kernel32 = ctypes.windll.kernel32 if sys.platform == "win32" else None
user32 = ctypes.windll.user32 if sys.platform == "win32" else None

WH_KEYBOARD_LL = 13
WH_MOUSE_LL = 14
WM_QUIT = 0x0012

HOOKPROC = ctypes.WINFUNCTYPE(ctypes.c_longlong, ctypes.c_int, wintypes.WPARAM, wintypes.LPARAM)


class LASTINPUTINFO(Structure):
    _fields_ = [
        ("cbSize", wintypes.UINT),
        ("dwTime", wintypes.DWORD)
    ]


class POINT(Structure):
    _fields_ = [
        ("x", wintypes.LONG),
        ("y", wintypes.LONG)
    ]


if user32:
    user32.GetLastInputInfo.argtypes = [ctypes.POINTER(LASTINPUTINFO)]
    user32.GetLastInputInfo.restype = wintypes.BOOL
    user32.SetWindowsHookExW.argtypes = [ctypes.c_int, HOOKPROC, wintypes.HINSTANCE, wintypes.DWORD]
    user32.SetWindowsHookExW.restype = wintypes.HHOOK
    user32.CallNextHookEx.argtypes = [wintypes.HHOOK, ctypes.c_int, wintypes.WPARAM, wintypes.LPARAM]
    user32.CallNextHookEx.restype = ctypes.c_longlong
    user32.UnhookWindowsHookEx.argtypes = [wintypes.HHOOK]
    user32.UnhookWindowsHookEx.restype = wintypes.BOOL
    user32.GetMessageW.argtypes = [ctypes.POINTER(wintypes.MSG), wintypes.HWND, wintypes.UINT, wintypes.UINT]
    user32.GetMessageW.restype = wintypes.BOOL
    user32.PostThreadMessageW.argtypes = [wintypes.DWORD, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
    user32.PostThreadMessageW.restype = wintypes.BOOL
    user32.GetCursorPos.argtypes = [ctypes.POINTER(POINT)]
    user32.GetCursorPos.restype = wintypes.BOOL
    user32.GetAsyncKeyState.argtypes = [ctypes.c_int]
    user32.GetAsyncKeyState.restype = wintypes.SHORT

if kernel32:
    kernel32.GetTickCount64.restype = ctypes.c_ulonglong
    kernel32.GetCurrentThreadId.restype = wintypes.DWORD

# Device timestamp tracking
_last_keyboard_time: float = 0.0
_last_mouse_time: float = 0.0

# Windows low-level hook worker thread and state
_hook_thread: Optional[threading.Thread] = None
_hook_thread_id: Optional[int] = None
_hook_kb: Optional[int] = None
_hook_mouse: Optional[int] = None
_hooks_started: bool = False
_hooks_lock = threading.Lock()

# Fallback polling state
_last_cursor_pos: Optional[Tuple[int, int]] = None
_cursor_move_timestamp: float = 0.0

# Mock hooks for testing and deterministic verification
_mock_keyboard_idle_seconds: Optional[float] = None
_mock_mouse_idle_seconds: Optional[float] = None
_mock_user_idle_seconds: Optional[float] = None
_last_active_source: str = "NONE"


def _low_level_keyboard_handler(nCode: int, wParam: int, lParam: int) -> int:
    """Low-level keyboard hook callback. Records physical keyboard event timestamp."""
    global _last_keyboard_time
    if nCode >= 0:
        _last_keyboard_time = time.time()
    return user32.CallNextHookEx(None, nCode, wParam, lParam)


def _low_level_mouse_handler(nCode: int, wParam: int, lParam: int) -> int:
    """Low-level mouse hook callback. Records physical mouse move or click timestamp."""
    global _last_mouse_time
    if nCode >= 0:
        _last_mouse_time = time.time()
    return user32.CallNextHookEx(None, nCode, wParam, lParam)


_c_kb_handler = HOOKPROC(_low_level_keyboard_handler) if user32 else None
_c_mouse_handler = HOOKPROC(_low_level_mouse_handler) if user32 else None


def _input_hook_worker() -> None:
    """Background message pump thread running Windows low-level input hooks."""
    global _hook_thread_id, _hook_kb, _hook_mouse, _hooks_started
    if not user32 or not kernel32:
        return
    _hook_thread_id = kernel32.GetCurrentThreadId()
    try:
        _hook_kb = user32.SetWindowsHookExW(WH_KEYBOARD_LL, _c_kb_handler, None, 0)
        _hook_mouse = user32.SetWindowsHookExW(WH_MOUSE_LL, _c_mouse_handler, None, 0)
        _hooks_started = bool(_hook_kb and _hook_mouse)
        msg = wintypes.MSG()
        while user32.GetMessageW(byref(msg), 0, 0, 0) > 0:
            user32.TranslateMessage(byref(msg))
            user32.DispatchMessageW(byref(msg))
    finally:
        if _hook_kb:
            user32.UnhookWindowsHookEx(_hook_kb)
            _hook_kb = None
        if _hook_mouse:
            user32.UnhookWindowsHookEx(_hook_mouse)
            _hook_mouse = None
        _hooks_started = False


def start_input_hooks() -> bool:
    """
    Installs background Windows low-level keyboard and mouse hooks
    running in a daemon thread with an event message pump.
    """
    global _hook_thread
    with _hooks_lock:
        if _hook_thread and _hook_thread.is_alive():
            return True
        if sys.platform != "win32" or not user32:
            return False
        _hook_thread = threading.Thread(
            target=_input_hook_worker,
            daemon=True,
            name="KeyboardMouseHookWorker"
        )
        _hook_thread.start()
        time.sleep(0.05)
        return _hooks_started


def stop_input_hooks() -> None:
    """
    Cleanly removes low-level hooks and stops the background hook worker thread.
    Zero-hang standard compliant.
    """
    global _hook_thread, _hook_thread_id
    with _hooks_lock:
        if _hook_thread_id and user32:
            try:
                user32.PostThreadMessageW(_hook_thread_id, WM_QUIT, 0, 0)
            except Exception:
                pass
        if _hook_thread and _hook_thread.is_alive():
            _hook_thread.join(timeout=0.5)
        _hook_thread = None
        _hook_thread_id = None


def is_input_hooks_active() -> bool:
    """Returns True if low-level input hooks are currently active."""
    return bool(_hooks_started and _hook_thread and _hook_thread.is_alive())


atexit.register(stop_input_hooks)


def _poll_mouse_fallback() -> None:
    """
    Reliable polling fallback: detects cursor movement and mouse button state.
    """
    global _last_cursor_pos, _last_mouse_time, _cursor_move_timestamp
    if not user32:
        return
    try:
        pt = POINT()
        if user32.GetCursorPos(byref(pt)):
            cur = (int(pt.x), int(pt.y))
            if _last_cursor_pos is not None and cur != _last_cursor_pos:
                now = time.time()
                _last_mouse_time = max(_last_mouse_time, now)
                _cursor_move_timestamp = now
            _last_cursor_pos = cur

        # Mouse buttons: VK_LBUTTON (0x01), VK_RBUTTON (0x02), VK_MBUTTON (0x04), XBUTTON1 (0x05), XBUTTON2 (0x06)
        for vk in (0x01, 0x02, 0x04, 0x05, 0x06):
            if user32.GetAsyncKeyState(vk) & 0x8000:
                now = time.time()
                _last_mouse_time = max(_last_mouse_time, now)
                _cursor_move_timestamp = now
                break
    except Exception:
        pass


def _cursor_moved_recently() -> bool:
    return (time.time() - _cursor_move_timestamp) < 2.0


def set_mock_source_activity(
    keyboard_idle: Optional[float] = None,
    mouse_idle: Optional[float] = None
) -> None:
    """
    Sets simulated keyboard and mouse idle durations for deterministic testing.
    """
    global _mock_keyboard_idle_seconds, _mock_mouse_idle_seconds
    _mock_keyboard_idle_seconds = keyboard_idle
    _mock_mouse_idle_seconds = mouse_idle


def set_mock_user_idle_seconds(val: Optional[float]) -> None:
    """Sets a simulated overall user idle duration for deterministic testing."""
    global _mock_user_idle_seconds
    _mock_user_idle_seconds = val


def reset_source_state() -> None:
    """Resets mock overrides and stateful input source tracking."""
    global _mock_keyboard_idle_seconds, _mock_mouse_idle_seconds, _mock_user_idle_seconds, _last_active_source
    _mock_keyboard_idle_seconds = None
    _mock_mouse_idle_seconds = None
    _mock_user_idle_seconds = None
    _last_active_source = "NONE"


def get_user_idle_seconds() -> float:
    """
    Computes exact elapsed seconds since the last physical keyboard or mouse event
    using Win32 GetLastInputInfo API.
    """
    global _mock_user_idle_seconds
    if _mock_user_idle_seconds is not None:
        return float(max(0.0, _mock_user_idle_seconds))

    if not user32 or not kernel32:
        return 0.0

    lii = LASTINPUTINFO()
    lii.cbSize = sizeof(LASTINPUTINFO)
    if not user32.GetLastInputInfo(byref(lii)):
        return 0.0

    tick_now = kernel32.GetTickCount64()
    tick_32 = tick_now & 0xFFFFFFFF
    elapsed_ms = tick_32 - lii.dwTime
    if elapsed_ms < 0:
        elapsed_ms += 0x100000000

    return max(0.0, elapsed_ms / 1000.0)


def get_device_idle_seconds(recent_activity_threshold: float = 2.0) -> Tuple[float, float, float]:
    """
    Computes (keyboard_idle_sec, mouse_idle_sec, overall_idle_sec).
    Supports deterministic mock overrides for testing.
    """
    global _mock_keyboard_idle_seconds, _mock_mouse_idle_seconds, _mock_user_idle_seconds
    global _last_keyboard_time, _last_mouse_time

    # 1. Device-specific mock mode
    if _mock_keyboard_idle_seconds is not None or _mock_mouse_idle_seconds is not None:
        kb = float(_mock_keyboard_idle_seconds) if _mock_keyboard_idle_seconds is not None else 999999.0
        m = float(_mock_mouse_idle_seconds) if _mock_mouse_idle_seconds is not None else 999999.0
        if _mock_user_idle_seconds is not None:
            overall = float(_mock_user_idle_seconds)
        else:
            overall = min(kb, m)
        return kb, m, max(0.0, overall)

    # 2. General user idle mock mode (backward compatibility)
    if _mock_user_idle_seconds is not None:
        overall = float(max(0.0, _mock_user_idle_seconds))
        return overall, overall, overall

    # 3. Live Hardware Mode
    overall = get_user_idle_seconds()
    now = time.time()

    # Poll hybrid fallback
    _poll_mouse_fallback()

    kb_elapsed = max(0.0, now - _last_keyboard_time) if _last_keyboard_time > 0 else 999999.0
    m_elapsed = max(0.0, now - _last_mouse_time) if _last_mouse_time > 0 else 999999.0

    if overall >= recent_activity_threshold:
        kb_idle = max(kb_elapsed, overall)
        m_idle = max(m_elapsed, overall)
    else:
        kb_act = (kb_elapsed < recent_activity_threshold)
        m_act = (m_elapsed < recent_activity_threshold)
        if not kb_act and not m_act:
            if _cursor_moved_recently():
                m_idle = overall
                kb_idle = max(kb_elapsed, recent_activity_threshold + 1.0)
            else:
                kb_idle = overall
                m_idle = max(m_elapsed, recent_activity_threshold + 1.0)
        else:
            kb_idle = kb_elapsed
            m_idle = m_elapsed

    return kb_idle, m_idle, overall
