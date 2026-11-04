# -*- coding: utf-8 -*-
"""
modules/countdown.py: Inactivity Idle Timer and Buffer Controller.
Department 02: Solution Architecture and Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

NOTE: Automated system shutdown and the 5-minute warning countdown have been
completely removed per user mandate. This module now serves strictly as an
inactivity idle tracker and threshold state machine.
"""

import os
import sys
import time
from typing import Dict, Any, Optional, Callable

# State Constants
STATE_STANDBY = "STANDBY"
STATE_ACTIVE = "ACTIVE"
STATE_IDLE_BUFFER = "IDLE_BUFFER"
STATE_IDLE_MET = "IDLE_MET"

# Legacy aliases for compatibility
STATE_GRACE = "IDLE_BUFFER"
STATE_WARNING = "IDLE_MET"
STATE_TRIGGERED = "IDLE_MET"
STATE_SNOOZED = "STANDBY"


def format_countdown_mm_ss(seconds: float) -> str:
    """Formats seconds into MM:SS digital format."""
    total = max(0, int(round(seconds)))
    mins = total // 60
    secs = total % 60
    return f"{mins:02d}:{secs:02d}"


class AutoShutdownController:
    """
    Inactivity Idle Tracker and State Machine.
    Governs video inactivity threshold monitoring.
    System shutdown execution and 5-minute warning logic have been completely removed.
    """

    def __init__(
        self,
        grace_threshold_seconds: float = 60.0,
        countdown_seconds: float = 0.0,
        dry_run: bool = True,
        shutdown_cmd_override: Optional[Callable[[], Any]] = None,
        cancel_cmd_override: Optional[Callable[[], Any]] = None,
        on_warning: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_tick: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_shutdown: Optional[Callable[[], None]] = None,
        on_abort: Optional[Callable[[], None]] = None,
        on_snooze: Optional[Callable[[int], None]] = None
    ) -> None:
        self.threshold_seconds = float(grace_threshold_seconds)
        self.grace_threshold_seconds = self.threshold_seconds
        self.countdown_seconds = 0.0
        self.dry_run = True

        # Callback hooks
        self.on_warning = on_warning
        self.on_tick = on_tick
        self.on_shutdown = on_shutdown
        self.on_abort = on_abort
        self.on_snooze = on_snooze

        # State tracking
        self.state: str = STATE_STANDBY
        self.elapsed_idle_seconds: float = 0.0
        self.is_threshold_met: bool = False
        self.shutdown_executed: bool = False

    def reset(self) -> None:
        """Resets the tracker back to STANDBY state."""
        self.state = STATE_STANDBY
        self.elapsed_idle_seconds = 0.0
        self.is_threshold_met = False
        self.shutdown_executed = False

    def set_threshold(self, seconds: float) -> None:
        """Updates the active inactivity threshold (e.g. 30s, 60s, 120s, 300s)."""
        self.threshold_seconds = max(5.0, float(seconds))
        self.grace_threshold_seconds = self.threshold_seconds
        if self.elapsed_idle_seconds < self.threshold_seconds:
            self.is_threshold_met = False
            if self.state == STATE_IDLE_MET:
                self.state = STATE_IDLE_BUFFER

    def tick(self, is_video_playing: bool, delta_time: float = 1.0) -> Dict[str, Any]:
        """
        Advances the inactivity state machine by delta_time seconds.
        """
        dt = max(0.0, float(delta_time))

        if is_video_playing:
            self.state = STATE_ACTIVE
            self.elapsed_idle_seconds = 0.0
            self.is_threshold_met = False
        else:
            self.elapsed_idle_seconds += dt
            if self.elapsed_idle_seconds >= self.threshold_seconds:
                self.state = STATE_IDLE_MET
                self.is_threshold_met = True
            else:
                self.state = STATE_IDLE_BUFFER
                self.is_threshold_met = False

        snapshot = self.get_state()
        if self.on_tick:
            try:
                self.on_tick(snapshot)
            except Exception:
                pass
        return snapshot

    def snooze(self, additional_seconds: int = 60) -> Dict[str, Any]:
        """Resets idle elapsed seconds back to 0."""
        self.elapsed_idle_seconds = 0.0
        self.is_threshold_met = False
        self.state = STATE_IDLE_BUFFER
        return self.get_state()

    def abort(self) -> Dict[str, Any]:
        """Resets idle elapsed seconds back to 0."""
        self.reset()
        if self.on_abort:
            try:
                self.on_abort()
            except Exception:
                pass
        return self.get_state()

    def cancel_shutdown(self) -> Dict[str, Any]:
        """Alias for abort()."""
        return self.abort()

    def execute_shutdown(self) -> bool:
        """System shutdown is completely disabled."""
        return False

    def cancel_system_shutdown(self) -> bool:
        """System shutdown is completely disabled."""
        return False

    def get_state(self) -> Dict[str, Any]:
        """Returns snapshot of current inactivity state."""
        progress = 0.0
        if self.threshold_seconds > 0:
            progress = max(0.0, min(1.0, self.elapsed_idle_seconds / self.threshold_seconds))

        rem_seconds = max(0.0, self.threshold_seconds - self.elapsed_idle_seconds)
        formatted_time = f"{self.elapsed_idle_seconds:4.1f}s / {self.threshold_seconds:.0f}s"

        return {
            "state": self.state,
            "is_warning": False,  # Auto-shutdown warning card is removed
            "is_triggered": False,
            "is_snoozed": False,
            "is_threshold_met": self.is_threshold_met,
            "remaining_grace": round(rem_seconds, 1),
            "remaining_countdown": round(rem_seconds, 1),
            "total_countdown": self.threshold_seconds,
            "countdown_progress": round(progress, 3),
            "formatted_countdown": formatted_time,
            "elapsed_idle_seconds": round(self.elapsed_idle_seconds, 1),
            "threshold_seconds": self.threshold_seconds,
            "snooze_remaining": 0.0,
            "shutdown_executed": False
        }


# Modern alias
InactivityTimerController = AutoShutdownController
