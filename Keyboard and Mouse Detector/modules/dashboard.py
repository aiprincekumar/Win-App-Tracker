# -*- coding: utf-8 -*-
"""
dashboard.py: ANSI Terminal Card & 60m Activity Graph Rendering.
Department 04: UI/UX Design System & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

from typing import Dict, List, Optional, Any
from .config import (
    C_RESET,
    C_BOLD,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY
)


def format_duration(seconds: float) -> str:
    """Formats duration in seconds into fixed-width HH:MM:SS format."""
    total_sec = int(max(0.0, seconds))
    h = total_sec // 3600
    m = (total_sec % 3600) // 60
    s = total_sec % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


def render_activity_timeline(history: Optional[List[Any]], bar_width: int = 30) -> str:
    """
    Renders a simple, clean 60-minute historical activity graph / timeline bar.
    Shows activity blocks [■■■■░░░░■■■■░░░░] displaying active vs inactive minutes.
    """
    if not history:
        history = [0] * 60
    elif len(history) < 60:
        history = [0] * (60 - len(history)) + list(history)
    else:
        history = list(history[-60:])

    ratio = len(history) / float(bar_width)
    blocks = []
    for i in range(bar_width):
        start_idx = int(i * ratio)
        end_idx = max(start_idx + 1, int((i + 1) * ratio))
        sub = history[start_idx:end_idx]
        is_active = any(bool(x) for x in sub)
        blocks.append("active" if is_active else "idle")

    rendered_parts = []
    current_state = None
    accum = []
    for b in blocks:
        if b != current_state:
            if accum:
                if current_state == "active":
                    rendered_parts.append(f"{C_GREEN}{''.join(accum)}{C_RESET}")
                else:
                    rendered_parts.append(f"{C_GRAY}{''.join(accum)}{C_RESET}")
                accum = []
            current_state = b
        accum.append("■" if b == "active" else "░")

    if accum:
        if current_state == "active":
            rendered_parts.append(f"{C_GREEN}{''.join(accum)}{C_RESET}")
        else:
            rendered_parts.append(f"{C_GRAY}{''.join(accum)}{C_RESET}")

    bar_core = "".join(rendered_parts)
    return f"{C_CYAN}[{C_RESET}{bar_core}{C_CYAN}]{C_RESET}"


def render_simple_card(data: Dict[str, Any], in_place: bool = False) -> str:
    """
    Renders a clean, clutter-free, fixed-size card matching the sentinel standard:
      - User Active         : YES (हाँ) / NO (ना)
      - Input Source        : Physical Keyboard / Mouse (Win32 API)
      - Activity State      : ACTIVE / INACTIVE / IDLE
      - Input Status        : Active (...) / Inactive (...)
      - Continuous Active   : HH:MM:SS
      - Continuous Inactive : HH:MM:SS
      - Input Activity Meter: [████████░░░░░░░░] 50%
      - 60s Idle Timer      : Xs / 60s [██████░░░░░░] XX%
      - 60m Activity Graph  : [■■■■░░░░■■■■░░░░]
      - Is User Active?     : TRUE / FALSE
      - Is Windows Idle?    : TRUE / FALSE (60s lock)
    """
    u_active     = data.get("user_active", False)
    u_state      = data.get("activity_state", "IDLE")
    status_str   = data.get("input_status", "None")
    idle_sec     = float(data.get("user_idle_seconds", 0.0))
    threshold    = float(data.get("idle_threshold", 60.0))
    is_u_active  = data.get("is_user_active", False)
    is_idle      = data.get("is_windows_idle", False)

    # 1. Continuous Active & Inactive Durations
    act_sec = float(data.get("continuous_active_seconds", 0.0))
    inact_sec = float(data.get("continuous_inactive_seconds", 0.0))
    act_hms = format_duration(act_sec)
    inact_hms = format_duration(inact_sec)

    if u_active and act_sec > 0:
        act_str = f"{C_GREEN}{C_BOLD}{act_hms}{C_RESET}"
    else:
        act_str = f"{C_GRAY}{act_hms}{C_RESET}"

    if (not u_active) and inact_sec > 0:
        inact_str = f"{C_YELLOW}{C_BOLD}{inact_hms}{C_RESET}"
    else:
        inact_str = f"{C_GRAY}{inact_hms}{C_RESET}"

    # 2. Input Activity Responsiveness Meter (16 chars)
    meter = min(1.0, max(0.0, float(data.get("input_activity_meter", 0.0))))
    meter_width = 16
    meter_filled = int(round(meter * meter_width))
    meter_chars = "█" * meter_filled + "░" * (meter_width - meter_filled)
    meter_pct = int(round(meter * 100))
    if meter > 0.0:
        meter_str = f"{C_GREEN}[{meter_chars}]{C_RESET} {C_BOLD}{meter_pct:2d}%{C_RESET}"
    else:
        meter_str = f"{C_GRAY}[{meter_chars}]  0%{C_RESET}"

    # 3. 60-Second Idle Timer Progress Bar (24 chars)
    bar_width = 24
    pct = min(1.0, max(0.0, idle_sec / threshold if threshold > 0 else 0.0))
    filled = int(round(pct * bar_width))
    bar_chars = "█" * filled + "░" * (bar_width - filled)
    pct_int = int(pct * 100)

    if u_active:
        timer_str = f"{C_RED}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}]   0% (RESET - INPUT ACTIVE){C_RESET}"
    elif pct >= 1.0:
        timer_str = f"{C_GREEN}{threshold:4.1f}s / {threshold:.0f}s [{bar_chars}] 100% (IDLE THRESHOLD MET){C_RESET}"
    else:
        timer_str = f"{C_CYAN}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}%{C_RESET}"

    # 4. 60-Minute Activity Graph (30 chars)
    history = data.get("activity_history_60m", [])
    activity_str = render_activity_timeline(history, bar_width=30)

    # Badges
    u_color = f"{C_BOLD}{C_GREEN}YES (हाँ){C_RESET}" if u_active else f"{C_BOLD}{C_RED}NO (ना){C_RESET}"

    # Dynamic Input Source Badging with ANSI Colors
    source_str = data.get("input_source", "None (कोई इनपुट नहीं)")
    source_raw = data.get("input_source_raw", "NONE")

    if source_raw in ("KEYBOARD", "MOUSE", "KEYBOARD_AND_MOUSE") or u_active:
        source_disp = f"{C_BOLD}{C_GREEN}{source_str}{C_RESET}"
    else:
        source_disp = f"{C_GRAY}{source_str}{C_RESET}"

    if u_state == "ACTIVE":
        s_color = f"{C_GREEN}{C_BOLD}ACTIVE{C_RESET}"
    elif u_state == "INACTIVE":
        s_color = f"{C_YELLOW}{C_BOLD}INACTIVE{C_RESET}"
    else:
        s_color = f"{C_GRAY}IDLE{C_RESET}"

    # Truncate status string cleanly
    if len(status_str) > 48:
        status_disp = status_str[:45] + "..."
    else:
        status_disp = status_str

    iua_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_u_active else f"{C_BOLD}{C_RED}FALSE{C_RESET}"
    iwi_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_idle else f"{C_BOLD}{C_RED}FALSE{C_RESET}"

    lines = [
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"{C_BOLD}     WINDOWS KEYBOARD & MOUSE INACTIVITY SENTINEL (कीबोर्ड और माउस){C_RESET}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"  User Active         : {u_color}",
        f"  Input Source        : {source_disp}",
        f"  Activity State      : {s_color}",
        f"  Input Status        : {status_disp}",
        f"  Continuous Active   : {act_str}",
        f"  Continuous Inactive : {inact_str}",
        f"  Input Activity Meter: {meter_str}",
        f"  60s Idle Timer      : {timer_str}",
        f"  60m Activity Graph  : {activity_str}",
        f"{C_CYAN}----------------------------------------------------------------------{C_RESET}",
        f"  Is User Active?     : {iua_color}",
        f"  Is Windows Idle?    : {iwi_color}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
    ]

    if in_place:
        lines.append(f"{C_GRAY}  Live monitoring active | Press Ctrl+C to stop{C_RESET}")
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)
