# Design System & UI Specification: WebSocket Status Micro-Interactions

> **Task Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Lead Department:** Dept 04 UI/UX Design System  
> **Aesthetic Standard:** Liquid Glass 2.0 & iOS 26 Materiality  

---

## 🎨 1. Visual Hierarchy & Interactive States

The sidebar status cards (`#sidebarDataHubCard` and `#sidebarHudCard`) reside inside the compact `.sidebar-hud-group` at the bottom of the navigation drawer.

### 1.1 State Matrix for Interactive HUD Cards

| State | Background | Border | Box Shadow | Transform | Cursor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Default (Idle)** | `rgba(15, 23, 42, 0.65)` | `1px solid var(--border-dim)` | None | None | `pointer` |
| **Hover** | `rgba(15, 23, 42, 0.85)` | `rgba(99, 102, 241, 0.4)` | `0 4px 12px rgba(0, 0, 0, 0.35)` | `translateY(-1px)` | `pointer` |
| **Focus-Visible** | `rgba(15, 23, 42, 0.9)` | `var(--accent-primary, #6366f1)` | `0 0 0 2px var(--accent-primary)` | None | `pointer` |
| **Active (Pressed)** | `rgba(15, 23, 42, 0.95)` | `rgba(99, 102, 241, 0.6)` | `0 2px 6px rgba(0, 0, 0, 0.2)` | `scale(0.98)` | `pointer` |

---

## 💫 2. Transient Highlight & Pulse Motion Choreography

When deep-link navigation executes, the user arrives at the Settings panel. To eliminate disorientation and guide the eye effortlessly:

### 2.1 Service Row Glow Pulse
- **Keyframe:** `@keyframes serviceRowHighlightGlow`
- **Duration:** 1.8 seconds total
- **Timing Function:** `cubic-bezier(0.16, 1, 0.3, 1)` (Out-Expo ease)
- **Visual Curve:**
  - 0%: 0px glow, default border.
  - 25%: Rapid burst to 16px soft indigo radial glow (`rgba(99, 102, 241, 0.45)`), luminous border.
  - 60%: Sustained ambient highlight (12px blur, 30% opacity).
  - 100%: Graceful decay back to resting state.

### 2.2 Reconnect Button Pulse
- **Keyframe:** `@keyframes reconnectBtnPulse`
- **Duration:** 0.9s per cycle, 2 iterations (1.8s total).
- **Scale Range:** 1.00 -> 1.04 -> 1.00.
- **Button Shadow:** Radiates matching indigo ambient aura during apex.

---

## ♿ 3. Accessibility & Contrast (WCAG 2.1 AA)

- **Contrast Ratios:** Text colors `--text-primary` (`#f8fafc`) and `--text-secondary` (`#94a3b8`) against `rgba(15, 23, 42, 0.85)` exceed 7:1 (WCAG AAA).
- **Focus Rings:** Distinct 2px high-visibility focus outline offset by 2px, preventing overlap with internal content.
- **Motion Reduction (`prefers-reduced-motion`):**
  ```css
  @media (prefers-reduced-motion: reduce) {
    .bridge-service-row.service-row-highlight {
      animation: none !important;
      border-color: var(--accent-primary) !important;
    }
    .btn-hud-reconnect.highlight-pulse {
      animation: none !important;
    }
  }
  ```
