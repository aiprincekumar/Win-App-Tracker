/**
 * Web Activity & Media Sentinel - Background Feature Manager
 * Domain-specific feature loader and coordinator for Background Service Worker extensions.
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

  function registerBackgroundFeature(featureDef) {
    const reg = _getRegistry();
    if (!reg) throw new Error('[BackgroundFeatureManager] SentinelFeatureRegistry not available');
    if (!featureDef || typeof featureDef !== 'object') {
      throw new TypeError('[BackgroundFeatureManager] featureDef must be an object');
    }
    const def = Object.assign({}, featureDef);
    if (!def.domain) {
      def.domain = ['background'];
    } else {
      const current = Array.isArray(def.domain) ? def.domain : [def.domain];
      if (!current.includes('background') && !current.includes('all')) {
        def.domain = current.concat('background');
      }
    }
    return reg.registerFeature(def);
  }

  function initBackgroundFeatures(context) {
    const reg = _getRegistry();
    if (!reg) return [];
    const ctx = Object.assign({ domain: 'background' }, context);
    return reg.initFeatures(ctx);
  }

  function getBackgroundFeatures() {
    const reg = _getRegistry();
    if (!reg) return [];
    return reg.getAllFeatures('background');
  }

  function notifyBackgroundUpdate(state) {
    const reg = _getRegistry();
    if (reg && typeof reg.updateFeatures === 'function') {
      reg.updateFeatures(state, 'background');
    }
  }

  function emitBackgroundEvent(eventName, payload) {
    const reg = _getRegistry();
    if (reg && typeof reg.emitEvent === 'function') {
      reg.emitEvent(eventName, payload);
    }
  }

  function destroyBackgroundFeatures() {
    const reg = _getRegistry();
    if (reg && typeof reg.destroyFeatures === 'function') {
      return reg.destroyFeatures('background');
    }
    return [];
  }

  const BackgroundFeatureManager = Object.freeze({
    registerBackgroundFeature: registerBackgroundFeature,
    initBackgroundFeatures: initBackgroundFeatures,
    getBackgroundFeatures: getBackgroundFeatures,
    notifyBackgroundUpdate: notifyBackgroundUpdate,
    emitBackgroundEvent: emitBackgroundEvent,
    destroyBackgroundFeatures: destroyBackgroundFeatures,
    getRegistry: _getRegistry
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundFeatureManager;
  }
  global.BackgroundFeatureManager = BackgroundFeatureManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
