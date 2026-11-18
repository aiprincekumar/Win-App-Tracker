# Phase 03: Sleep Timer Timeout Action Backend Execution

> **Phase:** 03  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystem:** `background.js`  
> **Assigned Role:** Level 4 Backend Engineer  
> **Skill Prerequisites:** `backend-patterns`, `code-simplification`  

---

## 🎯 Phase Objective
Enhance `triggerSleepTimerExpiration()` in `background.js` to inspect and execute configured timeout actions (`mute`, `close`, `pause`), and harden `handleMuteAllOthersExecution()` with a self-contained fallback to the active browser tab when isolated unit test VMs omit external candidate helpers.

---

## 📋 Required Modifications

### Step 1: Update `triggerSleepTimerExpiration()` in `background.js` (around L1412)
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

  // Freeze active tracking intervals
  if (sleepTimerState.pauseTracking) {
    commitActiveInterval();
    scheduleStorageSave(true);
  }

  // Notify frontend views
  safeSendRuntimeMessage({
    action: 'SLEEP_TIMER_EXPIRED',
    type: 'SLEEP_TIMER_EXPIRED',
    state: sleepTimerState
  });
}
```

---

### Step 2: Implement Helper `closeAllMediaTabs()` in `background.js`
Ensure the helper is <= 30 lines:
```javascript
/**
 * Closes all candidate media tabs when sleep timer expires with action 'close'
 * @returns {Promise<{success: boolean, closedCount: number}>}
 */
async function closeAllMediaTabs() {
  const tabsToClose = (typeof collectCandidateTabs === 'function') 
    ? await collectCandidateTabs() 
    : [];
  let closedCount = 0;
  for (const tabId of tabsToClose) {
    try {
      if (browserAPI && browserAPI.tabs && typeof browserAPI.tabs.remove === 'function') {
        await browserAPI.tabs.remove(tabId).catch(() => {});
        closedCount++;
      }
    } catch (_) {}
  }
  return { success: true, closedCount };
}
```

---

### Step 3: Harden `handleMuteAllOthersExecution()` in `background.js` (L3371)
Ensure fallback resolution to the active focused tab if `resolveCandidatePrimaryTab` is unavailable or returns 0:
```javascript
async function handleMuteAllOthersExecution(primaryTabId) {
  let targetId = (typeof resolveCandidatePrimaryTab === 'function')
    ? await resolveCandidatePrimaryTab(primaryTabId)
    : (Number(primaryTabId) || 0);

  if (!targetId && browserAPI && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
    const activeTabs = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
    const cand = (activeTabs || []).find(t => t && t.id && (typeof isRestrictedTabUrl !== 'function' || !isRestrictedTabUrl(t.url)));
    if (cand && cand.id) targetId = Number(cand.id);
  }

  if (!targetId) return { success: false, error: 'Invalid primaryTabId' };
  ...
```

---

## 🔒 Constitutional Constraints
1. **UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF`.
2. **Function Length Constraint:** All modified and introduced functions must strictly remain <= 50 lines.
3. **Module Exports:** Ensure new helper functions are properly exported to `SentinelBackgroundModules` and `module.exports` if appropriate.

---

## 🧪 Local Verification Gate
Run:
```powershell
node tests/test_real_chrome_tab_muting_ipc_hardening.js
```
Ensure exit code 0 and all sub-batteries pass cleanly.
