# -*- coding: utf-8 -*-
"""
tracker.py: Game Activity Tracker, Continuous Durations & 60m Activity Buffer.
Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import time
from typing import Optional, Dict, Any, List


class GameActivityTracker:
    """
    Maintains persistent metrics across evaluation cycles:
      1. Continuous Game Play Duration (seconds game played without interruption).
      2. Continuous Game Pause/Stop Duration (seconds game remained paused/stopped).
      3. 60-Minute Historical Activity Ring Buffer (minute-by-minute activity history).
    """

    def __init__(self, history_minutes: int = 60):
        self.history_minutes = history_minutes
        self.reset()

    def reset(self):
        """Resets tracker state."""
        self._last_eval_time: Optional[float] = None
        self._last_is_game_playing: Optional[bool] = None
        self._continuous_play_seconds: float = 0.0
        self._continuous_pause_seconds: float = 0.0
        self._minute_activity: Dict[int, float] = {}

    def update(
        self,
        is_game_playing: bool,
        now: Optional[float] = None,
        dt: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates the tracker with the latest evaluation verdict.
        """
        if now is None:
            now = time.time()

        if dt is None:
            if self._last_eval_time is None:
                dt = 0.0
            else:
                dt = max(0.0, now - self._last_eval_time)
        self._last_eval_time = now

        curr_m = int(now // 60)

        if is_game_playing:
            if self._last_is_game_playing is not True:
                # Switched to playing: start play timer fresh from dt
                self._continuous_play_seconds = dt
            else:
                self._continuous_play_seconds += dt
            self._continuous_pause_seconds = 0.0
            self._last_is_game_playing = True
            self._minute_activity[curr_m] = self._minute_activity.get(curr_m, 0.0) + dt
        else:
            if self._last_is_game_playing is not False:
                # Switched to paused/stopped: start pause timer fresh from dt
                self._continuous_pause_seconds = dt
            else:
                self._continuous_pause_seconds += dt
            self._continuous_play_seconds = 0.0
            self._last_is_game_playing = False

        # Prune minutes older than history_minutes
        cutoff = curr_m - self.history_minutes
        self._minute_activity = {k: v for k, v in self._minute_activity.items() if k >= cutoff}

        return {
            "continuous_play_seconds": self._continuous_play_seconds,
            "continuous_pause_seconds": self._continuous_pause_seconds,
            "activity_history_60m": self.get_history_60m(now)
        }

    def get_history_60m(self, now: Optional[float] = None) -> List[float]:
        """
        Returns a 60-element list representing activity ratio for each of the last 60 minutes.
        Index 0 is 59 minutes ago, index 59 is current minute.
        """
        if now is None:
            now = time.time()
        curr_m = int(now // 60)
        history = []
        for offset in range(self.history_minutes - 1, -1, -1):
            m = curr_m - offset
            sec = self._minute_activity.get(m, 0.0)
            ratio = min(1.0, max(0.0, sec / 60.0))
            history.append(ratio)
        return history

    def seed_history_for_testing(self, values: List[float], now: Optional[float] = None):
        """Allows test suites to inject deterministic activity history."""
        if now is None:
            now = time.time()
        curr_m = int(now // 60)
        self._minute_activity.clear()
        v_len = len(values)
        for i, val in enumerate(values):
            offset = v_len - 1 - i
            m = curr_m - offset
            self._minute_activity[m] = float(val) * 60.0

    @property
    def continuous_play_seconds(self) -> float:
        return self._continuous_play_seconds

    @property
    def continuous_pause_seconds(self) -> float:
        return self._continuous_pause_seconds


_global_tracker: Optional[GameActivityTracker] = None


def get_activity_tracker() -> GameActivityTracker:
    """Returns singleton instance of GameActivityTracker."""
    global _global_tracker
    if _global_tracker is None:
        _global_tracker = GameActivityTracker()
    return _global_tracker


def reset_activity_tracker() -> None:
    """Resets global singleton GameActivityTracker."""
    global _global_tracker
    if _global_tracker is not None:
        _global_tracker.reset()
