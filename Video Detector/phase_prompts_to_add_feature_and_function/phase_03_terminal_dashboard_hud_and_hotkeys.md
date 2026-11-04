# Phase 03 Execution Prompt: Terminal Dashboard HUD & Interactive Hotkeys

> **Phase Number:** 03  
> **Phase Name:** Terminal Dashboard HUD & Interactive Hotkeys  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\04_ui_ux_design_system_dept.md`, `05_frontend_engineering_dept.md`, `08_quality_assurance_testing_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 03 elevates the terminal user interface into an interactive, high-density aerospace HUD with live operator controls:
1. **Auto-Shutdown Countdown HUD & Visual Progress Bar (FEAT-06):** Displays a real-time countdown when video stops or pauses, featuring a visual ANSI progress bar (`[████████░░░░]`) and cancellation warnings.
2. **Multi-Video Streams Inspector (FEAT-07):** Enumerates primary active stream plus secondary streams in clean stacked cards.
3. **Ghost / Background Stream Audit (FEAT-05):** Detects and highlights hidden, minimized, or occluded media windows consuming audio.
4. **Interactive In-Dashboard Hotkeys (FEAT-13):** Non-blocking keystroke handler allowing instant adjustments (`+`/`-` threshold, `P` pause, `R` reset/cancel, `M` mute sensitivity, `Q` quit).

---

## 📁 2. Impacted Modules & Target File Topology

- **Modify:** `modules/dashboard.py` (Redesign card renderer to incorporate HUD progress bar, multi-stream tables, and hotkey legends).
- **Create:** `modules/countdown.py` (Stateful auto-shutdown countdown controller with cancellation and snooze hooks).
- **Create:** `modules/hotkeys.py` (Non-blocking Win32 keyboard listener via `msvcrt.kbhit()` and `GetAsyncKeyState`).
- **Modify:** `modules/evaluator.py` (Track multi-stream lists and ghost stream flags).
- **Create:** `test_phase03_terminal_hud_suite.py` (Terminal HUD and hotkey unit test suite).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 3.1: Stateful Auto-Shutdown Countdown Controller (`modules/countdown.py`)
1. Create `modules/countdown.py` with `AutoShutdownController`:
   - `initial_countdown_seconds`: Default 300 (5 minutes).
   - States: `STANDBY` (Video playing, timer inactive), `COUNTDOWN` (Video stopped, timer running), `PAUSED` (User paused sentinel), `SNOOZED` (User granted temporary grace period), `TRIGGERED` (Timer reached 0).
   - Methods:
     - `tick(is_video_playing: bool) -> dict`: If video playing, resets to standby. If video stopped, decrements remaining seconds.
     - `abort()`: Cancels active countdown and resets to initial threshold.
     - `snooze(seconds: int = 900)`: Adds 15 minutes of grace time.
     - `adjust_threshold(delta_seconds: int)`: Increases/decreases base timeout.
     - `render_progress_bar(width: int = 40) -> str`: Returns visual ANSI bar (`█` filled, `░` remaining) with percentage and time remaining.

### Step 3.2: Multi-Stream & Ghost Stream Auditor (`modules/evaluator.py`)
1. In `modules/evaluator.py`, expand evaluation logic:
   - Identify all active media sessions from WASAPI and window scanner.
   - Primary Stream: The active foreground window or highest-volume video session.
   - Secondary Streams: All other concurrent audio/video sessions.
   - Ghost Stream Rule: If `IsIconic(hwnd) == True` (minimized) or window area is 0, but audio peak > 0.001, tag as `GHOST_STREAM [Hidden/Minimized]`.
   - Pass `primary_stream`, `secondary_streams`, and `ghost_streams` in the returned state dictionary.

### Step 3.3: Interactive Non-Blocking Hotkeys Listener (`modules/hotkeys.py`)
1. Create `modules/hotkeys.py` using Windows standard `msvcrt`:
   - Implement `poll_hotkey() -> Optional[str]`:
     ```python
     import msvcrt
     if msvcrt.kbhit():
         ch = msvcrt.getch()
         # Map keys: '+', '-', 'p', 'P', 'r', 'R', 'm', 'M', 'q', 'Q'
     ```
   - Actions triggered:
     - `+` / `=`: Increase countdown timeout by 60 seconds.
     - `-` / `_`: Decrease countdown timeout by 60 seconds (min 60s).
     - `p` / `P`: Toggle sentinel Pause state.
     - `r` / `R`: Reset / Abort active shutdown countdown.
     - `m` / `M`: Toggle mute sensitivity (treat muted video as idle vs busy).
     - `q` / `Q`: Graceful shutdown of entire application.

### Step 3.4: Terminal Dashboard Redesign (`modules/dashboard.py`)
1. Redesign `modules/dashboard.py` adhering to `DESIGN.md`:
   - Maintain strict in-place atomic screen buffer writing.
   - Include:
     - Header banner with dynamic status badge (Active Video vs Idle vs Countdown).
     - Primary stream card with platform, presentation mode (Fullscreen/Windowed), and audio level meter.
     - Secondary media streams and ghost stream warning card.
     - Visual countdown HUD with animated progress bar and remaining seconds.
     - Today's watch-time summary and 24-hour Unicode sparkline heatmap.
     - Hotkey Action Bar legend at base of card.

---

## 🧪 4. Verification & QA Testing Gate

1. Run verification suite `test_phase03_terminal_hud_suite.py`:
   ```bash
   python test_phase03_terminal_hud_suite.py
   ```
2. Acceptance Criteria:
   - Countdown controller correctly transitions through `STANDBY`, `COUNTDOWN`, `PAUSED`, and `ABORTED`.
   - Visual progress bar renders exact 40-character bar matching percentage.
   - Hotkey poller captures keystrokes without blocking the 200ms sensor tick.
   - Terminal refresh produces zero downward scroll drift.

---

## 💾 5. Autonomous Local Commit & Rule 15 Protocol

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add modules/countdown.py modules/hotkeys.py modules/dashboard.py modules/evaluator.py test_phase03_terminal_hud_suite.py
   git commit -m "feat(dashboard): implement Phase 03 Auto-Shutdown Countdown HUD, multi-stream inspector, and keyboard hotkeys"
   ```
2. Capture commit hash via `git log -1 --format="%h - %s"`.
3. Notify user: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
4. Keep remote push locked per Rule 15.
