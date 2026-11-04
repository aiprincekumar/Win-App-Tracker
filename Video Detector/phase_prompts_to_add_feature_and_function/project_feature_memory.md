# Feature Memory & Diagnostic Ledger (Rule 20 Compliance)

> **Document Type:** Project Feature Memory & Diagnostic Ledger  
> **Project Name:** Windows Video-Only Inactivity Sentinel Enterprise Expansion  
> **Workspace Path:** `Video Detector/`  
> **Primary Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Standard Compliance:** Universal Rule 20 (Diagnostic Matrix & Memory Ledger), Universal Rule 23 (State Sync)  
> **Last Synchronized:** Phase Prompts Architecture Phase (Pre-Implementation)  

---

## 🧭 1. Architectural State Ledger & Operating Boundaries

### 1.1 Core Mission & Boundary Invariants
- **Video Playback ONLY:** The system operates strictly as a Video-Only Sentinel. Physical keyboard and mouse tracking (Meter 1) is strictly prohibited in this folder to preserve architectural separation from `keyboard_mouse_idle_detector/` and `video_and_keyboard_mouse_idle_detector/`.
- **Pure Audio Whitelist Protection:** Pure audio streams (Spotify, foobar2000, .mp3, .flac, podcasts) MUST NEVER be misclassified as video.
- **Resource Budget Constraint:** Total background CPU footprint must remain under 0.5% and RAM under 45 MB RSS.
- **Platform Integrity:** 100% native compatibility with Windows 10 (1903+) and Windows 11 64-bit.

---

## 🔍 2. 7-Column Diagnostic Matrix (Universal Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | `modules/classifier.py` | Window title parsing lacks domain classification (e.g. YouTube vs Netflix vs Local File). | Add `extract_domain_and_platform()` with regex catalog for 15+ streaming services. | Window titles are enriched with high-precision platform tags (`YouTube`, `Netflix`, `Local`). | Phase 01 | `test_classification_suite.py` |
| **02** | `modules/audio.py` | Audio meter only reads peak amplitude; lacks session volume percentage and mute detection. | Implement `ISimpleAudioVolume` and `IAudioEndpointVolume` COM queries for volume % and mute flag. | Accurately identifies whether user has muted the stream or set volume to zero. | Phase 01 | `test_audio_volume_suite.py` |
| **03** | `modules/win32_api.py` | No distinction between fullscreen cinema mode and standard windowed mode. | Query `GetWindowRect` vs `GetMonitorInfoW` and style bits (`WS_CAPTION`, `WS_THICKFRAME`). | Dashboard can report whether media is playing in true Fullscreen, Borderless, or Windowed. | Phase 01 | `test_geometry_suite.py` |
| **04** | `modules/powercfg.py` | Lacks native battery vs AC mains power source detection. | Call `kernel32.GetSystemPowerStatus` and expose AC status and battery percentage. | Enables power-aware countdown adjustment when running on battery. | Phase 01 | `test_power_suite.py` |
| **05** | `modules/storage.py` | No persistent watch-time ledger; state resets on process termination. | Implement embedded SQLite database (`video_sentinel.db`) with WAL journal mode. | Persistent daily and weekly watch-time aggregation across app sessions. | Phase 02 | `test_storage_suite.py` |
| **06** | `modules/exporter.py` | No multi-format export capability for audit logs and watch time. | Create HTML/CSV/JSON export engine with self-contained CSS/SVG charts. | Users can generate 1-click audit reports via CLI (`--export`) and Web UI. | Phase 02 | `test_exporter_suite.py` |
| **07** | `modules/dashboard.py` | Terminal dashboard lacks auto-shutdown countdown bar and multi-stream inspector. | Add ANSI countdown progress HUD, multi-stream card, and ghost stream warning table. | Rich real-time terminal operations with atomic in-place rendering. | Phase 03 | `test_dashboard_qa.py` |
| **08** | `modules/hotkeys.py` | No keyboard hotkeys to adjust countdown or pause sentinel while running in terminal. | Implement non-blocking Win32 `msvcrt.kbhit()` and `GetAsyncKeyState` event loop. | Zero-latency hotkey control (`+`, `-`, `P`, `R`, `Q`) directly in terminal. | Phase 03 | `test_hotkeys_suite.py` |
| **09** | `modules/tray.py` | App terminates when terminal is closed; no system tray daemon mode. | Build Windows system tray daemon using `pystray` with pure Win32 `Shell_NotifyIcon` fallback. | Background desktop operation with dynamic icon color indicators. | Phase 04 | `test_tray_suite.py` |
| **10** | `modules/web_server.py` | Telemetry is confined to local terminal; cannot monitor or control from phone. | Build zero-dependency native Python HTTP/WebSocket server on port 8765. | Responsive dark-theme dashboard accessible from PC and mobile on local LAN. | Phase 05 | `test_web_server_suite.py` |
| **11** | `video_idle_detector.py` | Main loop is synchronous and does not cleanly orchestrate multi-threaded subsystems. | Refactor main loop to orchestrate State Bus, Sensor Loop, Web Server, and Tray Daemon with thread barriers. | Bulletproof lifecycle with clean termination under 500ms (Rule 26 Zero-Hang). | Phase 06 | `test_expansion_suite.py` |

---

## 📦 3. Feature Registry & Implementation Catalog

| Feature ID | Feature Name | Target Modules | Status | Phase # | Verification Test |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **FEAT-01** | Daily & Weekly Watch-Time Analytics | `modules/storage.py`, `modules/analytics.py` | Pending | Phase 02 | `test_storage_suite.py` |
| **FEAT-02** | Per-App Playback Breakdown | `modules/analytics.py`, `modules/storage.py` | Pending | Phase 02 | `test_analytics_breakdown.py` |
| **FEAT-03** | Exportable Audit Reports (HTML, CSV, JSON) | `modules/exporter.py` | Pending | Phase 02 | `test_exporter_suite.py` |
| **FEAT-04** | 24-Hour Activity Heatmap & Peak Usage | `modules/analytics.py`, `modules/dashboard.py` | Pending | Phase 02 | `test_heatmap_calc.py` |
| **FEAT-05** | Ghost / Background Stream Audit | `modules/win32_api.py`, `modules/evaluator.py` | Pending | Phase 03 | `test_ghost_stream.py` |
| **FEAT-06** | Auto-Shutdown Countdown HUD & Visual Bar | `modules/countdown.py`, `modules/dashboard.py` | Pending | Phase 03 | `test_countdown_hud.py` |
| **FEAT-07** | Multi-Video Streams Inspector | `modules/evaluator.py`, `modules/dashboard.py` | Pending | Phase 03 | `test_multi_stream.py` |
| **FEAT-08** | Web Domain & Platform Source Tagging | `modules/classifier.py` | Pending | Phase 01 | `test_platform_tagging.py` |
| **FEAT-09** | Master Audio Volume & Mute State Indicator | `modules/audio.py` | Pending | Phase 01 | `test_audio_volume.py` |
| **FEAT-10** | Fullscreen vs Window Mode & Resolution | `modules/win32_api.py` | Pending | Phase 01 | `test_fullscreen_detect.py` |
| **FEAT-11** | Media Player Hardware Resource Telemetry | `modules/hardware_telemetry.py` | Pending | Phase 01 | `test_hardware_metrics.py` |
| **FEAT-12** | Power Source & Powercfg Wake-Lock Inspector | `modules/powercfg.py` | Pending | Phase 01 | `test_power_status.py` |
| **FEAT-13** | Interactive In-Dashboard Hotkeys | `modules/hotkeys.py`, `modules/dashboard.py` | Pending | Phase 03 | `test_hotkeys_loop.py` |
| **FEAT-14** | Native Windows Background Desktop App (Tray) | `modules/tray.py`, `modules/daemon.py` | Pending | Phase 04 | `test_tray_lifecycle.py` |
| **FEAT-15** | Lightweight Localhost Web Dashboard | `modules/web_server.py`, `web/` | Pending | Phase 05 | `test_web_remote.py` |

---

## 🔒 4. Operating Boundaries & Strict Invariants

1. **NO Physical Input Metering:**
   - Under no circumstances shall `GetLastInputInfo` or keyboard/mouse hook tracking be introduced into `video_idle_detector`. That capability belongs strictly in `video_and_keyboard_mouse_idle_detector/`.
2. **Zero Polling & Zero Excessive CPU:**
   - The main sensor loop must sleep between 200ms and 500ms per iteration. Total CPU usage must remain strictly below 0.5%.
3. **Graceful Zero-Hang Exits:**
   - On `Ctrl+C` or `SIGTERM`, all threads (Web server, Tray loop, Audio polling, SQLite writer) must shut down cleanly within 500ms without leaving background tasks running.
