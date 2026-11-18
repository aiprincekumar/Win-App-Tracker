# Advanced Suite Integration for Focus & Sleep Hubs: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Workspace Container:** `temp_prompt/advanced_features_focus_sleep/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design), Dept 05 (Frontend), Dept 08 (QA & Testing)  

---

## 👥 1. User Personas & Problem Scenarios

### 1.1 Persona A: The Deep Work Engineer (Dev / Researcher)
- **Pain Point:** Struggles with subconscious context switching (opening Reddit/Twitter tabs while waiting for builds). Background music tabs suddenly start playing loud ads. Eye fatigue after 2-hour coding sprints.
- **Goal:** Needs an opt-in focus integrity tracker to gamify focus retention, automatic background audio silencing, science-backed binaural frequencies (Alpha/Beta/Gamma), gentle breathing prompts instead of frustrating hard blocks, and 20-20-20 posture reminders.

### 1.2 Persona B: The Bedtime Streamer & Restful Sleeper
- **Pain Point:** Falls asleep listening to video essays, documentaries, or ambient audio on YouTube/Netflix. The platform autoplays jarring next videos at 3:00 AM, laptop fan spins at max speed due to 40 open background tabs, and bright blue light disrupts melatonin production.
- **Goal:** Wants an automated autoplay killer, dedicated pink noise or delta rain soundscapes that fade out smoothly with the timer, memory tab hibernation to quiet fans, circadian screen dimming, and a 1-click 20-minute power nap button.

---

## 📋 2. Functional Requirements (FR)

### 2.1 Focus Advanced Hub (5 Core Features)
- **FR-1 [Focus Integrity Score & Distraction Counter]:**
  - Toggle: `#toggleFocusIntegrityScore` (default: `checked = false`).
  - When enabled, calculates dynamic Focus Integrity Score (0-100%). Every tab switch to an unapproved/distracting domain deducts 5 points and increments `#cntFocusDistractions`.
  - When disabled, displays "Score Disabled (Opt-in)".
- **FR-2 [Auto-Mute Background Tabs on Focus]:**
  - Toggle: `#toggleFocusAutoMuteBg` (default: `checked = false`).
  - When starting a Focus session with this toggle ON, queries all audible background tabs and issues a mute directive.
  - Upon session completion or manual reset, restores tab audio states.
- **FR-3 [Binaural Beats & Flow Frequencies]:**
  - Extends `#selectFocusSoundscape` with 3 frequency-tuned binaural options:
    - Alpha (10Hz) - Flow State & Calm Focus.
    - Beta (18Hz) - High Cognition & Analytical Logic.
    - Gamma (40Hz) - Problem Solving & Memory Retrieval.
  - Generates discrete stereo frequencies in real time via Web Audio API. Default option remains `'none'`.
- **FR-4 [Soft-Nudge Breathe Overlay on Distracting Domains]:**
  - Toggle: `#toggleFocusBreatheNudge` (default: `checked = false`).
  - When enabled and user enters a distracting domain during active focus, presents a serene box-breathing dialog (Inhale 4s, Hold 4s, Exhale 4s) with a prominent "Return to Task" button and a secondary "Dismiss for 5m" action.
- **FR-5 [20-20-20 Screen-Break & Posture Alert]:**
  - Toggle: `#toggleFocus2020Alert` (default: `checked = false`).
  - Every 20 minutes of cumulative active focus, displays a gentle, auto-dismissing visual HUD: *"20-20-20 Rule: Look at an object 20 feet away for 20 seconds. Relax shoulders and calibrate posture."*

### 2.2 Sleep Advanced Hub (6 Core Features)
- **FR-6 [Auto-Disable Video Autoplay]:**
  - Toggle: `#toggleSleepAutoplayBlock` (default: `checked = false`).
  - While sleep timer is active, communicates with media players to turn off autoplay toggles and prevent automatic transition to next episodes or recommendations.
- **FR-7 [Sleep Aid Soundscapes]:**
  - Dropdown: `#selectSleepAidSoundscape` (default: `'none'`).
  - Options: None, Pink Noise (1/f spectral density), Midnight Ocean (resonant low-pass surf), Delta Rain (gentle shower with 2.5Hz binaural carrier).
  - Automatically ties into the sleep timer's volume fade-out curve (10s, 30s, or 60s).
- **FR-8 [Inactivity Fast-Cutoff]:**
  - Toggle: `#toggleSleepInactivityFastCutoff` (default: `checked = false`).
  - If no mouse, touch, or keyboard input is detected across the system for 5 continuous minutes while a sleep timer is ticking, triggers an immediate graceful fade-and-cutoff.
- **FR-9 [Progressive Screen Dimmer Nudge]:**
  - Toggle: `#toggleSleepScreenDimmer` (default: `checked = false`).
  - Smoothly reduces viewport luminosity using a dark circadian vignette during the last 60 seconds of sleep countdown.
- **FR-10 [Memory-Saver Tab Hibernation]:**
  - Toggle: `#toggleSleepTabHibernate` (default: `checked = false`).
  - Upon sleep timer cutoff, safely discards inactive, non-pinned background tabs to minimize memory usage, drop CPU temperatures, and silence laptop fans.
- **FR-11 [Power-Nap Mode 20m]:**
  - Button: `#btnSleepPowerNapMode` (default: inactive).
  - 1-click action: Configures timer to exactly 20 minutes, activates Gentle Delta soundscape, enables fade curve, and sets wake chime ready.

---

## 🔒 3. Non-Functional Requirements (NFR)

- **NFR-1 (Default OFF / Inactive Invariant):** Every single new feature MUST be disabled, unchecked, or set to `'none'` upon initial page load and local storage initialization. Zero unrequested audio or disruptive prompts.
- **NFR-2 (Basic Containers Untouched):** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` remain strictly untouched.
- **NFR-3 (W3C Trusted Types Compliance):** Absolute prohibition on `innerHTML`, `outerHTML`, or `document.write`. All dynamic text and DOM nodes must use safe DOM APIs.
- **NFR-4 (Performance & Zero Assets):** All audio synthesis (binaural beats, pink noise, delta rain, ocean) must be 100% mathematical Web Audio API nodes. No external `.mp3` or `.wav` files downloaded.
- **NFR-5 (Bilingual Parity):** All new UI labels, descriptions, and dropdown options must have 1:1 English and Hindi localization entries in `dashboard.js`.
- **NFR-6 (Master Regression Defense):** All 83+ existing test suites must pass 100% clean with exit code 0.

---

## 🎯 4. MoSCoW Feature Prioritization

| Priority | Features | Justification |
| :--- | :--- | :--- |
| **Must Have (P0)** | - Default OFF enforcement across all 11 controls<br>- Basic containers untouched invariant<br>- DOM injection in `#widgetFocusAdvanced` and `#cardSleepAdvanced`<br>- Bilingual i18n dictionary entries (EN/HI) | Constitutional invariants and architectural foundation. |
| **Should Have (P1)** | - Web Audio API Binaural Beats (Alpha, Beta, Gamma)<br>- Sleep Aid Soundscapes (Pink Noise, Midnight Ocean, Delta Rain)<br>- Power-Nap Mode 20m preset<br>- Focus Integrity Score & Distraction Counter | Core functional value for advanced bio-hacking and sleep. |
| **Could Have (P2)** | - Soft-nudge breathe overlay on distracting domains<br>- 20-20-20 posture alert toast<br>- Progressive screen dimmer vignette<br>- Inactivity fast-cutoff & tab hibernation | Ergonomic polish and deep operating system integration. |

---

## 🧪 5. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Default OFF Invariant on Clean State
- **Given** a user opens the dashboard with fresh or existing settings,
- **When** the page initializes,
- **Then** `#toggleFocusIntegrityScore.checked` is `false`,
- **And** `#toggleFocusAutoMuteBg.checked` is `false`,
- **And** `#selectFocusSoundscape.value` is `'none'`,
- **And** `#toggleFocusBreatheNudge.checked` is `false`,
- **And** `#toggleFocus2020Alert.checked` is `false`,
- **And** `#toggleSleepAutoplayBlock.checked` is `false`,
- **And** `#selectSleepAidSoundscape.value` is `'none'`,
- **And** `#toggleSleepInactivityFastCutoff.checked` is `false`,
- **And** `#toggleSleepScreenDimmer.checked` is `false`,
- **And** `#toggleSleepTabHibernate.checked` is `false`,
- **And** `#btnSleepPowerNapMode` is in default inactive state.

### Contract 2: Basic Containers Untouched Preservation
- **Given** the DOM has loaded,
- **When** `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` are inspected,
- **Then** `#btnStartPomodoro`, `#pomodoroTimeDisplay`, `#dashFocusDialProgress`, `#btnDashSleepToggle`, `#dashSleepCountdownDisplay`, `#dashSleepDialProgress` all exist with identical IDs, attributes, and structures.

### Contract 3: Binaural Beats Audio Generation
- **Given** `#selectFocusSoundscape` is changed to `'binaural_alpha'`,
- **When** the user clicks `#btnToggleSoundscape` or starts a Pomodoro session,
- **Then** the Web Audio API instantiates dual oscillators with carrier frequencies (200Hz / 210Hz) connected via stereo channel panner,
- **And** no audio errors or external file 404s are triggered.

### Contract 4: Power-Nap Mode 20m 1-Click Trigger
- **Given** the user clicks `#btnSleepPowerNapMode`,
- **When** the click event fires,
- **Then** the sleep timer duration is set to 20 minutes,
- **And** the countdown display updates to `20:00`,
- **And** the Sleep Aid soundscape is set to `'delta_rain'`,
- **And** the sleep status badge updates to `ACTIVE` or `READY`.

---

## 🌐 6. Bilingual i18n Specification (EN / HI)

| Key | English Text | Hindi Localization |
| :--- | :--- | :--- |
| `lbl_focus_integrity` | Focus Integrity Score | फोकस सत्यनिष्ठा स्कोर |
| `desc_focus_integrity` | Live attention retention score and distraction event counter | वास्तविक समय ध्यान स्कोर और विचलन काउंटर |
| `toggle_focus_automute_bg` | Auto-Mute Background Tabs | बैकग्राउंड टैब स्वतः म्यूट करें |
| `desc_focus_automute_bg` | Mute noisy background tabs when entering active focus | फोकस शुरू होते ही अन्य सभी बैकग्राउंड टैब म्यूट करें |
| `soundscape_opt_binaural_alpha` | 🧘 Alpha 10Hz (Flow State) | 🧘 अल्फा 10Hz (प्रवाह अवस्था) |
| `soundscape_opt_binaural_beta` | 🧠 Beta 18Hz (Analytical Focus) | 🧠 बीटा 18Hz (गहन विश्लेषण) |
| `soundscape_opt_binaural_gamma` | ⚡ Gamma 40Hz (Peak Cognition) | ⚡ गामा 40Hz (शीर्ष संज्ञान) |
| `toggle_focus_breathe_nudge` | Soft-Nudge Breathe Overlay | सौम्य श्वास विश्राम संकेत |
| `desc_focus_breathe_nudge` | 12s box-breathing mindfulness prompt on distracting domains | ध्यान भटकाने वाली वेबसाइटों पर 12 सेकंड का श्वास विश्राम |
| `toggle_focus_2020_alert` | 20-20-20 Screen-Break & Posture | 20-20-20 स्क्रीन-विश्राम और मुद्रा सतर्कता |
| `desc_focus_2020_alert` | Remind every 20m to look 20ft away for 20s and calibrate posture | हर 20 मिनट पर 20 सेकंड के लिए 20 फीट दूर देखने का स्मरण |
| `toggle_sleep_autoplay_block` | Auto-Disable Video Autoplay | वीडियो स्वतः प्ले रोकें |
| `desc_sleep_autoplay_block` | Prevent streaming platforms from autoleaping to next video | सोते समय स्ट्रीमिंग प्लेटफॉर्म पर अगला वीडियो स्वतः चलने से रोकें |
| `lbl_sleep_aid_soundscapes` | Sleep Aid Soundscapes | निद्रा सहायक ध्वनियां |
| `desc_sleep_aid_soundscapes` | Acoustic synthesizers with gentle circadian sleep fade | शांत ध्वनियां जो स्लीप टाइमर के साथ धीरे-धीरे बंद होती हैं |
| `sleep_soundscape_none` | Off (Silent) | बंद (शांत) |
| `sleep_soundscape_pink` | 🌸 Deep Pink Noise | 🌸 डीप पिंक नॉइज़ |
| `sleep_soundscape_ocean` | 🌊 Midnight Ocean | 🌊 अर्धरात्रि समुद्र |
| `sleep_soundscape_rain` | 🌧️ Delta Rain (2.5Hz) | 🌧️ डेल्टा रेन (2.5Hz) |
| `toggle_sleep_inactivity_cutoff`| Inactivity Fast-Cutoff (5m) | 5 मिनट निष्क्रियता पर त्वरित शटडाउन |
| `desc_sleep_inactivity_cutoff` | Expedite sleep cutoff if idle for >5m during countdown | टाइमर के दौरान 5 मिनट निष्क्रिय रहने पर तुरंत कटऑफ करें |
| `toggle_sleep_screen_dimmer` | Progressive Screen Dimmer Nudge | क्रमिक स्क्रीन डिमर संकेत |
| `desc_sleep_screen_dimmer` | Circadian screen luminance dimming during final countdown | टाइमर समाप्ति से पूर्व स्क्रीन की रोशनी को धीरे-धीरे धीमा करें |
| `toggle_sleep_tab_hibernate` | Memory-Saver Tab Hibernation | मेमोरी-सेवर टैब निलंबन |
| `desc_sleep_tab_hibernate` | Discard background tabs on timeout to quiet laptop cooling fans | स्लीप टाइमर पर बैकग्राउंड टैब सस्पेंड कर पंखे की आवाज शांत करें |
| `btn_sleep_power_nap` | ⚡ 20m Power-Nap Mode | ⚡ 20 मिनट पावर-नैप मोड |
| `desc_sleep_power_nap` | 1-click restorative 20m nap with delta rain and gentle wake | डेल्टा रेन और शांत अलार्म के साथ 20 मिनट का स्फूर्तिदायक नैप |
