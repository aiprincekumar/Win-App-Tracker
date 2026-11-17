# Phase 2: 2x2 Grid Layout & 4th Feature HTML/CSS Refactor

> **Target Phase:** Phase 2 of 4  
> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/phase_02_enhancements_2x2_grid_html_css.md`  
> **Target Files:**  
> - `dashboard/dashboard.html`  
> - `dashboard/dashboard.css`  
> - `dashboard/styles/audio_lab.css`  
> **Lead Role:** Level 4 UI/UX Engineer  

---

## 🎯 1. Phase Objective
Refactor `.enhancements-grid` from a cramped 3-column layout into a balanced 2-column layout (`repeat(2, minmax(0, 1fr))`) and insert the 4th audio DSP feature card ("Sub-Bass Boost / Enhancer") into `dashboard/dashboard.html`, eliminating toggle switch overflow and creating an ergonomic 2x2 grid.

---

## 📥 2. Prerequisites & Input Context
- Current `.enhancements-grid` in `dashboard/dashboard.html` (lines 946-985) contains 3 cards:
  1. Vocal Clarity (`#toggleVocalClarity`)
  2. Night Shield (`#toggleNightShield`)
  3. Audio-Only Mode (`#toggleAudioOnlyMode`)
- Current CSS in `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css`:
  - Sets `grid-template-columns: repeat(3, minmax(0, 1fr));` on `#heroAudioLabCard .enhancements-grid` and `.audio-enhancements-row .enhancements-grid`.

---

## 🔧 3. Surgical Implementation Steps

### Step 2.1: Add 4th Enhancement Card in `dashboard/dashboard.html`
Inside `.enhancements-grid` (around line 970), add the Sub-Bass Boost card directly before or alongside Audio-Only Mode:
```html
                <!-- Sub-Bass Enhancer / Bass Boost -->
                <div class="enhancement-card enhancement-chip">
                  <div class="enhancement-card-header">
                    <span id="lblAudioBassTitle" class="enhancement-title" data-i18n="audiolab_bass_title">🔊 Sub-Bass Boost</span>
                    <label class="switch-toggle" for="toggleBassBoost">
                      <input type="checkbox" id="toggleBassBoost" role="switch" aria-label="Sub-Bass Boost" />
                      <span class="slider-round"></span>
                    </label>
                  </div>
                  <span id="lblAudioBassDesc" class="enhancement-desc" data-i18n="audiolab_bass_desc">Deep low-frequency punch and warm bass enhancement</span>
                </div>
```
Ensure all 4 cards are structured cleanly inside `.enhancements-grid`:
1. Vocal Clarity (`toggleVocalClarity`)
2. Night Shield (`toggleNightShield`)
3. Sub-Bass Boost (`toggleBassBoost`)
4. Audio-Only Mode (`toggleAudioOnlyMode`)

### Step 2.2: Refactor CSS in `dashboard/styles/audio_lab.css`
Update all occurrences of `.enhancements-grid`:
- In `#heroAudioLabCard .enhancements-grid` and `.audio-enhancements-row .enhancements-grid`:
  ```css
  #heroAudioLabCard .enhancements-grid,
  .audio-enhancements-row .enhancements-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  ```
- Ensure card containment:
  ```css
  .enhancement-card.enhancement-chip {
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    border-radius: var(--radius-md, 10px);
    box-sizing: border-box;
    min-width: 0;
    overflow: hidden;
  }

  .enhancement-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .switch-toggle {
    flex-shrink: 0;
    width: 40px;
    height: 22px;
  }
  ```
- Ensure mobile responsiveness (`@media (max-width: 640px)`):
  ```css
  @media (max-width: 640px) {
    #heroAudioLabCard .enhancements-grid,
    .audio-enhancements-row .enhancements-grid,
    .enhancements-grid {
      grid-template-columns: 1fr;
    }
  }
  ```

### Step 2.3: Keep `dashboard/dashboard.css` in Sync
Apply matching grid layout updates in `dashboard/dashboard.css` (lines 1059, 3928, 4360, etc.) to ensure 100% style parity between modular and master stylesheets.

---

## 🚫 4. Architectural Constraints & Boundaries
- DO NOT break theme support (`body.theme-light` card styling).
- DO NOT modify the Equalizer sliders or Master Volume Boost slider.
- Ensure all input IDs and label IDs match specifications exactly (`toggleBassBoost`, `lblAudioBassTitle`, `lblAudioBassDesc`).
- Preserve UTF-8 with BOM encoding.

---

## 📦 5. Deliverables Manifest
- Updated `dashboard/dashboard.html` with 4 enhancement cards.
- Updated `dashboard/styles/audio_lab.css` with 2-column grid and containment CSS.
- Updated `dashboard/dashboard.css` with matching 2-column grid rules.

---

## 🧪 6. Local Verification Gate
Run:
```bash
node -e "const fs = require('fs'); const html = fs.readFileSync('dashboard/dashboard.html', 'utf8'); const css = fs.readFileSync('dashboard/styles/audio_lab.css', 'utf8'); if (!html.includes('id=\"toggleBassBoost\"')) throw new Error('toggleBassBoost missing'); if (!css.includes('repeat(2, minmax(0, 1fr))')) throw new Error('2-column grid missing'); console.log('Phase 2 layout check passed');"
```
Gate criteria: Exit code 0, all 4 toggles present in DOM, CSS specifies `repeat(2, minmax(0, 1fr))`.
