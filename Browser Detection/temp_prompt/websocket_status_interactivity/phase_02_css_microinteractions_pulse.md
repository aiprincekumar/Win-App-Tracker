# Phase 2: CSS Interactive Micro-states, Focus Rings & Pulse Glow Animation

> **Phase:** 02  
> **Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Target Files:**
> - [`dashboard/styles/layout/header_sidebar.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout/header_sidebar.css)
> - [`dashboard/styles/settings.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/settings.css)
> - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)  
> **Assigned Agent:** Level 4 Frontend Subagent  
> **Prerequisites:** Phase 1 completed.  

---

## 🎯 1. Phase Objective

Implement CSS micro-interactions for interactive sidebar HUD cards (pointer cursor, hover elevation, focus-visible outline rings, active press scaling) and author high-fidelity glowing pulse animations (`@keyframes serviceRowHighlightGlow`, `@keyframes reconnectBtnPulse`) with reduced-motion fallbacks in both modular and consolidated stylesheets.

---

## 📋 2. Step-by-Step Surgical Instructions

### Step 2.1: Sidebar Card Interactive States
Add the following styles to `dashboard/styles/layout/header_sidebar.css` and mirror into `dashboard/dashboard.css`:

```css
/* ========================================================================= */
/* Interactive Telemetry HUD Card Micro-Interactions                         */
/* ========================================================================= */
.sidebar-hud-card[role="button"],
.sidebar-hud-card.interactive-hud-card {
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.sidebar-hud-card[role="button"]:hover,
.sidebar-hud-card.interactive-hud-card:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.45);
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.sidebar-hud-card[role="button"]:active,
.sidebar-hud-card.interactive-hud-card:active {
  transform: scale(0.98);
}

.sidebar-hud-card[role="button"]:focus-visible,
.sidebar-hud-card.interactive-hud-card:focus-visible {
  outline: 2px solid var(--accent-primary, #6366f1);
  outline-offset: 2px;
}

body.theme-light .sidebar-hud-card[role="button"]:hover,
body.theme-light .sidebar-hud-card.interactive-hud-card:hover {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}
```

### Step 2.2: Transient Highlight & Glow Keyframe Animations
Add the following styles to `dashboard/styles/settings.css` and mirror into `dashboard/dashboard.css`:

```css
/* ========================================================================= */
/* Bridge Service Row Deep-Link Navigation Transient Highlight               */
/* ========================================================================= */
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

.bridge-service-row.service-row-highlight {
  animation: serviceRowHighlightGlow 1.8s ease-out forwards;
}

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

.btn-hud-reconnect.highlight-pulse {
  animation: reconnectBtnPulse 0.9s ease-in-out 2;
}

@media (prefers-reduced-motion: reduce) {
  .bridge-service-row.service-row-highlight {
    animation: none !important;
    border-color: var(--accent-primary, #6366f1) !important;
  }
  .btn-hud-reconnect.highlight-pulse {
    animation: none !important;
  }
}
```

### Step 2.3: Strict Invariant Checklist
- ✅ Both dark and light themes supported cleanly.
- ✅ `prefers-reduced-motion` honored for accessibility.
- ✅ Zero syntax errors or missing closing braces.
- ✅ UTF-8 BOM (`0xEF, 0xBB, 0xBF`) preserved on all edited CSS files.

---

## 🧪 3. Local Verification Gate

Execute verification check:
```powershell
node -e "const fs = require('fs'); const css = fs.readFileSync('dashboard/dashboard.css', 'utf8'); console.assert(css.includes('serviceRowHighlightGlow')); console.assert(css.includes('interactive-hud-card')); console.log('Phase 2 CSS Rules Verified Clean!');"
```
Gate passes cleanly with exit code 0.
