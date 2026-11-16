/**
 * Web Activity & Media Sentinel - Modular Feature Registry Subsystem
 * Universal feature registration, lifecycle management, domain filtering, and safe event dispatch.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // Feature map: id -> featureRecord
  const _features = new Map();
  // Event listeners: eventName -> Set<handler>
  const _listeners = new Map();

  function _normalizeDomains(domain) {
    if (!domain) return ['all'];
    if (Array.isArray(domain)) {
      const arr = domain.map(function (d) { return String(d).trim().toLowerCase(); }).filter(Boolean);
      return arr.length > 0 ? arr : ['all'];
    }
    const str = String(domain).trim().toLowerCase();
    return str ? [str] : ['all'];
  }

  function registerFeature(featureDef) {
    if (!featureDef || typeof featureDef !== 'object') {
      throw new TypeError('[SentinelFeatureRegistry] featureDef must be an object');
    }
    if (!featureDef.id || typeof featureDef.id !== 'string' || !featureDef.id.trim()) {
      throw new Error('[SentinelFeatureRegistry] featureDef.id is required and must be a non-empty string');
    }

    const id = featureDef.id.trim();
    const existing = _features.get(id);

    const record = {
      id: id,
      name: typeof featureDef.name === 'string' && featureDef.name.trim() ? featureDef.name.trim() : id,
      version: typeof featureDef.version === 'string' && featureDef.version.trim() ? featureDef.version.trim() : '1.0.0',
      description: typeof featureDef.description === 'string' ? featureDef.description : '',
      domain: _normalizeDomains(featureDef.domain),
      onInit: typeof featureDef.onInit === 'function' ? featureDef.onInit : null,
      onUpdate: typeof featureDef.onUpdate === 'function' ? featureDef.onUpdate : null,
      onDestroy: typeof featureDef.onDestroy === 'function' ? featureDef.onDestroy : null,
      onEvent: typeof featureDef.onEvent === 'function' ? featureDef.onEvent : null,
      enabled: featureDef.enabled !== false,
      initialized: existing ? existing.initialized : false,
      metadata: featureDef.metadata && typeof featureDef.metadata === 'object' ? Object.assign({}, featureDef.metadata) : {}
    };

    _features.set(id, record);
    emitEvent('feature:registered', { id: record.id, domain: record.domain, version: record.version });
    return record;
  }

  function unregisterFeature(id) {
    if (!id || typeof id !== 'string') return false;
    const cleanId = id.trim();
    const record = _features.get(cleanId);
    if (!record) return false;

    if (record.initialized && record.onDestroy) {
      try {
        record.onDestroy();
      } catch (err) {
        console.error('[SentinelFeatureRegistry] Error in onDestroy for feature ' + cleanId + ':', err);
      }
      record.initialized = false;
    }

    const removed = _features.delete(cleanId);
    if (removed) {
      emitEvent('feature:unregistered', { id: cleanId });
    }
    return removed;
  }

  function getFeature(id) {
    if (!id || typeof id !== 'string') return null;
    return _features.get(id.trim()) || null;
  }

  function hasFeature(id) {
    if (!id || typeof id !== 'string') return false;
    return _features.has(id.trim());
  }

  function getAllFeatures(filterDomain) {
    const all = Array.from(_features.values());
    if (!filterDomain) return all;

    const norm = String(filterDomain).trim().toLowerCase();
    return all.filter(function (f) {
      return f.domain.includes('all') || f.domain.includes(norm);
    });
  }

  function getFeaturesByDomain(domain) {
    return getAllFeatures(domain);
  }

  function initFeatures(context) {
    const ctx = (context && typeof context === 'object') ? context : {};
    const domain = ctx.domain ? String(ctx.domain).trim().toLowerCase() : null;
    const targetFeatures = domain ? getAllFeatures(domain) : Array.from(_features.values());
    const initializedIds = [];

    for (let i = 0; i < targetFeatures.length; i++) {
      const feat = targetFeatures[i];
      if (feat.enabled !== false && !feat.initialized) {
        if (feat.onInit) {
          try {
            feat.onInit(ctx);
          } catch (err) {
            console.error('[SentinelFeatureRegistry] Error in onInit for feature ' + feat.id + ':', err);
          }
        }
        feat.initialized = true;
        initializedIds.push(feat.id);
      }
    }

    emitEvent('features:initialized', { domain: domain || 'all', initializedIds: initializedIds });
    return initializedIds;
  }

  function updateFeatures(state, domain) {
    const targetDomain = domain ? String(domain).trim().toLowerCase() : null;
    const targetFeatures = targetDomain ? getAllFeatures(targetDomain) : Array.from(_features.values());

    for (let i = 0; i < targetFeatures.length; i++) {
      const feat = targetFeatures[i];
      if (feat.initialized && feat.onUpdate) {
        try {
          feat.onUpdate(state);
        } catch (err) {
          console.error('[SentinelFeatureRegistry] Error in onUpdate for feature ' + feat.id + ':', err);
        }
      }
    }
  }

  function destroyFeatures(domain) {
    const targetDomain = domain ? String(domain).trim().toLowerCase() : null;
    const targetFeatures = targetDomain ? getAllFeatures(targetDomain) : Array.from(_features.values());
    const destroyedIds = [];

    for (let i = 0; i < targetFeatures.length; i++) {
      const feat = targetFeatures[i];
      if (feat.initialized) {
        if (feat.onDestroy) {
          try {
            feat.onDestroy();
          } catch (err) {
            console.error('[SentinelFeatureRegistry] Error in onDestroy for feature ' + feat.id + ':', err);
          }
        }
        feat.initialized = false;
        destroyedIds.push(feat.id);
      }
    }

    emitEvent('features:destroyed', { domain: targetDomain || 'all', destroyedIds: destroyedIds });
    return destroyedIds;
  }

  function enableFeature(id) {
    const feat = getFeature(id);
    if (feat) {
      feat.enabled = true;
      emitEvent('feature:enabled', { id: feat.id });
      return true;
    }
    return false;
  }

  function disableFeature(id) {
    const feat = getFeature(id);
    if (feat) {
      if (feat.initialized && feat.onDestroy) {
        try { feat.onDestroy(); } catch (err) { console.error(err); }
        feat.initialized = false;
      }
      feat.enabled = false;
      emitEvent('feature:disabled', { id: feat.id });
      return true;
    }
    return false;
  }

  function addEventListener(eventName, handler) {
    if (!eventName || typeof handler !== 'function') return function () {};
    const name = String(eventName).trim();
    if (!_listeners.has(name)) {
      _listeners.set(name, new Set());
    }
    _listeners.get(name).add(handler);
    return function () { removeEventListener(name, handler); };
  }

  function removeEventListener(eventName, handler) {
    if (!eventName) return false;
    const name = String(eventName).trim();
    const set = _listeners.get(name);
    if (!set) return false;
    return set.delete(handler);
  }

  function emitEvent(eventName, payload) {
    if (!eventName) return;
    const name = String(eventName).trim();

    // Call registered event listeners
    const set = _listeners.get(name);
    if (set && set.size > 0) {
      set.forEach(function (handler) {
        try {
          handler(payload, name);
        } catch (err) {
          console.error('[SentinelFeatureRegistry] Listener error on event "' + name + '":', err);
        }
      });
    }

    // Forward to initialized features with onEvent
    _features.forEach(function (feat) {
      if (feat.initialized && typeof feat.onEvent === 'function') {
        try {
          feat.onEvent(name, payload);
        } catch (err) {
          console.error('[SentinelFeatureRegistry] Feature ' + feat.id + ' onEvent error on "' + name + '":', err);
        }
      }
    });
  }

  function clear() {
    destroyFeatures();
    _features.clear();
    _listeners.clear();
  }

  const SentinelFeatureRegistry = Object.freeze({
    registerFeature: registerFeature,
    unregisterFeature: unregisterFeature,
    getFeature: getFeature,
    hasFeature: hasFeature,
    getAllFeatures: getAllFeatures,
    getFeaturesByDomain: getFeaturesByDomain,
    initFeatures: initFeatures,
    updateFeatures: updateFeatures,
    destroyFeatures: destroyFeatures,
    enableFeature: enableFeature,
    disableFeature: disableFeature,
    emitEvent: emitEvent,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    on: addEventListener,
    off: removeEventListener,
    clear: clear
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentinelFeatureRegistry;
  }
  global.SentinelFeatureRegistry = SentinelFeatureRegistry;
  global.FeatureRegistry = SentinelFeatureRegistry;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
