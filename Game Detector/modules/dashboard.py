# -*- coding: utf-8 -*-
"""
dashboard.py: Strict 8-Field Terminal UI, In-Place Zero-Scroll Card Renderer & Visual Timeline.
Department 04: UI/UX Design System & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
from typing import Dict, Any, Optional, List

from .config import (
    C_RESET,
    C_BOLD,
    C_DIM,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY,
    C_BG_GREEN,
    C_BG_CYAN,
    C_BG_GRAY,
    enable_windows_vt_mode
)
from .engine import (
    GameInfo,
    classify_game_genre,
    detect_active_player,
    _clean_title
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
    Shows activity blocks [■■■■░░░░■■■■░░░░] displaying play vs paused intervals.
    """
    if not history:
        history = [0.0] * 60
    elif len(history) < 60:
        history = [0.0] * (60 - len(history)) + list(history)
    else:
        history = list(history[-60:])

    ratio = len(history) / float(bar_width)
    blocks = []
    for i in range(bar_width):
        start_idx = int(i * ratio)
        end_idx = max(start_idx + 1, int((i + 1) * ratio))
        sub = history[start_idx:end_idx]
        is_active = any(bool(x > 0.0 if isinstance(x, (int, float)) else x) for x in sub)
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


def extract_simplified_game_info(
    raw_eval: Dict[str, Any],
    idle_seconds: float = 0.0,
    idle_threshold: float = 60.0,
    audio_peak: Optional[float] = None,
    continuous_play_seconds: Optional[float] = None,
    continuous_pause_seconds: Optional[float] = None,
    activity_history_60m: Optional[List[float]] = None
) -> Dict[str, Any]:
    """Extracts simplified game information and operational metrics."""
    p_state = raw_eval.get("playback_state", "STOPPED")
    game: Optional[GameInfo] = raw_eval.get("game")
    is_video_active: bool = raw_eval.get("is_video_active", False)

    is_g_playing = (p_state == "PLAYING")
    is_threshold_met = (idle_seconds >= idle_threshold) if idle_threshold > 0 else True

    game_playing = is_g_playing
    game_type = classify_game_genre(game, is_video_active=is_video_active)
    playback_state = p_state
    active_player = detect_active_player(game)

    if game and p_state in ("PLAYING", "PAUSED"):
        game_title = _clean_title(game.name)
    else:
        game_title = "None"

    if continuous_play_seconds is None:
        continuous_play_seconds = float(raw_eval.get("continuous_play_seconds", 0.0))
    if continuous_pause_seconds is None:
        continuous_pause_seconds = float(raw_eval.get("continuous_pause_seconds", 0.0))

    if audio_peak is None:
        audio_peak = float(raw_eval.get("audio_peak", 0.0))

    if activity_history_60m is None:
        activity_history_60m = raw_eval.get("activity_history_60m", [0.0] * 60)

    is_game_playing = is_g_playing
    is_windows_idle = False if is_g_playing else is_threshold_met

    return {
        "game_playing": game_playing,
        "game_type": game_type,
        "playback_state": playback_state,
        "active_player": active_player,
        "game_title": game_title,
        "continuous_play_seconds": continuous_play_seconds,
        "continuous_pause_seconds": continuous_pause_seconds,
        "audio_peak": audio_peak,
        "idle_seconds": idle_seconds,
        "idle_threshold": idle_threshold,
        "activity_history_60m": activity_history_60m,
        "is_game_playing": is_game_playing,
        "is_windows_idle": is_windows_idle
    }


def render_simple_card(data: Dict[str, Any], in_place: bool = False) -> str:
    """Renders a clean, fixed-size card matching the sentinel standard."""
    g_playing    = data.get("game_playing", False)
    g_type       = data.get("game_type", "None")
    p_state      = data.get("playback_state", "STOPPED")
    app_name     = data.get("active_player", "None")
    title        = data.get("game_title", "None")
    idle_sec     = data.get("idle_seconds", 0.0)
    threshold    = data.get("idle_threshold", 60.0)
    is_g_playing = data.get("is_game_playing", False)
    is_idle      = data.get("is_windows_idle", True)

    play_sec = float(data.get("continuous_play_seconds", 0.0))
    pause_sec = float(data.get("continuous_pause_seconds", 0.0))
    play_hms = format_duration(play_sec)
    pause_hms = format_duration(pause_sec)

    if g_playing and play_sec > 0:
        play_str = f"{C_GREEN}{C_BOLD}{play_hms}{C_RESET}"
    else:
        play_str = f"{C_GRAY}{play_hms}{C_RESET}"

    if (not g_playing) and pause_sec > 0:
        pause_str = f"{C_YELLOW}{C_BOLD}{pause_hms}{C_RESET}"
    else:
        pause_str = f"{C_GRAY}{pause_hms}{C_RESET}"

    peak = min(1.0, max(0.0, float(data.get("audio_peak", 0.0))))
    peak_width = 16
    peak_filled = int(round(peak * peak_width))
    peak_chars = "█" * peak_filled + "░" * (peak_width - peak_filled)
    peak_pct = int(round(peak * 100))
    if peak > 0.0001:
        peak_str = f"{C_GREEN}[{peak_chars}]{C_RESET} {C_BOLD}{peak_pct:2d}%{C_RESET}"
    else:
        peak_str = f"{C_GRAY}[{peak_chars}]  0%{C_RESET}"

    bar_width = 24
    pct = min(1.0, max(0.0, idle_sec / threshold if threshold > 0 else 0.0))
    filled = int(round(pct * bar_width))
    bar_chars = "█" * filled + "░" * (bar_width - filled)
    pct_int = int(pct * 100)

    if p_state == "PLAYING":
        timer_str = f"{C_RED}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}]   0% (RESET - GAME ACTIVE){C_RESET}"
    elif pct >= 1.0:
        timer_str = f"{C_GREEN}{threshold:4.1f}s / {threshold:.0f}s [{bar_chars}] 100% (IDLE THRESHOLD MET){C_RESET}"
    else:
        timer_str = f"{C_CYAN}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}%{C_RESET}"

    history = data.get("activity_history_60m", [])
    activity_str = render_activity_timeline(history, bar_width=30)

    g_color = f"{C_BOLD}{C_RED}YES (हाँ){C_RESET}" if g_playing else f"{C_BOLD}{C_GREEN}NO (ना){C_RESET}"

    if g_type != "None" and not g_type.startswith("None"):
        t_color = f"{C_CYAN}{C_BOLD}{g_type}{C_RESET}"
    elif "वीडियो को निष्क्रिय माना जाता है" in g_type:
        t_color = f"{C_YELLOW}{g_type}{C_RESET}"
    else:
        t_color = f"{C_GRAY}None{C_RESET}"

    if p_state == "PLAYING":
        s_color = f"{C_GREEN}{C_BOLD}PLAYING{C_RESET}"
    elif p_state == "PAUSED":
        s_color = f"{C_YELLOW}{C_BOLD}PAUSED{C_RESET}"
    else:
        s_color = f"{C_GRAY}STOPPED{C_RESET}"

    igp_color = f"{C_BOLD}{C_RED}TRUE{C_RESET}" if is_g_playing else f"{C_BOLD}{C_GREEN}FALSE{C_RESET}"
    iwi_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_idle else f"{C_BOLD}{C_RED}FALSE{C_RESET}"

    lines = [
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"{C_BOLD}              WINDOWS GAME INACTIVITY SENTINEL (आइडल गेम डिटेक्टर){C_RESET}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"  Game Playing        : {g_color}",
        f"  Game Type           : {t_color}",
        f"  Playback State      : {s_color}",
        f"  Active Player / App : {C_BOLD}{app_name}{C_RESET}",
        f"  Game Title          : {title}",
        f"  Continuous Play     : {play_str}",
        f"  Continuous Pause    : {pause_str}",
        f"  Audio Peak Meter    : {peak_str}",
        f"  60s Idle Timer      : {timer_str}",
        f"  60m Activity Graph  : {activity_str}",
        f"{C_CYAN}----------------------------------------------------------------------{C_RESET}",
        f"  Is Game Playing?    : {igp_color}",
        f"  Is Windows Idle?    : {iwi_color}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
    ]

    if in_place:
        lines.append(f"{C_GRAY}  Live monitoring active | Refresh: 100ms | Press Ctrl+C to stop{C_RESET}")
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)


__all__ = [
    "format_duration",
    "render_activity_timeline",
    "extract_simplified_game_info",
    "render_simple_card"
]
