# Phase 3: Specialized Provider Adapters & Bi-Directional postMessage Bridges

> **Phase:** 03 of 05  
> **Target Subsystem:** `src/dashboard/features/embed_player_deck/adapters/*.js`  
> **Associated Feature:** Universal Embedded Video Player Deck  
> **Lead Department:** Dept 05 Frontend Engineering & Dept 06 Backend/API  
> **Prerequisites:** Phase 1 (Provider Registry) & Phase 2 (Deck Container) complete  
> **Gate Verification:** Mock postMessage RPC test suite passing with exit code 0  

---

## 🎯 1. Phase Objective

The objective of Phase 3 is to develop specialized provider adapters implementing the `IVideoProviderAdapter` interface defined in Phase 1:
1. `YouTubeAdapter`: Embeds `youtube-nocookie.com` with `enablejsapi=1` and handles postMessage RPC commands (`playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `mute`).
2. `VimeoAdapter`: Embeds `player.vimeo.com` with `api=1` and handles postMessage RPC commands (`play`, `pause`, `setCurrentTime`, `setVolume`).
3. `TwitchAdapter`: Embeds `player.twitch.tv` and `clips.twitch.tv` with strict `parent` domain binding.
4. `DirectMediaAdapter`: Mounts native HTML5 `<video controls playsinline>` with custom overlay controls for direct MP4, WebM, and HLS streams.

---

## 📂 2. File Anchors & Prerequisites

- **Directory to Populate:**
  - `src/dashboard/features/embed_player_deck/adapters/`
- **Adapters to Author:**
  - `src/dashboard/features/embed_player_deck/adapters/youtube_adapter.js`
  - `src/dashboard/features/embed_player_deck/adapters/vimeo_adapter.js`
  - `src/dashboard/features/embed_player_deck/adapters/twitch_adapter.js`
  - `src/dashboard/features/embed_player_deck/adapters/direct_media_adapter.js`
- **Registry Integration:**
  - [`src/dashboard/features/embed_player_deck/provider_registry.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/embed_player_deck/provider_registry.js)
- **Unit Test Anchor:**
  - `tests/test_embed_provider_adapters.js`

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 3.1: Author `youtube_adapter.js`
1. Match YouTube URL formats: standard `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`.
2. Construct embed URL using privacy-enhanced domain `https://www.youtube-nocookie.com/embed/{videoId}`.
3. Append mandatory parameters:
   - `enablejsapi=1`: Enables postMessage communication.
   - `origin={window.location.origin}`: Prevents unauthorized message spoofing.
   - `rel=0`: Restricts related videos to the same channel.
   - `modestbranding=1`: Minimizes YouTube branding chrome.
   - `playsinline=1`: Ensures inline playback without forced mobile fullscreen.
4. Implement `sendCommand(iframeWindow, command, value)`:
   - Maps `play` -> `playVideo`
   - Maps `pause` -> `pauseVideo`
   - Maps `mute` -> `mute`
   - Maps `unmute` -> `unMute`
   - Maps `seek` -> `seekTo` (`[value, true]`)
   - Maps `set_volume` -> `setVolume` (`[value]`)
   - Dispatches via `iframeWindow.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube-nocookie.com')`.

### Step 3.2: Author `vimeo_adapter.js`
1. Match Vimeo URL formats: `vimeo.com/{id}` and `vimeo.com/channels/*/{id}`.
2. Construct embed URL: `https://player.vimeo.com/video/{videoId}?api=1&dnt=1`.
3. Implement `sendCommand(iframeWindow, command, value)`:
   - Maps `play` -> `{ method: 'play' }`
   - Maps `pause` -> `{ method: 'pause' }`
   - Maps `seek` -> `{ method: 'setCurrentTime', value: seconds }`
   - Maps `set_volume` -> `{ method: 'setVolume', value: percent }`
   - Dispatches via `iframeWindow.postMessage(JSON.stringify(payload), 'https://player.vimeo.com')`.

### Step 3.3: Author `twitch_adapter.js`
1. Match Twitch channel URLs (`twitch.tv/{channel}`) and clip URLs (`clips.twitch.tv/{id}`).
2. Dynamically determine parent hostname (`window.location.hostname` or `'localhost'`).
3. Construct embed URL:
   - Channels: `https://player.twitch.tv/?channel={channel}&parent={parent}&muted=true`.
   - Clips: `https://clips.twitch.tv/embed?clip={clipId}&parent={parent}&muted=true`.
4. Handle Twitch iframe messaging and fallback events.

### Step 3.4: Author `direct_media_adapter.js`
1. Match `.mp4`, `.webm`, `.ogg`, `.m4v`, `.m3u8` direct URLs.
2. Implement `createPlayer(container, metadata, options)` constructing native `<video>` element:
   - `video.controls = true;`
   - `video.playsInline = true;`
   - `video.preload = 'metadata';`
   - `video.className = 'embedded-deck-native-video';`
3. Wire playback events (`play`, `pause`, `timeupdate`, `ended`) to the Sentinel player event bus.

### Step 3.5: Auto-Register Adapters in `SentinelProviderRegistry`
Ensure all four adapters register automatically with `SentinelProviderRegistry.register(...)` upon loading.

---

## 🚫 4. Architectural Boundaries & Constraints

- **No Third-Party SDK Downloads:** Do NOT dynamically inject `<script src="https://www.youtube.com/iframe_api">` into the head. Standard iframe embedding with native postMessage protocol guarantees offline resilience and zero CSP script violations.
- **Strict PostMessage Target Origin:** Never use wildcard `'*'` when dispatching commands to YouTube or Vimeo iframes. Always pass the exact provider origin (`https://www.youtube-nocookie.com`, `https://player.vimeo.com`).
- **Memory Safety:** When an adapter's player is destroyed, cleanly remove window message event listeners.

---

## 📦 5. Deliverables Manifest

1. `src/dashboard/features/embed_player_deck/adapters/youtube_adapter.js`
2. `src/dashboard/features/embed_player_deck/adapters/vimeo_adapter.js`
3. `src/dashboard/features/embed_player_deck/adapters/twitch_adapter.js`
4. `src/dashboard/features/embed_player_deck/adapters/direct_media_adapter.js`
5. `tests/test_embed_provider_adapters.js`

---

## 🚦 6. Local Verification Gate

Execute the following commands to certify completion of Phase 3:
```bash
# 1. Run adapter postMessage and URL building unit test suite
node tests/test_embed_provider_adapters.js
```
*Gate Success Condition: All adapters pass URL parsing, embed URL construction, and postMessage command serialization.*
