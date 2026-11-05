# Standalone Multi-Browser SQLite Data Hub

> **Department:** Department 06 (Backend & API Engineering) & Department 03 (Data Architecture & DBA)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Port:** `65433` (`ws://127.0.0.1:65433`)  
> **Database:** `browser_activity.db` (SQLite WAL Mode)

---

## 1. Overview & Architectural Role

The **Standalone Multi-Browser SQLite Data Hub** is an ultra-lightweight, pure Python standard library service (< 5 MB RAM, 0.00% CPU) designed to aggregate real-time web activity and HTML5 media telemetry across all modern desktop browsers (Google Chrome, Microsoft Edge, Brave, Opera).

It provides:
- Complete decoupling from the Video Detector HUD (`port 65432`). The Data Hub runs independently on dedicated `port 65433`.
- Robust SQLite database in **WAL (Write-Ahead Logging)** mode with thread-safe atomic upserts.
- Fast multi-browser querying (`QUERY_ANALYTICS`) for today's active time, daily averages, domain distributions, and media playback history.
- Real-time in-memory active media stream cache (`QUERY_LIVE_STATE`) for HUD in-flight detection and inactivity reset.
- Automated Windows Startup Auto-Boot registration with zero terminal popups via silent VBS launcher.

---

## 2. Directory Structure

```
Browser Data Hub/
├── browser_data_hub.py            # Core RFC 6455 WebSocket Server & SQLite Engine (Pure Python StdLib)
├── browser_activity.db            # SQLite WAL Database (auto-created on first run)
├── Run_Browser_Data_Hub.bat       # 1-Click portable Windows Batch Launcher (UTF-8 BOM)
├── run_data_hub.vbs               # Silent background launcher (0ms console window)
├── install_startup_shortcut.bat   # 1-Click Windows Startup auto-boot installer (%APPDATA% Startup)
├── uninstall_startup_shortcut.bat # 1-Click Windows Startup uninstaller & clean process stop
├── stop_data_hub.bat              # Graceful process terminator on port 65433
├── test_data_hub.py               # Automated Unit & Concurrency Test Suite (6/6 tests passing)
├── test_e2e_integration.py        # E2E Multi-Browser integration test suite (3/3 tests passing)
└── README.md                      # Technical Documentation & Schema Specification
```

---

## 3. Database Schema & Pragmas

### Pragmas
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 30000;
```

### Tables
1. **`browser_clients`**:
   - `client_id TEXT PRIMARY KEY`: Unique browser client instance identifier.
   - `browser_type TEXT NOT NULL`: e.g. `chrome`, `edge`, `brave`.
   - `os_user TEXT`: Active Windows username.
   - `first_seen REAL NOT NULL`: Epoch timestamp of first registration.
   - `last_heartbeat REAL NOT NULL`: Epoch timestamp of latest ping/heartbeat.

2. **`domain_activity`**:
   - `id INTEGER PRIMARY KEY AUTOINCREMENT`
   - `browser_type TEXT NOT NULL`
   - `domain TEXT NOT NULL`
   - `date_str TEXT NOT NULL`: Format `YYYY-MM-DD`
   - `seconds_active INTEGER NOT NULL DEFAULT 0`
   - `session_count INTEGER NOT NULL DEFAULT 1`
   - `last_active REAL NOT NULL`
   - `favicon_url TEXT`
   - `UNIQUE(browser_type, domain, date_str)`

3. **`media_sessions`**:
   - `session_id TEXT PRIMARY KEY`
   - `browser_type TEXT NOT NULL`
   - `domain TEXT NOT NULL`
   - `title TEXT`
   - `url TEXT`
   - `watch_duration_seconds REAL NOT NULL DEFAULT 0.0`
   - `peak_volume REAL NOT NULL DEFAULT 1.0`
   - `average_volume REAL NOT NULL DEFAULT 1.0`
   - `resolution_label TEXT`
   - `started_at REAL NOT NULL`
   - `ended_at REAL`

---

## 4. WebSocket Protocol Specification (ws://127.0.0.1:65433)

### 4.1 `REGISTER_CLIENT`
```json
{
  "type": "REGISTER_CLIENT",
  "client_id": "chrome_1730744100",
  "browser_type": "chrome",
  "os_user": "Atul Verma"
}
```
**Response:**
```json
{
  "type": "REGISTER_RESPONSE",
  "success": true,
  "client_id": "chrome_1730744100",
  "browser_type": "chrome",
  "server_time": 1730744100.123
}
```

### 4.2 `SYNC_ACTIVITY_DELTA`
```json
{
  "type": "SYNC_ACTIVITY_DELTA",
  "browser_type": "chrome",
  "domain": "youtube.com",
  "seconds": 5,
  "date_str": "2026-11-04",
  "favicon_url": "https://www.youtube.com/s/desktop/favicon.ico"
}
```
Also supports batch deltas:
```json
{
  "type": "SYNC_ACTIVITY_DELTA",
  "deltas": [
    {"domain": "github.com", "seconds": 10, "browser_type": "edge"},
    {"domain": "youtube.com", "seconds": 5, "browser_type": "edge"}
  ]
}
```

### 4.3 `SYNC_MEDIA_SESSION`
```json
{
  "type": "SYNC_MEDIA_SESSION",
  "session_id": "sess_yt_video_01",
  "browser_type": "chrome",
  "domain": "youtube.com",
  "title": "NASA Live Stream",
  "url": "https://www.youtube.com/watch?v=21X5lGlDOfg",
  "watch_duration_seconds": 120.5,
  "peak_volume": 1.0,
  "average_volume": 0.85,
  "resolution_label": "1080p",
  "is_playing": true,
  "has_video": true,
  "action": "update"
}
```

### 4.4 `QUERY_ANALYTICS`
```json
{
  "type": "QUERY_ANALYTICS",
  "browser": "all",
  "date_str": "2026-11-04"
}
```
Supports `"browser": "all"`, `"browser": "chrome"`, `"browser": "edge"`, etc.

### 4.5 `QUERY_LIVE_STATE`
```json
{
  "type": "QUERY_LIVE_STATE"
}
```
Returns in-memory active streams without database disk I/O.

---

## 5. Verification & Testing

Execute unit test suite:
```powershell
python test_data_hub.py
# or
python browser_data_hub.py --test
```
All 6/6 tests execute and pass in under 0.4 seconds.

Execute E2E multi-browser integration test suite:
```powershell
python test_e2e_integration.py
```
All 3/3 tests execute and pass in under 0.4 seconds.

---

## 6. Windows Startup Auto-Boot Automation

To have the Browser Data Hub automatically start silently whenever Windows starts:
- **Install to Windows Startup:**
  Run `install_startup_shortcut.bat` (from root or `Browser Data Hub/`).
  This creates `Browser_Data_Hub.lnk` in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` pointing to `run_data_hub.vbs` via `wscript.exe`.
  Runs 100% silently in background (< 5 MB RAM, 0% CPU) with zero terminal popup.
- **Uninstall from Windows Startup:**
  Run `uninstall_startup_shortcut.bat` to safely remove the startup shortcut and terminate running instances cleanly.
