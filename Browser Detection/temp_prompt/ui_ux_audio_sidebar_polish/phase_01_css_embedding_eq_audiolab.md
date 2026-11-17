# Phase 1 Instruction Set: Direct CSS Linking, 5-Band Studio Equalizer & Audio Lab Styling, and Settings Tactile Haptics

> **Phase:** 1 of 3  
> **Target Subagent Role:** Level 4 Frontend Engineer  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Phase Prompt File:** `temp_prompt/ui_ux_audio_sidebar_polish/phase_01_css_embedding_eq_audiolab.md`  
> **Lead Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Autonomy Score:** 1.0 (Autonomous Execution)  

---

## 🎯 1. Phase Objective

The objective of Phase 1 is to establish a high-performance, non-blocking CSS resource loading pipeline in `dashboard/dashboard.html` by directly embedding all modular stylesheets in strict topological order, and to elevate the visual styling of the 5-Band Graphic Equalizer, Audio Lab DSP Telemetry deck, and the Settings Tactile Audio Haptics controls to Liquid Glass 2.0 studio standards.

---

## 📋 2. Prerequisites & Required Inputs

- Active working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`.
- Target files:
  1. [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)
  2. [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
  3. [`dashboard/styles/audio_lab.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/audio_lab.css)
  4. [`dashboard/styles/settings.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/settings.css)
- Reference specifications:
  - [`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/PRD.md)
  - [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/TRD.md)
  - [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_audio_sidebar_polish/DESIGN.md)

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 1.1: Direct Topological CSS Embedding in `dashboard/dashboard.html`
In `dashboard/dashboard.html`, locate the `<head>` section (lines 3-10):

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Web Activity & Media Sentinel</title>
  <link rel="stylesheet" href="dashboard.css">
  <link rel="stylesheet" href="styles/wellbeing_blacklist.css">
  <link rel="icon" type="image/png" href="../icons/icon32.png">
</head>
```

Replace lines 7-8 with the complete topological `<link rel="stylesheet">` sequence, ensuring foundational tokens, themes, layout, components, and domain sheets precede `dashboard.css`:

```html
  <!-- Design Tokens, Themes & Palettes (Foundational CSS Variables) -->
  <link rel="stylesheet" href="styles/tokens.css">
  <link rel="stylesheet" href="styles/themes.css">
  <link rel="stylesheet" href="styles/palette.css">

  <!-- Core Layout & Common Component Frameworks -->
  <link rel="stylesheet" href="styles/layout.css">
  <link rel="stylesheet" href="styles/layout/header_sidebar.css">
  <link rel="stylesheet" href="styles/layout/bento_grid.css">
  <link rel="stylesheet" href="styles/layout/responsive.css">
  <link rel="stylesheet" href="styles/components.css">

  <!-- Domain-Specific Modular Feature Stylesheets -->
  <link rel="stylesheet" href="styles/metrics.css">
  <link rel="stylesheet" href="styles/tracking.css">
  <link rel="stylesheet" href="styles/media.css">
  <link rel="stylesheet" href="styles/media/hero_player.css">
  <link rel="stylesheet" href="styles/media/scrubber_controls.css">
  <link rel="stylesheet" href="styles/audio_lab.css">
  <link rel="stylesheet" href="styles/settings.css">
  <link rel="stylesheet" href="styles/hotkeys.css">
  <link rel="stylesheet" href="styles/backup_digest.css">
  <link rel="stylesheet" href="styles/wellbeing_blacklist.css">

  <!-- Master Stylesheet (Global Aggregation & Root Overrides) -->
  <link rel="stylesheet" href="dashboard.css">
```

### Step 1.2: 5-Band Equalizer Studio Deck Polish in `dashboard/styles/audio_lab.css` & `dashboard/dashboard.css`
Audit and enhance the CSS rules for `#heroAudioEqCard` and `.audio-eq-widget` in `dashboard/styles/audio_lab.css` (and mirror in `dashboard/dashboard.css`):
1. **Vertical Slider Appearance (`.eq-vertical-slider`):**
   ```css
   .eq-vertical-slider {
     -webkit-appearance: slider-vertical;
     appearance: slider-vertical;
     writing-mode: vertical-lr;
     direction: rtl;
     width: 32px;
     height: 180px;
     margin: 0 auto;
     cursor: pointer;
     background: transparent;
     accent-color: var(--accent-emerald, #10b981);
     touch-action: none;
     transition: filter 0.2s ease;
   }
   .eq-vertical-slider:focus-visible {
     outline: 2px solid var(--accent-emerald, #10b981);
     outline-offset: 4px;
     border-radius: 4px;
   }
   .eq-vertical-slider::-webkit-slider-runnable-track {
     width: 8px;
     background: rgba(255, 255, 255, 0.08);
     border-radius: 4px;
     border: 1px solid rgba(255, 255, 255, 0.05);
   }
   body.theme-light .eq-vertical-slider::-webkit-slider-runnable-track {
     background: rgba(0, 0, 0, 0.08);
     border-color: rgba(0, 0, 0, 0.05);
   }
   .eq-vertical-slider::-webkit-slider-thumb {
     -webkit-appearance: none;
     appearance: none;
     width: 26px;
     height: 14px;
     border-radius: 4px;
     background: var(--accent-emerald, #10b981);
     border: 1px solid rgba(255, 255, 255, 0.5);
     box-shadow: 0 0 10px rgba(16, 185, 129, 0.65), 0 2px 4px rgba(0, 0, 0, 0.5);
     cursor: pointer;
     transition: transform 0.15s ease, box-shadow 0.15s ease;
   }
   .eq-vertical-slider::-webkit-slider-thumb:hover {
     transform: scale(1.15);
     box-shadow: 0 0 16px rgba(16, 185, 129, 0.9), 0 0 4px #fff;
   }
   ```
2. **0dB Horizon Detent Line (`.eq-bands-grid::before`):**
   ```css
   .eq-bands-grid::before {
     content: '';
     position: absolute;
     top: 50%;
     left: 2rem;
     right: 2rem;
     height: 1px;
     background: linear-gradient(
       90deg,
       transparent 0%,
       rgba(16, 185, 129, 0.4) 20%,
       rgba(16, 185, 129, 0.4) 80%,
       transparent 100%
     );
     pointer-events: none;
     z-index: 1;
   }
   ```
3. **Decibel Value Badge (`.eq-db-val`):**
   ```css
   .eq-db-val {
     font-family: var(--mono-font, 'JetBrains Mono', monospace);
     font-size: 0.85rem;
     font-weight: 700;
     font-variant-numeric: tabular-nums;
     color: var(--accent-emerald, #10b981);
     min-width: 46px;
     text-align: center;
     padding: 0.25rem 0.5rem;
     border-radius: 6px;
     background: rgba(16, 185, 129, 0.1);
     border: 1px solid rgba(16, 185, 129, 0.25);
     box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
     transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
   }
   ```

### Step 1.3: Audio Lab DSP Telemetry & Master Boost Slider Polish
1. Polish `.audio-lab-widget` and `#heroAudioBoostSlider` in `dashboard/styles/audio_lab.css`.
2. Ensure master boost scale marks (`0%`, `50%`, `100% (Normal)`, `150%`, `200% (Max)`) have sharp, readable labels and highlight `.mark-normal` in emerald and `.mark-max` in amber.
3. Verify toggle switches (`#toggleVocalClarity`, `#toggleNightMode`, `#toggleAudioOnlyMode`) retain clean styling with high contrast.

### Step 1.4: Settings Tactile Audio Haptics Styling in `dashboard/styles/settings.css` & `dashboard/dashboard.css`
In `dashboard/styles/settings.css`, add dedicated styling for Card 1.8 Tactile Audio Feedback controls:

```css
/* ========================================================================= */
/* TACTILE AUDIO HAPTICS CONTROLS (Card 1.8 in #paneSettings)                */
/* ========================================================================= */
.haptic-volume-control {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  max-width: 380px;
}

.styled-range-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

body.theme-light .styled-range-slider {
  background: rgba(0, 0, 0, 0.1);
}

.styled-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-cyan, #06b6d4);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.styled-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.18);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.9), 0 0 4px #fff;
}

.styled-range-slider:focus-visible {
  outline: 2px solid var(--accent-cyan, #06b6d4);
  outline-offset: 4px;
}

.volume-badge {
  font-family: var(--mono-font, 'JetBrains Mono', monospace);
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-cyan, #06b6d4);
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  min-width: 44px;
  text-align: center;
}

.btn-test-chime {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-specular-border, rgba(255, 255, 255, 0.12));
  color: var(--text-primary, #f8fafc);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
}

body.theme-light .btn-test-chime {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.12);
  color: var(--text-primary, #0f172a);
}

.btn-test-chime:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: var(--accent-cyan, #06b6d4);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
}

.btn-test-chime:active {
  transform: scale(0.96);
}
```

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **Strict Invariant:** Do NOT alter any DOM IDs or event names (`#heroAudioEqCard`, `#eqBand60`..`#eqBand16000`, `#toggleAudioHaptics`, `#sliderAudioHapticsVolume`, `#btnTestAudioHaptics`).
- **Strict Invariant:** Do NOT modify `dashboard/dashboard.js` or JavaScript event handlers in this phase.
- **Strict Invariant:** Ensure all edited CSS files maintain valid syntax and encoding (UTF-8 with BOM).

---

## 📦 5. Deliverables Manifest

- `dashboard/dashboard.html`: Updated `<head>` with direct modular CSS links.
- `dashboard/styles/audio_lab.css`: Studio-grade 5-Band Equalizer and Audio Lab telemetry styles.
- `dashboard/styles/settings.css`: Tactile audio feedback haptics slider, badge, and test chime button styles.
- `dashboard/dashboard.css`: Master override parity reflecting modular enhancements.

---

## 🚦 6. Local Verification Gate

Execute the following verification steps before marking Phase 1 complete:
1. **HTML Link Verification:** Confirm `dashboard/dashboard.html` contains 18 modular `<link rel="stylesheet">` tags in strict topological order.
2. **CSS Syntax Check:** Validate that all modified CSS files parse cleanly with zero syntax errors.
3. **Audio Lab Test Suite:** Run `node tests/test_dashboard_full_audio_lab_parity.js` to certify all 5-band slider contracts, telemetry badges, and accessibility attributes pass 100% clean.
