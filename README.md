# Win App Tracker

> **Universal Windows Activity, Inactivity & Media Playback Sentinel Suite**  
> **Lead Architect & Developer:** Atul Verma ([@aiprincekumar](https://github.com/aiprincekumar) / `aiprincekumar010100@gmail.com`)  
> **Architecture:** 100% Dynamic, Zero-Scan, Offline-First Modular Monorepo  
> **Supported Platforms:** Windows 10 & Windows 11 (x64)

---

## 🌟 Executive Summary

**Win App Tracker** is a comprehensive, production-grade telemetry and inactivity detection ecosystem for Microsoft Windows. Designed for extreme reliability, offline privacy, and zero cognitive bloat, the suite provides specialized sentinels that accurately detect:

1. **AI Agent Activity:** Anti-Gravity coding agent brain transcripts, tools in flight, and user-response gates.
2. **Video Playback & Desktop HUD:** Cyber-Glass translucent desktop HUD overlay and multi-player video playback detection across 12+ desktop players and UWP apps.
3. **Audio Playback:** WASAPI session telemetry and peak meter detection across audio endpoints.
4. **Browser Telemetry & History:** Multi-browser Chrome/Edge/Firefox MV3 extension paired with a standalone SQLite Data Hub daemon over RFC 6455 WebSockets.
5. **Gaming Activity:** Fullscreen DirectX, Vulkan, and OpenGL 3D game detection.
6. **Input Hardware Idle:** High-precision Win32 `GetLastInputInfo` keyboard and mouse inactivity tracking.

---

## 🏛️ System Architecture & Subsystem Catalog

```
Win App Tracker/
├── Anti-Gravity Detector/       # AI coding agent brain & session monitor
├── Audio Detector/              # WASAPI audio endpoint & WMP sentinel
├── Video Detector HUD/          # Cyber-Glass desktop HUD overlay & master sentinel
├── Video Detector/              # Terminal-based standalone video playback detector
├── Browser Detection/           # Chrome / Edge / Firefox MV3 Sentinel Extension
├── Browser Data Hub/            # Standalone SQLite WebSocket Hub (port 65433)
├── Game Detector/               # Fullscreen 3D game engine detector
├── Keyboard and Mouse Detector/ # Win32 physical input idle tracker
└── archive/                     # Legacy Windows Idle Detector baseline
```

### 1. 🤖 Anti-Gravity Detector (`Anti-Gravity Detector/`)
- Inspects Google AntiGravity AI coding agent brain sessions (`%USERPROFILE%\.gemini\antigravity\brain`).
- Detects agent operational states: `WORKING` (executing tools/subagents), `WAITING_USER` (waiting for interactive user prompt), `SETTLING` (cooldown buffer), and `COMPLETED`.
- In-place ANSI terminal UI with zero scroll jitter (`Run_AntiGravity_Detector.bat`).

### 2. 🎬 Video Detector HUD (`Video Detector HUD/`)
- **Cyber-Glass Native Desktop HUD:** Translucent, always-on-top Win32 GDI overlay with 20px magnetic docking and edge snapping.
- **3 Operating Modes:** Collapse (28px header), Mini (90px card), and Normal (460px 7-section view).
- **Player Fleet Detection:** Native state and title extraction for VLC, MPC-HC, MPC-BE, PotPlayer, MPV, GOM Player, KMPlayer, 5KPlayer, BSPlayer, Kodi, Windows Media Player (Classic & Modern), and Films & TV (UWP).
- **Protocol & Native Messaging Host:** Custom `videohud://` Windows URI handler and Chrome/Edge native messaging integration.
- **Launchers:** `Run_Video_Detector_HUD.bat` and silent `run_hud.vbs`.

### 3. 🌐 Browser Telemetry Suite (`Browser Detection/` & `Browser Data Hub/`)
- **Browser Detection Extension:** Manifest V3 extension for Chromium and Firefox. Hooks into HTML5 `<video>` and `<audio>`, monitors volume, speed (0.25x - 2.0x), tracks per-domain active time, and provides an interactive Dashboard with English & Hindi dual-language support.
- **Browser Data Hub Service:** Standalone background daemon (`Run_Browser_Data_Hub.bat` or `run_data_hub.vbs`) operating an RFC 6455 WebSocket server on `127.0.0.1:65433`. Persists all web sessions into thread-safe WAL-mode SQLite database (`browser_activity.db`).

### 4. 🔊 Audio Detector (`Audio Detector/`)
- Hardware audio endpoint monitoring via Core Audio WASAPI interfaces.
- Differentiates between pure music/audio playback and video soundtracks.
- Real-time peak level and silence threshold detection.

### 5. 🎮 Game Detector (`Game Detector/`)
- Real-time detection of foreground 3D game processes.
- Window state, DirectX/OpenGL fullscreen exclusivity evaluation, and game idle determination.

### 6. ⌨️ Keyboard & Mouse Detector (`Keyboard and Mouse Detector/`)
- Direct Win32 `GetLastInputInfo` physical input polling.
- Microsecond-accurate idle time computation with zero CPU overhead.

---

## ⚡ 100% Dynamic & Portable Execution Guarantee

Every script, batch launcher, PowerShell runner, and Python module in **Win App Tracker** is engineered to be **100% portable and dynamic**:

- **No Hardcoded Machine Paths:** Resolves user profiles dynamically via `%USERPROFILE%`, `Path.home()`, and `%~dp0`.
- **Any Drive or Folder:** Can reside on `C:`, `D:`, `E:`, external drives, or custom-named directories without modification.
- **Automatic Python Discovery:** Launchers automatically detect virtual environments (`.venv`), user local binaries (`%USERPROFILE%\.local\bin`), or system PATH runtimes.
- **Offline-First Security:** Zero external cloud dependencies, zero telemetry tracking to 3rd-party servers, and 100% local SQLite storage.

---

## 🚀 Quick Start Guide

### Prerequisites
- Windows 10 or Windows 11 (64-bit)
- Python 3.10+ (standard installation or virtualenv)
- Node.js (optional, for browser extension test suites)

### 1-Click Launchers
Simply double-click any launcher in Windows Explorer:

| Component | 1-Click Launcher | Description |
| :--- | :--- | :--- |
| **Video Detector HUD** | [`Video Detector HUD/Run_Video_Detector_HUD.bat`](file:///Video%20Detector%20HUD/Run_Video_Detector_HUD.bat) | Launches Desktop Cyber-Glass HUD overlay |
| **Browser Data Hub** | [`Browser Data Hub/Run_Browser_Data_Hub.bat`](file:///Browser%20Data%20Hub/Run_Browser_Data_Hub.bat) | Starts SQLite WebSocket Data Hub service (port 65433) |
| **Anti-Gravity Sentinel** | [`Anti-Gravity Detector/Run_AntiGravity_Detector.bat`](file:///Anti-Gravity%20Detector/Run_AntiGravity_Detector.bat) | Starts live AI agent session monitor |
| **Audio Sentinel** | [`Audio Detector/Run_Audio_Detector.bat`](file:///Audio%20Detector/Run_Audio_Detector.bat) | Starts live WASAPI audio activity monitor |
| **Game Sentinel** | [`Game Detector/Run_Game_Detector.bat`](file:///Game%20Detector/Run_Game_Detector.bat) | Starts live 3D game activity monitor |
| **Keyboard/Mouse Sentinel** | [`Keyboard and Mouse Detector/Run_Keyboard_Mouse_Detector.bat`](file:///Keyboard%20and%20Mouse%20Detector/Run_Keyboard_Mouse_Detector.bat) | Starts physical input idle timer |

### Installing the Browser Extension
1. Open Google Chrome, Brave, or Microsoft Edge and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in upper right).
3. Click **Load unpacked** and select the folder:
   ```
   Win App Tracker\Browser Detection
   ```
4. Click the extension icon to view real-time media telemetry, active tabs, and daily browsing analytics.

---

## 🧪 Automated Testing & Verification

Run automated test matrices across subsystems:

```powershell
# Run Browser Data Hub tests (9 tests)
python -m unittest discover -s "Browser Data Hub" -p "test_*.py"

# Run Video Detector HUD tests (98 tests)
python -m unittest discover -s "Video Detector HUD/tests" -p "test_*.py"

# Run Browser Extension JS tests (6 test suites)
node "Browser Detection/tests/test_media_tab_switch_and_i18n.js"
node "Browser Detection/tests/test_tab_switch_and_storage_persistence.js"
node "Browser Detection/tests/test_event_deduplication.js"
node "Browser Detection/tests/test_extension_delta_sync.js"
node "Browser Detection/tests/test_dashboard_multi_browser_filter.js"
node "Browser Detection/tests/test_jump_to_media_tab_and_bottom_toast.js"
```

---

## 🔒 Security & Privacy

- **Zero Secret Leaks:** Built-in secret audits via `gitleaks`.
- **Local Data Only:** All analytics and browser time logs are stored locally in SQLite (`browser_activity.db`, `analytics.db`).
- **No External Network Calls:** Detectors poll local Win32 OS APIs and localhost loopback ports (`127.0.0.1`) only.

---

## 👤 Author & Maintainer

- **Developer:** Atul Verma
- **GitHub:** [@aiprincekumar](https://github.com/aiprincekumar)
- **Email:** `aiprincekumar010100@gmail.com`
- **License:** MIT License
