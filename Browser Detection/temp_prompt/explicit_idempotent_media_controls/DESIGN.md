# Design System & UI Specification (DESIGN.md)
## Explicit Idempotent Media Controls & Visual State Synchronization

> **Initiative:** Web Activity & Media Sentinel (MV3)  
> **Document Status:** Authoritative Design Specification  
> **Task ID:** `TASK-IDEMPOTENT-MEDIA-CONTROLS-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Visual States & Component Tokens

### 1.1 Play / Pause Control Buttons
- **Target Elements:**
  - Popup: `#btnCtrlTogglePlay` (Primary Card Control), `#dynamicStatusBtn` (Header Status Pill)
  - Dashboard: `#btnHeroPlayPause` (Hero Banner Center Play/Pause)
- **State Specifications:**

| State | Icon / Glyph | Tooltip / Title Key | CSS Accent Token | ARIA Attribute |
| :--- | :---: | :--- | :--- | :--- |
| **Playing** | `⏸️` / `<svg class="icon-pause">` | "Pause" (`vol_pause_title`) | `--accent-emerald` (`#10b981`) | `aria-label="Pause"` |
| **Paused** | `▶️` / `<svg class="icon-play">` | "Play" (`vol_play_title`) | `--accent-cyan` (`#06b6d4`) | `aria-label="Play"` |
| **Cooldown Active** | Subtle pulse (800ms) | Locked (`--disabled-opacity: 0.9`) | `--text-muted` (`#94a3b8`) | `aria-busy="true"` |

### 1.2 Mute / Unmute Control Buttons
- **Target Elements:**
  - Popup: `#btnCtrlToggleMute` (Volume Row Mute), `#btnQuickMute` (Compact Header Action)
  - Dashboard: `#btnHeroMute` (Hero Audio Action)
- **State Specifications:**

| State | Icon / Glyph | Tooltip / Title Key | CSS Accent Token | ARIA Attribute |
| :--- | :---: | :--- | :--- | :--- |
| **Muted** | `🔇` / `<svg class="icon-mute">` | "Unmute" (`vol_unmute_title`) | `--accent-rose` (`#f43f5e`) | `aria-label="Unmute"` |
| **Unmuted** | `🔊` / `<svg class="icon-volume">` | "Mute" (`vol_mute_title`) | `--accent-cyan` (`#06b6d4`) | `aria-label="Mute"` |
| **Zero Volume** | `🔈` (Auto-Muted) | "Muted (Volume 0%)" | `--text-muted` (`#64748b`) | `aria-label="Muted at 0%"` |

---

## 📺 2. On-Screen Display (OSD) HUD in Main World

When explicit actions or toggles are processed in `inject_main_world.js`, the visual OSD HUD overlay renders directly over the video viewport:

```
+-------------------------------------------------------+
|                                                       |
|                                                       |
|                      +---------+                      |
|                      | ▶️ Playing|                      |
|                      +---------+                      |
|                                                       |
|                                                       |
+-------------------------------------------------------+
```

### OSD Toast Typography & Token Styling:
- **Substrate:** `background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);`
- **Border:** `1px solid rgba(255, 255, 255, 0.15); border-radius: 8px;`
- **Typography:** `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #f8fafc;`
- **Animation:** `opacity: 1 -> 0; transform: scale(1) -> scale(0.95); transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);`
- **Duration:** 1200ms auto-dismiss.

---

## 🛡️ 3. Universal Invariant Guard: `#btnGlobalMediaToggle`

The Universal Multi-Tab Media Toggle button (`#btnGlobalMediaToggle`) located at the top-right of the Popup interface:
- **Icon:** `⏯️`
- **Behavior:** Dispatches `TOGGLE_GLOBAL_MEDIA` across all tabs simultaneously.
- **Visual Design:** Strictly separated from the active single-tab media card. Must NOT inherit single-tab explicit play/pause styling or replace its global multi-tab trigger.

---

## ♿ 4. Accessibility & WCAG 2.1 Compliance

- **Contrast Ratios:** All button text and icons against substrate backgrounds maintain a minimum contrast ratio of 4.5:1 (AA) and 7:1 (AAA) in dark mode substrates.
- **Keyboard Navigation:** Tabindex order preserved across all interactive controls (`Enter` and `Space` triggers click).
- **Reduced Motion Support:** Respects `prefers-reduced-motion: reduce` by disabling OSD scale transforms.
