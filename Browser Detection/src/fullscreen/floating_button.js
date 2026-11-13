/**
 * Web Activity & Media Sentinel - Floating Button Engine
 * Dedicated module for floating button management.
 */

(function (global) {
  'use strict';

  const FloatingHUD = (typeof module !== 'undefined' && module.exports)
    ? require('../content/fullscreen/floating_hud.js')
    : global.FloatingHUD;

  const FloatingButton = {
    createFloatingButton: FloatingHUD.createFloatingButton,
    createSvgIcon: FloatingHUD.createSvgIcon
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingButton;
  }
  global.FloatingButton = FloatingButton;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
