# Phase 02: CSS 2-Tier Segmented Control & Theme Parity

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Phase:** 02 of 04  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File(s):**  
> - [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css) (Lines ~565-625, ~3570-3600)  
> **Assigned Role:** Level 4 Execution Subagent (Frontend Engineer)  
> **Status:** `PENDING_AUTHORIZATION`

---

## 🎯 1. Phase Objective
The objective of Phase 02 is to engineer the visual styling, dynamic filtering transitions, and theme parity for the 2-Tier navigation system:
1. Style the `#tier1SegmentedNav` container as an ultra-sleek, low-profile segmented pill bar fitting comfortably within the 420px popup width.
2. Upgrade `.top-nav-tabs` from a rigid 7-column grid to a dynamic, flexible container where only unhidden child tabs take up horizontal space equally.
3. Define the `.tab-hidden` rule (`display: none !important;`) to cleanly conceal non-active category tabs without layout shift.
4. Scale up child tab touch targets: when displaying 2 or 3 tabs, buttons expand naturally (~130px to ~195px) with comfortable padding and crisp 11px typography.
5. Provide comprehensive Light Theme (`[data-theme="light"]`) and High Contrast (`body.high-contrast-mode`) variables ensuring WCAG 2.1 AA compliance (4.5:1 minimum contrast ratio).

---

## 📦 2. Prerequisites & Dependencies
- Successful completion and verification of Phase 01:
  - `#tier1SegmentedNav` and 4 `.tier1-nav-btn` elements exist in `popup/popup.html`.
  - 7 child tabs in `.top-nav-tabs` possess `data-group` attributes.

---

## 🔍 3. Technical Context & File Anchors
- In [`popup/popup.css#L570-L585`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css#L570-L585), `.top-nav-tabs` currently uses:
  ```css
  grid-template-columns: repeat(7, 1fr);
  ```
  This divides 420px minus padding into 7 narrow columns (~56px each).
- In [`popup/popup.css#L586-L618`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css#L586-L618), `.top-tab-btn` has `font-size: 9.8px; padding: 5px 1px;`.
- In [`popup/popup.css#L3572-L3595`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css#L3572-L3595), Light mode overrides exist under `[data-theme="light"] .top-nav-tabs`.

---

## 🛠️ 4. Step-by-Step Surgical Instructions

### Step 1: Add Tier 1 Segmented Control Styles in `popup/popup.css`
Directly above `.top-nav-tabs` in `popup/popup.css`, add the styles for `#tier1SegmentedNav` and `.tier1-nav-btn`:

```css
/* ==========================================================================
   Tier 1: Top-Tier Category Segmented Navigation (Pill Architecture)
   ========================================================================== */
.tier1-segmented-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  background: rgba(255, 255, 255, 0.04);
  padding: 3px;
  border-radius: 9px;
  border: 1px solid var(--border-dim, rgba(255, 255, 255, 0.08));
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
}

.tier1-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--text-secondary, #94a3b8);
  font-size: 10.5px;
  font-weight: 600;
  padding: 5px 2px;
  cursor: pointer;
  transition: all 0.18s ease;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

.tier1-nav-btn .tier1-icon {
  font-size: 12px;
  line-height: 1;
}

.tier1-nav-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.tier1-nav-btn.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(139, 92, 246, 0.24) 100%);
  color: #ffffff;
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

/* Category-specific Active Accents */
.tier1-nav-btn[data-category="playback"].active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(6, 182, 212, 0.24) 100%);
  border-color: rgba(59, 130, 246, 0.5);
}

.tier1-nav-btn[data-category="studio"].active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(139, 92, 246, 0.24) 100%);
  border-color: rgba(168, 85, 247, 0.5);
}

.tier1-nav-btn[data-category="analytics"].active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.22) 100%);
  border-color: rgba(16, 185, 129, 0.45);
}

.tier1-nav-btn[data-category="wellness"].active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.28) 0%, rgba(168, 85, 247, 0.24) 100%);
  border-color: rgba(99, 102, 241, 0.5);
}
```

### Step 2: Refactor `.top-nav-tabs` and `.top-tab-btn` for Dynamic Expansion
Upgrade `.top-nav-tabs` to support flexible horizontal layout and hide non-matching items:

```css
/* ==========================================================================
   Tier 2: Filtered Sub-Navigation Bar (.top-nav-tabs)
   ========================================================================== */
.top-nav-tabs {
  display: flex;
  gap: 3px;
  background: rgba(255, 255, 255, 0.035);
  padding: 3px;
  border-radius: 9px;
  border: 1px solid var(--border-dim, rgba(255, 255, 255, 0.08));
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  width: 100%;
  box-sizing: border-box;
}

.top-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 4px;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dynamic Filtering Hidden Class */
.top-tab-btn.tab-hidden {
  display: none !important;
}

.top-tab-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.top-tab-btn.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(6, 182, 212, 0.18) 100%);
  color: #ffffff;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.25);
}
```

### Step 3: Implement Light Theme Parity in `popup/popup.css`
In the `[data-theme="light"]` section of `popup/popup.css`:

```css
/* Light Mode Tier 1 Segmented Navigation */
[data-theme="light"] .tier1-segmented-nav {
  background: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

[data-theme="light"] .tier1-nav-btn {
  color: #475569;
}

[data-theme="light"] .tier1-nav-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #0f172a;
}

[data-theme="light"] .tier1-nav-btn.active {
  background: #ffffff;
  color: #0f172a;
  border-color: #94a3b8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .tier1-nav-btn[data-category="playback"].active {
  border-color: #3b82f6;
  color: #1d4ed8;
}

[data-theme="light"] .tier1-nav-btn[data-category="studio"].active {
  border-color: #a855f7;
  color: #7e22ce;
}

[data-theme="light"] .tier1-nav-btn[data-category="analytics"].active {
  border-color: #10b981;
  color: #047857;
}

[data-theme="light"] .tier1-nav-btn[data-category="wellness"].active {
  border-color: #6366f1;
  color: #4338ca;
}

/* Light Mode Tier 2 Child Tabs */
[data-theme="light"] .top-nav-tabs {
  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .top-tab-btn {
  color: #475569;
}

[data-theme="light"] .top-tab-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #0f172a;
}

[data-theme="light"] .top-tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  border-color: #94a3b8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
```

### Step 4: High Contrast Mode (`body.high-contrast-mode`)
```css
/* High Contrast Mode Access Overrides */
body.high-contrast-mode .tier1-segmented-nav,
body.high-contrast-mode .top-nav-tabs {
  border: 2px solid #ffffff;
  background: #000000;
}

body.high-contrast-mode .tier1-nav-btn.active,
body.high-contrast-mode .top-tab-btn.active {
  border: 2px solid #38bdf8;
  background: #0f172a;
  color: #ffffff;
}
```

---

## 🚫 5. Constraints & Architectural Invariants
1. **Container Width Budget:** Total width must not exceed 420px. Ensure `box-sizing: border-box` on all elements to prevent horizontal scrollbars (`overflow-x: hidden`).
2. **Smooth Transitions:** Transitions on background, color, and border must be constrained to $\le 0.18s$ to guarantee 60fps responsiveness.
3. **WCAG 2.1 AA Compliance:** Minimum 4.5:1 text-to-background contrast ratio in both Light and Dark modes.

---

## 📑 6. Deliverables Manifest
- `popup/popup.css`: Added `#tier1SegmentedNav`, `.tier1-nav-btn`, dynamic `.top-nav-tabs` flex styles, `.tab-hidden` rule, and light/high-contrast theme overrides.

---

## 🧪 7. Local Verification Gate
Execute theme and visual integrity test suites:
```bash
node tests/test_theme_toggle.js
node tests/test_syntax_and_manifest_integrity.js
```
**Pass Criteria:**
- Exit code 0 across tests.
- Zero visual overflows or missing CSS rules.
