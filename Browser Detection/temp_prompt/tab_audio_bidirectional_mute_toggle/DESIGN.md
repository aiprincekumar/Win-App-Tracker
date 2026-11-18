# Design System & UI Tokens
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Document Type:** Design System Specification  
> **Lead Department:** Dept 04 UI/UX Design System  
> **Compliance:** WCAG 2.1 AA, Dark & Light Mode Parity

---

## 🎨 1. Header Action Controls Layout

In `dashboard/dashboard.html`, the `.media-deck-header-actions` container holds global actions:
```html
<div class="media-deck-header-actions">
  <button id="btnMuteAllOthers" class="btn btn-sm btn-secondary" data-i18n="btn_mute_all_others">🔇 Mute All Others</button>
  <button id="btnMuteAll" class="btn btn-sm btn-secondary" data-i18n="btn_mute_all">🔇 Mute All</button>
</div>
```

---

## 🔘 2. Visual Component States & Tokens

### 2.1 Master Mute Buttons (Header)
- **Normal State:**
  - Class: `btn btn-sm btn-secondary`
  - Background: `var(--bg-glass-card)` / semi-transparent slate
  - Border: `1px solid var(--border-dim)`
  - Color: `var(--text-secondary)`
- **Active State (Muted / Engaged):**
  - Class: `btn btn-sm btn-secondary active`
  - Background: `rgba(244, 63, 94, 0.15)` (Rose/Danger subtle tint) or `var(--primary-color)`
  - Border: `1px solid #f43f5e`
  - Color: `#f43f5e`
  - Transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### 2.2 Solo Tab Button (Card Controls)
- **Normal State:**
  - Class: `btn-deck-ctrl btn-deck-solo`
  - Text: `🎧` (Icon only)
  - Title: "Mute all other tabs and solo this audio"
- **Active Solo State:**
  - Class: `btn-deck-ctrl btn-deck-solo solo-active`
  - Background: `rgba(16, 185, 129, 0.2)` (Emerald glow)
  - Border: `1px solid #10b981`
  - Box Shadow: `0 0 10px rgba(16, 185, 129, 0.4)`
  - Title: "Solo mode active - Click to unmute all other tabs"

---

## 🌐 3. Bilingual i18n Strings (English & Hindi)

| Translation Key | English (EN) | Hindi (HI) |
| :--- | :--- | :--- |
| `btn_mute_all` | 🔇 Mute All | 🔇 सभी म्यूट करें |
| `btn_unmute_all` | 🔊 Unmute All | 🔊 सभी अनम्यूट करें |
| `btn_mute_all_others` | 🔇 Mute All Others | 🔇 अन्य सभी म्यूट करें |
| `btn_restore_all_others` | 🔊 Restore All Others | 🔊 अन्य सभी रीस्टोर करें |
