# Technical Requirements Document (TRD)
# Task: Multi-Tab Live Media Deck UI Refactor & Two-Way Solo Tab Toggle
# Task ID: TASK-MEDIA-DECK-UI-SOLO-TOGGLE-001

> **Document Type:** Technical Requirements Document (`TRD.md`)  
> **Lead System:** Dashboard Visualizer Feature & MV3 Background Service Worker  
> **Security Standards:** 100% W3C Trusted Types & UTF-8 with BOM Encoding

---

## 🏛️ 1. Architectural Architecture & Component Separation

```
[ Dashboard Client ]
 ├── features/media_deck_visualizer_feature.js
 │    ├── renderMultiTabMediaDeck()
 │    │    ├── topRow (.deck-card-top)
 │    │    ├── metaRow (.deck-card-meta)
 │    │    ├── scrubberRow (.deck-scrubber-row)
 │    │    ├── volumeRow (.deck-volume-row)       <-- [NEW FULL-WIDTH CONTAINER]
 │    │    │    └── volSlider (.deck-volume-slider) (100% width)
 │    │    └── controlsRow (.deck-card-controls)   <-- [4 AUTO-FIT BUTTONS ONLY]
 │    │         ├── btnPlayPause (.btn-deck-play)
 │    │         ├── btnMute (.btn-deck-mute)
 │    │         ├── btnSolo (.btn-deck-solo)
 │    │         └── btnSwitchTab (.btn-deck-switch-tab)
 │    └── handleSoloTab(soloTabId, options)
 │         ├── Case 1: soloTabId !== currentSoloTabId -> Activate Solo (Mute others)
 │         └── Case 2: soloTabId === currentSoloTabId -> Deactivate Solo (Unmute all)
 │              └── runtime.sendMessage({ action: 'MEDIA_STREAM_SOLO_CLEAR' })
 └── styles/media.css
      ├── .deck-volume-row (width: 100%; display: flex; align-items: center;)
      ├── .deck-volume-slider (width: 100%; height: 4px; accent-color: #10b981;)
      └── .deck-card-controls > .btn-deck-ctrl (flex: 1 1 0; min-width: 0;)

[ Background Service Worker ]
 └── background.js
      ├── message listener: msgType === 'MEDIA_STREAM_SOLO_CLEAR'
      ├── message listener: msgType === 'MEDIA_STREAM_SOLO' with !soloTabId
      └── handleSoloTabClearExecution() / handleSoloTabExecution(soloTabId)
           ├── tabs.update(tId, { muted: false })
           ├── tabMediaMap.get(tId).primaryMedia.isMuted = false
           ├── safeSendTabMessage(tId, { type: 'MEDIA_CONTROL', action: 'unmute' })
           └── safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE' })
```

---

## 📐 2. DOM Node Hierarchy & Changes Specification

### 2.1 Before Refactor (Legacy Structure)
```html
<div class="media-deck-card liquid-glass-card" data-tab-id="101">
  <div class="deck-card-top">...</div>
  <div class="deck-card-meta">...</div>
  <div class="deck-scrubber-row">
    <div class="deck-mini-scrubber">...</div>
    <span class="deck-time-display">0:45 / 3:30</span>
  </div>
  <div class="deck-card-controls">
    <button class="btn-deck-ctrl btn-deck-play">▶</button>
    <button class="btn-deck-ctrl btn-deck-mute">🔊</button>
    <input type="range" class="deck-volume-slider" style="width: 55px;" /> <!-- CRAMPED -->
    <button class="btn-deck-ctrl btn-deck-solo">🎧 Solo Tab</button>
    <button class="btn-deck-ctrl btn-deck-switch-tab">🎯 Switch Tab</button>
  </div>
</div>
```

### 2.2 After Refactor (Target Structure)
```html
<div class="media-deck-card liquid-glass-card" data-tab-id="101">
  <div class="deck-card-top">...</div>
  <div class="deck-card-meta">...</div>
  <div class="deck-scrubber-row">
    <div class="deck-mini-scrubber">...</div>
    <span class="deck-time-display">0:45 / 3:30</span>
  </div>
  <!-- NEW DEDICATED FULL-WIDTH VOLUME ROW -->
  <div class="deck-volume-row">
    <input type="range" class="deck-volume-slider" min="0" max="100" value="80" aria-label="Volume: 80%" />
  </div>
  <!-- CLEAN 4-BUTTON CONTROLS ROW -->
  <div class="deck-card-controls">
    <button class="btn-deck-ctrl btn-deck-play">▶</button>
    <button class="btn-deck-ctrl btn-deck-mute">🔊</button>
    <button class="btn-deck-ctrl btn-deck-solo">🎧 Solo Tab</button>
    <button class="btn-deck-ctrl btn-deck-switch-tab">🎯 Switch Tab</button>
  </div>
</div>
```

---

## 🎨 3. CSS Layout Specifications (`dashboard/styles/media.css`)

### 3.1 `.deck-volume-row` & `.deck-volume-slider`
```css
.deck-volume-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 4px;
  padding: 0 1px;
}

.deck-volume-slider {
  width: 100%;
  height: 4px;
  accent-color: #10b981;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  transition: opacity 0.2s ease;
}

.deck-volume-slider:hover {
  opacity: 1;
}
```

### 3.2 `.deck-card-controls` & Auto-Fitting Children
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

## 🔌 4. IPC Message Contract (`DASHBOARD` <-> `BACKGROUND`)

### 4.1 Solo Mode Toggle Off / Clear Message
- **Action:** `MEDIA_STREAM_SOLO_CLEAR`
- **Payload Schema:**
```json
{
  "action": "MEDIA_STREAM_SOLO_CLEAR"
}
```
*Note: Also support `{ action: 'MEDIA_STREAM_SOLO', soloTabId: null }` for backwards compatibility.*

### 4.2 Background Service Worker Response Schema
```json
{
  "success": true,
  "cleared": true,
  "soloTabId": null,
  "unmutedCount": 3
}
```

---

## 🛡️ 5. Security & Trusted Types Compliance
1. All DOM creations in `renderMultiTabMediaDeck` must use `doc.createElement('div')` or `doc.createElement('input')`.
2. Attributes must be applied via `setAttribute` or direct property assignment (e.g. `volSlider.className = 'deck-volume-slider'`).
3. Zero tolerance for `innerHTML`, `outerHTML`, or template literals parsed via `innerHTML`.
4. Character encoding standard: UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
