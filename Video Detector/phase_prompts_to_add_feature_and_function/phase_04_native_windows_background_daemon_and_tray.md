# Phase 04 Execution Prompt: Native Windows Background Daemon & System Tray

> **Phase Number:** 04  
> **Phase Name:** Native Windows Background Daemon & System Tray Integration  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\02_solution_architecture_dept.md`, `06_backend_api_engineering_dept.md`, `12_devops_build_release_dept.md`, `13_sre_backup_disaster_recovery_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 04 transforms the terminal-bound sentinel into a first-class, native Windows background desktop application (Windows 10 64-bit and Windows 11):
1. **Windows System Tray Integration (FEAT-14):** Low-overhead tray icon with dynamic status coloring (🟢 Green = Video Playing, 🟡 Amber = Idle/Audio, 🔴 Blinking Red = Shutdown Countdown Active).
2. **Context Menu Controls:** Quick-access menu for opening Web Dashboard, toggling Pause/Resume, Snoozing shutdown (15m/30m/1h), 1-click HTML Export, and Clean Exit.
3. **Dual Execution Mode:** Support for running headless in the background via `Run_Background.bat` or standard interactive terminal mode with tray synchronization.
4. **Zero-Hang Lifecycle Hygiene (Rule 26):** Ensure clean process termination within 500ms when exiting via system tray.

---

## 📁 2. Impacted Modules & Target File Topology

- **Create:** `modules/tray.py` (System tray manager with `pystray` and pure Win32 `Shell_NotifyIconW` fallback).
- **Create:** `modules/daemon.py` (Background service supervisor managing thread lifecycles and signal handling).
- **Modify:** `video_idle_detector.py` (Add `--tray` and `--headless` flags; integrate tray thread).
- **Create:** `Run_Background_Sentinel.bat` (1-click silent background launcher using `pythonw.exe`).
- **Create:** `test_phase04_tray_daemon_suite.py` (Tray lifecycle and background thread verification test).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 4.1: Dynamic System Tray Manager (`modules/tray.py`)
1. Create `modules/tray.py`:
   - Implement `SystemTrayController`:
     - Generates lightweight in-memory PIL icons or standard Win32 16x16 / 32x32 `.ico` masks on the fly:
       - Green Circle: `BUSY` (Video Active)
       - Amber Circle: `IDLE` (Audio Only / No Video)
       - Red Circle / Flashing: `COUNTDOWN` (Shutdown Pending)
     - Implements context menu:
       - `Open Web Dashboard` (opens `http://localhost:8765` in default browser)
       - `Status: [Current Verdict & Remaining Time]`
       - `Pause / Resume Monitoring`
       - `Snooze Auto-Shutdown` (submenu: `+15 Mins`, `+30 Mins`, `+1 Hour`)
       - `Export Audit Report (HTML)`
       - `---`
       - `Exit Sentinel`
   - Implement pure Win32 `Shell_NotifyIconW` fallback if `pystray` is not installed, guaranteeing 100% operation on standard Python environments.
   - Non-blocking notification bubbles: Dispatch Windows toast balloon (`NIF_INFO`) when auto-shutdown countdown begins (<60s remaining).

### Step 4.2: Background Daemon Supervisor (`modules/daemon.py`)
1. Create `modules/daemon.py`:
   - Manages threading events: `stop_event = threading.Event()`, `pause_event = threading.Event()`.
   - Coordinates worker threads:
     - Sensor Worker (WASAPI + Win32 window scanner, 200ms tick)
     - Storage Worker (SQLite async writer)
     - Tray Worker (Message pump for system tray icon)
   - Registers system signal handlers:
     - `signal.signal(signal.SIGINT, shutdown_handler)`
     - `signal.signal(signal.SIGTERM, shutdown_handler)`
     - `win32api.SetConsoleCtrlHandler(handler, True)`
   - On shutdown, invokes `stop_event.set()`, unregisters tray icon, closes SQLite database, and joins threads within 500ms timeout.

### Step 4.3: CLI Arguments & Launcher (`video_idle_detector.py` & `.bat`)
1. Extend `video_idle_detector.py`:
   - `--tray`: Spawns system tray icon in parallel with terminal HUD.
   - `--headless`: Runs purely as a background daemon (suppresses terminal output; ideal for `pythonw.exe`).
2. Create `Run_Background_Sentinel.bat`:
   - Checks for `pythonw.exe`.
   - Launches `video_idle_detector.py --headless --tray` completely detached from console.
   - Outputs status confirmation to user.

---

## 🧪 4. Verification & QA Testing Gate

1. Run verification suite `test_phase04_tray_daemon_suite.py`:
   ```bash
   python test_phase04_tray_daemon_suite.py
   ```
2. Acceptance Criteria:
   - Tray controller initializes icon and updates colors dynamically based on verdict.
   - Context menu callbacks trigger status toggle and web browser launch.
   - Process exits cleanly in < 500ms when `stop_event` is set, leaving zero zombie threads (Rule 26).
   - CPU utilization remains < 0.5% with tray loop running.

---

## 💾 5. Autonomous Local Commit & Rule 15 Protocol

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add modules/tray.py modules/daemon.py video_idle_detector.py Run_Background_Sentinel.bat test_phase04_tray_daemon_suite.py
   git commit -m "feat(daemon): implement Phase 04 native Windows background desktop app and dynamic system tray"
   ```
2. Capture commit hash via `git log -1 --format="%h - %s"`.
3. Notify user: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
4. Keep remote push locked per Rule 15.
