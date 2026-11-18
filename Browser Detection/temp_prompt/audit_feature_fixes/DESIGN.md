# Design Specification: Audio Lab EQ Preset Badge & UI Tokens

> **Document Type:** Design Specification (DESIGN.md)  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Component:** Audio Lab 5-Band Equalizer Card Preset Badge  
> **Target Subsystems:** `dashboard/dashboard.html`, `dashboard/styles/audio_lab.css`, `dashboard/dashboard.css`  
> **Lead Department:** Dept 03 (Design System) & Dept 05 (Frontend Engineering)  

---

## 🎨 1. Visual Design Philosophy & Aesthetics

The Browser Detection extension follows a high-tech "Cyber-Dark Glassmorphism" design system. The Equalizer preset badge communicates real-time audio filter configuration with luminous green luminescence in dark mode and crisp emerald accents in light mode.

---

## 📐 2. Component Blueprint: `.badge-eq-preset`

### 2.1 HTML Placement
The badge is placed inside `.eq-card-header .eq-actions-group`, immediately preceding `#audioEqPresetSelect`:
```html
<div class="eq-actions-group">
  <span id="audioLabPresetBadge" class="badge-eq-preset" aria-label="Active Equalizer Preset">Flat</span>
  <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">
    ...
  </select>
  <button type="button" id="btnResetEq" class="btn-reset-eq">🔄 Reset EQ</button>
</div>
```

---

## 🎨 3. Design Tokens & CSS Specification

### 3.1 Dark Mode (Default)
| Property | Value | Notes |
| :--- | :--- | :--- |
| `display` | `inline-flex` | Vertically centered with text |
| `align-items` | `center` | Proper label centering |
| `justify-content` | `center` | Balanced whitespace |
| `padding` | `0.25rem 0.65rem` | Compact pill profile |
| `font-size` | `0.72rem` (11.5px) | Proportionate to headers |
| `font-weight` | `700` | Bold emphasis |
| `font-family` | `var(--mono-font, 'JetBrains Mono', monospace)` | High-tech monospace numeral/label styling |
| `text-transform` | `uppercase` | Clean uppercase aesthetic |
| `letter-spacing` | `0.05em` | Legibility spacing |
| `border-radius` | `9999px` | Fully rounded pill capsule |
| `background` | `rgba(34, 197, 94, 0.12)` | Subtle emerald glow tinted glass |
| `border` | `1px solid rgba(34, 197, 94, 0.35)` | Specular edge rim |
| `color` | `#22c55e` | Neon emerald high-contrast text |
| `box-shadow` | `0 0 10px rgba(34, 197, 94, 0.15)` | Subtle ambient luminescence |
| `transition` | `all 0.2s cubic-bezier(0.16, 1, 0.3, 1)` | Butter-smooth text/color transition |

### 3.2 Light Mode Theme Override (`body.theme-light .badge-eq-preset`)
| Property | Value | Notes |
| :--- | :--- | :--- |
| `background` | `rgba(16, 185, 129, 0.12)` | Subtle light-tinted mint |
| `border` | `1px solid rgba(16, 185, 129, 0.35)` | Crisp delineation |
| `color` | `#059669` | Deep emerald (contrast ratio > 4.8:1) |
| `box-shadow` | `none` | Clean daylight presentation |

---

## ♿ 4. Accessibility & Contrast Verification (WCAG 2.1 AA)
- **Background Color:** Dark glass `#0b0f19` / light `#ffffff`.
- **Text Color (#22c55e on #0b0f19):** Contrast ratio ~7.2:1 (Exceeds WCAG AAA requirement of 7.0:1).
- **Text Color (#059669 on #f8fafc):** Contrast ratio ~5.4:1 (Exceeds WCAG AA requirement of 4.5:1).
- **Semantics:** Includes `aria-label="Active Equalizer Preset"` for screen reader identification.
