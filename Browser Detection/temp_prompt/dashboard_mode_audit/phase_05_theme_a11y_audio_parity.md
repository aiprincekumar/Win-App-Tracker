# Phase 5: Visual Accessibility, Light Theme & Audio Lab Parity
# फेज़ 5: विजुअल एक्सेसिबिलिटी, लाइट थीम व ऑडियो लैब पैरिटी निर्देशिका

> **दस्तावेज़ प्रकार (Document Type):** Phase 5 Actionable Execution Prompt  
> **कार्यक्षेत्र कंटेनर (Workspace Container):** `temp_prompt/dashboard_mode_audit/`  
> **लक्ष्य सिस्टम (Target System):** Web Activity & Media Sentinel (MV3 Full-Page Dashboard)  
> **असाइन की गई भूमिका (Assigned Role):** Level 4 Sub Agent (Frontend Engineer / UI/UX Design Token Engineer)  
> **प्राथमिक प्राधिकरण (Primary Authority):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **स्वीकृति टोकन (Authorization Token):** `AUTH-MGR-20261115-DASHBOARD-PHASE05-EXEC`  
> **सक्रिय मेमोरी संदर्भ (Active Memory Anchor):** [`project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md) एवं [`C:\Users\Atul Verma\.gemini\memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **लक्ष्य दोष (Target Defects):** दोष 15 (Audio Lab Parity), दोष 16 (Light Theme CSS & Contrast), दोष 17 (Scrubber Keyboard A11y)  

---

## 🎯 1. Phase Objective & Overview

Execute and resolve the final 3 defects of Dashboard Mode:
1. **Defect 15 (Audio Lab Parity Gap):** Integrate a dedicated "🎛️ Audio Lab & Equalizer Telemetry" widget (`#heroAudioLabStatus`) in Tab B of `dashboard/dashboard.html` with real-time status monitoring (Master Boost 100%-200%, Vocal Clarity, Night Shield, Active EQ Preset) and remote Master Boost slider adjustment synchronized with `audio_lab_settings` in `chrome.storage.local`.
2. **Defect 16 (Light Theme CSS & Contrast):** Implement `#btnThemeToggle` in the Top App Bar, support instant switching between `body.theme-light` and `body.theme-dark` with persistent storage (`ui_theme`), implement complete light mode tokens in `dashboard/dashboard.css`, and fix dark mode `--text-muted` contrast to achieve 100% WCAG AA/AAA compliance (contrast ratio >= 4.5:1).
3. **Defect 17 (Scrubber Keyboard A11y):** Implement complete keyboard accessibility on `#heroProgressBar` and `#heroVolumeBar` with Arrow keys (+/-5s seek, +/-5% vol), PageUp/PageDown (+/-30s seek, +/-20% vol), Home/End (0s/end, mute/100%), with `e.preventDefault()`, `:focus-visible` ring, and dynamic ARIA slider updates (`aria-valuenow`, `aria-valuetext`).

---

## 📋 2. Surgical Step-by-Step Implementation Instructions

### Step 1: Top App Bar Theme Toggle & Audio Lab UI in `dashboard/dashboard.html`
1. **Add Theme Toggle Button `#btnThemeToggle`:**
   In the Top App Bar actions container (adjacent to `#btnLangToggle` and `#btnSidebarToggle`):
   ```html
   <button id="btnThemeToggle" class="topbar-btn" title="Switch to Light Mode" aria-label="Switch to Light Mode" data-i18n-title="theme_toggle_light">
     <svg class="topbar-icon theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <circle cx="12" cy="12" r="5"></circle>
       <line x1="12" y1="1" x2="12" y2="3"></line>
       <line x1="12" y1="21" x2="12" y2="23"></line>
       <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
       <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
       <line x1="1" y1="12" x2="3" y2="12"></line>
       <line x1="21" y1="12" x2="23" y2="12"></line>
       <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
       <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
     </svg>
   </button>
   ```
2. **Add Audio Lab Telemetry & DSP Widget `#heroAudioLabStatus` in Tab B:**
   Inside `tabMediaContent`, under the Hero Video Player or inside the media controls panel:
   ```html
   <div id="heroAudioLabStatus" class="audio-lab-widget glass-card">
     <div class="audio-lab-header">
       <div class="audio-lab-title-group">
         <span class="audio-lab-icon">🎛️</span>
         <h3 class="audio-lab-title" data-i18n="audiolab_title">Audio Lab & DSP Telemetry</h3>
       </div>
       <div class="audio-lab-badges">
         <span id="audioLabPresetBadge" class="badge badge-preset">Flat</span>
         <span id="audioLabVocalBadge" class="badge badge-feature">Vocal: OFF</span>
         <span id="audioLabNightBadge" class="badge badge-feature">Night: OFF</span>
       </div>
     </div>
     <div class="audio-lab-body">
       <div class="audio-boost-control">
         <div class="boost-label-row">
           <span class="boost-label" data-i18n="audiolab_master_boost">Master Volume Boost</span>
           <span id="heroAudioBoostVal" class="boost-value">100%</span>
         </div>
         <input type="range" id="heroAudioBoostSlider" min="100" max="200" step="5" value="100" class="audio-boost-slider" aria-label="Master Volume Boost" />
       </div>
       <div class="audio-lab-status-note">
         <span class="status-indicator-dot online"></span>
         <span id="audioLabStatusText" class="audio-lab-note" data-i18n="audiolab_dsp_active">Offscreen Web Audio DSP Pipeline Active</span>
       </div>
     </div>
   </div>
   ```

### Step 2: Theme Tokens & Contrast Calibration in `dashboard/dashboard.css`
1. **Calibrate Dark Mode `--text-muted` for WCAG AA (>= 4.5:1):**
   Update `:root` / `body.theme-dark`:
   ```css
   --text-muted: #94a3b8; /* Calibrated from #64748b; 7.3:1 contrast against #080b11 (WCAG AAA) */
   ```
2. **Add Complete `body.theme-light` Stylesheet Definition:**
   ```css
   body.theme-light {
     --bg-deep: #f8fafc;
     --bg-sidebar: #ffffff;
     --bg-stage: #f1f5f9;
     --bg-card: rgba(255, 255, 255, 0.92);
     --bg-card-hover: #ffffff;
     --bg-card-solid: #ffffff;
     --bg-input: #ffffff;
     --bg-subtle: rgba(0, 0, 0, 0.04);

     --text-primary: #0f172a;      /* 15.6:1 contrast against #f8fafc */
     --text-secondary: #334155;    /* 9.6:1 contrast against #f8fafc */
     --text-muted: #475569;        /* 5.8:1 contrast against #f1f5f9 - WCAG AA & AAA */
     --text-inverse: #ffffff;

     --border-dim: rgba(0, 0, 0, 0.10);
     --border-hover: rgba(0, 0, 0, 0.20);
     --border-focus: rgba(16, 185, 129, 0.6);

     --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
     --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
     --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

     background-color: var(--bg-deep);
     color: var(--text-primary);
   }

   /* Light mode scoped overrides */
   body.theme-light .glass-card,
   body.theme-light .stat-card,
   body.theme-light .chart-card,
   body.theme-light .hero-player-card,
   body.theme-light .audio-lab-widget {
     background: var(--bg-card);
     border-color: var(--border-dim);
     box-shadow: var(--shadow-sm);
   }

   body.theme-light .sidebar {
     background-color: var(--bg-sidebar);
     border-right-color: var(--border-dim);
   }

   body.theme-light .top-bar {
     background-color: var(--bg-sidebar);
     border-bottom-color: var(--border-dim);
   }

   body.theme-light .data-table th {
     background-color: var(--bg-stage);
     color: var(--text-secondary);
     border-bottom-color: var(--border-dim);
   }

   body.theme-light .data-table td {
     color: var(--text-primary);
     border-bottom-color: var(--border-dim);
   }

   body.theme-light .data-table tr:hover td {
     background-color: var(--bg-subtle);
   }

   body.theme-light input,
   body.theme-light select {
     background-color: var(--bg-input);
     color: var(--text-primary);
     border-color: var(--border-dim);
   }
   ```
3. **Accessibility Focus Rings (`:focus-visible`):**
   ```css
   #heroProgressBar:focus-visible,
   #heroVolumeBar:focus-visible,
   .audio-boost-slider:focus-visible,
   #btnThemeToggle:focus-visible {
     outline: 2px solid var(--accent-emerald);
     outline-offset: 2px;
     box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35);
   }
   ```
4. **Audio Lab Widget Layout Styling:**
   Style `.audio-lab-widget`, `.audio-lab-header`, `.audio-lab-badges`, `.boost-label-row`, `.audio-boost-slider`, and `.audio-lab-status-note`.

### Step 3: Logic, Keyboard A11y, Audio Lab & Storage Sync in `dashboard/dashboard.js`
1. **Theme Management (`currentTheme`, `applyTheme`, `toggleThemeMode`):**
   - Initialize `currentTheme = 'dark'`.
   - On load, inspect `browserAPI.storage.local.get(['ui_theme'])` (and fallback `localStorage.getItem('ui_theme')`).
   - `applyTheme(theme)`:
     - Apply classes `theme-light` vs `theme-dark` to `document.body`.
     - Set `data-theme` attribute on `document.documentElement` and `document.body`.
     - Update `#btnThemeToggle` icon (Sun icon when light, Moon icon when dark) and title/aria-label using W3C Trusted Types safe DOM replacement (zero innerHTML).
   - `toggleThemeMode()`:
     - Toggle between 'light' and 'dark'.
     - Save to `chrome.storage.local.set({ ui_theme: nextTheme })` and `localStorage.setItem('ui_theme', nextTheme)`.
     - Trigger localized toast.
   - Attach click listener to `#btnThemeToggle`.
   - Listen to `chrome.storage.onChanged` for `ui_theme` changes to synchronize instantly across windows/tabs.
2. **Keyboard A11y on `#heroProgressBar` & `#heroVolumeBar`:**
   - Attach `keydown` listeners on `#heroProgressBar`:
     - `ArrowRight` / `ArrowUp`: seek `+5s`.
     - `ArrowLeft` / `ArrowDown`: seek `-5s`.
     - `PageUp`: seek `+30s`.
     - `PageDown`: seek `-30s`.
     - `Home`: seek to `0`.
     - `End`: seek to `duration`.
     - `e.preventDefault()` on handled keys.
   - Attach `keydown` listeners on `#heroVolumeBar`:
     - `ArrowRight` / `ArrowUp`: volume `+5%` (`+0.05`).
     - `ArrowLeft` / `ArrowDown`: volume `-5%` (`-0.05`).
     - `PageUp`: volume `+20%` (`+0.20`).
     - `PageDown`: volume `-20%` (`-0.20`).
     - `Home`: volume `0%` (`0.0`).
     - `End`: volume `100%` (`1.0`).
     - `e.preventDefault()` on handled keys.
   - Update ARIA attributes during live updates:
     - `aria-valuenow` and `aria-valuetext` on both scrubbers.
3. **Audio Lab Telemetry & Control Logic:**
   - On startup, read `chrome.storage.local.get(['audio_lab_settings'])`.
   - Implement `updateDashboardAudioLabUI(settings)`:
     - Update `#heroAudioBoostVal` text to `${settings.master_boost || 100}%`.
     - Update `#heroAudioBoostSlider` value.
     - Update badges: Preset (`settings.eq_preset || 'Flat'`), Vocal Clarity (`settings.vocal_clarity ? 'Vocal: ON' : 'Vocal: OFF'`), Night Shield (`settings.night_shield ? 'Night: ON' : 'Night: OFF'`).
   - Add input listener on `#heroAudioBoostSlider`:
     - On input: update readout text.
     - On change: persist `{ audio_lab_settings: { ...existingSettings, master_boost: newBoost } }` to `chrome.storage.local`.
   - Listen to `chrome.storage.onChanged` for `audio_lab_settings` to update widget live.
4. **Bilingual i18n Keys in `DASHBOARD_I18N`:**
   - Add matching keys in `en` and `hi`:
     - `theme_toggle_light`, `theme_toggle_dark`, `theme_active_dark`, `theme_active_light`
     - `audiolab_title`, `audiolab_master_boost`, `audiolab_dsp_active`, `audiolab_vocal_on`, `audiolab_vocal_off`, `audiolab_night_on`, `audiolab_night_off`

---

## 🧪 3. Automated Test Gate Specification

- **Test Suite Path:** `tests/test_dashboard_theme_and_a11y_verification.js`
- **Execution Command:**
  ```powershell
  node tests/test_dashboard_theme_and_a11y_verification.js
  ```
- **Validation Criteria:**
  1. **AST & Syntax Integrity:** 0 syntax errors across `dashboard/dashboard.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`.
  2. **Theme UI & Persistence:** `#btnThemeToggle` exists, toggles `body.theme-light` vs `body.theme-dark`, and persists `ui_theme` to storage.
  3. **WCAG Contrast Ratios:** Mathematical validation that all light mode and dark mode text/background pairings meet or exceed 4.5:1.
  4. **ARIA Roles & Dynamic Values:** `#heroProgressBar` and `#heroVolumeBar` have `role="slider"`, `tabindex="0"`, `aria-valuemin`, `aria-valuemax`, and update `aria-valuenow`.
  5. **Keyboard Navigation:** `keydown` handlers respond to Arrow, PageUp/PageDown, Home, End keys and call `e.preventDefault()`.
  6. **Audio Lab Widget:** `#heroAudioLabStatus` elements exist, read and render `audio_lab_settings`, and handle Master Boost slider input.
  7. **Bilingual Parity:** 100% symmetric keys across `DASHBOARD_I18N.en` and `DASHBOARD_I18N.hi`.
  8. **All Existing Workspace Tests:** Pass 100% clean with exit code 0.
