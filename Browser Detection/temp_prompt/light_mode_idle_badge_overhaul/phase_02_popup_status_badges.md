# Phase 02: Popup Status Pill Badges Contrast Overhaul

> **Phase Number:** 02  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Target Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Files:**  
> - `popup/styles/themes.css` (for Live Media Dynamic Status Button light mode dot & badge refinement)  
> - `popup/styles/tabs/tab_sleep.css` (for Sleep Tab Dial Status Badge light mode rules)  
> - `popup/styles/tabs/tab_wellness.css` (for Focus Tab Status Badge light mode rules)  

---

## 🎯 1. Phase Objective
Execute a surgical Light Mode contrast overhaul for status badges and indicator dots across the extension Popup:
1. **Live Media Dynamic Status Button:** `#dynamicStatusBtn.idle`, `.status-dot`, and status button text in Light Mode.
2. **Sleep Tab Dial Status Badge:** `#sleepDialStatusBadge`, `.sleep-status-badge.idle`, `.running`, `.paused`, `.fading`, `.triggered` in Light Mode.
3. **Focus Tab Status Badge:** `#popupFocusBadge`, `.popup-focus-badge.idle`, `.running`, `.break`, `.paused` in Light Mode.
4. **Doomscroll Sentinel Status Badge:** `#doomscrollStatusBadge`, `.doomscroll-status-badge.standby` dot and text contrast.

---

## 📦 2. Prerequisites & Environment State
- Phase 01 completed.
- Working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Files `popup/styles/themes.css`, `popup/styles/tabs/tab_sleep.css`, and `popup/styles/tabs/tab_wellness.css` exist.
- Dark Mode Zero-Mutation Invariant: Dark mode styles in `popup/styles/tabs.css` and default selectors MUST remain 100% untouched.

---

## ⚓ 3. Technical Context & File Anchors

### Anchor 1: Live Media Dynamic Status Button (`popup/styles/themes.css`)
- In `popup/styles/themes.css` lines 426-465, `.dynamic-status-btn.idle` is defined:
  ```css
  [data-theme="light"] .dynamic-status-btn.idle {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #475569;
  }
  ```
  However, the internal `.status-dot` lacks a light mode rule, falling back to `tabs.css` dark mode `#475569` without crisp elevation or border. Active state dots (playing, paused, buffering, muted) also need high-contrast definitions.

### Anchor 2: Sleep Dial Status Badge (`popup/styles/tabs/tab_sleep.css`)
- Existing default dark rules located at lines 84-124:
  ```css
  .sleep-status-badge.idle {
    background: rgba(148, 163, 184, 0.15);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }
  ```
  Currently has ZERO light mode overrides in `tab_sleep.css` or `themes.css`.

### Anchor 3: Popup Focus Status Badge (`popup/styles/tabs/tab_wellness.css`)
- Existing default dark rules located at lines 80-100:
  ```css
  .popup-focus-badge.idle {
    background: rgba(148, 163, 184, 0.12);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }
  ```
  Currently has ZERO light mode overrides in `tab_wellness.css` or `themes.css`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `popup/styles/themes.css`
In `popup/styles/themes.css`, enhance the `[data-theme="light"]` section around lines 426-465 with crisp status dot rules:
```css
[data-theme="light"] .dynamic-status-btn.idle .status-dot {
  background: #64748b;
  box-shadow: none;
}
[data-theme="light"] .dynamic-status-btn.playing .status-dot {
  background: #059669;
  box-shadow: 0 0 6px rgba(5, 150, 105, 0.4);
}
[data-theme="light"] .dynamic-status-btn.paused .status-dot {
  background: #d97706;
}
[data-theme="light"] .dynamic-status-btn.buffering .status-dot {
  background: #0891b2;
  box-shadow: 0 0 6px rgba(8, 145, 178, 0.4);
}
[data-theme="light"] .dynamic-status-btn.muted .status-dot {
  background: #7c3aed;
}
[data-theme="light"] .dynamic-status-btn.stopped .status-dot {
  background: #64748b;
}
```

### Step 2: Update `popup/styles/tabs/tab_sleep.css`
Append a dedicated Light Mode section for `.sleep-status-badge`:
```css
/* ==========================================================================
   Light Mode Sleep Status Badge Contrast Overhaul
   ========================================================================== */
[data-theme="light"] .sleep-status-badge.idle {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

[data-theme="light"] .sleep-status-badge.running {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: #3730a3;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.15);
}

[data-theme="light"] .sleep-status-badge.paused {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
  color: #92400e;
}

[data-theme="light"] .sleep-status-badge.fading {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  color: #92400e;
}

[data-theme="light"] .sleep-status-badge.triggered {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  color: #991b1b;
}
```

### Step 3: Update `popup/styles/tabs/tab_wellness.css`
Append a dedicated Light Mode section for `.popup-focus-badge`:
```css
/* ==========================================================================
   Light Mode Focus Status Badge Contrast Overhaul
   ========================================================================== */
[data-theme="light"] .popup-focus-badge.idle {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

[data-theme="light"] .popup-focus-badge.running {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: #065f46;
}

[data-theme="light"] .popup-focus-badge.break {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.4);
  color: #0e7490;
}

[data-theme="light"] .popup-focus-badge.paused {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
  color: #92400e;
}

[data-theme="light"] .doomscroll-status-badge.standby .doomscroll-status-dot {
  background: #64748b;
}
```

---

## 🚫 5. Architectural Constraints & Boundaries
- Dark mode selectors in `popup/styles/tabs.css`, `tab_sleep.css`, and `tab_wellness.css` MUST REMAIN 100% UNTOUCHED.
- File encoding must preserve UTF-8 with BOM.

---

## 📋 6. Deliverables Manifest
- Updated `popup/styles/themes.css`.
- Updated `popup/styles/tabs/tab_sleep.css`.
- Updated `popup/styles/tabs/tab_wellness.css`.

---

## 🚦 7. Local Verification Gate
Execute the following verification commands:
```powershell
node tests/test_popup_focus_timer_sleep_parity.js
```
Exit code must be 0 with 100% passing tests.
