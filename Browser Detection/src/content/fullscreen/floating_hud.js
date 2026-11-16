/**
 * Web Activity & Media Sentinel - Floating Fullscreen HUD Button
 * Injects a glassmorphism floating button with SVG icons onto active videos.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const FLOATING_BTN_ID = '__sentinel_fs_floating_btn__';

  function createSvgIcon(pathData) {
    if (typeof document === 'undefined') return null;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    return svg;
  }

  function setSvgIcon(btn, isExit) {
    if (!btn || typeof document === 'undefined') return;
    while (btn.firstChild) {
      btn.removeChild(btn.firstChild);
    }
    const pathData = isExit
      ? 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'
      : 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3';
    const icon = createSvgIcon(pathData);
    if (icon) btn.appendChild(icon);
  }

  function createFloatingButton(onToggle, isExit = false) {
    if (typeof document === 'undefined') return null;
    let btn = document.getElementById(FLOATING_BTN_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = FLOATING_BTN_ID;
      btn.className = 'sentinel-fs-floating-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle Fullscreen');
      btn.title = 'Antigravity Sentinel Fullscreen (Click for Native, Shift+Click for Web)';

      setSvgIcon(btn, isExit);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (typeof onToggle === 'function') onToggle(e);
      });
    }
    return btn;
  }

  const FloatingHUD = {
    SVG_NS,
    FLOATING_BTN_ID,
    createSvgIcon,
    setSvgIcon,
    createFloatingButton
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingHUD;
  }
  global.FloatingHUD = FloatingHUD;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
