/**
 * Web Activity & Media Sentinel - Media Tab Controller
 * Player controls, progress scrubbers, volume sliders, and in-card micro-actions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function renderMediaPane(mediaState) {
    if (typeof document === 'undefined') return;
    const titleEl = document.getElementById('mediaTrackTitle');
    const emptyState = document.getElementById('mediaEmptyState');
    const activePlayerCard = document.getElementById('mediaPlayerCard');

    if (!mediaState || !mediaState.primaryMedia) {
      if (emptyState) emptyState.style.display = 'flex';
      if (activePlayerCard) activePlayerCard.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (activePlayerCard) activePlayerCard.style.display = 'block';

    if (titleEl) {
      titleEl.textContent = mediaState.primaryMedia.title || 'Playing Media';
    }
  }

  const TabMedia = {
    renderMediaPane
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabMedia;
  }
  global.TabMedia = TabMedia;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
