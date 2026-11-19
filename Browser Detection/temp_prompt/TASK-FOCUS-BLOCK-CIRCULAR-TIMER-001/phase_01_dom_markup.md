<!-- UTF-8 with BOM -->
# TASK-FOCUS-BLOCK-CIRCULAR-TIMER-001: Phase 1 Standalone Execution Prompt

> **Phase Identifier:** `PHASE-01-DOM-MARKUP`  
> **Target Subagent Role:** Level 4 Frontend Engineering Specialist  
> **Target Workspaces & Files:**  
> - Primary Target: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.html`  
> - Reference Pattern: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.html` (lines 586-608 `#cardSleepHeroRing`)  
> **Prerequisites:** Level 2 Manager Authorization Token (`AUTH-MGR-*`)  
> **Verification Gate:** `node tests/test_focus_time_phase1_uiux.js` (100% PASS, Exit Code 0)

---

## 🎯 1. Phase Objective

Transform the DOM markup of `#cardPopupFocusTimer` in `popup/popup.html` from a basic rectangular text box into a sleep-timer-style circular countdown hero dial. The updated markup must embed an SVG dial with background track and depleting meter ring while strictly preserving all existing legacy IDs and element relationships to prevent any regression in existing automated tests.

---

## 📂 2. File Anchors & Context

- **Target File:** `popup/popup.html`
- **Location Anchor:** Lines ~752 to ~770 (inside `<div id="viewFocusPane">` -> `<section id="cardFocusWellness">`).
- **Current HTML Fragment:**
```html
        <!-- Compact Focus Time Sentinel Card -->
        <div id="cardPopupFocusTimer" class="popup-focus-card">
          <div class="popup-focus-header">
            <span class="popup-focus-title">🧘 Focus Block</span>
            <span id="popupFocusBadge" class="popup-focus-badge idle">25m</span>
          </div>
          <div id="popupActiveGoalChip" class="popup-goal-chip hidden">
            <span class="popup-goal-icon">🎯</span>
            <span id="txtPopupActiveGoal" class="popup-goal-text">Deep Work</span>
          </div>
          <div class="popup-focus-body">
            <span id="popupFocusClock" class="popup-focus-clock">25:00</span>
            <div class="popup-focus-actions">
              <button type="button" id="btnPopupFocusToggle" class="popup-focus-btn primary" title="Start Focus">▶️</button>
              <button type="button" id="btnPopupFocusReset" class="popup-focus-btn secondary" title="Reset Timer">🔄</button>
            </div>
          </div>
        </div>
```

---

## 🔨 3. Surgical Implementation Instructions

Replace the inner contents of `<div id="cardPopupFocusTimer" class="popup-focus-card">` with the following modern SVG circular dial markup:

```html
        <!-- Compact Focus Time Sentinel Card (Revamped with Circular Radial Dial) -->
        <div id="cardPopupFocusTimer" class="popup-focus-card">
          <div class="popup-focus-header">
            <span class="popup-focus-title">🧘 Focus Block</span>
            <span id="popupFocusBadge" class="popup-focus-badge idle">25m</span>
          </div>
          <div id="popupActiveGoalChip" class="popup-goal-chip hidden">
            <span class="popup-goal-icon">🎯</span>
            <span id="txtPopupActiveGoal" class="popup-goal-text">Deep Work</span>
          </div>
          
          <!-- Center Radial SVG Countdown Dial (Sleep-Timer Style) -->
          <div class="popup-focus-dial-wrapper">
            <svg id="popupFocusDialSvg" class="popup-focus-svg-dial" viewBox="0 0 140 140" width="130" height="130" role="img" aria-label="Focus Countdown Radial Dial">
              <defs>
                <linearGradient id="focusGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="50%" stop-color="#06b6d4" />
                  <stop offset="100%" stop-color="#3b82f6" />
                </linearGradient>
                <linearGradient id="breakGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#fbbf24" />
                </linearGradient>
              </defs>
              <!-- Background Track Ring -->
              <circle class="popup-focus-dial-track" cx="70" cy="70" r="54" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="7" />
              <!-- Progress Glow Ring -->
              <circle id="popupFocusDialProgress" class="popup-focus-dial-progress" cx="70" cy="70" r="54" fill="none" 
                      stroke="url(#focusGlowGradient)" stroke-width="7" stroke-linecap="round" 
                      stroke-dasharray="339.292" stroke-dashoffset="0" transform="rotate(-90 70 70)" />
            </svg>
            <!-- Centered Telemetry Overlay -->
            <div class="popup-focus-dial-content">
              <span id="popupFocusClock" class="popup-focus-clock" aria-live="polite">25:00</span>
              <span id="popupFocusDialState" class="popup-focus-dial-state">Deep Focus</span>
            </div>
          </div>

          <!-- Focus Controls Action Row -->
          <div class="popup-focus-actions">
            <button type="button" id="btnPopupFocusToggle" class="popup-focus-btn primary" title="Start Focus">▶️</button>
            <button type="button" id="btnPopupFocusReset" class="popup-focus-btn secondary" title="Reset Timer">🔄</button>
          </div>
        </div>
```

---

## 🛡️ 4. Constitutional Constraints & Boundaries

1. **Non-Negotiable ID Retention Checklist:**
   - Must contain: `id="cardPopupFocusTimer"`
   - Must contain: `id="popupFocusBadge"`
   - Must contain: `id="popupActiveGoalChip"`
   - Must contain: `id="txtPopupActiveGoal"`
   - Must contain: `id="popupFocusClock"`
   - Must contain: `id="btnPopupFocusToggle"`
   - Must contain: `id="btnPopupFocusReset"`
2. **Preserved Structural Ancestry:**
   - `#cardPopupFocusTimer` must remain direct child of `#cardFocusWellness`, which resides in `#viewFocusPane`.
3. **Encoding & BOM Invariant:**
   - Save file strictly with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
4. **Out of Scope for Phase 1:**
   - Do NOT edit `popup.css` or `popup.js` in this phase (delegated to Phase 2 and 3).

---

## 🚦 5. Deliverables & Verification Gate

- **Deliverable:** Updated `popup/popup.html`.
- **Local Verification Command:**
  ```powershell
  node tests/test_focus_time_phase1_uiux.js
  ```
- **Acceptance Criteria:**
  - Battery 4: Popup Focus Time Mini-Controller must output:
    `✅ Popup Focus Mini-Timer Controller markup verified`
  - Battery 7: 8 User-Approved Enhanced Focus Features must output:
    `✅ All 8 user-approved enhanced Focus features verified across HTML, JS, CSS, and Popup`
  - Exit code must be 0.
