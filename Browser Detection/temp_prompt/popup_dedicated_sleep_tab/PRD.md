# Dedicated Sleep Timer Tab in Extension Popup Mode — Product Requirements Document (PRD)

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Path:** `temp_prompt/popup_dedicated_sleep_tab/PRD.md`  

---

## 👥 1. User Personas & Scenarios

### Persona 1: "The Bedtime Streamer" (Alex, 28)
- **Behavior:** Watches documentaries, lo-fi livestreams, or video podcasts on YouTube/Twitch while falling asleep in bed.
- **Pain Point:** Frequently wakes up at 3:00 AM with autoplay running through random playlists, depleting device battery and disrupting sleep cycles. Legacy popovers feel clumsy to navigate when drowsy.
- **Goal:** Wants a dedicated ambient tab with a large circular timer ring, quick one-tap duration presets (15m, 30m, 45m, 60m), and an intuitive `+15m` extend button if still awake.

### Persona 2: "The Ambient Audio Listener" (Priya, 34)
- **Behavior:** Listens to white noise, rain sounds, or sleep meditations on Spotify/SoundCloud.
- **Pain Point:** Abrupt playback cuts snap her awake right as she is dozing off.
- **Goal:** Wants smooth 30s/60s audio fade-out curves so the volume gently attenuates to zero, plus End-of-Current-Video smart pause so narrative tracks finish naturally.

---

## 📋 2. Functional Requirements (FR)

### FR-1: 7th Single-Word Navigation Tab
- The top popup navigation bar must display exactly 7 tabs in a symmetrical row: `🎬 Media`, `🎛️ Audio`, `⚡ Tools`, `📚 Studio`, `⏱️ Tracking`, `🌐 Domains`, and `🌙 Sleep`.
- Tab button ID: `#mainTabSleep` with `data-view="sleep"`, `role="tab"`, `aria-selected="false"` (unless active), and `aria-controls="viewSleepPane"`.
- Tab label ID: `#topTabSleepText` with English text `"Sleep"` and Hindi localization `"स्लीप"` (or `"नींद"`).
- Tab live badge: `#tabSleepActiveDot` (`class="tab-live-dot hidden"`), displayed dynamically when a sleep timer is currently active.

### FR-2: Dedicated Sleep View Pane
- A dedicated view pane `#viewSleepPane` (`class="tab-pane"`, `role="tabpanel"`, `aria-labelledby="mainTabSleep"`).
- Symmetrically styled with dark cyber-glassmorphism, subtle indigo/violet ambient glow, and high-density 380px geometry.

### FR-3: Interactive Bedtime Radial Ring (Dial)
- An SVG radial ring (`#sleepDialSvg`, viewBox `0 0 140 140`) containing:
  - Background track circle (`.sleep-dial-track`, r=54, stroke-width=8).
  - Animated progress circle (`#sleepDialProgress`, r=54, stroke-width=8, stroke-linecap=round, circumference=339.292).
  - Center countdown readout (`#sleepDialCountdown`, e.g. `"30:00"`, `"00:00"`, or `"IDLE"`).
  - Target bedtime readout (`#sleepDialTargetTime`, e.g. `"Sleep at 11:45 PM"` or `"No active timer"`).
  - Dynamic status badge (`#sleepDialStatusBadge`, e.g. `"IDLE"`, `"RUNNING"`, `"PAUSED"`, `"FADING"`).

### FR-4: Quick Duration Extend Controls (+5m / +15m)
- Dedicated quick extend buttons positioned directly beneath or adjacent to the radial ring:
  - `#btnSleepExtend5m`: Adds exactly 5 minutes (300,000 ms) to active timer epoch target without restarting cycle.
  - `#btnSleepExtend15m`: Adds exactly 15 minutes (900,000 ms) to active timer epoch target.
- Buttons should gracefully disable or indicate idle state when no timer is currently running, or set an initial 5m/15m timer if clicked while IDLE.

### FR-5: Quick Presets & Custom Minute Input
- A curated grid of 6 preset duration pills: `15m`, `30m`, `45m`, `60m`, `90m`, `120m` (`class="sleep-tab-preset-btn"`).
- Custom minute input (`#inputSleepCustomMinutes`, min=1, max=1440) with a `"Set"` confirmation button (`#btnSetSleepCustom`).
- One-click Start/Pause/Resume toggle button (`#btnSleepToggleRun`) and Cancel/Reset button (`#btnSleepReset`).

### FR-6: Smart Sleep Sentinel Automations
- **End of Current Video / Media Option (`#toggleSleepEndOfVideo`):** Pauses playback when the active media duration reaches `duration - 2s` or sends pause upon media `ended` event.
- **Audio Fade-out Curve (`#toggleSleepFadeCurve`):** Smooth logarithmic/exponential attenuation over 30 seconds prior to expiration.
- **Inactivity Auto-Sleep Sentinel (`#toggleSleepInactivitySentinel`):** Synchronizes with `sentinel_sleep_settings.enableInactivityAutoSleep` to pause media upon idle detection.

### FR-7: Footer Toolbar Launcher Harmonization
- The canonical footer button `#btnSleepTimerTrigger` must be retained in the DOM.
- Clicking `#btnSleepTimerTrigger` transitions active tab to `sleep` (`switchTopTab('sleep', true)`), providing immediate visual jump.
- `#sleepTimerActiveDot` in footer reflects timer active state.

### FR-8: Quick Settings Default Tab Option
- Quick Settings popover select `#selectDefaultTab` must include `<option value="sleep">🌙 Sleep</option>`.
- Allows users to designate the Sleep tab as their default popup landing view.

---

## 🔒 3. Non-Functional Requirements (NFR)

### NFR-1: Zero Horizontal Layout Breakage
- The extension popup operates on a fixed `380px` geometry. The 7-tab grid must maintain `repeat(7, 1fr)` with zero horizontal scrollbars, text clipping, or button wrapping.
- All tab labels must enforce `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.

### NFR-2: Zero CSP / Security Violations
- 100% adherence to Chrome Extension Manifest V3 Content Security Policy (CSP).
- Zero `innerHTML`, `outerHTML`, or `document.write` assignments. All DOM updates must utilize `textContent`, `setAttribute`, or SVG DOM element manipulation.

### NFR-3: Sub-16ms Reactive State Synchronization
- Storage change listeners (`chrome.storage.onChanged`) and local tick intervals must render SVG dial updates in under 16ms (60 FPS feel) with zero CPU thrashing.

### NFR-4: Full Backward Compatibility
- Existing automated test suites (`test_six_tab_popup_architecture.js`, `test_sleep_timer_and_ui_controls.js`, `test_syntax_and_manifest_integrity.js`) must pass with 0 errors and exit code 0.
- All canonical element IDs from prior iterations must be preserved.

### NFR-5: UTF-8 BOM Encoding Standard
- All modified and newly generated source files (`.html`, `.css`, `.js`, `.md`) must be encoded in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🎯 4. MoSCoW Feature Prioritization

| Priority | Feature / Requirement | Justification |
| :--- | :--- | :--- |
| **Must Have** | 7th Tab Button (`#mainTabSleep`) & Pane (`#viewSleepPane`) | Core architecture requirement for dedicated tab experience. |
| **Must Have** | Symmetrical 7-Column CSS Grid (`repeat(7, 1fr)`) | Visual integrity in 380px geometry. |
| **Must Have** | Interactive Bedtime Radial Ring (`#sleepDialSvg`) | Primary visual centerpiece for countdown telemetry. |
| **Must Have** | Quick Presets (15m, 30m, 45m, 60m) & Cancel/Start Controls | Core timer configuration primitives. |
| **Must Have** | Backward-Compatibility Preservation of `#sleepTimerPopover` | Prevents regression in existing test suites. |
| **Should Have** | Quick Extend Controls (`+5m` & `+15m`) | Essential convenience feature for night-time users in bed. |
| **Should Have** | Footer Launcher Jump to Sleep Tab | Seamless workflow integration between footer and top nav. |
| **Should Have** | Quick Settings `<option value="sleep">` Integration | Completes user customization capabilities. |
| **Could Have** | End-of-Video Smart Pause & Exponential Fade Curve Toggles | Rich automation polish. |
| **Won't Have (Scope Lock)** | Backend WebSocket protocol alterations or native daemon rewrites | Pure frontend popup focus per constitutional zero-backend rule. |

---

## 🧪 5. Given-When-Then Acceptance Criteria Contracts

### Scenario 1: Switching to Dedicated 7th Sleep Tab
```gherkin
Given the extension popup is open on any tab (e.g., Media)
When the user clicks the top navigation button "#mainTabSleep" or footer button "#btnSleepTimerTrigger"
Then "#mainTabSleep" receives class "active" and aria-selected="true"
And all other tab buttons lose class "active"
And "#viewSleepPane" receives class "active"
And the active tab state is persisted to chrome.storage.local as { active_popup_tab: 'sleep' }
```

### Scenario 2: Starting a Timer via 30m Preset
```gherkin
Given the user is on "#viewSleepPane" and timer state is "IDLE"
When the user clicks the ".sleep-tab-preset-btn" with data-minutes="30"
Then a SET_SLEEP_TIMER action is dispatched with duration 30 minutes
And "#sleepDialCountdown" begins decrementing from "30:00"
And "#sleepDialStatusBadge" updates to "RUNNING"
And "#sleepDialProgress" updates its stroke-dashoffset proportional to remaining time
And "#tabSleepActiveDot" and footer "#sleepTimerActiveDot" become visible (remove class "hidden")
```

### Scenario 3: Quick Extending Active Timer by +15 Minutes
```gherkin
Given an active sleep timer is running with 5 minutes remaining
When the user clicks "#btnSleepExtend15m"
Then targetTime is incremented by 15 * 60 * 1000 ms (900,000 ms)
And "#sleepDialCountdown" immediately updates to reflect 20 minutes remaining
And "#sleepDialTargetTime" updates its clock time by +15 minutes
And updated state is saved to "sentinel_sleep_timer" in storage
```

### Scenario 4: Backward Compatibility Verification
```gherkin
Given the 7th tab architecture is implemented
When the automated verification test suites "test_six_tab_popup_architecture.js" and "test_sleep_timer_and_ui_controls.js" are executed
Then both test suites pass with 100% assertions satisfied and exit code 0
```
