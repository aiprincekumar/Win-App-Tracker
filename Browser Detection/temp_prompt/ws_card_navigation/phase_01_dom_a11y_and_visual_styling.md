# Phase 1 Execution Prompt: DOM Accessibility & Visual Interactive Styling

> **Phase:** 1 of 3  
> **Phase Name:** DOM Accessibility, Semantic Roles & Visual Interactive Styling  
> **Target Role:** Level 4 Frontend Engineer  
> **Assigned Scope:** Verification and alignment of HTML attributes, ARIA roles, and CSS hover/focus/animation rules.  
> **Target Files:**
> - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
> - [`dashboard/styles/layout/header_sidebar.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout/header_sidebar.css)
> - [`dashboard/styles/settings.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/settings.css)
> - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)

---

## 🎯 Phase Objective
Verify and solidify the DOM structure, accessibility semantics, and CSS hover/focus/pulse rules for both WebSocket status indicator cards (`#sidebarDataHubCard` and `#sidebarHudCard`) in the sidebar, and certify that transient highlight keyframe animations (`serviceRowHighlightGlow`, `reconnectBtnPulse`) are universally defined and accessible in the stylesheets.

---

## 📋 Prerequisites & Context
- Universal Rule 5 & 8: Maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited files.
- Universal Rule 1: Zero code modification by CEO or Manager; exclusive execution by Level 4 Frontend Engineer.
- Existing DOM: `dashboard/dashboard.html` lines 90-124 contain `#sidebarDataHubCard` and `#sidebarHudCard`.

---

## 🛠️ Surgical Step-by-Step Instructions

### Step 1: Verify & Validate HTML Attributes (`dashboard/dashboard.html`)
Inspect lines 90-124 of `dashboard/dashboard.html`. Ensure both elements strictly contain:
1. **SQLite Data Hub Card:**
   ```html
   <div id="sidebarDataHubCard"
        class="sidebar-hud-card interactive-hud-card"
        role="button"
        tabindex="0"
        title="SQLite Data Hub (ws://127.0.0.1:65433 WAL) - Click to manage or reconnect in Settings"
        aria-label="SQLite Data Hub Status Indicator. Click or press Enter to configure in Settings"
        aria-controls="cardHardwareBridges">
   ```
2. **Video Detector HUD Card:**
   ```html
   <div id="sidebarHudCard"
        class="sidebar-hud-card interactive-hud-card"
        role="button"
        tabindex="0"
        title="Video Detector HUD (ws://127.0.0.1:65432) - Click to manage or reconnect in Settings"
        aria-label="Video Detector HUD Status Indicator. Click or press Enter to configure in Settings"
        aria-controls="cardHardwareBridges">
   ```

### Step 2: Certify CSS Interactivity Rules (`dashboard/styles/layout/header_sidebar.css` & `dashboard/dashboard.css`)
Confirm the presence and correctness of:
```css
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
```

### Step 3: Certify Highlight Keyframes & Classes (`dashboard/styles/settings.css` & `dashboard/dashboard.css`)
Ensure `dashboard/dashboard.css` contains the keyframe definitions and utility classes matching `dashboard/styles/settings.css`:
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

---

## 🚦 Local Verification Gate
Execute:
1. Verify git diff cleanly formatted:
   `git diff --check`
2. Validate HTML & CSS files:
   `git status`
Pass Criteria: Zero syntax errors, proper attributes verified, CSS rules and keyframes certified.
