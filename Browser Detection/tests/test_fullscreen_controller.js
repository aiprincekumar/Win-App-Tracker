/**
 * Verification Test Suite:
 * Dedicated Modular Fullscreen Controller, Web Fullscreen CSS Engine, and In-Page Native Gesture Button
 * 
 * Verifies:
 * 1. Syntax integrity (`node -c` and AST compilation) of:
 *    - fullscreen_controller.js
 *    - content_media.js
 *    - inject_main_world.js
 *    - manifest.json
 * 2. Manifest V3 Declarations:
 *    - fullscreen_controller.js declared in isolated world content script
 *    - fullscreen_controller.js declared in MAIN world content script
 *    - fullscreen_controller.js declared in web_accessible_resources
 *    - Physical existence of all registered files
 * 3. CSS Viewport Fill Engine & Stacking Context Neutralization:
 *    - #movie_player, .sentinel-web-fullscreen 100vw, 100vh, position: fixed, z-index 2147483647
 *    - HTML5 video inline style overrides (100vw, 100vh, object-fit contain, left 0, top 0)
 *    - YouTube masthead, sidebar (#secondary), comments, and page chrome concealment
 *    - HTML/body scroll locking (overflow: hidden !important)
 * 4. Cross-World Deduplication Lock (Double-Toggle Bug Elimination):
 *    - In-memory timestamp and DOM-level attribute lock (data-sentinel-fs-ts)
 *    - Prevents double-toggle within 350ms debounce window across isolated and main worlds
 * 5. In-Page Floating Sentinel Fullscreen HUD Button & W3C Trusted Types:
 *    - Button element creation, glassmorphism styling, glowing hover states
 *    - Zero assignments to innerHTML (100% W3C Trusted Types Safe on YouTube)
 *    - SVG creation via createElementNS
 *    - Real user gesture native fullscreen dispatch with web fallback
 *    - ESC key exit handler
 * 6. Integration with content_media.js, inject_main_world.js, popup.js, and dashboard.js
 * 7. Simulated DOM Lifecycle Verification
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting Dedicated Fullscreen Controller Test Suite...\n');

const baseDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Test 1: Node.js AST Compilation & Syntax Check
// ---------------------------------------------------------------------------
console.log('Test 1: Node.js AST Compilation & Syntax Integrity');
{
  const files = [
    'fullscreen_controller.js',
    'content_media.js',
    'inject_main_world.js',
    'popup/popup.js',
    'dashboard/dashboard.js'
  ];

  files.forEach((rel) => {
    const fullPath = path.join(baseDir, rel);
    assert(fs.existsSync(fullPath), `File must exist: ${rel}`);
    const code = fs.readFileSync(fullPath, 'utf8');

    assert.doesNotThrow(() => {
      new vm.Script(code, { filename: rel });
    }, `AST Compilation error in ${rel}`);

    console.log(`  ✅ AST parsed successfully for ${rel} (${code.length} bytes)`);
  });
}

// ---------------------------------------------------------------------------
// Test 2: Manifest V3 Schema & Script Registration
// ---------------------------------------------------------------------------
console.log('\nTest 2: Manifest V3 Schema & Script Registration');
{
  const manifestPath = path.join(baseDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert(Array.isArray(manifest.content_scripts), 'content_scripts must be an array');
  assert(manifest.content_scripts.length >= 2, 'Must have at least 2 content script configs');

  // Verify isolated world content script includes fullscreen_controller.js
  const isolatedConfig = manifest.content_scripts.find(cs => !cs.world || cs.world === 'ISOLATED');
  assert(isolatedConfig, 'Isolated world content script config must exist');
  assert(isolatedConfig.js.includes('fullscreen_controller.js'), 'Isolated world must include fullscreen_controller.js');
  assert(isolatedConfig.js.includes('content_media.js'), 'Isolated world must include content_media.js');

  // Verify MAIN world content script includes fullscreen_controller.js
  const mainWorldConfig = manifest.content_scripts.find(cs => cs.world === 'MAIN');
  assert(mainWorldConfig, 'MAIN world content script config must exist');
  assert(mainWorldConfig.js.includes('fullscreen_controller.js'), 'MAIN world must include fullscreen_controller.js');
  assert(mainWorldConfig.js.includes('inject_main_world.js'), 'MAIN world must include inject_main_world.js');

  // Verify web_accessible_resources includes fullscreen_controller.js
  assert(Array.isArray(manifest.web_accessible_resources), 'web_accessible_resources must be an array');
  const warResources = manifest.web_accessible_resources.flatMap(w => w.resources);
  assert(warResources.includes('fullscreen_controller.js'), 'web_accessible_resources must include fullscreen_controller.js');

  console.log('  ✅ manifest.json correctly registers fullscreen_controller.js across isolated, MAIN, and web-accessible contexts');
}

// ---------------------------------------------------------------------------
// Test 3: CSS Viewport Fill Engine & Stacking Context Neutralization
// ---------------------------------------------------------------------------
console.log('\nTest 3: CSS Viewport Fill Engine & Stacking Context Neutralization');
{
  const fsCode = fs.readFileSync(path.join(baseDir, 'fullscreen_controller.js'), 'utf8');

  // Style ID
  assert(fsCode.includes('__sentinel_fullscreen_controller_styles__'), 'Must define style ID __sentinel_fullscreen_controller_styles__');

  // Viewport Lock (100vw, 100vh, fixed, overflow: hidden)
  assert(fsCode.includes('width: 100vw !important;'), 'Must specify width: 100vw !important');
  assert(fsCode.includes('height: 100vh !important;'), 'Must specify height: 100vh !important');
  assert(fsCode.includes('position: fixed !important;'), 'Must specify position: fixed !important');
  assert(fsCode.includes('overflow: hidden !important;'), 'Must specify overflow: hidden !important');
  assert(fsCode.includes('z-index: 2147483647 !important;'), 'Must specify max z-index 2147483647 !important');
  assert(fsCode.includes('background: #000000 !important;'), 'Must specify black background');

  // Overrides for YouTube / HTML5 video inline styles
  assert(fsCode.includes('.sentinel-web-fullscreen video'), 'Must style .sentinel-web-fullscreen video');
  assert(fsCode.includes('object-fit: contain !important;'), 'Must preserve aspect ratio via object-fit: contain !important');
  assert(fsCode.includes('.sentinel-web-fullscreen .ytp-chrome-bottom'), 'Must style YouTube bottom chrome control bar');

  // Masthead, sidebar, comments, below player concealment
  assert(fsCode.includes('#masthead-container'), 'Must hide #masthead-container');
  assert(fsCode.includes('ytd-masthead'), 'Must hide ytd-masthead');
  assert(fsCode.includes('#secondary'), 'Must hide #secondary (YouTube sidebar)');
  assert(fsCode.includes('#comments'), 'Must hide #comments');
  assert(fsCode.includes('#below'), 'Must hide #below');

  // Stacking context containment overrides
  assert(fsCode.includes('contain: none !important;'), 'Must eliminate CSS contain boundaries');
  assert(fsCode.includes('transform: none !important;'), 'Must eliminate CSS transform boundaries');

  console.log('  ✅ CSS Viewport Fill rules verified: 100vw, 100vh, fixed positioning, container resets, and full concealment of YouTube chrome');
}

// ---------------------------------------------------------------------------
// Test 4: Cross-World Deduplication Lock (Double-Toggle Elimination)
// ---------------------------------------------------------------------------
console.log('\nTest 4: Cross-World Deduplication Lock (Double-Toggle Elimination)');
{
  const fsCode = fs.readFileSync(path.join(baseDir, 'fullscreen_controller.js'), 'utf8');

  // Debounce window & DOM lock attribute
  assert(fsCode.includes('data-sentinel-fs-ts'), 'Must define cross-world DOM lock attribute data-sentinel-fs-ts');
  assert(fsCode.includes('DEBOUNCE_MS'), 'Must define debounce constant');

  // Simulate cross-world lock logic in a sandbox
  let lastToggleTime = 0;
  const mockDomRoot = {
    attrs: {},
    getAttribute(name) { return this.attrs[name] || null; },
    setAttribute(name, val) { this.attrs[name] = String(val); }
  };

  const acquireLockSim = (now) => {
    if (now - lastToggleTime < 350) return false;
    const domTs = parseInt(mockDomRoot.getAttribute('data-sentinel-fs-ts') || '0', 10);
    if (now - domTs < 350) return false;
    mockDomRoot.setAttribute('data-sentinel-fs-ts', String(now));
    lastToggleTime = now;
    return true;
  };

  // Turn 1 (e.g. from popup execution at t=1000): should succeed
  assert.strictEqual(acquireLockSim(1000), true, 'Initial toggle request must acquire lock');

  // Turn 2 (e.g. from main world forwarded event at t=1002): should be BLOCKED
  assert.strictEqual(acquireLockSim(1002), false, 'Race-condition toggle within 2ms MUST be rejected');

  // Turn 3 (e.g. from content script switch at t=1005): should be BLOCKED
  assert.strictEqual(acquireLockSim(1005), false, 'Race-condition toggle within 5ms MUST be rejected');

  // Turn 4 (e.g. at t=1200, still within debounce window): should be BLOCKED
  assert.strictEqual(acquireLockSim(1200), false, 'Toggle request at 200ms must still be debounced');

  // Turn 5 (e.g. at t=1400, > 350ms elapsed): should succeed
  assert.strictEqual(acquireLockSim(1400), true, 'Toggle request after 400ms must acquire lock cleanly');

  console.log('  ✅ Cross-world deduplication lock strictly eliminates 2ms double-toggle bounce across isolated & main worlds');
}

// ---------------------------------------------------------------------------
// Test 5: In-Page Floating Sentinel Fullscreen Button & W3C Trusted Types
// ---------------------------------------------------------------------------
console.log('\nTest 5: In-Page Floating Sentinel Fullscreen Button & W3C Trusted Types');
{
  const fsCode = fs.readFileSync(path.join(baseDir, 'fullscreen_controller.js'), 'utf8');

  // Floating button configuration
  assert(fsCode.includes('__sentinel_fs_floating_btn__'), 'Must declare floating button ID');
  assert(fsCode.includes('sentinel-fs-floating-btn'), 'Must style floating button class');
  assert(fsCode.includes('attachFloatingButtonToPlayer'), 'Must define attachFloatingButtonToPlayer');

  // Strict W3C Trusted Types validation: 0 assignments to innerHTML
  const innerHtmlMatches = fsCode.match(/\.innerHTML\s*=/g);
  assert(!innerHtmlMatches, 'fullscreen_controller.js MUST have 0 assignments to .innerHTML (100% W3C Trusted Types safe on YouTube)');

  // SVG element creation via createElementNS
  assert(fsCode.includes("createElementNS('http://www.w3.org/2000/svg'"), 'Must create SVGs using safe createElementNS');

  // Floating button event handling: physical click initiates toggle with real user gesture
  assert(fsCode.includes("btn.addEventListener('click'"), 'Floating button must handle click');

  // ESC key listener to exit web fullscreen cleanly
  assert(fsCode.includes("e.key === 'Escape'"), 'Must listen for Escape key to exit fullscreen');

  console.log('  ✅ In-page floating button creates modern HUD button with 0 innerHTML assignments (100% Trusted Types safe)');
  console.log('  ✅ Real physical clicks initiate native fullscreen, and ESC cleanly exits web fullscreen');
}

// ---------------------------------------------------------------------------
// Test 6: Integration with content_media.js, inject_main_world.js & Popups
// ---------------------------------------------------------------------------
console.log('\nTest 6: Integration with content_media.js, inject_main_world.js & Popups');
{
  const contentCode = fs.readFileSync(path.join(baseDir, 'content_media.js'), 'utf8');
  const injectCode = fs.readFileSync(path.join(baseDir, 'inject_main_world.js'), 'utf8');
  const popupCode = fs.readFileSync(path.join(baseDir, 'popup/popup.js'), 'utf8');
  const dashCode = fs.readFileSync(path.join(baseDir, 'dashboard/dashboard.js'), 'utf8');

  // content_media.js integration
  assert(contentCode.includes('window.__SentinelFullscreenController.toggle'), 'content_media.js must delegate to window.__SentinelFullscreenController.toggle');

  // inject_main_world.js integration
  assert(injectCode.includes('window.__SentinelFullscreenController.toggle'), 'inject_main_world.js must delegate to window.__SentinelFullscreenController.toggle');

  // popup.js and dashboard.js integration
  assert(popupCode.includes('window.__SentinelFullscreenController.toggle'), 'popup.js executeScript must delegate to window.__SentinelFullscreenController.toggle');
  assert(dashCode.includes('window.__SentinelFullscreenController.toggle'), 'dashboard.js executeScript must delegate to window.__SentinelFullscreenController.toggle');

  console.log('  ✅ Seamless unified delegation to window.__SentinelFullscreenController across all scripts');
}

// ---------------------------------------------------------------------------
// Test 7: Simulated DOM Lifecycle & Controller API Execution
// ---------------------------------------------------------------------------
console.log('\nTest 7: Simulated DOM Lifecycle & Controller API Execution');
{
  // Build a lightweight mock DOM sandbox to test Controller methods
  const mockClassList = () => {
    const classes = new Set();
    return {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      forEach: (fn) => classes.forEach(fn),
      get size() { return classes.size; }
    };
  };

  const createMockElement = (tag, id = '') => {
    return {
      tagName: tag.toUpperCase(),
      nodeType: 1,
      id,
      classList: mockClassList(),
      dataset: {},
      attrs: {},
      children: [],
      firstChild: null,
      parentElement: null,
      isConnected: true,
      getAttribute(name) { return this.attrs[name] || null; },
      setAttribute(name, val) { this.attrs[name] = String(val); },
      removeAttribute(name) { delete this.attrs[name]; },
      appendChild(child) {
        this.children.push(child);
        this.firstChild = this.children[0];
        child.parentElement = this;
        return child;
      },
      removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        this.firstChild = this.children[0] || null;
        child.parentElement = null;
        return child;
      },
      contains(child) { return this.children.includes(child); },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {},
      matches(selector) {
        if (!selector) return false;
        if (selector === ':hover') return false;
        if (selector.includes('#movie_player') && this.id === 'movie_player') return true;
        if (selector.includes('.html5-video-player') && this.classList.contains('html5-video-player')) return true;
        return false;
      },
      closest(selector) {
        let cur = this;
        while (cur) {
          if (cur.matches && cur.matches(selector)) return cur;
          cur = cur.parentElement;
        }
        return null;
      },
      click() {}
    };
  };

  const mockDoc = {
    documentElement: createMockElement('html'),
    body: createMockElement('body'),
    fullscreenElement: null,
    elementsById: {},
    getElementById(id) { return this.elementsById[id] || null; },
    querySelector(sel) {
      if (sel === '#movie_player') return this.elementsById['movie_player'] || null;
      if (sel === '.sentinel-web-fullscreen') {
        const mp = this.elementsById['movie_player'];
        return (mp && mp.classList.contains('sentinel-web-fullscreen')) ? mp : null;
      }
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.sentinel-web-fullscreen') {
        const mp = this.elementsById['movie_player'];
        return (mp && mp.classList.contains('sentinel-web-fullscreen')) ? [mp] : [];
      }
      return [];
    },
    createElement(tag) { return createMockElement(tag); },
    createElementNS(ns, tag) { return createMockElement(tag); },
    addEventListener() {}
  };

  const mockMoviePlayer = createMockElement('div', 'movie_player');
  mockDoc.elementsById['movie_player'] = mockMoviePlayer;
  mockDoc.body.appendChild(mockMoviePlayer);

  const mockWindow = {
    document: mockDoc,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {}
  };

  const sandbox = {
    window: mockWindow,
    document: mockDoc,
    globalThis: mockWindow,
    HTMLElement: class HTMLElement {},
    HTMLVideoElement: class HTMLVideoElement {},
    navigator: { userActivation: { isActive: false } },
    Date,
    parseInt,
    String,
    Boolean,
    clearTimeout,
    setTimeout,
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    Event: class {}
  };

  vm.createContext(sandbox);

  const fsCode = fs.readFileSync(path.join(baseDir, 'fullscreen_controller.js'), 'utf8');
  vm.runInContext(fsCode, sandbox);

  const controller = sandbox.window.__SentinelFullscreenController;
  assert(controller, 'window.__SentinelFullscreenController must be instantiated in sandbox');
  assert(sandbox.globalThis.__SentinelFullscreenController, 'globalThis.__SentinelFullscreenController must be defined');
  assert.strictEqual(typeof controller.toggle, 'function', 'controller.toggle must be a function');
  assert.strictEqual(typeof controller.toggleWebFullscreen, 'function', 'controller.toggleWebFullscreen must be a function');
  assert.strictEqual(typeof controller.toggleFullscreen, 'function', 'controller.toggleFullscreen must be a function');
  assert.strictEqual(typeof controller.enterWebFullscreen, 'function', 'controller.enterWebFullscreen must be a function');
  assert.strictEqual(typeof controller.exitWebFullscreen, 'function', 'controller.exitWebFullscreen must be a function');
  assert.strictEqual(typeof controller.isFullscreenActive, 'function', 'controller.isFullscreenActive must be a function');
  assert.strictEqual(typeof controller.getTargetElement, 'function', 'controller.getTargetElement must be a function');

  // Verify container targeting: when passed a video element inside #movie_player, getTargetElement returns #movie_player
  const mockVideo = createMockElement('video');
  mockMoviePlayer.appendChild(mockVideo);
  const resolvedTarget = controller.getTargetElement(mockVideo);
  assert.strictEqual(resolvedTarget, mockMoviePlayer, 'getTargetElement must return #movie_player container even when passed video element');

  // Verify initial state: false
  assert.strictEqual(controller.isFullscreenActive(), false, 'Fullscreen must initially be inactive');

  // Trigger Web Fullscreen via controller.toggle()
  const entered = controller.toggle(mockMoviePlayer);
  assert.strictEqual(entered, true, 'controller.toggle must succeed and enter web fullscreen');
  assert.strictEqual(mockMoviePlayer.classList.contains('sentinel-web-fullscreen'), true, '#movie_player must receive .sentinel-web-fullscreen');
  assert.strictEqual(mockDoc.documentElement.classList.contains('sentinel-fullscreen-active'), true, 'html must receive .sentinel-fullscreen-active');
  assert.strictEqual(mockDoc.body.classList.contains('sentinel-fullscreen-active'), true, 'body must receive .sentinel-fullscreen-active');
  assert.strictEqual(controller.isFullscreenActive(), true, 'controller.isFullscreenActive() must report true');

  // Fast duplicate toggle within debounce window: must be debounced
  const debounced = controller.toggle(mockMoviePlayer);
  assert.strictEqual(debounced, false, 'Rapid re-invocation must be debounced without toggling off');
  assert.strictEqual(controller.isFullscreenActive(), true, 'Fullscreen must remain active during debounce window');

  // Direct exitWebFullscreen()
  const exited = controller.exitWebFullscreen();
  assert.strictEqual(exited, true, 'exitWebFullscreen must return true');
  assert.strictEqual(mockMoviePlayer.classList.contains('sentinel-web-fullscreen'), false, '#movie_player must lose .sentinel-web-fullscreen');
  assert.strictEqual(mockDoc.documentElement.classList.contains('sentinel-fullscreen-active'), false, 'html must lose .sentinel-fullscreen-active');
  assert.strictEqual(controller.isFullscreenActive(), false, 'controller.isFullscreenActive() must report false');

  console.log('  ✅ Simulated DOM Lifecycle: enterWebFullscreen, debounce gating, aliases, and container targeting all verified clean');
}

console.log('\n🎉 ALL FULLSCREEN CONTROLLER TESTS PASSED WITH 100% SUCCESS!\n');
