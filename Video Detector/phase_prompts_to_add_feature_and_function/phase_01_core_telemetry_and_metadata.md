# Phase 01 Execution Prompt: Core Telemetry & Sensor Metadata Enrichment

> **Phase Number:** 01  
> **Phase Name:** Core Telemetry & Sensor Metadata Enrichment  
> **Target Workspace:** `Video Detector/`  
> **Author & Lead Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Mandatory Anchor Directives:** First load and adhere to `C:\Users\Atul Verma\.gemini\config\rules\02_solution_architecture_dept.md`, `06_backend_api_engineering_dept.md`, `08_quality_assurance_testing_dept.md`, and `C:\Users\Atul Verma\.gemini\memory.md` before executing instructions.  
> **Encoding Mandate:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all created/edited files.  
> **Git Cadence:** Autonomous local micro-commit immediately upon completion under developer Atul Verma.  

---

## 🎯 1. Phase Objective & Executive Scope

Phase 01 enriches the baseline Windows Video-Only Inactivity Sentinel with high-precision contextual metadata without disturbing its proven core video-vs-audio classification engine. Upon completing this phase, every evaluation cycle will capture:
1. **Web Domain & Platform Source Tagging (FEAT-08):** Extract and classify streaming services (YouTube, Netflix, Prime Video, Disney+ Hotstar, Twitch, JioCinema, Crunchyroll, Local Files).
2. **Master Audio Volume & Mute State (FEAT-09):** Detect master audio endpoint volume %, per-app session volume %, and mute status via WASAPI COM.
3. **Fullscreen vs Window Mode & Resolution (FEAT-10):** Differentiate Cinema/Fullscreen from Windowed playback, capturing window rect and monitor resolution.
4. **Media Player Hardware Resource Telemetry (FEAT-11):** Capture CPU usage % and Working Set RAM (MB) for active media player processes.
5. **System Power Source & Powercfg Wake-Lock Inspector (FEAT-12):** Query `GetSystemPowerStatus` for AC mains vs Battery (%) and inspect `powercfg -requests` for display/system sleep locks.

---

## 📁 2. Impacted Modules & Target File Topology

- **Modify:** `modules/classifier.py` (Add domain/platform extraction rules).
- **Modify:** `modules/audio.py` (Add volume % and mute detection via `ISimpleAudioVolume` & `IAudioEndpointVolume`).
- **Modify:** `modules/win32_api.py` (Add geometry inspection, monitor bounding, and fullscreen classifier).
- **Modify:** `modules/powercfg.py` (Add `GetSystemPowerStatus` AC/Battery inspection).
- **Create:** `modules/hardware_telemetry.py` (Low-overhead CPU% and RAM MB reader for target PIDs).
- **Modify:** `modules/evaluator.py` (Integrate new telemetry into `MediaState` dataclass).
- **Create:** `test_phase01_telemetry_suite.py` (Standalone verification test suite).

---

## 🛠️ 3. Detailed Step-by-Step Implementation Instructions

### Step 1.1: Web Domain & Platform Source Classifier (`modules/classifier.py`)
1. Extend `modules/classifier.py` with an authoritative catalog of video streaming platform regex patterns:
   ```python
   PLATFORM_PATTERNS = [
       (r'youtube\.com|YouTube', 'YouTube'),
       (r'netflix\.com|Netflix', 'Netflix'),
       (r'primevideo\.com|Amazon Prime|Prime Video', 'Prime Video'),
       (r'hotstar\.com|Disney\+|Disney\+ Hotstar', 'Disney+ Hotstar'),
       (r'twitch\.tv|Twitch', 'Twitch'),
       (r'jiocinema\.com|JioCinema', 'JioCinema'),
       (r'crunchyroll\.com|Crunchyroll', 'Crunchyroll'),
       (r'vimeo\.com|Vimeo', 'Vimeo'),
       (r'\.(mp4|mkv|avi|mov|webm|flv|m4v|ts|wmv|mpg)$', 'Local Video File'),
   ]
   ```
2. Implement `extract_platform_tag(window_title: str, process_name: str) -> str`:
   - Matches `window_title` against `PLATFORM_PATTERNS`.
   - If no web domain matches, but process is a known player (`vlc.exe`, `wmplayer.exe`, `potplayer64.exe`, `mpc-hc64.exe`, `mpv.exe`), inspect the title for file extension. If video file extension is found, return `'Local Video File'`.
   - If title contains pure audio extension (.mp3, .flac, etc.), return `'Local Audio File'`.
   - If player is `spotify.exe`, return `'Spotify'`.
   - Default return: `'Web Stream'` or `'Generic Player'`.

### Step 1.2: Master Audio Volume & Mute Detection (`modules/audio.py`)
1. In `modules/audio.py`, query `IAudioEndpointVolume` from default audio endpoint:
   - Query master system volume float (`0.0` - `1.0`) and convert to percentage (0 - 100%).
   - Query master mute state (`GetMute(byref(is_muted))`).
2. In the WASAPI per-process session enumeration loop:
   - Query `ISimpleAudioVolume` interface from `IAudioSessionControl`:
     ```python
     simple_vol = session.QueryInterface(ISimpleAudioVolume)
     session_vol = simple_vol.GetMasterVolume() # float 0.0 - 1.0
     session_muted = simple_vol.GetMute()       # BOOL
     ```
3. Return `volume_info`:
   - `master_volume_percent`: `int` (e.g. 75)
   - `master_muted`: `bool`
   - `session_volume_percent`: `int`
   - `session_muted`: `bool`

### Step 1.3: Fullscreen vs Windowed Geometry Inspector (`modules/win32_api.py`)
1. In `modules/win32_api.py`, implement `get_window_display_mode(hwnd: int) -> dict`:
   - Call `GetWindowRect(hwnd, byref(rect))` to get `(left, top, right, bottom)`.
   - Call `MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST)`.
   - Call `GetMonitorInfoW(hMonitor, byref(monitor_info))` to get monitor bounds `rcMonitor` and work area `rcWork`.
   - Calculate window width/height and monitor width/height.
   - Classification logic:
     - If `(right - left) >= mon_width` and `(bottom - top) >= mon_height`:
       - Check window style via `GetWindowLongW(hwnd, GWL_STYLE)`: if `WS_CAPTION` is absent, mark as `'FULLSCREEN'` (Cinema Mode).
       - If `WS_CAPTION` is present, mark as `'BORDERLESS_MAXIMIZED'`.
     - Else: mark as `'WINDOWED'`.
   - Return `{ "mode": mode, "width": w, "height": h, "resolution": f"{w}x{h}", "is_fullscreen": mode == "FULLSCREEN" }`.

### Step 1.4: Media Player Hardware Telemetry (`modules/hardware_telemetry.py`)
1. Create `modules/hardware_telemetry.py`:
   - Implement `get_process_resource_usage(pid: int) -> dict`:
     - Opens process handle with `PROCESS_QUERY_LIMITED_INFORMATION`.
     - Calls `K32GetProcessMemoryInfo` to retrieve `WorkingSetSize` (convert bytes to MB).
     - Calls `GetProcessTimes` on two successive intervals to calculate user + kernel CPU percent (cache previous times in a dictionary keyed by PID).
     - Hardware acceleration detection: Check if player module loads `d3d11.dll`, `dxva2.dll`, or `mf.dll` via `EnumProcessModules` or registry. If loaded, return `hw_accel="DXVA2/D3D11"`, else `"Software"`.
     - Returns `{ "cpu_percent": float, "ram_mb": float, "hw_accel": str }`.
   - Ensure exceptions are cleanly caught (`psutil` can be used if available, or direct Win32 `ctypes` fallback so it works 100% without dependencies).

### Step 1.5: Power Source & Powercfg Inspector (`modules/powercfg.py`)
1. Extend `modules/powercfg.py` with `get_system_power_status() -> dict`:
   - Define `SYSTEM_POWER_STATUS` ctypes Structure:
     ```python
     class SYSTEM_POWER_STATUS(ctypes.Structure):
         _fields_ = [
             ('ACLineStatus', ctypes.c_byte),
             ('BatteryFlag', ctypes.c_byte),
             ('BatteryLifePercent', ctypes.c_byte),
             ('SystemStatusFlag', ctypes.c_byte),
             ('BatteryLifeTime', ctypes.c_ulong),
             ('BatteryFullLifeTime', ctypes.c_ulong),
         ]
     ```
   - Call `ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(sps))`.
   - Parse `ACLineStatus`: `1` -> `"AC Mains (Charging)"`, `0` -> `"Battery"`, `255` -> `"Unknown"`.
   - Parse `BatteryLifePercent`: integer 0 - 100% (or `None` if desktop without battery).
2. Retain existing `parse_powercfg_requests()` for `[DISPLAY]` and `[SYSTEM]` wake-lock analysis.

### Step 1.6: Integrate into Evaluator State (`modules/evaluator.py`)
1. Update `MediaVerdict` dataclass in `modules/evaluator.py` to house the enriched metadata fields:
   - `platform_tag: str`
   - `master_volume: int`
   - `is_muted: bool`
   - `display_mode: str`
   - `resolution: str`
   - `cpu_percent: float`
   - `ram_mb: float`
   - `hw_accel: str`
   - `power_source: str`
   - `battery_percent: Optional[int]`
   - `display_wake_lock: bool`
2. Ensure defaults are gracefully provided so existing consumers never receive `None` exceptions.

---

## 🧪 4. Verification & QA Testing Gate

1. Create and execute test suite `test_phase01_telemetry_suite.py`:
   ```bash
   python test_phase01_telemetry_suite.py
   ```
2. Acceptance Criteria:
   - Platform extraction correctly identifies YouTube, Netflix, Hotstar, and Local .mp4 files with 100% accuracy.
   - Master volume and mute state return valid integer percentages (0-100) and boolean without COM exceptions.
   - Window geometry correctly identifies desktop bounds and fullscreen states.
   - Power status correctly reflects AC mains on workstation or battery percentage on laptop.
   - Sensor loop cycle duration remains under **15 milliseconds**.

---

## 💾 5. Autonomous Local Commit & Rule 15 Protocol

1. Perform local git commit using developer identity Atul Verma:
   ```bash
   git add modules/ test_phase01_telemetry_suite.py
   git commit -m "feat(telemetry): implement Phase 01 core telemetry, platform tagging, volume, geometry, and powercfg"
   ```
2. Capture commit hash via `git log -1 --format="%h - %s"`.
3. Notify user: `"हाँ, लोकल में कमिट हो चुका है [commit_hash]"`.
4. Keep remote push locked per Rule 15.
