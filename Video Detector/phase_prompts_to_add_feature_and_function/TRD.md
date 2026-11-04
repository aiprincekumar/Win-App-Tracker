# Windows Video-Only Inactivity Sentinel - Technical Requirements Document (TRD)

> **Document Type:** Technical Requirements & Architecture Document (TRD)  
> **Project Name:** Windows Video-Only Inactivity Sentinel Enterprise Expansion  
> **Workspace Path:** `Video Detector/`  
> **Target OS:** Windows 10 & 11 (64-bit Architecture)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Standard Compliance:** Dept 02 (Solution Architecture), Universal Rules 0, 5, 8, 15, 16, 20, 22, 23, 26, 27  
> **Status:** Approved Technical Architecture  

---

## 🏛️ 1. System Architecture Overview

The Windows Video-Only Inactivity Sentinel Enterprise Expansion follows a **Modular Layered Architecture**. It combines low-latency direct Win32/COM operating system sensors, an atomic in-memory state bus, an SQLite-backed analytics engine, and twin presentation layers (Terminal ANSI HUD and Zero-Dependency Localhost Web Server).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │     Terminal ANSI HUD        │    │    Localhost Web Server      │  │
│  │   (Atomic Refresh + Keys)    │    │   (Fast HTTP / WebSocket)    │  │
│  └──────────────┬───────────────┘    └──────────────┬───────────────┘  │
│                 │                                   │                  │
│                 └─────────────────┬─────────────────┘                  │
├───────────────────────────────────┼────────────────────────────────────┤
│                       APPLICATION ENGINE LAYER                         │
│  ┌────────────────────────────────▼────────────────────────────────┐  │
│  │                 Atomic In-Memory State Bus                      │  │
│  │         (Thread-safe snapshots, Event Emitter, Clocks)          │  │
│  └───────┬────────────────────────┬─────────────────────────┬──────┘  │
│          │                        │                         │          │
│          ▼                        ▼                         ▼          │
│  ┌──────────────┐         ┌──────────────┐          ┌──────────────┐   │
│  │ AutoShutdown │         │  Analytics   │          │ System Tray  │   │
│  │  Controller  │         │  Aggregator  │          │    Daemon    │   │
│  └───────┬──────┘         └───────┬──────┘          └──────────────┘   │
├──────────┼────────────────────────┼────────────────────────────────────┤
│          │             DATA & SENSORS LAYER                            │
│          │                        ▼                                    │
│          │                ┌──────────────┐                             │
│          │                │ SQLite WAL   │                             │
│          │                │ Analytics DB │                             │
│          │                └──────────────┘                             │
│          ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    OS SENSORS SUBSYSTEM                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │   │
│  │  │   WASAPI   │  │   Win32    │  │    SMTC    │  │ Powercfg  │  │   │
│  │  │ COM Audio  │  │ Window/UIA │  │   WinRT    │  │ & Battery │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 2. Sensor & Telemetry Subsystems

### 2.1 WASAPI Audio & Volume Metering Subsystem (`modules/audio.py`)
- **Direct COM vtable Access:** Interacts with Windows Core Audio APIs without heavy third-party dependencies using `ctypes` and `comtypes`.
- **Interfaces Utilized:**
  - `IMMDeviceEnumerator` (`CLSID_MMDeviceEnumerator`): Enumerate default audio endpoint (`eRender`, `eMultimedia`).
  - `IAudioSessionManager2`: Enumerate `IAudioSessionEnumerator` to scan per-process audio sessions.
  - `IAudioMeterInformation`: Query `GetPeakValue()` for real-time instantaneous amplitude.
  - `ISimpleAudioVolume`: Query `GetMasterVolume()` (float 0.0 - 1.0) and `GetMute()` (BOOL).
  - `IAudioEndpointVolume`: Query master system speaker volume and master mute state.
- **Sampling Frequency & Smoothing:** 200ms evaluation interval; exponential decay smoothing window of 2.5 seconds to bridge dialogue pauses in movies.

### 2.2 Window Scanner & Geometry Subsystem (`modules/win32_api.py`)
- **Win32 Functions:**
  - `EnumWindows`: Enumerates top-level visible windows in under 2ms.
  - `GetWindowRect` & `GetClientRect`: Captures window dimensions and offsets.
  - `MonitorFromWindow` & `GetMonitorInfoW`: Retrieves native desktop screen bounds.
  - `IsIconic(hwnd)`: Determines if window is minimized (Ghost Stream detection).
  - `DwmGetWindowAttribute(hwnd, DWMWA_CLOAKED)`: Detects cloaked or invisible Windows 10/11 virtual desktop windows.
- **Fullscreen vs Windowed Classification Rule:**
  - True Fullscreen: Window bounds match or exceed `rcMonitor` and window style lacks standard title bar (`WS_CAPTION`).
  - Cinema / Borderless: Window width/height >= monitor width/height with zero window borders.
  - Windowed: Window area < 95% of active monitor resolution.

### 2.3 Domain & Platform Source Classifier (`modules/classifier.py`)
- High-efficiency regex matching on window titles and SMTC track metadata:
  ```python
  PLATFORM_PATTERNS = {
      'YouTube': r'(?:YouTube|youtube\.com)',
      'Netflix': r'(?:Netflix|netflix\.com)',
      'Prime Video': r'(?:Prime Video|Amazon Prime)',
      'Disney+ Hotstar': r'(?:Disney\+|Hotstar)',
      'Twitch': r'(?:Twitch|twitch\.tv)',
      'JioCinema': r'(?:JioCinema|jiocinema\.com)',
      'Crunchyroll': r'(?:Crunchyroll)',
      'Vimeo': r'(?:Vimeo)',
      'Local Video': r'\.(mp4|mkv|avi|mov|webm|flv|m4v|ts|wmv|mpg)$'
  }
  ```

### 2.4 Hardware Telemetry Subsystem (`modules/hardware_telemetry.py`)
- **Process Telemetry:** Win32 `OpenProcess` with `PROCESS_QUERY_LIMITED_INFORMATION`.
  - `GetProcessTimes`: Computes user + kernel CPU consumption percentage over delta time.
  - `K32GetProcessMemoryInfo`: Retrieves `WorkingSetSize` in Megabytes.
- **GPU Hardware Acceleration Status:**
  - Query active media player Direct3D11 / DXVA video decode handles via Win32 performance counters or DirectShow/MediaFoundation registry hooks. If hardware acceleration is active, reports `DXVA2/D3D11 (Active)`.

### 2.5 Power Source & Wake-Lock Subsystem (`modules/powercfg.py`)
- **Power Source:** Calls `kernel32.GetSystemPowerStatus(byref(sps))`.
  - `ACLineStatus`: `0` (Battery), `1` (AC mains), `255` (Unknown).
  - `BatteryLifePercent`: 0 to 100%.
- **Display Wake-Lock Detection:** Executes `powercfg -requests` in a non-blocking cached subprocess every 5 seconds, parsing the `DISPLAY:` and `SYSTEM:` sections to detect active driver/app wake-locks (e.g. `[PROCESS] \Device\HarddiskVolume3\Program Files\Google\Chrome\Application\chrome.exe`).

---

## 💾 3. Data Storage & Analytics Engine (`modules/storage.py`)

### 3.1 SQLite WAL Architecture
All persistent tracking is housed in `data/video_sentinel.db` running in `PRAGMA journal_mode=WAL` to allow concurrent readers (Web server, Exporter) while the background collector writes.

### 3.2 Database Schema
```sql
CREATE TABLE IF NOT EXISTS watch_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    app_name TEXT NOT NULL,
    window_title TEXT,
    platform TEXT NOT NULL,
    is_fullscreen BOOLEAN DEFAULT 0,
    avg_cpu_percent REAL DEFAULT 0.0,
    avg_ram_mb REAL DEFAULT 0.0,
    media_category TEXT NOT NULL CHECK(media_category IN ('VIDEO', 'PURE_AUDIO'))
);

CREATE TABLE IF NOT EXISTS hourly_activity (
    date_hour TEXT PRIMARY KEY, -- Format: 'YYYY-MM-DD-HH'
    video_seconds INTEGER DEFAULT 0,
    audio_seconds INTEGER DEFAULT 0,
    idle_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_watch_app ON watch_sessions(app_name);
CREATE INDEX IF NOT EXISTS idx_watch_start ON watch_sessions(session_start);
```

---

## 🌐 4. Localhost Web Server & API Contracts (`modules/web_server.py`)

### 4.1 Architecture
Built entirely on Python's native `http.server` and threading (or standard library WebSocket frame handler) to maintain zero external dependencies and ensure instant startup.
- **Port:** Default `8765` (`http://localhost:8765`).
- **Network Interface:** `127.0.0.1` (Default). When launched with `--lan`, binds to `0.0.0.0` with an ephemeral 4-digit PIN generated at startup.

### 4.2 REST API Specification
- `GET /api/status`: Returns instantaneous verdict, countdown status, and power state.
  ```json
  {
    "verdict": "BUSY",
    "video_playing": true,
    "confidence": 1.0,
    "primary_stream": {
      "app": "chrome.exe",
      "platform": "YouTube",
      "title": "Interstellar Main Theme Live - YouTube",
      "volume": 0.85,
      "is_muted": false,
      "fullscreen": true,
      "cpu_percent": 1.4,
      "ram_mb": 240.5
    },
    "countdown": {
      "active": false,
      "remaining_seconds": 300,
      "initial_seconds": 300
    },
    "power": {
      "ac_online": true,
      "battery_percent": 100,
      "wake_lock_active": true
    }
  }
  ```
- `POST /api/control/shutdown/abort`: Cancels active shutdown countdown immediately.
- `POST /api/control/shutdown/snooze`: Extends countdown by 15 minutes.
- `GET /api/analytics/summary`: Returns today's total watch-time, weekly aggregate, and hourly heatmap array (24 integers).

---

## 🖥️ 5. System Tray & Native Windows Daemon (`modules/tray.py`)

### 5.1 Native Lifecycle Management
- Implemented using `pystray` (with fallback to pure Win32 `Shell_NotifyIconW` via `ctypes` if external packages are restricted).
- Runs in a dedicated background daemon thread.
- **Dynamic Tray Icons:**
  - 🟢 **Green Icon:** Video Actively Playing (`BUSY`).
  - 🟡 **Amber Icon:** System Idle / Audio Only (`IDLE`).
  - 🔴 **Red Blinking Icon:** Auto-Shutdown Countdown Active (`COUNTDOWN`).
- **Context Menu Options:**
  - Show Terminal Dashboard
  - Open Web Dashboard (`http://localhost:8765`)
  - Pause Sentinel Monitoring
  - Snooze Auto-Shutdown (15 min / 30 min / 1 hour)
  - Generate Audit Report (HTML)
  - Exit Sentinel Cleanly

---

## 📐 6. Architecture Decision Records (ADRs)

### ADR-001: Storage Engine Selection (SQLite WAL vs JSON Files)
- **Decision:** Adopt embedded SQLite with Write-Ahead Logging (`WAL` mode).
- **Rationale:** High-frequency 1-second state logging causes disk write contention and corruption risks with plain JSON files. SQLite is built into Python standard library, provides zero external dependencies, guarantees ACID transactions, and enables sub-millisecond aggregation queries for 24-hour heatmaps and weekly summaries.

### ADR-002: Localhost Web Architecture (Stdlib HTTP vs FastAPI/Flask)
- **Decision:** Adopt Python's built-in `http.server` with custom REST router and Server-Sent Events (SSE) / WebSocket thread.
- **Rationale:** Eliminates heavy external dependencies (Uvicorn, Starlette, Pydantic, Flask). Keeps the entire sentinel lightweight (<45MB RAM footprint) and guarantees instant launch on any stock Python 3.8+ Windows environment.

### ADR-003: System Tray Implementation (pystray with Win32 ctypes Fallback)
- **Decision:** Use `pystray` if available, wrapped in an abstraction layer with an automated fallback to pure Win32 `ctypes.windll.shell32.Shell_NotifyIconW`.
- **Rationale:** Ensures zero failure on pristine Windows installations while providing modern system tray features.
