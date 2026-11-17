# Phase 1: Header Status Badge Refinement

> **Target Phase:** Phase 1 of 4  
> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/phase_01_header_badge_refinement.md`  
> **Target Files:**  
> - `dashboard/dashboard.html`  
> - `dashboard/dashboard.js`  
> - `src/dashboard/audio/audio_lab_controller.js`  
> **Lead Role:** Level 4 Frontend Engineer  

---

## 🎯 1. Phase Objective
Remove the duplicate and redundant "Flat" status badge (`#audioLabPresetBadge`) from the Audio Lab header in `dashboard/dashboard.html`, while updating JavaScript controller files to safely handle its absence without throwing runtime null pointer exceptions.

---

## 📥 2. Prerequisites & Input Context
- `dashboard/dashboard.html` (lines 919-923):
  ```html
  <div class="audio-lab-badges">
    <span id="audioLabPresetBadge" class="badge badge-preset">Flat</span>
    <span id="audioLabVocalBadge" class="badge badge-feature">Vocal: OFF</span>
    <span id="audioLabNightBadge" class="badge badge-feature">Night: OFF</span>
  </div>
  ```
- Notice that EQ preset state is already displayed inside the Equalizer card (in `#audioEqPresetSelect` and `#heroAudioEqCard`).

---

## 🔧 3. Surgical Implementation Steps

### Step 1.1: Refactor `dashboard/dashboard.html`
In `dashboard/dashboard.html` around line 919-923:
- Remove `<span id="audioLabPresetBadge" class="badge badge-preset">Flat</span>`.
- The `.audio-lab-badges` container should now contain only:
  ```html
  <div class="audio-lab-badges">
    <span id="audioLabVocalBadge" class="badge badge-feature">Vocal: OFF</span>
    <span id="audioLabNightBadge" class="badge badge-feature">Night: OFF</span>
  </div>
  ```

### Step 1.2: Add Null Safety in `dashboard/dashboard.js`
In `dashboard/dashboard.js`:
- Search for `audioLabPresetBadge` lookups (e.g. lines 1943, 8443, 8470, 8490).
- Ensure any assignment to `presetBadge.textContent` or `presetBadge.classList` is guarded with `if (presetBadge) { ... }`.

### Step 1.3: Add Null Safety in `src/dashboard/audio/audio_lab_controller.js`
In `src/dashboard/audio/audio_lab_controller.js` around line 116-120:
- Verify that `presetBadge` lookup is already guarded or ensure:
  ```javascript
  const presetBadge = documentObj.getElementById('audioLabPresetBadge');
  if (presetBadge) {
    presetBadge.textContent = preset.charAt(0).toUpperCase() + preset.slice(1).replace('_', ' ');
  }
  ```

---

## 🚫 4. Architectural Constraints & Boundaries
- DO NOT touch or alter `#audioLabVocalBadge` or `#audioLabNightBadge`.
- DO NOT alter the `#audioEqPresetSelect` dropdown or equalizer sliders in this phase.
- Ensure 100% W3C Trusted Types compliance (zero `innerHTML` usage).
- Preserve UTF-8 with BOM encoding on all edited files.

---

## 📦 5. Deliverables Manifest
- Modified `dashboard/dashboard.html`
- Modified `dashboard/dashboard.js`
- Modified `src/dashboard/audio/audio_lab_controller.js`

---

## 🧪 6. Local Verification Gate
Run:
```bash
node -e "const fs = require('fs'); const html = fs.readFileSync('dashboard/dashboard.html', 'utf8'); if (html.includes('id=\"audioLabPresetBadge\"')) throw new Error('audioLabPresetBadge still present in html'); console.log('Phase 1 HTML check passed');"
node tests/test_header_status_badges.js
```
Gate criteria: Exit code 0, `#audioLabPresetBadge` completely absent from HTML, zero runtime errors.
