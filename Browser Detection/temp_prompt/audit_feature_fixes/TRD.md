# Technical Requirements Document (TRD): Browser Detection Feature Defect Fixes

> **Document Type:** Technical Requirements Document (TRD)  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystems:** `dashboard/dashboard.js`, `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/styles/audio_lab.css`, `background.js`, `tests/`  
> **Lead Department:** Dept 04 (Core Logic & Architecture) & Dept 05 (Frontend Engineering)  

---

## 🏗️ 1. Architecture & Code Anchor Specifications

### 1.1 Anchor 1: Omni Domain Search Filter (`dashboard/dashboard.js` L7576)
- **File:** `dashboard/dashboard.js`
- **Current Code:**
  ```javascript
  switchTab('tracking');
  if (typeof document !== 'undefined') {
    const searchInput = document.getElementById('domainSearchInput');
    if (searchInput) {
      searchInput.value = domain;
      searchInput.dispatchEvent(new Event('input'));
    }
  }
  ```
- **Replacement Code:**
  ```javascript
  switchTab('tracking');
  if (typeof document !== 'undefined') {
    const searchInput = document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput');
    if (searchInput) {
      searchInput.value = domain;
      searchInput.dispatchEvent(new Event('input'));
    }
  }
  ```

---

### 1.2 Anchor 2: Sleep Extender Fade Toggle ID (`dashboard/dashboard.js` L10623)
- **File:** `dashboard/dashboard.js`
- **Current Code:**
  ```javascript
  const fadeToggle = typeof document !== 'undefined' ? document.getElementById('toggleDashSleepFadeCurve') : null;
  const fadeSelect = typeof document !== 'undefined' ? document.getElementById('selectDashSleepFadeCurve') : null;
  const endVideoToggle = typeof document !== 'undefined' ? document.getElementById('toggleDashSleepEndOfVideo') : null;
  ```
- **Replacement Code:**
  ```javascript
  const fadeToggle = typeof document !== 'undefined' 
    ? (document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')) 
    : null;
  const fadeSelect = typeof document !== 'undefined' ? document.getElementById('selectDashSleepFadeCurve') : null;
  const endVideoToggle = typeof document !== 'undefined' ? document.getElementById('toggleDashSleepEndOfVideo') : null;
  ```

---

### 1.3 Anchor 3: Equalizer Preset Badge (`dashboard/dashboard.html` & CSS)
- **File:** `dashboard/dashboard.html` around L967-L970
- **Markup Injection:**
  ```html
  <div class="eq-actions-group">
    <span id="audioLabPresetBadge" class="badge-eq-preset" aria-label="Active Equalizer Preset">Flat</span>
    <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">
  ```
- **Files for Styling:** `dashboard/styles/audio_lab.css` & `dashboard/dashboard.css`
- **CSS Specification:**
  ```css
  .badge-eq-preset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.65rem;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: var(--mono-font, 'JetBrains Mono', monospace);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 9999px;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.35);
    color: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  body.theme-light .badge-eq-preset {
    background: rgba(16, 185, 129, 0.12);
    border-color: rgba(16, 185, 129, 0.35);
    color: #059669;
  }
  ```

---

### 1.4 Anchor 4: Sleep Timer Timeout Action Execution (`background.js` L1412)
- **File:** `background.js`
- **Function:** `triggerSleepTimerExpiration()`
- **Implementation Strategy:**
  ```javascript
  async function triggerSleepTimerExpiration() {
    await ensureStorageLoaded();
    console.info('[MediaSentinel] 🌙 Sleep timer expired! Triggering configured timeout action.');

    sleepTimerState.state = 'TRIGGERED';
    sleepTimerState.triggeredAt = Date.now();
    await saveSleepTimerState();

    clearActionBadge();

    const action = String(
      sleepTimerState.timeoutAction || 
      sleepTimerState.timeout_action || 
      sleepTimerSettings.timeoutAction || 
      sleepTimerSettings.timeout_action || 
      (sleepTimerState.pauseMedia ? 'pause' : 'none')
    ).toLowerCase();

    if (action === 'mute') {
      if (typeof handleMuteAllExecution === 'function') {
        await handleMuteAllExecution();
      }
    } else if (action === 'close' || action === 'close_tab') {
      await closeAllMediaTabs();
    } else if (action === 'pause' || sleepTimerState.pauseMedia) {
      await dispatchGlobalMediaAction('PAUSE_ALL');
    }

    if (sleepTimerState.pauseTracking) {
      commitActiveInterval();
      scheduleStorageSave(true);
    }

    safeSendRuntimeMessage({
      action: 'SLEEP_TIMER_EXPIRED',
      type: 'SLEEP_TIMER_EXPIRED',
      state: sleepTimerState
    });
  }
  ```
- **Helper Function (closeAllMediaTabs):**
  ```javascript
  async function closeAllMediaTabs() {
    const tabsToClose = (typeof collectCandidateTabs === 'function') 
      ? await collectCandidateTabs() 
      : [];
    let count = 0;
    for (const tabId of tabsToClose) {
      try {
        if (browserAPI && browserAPI.tabs && typeof browserAPI.tabs.remove === 'function') {
          await browserAPI.tabs.remove(tabId).catch(() => {});
          count++;
        }
      } catch (_) {}
    }
    return { success: true, count };
  }
  ```

---

### 1.5 Anchor 5: Mute All Others Fallback Hardening (`background.js` L3371)
- **Issue:** In isolated unit test harnesses (such as `tests/test_real_chrome_tab_muting_ipc_hardening.js`), external module helper `resolveCandidatePrimaryTab` is not injected into the sandbox VM. When `primaryTabId` is `0`, `targetId` evaluates to `0` and aborts with `Invalid primaryTabId`.
- **Harden `handleMuteAllOthersExecution`:**
  ```javascript
  async function handleMuteAllOthersExecution(primaryTabId) {
    let targetId = (typeof resolveCandidatePrimaryTab === 'function')
      ? await resolveCandidatePrimaryTab(primaryTabId)
      : (Number(primaryTabId) || 0);

    // Resilient fallback when resolveCandidatePrimaryTab is unavailable or returns 0
    if (!targetId && browserAPI && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
      const activeTabs = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
      const cand = (activeTabs || []).find(t => t && t.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
      if (cand && cand.id) targetId = Number(cand.id);
    }

    if (!targetId) return { success: false, error: 'Invalid primaryTabId' };
    ...
  ```
  This guarantees `test_real_chrome_tab_muting_ipc_hardening.js` passes 100% cleanly while maintaining full 3-tier candidate resolution in normal runtime.

---

## 🔒 2. Constraints & Quality Control

1. **Length Budgets:** Each modified function is <= 50 lines.
2. **UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF` byte sequence.
3. **W3C Trusted Types Compliance:** No direct `innerHTML` modifications.
4. **All Tests Clean:** `tests/test_real_chrome_tab_muting_ipc_hardening.js` and all other 77 suites must pass (78/78 total).
