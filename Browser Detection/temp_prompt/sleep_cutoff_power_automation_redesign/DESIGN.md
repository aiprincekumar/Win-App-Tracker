# Design System & UI Tokens: Sleep Cutoff Sentinel & Power Automation Redesign

> **Document Type:** Design System & UI Specification (`DESIGN.md`)  
> **Initiative:** Sleep Cutoff Sentinel & Power Automation Redesign  
> **Target Container:** `temp_prompt/sleep_cutoff_power_automation_redesign/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Aesthetic Direction & Visual Identity

The redesign unifies the Sleep Cutoff Sentinel & Power Automation cards with the premium **Cyber-Dark Glassmorphism** design language established in the Focus Settings redesign. Key aesthetic values:
- **Calibrated Depth:** Translucent dark slate surfaces layered over dark ambient backdrops.
- **Tactile Feedback:** Subtle hover elevations (`translateY(-1px)`) and responsive border illumination.
- **Ergonomic Sizing:** Medium-compact form factor (52px minimum height) preventing visual fatigue and sprawling cards while keeping click/tap targets comfortable.
- **Harmonious Grid:** 2-column balanced rhythm creating clean symmetry across 10 controls.

---

## 💎 2. Design Tokens

### 2.1 Surfaces & Borders
| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--surface-card-idle` | `rgba(15, 23, 42, 0.45)` | Base idle surface for toggle cards |
| `--surface-card-hover` | `rgba(30, 41, 59, 0.65)` | Interactive hovered surface |
| `--border-card-idle` | `rgba(255, 255, 255, 0.07)` | Subtle containment border |
| `--border-card-hover` | `rgba(255, 255, 255, 0.15)` | Heightened contrast hover border |
| `--radius-card` | `10px` | Smooth modern corner curvature |
| `--shadow-card-idle` | `0 1px 3px rgba(0, 0, 0, 0.2)` | Baseline ground shadow |
| `--shadow-card-hover` | `0 4px 12px rgba(0, 0, 0, 0.3)` | Hover elevated glow shadow |

### 2.2 Typography Scales
| Element | Font Size | Weight | Color Token | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| `.toggle-title` | `12.5px` | `600` (Semi-Bold) | `var(--text-primary, #f1f5f9)` | `1.3` |
| `.toggle-desc` | `10.5px` | `400` (Regular) | `var(--text-muted, #94a3b8)` | `1.35` |

### 2.3 Switch Toggle Component
| Attribute | Idle (Unchecked) | Active (Checked) |
| :--- | :--- | :--- |
| **Track Dimensions** | Width: `42px`, Height: `22px` | Width: `42px`, Height: `22px` |
| **Track Background** | `rgba(255, 255, 255, 0.14)` | `linear-gradient(135deg, #10b981 0%, #059669 100%)` |
| **Track Border** | `1px solid rgba(255, 255, 255, 0.1)` | `1px solid rgba(16, 185, 129, 0.6)` |
| **Knob Dimensions** | `16px x 16px`, circular | `16px x 16px`, circular |
| **Knob Position** | `left: 2px, bottom: 2px` | `translateX(20px)` |
| **Knob Color & Shadow** | Solid `#ffffff`, `0 1px 3px rgba(0,0,0,0.35)` | Solid `#ffffff`, `0 1px 3px rgba(0,0,0,0.35)` |
| **Active Glow** | None | `0 0 10px rgba(16, 185, 129, 0.45)` |
| **Focus Visible Ring** | `0 0 0 2px #06b6d4` | `0 0 0 2px #06b6d4, 0 0 10px rgba(6, 182, 212, 0.4)` |

---

## 📐 3. Layout & Sizing Geometry

```
+-----------------------------------------------------------------------------------------------+
| #widgetSleepAdvancedAutomation (bento-card liquid-glass-card bento-span-6 sleep-advanced-card)|
|                                                                                               |
| [⚡] Sleep Cutoff Sentinel & Power Automation                                                  |
|      Automated playback cutoff, tab hibernation & inactivity triggers                         |
|                                                                                               |
|  .dash-sleep-toggles-container (2-column CSS grid, gap: 10px)                                 |
|  +--------------------------------------------+  +--------------------------------------------+
|  | Card 1: Stop at End of Video        [===O] |  | Card 2: Auto-Disable Autoplay       [===O] |
|  +--------------------------------------------+  +--------------------------------------------+
|  | Card 3: Pause if idle 15m           [===O] |  | Card 4: Inactivity Fast-Cutoff      [===O] |
|  +--------------------------------------------+  +--------------------------------------------+
|  | Card 5: On Timeout Action   [ Pause Media v] |  | Card 6: Screen Dimmer               [===O] |
|  +--------------------------------------------+  +--------------------------------------------+
|  | Card 7: Tab Hibernation             [===O] |  | Card 8: Close All Media Tabs        [===O] |
|  +--------------------------------------------+  +--------------------------------------------+
|  | Card 9: OLED Full Blackout          [===O] |  | Card 10: System Inactivity Sync     [===O] |
|  +--------------------------------------------+  +--------------------------------------------+
+-----------------------------------------------------------------------------------------------+
```

---

## ♿ 4. Accessibility & Responsive Rules

1. **Touch/Click Ergonomics:** All cards have a minimum bounding box of 52px height and full column width. Clicking either the label or the toggle knob triggers the switch.
2. **Keyboard Navigation:** Tab navigation flows logically through controls from 1 to 10. `role="switch"` announces state changes ("checked" / "unchecked") to screen readers.
3. **Responsive Breakpoints:**
   - Desktop & Tablet (> 768px): 2 columns (`repeat(2, minmax(0, 1fr))`, `gap: 10px`).
   - Mobile & Compact (< 768px): 1 column (`grid-template-columns: 1fr`).
