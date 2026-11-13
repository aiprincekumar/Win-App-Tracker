/**
 * Web Activity & Media Sentinel - Injected OSD Manager
 * On-Screen Display banner renderer with 100% W3C Trusted Types compliance (zero innerHTML).
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const OSD_ID = '__sentinel_injected_osd_banner__';
  let hideTimeout = null;

  function showOSD(text, icon = '🎬') {
    if (typeof document === 'undefined') return null;

    let banner = document.getElementById(OSD_ID);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = OSD_ID;
      banner.className = '__sentinel_injected_osd_banner__';
      Object.assign(banner.style, {
        position: 'fixed',
        top: '40px',
        right: '40px',
        padding: '12px 20px',
        background: 'rgba(15, 23, 42, 0.92)',
        color: '#f8fafc',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease'
      });
      (document.body || document.documentElement).appendChild(banner);
    }

    while (banner.firstChild) {
      banner.removeChild(banner.firstChild);
    }

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.fontSize = '18px';
    banner.appendChild(iconSpan);

    const textSpan = document.createElement('span');
    textSpan.textContent = String(text);
    banner.appendChild(textSpan);

    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0) scale(1)';

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    hideTimeout = setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-10px) scale(0.95)';
    }, 1200);

    return banner;
  }

  const OSDManager = {
    OSD_ID,
    showOSD
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OSDManager;
  }
  global.OSDManager = OSDManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
