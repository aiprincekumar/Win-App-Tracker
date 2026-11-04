# -*- coding: utf-8 -*-
"""
audio_detector.py: Pure, Lean Live Audio Sentinel Main Entry Point & CLI Dispatcher.
Department 02: Solution Architecture & Department 06: Systems Engineering.

Modular Architecture:
  Core functionality is decoupled into the 'modules' package:
    - modules.constants: Universal file extensions, whitelists, classification types
    - modules.wasapi: Windows Core Audio API (WASAPI) peak metering
    - modules.wmp_classic: Legacy Windows Media Player classifier
    - modules.wmp_modern: Modern Windows Media Player classifier
    - modules.dashboard: ANSI terminal UI card renderer & data extractor
    - modules.detector: Active window scanner and audio evaluator

Direct live monitor runner by default (zero banner flash lag).
Re-exports all public APIs from modules/ for 100% backward compatibility.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Audio Detector
"""

import sys
import os
import argparse

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure directory is on path
_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from modules import *
from modules import __all__ as _modules_all

__all__ = list(_modules_all) + ["main"]


def main():
    parser = argparse.ArgumentParser(
        description="Specialized Windows Audio Inactivity Sentinel (8-Field In-Place Dashboard)."
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.1,
        help="Refresh interval in seconds (default: 0.1s for smooth ~100ms updates)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=60.0,
        help="Inactivity idle threshold in seconds (default: 60.0s)"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Single check execution (prints 8-field card and exits with 0: Idle, 1: Audio Playing)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Structured JSON output of 8-field card evaluation data"
    )
    args = parser.parse_args()

    if args.once or args.json:
        sys.exit(run_single_check(threshold=args.threshold, json_output=args.json))

    run_live_tracker(threshold=args.threshold, interval=args.interval)


if __name__ == "__main__":
    main()
