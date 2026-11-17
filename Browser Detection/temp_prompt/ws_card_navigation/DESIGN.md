# Design Tokens & UI/UX Specification (DESIGN.md) — Interactive Status Cards

> **Task ID:** `TASK-WS-CARD-NAV-001`  
> **Feature:** Interactive WebSocket Connection Status Cards & Deep-Link Navigation to Settings  
> **Design Framework:** iOS 26 Liquid Glass Design System  
> **Status:** Architecture Certified (Level 3C Specialist)  

---

## 🎨 1. Visual Hierarchy & Micro-Interactions

### 1.1 Sidebar HUD Card States

The WebSocket status cards (`#sidebarDataHubCard` and `#sidebarHudCard`) in the sidebar telemetry cluster represent persistent live service monitors. They must visually communicate interactivity through calibrated micro-interactions.

```
+-----------------------------------------------------+
|  Normal State:                                      |
|  Background: rgba(15, 23, 42, 0.65)                 |
|  Border: 1px solid var(--border-dim)                |
|  Radius: 6px                                        |
+-----------------------------------------------------+
|  Hover State (:hover):                              |
|  Transform: translateY(-1px)                        |
|  Background: rgba(15, 23, 42, 0.88)                 |
|  Border: 1px solid rgba(99, 102, 241, 0.45)        |
|  Cursor: pointer                                    |
+-----------------------------------------------------+
|  Active State (:active):                            |
|  Transform: scale(0.98)                             |
|  Transition: transform 0.15s ease                   |
+-----------------------------------------------------+
|  Focused State (:focus-visible):                    |
|  Outline: 2px solid var(--accent-primary, #6366f1)  |
|  Outline Offset: 2px                                |
+-----------------------------------------------------+
```

### 1.2 Target Service Row Highlight Animation (`serviceRowHighlightGlow`)

When the user activates a card, the target service row in the Settings pane illuminates with a transient specular glow:

```css
@keyframes serviceRowHighlightGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--border-dim);
  }
  25% {
    box-shadow: 0 0 18px 3px rgba(99, 102, 241, 0.5);
    border-color: rgba(99, 102, 241, 0.9);
    background-color: rgba(99, 102, 241, 0.08);
  }
  60% {
    box-shadow: 0 0 12px 1px rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.6);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    border-color: var(--border-dim);
  }
}
```

### 1.3 Target Reconnect Button Pulse (`reconnectBtnPulse`)

The reconnect button pulses twice to draw immediate visual focus for the subsequent click:

```css
@keyframes reconnectBtnPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(99, 102, 241, 0);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 14px 2px rgba(99, 102, 241, 0.6);
  }
}
```

---

## ♿ 2. Accessibility (WCAG 2.1 AA Standards)

1. **Semantic Role:** `role="button"` conveys actionable button semantics to screen readers.
2. **Keyboard Focusability:** `tabindex="0"` enters the element into natural tab order.
3. **Contrast Ratios:**
   - Text (`.hud-card-title`, `.hud-address`) against card background exceeds `4.5:1` minimum contrast ratio.
   - Focus outline (`#6366f1` / 2px solid) exceeds `3:1` non-text contrast against dark sidebar background.
4. **Accessible Labels:**
   - `#sidebarDataHubCard`: `aria-label="SQLite Data Hub Status Indicator. Click or press Enter to configure in Settings"`
   - `#sidebarHudCard`: `aria-label="Video Detector HUD Status Indicator. Click or press Enter to configure in Settings"`
   - Both indicate controlled target: `aria-controls="cardHardwareBridges"`
5. **Reduced Motion Adaptation:**
   - When `@media (prefers-reduced-motion: reduce)` is enabled:
     - All keyframe animations are suppressed (`animation: none !important`).
     - A solid accent border is applied statically (`border-color: var(--accent-primary, #6366f1) !important`).
     - Scrolling executes instantaneously (`behavior: 'auto'`).
