# Product Requirements Document (PRD): Universal Embedded Video Player Deck

> **Feature Name:** Universal Embedded Video Player Deck (Multi-Provider Live Embed Station)  
> **Document Status:** Level 3C Specialist Certified / Approved for Phased Execution  
> **Target Module:** `temp_prompt/universal_video_embed_deck/PRD.md`  
> **Lead Department:** Dept 01 Product Requirements, Dept 04 UI/UX Design, Dept 05 Frontend Engineering  
> **Target Release:** Web Activity & Media Sentinel v2.4  

---

## 👥 1. Target User Personas

### Persona 1: The Multi-Monitor Power Developer ("Alex")
- **Profile:** Software engineer running multi-tab research, background YouTube coding tutorials, and tech conference live streams while developing.
- **Pain Point:** Constantly Alt-Tabbing or switching browser windows to glance at visual code snippets shown in video streams; loses focus and context.
- **Need:** Ability to view the live video directly within the Sentinel Dashboard hero panel, with one-click theater expansion and synced volume control.

### Persona 2: The Media Content Monitor ("Priya")
- **Profile:** Digital media manager monitoring live Twitch streams, YouTube webinars, and Vimeo video deliverables across browser tabs.
- **Pain Point:** The dashboard only shows media metadata (title, artist, timeline bar) and audio frequency bars, but cannot show the actual visual broadcast.
- **Need:** An embedded player that accepts a pasted URL or automatically grabs the active stream URL and embeds it inside the dashboard seamlessly.

### Persona 3: The Audiophile / Music Enthusiast ("Marcus")
- **Profile:** Listens to high-fidelity music on SoundCloud, Spotify, or local streams, using the 60fps spectrum visualizer and VU meters to monitor audio balance.
- **Pain Point:** Worried that adding video capabilities will clutter or remove the beloved 32-band spectrum analyzer.
- **Need:** A switchable dual-mode toggle that preserves 100% of the visualizer experience with zero compromises, allowing instant toggling back and forth.

---

## 📋 2. Functional Requirements (FR)

| Req ID | Priority | Description | Acceptance Verification |
| :--- | :--- | :--- | :--- |
| **FR-01** | **P0 (Must)** | Dual-Mode Header Switcher: Provide a segmented pill button in the hero card header allowing users to toggle between `[ 🎛️ Audio Visualizer ]` and `[ 🎬 Embedded Video Deck ]`. | Clicking switcher toggles visible container with smooth fade transition; active button receives `.btn-active` class. |
| **FR-02** | **P0 (Must)** | Universal URL Parser: Automatically parse and normalize URLs from YouTube (standard, shorts, embed, youtu.be), Vimeo, Twitch (channels, streams, clips), and direct media files (.mp4, .webm). | 30+ diverse URL formats correctly resolve provider and normalized embed URL in unit tests. |
| **FR-03** | **P0 (Must)** | Sandboxed Iframe Container: Embed video in a responsive 16:9 container using secure sandboxed iframes (`sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"`). | Iframe element created without XSS vulnerabilities; no `allow-top-navigation`. |
| **FR-04** | **P0 (Must)** | Empty / Idle State URL Input Bar: In Deck mode, when no video is loaded, display an intuitive URL input bar with paste button and platform quick-launch chips. | Pasting a valid URL and pressing Enter or clicking "Load Video" immediately mounts the player. |
| **FR-05** | **P1 (Should)** | Active Tab Stream Grabber: When background media telemetry detects an active YouTube/Twitch tab, display a "1-Click Embed Active Stream" button. | Clicking button extracts current stream URL from telemetry cache and mounts it in the deck. |
| **FR-06** | **P1 (Should)** | Theater Mode Expansion: Provide a theater mode toggle button that expands the bento card to full container width (`bento-span-12`) with smooth transition. | Clicking theater button expands card; clicking collapse restores original 4-column span. |
| **FR-07** | **P1 (Should)** | Bi-Directional Playback Synchronization: PostMessage bridges for YouTube and Vimeo supporting `play`, `pause`, `seek`, `setVolume`, and `mute`. | Dispatching remote command reflects in iframe playback state without reload. |
| **FR-08** | **P1 (Should)** | CPU-Aware Idle Sleep: When Deck mode is active, automatically suspend the 60fps canvas visualizer `requestAnimationFrame` loop to eliminate GPU/CPU waste. | `getVisualizerState().isRunning` returns `false` while Deck is active. |
| **FR-09** | **P2 (Could)** | Direct HTML5 Video Support: Playback direct .mp4, .webm, or .m3u8 video streams using custom liquid glass styled native `<video controls>`. | Direct media URLs render native video element with autoplay policy compliance. |
| **FR-10** | **P2 (Could)** | Recent Video History: Store the last 5 embedded video URLs in local extension storage (`localStorage`) with quick-reload chips. | Reloading recent chip mounts the video without re-typing URL. |
| **FR-11** | **P3 (Won't v1)**| PiP Floating Pop-Out: Picture-in-Picture floating window outside browser dashboard (deferred to v2.5). | Out of scope for Phase 1-5. |
| **FR-12** | **P3 (Won't v1)**| Multi-Stream Mosaic: Simultaneous 4-stream grid inside the card (deferred to v2.6). | Out of scope for Phase 1-5. |

---

## ⚡ 3. Non-Functional Requirements (NFR)

| Req ID | Category | Requirement Specification |
| :--- | :--- | :--- |
| **NFR-01** | **Security** | 100% W3C Trusted Types compliant. Zero raw string injection into `innerHTML`. All iframe `src` URLs validated against a strict origin whitelist. |
| **NFR-02** | **Performance** | Mode toggle transition must execute in < 16ms (60fps). Iframe mount must not freeze the main UI thread. |
| **NFR-03** | **Memory** | Destroying or switching away from an embedded video must cleanly unload the iframe and release DOM event listeners to prevent memory leaks. |
| **NFR-04** | **Accessibility** | All interactive controls (switcher, inputs, theater button) must have accessible labels (`aria-label`), full keyboard navigation (`Enter`/`Space`), and WCAG 2.1 AA focus rings. |
| **NFR-05** | **Reliability** | Invalid or unreachable video URLs must display a graceful, non-crashing error state with retry and reset options. |
| **NFR-06** | **Compatibility** | Fully functional across Chromium (Chrome, Edge, Brave, Opera) and compliant with Chrome Extension Manifest V3 security policies. |
| **NFR-07** | **Invariance** | Must guarantee zero regression across all 54 existing dashboard and background test suites. |
| **NFR-08** | **Encoding** | All files must use UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) per Universal Engineering Standard. |

---

## 📖 4. INVEST-Compliant User Stories

### US-01: Dual-Mode Switcher Toggle
- **Story:** *As a dashboard user, I want to toggle between the audio frequency visualizer and the embedded video player using a segmented header button, so that I can choose between audio analysis and visual streaming.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

### US-02: Universal URL Video Embedding
- **Story:** *As a user, I want to paste a YouTube, Vimeo, or Twitch URL into an input bar and have it automatically embed in 16:9 aspect ratio, so that I can watch media without leaving the dashboard.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

### US-03: 1-Click Embed of Active Tab Stream
- **Story:** *As a multi-tasker with video playing in a background tab, I want a 1-click button to embed that active stream directly into the deck, so that I don't have to manually copy and paste URLs.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

### US-04: Theater Mode Expansion
- **Story:** *As a viewer watching a high-detail tutorial, I want to expand the video card to full bento grid width, so that I can read on-screen code and charts clearly.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

### US-05: Secure Sandboxing & Trusted Types
- **Story:** *As a security-conscious developer, I want all embedded iframes strictly sandboxed without top-level navigation permissions, so that malicious ads or rogue video pages cannot hijack my dashboard.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

### US-06: Seamless Visualizer Invariance
- **Story:** *As an audio engineer, I want the visualizer canvas and VU meters to remain completely intact and resume 60fps rendering immediately when I toggle back to Visualizer mode, so that my audio monitoring workflow is never broken.*
- **INVEST Checklist:** Independent (Yes), Negotiable (Yes), Valuable (Yes), Estimable (Yes), Small (Yes), Testable (Yes).

---

## 🎯 5. MoSCoW Prioritization Matrix

- **Must Have (P0):**
  - Segmented dual-mode switcher header button (`#deckModeSwitcher`).
  - Extensible `SentinelProviderRegistry` with YouTube, Vimeo, Twitch, and Direct video parsers.
  - 16:9 responsive fluid liquid glass container (`#embeddedVideoDeckContainer`).
  - URL input bar with paste button and load trigger.
  - W3C Trusted Types policy enforcement and strict iframe sandboxing.
  - 100% backward-compatible preservation of visualizer canvas and existing tests.
- **Should Have (P1):**
  - "1-Click Embed Active Stream" button pulling active stream from `MediaDeckVisualizerFeature.getCachedStreams()`.
  - Theater mode card expansion toggle (`bento-span-12`).
  - Bi-directional postMessage command bridges (Play, Pause, Mute).
  - CPU-aware suspension of visualizer `requestAnimationFrame` loop during Deck mode.
- **Could Have (P2):**
  - Recent video history chips (up to 5 recent URLs in `localStorage`).
  - Platform quick-select badge filters (YouTube, Twitch, Vimeo, Direct).
  - Native HTML5 video player with custom glass controls.
- **Won't Have (v1):**
  - Floating PiP detached OS window.
  - 4-way multi-stream mosaic grid.

---

## 📜 6. Given-When-Then Acceptance Criteria Contracts

### GWT-01: Toggle Between Modes
- **Given** the dashboard is loaded with the Visualizer mode active by default,
- **When** the user clicks the "🎬 Video Deck" mode toggle button,
- **Then** the visualizer panel fades out, the embedded video deck container fades in, the 60fps canvas loop pauses, and the active button updates to "Video Deck".

### GWT-02: Load Valid YouTube URL
- **Given** the user is in Embedded Video Deck mode with an empty player,
- **When** the user enters `https://www.youtube.com/watch?v=dQw4w9WgXcQ` into the URL input and clicks "Load",
- **Then** a sandboxed iframe is mounted with `src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1&origin=..."`, `sandbox` attributes applied, and the empty state is hidden.

### GWT-03: Load Valid Twitch Channel URL
- **Given** the user is in Embedded Video Deck mode,
- **When** the user enters `https://www.twitch.tv/shroud` and submits,
- **Then** a sandboxed iframe is mounted with `src="https://player.twitch.tv/?channel=shroud&parent=..."`, and the stream loads cleanly.

### GWT-04: Invalid URL Error Handling
- **Given** the user is in Embedded Video Deck mode,
- **When** the user enters `https://malicious-site.com/exploit` or an invalid string,
- **Then** no iframe is mounted, an inline error toast/badge indicates "Unsupported or invalid video URL", and the system remains secure.

### GWT-05: Theater Mode Toggle
- **Given** the video player is actively mounted inside the deck,
- **When** the user clicks the "Theater Mode" button,
- **Then** the `#heroAudioLabStatus` card toggles class `.deck-theater-mode` expanding to full bento width, and the icon changes to "Collapse".

### GWT-06: Switch Back to Visualizer Mode
- **Given** a video is playing in Deck mode,
- **When** the user clicks the "🎛️ Audio Visualizer" toggle button,
- **Then** the video playback is paused, the deck container hides, the visualizer canvas displays, and the 60fps FFT animation loop resumes immediately.

### GWT-07: Trusted Types Security Audit
- **Given** the dashboard runs under strict Trusted Types enforcement,
- **When** the video deck generates iframe elements or attaches sources,
- **Then** the operations execute through `sentinel-embed-policy` without triggering any Trusted Types CSP violations in the console.

### GWT-08: Full Test Regression Verification
- **Given** all 5 phases are implemented,
- **When** `node run_all_tests.js` is executed in the terminal,
- **Then** all 55 test suites pass with 0 errors and exit code 0.
