# Phase 2: Omni Command Palette & Ergonomic Hotkey Navigation
## Standalone Executable Phase Instruction Specification

> **Phase Identifier:** `PHASE-02-OMNI-COMMAND-PALETTE-AND-HOTKEYS`  
> **Subsystems Implemented:** System 3 (Omni Command Palette) & System 8 (Ergonomic Hotkeys & WCAG 2.1 AAA Accessibility)  
> **Target Files:** `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`  
> **Test Gate:** `tests/test_dashboard_uiux_phase2.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Authorization Prerequisite:** Phase 1 Certified Clean + Active `AUTH-MGR-*` token  

---

## 🎯 1. Phase Objective

Implement an ultra-fast, frosted-glass **Omni Command Palette** triggered globally via `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS), featuring real-time fuzzy search across 4 operational categories (Quick Actions, Domains, Settings, Active Media). Simultaneously implement ergonomic single-key hotkey navigation (`1`, `2`, `3`, `Space`, `M`, `F`, `P`, `?`) and high-visibility WCAG 2.1 AAA dual-ring focus indicators.

---

## 📋 2. Prerequisites & Inputs

1. **Prior Phase Deliverables:**
   - Phase 1 completed: Bento Grid layout and Liquid Glass CSS tokens active in `dashboard.css`.
2. **Design Specifications:**
   - Command Palette Wireframe in [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_uiux_enhancement/TRD.md) Section 4.
   - Bilingual localization keys in [`dashboard_ui_ux_enhancement_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_enhancement_prompt.md) Section 9 (`DASHBOARD_UIUX_I18N`).

---

## 🔍 3. Technical Context & File Anchors

- **`dashboard/dashboard.html`:**
  - Inject `#omniCommandPaletteModal` container right before `</body>`.
  - Inject `#hotkeysCheatSheetModal` container.
- **`dashboard/dashboard.js`:**
  - Implement `OmniCommandPaletteController` class.
  - Implement `initGlobalHotkeys()` listener.
  - Integrate command execution dispatch (tab switching, media mute/play, backup export, theme toggle).
- **`dashboard/dashboard.css`:**
  - Add modal overlay styling with backdrop blur and centered spatial depth.
  - Add WCAG 2.1 AAA dual-ring `:focus-visible` outlines.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Add Command Palette Modal Markup in `dashboard.html`
Insert the modal structure before `</body>`:
```html
<!-- Omni Command Palette Modal (Ctrl+K / Cmd+K) -->
<div id="omniCommandPaletteModal" class="omni-modal-overlay hidden" role="dialog" aria-modal="true" aria-label="Command Palette">
  <div class="omni-palette-card liquid-glass-card">
    <div class="omni-palette-header">
      <span class="omni-palette-search-icon">🔍</span>
      <input type="text" id="omniPaletteSearchInput" class="omni-palette-input" 
             placeholder="Type a command or search domains... (Esc to dismiss)" 
             autocomplete="off" spellcheck="false" />
      <kbd class="omni-hotkey-badge">Esc</kbd>
    </div>
    <div id="omniPaletteResultsList" class="omni-palette-results" role="listbox">
      <!-- Dynamic filtered command items injected here -->
    </div>
    <div class="omni-palette-footer">
      <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
      <span><kbd>↵</kbd> to select</span>
      <span><kbd>Esc</kbd> to dismiss</span>
    </div>
  </div>
</div>

<!-- Keyboard Shortcuts Cheat Sheet Modal (?) -->
<div id="hotkeysCheatSheetModal" class="omni-modal-overlay hidden" role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts">
  <div class="hotkeys-cheat-card liquid-glass-card">
    <div class="hotkeys-header">
      <h3 id="hotkeysModalTitle">Keyboard Shortcuts</h3>
      <button id="btnCloseHotkeysCheat" class="btn-icon-close" aria-label="Close">✕</button>
    </div>
    <div id="hotkeysListContainer" class="hotkeys-grid">
      <!-- Injected shortcuts list -->
    </div>
  </div>
</div>
```

### Step 2: Implement Command Palette Controller in `dashboard.js`
Define the command registry and fuzzy search logic:
```javascript
class OmniCommandPaletteController {
  constructor() {
    this.modal = document.getElementById('omniCommandPaletteModal');
    this.input = document.getElementById('omniPaletteSearchInput');
    this.resultsContainer = document.getElementById('omniPaletteResultsList');
    this.commands = this.buildCommandsList();
    this.filtered = [];
    this.selectedIndex = 0;
    this.initListeners();
  }

  buildCommandsList() {
    return [
      { id: 'nav-tracking', title: 'Go to Time Tracking Analytics', category: 'Navigation', icon: '⏱️', action: () => switchTab('time-tracking') },
      { id: 'nav-media', title: 'Go to Media Analytics & Hero Player', category: 'Navigation', icon: '🎬', action: () => switchTab('media-analytics') },
      { id: 'nav-settings', title: 'Go to Settings & Preferences', category: 'Navigation', icon: '⚙️', action: () => switchTab('settings') },
      { id: 'media-toggle-play', title: 'Play / Pause Active Video', category: 'Quick Actions', icon: '⏯️', action: () => triggerMediaPlayPause() },
      { id: 'media-toggle-mute', title: 'Mute / Unmute Active Audio', category: 'Quick Actions', icon: '🔇', action: () => triggerMediaMute() },
      { id: 'data-export-json', title: 'Download Master JSON Backup', category: 'Quick Actions', icon: '💾', action: () => exportDashboardBackup() },
      { id: 'theme-toggle-light', title: 'Toggle Light / Dark Mode', category: 'Settings', icon: '🌓', action: () => toggleThemeMode() },
      { id: 'show-hotkeys', title: 'Open Keyboard Shortcuts Sheet', category: 'Quick Actions', icon: '⌨️', action: () => openHotkeysModal() }
    ];
  }

  open() {
    this.modal.classList.remove('hidden');
    this.input.value = '';
    this.filter('');
    this.input.focus();
    if (window.sentinelHaptics) window.sentinelHaptics.playClick();
  }

  close() {
    this.modal.classList.add('hidden');
  }

  filter(query) {
    const q = (query || '').trim().toLowerCase();
    this.filtered = q ? this.commands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) : this.commands;
    this.selectedIndex = 0;
    this.render();
  }

  render() {
    this.resultsContainer.innerHTML = '';
    this.filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `omni-result-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', idx === this.selectedIndex ? 'true' : 'false');
      item.innerHTML = `
        <span class="omni-item-icon">${cmd.icon}</span>
        <div class="omni-item-content">
          <span class="omni-item-title">${cmd.title}</span>
          <span class="omni-item-cat">${cmd.category}</span>
        </div>
        <kbd class="omni-enter-hint">↵</kbd>
      `;
      item.addEventListener('click', () => {
        cmd.action();
        this.close();
      });
      this.resultsContainer.appendChild(item);
    });
  }

  executeSelected() {
    if (this.filtered[this.selectedIndex]) {
      this.filtered[this.selectedIndex].action();
      this.close();
    }
  }

  initListeners() {
    this.input.addEventListener('input', (e) => this.filter(e.target.value));
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
        this.render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
        this.render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
  }
}
```

### Step 3: Implement Ergonomic Global Hotkeys
In `dashboard.js`, register window keydown listeners:
- `Ctrl+K` / `Cmd+K`: Toggle Command Palette.
- `1`: Switch to Tab 1 (Time Tracking).
- `2`: Switch to Tab 2 (Media Analytics).
- `3`: Switch to Tab 3 (Settings).
- `Space`: Toggle Play/Pause if media tab is active (ignore when input/textarea is focused).
- `M`: Toggle Mute (ignore when input is focused).
- `F`: Toggle Fullscreen.
- `P`: Toggle Picture-in-Picture.
- `?`: Open Keyboard Shortcuts Cheat Sheet modal.

### Step 4: WCAG 2.1 AAA High-Visibility Focus Rings in `dashboard.css`
```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary) !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25) !important;
}
```

---

## 🚫 5. Architectural Constraints & Boundaries

- **Input Guard:** Single-key hotkeys (`1`, `2`, `3`, `Space`, `M`, `F`, `P`, `?`) MUST NEVER trigger while user is typing in `<input>`, `<textarea>`, or contentEditable elements.
- **Escape Key Isolation:** Pressing `Escape` must dismiss any open modal before doing anything else.

---

## 📦 6. Deliverables Manifest

1. `dashboard/dashboard.html`: Command Palette and Shortcuts Cheat Sheet modal markup.
2. `dashboard/dashboard.js`: `OmniCommandPaletteController` and `initGlobalHotkeys`.
3. `dashboard/dashboard.css`: Modal overlay styles, keycaps (`<kbd>`), and WCAG AAA focus rings.
4. `tests/test_dashboard_uiux_phase2.js`: Test runner validating palette keyboard traps, search filtering, and hotkey listeners.

---

## 🧪 7. Local Verification Gate

Execute the Phase 2 test suite:
```bash
node tests/test_dashboard_uiux_phase2.js
```
**Gate Certification Criteria:**
- Exit code must be `0`.
- All keydown simulation tests (Ctrl+K, arrows, enter, escape) pass 100%.
- `node -c dashboard/dashboard.js` passes with 0 syntax errors.
