# Phase 4: Synthesized Audio Haptics, Dynamic Multi-Theme Engine & Full Regression
## Standalone Executable Phase Instruction Specification

> **Phase Identifier:** `PHASE-04-AUDIO-HAPTICS-WCAG-AND-FULL-REGRESSION`  
> **Subsystems Implemented:** System 6 (Dynamic Multi-Theme Engine), System 7 (Synthesized Audio Haptics), WCAG 2.1 AAA Audit, Bilingual Integration & Full Regression  
> **Target Files:** `dashboard/dashboard.js`, `dashboard/dashboard.css`, `dashboard/dashboard.html`, `tests/`  
> **Test Gate:** `tests/test_dashboard_uiux_phase4.js` + Full Workspace Regression (All Tests Green)  
> **Assigned Role:** Level 4 Full-Stack / QA Verification Engineer  
> **Authorization Prerequisite:** Phase 3 Certified Clean + Active `AUTH-MGR-*` token  

---

## 🎯 1. Phase Objective

Implement a zero-asset mathematical Web Audio synthesizer (`SentinelHapticAudioEngine`) producing procedural micro-ticks, clicks, and harmonic chimes. Add 4 base substrate themes and 5 dynamic accent color palettes with 16ms CSS Custom Property injection. Complete the WCAG 2.1 AAA high-contrast audit and certify 100% full regression pass across all workspace test suites.

---

## 📋 2. Prerequisites & Inputs

1. **Prior Phase Deliverables:**
   - Phases 1, 2, and 3 certified Grade A+ clean.
2. **Technical Specifications:**
   - Web Audio formulas and parameters in [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_uiux_enhancement/TRD.md) Section 7.
   - Theme substrates and accent tokens in [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_uiux_enhancement/DESIGN.md) Section 2.
   - Bilingual dictionary in [`dashboard_ui_ux_enhancement_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_enhancement_prompt.md) Section 9 (`DASHBOARD_UIUX_I18N`).

---

## 🔍 3. Technical Context & File Anchors

- **`dashboard/dashboard.js`:**
  - Implement `SentinelHapticAudioEngine` class.
  - Implement `MultiThemeEngine` class with `applyTheme(themeKey, accentKey)`.
  - Integrate bilingual `DASHBOARD_UIUX_I18N` strings into language switcher.
  - Expose `window.sentinelHaptics` globally.
- **`dashboard/dashboard.html`:**
  - Add Theme Substrate and Accent Picker controls to Settings tab.
  - Add Tactile Audio toggle and volume slider to Settings tab.
- **`dashboard/dashboard.css`:**
  - Add theme variables for `midnight-oled`, `slate-navy`, `nordic-pine`, `studio-light`.
  - Add accent variables for `emerald`, `cyan`, `violet`, `rose`, `amber`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Implement `SentinelHapticAudioEngine` in `dashboard.js`
```javascript
class SentinelHapticAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = 0.15; // 15% subtle volume
    this.loadPreferences();
  }

  loadPreferences() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['audioHapticsConfig'], (result) => {
        if (result && result.audioHapticsConfig) {
          this.enabled = result.audioHapticsConfig.enabled ?? true;
          this.masterGain = result.audioHapticsConfig.volume ?? 0.15;
        }
      });
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.masterGain * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.006);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.007);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.masterGain * 0.7, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.012);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.013);
  }

  playSuccessChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.04));
      gain.gain.setValueAtTime(this.masterGain, now + (idx * 0.04));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.04) + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (idx * 0.04));
      osc.stop(now + (idx * 0.04) + 0.23);
    });
  }
}
window.sentinelHaptics = new SentinelHapticAudioEngine();
```

### Step 2: Implement Dynamic Multi-Theme Engine
In `dashboard.js`:
```javascript
const SUBSTRATE_THEMES = {
  'midnight-oled': { '--bg-primary': '#000000', '--bg-secondary': '#0a0d14', '--glass-surface-bg': 'rgba(10, 13, 20, 0.82)' },
  'slate-navy':    { '--bg-primary': '#0f172a', '--bg-secondary': '#1e293b', '--glass-surface-bg': 'rgba(18, 24, 38, 0.72)' },
  'nordic-pine':   { '--bg-primary': '#091811', '--bg-secondary': '#122a20', '--glass-surface-bg': 'rgba(18, 42, 32, 0.76)' },
  'studio-light':  { '--bg-primary': '#f8fafc', '--bg-secondary': '#ffffff', '--glass-surface-bg': 'rgba(255, 255, 255, 0.85)' }
};

const ACCENT_PALETTES = {
  'emerald': { '--color-accent-primary': '#10b981', '--color-accent-hover': '#059669', '--shadow-specular-glow': 'rgba(16, 185, 129, 0.20)' },
  'cyan':    { '--color-accent-primary': '#06b6d4', '--color-accent-hover': '#0891b2', '--shadow-specular-glow': 'rgba(6, 182, 212, 0.20)' },
  'violet':  { '--color-accent-primary': '#8b5cf6', '--color-accent-hover': '#7c3aed', '--shadow-specular-glow': 'rgba(139, 92, 246, 0.20)' },
  'rose':    { '--color-accent-primary': '#f43f5e', '--color-accent-hover': '#e11d48', '--shadow-specular-glow': 'rgba(244, 63, 94, 0.20)' },
  'amber':   { '--color-accent-primary': '#f59e0b', '--color-accent-hover': '#d97706', '--shadow-specular-glow': 'rgba(245, 158, 11, 0.20)' }
};

function applyCustomTheme(themeKey, accentKey) {
  const root = document.documentElement;
  const themeVars = SUBSTRATE_THEMES[themeKey] || SUBSTRATE_THEMES['slate-navy'];
  const accentVars = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES['emerald'];

  Object.entries({ ...themeVars, ...accentVars }).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ userThemePreferences: { theme: themeKey, accent: accentKey } });
  }
}
```

### Step 3: Add Theme & Audio Controls in Settings Tab (`dashboard.html`)
- Add radio pills for 4 Base Themes: Midnight OLED, Deep Slate, Nordic Pine, Studio Light.
- Add circular color swatches for 5 Accents: Cyber Emerald, Electric Cyan, Royal Violet, Neon Rose, Solar Amber.
- Add Tactile Audio toggle checkbox `#toggleAudioHaptics` and volume slider `#sliderAudioHapticsVolume`.

### Step 4: Integrate Bilingual Dictionary (`DASHBOARD_UIUX_I18N`)
Integrate all bilingual strings for themes, command palette, and audio haptics into the global language switch function in `dashboard.js`.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero External Media Files:** All audio sounds MUST be synthesized mathematically using Web Audio API nodes. No `.mp3`, `.ogg`, or `.wav` network fetches.
- **Strict Backward Compatibility:** All existing 30 test suites covering sleep timers, media bridge, telemetry, and parity MUST continue to pass with 0 regressions.

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.js`: `SentinelHapticAudioEngine`, `applyCustomTheme`, and `DASHBOARD_UIUX_I18N`.
2. `dashboard/dashboard.html`: Theme & Audio Haptic settings controls.
3. `dashboard/dashboard.css`: Substrate and accent color CSS variables.
4. `tests/test_dashboard_uiux_phase4.js`: Test runner verifying audio oscillator nodes, theme variable injection, and WCAG AAA contrast ratios.

---

## 🧪 7. Local Verification Gate & Full Regression

Execute the Phase 4 test suite and all workspace test suites:
```bash
node tests/test_dashboard_uiux_phase4.js
```
Full Regression Gate:
- All 30 existing test suites + 4 new UI/UX test suites must pass 100% clean with exit code 0.
- `gitleaks detect --redact` must pass with 0 secrets found.
- `memory.md` must be updated with the completed milestone.
