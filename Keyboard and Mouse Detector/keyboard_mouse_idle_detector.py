# -*- coding: utf-8 -*-
"""
keyboard_mouse_idle_detector.py: Backward-compatibility entry point for Keyboard & Mouse Sentinel.
Delegates directly to keyboard_mouse_detector.py.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Keyboard and Mouse Detector
"""

import sys
import os

# Ensure current directory is in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from keyboard_mouse_detector import (
    main,
    evaluate_keyboard_mouse_state,
    get_user_idle_seconds,
    set_mock_user_idle_seconds,
    set_mock_source_activity,
    get_device_idle_seconds,
    reset_source_state,
    start_input_hooks,
    stop_input_hooks,
    is_input_hooks_active,
    render_simple_card,
    run_single_check,
    run_monitoring_loop,
    InputActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)

if __name__ == "__main__":
    main()
