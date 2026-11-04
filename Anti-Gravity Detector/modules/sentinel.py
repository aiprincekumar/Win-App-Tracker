# -*- coding: utf-8 -*-
"""
sentinel.py: Core Sentinel Orchestration, Evaluation & Monitoring Loop.
Department 02: Systems Engineering & Department 06: Backend & API Engineering.

Capabilities:
  - Master evaluation function (`evaluate_antigravity_state`) with strict 60s inactivity lock.
  - Single-check CLI runner (`run_single_check`) for programmatic integration (exits 0: Idle, 1: Active).
  - Continuous flicker-free monitoring loop (`run_monitoring_loop` / `run_antigravity_sentinel`).

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

import sys
import time
import json
from typing import Optional, Dict, Any

from .config import (
    C_RESET, C_YELLOW, enable_windows_vt_mode,
    hide_cursor, show_cursor
)
from .tracker import get_agent_tracker
from .analyzer import AntigravitySessionAnalyzer
from .dashboard import render_simple_card


def evaluate_antigravity_state(analyzer: Optional[AntigravitySessionAnalyzer] = None,
                              idle_threshold: float = 60.0,
                              debounce_seconds: float = 5.0) -> Dict[str, Any]:
    """
    Evaluates real-time AntiGravity state and applies strict 60-second inactivity lock with debounce.
    """
    if analyzer is None:
        analyzer = AntigravitySessionAnalyzer()

    raw = analyzer.evaluate_all(idle_buffer=idle_threshold)

    agent_active = raw.get("agent_active", False)
    agent_state = raw.get("agent_state", "IDLE")
    silence_sec = float(raw.get("silence_seconds", 0.0))
    session_id = raw.get("active_session_id", "None")
    current_step = raw.get("current_step", "None")
    summary = raw.get("summary", "")
    hindi_summary = raw.get("hindi_summary", "")

    tracker = get_agent_tracker()
    tracker.debounce_seconds = debounce_seconds
    cont_active, cont_idle, history = tracker.update(agent_active)

    # 60-Second Inactivity Lock:
    # If agent is active (working, in flight, waiting, settling): is_windows_idle MUST be False!
    # Only when all sessions are verified completed (all_completed=True)
    # AND silence has reached >= idle_threshold does Windows become idle!
    all_completed = raw.get("all_completed", (not agent_active and agent_state == "IDLE"))
    is_windows_idle = (all_completed and silence_sec >= idle_threshold and not agent_active)
    idle_display_sec = 0.0 if agent_active else silence_sec

    return {
        "agent_active": agent_active,
        "is_agent_active": agent_active,
        "is_windows_idle": is_windows_idle,
        "agent_state": agent_state,
        "target_service": "Google AntiGravity Agent & Brain Sessions",
        "active_session_id": session_id,
        "current_task": current_step,
        "task_summary": summary,
        "hindi_summary": hindi_summary,
        "silence_seconds": round(silence_sec, 2),
        "idle_display_seconds": round(idle_display_sec, 2),
        "idle_threshold": float(idle_threshold),
        "total_sessions": int(raw.get("total_sessions", 0)),
        "active_sessions_count": int(raw.get("active_sessions_count", 0)),
        "inactive_sessions_count": int(raw.get("inactive_sessions_count", 0)),
        "working_sessions_count": int(raw.get("working_sessions_count", 0)),
        "settling_sessions_count": int(raw.get("settling_sessions_count", 0)),
        "waiting_sessions_count": int(raw.get("waiting_sessions_count", 0)),
        "user_chats_total": int(raw.get("user_chats_total", 0)),
        "user_chats_active": int(raw.get("user_chats_active", 0)),
        "user_chats_inactive": int(raw.get("user_chats_inactive", 0)),
        "subagents_total": int(raw.get("subagents_total", 0)),
        "subagents_active": int(raw.get("subagents_active", 0)),
        "subagents_inactive": int(raw.get("subagents_inactive", 0)),
        "continuous_active_seconds": cont_active,
        "continuous_idle_seconds": cont_idle,
        "activity_history_60m": history,
        "mode": "ANTIGRAVITY_AGENT_ONLY"
    }


def run_single_check(analyzer: Optional[AntigravitySessionAnalyzer] = None,
                     threshold: float = 60.0, json_output: bool = False,
                     debounce: float = 5.0) -> int:
    """Executes single evaluation check and returns exit code (0: Idle, 1: Active)."""
    res = evaluate_antigravity_state(analyzer=analyzer, idle_threshold=threshold, debounce_seconds=debounce)
    if json_output:
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        print(render_simple_card(res, in_place=False))
    return 0 if res.get("is_windows_idle") else 1


def run_monitoring_loop(analyzer: Optional[AntigravitySessionAnalyzer] = None,
                        threshold: float = 60.0, interval: float = 0.5,
                        debounce: float = 5.0) -> None:
    """Executes continuous real-time terminal UI loop with flicker-free in-place rendering."""
    if analyzer is None:
        analyzer = AntigravitySessionAnalyzer()

    enable_windows_vt_mode()

    # Clear console screen ONCE on initial startup and hide blinking cursor
    sys.stdout.write("\033[2J\033[H")
    hide_cursor()
    sys.stdout.flush()

    try:
        while True:
            res = evaluate_antigravity_state(analyzer=analyzer, idle_threshold=threshold, debounce_seconds=debounce)
            banner = render_simple_card(res, in_place=True)

            frame = f"\033[H{banner}\n\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        show_cursor()
        print("\n\n" + C_YELLOW + "[EXIT] AntiGravity Sentinel stopped by user." + C_RESET)


# Alias for canonical execution
run_antigravity_sentinel = run_monitoring_loop
