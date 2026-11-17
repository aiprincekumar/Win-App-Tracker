# Phase 02: CSS Sleep Tab Styling & 7-Tab Symmetrical Grid

> **Task ID:** `TASK-POPUP-SLEEP-TAB-001`  
> **Phase:** `02 of 05`  
> **Target Files:**
> - `popup/styles/tabs/tab_sleep.css` (NEW)
> - `popup/styles/tabs.css`
> - `popup/popup.css`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Local Test Gate:** `node tests/test_syntax_and_manifest_integrity.js`  

---

## 🎯 1. Phase Objective

The objective of Phase 02 is to:
1. Create a granular modular stylesheet `popup/styles/tabs/tab_sleep.css` (with mandatory UTF-8 BOM `0xEF, 0xBB, 0xBF`).
2. Register `@import './tabs/tab_sleep.css';` in `popup/styles/tabs.css`.
3. Update `.top-nav-tabs` in both `popup/styles/tabs.css` and `popup/popup.css` to support 7 symmetrical tabs:
   - `grid-template-columns: repeat(7, 1fr);`
   - Preserve legacy fallback comment `/* grid-template-columns: repeat(4, 1fr); */` and `/* grid-template-columns: repeat(6, 1fr); */`.
   - Tune padding to `5px 1px`, gap to `2px`, and font-size to `9.5px` - `10px` for optimal 380px geometry fit.
4. Define the active gradient theme for `[data-view="sleep"].active` in indigo/violet glow.
5. Provide complete styling for `#cardSleepHeroRing`, `#sleepDialSvg`, centered countdown text, `.sleep-action-btn.extend`, preset pills, and toggles.

---

## 📋 2. Prerequisites & Inputs

- Specifications:
  - [`DESIGN.md`](DESIGN.md) (Sections 1, 2, 3, 4)
  - [`TRD.md`](TRD.md) (Section 2 & 3)
- Target files:
  - `popup/styles/tabs/tab_sleep.css` (to create)
  - `popup/styles/tabs.css` (to edit)
  - `popup/popup.css` (to edit)

---

## 🔍 3. Technical Context & File Anchors

1. **`popup/styles/tabs.css` Imports Anchor (lines 8-14):**
   ```css
   @import './tabs/tab_activity.css';
   @import './tabs/tab_media.css';
   @import './tabs/tab_analytics.css';
   @import './tabs/tab_automations.css';
   @import './tabs/tab_wellness.css';
   @import './tabs/tab_audio_lab.css';
   ```
   *Target edit:* Add `@import './tabs/tab_sleep.css';` right after `tab_audio_lab.css`.

2. **`popup/styles/tabs.css` & `popup/popup.css` Grid Anchor:**
   ```css
   .top-nav-tabs {
     display: grid;
     /* Legacy 4-column fallback for backwards compatibility */
     /* grid-template-columns: repeat(4, 1fr); */
     grid-template-columns: repeat(6, 1fr);
     gap: 3px;
   ```
   *Target edit:* Update to:
   ```css
   .top-nav-tabs {
     display: grid;
     /* Legacy fallback comments for backwards compatibility */
     /* grid-template-columns: repeat(4, 1fr); */
     /* grid-template-columns: repeat(6, 1fr); */
     grid-template-columns: repeat(7, 1fr);
     gap: 2px;
   ```

3. **Active Glow Gradients in `popup/popup.css` (approx lines 560-600):**
   Add `.top-tab-btn[data-view="sleep"].active` gradient rules for dark mode and light mode.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Create `popup/styles/tabs/tab_sleep.css`
Create the file with UTF-8 BOM containing the following modular styling:
```css
/**
 * Sentinel Web Activity & Media Sentinel - Tab 7: Sleep Timer & Bedtime Automation
 * File: popup/styles/tabs/tab_sleep.css
 * Radial Bedtime Dial, SVG Math Ring, Quick Extenders (+5m/+15m) & Sleep Automations
 */

/* ==========================================================================
   Tab 7: Dedicated Sleep View Pane
   ========================================================================== */
#viewSleepPane {
  display: none;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

#viewSleepPane.active {
  display: flex;
}

/* ==========================================================================
   1. Radial Bedtime Dial Hero Card
   ========================================================================== */
.sleep-hero-card {
  background: rgba(18, 24, 38, 0.75);
  border: 1px solid rgba(129, 140, 248, 0.22);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.sleep-hero-card::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 60px;
  background: radial-gradient(ellipse, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.sleep-hero-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sleep-hero-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sleep-moon-icon {
  font-size: 14px;
}

.sleep-hero-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #c7d2fe;
  text-transform: uppercase;
}

.sleep-status-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.sleep-status-badge.idle {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.sleep-status-badge.running {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(129, 140, 248, 0.4);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

.sleep-status-badge.fading {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.4);
  animation: pulse 1.5s infinite;
}

/* ==========================================================================
   Center Radial Bedtime SVG Dial
   ========================================================================== */
.sleep-dial-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0 10px 0;
}

.sleep-dial-svg {
  width: 140px;
  height: 140px;
  transform: rotate(0deg);
}

.sleep-dial-bg {
  stroke: rgba(255, 255, 255, 0.08);
}

.sleep-dial-meter {
  transition: stroke-dashoffset 0.35s ease, stroke 0.3s ease;
}

.sleep-dial-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.sleep-countdown-text {
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.sleep-target-text {
  font-size: 10px;
  font-weight: 500;
  color: #a5b4fc;
  margin-top: 3px;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==========================================================================
   Quick Action Buttons Row
   ========================================================================== */
.sleep-quick-actions-row {
  display: flex;
  gap: 6px;
  width: 100%;
  justify-content: center;
  margin-top: 2px;
}

.sleep-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 28px;
}

.sleep-action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #ffffff;
  flex: 1.2;
}

.sleep-action-btn.primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.sleep-action-btn.extend {
  background: rgba(139, 92, 246, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #ddd6fe;
  flex: 0.9;
}

.sleep-action-btn.extend:hover {
  background: rgba(139, 92, 246, 0.28);
  color: #ffffff;
  border-color: rgba(168, 85, 247, 0.6);
}

.sleep-action-btn.reset {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  flex: 1;
}

.sleep-action-btn.reset:hover {
  background: rgba(239, 68, 68, 0.22);
  color: #fee2e2;
}

/* ==========================================================================
   2. Presets & Custom Duration Section Cards
   ========================================================================== */
.sleep-section-card {
  background: rgba(18, 24, 38, 0.65);
  border: 1px solid var(--border-dim);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(8px);
}

.section-micro-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

.micro-icon {
  font-size: 11px;
}

.micro-heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text-dim);
  text-transform: uppercase;
}

.sleep-tab-presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.sleep-tab-preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 0;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: center;
}

.sleep-tab-preset-btn:hover {
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(129, 140, 248, 0.4);
  color: #ffffff;
}

.sleep-tab-preset-btn.active {
  background: rgba(99, 102, 241, 0.3);
  border-color: #818cf8;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

.sleep-custom-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
}

.sleep-custom-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.sleep-custom-input-wrap {
  display: flex;
  gap: 4px;
  align-items: center;
}

.sleep-custom-input {
  width: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-dim);
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  padding: 4px 6px;
  text-align: center;
}

.sleep-custom-input:focus {
  outline: none;
  border-color: #818cf8;
}

.btn-sleep-set-custom {
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(129, 140, 248, 0.4);
  color: #e0e7ff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-sleep-set-custom:hover {
  background: rgba(99, 102, 241, 0.4);
  color: #ffffff;
}

/* ==========================================================================
   3. Sleep Automations Toggles
   ========================================================================== */
.sleep-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 3px 0;
}

.sleep-toggle-info {
  display: flex;
  flex-direction: column;
}

.sleep-toggle-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
}

.sleep-toggle-sub {
  font-size: 9.5px;
  color: var(--text-dim);
}
```

### Step 2: Register `@import` in `popup/styles/tabs.css`
In `popup/styles/tabs.css`:
```css
@import './tabs/tab_activity.css';
@import './tabs/tab_media.css';
@import './tabs/tab_analytics.css';
@import './tabs/tab_automations.css';
@import './tabs/tab_wellness.css';
@import './tabs/tab_audio_lab.css';
@import './tabs/tab_sleep.css';
```

### Step 3: Update `.top-nav-tabs` in `popup/styles/tabs.css` and `popup/popup.css`
Update grid to 7 columns while keeping backward-compatible comments:
```css
.top-nav-tabs {
  display: grid;
  /* Legacy 4-column fallback for backwards compatibility */
  /* grid-template-columns: repeat(4, 1fr); */
  /* grid-template-columns: repeat(6, 1fr); */
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: rgba(255, 255, 255, 0.035);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  width: 100%;
  box-sizing: border-box;
}

.top-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 9.8px;
  font-weight: 600;
  padding: 5px 1px;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Step 4: Add Sleep Active Glow to `popup/popup.css`
```css
.top-tab-btn[data-view="sleep"].active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.28) 100%);
  border-color: rgba(168, 85, 247, 0.5);
  color: #e0e7ff;
  box-shadow: 0 0 10px rgba(129, 140, 248, 0.35);
}

[data-theme="light"] .top-tab-btn[data-view="sleep"].active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-color: rgba(99, 102, 241, 0.4);
  color: #4338ca;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.2);
}
```

---

## ⚠️ 5. Architectural Constraints & Boundaries

- **UTF-8 BOM:** File `popup/styles/tabs/tab_sleep.css` MUST have UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
- **Preserve Fallbacks:** Comments `/* grid-template-columns: repeat(4, 1fr); */` and `/* grid-template-columns: repeat(6, 1fr); */` must not be deleted.
- **Pure CSS:** No JavaScript logic or HTML modifications in this phase.

---

## 📦 6. Deliverables Manifest

- `popup/styles/tabs/tab_sleep.css`: Created with UTF-8 BOM.
- `popup/styles/tabs.css`: `@import` and 7-column grid updated.
- `popup/popup.css`: 7-column grid and `.active` sleep styles appended.

---

## 🧪 7. Local Verification Gate

Execute in PowerShell:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with exit code 0.
