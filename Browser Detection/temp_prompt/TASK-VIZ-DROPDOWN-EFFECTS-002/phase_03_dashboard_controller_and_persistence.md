<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Phase 3 Standalone Execution Prompt

> **Phase Focus:** Dashboard Controller Wiring, Storage Persistence & Localization  
> **Assigned Role:** Level 4 Frontend Engineering Specialist  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Target File:**
> - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)

---

## 🎯 1. Phase Objective

Connect the dashboard controller in `dashboard/dashboard.js` to the dropdown visualizer controls and persistent storage:
1. Wire `change` listener on `#selectVizEffect` to invoke `setVisualizerMode`.
2. Update the visualizer canvas click handler to cycle sequentially through all 6 modes (`bars` -> `wave` -> `radial` -> `matrix_dots` -> `flame` -> `stereo_mirror` -> `bars`).
3. Persist the chosen mode into `chrome.storage.local` (with `localStorage` fallback) under `media_sentinel_viz_effect`, and restore it on dashboard initialization.
4. Add English and Hindi localization entries for the dropdown label and all 6 effects.

---

## 📦 2. Prerequisites & Inputs

1. Completion of Phase 1 and Phase 2.
2. Review localization requirements in [`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/TASK-VIZ-DROPDOWN-EFFECTS-002/PRD.md).

---

## ⚓ 3. Technical Context & File Anchors

### Anchor 1: English & Hindi i18n Dictionaries (`dashboard/dashboard.js`)
- Lines ~236-238 (English dictionary)
- Lines ~657-659 (Hindi dictionary)

### Anchor 2: Facade Function `setVisualizerMode` (`dashboard/dashboard.js`)
- Lines ~2257-2292: `function setVisualizerMode(mode, options = {})`

### Anchor 3: Visualizer Event Binding (`dashboard/dashboard.js`)
- Lines ~7892-7921: Event listeners for buttons and `#canvasAudioVisualizer`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Add Localization Dictionaries in `dashboard/dashboard.js`
In the English dictionary (around line 236), add:
```javascript
visualizer_effect_label: 'Effect:',
viz_effect_bars: '📊 32-Band Spectrum',
viz_effect_wave: '〰️ Oscilloscope Wave',
viz_effect_radial: '⭕ Radial Frequency Burst',
viz_effect_matrix: '⠕ Matrix Digital Dots',
viz_effect_flame: '🔥 Neon Flame Peaks',
viz_effect_stereo: '🦋 Stereo Mirror Butterfly',
```

In the Hindi dictionary (around line 657), add:
```javascript
visualizer_effect_label: 'इफ़ेक्ट:',
viz_effect_bars: '📊 32-बैंड स्पेक्ट्रम',
viz_effect_wave: '〰️ ऑसिलोस्कोप वेव',
viz_effect_radial: '⭕ रेडियल फ़्रीक्वेंसी बर्स्ट',
viz_effect_matrix: '⠕ मैट्रिक्स डिजिटल डॉट्स',
viz_effect_flame: '🔥 नियॉन फ्लेम पीक्स',
viz_effect_stereo: '🦋 स्टीरियो मिरर बटरफ्लाई',
```

### Step 3.2: Update `setVisualizerMode` Facade with Storage Persistence
In `dashboard/dashboard.js` (around line 2257), update `setVisualizerMode`:
```javascript
function setVisualizerMode(mode, options = {}) {
  const opt = Object.assign({ doc: typeof document !== 'undefined' ? document : null }, options);
  const viz = getResolvedVisualizer();
  let res = mode;
  if (viz && typeof viz.setVisualizerMode === 'function') {
    res = viz.setVisualizerMode(mode, opt);
  }
  const doc = opt.doc;
  if (doc) {
    const selectEffect = doc.getElementById('selectVizEffect');
    if (selectEffect && selectEffect.value !== mode) {
      selectEffect.value = mode;
    }
    const btnBars = doc.getElementById('btnVizModeBars');
    const btnWave = doc.getElementById('btnVizModeWave');
    if (btnBars) {
      if (mode === 'bars') {
        btnBars.classList.add('btn-active', 'active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'true');
      } else {
        btnBars.classList.remove('btn-active', 'active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'false');
      }
    }
    if (btnWave) {
      if (mode === 'wave') {
        btnWave.classList.add('btn-active', 'active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'true');
      } else {
        btnWave.classList.remove('btn-active', 'active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'false');
      }
    }
  }

  // Persist preference to chrome.storage.local with localStorage fallback
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ media_sentinel_viz_effect: mode });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('media_sentinel_viz_effect', mode);
    }
  } catch (_) {}

  return res;
}
```

### Step 3.3: Update Visualizer Event Handlers & Persistence Restoration
In `dashboard/dashboard.js` (around lines 7892-7921):
```javascript
  // Visualizer Mode Dropdown Binding
  const selectVizEffect = document.getElementById('selectVizEffect');
  if (selectVizEffect) {
    selectVizEffect.addEventListener('change', (e) => {
      if (e && e.target) {
        setVisualizerMode(e.target.value);
      }
    });
  }

  // Restore Persisted Visualizer Mode on Startup
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['media_sentinel_viz_effect'], (items) => {
        if (items && items.media_sentinel_viz_effect) {
          setVisualizerMode(items.media_sentinel_viz_effect);
        }
      });
    } else if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('media_sentinel_viz_effect');
      if (savedMode) setVisualizerMode(savedMode);
    }
  } catch (_) {}

  // Legacy Button Listeners (Preserved for compatibility)
  const btnVizModeBars = document.getElementById('btnVizModeBars');
  if (btnVizModeBars) {
    btnVizModeBars.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      setVisualizerMode('bars');
    });
  }

  const btnVizModeWave = document.getElementById('btnVizModeWave');
  if (btnVizModeWave) {
    btnVizModeWave.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      setVisualizerMode('wave');
    });
  }

  // Canvas Click-to-Cycle Handler across all 6 effects
  const canvasViz = document.getElementById('canvasAudioVisualizer');
  if (canvasViz) {
    initAudioVisualizer(canvasViz);
    canvasViz.addEventListener('click', () => {
      const viz = getResolvedVisualizer();
      if (viz) {
        const state = viz.getVisualizerState ? viz.getVisualizerState() : null;
        if (state) {
          const VIZ_CYCLE = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];
          const currentIndex = VIZ_CYCLE.indexOf(state.mode);
          const nextIndex = (currentIndex + 1) % VIZ_CYCLE.length;
          setVisualizerMode(VIZ_CYCLE[nextIndex]);
        }
      }
    });
  }
```

### Step 3.4: Verify UTF-8 BOM
Ensure `dashboard/dashboard.js` is written with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries
- DO NOT touch unrelated event listeners or audio filters.
- Maintain 100% W3C Trusted Types compliance (zero `.innerHTML`).

---

## 🏁 6. Local Verification Gate

Execute verification commands:
```bash
node tests/test_visualizer_runtime_wiring.js
node tests/test_dashboard_i18n_bilingual_parity.js
```
**Gate Requirement:** All battery assertions pass with exit code 0.
