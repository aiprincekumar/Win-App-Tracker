# -*- coding: utf-8 -*-
"""
modules/tray.py: Windows Dynamic System Tray Controller.
Department 02: Solution Architecture & Systems Engineering.
Department 04: UI/UX Design System & Native Shell Integration.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import time
import tempfile
import threading
import ctypes
from ctypes import wintypes
from typing import Optional, Callable, Dict, Any

from PIL import Image, ImageDraw

# Status Color Accents
COLOR_ACTIVE = "#10B981"      # Emerald Green - Active Video Playback
COLOR_IDLE = "#F59E0B"        # Amber Yellow - Pure Audio or Idle
COLOR_IDLE_MET = "#EF4444"    # Coral Red - Inactivity Threshold Met
COLOR_COUNTDOWN = COLOR_IDLE_MET   # Compatibility alias

# Win32 Constants
NIM_ADD = 0x00000000
NIM_MODIFY = 0x00000001
NIM_DELETE = 0x00000002

NIF_MESSAGE = 0x00000001
NIF_ICON = 0x00000002
NIF_TIP = 0x00000004

WM_USER = 0x0400
WM_TRAY_CALLBACK = WM_USER + 20
WM_LBUTTONUP = 0x0202
WM_LBUTTONDBLCLK = 0x0203
WM_RBUTTONUP = 0x0205
WM_COMMAND = 0x0111
WM_CLOSE = 0x0010
WM_QUIT = 0x0012

# Tray Context Menu Command IDs
ID_SHOW_HIDE = 1001
ID_STATUS = 1002
ID_SNOOZE = 1003
ID_DASHBOARD = 1004
ID_REPORT = 1005
ID_EXIT = 1006


def create_status_icon(color_hex: str, size: int = 16) -> Image.Image:
    """
    Renders a crisp 16x16 vector-like circular status badge with specular glass highlight.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Outer dark stroke
    draw.ellipse((0, 0, size - 1, size - 1), fill="#0F172A")
    # Vibrant status circle
    draw.ellipse((1, 1, size - 2, size - 2), fill=color_hex)
    # Specular glass reflection
    draw.ellipse((size // 4, size // 4, size // 2, size // 2), fill=(255, 255, 255, 120))
    return img


class NOTIFYICONDATAW(ctypes.Structure):
    _fields_ = [
        ("cbSize", wintypes.DWORD),
        ("hWnd", wintypes.HWND),
        ("uID", wintypes.UINT),
        ("uFlags", wintypes.UINT),
        ("uCallbackMessage", wintypes.UINT),
        ("hIcon", wintypes.HICON),
        ("szTip", wintypes.WCHAR * 128),
        ("dwState", wintypes.DWORD),
        ("dwStateMask", wintypes.DWORD),
        ("szInfo", wintypes.WCHAR * 256),
        ("uTimeoutOrVersion", wintypes.UINT),
        ("szInfoTitle", wintypes.WCHAR * 64),
        ("dwInfoFlags", wintypes.DWORD),
        ("guidItem", ctypes.c_byte * 16),
        ("hBalloonIcon", wintypes.HICON),
    ]


class SystemTrayController:
    """
    Dynamic Windows System Tray Controller with dynamic status indicator icons,
    context menu integration, and multi-backend fallbacks (pystray -> Win32 -> headless).
    Guarantees zero UI thread blocking and clean shutdown under 500ms.
    """

    def __init__(
        self,
        on_show_hide: Optional[Callable[[], None]] = None,
        on_snooze: Optional[Callable[[], None]] = None,
        on_export_report: Optional[Callable[[], None]] = None,
        on_dashboard: Optional[Callable[[], None]] = None,
        on_exit: Optional[Callable[[], None]] = None,
        headless: bool = False
    ) -> None:
        self.on_show_hide = on_show_hide
        self.on_snooze = on_snooze
        self.on_export_report = on_export_report
        self.on_dashboard = on_dashboard
        self.on_exit = on_exit

        self.current_state = "IDLE"
        self.current_color = COLOR_IDLE
        self.tooltip_text = "Video Sentinel: Initializing..."
        self.media_title = ""

        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self.backend_type = "headless"

        # Determine backend
        self._pystray_icon = None
        self._win32_hwnd: Optional[int] = None
        self._win32_class_atom: Optional[int] = None
        self._win32_class_name: Optional[str] = None
        self._hicon: Optional[int] = None
        self._temp_ico_path: Optional[str] = None

        if not headless and sys.platform == "win32":
            try:
                import pystray
                self.backend_type = "pystray"
            except ImportError:
                self.backend_type = "win32"
        else:
            self.backend_type = "headless"

    def start(self) -> None:
        """Starts system tray controller daemon in a background worker thread."""
        if self.is_running:
            return

        self.is_running = True
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, name="SystemTrayThread", daemon=True)
        self._thread.start()

    def _run_loop(self) -> None:
        """Main tray loop dispatcher based on backend."""
        try:
            if self.backend_type == "pystray":
                self._run_pystray()
            elif self.backend_type == "win32":
                self._run_win32()
            else:
                self._run_headless()
        except Exception:
            # Fallback to headless if native backend initialization encounters an error
            self.backend_type = "headless"
            self._run_headless()

    def _run_pystray(self) -> None:
        """Initializes and runs pystray Icon if available."""
        import pystray

        icon_image = create_status_icon(self.current_color)
        menu = pystray.Menu(
            pystray.MenuItem("Show / Hide HUD", lambda icon, item: self._safe_cb(self.on_show_hide), default=True),
            pystray.MenuItem(lambda text: f"Status: {self.current_state}", None, enabled=False),
            pystray.Menu.SEPARATOR,
            # Snooze (+15m) removed per user mandate
            pystray.MenuItem("Open Web Dashboard", lambda icon, item: self._safe_cb(self.on_dashboard)),
            pystray.MenuItem("Export Audit Report (HTML)", lambda icon, item: self._safe_cb(self.on_export_report)),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Exit Sentinel", lambda icon, item: self._safe_cb(self.on_exit))
        )

        self._pystray_icon = pystray.Icon("VideoSentinel", icon_image, self.tooltip_text, menu)
        self._pystray_icon.run()

    def _run_win32(self) -> None:
        """Initializes and manages native Win32 Shell_NotifyIconW tray loop."""
        user32 = ctypes.windll.user32
        shell32 = ctypes.windll.shell32
        LRESULT = ctypes.c_longlong

        user32.DefWindowProcW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
        user32.DefWindowProcW.restype = LRESULT
        WNDPROC = ctypes.WINFUNCTYPE(LRESULT, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)

        def wndproc(hwnd: int, msg: int, wparam: int, lparam: int) -> int:
            if msg == WM_TRAY_CALLBACK:
                if lparam in (WM_LBUTTONUP, WM_LBUTTONDBLCLK):
                    self._safe_cb(self.on_show_hide)
                    return 0
                elif lparam == WM_RBUTTONUP:
                    self._show_win32_menu(hwnd)
                    return 0
            elif msg == WM_COMMAND:
                cmd_id = wparam & 0xFFFF
                if cmd_id == ID_SHOW_HIDE:
                    self._safe_cb(self.on_show_hide)
                elif cmd_id == ID_SNOOZE:
                    self._safe_cb(self.on_snooze)
                elif cmd_id == ID_DASHBOARD:
                    self._safe_cb(self.on_dashboard)
                elif cmd_id == ID_REPORT:
                    self._safe_cb(self.on_export_report)
                elif cmd_id == ID_EXIT:
                    self._safe_cb(self.on_exit)
                return 0
            elif msg in (WM_CLOSE, WM_QUIT):
                user32.PostQuitMessage(0)
                return 0
            return user32.DefWindowProcW(hwnd, msg, wparam, lparam)

        self._wndproc_cb = WNDPROC(wndproc)

        class WNDCLASSW(ctypes.Structure):
            _fields_ = [
                ("style", wintypes.UINT),
                ("lpfnWndProc", WNDPROC),
                ("cbClsExtra", ctypes.c_int),
                ("cbWndExtra", ctypes.c_int),
                ("hInstance", wintypes.HINSTANCE),
                ("hIcon", wintypes.HICON),
                ("hCursor", wintypes.HICON),
                ("hbrBackground", wintypes.HBRUSH),
                ("lpszMenuName", wintypes.LPCWSTR),
                ("lpszClassName", wintypes.LPCWSTR)
            ]

        self._win32_class_name = f"VideoSentinelTray_{os.getpid()}_{id(self)}"
        wc = WNDCLASSW()
        wc.lpfnWndProc = self._wndproc_cb
        wc.lpszClassName = self._win32_class_name
        self._win32_class_atom = user32.RegisterClassW(ctypes.byref(wc))

        self._win32_hwnd = user32.CreateWindowExW(
            0, self._win32_class_name, "SentinelTrayMessageWindow",
            0, 0, 0, 0, 0, 0, 0, 0, 0
        )

        self._update_win32_icon(NIM_ADD)

        # Win32 Message Pump
        msg = wintypes.MSG()
        while not self._stop_event.is_set():
            has_msg = user32.PeekMessageW(ctypes.byref(msg), 0, 0, 0, 1) # PM_REMOVE = 1
            if has_msg:
                if msg.message == WM_QUIT:
                    break
                user32.TranslateMessage(ctypes.byref(msg))
                user32.DispatchMessageW(ctypes.byref(msg))
            else:
                self._stop_event.wait(0.05)

        # Cleanup Win32 Shell Notification
        self._remove_win32_icon()

    def _show_win32_menu(self, hwnd: int) -> None:
        """Builds and displays native Win32 popup context menu at cursor position."""
        user32 = ctypes.windll.user32
        pt = wintypes.POINT()
        user32.GetCursorPos(ctypes.byref(pt))

        hMenu = user32.CreatePopupMenu()
        MF_STRING = 0x0000
        MF_SEPARATOR = 0x0800
        MF_DISABLED = 0x0002
        TPM_RIGHTBUTTON = 0x0002

        user32.AppendMenuW(hMenu, MF_STRING, ID_SHOW_HIDE, "Show / Hide HUD")
        status_line = f"Status: {self.current_state}"
        if self.media_title:
            status_line += f" ({self.media_title[:20]})"
        user32.AppendMenuW(hMenu, MF_STRING | MF_DISABLED, ID_STATUS, status_line)
        user32.AppendMenuW(hMenu, MF_SEPARATOR, 0, None)
        # Snooze (+15m) removed per user mandate
        user32.AppendMenuW(hMenu, MF_STRING, ID_DASHBOARD, "Open Web Dashboard")
        user32.AppendMenuW(hMenu, MF_STRING, ID_REPORT, "Export Audit Report (HTML)")
        user32.AppendMenuW(hMenu, MF_SEPARATOR, 0, None)
        user32.AppendMenuW(hMenu, MF_STRING, ID_EXIT, "Exit Sentinel")

        user32.SetForegroundWindow(hwnd)
        user32.TrackPopupMenuEx(hMenu, TPM_RIGHTBUTTON, pt.x, pt.y, hwnd, None)
        user32.DestroyMenu(hMenu)

    def _update_win32_icon(self, action: int = NIM_MODIFY) -> None:
        """Creates an .ico file and updates the shell notification icon."""
        if not self._win32_hwnd or sys.platform != "win32":
            return

        user32 = ctypes.windll.user32
        shell32 = ctypes.windll.shell32

        # Generate temporary icon
        img = create_status_icon(self.current_color)
        tf = tempfile.NamedTemporaryFile(suffix=".ico", delete=False)
        img.save(tf.name, format="ICO")
        tf.close()

        old_ico_path = self._temp_ico_path
        old_hicon = self._hicon
        self._temp_ico_path = tf.name

        LR_LOADFROMFILE = 0x0010
        IMAGE_ICON = 1
        new_hicon = user32.LoadImageW(None, tf.name, IMAGE_ICON, 16, 16, LR_LOADFROMFILE)
        self._hicon = new_hicon

        nid = NOTIFYICONDATAW()
        nid.cbSize = ctypes.sizeof(NOTIFYICONDATAW)
        nid.hWnd = self._win32_hwnd
        nid.uID = 1
        nid.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP
        nid.uCallbackMessage = WM_TRAY_CALLBACK
        nid.hIcon = self._hicon
        nid.szTip = self.tooltip_text[:127]

        shell32.Shell_NotifyIconW(action, ctypes.byref(nid))

        # Clean old icon handle and temp file
        if old_hicon:
            user32.DestroyIcon(old_hicon)
        if old_ico_path and os.path.exists(old_ico_path):
            try:
                os.unlink(old_ico_path)
            except Exception:
                pass

    def _remove_win32_icon(self) -> None:
        """Removes the tray notification icon and destroys resources."""
        if sys.platform != "win32":
            return
        user32 = ctypes.windll.user32
        shell32 = ctypes.windll.shell32

        if self._win32_hwnd:
            nid = NOTIFYICONDATAW()
            nid.cbSize = ctypes.sizeof(NOTIFYICONDATAW)
            nid.hWnd = self._win32_hwnd
            nid.uID = 1
            shell32.Shell_NotifyIconW(NIM_DELETE, ctypes.byref(nid))
            user32.DestroyWindow(self._win32_hwnd)
            self._win32_hwnd = None

        if self._win32_class_name:
            user32.UnregisterClassW(self._win32_class_name, None)
            self._win32_class_name = None

        if self._hicon:
            user32.DestroyIcon(self._hicon)
            self._hicon = None

        if self._temp_ico_path and os.path.exists(self._temp_ico_path):
            try:
                os.unlink(self._temp_ico_path)
            except Exception:
                pass
            self._temp_ico_path = None

    def _run_headless(self) -> None:
        """Headless loop for automated testing or non-interactive environments."""
        while not self._stop_event.is_set():
            self._stop_event.wait(0.05)

    def _safe_cb(self, cb: Optional[Callable[[], None]]) -> None:
        """Invokes a callback safely catching exceptions."""
        if cb:
            try:
                cb()
            except Exception:
                pass

    def update_status(self, state: str, media_title: str = "") -> None:
        """
        Dynamically adjusts tray icon color badge and tooltip string:
          - ACTIVE / VIDEO -> 🟢 Green
          - IDLE / AUDIO / PURE_AUDIO -> 🟡 Amber
          - WARNING / COUNTDOWN / TRIGGERED -> 🔴 Coral Red
        """
        self.current_state = state.upper()
        self.media_title = media_title

        if self.current_state in ("ACTIVE", "VIDEO"):
            self.current_color = COLOR_ACTIVE
            label = "Video Active"
        elif self.current_state in ("IDLE (MET)", "MET", "IDLE_MET", "WARNING"):
            self.current_color = getattr(self, "COLOR_IDLE_MET", "#EF4444")
            label = "Inactivity Threshold Met"
        else:
            self.current_color = COLOR_IDLE
            label = "Idle / Standby"

        tip = f"Video Sentinel: {label}"
        if media_title:
            tip += f"\n{media_title}"
        self.tooltip_text = tip[:127]

        if self.backend_type == "pystray" and self._pystray_icon:
            try:
                self._pystray_icon.icon = create_status_icon(self.current_color)
                self._pystray_icon.title = self.tooltip_text
            except Exception:
                pass
        elif self.backend_type == "win32" and self._win32_hwnd:
            self._update_win32_icon(NIM_MODIFY)

    def stop(self, timeout_seconds: float = 0.5) -> None:
        """
        Terminates tray worker thread and releases all Win32 / pystray resources
        within the specified timeout (default: 500ms).
        """
        if not self.is_running:
            return

        self.is_running = False
        self._stop_event.set()

        if self.backend_type == "pystray" and self._pystray_icon:
            try:
                self._pystray_icon.stop()
            except Exception:
                pass
            self._pystray_icon = None

        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=timeout_seconds)
            self._thread = None

        if self.backend_type == "win32":
            self._remove_win32_icon()

    def is_alive(self) -> bool:
        """Returns True if the tray thread is currently running."""
        return self.is_running and (self._thread is not None and self._thread.is_alive())
