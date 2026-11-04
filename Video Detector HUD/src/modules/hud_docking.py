# -*- coding: utf-8 -*-
"""
modules/hud_docking.py: Work Area Geometry, Magnetic Snapping & Config Persistence.
Department 02: Solution Architecture & Systems Engineering.
Department 04: UI/UX Design System & Desktop Ergonomics.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import sys
import json
import ctypes
from ctypes import wintypes
from typing import Tuple, Dict, Any, Optional

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

SPI_GETWORKAREA = 0x0030

DEFAULT_HUD_WIDTH = HUD_WIDTH  # 240px locked across ALL 3 modes
DEFAULT_HUD_HEIGHT_COLLAPSE = MODE_HEIGHTS[MODE_COLLAPSE]  # 28px
DEFAULT_HUD_HEIGHT_MINI = MODE_HEIGHTS[MODE_MINI]          # 90px (Default Boot)
DEFAULT_HUD_HEIGHT_NORMAL = MODE_HEIGHTS[MODE_NORMAL]      # 460px (Expanded view)

# Backward-compatible aliases
DEFAULT_HUD_HEIGHT_EXPANDED = DEFAULT_HUD_HEIGHT_NORMAL
DEFAULT_HUD_HEIGHT_COLLAPSED = DEFAULT_HUD_HEIGHT_COLLAPSE

DEFAULT_SNAP_DISTANCE = 20
DEFAULT_IDLE_THRESHOLD = 60.0

DEFAULT_CONFIG: Dict[str, Any] = {
    "x": None,
    "y": None,
    "width": DEFAULT_HUD_WIDTH,
    "mode": DEFAULT_OPERATING_MODE,  # Mode 2 (Mini Mode, 90px)
    "height": DEFAULT_HUD_HEIGHT_MINI,
    "collapsed_height": DEFAULT_HUD_HEIGHT_COLLAPSE,
    "is_collapsed": False,
    "always_on_top": True,
    "opacity": DEFAULT_OPACITY,  # 0.80 (80% Cyber-Glass)
    "snap_distance": DEFAULT_SNAP_DISTANCE,
    "idle_threshold": DEFAULT_IDLE_THRESHOLD,
    "lock_mode": True,
    "lock_position": True,
    "lock_opacity": True,
}


class RECT(ctypes.Structure):
    _fields_ = [
        ("left", wintypes.LONG),
        ("top", wintypes.LONG),
        ("right", wintypes.LONG),
        ("bottom", wintypes.LONG),
    ]


class HUDDockingManager:
    """
    Manages desktop work area detection via Win32 SPI_GETWORKAREA,
    calculates default docking coordinates directly above the system tray clock,
    and applies 20px magnetic edge-snapping physics across all 3 modes.
    """

    def __init__(self) -> None:
        pass

    def get_work_area(self) -> Tuple[int, int, int, int]:
        """
        Retrieves primary monitor work area (excluding Windows taskbar).
        Returns (left, top, right, bottom).
        """
        if sys.platform == "win32":
            try:
                rect = RECT()
                res = ctypes.windll.user32.SystemParametersInfoW(
                    SPI_GETWORKAREA, 0, ctypes.byref(rect), 0
                )
                if res and (rect.right > rect.left) and (rect.bottom > rect.top):
                    return (int(rect.left), int(rect.top), int(rect.right), int(rect.bottom))
            except Exception:
                pass

        # Fallback to GetSystemMetrics or standard 1920x1080 display
        screen_w = 1920
        screen_h = 1080
        if sys.platform == "win32":
            try:
                w = ctypes.windll.user32.GetSystemMetrics(0)
                h = ctypes.windll.user32.GetSystemMetrics(1)
                if w > 0:
                    screen_w = w
                if h > 0:
                    screen_h = h
            except Exception:
                pass

        # Deduct standard Windows taskbar height (approx 40px) from bottom
        return (0, 0, screen_w, max(100, screen_h - 40))

    def get_default_dock_coordinates(self, hud_w: int, hud_h: int) -> Tuple[int, int]:
        """
        Calculates default dock position directly above the Windows system tray date/time clock.
        Applies 10px margin from right and bottom edges of the work area.
        """
        left, top, right, bottom = self.get_work_area()
        x = right - hud_w - 10
        y = bottom - hud_h - 10

        # Safety clamp within work area
        x = max(left + 10, x)
        y = max(top + 10, y)
        return (int(x), int(y))

    def apply_magnetic_snap(
        self, x: int, y: int, width: int, height: int, snap_distance: int = DEFAULT_SNAP_DISTANCE
    ) -> Tuple[int, int]:
        """
        Magnetically snaps window coordinates flush to work area boundaries
        when released within snap_distance (default: 20 pixels).
        Returns (snapped_x, snapped_y).
        """
        left, top, right, bottom = self.get_work_area()
        snapped_x = x
        snapped_y = y

        # Left edge snap
        if abs(snapped_x - left) <= snap_distance:
            snapped_x = left
        # Right edge snap
        elif abs((snapped_x + width) - right) <= snap_distance:
            snapped_x = right - width

        # Top edge snap
        if abs(snapped_y - top) <= snap_distance:
            snapped_y = top
        # Bottom edge snap
        elif abs((snapped_y + height) - bottom) <= snap_distance:
            snapped_y = bottom - height

        return (int(snapped_x), int(snapped_y))

    def is_within_screen(
        self, x: int, y: int, width: int, height: int, min_visible: int = 20
    ) -> bool:
        """
        Verifies if at least min_visible pixels of width and height overlap with the active work area.
        Detects if window was positioned on a disconnected secondary display.
        """
        left, top, right, bottom = self.get_work_area()
        threshold_w = min(width, min_visible)
        threshold_h = min(height, min_visible)
        overlap_x = max(0, min(x + width, right) - max(x, left))
        overlap_y = max(0, min(y + height, bottom) - max(y, top))
        return (overlap_x >= threshold_w) and (overlap_y >= threshold_h)


class HUDConfigManager:
    """
    Persists and validates HUD 3-mode geometry, always-on-top, and opacity
    to disk (`hud_config.json`) using atomic writes and robust fallback defaults.
    """

    def __init__(
        self,
        config_path: Optional[str] = None,
        docking_manager: Optional[HUDDockingManager] = None
    ) -> None:
        if config_path:
            self.config_path = os.path.abspath(config_path)
        else:
            # Default to workspace root: ../hud_config.json relative to modules/
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            root_dir = os.path.dirname(base_dir) if os.path.basename(base_dir).lower() == "src" else base_dir
            cfg_cand = os.path.join(root_dir, "config", "hud_config.json")
            self.config_path = cfg_cand if (os.path.isfile(cfg_cand) or not os.path.isfile(os.path.join(root_dir, "hud_config.json"))) else os.path.join(root_dir, "hud_config.json")

        self.docking_manager = docking_manager or HUDDockingManager()
        self._current_config: Dict[str, Any] = dict(DEFAULT_CONFIG)

    def load_config(self) -> Dict[str, Any]:
        """
        Loads configuration from disk, validating coordinates against current work area.
        If coordinates fall outside visible screen bounds, resets to default tray dock position.
        Enforces fixed 240px width across all modes.
        """
        loaded = {}
        if os.path.isfile(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        loaded = data
            except Exception:
                loaded = {}

        config = dict(DEFAULT_CONFIG)
        config.update(loaded)

        # Enforce strictly locked 240px width
        config["width"] = DEFAULT_HUD_WIDTH

        # Resolve Operating Mode (Mode 1: Collapse 28px, Mode 2: Mini 90px, Mode 3: Normal 460px)
        raw_mode = loaded.get("mode")
        if raw_mode in (MODE_COLLAPSE, MODE_MINI, MODE_NORMAL):
            mode = int(raw_mode)
        elif loaded.get("is_collapsed", False):
            mode = MODE_COLLAPSE
        else:
            # Default boot mode: Mode 2 (Mini Mode, 90px)
            mode = DEFAULT_OPERATING_MODE

        config["mode"] = mode
        config["height"] = MODE_HEIGHTS.get(mode, DEFAULT_HUD_HEIGHT_MINI)
        config["collapsed_height"] = DEFAULT_HUD_HEIGHT_COLLAPSE
        config["is_collapsed"] = (mode == MODE_COLLAPSE)
        config["always_on_top"] = bool(config.get("always_on_top", True))
        config["lock_mode"] = bool(config.get("lock_mode", True))
        config["lock_position"] = bool(config.get("lock_position", True))
        config["lock_opacity"] = bool(config.get("lock_opacity", True))

        # Validate Opacity (Default 0.80 Cyber-Glass)
        try:
            opacity = float(config.get("opacity", DEFAULT_OPACITY))
            config["opacity"] = max(0.10, min(1.00, opacity))
        except (ValueError, TypeError):
            config["opacity"] = DEFAULT_OPACITY

        try:
            config["snap_distance"] = max(0, int(config.get("snap_distance", DEFAULT_SNAP_DISTANCE)))
        except (ValueError, TypeError):
            config["snap_distance"] = DEFAULT_SNAP_DISTANCE

        try:
            thresh = float(config.get("idle_threshold", DEFAULT_IDLE_THRESHOLD))
            config["idle_threshold"] = max(5.0, min(3600.0, thresh))
        except (ValueError, TypeError):
            config["idle_threshold"] = DEFAULT_IDLE_THRESHOLD

        # Validate coordinates against current work area
        cur_w = config["width"]
        cur_h = config["height"]

        x = config.get("x")
        y = config.get("y")
        valid_pos = False

        if x is not None and y is not None:
            try:
                ix = int(x)
                iy = int(y)
                if self.docking_manager.is_within_screen(ix, iy, cur_w, cur_h):
                    config["x"] = ix
                    config["y"] = iy
                    valid_pos = True
            except (ValueError, TypeError):
                pass

        left, top, right, bottom = self.docking_manager.get_work_area()
        saved_height = loaded.get("height", config["height"])
        if valid_pos:
            if saved_height != config["height"]:
                # Re-anchor bottom when height/mode changed since last save
                saved_bottom = config["y"] + saved_height
                config["y"] = max(top + 10, saved_bottom - config["height"])

            # If loaded y coordinate combined with current height leaves a large gap (>100px) from bottom,
            # or if it was not docked to the bottom area on boot, recalculate bottom-anchored coordinates
            gap_from_bottom = bottom - (config["y"] + config["height"])
            if gap_from_bottom > 100 or gap_from_bottom < -10:
                def_x, def_y = self.docking_manager.get_default_dock_coordinates(cur_w, cur_h)
                config["x"] = def_x
                config["y"] = def_y
        else:
            def_x, def_y = self.docking_manager.get_default_dock_coordinates(cur_w, cur_h)
            config["x"] = def_x
            config["y"] = def_y

        self._current_config = config
        return dict(self._current_config)

    def save_config(self, updates: Optional[Dict[str, Any]] = None) -> bool:
        """
        Commits configuration to disk atomically using temporary write + replace.
        """
        if updates:
            self._current_config.update(updates)

        temp_path = self.config_path + ".tmp"
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(self._current_config, f, indent=2)
                f.flush()
                os.fsync(f.fileno())

            # Atomic replace on Windows
            if os.path.isfile(self.config_path):
                os.replace(temp_path, self.config_path)
            else:
                os.rename(temp_path, self.config_path)
            return True
        except Exception:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
            return False

    def save_position(self, x: int, y: int) -> bool:
        """Convenience method to commit updated window position."""
        return self.save_config({"x": int(x), "y": int(y)})

    def save_mode(self, mode: int) -> bool:
        """Convenience method to commit active operating mode."""
        if mode in MODE_HEIGHTS:
            return self.save_config({
                "mode": mode,
                "height": MODE_HEIGHTS[mode],
                "is_collapsed": (mode == MODE_COLLAPSE)
            })
        return False

    def save_state(self, mode_or_collapsed: Any, always_on_top: bool, opacity: float) -> bool:
        """
        Commits window UI states with backward compatibility for both
        `mode` (int: 1, 2, 3) and legacy `is_collapsed` (bool).
        """
        if isinstance(mode_or_collapsed, bool):
            mode = MODE_COLLAPSE if mode_or_collapsed else MODE_MINI
        elif isinstance(mode_or_collapsed, int) and mode_or_collapsed in MODE_HEIGHTS:
            mode = mode_or_collapsed
        else:
            mode = DEFAULT_OPERATING_MODE

        return self.save_config({
            "mode": mode,
            "height": MODE_HEIGHTS.get(mode, DEFAULT_HUD_HEIGHT_MINI),
            "is_collapsed": (mode == MODE_COLLAPSE),
            "always_on_top": bool(always_on_top),
            "opacity": float(opacity)
        })

    def save_threshold(self, threshold: float) -> bool:
        """Convenience method to commit active idle threshold."""
        return self.save_config({"idle_threshold": float(threshold)})

    def save_lock_settings(
        self,
        lock_mode: Optional[bool] = None,
        lock_position: Optional[bool] = None,
        lock_opacity: Optional[bool] = None
    ) -> bool:
        """Commits lock configuration updates atomically."""
        updates: Dict[str, Any] = {}
        if lock_mode is not None:
            updates["lock_mode"] = bool(lock_mode)
        if lock_position is not None:
            updates["lock_position"] = bool(lock_position)
        if lock_opacity is not None:
            updates["lock_opacity"] = bool(lock_opacity)
        return self.save_config(updates)
