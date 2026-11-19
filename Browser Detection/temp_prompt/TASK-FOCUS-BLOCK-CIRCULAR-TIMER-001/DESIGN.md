<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Design System & Cyber-Dark UI Tokens (DESIGN.md)

> **Specification & Governance:**
> - **Task Identifier:** `TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001`
> - **Lead Department:** Department 05 (Frontend Engineering) & Department 01 (Product Design)
> - **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Reference Media:** `C:/Users/Atul Verma/.gemini/antigravity/brain/456af0b4-7b0c-47a0-9757-d8fb92638e6e/.user_uploaded/media_1795047758364_f1a77e3e.png`

---

## 🎨 1. Aesthetic Direction: Cyber-Dark Glassmorphism

The Focus Block UI is elevated from a plain flat container to an ultra-modern **Cyber-Dark Liquid Glass Bento Card**, establishing visual cohesion with the Sleep Sentinel radial dial (`#cardSleepHeroRing`) and Dashboard Focus Hub (`#widgetPomodoroSentinel`).

```
+-----------------------------------------------------------+
| 🧘 FOCUS BLOCK                           [ 25m ] (Badge) |
| [🎯 Deep Work] (Optional Goal Chip)                      |
|                                                           |
|                       .--""""--.                          |
|                    .'     12     '.                       |
|                   /    .-''''-.    \                      |
|                  |    /  25:00 \    |  <-- Depleting Neon |
|                  |   |Deep Focus|   |      Emerald Ring   |
|                  |    \        /    |      (r=54, C=339.3)|
|                   \    '-....-'    /                      |
|                    '.            .'                       |
|                       '--....--'                          |
|                                                           |
|             [  ▶️ Start  ]      [  🔄 Reset  ]             |
+-----------------------------------------------------------+
```

---

## 🎛️ 2. Design Tokens & Color Palette

### 2.1 Cyber-Dark Theme Tokens (Default)

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--card-focus-bg` | `rgba(15, 23, 42, 0.75)` | Bento card surface with 16px backdrop blur |
| `--card-focus-border` | `rgba(16, 185, 129, 0.22)` | Subtle emerald neon perimeter border |
| `--card-focus-shadow` | `0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 0 20px -4px rgba(16, 185, 129, 0.15)` | Depth elevation with emerald ambient glow |
| `--dial-track-color` | `rgba(255, 255, 255, 0.08)` | Background SVG circle ring |
| `--focus-neon-1` | `#10b981` (Emerald) | LinearGradient stop 0% |
| `--focus-neon-2` | `#06b6d4` (Cyan) | LinearGradient stop 50% |
| `--focus-neon-3` | `#3b82f6` (Electric Blue) | LinearGradient stop 100% |
| `--break-neon-1` | `#f59e0b` (Amber) | LinearGradient stop 0% (Break mode) |
| `--break-neon-2` | `#fbbf24` (Gold) | LinearGradient stop 100% (Break mode) |
| `--text-clock` | `#ffffff` | Primary countdown digits |
| `--text-sub` | `#94a3b8` | State label & inactive typography |
| `--btn-primary-bg` | `linear-gradient(135deg, #059669, #10b981)` | Start / Resume action button |
| `--btn-secondary-bg` | `rgba(30, 41, 59, 0.75)` | Reset action button |

### 2.2 Light Mode Tokens (`[data-theme="light"]`)

| Token Name | Value | Contrast Compliance |
| :--- | :--- | :--- |
| `--card-focus-bg` | `rgba(248, 250, 252, 0.92)` | High-contrast light substrate |
| `--card-focus-border` | `rgba(16, 185, 129, 0.35)` | Clean green boundary |
| `--card-focus-shadow` | `0 8px 24px -4px rgba(0, 0, 0, 0.08)` | Soft drop shadow |
| `--dial-track-color` | `rgba(0, 0, 0, 0.08)` | Visible subtle track |
| `--text-clock` | `#0f172a` (Slate 900) | 14.5:1 ratio (Exceeds WCAG AAA) |
| `--text-sub` | `#475569` (Slate 600) | 5.8:1 ratio (Exceeds WCAG AA) |

---

## 🔤 3. Typography Scale

- **Countdown Numerals (`#popupFocusClock`):**
  - Font Family: `var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace)`
  - Font Size: `22px`
  - Font Weight: `800`
  - Letter Spacing: `1px`
  - Text Shadow: `0 0 12px rgba(16, 185, 129, 0.4)` (Active state)
- **Mode Subtitle (`#popupFocusDialState`):**
  - Font Size: `9.5px`
  - Font Weight: `700`
  - Text Transform: `uppercase`
  - Letter Spacing: `0.08em`
  - Color: `#94a3b8`
- **Header Title (`.popup-focus-title`):**
  - Font Size: `11.5px`
  - Font Weight: `700`
  - Color: `var(--text-primary, #ffffff)`
- **Header Badge (`#popupFocusBadge`):**
  - Font Size: `10px`
  - Font Weight: `700`
  - Padding: `2px 8px`
  - Border Radius: `12px`

---

## 📐 4. Spatial Geometry & Sizing Specification

- **Card Container (`#cardPopupFocusTimer`):**
  - Padding: `12px 14px`
  - Border Radius: `14px`
  - Width: `100%` (fits within popup container, approx. 360px - 380px)
- **Dial Wrapper (`.popup-focus-dial-wrapper`):**
  - Position: `relative`
  - Display: `flex`
  - Align Items / Justify Content: `center`
  - Width: `130px`
  - Height: `130px`
  - Margin: `6px auto`
- **SVG Element (`#popupFocusDialSvg`):**
  - Width: `100%`
  - Height: `100%`
  - ViewBox: `0 0 140 140`
- **Centered Telemetry (`.popup-focus-dial-content`):**
  - Position: `absolute`
  - Display: `flex`
  - Flex Direction: `column`
  - Align Items / Justify Content: `center`
  - Pointer Events: `none`
- **Actions Button Row (`.popup-focus-actions`):**
  - Display: `flex`
  - Justify Content: `center`
  - Gap: `10px`
  - Margin Top: `4px`

---

## ✨ 5. Micro-Interactions & Transitions

1. **Stroke Depletion Transition:**
   ```css
   .popup-focus-dial-progress {
     transition: stroke-dashoffset 0.35s ease, stroke 0.35s ease;
   }
   ```
2. **Button Hover & Active Press:**
   - On hover: `transform: translateY(-1px)`, increased glow shadow.
   - On active press: `transform: scale(0.97)`.
3. **Pulsing Indicator on Active Focus:**
   - Active badge has subtle pulse animation signaling live time deduction.
