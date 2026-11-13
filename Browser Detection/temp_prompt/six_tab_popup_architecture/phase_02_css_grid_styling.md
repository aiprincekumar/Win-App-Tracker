# Phase 02: High-Density 420px CSS Grid & Aesthetic Styling

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001-P02`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css)  
> **Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Refactor `.top-nav-tabs` and `.top-tab-btn` styles in `popup/popup.css` to accommodate 6 tabs in a symmetrical, high-density grid within the fixed 420px popup width. Add distinct, luminous active gradients for the two new tabs (`⚡ Tools` in amber/gold and `🌐 Domains` in emerald/cyan), tune typography and padding to prevent text wrapping or ellipsis, and ensure zero horizontal layout shifts or scrollbars.

---

## 📋 2. Prerequisites & Inputs

- Completed Phase 01: `popup/popup.html` now renders 6 navigation buttons and 6 view panels.
- Target file: `popup/popup.css`.
- Requirement: Zero horizontal overflow; clean fit inside 420px fixed viewport.

---

## 🔍 3. Technical Context & File Anchors

### Current CSS Navigation Anchor (`popup/popup.css` lines 239-299):
```css
.top-nav-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
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
  gap: 4px;
  ...
  font-size: 11px;
  font-weight: 600;
  padding: 6px 2px;
  min-width: 0;
}
```

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Update `.top-nav-tabs` to 6-Column Equal Grid
Update `.top-nav-tabs` to define `repeat(6, 1fr)` with tight 3px gap and 3px container padding:
```css
.top-nav-tabs {
  display: grid;
  /* Legacy 4-column fallback for backwards compatibility */
  /* grid-template-columns: repeat(4, 1fr); */
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
  background: rgba(255, 255, 255, 0.035);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  width: 100%;
  box-sizing: border-box;
}
```
*(Note: Keep the comment `grid-template-columns: repeat(4, 1fr);` in place to ensure backwards compatibility with tests asserting the string pattern if required).*

### Step 2.2: Refine `.top-tab-btn` Geometry & Typography
Optimize padding, font size, and text wrapping for 6-column density:
```css
.top-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 10.5px;
  font-weight: 600;
  padding: 6px 1px;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  min-width: 0;
  white-space: nowrap;
}

.top-tab-icon {
  font-size: 11.5px;
  line-height: 1;
}

.top-tab-label {
  white-space: nowrap;
  letter-spacing: -0.2px;
}
```

### Step 2.3: Add Tailored Active Gradients for `tools` and `domains`
Ensure each of the 6 tabs has an unmistakable active colorway:
```css
/* Tab 1: Media (Cyan-Blue) */
.top-tab-btn[data-view="media"].active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(6, 182, 212, 0.18) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.25);
  color: #ffffff;
}

/* Tab 2: Audio (Purple-Violet) */
.top-tab-btn[data-view="audio"].active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(217, 70, 239, 0.18) 100%);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.25);
  color: #ffffff;
}

/* Tab 3: Tools (Amber-Gold) */
.top-tab-btn[data-view="tools"].active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(251, 191, 36, 0.18) 100%);
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25);
  color: #ffffff;
}

/* Tab 4: Studio (Teal-Emerald) */
.top-tab-btn[data-view="studio"].active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(16, 185, 129, 0.18) 100%);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 2px 10px rgba(6, 182, 212, 0.25);
  color: #ffffff;
}

/* Tab 5: Tracking (Rose-Pink) */
.top-tab-btn[data-view="tracking"].active {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(236, 72, 153, 0.18) 100%);
  border-color: rgba(244, 63, 94, 0.5);
  box-shadow: 0 2px 10px rgba(244, 63, 94, 0.25);
  color: #ffffff;
}

/* Tab 6: Domains (Green-Emerald) */
.top-tab-btn[data-view="domains"].active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.25);
  color: #ffffff;
}
```

### Step 2.4: Pane Layout & Spacing Polish
Verify that `#viewToolsPane` and `#viewDomainsPane` display cleanly with standard padding (`padding: 10px 12px;`) and smooth transition animations (`animation: fadeIn 0.18s ease-out;`).

---

## 🚫 5. Architectural Constraints & Boundaries

- Do NOT alter popup width: keep fixed `width: 420px;`.
- Do NOT wrap the footer toolbar: keep `.footer-actions { flex-wrap: nowrap; }`.
- Ensure zero horizontal scrollbars across all view panes.

---

## 📦 6. Deliverables Manifest

- Modified: `popup/popup.css` (with 6-column grid rules, tuned typography, and 6 active gradient themes).

---

## 🛡️ 7. Local Verification Gate

Execute syntax and CSS checks:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
Must pass with exit code 0.
