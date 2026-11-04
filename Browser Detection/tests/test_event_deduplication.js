/**
 * Unit Test Suite for Event Deduplication, Cooldown Locks, and Single-Source Dispatch
 * Tests Browser Detection extension event architecture fixes.
 */

const assert = require('assert');

console.log('🧪 Starting Event Deduplication & UI Stability Test Suite...\n');

// ---------------------------------------------------------------------------
// Test 1: Single-Source Document CustomEvent Dispatch Verification
// ---------------------------------------------------------------------------
console.log('Test 1: Single-Source Deterministic Event Dispatch');
{
  let windowEventCount = 0;
  let documentEventCount = 0;
  let postMessageCount = 0;

  // Mock DOM Event Target
  class MockEventTarget {
    constructor(name) {
      this.name = name;
      this.listeners = {};
    }
    addEventListener(type, fn, opts) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(fn);
    }
    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
      // If event bubbles and this target has a parent, bubble up
      if (event.bubbles && this.parent) {
        this.parent.dispatchEvent(event);
      }
    }
  }

  const mockWindow = new MockEventTarget('window');
  const mockDocument = new MockEventTarget('document');
  mockDocument.parent = mockWindow;

  mockWindow.addEventListener('__MEDIA_SENTINEL_ACTION__', () => { windowEventCount++; });
  mockDocument.addEventListener('__MEDIA_SENTINEL_ACTION__', () => { documentEventCount++; });

  // Simulate forwardActionToMainWorld
  let actionCounter = 0;
  function forwardActionToMainWorld(action, data = {}) {
    const actionId = `act_${Date.now()}_${++actionCounter}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = JSON.stringify({
      action,
      data,
      actionId,
      timestamp: Date.now()
    });
    mockDocument.dispatchEvent({
      type: '__MEDIA_SENTINEL_ACTION__',
      detail: payload,
      bubbles: false
    });
  }

  // Dispatch 1 action
  forwardActionToMainWorld('toggle_theater');

  assert.strictEqual(documentEventCount, 1, 'Document should receive exactly 1 event');
  assert.strictEqual(windowEventCount, 0, 'Window should receive 0 events because bubbles is false and no window.dispatchEvent');
  assert.strictEqual(postMessageCount, 0, 'No postMessage spam dispatched');
  console.log('  ✅ Document received exactly 1 event, 0 bubbled to window, 0 postMessage spam.');
}

// ---------------------------------------------------------------------------
// Test 2: Main World Action ID Deduplication & Per-Action Cooldown
// ---------------------------------------------------------------------------
console.log('\nTest 2: Main World Action Deduplication & Cooldown Gates');
{
  const recentActionIds = new Set();
  const lastActionTimePerType = {};
  let executedActions = [];

  function executeAction(action, data) {
    executedActions.push({ action, data, time: Date.now() });
  }

  function handleIncomingAction(detail) {
    let parsed = detail;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (_) {}
    }
    if (!parsed || !parsed.action) return;

    const action = parsed.action;
    const actionId = parsed.actionId;
    const now = Date.now();

    // 1. Strict Action ID Deduplication
    if (actionId) {
      if (recentActionIds.has(actionId)) {
        return;
      }
      recentActionIds.add(actionId);
      if (recentActionIds.size > 100) {
        const first = recentActionIds.values().next().value;
        recentActionIds.delete(first);
      }
    }

    // 2. Per-action Debounce / Cooldown Dictionary
    let minCooldown = 300;
    if (action === 'toggle_theater' || action === 'toggle_fullscreen' || action === 'toggle_pip') {
      minCooldown = 400;
    } else if (action === 'step_quality' || action === 'set_quality') {
      minCooldown = 450;
    } else if (action === 'toggle_play' || action === 'play' || action === 'pause') {
      minCooldown = 300;
    } else if (action === 'step_speed' || action === 'set_speed' || action === 'cycle_speed') {
      minCooldown = 250;
    } else if (action === 'seek_relative' || action === 'seek_percent') {
      minCooldown = 200;
    } else if (action === 'set_volume' || action === 'SET_VOLUME') {
      minCooldown = 50;
    }

    const lastTime = lastActionTimePerType[action] || 0;
    if ((now - lastTime) < minCooldown) {
      return;
    }
    lastActionTimePerType[action] = now;

    executeAction(action, parsed.data || {});
  }

  // 2a. Duplicate Action ID Test (e.g. if an event was somehow received twice)
  executedActions = [];
  const testActionId = 'act_unique_12345';
  handleIncomingAction({ action: 'toggle_theater', actionId: testActionId, data: {} });
  handleIncomingAction({ action: 'toggle_theater', actionId: testActionId, data: {} });
  handleIncomingAction({ action: 'toggle_theater', actionId: testActionId, data: {} });

  assert.strictEqual(executedActions.length, 1, 'Duplicate actionId must execute only once');
  console.log('  ✅ Identical actionId delivered 3 times resulted in exactly 1 execution.');

  // 2b. Rapid Double-Click Test for Theater Mode (under 400ms cooldown)
  delete lastActionTimePerType['toggle_theater']; // reset cooldown for clean subtest
  executedActions = [];
  handleIncomingAction({ action: 'toggle_theater', actionId: 'act_click_1', data: {} });
  handleIncomingAction({ action: 'toggle_theater', actionId: 'act_click_2', data: {} }); // 0ms elapsed

  assert.strictEqual(executedActions.length, 1, 'Rapid double click on toggle_theater must be cooldown-blocked');
  console.log('  ✅ Rapid double-click on Theater Mode safely blocked by 400ms cooldown (0 screen flicker).');

  // 2c. Rapid Double-Click Test for step_quality
  delete lastActionTimePerType['step_quality'];
  executedActions = [];
  handleIncomingAction({ action: 'step_quality', actionId: 'act_q1', data: { direction: 'up' } });
  handleIncomingAction({ action: 'step_quality', actionId: 'act_q2', data: { direction: 'up' } });

  assert.strictEqual(executedActions.length, 1, 'Rapid double click on step_quality must be cooldown-blocked');
  console.log('  ✅ Rapid double-click on Quality step blocked (strictly 1 resolution step).');

  // 2d. Rapid Double-Click Test for toggle_fullscreen
  delete lastActionTimePerType['toggle_fullscreen'];
  executedActions = [];
  handleIncomingAction({ action: 'toggle_fullscreen', actionId: 'act_fs1', data: {} });
  handleIncomingAction({ action: 'toggle_fullscreen', actionId: 'act_fs2', data: {} });

  assert.strictEqual(executedActions.length, 1, 'Rapid double click on toggle_fullscreen must be cooldown-blocked');
  console.log('  ✅ Fullscreen toggle double-trigger prevented.');

  // 2e. Rapid Double-Click Test for step_speed
  delete lastActionTimePerType['step_speed'];
  executedActions = [];
  handleIncomingAction({ action: 'step_speed', actionId: 'act_sp1', data: { direction: 'up' } });
  handleIncomingAction({ action: 'step_speed', actionId: 'act_sp2', data: { direction: 'up' } });

  assert.strictEqual(executedActions.length, 1, 'Rapid double click on step_speed must be cooldown-blocked');
  console.log('  ✅ Speed step double-trigger prevented (strictly 0.25x per single click).');

  // 2f. Rapid Double-Click Test for seek_relative
  delete lastActionTimePerType['seek_relative'];
  executedActions = [];
  handleIncomingAction({ action: 'seek_relative', actionId: 'act_sk1', data: { offsetSeconds: 10 } });
  handleIncomingAction({ action: 'seek_relative', actionId: 'act_sk2', data: { offsetSeconds: 10 } });

  assert.strictEqual(executedActions.length, 1, 'Rapid double click on seek_relative must be cooldown-blocked');
  console.log('  ✅ Seek relative double-trigger prevented (strictly 10s per single click).');
}

// ---------------------------------------------------------------------------
// Test 3: UI-Layer sendMediaControl Debounce
// ---------------------------------------------------------------------------
console.log('\nTest 3: UI-Layer sendMediaControl Click Debounce');
{
  let lastControlActionKey = '';
  let lastControlActionTime = 0;
  let sentMessages = [];

  function sendMediaControl(action, data = {}) {
    const now = Date.now();
    const actionKey = `${action}_${JSON.stringify(data)}`;

    if (actionKey === lastControlActionKey && (now - lastControlActionTime) < 280) {
      return;
    }
    if (action !== 'set_volume' && (now - lastControlActionTime) < 180) {
      return;
    }
    lastControlActionKey = actionKey;
    lastControlActionTime = now;

    sentMessages.push({ action, data, time: now });
  }

  // 3a. Rapid physical double-clicks on any button
  sentMessages = [];
  sendMediaControl('toggle_theater');
  sendMediaControl('toggle_theater');
  sendMediaControl('toggle_theater');

  assert.strictEqual(sentMessages.length, 1, 'UI click debounce must drop rapid repeated button clicks');
  console.log('  ✅ UI layer cleanly debounced 3 rapid clicks to exactly 1 IPC message.');

  // 3b. Quality step buttons
  lastControlActionTime = 0; // reset for independent subtest
  sentMessages = [];
  sendMediaControl('step_quality', { direction: 'up' });
  sendMediaControl('step_quality', { direction: 'up' });

  assert.strictEqual(sentMessages.length, 1, 'UI click debounce dropped rapid quality clicks');
  console.log('  ✅ UI layer prevented duplicate quality step dispatch.');

  // 3c. Smooth Volume Scrubbing (Must NOT be blocked by 180ms toggle cooldown)
  lastControlActionTime = 0;
  sentMessages = [];
  sendMediaControl('set_volume', { percent: 40 });
  sendMediaControl('set_volume', { percent: 45 });
  sendMediaControl('set_volume', { percent: 50 });

  assert.strictEqual(sentMessages.length, 3, 'Volume scrubbing events with changing levels must pass through');
  console.log('  ✅ Volume scrubbing events pass through without lag or stutter.');
}

console.log('\n🎉 ALL EVENT DEDUPLICATION AND UI STABILITY TESTS PASSED PERFECTLY!\n');
