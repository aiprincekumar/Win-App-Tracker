# -*- coding: utf-8 -*-
"""
dashboard.py: ANSI Terminal UI & Card Rendering Engine.
Department 02: Systems Engineering & Department 04: UI/UX Standards.

Capabilities:
  - Formats durations into fixed-width HH:MM:SS.
  - Generates 60-minute historical activity timeline bar ([■■■■░░░░■■■■░░░░]).
  - Renders 70-character standardized status card with ANSI color codes.
  - Clean English typography: eliminates missing glyph artifacts and empty brackets ().
  - In-place overwriting support for flicker-free terminal updates.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

from typing import Dict, List, Optional, Any

from .config import (
    C_RESET, C_BOLD, C_RED, C_GREEN,
    C_YELLOW, C_CYAN, C_WHITE, C_GRAY
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
    Shows activity blocks [■■■■░░░░■■■■░░░░] displaying active vs idle minutes.
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
    Renders a clean, fixed-size card matching the standardized sentinel UI:
      - Agent Active        : YES / NO
      - Target Service      : Google AntiGravity Agent & Brain Sessions
      - Agent State         : WORKING / IDLE / WAITING_USER / SETTLING
      - Chat Sessions       : 3 User Chats (2 Active | 1 Inactive) + 1 Subagent
      - Active Session ID   : 6a142f23... (or None)
      - Current Task / Step : Step #14 (Tool: run_command)
      - Continuous Active   : HH:MM:SS
      - Continuous Idle     : HH:MM:SS
      - Brain Silence Time  : Xs (Elapsed since last transcript change)
      - 60s Idle Timer      : Xs / 60s [██████░░░░░░] XX%
      - 60m Activity Graph  : [■■■■░░░░■■■■░░░░]
      - Is Agent Active?    : TRUE / FALSE
      - Is Windows Idle?    : TRUE / FALSE (60s lock)
    """
    a_active     = data.get("agent_active", False)
    a_state      = data.get("agent_state", "IDLE")
    session_id   = data.get("active_session_id", "None")
    cur_task     = data.get("current_task", "None")
    silence_sec  = float(data.get("silence_seconds", 0.0))
    threshold    = float(data.get("idle_threshold", 60.0))
    is_a_active  = data.get("is_agent_active", False)
    is_idle      = data.get("is_windows_idle", False)
    tot_s        = int(data.get("total_sessions", 0))
    act_s        = int(data.get("active_sessions_count", 0))
    inact_s      = int(data.get("inactive_sessions_count", 0))
    u_tot        = int(data.get("user_chats_total", 0))
    u_act        = int(data.get("user_chats_active", 0))
    u_inact      = int(data.get("user_chats_inactive", 0))
    sub_tot      = int(data.get("subagents_total", 0))
    sub_act      = int(data.get("subagents_active", 0))
    sub_inact    = int(data.get("subagents_inactive", 0))

    # 1. Continuous Active & Idle Durations
    act_sec = float(data.get("continuous_active_seconds", 0.0))
    idle_sec = float(data.get("continuous_idle_seconds", 0.0))
    act_hms = format_duration(act_sec)
    idle_hms = format_duration(idle_sec)

    if a_active and act_sec > 0:
        act_str = f"{C_GREEN}{C_BOLD}{act_hms}{C_RESET}"
    else:
        act_str = f"{C_GRAY}{act_hms}{C_RESET}"

    if (not a_active) and idle_sec > 0:
        idle_str = f"{C_YELLOW}{C_BOLD}{idle_hms}{C_RESET}"
    else:
        idle_str = f"{C_GRAY}{idle_hms}{C_RESET}"

    # 2. Chat Sessions Summary Display (Differentiate Root User Chats vs Subagents)
    if u_tot > 0 or sub_tot > 0:
        if sub_act > 0:
            chats_str = f"{u_tot} User Chats ({C_GREEN}{C_BOLD}{u_act} Active{C_RESET} | {C_GRAY}{u_inact} Inactive{C_RESET}) + {C_CYAN}{C_BOLD}{sub_act} Subagent{C_RESET}"
        elif sub_tot > 0:
            chats_str = f"{u_tot} User Chats ({C_GREEN}{C_BOLD}{u_act} Active{C_RESET} | {C_GRAY}{u_inact} Inactive{C_RESET}) + {C_GRAY}{sub_tot} Subagent{C_RESET}"
        else:
            chats_str = f"{u_tot} User Chats ({C_GREEN}{C_BOLD}{u_act} Active{C_RESET} | {C_GRAY}{u_inact} Inactive{C_RESET})"
    elif act_s > 0:
        chats_str = f"{tot_s} Total ({C_GREEN}{C_BOLD}{act_s} Active{C_RESET} | {C_GRAY}{inact_s} Inactive{C_RESET})"
    else:
        chats_str = f"{C_GRAY}{tot_s} Total (0 Active | {inact_s} Inactive){C_RESET}"

    # 3. Brain Silence Display (Clean English - No Empty Brackets)
    if a_state in ("WORKING", "BUSY", "IN_FLIGHT"):
        silence_str = f"{C_RED}{silence_sec:4.1f}s (Agent actively executing){C_RESET}"
    elif a_state == "WAITING_USER":
        silence_str = f"{C_YELLOW}{silence_sec:4.1f}s (Waiting for user - ask_question){C_RESET}"
    elif a_state == "SETTLING":
        silence_str = f"{C_CYAN}{silence_sec:4.1f}s (Settling buffer countdown){C_RESET}"
    elif silence_sec >= threshold:
        silence_str = f"{C_GREEN}{silence_sec:4.1f}s (Quiet / Buffer met){C_RESET}"
    else:
        silence_str = f"{C_YELLOW}{silence_sec:4.1f}s (Settling buffer countdown){C_RESET}"

    # 4. 60-Second Idle Timer Progress Bar (24 chars)
    bar_width = 24
    pct = min(1.0, max(0.0, silence_sec / threshold if threshold > 0 else 0.0))
    filled = int(round(pct * bar_width))
    bar_chars = "█" * filled + "░" * (bar_width - filled)
    pct_int = int(pct * 100)

    if a_state in ("WORKING", "BUSY", "IN_FLIGHT"):
        timer_str = f"{C_RED} 0.0s / {threshold:.0f}s [{bar_chars}]   0% (RESET - AGENT WORKING){C_RESET}"
    elif a_state in ("SETTLING", "WAITING_USER"):
        timer_str = f"{C_CYAN}{silence_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}% (SETTLING BUFFER COUNTDOWN){C_RESET}"
    elif pct >= 1.0:
        timer_str = f"{C_GREEN}{threshold:4.1f}s / {threshold:.0f}s [{bar_chars}] 100% (IDLE THRESHOLD MET){C_RESET}"
    else:
        timer_str = f"{C_CYAN}{silence_sec:4.1f}s / {threshold:.0f}s [{bar_chars}] {pct_int:3d}%{C_RESET}"

    # 5. 60-Minute Activity Graph (30 chars)
    history = data.get("activity_history_60m", [])
    activity_str = render_activity_timeline(history, bar_width=30)

    # Badges (Clean English - No Empty Brackets)
    a_color = f"{C_BOLD}{C_GREEN}YES{C_RESET}" if a_active else f"{C_BOLD}{C_RED}NO{C_RESET}"

    if a_state in ("WORKING", "BUSY"):
        s_color = f"{C_GREEN}{C_BOLD}WORKING{C_RESET}"
    elif a_state == "IN_FLIGHT":
        s_color = f"{C_GREEN}{C_BOLD}IN_FLIGHT{C_RESET}"
    elif a_state == "WAITING_USER":
        s_color = f"{C_YELLOW}{C_BOLD}WAITING_USER{C_RESET}"
    elif a_state == "SETTLING":
        s_color = f"{C_CYAN}{C_BOLD}SETTLING{C_RESET}"
    else:
        s_color = f"{C_GRAY}IDLE{C_RESET}"

    # Truncate strings cleanly
    sess_disp = session_id[:28] + "..." if len(session_id) > 31 else session_id
    task_disp = cur_task[:40] + "..." if len(cur_task) > 43 else cur_task

    iaa_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_a_active else f"{C_BOLD}{C_RED}FALSE{C_RESET}"
    iwi_color = f"{C_BOLD}{C_GREEN}TRUE{C_RESET}" if is_idle else f"{C_BOLD}{C_RED}FALSE{C_RESET}"

    lines = [
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"{C_BOLD}          WINDOWS ANTIGRAVITY INACTIVITY SENTINEL{C_RESET}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
        f"  Agent Active        : {a_color}",
        f"  Target Service      : {C_WHITE}Google AntiGravity Agent & Brain Sessions{C_RESET}",
        f"  Agent State         : {s_color}",
        f"  Chat Sessions       : {chats_str}",
        f"  Active Session ID   : {C_BOLD}{sess_disp}{C_RESET}",
        f"  Current Task / Step : {task_disp}",
        f"  Continuous Active   : {act_str}",
        f"  Continuous Idle     : {idle_str}",
        f"  Brain Silence Time  : {silence_str}",
        f"  60s Idle Timer      : {timer_str}",
        f"  60m Activity Graph  : {activity_str}",
        f"{C_CYAN}----------------------------------------------------------------------{C_RESET}",
        f"  Is Agent Active?    : {iaa_color}",
        f"  Is Windows Idle?    : {iwi_color}",
        f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}",
    ]

    if in_place:
        lines.append(f"{C_GRAY}  Live monitoring active | Press Ctrl+C to stop{C_RESET}")
        return "\n".join(f"{line}\033[K" for line in lines)
    return "\n".join(lines)
