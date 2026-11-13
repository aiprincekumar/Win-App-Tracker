# 4-Pillar Hub Architecture UI/UX — Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Initiative:** Web Activity & Media Sentinel — Extension Popup 4-Pillar Hub  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/PRD.md`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)

---

## 👤 1. User Personas

1. **Power Media Consumer ("Alex"):** Binge-watches YouTube, Netflix, Coursera, and podcasts across multiple tabs. Needs quick video capture, looping difficult tutorial sections, subtitle/dialogue vocal boost, and volume boost beyond 100% for quiet recordings.
2. **Productivity & Digital Wellness Seeker ("Priya"):** Works long hours in browser. Wants to track time spent across work vs social media, prevent mindless doomscrolling with subtle nudge alerts, and take time-stamped study notes while watching technical lectures.
3. **Audiophile & Music Enthusiast ("Jordan"):** Listens to Spotify Web, SoundCloud, or YouTube Music while coding. Demands fine-grained audio tuning via a 5-band EQ, night listening dynamic range control to avoid sudden volume spikes, and battery-saving audio-only mode.

---

## 🎯 2. Functional Requirements (FR)

### FR-01: 4-Pillar Top Navigation
- The top navigation bar must present 4 primary tabs:
  1. `🎬 Player` (data-view="media", active by default)
  2. `🎛️ Audio Lab` (data-view="audio")
  3. `📚 Studio` (data-view="studio")
  4. `⏱️ Focus` (data-view="focus" or "tracking")
- Switching tabs must hide all non-active panes and reveal the corresponding active pane with zero layout flicker.
- Active tab selection must persist across popup closures in `chrome.storage.local`.

### FR-02: Header Quick Settings
- A subtle `⚙️` Quick Settings button must reside in the header badges/corner area.
- Clicking the button opens a clean slide-over popover panel containing user preference toggles (Theme, Default Tab, Notification Sound, Auto-Sync Interval).

### FR-03: Player In-Card Micro-Actions
- Directly below or within the media title/card, render a micro-actions toolbar:
  - `📸 Capture Frame` (`#btnCardScreenshot`): Triggers instant frame screenshot capture.
  - `🎯 Cinema Dimmer` (`#btnCardCinemaDim`): Toggles dimmed background overlay focus on active tab.
  - `🔁 Loop Media` (`#btnCardLoopMedia`): Toggles continuous video looping.
  - `⏭️ Next Track` (`#btnCardNextTrack`): Advances to the next video/track in supported playlists.
  - `📋 Copy Timestamp Link` (`#btnCardCopyTimestamp`): Copies current video URL with `&t=X` parameter to clipboard.

### FR-04: Smart Automations Card
- Card inside Player pane containing glassmorphic toggle switches:
  - Auto-Pause on New Tab (pauses media when opening a new tab).
  - Auto Ad Silencer (mutes audio during detected ad segments).
  - Domain Speed Memory (remembers preferred playback speed per domain).

### FR-05: Audio Lab Master Boost & Battery Saver
- Master Volume slider from 0% to 200% with color-accented glow when boosted above 100%.
- Audio-Only Mode toggle: switches video rendering off in content scripts while preserving audio track to save battery and GPU cycles.

### FR-06: 5-Band Graphic Equalizer
- Graphic EQ card featuring 5 vertical/horizontal frequency bands:
  - `60Hz` (Sub Bass), `250Hz` (Bass), `1kHz` (Midrange), `4kHz` (Presence), `16kHz` (Air).
  - Gain range: -12dB to +12dB with 0dB center notch.
- Presets dropdown: `Flat`, `Bass Boost`, `Vocal Clarify`, `Rock`, `Night Listening`.

### FR-07: Sound Enhancements Card
- `🗣️ Vocal Clarity`: Boosts vocal dialogue clarity over noisy background soundtracks.
- `🌙 Night Listening Shield`: Dynamic range compression preventing loud sound explosions during late-night viewing.

### FR-08: Studio Vault (Notes, Bookmarks & Gallery)
- Timestamp Note input field with "📌 Pin Note" button that automatically stamps the current playback timestamp.
- Saved Timestamp Clips list with clickable "Jump to Time" buttons.
- Screenshots Gallery grid with thumbnail preview and download/copy button.
- "Pick Up Where You Left Off" card displaying last paused video title, domain, timestamp, and resume button.

### FR-09: Focus & Digital Wellness
- Doomscroll Breaker card: Nudge timer toggle with preset intervals (15m, 30m, 45m).
- Focus Ratio Bar: Visual bar showing Productive vs Entertainment time ratio.

---

## ⚡ 3. Non-Functional Requirements (NFR)

1. **Strict Zero-Regression Invariant:** All 11 existing test suites must pass without error.
2. **Fixed Viewport Compliance:** 420px maximum popup width. Zero horizontal scrollbar, zero element clipping.
3. **Single-Row Footer Invariant:** Footer toolbar must retain exactly 7 buttons on a single row without wrapping or height expansion.
4. **W3C Trusted Types & CSP Safe:** 100% compliant with Content Security Policy; zero `innerHTML` injection.
5. **Ultra-Low Latency:** Tab transitions render in < 16ms (60fps); slider adjustments apply in < 10ms.

---

## 🏷️ 4. MoSCoW Feature Prioritization

- **Must Have:**
  - 4-Pillar top tab navigation bar with persistent tab switching.
  - Player micro-actions bar (Screenshot, Dimmer, Loop, Next Track, Copy Timestamp).
  - Audio Lab layout with Master Volume Boost (0-200%) and 5-band EQ sliders.
  - Studio Vault layout with Timestamp Notes input and Bookmarked Clips list.
  - Focus pane preservation with Doomscroll Breaker and Focus Ratio Bar.
  - Strict preservation of all existing IDs and single-row footer toolbar.
- **Should Have:**
  - Quick Settings gear popover in header.
  - EQ presets dropdown (Flat, Bass Boost, Vocal Clarify, Rock, Night).
  - Smart Automations toggles (Auto-Pause, Ad Silencer, Domain Speed Memory).
  - Screenshots gallery card in Studio pane.
- **Could Have:**
  - Audio-Only mode toggle indicator.
  - Focus Ratio dynamic calculation based on category classification.
- **Won't Have (Strictly Out of Scope):**
  - Backend WebSocket daemon code modifications on port 65432 or 65433.
  - Modification of database schemas in `Browser Data Hub`.

---

## 🧪 5. INVEST User Stories & Given-When-Then Acceptance Criteria

### User Story 1: 4-Pillar Tab Navigation
- **As a** user,  
- **I want** to switch between Player, Audio Lab, Studio, and Focus tabs,  
- **So that** I can access focused feature sets without clutter.
- **Acceptance Criteria (Given-When-Then):**
  - *Given* the extension popup is opened,
  - *When* I click the "🎛️ Audio Lab" tab button (`#mainTabAudio`),
  - *Then* `#viewAudioPane` becomes visible, `#viewMediaPane` and all other panes are hidden, and the active tab style is applied to `#mainTabAudio`.

### User Story 2: Player Micro-Actions
- **As a** student watching lectures,  
- **I want** to copy the current video link with timestamp in 1 click,  
- **So that** I can share key moments with peers.
- **Acceptance Criteria (Given-When-Then):**
  - *Given* a video is playing at 02:45,
  - *When* I click `#btnCardCopyTimestamp`,
  - *Then* the video URL with `&t=165` is copied to clipboard and a bottom toast confirms "Timestamp copied!".

### User Story 3: 5-Band Equalizer & Volume Boost
- **As a** music lover,  
- **I want** to boost volume to 150% and select "Bass Boost",  
- **So that** I get punchier audio on quiet laptop speakers.
- **Acceptance Criteria (Given-When-Then):**
  - *Given* the Audio Lab pane is active,
  - *When* I select "Bass Boost" from `#audioEqPresetSelect`,
  - *Then* the 60Hz and 250Hz sliders move to +6dB and +4dB respectively, and the setting persists in `chrome.storage.local`.

### User Story 4: Backward Compatibility & Zero-Regression
- **As a** maintainer,  
- **I want** all 11 existing test suites to run clean,  
- **So that** no existing tracking, HUD bridging, or media controls are broken.
- **Acceptance Criteria (Given-When-Then):**
  - *Given* the updated `popup.html`, `popup.css`, and `popup.js`,
  - *When* all test scripts in `tests/` are executed via `node`,
  - *Then* all 11 test suites exit with code 0 and 0 assertion errors.
