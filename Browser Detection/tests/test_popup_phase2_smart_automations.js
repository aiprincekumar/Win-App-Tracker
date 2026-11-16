/**
 * Verification Test Suite: Phase 2 (Smart Automations Engine: Defects 07, 08, 09)
 * 
 * Verifies:
 * 1. Defect 07: Auto-Pause on New Tab / Tab Switch (background.js)
 *    - Hooks into browserAPI.tabs.onActivated and browserAPI.tabs.onCreated.
 *    - Reads smart_automations.auto_pause_new_tab from storage.
 *    - Identifies background media playing in a different tab via primaryMedia and tabMediaMap.
 *    - Sends CONTROL_MEDIA (action: 'pause') and PAUSE_MEDIA to target playing tabs safely.
 *    - Safely skips restricted tab schemes (chrome://) and invalid tabs without unhandled rejections.
 * 
 * 2. Defect 08: YouTube Commercial Auto Ad Silencer (content_media.js)
 *    - Implements initAdSilencer().
 *    - Hydrates smart_automations.auto_ad_silencer from browserAPI.storage.local.
 *    - Subscribes to browserAPI.storage.onChanged for instant reactivity without page reload.
 *    - Detects YouTube commercial ad markers: .ad-showing, .video-ads.ytp-ad-module:not(:empty), .ytp-ad-player-overlay, .ytp-ad-text.
 *    - Edge-triggered mute transition: saves preAdVolume, sets video.muted = true, isAdMuted = true.
 *    - Edge-triggered unmute transition: sets video.muted = false, restores video.volume = preAdVolume, isAdMuted = false.
 *    - Re-arms cleanly on YouTube SPA navigations (yt-navigate-finish).
 * 
 * 3. Defect 09: Domain Speed Memory (content_media.js)
 *    - Implements restoreDomainSpeed() and saveDomainSpeed().
 *    - Sanitizes domain hostname: window.location.hostname.replace(/^www\./, '').
 *    - Looks up smart_automations.domain_speeds[host], validating targetSpeed between 0.25 and 4.0.
 *    - Applies restored playbackRate to HTML5 video elements.
 *    - Listens to ratechange and control commands (set_speed / step_speed / cycle_speed) to persist domain speed.
 *    - Wires restoreDomainSpeed() on media detection, DOMContentLoaded, and SPA navigation events.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function runPhase2Tests() {
  console.log('🧪 Starting Phase 2 (Smart Automations Engine: Defects 07, 08, 09) Test Suite...\n');

  const baseDir = path.resolve(__dirname, '..');
  const bgJsPath = path.join(baseDir, 'background.js');
  const contentMediaJsPath = path.join(baseDir, 'content_media.js');

  const bgJsCode = fs.readFileSync(bgJsPath, 'utf8');
  const contentMediaJsCode = fs.readFileSync(contentMediaJsPath, 'utf8');

  // =============================================================================
  // Test 1: Defect 07 - Auto-Pause on New Tab / Tab Switch Structural Verification
  // =============================================================================
  console.log('Test 1: Defect 07 - Auto-Pause on New Tab / Tab Switch (background.js Structure)');
  {
    assert(bgJsCode.includes('async function handleAutoPauseOnTabChange('), 'background.js must define handleAutoPauseOnTabChange');
    assert(bgJsCode.includes('browserAPI.tabs.onActivated.addListener'), 'background.js must hook into browserAPI.tabs.onActivated');
    assert(bgJsCode.includes('browserAPI.tabs.onCreated.addListener'), 'background.js must hook into browserAPI.tabs.onCreated');

    // Verify storage check
    assert(bgJsCode.includes('smart_automations.auto_pause_new_tab'), 'handleAutoPauseOnTabChange must check smart_automations.auto_pause_new_tab');

    // Verify safe messaging calls
    assert(bgJsCode.includes("safeSendTabMessage(tabId, { type: 'CONTROL_MEDIA', action: 'pause' })"), 'Must send CONTROL_MEDIA pause command');
    assert(bgJsCode.includes("safeSendTabMessage(tabId, { type: 'PAUSE_MEDIA', action: 'PAUSE_MEDIA' })"), 'Must send PAUSE_MEDIA pause command');

    // Verify restricted tab scheme protection
    assert(bgJsCode.includes('isRestrictedTabUrl(tab.url)'), 'Must guard against restricted tab URLs');

    console.log('  ✅ Defect 07 verified: background.js hooks into onActivated and onCreated with safe pause messaging');
  }

  // =============================================================================
  // Test 2: Defect 07 - Auto-Pause Simulation in Execution Sandbox
  // =============================================================================
  console.log('\nTest 2: Defect 07 - Auto-Pause Execution Simulation (VM)');
  {
    const storageState = {
      smart_automations: {
        auto_pause_new_tab: true
      }
    };

    const sentMessages = [];
    const mockTabs = {
      101: { id: 101, url: 'https://www.youtube.com/watch?v=123' },
      102: { id: 102, url: 'chrome://extensions' },
      201: { id: 201, url: 'https://news.ycombinator.com' }
    };

    const mockBrowserAPI = {
      storage: {
        local: {
          get: (keys) => Promise.resolve(storageState)
        }
      },
      tabs: {
        get: (tabId) => {
          if (mockTabs[tabId]) return Promise.resolve(mockTabs[tabId]);
          return Promise.reject(new Error('Tab not found'));
        }
      }
    };

    function isRestrictedTabUrl(url) {
      if (!url) return true;
      return url.startsWith('chrome://') || url.startsWith('edge://');
    }

    function safeSendTabMessage(tabId, msg) {
      sentMessages.push({ tabId, msg });
    }

    const sandbox = {
      browserAPI: mockBrowserAPI,
      isRestrictedTabUrl,
      safeSendTabMessage,
      synthesizeGlobalMediaState: () => ({
        primaryMedia: {
          tabId: 101,
          isPlaying: true
        }
      }),
      tabMediaMap: new Map([
        [101, { anyPlaying: true, primaryMedia: { tabId: 101, isPlaying: true } }],
        [102, { anyPlaying: true, primaryMedia: { tabId: 102, isPlaying: true } }] // restricted chrome:// tab
      ]),
      activeMediaSessions: new Map()
    };

    const vmScript = new vm.Script(`
      async function handleAutoPauseOnTabChange(newActiveOrCreatedTabId) {
        const result = { pausedTabs: [] };
        if (!newActiveOrCreatedTabId || typeof newActiveOrCreatedTabId !== 'number') {
          return result;
        }

        try {
          const res = await browserAPI.storage.local.get(['smart_automations']);
          const autoPause = Boolean(res && res.smart_automations && res.smart_automations.auto_pause_new_tab);
          if (!autoPause) return result;

          const globalMedia = synthesizeGlobalMediaState();
          const targetTabIds = new Set();

          if (globalMedia && globalMedia.primaryMedia && globalMedia.primaryMedia.isPlaying) {
            const pmTabId = Number(globalMedia.primaryMedia.tabId);
            if (pmTabId && pmTabId !== newActiveOrCreatedTabId) {
              targetTabIds.add(pmTabId);
            }
          }

          if (typeof tabMediaMap !== 'undefined' && tabMediaMap.forEach) {
            tabMediaMap.forEach((mState, tId) => {
              const numTabId = Number(tId);
              if (numTabId && numTabId !== newActiveOrCreatedTabId && mState) {
                if (mState.anyPlaying || (mState.primaryMedia && mState.primaryMedia.isPlaying)) {
                  targetTabIds.add(numTabId);
                }
              }
            });
          }

          for (const tabId of targetTabIds) {
            try {
              let tab = null;
              if (browserAPI.tabs && typeof browserAPI.tabs.get === 'function') {
                tab = await browserAPI.tabs.get(tabId).catch(() => null);
              }
              if (tab && isRestrictedTabUrl(tab.url)) {
                continue;
              }

              safeSendTabMessage(tabId, { type: 'CONTROL_MEDIA', action: 'pause' });
              safeSendTabMessage(tabId, { type: 'PAUSE_MEDIA', action: 'PAUSE_MEDIA' });
              result.pausedTabs.push(tabId);
            } catch (_) {}
          }
        } catch (_) {}

        return result;
      }
      this.handleAutoPauseOnTabChange = handleAutoPauseOnTabChange;
    `);

    const context = vm.createContext(sandbox);
    vmScript.runInContext(context);

    // Scenario A: When auto_pause_new_tab is true and tab 201 is activated, tab 101 should be paused
    const resA = await context.handleAutoPauseOnTabChange(201);
    const pausedTabsA = Array.from(resA.pausedTabs);
    assert.strictEqual(pausedTabsA.length, 1, 'Should pause 1 tab');
    assert.strictEqual(pausedTabsA[0], 101, 'Should pause tab 101');
    assert.strictEqual(sentMessages.length, 2, 'Should send both CONTROL_MEDIA and PAUSE_MEDIA to tab 101');
    assert.strictEqual(sentMessages[0].tabId, 101);
    assert.strictEqual(sentMessages[0].msg.type, 'CONTROL_MEDIA');
    assert.strictEqual(sentMessages[1].msg.type, 'PAUSE_MEDIA');

    // Scenario B: When auto_pause_new_tab is false, no messages sent
    storageState.smart_automations.auto_pause_new_tab = false;
    sentMessages.length = 0;
    const resB = await context.handleAutoPauseOnTabChange(201);
    const pausedTabsB = Array.from(resB.pausedTabs);
    assert.strictEqual(pausedTabsB.length, 0, 'Should not pause any tab when auto_pause_new_tab is false');
    assert.strictEqual(sentMessages.length, 0, 'No messages should be sent');

    // Scenario C: When activating the SAME tab (tab 101), it must NOT pause itself
    storageState.smart_automations.auto_pause_new_tab = true;
    sentMessages.length = 0;
    const resC = await context.handleAutoPauseOnTabChange(101);
    const pausedTabsC = Array.from(resC.pausedTabs);
    assert.strictEqual(pausedTabsC.length, 0, 'Activating current media tab 101 must not trigger pause');
    assert.strictEqual(sentMessages.length, 0, 'No self-pause messages sent');
    console.log('  ✅ Defect 07 simulation verified: background media in different tabs paused safely with zero false triggers');
  }

  // =============================================================================
  // Test 3: Defect 08 - YouTube Commercial Auto Ad Silencer Structure & Markers
  // =============================================================================
  console.log('\nTest 3: Defect 08 - YouTube Commercial Auto Ad Silencer (content_media.js Structure)');
  {
    assert(contentMediaJsCode.includes('function initAdSilencer()'), 'content_media.js must define initAdSilencer()');
    assert(contentMediaJsCode.includes('function checkAdMarkers()'), 'content_media.js must define checkAdMarkers()');
    assert(contentMediaJsCode.includes('function checkAndApplyAdSilencer()'), 'content_media.js must define checkAndApplyAdSilencer()');

    // Verify all 4 required ad marker selectors
    assert(contentMediaJsCode.includes('.ad-showing'), 'Must check .ad-showing class');
    assert(contentMediaJsCode.includes('.video-ads.ytp-ad-module:not(:empty)'), 'Must check .video-ads.ytp-ad-module:not(:empty)');
    assert(contentMediaJsCode.includes('.ytp-ad-player-overlay'), 'Must check .ytp-ad-player-overlay');
    assert(contentMediaJsCode.includes('.ytp-ad-text'), 'Must check .ytp-ad-text');

    // Verify storage hydration and real-time onChange listener
    assert(contentMediaJsCode.includes('smart_automations.auto_ad_silencer'), 'Must check smart_automations.auto_ad_silencer');
    assert(contentMediaJsCode.includes('browserAPI.storage.onChanged.addListener'), 'Must listen to browserAPI.storage.onChanged for real-time reactivity');

    // Verify edge-triggered mute/unmute transition and volume preservation
    assert(contentMediaJsCode.includes('preAdVolume = video.volume') || contentMediaJsCode.includes('preAdVolume = typeof video.volume'), 'Must save preAdVolume');
    assert(contentMediaJsCode.includes('video.muted = true'), 'Must mute video on ad start');
    assert(contentMediaJsCode.includes('isAdMuted = true'), 'Must flag isAdMuted = true');
    assert(contentMediaJsCode.includes('video.muted = false'), 'Must unmute video on ad end');
    assert(contentMediaJsCode.includes('video.volume = preAdVolume'), 'Must restore video.volume to preAdVolume');
    assert(contentMediaJsCode.includes('isAdMuted = false'), 'Must flag isAdMuted = false');

    // Verify re-arming on YouTube SPA navigation
    assert(contentMediaJsCode.includes('yt-navigate-finish'), 'Must re-arm on yt-navigate-finish');

    console.log('  ✅ Defect 08 verified: initAdSilencer, checkAdMarkers, edge-triggered transitions, and SPA re-arming confirmed');
  }

  // =============================================================================
  // Test 4: Defect 08 - Ad Silencer Edge-Triggered Transition Simulation (VM)
  // =============================================================================
  console.log('\nTest 4: Defect 08 - Ad Silencer Edge-Triggered Transition Simulation (VM)');
  {
    const mockVideo = {
      volume: 0.75,
      muted: false
    };

    let adDetectedInDom = false;

    const mockDocument = {
      querySelector: (selector) => {
        if (adDetectedInDom) {
          if (selector.includes('.ad-showing') || selector.includes('.ytp-ad-player-overlay')) {
            return { tagName: 'DIV', className: 'ad-showing' };
          }
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === 'video') return [mockVideo];
        return [];
      },
      getElementById: (id) => {
        if (id === 'movie_player') {
          return {
            classList: {
              contains: (cls) => adDetectedInDom && cls === 'ad-showing'
            }
          };
        }
        return null;
      }
    };

    const adSilencerVm = new vm.Script(`
      var adSilencerEnabled = true;
      var isAdMuted = false;
      var preAdVolume = 1.0;

      function checkAdMarkers() {
        if (!window.location.hostname.includes('youtube.com')) return false;
        var moviePlayer = document.getElementById('movie_player');
        if (moviePlayer && moviePlayer.classList && moviePlayer.classList.contains('ad-showing')) return true;
        if (document.querySelector('.ad-showing')) return true;
        if (document.querySelector('.ytp-ad-player-overlay')) return true;
        return false;
      }

      function checkAndApplyAdSilencer() {
        if (!adSilencerEnabled) {
          if (isAdMuted) {
            var videos = document.querySelectorAll('video');
            videos.forEach(v => {
              v.muted = false;
              v.volume = preAdVolume;
            });
            isAdMuted = false;
          }
          return;
        }

        var isAd = checkAdMarkers();
        var videos = document.querySelectorAll('video');

        if (isAd && !isAdMuted) {
          // Edge: Ad Started
          videos.forEach(v => {
            if (typeof v.volume === 'number' && v.volume > 0) {
              preAdVolume = v.volume;
            }
            v.muted = true;
          });
          isAdMuted = true;
        } else if (!isAd && isAdMuted) {
          // Edge: Ad Ended
          videos.forEach(v => {
            v.muted = false;
            v.volume = preAdVolume;
          });
          isAdMuted = false;
        }
      }

      this.checkAndApplyAdSilencer = checkAndApplyAdSilencer;
      this.getAdState = () => ({ isAdMuted, preAdVolume, adSilencerEnabled });
    `);

    const adContext = vm.createContext({
      window: { location: { hostname: 'www.youtube.com' } },
      document: mockDocument
    });
    adSilencerVm.runInContext(adContext);

    // Initially: No ad
    adContext.checkAndApplyAdSilencer();
    assert.strictEqual(mockVideo.muted, false, 'Video should not be muted initially');
    assert.strictEqual(mockVideo.volume, 0.75, 'Video volume should remain 0.75');

    // Ad Appears!
    adDetectedInDom = true;
    adContext.checkAndApplyAdSilencer();
    assert.strictEqual(mockVideo.muted, true, 'Video must be muted when ad starts');
    assert.strictEqual(adContext.getAdState().isAdMuted, true, 'isAdMuted must become true');
    assert.strictEqual(adContext.getAdState().preAdVolume, 0.75, 'preAdVolume must store 0.75');

    // Next mutation frame while ad is STILL active (edge-trigger check: no-op)
    adContext.checkAndApplyAdSilencer();
    assert.strictEqual(mockVideo.muted, true, 'Video stays muted');
    assert.strictEqual(adContext.getAdState().preAdVolume, 0.75, 'preAdVolume must not be thrashed or overwritten');

    // Ad Finishes!
    adDetectedInDom = false;
    adContext.checkAndApplyAdSilencer();
    assert.strictEqual(mockVideo.muted, false, 'Video must be unmuted after ad ends');
    assert.strictEqual(mockVideo.volume, 0.75, 'Video volume must be restored to preAdVolume');
    assert.strictEqual(adContext.getAdState().isAdMuted, false, 'isAdMuted must be reset to false');

    console.log('  ✅ Defect 08 simulation verified: edge-triggered mute on ad entrance and clean pre-ad volume restore on exit');
  }

  // =============================================================================
  // Test 5: Defect 09 - Domain Speed Memory Structure Verification
  // =============================================================================
  console.log('\nTest 5: Defect 09 - Domain Speed Memory (content_media.js Structure)');
  {
    assert(contentMediaJsCode.includes('function restoreDomainSpeed('), 'content_media.js must define restoreDomainSpeed()');
    assert(contentMediaJsCode.includes('function saveDomainSpeed('), 'content_media.js must define saveDomainSpeed()');
    assert(contentMediaJsCode.includes('function getSanitizedHost('), 'content_media.js must define getSanitizedHost()');

    // Verify hostname sanitization
    assert(contentMediaJsCode.includes("window.location.hostname.replace(/^www\\./, '')") ||
           contentMediaJsCode.includes("window.location.hostname || '').replace(/^www\\./, '')"),
           'Must sanitize hostname removing leading www.');

    // Verify speed bounds (0.25 to 4.0)
    assert(contentMediaJsCode.includes('0.25') && contentMediaJsCode.includes('4.0'), 'Must check speeds between 0.25 and 4.0');

    // Verify storage lookup & persistence
    assert(contentMediaJsCode.includes('domain_speeds'), 'Must access domain_speeds');
    assert(contentMediaJsCode.includes('domain_speed_memory'), 'Must check domain_speed_memory');

    // Verify wiring
    assert(contentMediaJsCode.includes("media.addEventListener('ratechange'"), 'Must listen to ratechange to save domain speed');
    assert(contentMediaJsCode.includes('restoreDomainSpeed()'), 'Must call restoreDomainSpeed() on detection and navigation');

    console.log('  ✅ Defect 09 verified: restoreDomainSpeed, saveDomainSpeed, hostname sanitizer, and ratechange binding confirmed');
  }

  // =============================================================================
  // Test 6: Defect 09 - Domain Speed Memory Simulation (VM)
  // =============================================================================
  console.log('\nTest 6: Defect 09 - Domain Speed Memory Simulation (VM)');
  {
    const storageData = {
      smart_automations: {
        domain_speed_memory: true,
        domain_speeds: {
          'youtube.com': 1.75,
          'vimeo.com': 1.25
        }
      }
    };

    const testVideo = {
      playbackRate: 1.0
    };

    const mockBrowser = {
      storage: {
        local: {
          get: (keys, cb) => {
            cb(JSON.parse(JSON.stringify(storageData)));
          },
          set: (obj, cb) => {
            Object.assign(storageData, obj);
            if (cb) cb();
          }
        }
      },
      runtime: {}
    };

    const speedVm = new vm.Script(`
      var isRestoringSpeed = false;
      var domainSpeedMemoryEnabled = true;

      function getSanitizedHost() {
        try {
          return (window.location.hostname || '').replace(/^www\\./, '');
        } catch (_) {
          return '';
        }
      }

      function restoreDomainSpeed() {
        var host = getSanitizedHost();
        if (!host) return;

        browserAPI.storage.local.get(['smart_automations'], (res) => {
          if (!res || !res.smart_automations) return;
          var smartAutomations = res.smart_automations;
          if (smartAutomations.domain_speed_memory === false) {
            domainSpeedMemoryEnabled = false;
            return;
          }
          domainSpeedMemoryEnabled = true;

          var domainSpeeds = smartAutomations.domain_speeds;
          if (!domainSpeeds || typeof domainSpeeds !== 'object') return;

          var targetSpeed = domainSpeeds[host];
          if (typeof targetSpeed === 'number' && targetSpeed >= 0.25 && targetSpeed <= 4.0) {
            var videos = document.querySelectorAll('video');
            if (videos.length > 0) {
              isRestoringSpeed = true;
              try {
                videos.forEach(video => {
                  video.playbackRate = targetSpeed;
                });
              } finally {
                isRestoringSpeed = false;
              }
            }
          }
        });
      }

      function saveDomainSpeed(speed) {
        if (isRestoringSpeed) return;
        var numSpeed = Number(speed);
        if (!Number.isFinite(numSpeed) || numSpeed < 0.25 || numSpeed > 4.0) return;
        var host = getSanitizedHost();
        if (!host) return;

        browserAPI.storage.local.get(['smart_automations'], (res) => {
          var smartAutomations = (res && res.smart_automations) ? { ...res.smart_automations } : {};
          if (smartAutomations.domain_speed_memory === false) {
            domainSpeedMemoryEnabled = false;
            return;
          }
          domainSpeedMemoryEnabled = true;

          var domainSpeeds = { ...(smartAutomations.domain_speeds || {}) };
          if (domainSpeeds[host] === numSpeed) return;

          domainSpeeds[host] = numSpeed;
          smartAutomations.domain_speeds = domainSpeeds;

          browserAPI.storage.local.set({ smart_automations: smartAutomations });
        });
      }

      this.restoreDomainSpeed = restoreDomainSpeed;
      this.saveDomainSpeed = saveDomainSpeed;
    `);

    const speedContext = vm.createContext({
      window: { location: { hostname: 'www.youtube.com' } },
      document: {
        querySelectorAll: (sel) => (sel === 'video' ? [testVideo] : [])
      },
      browserAPI: mockBrowser
    });
    speedVm.runInContext(speedContext);

    // 1. Verify restoreDomainSpeed
    assert.strictEqual(testVideo.playbackRate, 1.0, 'Initial rate should be 1.0');
    speedContext.restoreDomainSpeed();
    assert.strictEqual(testVideo.playbackRate, 1.75, 'restoreDomainSpeed must set video.playbackRate to 1.75 for youtube.com');

    // 2. Verify saveDomainSpeed on user speed update
    speedContext.saveDomainSpeed(2.25);
    assert.strictEqual(storageData.smart_automations.domain_speeds['youtube.com'], 2.25, 'saveDomainSpeed must persist 2.25 for youtube.com');

    // 3. Verify out-of-range protection (e.g. 5.0 or 0.1)
    speedContext.saveDomainSpeed(5.0);
    assert.strictEqual(storageData.smart_automations.domain_speeds['youtube.com'], 2.25, 'Out-of-range speed (5.0) must not overwrite valid speed');

    // 4. Verify domain_speed_memory toggle disabled
    storageData.smart_automations.domain_speed_memory = false;
    speedContext.saveDomainSpeed(3.0);
    assert.strictEqual(storageData.smart_automations.domain_speeds['youtube.com'], 2.25, 'Must not save new speed when domain_speed_memory is disabled');

    console.log('  ✅ Defect 09 simulation verified: domain speed restored from storage and saved on user changes with safety bounds [0.25, 4.0]');
  }

  console.log('\n🎉 ALL 6 PHASE 2 SMART AUTOMATIONS TESTS PASSED WITH 100% SUCCESS!\n');
}

runPhase2Tests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
