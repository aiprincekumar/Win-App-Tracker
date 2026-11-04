# Windows Video-Only Inactivity Sentinel - Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Project Name:** Windows Video-Only Inactivity Sentinel Enterprise Expansion  
> **Workspace Path:** `Video Detector/`  
> **Target Platform:** Windows 10 (Build 1903+) & Windows 11 (64-bit)  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Standard Compliance:** Dept 01 (Product Requirements), Universal Rules 0, 5, 8, 15, 16, 20, 22, 23, 26, 27  
> **Status:** Draft / Approved for Architecture & Phased Implementation  

---

## 🎯 1. Problem Statement & Business Context

### 1.1 The Core Problem
Modern personal workstations, laptops, and home-theater PCs waste substantial electrical power when left running unattended. Default Windows power management schemes rely exclusively on physical input (Win32 `GetLastInputInfo` keyboard and mouse events). Consequently, when a user watches a movie, online lecture, sports broadcast, or streaming playlist without touching peripherals, standard Windows power management aggressively dims screens, activates lock screens, or enters sleep/shutdown.

To counter this disruption, users typically disable automatic sleep and shutdown timers entirely. However, when users fall asleep during playback or leave their desk after media completes, computers remain powered on indefinitely, running warm, shortening hardware lifespan, consuming high kilowatt-hours, and leaving desktop screens vulnerable.

### 1.2 The Media Classification Dilemma
Conventional automation utilities and basic power managers attempt to solve this by monitoring process names (e.g., checking if `vlc.exe`, `chrome.exe`, `msedge.exe`, or `wmplayer.exe` is running). This results in severe false-busy states:
- **Pure Audio Confusion:** When a user listens to an MP3 playlist, podcast, audiobook, or Spotify in VLC or a browser tab, process checkers assume a video is playing and indefinitely prevent power-saving.
- **Finished/Paused Media Stagnation:** When a video stream concludes or pauses at an end-screen, the player process remains open, keeping the system awake forever.
- **Silent/Muted Ghost Tabs:** Forgotten browser tabs playing muted promotional videos in background windows falsely hold system power locks.

### 1.3 Mission & Value Proposition
The **Windows Video-Only Inactivity Sentinel** is an ultra-lightweight, non-intrusive background intelligence system that:
1. Accurately isolates genuine **active VIDEO playback** from **pure audio** or paused video across all Windows media applications and browsers.
2. Implements an intelligent auto-shutdown countdown when genuine video is absent or halts, complete with visual alerts and immediate multi-channel abort hooks.
3. Provides full visibility into watch time, multi-stream playback, hardware resource usage, power source status, and ghost background streams.
4. Provides dual-interface control: an atomic in-place terminal HUD with keyboard hotkeys, and an accessible localhost/LAN web dashboard for remote control via mobile phones or browsers.
5. Runs natively as a low-overhead Windows background desktop daemon with a system tray controller.

### 1.4 Target User Personas
1. **The Late-Night Media Streamer:** Streams YouTube, Netflix, or local MKV movies in bed; needs the PC to safely power down after the video finishes without interrupting viewing.
2. **The High-Efficiency Power User:** Multitasks with background podcasts (pure audio) while expecting the system to respect idle power policies when actual video stops.
3. **The Remote Workstation Operator:** Monitors and controls PC power and playback telemetry remotely from a smartphone connected to the local Wi-Fi network without leaving the sofa or bed.

---

## 🛡️ 2. Scope Boundaries

### 2.1 In-Scope Capabilities (15 Enterprise Features)
The system scope encompasses the following 15 explicitly specified functional domains:
1. **Daily & Weekly Watch-Time Analytics & Summary:** Automated time aggregation of genuine video watch duration vs pure audio vs idle time.
2. **Per-App Playback Breakdown:** Granular duration and session tracking across players (VLC, Chrome, Edge, Brave, PotPlayer, Modern Media Player, Legacy wmplayer, MPC-HC, MPV).
3. **Exportable Audit Reports (HTML, CSV, JSON):** 1-click comprehensive reporting engine accessible via CLI arguments and web dashboard.
4. **24-Hour Activity Heatmap & Peak Usage:** Visual hourly activity distribution chart rendered in ANSI terminal and Web UI.
5. **Ghost / Background Stream Audit:** Deep detection of hidden, minimized, or occluded windows consuming audio/video without visible rendering.
6. **Auto-Shutdown Countdown HUD & Visual Progress Bar:** Interactive visual countdown warning prior to power-off with snooze and cancellation hooks.
7. **Multi-Video Streams Inspector:** Real-time enumeration of primary foreground video stream plus all secondary background media sessions.
8. **Web Domain & Platform Source Tagging:** High-precision domain and service classifier (YouTube, Netflix, Prime Video, Disney+, Hotstar, Twitch, JioCinema, Local Files).
9. **Master Audio Volume & Mute State Indicator:** Audio stream level telemetry detecting silent/muted playback and distinguishing deliberate mutes from dialog pauses.
10. **Fullscreen vs Window Mode & Resolution Indicator:** Detection of presentation mode (Cinema/Fullscreen vs Windowed) and target window rendering resolution.
11. **Media Player Hardware Resource Telemetry:** Real-time per-player process CPU percentage, RAM consumption (MB), and GPU Hardware Acceleration status.
12. **System Power Source & Powercfg Display Wake-Lock Inspector:** Real-time AC vs Battery telemetry and active Windows `powercfg -requests` display/system lock analysis.
13. **Interactive In-Dashboard Hotkeys:** Low-latency keyboard command triggers (`+`/`-` idle threshold, `P` pause sentinel, `R` reset timer, `M` toggle mute sensitivity, `Q` quit).
14. **Native Windows Background Desktop App:** Native Windows 10 & Windows 11 system tray integration with dynamic icon status, context menu, and background daemon mode.
15. **Lightweight Localhost Web Dashboard:** Responsive local web dashboard accessible at `http://localhost:8765` and over LAN for real-time mobile telemetry and remote controls.

### 2.2 Out-of-Scope Capabilities
- **Physical Input Meter 1 (Win32 Keyboard & Mouse Movement):** Tracking raw mouse cursor deltas or keyboard strokes is strictly **OUT OF SCOPE** for this specific sentinel folder (`video_idle_detector/`). Physical input tracking is isolated to sibling directory `keyboard_mouse_idle_detector/` and `video_and_keyboard_mouse_idle_detector/`.
- **Cloud Account Synchronization:** No external cloud services, remote telemetry servers, or user accounts are required or permitted. All metrics remain 100% on-device.

---

## 📋 3. Functional Requirements (FR)

| Requirement ID | Feature Name | MoSCoW | INVEST | Description |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Daily/Weekly Watch-Time Analytics | **Must Have** | Yes | System shall track cumulative seconds of active video playback per calendar day and ISO week, persisting records into an embedded local database. |
| **FR-02** | Per-App Playback Breakdown | **Must Have** | Yes | System shall categorize video playback duration by application executable name, window title, and media player category. |
| **FR-03** | Multi-Format Export Engine | **Should Have** | Yes | System shall generate comprehensive audit reports in standalone HTML (interactive self-contained), CSV, and JSON formats via CLI command `--export [format]` and Web UI. |
| **FR-04** | 24-Hour Activity Heatmap | **Should Have** | Yes | System shall compute 24 hourly buckets (00:00 - 23:59) reflecting playback intensity (0-60 min/hr) for both terminal ANSI rendering and web display. |
| **FR-05** | Ghost & Background Stream Audit | **Must Have** | Yes | System shall inspect active audio sessions whose host window is minimized (`IsIconic`), occluded, off-screen, or headless, flagging them as `GHOST_STREAM`. |
| **FR-06** | Auto-Shutdown Countdown HUD | **Must Have** | Yes | When system transitions to IDLE (video absent or paused), system shall initiate a configurable countdown (default: 300s) with visual progress bar and immediate abort hooks. |
| **FR-07** | Multi-Video Streams Inspector | **Must Have** | Yes | System shall identify and list all simultaneous media streams, distinguishing the primary active focus stream from secondary background audio/video streams. |
| **FR-08** | Web Domain & Platform Tagging | **Must Have** | Yes | System shall parse window titles and SMTC metadata using regex matching to classify streaming domains (YouTube, Netflix, Hotstar, Prime, etc.) or local file playback. |
| **FR-09** | Volume & Mute State Telemetry | **Must Have** | Yes | System shall query WASAPI endpoint and simple session volume to determine master volume %, stream volume %, and whether the stream is muted. |
| **FR-10** | Fullscreen & Resolution Telemetry | **Should Have** | Yes | System shall query Win32 window geometry and monitor bounds to determine if player is in true fullscreen, borderless cinema mode, or windowed mode, reporting resolution. |
| **FR-11** | Player Hardware Resource Telemetry | **Should Have** | Yes | System shall capture CPU usage percentage and Working Set memory (MB) for active media player process IDs without causing overhead. |
| **FR-12** | Power Source & Wake-Lock Inspector | **Must Have** | Yes | System shall query `GetSystemPowerStatus` for AC/Battery status and parse `powercfg -requests` to detect whether Windows display lock is asserted. |
| **FR-13** | Interactive In-Dashboard Hotkeys | **Must Have** | Yes | Terminal dashboard shall process non-blocking keystrokes: `+` (increase countdown), `-` (decrease countdown), `P` (pause sentinel), `R` (reset countdown), `Q` (quit). |
| **FR-14** | Native Windows Background Daemon & Tray | **Must Have** | Yes | System shall run in background with Windows system tray icon (pystray/Win32), dynamic icon color states (Green=Active Video, Amber=Idle, Red=Shutdown Pending), and menu controls. |
| **FR-15** | Lightweight Localhost Web Dashboard | **Must Have** | Yes | System shall host a fast, low-overhead HTTP/WebSocket server on port 8765, serving a responsive dark-theme dashboard accessible via PC and LAN smartphones. |

---

## ⚡ 4. Non-Functional Requirements (NFR)

### NFR-01: Resource Efficiency & Performance
- **CPU Utilization:** Average CPU consumption must not exceed **0.5%** on modern multicore processors (Intel 8th Gen+ / AMD Ryzen 2000+).
- **RAM Footprint:** Resident Set Size (RSS) must remain below **45 MB** during full continuous telemetry, terminal rendering, and web server operations.
- **Sensor Query Latency:** Total evaluation cycle duration (WASAPI scan + Win32 window scan + SMTC probe) must complete in under **15 milliseconds** per tick.

### NFR-02: Operating System & Binary Compatibility
- Fully compatible with **Microsoft Windows 10 (64-bit, 1903+)** and **Windows 11 (64-bit)**.
- Operates flawlessly across both modern WinRT/UWP packages (`Microsoft.Media.Player`) and classic Win32 applications (`wmplayer.exe`, `vlc.exe`, `chrome.exe`).
- Zero reliance on external heavy runtime frameworks (no Electron, no Chromium embedded, no bloated web servers).

### NFR-03: Zero-Hang & Process Cleanliness (Rule 26 Compliance)
- Clean lifecycle management: When stopping or exiting via CLI, Hotkey, Web UI, or Tray icon, all background threads, HTTP server sockets, WebSocket connections, and tray icons must cleanly terminate within **500ms** with zero lingering zombie processes.

### NFR-04: Security & Privacy
- **Localhost by Default:** Web dashboard binds to `127.0.0.1` by default. Binding to `0.0.0.0` (LAN access) requires explicit flag `--lan` and generates a secure ephemeral 4-digit PIN authentication token to prevent unauthorized LAN shutdowns.
- **Zero Cloud Leakage:** All collected telemetry and analytics are stored locally in SQLite (`video_sentinel.db`). Zero telemetry leaves the local machine.

### NFR-05: Resilience & Self-Healing
- **Audio Driver Reconnects:** Automatic recovery when audio output devices are switched, plugged, or unplugged (e.g., Bluetooth headphones disconnect).
- **Display Resolution Changes:** Window coordinate caching refreshes dynamically without crashing when monitors are connected or disconnected.

---

## 🧪 5. Acceptance Criteria (Given-When-Then Framework)

### Scenario 1: YouTube Video Playback in Chrome
- **Given:** User opens Google Chrome and plays a video on `youtube.com/watch?v=...` with sound unmuted.
- **When:** The sentinel evaluation tick executes.
- **Then:** System classifies stream as `VIDEO`, identifies domain as `YouTube`, records volume peak > 0, marks system status as `BUSY (Video Playing)`, and resets/cancels any pending auto-shutdown countdown.

### Scenario 2: Pure Audio Playback in Spotify or VLC
- **Given:** User plays an MP3 file in VLC (`track01.mp3`) or listens to music in Spotify.
- **When:** The sentinel evaluation tick executes.
- **Then:** System classifies playback as `PURE_AUDIO`, marks status as `IDLE (Pure Audio Ignored)`, begins the auto-shutdown countdown, and logs duration to pure-audio analytics without halting the power-save timer.

### Scenario 3: Video Paused or Ends
- **Given:** User was watching a movie on Netflix or VLC, and the video pauses or completes.
- **When:** The 2.5-second silent-scene smoothing decay timer expires with audio peak remaining 0.0.
- **Then:** Sentinel transitions verdict from `BUSY` to `IDLE`, begins the Auto-Shutdown Countdown HUD, displays the visual countdown bar in terminal and web dashboard, and emits a notification event.

### Scenario 4: User Aborts Shutdown via Hotkey or Web Dashboard
- **Given:** The auto-shutdown countdown is actively ticking down at 45 seconds remaining.
- **When:** User presses `R` in the terminal dashboard, or clicks "Abort Shutdown" on their smartphone via the Web UI.
- **Then:** The shutdown sequence is cancelled immediately, the countdown resets to default threshold (300s), and a visual confirmation badge `SHUTDOWN CANCELLED` is displayed.

### Scenario 5: Ghost Stream Detection
- **Given:** A background Chrome tab or minimized media player is generating audio from an invisible or minimized video window.
- **When:** The sentinel scans window attributes and finds `IsIconic(hwnd) == True` or window area == 0 while WASAPI audio is active.
- **Then:** System tags the stream as `GHOST_STREAM [Hidden/Minimized]`, displays it in the secondary stream inspector, and reports warning in the terminal and web dashboard.

### Scenario 6: System Power Source Transition (AC to Battery)
- **Given:** Laptop is unplugged from mains electricity while video is paused.
- **When:** Sentinel queries `GetSystemPowerStatus`.
- **Then:** Telemetry immediately switches from `AC Power (Charging)` to `Battery (X% Remaining)`, and adjusts idle shutdown threshold according to battery conservation profile if configured.

### Scenario 7: One-Click Audit Export
- **Given:** Sentinel has accumulated 3 days of watch-time telemetry.
- **When:** User runs `python video_idle_detector.py --export html` or clicks "Export HTML" in the Web UI.
- **Then:** System compiles a beautiful, standalone HTML report with interactive SVG charts, 24-hour heatmaps, and per-app breakdowns to `reports/video_sentinel_report_YYYY-MM-DD.html` within 200ms.

---

## 📈 6. Success Metrics & Key Performance Indicators (KPIs)

1. **Classification Accuracy:** > 99.8% precision in separating genuine video playback from pure audio files.
2. **False Shutdown Prevention:** 0 false-positive shutdowns while user is actively viewing unmuted video.
3. **Shutdown Responsiveness:** < 100ms reaction latency to manual cancellation triggers (hotkey or web button).
4. **Daemon Overhead:** Constant CPU consumption < 0.5% and RAM < 45 MB throughout 24-hour continuous burn test.
