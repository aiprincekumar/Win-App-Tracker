# Advanced Suite Integration for Focus & Sleep Hubs: Design System & Tokens (DESIGN.md)

> **Document Type:** Semantic Design System & Visual Specification  
> **Task ID:** `TASK-ADVANCED-FEATURES-FOCUS-SLEEP-001`  
> **Workspace Container:** `temp_prompt/advanced_features_focus_sleep/`  
> **Lead Departments:** Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering)  

---

## 🎨 1. Cyber-Dark Glassmorphic Design Philosophy

The Advanced Suite for Focus and Sleep Hubs introduces bio-hacking, distraction control, and sleep ergonomics while preserving the dashboard's signature Cyber-Dark aesthetic:
1. **Focus Domain Aesthetic (Awake / Kinetic / Flow):** Neon emerald (`#10b981`), electric cyan (`#06b6d4`), and solar amber (`#f59e0b`) accents reflecting cognitive clarity and forward momentum.
2. **Sleep Domain Aesthetic (Nocturnal / Restful / Serene):** Deep celestial midnight (`#0f172a`), moonlit indigo (`#6366f1`), lavender mist (`#a855f7`), and soft starlight glow.
3. **Glass Surfaces:** High-translucency frosted glass layers with `backdrop-filter: blur(16px)` and subtle hairline borders (`rgba(255, 255, 255, 0.08)`).

---

## 💎 2. Semantic Color & Gradient Tokens

```css
:root {
  /* Focus Advanced Tokens */
  --focus-emerald-glow: rgba(16, 185, 129, 0.25);
  --focus-cyan-glow: rgba(6, 182, 212, 0.25);
  --focus-integrity-high: #10b981;
  --focus-integrity-med: #f59e0b;
  --focus-integrity-low: #ef4444;
  --binaural-gradient: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);

  /* Sleep Advanced Tokens */
  --sleep-indigo-glow: rgba(99, 102, 241, 0.3);
  --sleep-moon-gold: #fbbf24;
  --sleep-midnight-surface: rgba(15, 23, 42, 0.85);
  --sleep-vignette-dimmer: radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.82) 100%);
  --power-nap-gradient: linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%);
}
```

---

## 🧩 3. Component Specifications

### 3.1 Focus Integrity Score & Distraction Counter (`#rowFocusIntegrityScore`)
- **Structure:** Horizontal flexbox aligned inside `.dash-focus-toggles-container`.
- **Integrity Score Badge (`#badgeFocusIntegrityScore`):**
  - Font: Mono-numeric 11px font-weight 700.
  - Border-radius: 9999px (pill).
  - Background: `rgba(16, 185, 129, 0.12)`, text `#10b981`, border `1px solid rgba(16, 185, 129, 0.3)`.
  - Transitions to amber (<90%) and red (<70%) dynamically.
- **Distraction Counter Pill (`#cntFocusDistractions`):**
  - Background: `rgba(239, 68, 68, 0.12)`, text `#f87171`, border `1px solid rgba(239, 68, 68, 0.25)`.
  - Icon: ⚠️ or ⚡.

### 3.2 Soft-Nudge Breathe Overlay (`#overlayBreatheNudge`)
- **Visuals:** Full-screen modal overlay with heavy frosted glass (`backdrop-filter: blur(24px); background: rgba(5, 10, 20, 0.88)`).
- **Breathing Circle:** Expanding and contracting SVG/CSS circle with 16s complete box-breathing cycle:
  - 0s - 4s: **Inhale** (expands from scale 0.8 to 1.3, cyan glow).
  - 4s - 8s: **Hold** (maintains scale 1.3, gentle pulsating halo).
  - 8s - 12s: **Exhale** (contracts from scale 1.3 to 0.8, deep emerald glow).
  - 12s - 16s: **Hold** (maintains scale 0.8, restful pause).
- **Typography:** Display title *"Mindful Pause: Return to Your Focus"*, with gentle breathing counter (1 to 4).
- **Actions:** Primary CTA button *"Return to Task"* (emerald button) and secondary *"Allow for 5 min"* text link.

### 3.3 20-20-20 Posture Alert Toast HUD (`#toast2020PostureAlert`)
- **Placement:** Fixed bottom-right HUD at `bottom: 24px; right: 24px; z-index: 9999;`.
- **Dimensions:** Max-width 360px, padding 14px 18px.
- **Aesthetic:** Frosted cyber-dark card with emerald hairline border, icon 👁️, and progress countdown ring showing 20 seconds.
- **Auto-Dismissal:** Smoothly slides out and fades after 20 seconds.

### 3.4 Sleep Aid Soundscapes Panel (`.sleep-soundscape-panel`)
- **Layout:** Replicates the clean layout of `.focus-soundscape-panel` with night-sky palette.
- **Header:** Title *"🌙 Sleep Aid Soundscapes"*, select dropdown with options (None, Deep Pink Noise, Midnight Ocean, Delta Rain 2.5Hz), and play/pause button.
- **Volume Row:** Volume slider with moon/speaker icon, custom styled track, and numeric percentage indicator.

### 3.5 Power-Nap Mode 20m Action Card (`.sleep-power-nap-banner`)
- **Layout:** Horizontal banner card embedded at the top of `#cardSleepAdvanced`.
- **Background:** `var(--power-nap-gradient)` with `border: 1px solid rgba(168, 85, 247, 0.3)`.
- **Button (`#btnSleepPowerNapMode`):**
  - Neon purple/indigo pill button with lightning bolt icon: *"⚡ 20m Power Nap"*.
  - Hover state: Bright glow and subtle 2px transform lift.
  - Active state: Pulsing border animation indicating running power nap.

### 3.6 Progressive Circadian Screen Dimmer Vignette (`#overlaySleepDimmer`)
- **Visuals:** Fixed full-viewport non-blocking overlay (`pointer-events: none; z-index: 9990;`).
- **Gradient:** `var(--sleep-vignette-dimmer)`.
- **Animation:** Linear opacity transition from `0.0` to `0.75` during final countdown window.

---

## ♿ 4. Accessibility & Micro-Interactions (WCAG 2.1 AA)

- **Color Contrast:** All body text meets >= 4.5:1 contrast ratio against frosted glass backgrounds.
- **Keyboard Navigation:** Every toggle checkbox, select dropdown, and button has visible focus rings (`box-shadow: 0 0 0 2px var(--accent-cyan); outline: none;`).
- **Screen Reader Support:** All toggles have associated `<label>` tags with descriptive `for` and `aria-label` attributes.
- **Motion Reduction:** Media query `@media (prefers-reduced-motion: reduce)` disables scale animations on breathing ring and screen dimmer transitions.
