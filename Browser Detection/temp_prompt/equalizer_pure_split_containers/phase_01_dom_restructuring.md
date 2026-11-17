# Phase 1: Pure DOM Restructuring into Two Sibling Bento Cards

> **Phase:** 01  
> **Target Task ID:** `TASK-EQ-PURE-SPLIT-CONTAINERS-001`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Workspace Container:** `temp_prompt/equalizer_pure_split_containers/`  
> **Primary Target:** `dashboard/dashboard.html`  
> **Secondary Target:** `dashboard/dashboard.js` (Verify event bindings)

---

## 🎯 1. Phase Objective

Restructure the Media Analytics Tab (Tab B) in `dashboard/dashboard.html` by dismantling the single parent card `#heroAudioEqCard` (which previously housed `.audio-eq-split-deck`) and creating **two pure, separate top-level sibling Bento cards**:
1. **Card 1 (Dedicated 5-Band Graphic Equalizer Card):**
   `<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6">`
2. **Card 2 (Dedicated Audio Lab & DSP Enhancements Card):**
   `<div id="heroAudioLabCard" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-6">`

Both cards must reside as direct sibling elements in the Bento grid container, with zero shared wrapper div enclosing them. All 18 existing DOM IDs and localization attributes must be 100% preserved.

---

## 📋 2. Prerequisites & Current State Inspection

- Baseline file: `dashboard/dashboard.html` lines ~764 to ~940.
- Current structure:
  ```html
  <div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12">
    <div class="audio-eq-split-deck">
      <div class="eq-deck-left-col">...</div>
      <div class="eq-deck-right-col">...</div>
    </div>
  </div>
  ```
- Defect: The Equalizer and Audio Lab are two columns inside one single container, violating user's requirement for pure separate containers.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Extract Equalizer into Dedicated Card `#heroAudioEqCard`
Replace the outer wrapper and left column with a clean, standalone Bento card:
```html
<!-- Bento Card 1: Dedicated 5-Band Graphic Equalizer -->
<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6">
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
    <!-- Band 0 (60Hz Sub-Bass) -->
    <div class="eq-band-column">
      <div class="eq-slider-wrapper">
        <input type="range" id="eqBand0" min="-12" max="12" step="0.5" value="0" class="eq-slider" orient="vertical" aria-label="60Hz Sub-Bass Gain" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
      </div>
      <div class="eq-band-meta">
        <span class="eq-band-freq">60Hz</span>
        <span id="eqVal0" class="eq-band-db">0.0dB</span>
        <span class="eq-band-sublabel" data-i18n="eq_subbass">Sub-Bass</span>
      </div>
    </div>
    <!-- Band 1 (230Hz / 250Hz Bass) -->
    <div class="eq-band-column">
      <div class="eq-slider-wrapper">
        <input type="range" id="eqBand1" min="-12" max="12" step="0.5" value="0" class="eq-slider" orient="vertical" aria-label="230Hz Bass Gain" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
      </div>
      <div class="eq-band-meta">
        <span class="eq-band-freq">230Hz</span>
        <span id="eqVal1" class="eq-band-db">0.0dB</span>
        <span class="eq-band-sublabel" data-i18n="eq_bass">Bass</span>
      </div>
    </div>
    <!-- Band 2 (910Hz / 1kHz Mid/Vocals) -->
    <div class="eq-band-column">
      <div class="eq-slider-wrapper">
        <input type="range" id="eqBand2" min="-12" max="12" step="0.5" value="0" class="eq-slider" orient="vertical" aria-label="910Hz Mid Gain" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
      </div>
      <div class="eq-band-meta">
        <span class="eq-band-freq">910Hz</span>
        <span id="eqVal2" class="eq-band-db">0.0dB</span>
        <span class="eq-band-sublabel" data-i18n="eq_mid">Mid</span>
      </div>
    </div>
    <!-- Band 3 (3.6kHz / 4kHz Treble/Presence) -->
    <div class="eq-band-column">
      <div class="eq-slider-wrapper">
        <input type="range" id="eqBand3" min="-12" max="12" step="0.5" value="0" class="eq-slider" orient="vertical" aria-label="3.6kHz Presence Gain" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
      </div>
      <div class="eq-band-meta">
        <span class="eq-band-freq">3.6kHz</span>
        <span id="eqVal3" class="eq-band-db">0.0dB</span>
        <span class="eq-band-sublabel" data-i18n="eq_presence">Presence</span>
      </div>
    </div>
    <!-- Band 4 (14kHz / 16kHz Air) -->
    <div class="eq-band-column">
      <div class="eq-slider-wrapper">
        <input type="range" id="eqBand4" min="-12" max="12" step="0.5" value="0" class="eq-slider" orient="vertical" aria-label="14kHz Air Gain" role="slider" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0" />
      </div>
      <div class="eq-band-meta">
        <span class="eq-band-freq">14kHz</span>
        <span id="eqVal4" class="eq-band-db">0.0dB</span>
        <span class="eq-band-sublabel" data-i18n="eq_air">Air</span>
      </div>
    </div>
  </div>
</div>
```

### Step 1.2: Establish Dedicated Sibling Card `#heroAudioLabCard`
Directly following `</div>` of `#heroAudioEqCard`, insert the dedicated Audio Lab card as an immediate sibling:
```html
<!-- Bento Card 2: Dedicated Audio Lab & DSP Enhancements -->
<div id="heroAudioLabCard" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-6">
  <div class="audio-lab-header">
    <div class="audio-lab-title-group">
      <span class="audio-lab-icon">🎛️</span>
      <div class="audio-lab-title-meta">
        <h4 id="audioLabTitle" class="audio-lab-heading" data-i18n="audiolab_title">Audio Lab & DSP Enhancements</h4>
        <div class="audio-lab-status-note">
          <span class="status-indicator-dot online"></span>
          <span id="audioLabStatusText" class="audio-lab-note" data-i18n="audiolab_dsp_active">Offscreen Web Audio DSP Pipeline Active</span>
        </div>
      </div>
    </div>
    <div class="audio-lab-badges">
      <span id="audioLabPresetBadge" class="badge badge-preset">Flat</span>
      <span id="audioLabVocalBadge" class="badge badge-feature">Vocal: OFF</span>
      <span id="audioLabNightBadge" class="badge badge-feature">Night: OFF</span>
    </div>
  </div>

  <!-- Master Boost Slider (0% to 200%) -->
  <div class="audio-boost-control">
    <div class="boost-label-row">
      <div class="boost-title-wrap">
        <span class="boost-icon">🔊</span>
        <span id="lblAudioMasterBoost" class="boost-label" data-i18n="audiolab_master_boost">Master Volume Boost</span>
      </div>
      <span id="heroAudioBoostVal" class="boost-value">100%</span>
    </div>
    <input type="range" id="heroAudioBoostSlider" min="0" max="200" step="5" value="100" class="audio-boost-slider" aria-label="Master Volume Boost" role="slider" aria-valuemin="0" aria-valuemax="200" aria-valuenow="100" />
    <div class="boost-scale-marks">
      <span data-i18n="audiolab_boost_min">0%</span>
      <span>50%</span>
      <span class="mark-normal" data-i18n="audiolab_boost_normal">100% (Normal)</span>
      <span>150%</span>
      <span class="mark-max" data-i18n="audiolab_boost_max">200% (Max)</span>
    </div>
  </div>

  <!-- Audio Enhancement Toggles -->
  <div class="audio-enhancements-section">
    <div class="enhancements-grid">
      <!-- Vocal Clarity -->
      <div class="enhancement-card enhancement-chip">
        <div class="enhancement-card-header">
          <span id="lblAudioVocalTitle" class="enhancement-title" data-i18n="audiolab_vocal_title">🗣️ Vocal Clarity</span>
          <label class="switch-toggle" for="toggleVocalClarity">
            <input type="checkbox" id="toggleVocalClarity" role="switch" aria-label="Vocal Clarity" />
            <span class="slider-round"></span>
          </label>
        </div>
        <span id="lblAudioVocalDesc" class="enhancement-desc" data-i18n="audiolab_vocal_desc">Boost vocal frequencies and speech intelligibility</span>
      </div>

      <!-- Night Shield / Night Mode -->
      <div class="enhancement-card enhancement-chip">
        <div class="enhancement-card-header">
          <span id="lblNightModeTitle" class="enhancement-title" data-i18n="audiolab_night_title">🌙 Night Shield</span>
          <label class="switch-toggle" for="toggleNightMode">
            <input type="checkbox" id="toggleNightMode" role="switch" aria-label="Night Mode" />
            <span class="slider-round"></span>
          </label>
        </div>
        <span id="lblNightModeDesc" class="enhancement-desc" data-i18n="audiolab_night_desc">Compress dynamic range and reduce harsh bass peaks</span>
      </div>

      <!-- Audio-Only Mode -->
      <div class="enhancement-card enhancement-chip">
        <div class="enhancement-card-header">
          <span id="lblAudioOnlyTitle" class="enhancement-title" data-i18n="audiolab_audio_only_title">📻 Audio-Only Mode</span>
          <label class="switch-toggle" for="toggleAudioOnlyMode">
            <input type="checkbox" id="toggleAudioOnlyMode" role="switch" aria-label="Audio-Only Mode" />
            <span class="slider-round"></span>
          </label>
        </div>
        <span id="lblAudioOnlyDesc" class="enhancement-desc" data-i18n="audiolab_audio_only_desc">Save battery and CPU by suppressing video frames</span>
      </div>
    </div>
  </div>
</div>
```

### Step 1.3: Eliminate Obsolete Wrappers
Remove all occurrences of `.audio-eq-split-deck`, `.eq-deck-left-col`, and `.eq-deck-right-col` from `dashboard/dashboard.html`.

### Step 1.4: Verify JavaScript Compatibility
Check `dashboard/dashboard.js` to ensure that:
1. `document.getElementById('heroAudioEqCard')` and all 18 child IDs resolve cleanly.
2. If `document.getElementById('heroAudioLabCard')` is referenced or needs card-level state access, ensure it operates without exceptions.
3. Run `node -c dashboard/dashboard.js` to certify 0 AST syntax errors.

---

## 🛡️ 4. Invariants & Quality Gate

- [ ] `#heroAudioEqCard` and `#heroAudioLabCard` are pure sibling elements in `dashboard.html`.
- [ ] No outer wrapper div encompasses both cards.
- [ ] All 18 DOM IDs are present and intact.
- [ ] Zero `.innerHTML` or `.outerHTML` introduced.
- [ ] UTF-8 with BOM preserved on all edited files.
- [ ] Local test gate: `node -c dashboard/dashboard.js` exits 0.
