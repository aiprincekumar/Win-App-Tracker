# Design & UI/UX Specification: Mute All Others Controls

> **Document Type:** Design & UI/UX Specification  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Target Subsystems:** `#btnMuteAllOthers`, `#mediaDeckGrid`, `dashboard/dashboard.css`  
> **Lead Department:** Dept 05 (Frontend Engineering)  

---

## 🎨 1. Button States & Liquid Glass Materiality

The "Mute All Others" button (`#btnMuteAllOthers`) resides in the Media Deck Visualizer toolbar.

### 1.1 Inactive State (Default)
- **Label (English):** `🔇 Mute All Others`
- **Label (Hindi):** `🔇 बाकी सभी म्यूट करें`
- **CSS Classes:** `btn btn-secondary btn-sm`
- **Materiality:** Subtle frosted glass backdrop, neutral border, soft hover glow.

### 1.2 Active State (Mute All Others Engaged)
- **Label (English):** `🔊 Unmute All Others`
- **Label (Hindi):** `🔊 बाकी सभी अनम्यूट करें`
- **CSS Classes:** `btn btn-danger btn-sm active`
- **Materiality:** Vibrant coral/rose glow (`--accent-rose` or `--accent-danger`), indicating destructive/audio-suppressed mode.

---

## ♿ 2. Accessibility & Interaction States
- **ARIA Label:** Dynamic `aria-label="Mute all tabs except primary active media tab"` and `aria-pressed="false|true"`.
- **Keyboard Navigation:** Fully focusable via `Tab` key with standard `:focus-visible` emerald highlight ring.
- **Micro-interactions:** Smooth CSS transition (`0.2s cubic-bezier(0.4, 0, 0.2, 1)`) on background color and scale.
