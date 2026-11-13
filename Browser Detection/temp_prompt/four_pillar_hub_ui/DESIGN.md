# 4-Pillar Hub Architecture — Design System & UI Specification (DESIGN.md)

> **Document Type:** Design System Specification & Token Catalog  
> **Initiative:** Web Activity & Media Sentinel — Extension Popup 4-Pillar Hub  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/DESIGN.md`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)

---

## 🎨 1. Visual Theme & Color Token Architecture

The popup employs a modern, dark-mode glassmorphic theme designed for readability, high contrast (WCAG 2.1 AA compliant), and zero visual clutter.

```css
:root {
  /* Surface Tokens */
  --bg-primary: #0f141c;
  --bg-card: rgba(23, 32, 45, 0.75);
  --bg-card-hover: rgba(30, 42, 60, 0.85);
  --bg-card-subtle: rgba(18, 26, 38, 0.6);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(59, 130, 246, 0.35);

  /* Brand & Accent Tokens */
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-indigo: #6366f1;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --accent-purple: #8b5cf6;

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-dim: #475569;

  /* Pillar Badge Colors */
  --pillar-player: #3b82f6;
  --pillar-audio: #8b5cf6;
  --pillar-studio: #06b6d4;
  --pillar-focus: #10b981;

  /* Glassmorphism Filters */
  --glass-blur: blur(12px);
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}
```

---

## 📐 2. Layout Geometry & Viewport Constraints

- **Window Viewport:** Strict `420px` width, max-height `600px` (standard Chrome extension popup ceiling).
- **Navigation Grid:** 4 columns evenly distributed with `gap: 4px;` in a flex container:
  ```css
  .top-nav-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 6px 10px;
    background: rgba(15, 23, 42, 0.85);
    border-bottom: 1px solid var(--border-subtle);
  }
  .top-tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: 6px;
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.15s ease-in-out;
  }
  .top-tab-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
  .top-tab-btn.active {
    color: #ffffff;
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    font-weight: 600;
  }
  ```

---

## 🎛️ 3. Component Design Patterns

### 3.1 In-Card Micro-Actions Toolbar
- Compact, horizontally centered icon button row.
- Button size: `32px × 30px`, border-radius `6px`.
- Micro-interaction: Subtle scale `transform: scale(0.96)` on `:active`.
- Tooltip titles on all buttons.

### 3.2 5-Band Equalizer Card
- Frequency Band Labels: `60Hz`, `250Hz`, `1kHz`, `4kHz`, `16kHz`.
- Sliders: Vertical or horizontal range inputs with accent color gradient:
  - Cyan-to-Purple gradient when boosted above 0dB.
  - Centered zero tick notch.
  - Live numerical badge showing `+6dB`, `0dB`, `-3dB`.

### 3.3 Glassmorphic Switch Toggles
- Height: `20px`, Width: `38px`, border-radius `20px`.
- Off: background `#334155`.
- On: background `linear-gradient(135deg, #3b82f6, #06b6d4)` with subtle glow.

### 3.4 Studio Vault List & Thumbnails
- Note Item: Dark rounded pill container (`#1e293b`), timestamp tag in cyan (`03:45`), note text in white, delete cross in muted gray.
- Screenshot Grid: 2-column or 3-column responsive thumbnail layout with rounded corners and hover overlay buttons ("Copy" / "Download").

---

## ♿ 4. Accessibility (WCAG 2.1 AA) Compliance

1. **Contrast Ratio:** Text on dark surface maintains minimum 4.5:1 ratio (`#f8fafc` on `#0f141c` exceeds 14:1).
2. **Keyboard Navigation:** All interactive elements (`top-tab-btn`, `ctrl-btn`, sliders) have visible `:focus-visible` outline (`2px solid var(--accent-blue)`).
3. **Screen Reader Attributes:** All tabs declare `role="tab"`, `aria-selected="true/false"`, and `aria-controls`.
4. **Target Size:** Hit areas maintain minimum 30px touch height for mouse and accessibility targets.
