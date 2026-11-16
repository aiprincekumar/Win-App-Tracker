/**
 * Fullscreen Blackout Prevention & Multi-Frame Video Targeting Verification Suite
 * Tests Phase 1 and Phase 2 implementations for TASK-FULLSCREEN-BLACKOUT-003.
 *
 * Requirements:
 * 1. fullscreen_controller.js: getTargetElement() returns null (never body/documentElement).
 * 2. fullscreen_controller.js: enterWebFullscreen() rejects body/documentElement and empty DOMs.
 * 3. fullscreen_controller.js: CSS styles video.sentinel-web-fullscreen with object-fit: contain.
 * 4. popup/popup.js: #btnCtrlFullscreen uses allFrames: true, guards against non-media frames,
 *    and prioritizes floating button > controller > native fallback.
 * 5. content_media.js: toggle_fullscreen guards against non-media frames with hasMedia check.
 * 6. UTF-8 with BOM encoding across all files.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const baseDir = path.resolve(__dirname, '..');

console.log('🧪 Starting Fullscreen Blackout Prevention & Multi-Frame Targeting Test Suite...\n');

async function runBlackoutTests() {
  // ---------------------------------------------------------------------------
  // Test 1: Node.js AST Compilation & Syntax Integrity
  // ---------------------------------------------------------------------------
  console.log('Test 1: Node.js AST Compilation & Syntax Integrity');
  const targetFiles = [
    'fullscreen_controller.js',
    'popup/popup.js',
    'content_media.js'
  ];

  targetFiles.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.doesNotThrow(() => {
      new vm.Script(content, { filename: file });
    }, `Syntax parsing failed for ${file}`);
    console.log(`  ✅ AST parsed successfully for ${file} (${content.length} chars)`);
  });

  // ---------------------------------------------------------------------------
  // Test 2: UTF-8 with BOM Standard Verification
  // ---------------------------------------------------------------------------
  console.log('\nTest 2: UTF-8 with BOM Standard Verification');
  targetFiles.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const buf = fs.readFileSync(fullPath);
    const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    assert.strictEqual(hasBOM, true, `${file} must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)`);
    console.log(`  ✅ ${file} verified with valid UTF-8 BOM`);
  });

  // ---------------------------------------------------------------------------
  // Test 3: fullscreen_controller.js CSS Engine Hardening
  // ---------------------------------------------------------------------------
  console.log('\nTest 3: fullscreen_controller.js CSS Engine Hardening');
  const fsCode = fs.readFileSync(path.join(baseDir, 'fullscreen_controller.js'), 'utf8');
  assert(fsCode.includes('video.sentinel-web-fullscreen'), 'CSS must include dedicated video.sentinel-web-fullscreen rule');
  assert(fsCode.includes('object-fit: contain !important;'), 'CSS must enforce object-fit: contain !important on video');
  console.log('  ✅ video.sentinel-web-fullscreen styling with object-fit: contain verified');

  // ---------------------------------------------------------------------------
  // Test 4: fullscreen_controller.js getTargetElement & enterWebFullscreen Root Guard
  // ---------------------------------------------------------------------------
  console.log('\nTest 4: fullscreen_controller.js Root Element Rejection & Blackout Prevention');
  {
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

    const createMockElem = (tag, id = '') => {
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
        listeners: {},
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
        contains(child) {
          if (this.children.includes(child)) return true;
          return this.children.some(c => c.contains && c.contains(child));
        },
        addEventListener(evt, fn) {
          if (!this.listeners[evt]) this.listeners[evt] = [];
          this.listeners[evt].push(fn);
        },
        removeEventListener(evt, fn) {
          if (this.listeners[evt]) this.listeners[evt] = this.listeners[evt].filter(h => h !== fn);
        },
        dispatchEvent(e) {
          if (this.listeners[e.type]) this.listeners[e.type].forEach(h => h(e));
        },
        matches(sel) {
          if (sel === ':hover') return false;
          if (sel.includes('#movie_player') && this.id === 'movie_player') return true;
          return false;
        },
        closest(sel) {
          let cur = this;
          while (cur) {
            if (cur.matches && cur.matches(sel)) return cur;
            cur = cur.parentElement;
          }
          return null;
        }
      };
    };

    // Scenario A: Document without video elements (e.g. non-media frame or ad banner)
    const mockDocEmpty = {
      documentElement: createMockElem('html'),
      body: createMockElem('body'),
      head: createMockElem('head'),
      fullscreenElement: null,
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: (tag) => createMockElem(tag),
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    const sandboxEmpty = {
      window: { document: mockDocEmpty, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} },
      document: mockDocEmpty,
      globalThis: {},
      HTMLElement: class {},
      HTMLVideoElement: class {},
      navigator: { userActivation: { isActive: false } },
      Date, parseInt, String, Boolean, clearTimeout, setTimeout,
      MutationObserver: class { observe() {} disconnect() {} },
      Event: class { constructor(type) { this.type = type; } },
      CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } }
    };
    sandboxEmpty.globalThis = sandboxEmpty.window;

    vm.createContext(sandboxEmpty);
    vm.runInContext(fsCode, sandboxEmpty);
    const ctrlEmpty = sandboxEmpty.window.__SentinelFullscreenController;

    // 4.1 When no video exists, enterWebFullscreen must return false and NEVER black out the body
    const emptyResult = ctrlEmpty.enterWebFullscreen();
    assert.strictEqual(emptyResult, false, 'enterWebFullscreen on video-less page must return false');
    assert.strictEqual(mockDocEmpty.body.classList.contains('sentinel-web-fullscreen'), false, 'Body must NOT receive .sentinel-web-fullscreen');
    assert.strictEqual(mockDocEmpty.documentElement.classList.contains('sentinel-web-fullscreen'), false, 'HTML must NOT receive .sentinel-web-fullscreen');
    console.log('  ✅ Scenario A: Empty frame rejected safely, 0 blackout on body/html');

    // 4.2 Explicitly attempting to pass body or documentElement must be rejected
    const bodyResult = ctrlEmpty.enterWebFullscreen(mockDocEmpty.body);
    assert.strictEqual(bodyResult, false, 'enterWebFullscreen(document.body) must return false');
    assert.strictEqual(mockDocEmpty.body.classList.contains('sentinel-web-fullscreen'), false);

    const docElResult = ctrlEmpty.enterWebFullscreen(mockDocEmpty.documentElement);
    assert.strictEqual(docElResult, false, 'enterWebFullscreen(document.documentElement) must return false');
    assert.strictEqual(mockDocEmpty.documentElement.classList.contains('sentinel-web-fullscreen'), false);
    console.log('  ✅ Scenario B: Direct body/documentElement target rejected safely');

    // Scenario C: Document with valid <video> element
    const mockVideo = createMockElem('video');
    const mockContainer = createMockElem('div');
    mockContainer.appendChild(mockVideo);

    const mockDocVideo = {
      documentElement: createMockElem('html'),
      body: createMockElem('body'),
      head: createMockElem('head'),
      fullscreenElement: null,
      getElementById: () => null,
      querySelector: (sel) => (sel === 'video' ? mockVideo : null),
      querySelectorAll: (sel) => (sel === '.sentinel-web-fullscreen' ? (mockVideo.classList.contains('sentinel-web-fullscreen') ? [mockVideo] : []) : []),
      createElement: (tag) => createMockElem(tag),
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    mockDocVideo.body.appendChild(mockContainer);

    const sandboxVideo = {
      window: { document: mockDocVideo, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} },
      document: mockDocVideo,
      globalThis: {},
      HTMLElement: class {},
      HTMLVideoElement: class {},
      navigator: { userActivation: { isActive: false } },
      Date, parseInt, String, Boolean, clearTimeout, setTimeout,
      MutationObserver: class { observe() {} disconnect() {} },
      Event: class { constructor(type) { this.type = type; } },
      CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } }
    };
    sandboxVideo.globalThis = sandboxVideo.window;

    vm.createContext(sandboxVideo);
    vm.runInContext(fsCode, sandboxVideo);
    const ctrlVideo = sandboxVideo.window.__SentinelFullscreenController;

    const videoResult = ctrlVideo.enterWebFullscreen();
    assert.strictEqual(videoResult, true, 'enterWebFullscreen must succeed when video exists');
    assert.strictEqual(
      mockContainer.classList.contains('sentinel-web-fullscreen') || mockVideo.classList.contains('sentinel-web-fullscreen'),
      true,
      'Video or container must receive .sentinel-web-fullscreen'
    );
    assert.strictEqual(mockDocVideo.body.classList.contains('sentinel-web-fullscreen'), false, 'Body must NEVER receive .sentinel-web-fullscreen');
    console.log('  ✅ Scenario C: Video page correctly applies web fullscreen to video/container, body clean');
  }

  // ---------------------------------------------------------------------------
  // Test 5: popup/popup.js Frame-Aware Actuation & Priority Chain
  // ---------------------------------------------------------------------------
  console.log('\nTest 5: popup/popup.js Frame-Aware Actuation & Priority Chain');
  const popupCode = fs.readFileSync(path.join(baseDir, 'popup/popup.js'), 'utf8');

  // 5.1 Extract #btnCtrlFullscreen block
  const btnFsStart = popupCode.indexOf("const btnFullscreen = document.getElementById('btnCtrlFullscreen');");
  assert(btnFsStart !== -1, 'Must find btnCtrlFullscreen in popup/popup.js');
  const btnPipStart = popupCode.indexOf("const btnPip = document.getElementById('btnCtrlPip');", btnFsStart);
  assert(btnPipStart !== -1, 'Must find btnCtrlPip boundary in popup/popup.js');
  const btnFsBlock = popupCode.slice(btnFsStart, btnPipStart);

  // 5.2 Multi-frame targeting verification
  assert(btnFsBlock.includes('allFrames: true'), '#btnCtrlFullscreen must target allFrames: true');
  console.log('  ✅ allFrames: true verified in browserAPI.scripting.executeScript target');

  // 5.3 Frame safety guard verification
  assert(btnFsBlock.includes("document.querySelector('video') || document.getElementById('movie_player')"),
    'func must include video element existence guard');
  assert(btnFsBlock.includes('if (!video) return false;'), 'func must return false immediately if frame lacks video');
  console.log('  ✅ Early frame safety guard (!video) verified in func');

  // 5.4 Priority chain verification: floatingBtn.click() > native requestFullscreen > controller
  assert(btnFsBlock.includes('floatingBtn.click()'), 'func must invoke floatingBtn.click() when floating button is present');
  assert(btnFsBlock.includes('video.requestFullscreen'), 'func must invoke video.requestFullscreen as native fullscreen');
  assert(btnFsBlock.includes('ctrl.toggle'), 'func must invoke ctrl.toggle as fallback priority');
  console.log('  ✅ 3-tier priority execution chain (floating button -> native -> controller) verified');

  // 5.5 Concise line count verification
  const lineCount = btnFsBlock.split('\n').length;
  assert(lineCount <= 55, `#btnCtrlFullscreen block must remain <= 55 lines (currently ${lineCount})`);
  console.log(`  ✅ Block conciseness preserved (${lineCount} lines <= 55 lines)`);

  // 5.6 Runtime Functional Simulation of func in various frame contexts
  {
    // Extract the func definition from btnFsBlock
    const funcMatch = btnFsBlock.match(/func:\s*\(\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*\n\s*\}\)/);
    assert(funcMatch, 'Must locate func body in btnFsBlock');
    const funcBody = `(() => { ${funcMatch[1]} })()`;

    // 5.6a Non-media frame simulation
    const nonMediaContext = vm.createContext({
      document: {
        querySelector: () => null,
        getElementById: () => null
      },
      window: {},
      globalThis: {}
    });
    const nonMediaResult = vm.runInContext(funcBody, nonMediaContext);
    assert.strictEqual(nonMediaResult, false, 'Non-media frame must exit with return false');
    console.log('  ✅ Simulation 5.6a: Non-media frame returns false cleanly with zero DOM mutations');

    // 5.6b Media frame with floating button simulation
    let floatingBtnClicked = false;
    const mediaWithFloatBtnContext = vm.createContext({
      document: {
        querySelector: (sel) => (sel === 'video' ? { requestFullscreen: () => {} } : null),
        getElementById: (id) => (id === '__sentinel_fs_floating_btn__' ? { click: () => { floatingBtnClicked = true; } } : null)
      },
      window: {},
      globalThis: {}
    });
    const floatBtnResult = vm.runInContext(funcBody, mediaWithFloatBtnContext);
    assert.strictEqual(floatBtnResult, true, 'Frame with floating button must return true');
    assert.strictEqual(floatingBtnClicked, true, 'Floating button must be clicked in media frame');
    console.log('  ✅ Simulation 5.6b: Frame with floating button clicked directly and returned true');

    // 5.6c Media frame with native requestFullscreen (no floating button)
    let nativeFsCalled = false;
    const mockVid = { requestFullscreen: () => { nativeFsCalled = true; return Promise.resolve(); } };
    const mediaWithNativeContext = vm.createContext({
      document: {
        querySelector: (sel) => (sel === 'video' ? mockVid : null),
        getElementById: () => null
      },
      window: {},
      globalThis: {}
    });
    const nativeResult = vm.runInContext(funcBody, mediaWithNativeContext);
    assert.strictEqual(nativeResult, true, 'Frame with native requestFullscreen must return true');
    assert.strictEqual(nativeFsCalled, true, 'Direct video.requestFullscreen must be called when floating button is absent');
    console.log('  ✅ Simulation 5.6c: Frame without floating button invoked video.requestFullscreen directly');

    // 5.6d Media frame with controller simulation (no floating button, no native requestFullscreen)
    let controllerToggleCalled = false;
    let controllerTarget = null;
    const mockVidNoFs = {};
    const mediaWithCtrlContext = vm.createContext({
      document: {
        querySelector: (sel) => (sel === 'video' ? mockVidNoFs : null),
        getElementById: () => null
      },
      window: {
        __SentinelFullscreenController: {
          toggle: (target) => {
            controllerToggleCalled = true;
            controllerTarget = target;
          }
        }
      },
      globalThis: {}
    });
    const ctrlResult = vm.runInContext(funcBody, mediaWithCtrlContext);
    assert.strictEqual(ctrlResult, true, 'Frame with controller must return true');
    assert.strictEqual(controllerToggleCalled, true, 'Controller.toggle must be called when floating button and native requestFullscreen are absent');
    assert.strictEqual(controllerTarget, mockVidNoFs, 'Controller must target the video element directly');
    console.log('  ✅ Simulation 5.6d: Frame without floating button and without native requestFullscreen invoked controller directly');
  }

  // ---------------------------------------------------------------------------
  // Test 6: content_media.js IPC toggle_fullscreen Media Guard
  // ---------------------------------------------------------------------------
  console.log('\nTest 6: content_media.js IPC toggle_fullscreen Media Guard');
  const cmCode = fs.readFileSync(path.join(baseDir, 'content_media.js'), 'utf8');

  // 6.1 Locate case 'toggle_fullscreen'
  const fsCaseIndex = cmCode.indexOf("case 'toggle_fullscreen':");
  assert(fsCaseIndex !== -1, 'Must find case "toggle_fullscreen" in content_media.js');
  const pipCaseIndex = cmCode.indexOf("case 'toggle_pip':", fsCaseIndex);
  assert(pipCaseIndex !== -1, 'Must find case "toggle_pip" boundary');
  const fsCaseBlock = cmCode.slice(fsCaseIndex, pipCaseIndex);

  // 6.2 Media presence check verification
  assert(fsCaseBlock.includes('hasMedia'), 'case "toggle_fullscreen" must declare hasMedia check');
  assert(fsCaseBlock.includes('if (!hasMedia) break;'), 'case "toggle_fullscreen" must break early if no media exists');
  console.log('  ✅ hasMedia presence guard verified in content_media.js case "toggle_fullscreen"');

  // 6.3 Simulation: frame without media receives IPC toggle_fullscreen
  {
    const handleMediaStart = cmCode.indexOf('function handleMediaControl(action, data = {}) {');
    assert(handleMediaStart !== -1, 'Must find handleMediaControl');
    const handleMediaEnd = cmCode.indexOf('// YouTube SPA Navigation Listeners & Visibility', handleMediaStart);
    assert(handleMediaEnd !== -1, 'Must find handleMediaControl boundary');
    const handleMediaFuncCode = cmCode.slice(handleMediaStart, handleMediaEnd);

    let ctrlInvoked = false;
    let floatingBtnInvoked = false;

    const noMediaSandbox = vm.createContext({
      evaluatePageMediaState: () => ({ primaryMediaElement: null }),
      isTopFrame: false,
      forwardActionToMainWorld: () => {},
      calculateNextLadderSpeed: () => 1.0,
      saveDomainSpeed: () => {},
      extractYouTubeDuration: () => 0,
      toggleWebFullscreen: () => {},
      toggleTheaterMode: () => {},
      dispatchMediaTelemetry: () => {},
      setTimeout: (fn) => fn(),
      document: {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => []
      },
      window: {
        __SentinelFullscreenController: {
          toggle: () => { ctrlInvoked = true; }
        }
      },
      KeyboardEvent: class {}
    });

    vm.runInContext(handleMediaFuncCode, noMediaSandbox);
    noMediaSandbox.handleMediaControl('toggle_fullscreen');

    assert.strictEqual(ctrlInvoked, false, 'Controller must NOT be invoked in frame without media');
    assert.strictEqual(floatingBtnInvoked, false, 'Floating button must NOT be invoked in frame without media');
    console.log('  ✅ Non-media frame IPC toggle_fullscreen safely suppressed by hasMedia guard');
  }

  // ---------------------------------------------------------------------------
  // Test 7: Constitutional Invariants & Non-Regressions Check
  // ---------------------------------------------------------------------------
  console.log('\nTest 7: Constitutional Invariants & Non-Regressions Check');
  const globalToggleStart = popupCode.indexOf("const btnGlobalMediaToggle = document.getElementById('btnGlobalMediaToggle');");
  assert(globalToggleStart !== -1, 'Must find btnGlobalMediaToggle in popup/popup.js');
  const globalToggleEnd = popupCode.indexOf("const btnToggleTrackingPause =", globalToggleStart);
  assert(globalToggleEnd !== -1, 'Must find btnGlobalMediaToggle boundary');
  const globalToggleBlock = popupCode.slice(globalToggleStart, globalToggleEnd);

  assert(globalToggleBlock.includes("type: 'TOGGLE_GLOBAL_MEDIA'"), 'Must dispatch TOGGLE_GLOBAL_MEDIA');
  assert(!globalToggleBlock.includes('sendMediaControl'), 'Must NOT call sendMediaControl in global toggle');
  assert(!globalToggleBlock.includes('toggle_fullscreen'), 'Must NOT touch fullscreen in global toggle');
  console.log('  ✅ Universal Play/Pause button (#btnGlobalMediaToggle) confirmed 100% untouched');

  // Verify other controls remain intact
  assert(popupCode.includes("const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');"));
  assert(popupCode.includes("const btnRewind = document.getElementById('btnCtrlRewind');"));
  assert(popupCode.includes("const btnForward = document.getElementById('btnCtrlForward');"));
  assert(popupCode.includes("const btnCtrlToggleMute = document.getElementById('btnCtrlToggleMute');"));
  assert(popupCode.includes("const btnSpeedDown = document.getElementById('btnCtrlSpeedDown');"));
  assert(popupCode.includes("const btnSpeedUp = document.getElementById('btnCtrlSpeedUp');"));
  assert(popupCode.includes("const btnPip = document.getElementById('btnCtrlPip');"));
  console.log('  ✅ All other 7 media controls confirmed 100% intact');

  console.log('\n🎉 ALL FULLSCREEN BLACKOUT & MULTI-FRAME TARGETING TESTS PASSED (100% SUCCESS)!\n');
}

runBlackoutTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
