# Phase 2: Content Script Precision Seeking & Media Controls Wiring

> **Phase Identifier:** `PHASE-02-CONTENT-SCRIPT-SEEK`  
> **Target Task ID:** `TASK-MEDIA-DECK-CONTROLS-001`  
> **Assigned Role:** Level 4 Content Script Engineer  
> **Workspace Container:** `temp_prompt/media_deck_controls_wiring/`  
> **Target File:** [`content_media.js`](file:///C:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)

---

## 🎯 1. Phase Objective
Enhance `content_media.js` to whitelist `seek_to` and `seek_absolute` in `KNOWN_MEDIA_ACTIONS`, implement dedicated seek execution within `handleMediaControl` with duration clamping against `[0, duration]` and YouTube player fallback logic, and guarantee instant telemetry synchronization (`sendMediaTelemetryUpdate()`) post-execution.

---

## 📋 2. Prerequisites & Environment Inputs
- Phase 1 completed or running in parallel.
- Target file `content_media.js` loaded and anchored.

---

## 🔍 3. Technical Context & File Anchors
- **File:** `content_media.js`
- **Anchor 1 (Lines 2048-2165):** `function handleMediaControl(action, data = {})`
- **Anchor 2 (Lines 2507-2512):** `KNOWN_MEDIA_ACTIONS` array in runtime message listener.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Whitelist New Actions in `KNOWN_MEDIA_ACTIONS`
In `content_media.js` around line 2508:
```javascript
const KNOWN_MEDIA_ACTIONS = [
  'play', 'pause', 'toggle_play', 'seek_relative', 'seek_percent',
  'seek_to', 'seek_absolute', // <--- Add explicit absolute seek actions
  'toggle_mute', 'mute', 'unmute', 'set_volume', 'SET_VOLUME', 'step_speed', 'set_speed',
  'cycle_speed', 'toggle_fullscreen', 'toggle_pip', 'toggle_theater',
  'step_quality', 'set_quality'
];
```

### Step 2: Implement Dedicated `seek_to` Handler in `handleMediaControl`
Within `switch (action)` inside `handleMediaControl`:
```javascript
case 'seek_to':
case 'seek_absolute': {
  let dur = primaryMediaElement.duration;
  if (!Number.isFinite(dur) || dur <= 0) {
    dur = extractYouTubeDuration(primaryMediaElement);
  }
  const maxDuration = (Number.isFinite(dur) && dur > 0) ? dur : 999999;
  const rawTarget = (typeof data.positionSeconds === 'number')
    ? data.positionSeconds
    : ((typeof data.seconds === 'number') ? data.seconds : 0);
  
  const clampedSeconds = Math.max(0, Math.min(maxDuration, rawTarget));
  try {
    primaryMediaElement.currentTime = clampedSeconds;
  } catch (_) {}

  // Synchronize with YouTube player instance if embedded
  try {
    const moviePlayer = document.getElementById('movie_player') || window.movie_player;
    if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
      moviePlayer.seekTo(clampedSeconds, true);
    }
  } catch (_) {}

  // Broadcast immediate telemetry so dashboard progress reflects seek
  try {
    sendMediaTelemetryUpdate();
  } catch (_) {}
  break;
}
```

### Step 3: Trigger Immediate Telemetry on Volume & Playback Controls
Ensure that after executing `play`, `pause`, `toggle_play`, `mute`, `unmute`, and `set_volume`, `sendMediaTelemetryUpdate()` is invoked so that background worker and dashboard state stay 100% in sync without waiting for the next periodic heartbeat.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries
- DO NOT disrupt YouTube or Netflix ad detection routines.
- DO NOT modify the AudioContext or DSP processing nodes in `content_media.js`.
- Maintain 100% UTF-8 with BOM standard.

---

## 📦 6. Deliverables Manifest
- Updated `content_media.js` with `seek_to` whitelisting and duration-clamped seek handling.

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node -c content_media.js
```
Command must exit with code 0.
