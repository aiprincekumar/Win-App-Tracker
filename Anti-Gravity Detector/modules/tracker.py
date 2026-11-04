# -*- coding: utf-8 -*-
"""
tracker.py: Continuous Duration & 60-Minute Historical Activity Tracker.
Department 02: Systems Engineering & Department 08: Quality Assurance.

Features:
  - Tracks continuous active duration and continuous idle duration (seconds).
  - Maintains 60-minute rolling historical activity buffer.
  - Implements anti-flapping debounce hysteresis (default 5.0s) to prevent false-idle
    drops during brief LLM thinking or tool execution pauses.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

import time
from typing import Optional, List, Tuple


class AgentActivityTracker:
    """
    Maintains continuous active duration, continuous idle duration,
    and a 60-minute rolling historical activity buffer for AntiGravity.
    Includes configurable debounce / hysteresis to prevent state flapping during brief LLM pauses.
    """
    def __init__(self, history_len: int = 60, debounce_seconds: float = 5.0):
        self.history_len = history_len
        self.debounce_seconds = debounce_seconds
        self.continuous_active_seconds = 0.0
        self.continuous_idle_seconds = 0.0
        self.last_state: Optional[bool] = None  # True = Active, False = Idle
        self.last_tick_time: float = time.time()
        self.minute_accum_active: float = 0.0
        self.minute_start_time: float = time.time()
        self.activity_history: List[int] = [0] * history_len
        self.inactive_grace_elapsed: float = 0.0

    def reset(self) -> None:
        """Resets tracker state to clean zeroed initial conditions."""
        self.continuous_active_seconds = 0.0
        self.continuous_idle_seconds = 0.0
        self.last_state = None
        self.last_tick_time = time.time()
        self.minute_accum_active = 0.0
        self.minute_start_time = time.time()
        self.activity_history = [0] * self.history_len
        self.inactive_grace_elapsed = 0.0

    def update(self, is_active: bool, dt: Optional[float] = None) -> Tuple[float, float, List[int]]:
        """Updates continuous counters with debounce hysteresis and aggregate minute-bucket history."""
        now = time.time()
        if dt is None:
            dt = max(0.0, now - self.last_tick_time)
        self.last_tick_time = now

        dt = min(dt, 5.0)

        if self.last_state is None:
            self.last_state = is_active

        if is_active:
            # Active signal received: clear any accumulated inactive grace
            self.inactive_grace_elapsed = 0.0
            if not self.last_state:
                self.continuous_active_seconds = 0.0
            self.continuous_active_seconds += dt
            self.continuous_idle_seconds = 0.0
            self.minute_accum_active += dt
            self.last_state = True
        else:
            # Inactive signal received:
            if self.last_state:
                # Was previously active: apply debounce grace window
                self.inactive_grace_elapsed += dt
                if self.inactive_grace_elapsed >= self.debounce_seconds:
                    # Debounce period expired: officially transition to Idle
                    self.continuous_active_seconds = 0.0
                    self.continuous_idle_seconds = self.inactive_grace_elapsed
                    self.last_state = False
                else:
                    # Within debounce grace period: hold continuous active duration intact
                    pass
            else:
                # Already confirmed idle: accumulate continuous idle
                self.continuous_idle_seconds += dt
                self.continuous_active_seconds = 0.0

        if (now - self.minute_start_time) >= 60.0:
            was_active = 1 if self.minute_accum_active >= 1.0 else 0
            self.activity_history.append(was_active)
            if len(self.activity_history) > self.history_len:
                self.activity_history.pop(0)
            self.minute_start_time = now
            self.minute_accum_active = 0.0

        return (
            self.continuous_active_seconds,
            self.continuous_idle_seconds,
            list(self.activity_history)
        )


_global_tracker = AgentActivityTracker()


def get_agent_tracker() -> AgentActivityTracker:
    """Returns the singleton AgentActivityTracker instance."""
    return _global_tracker


def reset_agent_tracker() -> None:
    """Resets the singleton AgentActivityTracker instance."""
    _global_tracker.reset()
