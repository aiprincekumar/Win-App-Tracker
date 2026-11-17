# Phase 2: CSS Refinement & Responsive Bento-Span-6 Layout

> **Phase:** 02  
> **Target Task ID:** `TASK-EQ-PURE-SPLIT-CONTAINERS-001`  
> **Assigned Role:** Level 4 CSS/Design Engineer  
> **Workspace Container:** `temp_prompt/equalizer_pure_split_containers/`  
> **Primary Target:** `dashboard/dashboard.css`  
> **Secondary Target:** `dashboard/styles/audio_lab.css` (if applicable)

---

## 🎯 1. Phase Objective

Refine and update CSS styling in `dashboard/dashboard.css` to accommodate the two pure, independent sibling Bento cards:
1. `#heroAudioEqCard` (`.audio-eq-widget .bento-span-6`)
2. `#heroAudioLabCard` (`.audio-lab-widget .bento-span-6`)

Eliminate obsolete internal split-deck styles (`.audio-eq-split-deck`, `.eq-deck-left-col`, `.eq-deck-right-col`) and establish modern, responsive Bento grid rules ensuring side-by-side display on desktop and clean vertical stacking on tablet and mobile viewports.

---

## 📋 2. Prerequisites & Current CSS Analysis

- In `dashboard/dashboard.css`:
  - Lines ~1023-1039: Media query targeting `.audio-eq-split-deck`, `.eq-deck-left-col`, `.eq-deck-right-col`.
  - Lines ~3808-3840: Styles defining `.audio-eq-split-deck` grid and borders.
- Since the DOM is now split into two standalone cards, the internal split-deck grid and dividing border-right are no longer needed.
- Instead, the Bento grid system naturally places `#heroAudioEqCard` and `#heroAudioLabCard` side by side when both declare `bento-span-6`.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 2.1: Define Dedicated Sibling Bento Card Styles
Add/update the rules for `.audio-eq-widget` and `.audio-lab-widget`:
```css
/* ==========================================================================
   Dedicated Bento Cards: 5-Band Equalizer & Audio Lab (Pure Sibling Cards)
   ========================================================================== */

#heroAudioEqCard,
#heroAudioLabCard,
.audio-eq-widget,
.audio-lab-widget {
  grid-column: span 6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 380px;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease;
}

#heroAudioEqCard:hover,
#heroAudioLabCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12);
}

/* Equalizer Card Internal Padding & Flow */
.audio-eq-widget {
  padding: 20px 22px;
}

/* Audio Lab Card Internal Padding & Flow */
.audio-lab-widget {
  padding: 20px 22px;
}
```

### Step 2.2: Refine Internal Layout Components
Ensure `.eq-bands-grid`, `.audio-boost-control`, and `.audio-enhancements-section` fill their respective cards cleanly:
```css
/* Frequency Slider Region in Standalone Equalizer Card */
.audio-eq-widget .eq-bands-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 8px 8px 8px;
  margin-top: auto;
  min-height: 220px;
}

/* Master Boost Slider & Enhancements in Standalone Audio Lab Card */
.audio-lab-widget .audio-boost-control {
  margin: 16px 0 14px 0;
}

.audio-lab-widget .enhancements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: auto;
}
```

### Step 2.3: Responsive Breakpoints for Tablet & Mobile (<= 1024px)
Update responsive media queries to reflow both cards to full-width when horizontal space is constrained:
```css
@media (max-width: 1024px) {
  #heroAudioEqCard,
  #heroAudioLabCard,
  .audio-eq-widget,
  .audio-lab-widget {
    grid-column: span 12;
    min-height: auto;
  }

  .audio-lab-widget .enhancements-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

### Step 2.4: Clean Up Obsolete CSS
Safely remove or neutralize obsolete references to `.audio-eq-split-deck`, `.eq-deck-left-col`, and `.eq-deck-right-col`.

### Step 2.5: Contrast & Visual Polish Check
- Verify frosted acrylic glass backdrop (`backdrop-filter: blur(16px)`).
- Verify specular highlight borders (`rgba(255, 255, 255, 0.08)` in dark mode, subtle shadow in light mode).
- Ensure WCAG AA compliance across dark, light, midnight, and OLED substrates.

---

## 🛡️ 4. Invariants & Quality Gate

- [ ] `#heroAudioEqCard` and `#heroAudioLabCard` styled as independent `span 6` cards on desktop.
- [ ] Stacking reflow (`span 12`) verified on screens <= 1024px.
- [ ] No residual layout artifacts from `.audio-eq-split-deck`.
- [ ] Specular borders and liquid glass aesthetics preserved.
- [ ] UTF-8 with BOM preserved on all edited files.
- [ ] Local test gate: CSS parses cleanly with zero syntax errors.
