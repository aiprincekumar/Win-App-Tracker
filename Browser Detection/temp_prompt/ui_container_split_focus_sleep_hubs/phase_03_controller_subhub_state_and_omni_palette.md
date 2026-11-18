# Phase 03: Controller Sub-Hub State Machine, Storage & Omni-Palette

> **Document Type:** Standalone Phase Execution Directive  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Phase #:** 03 of 04  
> **Target Subsystem:** `dashboard/dashboard.js`  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective
Implement the JavaScript controller logic for the Wellbeing Sub-Hub state machine inside `dashboard/dashboard.js`:
1. Author `switchWellbeingSubHub(subHubKey)` (strictly <= 50 lines per Universal Rule 28).
2. Wire event listeners for `.sub-nav-pill` buttons (`#btnSubHubFocus`, `#btnSubHubSleep`, `#btnSubHubGuardrails`, `#btnSubHubSplitView`).
3. Persist and restore active sub-hub selection in `localStorage` under `sentinel_wellbeing_active_subhub`.
4. Update `switchTab('wellbeing')` to automatically restore the persisted sub-hub.
5. Upgrade the sidebar micro-widget (`#wellbeingLiveMicroWidget`) click handler to deep-link smartly based on whether a sleep timer or Pomodoro is active.
6. Register direct navigation actions in the Omni Command Palette (`nav-focus-hub`, `nav-sleep-hub`, `nav-guardrails`).
7. Add bilingual i18n dictionary keys for English and Hindi.

---

## 📋 2. Prerequisites & Inputs
1. Successful completion and verification of Phase 01 (`dashboard.html`) and Phase 02 (`dashboard.css`).
2. Existing `dashboard/dashboard.js` functions (`switchTab`, `getOmniPaletteCommands`, i18n dictionaries).

---

## ⚓ 3. Technical Context & File Anchors
- **Target File:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
- **`switchTab` Anchor:** Lines ~5390-5450
- **Omni-Palette Anchor:** Lines ~7820-7850
- **Sidebar Micro-Widget Anchor:** Lines ~8545-8555
- **i18n Dictionaries Anchor:** Lines ~3360-3500

---

## 🔨 4. Step-by-Step Surgical Instructions

### Step 3.1: Implement `switchWellbeingSubHub`
```javascript
/**
 * Switches the active sub-hub container within the Wellbeing pane
 * @param {'focus'|'sleep'|'guardrails'|'split'} subHubKey 
 */
function switchWellbeingSubHub(subHubKey) {
  const validKeys = ['focus', 'sleep', 'guardrails', 'split'];
  const targetKey = validKeys.includes(subHubKey) ? subHubKey : 'focus';

  // Update pills
  const pills = document.querySelectorAll('.sub-nav-pill');
  pills.forEach(pill => {
    const isTarget = pill.getAttribute('data-subhub') === targetKey;
    pill.classList.toggle('active', isTarget);
    pill.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  // Toggle sub-containers
  const containerMap = {
    focus: document.getElementById('containerFocusHub'),
    sleep: document.getElementById('containerSleepHub'),
    guardrails: document.getElementById('containerGuardrailsHub'),
    split: document.getElementById('containerWellbeingSplitView')
  };

  Object.keys(containerMap).forEach(key => {
    const el = containerMap[key];
    if (!el) return;
    if (key === targetKey) {
      el.classList.add('active');
      el.classList.remove('hidden');
    } else {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });

  try {
    localStorage.setItem('sentinel_wellbeing_active_subhub', targetKey);
  } catch (_) {}

  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics && typeof sentinelHaptics.playClick === 'function') {
    sentinelHaptics.playClick();
  }
}
```

### Step 3.2: Synchronize in `switchTab('wellbeing')`
In `switchTab(tabKey)` in `dashboard/dashboard.js`:
```javascript
} else if (tabKey === 'wellbeing') {
  if (titleEl) titleEl.textContent = t('title_wellbeing');
  if (subEl) subEl.textContent = t('sub_wellbeing');
  // Restore saved sub-hub
  let savedSubHub = 'focus';
  try {
    savedSubHub = localStorage.getItem('sentinel_wellbeing_active_subhub') || 'focus';
  } catch (_) {}
  switchWellbeingSubHub(savedSubHub);
}
```

### Step 3.3: Wire Sub-Nav Pill Click Listeners
In the DOM initialization routine (e.g. around line ~8545):
```javascript
const subNavPills = document.querySelectorAll('.sub-nav-pill');
subNavPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const key = pill.getAttribute('data-subhub');
    if (key) switchWellbeingSubHub(key);
  });
});
```

### Step 3.4: Smart Deep-Linking from Sidebar Micro-HUD
Update `#wellbeingLiveMicroWidget` click handler:
```javascript
const microWidget = document.getElementById('wellbeingLiveMicroWidget');
if (microWidget) {
  microWidget.addEventListener('click', () => {
    switchTab('wellbeing');
    const isSleepActive = currentDashSleepTimer && (currentDashSleepTimer.state === 'RUNNING' || currentDashSleepTimer.state === 'FADING');
    switchWellbeingSubHub(isSleepActive ? 'sleep' : 'focus');
  });
}
```

### Step 3.5: Register Omni-Palette Commands
In `getOmniPaletteCommands()`:
```javascript
{ id: 'nav-focus-hub', title: 'Go to Focus Sentinel Hub', category: 'Navigation', icon: '🎯', action: () => { switchTab('wellbeing'); switchWellbeingSubHub('focus'); } },
{ id: 'nav-sleep-hub', title: 'Go to Sleep Sentinel Hub', category: 'Navigation', icon: '🌙', action: () => { switchTab('wellbeing'); switchWellbeingSubHub('sleep'); } },
{ id: 'nav-guardrails', title: 'Go to Wellbeing Guardrails & Budgets', category: 'Navigation', icon: '🛡️', action: () => { switchTab('wellbeing'); switchWellbeingSubHub('guardrails'); } },
```

### Step 3.6: Bilingual i18n Dictionary Entries
Add translations to the English (`en`) and Hindi (`hi`) dictionaries:
```javascript
// English (en)
subhub_focus: 'Focus Sentinel',
subhub_sleep: 'Sleep Sentinel',
subhub_guardrails: 'Guardrails & Budgets',
subhub_split: 'Split View',

// Hindi (hi)
subhub_focus: 'फोकस संतरी',
subhub_sleep: 'स्लीप संतरी',
subhub_guardrails: 'सीमाएं और बजट',
subhub_split: 'स्प्लिट व्यू',
```

### Step 3.7: UTF-8 with BOM Verification
Save `dashboard/dashboard.js` strictly with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Out-of-Scope Boundaries
- Do NOT rewrite or mutate timer backend logic in `background.js`.
- Prohibit any function exceeding 50 lines.

---

## 📦 6. Deliverables Manifest
- Updated [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js).

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node -e "
const fs = require('fs');
const js = fs.readFileSync('dashboard/dashboard.js', 'utf8');
const terms = ['switchWellbeingSubHub', 'sentinel_wellbeing_active_subhub', 'nav-focus-hub', 'nav-sleep-hub', 'subhub_focus'];
terms.forEach(t => {
  if (!js.includes(t)) {
    console.error('MISSING JS TERM:', t);
    process.exit(1);
  }
});
console.log('✅ Phase 3 JS Controller Verification: 100% Passed!');
"
```
