# Phase 2: Dual-Mode Switcher Header & 16:9 Responsive Deck Container

> **Phase:** 02 of 05  
> **Target Subsystem:** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/styles/layout/media_deck.css`  
> **Associated Feature:** Universal Embedded Video Player Deck  
> **Lead Department:** Dept 04 UI/UX Design System & Dept 05 Frontend Engineering  
> **Prerequisites:** Phase 1 complete, existing `#heroAudioLabStatus` card structure  
> **Gate Verification:** HTML DOM parser check + CSS aspect ratio & layout validation  

---

## 🎯 1. Phase Objective

The objective of Phase 2 is to construct the dual-mode presentation architecture within `#heroAudioLabStatus`. This introduces the header segmented pill toggle (`[ 🎛️ Audio Visualizer ]` vs `[ 🎬 Embedded Video Deck ]`), the responsive 16:9 fluid viewport container (`#embeddedVideoDeckContainer`), and the liquid glass empty/idle launchpad with a direct URL paste input and quick-launch platform chips.

---

## 📂 2. File Anchors & Prerequisites

- **Markup File to Update:**
  - [`dashboard/dashboard.html#L725-L776`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L725-L776) (`#heroAudioLabStatus` header & body)
- **Style Files to Update:**
  - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
  - [`dashboard/styles/layout/media_deck.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout/media_deck.css)
- **Visualizer Feature Invariance Anchor:**
  - [`src/dashboard/features/media_deck_visualizer_feature.js#L1000-L1033`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L1000-L1033)

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 2.1: Update Header Markup in `dashboard/dashboard.html`
In `#heroAudioLabStatus` header ([`dashboard/dashboard.html#L727-L736`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L727-L736)):
1. Preserve `#txtVisualizerTitle` for backward-compatibility.
2. Inject `#deckModeSwitcherGroup` containing two accessible tab buttons:
   - `#btnModeVisualizer` (`data-mode="visualizer"`, `aria-selected="true"`, `.active`)
   - `#btnModeEmbeddedDeck` (`data-mode="embedded_deck"`, `aria-selected="false"`)
3. Inject `#btnDeckTheaterToggle` in the top right utility area (`title="Toggle Theater Mode"`, `aria-label="Toggle Theater Mode"`).

### Step 2.2: Add Sibling Container `#embeddedVideoDeckContainer` in Card Body
Immediately following `#visualizerPanel` ([`dashboard/dashboard.html#L774`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L774)):
```html
<!-- Feature 4B: Universal Embedded Video Player Deck -->
<div id="embeddedVideoDeckContainer" class="embedded-video-deck-container hidden" role="region" aria-label="Embedded Video Player Deck">
  <!-- Empty / Launchpad State -->
  <div id="deckEmptyState" class="deck-empty-state">
    <div class="deck-url-bar-wrapper">
      <span class="deck-url-icon">🔗</span>
      <input type="url" 
             id="inputDeckVideoUrl" 
             class="form-control glass-input deck-url-input" 
             placeholder="Paste YouTube, Vimeo, Twitch, or MP4 URL..." 
             aria-label="Video URL to embed" />
      <button type="button" id="btnDeckPasteUrl" class="btn btn-sm btn-glass" title="Paste from clipboard" aria-label="Paste URL">📋</button>
      <button type="button" id="btnDeckLoadVideo" class="btn btn-sm btn-primary deck-load-btn" data-i18n="deck_btn_load">Load Video</button>
    </div>
    
    <div class="deck-quick-chips">
      <span class="chips-label">Supported Platforms:</span>
      <button type="button" class="btn-chip" data-platform="youtube">🔴 YouTube</button>
      <button type="button" class="btn-chip" data-platform="twitch">🟣 Twitch</button>
      <button type="button" class="btn-chip" data-platform="vimeo">🔷 Vimeo</button>
      <button type="button" class="btn-chip" data-platform="direct">🟢 Direct MP4</button>
    </div>

    <!-- Active Media Stream Quick-Embed Banner -->
    <div id="deckActiveStreamBanner" class="deck-active-stream-banner hidden">
      <span class="banner-pulse-dot"></span>
      <span id="deckActiveStreamTitle" class="banner-title">Live media detected in active tab</span>
      <button type="button" id="btnDeckEmbedActiveTab" class="btn btn-xs btn-accent">Embed Stream</button>
    </div>
  </div>

  <!-- Active Viewport Container -->
  <div id="deckViewportWrapper" class="embedded-deck-viewport hidden">
    <!-- Sandboxed iframe or HTML5 video dynamically mounted here via DOM createElement -->
  </div>
</div>
```

### Step 2.3: Author Liquid Glass Styling in `dashboard.css`
1. Define `.deck-mode-switcher-group` segmented pill style with backdrop filter and active gradient border.
2. Define `.embedded-deck-viewport` with strict `aspect-ratio: 16 / 9`, `border-radius: 12px`, and overflow hidden.
3. Define `.deck-theater-mode` on `#heroAudioLabStatus` setting `grid-column: 1 / -1` (`bento-span-12`) with smooth cubic-bezier transitions.
4. Ensure dark mode, high contrast, and focus outline `:focus-visible` styles pass WCAG 2.1 AA.

---

## 🚫 4. Architectural Boundaries & Constraints

- **Strict Non-Destruction:** `#visualizerPanel`, `#canvasAudioVisualizer`, `#selectVizEffect`, and VU meter elements must NOT be deleted. They remain fully present in the DOM.
- **Zero Raw HTML Injection:** Never construct or inject DOM elements using string template concatenation into `innerHTML`.
- **CSS Isolation:** Scoped classes (`.embedded-video-deck-container`, `.deck-mode-tab-btn`) must not conflict with global layout selectors.

---

## 📦 5. Deliverables Manifest

1. Updated `dashboard/dashboard.html` with dual-mode header and deck container markup.
2. Updated `dashboard/dashboard.css` and `dashboard/styles/layout/media_deck.css` with responsive liquid glass styles.
3. `tests/test_deck_container_dom.js` validating canonical IDs and ARIA attributes.

---

## 🚦 6. Local Verification Gate

Execute the following commands to certify completion of Phase 2:
```bash
# 1. Validate HTML structure & canonical IDs
node tests/test_deck_container_dom.js

# 2. Check for syntax errors in updated CSS
node -e "const fs = require('fs'); const css = fs.readFileSync('dashboard/dashboard.css', 'utf8'); console.log('CSS length:', css.length);"
```
*Gate Success Condition: Test passes with all canonical IDs verified and zero parsing errors.*
