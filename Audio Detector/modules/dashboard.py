# -*- coding: utf-8 -*-
"""
dashboard.py: Fixed-Width ANSI In-Place Dashboard Card & Visual Progress Bar.

Renders:
  1. Audio Playing       : YES (हाँ) / NO (ना)
  2. Media Type          : VIDEO / AUDIO / NONE
  3. Playback State      : PLAYING / PAUSED / STOPPED
  4. Active Player / App : (e.g. Google Chrome, Windows Media Player)
  5. Media Title         : currently playing track or video name
  6. Continuous Play     : HH:MM:SS
  7. Continuous Pause    : HH:MM:SS
  8. Audio Peak Meter    : [████████░░░░░░░░] 42%
  9. 60s Idle Timer      : Xs / 60s [██████░░░░░░] XX%
  10. 60m Activity Graph : [■■■■░░░░■■■■░░░░]
  11. Is Audio Playing?  : TRUE / FALSE
  12. Is Windows Idle?   : TRUE / FALSE

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker/windows_audio_detector/core
"""

from typing import Dict, Any, List, Optional

from .constants import is_system_ignored_title

# ANSI Color Codes
C_RESET  = "\033[0m"
C_BOLD   = "\033[1m"
C_RED    = "\033[91m"
C_GREEN  = "\033[92m"
C_YELLOW = "\033[93m"
C_CYAN   = "\033[96m"
C_GRAY   = "\033[90m"


def _clean_title(title: Optional[str], max_len: int = 42) -> str:
    """Cleans and truncates title cleanly to maintain a fixed-width card."""
    if not title:
        return "None"
    s = title.strip()
    if not s or s.lower() == "none" or is_system_ignored_title(s):
        return "None"
    if len(s) > max_len:
        return s[:max_len - 3] + "..."
    return s


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

    # Build ANSI-colored bar
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


def make_progress_bar(ratio: float, length: int = 10) -> str:
    """Generates visual progress bar e.g. [████████░░]."""
    clamped = max(0.0, min(1.0, ratio))
    filled_len = int(round(clamped * length))
    empty_len = length - filled_len
    return ("█" * filled_len) + ("░" * empty_len)


def render_live_line(
    is_audio: bool,
    audio_title: str,
    player_name: str,
    bar_str: str,
    elapsed_str: str
) -> str:
    """
    Formats the live status line strictly according to user requirements.
    When Audio is playing:
      Audio is playing | Audio: <Audio Title/File> | Player: <Player App Name> | Refresh: [<Progress Bar>] <Elapsed>s
    When Video is playing or Silent (Idle):
      [Idle / Video Ignored] | Waiting for audio... | Refresh: [<Progress Bar>] <Elapsed>s
    """
    if is_audio:
        clean_title = audio_title or "Active Audio Stream"
        if len(clean_title) > 35:
            clean_title = clean_title[:32] + "..."
        clean_player = player_name or "Unknown Player"
        if len(clean_player) > 20:
            clean_player = clean_player[:17] + "..."
        return f"Audio is playing | Audio: {clean_title} | Player: {clean_player} | Refresh: [{bar_str}] {elapsed_str}"
    else:
        return f"[Idle / Video Ignored] | Waiting for audio... | Refresh: [{bar_str}] {elapsed_str}"


def render_dashboard_card(data: Dict[str, Any], in_place: bool = False) -> str:
    """
    Renders the fixed-width clutter-free ANSI dashboard card:
      1. Audio Playing       : YES (हाँ) / NO (ना)
      2. Media Type          : VIDEO / AUDIO / NONE
      3. Playback State      : PLAYING / PAUSED / STOPPED
      4. Active Player / App : Friendly app name or None
      5. Media Title         : Currently playing track or video name, or None
      6. Continuous Play     : HH:MM:SS
      7. Continuous Pause    : HH:MM:SS
      8. Audio Peak Meter    : [████████░░░░░░░░] 42%
      9. 60s Idle Timer      : Xs / 60s [██████░░░░░░] XX%
      10. 60m Activity Graph : [■■■■░░░░■■■■░░░░]
      11. Is Audio Playing?  : TRUE / FALSE
      12. Is Windows Idle?   : TRUE / FALSE (TRUE only when 60s Idle Timer reaches 60s / 100%)
    """
    a_playing    = data.get("audio_playing", False)
    m_type       = data.get("media_type", "NONE")
    p_state      = data.get("playback_state", "STOPPED")
    app_name     = data.get("active_player", "None")
    title        = data.get("media_title", "None")
    idle_sec     = data.get("idle_seconds", 0.0)
    threshold    = data.get("idle_threshold", 60.0)
    is_a_playing = data.get("is_audio_playing", False)
    is_idle      = data.get("is_windows_idle", False)

    # 1. Audio Peak Meter
    peak = min(1.0, max(0.0, float(data.get("audio_peak", 0.0))))
    peak_width = 16
    peak_filled = int(round(peak * peak_width))
    peak_chars = "█" * peak_filled + "░" * (peak_width - peak_filled)
    peak_pct = int(round(peak * 100))
    if peak > 0.0001:
        peak_str = f"{C_GREEN}[{peak_chars}]{C_RESET} {C_BOLD}{peak_pct:2d}%{C_RESET}"
    else:
        peak_str = f"{C_GRAY}[{peak_chars}]  0%{C_RESET}"

    # 2 & 3. Continuous Play & Pause Durations
    play_sec = float(data.get("continuous_play_seconds", 0.0))
    pause_sec = float(data.get("continuous_pause_seconds", 0.0))
    play_hms = format_duration(play_sec)
    pause_hms = format_duration(pause_sec)

    if a_playing and play_sec > 0:
        play_str = f"{C_GREEN}{C_BOLD}{play_hms}{C_RESET}"
    else:
        play_str = f"{C_GRAY}{play_hms}{C_RESET}"

    if (not a_playing) and pause_sec > 0:
        pause_str = f"{C_YELLOW}{C_BOLD}{pause_hms}{C_RESET}"
    else:
        pause_str = f"{C_GRAY}{pause_hms}{C_RESET}"

    # 4. 60-Second Idle Timer Progress Bar
    bar_width = 24
    pct = min(1.0, max(0.0, idle_sec / threshold if threshold > 0 else 0.0))
    filled = int(round(pct * bar_width))
    bar_chars = "█" * filled + "░" * (bar_width - filled)
    pct_int = int(pct * 100)

    if a_playing:
        timer_str = f"{C_RED}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}]   0% (RESET - AUDIO ACTIVE){C_RESET}"
    elif pct >= 1.0:
        timer_str = f"{C_GREEN}{threshold:4.1f}s / {threshold:.0f}s [{bar_chars}] 100% (IDLE THRESHOLD MET){C_RESET}"
    else:
        timer_str = f"{C_CYAN}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}%{C_RESET}"

    # 5. 60-Minute Historical Activity Graph / Timeline Bar
    history = data.get("activity_history_60m", [])
    activity_str = render_activity_timeline(history, bar_width=30)

    # Field Badges
    audio_color = f"{C_BOLD}{C_GREEN}YES (हाँ){C_RESET}" if a_playing else f"{C_BOLD}{C_RED}NO (ना){C_RESET}"

    if m_type == "AUDIO":
        m_color = f"{C_GREEN}{C_BOLD}AUDIO{C_RESET}"
    elif m_type == "VIDEO":
        m_color = f"{C_YELLOW}{C_BOLD}VIDEO{C_RESET}"
    else:
        m_color = f"{C_GRAY}NONE{C_RESET}"

    if p_state == "PLAYING":
        s_color = f"{C_GREEN}{C_BOLD}PLAYING{C_RESET}"
    elif p_state == "PAUSED":
        s_color = f"{C_YELLOW}{C_BOLD}PAUSED{C_RESET}"
    else:
        s_color = f"{C_GRAY}STOPPED{C_RESET}"

    iap_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_a_playing else f"{C_BOLD}{C_RED}FALSE{C_RESET}"
    iwi_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_idle else f"{C_BOLD}{C_RED}FALSE{C_RESET}"

    lines = [
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"{C_BOLD}             WINDOWS AUDIO INACTIVITY SENTINEL (आइडल ऑडियो डिटेक्टर){C_RESET}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"  Audio Playing       : {audio_color}",
        f"  Media Type          : {m_color}",
        f"  Playback State      : {s_color}",
        f"  Active Player / App : {C_BOLD}{app_name}{C_RESET}",
        f"  Media Title         : {title}",
        f"  Continuous Play     : {play_str}",
        f"  Continuous Pause    : {pause_str}",
        f"  Audio Peak Meter    : {peak_str}",
        f"  60s Idle Timer      : {timer_str}",
        f"  60m Activity Graph  : {activity_str}",
        f"{C_CYAN}----------------------------------------------------------------------{C_RESET}",
        f"  Is Audio Playing?   : {iap_color}",
        f"  Is Windows Idle?    : {iwi_color}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
    ]

    if in_place:
        lines.append(f"{C_GRAY}  Live monitoring active | Press Ctrl+C to stop{C_RESET}")
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)


render_simple_card = render_dashboard_card

__all__ = [
    "C_RESET",
    "C_BOLD",
    "C_RED",
    "C_GREEN",
    "C_YELLOW",
    "C_CYAN",
    "C_GRAY",
    "_clean_title",
    "format_duration",
    "render_activity_timeline",
    "make_progress_bar",
    "render_live_line",
    "render_dashboard_card",
    "render_simple_card",
]
