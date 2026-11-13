# Phase 03: Audio Lab Pane (Boost, 5-Band EQ & Sound Enhancements)

> **Phase:** 03 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_03_audio_lab_pane.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Construct the complete user interface and client interactions for Pillar 2: `🎛️ Audio Lab` (`#viewAudioPane`), featuring the Master Volume & 0-200% Boost card, Audio-Only Battery Saver mode, 5-Band Graphic Equalizer with preset curves, and Sound Enhancement toggles (Vocal Clarity and Night Listening Shield).

---

## 📋 2. Prerequisites & Inputs
- Phase 01 completed (pane placeholder `#viewAudioPane` exists).
- Target files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- Existing verification suite: `tests/test_syntax_and_manifest_integrity.js`.

---

## ⚓ 3. Technical Context & File Anchors
- `popup/popup.html`: Inside `#viewAudioPane`.
- `popup/popup.css`: Audio Lab layout, EQ grid, and boost glow styles.
- `popup/popup.js`: Audio lab slider event bindings, preset mapper, and `chrome.storage.local` persistence.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Populate `#viewAudioPane` in `popup/popup.html`:**
   - **Card 1: Master Volume & Boost (0-200%):**
     ```html
     <section class="audio-card boost-card">
       <div class="audio-card-header">
         <span class="audio-card-title">🔊 Master Volume & Boost</span>
         <span id="masterBoostReadout" class="boost-readout badge badge-accent">100%</span>
       </div>
       <div class="boost-slider-container">
         <input type="range" id="masterBoostSlider" min="0" max="200" value="100" class="boost-range-slider" aria-label="Master Volume Boost">
         <div class="boost-scale-marks">
           <span>0%</span>
           <span>50%</span>
           <span class="mark-normal">100% (Normal)</span>
           <span>150%</span>
           <span class="mark-boost">200% (Max)</span>
         </div>
       </div>
       <div class="audio-only-row">
         <div class="audio-only-label">
           <span class="audio-only-icon">🔋</span>
           <div>
             <div class="audio-only-title">Audio-Only Mode</div>
             <div class="audio-only-sub">Blank video to save battery and GPU</div>
           </div>
         </div>
         <label class="switch-toggle-sm">
           <input type="checkbox" id="toggleAudioOnlyMode">
           <span class="slider-round-sm"></span>
         </label>
       </div>
     </section>
     ```
   - **Card 2: 5-Band Graphic Equalizer:**
     ```html
     <section class="audio-card eq-card">
       <div class="audio-card-header">
         <span class="audio-card-title">🎚️ 5-Band Graphic Equalizer</span>
         <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">
           <option value="flat">Flat</option>
           <option value="bass_boost">Bass Boost</option>
           <option value="vocal_clarify">Vocal Clarify</option>
           <option value="rock">Rock</option>
           <option value="night">Night</option>
         </select>
       </div>
       <div class="eq-bands-grid">
         <div class="eq-band-col">
           <span id="eqReadout60" class="eq-db-val">0dB</span>
           <input type="range" id="eqBand60" min="-12" max="12" value="0" step="1" orient="vertical" class="eq-vertical-slider">
           <span class="eq-freq-label">60Hz</span>
         </div>
         <div class="eq-band-col">
           <span id="eqReadout250" class="eq-db-val">0dB</span>
           <input type="range" id="eqBand250" min="-12" max="12" value="0" step="1" orient="vertical" class="eq-vertical-slider">
           <span class="eq-freq-label">250Hz</span>
         </div>
         <div class="eq-band-col">
           <span id="eqReadout1000" class="eq-db-val">0dB</span>
           <input type="range" id="eqBand1000" min="-12" max="12" value="0" step="1" orient="vertical" class="eq-vertical-slider">
           <span class="eq-freq-label">1kHz</span>
         </div>
         <div class="eq-band-col">
           <span id="eqReadout4000" class="eq-db-val">0dB</span>
           <input type="range" id="eqBand4000" min="-12" max="12" value="0" step="1" orient="vertical" class="eq-vertical-slider">
           <span class="eq-freq-label">4kHz</span>
         </div>
         <div class="eq-band-col">
           <span id="eqReadout16000" class="eq-db-val">0dB</span>
           <input type="range" id="eqBand16000" min="-12" max="12" value="0" step="1" orient="vertical" class="eq-vertical-slider">
           <span class="eq-freq-label">16kHz</span>
         </div>
       </div>
     </section>
     ```
   - **Card 3: Sound Enhancements Card:**
     ```html
     <section class="audio-card enhancements-card">
       <div class="audio-card-header">
         <span class="audio-card-title">✨ Sound Enhancements</span>
       </div>
       <div class="enhancement-list">
         <div class="enhancement-row">
           <div class="enhancement-info">
             <span class="enhancement-name">🗣️ Vocal Clarity</span>
             <span class="enhancement-desc">Highlight dialogue over loud music</span>
           </div>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleVocalClarity">
             <span class="slider-round-sm"></span>
           </label>
         </div>
         <div class="enhancement-row">
           <div class="enhancement-info">
             <span class="enhancement-name">🌙 Night Listening Shield</span>
             <span class="enhancement-desc">Compress sudden explosions & volume spikes</span>
           </div>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleNightShield">
             <span class="slider-round-sm"></span>
           </label>
         </div>
       </div>
     </section>
     ```

2. **Add CSS in `popup/popup.css`:**
   - Add `.audio-card`, `.eq-bands-grid`, `.eq-vertical-slider`, `.boost-range-slider`, `.boost-readout`.
   - Style boost range slider with glowing amber/purple fill when value > 100%.

3. **Wire Logic in `popup/popup.js`:**
   - Handle `#masterBoostSlider` `input` event: update `#masterBoostReadout`, apply dynamic styling, save to storage.
   - Preset curves map:
     - `flat`: [0, 0, 0, 0, 0]
     - `bass_boost`: [6, 4, 1, 0, -1]
     - `vocal_clarify`: [-3, 1, 4, 5, 2]
     - `rock`: [5, 3, -1, 3, 5]
     - `night`: [-4, -2, 2, 1, -3]
   - When `#audioEqPresetSelect` changes, update band sliders, dB readouts, and persist to `audio_lab_settings`.
   - Bind sliders to update preset to "custom" if manually dragged.

---

## 🚫 5. Architectural Constraints & Boundaries
- Sliders must clamp within exact valid numerical ranges (Boost: 0-200, EQ: -12 to 12).
- Zero W3C Trusted Types violations (no `innerHTML` usage).

---

## 📦 6. Deliverables Manifest
- Modified: `popup/popup.html`
- Modified: `popup/popup.css`
- Modified: `popup/popup.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node -c popup/popup.js
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with 100% success and exit code 0.
