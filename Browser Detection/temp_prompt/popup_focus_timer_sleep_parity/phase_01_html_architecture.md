# Phase 1: HTML Architecture & Controls Structure Specification

> **Phase Identifier:** `PHASE-01-HTML-ARCHITECTURE`  
> **Parent Task:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Target Subagent:** Level 4 Frontend Subagent (`frontend_engineer`)  
> **Target File:** `popup/popup.html`  
> **Lead Department:** Department 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective

Restructure the Focus Block markup in `popup/popup.html` under `#viewFocusPane` to achieve 100% structural feature parity with the Bedtime Sentinel (Sleep Timer) tab:
1. Embed the Target Finish Time element (`#popupFocusDialFinishTime`) inside the radial dial overlay.
2. Upgrade the control buttons into a full Quick Actions Row (`#btnPopupFocusToggle`, `#btnPopupFocusReduce5m`, `#btnPopupFocusExtend5m`, `#btnPopupFocusExtend15m`, `#btnPopupFocusReset`).
3. Add the Duration Presets Card (`#cardFocusPresetsAndCustom`) featuring 6 preset chips (15m, 25m, 30m, 45m, 50m, 60m) and the Custom Duration input form (`#inputFocusCustomMinutes` + `#btnSetFocusCustom`).
4. Maintain 100% backward compatibility for all legacy DOM IDs.

---

## 📍 2. File Anchors & Precise Insertion Points

Target lines: `popup/popup.html` lines ~750 to ~800:
Find existing section `#cardPopupFocusTimer`:
```html
        <!-- Compact Focus Time Sentinel Card (Revamped with Circular Radial Dial) -->
        <div id="cardPopupFocusTimer" class="popup-focus-card">
          ...
```

Replace the inner dial telemetry and action buttons, and insert `#cardFocusPresetsAndCustom` immediately below `#cardPopupFocusTimer` (and before `#focusRatioBarContainer`).

---

## 🛠️ 3. Concrete Surgical Replacement Specification

### 3.1 Dial Telemetry Inner HTML Update
Inside `<div class="popup-focus-dial-content">`:
```html
            <!-- Centered Telemetry Overlay -->
            <div class="popup-focus-dial-content">
              <span id="popupFocusClock" class="popup-focus-clock" aria-live="polite">25:00</span>
              <div id="popupFocusTargetTime" class="popup-focus-target-text">
                <span id="popupFocusDialFinishTime">No active timer</span>
              </div>
              <span id="popupFocusDialState" class="popup-focus-dial-state">Deep Focus</span>
            </div>
```

### 3.2 Quick Actions Row Replacement
Replace `<div class="popup-focus-actions">...</div>` with:
```html
          <!-- Focus Controls Quick Action Row -->
          <div class="popup-focus-quick-actions-row">
            <button type="button" id="btnPopupFocusToggle" class="popup-focus-action-btn primary" title="Start Focus" aria-label="Start Focus">
              <span id="btnPopupFocusToggleIcon">▶</span>
              <span id="btnPopupFocusToggleText">Start</span>
            </button>
            <button type="button" id="btnPopupFocusReduce5m" class="popup-focus-action-btn extend" title="Subtract 5 Minutes" aria-label="Subtract 5 Minutes">
              -5m
            </button>
            <button type="button" id="btnPopupFocusExtend5m" class="popup-focus-action-btn extend" title="Add 5 Minutes" aria-label="Add 5 Minutes">
              +5m
            </button>
            <button type="button" id="btnPopupFocusExtend15m" class="popup-focus-action-btn extend" title="Add 15 Minutes" aria-label="Add 15 Minutes">
              +15m
            </button>
            <button type="button" id="btnPopupFocusReset" class="popup-focus-action-btn reset" title="Reset Timer" aria-label="Reset Timer">
              ✕ Reset
            </button>
          </div>
```

### 3.3 Presets & Custom Duration Card Insertion
Insert immediately after `</div> <!-- /#cardPopupFocusTimer -->`:
```html
        <!-- Presets & Custom Duration Card -->
        <section id="cardFocusPresetsAndCustom" class="focus-section-card">
          <div class="section-micro-header">
            <span class="micro-icon">⏱️</span>
            <span class="micro-heading">DURATION PRESETS</span>
          </div>
          <div class="focus-tab-presets-grid">
            <button type="button" class="focus-tab-preset-btn" data-minutes="15">15m</button>
            <button type="button" class="focus-tab-preset-btn active" data-minutes="25">25m</button>
            <button type="button" class="focus-tab-preset-btn" data-minutes="30">30m</button>
            <button type="button" class="focus-tab-preset-btn" data-minutes="45">45m</button>
            <button type="button" class="focus-tab-preset-btn" data-minutes="50">50m</button>
            <button type="button" class="focus-tab-preset-btn" data-minutes="60">60m</button>
          </div>

          <!-- Custom Minute Input Form -->
          <div class="focus-custom-input-row">
            <label for="inputFocusCustomMinutes" class="focus-custom-label">Custom Duration:</label>
            <div class="focus-custom-input-wrap">
              <input type="number" id="inputFocusCustomMinutes" min="1" max="720" placeholder="Min (1-720)" class="focus-custom-input">
              <button type="button" id="btnSetFocusCustom" class="btn-focus-set-custom">Set</button>
            </div>
          </div>
        </section>
```

---

## 🔒 4. Preserved Elements Verification Checklist
- [x] `#cardPopupFocusTimer` exists
- [x] `#popupFocusBadge` exists
- [x] `#popupActiveGoalChip` & `#txtPopupActiveGoal` exist
- [x] `#popupFocusDialSvg`, `#popupFocusDialProgress`, `#popupFocusClock`, `#popupFocusDialState` exist
- [x] `#btnPopupFocusToggle` exists
- [x] `#btnPopupFocusReset` exists
- [x] `#focusRatioBarContainer` remains untouched below the new card

---

## 🚦 5. Local Verification Gate
Execute syntax check:
```powershell
node -e "const fs = require('fs'); const html = fs.readFileSync('popup/popup.html', 'utf8'); console.log('HTML Valid length:', html.length);"
```
Ensure all required IDs are present in the DOM without duplicate attributes.
