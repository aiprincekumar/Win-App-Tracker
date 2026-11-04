# -*- coding: utf-8 -*-
"""
sentinel.py: Master Evaluation Engine, Single-Check & Live Monitoring Loops.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

import sys
import time
import json
from typing import Dict, Any

from .config import (
    C_RESET,
    C_YELLOW,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor
)
from .win32_api import (
    get_device_idle_seconds,
    start_input_hooks,
    stop_input_hooks,
    _last_active_source
)
from .tracker import get_activity_tracker
from .dashboard import render_simple_card


def evaluate_keyboard_mouse_state(idle_threshold: float = 60.0,
                                  recent_activity_threshold: float = 2.0) -> Dict[str, Any]:
    """
    Evaluates physical keyboard and mouse inactivity state against the threshold.
    Individually identifies Keyboard vs Mouse activity dynamically.
    Returns structured operational dictionary.
    """
    global _last_active_source
    kb_idle_sec, mouse_idle_sec, user_idle_sec = get_device_idle_seconds(recent_activity_threshold)

    kb_is_active = (kb_idle_sec < recent_activity_threshold)
    m_is_active = (mouse_idle_sec < recent_activity_threshold)
    is_active = kb_is_active or m_is_active or (user_idle_sec < recent_activity_threshold)

    # Calculate input responsiveness meter (1.0 = immediate active, 0.0 = inactive)
    if is_active:
        active_idle = min(
            user_idle_sec,
            kb_idle_sec if kb_is_active else 999999.0,
            mouse_idle_sec if m_is_active else 999999.0
        )
        meter_val = max(0.0, 1.0 - (active_idle / recent_activity_threshold))
    else:
        meter_val = 0.0

    tracker = get_activity_tracker()
    cont_active, cont_inactive, history = tracker.update(is_active)

    # 60-Second Inactivity Lock:
    # While idle_seconds < idle_threshold, is_windows_idle MUST be False!
    is_windows_idle = (user_idle_sec >= idle_threshold)

    # Dynamic individual input source resolution
    if kb_is_active and m_is_active:
        input_source = "Keyboard + Mouse (कीबोर्ड और माउस)"
        input_source_raw = "KEYBOARD_AND_MOUSE"
        _last_active_source = "KEYBOARD_AND_MOUSE"
        status_text = "Active (Keyboard & Mouse in active physical use)"
        hindi_text = "सक्रिय (यूजर कीबोर्ड और माउस दोनों का सक्रिय उपयोग कर रहा है)"
        state_badge = "ACTIVE"
    elif kb_is_active:
        input_source = "Keyboard (कीबोर्ड)"
        input_source_raw = "KEYBOARD"
        _last_active_source = "KEYBOARD"
        status_text = "Active (Keyboard in active physical use)"
        hindi_text = "सक्रिय (यूजर कीबोर्ड का सक्रिय उपयोग कर रहा है)"
        state_badge = "ACTIVE"
    elif m_is_active:
        input_source = "Mouse (माउस)"
        input_source_raw = "MOUSE"
        _last_active_source = "MOUSE"
        status_text = "Active (Mouse in active physical use)"
        hindi_text = "सक्रिय (यूजर माउस का सक्रिय उपयोग कर रहा है)"
        state_badge = "ACTIVE"
    else:
        input_source = "None (कोई इनपुट नहीं)"
        input_source_raw = "NONE"
        if user_idle_sec < idle_threshold:
            rem = idle_threshold - user_idle_sec
            status_text = f"Inactive (Idle buffer pending: {user_idle_sec:.1f}s / {idle_threshold:.0f}s, {rem:.1f}s left)"
            hindi_text = f"निष्क्रिय (आइडियल बफर शेष: {user_idle_sec:.1f}s / {idle_threshold:.0f}s, {rem:.1f}s बचा है)"
            state_badge = "INACTIVE"
        else:
            status_text = f"Idle (Inactivity threshold reached: {user_idle_sec:.1f}s >= {idle_threshold:.0f}s)"
            hindi_text = f"आइडियल (आइडियल थ्रेशोल्ड पूरा हुआ: {user_idle_sec:.1f}s >= {idle_threshold:.0f}s)"
            state_badge = "IDLE"

    return {
        "user_active": is_active,
        "is_user_active": is_active,
        "is_windows_idle": is_windows_idle,
        "activity_state": state_badge,
        "input_source": input_source,
        "input_source_raw": input_source_raw,
        "last_active_source": _last_active_source,
        "keyboard_active": kb_is_active,
        "mouse_active": m_is_active,
        "keyboard_idle_seconds": round(kb_idle_sec, 2),
        "mouse_idle_seconds": round(mouse_idle_sec, 2),
        "input_status": status_text,
        "hindi_status": hindi_text,
        "user_idle_seconds": round(user_idle_sec, 2),
        "idle_threshold": float(idle_threshold),
        "input_activity_meter": meter_val,
        "continuous_active_seconds": cont_active,
        "continuous_inactive_seconds": cont_inactive,
        "activity_history_60m": history,
        "mode": "KEYBOARD_MOUSE_ONLY"
    }


def run_single_check(threshold: float = 60.0, json_output: bool = False) -> int:
    """Executes single evaluation check and returns exit code (0: Idle, 1: Active)."""
    res = evaluate_keyboard_mouse_state(idle_threshold=threshold)
    if json_output:
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        print(render_simple_card(res, in_place=False))
    return 0 if res.get("is_windows_idle") else 1


def run_monitoring_loop(threshold: float = 60.0, interval: float = 0.1) -> None:
    """Executes continuous real-time terminal UI loop with flicker-free in-place rendering."""
    enable_windows_vt_mode()
    start_input_hooks()

    # Clear console screen ONCE on initial startup and hide blinking cursor
    sys.stdout.write("\033[2J\033[H")
    hide_cursor()
    sys.stdout.flush()

    try:
        while True:
            res = evaluate_keyboard_mouse_state(idle_threshold=threshold)
            banner = render_simple_card(res, in_place=True)

            frame = f"\033[H{banner}\n\033[J"
            sys.stdout.write(frame)
            sys.stdout.flush()

            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    finally:
        stop_input_hooks()
        show_cursor()
        print("\n\n" + C_YELLOW + "[EXIT] Keyboard & Mouse Sentinel stopped by user." + C_RESET)
