# -*- coding: utf-8 -*-
"""
modules/hud_window.py: Native Transparent Desktop HUD Overlay Window & Mode Controller.
Department 04: UI/UX Design System & Aesthetic Engineering.
Department 05: Frontend Engineering & Win32 Integration.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import time
import queue
import ctypes
from ctypes import wintypes
import tkinter as tk
from typing import Dict, Any, Optional, Callable

from .config import (
    HUDOperatingMode,
    HUD_WIDTH,
    MODE_COLLAPSE,
    MODE_MINI,
    MODE_NORMAL,
    MODE_HEIGHTS,
    DEFAULT_OPERATING_MODE,
    DEFAULT_OPACITY,
    OPACITY_CYCLE
)
from .hud_canvas import HUDCanvas
from .hud_docking import (
    HUDDockingManager,
    HUDConfigManager,
    DEFAULT_IDLE_THRESHOLD
)

# Win32 Constants for Layered Window Styling
GWL_EXSTYLE = -20
WS_EX_LAYERED = 0x00080000
WS_EX_TOPMOST = 0x00000008
LWA_ALPHA = 0x00000002
DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 = -4

# Standard HUD Dimension Constants
HUD_HEIGHT_COLLAPSE = MODE_HEIGHTS[MODE_COLLAPSE]  # 28px
HUD_HEIGHT_MINI = MODE_HEIGHTS[MODE_MINI]          # 90px (Default Boot)
HUD_HEIGHT_NORMAL = MODE_HEIGHTS[MODE_NORMAL]      # 460px (All 7 Sections)

# Backward-compatible dimension aliases
HUD_HEIGHT_EXPANDED = HUD_HEIGHT_NORMAL
HUD_HEIGHT_COLLAPSED = HUD_HEIGHT_COLLAPSE
OPACITY_LEVELS = list(OPACITY_CYCLE)


def enable_per_monitor_dpi_v2() -> bool:
    """Enables Windows Per-Monitor V2 DPI awareness via Win32 user32/shcore."""
    if sys.platform != "win32":
        return False
    try:
        # Windows 10 Creators Update (1703)+
        ctypes.windll.user32.SetProcessDpiAwarenessContext(
            DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2
        )
        return True
    except Exception:
        try:
            # Fallback for Windows 8.1 / earlier Win10
            ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
            return True
        except Exception:
            return False


class HUDWindow:
    """
    Zero-dependency native transparent desktop HUD overlay window controller.
    Features:
      - 3 Operating Modes with strictly locked 240px width:
          * Mode 1 (Collapse Mode): Height = 28px
          * Mode 2 (Mini Mode - Default Boot): Height = 90px
          * Mode 3 (Normal Mode): Height = 460px
      - Default 80% opacity (0.80 Cyber-Glass) floating above Windows taskbar.
      - Win32 Per-Monitor V2 DPI awareness.
      - Win32 Layered Window styling (WS_EX_LAYERED | WS_EX_TOPMOST).
      - Interactive Title Bar Gestures:
          * Single Click on empty space: cycle opacity [1.00, 0.80, 0.60, 0.40]
          * Double Click on Title Bar: toggle between Mode 2 (Mini 90px) and Mode 3 (Normal 460px)
          * Arrow Button (▲/▼): toggle Mode 1 (Collapse 28px) <-> previous mode
          * Pin Button (📌): toggle always-on-top persistence
          * Menu Button (⋮): open full context menu
      - Smooth dragging with 20px magnetic edge-snapping against monitor and taskbar.
      - Position, mode, and opacity persistence via hud_config.json.
    """

    def __init__(
        self,
        initial_opacity: float = DEFAULT_OPACITY,
        always_on_top: bool = True,
        on_threshold_hook: Optional[Callable[[float], None]] = None,
        on_exit_hook: Optional[Callable[[], None]] = None,
        config_path: Optional[str] = None,
        docking_manager: Optional[HUDDockingManager] = None,
        config_manager: Optional[HUDConfigManager] = None,
        # Legacy parameters accepted for backward compatibility
        controller: Any = None,
        on_snooze_hook: Optional[Callable[[], None]] = None,
        on_cancel_hook: Optional[Callable[[], None]] = None
    ) -> None:
        # Initialize DPI awareness before window construction
        enable_per_monitor_dpi_v2()

        self.on_threshold_hook = on_threshold_hook
        self.on_exit_hook = on_exit_hook

        # Docking & Configuration Managers
        self.docking_manager = docking_manager or HUDDockingManager()
        self.config_manager = config_manager or HUDConfigManager(
            config_path=config_path, docking_manager=self.docking_manager
        )
        cfg = self.config_manager.load_config()

        # Fixed 240px width locked across all 3 modes
        self.width: int = HUD_WIDTH

        # Operating Mode Resolution (Default: Mode 2 Mini 90px)
        cfg_mode = cfg.get("mode", DEFAULT_OPERATING_MODE)
        if cfg_mode not in MODE_HEIGHTS:
            cfg_mode = DEFAULT_OPERATING_MODE
        self.current_mode: int = int(cfg_mode)
        self.previous_mode: int = MODE_MINI if self.current_mode == MODE_COLLAPSE else self.current_mode
        self.is_collapsed: bool = (self.current_mode == MODE_COLLAPSE)
        self.height: int = MODE_HEIGHTS[self.current_mode]

        # Bottom-Right Taskbar Snapping & Boot Position Resolution (Phase 2)
        left, top, right, bottom = self.docking_manager.get_work_area()
        raw_x = cfg.get("x")
        raw_y = cfg.get("y")

        if raw_x is None or raw_y is None:
            dock_x, dock_y = self.docking_manager.get_default_dock_coordinates(self.width, self.height)
            self.pos_x = dock_x
            self.pos_y = dock_y
        else:
            try:
                self.pos_x = int(raw_x)
                self.pos_y = int(raw_y)
                gap_from_bottom = bottom - (self.pos_y + self.height)
                if gap_from_bottom > 100 or gap_from_bottom < -10 or not self.docking_manager.is_within_screen(self.pos_x, self.pos_y, self.width, self.height):
                    dock_x, dock_y = self.docking_manager.get_default_dock_coordinates(self.width, self.height)
                    self.pos_x = dock_x
                    self.pos_y = dock_y
            except (ValueError, TypeError):
                dock_x, dock_y = self.docking_manager.get_default_dock_coordinates(self.width, self.height)
                self.pos_x = dock_x
                self.pos_y = dock_y

        self.snap_distance: int = int(cfg.get("snap_distance", 20))
        self.current_opacity: float = float(cfg.get("opacity", initial_opacity))
        self.always_on_top: bool = bool(cfg.get("always_on_top", always_on_top))
        self.current_threshold: float = float(cfg.get("idle_threshold", DEFAULT_IDLE_THRESHOLD))
        self.lock_mode: bool = bool(cfg.get("lock_mode", True))
        self.lock_position: bool = bool(cfg.get("lock_position", True))
        self.lock_opacity: bool = bool(cfg.get("lock_opacity", True))

        self.is_running: bool = True
        self.hwnd: Optional[int] = None
        self.last_state: Dict[str, Any] = {}

        # Debounce timer tracker for single click disambiguation (Phase 3)
        self._single_click_timer: Optional[str] = None

        # Drag tracking
        self._drag_start_x: int = 0
        self._drag_start_y: int = 0
        self._is_dragging: bool = False

        # Event Queue for thread-safe cross-thread state pushes
        self.queue: queue.Queue = queue.Queue(maxsize=1)

        # Build Root Tkinter Window
        self.root = tk.Tk()
        self.root.title("Video Sentinel HUD")
        self.root.overrideredirect(True)
        self.root.resizable(False, False)

        # Apply geometry loaded from validated configuration
        self.root.geometry(f"{self.width}x{self.height}+{self.pos_x}+{self.pos_y}")

        # Construct GDI Vector Canvas
        self.canvas = HUDCanvas(
            parent=self.root,
            width=self.width,
            height=self.height,
            on_toggle_collapse=self.toggle_collapse,
            on_toggle_pin=self.toggle_always_on_top,
            on_cycle_opacity=self.cycle_opacity,
            on_menu=self.open_context_menu,
            on_set_threshold=self.set_threshold,
            on_toggle_lock=self.toggle_lock_mode
        )
        self.canvas.set_mode(self.current_mode)
        self.canvas.is_pinned = self.always_on_top
        self.canvas.is_locked = self.lock_mode
        self.canvas.lock_position = self.lock_position
        self.canvas.lock_opacity = self.lock_opacity

        # Interactive Title Bar Gestures & Mouse Bindings
        self.canvas.canvas.bind("<Button-1>", self.on_canvas_single_click, add="+")
        self.canvas.canvas.bind("<Double-Button-1>", self.on_canvas_double_click, add="+")

        # Window Drag and Release Listeners
        self.canvas.canvas.bind("<ButtonPress-1>", self._on_drag_start, add="+")
        self.canvas.canvas.bind("<B1-Motion>", self._on_drag_motion, add="+")
        self.canvas.canvas.bind("<ButtonRelease-1>", self._on_drag_release, add="+")

        # Right-click Context Menu
        self.canvas.canvas.bind("<Button-3>", self.show_context_menu, add="+")
        self.root.bind("<Button-3>", self.show_context_menu, add="+")

        # Force initial layout update to resolve Win32 HWND
        self.root.update_idletasks()

        # Apply Win32 Layered Window Styles
        self._apply_win32_attributes()

        # Render instant initial placeholder card
        initial_placeholder = {
            "is_video_playing": False,
            "mode": self.current_mode,
            "app_name": "Sentinel Standby",
            "track_title": "Standby - Monitoring System",
            "presentation_mode": "WINDOWED",
            "track_progress_pct": 0.0,
            "track_position_sec": 0,
            "track_duration_sec": 0,
            "playback_speed": 1.00,
            "video_resolution": "1920x1080 (16:9)",
            "idle_seconds": 0.0,
            "idle_threshold": self.current_threshold,
            "target_action": "AUTO-SHUTDOWN",
            "idle_resets_today": 0,
            "audio_peak_pct": 0,
            "master_volume_pct": 100,
            "master_muted": False,
            "app_volume_pct": 100,
            "app_muted": False,
            "cur_video_seconds": 0,
            "day_watch_seconds_today": 0,
            "paused_seconds": 0,
            "silence_seconds": 0,
            "total_uptime_seconds_today": 0,
            "true_active_seconds_today": 0,
            "true_inactive_seconds_today": 0,
            "active_ratio_pct": 0,
            "daily_event_counts": {
                "plays": 0, "pauses": 0, "mutes": 0,
                "fullscreen": 0, "window_pip": 0, "minimized": 0, "idle_resets": 0
            },
            "media_source_tag": "Web Stream",
            "peak_run_seconds_today": 0,
            "output_device_name": "Speakers / Headphones",
            "view_state": "100% Visible/Uncovered",
            "always_on_top": self.always_on_top,
            "opacity": self.current_opacity,
            "lock_mode": self.lock_mode,
            "lock_position": self.lock_position,
            "lock_opacity": self.lock_opacity
        }
        self.last_state = initial_placeholder
        self.canvas.update_state(initial_placeholder)
        try:
            self.root.update()
        except Exception:
            pass

        # Kick off 20 FPS queue polling loop (50ms interval)
        self._after_id: Optional[str] = None
        self._schedule_poll()

    # --------------------------------------------------------------------------
    # Queue Polling Loop
    # --------------------------------------------------------------------------

    def _schedule_poll(self) -> None:
        """Schedules next queue poll callback if running."""
        if self.is_running and self.root:
            if self._after_id:
                try:
                    self.root.after_cancel(self._after_id)
                except Exception:
                    pass
                self._after_id = None
            try:
                self._after_id = self.root.after(50, self.poll_queue)
            except Exception:
                self._after_id = None

    def _apply_win32_attributes(self) -> None:
        """Configures Win32 extended window styles via ctypes and Tkinter."""
        # 1. Tkinter standard attributes
        try:
            self.root.attributes("-alpha", self.current_opacity)
        except Exception:
            pass
        try:
            self.root.attributes("-topmost", self.always_on_top)
        except Exception:
            pass

        # 2. Windows ctypes direct layered attributes
        if sys.platform == "win32":
            try:
                wid = self.root.winfo_id()
                parent_hwnd = ctypes.windll.user32.GetParent(wid)
                self.hwnd = parent_hwnd if parent_hwnd else wid

                # Set WS_EX_LAYERED and WS_EX_TOPMOST
                style = ctypes.windll.user32.GetWindowLongPtrW(self.hwnd, GWL_EXSTYLE)
                new_style = style | WS_EX_LAYERED
                if self.always_on_top:
                    new_style |= WS_EX_TOPMOST
                ctypes.windll.user32.SetWindowLongPtrW(self.hwnd, GWL_EXSTYLE, new_style)

                # Set layered window alpha
                alpha_byte = int(max(0.1, min(1.0, self.current_opacity)) * 255)
                ctypes.windll.user32.SetLayeredWindowAttributes(
                    self.hwnd, 0, alpha_byte, LWA_ALPHA
                )
            except Exception:
                pass

    # --------------------------------------------------------------------------
    # Title Bar Gestures & Mouse Interaction Handlers
    # --------------------------------------------------------------------------

    @property
    def _pending_single_click_id(self) -> Optional[str]:
        return self._single_click_timer

    @_pending_single_click_id.setter
    def _pending_single_click_id(self, val: Optional[str]) -> None:
        self._single_click_timer = val

    def on_canvas_single_click(self, event: tk.Event, debounce: bool = True) -> None:
        """
        Handles single click interactions on the HUD:
          1. Interactive buttons (Lock, Pin, Collapse, Expand, Menu) execute immediately.
          2. Empty title bar space (y <= 30) or Mode 1 pill cycles opacity debounced by 220ms (if not locked).
        """
        target = self.canvas.get_hit_target(event.x, event.y)
        if target == "btn_lock":
            self.toggle_lock_mode()
            return
        elif target == "btn_pin":
            self.toggle_always_on_top()
            return
        elif target in ("btn_collapse", "btn_expand"):
            self.toggle_collapse()
            return
        elif target == "btn_menu":
            self.open_context_menu(event)
            return

        # Title bar empty space (y <= 30) or Mode 1 pill click -> debounce opacity cycle by 220ms
        if event.y <= 30 or self.current_mode == MODE_COLLAPSE:
            if self.is_opacity_locked():
                return

            if self._single_click_timer:
                try:
                    self.root.after_cancel(self._single_click_timer)
                except Exception:
                    pass
                self._single_click_timer = None

            if debounce and self.root:
                self._single_click_timer = self.root.after(220, self._handle_single_click_opacity)
            else:
                self._handle_single_click_opacity()

    def _handle_single_click_opacity(self) -> None:
        """Executes opacity cycling after 220ms debounce confirms no double click arrived."""
        self._single_click_timer = None
        if self.is_opacity_locked():
            return
        self.cycle_opacity()

    def _execute_single_click_opacity(self) -> None:
        """Alias for _handle_single_click_opacity for backward compatibility."""
        self._handle_single_click_opacity()

    def on_canvas_double_click(self, event: tk.Event) -> None:
        """
        Double clicking empty title bar (y <= 30) toggles between
        Mode 2 (Mini Mode, 90px) and Mode 3 (Normal Mode, 460px).
        IMMEDIATELY cancels pending single click debounce timer to prevent opacity flicker.
        """
        if self._single_click_timer:
            try:
                self.root.after_cancel(self._single_click_timer)
            except Exception:
                pass
            self._single_click_timer = None

        if event.y <= 30 or self.current_mode == MODE_COLLAPSE:
            self._handle_double_click_mode_toggle()

    def _handle_double_click_mode_toggle(self) -> None:
        """Executes double click mode toggle between Mode 2 (Mini 90px) and Mode 3 (Normal 460px)."""
        if self.current_mode == MODE_MINI:
            self.switch_mode(MODE_NORMAL)
        elif self.current_mode == MODE_NORMAL:
            self.switch_mode(MODE_MINI)
        elif self.current_mode == MODE_COLLAPSE:
            target = self.previous_mode if self.previous_mode in (MODE_MINI, MODE_NORMAL) else MODE_MINI
            self.switch_mode(target)

    # --------------------------------------------------------------------------
    # Mode Switching Architecture
    # --------------------------------------------------------------------------

    def switch_mode(self, new_mode: int) -> None:
        """
        Switches operating mode with deterministic height constraints:
          - Mode 1: Collapse Pill (28px)
          - Mode 2: Mini Mode (90px - Default)
          - Mode 3: Normal Expanded (460px)
        Enforces bottom-anchor invariant:
          Calculate new_y = (cur_y + old_height) - new_height.
          Apply docking_manager.apply_magnetic_snap().
          This ensures the widget expands UPWARDS and shrinks DOWNWARDS while its
          bottom edge remains anchored to the taskbar!
        """
        if new_mode not in MODE_HEIGHTS:
            return

        if self.current_mode != MODE_COLLAPSE:
            self.previous_mode = self.current_mode

        old_height = self.height
        new_height = MODE_HEIGHTS[new_mode]

        cur_x = self.root.winfo_x()
        cur_y = self.root.winfo_y()
        if cur_x <= 0 and self.pos_x > 0:
            cur_x = self.pos_x
        if cur_y <= 0 and self.pos_y > 0:
            cur_y = self.pos_y

        # Bottom-Anchor Invariant: keep bottom edge constant
        cur_bottom = cur_y + old_height
        target_y = cur_bottom - new_height

        self.current_mode = new_mode
        self.is_collapsed = (new_mode == MODE_COLLAPSE)
        self.height = new_height

        # Apply magnetic snap with updated height and target_y
        snapped_x, snapped_y = self.docking_manager.apply_magnetic_snap(
            cur_x, target_y, self.width, self.height, self.snap_distance
        )
        self.pos_x = snapped_x
        self.pos_y = snapped_y
        self.root.geometry(f"{self.width}x{self.height}+{snapped_x}+{snapped_y}")

        # Update canvas mode and force redraw
        self.canvas.set_mode(new_mode)
        if self.last_state:
            self.last_state["mode"] = new_mode
            self.canvas.render(self.last_state, new_mode)

        # Persist mode change and position to hud_config.json
        self.config_manager.save_mode(new_mode)
        self.config_manager.save_position(snapped_x, snapped_y)

    def toggle_collapse(self) -> None:
        """
        Toggles between Mode 1 (Collapse Pill 28px) and previous expanded mode (Mini 90px or Normal 460px).
        """
        if self.current_mode == MODE_COLLAPSE:
            target = self.previous_mode if self.previous_mode in (MODE_MINI, MODE_NORMAL) else MODE_MINI
            self.switch_mode(target)
        else:
            self.switch_mode(MODE_COLLAPSE)

    # --------------------------------------------------------------------------
    # Opacity Cycling & Attributes
    # --------------------------------------------------------------------------

    def cycle_opacity(self) -> None:
        """
        Cycles opacity sequentially through OPACITY_CYCLE:
        1.00 (Solid) -> 0.80 (Glass) -> 0.60 (Translucent) -> 0.40 (Stealth) -> 1.00
        """
        try:
            curr = round(self.current_opacity, 2)
            matches = [i for i, val in enumerate(OPACITY_CYCLE) if abs(val - curr) < 0.05]
            idx = matches[0] if matches else 1
            next_idx = (idx + 1) % len(OPACITY_CYCLE)
        except Exception:
            next_idx = 0
        self.set_opacity(OPACITY_CYCLE[next_idx])

    def set_opacity(self, alpha_float: float) -> None:
        """Updates window transparency (0.1 to 1.0), reapplies Win32 layered styles & saves state."""
        self.current_opacity = max(0.10, min(1.00, float(alpha_float)))
        self._apply_win32_attributes()
        if self.last_state:
            self.last_state["opacity"] = self.current_opacity
            self.canvas.update_state(self.last_state)
        self.config_manager.save_config({"opacity": self.current_opacity})

    def set_always_on_top(self, enabled: bool) -> None:
        """Toggles always on top window style and persists state."""
        self.always_on_top = bool(enabled)
        self._apply_win32_attributes()
        self.canvas.is_pinned = self.always_on_top
        if self.last_state:
            self.last_state["always_on_top"] = self.always_on_top
            self.canvas.update_state(self.last_state)
        self.config_manager.save_config({"always_on_top": self.always_on_top})

    def toggle_always_on_top(self) -> None:
        """Toggles current always on top state."""
        self.set_always_on_top(not self.always_on_top)

    # --------------------------------------------------------------------------
    # Lock Mode & Interaction Guards
    # --------------------------------------------------------------------------

    def is_position_locked(self) -> bool:
        """Returns True if window position change / dragging is blocked."""
        return bool(self.lock_mode and self.lock_position)

    def is_opacity_locked(self) -> bool:
        """Returns True if single click opacity cycling is blocked."""
        return bool(self.lock_mode and self.lock_opacity)

    def toggle_lock_mode(self) -> None:
        """Instant 1-click toggle for master Lock Mode."""
        self.set_lock_mode(not self.lock_mode)

    def set_lock_mode(self, enabled: bool) -> None:
        """Sets master Lock Mode state, updates canvas and persists."""
        self.lock_mode = bool(enabled)
        self.canvas.is_locked = self.lock_mode
        if self.last_state:
            self.last_state["lock_mode"] = self.lock_mode
            self.canvas.update_state(self.last_state)
        self.config_manager.save_config({"lock_mode": self.lock_mode})

    def toggle_lock_position(self) -> None:
        """Toggles position lock sub-option and persists."""
        self.lock_position = not self.lock_position
        self.canvas.lock_position = self.lock_position
        if self.last_state:
            self.last_state["lock_position"] = self.lock_position
            self.canvas.update_state(self.last_state)
        self.config_manager.save_config({"lock_position": self.lock_position})

    def toggle_lock_opacity(self) -> None:
        """Toggles opacity lock sub-option and persists."""
        self.lock_opacity = not self.lock_opacity
        self.canvas.lock_opacity = self.lock_opacity
        if self.last_state:
            self.last_state["lock_opacity"] = self.lock_opacity
            self.canvas.update_state(self.last_state)
        self.config_manager.save_config({"lock_opacity": self.lock_opacity})

    # --------------------------------------------------------------------------
    # Window Dragging & Magnetic Snapping
    # --------------------------------------------------------------------------

    def _on_drag_start(self, event: tk.Event) -> None:
        """
        Stores starting mouse position for window dragging:
          - If position is locked, dragging is blocked/disabled.
          - In Mode 2 / 3: Only allowed when event.y <= 30 (Title bar)
          - In Mode 1: Allowed across 28px pill except interactive buttons
        """
        if self.is_position_locked():
            self._is_dragging = False
            return

        if self.canvas.is_interactive_target(event.x, event.y):
            self._is_dragging = False
            return

        if self.current_mode != MODE_COLLAPSE and event.y > 30:
            self._is_dragging = False
            return

        self._is_dragging = True
        self._drag_start_x = event.x
        self._drag_start_y = event.y

    def _on_drag_motion(self, event: tk.Event) -> None:
        """Moves frameless window dynamically according to mouse offset."""
        if self.is_position_locked():
            self._is_dragging = False
            return

        if not getattr(self, "_is_dragging", True):
            return

        dx = event.x - self._drag_start_x
        dy = event.y - self._drag_start_y
        new_x = self.root.winfo_x() + dx
        new_y = self.root.winfo_y() + dy
        self.pos_x = new_x
        self.pos_y = new_y
        self.root.geometry(f"+{new_x}+{new_y}")

    def _on_drag_release(self, event: tk.Event) -> None:
        """Applies magnetic snapping against work area boundaries and persists final coordinates."""
        if self.is_position_locked():
            self._is_dragging = False
            return

        if not getattr(self, "_is_dragging", True):
            return
        self._is_dragging = False

        cur_x = self.root.winfo_x()
        cur_y = self.root.winfo_y()
        snapped_x, snapped_y = self.docking_manager.apply_magnetic_snap(
            cur_x, cur_y, self.width, self.height, self.snap_distance
        )
        self.pos_x = snapped_x
        self.pos_y = snapped_y
        self.root.geometry(f"+{snapped_x}+{snapped_y}")
        self.config_manager.save_position(snapped_x, snapped_y)

    # --------------------------------------------------------------------------
    # Idle Threshold & Native Context Menu
    # --------------------------------------------------------------------------

    def set_threshold(self, threshold: float) -> None:
        """Updates active idle timer threshold and persists state."""
        self.current_threshold = float(threshold)
        self.config_manager.save_config({"idle_threshold": self.current_threshold})
        if self.last_state:
            self.last_state["idle_threshold"] = self.current_threshold
            self.canvas.update_state(self.last_state)
        else:
            self.canvas.update_state({"idle_threshold": self.current_threshold})
        if self.on_threshold_hook:
            try:
                self.on_threshold_hook(self.current_threshold)
            except Exception:
                pass

    def _build_context_menu(self) -> tk.Menu:
        """Constructs native Tkinter popup context menu for HUD management."""
        menu = tk.Menu(
            self.root,
            tearoff=0,
            bg="#0F172A",
            fg="#F8FAFC",
            activebackground="#1E293B",
            activeforeground="#38BDF8",
            relief="flat",
            bd=1
        )

        # Always on Top toggle
        pin_label = "Always on Top: [ON]" if self.always_on_top else "Always on Top: [OFF]"
        menu.add_command(label=pin_label, command=self.toggle_always_on_top)

        # Lock Mode Section
        lock_label = "🔒 Lock Mode (Active)" if self.lock_mode else "🔓 Lock Mode (Disabled)"
        menu.add_command(label=lock_label, command=self.toggle_lock_mode)
        pos_check = "✓" if self.lock_position else " "
        menu.add_command(
            label=f"  {pos_check} Lock Position (Drag)",
            command=self.toggle_lock_position
        )
        opa_check = "✓" if self.lock_opacity else " "
        menu.add_command(
            label=f"  {opa_check} Lock Opacity (Brightness)",
            command=self.toggle_lock_opacity
        )
        menu.add_separator()

        # Mode Selection Submenu
        mode_menu = tk.Menu(
            menu,
            tearoff=0,
            bg="#0F172A",
            fg="#F8FAFC",
            activebackground="#1E293B",
            activeforeground="#38BDF8",
            relief="flat"
        )
        mode_menu.add_command(
            label=f"{'● ' if self.current_mode == MODE_MINI else '  '}Mini Mode (90px) [Default]",
            command=lambda: self.switch_mode(MODE_MINI)
        )
        mode_menu.add_command(
            label=f"{'● ' if self.current_mode == MODE_NORMAL else '  '}Normal Mode (460px Full Forensic)",
            command=lambda: self.switch_mode(MODE_NORMAL)
        )
        mode_menu.add_command(
            label=f"{'● ' if self.current_mode == MODE_COLLAPSE else '  '}Collapse Pill (28px)",
            command=lambda: self.switch_mode(MODE_COLLAPSE)
        )
        menu.add_cascade(label="View Mode", menu=mode_menu)

        # Opacity Presets Submenu
        opacity_menu = tk.Menu(
            menu,
            tearoff=0,
            bg="#0F172A",
            fg="#F8FAFC",
            activebackground="#1E293B",
            activeforeground="#38BDF8",
            relief="flat"
        )
        opacity_menu.add_command(
            label=f"{'● ' if abs(self.current_opacity - 0.80) < 0.05 else '  '}80% Cyber-Glass [Default]",
            command=lambda: self.set_opacity(0.80)
        )
        opacity_menu.add_command(
            label=f"{'● ' if abs(self.current_opacity - 1.00) < 0.05 else '  '}100% Solid",
            command=lambda: self.set_opacity(1.00)
        )
        opacity_menu.add_command(
            label=f"{'● ' if abs(self.current_opacity - 0.60) < 0.05 else '  '}60% Translucent",
            command=lambda: self.set_opacity(0.60)
        )
        opacity_menu.add_command(
            label=f"{'● ' if abs(self.current_opacity - 0.40) < 0.05 else '  '}40% Stealth",
            command=lambda: self.set_opacity(0.40)
        )
        menu.add_cascade(label="Opacity Presets", menu=opacity_menu)

        # Timer Presets Submenu
        active_label = (
            f"{int(self.current_threshold)}s"
            if self.current_threshold < 60
            else (f"{int(self.current_threshold // 60)}m" if self.current_threshold % 60 == 0 else f"{self.current_threshold:.0f}s")
        )
        timer_menu = tk.Menu(
            menu,
            tearoff=0,
            bg="#0F172A",
            fg="#F8FAFC",
            activebackground="#1E293B",
            activeforeground="#38BDF8",
            relief="flat"
        )
        presets = [
            (30.0, "30 Seconds"),
            (60.0, "60 Seconds [Default]"),
            (120.0, "2 Minutes (120s)"),
            (300.0, "5 Minutes (300s)"),
            (600.0, "10 Minutes (600s)")
        ]
        for sec, name in presets:
            prefix = "● " if abs(self.current_threshold - sec) < 0.5 else "  "
            timer_menu.add_command(
                label=f"{prefix}{name}",
                command=lambda s=sec: self.set_threshold(s)
            )
        timer_menu.add_separator()
        timer_menu.add_command(
            label="↺ Reset to 60s Default",
            command=lambda: self.set_threshold(DEFAULT_IDLE_THRESHOLD)
        )
        menu.add_cascade(label=f"Inactivity Timer [{active_label}]", menu=timer_menu)

        menu.add_separator()

        # Reset Position & Defaults
        menu.add_command(
            label="Reset Position (Dock above Taskbar Clock)",
            command=self.reset_to_default_dock
        )
        menu.add_command(
            label="Reset Timer to Default (60 Seconds)",
            command=self.reset_timer_to_default
        )

        # Open Web Dashboard
        menu.add_command(
            label="Open Web Dashboard",
            command=self.open_dashboard
        )

        # Export Audit Report (HTML)
        menu.add_command(
            label="Export Audit Report (HTML)",
            command=self.export_html_report
        )

        menu.add_separator()

        # Exit Sentinel
        menu.add_command(
            label="Exit Sentinel",
            command=self._on_exit
        )

        return menu

    def open_context_menu(self, event: Optional[tk.Event] = None) -> None:
        """Displays context menu near the menu button or mouse coordinates."""
        self.show_context_menu(event)

    def show_context_menu(self, event: Optional[tk.Event] = None) -> None:
        """Displays popup context menu at mouse coordinates."""
        menu = self._build_context_menu()
        if event and hasattr(event, "x_root") and event.x_root > 0:
            x = event.x_root
            y = event.y_root
        else:
            x = self.root.winfo_x() + 200
            y = self.root.winfo_y() + 25

        try:
            menu.tk_popup(x, y)
        finally:
            try:
                menu.grab_release()
            except Exception:
                pass

    def reset_to_default_dock(self) -> None:
        """Restores HUD to default position directly above the taskbar system tray clock."""
        def_x, def_y = self.docking_manager.get_default_dock_coordinates(self.width, self.height)
        self.pos_x = def_x
        self.pos_y = def_y
        self.root.geometry(f"+{def_x}+{def_y}")
        self.config_manager.save_position(def_x, def_y)

    def reset_timer_to_default(self) -> None:
        """Resets the inactivity timer threshold back to default 60.0 seconds."""
        self.set_threshold(DEFAULT_IDLE_THRESHOLD)

    def open_dashboard(self) -> None:
        """Launches the interactive Web Analytics Dashboard in user's default browser."""
        import webbrowser
        webbrowser.open("http://localhost:8765")

    def export_html_report(self) -> Optional[str]:
        """Generates a standalone forensic HTML report and opens it in browser."""
        try:
            import webbrowser
            from .analytics import AnalyticsEngine
            from .storage import StorageManager
            from .exporter import ReportExporter
            storage = StorageManager()
            analytics = AnalyticsEngine(storage=storage)
            exporter = ReportExporter(analytics=analytics, storage=storage)
            report_path = exporter.export_html()
            if report_path and os.path.exists(report_path):
                webbrowser.open("file://" + os.path.abspath(report_path))
            return report_path
        except Exception:
            return None

    def show(self) -> None:
        """Un-hides or restores the HUD overlay to the foreground."""
        if self.root:
            self.root.deiconify()
            self.root.lift()
            if self.always_on_top:
                self.root.attributes("-topmost", True)

    def hide(self) -> None:
        """Hides the HUD overlay to the system tray."""
        if self.root:
            self.root.withdraw()

    def toggle_visibility(self) -> None:
        """Toggles between visible and hidden states."""
        if self.root:
            if self.root.state() == "withdrawn":
                self.show()
            else:
                self.hide()

    def _on_exit(self) -> None:
        """Initiates graceful exit sequence."""
        if self.on_exit_hook:
            try:
                self.on_exit_hook()
            except Exception:
                pass
        self.close()

    def push_state(self, state: Dict[str, Any]) -> None:
        """
        Thread-safe method called by sensor worker thread to queue UI snapshots.
        Drops stale snapshots if queue is saturated.
        """
        try:
            if self.queue.full():
                try:
                    self.queue.get_nowait()
                except queue.Empty:
                    pass
            self.queue.put_nowait(state)
        except Exception:
            pass

    def poll_queue(self) -> None:
        """
        Timer loop polling queue at 20 FPS (50ms interval) with zero UI thread locking.
        """
        if not self.is_running or not self.root:
            return

        try:
            latest_state = None
            while not self.queue.empty():
                latest_state = self.queue.get_nowait()

            if latest_state is not None:
                self.last_state = latest_state
                # Ensure user-selected opacity, pin, threshold, current mode, and lock state are authoritative
                self.last_state["opacity"] = self.current_opacity
                self.last_state["always_on_top"] = self.always_on_top
                self.last_state["idle_threshold"] = self.current_threshold
                self.last_state["mode"] = self.current_mode
                self.last_state["lock_mode"] = self.lock_mode
                self.last_state["lock_position"] = self.lock_position
                self.last_state["lock_opacity"] = self.lock_opacity
                self.canvas.update_state(self.last_state)
        except Exception:
            pass

        if self.is_running and self.root:
            self._schedule_poll()

    def update(self) -> None:
        """Processes pending Tkinter events synchronously without entering blocking mainloop."""
        if self.is_running and self.root:
            try:
                self.root.update_idletasks()
                self.root.update()
            except Exception:
                pass

    def close(self) -> None:
        """Cleanly destroys the window and terminates event listeners."""
        self.is_running = False
        if self._single_click_timer and self.root:
            try:
                self.root.after_cancel(self._single_click_timer)
            except Exception:
                pass
            self._single_click_timer = None
        if self._after_id and self.root:
            try:
                self.root.after_cancel(self._after_id)
            except Exception:
                pass
            self._after_id = None
        try:
            if self.root:
                self.root.destroy()
        except Exception:
            pass
        self.root = None

    def destroy(self) -> None:
        """Alias for close()."""
        self.close()
