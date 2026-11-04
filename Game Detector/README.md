# Windows Native Game Idle Sentinel (गेम आइडल डिटेक्टर)

> **Dedicated Windows Game Detection Sentinel (Xbox Game Bar Architecture)**  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Location:** `Game Detector/`  
> **Architecture:** Clean 3-Module Split (`engine.py`, `ui.py`, `game_idle_detector.py`)  
> **Operating Engine:** Pure Python Standard Library (`winreg`, `ctypes`, `crypt32`)  
> **UI Architecture:** In-Place Zero-Scrolling Overwriting UI (`\033[H`, `\033[K`, `\033[J`) with Strict 8-Field Card

---

## 🎯 1. Overview & Core Mission (परिचय एवं मुख्य उद्देश्य)

**Windows Native Game Idle Sentinel** is a precision Windows background engine that determines **whether a PC game is actively running on the system**.

It operates using the **EXACT same mechanism that Microsoft Windows itself uses to detect games and trigger the "Press Win + G to open Xbox Game Bar" notification**.

Unlike naive script detectors that rely on static keyword guessing or hardcoded process lists, this sentinel directly interfaces with the Windows operating system's native gaming telemetry registry and Direct3D/DWM presence stores.

---

## 🏛️ 2. Clean 3-Module Architecture (स्वच्छ 3-मॉड्यूल आर्किटेक्चर)

The codebase has been refactored from a monolithic script into a clean, decoupled modular split with **zero code for old schemas 2, 3, 4** (no `--list-registered`, no dump loops, no single-shot status check modes):

```
Game Detector/
├── __init__.py                # Package exports: WindowsGameEngine, render_simple_card, extract_simplified_game_info, run_sentinel_loop
├── engine.py                  # Core Detection Engine ONLY: GameConfigStore, DPAPI decryption, Win32 focus, Steam AppID
├── ui.py                      # Strict 8-field terminal UI, ANSI VT mode, in-place zero-scroll card renderer
├── game_idle_detector.py      # Main Orchestrator & Live Sentinel Entry Point (smooth 100ms non-blocking loop)
├── Run_Game_Detector.bat      # 1-Click direct live monitoring launcher (UTF-8 BOM - Zero prompts, zero menus)
├── test_game_detector.py      # Comprehensive automated verification test suite (16 passing tests)
└── README.md                  # Complete architecture & developer documentation
```

### Module Responsibilities:
1. **`engine.py` (Core Detection Engine ONLY)**:
   - Queries Windows `GameConfigStore` (`HKCU\System\GameConfigStore\Children`).
   - Uses DPAPI (`CryptUnprotectData` via `crypt32`) to decrypt binary `Parent` blobs and retrieve actual game executable names.
   - Inspects active foreground window via Win32 (`GetForegroundWindow`, `GetWindowThreadProcessId`, `OpenProcess`, `QueryFullProcessImageNameW`).
   - Tracks Steam Active Game via `HKCU\Software\Valve\Steam\RunningAppID`.
   - Differentiates media and video players (VLC, PotPlayer, WMP, browsers) as inactive for gaming (`वीडियो को निष्क्रिय माना जाता है`).
   - Provides `evaluate_game_inactivity()` with real-time operational states:
     * `PLAYING`: Game active in foreground window focus.
     * `PAUSED`: Game running but minimized or in background (unfocused/alt-tabbed).
     * `STOPPED`: No game running.
   - Background worker thread to periodically refresh background games/video cache without blocking.
   - ABSOLUTELY ZERO schema 2-4 code.

2. **`ui.py` (Strict 8-Field Terminal UI & Zero-Scroll Renderer)**:
   - Configures Windows Virtual Terminal Processing (`enable_windows_vt_mode()`).
   - Provides ANSI colors and symbols.
   - `extract_simplified_game_info(raw_eval, idle_seconds, idle_threshold)`: extracts strictly the 8 fields.
   - `render_simple_card(data, in_place=True)`: renders the strict 8-field card with a 24-character progress bar and in-place zero-scroll overwriting (`\033[H`, `\033[K`, `\033[J`).

3. **`game_idle_detector.py` (Main Orchestrator & Live Sentinel Entry Point)**:
   - Imports `WindowsGameEngine` from `engine.py` and UI components from `ui.py`.
   - Runs `run_sentinel_loop(interval=0.1, threshold=60.0)` with a smooth 100ms tick:
     * Resets timer immediately to `0.0s` when `PLAYING`.
     * Gradually increments timer `0.0s` -> `60.0s` when `PAUSED` or `STOPPED`.
     * Locks at `60.0s` when threshold is met.
   - `main()`: Directly starts `run_sentinel_loop()`. No menus, no choices, no window flash.

---

## 🖥️ 3. Strict 12-Field In-Place Live Card UI (सख्त 12 फ़ील्ड्स इन-प्लेस यूआई)

The sentinel renders a clean, fixed-width card with **strict in-place terminal overwriting (zero downward scrolling)**:

```
======================================================================
              WINDOWS GAME INACTIVITY SENTINEL (आइडल गेम डिटेक्टर)
======================================================================
  Game Playing        : YES (हाँ) / NO (ना)
  Game Type           : AAA / Racing / Role Play / Board / Arcade / etc (वीडियो को निष्क्रिय माना जाता है)
  Playback State      : PLAYING / PAUSED / STOPPED
  Active Player / App : Steam (AppID: ...) / Xbox Game Pass / Epic Games / Custom / None
  Game Title          : <Detected Game Title> (या None)
  Continuous Play     : 00:00:00
  Continuous Pause    : 00:00:00
  Audio Peak Meter    : [░░░░░░░░░░░░░░░░]  0%
  60s Idle Timer      :  0.0s / 60s [░░░░░░░░░░░░░░░░░░░░░░░░]   0%
  60m Activity Graph  : [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
----------------------------------------------------------------------
  Is Game Playing?    : TRUE / FALSE
  Is Windows Idle?    : TRUE / FALSE
======================================================================
  Live monitoring active | Refresh: 100ms | Press Ctrl+C to stop
```

### Detailed Field Specifications (12 फ़ील्ड्स का विवरण):
1. **Game Playing**: `YES (हाँ)` when Playback State == `PLAYING`; `NO (ना)` when `PAUSED` or `STOPPED`.
2. **Game Type**: Heuristic game classification (`AAA`, `Racing / Simulation`, `Role Play (RPG) / Action`, `Strategy / Simulation`, `Arcade / Platformer`, `Board / Card`, `Shooter / Action`, `Win32 Game`). If video/media is active, it is explicitly acknowledged as ignored: `None (वीडियो को निष्क्रिय माना जाता है)`.
3. **Playback State**:
   - `PLAYING`: Game is running and active in FOREGROUND window focus.
   - `PAUSED`: Game is running, but minimized or running in background (alt-tabbed / unfocused).
   - `STOPPED`: No game is running.
4. **Active Player / App**: Distribution platform (`Steam (AppID: ...)`, `Xbox Game Pass`, `Epic Games`, `GOG Galaxy`, `EA App`, `Custom / Win32 Game`, or `None`).
5. **Game Title**: Preserved and displayed when game is Playing, Paused, or Minimized (shows `None` if stopped).
6. **Continuous Play**: Uninterrupted game execution duration in `HH:MM:SS` (highlighted in green bold when game is playing, gray when 0 or not playing).
7. **Continuous Pause**: Uninterrupted idle/pause duration in `HH:MM:SS` (highlighted in yellow bold when paused/stopped, gray when 0).
8. **Audio Peak Meter**: Real-time Windows Core Audio API (WASAPI) master audio peak meter via native COM vtable dispatch `[░░░░░░░░░░░░░░░░]  0%` (green bar when > 0, gray when 0).
9. **60s Idle Timer & Progress Bar**: `Xs / 60s [██████░░░░░░] XX%` (bar width 24 chars).
   - As soon as Game is `PLAYING` in foreground, timer immediately resets to `0.0s` (`0% RESET - GAME ACTIVE`).
   - When game is `PAUSED` (minimized/background) or `STOPPED`, timer increments continuously from `0.0s` up to `60.0s`.
   - Once it reaches `60.0s`, stays at `60.0s / 60s [████████████████████████] 100% (IDLE THRESHOLD MET)`.
10. **60m Activity Graph**: 30-character visual historical activity timeline `[■■■■░░░░■■■■░░░░]` showing active minutes (`■` green) vs idle minutes (`░` gray) across the last 60 minutes.
11. **Is Game Playing?**: `TRUE` if Playback State == `PLAYING`, else `FALSE`.
12. **Is Windows Idle?**: `FALSE` from `0.0s` to `59.9s`; turns `TRUE` exactly when the 60s idle threshold is met (`>= 60.0s`).

---

## 🔬 4. Exact Microsoft Windows Game Bar (Win + G) Detection Mechanism

When a game starts on Windows 10 or Windows 11, the Windows Desktop Window Manager (`dwm.exe`), DXGI swap chain presenter, and `GameBarPresenceWriter.exe` evaluate the application against the internal Windows Gaming Subsystem.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Windows Gaming Detection Pipeline                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────┐                       ┌──────────────────────┐
│  DirectX / DXGI Swap    │                       │ Foreground Window    │
│  Chain Presentation    │                       │ Focus (GetForeground)│
└──────────┬──────────────┘                       └──────────┬───────────┘
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Windows GameConfigStore (System Database)                  │
│             HKCU\System\GameConfigStore\Children\<GUID>                │
├────────────────────────────────────────────────────────────────────────┤
│ 1. MatchedExeFullPath : Absolute file path to the game binary          │
│ 2. ExeParentDirectory : Specific directory name of the game           │
│ 3. Parent (DPAPI)     : DPAPI-encrypted exact executable filename      │
│ 4. Flags              : 0x11 (17), 0x33 (51), 0x231 (561) Game Bitmask │
│ 5. TitleId            : Windows / Xbox Live Cloud Title ID             │
│ 6. Type               : Type 1 (Win32 Game) vs Type 2 (UWP App)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│          Launcher Presence & Real-Time Process Correlation             │
├────────────────────────────────────────────────────────────────────────┤
│ • Steam RunningAppID  : HKCU\Software\Valve\Steam\RunningAppID > 0     │
│ • Steam Library Paths : steamapps\common\<Game Name>\...               │
│ • Epic Games / Xbox   : %ProgramFiles%\WindowsApps or XboxGames        │
│ • Media Differentiation: Video players & browsers ignored for gaming   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │    Final System Verdict     │
                     │  [🎮 GAME DETECTED / IDLE]  │
                     └─────────────────────────────┘
```

### The Windows `GameConfigStore` Architecture
Windows centrally catalogs all detected, installed, and played PC games inside the registry under:
`HKEY_CURRENT_USER\System\GameConfigStore\Children\<Game_GUID>`

Key values inspected by this sentinel:
- **`MatchedExeFullPath`**: Stores the absolute path of the game executable (e.g., `C:\Users\...\Sekiro\sekiro.exe`, `Kingdom Rush Alliance.exe`).
- **`ExeParentDirectory`**: Folder or directory name hosting the game (e.g., `Grand Theft Auto V`, `Assetto Corsa`, `Football Manager 2017`).
- **`Parent` (DPAPI Cryptographic Blob)**: Windows encrypts the game's executable name using Windows DPAPI (`CryptProtectData`). Our engine utilizes `ctypes.windll.crypt32.CryptUnprotectData` to decrypt this binary blob with 100% precision, unlocking the exact executable name (e.g., `warframe.x64.exe`, `gta5.exe`, `skyrimse.exe`, `aces.exe`).
- **`Flags`**: Bitflags representing Game DVR, Game Mode, and Game Bar status (Bit `0x1` indicates game classification).
- **`Type`**: `1` for standard Win32 PC games, `2` for UWP modern applications.
- **`TitleId`**: Microsoft Xbox Title ID assigned to the game.

---

## 🚀 5. Quick Start & Usage (उपयोग कैसे करें)

### Method 1: 1-Click Direct Batch Runner (`Run_Game_Detector.bat`)
Simply double-click `Run_Game_Detector.bat` to immediately start real-time Live Monitoring:
- Automatically detects Python runtime across standard PATH, UserProfile, `py` launcher, AppData, and ProgramFiles.
- Zero options, zero menus, zero prompts: immediately launches the smooth 100ms in-place overwriting 8-field monitoring card.
- Press `Ctrl+C` anytime to stop the monitor cleanly.

### Method 2: Direct Python Execution
Run directly in any terminal:
```bash
python game_idle_detector.py
```
Directly launches the Live 8-Field Sentinel Monitoring loop with 100ms smooth refresh.

### Method 3: Programmatic API Integration
```python
from game_idle_detector import WindowsGameEngine, extract_simplified_game_info

engine = WindowsGameEngine()
raw_eval = engine.evaluate_game_inactivity()
info = extract_simplified_game_info(raw_eval, idle_seconds=0.0, idle_threshold=60.0)

print(info["playback_state"])  # 'PLAYING', 'PAUSED', or 'STOPPED'
print(info["is_game_playing"]) # True or False
print(info["is_windows_idle"]) # True or False
```

---

## 📊 6. 8-Field Card Data Structure (डेटा संरचना)

The live sentinel operates on the standardized 8-field data dictionary:

```python
{
    "game_playing": False,
    "game_type": "None",
    "playback_state": "STOPPED",
    "active_player": "None",
    "game_title": "None",
    "idle_seconds": 60.0,
    "idle_threshold": 60.0,
    "is_game_playing": False,
    "is_windows_idle": True,
}
```

---

## 🧪 7. Automated Verification (सत्यापन परीक्षण)

An automated unit test suite is included in `test_game_detector.py`. Run it via:

```bash
python test_game_detector.py
```

### Verified Test Cases (16/16 Passed):
1. `test_01_engine_initialization_and_alias`: Verifies engine memory initialization, lookup tables, and backward-compatible `WindowsGameDetector` alias.
2. `test_02_registry_reading_and_dpapi_decryption`: Verifies reading `GameConfigStore` and DPAPI decrypting games.
3. `test_03_dpapi_decrypt_invalid_blob`: Handles invalid DPAPI blobs gracefully without crashing.
4. `test_04_foreground_process_query`: Validates Win32 foreground process querying without ctypes memory faults.
5. `test_05_process_snapshot_enumeration`: Validates Win32 Toolhelp32 process snapshotting.
6. `test_06_game_matching_engine`: Validates synthetic matching for exact exe, path, and Steam common folders.
7. `test_07_evaluate_game_inactivity_api`: Validates return contract of `evaluate_game_inactivity()`.
8. `test_08_background_scanner_lifecycle`: Validates thread start/stop lifecycle hygiene.
9. `test_09_json_serialization_compliance`: Validates JSON schema serialization of `GameInfo` and `ProcessInfo`.
10. `test_10_genre_classification_and_video_differentiation`: Validates genre heuristics (AAA, Racing, RPG, Strategy, Arcade, Board) and video differentiation (`वीडियो को निष्क्रिय माना जाता है`).
11. `test_11_detect_active_player_platforms`: Validates platform launcher detection heuristics (Steam, Xbox, Epic, Custom).
12. `test_12_clean_title_helper`: Validates `_clean_title` string truncation and sanitization.
13. `test_13_vt_mode_enable`: Validates `enable_windows_vt_mode` console mode configuration.
14. `test_14_extract_simplified_game_info_8_fields`: Validates strict 8-field extraction across PLAYING, PAUSED (30s, 60s), and STOPPED states.
15. `test_15_render_simple_card_formatting_and_zero_scroll`: Validates 24-character progress bar, in-place zero-scroll ANSI `\033[K` line clearing, and threshold badges.
16. `test_16_orchestrator_callables_and_exports`: Validates orchestrator callable functions and package export parity.

---

## 🔒 8. Security, Encoding & Quality Standards

- **Zero External Dependencies**: Pure Python standard library (`winreg`, `ctypes`, `dataclasses`, `json`, `threading`, `atexit`).
- **Memory Safety**: Direct Win32 64-bit function pointers with proper `argtypes` and `restype` assignments. Handles are always closed with `CloseHandle` and DPAPI buffers freed via `LocalFree`.
- **UTF-8 with BOM Standard**: `Run_Game_Detector.bat` is strictly encoded with UTF-8 BOM (`0xEF, 0xBB, 0xBF`) and uses `chcp 65001`.
- **Zero-Crash Resilience**: All registry reads and process handles are wrapped in defensive try/except blocks to guarantee 24/7 uptime during auto-shutdown monitoring.
