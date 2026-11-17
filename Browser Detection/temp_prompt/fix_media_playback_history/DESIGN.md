# Media Playback History: Design System, Tokens & UI/UX Specification

> **Document Type:** Design System Specification & UI/UX Design Tokens  
> **Workspace Container:** `temp_prompt/fix_media_playback_history/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subsystem:** Media Analytics Dashboard Table & Controls (`dashboard/dashboard.html`, `dashboard/dashboard.css`)  
> **Creation Timestamp:** 2026-11-17  

---

## 🎨 1. Design Philosophy & Materiality

The Media Playback History interface adheres to the **Liquid Glass Bento** design language:
1. **Studio Mixing Console Aesthetics:** Precision typography, tabular figures (`font-variant-numeric: tabular-nums`), calibrated contrast, and subtle specular borders.
2. **Perpetual Responsiveness & Fluid Geometry:** Table rows and controls gracefully collapse on smaller viewports with zero horizontal overflow.
3. **Hardware-Accelerated Fluid Interactions:** Micro-transitions on hover (150ms cubic-bezier), clear tactile feedback on search and platform filters.
4. **4-Theme Substrate Compliance:** Perfect WCAG AAA contrast fidelity across `dark`, `light`, `midnight`, and `oled` substrate themes.

---

## 🌈 2. Color Tokens & Theme Substrates

| Token Name | Dark Theme | Light Theme | Midnight Theme | OLED Pure Black | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--surface-card` | `rgba(22, 27, 34, 0.75)` | `rgba(255, 255, 255, 0.88)` | `rgba(15, 23, 42, 0.8)` | `rgba(0, 0, 0, 0.95)` | Table card container background |
| `--surface-row-hover`| `rgba(255, 255, 255, 0.04)` | `rgba(0, 0, 0, 0.03)` | `rgba(56, 189, 248, 0.05)` | `rgba(255, 255, 255, 0.05)` | Row hover state |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | `rgba(56, 189, 248, 0.15)` | `rgba(255, 255, 255, 0.12)` | Table grid & row dividing borders |
| `--text-primary` | `#f0f6fc` | `#0f172a` | `#f8fafc` | `#ffffff` | Media title & duration values |
| `--text-secondary` | `#8b949e` | `#64748b` | `#94a3b8` | `#a1a1aa` | Domain, resolution, and timestamps |
| `--accent-media` | `#38bdf8` | `#0284c7` | `#0ea5e9` | `#38bdf8` | Platform badge & active playback indicator |
| `--badge-live-bg` | `rgba(34, 197, 94, 0.15)` | `rgba(22, 163, 74, 0.12)` | `rgba(34, 197, 94, 0.2)` | `rgba(34, 197, 94, 0.25)` | Live playing session badge |
| `--badge-live-text` | `#4ade80` | `#15803d` | `#4ade80` | `#4ade80` | Live playing text color |

---

## 📐 3. UI Component Specifications

### 3.1 Media History Table Structure
- **Table Container (`#mediaTableContainer`):** Contained in `.bento-span-12` Bento card with smooth scrollable tbody.
- **Header Columns (`#mediaTableHead`):**
  1. `thColMediaTitle`: Media Title & Link (`min-width: 220px`)
  2. `thColMediaPlatform`: Platform / Domain Badge (`width: 130px`)
  3. `thColMediaDuration`: Watch Time / Video Length (`width: 130px`, right-aligned)
  4. `thColMediaVolume`: Avg / Peak Volume Indicator (`width: 110px`, center)
  5. `thColMediaRes`: Resolution Tag (`width: 90px`, center)
  6. `thColMediaDate`: Timestamp / Date (`width: 140px`, right-aligned)

### 3.2 Empty State Specification (`#mediaTableEmptyState`)
- **Icon:** SVG Play/Audio waveform icon (48x48px, opacity 0.4).
- **Heading:** `t('no_media_history_heading')` ("No Media Playback Recorded").
- **Subtext:** `t('no_media_history_sub')` ("Start playing YouTube, Netflix, Spotify, or web audio to track your media sessions here.").
- **Visibility Toggle:** Must dynamically toggle class `.hidden` or `display: none` when `history.length > 0`.

### 3.3 Active Playback Row Marker
When a session is currently playing (`isPlaying: true`):
- Display an animated emerald pulse badge: `<span class="badge-live-pulse">● LIVE</span>`.
- Highlighting the row subtly with `border-left: 3px solid var(--accent-media)`.

---

## ♿ 4. Accessibility (WCAG 2.1 AA) & Ergonomics

1. **Contrast Ratio:** Text-to-background contrast ratio >= 4.5:1 for standard text, >= 7:1 for OLED and dark themes.
2. **Keyboard Navigation:** Table rows and links must be focusable via `tabindex="0"`, with visible `:focus-visible` outline rings (`2px solid var(--accent-media)`).
3. **Screen Reader Attributes:** All table cells must have semantic `role="cell"`, headers must have `scope="col"`, and empty state must have `role="status"` with `aria-live="polite"`.
