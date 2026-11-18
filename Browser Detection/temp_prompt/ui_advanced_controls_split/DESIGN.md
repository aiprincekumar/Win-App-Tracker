# Design System & UI Specification: Focus & Sleep Advanced Modular Suites

> **Design Standard:** Cyber-Dark Glassmorphic Bento Architecture  
> **Initiative:** Web Activity & Media Sentinel Dashboard Modernization  
> **Task ID:** `TASK-UI-ADVANCED-CONTROLS-SPLIT-001`  
> **Lead Department:** Dept 05 Frontend Engineering  

---

## 🎨 1. Cyber-Dark Glassmorphic UI Tokens

```css
:root {
  /* Surfaces */
  --bg-card-glass: rgba(15, 23, 42, 0.65);
  --bg-card-glass-hover: rgba(15, 23, 42, 0.82);
  --bg-input-glass: rgba(30, 41, 59, 0.55);
  
  /* Borders */
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-accent-focus: rgba(6, 182, 212, 0.35);
  --border-glass-accent-sleep: rgba(168, 85, 247, 0.35);
  --border-glass-emerald: rgba(16, 185, 129, 0.35);
  
  /* Accents */
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-indigo: #6366f1;
  --accent-purple: #a855f7;
  
  /* Blurs & Shadows */
  --blur-card: 16px;
  --shadow-bento: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  --shadow-switch: 0 2px 6px rgba(0, 0, 0, 0.35);
}
```

---

## 🃏 2. Card Visual Hierarchy & Spatial Composition

### 2.1 Focus Advanced Suite
- **Card 1A: Focus Acoustic Environment & Session Planner (`#widgetFocusAdvancedPlanner`)**
  - Accent Tone: Cyan `#06b6d4` & Emerald `#10b981`
  - Header Badge: `🎵` icon, bright white title, subtle cyan subtitle
  - Interior Rhythm: Top input row for goal, followed by 2-column grid (Left: Durations; Right: Soundscapes & Chimes)
  - Bottom Section: Extended pacing toggles separated by a delicate glowing glass divider

- **Card 1B: Focus Smart Shields & Cognitive Integrity (`#widgetFocusAdvancedShields`)**
  - Accent Tone: Emerald `#10b981` & Amber `#f59e0b`
  - Header Badge: `🛡️` icon, bright white title, subtle emerald subtitle
  - Interior Rhythm: Left column houses Attention & Media Guards; Right column houses Ergonomics & Cognitive Shields
  - Bottom Section: Extended hard shields (DND, Hard Blockade, Tab Freeze)

### 2.2 Sleep Advanced Suite
- **Card 2A: Bedtime Acoustics & Power-Nap Engine (`#widgetSleepAdvancedAcoustics`)**
  - Accent Tone: Indigo `#6366f1` & Violet `#a855f7`
  - Header Badge: `🌙` icon, bright white title, subtle violet subtitle
  - Top Hero Banner: 20m Power-Nap Mode pill with purple gradient (`linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))`)
  - Interior Rhythm: Left: Custom minutes & extenders; Right: Sleep soundscapes & fade curve
  - Bottom Section: Extended acoustic wind-down toggles

- **Card 2B: Sleep Cutoff Sentinel & Power Automation (`#widgetSleepAdvancedAutomation`)**
  - Accent Tone: Cyan `#06b6d4` & Amber `#f59e0b`
  - Header Badge: `⚡` icon, bright white title, subtle amber subtitle
  - Interior Rhythm: Left: Playback & autoplay cutoff toggles; Right: Action dispatcher & circadian screen dimmer
  - Bottom Section: Extended power automation toggles (Close tabs, OLED blackout)

---

## 🔘 3. Modern Switch Component Specifications

```
  Off State:                       On State:
  ┌───────────────────────┐        ┌───────────────────────┐
  │  (o)                  │        │                  (●)  │
  └───────────────────────┘        └───────────────────────┘
  Track: rgba(255,255,255,0.12)    Track: Emerald gradient
  Thumb: Solid White (#fff)        Thumb: Solid White (#fff)
```

- **Dimensions:** 44px wide $	imes$ 24px high
- **Thumb:** 18px diameter, perfectly centered vertically
- **Padding:** 2px all around
- **Travel Distance:** 20px (`transform: translateX(20px)`)
- **Physics Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (spring-damped tactile feel)
- **Active State:** Linear gradient from `#10b981` to `#059669` with emerald glow
- **Hover Feedback:** Slight brightness boost on track (`filter: brightness(1.1)`)
- **Focus Ring:** Accessible cyan focus glow (`box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.4)`)

---

## 📱 4. Responsive Breakpoint Rules

| Viewport Width | Layout Mode | Grid Columns | Card Spacing | Switch Alignment |
| :--- | :--- | :--- | :--- | :--- |
| $\ge 1200	ext{px}$ (Desktop / Ultra-wide) | 2-Column Bento Cards | 2 equal columns per card (`repeat(2, 1fr)`) | 16px gap | Right-aligned |
| $851	ext{px} - 1199	ext{px}$ (Laptop / Tablet Landscape) | 2-Column Bento Cards | 2 equal columns per card (`repeat(2, 1fr)`) | 14px gap | Right-aligned |
| $\le 850	ext{px}$ (Tablet Portrait / Mobile) | 1-Column Bento Cards | Single column (`1fr`) | 12px gap | Right-aligned inline |
