# Phase 01: DOM Architecture & Bilingual i18n Foundation

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Phase #:** 01 of 04  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/PHASE_01_DOM_AND_I18N.md`  
> **Lead Execution Role:** Level 4 Frontend Engineer Subagent  
> **Required Skills:** `frontend-patterns`, `i18n-sync`  
> **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)  

---

## 🎯 1. Phase Objective
Reorganize the DOM hierarchy inside `popup/popup.html`:
1. Align `#tier1SegmentedNav` to the left inside `.header-badges` and position `#btnSwitchMediaTab` and `#btnOpenDashboard` to the right inside a dedicated `.header-action-group`.
2. Relocate the Quick Settings gear button (`#btnQuickSettings`) from the top header down into `<footer>` directly preceding `#btnThemeToggle`.
3. Add the `#mainTabFocus` sub-tab button under Tier 2 `.top-nav-tabs` (`data-group="wellness"`, `data-view="focus"`) and create the companion `#viewFocusPane` (`.tab-pane`) with a clean placeholder card.
4. Add bilingual keys (`top_tab_focus`, `focus_placeholder_title`, `focus_placeholder_desc`) to `locales/en.json` and `locales/hi.json`.

---

## 📋 2. Prerequisites & Inputs
- Target files:
  - [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html)
  - [`locales/en.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/en.json)
  - [`locales/hi.json`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/locales/hi.json)
- All 91 test suites currently passing cleanly.

---

## 🔍 3. Technical Context & File Anchors

### 3.1 Anchor 1: Header Badges (`popup/popup.html` lines 21-63)
Current DOM has `#btnSwitchMediaTab`, `#btnOpenDashboard`, `#tier1SegmentedNav`, and `#btnQuickSettings` sequentially.

### 3.2 Anchor 2: Top Nav Tabs (`popup/popup.html` lines 67-98)
Current DOM has `#mainTabMedia` through `#mainTabSleep`. `#mainTabFocus` must be inserted directly alongside `#mainTabSleep` tagged with `data-group="wellness"`, `data-view="focus"`, and `class="top-tab-btn tab-hidden"`.

### 3.3 Anchor 3: View Panes (`popup/popup.html` lines 635-920)
`#viewSleepPane` is currently the 7th tab pane. `#viewFocusPane` must be added as a sibling tab-pane (`class="tab-pane"`).

### 3.4 Anchor 4: Footer Toolbar (`popup/popup.html` lines 820-867)
Current footer ends with `#btnThemeToggle`. `#btnQuickSettings` must be inserted as a footer toolbar button immediately before `#btnThemeToggle`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Reorganize `.header-badges` in `popup/popup.html`
Replace the `.header-badges` section with:
```html
      <div class="header-badges">
        <!-- Tier 1: 4 Compact Icon-Only Category Group Buttons (Aligned Left) -->
        <nav id="tier1SegmentedNav" class="tier1-segmented-nav header-group-nav" role="tablist" aria-label="Feature Category Navigation">
          <button id="tier1BtnPlayback" class="tier1-nav-btn active" data-category="playback" data-group="playback" role="tab" aria-selected="true" aria-controls="topNavTabs" title="Playback (Media & Audio)" aria-label="Playback">
            <span class="tier1-icon" aria-hidden="true">🎬</span>
            <span id="tier1PlaybackText" class="tier1-label sr-only">Playback</span>
          </button>
          <button id="tier1BtnStudio" class="tier1-nav-btn" data-category="studio" data-group="studio" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Studio (Tools & Studio)" aria-label="Studio">
            <span class="tier1-icon" aria-hidden="true">📚</span>
            <span id="tier1StudioText" class="tier1-label sr-only">Studio</span>
          </button>
          <button id="tier1BtnAnalytics" class="tier1-nav-btn" data-category="analytics" data-group="analytics" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Analytics (Tracking & Domains)" aria-label="Analytics">
            <span class="tier1-icon" aria-hidden="true">📊</span>
            <span id="tier1AnalyticsText" class="tier1-label sr-only">Analytics</span>
          </button>
          <button id="tier1BtnWellness" class="tier1-nav-btn" data-category="wellness" data-group="wellness" role="tab" aria-selected="false" aria-controls="topNavTabs" title="Wellness (Sleep & Wellness)" aria-label="Wellness">
            <span class="tier1-icon" aria-hidden="true">🌙</span>
            <span id="tier1WellnessText" class="tier1-label sr-only">Wellness</span>
          </button>
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

### Step 2: Insert `#mainTabFocus` in `.top-nav-tabs`
Inside `<nav class="top-nav-tabs" id="topNavTabs" ...>`, add after `#mainTabSleep`:
```html
      <button id="mainTabFocus" class="top-tab-btn tab-hidden" data-group="wellness" data-view="focus" role="tab" aria-selected="false" aria-controls="viewFocusPane" title="Focus Timer & Digital Wellness">
        <span class="top-tab-icon">🎯</span>
        <span id="topTabFocusText" class="top-tab-label">Focus</span>
        <span id="tabFocusActiveDot" class="tab-live-dot hidden" title="Focus Active"></span>
      </button>
```

### Step 3: Insert `#viewFocusPane`
Add `#viewFocusPane` alongside `#viewSleepPane`:
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

### Step 4: Relocate `#btnQuickSettings` to `<footer>`
In `<footer>`, insert `#btnQuickSettings` right before `#btnThemeToggle`:
```html
      <!-- 6. Quick Settings Toolbar Button -->
      <button id="btnQuickSettings" class="footer-btn toolbar-btn btn-quick-settings" title="Quick Settings" aria-label="Quick Settings" aria-haspopup="dialog" aria-expanded="false" type="button">
        <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span id="btnQuickSettingsText" class="btn-label sr-only">Settings</span>
      </button>

      <!-- 7. Theme Toggle Toolbar Button -->
      <button id="btnThemeToggle" class="footer-btn toolbar-btn btn-theme-toggle" title="Toggle Dark/Light Mode" aria-label="Toggle Dark/Light Mode" type="button">
        ...
```

### Step 5: Update Localization Files
- In `locales/en.json`, add:
  ```json
  "top_tab_focus": "Focus",
  "focus_placeholder_title": "Focus & Productivity",
  "focus_placeholder_desc": "Deep work timer and digital wellness integration coming soon. Use the Sleep tab for bedtime routines.",
  "focus_status_ready": "Focus Mode Ready"
  ```
- In `locales/hi.json`, add authentic Devanagari Hindi strings:
  ```json
  "top_tab_focus": "फ़ोकस",
  "focus_placeholder_title": "फ़ोकस और उत्पादकता",
  "focus_placeholder_desc": "गहन कार्य टाइमर और डिजिटल वेलनेस एकीकरण जल्द आ रहा है। सोने की दिनचर्या के लिए स्लीप टैब का उपयोग करें।",
  "focus_status_ready": "फ़ोकस मोड तैयार"
  ```

---

## 🔒 5. Architectural Constraints & Boundaries
- Do NOT delete or rename `#mainTabSleep` or `#viewSleepPane`.
- Do NOT alter any IDs of existing buttons or panes.
- Preserve UTF-8 with BOM on all touched files.

---

## 📦 6. Deliverables Manifest
1. Updated `popup/popup.html` with reorganized header, footer gear button, and Focus sub-tab/pane.
2. Updated `locales/en.json` with 4 new English keys.
3. Updated `locales/hi.json` with 4 new Hindi keys.

---

## 🚦 7. Local Verification Gate
Run a quick node script to verify:
1. `popup.html` contains `#mainTabFocus` and `#viewFocusPane`.
2. `#btnQuickSettings` is located inside `<footer>` before `#btnThemeToggle`.
3. `#tier1SegmentedNav` precedes `#btnSwitchMediaTab` and `#btnOpenDashboard`.
4. JSON files parse cleanly and have matching keys.
