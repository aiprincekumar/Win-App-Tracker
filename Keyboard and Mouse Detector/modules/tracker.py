# -*- coding: utf-8 -*-
"""
tracker.py: Continuous Duration & 60-Minute Historical Activity Tracking.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

import time
from typing import List, Tuple, Optional


class InputActivityTracker:
    """
    Stateful tracker that maintains continuous active duration, continuous inactive
    duration, and a 60-minute rolling historical activity buffer.
    """
    def __init__(self, history_len: int = 60):
        self.history_len = history_len
        self.continuous_active_seconds = 0.0
        self.continuous_inactive_seconds = 0.0
        self.last_state: Optional[bool] = None  # True = Active, False = Inactive
        self.last_tick_time: float = time.time()
        self.minute_accum_active: float = 0.0
        self.minute_start_time: float = time.time()
        self.activity_history: List[int] = [0] * history_len

    def reset(self) -> None:
        """Resets tracker state to clean zeroed initial conditions."""
        self.continuous_active_seconds = 0.0
        self.continuous_inactive_seconds = 0.0
        self.last_state = None
        self.last_tick_time = time.time()
        self.minute_accum_active = 0.0
        self.minute_start_time = time.time()
        self.activity_history = [0] * self.history_len

    def update(self, is_active: bool, dt: Optional[float] = None) -> Tuple[float, float, List[int]]:
        """
        Updates state transitions and increments durations according to elapsed time.
        """
        now = time.time()
        if dt is None:
            dt = max(0.0, now - self.last_tick_time)
        self.last_tick_time = now

        # Guard against large sleeps or system suspend jumps
        dt = min(dt, 5.0)

        if self.last_state is None:
            self.last_state = is_active

        if is_active:
            if not self.last_state:
                # Transition from Inactive -> Active
                self.continuous_active_seconds = 0.0
            self.continuous_active_seconds += dt
            self.continuous_inactive_seconds = 0.0
            self.minute_accum_active += dt
        else:
            if self.last_state:
                # Transition from Active -> Inactive
                self.continuous_inactive_seconds = 0.0
            self.continuous_inactive_seconds += dt
            self.continuous_active_seconds = 0.0

        self.last_state = is_active

        # Minute bucket history aggregation (1 minute = 60s)
        if (now - self.minute_start_time) >= 60.0:
            was_active = 1 if self.minute_accum_active >= 1.0 else 0
            self.activity_history.append(was_active)
            if len(self.activity_history) > self.history_len:
                self.activity_history.pop(0)
            self.minute_start_time = now
            self.minute_accum_active = 0.0

        return (
            self.continuous_active_seconds,
            self.continuous_inactive_seconds,
            list(self.activity_history)
        )


_global_tracker = InputActivityTracker()


def get_activity_tracker() -> InputActivityTracker:
    """Returns global singleton instance of InputActivityTracker."""
    return _global_tracker


def reset_activity_tracker() -> None:
    """Resets the global activity tracker."""
    _global_tracker.reset()
