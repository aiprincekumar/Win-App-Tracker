# Windows Native Keyboard & Mouse Idle Sentinel (कीबोर्ड और माउस आइडल डिटेक्टर)

> **Dedicated Physical Input Inactivity Sentinel (Win32 Architecture)**  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Location:** `Keyboard and Mouse Detector/`  
> **Operating Engine:** Pure Python Standard Library (`ctypes`, `wintypes` via Win32 `GetLastInputInfo`)  
> **UI Architecture:** In-Place Zero-Scrolling Overwriting UI (`\033[H`, `\033[K`, `\033[J`) with 70-Character Standardized Card

---

## 🎯 1. Overview & Core Mission (परिचय एवं मुख्य उद्देश्य)

**Windows Native Keyboard & Mouse Idle Sentinel** tracks **physical keyboard and mouse inactivity** on Windows systems with sub-millisecond precision and 0% CPU overhead.

It specifically monitors physical user interaction via the Win32 `GetLastInputInfo` system call. It completely bypasses all audio, video, media player, and background processing states, providing a dedicated, pure user-input telemetry sentinel.

---

## 🏛️ 2. Architectural Features & Dashboard Standards

```
Keyboard and Mouse Detector/
├── keyboard_mouse_detector.py      # Main Core Sentinel & In-Place Terminal UI
├── keyboard_mouse_idle_detector.py # Backward-compatible entry point
├── Run_Keyboard_Mouse_Detector.bat # 1-Click direct launcher (UTF-8 BOM)
├── test_keyboard_mouse_detector.py # Automated QA test suite (15 passing unit tests)
└── README.md                       # Comprehensive bilingual documentation
```

### Key Capabilities:
1. **Dynamic Individual Input Source Detection (Keyboard vs Mouse):**
   - Distinguishes physical **Keyboard** from **Mouse** activity dynamically using Windows Low-Level Hooks (`WH_KEYBOARD_LL = 13` and `WH_MOUSE_LL = 14`) with a daemon message pump thread.
   - Robust hybrid fallback: tracks cursor position movement (`GetCursorPos`) and mouse buttons (`GetAsyncKeyState`) vs `GetLastInputInfo`.
   - Distinct real-time source states:
     * `Keyboard (कीबोर्ड)`: Active physical keyboard typing (`input_source_raw: "KEYBOARD"`).
     * `Mouse (माउस)`: Active physical mouse movement/clicks (`input_source_raw: "MOUSE"`).
     * `Keyboard + Mouse (कीबोर्ड और माउस)`: Both devices actively used concurrently (`input_source_raw: "KEYBOARD_AND_MOUSE"`).
     * `None (कोई इनपुट नहीं)`: Neither device active (idle buffer pending or idle threshold reached, `input_source_raw: "NONE"`).
   - Preserves `last_active_source` across idle cycles.
2. **In-Place Zero-Scrolling Terminal Dashboard:**
   - Smooth ANSI terminal rendering using Windows Virtual Terminal Mode (`\033[H`, `\033[K`, `\033[J`).
   - Hidden blinking cursor on startup with clean `atexit` restoration.
   - Colorized dynamic device badges (Bold Green for active devices, Gray for None).
3. **Continuous Duration & Inactivity Telemetry:**
   - Tracks continuous active duration and continuous inactive duration (`HH:MM:SS`).
   - Maintains a 60-minute rolling historical activity bar (`[■■■■░░░░■■■■░░░░]`).
4. **Strict 60-Second Inactivity Lock:**
   - While idle duration < threshold (default `60.0s`), `Is Windows Idle?` remains **`FALSE`**.
   - Only when user has been completely inactive for `>= 60.0s`, `Is Windows Idle?` becomes **`TRUE`**.
5. **CLI & Automation Support:**
   - `--once`: Single-check evaluation exiting with code `0` (Idle) or `1` (Active/Busy).
   - `--json`: Machine-readable JSON output for automated scripting and IPC.
   - `--threshold`: Custom inactivity timeout (default: `60.0` seconds).
   - `--interval`: Fast poll interval (default: `0.1` seconds).

---

## 📊 3. Terminal Dashboard Interface

```
======================================================================
     WINDOWS KEYBOARD & MOUSE INACTIVITY SENTINEL (कीबोर्ड और माउस)
======================================================================
  User Active         : YES (हाँ) / NO (ना)
  Input Source        : Keyboard (कीबोर्ड) / Mouse (माउस) / None (कोई इनपुट नहीं)
  Activity State      : ACTIVE / INACTIVE / IDLE
  Input Status        : Active (Keyboard in active physical use)
  Continuous Active   : 00:03:14
  Continuous Inactive : 00:00:00
  Input Activity Meter: [████████████████] 100%
  60s Idle Timer      :  0.0s / 60s [░░░░░░░░░░░░░░░░░░░░░░░░]   0% (RESET - INPUT ACTIVE)
  60m Activity Graph  : [■■■■■■■■░░░░░░░░■■■■■■■■░░░░]
----------------------------------------------------------------------
  Is User Active?     : TRUE / FALSE
  Is Windows Idle?    : TRUE / FALSE (60s पूरा होने पर TRUE, 0-59.9s तक FALSE)
======================================================================
```

---

## 🚀 4. How to Run & Verify

### 1-Click Launch:
Double-click `Run_Keyboard_Mouse_Detector.bat`.

### Command Line:
```powershell
# Continuous live in-place monitoring (0.1s update)
python keyboard_mouse_detector.py

# Single-check verification
python keyboard_mouse_detector.py --once

# Structured JSON output
python keyboard_mouse_detector.py --json

# Run unit tests
python test_keyboard_mouse_detector.py
```
