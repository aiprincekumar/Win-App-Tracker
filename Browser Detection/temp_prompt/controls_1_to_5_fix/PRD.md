# Popup Media Controls 1 to 5 Fix — Product Requirements Document (PRD)

> **Task ID:** `TASK-MEDIA-CTRL-FS-FIX-001`  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Document Type:** Product Requirements Document (PRD)  
> **Target Path:** `temp_prompt/controls_1_to_5_fix/PRD.md`  

---

## 👥 1. User Personas & Problem Scenarios

### 1.1 Persona: Video Power User & Multitasker
- **Context:** Watches video tutorials, lectures, YouTube, or Netflix while working in other tabs.
- **Pain Point:** Clicking Play/Pause, Rewind 10s, Mute, or Speed in the Sentinel popup produces no reaction on the active video tab. Clicking Fullscreen causes visual glitching or fails to expand the video properly.
- **Desired State:** 1-click instantaneous control from the popup with zero latency and smooth fullscreen integration matching the on-video floating button.

---

## 📋 2. Functional Requirements (FR)

### FR-01: Control 1 — Play/Pause Toggle
- **Description:** Clicking the popup Play/Pause button (`#btnCtrlTogglePlay` or `#dynamicStatusBtn`) must toggle the playback state (`video.play()` / `video.pause()`) of the currently active/selected media tab.
- **Acceptance Criteria (Given-When-Then):**
  - **Given** an active tab is playing video,
  - **When** the user clicks `#btnCtrlTogglePlay` in the popup,
  - **Then** the video pauses immediately and the button icon updates to Play.
  - **When** clicked again, the video resumes immediately and the button icon updates to Pause.

### FR-02: Control 2 — Skip Relative ±10s Seek
- **Description:** Clicking `#btnCtrlRewind` seeks backward by 10 seconds; clicking `#btnCtrlForward` seeks forward by 10 seconds.
- **Acceptance Criteria:**
  - **Given** a playing video at timestamp 45s with duration 120s,
  - **When** `#btnCtrlRewind` is clicked, current time becomes 35s.
  - **When** `#btnCtrlForward` is clicked, current time becomes 45s.
  - **Edge Case:** Seeks must clamp strictly within `[0, video.duration]`.

### FR-03: Control 3 — Mute / Unmute & Volume Management
- **Description:** Clicking `#btnCtrlToggleMute` or `#btnQuickMute` toggles audio mute. Dragging `#volumeBarContainer` adjusts volume linearly from 0.0 to 1.0.
- **Acceptance Criteria:**
  - **Given** audible media at volume 0.8,
  - **When** `#btnCtrlToggleMute` is clicked, audio mutes (`video.muted = true`) and icon displays muted state.
  - **When** clicked again, audio restores to previous volume (`0.8`).

### FR-04: Control 4 — Playback Speed Steppers
- **Description:** Clicking `#btnCtrlSpeedDown` decrements playback rate along the standard ladder (0.25x, 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x, 2.5x, 3.0x, 4.0x). Clicking `#btnCtrlSpeedUp` increments along the ladder.
- **Acceptance Criteria:**
  - **Given** a video playing at 1.0x,
  - **When** `#btnCtrlSpeedUp` is clicked, speed changes to 1.25x and badge displays `1.25x`.
  - **Then** speed is persisted to domain speed memory.

### FR-05: Control 5 — Fullscreen Toggle & On-Video Overlay Linking
- **Description:** Clicking `#btnCtrlFullscreen` in popup must trigger the exact same fullscreen behavior as clicking the on-video overlay floating button (`#__sentinel_fs_floating_btn__`) or invoking `window.__SentinelFullscreenController.toggle()`.
- **Acceptance Criteria:**
  - **Given** a video playing on a page with Sentinel floating HUD injected,
  - **When** `#btnCtrlFullscreen` is clicked in the popup,
  - **Then** the floating overlay button's click event or `__SentinelFullscreenController.toggle(null, { forceWeb: true })` is invoked in the MAIN execution world.
  - **Then** all 124 lines of bloated manual DOM class manipulation and synthetic keyboard hacks are bypassed.

### FR-06: Strict Global Isolation Guard
- **Description:** The Universal Play/Pause button (`#btnGlobalMediaToggle`) located in the footer toolbar pauses/resumes media across *all* open browser tabs simultaneously via `TOGGLE_GLOBAL_MEDIA`.
- **Acceptance Criteria:**
  - `#btnGlobalMediaToggle` must remain **100% untouched and unchanged**.
  - No changes in Control 1 shall alter `#btnGlobalMediaToggle` click listener or IPC payload.

---

## 🔒 3. Non-Functional Requirements (NFR)

1. **Latency:** Media control execution latency from popup click to video element response must not exceed 50ms.
2. **Robustness & Zero Packet Drop:** All 16 recognized media control commands must route cleanly through the IPC layer without dropping packets.
3. **Security & Trusted Types:** 100% compliance with W3C Trusted Types; zero direct `innerHTML` assignments in injected code.
4. **Code Quality:** Zero ESLint / JavaScript parse errors (`node -c` passes clean).
