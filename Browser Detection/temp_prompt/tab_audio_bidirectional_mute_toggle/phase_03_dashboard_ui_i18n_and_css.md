# Phase 3: Dashboard Shell, HTML, i18n, & CSS Styling
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Target Files:**  
> - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html)  
> - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)  
> - [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css)  
> **Assigned Agent Role:** Level 4 UI/UX Engineer  
> **Mandatory Guidelines:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`), 100% W3C Trusted Types Safe

---

## 🎯 1. Phase Objective
Integrate the "Mute All" button into the dashboard header, wire bidirectional event listeners, update UI states and text upon toggle, add bilingual i18n dictionary entries, and apply active CSS styling.

---

## 📝 2. Surgical Step-by-Step Instructions

### Step 1: Add "Mute All" Button to HTML
In `dashboard/dashboard.html` inside `.media-deck-header-actions`:
```html
<div class="media-deck-header-actions">
  <button id="btnMuteAllOthers" class="btn btn-sm btn-secondary" data-i18n="btn_mute_all_others">🔇 Mute All Others</button>
  <button id="btnMuteAll" class="btn btn-sm btn-secondary" data-i18n="btn_mute_all">🔇 Mute All</button>
</div>
```

### Step 2: Add Bilingual i18n Keys in `dashboard/dashboard.js`
Add entries to both English and Hindi dictionaries:
- English:
  - `btn_mute_all`: `'🔇 Mute All'`
  - `btn_unmute_all`: `'🔊 Unmute All'`
  - `btn_mute_all_others`: `'🔇 Mute All Others'`
  - `btn_restore_all_others`: `'🔊 Restore All Others'`
- Hindi:
  - `btn_mute_all`: `'🔇 सभी म्यूट करें'`
  - `btn_unmute_all`: `'🔊 सभी अनम्यूट करें'`
  - `btn_mute_all_others`: `'🔇 अन्य सभी म्यूट करें'`
  - `btn_restore_all_others`: `'🔊 अन्य सभी रीस्टोर करें'`

### Step 3: Wire Event Listeners in `dashboard/dashboard.js`
- Wire click listener for `#btnMuteAll` to call `handleMuteAll()`.
- Ensure `handleMuteAllOthers()` and `handleMuteAll()` update button classes (`.active`) and dynamic text (`btn_restore_all_others` / `btn_unmute_all`).

### Step 4: Add CSS Styling in `dashboard/styles/media.css`
Add active state rules:
```css
.media-deck-header-actions .btn.active {
  background: rgba(244, 63, 94, 0.15);
  border-color: #f43f5e;
  color: #f43f5e;
}

body.theme-light .media-deck-header-actions .btn.active {
  background: rgba(225, 29, 72, 0.12);
  border-color: #e11d48;
  color: #be123c;
}
```

---

## 🔒 3. Local Verification Gate
- Check DOM for `#btnMuteAll` presence.
- Test translation resolution for new keys in EN and HI.
