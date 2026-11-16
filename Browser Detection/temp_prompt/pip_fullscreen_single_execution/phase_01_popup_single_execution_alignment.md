# Phase 1 Execution Specification: Popup PiP & Fullscreen Single-Execution Alignment

> **Phase:** 1 of 3  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Department:** Dept 05 Frontend Engineering  
> **Target File:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> **Gate Verification:** `node -c popup/popup.js` (Exit code 0, 0 syntax errors)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Mission Objectives

Refactor the click event handlers for `#btnCtrlFullscreen` and `#btnCtrlPip` in `popup/popup.js` to eliminate the immediate double-toggle closing bug. Replace the unconditional dual actuation with deterministic single execution with fallback, matching the proven pattern in `dashboard/dashboard.js`.

---

## 🛠️ 2. Detailed Technical Instructions

### 2.1 File Location & Inspection
Open [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) and locate lines ~3644–3724 containing:
- `let lastFullscreenClick = 0;`
- `let lastPipClick = 0;`
- `const btnFullscreen = document.getElementById('btnCtrlFullscreen');`
- `const btnPip = document.getElementById('btnCtrlPip');`

### 2.2 Refactor `#btnCtrlFullscreen` Handler
Currently, `sendMediaControl('toggle_fullscreen', {}, targetTabId);` is called unconditionally at line 3692 after the `if (browserAPI.scripting...)` block.

**Modify the handler as follows:**
1. Keep the 350ms cooldown check: `if (now - lastFullscreenClick < 350) return; lastFullscreenClick = now;`.
2. Keep the `targetTabId` resolution logic.
3. In the `if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId)` block:
   - Change `.catch(() => {});` to:
     ```javascript
     .catch(() => {
       sendMediaControl('toggle_fullscreen', {}, targetTabId);
     });
     ```
4. Add an `else` branch to the `if (browserAPI.scripting...)` statement:
   ```javascript
   } else {
     sendMediaControl('toggle_fullscreen', {}, targetTabId);
   }
   ```
5. **REMOVE** the trailing unconditional call `sendMediaControl('toggle_fullscreen', {}, targetTabId);` that was positioned outside the `if` block.

### 2.3 Refactor `#btnCtrlPip` Handler
Currently, `sendMediaControl('toggle_pip', {}, targetTabId);` is called unconditionally at line 3721 after the `if (browserAPI.scripting...)` block.

**Modify the handler as follows:**
1. Keep the 350ms cooldown check: `if (now - lastPipClick < 350) return; lastPipClick = now;`.
2. Keep `const targetTabId = getActiveMediaTabId();`.
3. In the `if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId)` block:
   - Change `.catch(() => {});` to:
     ```javascript
     .catch(() => {
       sendMediaControl('toggle_pip', {}, targetTabId);
     });
     ```
4. Add an `else` branch to the `if (browserAPI.scripting...)` statement:
   ```javascript
   } else {
     sendMediaControl('toggle_pip', {}, targetTabId);
   }
   ```
5. **REMOVE** the trailing unconditional call `sendMediaControl('toggle_pip', {}, targetTabId);` that was positioned outside the `if` block.

---

## 🔒 3. Mandatory Behavioral Invariants

1. **#btnGlobalMediaToggle Protection:** Lines ~3194–3207 (`btnGlobalMediaToggle.addEventListener('click', ... TOGGLE_GLOBAL_MEDIA ...)`) must remain 100% UNTOUCHED.
2. **Debounce Guards:** The 350ms checks (`now - lastFullscreenClick < 350`, `now - lastPipClick < 350`) must remain intact at the entry of each click handler.
3. **Encoding:** Save with UTF-8 with BOM standard.
4. **No Side Effects:** Do not touch other buttons (`btnCtrlTheater`, `btnCtrlTogglePlay`, sliders).

---

## ✅ 4. Phase Verification Gate

Execute in PowerShell:
```powershell
node -c popup/popup.js
```
Must return exit code 0 with 0 errors.
Report outcome and diff summary to Level 2 Manager.
