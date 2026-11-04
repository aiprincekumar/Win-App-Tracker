# -*- coding: utf-8 -*-
"""
modules/hud_canvas.py: Cyber-Glass Double-Buffered GDI Vector HUD Canvas Renderer.
Department 04: UI/UX Design System & Aesthetic Engineering.
Department 05: Frontend Engineering & Vector Graphics.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import sys
import tkinter as tk
from typing import Dict, Any, Optional, Tuple, Callable, List

from .config import (
    HUDOperatingMode,
    HUD_WIDTH,
    MODE_COLLAPSE,
    MODE_MINI,
    MODE_NORMAL,
    MODE_HEIGHTS,
    DEFAULT_OPERATING_MODE,
    COLOR_BG_DARK,
    COLOR_CARD_BG,
    COLOR_CARD_BORDER,
    COLOR_TEXT_PRIMARY,
    COLOR_TEXT_MUTED,
    COLOR_EMERALD,
    COLOR_CYAN,
    COLOR_ORANGE,
    COLOR_AMBER,
    COLOR_ALERT_RED,
    COLOR_VIOLET
)

SHADOW_COLOR = "#000000"


def draw_shadow_text(
    canvas: tk.Canvas,
    x: int,
    y: int,
    text: str,
    font: Any,
    fill_color: str,
    shadow_color: str = SHADOW_COLOR,
    anchor: str = "nw",
    tags: Any = None
) -> Tuple[int, int]:
    """
    Dual-pass text rendering helper ensuring 100% legibility on any desktop wallpaper.
    Renders dark drop shadow at (x+1, y+1) before drawing primary colored text at (x, y).
    """
    tag_list = [tags] if isinstance(tags, str) else list(tags or [])
    shadow_id = canvas.create_text(
        x + 1,
        y + 1,
        text=text,
        font=font,
        fill=shadow_color,
        anchor=anchor,
        tags=tag_list
    )
    text_id = canvas.create_text(
        x,
        y,
        text=text,
        font=font,
        fill=fill_color,
        anchor=anchor,
        tags=tag_list
    )
    return shadow_id, text_id


class HUDCanvas:
    """
    High-density double-buffered vector canvas rendering the 3 operating modes
    (Mode 1: Collapse 28px, Mode 2: Mini 90px, Mode 3: Normal 460px)
    across all 7 telemetry sections with zero visual noise.
    """

    def __init__(
        self,
        parent: tk.Tk,
        width: int = HUD_WIDTH,
        height: int = MODE_HEIGHTS[MODE_MINI],
        on_toggle_collapse: Optional[Callable[[], None]] = None,
        on_toggle_pin: Optional[Callable[[], None]] = None,
        on_cycle_opacity: Optional[Callable[[], None]] = None,
        on_menu: Optional[Callable[[], None]] = None,
        on_set_threshold: Optional[Callable[[float], None]] = None,
        on_toggle_lock: Optional[Callable[[], None]] = None,
        # Legacy hooks accepted for backward compatibility
        on_snooze: Optional[Callable[[], None]] = None,
        on_cancel: Optional[Callable[[], None]] = None
    ) -> None:
        self.parent = parent
        self.width = width
        self.height = height

        # Action callbacks
        self.on_toggle_collapse = on_toggle_collapse
        self.on_toggle_pin = on_toggle_pin
        self.on_cycle_opacity = on_cycle_opacity
        self.on_menu = on_menu
        self.on_set_threshold = on_set_threshold
        self.on_toggle_lock = on_toggle_lock

        # Internal state
        self.current_mode: int = DEFAULT_OPERATING_MODE
        self.is_collapsed: bool = False
        self.is_pinned: bool = True
        self.is_locked: bool = True
        self.lock_position: bool = True
        self.lock_opacity: bool = True
        self.current_state: Dict[str, Any] = {}
        self.smoothed_peak: float = 0.0
        self._click_targets: Dict[str, Tuple[int, int, int, int]] = {}

        # Construct Canvas
        self.canvas = tk.Canvas(
            parent,
            width=self.width,
            height=self.height,
            bg=COLOR_BG_DARK,
            highlightthickness=0,
            borderwidth=0
        )
        self.canvas.pack(fill="both", expand=True)

        # Hover motion for instant cursor hand2 feedback
        self.canvas.bind("<Motion>", self._handle_motion)

    # --------------------------------------------------------------------------
    # Interactive Target Management & Hit-Testing
    # --------------------------------------------------------------------------

    def register_click_target(
        self,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        target_name: str
    ) -> None:
        """Registers a deterministic hit-test bounding box."""
        self._click_targets[target_name] = (
            min(x1, x2),
            min(y1, y2),
            max(x1, x2),
            max(y1, y2)
        )

    def get_hit_target(self, x: int, y: int) -> Optional[str]:
        """Returns the identifier of the clicked button if (x, y) falls inside."""
        for name, (x1, y1, x2, y2) in self._click_targets.items():
            if x1 <= x <= x2 and y1 <= y <= y2:
                return name
        return None

    def is_interactive_target(self, x: int, y: int) -> bool:
        """Checks if (x, y) falls inside any registered interactive button."""
        return self.get_hit_target(x, y) is not None

    def _handle_motion(self, event: tk.Event) -> None:
        """Updates cursor to hand2 when hovering over interactive targets."""
        if self.is_interactive_target(event.x, event.y):
            self.canvas.config(cursor="hand2")
        else:
            self.canvas.config(cursor="")

    def draw_shadow_text(
        self,
        x: int,
        y: int,
        text: str,
        font: Any,
        fill_color: str,
        shadow_color: str = SHADOW_COLOR,
        anchor: str = "nw",
        tags: Any = None
    ) -> Tuple[int, int]:
        """Exposes dual-pass drop shadow helper as an instance method."""
        return draw_shadow_text(
            self.canvas, x, y, text, font, fill_color, shadow_color, anchor, tags
        )

    # --------------------------------------------------------------------------
    # State Synchronization & Lifecycle
    # --------------------------------------------------------------------------

    def set_mode(self, mode: int) -> None:
        """Sets operating mode (1, 2, or 3) and adjusts canvas dimensions."""
        if mode in MODE_HEIGHTS:
            self.current_mode = mode
            self.is_collapsed = (mode == MODE_COLLAPSE)
            self.height = MODE_HEIGHTS[mode]
            self.canvas.config(height=self.height)

    def set_collapsed(self, collapsed: bool) -> None:
        """Backward-compatible helper toggling between Collapse and Mini modes."""
        self.set_mode(MODE_COLLAPSE if collapsed else MODE_MINI)

    def update_state(self, state: Dict[str, Any]) -> None:
        """Updates telemetry snapshot, computes smoothed audio VU, and renders."""
        self.current_state = state

        # Smooth audio peak
        raw_peak = float(state.get("peak_amplitude", state.get("audio_peak", 0.0)))
        if raw_peak > self.smoothed_peak:
            self.smoothed_peak = raw_peak
        else:
            self.smoothed_peak = max(0.0, self.smoothed_peak * 0.85)

        if "always_on_top" in state:
            self.is_pinned = bool(state["always_on_top"])

        if "lock_mode" in state:
            self.is_locked = bool(state["lock_mode"])
        elif "is_locked" in state:
            self.is_locked = bool(state["is_locked"])
        if "lock_position" in state:
            self.lock_position = bool(state["lock_position"])
        if "lock_opacity" in state:
            self.lock_opacity = bool(state["lock_opacity"])

        mode = state.get("mode", self.current_mode)
        if mode in MODE_HEIGHTS:
            self.current_mode = mode
            self.is_collapsed = (mode == MODE_COLLAPSE)
            self.height = MODE_HEIGHTS[mode]

        self.render(state, self.current_mode)

    # --------------------------------------------------------------------------
    # Mode 1: Collapse Pill Renderer (y: 0..28, Height: 28px)
    # --------------------------------------------------------------------------

    def render_collapse_pill(self, state: Dict[str, Any]) -> None:
        """
        Renders Mode 1 ultra-thin 240px x 28px hardware pill.
        Renders only:
          - Dynamic state icon:
              * ▶ Green when playing
              * ⏸ Amber when paused
              * ⏹ Orange when idle
              * ⚠️ Light Red when approaching action (>= 80% threshold)
          - Live running timer (e.g. '00h 42m 18s' or '45.2s / 60s')
          - 📌 Pin icon and ▼ Expand button
          - Zero status text prefix!
        """
        is_muted_state = bool(
            state.get("is_muted_playback", False) or
            state.get("state_code") == "VIDEO_MUTED" or
            state.get("status") == "MUTED" or
            state.get("status_text") == "MUTED"
        )
        is_playing = bool(state.get("is_video_playing", False)) or is_muted_state
        pause_sec = int(state.get("paused_seconds", state.get("continuous_pause_seconds", 0)))
        idle_sec = float(state.get("idle_seconds", 0.0))
        thresh = float(state.get("idle_threshold", 60.0))
        is_alert = (idle_sec >= thresh * 0.8) and (not is_playing)

        # Dynamic Icon & Accent Color Resolution
        if is_alert:
            icon_char = "⚠️"
            accent_color = COLOR_ALERT_RED
        elif is_playing:
            if is_muted_state:
                icon_char = "🔇"
                accent_color = COLOR_VIOLET
            else:
                icon_char = "▶"
                accent_color = COLOR_EMERALD
        elif pause_sec > 0 or state.get("status") == "PAUSED" or state.get("playback_state") == "PAUSED" or state.get("state_code") == "VIDEO_PAUSED":
            icon_char = "⏸"
            accent_color = COLOR_AMBER
        else:
            icon_char = "⏹"
            accent_color = COLOR_ORANGE

        # Dynamic Icon
        draw_shadow_text(
            self.canvas, 8, 6, icon_char, ("Segoe UI", 9, "bold"), accent_color
        )

        # Live Running Timer ONLY (Zero status text)
        if is_playing:
            play_sec = int(state.get("cur_video_seconds", state.get("continuous_play_seconds", 0)))
            h = play_sec // 3600
            m = (play_sec % 3600) // 60
            s = play_sec % 60
            time_str = f"{h:02d}h {m:02d}m {s:02d}s" if h > 0 else f"{m:02d}m {s:02d}s"
            timer_color = COLOR_VIOLET if is_muted_state else COLOR_EMERALD
        else:
            time_str = f"{idle_sec:.1f}s / {thresh:.0f}s"
            timer_color = COLOR_ALERT_RED if is_alert else COLOR_ORANGE

        draw_shadow_text(
            self.canvas, 28, 6, time_str, ("Segoe UI", 9, "bold"), timer_color
        )

        # Lock Icon (🔒 when locked, 🔓 when unlocked)
        lock_char = "🔒" if self.is_locked else "🔓"
        lock_color = COLOR_AMBER if self.is_locked else COLOR_TEXT_MUTED
        draw_shadow_text(
            self.canvas, 166, 6, lock_char, ("Segoe UI", 8), lock_color, tags="btn_lock"
        )
        self.register_click_target(162, 0, 186, 28, "btn_lock")

        # Pin Icon
        pin_color = COLOR_EMERALD if self.is_pinned else COLOR_TEXT_MUTED
        draw_shadow_text(
            self.canvas, 192, 6, "📌", ("Segoe UI", 8), pin_color, tags="btn_pin"
        )
        self.register_click_target(188, 0, 210, 28, "btn_pin")

        # Expand Chevron
        draw_shadow_text(
            self.canvas, 220, 6, "▼", ("Segoe UI", 9, "bold"), COLOR_TEXT_MUTED, tags="btn_expand"
        )
        self.register_click_target(212, 0, 240, 28, "btn_expand")

    # --------------------------------------------------------------------------
    # Mode 2 & Mode 3 Title Bar Renderer (y: 0..30, Height: 30px)
    # --------------------------------------------------------------------------

    def _render_title_bar(self, state: Dict[str, Any], is_mini: bool) -> None:
        """
        Renders top title bar (y: 0..30):
          - Left: Status glowing dot + Player App Name
          - Right: 📌 Pin icon + ▲ Mode Arrow + ⋮ Context Menu button
          - Cleanliness: NO squeezed media title, NO opacity percentage label.
        """
        self.canvas.create_rectangle(0, 0, 240, 30, fill=COLOR_BG_DARK, outline="")

        is_muted_state = bool(
            state.get("is_muted_playback", False) or
            state.get("state_code") == "VIDEO_MUTED" or
            state.get("status") == "MUTED" or
            state.get("status_text") == "MUTED"
        )
        is_playing = bool(state.get("is_video_playing", False)) or is_muted_state
        idle_sec = float(state.get("idle_seconds", 0.0))
        thresh = float(state.get("idle_threshold", 60.0))
        pause_sec = int(state.get("paused_seconds", state.get("continuous_pause_seconds", 0)))
        is_alert = (idle_sec >= thresh * 0.8) and (not is_playing)

        if is_alert:
            dot_color = COLOR_ALERT_RED
        elif is_playing:
            dot_color = COLOR_VIOLET if is_muted_state else COLOR_EMERALD
        elif pause_sec > 0 or state.get("status") == "PAUSED" or state.get("playback_state") == "PAUSED" or state.get("state_code") == "VIDEO_PAUSED":
            dot_color = COLOR_AMBER
        else:
            dot_color = COLOR_ORANGE

        # Status Glowing Dot
        self.canvas.create_oval(8, 10, 16, 18, fill=dot_color, outline="")

        # Player / Application Name (Clean, unsqueezed)
        app_name = state.get("app_name") or state.get("active_player", "Sentinel Standby")
        if len(app_name) > 13:
            app_name = app_name[:11] + ".."
        draw_shadow_text(
            self.canvas, 22, 7, app_name, ("Segoe UI", 9, "bold"), COLOR_TEXT_PRIMARY
        )

        # Lock Icon (🔒 when locked, 🔓 when unlocked)
        lock_char = "🔒" if self.is_locked else "🔓"
        lock_color = COLOR_AMBER if self.is_locked else COLOR_TEXT_MUTED
        draw_shadow_text(
            self.canvas, 148, 7, lock_char, ("Segoe UI", 8), lock_color, tags="btn_lock"
        )
        self.register_click_target(144, 2, 166, 28, "btn_lock")

        # Pin Icon (📌)
        pin_color = COLOR_EMERALD if self.is_pinned else COLOR_TEXT_MUTED
        draw_shadow_text(
            self.canvas, 172, 7, "📌", ("Segoe UI", 8), pin_color, tags="btn_pin"
        )
        self.register_click_target(168, 2, 190, 28, "btn_pin")

        # Mode Arrow (▲ to collapse to Mode 1)
        chevron = "▲"
        draw_shadow_text(
            self.canvas, 196, 7, chevron, ("Segoe UI", 9, "bold"), COLOR_TEXT_MUTED, tags="btn_collapse"
        )
        self.register_click_target(192, 2, 214, 28, "btn_collapse")

        # Context Menu Icon (⋮)
        draw_shadow_text(
            self.canvas, 222, 7, "⋮", ("Segoe UI", 10, "bold"), COLOR_TEXT_MUTED, tags="btn_menu"
        )
        self.register_click_target(216, 2, 238, 28, "btn_menu")

    # --------------------------------------------------------------------------
    # Section 1: Dynamic Card (y: 32..88, Height: 56px)
    # --------------------------------------------------------------------------

    def _render_dynamic_section_1(self, state: Dict[str, Any]) -> None:
        """
        Dynamically swaps between:
          State A: '1. NOW PLAYING' card when video is playing.
          State B: '1. IDLE SENTINEL' card when system is idle or paused.
        """
        x, y, w, h = 8, 32, 224, 56
        self.canvas.create_rectangle(
            x, y, x + w, y + h,
            fill=COLOR_CARD_BG,
            outline=COLOR_CARD_BORDER,
            tags="card_s1"
        )

        is_paused_state = bool(
            state.get("status") == "PAUSED" or
            state.get("status_text") == "PAUSED" or
            state.get("state_code") == "VIDEO_PAUSED"
        )
        is_muted_state = bool(
            not is_paused_state and (
                state.get("is_muted_playback", False) or
                state.get("state_code") == "VIDEO_MUTED" or
                state.get("status") == "MUTED" or
                state.get("status_text") == "MUTED"
            )
        )
        is_playing = bool(state.get("is_video_playing", False)) or is_muted_state
        has_media_item = bool(
            (state.get("track_title") and state.get("track_title") != "Sentinel Standby") or
            state.get("track_duration_sec", 0) > 0 or
            state.get("top_section_mode") in ("NOW_PLAYING", "VIDEO_PAUSED")
        )

        if is_playing or (is_paused_state and has_media_item):
            # ------------------------------------------------------------------
            # Row 1 (y: 37, Height: 12px): Status Badge (Left) & Platform/Mode (Right)
            # Distinct left/right anchoring with guaranteed >40px breathing room.
            # ------------------------------------------------------------------
            if is_muted_state:
                badge_text = "1. PLAYING [MUTED]"
                badge_color = COLOR_VIOLET
                bar_fill = COLOR_VIOLET
            elif is_paused_state:
                badge_text = "1. PAUSED"
                badge_color = COLOR_ORANGE
                bar_fill = COLOR_ORANGE
            else:
                badge_text = "1. NOW PLAYING"
                badge_color = COLOR_EMERALD
                bar_fill = COLOR_EMERALD
            draw_shadow_text(
                self.canvas, x + 6, y + 5, badge_text, ("Segoe UI", 8, "bold"), badge_color
            )

            # Concise Platform & Presentation Mode Tag (e.g. 'YouTube • WIN')
            raw_app = (state.get("app_name") or state.get("active_player") or "Player").strip()
            raw_lower = raw_app.lower()
            if "chrome" in raw_lower:
                clean_app = "Chrome"
            elif "edge" in raw_lower:
                clean_app = "Edge"
            elif "firefox" in raw_lower:
                clean_app = "Firefox"
            elif "brave" in raw_lower:
                clean_app = "Brave"
            elif "opera" in raw_lower:
                clean_app = "Opera"
            elif "vlc" in raw_lower:
                clean_app = "VLC"
            elif "potplayer" in raw_lower:
                clean_app = "PotPlayer"
            elif "youtube" in raw_lower:
                clean_app = "YouTube"
            elif "media player classic" in raw_lower or "mpc" in raw_lower:
                clean_app = "MPC-HC"
            elif "media player" in raw_lower or "wmp" in raw_lower:
                clean_app = "WMP"
            elif "films" in raw_lower or "video.ui" in raw_lower:
                clean_app = "Films & TV"
            elif "netflix" in raw_lower:
                clean_app = "Netflix"
            elif "twitch" in raw_lower:
                clean_app = "Twitch"
            elif len(raw_app) > 10:
                clean_app = raw_app[:9] + "."
            else:
                clean_app = raw_app

            pres_mode = state.get("presentation_mode", "WINDOW").upper()
            if "FULL" in pres_mode:
                pres_tag = "FULL"
            elif "MAX" in pres_mode:
                pres_tag = "MAX"
            elif "MIN" in pres_mode:
                pres_tag = "MIN"
            else:
                pres_tag = "WIN"

            # App & Synchronized Volume Tag (e.g. 'YouTube • App: 30%' or 'YouTube • App: [MUTED]')
            a_vol = int(state.get("app_volume_pct", state.get("session_volume_percent", 100)))
            a_mute = bool(state.get("app_muted", False) or is_muted_state)

            if a_mute:
                vol_str = "App: [MUTED]" if a_vol == 0 else f"App: {a_vol}% [M]"
            else:
                vol_str = f"App: {a_vol}%"

            if "FULL" in pres_tag:
                app_tag = f"{clean_app} • FULL • {vol_str}"
            else:
                app_tag = f"{clean_app} • {vol_str}"

            tag_color = COLOR_VIOLET if a_mute else COLOR_CYAN
            draw_shadow_text(
                self.canvas, x + w - 6, y + 5, app_tag, ("Segoe UI", 7, "bold"), tag_color, anchor="ne"
            )

            # ------------------------------------------------------------------
            # Row 2 (y: 50, Height: 13px): Media / Track Title
            # Dedicated full 212px row with clean ellipsis (...) truncation.
            # ------------------------------------------------------------------
            raw_title = (
                state.get("track_title") or
                state.get("media_title") or
                state.get("title") or
                "Unknown Media"
            ).strip()

            for suffix in [
                " - Films & TV", " - Movies & TV", " - Film & TV", " - Films and TV", " - Movies and TV", " - Video",
                " - VLC media player", " - VLC", " - Windows Media Player", " - Media Player"
            ]:
                if raw_title.lower().endswith(suffix.lower()):
                    raw_title = raw_title[:-len(suffix)].strip()
                    break

            title = raw_title
            if len(title) > 34:
                title = title[:32].rstrip() + "..."
            draw_shadow_text(
                self.canvas, x + 6, y + 18, title, ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
            )

            # ------------------------------------------------------------------
            # Row 3 (y: 66, Height: 4px): Full-Width Seek Timeline Progress Bar
            # Spans the entire card width (212px) as a sleek visual divider.
            # ------------------------------------------------------------------
            bar_x, bar_y, bar_w = x + 6, y + 34, w - 12
            self.canvas.create_rectangle(
                bar_x, bar_y, bar_x + bar_w, bar_y + 4,
                fill=COLOR_CARD_BORDER,
                outline=""
            )

            pos_sec = max(0, int(state.get("track_position_sec", 0)))
            dur_sec = max(0, int(state.get("track_duration_sec", 0)))
            seek_str = str(state.get("seek_time_str") or "").strip()

            # Parse seconds from seek_time_str if explicit seconds missing
            if (dur_sec <= 0 or pos_sec <= 0) and seek_str and "/" in seek_str:
                parts = seek_str.split("/")
                if len(parts) == 2:
                    try:
                        def _parse_ts(s: str) -> int:
                            sub_parts = [int(p) for p in s.strip().split(":")]
                            if len(sub_parts) == 3:
                                return sub_parts[0] * 3600 + sub_parts[1] * 60 + sub_parts[2]
                            elif len(sub_parts) == 2:
                                return sub_parts[0] * 60 + sub_parts[1]
                            return 0
                        p_val = _parse_ts(parts[0])
                        d_val = _parse_ts(parts[1])
                        if p_val > 0 and pos_sec <= 0:
                            pos_sec = p_val
                        if d_val > 0 and dur_sec <= 0:
                            dur_sec = d_val
                    except Exception:
                        pass

            progress = max(0.0, min(1.0, float(state.get("track_progress_pct", 0.0))))
            if dur_sec > 0 and pos_sec > 0:
                progress = max(0.0, min(1.0, pos_sec / dur_sec))

            if progress > 0:
                self.canvas.create_rectangle(
                    bar_x, bar_y, bar_x + int(bar_w * progress), bar_y + 4,
                    fill=bar_fill,
                    outline=""
                )

            # ------------------------------------------------------------------
            # Row 4 (y: 74, Height: 12px): Seek Time String & Metadata Tags
            # Left: '01:23 / 10:45' (Cyan) | Right: '1.25x • 1080p' (Muted)
            # ------------------------------------------------------------------
            def fmt_time(sec: int) -> str:
                h = sec // 3600
                m = (sec % 3600) // 60
                s = sec % 60
                if h > 0:
                    return f"{h}:{m:02d}:{s:02d}"
                return f"{m:02d}:{s:02d}"

            if dur_sec > 0:
                time_str = f"{fmt_time(pos_sec)} / {fmt_time(dur_sec)}"
            elif seek_str and seek_str not in ("00:00 / 00:00", "00:00 / LIVE"):
                time_str = seek_str
            elif pos_sec > 0:
                time_str = f"{fmt_time(pos_sec)} / LIVE"
            else:
                time_str = "00:00 / 00:00"

            draw_shadow_text(
                self.canvas, x + 6, y + 42, time_str, ("Segoe UI", 7, "bold"), COLOR_CYAN
            )

            speed = float(state.get("playback_speed", 1.0))
            res_str = (state.get("video_resolution") or state.get("resolution") or "1080p").strip()
            res_upper = res_str.upper()
            if "1080" in res_upper:
                res_badge = "1080p"
            elif "2160" in res_upper or "4K" in res_upper:
                res_badge = "4K"
            elif "1440" in res_upper:
                res_badge = "1440p"
            elif "720" in res_upper:
                res_badge = "720p"
            elif "480" in res_upper:
                res_badge = "480p"
            elif "360" in res_upper:
                res_badge = "360p"
            else:
                res_badge = res_str[:7]

            if is_paused_state:
                idle_sec = float(state.get("idle_seconds", 0.0))
                thresh = float(state.get("idle_threshold", 60.0))
                meta_tag = f"PAUSED • Idle: {idle_sec:.0f}s/{int(thresh)}s"
            else:
                meta_tag = f"{speed:.2f}x • {res_badge}" if speed != 1.0 else f"1.0x • {res_badge}"
            draw_shadow_text(
                self.canvas, x + w - 6, y + 42, meta_tag, ("Segoe UI", 7), COLOR_TEXT_MUTED, anchor="ne"
            )

        else:
            idle_sec = float(state.get("idle_seconds", 0.0))
            thresh = float(state.get("idle_threshold", 60.0))
            is_alert = (idle_sec >= thresh * 0.8)
            accent = COLOR_ALERT_RED if is_alert else COLOR_ORANGE

            # Header Badge
            draw_shadow_text(
                self.canvas, x + 6, y + 5, "1. IDLE SENTINEL", ("Segoe UI", 8, "bold"), accent
            )

            # Target Action (Sleep / Shutdown)
            target_str = f"TARGET: {state.get('target_action', 'AUTO-SHUTDOWN')}"
            draw_shadow_text(
                self.canvas, x + w - 6, y + 5, target_str, ("Segoe UI", 7, "bold"), accent, anchor="ne"
            )

            # Countdown Timer Line
            met_str = " [MET]" if idle_sec >= thresh else ""
            timer_str = f"Countdown: {idle_sec:.1f}s / {thresh:.1f}s{met_str}"
            draw_shadow_text(
                self.canvas, x + 6, y + 18, timer_str, ("Segoe UI", 9, "bold"), COLOR_TEXT_PRIMARY
            )

            # Buffer Progress Bar
            bar_x, bar_y, bar_w = x + 6, y + 34, w - 12
            self.canvas.create_rectangle(bar_x, bar_y, bar_x + bar_w, bar_y + 4, fill=COLOR_CARD_BORDER, outline="")
            ratio = max(0.0, min(1.0, idle_sec / max(1.0, thresh)))
            if ratio > 0:
                self.canvas.create_rectangle(
                    bar_x, bar_y, bar_x + int(bar_w * ratio), bar_y + 4, fill=accent, outline=""
                )

            # Threshold & Resets Count
            draw_shadow_text(
                self.canvas, x + 6, y + 42, f"Threshold: {int(thresh)}s", ("Segoe UI", 7), COLOR_TEXT_MUTED
            )
            resets = state.get("idle_resets_today", state.get("daily_event_counts", {}).get("idle_resets", 0))
            draw_shadow_text(
                self.canvas, x + w - 6, y + 42, f"Resets: [{resets}x]", ("Segoe UI", 7, "bold"), COLOR_CYAN, anchor="ne"
            )

    # --------------------------------------------------------------------------
    # Section 2: Audio Monitor & Volume Control (y: 92..152, Height: 60px)
    # --------------------------------------------------------------------------

    def _render_section_2_audio(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 2:
          1. Peak VU Bar with logarithmic smoothing
          2. Master Volume Bar with [MUTED] detection
          3. App Session Volume Bar with process mute detection
        """
        x, y, w, h = 8, 92, 224, 60
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 3, "2. AUDIO MONITOR & VOLUME", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        # 1. Peak VU Bar
        peak = int(state.get("audio_peak_pct", int(min(1.0, max(0.0, self.smoothed_peak)) * 100)))
        draw_shadow_text(self.canvas, x + 6, y + 16, "Peak", ("Segoe UI", 7), COLOR_TEXT_MUTED)
        self.canvas.create_rectangle(x + 38, y + 18, x + 182, y + 22, fill=COLOR_CARD_BORDER, outline="")
        peak_fill = COLOR_EMERALD if peak > 5 else COLOR_TEXT_MUTED
        if peak > 0:
            self.canvas.create_rectangle(
                x + 38, y + 18, x + 38 + int(144 * (peak / 100.0)), y + 22, fill=peak_fill, outline=""
            )
        draw_shadow_text(
            self.canvas, x + w - 6, y + 15, f"{peak}%", ("Segoe UI", 7), COLOR_TEXT_PRIMARY, anchor="ne"
        )

        # 2. Master Volume Bar
        m_vol = int(state.get("master_volume_pct", state.get("audio_volume", 100)))
        m_mute = bool(state.get("master_muted", state.get("is_muted", False)))
        draw_shadow_text(self.canvas, x + 6, y + 29, "Master", ("Segoe UI", 7), COLOR_TEXT_MUTED)
        self.canvas.create_rectangle(x + 38, y + 31, x + 182, y + 35, fill=COLOR_CARD_BORDER, outline="")
        m_color = COLOR_VIOLET if m_mute else COLOR_CYAN
        if m_vol > 0:
            self.canvas.create_rectangle(
                x + 38, y + 31, x + 38 + int(144 * (m_vol / 100.0)), y + 35, fill=m_color, outline=""
            )
        m_tag = "[MUTED]" if m_mute else f"{m_vol}%"
        draw_shadow_text(
            self.canvas, x + w - 6, y + 28, m_tag, ("Segoe UI", 7, "bold"), m_color, anchor="ne"
        )

        # 3. App Session Volume Bar
        a_vol = int(state.get("app_volume_pct", state.get("session_volume_percent", 100)))
        a_mute = bool(state.get("app_muted", False))
        draw_shadow_text(self.canvas, x + 6, y + 42, "App", ("Segoe UI", 7), COLOR_TEXT_MUTED)
        self.canvas.create_rectangle(x + 38, y + 44, x + 182, y + 48, fill=COLOR_CARD_BORDER, outline="")
        a_color = COLOR_VIOLET if a_mute else COLOR_EMERALD
        if a_vol > 0:
            self.canvas.create_rectangle(
                x + 38, y + 44, x + 38 + int(144 * (a_vol / 100.0)), y + 48, fill=a_color, outline=""
            )
        if a_mute:
            a_tag = "[MUTED]" if a_vol == 0 else f"{a_vol}% [M]"
        else:
            a_tag = f"{a_vol}%"
        draw_shadow_text(
            self.canvas, x + w - 6, y + 41, a_tag, ("Segoe UI", 7, "bold"), a_color, anchor="ne"
        )

    # --------------------------------------------------------------------------
    # Section 3: Watch Timers (y: 156..212, Height: 56px)
    # --------------------------------------------------------------------------

    def _render_section_3_timers(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 3:
          - Cur Video: Continuous playback duration for active video
          - Day Total: Cumulative video watch time recorded today
          - Paused For: Continuous elapsed time since paused
          - Silence: Active video duration playing while muted or silent
        """
        x, y, w, h = 8, 156, 224, 56
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 4, "3. WATCH TIMERS", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        # Cur Video & Day Total
        cur_sec = int(state.get("cur_video_seconds", state.get("continuous_play_seconds", 0)))
        day_sec = int(state.get("day_watch_seconds_today", state.get("today_watch_seconds", 0)))
        draw_shadow_text(
            self.canvas, x + 6, y + 19, f"Cur: {cur_sec // 3600:02d}h {(cur_sec % 3600) // 60:02d}m", ("Segoe UI", 8), COLOR_EMERALD
        )
        draw_shadow_text(
            self.canvas, x + w - 6, y + 19, f"Day: {day_sec // 3600:02d}h {(day_sec % 3600) // 60:02d}m", ("Segoe UI", 8), COLOR_CYAN, anchor="ne"
        )

        # Paused For & Silence
        pause_sec = int(state.get("paused_seconds", state.get("continuous_pause_seconds", 0)))
        silence_sec = int(state.get("silence_seconds", 0))
        draw_shadow_text(
            self.canvas, x + 6, y + 35, f"Paused: {pause_sec // 60:02d}m {pause_sec % 60:02d}s", ("Segoe UI", 7), COLOR_AMBER
        )
        draw_shadow_text(
            self.canvas, x + w - 6, y + 35, f"Silence: {silence_sec // 60:02d}m {silence_sec % 60:02d}s", ("Segoe UI", 7), COLOR_TEXT_MUTED, anchor="ne"
        )

    # --------------------------------------------------------------------------
    # Section 4: Uptime & Ratio (y: 216..272, Height: 56px)
    # --------------------------------------------------------------------------

    def _render_section_4_uptime(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 4: True Active Accounting (Triple-Condition Gate)
          - Total Uptime: Total monitoring time since boot today
          - True Active: Total time satisfying triple condition
          - Total Inactive: Total monitoring time in passive/idle states
          - Split Progress Bar: Proportional True Active Ratio
        """
        x, y, w, h = 8, 216, 224, 56
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 4, "4. UPTIME & RATIO (True Active)", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        tot = int(state.get("total_uptime_seconds_today", 0))
        act = int(state.get("true_active_seconds_today", 0))
        inact = int(state.get("true_inactive_seconds_today", 0))
        ratio = int(round((act / max(1, tot)) * 100)) if tot > 0 else 0

        t_str = f"Tot: {tot // 3600}h {(tot % 3600) // 60}m"
        a_str = f"Act: {act // 3600}h {(act % 3600) // 60}m"
        i_str = f"Inact: {inact // 3600}h {(inact % 3600) // 60}m"
        draw_shadow_text(
            self.canvas, x + 6, y + 19, f"{t_str} | {a_str} | {i_str}", ("Segoe UI", 7), COLOR_TEXT_PRIMARY
        )

        # Split Progress Bar
        bar_x, bar_y, bar_w = x + 6, y + 35, w - 12
        self.canvas.create_rectangle(bar_x, bar_y, bar_x + bar_w, bar_y + 5, fill=COLOR_CARD_BORDER, outline="")
        if ratio > 0:
            self.canvas.create_rectangle(
                bar_x, bar_y, bar_x + int(bar_w * (ratio / 100.0)), bar_y + 5, fill=COLOR_EMERALD, outline=""
            )
        draw_shadow_text(
            self.canvas, x + 6, y + 42, f"{ratio}% True Active Ratio", ("Segoe UI", 7), COLOR_EMERALD
        )

    # --------------------------------------------------------------------------
    # Section 5: Daily Event Counters (y: 276..326, Height: 50px)
    # --------------------------------------------------------------------------

    def _render_section_5_events(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 5: High-density 6-cell analytical badge matrix tracking daily micro-events:
          Plays, Pauses, Mutes, Fullscreen, Window/PIP, Minimized
        """
        x, y, w, h = 8, 276, 224, 50
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 3, "5. DAILY EVENT COUNTERS", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        ev = state.get("daily_event_counts") or {}
        line1 = f"Plays: {ev.get('plays', 0)}  Pauses: {ev.get('pauses', 0)}  Mutes: {ev.get('mutes', 0)}"
        draw_shadow_text(self.canvas, x + 6, y + 17, line1, ("Segoe UI", 7), COLOR_CYAN)

        line2 = f"Fullscreen: {ev.get('fullscreen', 0)}  Win/PIP: {ev.get('window_pip', 0)}  Min: {ev.get('minimized', 0)}"
        draw_shadow_text(self.canvas, x + 6, y + 31, line2, ("Segoe UI", 7), COLOR_TEXT_MUTED)

    # --------------------------------------------------------------------------
    # Section 6: Media Source & Hardware Routing (y: 330..380, Height: 50px)
    # --------------------------------------------------------------------------

    def _render_section_6_routing(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 6:
          - Media Source: Web Stream vs Local File
          - Output Device: Active Windows audio multimedia endpoint
          - Peak Run: Longest uninterrupted single video streak achieved today
        """
        x, y, w, h = 8, 330, 224, 50
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 3, "6. MEDIA SOURCE & ROUTING", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        src = state.get("media_source_tag", state.get("media_source", "Web Stream"))
        peak_streak = int(state.get("peak_run_seconds_today", 0))
        p_str = f"Peak: {peak_streak // 3600:02d}h {(peak_streak % 3600) // 60:02d}m streak"
        draw_shadow_text(self.canvas, x + 6, y + 17, f"Src: {src}", ("Segoe UI", 7), COLOR_TEXT_PRIMARY)
        draw_shadow_text(self.canvas, x + w - 6, y + 17, p_str, ("Segoe UI", 7, "bold"), COLOR_CYAN, anchor="ne")

        dev = state.get("output_device_name", "Speakers")
        if len(dev) > 26:
            dev = dev[:24] + ".."
        draw_shadow_text(self.canvas, x + 6, y + 31, f"Dev: {dev}", ("Segoe UI", 7), COLOR_TEXT_MUTED)

    # --------------------------------------------------------------------------
    # Section 7: Video Motion & Display Specs (y: 384..444, Height: 60px)
    # --------------------------------------------------------------------------

    def _render_section_7_motion(self, state: Dict[str, Any]) -> None:
        """
        Renders Section 7:
          - Video Resolution & Aspect Ratio (e.g. 1920x1080 (16:9))
          - Rendering Cadence (60 FPS Active Motion)
          - View State (100% Visible/Uncovered vs Occluded vs Minimized)
          - Playback Speed multiplier
        """
        x, y, w, h = 8, 384, 224, 60
        self.canvas.create_rectangle(x, y, x + w, y + h, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER)
        draw_shadow_text(
            self.canvas, x + 6, y + 3, "7. VIDEO MOTION & SPECS", ("Segoe UI", 8, "bold"), COLOR_TEXT_PRIMARY
        )

        res = state.get("video_resolution", state.get("resolution", "1920x1080 (16:9)"))
        draw_shadow_text(self.canvas, x + 6, y + 17, f"Res: {res}", ("Segoe UI", 7), COLOR_TEXT_PRIMARY)
        # Dynamic FPS state rather than hardcoded string
        is_vid_active = bool(
            state.get("is_video_playing", False) or
            state.get("state_code") in ("VIDEO_PLAYING", "VIDEO_MUTED") or
            state.get("status") in ("PLAYING", "MUTED")
        )
        raw_fps = state.get("rendering_fps")
        if raw_fps:
            if not raw_fps.startswith("FPS:"):
                if "60 FPS" in raw_fps:
                    fps_str = "FPS: 60 Active Motion"
                elif "0 FPS" in raw_fps:
                    fps_str = "FPS: 0 (Static)"
                else:
                    fps_str = f"FPS: {raw_fps}"
            else:
                fps_str = raw_fps
        else:
            fps_str = "FPS: 60 Active Motion" if is_vid_active else "FPS: 0 (Static)"

        fps_color = COLOR_EMERALD if is_vid_active else COLOR_TEXT_MUTED
        draw_shadow_text(
            self.canvas, x + w - 6, y + 17, fps_str, ("Segoe UI", 7), fps_color, anchor="ne"
        )

        view = state.get("view_state", "100% Visible/Uncovered")
        spd = f"{float(state.get('playback_speed', 1.0)):.2f}x Speed"
        draw_shadow_text(self.canvas, x + 6, y + 33, f"View: {view}", ("Segoe UI", 7), COLOR_CYAN)
        draw_shadow_text(self.canvas, x + w - 6, y + 33, spd, ("Segoe UI", 7), COLOR_TEXT_MUTED, anchor="ne")

    # --------------------------------------------------------------------------
    # Master Render Dispatcher (Double-Buffered Tkinter Canvas)
    # --------------------------------------------------------------------------

    def render(self, state: Dict[str, Any], mode: int) -> None:
        """
        Master render dispatcher executing complete canvas reconstruction.
        Clears previous elements, re-registers click targets, and renders corresponding mode.
        """
        self.canvas.delete("all")
        self._click_targets.clear()

        # Outer canvas border
        h = MODE_HEIGHTS.get(mode, MODE_HEIGHTS[MODE_MINI])
        self.canvas.create_rectangle(
            1, 1, 239, h - 1,
            fill=COLOR_BG_DARK,
            outline=COLOR_CARD_BORDER,
            width=1
        )

        if mode == MODE_COLLAPSE:
            self.render_collapse_pill(state)
        elif mode == MODE_MINI:
            self._render_title_bar(state, is_mini=True)
            self._render_dynamic_section_1(state)
        else:  # MODE_NORMAL
            self._render_title_bar(state, is_mini=False)
            self._render_dynamic_section_1(state)
            self._render_section_2_audio(state)
            self._render_section_3_timers(state)
            self._render_section_4_uptime(state)
            self._render_section_5_events(state)
            self._render_section_6_routing(state)
            self._render_section_7_motion(state)

    # --------------------------------------------------------------------------
    # Backward Compatibility Aliases
    # --------------------------------------------------------------------------

    def render_expanded_card(self, state: Dict[str, Any]) -> None:
        """Backward-compatible alias for rendering expanded mode."""
        self.render(state, MODE_NORMAL)

    def render_mini_pill(self, state: Dict[str, Any]) -> None:
        """Backward-compatible alias for rendering collapse mode."""
        self.render(state, MODE_COLLAPSE)
