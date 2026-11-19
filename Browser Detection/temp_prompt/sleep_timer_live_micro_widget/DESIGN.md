# 🌙 Design System & UI Token Specification: Sleep Timer Live Micro-Widget

> **Document Type:** Design System & UI Specification  
> **Container Directory:** [`temp_prompt/sleep_timer_live_micro_widget/`](.)  
> **Initiative:** Sleep Timer Live Micro-Widget in Left Navigation Panel Matching Focus Sentinel  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Theme Color Tokens & Palettes

The Sleep Sentinel aesthetic utilizes a **Cyber-Indigo & Starlight Violet** theme palette contrasting with the cyber-emerald/neon-cyan theme of Focus Sentinel:

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--sleep-accent-primary` | `rgba(99, 102, 241, 1)` (`#6366f1`) | Primary indigo branding, status online glow |
| `--sleep-accent-glow` | `rgba(99, 102, 241, 0.6)` | Outer transient pulse glow for card highlight |
| `--sleep-accent-glow-subtle` | `rgba(99, 102, 241, 0.15)` | Inset highlight glow & micro-card hover border |
| `--sleep-accent-faint` | `rgba(99, 102, 241, 0.06)` | Highlight background tint during scroll focus |
| `--sleep-status-warn` | `rgba(245, 158, 11, 1)` (`#f59e0b`) | Status warn color (fading / paused) |
| `--sleep-status-idle` | `rgba(148, 163, 184, 0.7)` | Status idle dot grey |

---

## 📐 2. Typography & Micro-HUD Geometry

- **Font Family:** `var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace)` for numbers/clocks; `system-ui, -apple-system, sans-serif` for labels.
- **Clock Geometry:** `.hud-micro-clock`: `font-size: 1.15rem`, `font-weight: 700`, `letter-spacing: -0.02em`.
- **Card Margins & Padding:** `.sleep-micro-hud`: `margin-bottom: 12px`, padding standard with `.sidebar-hud-card`.
- **Hover Micro-Interaction:** 
  - `transform: translateY(-1px)` with spring timing `cubic-bezier(0.34, 1.56, 0.64, 1)` in 180ms.
  - Border transition to `rgba(99, 102, 241, 0.45)`.
  - Box shadow soft glow `0 2px 10px rgba(99, 102, 241, 0.15)`.

---

## 🎬 3. Keyframe Animation Specifications

### 3.1 Card Transient Glow: `@keyframes sleepSentinelGlow`
```css
@keyframes sleepSentinelGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--glass-border, rgba(255, 255, 255, 0.1));
  }
  25% {
    box-shadow: 0 0 24px 4px rgba(99, 102, 241, 0.6), inset 0 0 16px 2px rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.9);
    background-color: rgba(99, 102, 241, 0.06);
  }
  60% {
    box-shadow: 0 0 16px 2px rgba(99, 102, 241, 0.35);
    border-color: rgba(99, 102, 241, 0.6);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--glass-border, rgba(255, 255, 255, 0.1));
  }
}
```

### 3.2 Button Pulse: `@keyframes sleepStartBtnPulse`
```css
@keyframes sleepStartBtnPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(99, 102, 241, 0);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 0 18px 4px rgba(99, 102, 241, 0.7);
  }
}
```

---

## ♿ 4. Accessibility & Reduced Motion Overrides

For users with vestibular disorders or motion sensitivities:
```css
@media (prefers-reduced-motion: reduce) {
  .sleep-hero-card.sleep-card-highlight,
  #cardSleepSentinelHub.sleep-card-highlight {
    animation: none !important;
    border-color: rgba(99, 102, 241, 0.8) !important;
    box-shadow: 0 0 12px 1px rgba(99, 102, 241, 0.4) !important;
  }
  .btn-sleep-primary.highlight-pulse {
    animation: none !important;
    transform: none !important;
    outline: 2px solid rgba(99, 102, 241, 0.9) !important;
    outline-offset: 2px !important;
  }
}
```
