# Phase 2: HTML DOM Restructuring Specification

> **Phase Identifier:** `PHASE-02-HTML-RESTRUCTURE`  
> **Task:** Sleep Cutoff Sentinel & Power Automation Redesign  
> **Target File:** `dashboard/dashboard.html`  
> **Target Sub-Agent:** Level 4 Frontend Engineer  
> **Pre-requisite:** Phase 1 Verification Pass & Manager Authorization Token (`AUTH-MGR-*`)

---

## 🎯 1. Phase Objective
Restructure `#widgetSleepAdvancedAutomation` in `dashboard/dashboard.html` from the old asymmetric layout (`controls-2col-grid` with disparate panels and bottom full-span group) into the balanced 2-column grid (`.dash-sleep-toggles-container`).

---

## 📂 2. Prerequisites & File Anchors
- **Target Container Anchor:** Line 1849 of `dashboard/dashboard.html`:
  `<div id="widgetSleepAdvancedAutomation" class="bento-card liquid-glass-card bento-span-6 sleep-advanced-card">`
- **Existing Scope to Replace:** Lines 1857-1968 (`<div class="sleep-advanced-body controls-2col-grid">` down to closing `</div>` of `widgetSleepAdvancedAutomation`).

---

## 🛠️ 3. Surgical Step-by-Step Instructions

Replace lines 1857-1968 in `dashboard/dashboard.html` with the following clean, balanced structure:

```html
              <div class="sleep-advanced-body">
                <div class="dash-sleep-toggles-container">
                  <!-- Row 1, Card 1: Stop at End of Video -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="lbl_sleep_end_of_video">Stop at End of Video</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_end_of_video">Trigger cutoff as soon as the current playing video finishes</span>
                    </div>
                    <label class="switch-toggle" for="toggleDashSleepEndOfVideo">
                      <input type="checkbox" id="toggleDashSleepEndOfVideo" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Stop at End of Video">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 1, Card 2: Auto-Disable Video Autoplay -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_autoplay_block">Auto-Disable Video Autoplay</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_autoplay_block">Block next video autoplay during bedtime</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepAutoplayBlock">
                      <input type="checkbox" id="toggleSleepAutoplayBlock" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Auto-Disable Video Autoplay">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 2, Card 3: Pause if idle 15m -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="lbl_inactivity_auto_sleep">Pause if idle 15m</span>
                      <span class="toggle-desc" data-i18n="desc_inactivity_auto_sleep">Trigger sleep timer cutoff when user is idle for 15 minutes</span>
                    </div>
                    <label class="switch-toggle" for="toggleDashSleepInactivity">
                      <input type="checkbox" id="toggleDashSleepInactivity" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Pause if idle 15m">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 2, Card 4: Inactivity Fast-Cutoff (5m) -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_inactivity_cutoff">Inactivity Fast-Cutoff (5m)</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_inactivity_cutoff">Cut off media if idle for 5m during countdown</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepInactivityFastCutoff">
                      <input type="checkbox" id="toggleSleepInactivityFastCutoff" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Inactivity Fast-Cutoff (5m)">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 3, Card 5: On Timeout Action (Select Control Card) -->
                  <div class="dash-sleep-select-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="lbl_timeout_action">On Timeout Action</span>
                      <span class="toggle-desc" data-i18n="desc_timeout_action">Action to dispatch when sleep countdown reaches zero</span>
                    </div>
                    <select id="selectDashSleepTimeoutAction" class="styled-select dash-sleep-select-sm" aria-label="On Timeout Action">
                      <option value="pause" selected data-i18n="opt_timeout_pause">Pause Media Only</option>
                      <option value="mute" data-i18n="opt_timeout_mute">Mute Tab</option>
                      <option value="close_tab" data-i18n="opt_timeout_close">Pause & Close Tab</option>
                    </select>
                  </div>

                  <!-- Row 3, Card 6: Progressive Screen Dimmer -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_screen_dimmer">Progressive Screen Dimmer</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_screen_dimmer">Circadian screen dimming during final countdown</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepScreenDimmer">
                      <input type="checkbox" id="toggleSleepScreenDimmer" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Progressive Screen Dimmer">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 4, Card 7: Memory-Saver Tab Hibernation -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_tab_hibernate">Memory-Saver Tab Hibernation</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_tab_hibernate">Suspend idle tabs on timeout to quiet cooling fans</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepTabHibernate">
                      <input type="checkbox" id="toggleSleepTabHibernate" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Memory-Saver Tab Hibernation">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 4, Card 8: Close All Media Tabs -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_close_all_media_tabs">Close All Media Tabs</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_close_all_media_tabs">Safely close all inactive media tabs across browser windows</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepCloseAllMediaTabs">
                      <input type="checkbox" id="toggleSleepCloseAllMediaTabs" role="switch" class="switch-input dash-sleep-switch-input" aria-label="Close All Media Tabs">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 5, Card 9: OLED Full Blackout -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_darken_display">OLED Full Blackout</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_darken_display">Render pure 100% black overlay on cutoff to eliminate night glow</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepDarkenDisplay">
                      <input type="checkbox" id="toggleSleepDarkenDisplay" role="switch" class="switch-input dash-sleep-switch-input" aria-label="OLED Full Blackout">
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <!-- Row 5, Card 10: System Inactivity Sync -->
                  <div class="dash-sleep-toggle-row">
                    <div class="toggle-text-group">
                      <span class="toggle-title" data-i18n="toggle_sleep_system_inactivity_sync">System Inactivity Sync</span>
                      <span class="toggle-desc" data-i18n="desc_sleep_system_inactivity_sync">Bridge OS-level sleep state to sync countdown timer</span>
                    </div>
                    <label class="switch-toggle" for="toggleSleepSystemInactivitySync">
                      <input type="checkbox" id="toggleSleepSystemInactivitySync" role="switch" class="switch-input dash-sleep-switch-input" aria-label="System Inactivity Sync">
                      <span class="slider-round"></span>
                    </label>
                  </div>
                </div>
              </div>
```

---

## 🚫 4. Architectural Boundaries
- DO NOT alter the card header (`#txtSleepAutomationTitle`, `#txtSleepAutomationDesc`, or icon `⚡`).
- DO NOT change any element ID or remove any `data-i18n` attribute.
- DO NOT add inline styles or `onclick` handlers.
- Retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on `dashboard/dashboard.html`.

---

## ✅ 5. Local Verification Gate
- Verify all 10 control IDs exist in `dashboard.html`.
- Run: `node tests/test_dashboard_sleep_pause_and_parity.js`
- Run: `node tests/test_ui_container_split_focus_sleep.js`
- Both must PASS with 100% exit code 0.
