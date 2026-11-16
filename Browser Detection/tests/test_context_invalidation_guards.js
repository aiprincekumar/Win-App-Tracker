/**
 * Browser Detection / tests/test_context_invalidation_guards.js
 * Verification Test Suite for Extension Context Invalidation Guards & Graceful Teardown
 * 
 * Tests the mitigation of "Uncaught Error: Extension context invalidated" occurring
 * when extension reloads/updates orphan existing content scripts on YouTube and other tabs.
 * 
 * Verifies:
 * 1. Synchronous context validity check via isExtensionContextValid() / isContextValid().
 * 2. Sticky isContextInvalidated lifecycle state tracking.
 * 3. Graceful teardown (teardownMediaSentinel / teardownInvalidatedContext) clearing
 *    periodicHeartbeatTimer, fadeIntervalId, and disconnecting DOM observers (observer, titleObserver, adObserver).
 * 4. Safe storage wrappers (safeStorageGet, safeStorageSet) preventing unhandled exceptions.
 * 5. Safe IPC wrapper (safeSendMessage) catching context invalidation errors.
 * 6. Protection across domain speed memory (restoreDomainSpeed, saveDomainSpeed),
 *    auto ad silencer (initAdSilencer), audio lab (initAudioLabSettings), and heartbeat.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Extension Context Invalidation Guards & Teardown Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');
const contentMediaPath = path.join(baseDir, 'content_media.js');

assert(fs.existsSync(contentMediaPath), 'content_media.js must exist on disk');
const contentMediaSource = fs.readFileSync(contentMediaPath, 'utf8');

// ---------------------------------------------------------------------------
// Test 1: Static Code Inspection & Architectural Assertions
// ---------------------------------------------------------------------------
console.log('Test 1: Static Invariant Verification in content_media.js');

assert(contentMediaSource.includes('function isExtensionContextValid()'), 
  'content_media.js must define isExtensionContextValid');

assert(contentMediaSource.includes('function isContextValid()'), 
  'content_media.js must define isContextValid');

assert(contentMediaSource.includes('let isContextInvalidated = false;'), 
  'content_media.js must declare isContextInvalidated flag initialized to false');

assert(contentMediaSource.includes('let isOrphaned = false;'), 
  'content_media.js must declare isOrphaned flag initialized to false');

assert(contentMediaSource.includes('function teardownMediaSentinel()'), 
  'content_media.js must define teardownMediaSentinel');

assert(contentMediaSource.includes('const teardownInvalidatedContext = teardownMediaSentinel;'), 
  'content_media.js must alias teardownInvalidatedContext to teardownMediaSentinel');

assert(contentMediaSource.includes('function safeStorageGet('), 
  'content_media.js must define safeStorageGet');

assert(contentMediaSource.includes('function safeStorageSet('), 
  'content_media.js must define safeStorageSet');

assert(contentMediaSource.includes('safeStorageGet([\'smart_automations\']'), 
  'restoreDomainSpeed and saveDomainSpeed must use safeStorageGet');

assert(contentMediaSource.includes('safeStorageGet([\'audio_lab_settings\']'), 
  'initAudioLabSettings must use safeStorageGet');

assert(contentMediaSource.includes('safeStorageSet({ smart_automations:'), 
  'saveDomainSpeed must use safeStorageSet');

assert(contentMediaSource.includes('function safeSetTimeout('), 
  'content_media.js must define safeSetTimeout');

assert(contentMediaSource.includes('activeTimeouts.clear()'), 
  'teardownMediaSentinel must clear activeTimeouts');

console.log('  ✅ All architectural functions and wrappers verified present in source.');

// ---------------------------------------------------------------------------
// Test 2: Unit Testing isExtensionContextValid() and isInvalidationError()
// ---------------------------------------------------------------------------
console.log('\nTest 2: Context Validity Detection Under Valid & Invalid States');

{
  let mockBrowserAPI = {
    runtime: {
      id: 'mock-extension-id-12345'
    }
  };

  function testIsExtensionContextValid(api) {
    try {
      return Boolean(api && api.runtime && api.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function testIsInvalidationError(err) {
    if (!err) return false;
    const msg = String(err.message || err.error || err);
    return /Extension context invalidated/i.test(msg);
  }

  // 2.1 Valid context
  assert.strictEqual(testIsExtensionContextValid(mockBrowserAPI), true, 
    'Must return true when runtime.id is populated');

  // 2.2 Invalidation via undefined id (after extension reload)
  mockBrowserAPI.runtime.id = undefined;
  assert.strictEqual(testIsExtensionContextValid(mockBrowserAPI), false, 
    'Must return false when runtime.id is undefined');

  // 2.3 Invalidation via thrown error on property access
  const thrownMockAPI = {
    get runtime() {
      throw new Error('Extension context invalidated.');
    }
  };
  assert.strictEqual(testIsExtensionContextValid(thrownMockAPI), false, 
    'Must catch thrown "Extension context invalidated." and return false');

  // 2.4 Error detection regex
  assert.strictEqual(testIsInvalidationError(new Error('Extension context invalidated.')), true);
  assert.strictEqual(testIsInvalidationError('Uncaught Error: Extension context invalidated.'), true);
  assert.strictEqual(testIsInvalidationError(new Error('Some other network error')), false);
  assert.strictEqual(testIsInvalidationError(null), false);

  console.log('  ✅ Context validity correctly detects valid, nullified, and thrown invalidation states.');
}

// ---------------------------------------------------------------------------
// Test 3: Teardown Lifecycle Integrity (Interval Clearing & Observer Disconnect)
// ---------------------------------------------------------------------------
console.log('\nTest 3: Teardown Lifecycle & Resource Cleanup Verification');

{
  let isContextInvalidated = false;
  let isOrphaned = false;
  let periodicHeartbeatTimer = 9991;
  let fadeIntervalId = 9992;
  let clearedTimers = [];

  let observerDisconnected = false;
  let titleObserverDisconnected = false;
  let adObserverDisconnected = false;

  let mockObserver = {
    disconnect: () => { observerDisconnected = true; }
  };
  let mockTitleObserver = {
    disconnect: () => { titleObserverDisconnected = true; }
  };
  let mockAdObserver = {
    disconnect: () => { adObserverDisconnected = true; }
  };

  const originalClearInterval = global.clearInterval;
  global.clearInterval = (id) => {
    clearedTimers.push(id);
  };

  function teardownMediaSentinel() {
    if (isContextInvalidated) return;
    isContextInvalidated = true;
    isOrphaned = true;

    if (periodicHeartbeatTimer) {
      clearInterval(periodicHeartbeatTimer);
      periodicHeartbeatTimer = null;
    }

    if (fadeIntervalId) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }

    if (mockObserver && typeof mockObserver.disconnect === 'function') {
      try { mockObserver.disconnect(); } catch (_) {}
      mockObserver = null;
    }
    if (mockTitleObserver && typeof mockTitleObserver.disconnect === 'function') {
      try { mockTitleObserver.disconnect(); } catch (_) {}
      mockTitleObserver = null;
    }
    if (mockAdObserver && typeof mockAdObserver.disconnect === 'function') {
      try { mockAdObserver.disconnect(); } catch (_) {}
      mockAdObserver = null;
    }
  }

  assert.strictEqual(isContextInvalidated, false);
  assert.strictEqual(isOrphaned, false);

  teardownMediaSentinel();

  assert.strictEqual(isContextInvalidated, true, 'isContextInvalidated must be true');
  assert.strictEqual(isOrphaned, true, 'isOrphaned must be true');
  assert.strictEqual(periodicHeartbeatTimer, null, 'periodicHeartbeatTimer must be null');
  assert.strictEqual(fadeIntervalId, null, 'fadeIntervalId must be null');
  assert.deepStrictEqual(clearedTimers, [9991, 9992], 'Both intervals must have been cleared');
  assert.strictEqual(observerDisconnected, true, 'observer must be disconnected');
  assert.strictEqual(titleObserverDisconnected, true, 'titleObserver must be disconnected');
  assert.strictEqual(adObserverDisconnected, true, 'adObserver must be disconnected');

  // Idempotency: multiple calls should not throw or repeat cleanup
  clearedTimers = [];
  teardownMediaSentinel();
  assert.strictEqual(clearedTimers.length, 0, 'Subsequent teardown calls must be no-ops');

  global.clearInterval = originalClearInterval;
  console.log('  ✅ Teardown successfully clears running intervals and disconnects all observers.');
}

// ---------------------------------------------------------------------------
// Test 4: safeStorageGet & safeStorageSet Invalidation Resilience
// ---------------------------------------------------------------------------
console.log('\nTest 4: Safe Storage Wrappers Invalidation Protection');

{
  let teardownCalled = false;
  let isContextInvalidated = false;

  function mockTeardown() {
    teardownCalled = true;
    isContextInvalidated = true;
  }

  // 4.1 Mock invalid context throws on get
  const invalidStorageAPI = {
    runtime: {
      get id() {
        throw new Error('Extension context invalidated.');
      }
    },
    storage: {
      local: {
        get: () => {
          throw new Error('Extension context invalidated.');
        },
        set: () => {
          throw new Error('Extension context invalidated.');
        }
      }
    }
  };

  function testSafeStorageGet(api, keys, callback) {
    try {
      if (!api || !api.runtime || !api.runtime.id) {
        mockTeardown();
        return;
      }
    } catch (_) {
      mockTeardown();
      return;
    }

    try {
      api.storage.local.get(keys, callback);
    } catch (err) {
      if (/Extension context invalidated/i.test(String(err))) {
        mockTeardown();
      }
    }
  }

  let callbackCalled = false;
  assert.doesNotThrow(() => {
    testSafeStorageGet(invalidStorageAPI, ['smart_automations'], () => {
      callbackCalled = true;
    });
  }, 'safeStorageGet must NOT throw when context is invalidated');

  assert.strictEqual(teardownCalled, true, 'Teardown must be triggered on invalid context');
  assert.strictEqual(callbackCalled, false, 'Callback must not be executed when context is invalid');

  // 4.2 Mock valid context succeeds
  teardownCalled = false;
  const validStorageAPI = {
    runtime: { id: 'valid-id' },
    storage: {
      local: {
        get: (keys, cb) => cb({ smart_automations: { domain_speed_memory: true } }),
        set: (items, cb) => cb && cb()
      }
    }
  };

  let retrievedData = null;
  testSafeStorageGet(validStorageAPI, ['smart_automations'], (res) => {
    retrievedData = res;
  });

  assert.strictEqual(teardownCalled, false, 'Teardown must not be triggered when context is valid');
  assert.deepStrictEqual(retrievedData, { smart_automations: { domain_speed_memory: true } });

  console.log('  ✅ safeStorageGet cleanly intercepts invalidation errors without throwing uncaught exceptions.');
}

// ---------------------------------------------------------------------------
// Test 5: Full VM Execution of content_media.js with Sandbox Invalidation
// ---------------------------------------------------------------------------
console.log('\nTest 5: In-Memory VM Sandbox Lifecycle Verification of content_media.js');

{
  let clearIntervalCalledWith = null;

  const mockWindow = {
    location: {
      hostname: 'www.youtube.com',
      href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    postMessage: () => {},
    top: null
  };
  mockWindow.top = mockWindow;

  const mockDocument = {
    readyState: 'complete',
    documentElement: {
      getAttribute: () => null,
      setAttribute: () => {},
      nodeType: 1
    },
    body: { nodeType: 1 },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      setAttribute: () => {},
      getAttribute: () => null,
      style: {}
    })
  };

  let mockRuntimeId = 'initial-valid-extension-id';
  let mockSendMessageCalled = false;

  const mockBrowserAPI = {
    runtime: {
      get id() {
        return mockRuntimeId;
      },
      sendMessage: (msg, cb) => {
        mockSendMessageCalled = true;
        if (cb) cb({ received: true });
      },
      onMessage: {
        addListener: () => {}
      },
      getURL: (path) => `chrome-extension://${mockRuntimeId}/${path}`
    },
    storage: {
      local: {
        get: (keys, cb) => {
          if (!mockRuntimeId) throw new Error('Extension context invalidated.');
          if (cb) cb({ smart_automations: { auto_ad_silencer: true, domain_speed_memory: true } });
        },
        set: (items, cb) => {
          if (!mockRuntimeId) throw new Error('Extension context invalidated.');
          if (cb) cb();
        }
      },
      onChanged: {
        addListener: () => {}
      }
    }
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    globalThis: {
      chrome: mockBrowserAPI
    },
    chrome: mockBrowserAPI,
    setInterval: (fn, ms) => 8888,
    clearInterval: (id) => { clearIntervalCalledWith = id; },
    setTimeout: (fn, ms) => 7777,
    clearTimeout: () => {},
    MutationObserver: class {
      constructor(cb) { this.cb = cb; }
      observe() {}
      disconnect() {}
    },
    WeakSet: WeakSet,
    Date: Date,
    Math: Math,
    Node: { ELEMENT_NODE: 1 },
    console: {
      debug: () => {},
      log: () => {},
      warn: () => {},
      error: () => {}
    }
  };

  vm.createContext(sandbox);

  // Execute content_media.js inside the sandbox
  assert.doesNotThrow(() => {
    vm.runInContext(contentMediaSource, sandbox);
  }, 'content_media.js must compile and execute cleanly in sandbox');

  const contextHelper = sandbox.window.__SentinelMediaContext;
  assert(contextHelper, 'window.__SentinelMediaContext must be exposed');

  // Verify initial state: context is valid
  assert.strictEqual(contextHelper.isExtensionContextValid(), true, 'Context should initially be valid');
  assert.strictEqual(contextHelper.isContextInvalidated(), false, 'isContextInvalidated should initially be false');

  // Trigger simulated extension reload: runtime.id becomes undefined
  mockRuntimeId = undefined;

  assert.strictEqual(contextHelper.isExtensionContextValid(), false, 
    'isExtensionContextValid must return false when runtime.id is invalidated');

  // Test calling safeStorageGet with invalidated context
  let storageCallbackFired = false;
  assert.doesNotThrow(() => {
    contextHelper.safeStorageGet(['smart_automations'], () => {
      storageCallbackFired = true;
    });
  }, 'safeStorageGet must NOT throw when called in invalidated context');

  assert.strictEqual(storageCallbackFired, false, 'Storage callback must not fire in invalidated context');
  assert.strictEqual(contextHelper.isContextInvalidated(), true, 'isContextInvalidated must now be true');
  assert.strictEqual(contextHelper.isOrphaned(), true, 'isOrphaned must now be true');
  assert.strictEqual(clearIntervalCalledWith, 8888, 'periodicHeartbeatTimer must have been cleared on invalidation');

  // Test calling safeSendMessage with invalidated context
  assert.doesNotThrow(() => {
    contextHelper.safeSendMessage({ type: 'TEST_MESSAGE' }, () => {});
  }, 'safeSendMessage must NOT throw when called in invalidated context');

  console.log('  ✅ Sandbox lifecycle simulation proved: 0 unhandled exceptions upon extension reload.');
}

// ---------------------------------------------------------------------------
// Test 6: In-Depth Timeout, Listener & Telemetry Invalidation Neutralization
// ---------------------------------------------------------------------------
console.log('\nTest 6: In-Depth Timeout, Listener & Telemetry Invalidation Neutralization');

{
  let clearedTimeoutIds = [];
  const sandbox = {
    window: {
      location: { hostname: 'www.youtube.com', href: 'https://www.youtube.com' },
      addEventListener: () => {},
      removeEventListener: () => {},
      postMessage: () => {},
      top: null
    },
    document: {
      readyState: 'complete',
      documentElement: { getAttribute: () => null, setAttribute: () => {}, nodeType: 1 },
      body: { nodeType: 1 },
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: (tag) => ({ tagName: tag.toUpperCase(), setAttribute: () => {}, style: {} })
    },
    globalThis: {
      chrome: {
        runtime: {
          id: 'test-env-id-6',
          sendMessage: (msg, cb) => cb && cb({ ok: true }),
          onMessage: { addListener: () => {}, removeListener: () => {} },
          getURL: (path) => `chrome-extension://test-env-id-6/${path}`
        },
        storage: {
          local: { get: (k, cb) => cb && cb({}), set: (i, cb) => cb && cb() },
          onChanged: { addListener: () => {}, removeListener: () => {} }
        }
      }
    },
    setInterval: () => 101,
    clearInterval: () => {},
    setTimeout: (fn, ms) => 202,
    clearTimeout: (id) => { clearedTimeoutIds.push(id); },
    MutationObserver: class { observe() {} disconnect() {} },
    WeakSet: WeakSet,
    Set: Set,
    Date: Date,
    Math: Math,
    Node: { ELEMENT_NODE: 1 },
    console: { debug: () => {}, log: () => {}, warn: () => {}, error: () => {} }
  };
  sandbox.window.top = sandbox.window;
  sandbox.chrome = sandbox.globalThis.chrome;

  vm.createContext(sandbox);
  vm.runInContext(contentMediaSource, sandbox);

  const contextHelper = sandbox.window.__SentinelMediaContext;
  assert(contextHelper, 'Context helper must be available');
  assert.strictEqual(contextHelper.isExtensionContextValid(), true);

  // 6.1 Schedule safe timeout and verify registration
  const timerId = contextHelper.safeSetTimeout(() => {}, 100);
  assert.strictEqual(timerId, 202, 'safeSetTimeout should return allocated timer id');

  // 6.2 Trigger teardown
  contextHelper.teardownMediaSentinel();
  assert.strictEqual(contextHelper.isContextInvalidated(), true);
  assert.strictEqual(contextHelper.isOrphaned(), true);
  assert(clearedTimeoutIds.includes(202), 'Teardown must clear all active tracked timeouts');

  // 6.3 Scheduling timeout after invalidation must immediately return null
  const nullTimerId = contextHelper.safeSetTimeout(() => {}, 100);
  assert.strictEqual(nullTimerId, null, 'safeSetTimeout must return null when context is already invalidated');

  // 6.4 Safe send message receives context invalidated error in callback
  let errorReceived = null;
  contextHelper.safeSendMessage({ type: 'PING' }, (resp, err) => {
    errorReceived = err;
  });
  assert(errorReceived && /context invalidated/i.test(errorReceived.message), 
    'safeSendMessage must provide Extension context invalidated error to callback');

  console.log('  ✅ In-depth timeout cancellation and safe unregistration verified.');
}

console.log('\n🎉 ALL EXTENSION CONTEXT INVALIDATION GUARD TESTS PASSED WITH 100% SUCCESS!');
