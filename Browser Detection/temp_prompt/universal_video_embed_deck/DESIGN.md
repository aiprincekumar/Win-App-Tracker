# Design System & UI Specifications: Universal Embedded Video Player Deck

> **Document Type:** UI/UX Specification & Semantic Design Tokens  
> **Module Path:** `temp_prompt/universal_video_embed_deck/DESIGN.md`  
> **Aesthetic Philosophy:** Liquid Glass, Calibrated Contrast, Zero-Latency Responsive 16:9 Deck  
> **Lead Department:** Dept 04 UI/UX Design System  
> **Accessibility Compliance:** WCAG 2.1 AA / AAA Target  

---

## 🎨 1. Liquid Glass Design Tokens & Surfaces

The Embedded Video Player Deck conforms strictly to the existing **Liquid Glass Design System** established in `dashboard/styles/`. It utilizes multi-layered backdrop blurs, subtle specular border reflections, and tactile responsive micro-interactions.

### 1.1 CSS Custom Properties
```css
:root {
  /* Deck Surface Tokens */
  --deck-surface-bg: rgba(15, 23, 42, 0.72);
  --deck-surface-border: rgba(255, 255, 255, 0.08);
  --deck-surface-border-hover: rgba(56, 189, 248, 0.35);
  --deck-surface-blur: blur(16px);
  --deck-surface-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Switcher Pill Tokens */
  --switcher-bg: rgba(30, 41, 59, 0.65);
  --switcher-pill-active: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25));
  --switcher-pill-border: rgba(56, 189, 248, 0.45);
  --switcher-text-active: #38bdf8;
  --switcher-text-inactive: #94a3b8;

  /* Interactive Controls & Badges */
  --badge-live-bg: rgba(239, 68, 68, 0.2);
  --badge-live-text: #f87171;
  --badge-live-border: rgba(239, 68, 68, 0.4);
  
  --badge-provider-yt: #ef4444;
  --badge-provider-vm: #06b6d4;
  --badge-provider-tw: #a855f7;
  --badge-provider-direct: #10b981;
}
```

---

## 📐 2. Layout, Aspect Ratio & Responsive Grid

### 2.1 16:9 Fluid Responsive Aspect Ratio
The video iframe container must maintain a pristine 16:9 aspect ratio across all display resolutions and window resize events without letterboxing or distortion:
```css
.embedded-deck-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 480px;
  min-height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background: #020617;
  border: 1px solid var(--deck-surface-border);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.embedded-deck-viewport iframe,
.embedded-deck-viewport video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  outline: none;
}
```

### 2.2 Bento Card Expansion: Theater Mode
When theater mode is engaged:
- The parent card (`#heroAudioLabStatus`) transitions from its default `bento-span-4` / `bento-span-6` to `bento-span-12` (full width).
- Fluid CSS transition: `transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);`.
- The aspect ratio container smoothly scales up to maximum allowed viewport height (`max-height: 720px`).
- A subtle neon glow accentuates the card perimeter: `box-shadow: 0 0 30px rgba(56, 189, 248, 0.15);`.

---

## 🎛️ 3. Header Mode Switcher Component

In the card header ([`dashboard/dashboard.html#L727-L736`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L727-L736)), the title area is upgraded with a modern segmented pill switcher:

```html
<div class="deck-mode-switcher-group" role="tablist" aria-label="Media Station Mode">
  <button type="button" 
          id="btnModeVisualizer" 
          class="deck-mode-tab-btn active" 
          role="tab" 
          aria-selected="true" 
          aria-controls="visualizerPanel"
          data-i18n="deck_mode_visualizer">
    <span class="mode-icon">🎛️</span>
    <span class="mode-label">Visualizer</span>
  </button>
  <button type="button" 
          id="btnModeEmbeddedDeck" 
          class="deck-mode-tab-btn" 
          role="tab" 
          aria-selected="false" 
          aria-controls="embeddedVideoDeckContainer"
          data-i18n="deck_mode_embed_player">
    <span class="mode-icon">🎬</span>
    <span class="mode-label">Video Deck</span>
  </button>
</div>
```

---

## 🪟 4. Empty / Idle State UI Specification

When no stream is actively mounted, the deck presents an elegant, zero-clutter launchpad:

1. **Ambient Glass Background:** Subtle dark radial gradient with animated pulse ring.
2. **Universal URL Input Bar:**
   - Input field: Glass background, placeholder: *"Paste YouTube, Vimeo, Twitch, or MP4 URL..."*.
   - Paste Button: One-click clipboard paste icon (`📋`).
   - "Load Stream" Primary Action Button: Emerald accent (`#10b981`).
3. **Platform Quick-Select Chips:**
   - Small interactive pill chips: `[ 🔴 YouTube ]`, `[ 🟣 Twitch ]`, `[ 🔷 Vimeo ]`, `[ 🟢 Direct MP4 ]`.
   - Clicking a chip pre-populates a sample stream or opens platform docs.
4. **Active Stream Sniffer Card (Conditional):**
   - If background telemetry detects an active media tab (e.g. YouTube playing in Tab #42), display a glowing banner:
     *"▶️ Live stream detected in YouTube tab: 'Deep Work Radio' — [ Embed in Deck ]"*.

---

## ♿ 5. Accessibility (WCAG 2.1 AA / AAA Compliance)

- **Keyboard Focusability:** All buttons and interactive pills have visible, non-obscured focus rings:
  `outline: 2px solid #38bdf8; outline-offset: 2px;`.
- **Keyboard Traversal:** Left/Right Arrow keys navigate between Visualizer and Video Deck tabs. Enter or Space triggers mode selection.
- **Screen Reader Announcements:** ARIA live regions announce state transitions:
  `aria-live="polite"` on status messages (e.g., *"Embedded video loaded: YouTube"*).
- **Contrast Ratios:** Text colors guarantee minimum 4.5:1 contrast against dark glass surfaces:
  - Active text (`#38bdf8`) on `#0f172a` = **8.2:1 (Exceeds AAA)**.
  - Secondary text (`#94a3b8`) on `#0f172a` = **5.4:1 (Exceeds AA)**.
