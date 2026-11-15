# Phase 1: Latent Bridge Bug Fixes & Parity Resilience
## Standalone Executable Implementation Specification

> **Phase:** 1 of 3  
> **Role:** Level 4 Frontend Engineer  
> **Target Files:**
> - [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\inject_main_world.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/inject_main_world.js)
> - [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)
> - [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> **Governance:** Universal Rule 22 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Phase Objective

The objective of Phase 1 is to surgically eliminate latent execution bugs in the media bridge and establish robust parity between Popup Mode and Dashboard Mode:
1. Fix `inject_main_world.js` to eliminate the self-canceling `toggle_mute` double inversion bug.
2. Fix `content_media.js` to provide resilient fallback directly to `primaryMediaElement` when the main world bridge is unready or unacknowledged.
3. Fix `popup/popup.js` to harmonize `targetTabId` resolution with `dashboard/dashboard.js`, ensuring all media control buttons and `sendMediaControl` reliably target the active media tab, while keeping optimistic cooldown locks and `#btnGlobalMediaToggle` completely frozen.

---

## 📋 2. Prerequisites & Inputs

- Workspace: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Git working tree clean.
- Reference implementation in `dashboard/dashboard.js`.

---

## 🔍 3. Technical Context & File Anchors

| File | Line Anchors | Target Function / Scope | Modification Scope |
| :--- | :--- | :--- | :--- |
| `inject_main_world.js` | Lines ~636–659 | `case 'toggle_mute':` in `executeAction` | Make `moviePlayer` mute and `video.muted` mutually exclusive (no double inversion). |
| `content_media.js` | Lines ~1577–1605 | `handleMediaControl(action, data)` | Add resilient fallback to direct `primaryMediaElement` execution when `!isBridgeActive`. |
| `popup/popup.js` | Lines ~919–950 | `sendMediaControl(action, data, tabId)` | Auto-resolve `tabId = tabId || getActiveMediaTabId()`. |
| `popup/popup.js` | Lines ~2010–2015 | `getActiveMediaTabId()` | Include `activeTabId` fallback for cold-cache popup scenarios. |
| `popup/popup.js` | Lines ~3340–3520 | Media control button event listeners | Consistently pass `getActiveMediaTabId()` in parity with dashboard. |

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Fix `toggle_mute` Double Inversion in `inject_main_world.js`
1. Open `inject_main_world.js`.
2. Locate `case 'toggle_mute':` in `executeAction` (around line 636).
3. Replace the existing block:
   ```javascript
   case 'toggle_mute': {
     let isNowMuted = false;
     if (moviePlayer && typeof moviePlayer.isMuted === 'function') {
       try {
         if (moviePlayer.isMuted()) {
           if (typeof moviePlayer.unMute === 'function') moviePlayer.unMute();
           isNowMuted = false;
         } else {
           if (typeof moviePlayer.mute === 'function') moviePlayer.mute();
           isNowMuted = true;
         }
       } catch (_) {}
     } else if (video) {
       try {
         video.muted = !video.muted;
         isNowMuted = video.muted;
       } catch (_) {}
     }

     showOSD(isNowMuted ? 'Muted' : 'Unmuted', isNowMuted ? '🔇' : '🔊');
     break;
   }
   ```
4. Confirm `else if (video)` is used so `video.muted` is NOT flipped if `moviePlayer` handled the mute command.

### Step 2: Implement Resilient Fallback in `content_media.js`
1. Open `content_media.js`.
2. Locate `handleMediaControl` (around line 1577).
3. Update the bridge forwarding and HTML5 fallback execution logic:
   ```javascript
   // 1. Forward action to Main World engine (essential for YouTube native player methods, volume slider & OSD)
   // Avoid double-toggle race for toggle_fullscreen across isolated and main worlds
   let forwardedToMainWorld = false;
   if (isMainWorldTarget && action !== 'toggle_fullscreen') {
     forwardActionToMainWorld(action, data);
     forwardedToMainWorld = true;
   }

   // 2. Perform direct HTML5 video element manipulation when bridge is inactive or as resilient fallback
   const shouldExecuteDirect = (!forwardedToMainWorld || !isBridgeActive) && (Boolean(primaryMediaElement) || action === 'toggle_fullscreen');

   if (shouldExecuteDirect) {
     try {
       switch (action) {
         // ... existing switch statement preserved ...
       }
     } catch (_) {}
   }
   ```
4. Ensure no syntax errors are introduced and `shouldExecuteDirect` safely executes when `!isBridgeActive && primaryMediaElement`.

### Step 3: Harmonize `targetTabId` Resolution in `popup/popup.js`
1. Open `popup/popup.js`.
2. Locate `getActiveMediaTabId()` (around line 2010):
   ```javascript
   function getActiveMediaTabId() {
     return (activeMediaCached && activeMediaCached.tabId) ||
       (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId) ||
       activeTabId ||
       null;
   }
   ```
3. Locate `sendMediaControl(action, data, tabId)` (around line 919):
   Ensure `const resolvedTabId = tabId || getActiveMediaTabId();` is used to populate `tabId: resolvedTabId`.
4. Review media button listeners in `setupMediaCardListeners` (lines ~3340–3520):
   Ensure that handlers for `#btnCtrlTogglePlay`, `#dynamicStatusBtn`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnQuickMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, `#btnCtrlPip`, `#btnCtrlTheater`, `#btnCtrlQualityDown`, `#btnCtrlQualityUp` consistently call `getActiveMediaTabId()` or let `sendMediaControl` auto-resolve it.

### Step 4: Verify Strict Invariant Guardrails
- **DO NOT TOUCH** `#btnGlobalMediaToggle` (lines ~3154–3168).
- **DO NOT TOUCH** or remove optimistic cooldown locks (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastControlsRowActiveTime`).
- **DO NOT INTRODUCE** `browserAPI.scripting.executeScript` into button handlers.
- **DO NOT USE** `innerHTML` or `outerHTML`.

---

## 🚫 5. Architectural Constraints & Boundaries

- Zero changes to HTML markup or DOM node IDs.
- Zero changes to CSS stylesheet classes.
- Zero external package installations.

---

## 📦 6. Deliverables Manifest

1. `inject_main_world.js` (patched `toggle_mute`).
2. `content_media.js` (resilient fallback in `handleMediaControl`).
3. `popup/popup.js` (unified `getActiveMediaTabId` and `sendMediaControl` resolution).

---

## 🚦 7. Local Verification Gate

Execute syntax and compilation validation:
```bash
node -c inject_main_world.js
node -c content_media.js
node -c popup/popup.js
```
All commands must exit with code 0 before Phase 1 is declared complete.
