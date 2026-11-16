/**
 * Web Activity & Media Sentinel - Floating Fullscreen Button Module
 * In-page glassmorphism button for true native user-gesture fullscreen actuation.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const FLOATING_BTN_ID = '__sentinel_fs_floating_btn__';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let floatingBtnElement = null;
  let hideBtnTimeout = null;

  function setSvgIcon(btn, isExit) {
    if (!btn || typeof document === 'undefined') return;
    while (btn.firstChild) {
      btn.removeChild(btn.firstChild);
    }
    try {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', isExit
        ? 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'
        : 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
      );
      svg.appendChild(path);
      btn.appendChild(svg);
    } catch (_) {}
  }

  function showOSD(text, icon = '⛶') {
    if (typeof document === 'undefined') return;
    try {
      let osd = document.getElementById('__sentinel_fullscreen_osd__');
      if (!osd) {
        osd = document.createElement('div');
        osd.id = '__sentinel_fullscreen_osd__';
        osd.className = '__sentinel_fs_osd__';
        (document.body || document.documentElement).appendChild(osd);
      }
      while (osd.firstChild) {
        osd.removeChild(osd.firstChild);
      }
      const iconSpan = document.createElement('span');
      iconSpan.textContent = icon;
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      osd.appendChild(iconSpan);
      osd.appendChild(textSpan);

      osd.classList.add('visible');
      clearTimeout(osd.__hideTimer);
      osd.__hideTimer = setTimeout(() => {
        osd.classList.remove('visible');
      }, 1200);
    } catch (_) {}
  }

  function createFloatingButton(onToggle, isFs = false) {
    if (typeof document === 'undefined') return null;
    if (floatingBtnElement && floatingBtnElement.isConnected) return floatingBtnElement;
    const existing = document.getElementById(FLOATING_BTN_ID);
    if (existing) {
      floatingBtnElement = existing;
      return existing;
    }

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;
    btn.className = 'sentinel-fs-floating-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle Fullscreen');
    btn.title = 'Antigravity Sentinel Fullscreen (Click for Native, Shift+Click for Web)';

    setSvgIcon(btn, isFs);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof onToggle === 'function') {
        onToggle(e);
      }
    });

    floatingBtnElement = btn;
    return btn;
  }

  function updateFloatingButtonIcon(isFs) {
    const btn = document.getElementById(FLOATING_BTN_ID);
    if (btn) {
      setSvgIcon(btn, isFs);
    }
  }

  function attachFloatingButtonToPlayer(onToggle, isFs = false) {
    if (typeof document === 'undefined') return null;
    const player = document.getElementById('movie_player') ||
                   document.querySelector('.html5-video-player') ||
                   (document.querySelector('video') && document.querySelector('video').parentElement);
    if (!player) return null;

    const btn = createFloatingButton(onToggle, isFs);
    if (btn && !player.contains(btn)) {
      player.appendChild(btn);
    }

    const showBtn = () => {
      if (!btn) return;
      btn.classList.add('visible');
      clearTimeout(hideBtnTimeout);
      hideBtnTimeout = setTimeout(() => {
        if (btn && !btn.matches(':hover')) {
          btn.classList.remove('visible');
        }
      }, 3000);
    };

    player.removeEventListener('mousemove', showBtn);
    player.addEventListener('mousemove', showBtn, { passive: true });
    player.removeEventListener('mouseenter', showBtn);
    player.addEventListener('mouseenter', showBtn, { passive: true });
    player.removeEventListener('mouseleave', () => {
      if (btn) btn.classList.remove('visible');
    });
    player.addEventListener('mouseleave', () => {
      if (btn) btn.classList.remove('visible');
    }, { passive: true });

    return btn;
  }

  const FloatingButton = {
    FLOATING_BTN_ID,
    SVG_NS,
    setSvgIcon,
    showOSD,
    createFloatingButton,
    updateFloatingButtonIcon,
    attachFloatingButtonToPlayer
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingButton;
  }
  global.FloatingButton = FloatingButton;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
