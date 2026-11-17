# Phase 1 Execution Prompt: Dedicated Full-Width Volume Row & Controls Auto-Fit Layout

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective
Refactor the Multi-Tab Live Media Deck card layout by:
1. Moving `.deck-volume-slider` out of `.deck-card-controls` into its own dedicated full-width container `.deck-volume-row` positioned directly beneath the scrubber progress row (`.deck-scrubber-row`) and above `.deck-card-controls`.
2. Updating `dashboard/styles/media.css` so that `.deck-volume-row` and `.deck-volume-slider` have 100% width matching the timeline bar.
3. Updating `.deck-card-controls` in `dashboard/styles/media.css` so that the remaining 4 action buttons (`.btn-deck-play`, `.btn-deck-mute`, `.btn-deck-solo`, `.btn-deck-switch-tab`) auto-fit the full card width with balanced spacing (`flex: 1 1 0;`).

---

## 📂 2. Target Files & Anchors
- **JavaScript DOM Builder:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L465-L528)
- **CSS Stylesheet:** [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L988-L1035)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 1.1: Refactor DOM Node Construction in `media_deck_visualizer_feature.js`
In function `renderMultiTabMediaDeck(streamsList, containerEl, options)`:
1. Locate where `volSlider` is created (around line 466):
   ```javascript
   // Volume Slider Row (Full-Width)
   const volumeRow = doc.createElement('div');
   volumeRow.className = 'deck-volume-row';

   const volSlider = doc.createElement('input');
   volSlider.type = 'range';
   volSlider.min = '0';
   volSlider.max = '100';
   // Keep existing event listeners and value calculations...
   volumeRow.appendChild(volSlider);
   ```
2. In `controlsRow`, append ONLY the 4 buttons:
   ```javascript
   controlsRow.appendChild(btnPlayPause);
   controlsRow.appendChild(btnMute);
   controlsRow.appendChild(btnSolo);
   controlsRow.appendChild(btnSwitchTab);
   ```
   *(Do NOT append `volSlider` to `controlsRow`!)*
3. In card assembly, append `volumeRow` between `scrubberRow` and `controlsRow`:
   ```javascript
   card.appendChild(topRow);
   card.appendChild(metaRow);
   card.appendChild(scrubberRow);
   card.appendChild(volumeRow);
   card.appendChild(controlsRow);
   ```

### Step 1.2: Update CSS in `dashboard/styles/media.css`
1. Add `.deck-volume-row` definition:
   ```css
   .deck-volume-row {
     display: flex;
     align-items: center;
     width: 100%;
     margin-top: 4px;
   }
   ```
2. Update `.deck-volume-slider`:
   ```css
   .deck-volume-slider {
     width: 100%;
     height: 4px;
     accent-color: #10b981;
     cursor: pointer;
     background: rgba(255, 255, 255, 0.08);
     border-radius: 2px;
   }
   ```
3. Update `.deck-card-controls` and button auto-fit:
   ```css
   .deck-card-controls {
     display: flex;
     align-items: center;
     justify-content: space-between;
     gap: 6px;
     margin-top: 6px;
     width: 100%;
   }

   .deck-card-controls .btn-deck-ctrl {
     flex: 1 1 0;
     min-width: 0;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     padding: 5px 6px;
     text-align: center;
   }
   ```

---

## 🚫 4. Out-of-Scope Boundaries
- Do NOT alter the card outer container dimensions (`.media-deck-card`).
- Do NOT modify the visualizer canvas or equalizer sections.
- Do NOT use `innerHTML` or any unsafe string concatenation.

---

## 🧪 5. Local Verification Gate
- Verify that `.deck-volume-row` exists in `media_deck_visualizer_feature.js`.
- Verify that `card.appendChild(volumeRow)` precedes `card.appendChild(controlsRow)`.
- Verify that `dashboard/styles/media.css` contains `.deck-volume-row` and `.deck-volume-slider` with `width: 100%`.
- Verify UTF-8 with BOM on all edited files.
