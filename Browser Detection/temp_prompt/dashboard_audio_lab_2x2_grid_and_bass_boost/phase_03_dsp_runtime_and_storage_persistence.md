# Phase 3: Web Audio DSP Runtime, Storage Persistence & i18n

> **Target Phase:** Phase 3 of 4  
> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/phase_03_dsp_runtime_and_storage_persistence.md`  
> **Target Files:**  
> - `src/inject/audio/web_audio_dsp.js`  
> - `src/dashboard/audio/audio_lab_controller.js`  
> - `dashboard/dashboard.js`  
> - `src/core/i18n.js`  
> **Lead Role:** Level 4 Audio DSP & Systems Engineer  

---

## 🎯 1. Phase Objective
Integrate the 4th DSP feature ("Sub-Bass Boost") into the offscreen Web Audio DSP pipeline, configure `chrome.storage.local` persistence, wire DOM event handlers in the dashboard controller, and provide complete bilingual English and Hindi localization.

---

## 📥 2. Prerequisites & Input Context
- `dashboard/dashboard.html` now contains `#toggleBassBoost`, `#lblAudioBassTitle`, and `#lblAudioBassDesc` (from Phase 2).
- `src/inject/audio/web_audio_dsp.js` manages Web Audio nodes (`GainNode`, `BiquadFilterNode` for 5 bands, `DynamicsCompressorNode`).
- `src/dashboard/audio/audio_lab_controller.js` coordinates settings dispatch and UI synchronization.

---

## 🔧 3. Surgical Implementation Steps

### Step 3.1: Implement Sub-Bass Filter Math in `src/inject/audio/web_audio_dsp.js`
In `src/inject/audio/web_audio_dsp.js`:
1. In `currentAudioSettings`:
   ```javascript
   let currentAudioSettings = {
     master_boost: 100,
     eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
     vocal_clarity: false,
     night_shield: false,
     bass_boost: false
   };
   ```
2. In `applyAudioLabSettings(settings)`:
   Handle `bass_boost` on `eqFilters[60]`:
   ```javascript
   if (currentAudioSettings.bass_boost) {
     if (eqFilters[60] && eqFilters[60].gain) {
       const base60 = (currentAudioSettings.eq_bands && Number(currentAudioSettings.eq_bands['60'])) || 0;
       // Add +7dB low-shelf bass boost, clamped to +12dB
       const targetGain = Math.min(12, base60 + 7);
       eqFilters[60].gain.setValueAtTime(targetGain, now);
     }
   }
   ```
   If both `bass_boost` and `vocal_clarity` are active:
   Notice that `vocal_clarity` applies `base60 - 4`. If `bass_boost` is processed after or combined:
   ```javascript
   if (currentAudioSettings.bass_boost) {
     if (eqFilters[60] && eqFilters[60].gain) {
       const base60 = (currentAudioSettings.eq_bands && Number(currentAudioSettings.eq_bands['60'])) || 0;
       const vocalOffset = currentAudioSettings.vocal_clarity ? -4 : 0;
       const targetGain = Math.max(-12, Math.min(12, base60 + 7 + vocalOffset));
       eqFilters[60].gain.setValueAtTime(targetGain, now);
     }
   }
   ```

### Step 3.2: Update `src/dashboard/audio/audio_lab_controller.js`
1. Update `DEFAULT_AUDIO_LAB_SETTINGS`:
   ```javascript
   const DEFAULT_AUDIO_LAB_SETTINGS = Object.freeze({
     master_boost: 100,
     audio_only: false,
     eq_preset: 'flat',
     eq_bands: { '60': 0, '250': 0, '1000': 0, '4000': 0, '16000': 0 },
     vocal_clarity: false,
     night_shield: false,
     bass_boost: false
   });
   ```
2. In `updateDashboardAudioLabUI`:
   ```javascript
   const isBass = Boolean(merged.bass_boost);
   const toggleBass = documentObj.getElementById('toggleBassBoost');
   if (toggleBass && toggleBass.checked !== isBass) {
     toggleBass.checked = isBass;
   }
   ```

### Step 3.3: Wire Event Listeners & i18n in `dashboard/dashboard.js`
1. In `dashboard/dashboard.js` inside `initAudioLabControls`:
   ```javascript
   const toggleBass = document.getElementById('toggleBassBoost');
   if (toggleBass) {
     toggleBass.addEventListener('change', (e) => {
       const isChecked = Boolean(e.target.checked);
       if (typeof persistDashboardAudioLabSettings === 'function') {
         persistDashboardAudioLabSettings({ bass_boost: isChecked });
       }
     });
   }
   ```
2. In the English dictionary (`en`):
   ```javascript
   audiolab_bass_title: '🔊 Sub-Bass Boost',
   audiolab_bass_desc: 'Deep low-frequency punch and warm bass enhancement',
   ```
3. In the Hindi dictionary (`hi`):
   ```javascript
   audiolab_bass_title: '🔊 सब-बास बूस्ट',
   audiolab_bass_desc: 'गहरा बेस व लो-फ़्रीक्वेंसी पंच उभारें',
   ```
4. In `applyLanguage` / i18n updater:
   Ensure `lblAudioBassTitle` and `lblAudioBassDesc` are translated via `setTxt` or `data-i18n` traversal.

### Step 3.4: Synchronize `src/core/i18n.js`
Add `audiolab_bass_title` and `audiolab_bass_desc` to `src/core/i18n.js` dictionaries for both English and Hindi.

---

## 🚫 4. Architectural Constraints & Boundaries
- DO NOT disrupt existing equalizer slider drag updates or presets.
- Clamping must strictly respect `-12dB` to `+12dB` range.
- Must operate seamlessly with Chrome extensions MV3 offscreen and content script sandboxes.
- Preserve UTF-8 with BOM encoding.

---

## 📦 5. Deliverables Manifest
- Updated `src/inject/audio/web_audio_dsp.js`
- Updated `src/dashboard/audio/audio_lab_controller.js`
- Updated `dashboard/dashboard.js`
- Updated `src/core/i18n.js`

---

## 🧪 6. Local Verification Gate
Run:
```bash
node -e "const WebAudioDSP = require('./src/inject/audio/web_audio_dsp.js'); console.log('WebAudioDSP settings:', WebAudioDSP.getSettings());"
node tests/test_dashboard_i18n_bilingual_parity.js
```
Gate criteria: Exit code 0, `bass_boost` present in DSP default settings, i18n parity 100% clean.
