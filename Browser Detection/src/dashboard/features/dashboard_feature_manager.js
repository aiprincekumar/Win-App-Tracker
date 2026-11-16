/**
 * Web Activity & Media Sentinel - Dashboard Feature Manager
 * Domain-specific feature loader and coordinator for Dashboard extensions.
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

  function registerDashboardFeature(featureDef) {
    const reg = _getRegistry();
    if (!reg) throw new Error('[DashboardFeatureManager] SentinelFeatureRegistry not available');
    if (!featureDef || typeof featureDef !== 'object') {
      throw new TypeError('[DashboardFeatureManager] featureDef must be an object');
    }
    const def = Object.assign({}, featureDef);
    if (!def.domain) {
      def.domain = ['dashboard'];
    } else {
      const current = Array.isArray(def.domain) ? def.domain : [def.domain];
      if (!current.includes('dashboard') && !current.includes('all')) {
        def.domain = current.concat('dashboard');
      }
    }
    return reg.registerFeature(def);
  }

  function initDashboardFeatures(context) {
    const reg = _getRegistry();
    if (!reg) return [];
    const ctx = Object.assign({ domain: 'dashboard' }, context);
    return reg.initFeatures(ctx);
  }

  function getDashboardFeatures() {
    const reg = _getRegistry();
    if (!reg) return [];
    return reg.getAllFeatures('dashboard');
  }

  function notifyDashboardUpdate(state) {
    const reg = _getRegistry();
    if (reg && typeof reg.updateFeatures === 'function') {
      reg.updateFeatures(state, 'dashboard');
    }
  }

  function emitDashboardEvent(eventName, payload) {
    const reg = _getRegistry();
    if (reg && typeof reg.emitEvent === 'function') {
      reg.emitEvent(eventName, payload);
    }
  }

  function destroyDashboardFeatures() {
    const reg = _getRegistry();
    if (reg && typeof reg.destroyFeatures === 'function') {
      return reg.destroyFeatures('dashboard');
    }
    return [];
  }

  const DashboardFeatureManager = Object.freeze({
    registerDashboardFeature: registerDashboardFeature,
    initDashboardFeatures: initDashboardFeatures,
    getDashboardFeatures: getDashboardFeatures,
    notifyDashboardUpdate: notifyDashboardUpdate,
    emitDashboardEvent: emitDashboardEvent,
    destroyDashboardFeatures: destroyDashboardFeatures,
    getRegistry: _getRegistry
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardFeatureManager;
  }
  global.DashboardFeatureManager = DashboardFeatureManager;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
