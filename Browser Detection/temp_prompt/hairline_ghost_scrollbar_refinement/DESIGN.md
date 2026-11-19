# Hairline Ghost-Style Scrollbar Refinement: Design Specification & UI Tokens

> **Document Type:** Design System & UI Token Specification  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Lead Department:** Dept 04 (UI/UX Design System)  

---

## 🎨 1. Aesthetic Philosophy: The Ghost Hairline

In a high-density, dark-mode extension popup (380px wide), standard scrollbars are an anti-pattern. They consume visual bandwidth, create uneven margins, and detract from glassmorphic cards and telemetry rings.

The **Ghost Hairline** aesthetic operates on three core principles:
1. **Sub-Pixel Delicacy (2px Geometry):** The thumb is rendered as an ultra-thin 2px hairline ribbon with fully rounded pill caps (`border-radius: 999px;`). It provides visual orientation without dominating the scroll container.
2. **Whisper Opacity (Idle State):** When static, the scrollbar thumb is barely visible—a subtle whisper of light (`~10-28% alpha`) floating over dark glass backgrounds.
3. **Interactive Luminescence (Hover / Active State):** When the user hovers over or drags the scrollbar, the thumb smoothly blooms to a higher luminescence (`~60-65% alpha`), confirming user focus and direct manipulation.

---

## 📐 2. Design Tokens

### Geometry Tokens
- `--scrollbar-size`: `2px` (used for both `width` on vertical and `height` on horizontal scrollbars).
- `--scrollbar-radius`: `999px` (perfect pill capsule).
- `--scrollbar-track-bg`: `transparent` (zero gutter footprint).

### Color & Alpha Tokens

#### Cyber-Dark Theme (Default)
| Token Name | Color / Opacity | Purpose |
| :--- | :--- | :--- |
| `ghost-thumb-base-idle` | `rgba(255, 255, 255, 0.12)` | Universal idle scrollbar thumb in popup base views |
| `ghost-thumb-base-hover` | `rgba(255, 255, 255, 0.28)` | Universal hovered scrollbar thumb |
| `ghost-thumb-sleep-idle` | `rgba(129, 140, 248, 0.28)` | Sleep Tab bedtime dial & drawer idle thumb (Indigo) |
| `ghost-thumb-sleep-hover` | `rgba(129, 140, 248, 0.65)` | Sleep Tab hovered scrollbar thumb |
| `ghost-thumb-focus-idle` | `rgba(6, 182, 212, 0.28)` | Focus Tab timer & drawer idle thumb (Cyan) |
| `ghost-thumb-focus-hover` | `rgba(6, 182, 212, 0.65)` | Focus Tab hovered scrollbar thumb |

#### Light Theme (`[data-theme="light"]`)
| Token Name | Color / Opacity | Purpose |
| :--- | :--- | :--- |
| `ghost-thumb-light-base-idle` | `rgba(0, 0, 0, 0.12)` | Light mode idle scrollbar thumb |
| `ghost-thumb-light-base-hover` | `rgba(0, 0, 0, 0.25)` | Light mode hovered scrollbar thumb |
| `ghost-thumb-light-sleep-idle` | `rgba(99, 102, 241, 0.25)` | Light mode Sleep Tab idle thumb |
| `ghost-thumb-light-sleep-hover` | `rgba(99, 102, 241, 0.55)` | Light mode Sleep Tab hovered thumb |
| `ghost-thumb-light-focus-idle` | `rgba(15, 118, 110, 0.22)` | Light mode Focus Tab idle thumb |
| `ghost-thumb-light-focus-hover` | `rgba(15, 118, 110, 0.45)` | Light mode Focus Tab hovered thumb |

---

## ♿ 3. Accessibility & Usability (WCAG 2.1 AA)

- **Hover Affordance:** The bloom effect provides clear visual feedback on mouse presence.
- **Alternative Navigation:** All scrollable containers retain native wheel, trackpad, and keyboard (`ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`) scrolling capabilities, ensuring full accessibility even if a user does not click the 2px hairline thumb directly.
