# Phase 02: In-Page Media Telemetry Engine (`content_media.js`)

> **Phase ID:** `phase_02_media_telemetry_engine`  
> **Parent Task:** `browser_detection_extension_v1`  
> **Department:** Department 05: Frontend Engineering & Client-Side Architecture  
> **Assigned Role:** `content_script_engineer`  
> **Status:** Ready for Execution  

---

## 1. Objective & Scope

Design and implement `content_media.js`, a high-performance, non-intrusive content script injected into every webpage and frame (`all_frames: true`, `run_at: "document_start"`). It continuously senses HTML5 `<video>` and `<audio>` elements, tracks active media state changes, inspects real-time parameters (resolution, volume, muted, buffering, playback speed), extracts platform-specific heuristics (e.g. YouTube titles and qualities), and dispatches IPC messages to `background.js`.

---

## 2. Core Functional Requirements

### 2.1 DOM Mutation & Shadow DOM Observation
- Modern Single-Page Applications (SPAs) dynamically mount video elements (e.g., YouTube navigations, Netflix player loading, Instagram reels).
- Attach a `MutationObserver` on `document.documentElement` to instantly detect new `<video>` and `<audio>` nodes added to the DOM or Shadow DOM.
- Prevent duplicate event listener attachments using a `WeakSet` or custom HTML attribute (`data-sentinel-attached="true"`).

### 2.2 Comprehensive Media Event Hooks
Attach listeners to the following 10 standard HTMLMediaElement events on every discovered media node:
1. `'play'`: Media initiated playback.
2. `'playing'`: Actual audio/video frames are rendering.
3. `'pause'`: Playback explicitly halted.
4. `'ended'`: Stream completed.
5. `'waiting'`: Media buffering / network stall.
6. `'volumechange'`: User altered slider or toggled mute.
7. `'ratechange'`: Playback speed modified (e.g., 1.5x, 2.0x).
8. `'timeupdate'`: Periodic playback progress (throttled to 1Hz).
9. `'loadedmetadata'`: Video intrinsic dimensions (`videoWidth`, `videoHeight`) become available.
10. `'emptied'`: Media pipeline detached.

### 2.3 Media Telemetry Payload Specification
On any significant state transition, `content_media.js` transmits an envelope to the background service worker:
```json
{
  "type": "MEDIA_STATE_CHANGED",
  "data": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "domain": "youtube.com",
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "mediaType": "video",
    "state": "playing",
    "isPlaying": true,
    "isMuted": false,
    "volume": 0.85,
    "playbackRate": 1.0,
    "videoWidth": 1920,
    "videoHeight": 1080,
    "resolutionLabel": "1080p FHD",
    "duration": 213.0,
    "currentTime": 42.5,
    "timestamp": 1730680000000
  }
}
```

### 2.4 Advanced Platform Heuristics
- **YouTube Heuristic:** Inspects `document.querySelector('h1.ytd-watch-metadata yt-formatted-string')`, video quality badge (e.g. `1080p60`, `4K`), and `#movie_player` API if accessible.
- **OTT & Streaming Platforms:** Netflix (`.watch-video--title-container`), Disney+, Prime Video, Twitch, Spotify Web Player.
- **Background Audio vs Video:** Accurately separates pure `<audio>` elements from full visual `<video>` elements, matching `Video Detector HUD`'s core distinction!

---

## 3. Acceptance Criteria & Test Gate

- [ ] Script initializes cleanly at `document_start` without blocking page render or throwing security exceptions.
- [ ] Correctly identifies multiple media elements and prioritizes the active playing video.
- [ ] Correctly detects volume changes and mute toggles within 50ms.
- [ ] Correctly calculates resolution label (`4K 2160p`, `1080p FHD`, `720p HD`, `480p SD`).
- [ ] Throttles `timeupdate` reports to avoid message flooding.
