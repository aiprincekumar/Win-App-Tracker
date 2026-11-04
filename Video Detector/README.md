# Windows Video-Only Inactivity Sentinel (वीडियो आइडल डिटेक्टर)

> **Dedicated Video State Sentinel for Windows 10 & 11**  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Location:** `Video Detector/`

---

## 🎯 1. Overview & Core Mission

**Windows Video-Only Inactivity Sentinel** is a precision Windows monitoring engine dedicated exclusively to determining **whether VIDEO is actively playing on the system**.

Unlike simple process-name checkers, this sentinel **does NOT assume that a media player is playing video simply because it is open**. It implements a deep multi-signal classification engine that accurately differentiates between **VIDEO playback** and **PURE AUDIO playback** across all media players and web browsers.

### 🛡️ Key Distinction Across Folders
| Folder | Focus / Responsibility | Scope |
| :--- | :--- | :--- |
| **`video_idle_detector/`** *(This Folder)* | **Video Playback ONLY** | Detects active video streams vs pure audio vs paused video. Physical keyboard/mouse is not tracked. |
| **`video_and_keyboard_mouse_idle_detector/`** | **Combined Video + Input** | Tracks physical Keyboard & Mouse inactivity threshold (e.g. 60s) AND pauses timer during active video. |
| **`keyboard_mouse_idle_detector/`** | **Physical Input ONLY** | Tracks Win32 `GetLastInputInfo` keyboard and mouse inactivity countdown. |
| **`windows_audio_detector/`** | **Audio Playback Sentinel** | Detects active Windows audio playback sessions via native WASAPI COM metering; ignores video playback. |

---

## 🔬 2. Deep "Video vs Audio" Differentiation Architecture

### The Problem Solved
Media players such as **VLC, PotPlayer, Windows Media Player, MPC-HC, MPC-BE, KMPlayer, and MPV** can play:
1. **Pure Audio:** MP3, FLAC, WAV, AAC, M4A, OGG, WMA, OPUS, ALAC, AIFF.
2. **Video:** MP4, MKV, AVI, MOV, WEBM, FLV, M4V, TS, WMV.

If a user plays a song in VLC (e.g., `Taylor Swift - Blank Space.mp3`), a naive detector would assume video is playing and falsely declare the system as BUSY.

### Multi-Signal Decision Engine
This sentinel inspects multiple deterministic OS signals:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Windows Media Detection Engine                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────┐                         ┌──────────────────────┐
│  WASAPI Audio Stream  │                         │ In-Memory Pure Win32 │
│  Real-Time Metering   │                         │ EnumWindows Scanner  │
│  (Direct COM vtable)  │                         │ (<2ms Latency)       │
└──────────┬────────────┘                         └──────────┬───────────┘
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Signal Classification & Correlation         │
       ├─────────────────────────────────────────────────────────┤
       │ 1. Known Audio App? (Spotify, foobar2000, AIMP, etc.)   │
       │    └─► PURE_AUDIO ──► IGNORED (Treated as IDLE)         │
       │ 2. Modern Media Player? (Win10/11 Microsoft.Media.Player)│
       │    - Video ext/DISPLAY lock? ─► VIDEO (Check WASAPI)    │
       │    - Songs/Audio/SMTC?       ─► PURE_AUDIO ──► IGNORED  │
       │ 3. Audio File Ext? (.mp3, .flac, .wav, .m4a in title)   │
       │    └─► PURE_AUDIO ──► IGNORED (Treated as IDLE)         │
       │ 4. Audio Service Tab? (YouTube Music, SoundCloud, etc.) │
       │    └─► PURE_AUDIO ──► IGNORED (Treated as IDLE)         │
       │ 5. Video File Ext? (.mp4, .mkv, .avi, .webm in title)   │
       │    └─► VIDEO ───────► Inspected with WASAPI Audio Meter │
       │ 6. Video Service Tab? (YouTube, Netflix, Twitch, etc.)  │
       │    └─► VIDEO ───────► Inspected with WASAPI Audio Meter │
       └────────────────────────────┬────────────────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │     Master System Verdict   │
                     └─────────────────────────────┘
```

1. **Explicit File Extension Analysis:**
   - **Audio Extensions:** `.mp3`, `.wav`, `.flac`, `.aac`, `.m4a`, `.ogg`, `.oga`, `.wma`, `.opus`, `.alac`, `.aiff`, `.mid`, `.ape`, `.ac3`, `.dts`, `.mka`, `.ra`, `.amr`, `.mp2`.
     - *Result:* When found in VLC / PotPlayer / WMP title, classified as **`PURE_AUDIO`** and **IGNORED (IDLE)**.
   - **Video Extensions:** `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`, `.flv`, `.m4v`, `.ts`, `.wmv`, `.mpg`, `.mpeg`, `.m2ts`, `.3gp`, `.vob`, `.divx`, `.ogv`.
     - *Result:* Classified as **`VIDEO`**.
2. **Dedicated Pure Audio Whitelist:**
   - Standalone music players (`spotify.exe`, `foobar2000.exe`, `aimp.exe`, `audacity.exe`, `deezer.exe`, `tidal.exe`, `musicbee.exe`, `winamp.exe`, `itunes.exe`, `music.ui.exe`) are permanently classified as pure audio.
3. **Method 1: Windows Native SMTC API (Dedicated to Modern Windows Media Player):**
   - Specifically dedicated to **Modern Windows Media Player** (`Microsoft.Media.Player.exe` / `Microsoft.ZuneMusic`) and **Legacy Windows Media Player** (`wmplayer.exe`).
   - Queries `Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager` in a non-blocking background daemon thread:
     - `MediaPlaybackType.Music` (1) ──► Confirmed **`PURE_AUDIO`** ──► Ignored (Treated as Idle).
     - `MediaPlaybackType.Video` (2) ──► Confirmed **`VIDEO`** ──► Inspected with WASAPI Audio Meter (Busy if actively playing).
   - Strict isolation: All other apps (VLC, Chrome, Edge, etc.) maintain their existing proven detection pathways completely intact.
4. **Method 2: Child Window Video Surface & File Handle Inspection (Strictly Dedicated to Legacy WMP `wmplayer.exe`):**
   - Solves the legacy Win32 WMP challenge where file extensions are stripped in the window title and SMTC is not populated in Windows 10/11.
   - Deeply inspects child window classes and video renderer surfaces (`EVRVideoHandler`, `VideoRenderer`, `WMP Transition Window`, `WMPVideoCtrlNotifyWndClass`).
   - Inspects active process file handles and command line for video vs audio formats.
   - When an active video rendering surface (e.g. `EVRVideoHandler`, non-zero width/height) is present, accurately classifies playback as **`VIDEO`** (Busy).
   - When playing pure audio (.mp3, .wav, .flac) without a video rendering surface, accurately classifies playback as **`PURE_AUDIO`** (Ignored -> Idle).
5. **Web Browser Tab Parsing:**
   - Distinguishes **YouTube Video** vs **YouTube Music** (`youtube.com` vs `music.youtube.com`).
   - Identifies Spotify Web, SoundCloud, Bandcamp, Gaana, Wynk, podcasts as pure audio.
   - Identifies Netflix, Prime Video, Disney+, Twitch, Hotstar, JioCinema, Crunchyroll as video platforms.
5. **WASAPI Real-Time Audio Peak Metering:**
   - If Video is active AND audio peak > 0.0001: **`[BUSY] Windows is NOT in idle condition: Video is actively playing`**.
   - If Video is PAUSED / silent: **`[OK / IDLE] Windows IS in idle condition: Video is paused / silent`**.
   - If Pure Audio is playing: **`[OK / IDLE] Windows IS in idle condition: Audio is playing [Pure Audio Ignored - Video Not Playing]`**.
   - If No media is running: **`[OK / IDLE] Windows IS in idle condition: No video is currently playing`**.
6. **Silent Scene Smoothing:**
   - 2.5-second smoothing decay window prevents false "idle" transitions during quiet dialogues or brief suspenseful pauses in movies.

---

## 📊 3. Clutter-Free Simplified Report & In-Place Terminal Card

The terminal UI runs with **strict in-place overwriting** (zero downward scrolling or text expansion):
- **Screen Cleared ONCE** at startup (`\033[2J\033[H`).
- **Hidden Cursor** (`\033[?25l`) on startup, restored on exit (`\033[?25h`).
- **In-Place Atomic Refresh** (`\033[H` + line `\033[K` + screen tail `\033[J`).

### Simplified Fixed-Size Card (Live Preview)
```
======================================================================
             WINDOWS VIDEO INACTIVITY SENTINEL (आइडल वीडियो डिटेक्टर)
======================================================================
  Video Playing       : NO (ना)
  Media Type          : AUDIO
  Playback State      : PLAYING
  Active Player / App : Windows Media Player
  Media Title         : Woh Bewafa - Agam Kumar Nigam
  60s Idle Timer      : 18.4s / 60s [███████░░░░░░░░░░░░░]  30%
----------------------------------------------------------------------
  Is Video Playing?   : FALSE
  Is Windows Idle?    : FALSE
======================================================================
  Live monitoring active | Press Ctrl+C to stop
```

### Scenario Samples

#### 1. Video Actively Playing (VLC, Chrome YouTube, Netflix)
```
======================================================================
  Video Playing       : YES (हाँ)
  Media Type          : VIDEO
  Playback State      : PLAYING
  Active Player / App : VLC Media Player
  Media Title         : Movie_1080p.mp4
  60s Idle Timer      :  0.0s / 60s [░░░░░░░░░░░░░░░░░░░░]   0% (RESET - VIDEO ACTIVE)
----------------------------------------------------------------------
  Is Video Playing?   : TRUE
  Is Windows Idle?    : FALSE
======================================================================
```

#### 2. Pure Audio Playing (Timer < 60s -> Counting Up, Windows NOT Idle)
```
======================================================================
  Video Playing       : NO (ना)
  Media Type          : AUDIO
  Playback State      : PLAYING
  Active Player / App : Windows Media Player
  Media Title         : Song.mp3
  60s Idle Timer      : 24.5s / 60s [██████████░░░░░░░░░░]  40%
----------------------------------------------------------------------
  Is Video Playing?   : FALSE
  Is Windows Idle?    : FALSE
======================================================================
```

#### 3. Video Paused or Silent (Timer < 60s -> Windows NOT Idle)
```
======================================================================
  Video Playing       : NO (ना)
  Media Type          : VIDEO
  Playback State      : PAUSED
  Active Player / App : VLC Media Player
  Media Title         : Film.mkv
  60s Idle Timer      : 35.0s / 60s [██████████████░░░░░░]  58%
----------------------------------------------------------------------
  Is Video Playing?   : FALSE
  Is Windows Idle?    : FALSE
======================================================================
```

#### 4. Pure Audio or Stopped (Timer >= 60s -> 100% Threshold Met, Windows IS Idle)
```
======================================================================
  Video Playing       : NO (ना)
  Media Type          : NONE
  Playback State      : STOPPED
  Active Player / App : None
  Media Title         : None
  60s Idle Timer      : 60.0s / 60s [████████████████████████] 100% (IDLE THRESHOLD MET)
----------------------------------------------------------------------
  Is Video Playing?   : FALSE
  Is Windows Idle?    : TRUE
======================================================================
```

---

## 🚀 4. How to Run

### 1-Click Launch (Recommended)
Double-click [`Run_Video_Idle_Detector.bat`](Run_Video_Idle_Detector.bat)

### Terminal Commands
```powershell
# Continuous live dashboard (1-second refresh)
python video_idle_detector.py

# Custom refresh interval (e.g. 0.5s)
python video_idle_detector.py --interval 0.5

# Single programmatic check (Exit Code 0: Idle, Exit Code 1: Busy)
python video_idle_detector.py --check-once

# Machine-readable JSON output
python video_idle_detector.py --json
```

### Scripting & Automation Exit Codes
| Exit Code | State | Meaning |
| :---: | :--- | :--- |
| **`0`** | **IDLE** | No video is playing (or pure audio is playing, or video is paused). Safe to shutdown/idle. |
| **`1`** | **BUSY** | Video is actively playing on screen with live audio output. System must remain awake. |

---

## 📁 5. Directory Structure
```
Win App Tracker/
├── video_idle_detector/                     # [NEW] Pure Video Sentinel (This Directory)
│   ├── video_idle_detector.py               # Main Python Sentinel Script
│   ├── Run_Video_Idle_Detector.bat          # 1-Click Batch Runner (UTF-8 BOM)
│   └── README.md                            # Comprehensive Documentation
├── video_and_keyboard_mouse_idle_detector/  # [RENAMED] Combined Video + Input Sentinel
│   ├── video_idle_detector.py               # Combined Sentinel Implementation
│   ├── Run_Video_Idle_Detector.bat          # Combined Launcher
│   └── README.md                            # Combined Documentation
└── keyboard_mouse_idle_detector/            # Physical Input Only Sentinel
    ├── keyboard_mouse_idle_detector.py
    └── Run_Keyboard_Mouse_Idle_Detector.bat
```
