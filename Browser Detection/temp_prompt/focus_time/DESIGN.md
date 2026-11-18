# 🎨 Focus Time & Focus Sentinel Subsystem: Design System & UI Specifications

> **Document Type:** Design System, Visual Specifications & Component Blueprints  
> **Initiative:** Focus Time & Focus Sentinel Subsystem End-to-End Implementation  
> **Container Directory:** [`temp_prompt/focus_time/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🌌 1. Cyber-Dark Glassmorphism Design Tokens

The Focus Sentinel UI integrates seamlessly with the extension's cyber-dark glassmorphism design system. All components use CSS custom properties for cohesive themes and instant dark/light adaptability.

### 1.1 Color Palette & Mood Tokens

| Token Name | Hex / RGBA Value | Semantic Purpose & Context |
| :--- | :--- | :--- |
| `--bg-card-glass` | `rgba(17, 24, 39, 0.75)` | Bento card background surface with 16px backdrop blur |
| `--border-glass-card` | `rgba(255, 255, 255, 0.08)` | Subtle border providing frosted glass edge definition |
| `--border-glass-hover` | `rgba(255, 255, 255, 0.16)` | Enhanced edge definition on hover or card focus |
| `--neon-emerald` | `#10b981` | Active Focus mode accent, progress dial ring, focus badge |
| `--neon-emerald-glow` | `rgba(16, 185, 129, 0.20)` | Outer radial drop shadow for deep focus state |
| `--neon-cyan` | `#06b6d4` | Rest / Break mode accent, break progress dial, break badge |
| `--neon-cyan-glow` | `rgba(6, 182, 212, 0.20)` | Outer radial glow for break relaxation state |
| `--neon-amber` | `#f59e0b` | Paused mode accent, warning states, paused badge |
| `--neon-amber-glow` | `rgba(245, 158, 11, 0.20)` | Outer radial glow for paused state |
| `--neon-violet` | `#8b5cf6` | Completed session accent, total metrics highlights |
| `--text-primary` | `#f8fafc` | Primary clock readout, card headings, button text |
| `--text-secondary` | `#94a3b8` | Subtext, section labels, finish time estimates |
| `--dial-track-bg` | `rgba(255, 255, 255, 0.06)` | SVG background circle track |

---

## 🔤 2. Typography Scale & Visual Hierarchy

```css
/* Typography Scale Tokens */
.focus-big-clock {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  line-height: 1;
}

.focus-status-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.focus-finish-time {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 4px;
}

.focus-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}
```

---

## 🔘 3. Interactive Component States & Anatomy

### 3.1 Quick Duration Presets (15m, 25m, 45m, 60m)
- **Default:** Transparent background with subtle border `rgba(255, 255, 255, 0.10)`, text color `#94a3b8`.
- **Hover:** Background `rgba(255, 255, 255, 0.08)`, border `rgba(255, 255, 255, 0.20)`, text `#f8fafc`.
- **Active / Selected:** Background `rgba(16, 185, 129, 0.15)`, border `var(--neon-emerald)`, text `var(--neon-emerald)`, font-weight `700`.
- **Disabled (While Running):** Opacity `0.4`, `cursor: not-allowed`.

### 3.2 Quick Extender Buttons (+5m, +15m)
- **Style:** Compact pill button with border `rgba(6, 182, 212, 0.25)`, text `var(--neon-cyan)`.
- **Hover:** Background `rgba(6, 182, 212, 0.15)`, box-shadow `0 0 10px rgba(6, 182, 212, 0.25)`.
- **Active:** Scale transform `scale(0.96)`.

### 3.3 Primary Action Buttons
- **Start Button (`#btnStartFocus`):** Solid emerald gradient (`linear-gradient(135deg, #10b981 0%, #059669 100%)`), bold white text, subtle hover lift.
- **Pause Button (`#btnPauseFocus`):** Solid amber gradient (`linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`), bold white text.
- **Resume Button:** Switches dynamically to emerald gradient with `▶️ Resume` label.
- **Reset Button (`#btnResetFocus`):** Subtle glass button (`rgba(255, 255, 255, 0.06)`), border `rgba(255, 255, 255, 0.12)`, hover glow.

---

## ⏱️ 4. Radial Countdown Dial SVG Geometry

The radial dial is rendered via SVG inside `#cardFocusSentinelHero`:
```html
<div class="dash-focus-dial-wrapper">
  <svg class="dash-focus-svg-dial" width="140" height="140" viewBox="0 0 120 120" role="img" aria-label="Focus Timer Countdown Dial">
    <!-- Background Dial Track -->
    <circle
      class="dash-focus-dial-track"
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="currentColor"
      stroke-width="8"
    />
    <!-- Dynamic Progress Ring -->
    <circle
      id="dashFocusDialProgress"
      class="dash-focus-dial-progress tier-focus"
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="currentColor"
      stroke-width="8"
      stroke-linecap="round"
      stroke-dasharray="339.292"
      stroke-dashoffset="0"
      transform="rotate(-90 60 60)"
    />
  </svg>
  
  <!-- Dial Center Readout Content -->
  <div class="dash-focus-dial-center-content">
    <div id="pomodoroTimeDisplay" class="focus-big-clock" aria-live="polite">25:00</div>
    <div id="pomodoroFinishTime" class="focus-finish-time">Target: --:--</div>
  </div>
</div>
```

---

## 📐 5. Component Blueprints & Wireframes

### Blueprint A: Hero Focus Sentinel Card in `#paneWellbeing`
```
+---------------------------------------------------------------------------------------+
| 🧘 Focus Sentinel & Pomodoro Hub                 [🧘 Deep Focus] [🟢 Active Dot]      |
| Deep work intervals, automated media cutoff & break recovery                          |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|      (======== SVG RADIAL DIAL ========)          [ QUICK PRESETS ]                   |
|     (                                   )         ( 15m )  [ 25m ]  ( 45m )  ( 60m )  |
|    (              25:00                  )                                            |
|    (         Target: 14:35               )        [ EXTEND TIME ]                     |
|     (                                   )         [ +5m ]  [ +15m ]                   |
|      (=================================)                                              |
|                                                   [ PRIMARY ACTIONS ]                 |
|                                                   [ ▶️ Start Focus ]  [ 🔄 Reset ]     |
|                                                                                       |
+---------------------------------------------------------------------------------------+
| [✓] Auto-pause playing media during focus   | [✓] Sound chime on cycle completion     |
+---------------------------------------------------------------------------------------+
```

### Blueprint B: Tab A Focus Analytics Metric Card (`#cardFocusAnalytics`)
```
+-------------------------------------------------------------+
| Today's Deep Focus Time                                 🧘  |
|                                                             |
|   1h 45m                                                    |
|                                                             |
| 4 completed focus sessions today                            |
+-------------------------------------------------------------+
```

### Blueprint C: Sidebar Live Micro-Widget (`#wellbeingLiveMicroWidget`)
```
+----------------------------------------+
| 🧘 Focus Sentinel                 🟢   |
| 23:45                     Focus Active |
+----------------------------------------+
```

### Blueprint D: Popup Mini-Timer Controller in `viewTrackingPane`
```
+-------------------------------------------------------------+
| 🧘 Focus Block                                [ 25:00 ]     |
| [ ▶️ Start ]   [ ⏸️ Pause ]   [ 🔄 Reset ]    Mode: Idle    |
+-------------------------------------------------------------+
```

---

## ⚡ 6. Micro-Interactions, Transitions & Motion Design

1. **Dial Progress Interpolation:**
   ```css
   .dash-focus-dial-progress {
     transition: stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
   }
   ```
2. **Subtle Pulsing Breathing Animation on Running State:**
   ```css
   @keyframes focusPulseRing {
     0%, 100% { filter: drop-shadow(0 0 4px var(--neon-emerald)); }
     50% { filter: drop-shadow(0 0 12px var(--neon-emerald)); }
   }
   .dash-focus-dial-progress.running-focus {
     animation: focusPulseRing 3s infinite ease-in-out;
   }
   ```
3. **Card Elevation & Button Hover Interactions:**
   Hovering over buttons elevates them `translateY(-1px)` with smooth shadow transition `transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`.

---

## ♿ 7. WCAG 2.1 AA Accessibility Guidelines

- **Color Contrast:** All text tokens against dark surfaces meet the 4.5:1 minimum ratio (`#f8fafc` text on `#111827` background provides 14.8:1 contrast).
- **Non-Color Indicators:** State changes are communicated with both text labels (`FOCUS`, `PAUSED`, `BREAK`) and icons/colors.
- **Screen Reader Announcements:** The digital readout uses `aria-live="polite"` so screen readers announce minute intervals without spamming every second.
- **Full Keyboard Navigation:** All preset buttons, extenders, actions, and toggles can be tabbed to with visible focus rings (`outline: 2px solid var(--neon-cyan); outline-offset: 2px;`).
