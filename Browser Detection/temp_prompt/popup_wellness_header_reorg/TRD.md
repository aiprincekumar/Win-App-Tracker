# Technical Requirements Document (TRD) — Popup Mode Wellness Sub-Tabs & Header/Footer Reorganization

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/TRD.md`  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏛️ 1. High-Level Design (HLD)

The Popup architecture consists of a 2-Tier Segmented Control & Navigation system:
- **Tier 1 (`#tier1SegmentedNav`):** Top-level icon-only segmented category buttons (`playback`, `studio`, `analytics`, `wellness`).
- **Tier 2 (`#topNavTabs`):** Sub-tabs filtered based on the active Tier 1 category.
- **View Panes (`.tab-pane`):** Content containers conditionally toggled with class `.active`.
- **Global Toolbars:** Header actions bar and Footer utility dock.

This technical refactor modifies:
1. **DOM Tree:** Reordering `.header-badges` child elements, adding `#mainTabFocus` to `.top-nav-tabs`, adding `#viewFocusPane` to `.sentinel-app`, and relocating `#btnQuickSettings` to `<footer>`.
2. **Modular Navigation Engine (`src/popup/features/tier1_navigation_feature.js`):** Adding `'focus'` to `GROUP_TO_TABS.wellness`, updating `TAB_TO_GROUP.focus = 'wellness'`, and adding `'focus'` to `ALL_TABS`.
3. **CSS Architecture:** Establishing left/right flex boundaries in `.header-badges`, styling `#btnQuickSettings` as a footer toolbar icon button, and flipping `#quickSettingsPopover` coordinates to bottom-anchored positioning.
4. **JavaScript Runtime (`popup/popup.js`):** Binding i18n keys for Focus tab, updating tab switcher handling, and verifying outside-click popover dismissal.

---

## 🏗️ 2. Low-Level Design (LLD) & DOM Specifications

### 2.1 Header Badges Layout (Before vs After)

#### Before:
```html
<div class="header-badges">
  <button id="btnSwitchMediaTab" ...>...</button>
  <button id="btnOpenDashboard" ...>...</button>
  <nav id="tier1SegmentedNav" class="tier1-segmented-nav header-group-nav" ...>...</nav>
  <button id="btnQuickSettings" ...>...</button>
</div>
```

#### After:
```html
<div class="header-badges">
  <!-- Tier 1: 4 Compact Icon-Only Category Group Buttons (Aligned Left) -->
  <nav id="tier1SegmentedNav" class="tier1-segmented-nav header-group-nav" role="tablist" aria-label="Feature Category Navigation">
    <button id="tier1BtnPlayback" ...>...</button>
    <button id="tier1BtnStudio" ...>...</button>
    <button id="tier1BtnAnalytics" ...>...</button>
    <button id="tier1BtnWellness" ...>...</button>
  </nav>
  <!-- Utility Action Buttons (Aligned Right) -->
  <div class="header-action-group">
    <button id="btnSwitchMediaTab" class="btn-switch-header btn-switch-tab" title="Switch to Active Media Tab" aria-label="Switch to Active Media Tab" type="button">
      <svg class="header-switch-icon sentinel-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
      <span id="btnSwitchMediaTabText" class="btn-label sr-only">Switch Tab</span>
    </button>
    <button id="btnOpenDashboard" class="btn-dashboard-header" title="Open Full Dashboard" aria-label="Open Full Dashboard" type="button">
      <svg class="header-dashboard-icon sentinel-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1"/>
        <rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/>
        <rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
      <span id="btnOpenDashboardText" class="btn-label sr-only">📊 Dashboard</span>
    </button>
  </div>
</div>
```

### 2.2 Tier 2 Wellness Sub-Tabs

In `.top-nav-tabs`:
```html
<nav class="top-nav-tabs" id="topNavTabs" role="tablist" aria-label="Sub-Tab Navigation">
  ...
  <!-- Sleep Tab -->
  <button id="mainTabSleep" class="top-tab-btn tab-hidden" data-group="wellness" data-view="sleep" role="tab" aria-selected="false" aria-controls="viewSleepPane" title="Sleep Timer & Bedtime Automation">
    <span class="top-tab-icon">🌙</span>
    <span id="topTabSleepText" class="top-tab-label">Sleep</span>
    <span id="tabSleepActiveDot" class="tab-live-dot hidden" title="Sleep Timer Active"></span>
  </button>
  <!-- Focus Tab (New Dummy/Placeholder Sub-Tab) -->
  <button id="mainTabFocus" class="top-tab-btn tab-hidden" data-group="wellness" data-view="focus" role="tab" aria-selected="false" aria-controls="viewFocusPane" title="Focus Timer & Digital Wellness">
    <span class="top-tab-icon">🎯</span>
    <span id="topTabFocusText" class="top-tab-label">Focus</span>
    <span id="tabFocusActiveDot" class="tab-live-dot hidden" title="Focus Active"></span>
  </button>
</nav>
```

In Tab Panes:
```html
<!-- TAB 8: Dedicated Focus View Pane (Placeholder) -->
<div id="viewFocusPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabFocus">
  <section id="cardFocusPlaceholder" class="focus-hero-card">
    <div class="focus-placeholder-header">
      <span class="focus-placeholder-icon">🎯</span>
      <h3 id="focusPlaceholderTitle" class="focus-placeholder-title">Focus & Productivity</h3>
    </div>
    <p id="focusPlaceholderDesc" class="focus-placeholder-desc">
      Deep work timer and digital wellness integration coming soon. Use the Sleep tab for bedtime routines.
    </p>
    <div class="focus-placeholder-badge">
      <span class="badge-dot">●</span>
      <span id="focusStatusText" class="badge-text">Focus Mode Ready</span>
    </div>
  </section>
</div>
```

### 2.3 Footer Toolbar Layout with Quick Settings

In `<footer>`:
```html
<footer class="footer">
  <!-- 1. Playback / Pause Global Toggle -->
  <button id="btnGlobalMediaToggle" ...>...</button>
  <!-- 2. Mute / Unmute Global Toggle -->
  <button id="btnGlobalMuteToggle" ...>...</button>
  <!-- 3. Time Tracking Pause / Resume Button -->
  <button id="btnToggleTrackingPause" ...>...</button>
  <!-- 4. Sleep Timer Launcher Button -->
  <button id="btnSleepTimerTrigger" ...>...</button>
  <!-- 5. HUD Bridge Button -->
  <button id="btnReconnectWs" ...>...</button>
  <!-- 6. Quick Settings Toolbar Button (Moved from Header) -->
  <button id="btnQuickSettings" class="footer-btn toolbar-btn btn-quick-settings" title="Quick Settings" aria-label="Quick Settings" aria-haspopup="dialog" aria-expanded="false" type="button">
    <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
    <span id="btnQuickSettingsText" class="btn-label sr-only">Settings</span>
  </button>
  <!-- 7. Theme Toggle Toolbar Button -->
  <button id="btnThemeToggle" class="footer-btn toolbar-btn btn-theme-toggle" title="Toggle Dark/Light Mode" aria-label="Toggle Dark/Light Mode" type="button">
    <svg class="theme-toggle-icon sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <span id="btnThemeToggleText" class="btn-label sr-only">Theme</span>
  </button>
</footer>
```

---

## 🎨 3. CSS Geometry & Popover Coordinates

### 3.1 Header Badges Flex Alignment
```css
.header-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex: 1;
}

.header-action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
```

### 3.2 Quick Settings Popover Coordinates
```css
.quick-settings-popover {
  position: fixed;
  bottom: 48px;
  right: 8px;
  width: 290px;
  max-height: 380px;
  background: var(--bg-surface-elevated, #0f172a);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  z-index: 1000;
  padding: 12px;
  overflow-y: auto;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.quick-settings-popover.hidden {
  display: none !important;
}
```

---

## ⚙️ 4. Feature Engine Updates (`src/popup/features/tier1_navigation_feature.js`)

```javascript
const GROUP_TO_TABS = Object.freeze({
  playback: Object.freeze(['media', 'audio']),
  studio: Object.freeze(['tools', 'studio']),
  analytics: Object.freeze(['tracking', 'domains']),
  wellness: Object.freeze(['sleep', 'focus'])
});

const TAB_TO_GROUP = Object.freeze({
  media: 'playback',
  audio: 'playback',
  tools: 'studio',
  studio: 'studio',
  tracking: 'analytics',
  domains: 'analytics',
  sleep: 'wellness',
  focus: 'wellness'
});

const ALL_TABS = Object.freeze(['media', 'audio', 'tools', 'studio', 'tracking', 'domains', 'sleep', 'focus']);
```
