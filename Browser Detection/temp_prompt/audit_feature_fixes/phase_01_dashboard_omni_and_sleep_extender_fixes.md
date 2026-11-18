# Phase 01: Dashboard Omni & Sleep Extender ID Resiliency

> **Phase:** 01  
> **Workspace Container:** `temp_prompt/audit_feature_fixes/`  
> **Target Subsystem:** `dashboard/dashboard.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Skill Prerequisites:** `frontend-patterns`, `code-simplification`  

---

## 🎯 Phase Objective
Surgically fix two DOM element ID mismatches in `dashboard/dashboard.js` to restore full functionality for the Omni Command Palette domain analytics search filter and the Sleep Extender fade toggle query.

---

## 📋 Required Modifications

### Step 1: Omni Domain Search Input Binding (around L7576)
- **File:** `dashboard/dashboard.js`
- **Current Target:**
  ```javascript
  const searchInput = document.getElementById('domainSearchInput');
  ```
- **Replacement:**
  ```javascript
  const searchInput = document.getElementById('tableDomainSearch') || document.getElementById('domainSearchInput');
  ```
- **Behavioral Effect:** When clicking a domain in the Omni Command Palette, `#tableDomainSearch` receives the domain name and dispatches an `'input'` event to filter the analytics table.

---

### Step 2: Sleep Extender Fade Toggle ID (around L10623)
- **File:** `dashboard/dashboard.js`
- **Current Target:**
  ```javascript
  const fadeToggle = typeof document !== 'undefined' ? document.getElementById('toggleDashSleepFadeCurve') : null;
  ```
- **Replacement:**
  ```javascript
  const fadeToggle = typeof document !== 'undefined' 
    ? (document.getElementById('toggleDashSleepFade') || document.getElementById('toggleDashSleepFadeCurve')) 
    : null;
  ```
- **Behavioral Effect:** The function `triggerExtendSleepTimer()` accurately inspects the dashboard sleep fade toggle `#toggleDashSleepFade`.

---

## 🔒 Constitutional Constraints
1. **UTF-8 with BOM:** Preserve `0xEF, 0xBB, 0xBF`.
2. **Function Length Constraint:** Ensure enclosing functions do not exceed 50 lines.
3. **No Regressions:** Verify syntax cleanliness.

---

## 🧪 Local Verification Gate
Run:
```powershell
node -e "require('./dashboard/dashboard.js'); console.log('Syntax OK');"
```
Ensure exit code 0.
