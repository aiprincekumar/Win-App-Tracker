# Phase 02: CSS Responsive Geometry & Popover Positioning

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Phase #:** 02 of 04  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/PHASE_02_CSS_AND_GEOMETRY.md`  
> **Lead Execution Role:** Level 4 Frontend CSS Specialist Subagent  
> **Required Skills:** `frontend-patterns`, `web-design-guidelines`  
> **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)  

---

## 🎯 1. Phase Objective
Update CSS styles in `popup/popup.css` and `popup/styles/tabs.css`:
1. Style the reorganized header so `#tier1SegmentedNav` is left-aligned and `.header-action-group` (`#btnSwitchMediaTab` + `#btnOpenDashboard`) is right-aligned.
2. Style `#btnQuickSettings` as a cohesive `.footer-btn.toolbar-btn` in `<footer>`, ensuring seamless sizing alongside `#btnThemeToggle`.
3. Reposition `#quickSettingsPopover` from the top header to the bottom toolbar (`bottom: 48px; right: 8px;`) with clean upward opening animation.
4. Style the `#mainTabFocus` button and `#viewFocusPane #cardFocusPlaceholder` hero card.
5. Guarantee strict 380px fixed-width geometry with zero horizontal scrollbars (`overflow-x: hidden`).

---

## 📋 2. Prerequisites & Inputs
- Phase 01 completed (`popup/popup.html` reorganized with header action group, footer gear, and Focus tab/pane).
- Target files:
  - [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css)
  - [`popup/styles/tabs.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/styles/tabs.css)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1: Update `.header-badges` and `.header-action-group` in `popup/popup.css`
Update `.header-badges` layout rules:
```css
.header-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.header-action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
}
```
Ensure `#tier1SegmentedNav` maintains flex-shrink: 0 and neat margins.

### Step 2: Harmonize Footer Toolbar & `#btnQuickSettings`
In `popup/popup.css`:
- Ensure `footer.footer` has:
  ```css
  footer.footer,
  .footer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 6px 8px;
    background: var(--bg-surface-elevated, #111827);
    border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    width: 380px;
    box-sizing: border-box;
  }
  ```
- Style `#btnQuickSettings` when located inside `.footer-btn`:
  ```css
  .footer-btn.btn-quick-settings {
    flex: 1 1 0;
    min-width: 0;
    max-width: 44px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-secondary, #94a3b8);
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .footer-btn.btn-quick-settings:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #ffffff);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .footer-btn.btn-quick-settings:active {
    transform: scale(0.95);
  }

  .footer-btn.btn-quick-settings[aria-expanded="true"] {
    background: rgba(59, 130, 246, 0.2);
    border-color: var(--accent-blue, #3b82f6);
    color: #60a5fa;
  }
  ```

### Step 3: Reposition `#quickSettingsPopover` from Bottom
Update `.quick-settings-popover` coordinates:
```css
.quick-settings-popover {
  position: fixed;
  bottom: 48px;
  right: 8px;
  width: 290px;
  max-height: 380px;
  background: var(--bg-surface-elevated, #0f172a);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  z-index: 1000;
  padding: 12px;
  overflow-y: auto;
  transform-origin: bottom right;
  animation: popoverFadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popoverFadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Step 4: Style `#mainTabFocus` and `#cardFocusPlaceholder`
- In `popup/popup.css` or `popup/styles/tabs.css`:
  ```css
  /* Focus Tab Active Accent */
  .top-tab-btn[data-view="focus"].active {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%);
    border-color: rgba(16, 185, 129, 0.6);
    color: #34d399;
  }

  /* Focus View Placeholder Card */
  .focus-hero-card {
    background: rgba(17, 24, 39, 0.85);
    border: 1px dashed rgba(16, 185, 129, 0.35);
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    margin: 14px 8px;
    box-sizing: border-box;
  }

  .focus-placeholder-icon {
    font-size: 32px;
    display: inline-block;
    margin-bottom: 8px;
    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4));
  }

  .focus-placeholder-title {
    font-size: 14px;
    font-weight: 700;
    color: #f8fafc;
    margin: 0 0 6px 0;
  }

  .focus-placeholder-desc {
    font-size: 11px;
    line-height: 1.5;
    color: #94a3b8;
    margin: 0 0 14px 0;
  }

  .focus-placeholder-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
    font-size: 10px;
    font-weight: 600;
  }
  ```

### Step 5: Light Theme & High-Contrast Mode Parity
- Add light theme support in `[data-theme="light"]`:
  ```css
  [data-theme="light"] .footer-btn.btn-quick-settings {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #475569;
  }
  [data-theme="light"] .footer-btn.btn-quick-settings:hover {
    background: #e2e8f0;
    color: #0f172a;
    border-color: #94a3b8;
  }
  [data-theme="light"] .quick-settings-popover {
    background: #ffffff;
    border-color: #cbd5e1;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
  [data-theme="light"] .focus-hero-card {
    background: #ffffff;
    border-color: rgba(16, 185, 129, 0.5);
  }
  ```

---

## 🔒 4. Architectural Constraints & Boundaries
- Width MUST remain strictly 380px (`overflow-x: hidden`).
- Popover must NOT clip or cause horizontal scrollbars.
- Preserve UTF-8 with BOM.

---

## 📦 5. Deliverables Manifest
1. Updated `popup/popup.css` with header flex alignment, footer gear styling, bottom popover styling, and focus card styling.
2. Updated `popup/styles/tabs.css` with focus tab active accents.

---

## 🚦 6. Local Verification Gate
- Verify CSS parses cleanly without syntax errors.
- Confirm `.quick-settings-popover` declares `bottom: 48px;` and `right: 8px;`.
- Confirm `.header-badges` declares `justify-content: space-between;`.
