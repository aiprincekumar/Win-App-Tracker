# -*- coding: utf-8 -*-
"""
antigravity_detector.py: Specialized Windows Google AntiGravity Agent Inactivity Sentinel (CLI Entry Point).
Department 02: Solution Architecture & Department 06: Backend & API Engineering.

Modular Architecture:
  Core functionality is decoupled into the 'modules' package:
    - modules.config: Configuration, ANSI styling, and VT mode handlers.
    - modules.analyzer: Brain transcript analysis & multi-session aggregation.
    - modules.tracker: Continuous duration & 60m rolling activity tracking.
    - modules.dashboard: ANSI card and timeline rendering.
    - modules.sentinel: Master evaluation & monitoring loops.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

import sys
import argparse
from pathlib import Path

# Public API Re-exports for backward compatibility
from modules import (
    DEFAULT_BRAIN_DIR,
    enable_windows_vt_mode,
    hide_cursor,
    show_cursor,
    C_RESET,
    C_BOLD,
    C_RED,
    C_GREEN,
    C_YELLOW,
    C_CYAN,
    C_WHITE,
    C_GRAY,
    AgentActivityTracker,
    get_agent_tracker,
    reset_agent_tracker,
    AntigravitySessionAnalyzer,
    format_duration,
    render_activity_timeline,
    render_simple_card,
    evaluate_antigravity_state,
    run_single_check,
    run_monitoring_loop,
    run_antigravity_sentinel
)


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments for AntiGravity Sentinel."""
    parser = argparse.ArgumentParser(
        description="Specialized Windows Google AntiGravity Agent Inactivity Sentinel (In-Place Dashboard)."
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.5,
        help="Refresh interval in seconds (default: 0.5s for responsive tracking)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=60.0,
        help="Inactivity idle threshold in seconds (default: 60.0s)"
    )
    parser.add_argument(
        "--debounce",
        type=float,
        default=5.0,
        help="Debounce hysteresis in seconds to prevent state flapping during brief LLM pauses (default: 5.0s)"
    )
    parser.add_argument(
        "--brain-dir",
        type=str,
        default=str(DEFAULT_BRAIN_DIR),
        help="Path to AntiGravity brain directory"
    )
    parser.add_argument(
        "--window-hours",
        type=float,
        default=2.0,
        help="Hours window to inspect active sessions (default: 2.0h)"
    )
    parser.add_argument(
        "--window-minutes",
        type=float,
        default=None,
        help="Lookback window in minutes (overrides --window-hours if specified)"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Single check execution (prints formatted card and exits with 0: Idle, 1: Active)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Structured JSON output of evaluation card data"
    )
    return parser.parse_args()


def main():
    args = parse_arguments()

    effective_window_hours = args.window_minutes / 60.0 if args.window_minutes is not None else args.window_hours
    analyzer = AntigravitySessionAnalyzer(brain_dir=Path(args.brain_dir), window_hours=effective_window_hours)

    if args.once or args.json:
        sys.exit(run_single_check(analyzer=analyzer, threshold=args.threshold, json_output=args.json, debounce=args.debounce))

    run_monitoring_loop(analyzer=analyzer, threshold=args.threshold, interval=args.interval, debounce=args.debounce)


if __name__ == "__main__":
    main()
