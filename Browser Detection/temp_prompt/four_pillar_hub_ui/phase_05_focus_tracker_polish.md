# Phase 05: Focus & Tracker Polish (Doomscroll Breaker, Ratio Bar & Footer Invariant)

> **Phase:** 05 of 06  
> **Target Path:** `temp_prompt/four_pillar_hub_ui/phase_05_focus_tracker_polish.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Mandatory Anchor:** Load `memory.md`, `dynamic_departments_matrix.md`, and `temp_prompt/four_pillar_hub_ui/INDEX.md` before execution.

---

## 🎯 1. Phase Objective
Enhance Pillar 4: `⏱️ Focus & Tracker` (`#viewTrackingPane`) by adding the Doomscroll Breaker nudge card and the Productive vs Entertainment Focus Ratio Gauge, while rigorously defending all existing analytics views, donut charts, domain breakdown tables, and enforcing the strict single-row footer toolbar layout invariant.

---

## 📋 2. Prerequisites & Inputs
- Phases 01-04 completed.
- Target files: `popup/popup.html`, `popup/popup.css`, `popup/popup.js`.
- Existing verification suite: `tests/test_popup_sqlite_data_hub_sync.js`, `tests/test_tracking_modes_and_audible_bg_media.js`, `tests/test_jump_to_media_tab_and_bottom_toast.js`.

---

## ⚓ 3. Technical Context & File Anchors
- `popup/popup.html#L174-L257`: Inside `#viewTrackingPane`.
- `popup/popup.html#L260-L323`: Inside `<footer class="footer">` (strictly immutable IDs and layout).
- `popup/popup.css#L350-L450`: Tracking view, stats pills, and footer toolbar styling.
- `popup/popup.js#L550-L750`: Domain processing, donut chart rendering, and breakdown list.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Update `popup/popup.html` (`#viewTrackingPane`):**
   - Directly below `.stats-pills` (or above `.breakdown-section`), add `#cardFocusWellness`:
     ```html
     <section id="cardFocusWellness" class="focus-wellness-card">
       <!-- Focus Ratio Balance Bar -->
       <div class="focus-ratio-container">
         <div class="focus-ratio-header">
           <span class="focus-ratio-title">⚖️ Focus Ratio</span>
           <span id="focusRatioText" class="focus-ratio-readout">75% Productive</span>
         </div>
         <div class="ratio-progress-track">
           <div id="focusRatioProductiveBar" class="ratio-bar-productive" style="width: 75%;" title="Productive Browsing"></div>
           <div id="focusRatioEntertainmentBar" class="ratio-bar-entertainment" style="width: 25%;" title="Entertainment / Social Media"></div>
         </div>
         <div class="ratio-labels-row">
           <span class="ratio-lbl prod">🟢 Productive</span>
           <span class="ratio-lbl ent">🟠 Media & Social</span>
         </div>
       </div>

       <!-- Doomscroll Breaker Nudge -->
       <div class="doomscroll-breaker-row">
         <div class="doomscroll-info">
           <span class="doomscroll-title">🛑 Doomscroll Breaker</span>
           <span class="doomscroll-sub">Gentle pause nudge every</span>
         </div>
         <div class="doomscroll-controls">
           <select id="doomscrollIntervalSelect" class="doomscroll-select" aria-label="Nudge Interval">
             <option value="15">15 min</option>
             <option value="30" selected>30 min</option>
             <option value="45">45 min</option>
             <option value="60">60 min</option>
           </select>
           <label class="switch-toggle-sm">
             <input type="checkbox" id="toggleDoomscrollBreaker">
             <span class="slider-round-sm"></span>
           </label>
         </div>
       </div>
     </section>
     ```

2. **Verify & Defend Footer Toolbar in `popup/popup.html`:**
   - Verify that `<footer class="footer">` has EXACTLY the 7 existing buttons:
     1. `#btnRefresh`
     2. `#btnGlobalMediaToggle`
     3. `#btnToggleTrackingPause`
     4. `#btnSleepTimerTrigger`
     5. `#btnReconnectWs`
     6. `#btnSwitchMediaTab`
     7. `#btnOpenDashboard`
   - ZERO additional elements inside footer. Single row must be preserved.

3. **Update `popup/popup.css`:**
   - Add styling for `.focus-wellness-card`, `.ratio-progress-track`, `.ratio-bar-productive`, `.ratio-bar-entertainment`, `.doomscroll-breaker-row`.
   - Enforce `.footer { display: flex; flex-wrap: nowrap; overflow: hidden; }` to prevent any possibility of multi-line wrapping in the 420px container.

4. **Update `popup/popup.js`:**
   - Calculate Productive vs Entertainment time dynamically in `processDomainStats`:
     - Entertainment domains: `youtube.com`, `netflix.com`, `spotify.com`, `twitch.tv`, `twitter.com`, `x.com`, `reddit.com`, `tiktok.com`, `instagram.com`.
     - Update width of `#focusRatioProductiveBar` and `#focusRatioEntertainmentBar` and label `#focusRatioText`.
   - Bind `#toggleDoomscrollBreaker` and `#doomscrollIntervalSelect` to persist in `chrome.storage.local`.

---

## 🚫 5. Architectural Constraints & Boundaries
- NEVER wrap footer buttons into multiple lines.
- NEVER alter existing domain breakdown table rendering (`#domainsListContainer`).
- NEVER break SVG donut chart math in `renderDonutChart`.

---

## 📦 6. Deliverables Manifest
- Modified: `popup/popup.html`
- Modified: `popup/popup.css`
- Modified: `popup/popup.js`

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node tests/test_popup_sqlite_data_hub_sync.js
node tests/test_tracking_modes_and_audible_bg_media.js
node tests/test_jump_to_media_tab_and_bottom_toast.js
```
Must pass with 100% success and exit code 0.
