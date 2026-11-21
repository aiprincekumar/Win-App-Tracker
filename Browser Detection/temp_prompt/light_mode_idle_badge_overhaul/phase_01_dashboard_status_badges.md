# Phase 01: Dashboard Status Pill Badges Contrast Overhaul

> **Phase Number:** 01  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Target Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Files:**  
> - `dashboard/styles/wellbeing_light.css` (primary modular light stylesheet)  
> - `dashboard/styles/media.css` (for Audio Visualizer & Media Deck light mode rules)  

---

## 🎯 1. Phase Objective
Execute a surgical, high-contrast Light Mode overhaul for status pill badges and indicator dots across the Dashboard:
1. **Audio Visualizer Header Status Pill:** `.viz-header-status-pill`, `.viz-live-dot`, `#vizHeaderStatusText`, and `.viz-hud-badge`.
2. **Focus Sentinel Hub Badges:** `.badge-focus`, `.badge-break`, `.badge-focus-micro`, `.badge-break-micro`, `.zen-status-badge`.
3. **Sleep Sentinel Hub Badges:** `#dashSleepStatusBadge`, `.dash-sleep-badge.idle`, `.dash-sleep-badge.active`.
4. **Media Player Hero & Deck Status Pills:** `#playerStatusBadge`, `.status-pill.idle`, `.deck-status-pill`.
5. **Sidebar HUD Status Dots:** `.hud-dot.idle` light mode contrast and definition.

---

## 📦 2. Prerequisites & Environment State
- Working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- File `dashboard/styles/wellbeing_light.css` exists (currently 471 lines).
- File `dashboard/styles/media.css` exists.
- File `dashboard/styles/wellbeing_blacklist.css` is strictly locked: **DO NOT TOUCH** (Rule 28 modularity).
- Dark Mode Zero-Mutation Invariant: No changes to default or dark mode rules (`body.theme-dark`, `[data-theme="dark"]`).

---

## ⚓ 3. Technical Context & File Anchors

### Anchor 1: Audio Visualizer Header Status Pill (`dashboard/styles/media.css`)
- Existing default dark rules located at lines 1455-1480:
  ```css
  .viz-header-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .viz-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #64748b;
    transition: background 0.3s ease;
  }
  .viz-live-dot.active {
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  }
  ```

### Anchor 2: Focus Sentinel Badges (`dashboard/styles/wellbeing_blacklist.css` & `dashboard/styles/wellbeing_light.css`)
- Default dark `.badge-focus` (line 328 in `wellbeing_blacklist.css`):
  ```css
  .badge-focus {
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  ```
  Note: `#34d399` has poor contrast in light mode (< 2.4:1). Must override in `wellbeing_light.css` with `#065f46` (contrast >= 7.2:1).

### Anchor 3: Hero Media Player & Deck Status Pills (`dashboard/styles/media.css`)
- Default dark rules located at lines 78-103:
  ```css
  .status-pill.idle {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    border: 1px solid var(--border-dim);
  }
  ```

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update `dashboard/styles/wellbeing_light.css`
Append a dedicated, clearly labeled section `/* ========================================================================= */ /* Light Mode Status Pill Badges & Contrast Overhaul (Phase 1) */ /* ========================================================================= */`:

1. **Focus Mode Badges (`.badge-focus`, `.badge-break`):**
   ```css
   body.theme-light .badge-focus,
   [data-theme="light"] .badge-focus {
     background: rgba(16, 185, 129, 0.12) !important;
     border: 1px solid rgba(16, 185, 129, 0.4) !important;
     color: #065f46 !important;
     font-weight: 700 !important;
   }
   body.theme-light .badge-break,
   [data-theme="light"] .badge-break {
     background: rgba(59, 130, 246, 0.12) !important;
     border: 1px solid rgba(59, 130, 246, 0.4) !important;
     color: #1e40af !important;
     font-weight: 700 !important;
   }
   ```
2. **Micro Focus Badges & Zen Work Status Badge:**
   ```css
   body.theme-light .badge-focus-micro,
   [data-theme="light"] .badge-focus-micro {
     background: rgba(16, 185, 129, 0.12) !important;
     color: #065f46 !important;
     font-weight: 700 !important;
   }
   body.theme-light .badge-break-micro,
   [data-theme="light"] .badge-break-micro {
     background: rgba(59, 130, 246, 0.12) !important;
     color: #1e40af !important;
     font-weight: 700 !important;
   }
   body.theme-light .zen-status-badge,
   [data-theme="light"] .zen-status-badge {
     background: #f8fafc !important;
     border: 1px solid #cbd5e1 !important;
     color: #1e293b !important;
   }
   ```
3. **Sleep Sentinel Badges & Indicators Refinement:**
   Ensure `.dash-sleep-badge.idle` has `#f1f5f9` background, `#cbd5e1` border, `#475569` text (contrast >= 5.4:1), and `.dash-sleep-badge.active` has `background: rgba(99, 102, 241, 0.12)`, `border: 1px solid #6366f1`, `color: #312e81`.
4. **Sidebar HUD Idle Indicator Dots:**
   ```css
   body.theme-light .hud-dot.idle,
   [data-theme="light"] .hud-dot.idle {
     background: #64748b !important;
     box-shadow: 0 0 0 1px #cbd5e1 !important;
   }
   ```

### Step 2: Update `dashboard/styles/media.css`
In the light mode section of `dashboard/styles/media.css` (or within `wellbeing_light.css` if keeping `media.css` compact):
1. **Audio Visualizer Header Status Pill & Dot:**
   ```css
   body.theme-light .viz-header-status-pill,
   [data-theme="light"] .viz-header-status-pill {
     background: #f8fafc;
     border: 1px solid #cbd5e1;
     color: #475569;
     box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
   }
   body.theme-light .viz-header-status-pill .viz-live-text,
   [data-theme="light"] .viz-header-status-pill .viz-live-text {
     color: #475569;
   }
   body.theme-light .viz-live-dot,
   [data-theme="light"] .viz-live-dot {
     background: #64748b;
     box-shadow: none;
   }
   body.theme-light .viz-live-dot.active,
   [data-theme="light"] .viz-live-dot.active {
     background: #059669;
     box-shadow: 0 0 6px rgba(5, 150, 105, 0.4);
   }
   body.theme-light .viz-header-status-pill.active,
   [data-theme="light"] .viz-header-status-pill.active {
     background: rgba(16, 185, 129, 0.12);
     border-color: rgba(16, 185, 129, 0.35);
     color: #065f46;
   }
   body.theme-light .viz-header-status-pill.active .viz-live-text,
   [data-theme="light"] .viz-header-status-pill.active .viz-live-text {
     color: #065f46;
   }
   body.theme-light .viz-hud-badge,
   [data-theme="light"] .viz-hud-badge {
     background: rgba(248, 250, 252, 0.9);
     border-color: #cbd5e1;
     color: #475569;
   }
   ```
2. **Hero Player Status Pill & Deck Status Pills:**
   ```css
   body.theme-light .status-pill.idle,
   [data-theme="light"] .status-pill.idle {
     background: #f1f5f9;
     border: 1px solid #cbd5e1;
     color: #475569;
   }
   body.theme-light .status-pill.playing,
   [data-theme="light"] .status-pill.playing {
     background: rgba(16, 185, 129, 0.12);
     border: 1px solid rgba(16, 185, 129, 0.35);
     color: #065f46;
   }
   body.theme-light .status-pill.paused,
   [data-theme="light"] .status-pill.paused {
     background: rgba(245, 158, 11, 0.12);
     border: 1px solid rgba(245, 158, 11, 0.35);
     color: #92400e;
   }
   body.theme-light .deck-status-pill,
   [data-theme="light"] .deck-status-pill {
     background: #f1f5f9;
     border-color: #cbd5e1;
     color: #475569;
   }
   body.theme-light .deck-status-pill.playing,
   [data-theme="light"] .deck-status-pill.playing {
     background: rgba(16, 185, 129, 0.12);
     border-color: rgba(16, 185, 129, 0.35);
     color: #065f46;
   }
   body.theme-light .deck-status-pill.paused,
   [data-theme="light"] .deck-status-pill.paused {
     background: rgba(245, 158, 11, 0.12);
     border-color: rgba(245, 158, 11, 0.35);
     color: #92400e;
   }
   body.theme-light .deck-status-pill.muted,
   [data-theme="light"] .deck-status-pill.muted {
     background: #f1f5f9;
     border-color: #cbd5e1;
     color: #475569;
   }
   ```

---

## 🚫 5. Architectural Constraints & Boundaries
- `wellbeing_blacklist.css` MUST REMAIN 100% UNTOUCHED.
- No modifications to dark mode styles or default dark selectors.
- File encoding must preserve UTF-8 with BOM.

---

## 📋 6. Deliverables Manifest
- Updated `dashboard/styles/wellbeing_light.css` (< 700 lines total).
- Updated `dashboard/styles/media.css`.

---

## 🚦 7. Local Verification Gate
Execute the following verification command to verify no existing tests break:
```powershell
node tests/test_light_mode_contrast_and_visibility.js
```
Exit code must be 0 with 100% passing batteries.
