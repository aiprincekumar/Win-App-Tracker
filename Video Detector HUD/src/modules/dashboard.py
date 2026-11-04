# -*- coding: utf-8 -*-
"""
modules/dashboard.py: ANSI Terminal UI, Card Renderer, and Status Formatter.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

from typing import Dict, Any, List, Optional

from .config import (
    C_RESET,
    C_BOLD,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_GRAY,
    is_system_ignored_title
)


def _clean_title(title: str, max_len: int = 42) -> str:
    """Cleans and truncates title cleanly to maintain a fixed-width clutter-free card."""
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


def extract_simplified_media_info(raw_eval: Dict[str, Any], idle_seconds: float = 0.0, idle_threshold: float = 60.0) -> Dict[str, Any]:
    """
    Extracts strictly the user-requested simplified fields from the raw evaluation:
      - Video Playing: YES (हाँ) / NO (ना)
      - Media Type: VIDEO / AUDIO / NONE
      - Playback State: PLAYING / PAUSED / STOPPED
      - Active Player / App
      - Media Title
      - Audio Peak Meter: percentage & level
      - Continuous Play Duration (HH:MM:SS)
      - Continuous Pause Duration (HH:MM:SS)
      - 60m Historical Activity Buffer
      - Is Video Playing? : TRUE / FALSE
      - Is Windows Idle?  : TRUE / FALSE

    60-Second Inactivity Timer Lock Rule:
      - When Video is PLAYING:
        * Is Video Playing? : TRUE
        * Is Windows Idle?  : FALSE
      - When Video is NOT PLAYING (paused, stopped, or pure audio playing):
        * Is Video Playing? : FALSE
        * While idle_seconds < idle_threshold (e.g. < 60.0s): Is Windows Idle? MUST REMAIN FALSE!
        * Only when idle_seconds >= idle_threshold (100% threshold reached): Is Windows Idle? becomes TRUE!
    """
    media = raw_eval.get("media_candidates", {})
    active_videos = media.get("active_videos", [])
    paused_videos = media.get("paused_videos", [])
    pure_audio = media.get("pure_audio", [])
    empty_players = media.get("empty_players", [])

    is_threshold_met = (idle_seconds >= idle_threshold) if idle_threshold > 0 else True

    audio_peak = float(raw_eval.get("audio_peak", raw_eval.get("wasapi", {}).get("master_peak", 0.0)))
    cont_play = float(raw_eval.get("continuous_play_seconds", 0.0))
    cont_pause = float(raw_eval.get("continuous_pause_seconds", 0.0))
    history_60m = raw_eval.get("activity_history_60m", [])

    # Case 1: Active Video Playback (Peak audio > 0 with video candidate)
    if active_videos:
        top = active_videos[0]
        return {
            "video_playing": True,
            "media_type": "VIDEO",
            "playback_state": "PLAYING",
            "active_player": top.get("app_name", top.get("process", "Video Player")),
            "platform_tag": top.get("platform_tag", "Generic Player"),
            "media_title": _clean_title(top.get("title", "Video Stream")),
            "is_video_playing": True,
            "is_windows_idle": False,
            "audio_peak": top.get("audio_peak", audio_peak),
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": history_60m
        }

    # Case 2: Pure Audio is actively streaming sound (Modern Media Player, VLC MP3, Spotify, YouTube Music)
    streaming_audio = [a for a in pure_audio if a.get("audio_active")]
    if streaming_audio:
        top = streaming_audio[0]
        return {
            "video_playing": False,
            "media_type": "AUDIO",
            "playback_state": "PLAYING",
            "active_player": top.get("app_name", top.get("process", "Audio Player")),
            "platform_tag": top.get("platform_tag", "Generic Player"),
            "media_title": _clean_title(top.get("title", "Audio Track")),
            "is_video_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": top.get("audio_peak", audio_peak),
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": history_60m
        }

    # Case 3: Video is open but paused or silent
    if paused_videos:
        top = paused_videos[0]
        return {
            "video_playing": False,
            "media_type": "VIDEO",
            "playback_state": "PAUSED",
            "active_player": top.get("app_name", top.get("process", "Video Player")),
            "platform_tag": top.get("platform_tag", "Generic Player"),
            "media_title": _clean_title(top.get("title", "Video")),
            "is_video_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": audio_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": history_60m
        }

    # Case 4: Pure audio app open but silent / paused
    if pure_audio:
        top = pure_audio[0]
        return {
            "video_playing": False,
            "media_type": "AUDIO",
            "playback_state": "PAUSED",
            "active_player": top.get("app_name", top.get("process", "Audio Player")),
            "platform_tag": top.get("platform_tag", "Generic Player"),
            "media_title": _clean_title(top.get("title", "Audio")),
            "is_video_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": audio_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": history_60m
        }

    # Case 5: Media player open but no file loaded
    if empty_players:
        top = empty_players[0]
        return {
            "video_playing": False,
            "media_type": "NONE",
            "playback_state": "STOPPED",
            "active_player": top.get("app_name", top.get("process", "Media Player")),
            "platform_tag": "None",
            "media_title": "None",
            "is_video_playing": False,
            "is_windows_idle": is_threshold_met,
            "audio_peak": audio_peak,
            "continuous_play_seconds": cont_play,
            "continuous_pause_seconds": cont_pause,
            "activity_history_60m": history_60m
        }

    # Case 6: No media player or candidate running
    return {
        "video_playing": False,
        "media_type": "NONE",
        "playback_state": "STOPPED",
        "active_player": "None",
        "platform_tag": "None",
        "media_title": "None",
        "is_video_playing": False,
        "is_windows_idle": is_threshold_met,
        "audio_peak": audio_peak,
        "continuous_play_seconds": cont_play,
        "continuous_pause_seconds": cont_pause,
        "activity_history_60m": history_60m
    }


def render_simple_card(data: Dict[str, Any], in_place: bool = False) -> str:
    """
    Renders a clean, clutter-free, fixed-size card strictly containing the user's requested fields:
      - Video Playing: YES (हाँ) / NO (ना)
      - Media Type: VIDEO / AUDIO / NONE
      - Playback State: PLAYING / PAUSED / STOPPED
      - Active Player / App
      - Media Title
      - Continuous Play Duration (00:15:42)
      - Continuous Pause Duration (00:01:23)
      - Audio Peak Meter: [██████░░░░░░░░] 42%
      - 60s Idle Timer & Progress Bar: Xs / 60s [██████░░░░░░] XX%
      - 60m Activity Graph: [■■■■░░░░■■■■░░░░]
      - Final Verdicts: Is Video Playing? : TRUE / FALSE | Is Windows Idle? : TRUE / FALSE
    """
    v_playing    = data.get("video_playing", False)
    m_type       = data.get("media_type", "NONE")
    p_state      = data.get("playback_state", "STOPPED")
    app_name     = data.get("active_player", "None")
    title        = data.get("media_title", "None")
    idle_sec     = data.get("idle_seconds", 0.0)
    threshold    = data.get("idle_threshold", 60.0)
    is_v_playing = data.get("is_video_playing", False)
    is_idle      = data.get("is_windows_idle", True)

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

    if v_playing and play_sec > 0:
        play_str = f"{C_GREEN}{C_BOLD}{play_hms}{C_RESET}"
    else:
        play_str = f"{C_GRAY}{play_hms}{C_RESET}"

    if (not v_playing) and pause_sec > 0:
        pause_str = f"{C_YELLOW}{C_BOLD}{pause_hms}{C_RESET}"
    else:
        pause_str = f"{C_GRAY}{pause_hms}{C_RESET}"

    # 4. 60-Second Idle Timer Progress Bar
    bar_width = 24
    pct = min(1.0, max(0.0, idle_sec / threshold if threshold > 0 else 0.0))
    filled = int(round(pct * bar_width))
    bar_chars = "█" * filled + "░" * (bar_width - filled)
    pct_int = int(pct * 100)

    if v_playing:
        timer_str = f"{C_RED}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}]   0% (RESET - VIDEO ACTIVE){C_RESET}"
    elif pct >= 1.0:
        timer_str = f"{C_GREEN}{threshold:4.1f}s / {threshold:.0f}s [{bar_chars}] 100% (IDLE THRESHOLD MET){C_RESET}"
    else:
        timer_str = f"{C_CYAN}{idle_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}%{C_RESET}"

    # 5. 60-Minute Historical Activity Graph / Timeline Bar
    history = data.get("activity_history_60m", [])
    activity_str = render_activity_timeline(history, bar_width=30)

    # Field Badges
    v_color = f"{C_BOLD}{C_RED}YES (हाँ){C_RESET}" if v_playing else f"{C_BOLD}{C_GREEN}NO (ना){C_RESET}"

    if m_type == "VIDEO":
        m_color = f"{C_RED}{C_BOLD}VIDEO{C_RESET}"
    elif m_type == "AUDIO":
        m_color = f"{C_YELLOW}{C_BOLD}AUDIO{C_RESET}"
    else:
        m_color = f"{C_GRAY}NONE{C_RESET}"

    if p_state == "PLAYING":
        s_color = f"{C_GREEN}{C_BOLD}PLAYING{C_RESET}"
    elif p_state == "PAUSED":
        s_color = f"{C_YELLOW}{C_BOLD}PAUSED{C_RESET}"
    else:
        s_color = f"{C_GRAY}STOPPED{C_RESET}"

    ivp_color = f"{C_BOLD}{C_RED}TRUE{C_RESET}" if is_v_playing else f"{C_BOLD}{C_GREEN}FALSE{C_RESET}"
    iwi_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_idle else f"{C_BOLD}{C_RED}FALSE{C_RESET}"

    lines = [
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"{C_BOLD}             WINDOWS VIDEO INACTIVITY SENTINEL (आइडल वीडियो डिटेक्टर){C_RESET}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"  Video Playing       : {v_color}",
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
        f"  Is Video Playing?   : {ivp_color}",
        f"  Is Windows Idle?    : {iwi_color}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
    ]

    if in_place:
        lines.append(f"{C_GRAY}  Live monitoring active | Press Ctrl+C to stop{C_RESET}")
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)

