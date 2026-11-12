# Phase 3: Dashboard Settings & Sleep Timer Configuration UI

> **Phase Reference:** `phase_03_dashboard_settings_ui.md`  
> **Milestone:** 3 of 5  
> **Assigned Role:** Frontend Dashboard Specialist  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Architecture Standard:** Manifest V3 Zero-innerHTML Standard & W3C Trusted Types  
> **Governing Document:** [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/DESIGN.md)  

---

## 🎯 1. Phase Objective

Design and integrate the "Sleep Timer & Inactivity Settings" panel inside the Enterprise Dashboard. Allow users to customize default sleep timer duration, toggle audio fade-out, set fade duration, enable inactivity auto-sleep, and configure badge countdown options. Synchronize settings instantly with `chrome.storage.local` and `background.js`.

---

## 📦 2. Prerequisites & Inputs

- Completion of Phase 1 (`phase_01_storage_and_state_engine.md`) and Phase 2 (`phase_02_inactivity_detector_and_timer.md`).
- Existing Settings Pane structure in [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L610-L650).
- Ensure all modifications maintain UTF-8 with BOM standard (`0xEF, 0xBB, 0xBF`).

---

## 🔗 3. Technical Context & File Anchors

- **Target File 1:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L645-L655)
  - Anchor: Insert new Sleep Timer Settings Card between General Settings and Export Data Card.
- **Target File 2:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L250-L320)
  - Anchor: Settings load, save, and i18n translation functions.
- **Target File 3:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
  - Anchor: Settings cards and form controls styling.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: DOM Structure in `dashboard/dashboard.html`
In [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html), locate the Settings Section (`#paneSettings`) and insert the new card:
```html
<!-- Card: Sleep Timer & Inactivity Sentinel -->
<div class="settings-card" id="cardSleepSettings">
  <div class="settings-card-header">
    <span class="settings-card-icon">🌙</span>
    <div class="settings-card-title-group">
      <h3 id="headingSleepSettings" class="settings-card-title">Sleep Timer & Inactivity Sentinel</h3>
      <span id="subSleepSettings" class="settings-card-sub">Automated playback cutoff, gentle audio fade-out, and idle power saving</span>
    </div>
  </div>

  <div class="settings-form">
    <!-- Default Sleep Duration -->
    <div class="form-row">
      <div class="form-label-group">
        <label for="settingDefaultSleepDuration" id="lblDefaultSleepDuration" class="form-label">Default Sleep Duration</label>
        <span id="descDefaultSleepDuration" class="form-desc">Default countdown interval for quick 1-click sleep presets</span>
      </div>
      <select id="settingDefaultSleepDuration" class="styled-select form-control-select">
        <option value="15">15 Minutes</option>
        <option value="30" selected>30 Minutes</option>
        <option value="45">45 Minutes</option>
        <option value="60">60 Minutes</option>
        <option value="90">90 Minutes</option>
      </select>
    </div>

    <!-- Gradual Audio Fade-out Toggle -->
    <div class="form-row">
      <div class="form-label-group">
        <label for="settingSleepFadeToggle" id="lblSleepFadeToggle" class="form-label">Gradual Audio Fade-out</label>
        <span id="descSleepFadeToggle" class="form-desc">Linearly step down media volume before pausing to prevent sudden audio cutoffs</span>
      </div>
      <label class="switch-toggle">
        <input type="checkbox" id="settingSleepFadeToggle" checked>
        <span class="slider-round"></span>
      </label>
    </div>

    <!-- Fade Duration Selector -->
    <div class="form-row" id="rowFadeDuration">
      <div class="form-label-group">
        <label for="settingFadeDuration" id="lblFadeDuration" class="form-label">Fade Duration Window</label>
        <span id="descFadeDuration" class="form-desc">Number of seconds allocated for smooth volume attenuation</span>
      </div>
      <select id="settingFadeDuration" class="styled-select form-control-select">
        <option value="15">15 Seconds</option>
        <option value="30" selected>30 Seconds (Recommended)</option>
        <option value="60">60 Seconds</option>
      </select>
    </div>

    <!-- Inactivity Auto-Sleep Toggle -->
    <div class="form-row">
      <div class="form-label-group">
        <label for="settingInactivitySleepToggle" id="lblInactivitySleepToggle" class="form-label">Inactivity Auto-Sleep Sentinel</label>
        <span id="descInactivitySleepToggle" class="form-desc">Automatically pause playing media when system is detected idle (AFK)</span>
      </div>
      <label class="switch-toggle">
        <input type="checkbox" id="settingInactivitySleepToggle">
        <span class="slider-round"></span>
      </label>
    </div>

    <!-- Inactivity Threshold Selector -->
    <div class="form-row" id="rowInactivityThreshold">
      <div class="form-label-group">
        <label for="settingInactivityThreshold" id="lblInactivityThreshold" class="form-label">Inactivity Detection Threshold</label>
        <span id="descInactivityThreshold" class="form-desc">Duration of user inactivity required before auto-sleep engages</span>
      </div>
      <select id="settingInactivityThreshold" class="styled-select form-control-select">
        <option value="10">10 Minutes</option>
        <option value="15" selected>15 Minutes</option>
        <option value="30">30 Minutes</option>
        <option value="60">60 Minutes</option>
      </select>
    </div>

    <!-- Show Badge Countdown Toggle -->
    <div class="form-row">
      <div class="form-label-group">
        <label for="settingBadgeCountdownToggle" id="lblBadgeCountdownToggle" class="form-label">Toolbar Badge Countdown</label>
        <span id="descBadgeCountdownToggle" class="form-desc">Show dynamic countdown and color indicators on the browser icon</span>
      </div>
      <label class="switch-toggle">
        <input type="checkbox" id="settingBadgeCountdownToggle" checked>
        <span class="slider-round"></span>
      </label>
    </div>

    <div class="settings-actions-bar">
      <button id="btnSaveSleepSettings" class="btn-save-primary">
        💾 Save Sleep Settings
      </button>
    </div>
  </div>
</div>
```

### Step 3.2: Persistence Logic & i18n in `dashboard/dashboard.js`
In [`dashboard/dashboard.js`](file:///c:/Users/Atul Verma/Desktop/Win App Tracker/Browser Detection/dashboard/dashboard.js):
1. Implement `loadSleepSettingsUI()`:
```javascript
async function loadSleepSettingsUI() {
  try {
    const data = await browserAPI.storage.local.get('sentinel_sleep_settings');
    const settings = data.sentinel_sleep_settings || {};

    const selDuration = document.getElementById('settingDefaultSleepDuration');
    const chkFade = document.getElementById('settingSleepFadeToggle');
    const selFadeDur = document.getElementById('settingFadeDuration');
    const chkInactivity = document.getElementById('settingInactivitySleepToggle');
    const selInactivity = document.getElementById('settingInactivityThreshold');
    const chkBadge = document.getElementById('settingBadgeCountdownToggle');

    if (selDuration && settings.defaultDurationMinutes) selDuration.value = settings.defaultDurationMinutes;
    if (chkFade) chkFade.checked = settings.enableAudioFadeOut !== false;
    if (selFadeDur && settings.fadeDurationSeconds) selFadeDur.value = settings.fadeDurationSeconds;
    if (chkInactivity) chkInactivity.checked = !!settings.enableInactivityAutoSleep;
    if (selInactivity && settings.inactivityThresholdMinutes) selInactivity.value = settings.inactivityThresholdMinutes;
    if (chkBadge) chkBadge.checked = settings.showBadgeCountdown !== false;
  } catch (err) {
    console.error('[Dashboard] Error loading sleep settings:', err);
  }
}
```
2. Implement `saveSleepSettingsUI()`:
```javascript
async function saveSleepSettingsUI() {
  const settings = {
    defaultDurationMinutes: parseInt(document.getElementById('settingDefaultSleepDuration').value, 10) || 30,
    enableAudioFadeOut: document.getElementById('settingSleepFadeToggle').checked,
    fadeDurationSeconds: parseInt(document.getElementById('settingFadeDuration').value, 10) || 30,
    enableInactivityAutoSleep: document.getElementById('settingInactivitySleepToggle').checked,
    inactivityThresholdMinutes: parseInt(document.getElementById('settingInactivityThreshold').value, 10) || 15,
    showBadgeCountdown: document.getElementById('settingBadgeCountdownToggle').checked,
    pulseOnCritical: true
  };

  await browserAPI.storage.local.set({ sentinel_sleep_settings: settings });

  // Broadcast update to background service worker
  try {
    await browserAPI.runtime.sendMessage({
      action: 'UPDATE_SLEEP_SETTINGS',
      settings: settings
    });
  } catch (e) {}

  showToastNotification('Sleep timer & inactivity settings saved successfully');
}
```
3. Bind click listener on `#btnSaveSleepSettings`.
4. Add English and Hindi i18n keys to `I18N_DICTIONARY` (`headingSleepSettings`, `lblDefaultSleepDuration`, `lblSleepFadeToggle`, `lblInactivitySleepToggle`, etc.).

### Step 3.3: CSS Polish in `dashboard/dashboard.css`
In [`dashboard/dashboard.css`](file:///c:/Users/Atul Verma/Desktop/Win App Tracker/Browser Detection/dashboard/dashboard.css):
Ensure the new card `#cardSleepSettings` shares standard `.settings-card` styling with smooth transition and focus states.

---

## 🚫 5. Architectural Constraints & Boundaries

- Zero assignments to `innerHTML`; use `textContent` and `value` bindings.
- Preserve existing general settings, data exports, and danger zone resets.
- Follow WCAG 2.1 AA focus outline standards on all new form inputs.

---

## 📋 6. Deliverables Manifest

1. Updated [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) with Sleep Timer settings card.
2. Updated [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) with settings loader, saver, and i18n dictionary additions.
3. Updated [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css) with clean styles.

---

## 🧪 7. Local Verification Gate

Execute the syntax and manifest integrity suite:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
**Exit Criterion:** Command exits with code 0; syntax check on `dashboard/dashboard.js` passes cleanly.
