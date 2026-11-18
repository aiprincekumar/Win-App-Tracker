# Technical Requirements Document (TRD): Focus & Sleep Advanced Controls Modular Split

> **Document Type:** Technical Requirements Document (TRD)  
> **Initiative:** Web Activity & Media Sentinel Dashboard Modernization  
> **Task ID:** `TASK-UI-ADVANCED-CONTROLS-SPLIT-001`  
> **Lead Department:** Dept 05 Frontend Engineering  

---

## 🏗️ 1. High-Level Architecture (HLD)

The DOM hierarchy under `#paneWellbeing` > `#tabContentWellbeing` is restructured into a symmetrical 2-tier bento architecture:

```
#tabContentWellbeing (.bento-grid-container.wellbeing-grid.bento-grid)
├── [Tier 1: Basic Hubs - Strictly Untouched]
│   ├── #widgetPomodoroSentinel (.bento-card.liquid-glass-card.bento-span-6)
│   └── #cardSleepSentinelHub (.bento-card.liquid-glass-card.bento-span-6)
│
└── [Tier 2: Advanced Suites - 4 Modular Bento Cards]
    ├── [Suite 1: Focus Advanced Suite]
    │   ├── #widgetFocusAdvancedPlanner (.bento-card.liquid-glass-card.bento-span-6)
    │   └── #widgetFocusAdvancedShields (.bento-card.liquid-glass-card.bento-span-6)
    │
    └── [Suite 2: Sleep Advanced Suite]
        ├── #widgetSleepAdvancedAcoustics (.bento-card.liquid-glass-card.bento-span-6)
        └── #widgetSleepAdvancedAutomation (.bento-card.liquid-glass-card.bento-span-6)
```

---

## 🔍 2. Low-Level Design (LLD) & DOM Specifications

### 2.1 Card 1A: Focus Acoustic Environment & Session Planner (`#widgetFocusAdvancedPlanner`)
- **Container ID:** `widgetFocusAdvancedPlanner`
- **Classes:** `bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card`
- **Header:**
  - Icon: `🎵`
  - Title: `#txtFocusPlannerTitle` ("Session Planner & Soundscapes" / `focus_planner_title`)
  - Subtitle: `#txtFocusPlannerDesc` ("Custom goals, ambient soundscapes, acoustic chimes & rhythm aids" / `focus_planner_desc`)
- **Body Elements (2-Column Grid):**
  - **Column 1 (Planning & Steppers):**
    - Goal input: `#inputFocusGoal`, `#chipActiveFocusGoal`, `#txtActiveFocusGoal`, `#btnClearFocusGoal`
    - Custom Stepper: `#inputFocusCustomMinutes`, `#btnApplyCustomMinutes`
    - Quick Extenders: `#btnFocusExtend5`, `#btnFocusExtend15`
  - **Column 2 (Acoustics & Pacing):**
    - Soundscape synthesizer: `#selectFocusSoundscape`, `#btnToggleSoundscape`, `#sliderSoundscapeVolume`, `#txtSoundscapeVolume`
    - Completion chime: `#selectFocusChimeTone`, `#btnPreviewChime`
  - **Extended Pacing Toggles (Full Width / Span 2):**
    - Break Auto-Restart switch: `#toggleFocusAutoRestartBreak`
    - Analog Rhythm Ticking switch: `#toggleFocusTicking`
    - Ambient Lighting Sync switch: `#toggleFocusAmbientLighting`

### 2.2 Card 1B: Focus Smart Shields & Cognitive Integrity (`#widgetFocusAdvancedShields`)
- **Container ID:** `widgetFocusAdvancedShields`
- **Classes:** `bento-card liquid-glass-card bento-span-6 pomodoro-advanced-card`
- **Header:**
  - Icon: `🛡️`
  - Title: `#txtFocusShieldsTitle` ("Smart Shields & Attention Integrity" / `focus_shields_title`)
  - Subtitle: `#txtFocusShieldsDesc` ("Attention scoring, media shielding, breathing nudges & ergonomics" / `focus_shields_desc`)
- **Body Elements (2-Column Grid):**
  - **Column 1 (Attention & Media Guards):**
    - Integrity Score: `#badgeFocusIntegrityScore`, `#cntFocusDistractions`, `#toggleFocusIntegrityScore`
    - Auto-pause Media: `#toggleFocusAutoPauseMedia`
    - Auto-mute Background Tabs: `#toggleFocusAutoMuteBg`
  - **Column 2 (Cognitive Health & Shielding):**
    - Strict Distraction Shield: `#toggleFocusDistractionShield`
    - Soft-Nudge Breathe Overlay: `#toggleFocusBreatheNudge`
    - 20-20-20 Posture Alert: `#toggleFocus2020Alert`
  - **Extended Shield Toggles (Full Width / Span 2):**
    - Full-Page Hard Blockade: `#toggleFocusHardBlockade`
    - DND Notification Silencer: `#toggleFocusDndNotifications`
    - Tab Memory Discard / Freeze: `#toggleFocusTabFreeze`

### 2.3 Card 2A: Bedtime Acoustics & Power-Nap Engine (`#widgetSleepAdvancedAcoustics`)
- **Container ID:** `widgetSleepAdvancedAcoustics`
- **Classes:** `bento-card liquid-glass-card bento-span-6 sleep-advanced-card`
- **Header:**
  - Icon: `🌙`
  - Title: `#txtSleepAcousticsTitle` ("Bedtime Acoustics & Power-Nap Engine" / `sleep_acoustics_title`)
  - Subtitle: `#txtSleepAcousticsDesc` ("Restorative power-naps, delta soundscapes & gentle volume fade" / `sleep_acoustics_desc`)
- **Body Elements (2-Column Grid):**
  - **Full-Width Banner:**
    - 20m Power-Nap Mode Banner: `#btnSleepPowerNapMode`, `.power-nap-info`
  - **Column 1 (Custom Timing & Extenders):**
    - Custom Sleep Stepper: `#inputDashSleepCustomMinutes`, `#btnSetDashSleepCustom`
    - Quick Extenders: `#btnDashSleepExtend5`, `#btnDashSleepExtend15`
  - **Column 2 (Acoustic Aids & Fade-out):**
    - Sleep Aid Soundscapes: `#selectSleepAidSoundscape`, `#btnToggleSleepSoundscape`, `#sliderSleepSoundscapeVolume`, `#txtSleepSoundscapeVolume`
    - Gradual Audio Fade-out: `#toggleDashSleepFade`, `#selectDashSleepFadeCurve`
  - **Extended Acoustic Toggles (Full Width / Span 2):**
    - White Noise Delta Drift: `#toggleSleepWhiteNoiseDrift`
    - Gentle Morning Wake Chime: `#toggleSleepGentleAlarm`
    - Smart Pre-Bedtime Wind-Down: `#toggleSleepSmartPrewind`

### 2.4 Card 2B: Sleep Cutoff Sentinel & Power Automation (`#widgetSleepAdvancedAutomation`)
- **Container ID:** `widgetSleepAdvancedAutomation`
- **Classes:** `bento-card liquid-glass-card bento-span-6 sleep-advanced-card`
- **Header:**
  - Icon: `⚡`
  - Title: `#txtSleepAutomationTitle` ("Sleep Cutoff Sentinel & Power Automation" / `sleep_automation_title`)
  - Subtitle: `#txtSleepAutomationDesc` ("Automated playback cutoff, tab hibernation & inactivity triggers" / `sleep_automation_desc`)
- **Body Elements (2-Column Grid):**
  - **Column 1 (Playback Cutoff Triggers):**
    - Stop at End of Video: `#toggleDashSleepEndOfVideo`
    - Autoplay Suppression: `#toggleSleepAutoplayBlock`
    - Inactivity 15m Auto-Sleep: `#toggleDashSleepInactivity`
    - Inactivity 5m Fast-Cutoff: `#toggleSleepInactivityFastCutoff`
  - **Column 2 (Action Dispatch & System Protection):**
    - On Timeout Action: `#selectDashSleepTimeoutAction` (pause, mute, close_tab)
    - Progressive Circadian Screen Dimmer: `#toggleSleepScreenDimmer`
    - Memory-Saver Tab Hibernation: `#toggleSleepTabHibernate`
  - **Extended Automation Toggles (Full Width / Span 2):**
    - Unconditional Close All Media Tabs: `#toggleSleepCloseAllMediaTabs`
    - Full Display Blackout Overlay: `#toggleSleepDarkenDisplay`
    - Host Inactivity Bridge Sync: `#toggleSleepSystemInactivitySync`

---

## 🔘 3. Modern Switch Component Specification

All checkboxes are transformed into accessible switch components:

```html
<div class="control-toggle-item">
  <div class="toggle-text-group">
    <span class="toggle-title" data-i18n="key_title">Control Title</span>
    <span class="toggle-desc" data-i18n="key_desc">Detailed behavior description</span>
  </div>
  <label class="switch-toggle" for="toggleElementId">
    <input type="checkbox" id="toggleElementId" class="switch-input" aria-label="Control Title">
    <span class="slider-round"></span>
  </label>
</div>
```

### 3.1 CSS Rules for `.switch-toggle`
- Dimensions: `width: 44px`, `height: 24px`, `position: relative`, `display: inline-block`
- Hidden Checkbox: `opacity: 0`, `width: 0`, `height: 0`
- Track (`.slider-round`): `border-radius: 24px`, `background: rgba(255, 255, 255, 0.12)`, `border: 1px solid rgba(255, 255, 255, 0.18)`, `transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1)`
- Thumb (`.slider-round:before`): `width: 18px`, `height: 18px`, `border-radius: 50%`, `background: #ffffff`, `left: 2px`, `bottom: 2px`, `box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35)`
- Checked Track: `background: linear-gradient(135deg, #10b981 0%, #059669 100%)`, `border-color: rgba(16, 185, 129, 0.5)`
- Checked Thumb: `transform: translateX(20px)`
- Focus Indicator: `input:focus-visible + .slider-round { outline: 2px solid #06b6d4; outline-offset: 2px; }`

---

## 📐 4. Responsive 2-Column CSS Grid Specification

```css
/* Container inside card body */
.controls-2col-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.controls-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls-full-span {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Responsive Collapse */
@media (max-width: 850px) {
  .controls-2col-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

---

## 🔒 5. Backward Compatibility & Non-Breaking Guarantee

1. **Strict ID Preservation:**  
   Every ID present in legacy HTML (`inputFocusGoal`, `toggleFocusAutoPauseMedia`, `toggleFocusChime`, `toggleFocusDistractionShield`, `toggleFocusIntegrityScore`, `toggleFocusAutoMuteBg`, `toggleFocusBreatheNudge`, `toggleFocus2020Alert`, `btnSleepPowerNapMode`, `inputDashSleepCustomMinutes`, `selectSleepAidSoundscape`, `toggleDashSleepFade`, `toggleDashSleepEndOfVideo`, `toggleDashSleepInactivity`, `selectDashSleepTimeoutAction`, `toggleSleepAutoplayBlock`, `toggleSleepInactivityFastCutoff`, `toggleSleepScreenDimmer`, `toggleSleepTabHibernate`) MUST remain intact in the new cards.
2. **Controller Transparency:**  
   `dashboard/dashboard.js` and other controller modules query these IDs via `document.getElementById(...)`. Preserving these IDs ensures that 100% of existing event listeners, state synchronizations, and IPC dispatches continue functioning with zero modifications required.
