# Phase 1 Instruction Prompt: HTML DOM Architecture & Dedicated Bento Card Separation

> **Phase Identifier:** `phase_01_dom_restructuring`  
> **Target Subagent Role:** Level 4 Frontend Engineer (`Frontend Engineer`)  
> **Model Tier:** `flash` (per Universal Rule 25)  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Target File:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Status:** Ready for Execution Authorization  

---

## 🎯 1. Phase Objective

Extract the **5-Band Biquad Graphic Equalizer** from inside the **Audio Lab & DSP Telemetry Widget** (`#heroAudioLabStatus`) in `dashboard/dashboard.html` and place it into its own dedicated Bento Liquid Glass Card (`#heroAudioEqCard`), while streamlining `#heroAudioLabStatus` to focus exclusively on Master Volume Boost, Audio Enhancements (Vocal Clarity, Night Shield, Audio-Only Mode), telemetry badges, and DSP status.

**CRITICAL INVARIANT:** 100% of all existing DOM IDs, data-i18n bilingual attributes, ARIA attributes, and values MUST BE PRESERVED WITHOUT OMISSION OR RENAMING.

---

## 📋 2. Prerequisites & Environment State

- Target repository: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- File on disk: `dashboard/dashboard.html` (encoded in UTF-8 with BOM: `0xEF, 0xBB, 0xBF`)
- Baseline test state: `node tests/test_dashboard_full_audio_lab_parity.js` and `node tests/test_dashboard_uiux_phase1.js` are passing.
- Authorization: Level 2 Manager Token `AUTH-MGR-*`.

---

## 🔍 3. Technical Context & File Anchors

In [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L510-L642):
- Line 511: `<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2">`
- Lines 524–541: Master Boost Slider (`audio-boost-control`)
- Lines 543–594: 5-Band Equalizer section (`audio-eq-section`)
- Lines 596–635: Audio Enhancement toggles (`audio-enhancements-section`)
- Lines 637–640: Audio Lab status note (`audio-lab-status-note`)

Currently, all three sections are crammed inside `#heroAudioLabStatus`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Extract `.audio-eq-section` from `#heroAudioLabStatus`
In `dashboard/dashboard.html`, remove the `<div class="audio-eq-section">...</div>` block from inside `#heroAudioLabStatus`.

The refined `#heroAudioLabStatus` container must retain:
1. `.audio-lab-header`:
   - Title: `#audioLabTitle` with `data-i18n="audiolab_title"`
   - Telemetry Badges: `#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`
2. `.audio-lab-body`:
   - `.audio-boost-control`:
     - Label: `#lblAudioMasterBoost` (`data-i18n="audiolab_master_boost"`)
     - Readout: `#heroAudioBoostVal`
     - Slider: `<input type="range" id="heroAudioBoostSlider" min="0" max="200" step="5" value="100" class="audio-boost-slider" aria-label="Master Volume Boost" role="slider" aria-valuemin="0" aria-valuemax="200" aria-valuenow="100" />`
     - Scale marks: `0%`, `50%`, `100% (Normal)`, `150%`, `200% (Max)`
   - `.audio-enhancements-section`:
     - Vocal Clarity: `#lblAudioVocalTitle`, `#lblAudioVocalDesc`, `#toggleVocalClarity`
     - Night Shield: `#lblAudioNightTitle`, `#lblAudioNightDesc`, `#toggleNightShield`
     - Audio-Only Mode: `#lblAudioOnlyTitle`, `#lblAudioOnlyDesc`, `#toggleAudioOnlyMode`
   - `.audio-lab-status-note`:
     - Indicator dot + `#audioLabStatusText` (`data-i18n="audiolab_dsp_active"`)

### Step 1.2: Construct the Standalone `#heroAudioEqCard` Bento Card
Directly after `#heroAudioLabStatus` (as a sibling card in `#tabContentMediaAnalytics`), insert the dedicated Equalizer Bento Card:

```html
          <!-- Bento Card: Dedicated 5-Band Graphic Equalizer Studio Deck -->
          <div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12">
            <div class="eq-card-header">
              <div class="eq-title-group">
                <span class="eq-icon">🎚️</span>
                <div class="eq-title-meta">
                  <h4 id="lblAudioEqTitle" class="eq-heading" data-i18n="audiolab_eq_title">5-Band Graphic Equalizer</h4>
                  <span class="eq-badge-specs">Biquad Peaking Filters (Q=1.4) • [-12dB, +12dB]</span>
                </div>
              </div>
              <div class="eq-actions-group">
                <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">
                  <option value="flat" data-i18n="eq_preset_flat" selected>Flat</option>
                  <option value="bass_boost" data-i18n="eq_preset_bass_boost">Bass Boost</option>
                  <option value="vocal_enhancer" data-i18n="eq_preset_vocal_enhancer">Vocal Enhancer</option>
                  <option value="treble_boost" data-i18n="eq_preset_treble_boost">Treble Boost</option>
                  <option value="electronic" data-i18n="eq_preset_electronic">Electronic</option>
                  <option value="rock" data-i18n="eq_preset_rock">Rock</option>
                  <option value="acoustic" data-i18n="eq_preset_acoustic">Acoustic</option>
                  <option value="night_mode" data-i18n="eq_preset_night_mode">Night Mode</option>
                  <option value="custom" data-i18n="eq_preset_custom">Custom</option>
                </select>
                <button type="button" id="btnResetEq" class="btn-reset-eq" aria-label="Reset Equalizer" data-i18n="audiolab_reset_eq">🔄 Reset EQ</button>
              </div>
            </div>

            <!-- 5-Band Vertical Sliders Grid -->
            <div class="eq-bands-grid" role="region" aria-label="Equalizer Frequency Bands">
              <!-- 60Hz Sub-Bass -->
              <div class="eq-band-col">
                <span id="eqVal60" class="eq-db-val">0dB</span>
                <div class="eq-slider-track-wrap">
                  <input type="range" id="eqBand60" min="-12" max="12" step="1" value="0" orient="vertical" class="eq-vertical-slider" aria-label="60Hz Band" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
                </div>
                <div class="eq-freq-meta">
                  <span class="eq-freq-label">60Hz</span>
                  <span class="eq-freq-sub">Sub-Bass</span>
                </div>
              </div>

              <!-- 250Hz Bass / Warmth -->
              <div class="eq-band-col">
                <span id="eqVal250" class="eq-db-val">0dB</span>
                <div class="eq-slider-track-wrap">
                  <input type="range" id="eqBand250" min="-12" max="12" step="1" value="0" orient="vertical" class="eq-vertical-slider" aria-label="250Hz Band" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
                </div>
                <div class="eq-freq-meta">
                  <span class="eq-freq-label">250Hz</span>
                  <span class="eq-freq-sub">Bass</span>
                </div>
              </div>

              <!-- 1kHz Midrange / Vocals -->
              <div class="eq-band-col">
                <span id="eqVal1000" class="eq-db-val">0dB</span>
                <div class="eq-slider-track-wrap">
                  <input type="range" id="eqBand1000" min="-12" max="12" step="1" value="0" orient="vertical" class="eq-vertical-slider" aria-label="1kHz Band" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
                </div>
                <div class="eq-freq-meta">
                  <span class="eq-freq-label">1kHz</span>
                  <span class="eq-freq-sub">Vocals</span>
                </div>
              </div>

              <!-- 4kHz Presence / Attack -->
              <div class="eq-band-col">
                <span id="eqVal4000" class="eq-db-val">0dB</span>
                <div class="eq-slider-track-wrap">
                  <input type="range" id="eqBand4000" min="-12" max="12" step="1" value="0" orient="vertical" class="eq-vertical-slider" aria-label="4kHz Band" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
                </div>
                <div class="eq-freq-meta">
                  <span class="eq-freq-label">4kHz</span>
                  <span class="eq-freq-sub">Presence</span>
                </div>
              </div>

              <!-- 16kHz Treble / Air -->
              <div class="eq-band-col">
                <span id="eqVal16000" class="eq-db-val">0dB</span>
                <div class="eq-slider-track-wrap">
                  <input type="range" id="eqBand16000" min="-12" max="12" step="1" value="0" orient="vertical" class="eq-vertical-slider" aria-label="16kHz Band" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
                </div>
                <div class="eq-freq-meta">
                  <span class="eq-freq-label">16kHz</span>
                  <span class="eq-freq-sub">Air</span>
                </div>
              </div>
            </div>
          </div>
```

### Step 1.3: Verify Encoding & Zero InnerHTML
1. Save `dashboard/dashboard.html` with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
2. Verify that NO inline event handlers (`onclick`, `onchange`, `oninput`) or `<script>` tags were introduced into either card.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Strict Invariant:** Do NOT rename or omit any ID (`heroAudioBoostSlider`, `heroAudioBoostVal`, `lblAudioMasterBoost`, `btnResetEq`, `audioEqPresetSelect`, `eqBand60`-`eqBand16000`, `eqVal60`-`eqVal16000`, `lblAudioEqTitle`, `toggleVocalClarity`, `toggleNightShield`, `toggleAudioOnlyMode`, `audioLabPresetBadge`, `audioLabVocalBadge`, `audioLabNightBadge`, `heroAudioLabStatus`, `audioLabStatusText`).
- **Strict Invariant:** Keep `#heroMediaPlayerCard` class as `live-player-hero-card bento-card liquid-glass-card bento-span-8 bento-row-span-2` and `#heroAudioLabStatus` class as `audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2` to guarantee zero breakage with existing test batteries.
- **Out of Scope:** Do not touch `dashboard/dashboard.js` or backend scripts in this phase.

---

## 📦 6. Deliverables Manifest

- Modified: `dashboard/dashboard.html` (Separated `#heroAudioEqCard` and streamlined `#heroAudioLabStatus`).

---

## 🧪 7. Local Verification Gate

Execute the following test gates in the workspace terminal:
```powershell
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_dashboard_uiux_phase1.js
node tests/test_dashboard_theme_and_a11y_verification.js
```
**Exit Condition:** All batteries must pass with exit code 0 and 0 errors.
