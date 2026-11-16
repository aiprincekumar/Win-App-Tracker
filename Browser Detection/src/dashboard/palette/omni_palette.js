/**
 * Web Activity & Media Sentinel - Dashboard Omni Command Palette & Global Hotkeys
 * Instant command execution, domain fuzzy filtering, cyclic keyboard navigation (Ctrl+K),
 * and WCAG 2.1 AAA high-visibility focus indicators.
 * 100% W3C Trusted Types compliant (Zero innerHTML assignments).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const SHORTCUTS_REGISTRY = Object.freeze([
    { key: 'Ctrl+K / ⌘K', desc: 'Open Omni Command Palette', category: 'General' },
    { key: '?', desc: 'Open Keyboard Shortcuts Sheet', category: 'General' },
    { key: '1', desc: 'Switch to Time Tracking Tab', category: 'Navigation' },
    { key: '2', desc: 'Switch to Media Analytics Tab', category: 'Navigation' },
    { key: '3', desc: 'Switch to Settings & Data Tab', category: 'Navigation' },
    { key: 'Space', desc: 'Play / Pause Active Video', category: 'Media' },
    { key: 'M', desc: 'Mute / Unmute Active Video', category: 'Media' },
    { key: 'F', desc: 'Toggle Fullscreen Mode', category: 'Media' },
    { key: 'P', desc: 'Toggle Picture-in-Picture (PiP)', category: 'Media' },
    { key: 'Esc', desc: 'Dismiss Open Modals / Menus', category: 'General' }
  ]);

  function isHotkeysModalOpen(doc = null) {
    const documentObj = doc || (typeof document !== 'undefined' ? document : null);
    if (!documentObj) return false;
    const modal = documentObj.getElementById('hotkeysCheatSheetModal');
    return Boolean(modal && modal.classList && typeof modal.classList.contains === 'function' && !modal.classList.contains('hidden'));
  }

  function openHotkeysModal(doc = null) {
    const documentObj = doc || (typeof document !== 'undefined' ? document : null);
    if (!documentObj) return;
    const modal = documentObj.getElementById('hotkeysCheatSheetModal');
    if (modal) {
      renderHotkeysList(documentObj);
      modal.classList.remove('hidden');
    }
  }

  function closeHotkeysModal(doc = null) {
    const documentObj = doc || (typeof document !== 'undefined' ? document : null);
    if (!documentObj) return;
    const modal = documentObj.getElementById('hotkeysCheatSheetModal');
    if (modal) modal.classList.add('hidden');
  }

  function renderHotkeysList(doc = null) {
    const documentObj = doc || (typeof document !== 'undefined' ? document : null);
    if (!documentObj) return;
    const container = documentObj.getElementById('hotkeysListContainer');
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    SHORTCUTS_REGISTRY.forEach((sc) => {
      const item = documentObj.createElement('div');
      item.className = 'hotkey-item';

      const kbd = documentObj.createElement('kbd');
      kbd.className = 'hotkey-key';
      kbd.textContent = sc.key;

      const desc = documentObj.createElement('span');
      desc.className = 'hotkey-desc';
      desc.textContent = sc.desc;

      item.appendChild(kbd);
      item.appendChild(desc);
      container.appendChild(item);
    });
  }

  class OmniCommandPaletteController {
    constructor(options = {}) {
      const doc = options.document || (typeof document !== 'undefined' ? document : null);
      if (!doc) return;
      this.document = doc;
      this.options = options;
      this.modal = doc.getElementById('omniCommandPaletteModal');
      this.input = doc.getElementById('omniPaletteSearchInput');
      this.resultsContainer = doc.getElementById('omniPaletteResultsList');
      this.commands = this.buildCommandsList();
      this.filtered = [];
      this.selectedIndex = 0;
      this.initListeners();
    }

    buildCommandsList() {
      const opts = this.options || {};
      const switchTabFn = opts.switchTab || (typeof switchTab === 'function' ? switchTab : () => {});
      const playPauseFn = opts.triggerMediaPlayPause || (typeof triggerMediaPlayPause === 'function' ? triggerMediaPlayPause : () => {});
      const muteFn = opts.triggerMediaMute || (typeof triggerMediaMute === 'function' ? triggerMediaMute : () => {});
      const fsFn = opts.triggerMediaFullscreen || (typeof triggerMediaFullscreen === 'function' ? triggerMediaFullscreen : () => {});
      const pipFn = opts.triggerMediaPip || (typeof triggerMediaPip === 'function' ? triggerMediaPip : () => {});
      const exportJsonFn = opts.exportDashboardBackup || (typeof exportDashboardBackup === 'function' ? exportDashboardBackup : () => {});
      const toggleThemeFn = opts.toggleThemeMode || (typeof toggleThemeMode === 'function' ? toggleThemeMode : () => {});
      const openHotkeysFn = opts.openHotkeysModal || openHotkeysModal;

      return [
        { id: 'nav-tracking', title: 'Go to Time Tracking Analytics', category: 'Navigation', icon: '⏱️', action: () => switchTabFn('tracking') },
        { id: 'nav-media', title: 'Go to Media Analytics & Hero Player', category: 'Navigation', icon: '🎬', action: () => switchTabFn('media') },
        { id: 'nav-settings', title: 'Go to Settings & Preferences', category: 'Navigation', icon: '⚙️', action: () => switchTabFn('settings') },
        { id: 'media-toggle-play', title: 'Play / Pause Active Video', category: 'Quick Actions', icon: '⏯️', action: () => playPauseFn() },
        { id: 'media-toggle-mute', title: 'Mute / Unmute Active Audio', category: 'Quick Actions', icon: '🔇', action: () => muteFn() },
        { id: 'media-toggle-fullscreen', title: 'Toggle Fullscreen Mode', category: 'Quick Actions', icon: '⛶', action: () => fsFn() },
        { id: 'media-toggle-pip', title: 'Toggle Picture-in-Picture (PiP)', category: 'Quick Actions', icon: '🪟', action: () => pipFn() },
        { id: 'data-export-json', title: 'Download Master JSON Backup', category: 'Quick Actions', icon: '💾', action: () => exportJsonFn() },
        { id: 'theme-toggle-light', title: 'Toggle Light / Dark Mode', category: 'Settings', icon: '🌓', action: () => toggleThemeFn() },
        { id: 'show-hotkeys', title: 'Open Keyboard Shortcuts Sheet', category: 'Quick Actions', icon: '⌨️', action: () => openHotkeysFn(this.document) }
      ];
    }

    getMatchedDomains(query) {
      if (!query) return [];
      const q = query.toLowerCase();
      const matched = [];
      const opts = this.options || {};
      const data = opts.dashboardData || (typeof dashboardData !== 'undefined' ? dashboardData : null);
      const hubData = opts.dataHubAnalytics || (typeof dataHubAnalytics !== 'undefined' ? dataHubAnalytics : null);

      if (data && data.activityData && data.activityData.domains) {
        Object.keys(data.activityData.domains).forEach((dom) => {
          if (dom.toLowerCase().includes(q) && !matched.includes(dom)) {
            matched.push(dom);
          }
        });
      }

      if (hubData && Array.isArray(hubData.domain_distribution)) {
        hubData.domain_distribution.forEach((d) => {
          if (d && d.domain && d.domain.toLowerCase().includes(q) && !matched.includes(d.domain)) {
            matched.push(d.domain);
          }
        });
      }

      const switchTabFn = opts.switchTab || (typeof switchTab === 'function' ? switchTab : () => {});

      return matched.slice(0, 5).map((domain) => ({
        id: `domain-${domain}`,
        title: `View Analytics for ${domain}`,
        category: 'Domains',
        icon: '🌐',
        action: () => {
          switchTabFn('tracking');
          if (this.document) {
            const searchInput = this.document.getElementById('domainSearchInput');
            if (searchInput) {
              searchInput.value = domain;
              searchInput.dispatchEvent(new Event('input'));
            }
          }
        }
      }));
    }

    open() {
      if (!this.modal) return;
      if (this.modal.classList && typeof this.modal.classList.remove === 'function') {
        this.modal.classList.remove('hidden');
      }
      if (this.input) {
        this.input.value = '';
        this.filter('');
        if (typeof this.input.focus === 'function') this.input.focus();
      }
      if (typeof window !== 'undefined' && window.sentinelHaptics && typeof window.sentinelHaptics.playClick === 'function') {
        window.sentinelHaptics.playClick();
      }
    }

    close() {
      if (!this.modal) return;
      if (this.modal.classList && typeof this.modal.classList.add === 'function') {
        this.modal.classList.add('hidden');
      }
      if (this.input && typeof this.input.blur === 'function') {
        this.input.blur();
      }
    }

    isOpen() {
      return Boolean(this.modal && this.modal.classList && typeof this.modal.classList.contains === 'function' && !this.modal.classList.contains('hidden'));
    }

    toggle() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    }

    filter(query) {
      const q = (query || '').trim().toLowerCase();
      this.commands = this.buildCommandsList();
      const matchedCmds = q
        ? this.commands.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
        : this.commands;

      const domainCmds = q ? this.getMatchedDomains(q) : [];
      this.filtered = [...matchedCmds, ...domainCmds];
      this.selectedIndex = 0;
      this.render();
    }

    render() {
      if (!this.resultsContainer || !this.document) return;
      while (this.resultsContainer.firstChild) {
        this.resultsContainer.removeChild(this.resultsContainer.firstChild);
      }

      const tFn = (typeof t === 'function') ? t : (k) => k;

      if (this.filtered.length === 0) {
        const empty = this.document.createElement('div');
        empty.className = 'omni-empty-results';
        empty.textContent = tFn('cmd_empty') || 'No matching commands or domains found';
        this.resultsContainer.appendChild(empty);
        return;
      }

      this.filtered.forEach((cmd, idx) => {
        const item = this.document.createElement('div');
        item.className = `omni-result-item ${idx === this.selectedIndex ? 'selected' : ''}`;
        item.setAttribute('role', 'option');
        item.setAttribute('id', `omni-item-${idx}`);
        item.setAttribute('aria-selected', idx === this.selectedIndex ? 'true' : 'false');

        const itemLeft = this.document.createElement('div');
        itemLeft.className = 'cmd-result-left';

        if (cmd.id && cmd.id.startsWith('domain-')) {
          const domainName = cmd.id.replace('domain-', '');
          const faviconImg = this.document.createElement('img');
          faviconImg.className = 'cmd-favicon';
          faviconImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainName)}&sz=32`;
          faviconImg.alt = '';
          faviconImg.onerror = function () { this.style.display = 'none'; };
          itemLeft.appendChild(faviconImg);
        } else {
          const iconSpan = this.document.createElement('span');
          iconSpan.className = 'omni-item-icon';
          iconSpan.textContent = cmd.icon || '⚡';
          itemLeft.appendChild(iconSpan);
        }

        const contentDiv = this.document.createElement('div');
        contentDiv.className = 'omni-item-content';

        const titleSpan = this.document.createElement('span');
        titleSpan.className = 'omni-item-title';
        titleSpan.textContent = cmd.title;

        const catSpan = this.document.createElement('span');
        catSpan.className = 'omni-item-cat';
        catSpan.textContent = cmd.category;

        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(catSpan);
        itemLeft.appendChild(contentDiv);

        const kbd = this.document.createElement('kbd');
        kbd.className = 'cmd-kbd-hint omni-enter-hint';
        kbd.textContent = '↵';

        item.appendChild(itemLeft);
        item.appendChild(kbd);

        item.addEventListener('click', () => {
          this.executeCommand(cmd);
        });

        item.addEventListener('mouseenter', () => {
          this.selectedIndex = idx;
          this.updateSelectionClasses();
        });

        this.resultsContainer.appendChild(item);
      });

      this.scrollSelectedIntoView();
    }

    updateSelectionClasses() {
      if (!this.resultsContainer) return;
      const items = this.resultsContainer.querySelectorAll('.omni-result-item');
      items.forEach((item, idx) => {
        const isSelected = (idx === this.selectedIndex);
        if (isSelected) {
          item.classList.add('selected');
          item.setAttribute('aria-selected', 'true');
        } else {
          item.classList.remove('selected');
          item.setAttribute('aria-selected', 'false');
        }
      });
      this.scrollSelectedIntoView();
    }

    scrollSelectedIntoView() {
      if (!this.resultsContainer) return;
      const selectedEl = this.resultsContainer.querySelector('.omni-result-item.selected');
      if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }

    executeSelected() {
      if (this.filtered && this.filtered[this.selectedIndex]) {
        this.executeCommand(this.filtered[this.selectedIndex]);
      }
    }

    executeCommand(cmd) {
      if (!cmd) return;
      if (typeof cmd.action === 'function') {
        cmd.action();
      }
      this.close();
    }

    initListeners() {
      if (this.input) {
        this.input.addEventListener('input', (e) => {
          this.filter(e.target.value);
        });
        this.input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.filtered.length > 0) {
              this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
              this.updateSelectionClasses();
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.filtered.length > 0) {
              this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
              this.updateSelectionClasses();
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.executeSelected();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
          }
        });
      }

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.close();
          }
        });
      }
    }
  }

  const OmniPalette = {
    SHORTCUTS_REGISTRY,
    isHotkeysModalOpen,
    openHotkeysModal,
    closeHotkeysModal,
    renderHotkeysList,
    OmniCommandPaletteController
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OmniPalette;
  }
  global.OmniPalette = OmniPalette;
  global.OmniCommandPaletteController = OmniCommandPaletteController;
  global.SHORTCUTS_REGISTRY = SHORTCUTS_REGISTRY;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
