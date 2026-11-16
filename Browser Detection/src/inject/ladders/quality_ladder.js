/**
 * Web Activity & Media Sentinel - Injected Quality Ladder
 * Resolution definitions and YouTube quality selector helper.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const QUALITY_LADDER = [
    'tiny',
    'small',
    'medium',
    'large',
    'hd720',
    'hd1080',
    'hd1440',
    'hd2160',
    'hd2880',
    'highres'
  ];

  function getQualityLabel(level) {
    switch (String(level).toLowerCase()) {
      case 'tiny': return '144p';
      case 'small': return '240p';
      case 'medium': return '360p';
      case 'large': return '480p';
      case 'hd720': return '720p HD';
      case 'hd1080': return '1080p FHD';
      case 'hd1440': return '1440p QHD';
      case 'hd2160': return '4K 2160p';
      case 'hd2880': return '5K 2880p';
      case 'highres': return '8K 4320p';
      default: return level || 'Auto';
    }
  }

  function tryChangeQualityViaMenu(targetLabel) {
    if (typeof document === 'undefined') return false;
    try {
      const settingsBtn = document.querySelector('.ytp-settings-button');
      if (!settingsBtn) return false;
      settingsBtn.click();
      setTimeout(() => {
        const menuItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
        const qualityItem = menuItems.find(item => {
          const content = item.textContent || '';
          return /quality|गुणवत्ता|resolución|qualité/i.test(content);
        });
        if (qualityItem) {
          qualityItem.click();
          setTimeout(() => {
            const subItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
            const advancedItem = subItems.find(item => /advanced|उन्नत|avanzada/i.test(item.textContent || ''));
            if (advancedItem) {
              advancedItem.click();
              setTimeout(() => {
                const resItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
                const targetItem = resItems.find(item => (item.textContent || '').includes(targetLabel));
                if (targetItem) {
                  targetItem.click();
                } else if (settingsBtn) {
                  settingsBtn.click();
                }
              }, 120);
            } else {
              const targetItem = subItems.find(item => (item.textContent || '').includes(targetLabel));
              if (targetItem) {
                targetItem.click();
              } else if (settingsBtn) {
                settingsBtn.click();
              }
            }
          }, 120);
        } else if (settingsBtn) {
          settingsBtn.click();
        }
      }, 120);
      return true;
    } catch (_) {}
    return false;
  }

  const QualityLadder = {
    QUALITY_LADDER,
    getQualityLabel,
    tryChangeQualityViaMenu
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QualityLadder;
  }
  global.QualityLadder = QualityLadder;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
