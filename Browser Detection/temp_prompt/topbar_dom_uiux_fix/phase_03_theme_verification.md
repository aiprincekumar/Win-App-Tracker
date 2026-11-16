# Phase 3: Theme Verification (Dark Mode Pure Background & Light Mode Crispness)

> **Phase Identifier:** Phase 3 of 4  
> **Target Files:** `dashboard/dashboard.css`  
> **Executing Role:** Level 4 Frontend Engineer  
> **Department Rule:** Dept 05 Frontend Engineering  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager  

---

## 1. Phase Objective
Verify and reinforce visual harmony across Dark and Light themes for the updated top app bar and main content stage, ensuring WCAG 2.1 AA text contrast, pure obsidian backgrounds in dark mode, and crisp paper-white aesthetics in light mode.

---

## 2. Prerequisites & Technical Context
- Completion of Phase 1 (DOM fix) and Phase 2 (Pill compacting).
- Existing CSS variables for dark and light mode in `dashboard/dashboard.css`.

---

## 3. Surgical Step-by-Step Instructions

1. **Dark Mode Verification (`body:not(.light-theme)`):**
   - Ensure `--bg-topbar` renders with clean glass transparency: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)`.
   - Verify `.browser-filter-container` has deep slate background `rgba(15, 23, 42, 0.85)` and emerald font `#6ee7b7`.
   - Verify `.datahub-status-badge` has clear contrast:
     - Online: emerald `#a7f3d0` on `rgba(16, 185, 129, 0.1)`.
     - Offline: crimson `#fca5a5` on `rgba(239, 68, 68, 0.08)`.
     - Connecting/Fallback: amber `#fde68a` on `rgba(245, 158, 11, 0.1)`.
   - Verify `#liveClockPill` has secondary text `#94a3b8` on `rgba(255, 255, 255, 0.04)`.
2. **Light Mode Verification (`body.light-theme`):**
   - Verify top bar background: `rgba(255, 255, 255, 0.85)` with `border-bottom: 1px solid rgba(0, 0, 0, 0.08)`.
   - Provide explicit overrides for `.browser-filter-container` under `body.light-theme`:
     ```css
     body.light-theme .browser-filter-container {
       background: rgba(248, 250, 252, 0.95);
       border: 1px solid rgba(16, 185, 129, 0.5);
       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
     }
     body.light-theme .browser-filter-select {
       color: #065f46;
     }
     body.light-theme .browser-filter-select option {
       background-color: #ffffff;
       color: #0f172a;
     }
     body.light-theme .datahub-status-badge {
       background: rgba(241, 245, 249, 0.9);
       border: 1px solid rgba(0, 0, 0, 0.12);
       color: #334155;
     }
     ```
   - Ensure `#btnThemeToggle` icon transforms appropriately between Sun (for light mode) and Moon (for dark mode).
3. Validate that file encoding remains UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 4. Architectural Boundaries (Out of Scope)
- Do NOT rewrite existing base color variables unless necessary to fix contrast regressions.

---

## 5. Local Verification Gate
- Test toggling between dark and light themes via `#btnThemeToggle`.
- Verify zero color bleeding, zero unstyled transparent dropdowns, and clear text legibility in both states.
