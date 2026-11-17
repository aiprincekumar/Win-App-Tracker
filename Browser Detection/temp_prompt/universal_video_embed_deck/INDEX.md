# Live Tracking Board: Universal Embedded Video Player Deck (YouTube, Vimeo, Twitch, and Web Video Stream Adapters)

> **Task Workspace:** `temp_prompt/universal_video_embed_deck/`  
> **Project Scope:** Web Activity & Media Sentinel (`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`)  
> **Task ID:** `TASK-VIZ-COMPACT-FULLSCREEN-EMBED-003`  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Strategy:** Strategy B (Single User Consultation, Autonomy Score: 0.85)  
> **Lead Departments:** Dept 01 Product Requirements, Dept 02 Solution Architecture, Dept 04 UI/UX Design System, Dept 05 Frontend Engineering, Dept 08 QA & Testing, Dept 10 AppSec  
> **Authorization State:** WAITING_FOR_MANAGER_GATE (Level 3C Specialist Certified)  

---

## 📋 Executive Problem-Solution Dossier

### Problem Statement
1. **Visualizer Canvas Monolith Limitation:** Currently in [`dashboard/dashboard.html#L725-L776`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L725-L776), the `#heroAudioLabStatus` bento card houses an audio spectrum visualizer (`<canvas id="canvasAudioVisualizer">`) and VU meters. While this provides 60fps real-time frequency analysis, users frequently express the desire to view and control the actual live video stream (YouTube, Vimeo, Twitch, DailyMotion, HLS/DASH, or direct MP4/WebM) directly within the dashboard interface without switching to external browser tabs.
2. **Missing In-Place Video Playback Deck:** There is no dedicated, responsive 16:9 embedded player component that can occupy the hero canvas zone or seamlessly co-exist as a switchable dual-mode Deck (Mode A: Audio Visualizer Canvas, Mode B: Embedded Video Player Deck).
3. **Multi-Provider Embedding Fragmentation:** Different web video platforms require completely different embed paradigms, query parameters, sandboxed iframe capabilities, and bi-directional postMessage communication protocols (e.g., YouTube IFrame API `enablejsapi=1`, Vimeo Player API `api=1`, Twitch Interactive Embed `parent=localhost`, and HTML5 `<video>` for direct streams).
4. **Strict Security & Invariance Boundaries:** Embedding third-party video iframes introduces major Cross-Site Scripting (XSS), clickjacking, and top-navigation escape vectors. Any implementation must strictly conform to W3C Trusted Types (mandated in the project), require explicit iframe sandboxing (`sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"`), enforce strict origin whitelisting, and maintain 100% backward compatibility with all 54 existing test suites and existing visualizer features.

### Solution Architecture
1. **Phase 1: Provider Registry Abstraction & Extensible URL Parser Contracts (`src/dashboard/features/embed_player_deck/provider_registry.js`):**
   - Architect an extensible `SentinelProviderRegistry` supporting dynamic registration of video provider adapters.
   - Implement universal URL parser extracting video IDs, timestamps, and playlists from YouTube (standard, shorts, embed, youtu.be), Vimeo, Twitch (channels, streams, clips), DailyMotion, and direct video file URLs (.mp4, .webm, .m3u8).
   - Define strict lifecycle and event contracts: `canHandle(url)`, `getEmbedUrl(url, opts)`, `createPlayer(container, opts)`, `destroyPlayer()`, `onPlay()`, `onPause()`, `onTimeUpdate()`, `onError()`.
2. **Phase 2: Dual-Mode Switcher Header & 16:9 Responsive Deck Container (`dashboard/dashboard.html`, `dashboard.css`, `media_deck.css`):**
   - Refactor `#heroAudioLabStatus` header to include a segmented pill toggle: `[ 🎛️ Audio Visualizer ]` vs `[ 🎬 Embedded Video Deck ]`.
   - Implement responsive 16:9 fluid container (`#embeddedVideoDeckContainer`) with liquid glass styling, loading spinners, theater expansion toggle, and empty/idle state.
   - The empty/idle state provides a quick URL paste bar with autofocus, paste button, quick-select platform badges, and a "Embed Current Active Tab Stream" button if background media telemetry is detected.
3. **Phase 3: Specialized Provider Adapters & Bi-Directional postMessage Bridges (`src/dashboard/features/embed_player_deck/adapters/`):**
   - `YouTubeAdapter`: Generates secure embed URLs with `enablejsapi=1`, `origin`, `rel=0`, and handles postMessage commands (`playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `mute`).
   - `VimeoAdapter`: Implements Vimeo API bridge with postMessage event listener and playback controls.
   - `TwitchAdapter`: Embeds Twitch live channels and clips with strict `parent` host binding.
   - `DirectMediaAdapter`: Renders native HTML5 `<video controls playsinline>` with liquid glass custom controls.
4. **Phase 4: W3C Trusted Types Policy Enforcement & Iframe Sandboxing Security (`src/dashboard/features/embed_player_deck/security/`):**
   - Register `sentinel-embed-policy` under `window.trustedTypes` allowing verified iframe URLs and safe DOM nodes.
   - Construct DOM nodes exclusively using `document.createElement('iframe')` and sanitize attribute injection.
   - Inject rigid iframe security attributes: `sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`, `referrerpolicy="strict-origin-when-cross-origin"`.
   - Enforce domain whitelist rejecting unverified or suspicious external origins.
5. **Phase 5: Independent QA Verification Test Suite & Full Regression Pass (`tests/`):**
   - Author `tests/test_universal_video_embed_deck.js` featuring 6 distinct test batteries: URL parsing matrix (30+ URLs), DOM structure & mode switching, adapter postMessage bridges, Trusted Types & sandbox security, state machine transitions, and full regression pass (`run_all_tests.js`).
   - Certify zero regressions across all 54 existing suites, 100% UTF-8 BOM compliance, and clean gitleaks scan.

---

## 🚦 Phase Status Checklist

| Phase # | Name | Target File(s) | Assigned Agent | Status | Local Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Provider Registry & Extensible URL Parser Contracts | `src/dashboard/features/embed_player_deck/provider_registry.js` | Level 4 Subagent | ⏳ PENDING | Node AST compile, 30+ URL regex match suite, registry contract verification |
| **Phase 2** | Dual-Mode Switcher Header & 16:9 Responsive Deck Container | `dashboard/dashboard.html`, `dashboard/dashboard.css`, `media_deck.css` | Level 4 Subagent | ⏳ PENDING | DOM parser check, segmented pill toggle audit, 16:9 aspect ratio CSS validation |
| **Phase 3** | Specialized Provider Adapters & postMessage Bridges | `src/dashboard/features/embed_player_deck/adapters/*.js` | Level 4 Subagent | ⏳ PENDING | Mock postMessage dispatch, event listener parsing, playback command test |
| **Phase 4** | W3C Trusted Types Policy, Iframe Sandbox & Origin Whitelist | `src/dashboard/features/embed_player_deck/security/*.js`, `dashboard.js` | Level 4 Subagent | ⏳ PENDING | Trusted Types policy audit, zero raw innerHTML check, sandbox attribute verification |
| **Phase 5** | QA Automated Test Suite & Full Regression Pass | `tests/test_universal_video_embed_deck.js`, `run_all_tests.js` | Level 4 QA Subagent | ⏳ PENDING | 6-battery test suite PASS (exit code 0), full test pass, UTF-8 BOM, 0 gitleaks |

---

## 🔍 Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `src/dashboard/features/embed_player_deck/provider_registry.js` | Lack of unified video provider registry and normalized URL parser in dashboard. | Implement `SentinelProviderRegistry` with extensible parser for YouTube, Vimeo, Twitch, and direct streams. | Clean separation of concerns; instant extensibility for any future video platform. | Phase 1 | Node unit test parsing 30+ real-world URLs |
| 2 | `dashboard/dashboard.html` | `#heroAudioLabStatus` exclusively houses the canvas visualizer without a container for embedded video playback. | Introduce `#deckModeSwitcher` pill buttons and `#embeddedVideoDeckContainer` with 16:9 fluid aspect ratio shell. | Enables smooth switching between audio frequency FFT analysis and live embedded video. | Phase 2 | HTML DOM parser check & canonical ID audit |
| 3 | `dashboard/dashboard.css` & `media_deck.css` | No styling for embedded iframe decks, theater expansions, or URL paste bar in liquid glass aesthetic. | Author `.embedded-deck-wrapper`, `.deck-theater-mode`, `.deck-input-bar`, and transition animations. | Seamless visual parity with existing bento cards; responsive 16:9 video frame on all resolutions. | Phase 2 | CSS token check, 16:9 aspect-ratio validation |
| 4 | `src/dashboard/features/embed_player_deck/adapters/*.js` | Fragmented player APIs and postMessage communication formats across video providers. | Author dedicated adapters (`YouTubeAdapter`, `VimeoAdapter`, `TwitchAdapter`, `DirectMediaAdapter`) implementing normalized API. | Unified `play()`, `pause()`, `seek()`, `setVolume()` interface across all providers. | Phase 3 | Mock postMessage communication test battery |
| 5 | `src/dashboard/features/embed_player_deck/security/trusted_types_policy.js` | Direct iframe creation or string URL injection risks violating W3C Trusted Types or creating XSS vulnerabilities. | Implement dedicated Trusted Types policy `sentinel-embed-policy` and strict iframe sandboxing (`sandbox`, `allow`, origin whitelist). | 100% Trusted Types compliance; strict isolation preventing top-frame redirection or script injection. | Phase 4 | DOM XSS security audit & CSP attribute check |
| 6 | `dashboard/dashboard.js` | Existing media deck wiring and visualizer loop must gracefully pause/resume when switching modes. | Integrate mode switcher event listeners, pausing 60fps canvas FFT loop when deck is active to preserve CPU. | Zero unnecessary GPU/CPU cycles; seamless multi-tab media synchronization. | Phase 4 | Performance & event wiring AST test |
| 7 | `tests/test_universal_video_embed_deck.js` & `run_all_tests.js` | New video embed deck requires comprehensive automated verification and full regression suite execution. | Author 6-battery test suite and execute entire project test harness, BOM check, and secret audit. | Certifies Grade A+ release readiness; guarantees zero regressions across existing 54 test suites. | Phase 5 | `node run_all_tests.js` (exit code 0) & `gitleaks` |
