/**
 * Web Activity & Media Sentinel - Popup Feature Manager
 * Domain-specific feature loader and coordinator for Popup extensions.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  function _getRegistry() {
    if (typeof globalThis !== 'undefined' && globalThis.SentinelFeatureRegistry) {
      return globalThis.SentinelFeatureRegistry;
    }
    if (typeof require === 'function') {
      try {
        return require('../../core/feature_registry.js');
      } catch (_) {
        try {
          return require('./src/core/feature_registry.js');
        } catch (__) {
          return null;
        }
      }
    }
    return null;
  }

  function registerPopupFeature(featureDef) {
    const reg = _getRegistry();
    if (!reg) throw new Error('[PopupFeatureManager] SentinelFeatureRegistry not available');
    if (!featureDef || typeof featureDef !== 'object') {
      throw new TypeError('[PopupFeatureManager] featureDef must be an object');
    }
    const def = Object.assign({}, featureDef);
    if (!def.domain) {
      def.domain = ['popup'];
    } else {
      const current = Array.isArray(def.domain) ? def.domain : [def.domain];
      if (!current.includes('popup') && !current.includes('all')) {
        def.domain = current.concat('popup');
      }
    }
    return reg.registerFeature(def);
  }

  function initPopupFeatures(context) {
    const reg = _getRegistry();
    if (!reg) return [];
    const ctx = Object.assign({ domain: 'popup' }, context);
    return reg.initFeatures(ctx);
  }

  function getPopupFeatures() {
    const reg = _getRegistry();
    if (!reg) return [];
    return reg.getAllFeatures('popup');
  }

  function notifyPopupUpdate(state) {
    const reg = _getRegistry();
    if (reg && typeof reg.updateFeatures === 'function') {
      reg.updateFeatures(state, 'popup');
    }
  }

  function emitPopupEvent(eventName, payload) {
    const reg = _getRegistry();
    if (reg && typeof reg.emitEvent === 'function') {
      reg.emitEvent(eventName, payload);
    }
  }

  function destroyPopupFeatures() {
    const reg = _getRegistry();
    if (reg && typeof reg.destroyFeatures === 'function') {
      return reg.destroyFeatures('popup');
    }
    return [];
  }

  const PopupFeatureManager = Object.freeze({
    registerPopupFeature: registerPopupFeature,
    initPopupFeatures: initPopupFeatures,
    getPopupFeatures: getPopupFeatures,
    notifyPopupUpdate: notifyPopupUpdate,
    emitPopupEvent: emitPopupEvent,
    destroyPopupFeatures: destroyPopupFeatures,
    getRegistry: _getRegistry
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopupFeatureManager;
  }
  global.PopupFeatureManager = PopupFeatureManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
