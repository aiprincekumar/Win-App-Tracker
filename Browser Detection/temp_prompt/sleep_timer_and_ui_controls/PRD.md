# Product Requirements Document (PRD): Sleep Timer & Modern UI Controls

> **Product Name:** Web Activity & Media Sentinel  
> **Feature Track:** Sleep Timer, Inactivity Sentinel & Modern Vector UI Controls  
> **Document Status:** APPROVED FOR IMPLEMENTATION  
> **Owner:** Level 3C Phase-wise Prompt Generation Specialist  
> **Target Release:** v2.5.0  

---

## 🌟 1. Executive Summary & Value Proposition

The **Web Activity & Media Sentinel** browser extension currently tracks per-domain active time and monitors foreground/background media playback. While tracking fidelity is industry-leading, users who stream media late at night or during deep focus sessions lack automated safeguards against runaway playback.

This PRD establishes the requirements for:
1. An intelligent **Sleep Timer** with quick presets (15m, 30m, 45m, 60m) and custom duration options.
2. A gentle **Volume Fade-Out** mechanism to ease users into sleep without jarring auditory transitions.
3. An **Inactivity Auto-Sleep Sentinel** that detects AFK states and halts media playback automatically.
4. A **Global Play/Pause Toggle** directly in the extension popup to control playback across all browser tabs in 1 click.
5. A **Modern Vector SVG Control Toolbar** replacing dated emojis with crisp, responsive, high-DPI icons and dynamic color countdown feedback.

---

## 👥 2. Target User Personas

| Persona | Archetype | Pain Point | Desired Value |
| :--- | :--- | :--- | :--- |
| **Alex (Night Streamer)** | Listens to video podcasts, ambient lo-fi, or Netflix in bed until falling asleep. | Video runs all night; wakes up to dead laptop battery, high data usage, and 8 hours of YouTube logged as "productive work". | Sets a 45-minute sleep timer with volume fade-out. Media stops gently; browsing tracking freezes accurately. |
| **Sarah (Pomodoro Developer)** | Uses focused audio streams (brain.fm, synthwave) for timed deep work sprints. | Loses track of time; manual tab switching breaks flow state; forgets to pause audio during breaks. | Sets a 25-minute focus/sleep timer; uses 1-click global play/pause in popup to mute audio when stepping away. |
| **David (Battery Conscious Nomad)** | Browses on battery power on commuter trains and cafes. | Background video tabs keep playing after closing laptop lid or walking away for a coffee. | Inactivity detector automatically pauses media after 10 minutes of idle, preserving laptop battery. |

---

## 🎯 3. MoSCoW Feature Prioritization Matrix

- **Must Have (M):**
  - Sleep timer presets: 15m, 30m, 45m, 60m.
  - Manifest V3 alarm-backed execution surviving service worker suspension.
  - Global pause dispatcher halting all detected media streams when timer expires.
  - Dynamic badge countdown on browser toolbar icon.
  - Modern SVG icons for Refresh, Play/Pause, Sleep Timer, HUD, and Dashboard.
  - 1-click global Play/Pause button in popup footer.
- **Should Have (S):**
  - Custom duration input (1 to 1440 minutes).
  - Dynamic linear color interpolation on badge (`#22c55e` Green -> `#eab308` Yellow -> `#ef4444` Red).
  - 30-second smooth volume fade-out before final pause.
  - Inactivity auto-sleep trigger linked to `chrome.idle`.
  - Cancel / Reset timer capability at any time.
- **Could Have (C):**
  - Dashboard configuration card for sleep timer default values and fade duration.
  - Toast banner confirmation on timer start, cancel, and expiration.
- **Won't Have (W - Out of Scope for v2.5.0):**
  - Full operating system sleep/shutdown triggers (requires native host application escalation).
  - Hardware system master volume attenuation (handled at HTMLMediaElement level).

---

## 📋 4. Functional Requirements (FR)

### FR-1: Sleep Timer Duration Selection & Activation
- **FR-1.1:** The popup must provide a Sleep Timer launcher button. Clicking it displays a popover with preset options: **15 min**, **30 min**, **45 min**, **60 min**, and a **Custom** numeric input.
- **FR-1.2:** Selecting a preset or confirming a custom duration activates the timer immediately.
- **FR-1.3:** The timer state must be persisted immediately to `chrome.storage.local` with target timestamp, original duration, and creation epoch.
- **FR-1.4:** A user may click "Cancel Timer" at any time to abort the countdown and restore default badge styling.

### FR-2: Playback Pause & Audio Fade-Out Relay
- **FR-2.1:** Upon timer expiration, the background service worker must broadcast a `PAUSE_MEDIA` IPC command to all active media tabs registered in `activeMediaSessions`.
- **FR-2.2:** If volume fade-out is enabled, the background service worker broadcasts `FADE_AND_PAUSE` 30 seconds prior to expiration.
- **FR-2.3:** Injected content scripts (`content_media.js`) must step down the volume of all `<video>` and `<audio>` elements linearly from current level to `0.0` before pausing.
- **FR-2.4:** Time tracking for active media tabs must commit intervals cleanly to prevent false time accumulation.

### FR-3: Inactivity Auto-Sleep Sentinel
- **FR-3.1:** When `chrome.idle.onStateChanged` detects `idle` or `locked` and the user has enabled "Auto-Sleep on Inactivity", a configurable grace period (e.g. 15m) begins.
- **FR-3.2:** If the user remains inactive through the grace period while media is playing, the auto-sleep action triggers playback pause and freezes active domain tracking.
- **FR-3.3:** When the user returns to `active`, playback remains paused until explicitly resumed by user.

### FR-4: Global Play/Pause Control
- **FR-4.1:** The popup footer must include a dedicated Global Play/Pause button.
- **FR-4.2:** If any registered media session is currently playing, the button displays a "Pause All" SVG icon. Clicking it pauses all playing tabs.
- **FR-4.3:** If all media sessions are paused or idle, the button displays a "Resume" SVG icon. Clicking it resumes playback on the most recently active media tab.

### FR-5: Modern Vector SVG Iconography
- **FR-5.1:** All text emojis in the popup footer and primary action bars must be replaced with crisp, inline SVG vector icons.
- **FR-5.2:** SVGs must feature standard 24x24 viewBox, stroke-width of 2, rounded linecaps/joins, and inherit current text color (`currentColor`).
- **FR-5.3:** Required SVG assets: Refresh Icon, Play/Pause Dual-State Icon, Sleep Timer Moon/Clock Icon, HUD Link Icon, Dashboard Icon.

### FR-6: Dynamic Color-Interpolated Badge & Countdown UI
- **FR-6.1:** When a sleep timer is active, the browser extension action badge displays remaining time formatted as `XXm` (or `XXs` when under 60 seconds).
- **FR-6.2:** The badge background color must dynamically interpolate across three thresholds:
  - Remaining > 50%: Safe Green (`#22c55e`)
  - 20% < Remaining <= 50%: Warning Amber (`#eab308`)
  - Remaining <= 20%: Critical Rose (`#ef4444`)
- **FR-6.3:** When remaining time is under 60 seconds, the popup countdown chip must display a subtle pulsing animation.

### FR-7: Dashboard Configuration & Preference Persistence
- **FR-7.1:** The Dashboard Settings page must feature a "Sleep Timer & Inactivity Sentinel" card.
- **FR-7.2:** Settings must include: Default Timer Duration dropdown, Enable Audio Fade-Out toggle, Inactivity Auto-Sleep toggle & threshold selector, and Badge Display toggle.
- **FR-7.3:** Changes must save synchronously to `chrome.storage.local` and take effect immediately without requiring extension reload.

---

## 🔒 5. Non-Functional Requirements (NFR)

- **NFR-1 (Lifecycle Resilience):** The timer must be 100% resilient to Manifest V3 service worker termination. No state may be lost when Chrome unloads the background page.
- **NFR-2 (Zero Cumulative Layout Shift):** UI popovers and button state transitions in `popup.html` must not cause DOM layout jumping, horizontal scrolling, or element clipping.
- **NFR-3 (Strict CSP & Trusted Types):** All dynamic DOM generation in `popup.js` and `dashboard.js` must use safe element creation methods (`createElement`, `textContent`, `appendChild`). Zero `innerHTML` assignments.
- **NFR-4 (Safe IPC Messaging):** Uncaught promise rejections from closed or unreachable tabs during broadcast must be 100% suppressed via proper catch handlers.
- **NFR-5 (High Performance & Low Battery Consumption):** Countdown loops in `background.js` must NOT run 1-second intervals in the background; countdown rendering is restricted to `chrome.alarms` wakeups and active popup sessions.

---

## 📖 6. INVEST-Compliant User Stories & Acceptance Criteria

### User Story US-1: Setting a Sleep Timer from Popup
**As a** nighttime media watcher,  
**I want to** select a 30-minute sleep timer preset directly from the popup footer,  
**So that** my playing media stops automatically after I fall asleep.

```gherkin
Scenario: User activates 30-minute sleep timer
  Given the user has an active YouTube video playing in a browser tab
  When the user opens the Sentinel popup and clicks the Sleep Timer button
  And selects the "30m" preset button
  Then a sleep timer is scheduled with target time 30 minutes in the future
  And the extension badge displays "30m" with green background (#22c55e)
  And a confirmation toast "Sleep timer set for 30 minutes" appears
  And the state is saved to chrome.storage.local
```

### User Story US-2: Automatic Media Pause on Timer Expiration
**As a** sleeping user,  
**I want** my video and audio playback to pause when the countdown finishes,  
**So that** battery and network data are conserved.

```gherkin
Scenario: Sleep timer expires while service worker was suspended
  Given an active sleep timer was set for 15 minutes
  And the Chrome service worker was suspended after 30 seconds of inactivity
  When the chrome.alarms "sentinel_sleep_timer_alarm" fires at 15 minutes
  Then the service worker awakens
  And retrieves the active sleep timer state from chrome.storage.local
  And broadcasts PAUSE_MEDIA to all active media tabs
  And clears the extension action badge
  And marks the sleep timer state as TRIGGERED in storage
```

### User Story US-3: Dynamic Color Countdown on Extension Badge
**As a** busy multitasking user,  
**I want** the extension badge to shift color from green to yellow to red as time elapses,  
**So that** I have immediate peripheral awareness of remaining playback time.

```gherkin
Scenario: Badge color interpolation across lifecycle
  Given a 60-minute sleep timer is running
  When 50 minutes remain (>50% remaining)
  Then the badge background color is green (#22c55e)
  When 25 minutes remain (between 20% and 50% remaining)
  Then the badge background color is yellow (#eab308)
  When 5 minutes remain (<=20% remaining)
  Then the badge background color is red (#ef4444)
```

### User Story US-4: 1-Click Global Play/Pause Control
**As a** user receiving a phone call,  
**I want** a 1-click button in the popup to pause all playing media tabs at once,  
**So that** I don't have to search through tabs to silence audio.

```gherkin
Scenario: Global pause when media is playing
  Given tab 1 is playing YouTube and tab 2 is playing Spotify
  When the user opens the popup and clicks the Global Play/Pause button
  Then both tab 1 and tab 2 receive pause commands
  And both audio streams are paused
  And the button icon updates from "Pause All" to "Resume"
```
