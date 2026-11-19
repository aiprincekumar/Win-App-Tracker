# Technical Requirements Document (TRD): Popup Collapsible Settings Drawers

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/popup_collapsible_settings_drawer/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Departments:** Dept 02: Solution Architecture & Dept 05: Frontend Engineering  

---

## 🏛️ 1. Technical Architecture & Component Tree

### 1.1 DOM Hierarchy Transformation

#### Sleep Tab (`#viewSleepPane`)
```html
<div id="viewSleepPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabSleep">
  <!-- 1. Radial Bedtime Dial Hero Card (Always Visible) -->
  <section id="cardSleepHeroRing" class="sleep-hero-card">
    <!-- Existing sleep hero header, dial SVG, countdown, quick actions row -->
  </section>

  <!-- 2. Collapsible Settings Drawer Container -->
  <div id="sleepSettingsDrawer" class="popup-settings-drawer">
    <!-- Drawer Toggle Header Button -->
    <button type="button" id="btnToggleSleepSettingsDrawer" class="drawer-toggle-btn" 
            aria-expanded="false" aria-controls="sleepSettingsDrawerBody">
      <div class="drawer-title-wrap">
        <span class="drawer-icon" aria-hidden="true">⚙️</span>
        <span class="drawer-title" id="lblSleepDrawerTitle">Presets & Automations</span>
      </div>
      <span class="drawer-chevron" aria-hidden="true">▾</span>
    </button>

    <!-- Expandable Body Wrapper (CSS Grid Transition) -->
    <div id="sleepSettingsDrawerBody" class="drawer-expandable-wrap" role="region" aria-labelledby="btnToggleSleepSettingsDrawer">
      <div class="drawer-inner-content">
        <!-- Exact Existing Cards Preserved Verbatim -->
        <section id="cardSleepPresetsAndCustom" class="sleep-section-card">...</section>
        <section id="cardSleepAutomations" class="sleep-section-card">...</section>
      </div>
    </div>
  </div>
</div>
```

#### Focus Tab (`#viewFocusPane`)
```html
<div id="viewFocusPane" class="tab-pane" role="tabpanel" aria-labelledby="mainTabFocus">
  <section id="cardFocusWellness" class="focus-wellness-card">
    <!-- 1. Radial Focus Dial Hero Card (Always Visible) -->
    <div id="cardPopupFocusTimer" class="popup-focus-card">
      <!-- Existing focus header, goal chip, dial SVG, clock, quick actions row -->
    </div>

    <!-- 2. Collapsible Focus Settings Drawer Container -->
    <div id="focusSettingsDrawer" class="popup-settings-drawer">
      <!-- Drawer Toggle Header Button -->
      <button type="button" id="btnToggleFocusSettingsDrawer" class="drawer-toggle-btn" 
              aria-expanded="false" aria-controls="focusSettingsDrawerBody">
        <div class="drawer-title-wrap">
          <span class="drawer-icon" aria-hidden="true">⚙️</span>
          <span class="drawer-title" id="lblFocusDrawerTitle">Presets & Wellness Tools</span>
        </div>
        <span class="drawer-chevron" aria-hidden="true">▾</span>
      </button>

      <!-- Expandable Body Wrapper (CSS Grid Transition) -->
      <div id="focusSettingsDrawerBody" class="drawer-expandable-wrap" role="region" aria-labelledby="btnToggleFocusSettingsDrawer">
        <div class="drawer-inner-content">
          <!-- Exact Existing Cards Preserved Verbatim -->
          <section id="cardFocusPresetsAndCustom" class="focus-section-card">...</section>
          <div id="focusRatioBarContainer" class="focus-ratio-container focus-ratio-card">...</div>
          <div id="doomscrollBreakerCard" class="doomscroll-breaker-card doomscroll-breaker-row">...</div>
        </div>
      </div>
    </div>
  </section>
</div>
```

---

## 🎨 2. CSS Grid Smooth Transition Mechanism

To avoid janky `max-height` transitions, we leverage CSS Grid row interpolation:

```css
.popup-settings-drawer {
  margin-top: 10px;
  border: 1px solid var(--border-dim, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  background: var(--bg-card, rgba(18, 24, 38, 0.7));
  overflow: hidden;
  transition: border-color 200ms ease;
}

.drawer-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}

.drawer-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary, #f1f5f9);
}

.drawer-chevron {
  font-size: 11px;
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-settings-drawer.open .drawer-chevron {
  transform: rotate(180deg);
}

/* 60fps Grid Row Transition */
.drawer-expandable-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-settings-drawer.open .drawer-expandable-wrap {
  grid-template-rows: 1fr;
}

.drawer-inner-content {
  min-height: 0;
  overflow: hidden;
  padding: 0 8px;
  opacity: 0;
  transition: opacity 220ms ease, padding 280ms ease;
}

.popup-settings-drawer.open .drawer-inner-content {
  padding: 4px 8px 10px 8px;
  opacity: 1;
}
```

---

## ⚡ 3. JavaScript State Machine & Storage Contract (`popup/popup.js`)

### 3.1 Modular Drawer Initializer Function (<= 50 lines per Rule 28)
```javascript
function initCollapsibleDrawer(drawerId, toggleBtnId, bodyId, storageKey) {
  const drawerEl = document.getElementById(drawerId);
  const toggleBtn = document.getElementById(toggleBtnId);
  if (!drawerEl || !toggleBtn) return;

  function setDrawerState(isOpen, persist = true) {
    drawerEl.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (persist && typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [storageKey]: isOpen });
    }
  }

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyOpen = drawerEl.classList.contains('open');
    setDrawerState(!isCurrentlyOpen, true);
  });

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get([storageKey], (res) => {
      if (res && res[storageKey] === true) {
        setDrawerState(true, false);
      }
    });
  }
}

function initAllPopupDrawers() {
  initCollapsibleDrawer(
    'sleepSettingsDrawer', 
    'btnToggleSleepSettingsDrawer', 
    'sleepSettingsDrawerBody', 
    'sleepSettingsDrawerOpen'
  );
  initCollapsibleDrawer(
    'focusSettingsDrawer', 
    'btnToggleFocusSettingsDrawer', 
    'focusSettingsDrawerBody', 
    'focusSettingsDrawerOpen'
  );
}
```

---

## 🌐 4. Bilingual Localization Schema (`locales/*.json`)

Key additions to both `locales/en.json` and `locales/hi.json`:

```json
// locales/en.json
"sleep_drawer_title": "Presets & Automations",
"focus_drawer_title": "Presets & Wellness Tools",
"drawer_expand_tooltip": "Expand Settings",
"drawer_collapse_tooltip": "Collapse Settings"

// locales/hi.json
"sleep_drawer_title": "प्रीसेट और ऑटोमेशन",
"focus_drawer_title": "प्रीसेट और वेलनेस टूल्स",
"drawer_expand_tooltip": "सेटिंग्स खोलें",
"drawer_collapse_tooltip": "सेटिंग्स बंद करें"
```
