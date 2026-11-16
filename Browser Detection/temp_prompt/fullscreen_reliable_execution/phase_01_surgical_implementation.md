# Phase 1: Surgical Implementation - Fullscreen Parity & Synthetic Click Fallback

> **Task ID:** `TASK-FULLSCREEN-PARITY-002`  
> **Phase:** 1 of 3  
> **Assigned Role:** Level 4 Frontend Engineer (`Frontend Engineer`)  
> **Recommended Model:** `pro`  
> **Department Governance:** Department 05 (Frontend & Web Engineering)  
> **Authorization Token:** `AUTH-MGR-20261116-FULLSCREEN-001`  
> **Target Files:**  
> - [`fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/fullscreen_controller.js)  
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)  

---

## 🎯 1. Phase Objective

Surgically update `fullscreen_controller.js`, `popup/popup.js`, and `content_media.js` to ensure that clicking `#btnCtrlFullscreen` in popup mode reliably enters Web Fullscreen, eliminates the false-positive "Fullscreen ⛶" OSD notification on ignored synthetic clicks, and maintains native fullscreen functionality on physical mouse clicks on the in-page floating HUD button.

---

## 📋 2. Prerequisites & Working Context

1. Read and adhere to [`TRD.md`](TRD.md) and [`PRD.md`](PRD.md) in this directory.
2. Verify you have been dispatched by the Level 2 Manager with an active `AUTH-MGR-*` authorization token.
3. Ensure no modifications are made to any other controls (e.g. `#btnGlobalMediaToggle`, play/pause, volume, speed, PiP).

---

## 🛠️ 3. Surgical Implementation Directives

### Step 1: Update `fullscreen_controller.js`
In `fullscreen_controller.js`:
1. **Harden `enterNativeFullscreen(targetEl)` (around line 521):**
   - After executing `ytFsBtn.click()`, check `if (isFullscreenActive())`. Only show OSD `showOSD('Fullscreen', '⛶')` and return `true` if active. If not active, do NOT show OSD and do NOT return `true`.
   - After executing `moviePlayer.toggleFullscreen()`, check `if (isFullscreenActive())`. Only show OSD and return `true` if active.
   - After executing `target.requestFullscreen()` or `target.webkitRequestFullscreen()`, check `if (isFullscreenActive())`. Only show OSD and return `true` if active.
   - If none of the native attempts resulted in `isFullscreenActive() === true`, fall through directly to `return enterWebFullscreen(targetEl || el);`.
2. **Synthetic Event Guard in `createFloatingButton()` (around lines 654–667):**
   - In the button `click` listener:
     ```javascript
     btn.addEventListener('click', (e) => {
       e.stopPropagation();
       e.preventDefault();
       
       // Synthetic event (e.isTrusted === false) or Shift+Click: use Web Fullscreen directly
       if (!e.isTrusted || e.shiftKey) {
         if (isFullscreenActive()) {
           exitFullscreen();
         } else {
           enterWebFullscreen();
         }
       } else {
         toggle();
       }
       setTimeout(updateFloatingButtonIcon, 50);
     });
     ```
3. **Ensure `toggle()` returns the promise/result of `enterNativeFullscreen()` (around line 613):**
   - Replace:
     ```javascript
     enterNativeFullscreen(targetEl).catch(() => {
       enterWebFullscreen(targetEl);
     });
     return true;
     ```
     With:
     ```javascript
     return enterNativeFullscreen(targetEl);
     ```

### Step 2: Update `popup/popup.js` (around lines 3664–3688)
In `popup/popup.js`, align the fullscreen button execution function with `dashboard/dashboard.js`:
1. Check `window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController` directly FIRST.
2. If available, invoke `ctrl.toggleWebFullscreen()` or `ctrl.toggle(null, { forceWeb: true })`.
3. Only if the controller is not directly found, check for `document.getElementById('__sentinel_fs_floating_btn__')` and invoke `.click()`.
4. Maintain the cross-world CustomEvent bridge:
   ```javascript
   try {
     window.dispatchEvent(new CustomEvent('__SENTINEL_FULLSCREEN_ACTION__', {
       detail: { action: 'toggle', options: { forceWeb: true } }
     }));
   } catch (_) {}
   ```
5. Maintain the `.catch(() => { sendMediaControl('toggle_fullscreen', {}, targetTabId); })` and `else` block to guarantee single-execution determinism.

### Step 3: Update `content_media.js` (around line 1970)
In `content_media.js` inside `case 'toggle_fullscreen':`:
1. If `window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function'`, execute:
   ```javascript
   window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
   ```
2. If the controller is not available on window, check `floatingBtn`:
   ```javascript
   const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
   if (floatingBtn) {
     try { floatingBtn.click(); } catch (_) {}
   } else {
     forwardActionToMainWorld('toggle_fullscreen', data);
     toggleWebFullscreen(primaryMediaElement);
   }
   ```

---

## 🚫 4. Strict Constitutional Anti-Scope

- **DO NOT TOUCH `#btnGlobalMediaToggle`:** Universal across-tab media toggle logic must remain completely unmodified.
- **DO NOT TOUCH OTHER MEDIA CONTROLS:** Play/Pause, Mute, Volume, Speed ladder, and PiP controls must not be altered in any way.
- **DO NOT MUTATE CSS OR LAYOUTS:** No changes to `popup.html`, `popup.css`, or dashboard layout templates.
- **NO INNERHTML:** Strict zero `.innerHTML` policy (W3C Trusted Types safe).

---

## 🏁 5. Local Verification Gate

Execute the following commands from workspace root:
```powershell
node -c fullscreen_controller.js
node -c popup/popup.js
node -c content_media.js
```
**Gate Requirement:** All three commands must exit with code 0 and zero syntax errors.
