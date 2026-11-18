# Technical Requirements Document (TRD): UI Container Split for Focus & Sleep Hubs

> **Document Type:** Technical Requirements Document (TRD)  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Initiative ID:** `TASK-UI-SPLIT-FOCUS-SLEEP-HUBS-001`  
> **Lead Department:** Dept 02 (Solution Architecture) & Dept 05 (Frontend Engineering)  

---

## 🏛️ 1. High-Level Design (HLD) & Architectural Boundaries

### 1.1 Structural Topology
To preserve 100% backward compatibility while delivering an expansive, uncluttered user experience, the container split introduces a 2-tier containment model within the existing `#paneWellbeing` section:

```
#paneWellbeing (Tab D: Focus & Sleep Hub)
├── #wellbeingSubNav (Segmented Sub-Hub Controller Bar)
│   ├── #btnSubHubFocus       [🎯 Focus Sentinel]
│   ├── #btnSubHubSleep       [🌙 Sleep Sentinel]
│   ├── #btnSubHubGuardrails  [🛡️ Guardrails & Budgets]
│   └── #btnSubHubSplitView   [🔲 Bento Split Overview]
│
├── #containerFocusHub (.wellbeing-sub-container)
│   └── #widgetPomodoroSentinel (Expanded Hero Focus Card, full bento-span-12)
│
├── #containerSleepHub (.wellbeing-sub-container)
│   └── #cardSleepSentinelHub (Expanded Hero Sleep Card, full bento-span-12)
│
├── #containerGuardrailsHub (.wellbeing-sub-container)
│   ├── #cardDomainBudgets (bento-span-6)
│   ├── #cardTrackingBlacklist (bento-span-6)
│   └── #cardPinnedDomainsQuickview (bento-span-12)
│
└── #containerWellbeingSplitView (.wellbeing-sub-container)
    └── (Side-by-side bento layout for multi-panel comparison)
```

### 1.2 Architectural Invariants
1. **Zero Node Renaming:** Existing DOM element IDs (`widgetPomodoroSentinel`, `cardSleepSentinelHub`, `cardDomainBudgets`, `cardTrackingBlacklist`, `cardPinnedDomainsQuickview`, `paneWellbeing`, `navTabWellbeing`) are strictly retained.
2. **Deterministic State Synchronization:** All timer updates (Pomodoro ticker, Sleep ticker, IPC messages from background service worker) continue to bind directly to their respective element IDs regardless of which sub-hub container is currently active.
3. **No Hidden State Desync:** If an active timer fires a tick or event while its container is visually hidden, the DOM continues updating in the background so that switching to that sub-hub presents immediately accurate data.

---

## 🔧 2. Low-Level Design (LLD) & DOM Specifications

### 2.1 Sub-Hub Segmented Navigation Bar (`#wellbeingSubNav`)
```html
<div id="wellbeingSubNav" class="wellbeing-sub-nav" role="tablist" aria-label="Wellbeing Hub Sections">
  <button type="button" id="btnSubHubFocus" class="sub-nav-pill active" data-subhub="focus" role="tab" aria-selected="true" aria-controls="containerFocusHub">
    <span class="sub-nav-icon">🎯</span>
    <span id="txtSubNavFocus" data-i18n="subhub_focus">Focus Sentinel</span>
  </button>
  <button type="button" id="btnSubHubSleep" class="sub-nav-pill" data-subhub="sleep" role="tab" aria-selected="false" aria-controls="containerSleepHub">
    <span class="sub-nav-icon">🌙</span>
    <span id="txtSubNavSleep" data-i18n="subhub_sleep">Sleep Sentinel</span>
  </button>
  <button type="button" id="btnSubHubGuardrails" class="sub-nav-pill" data-subhub="guardrails" role="tab" aria-selected="false" aria-controls="containerGuardrailsHub">
    <span class="sub-nav-icon">🛡️</span>
    <span id="txtSubNavGuardrails" data-i18n="subhub_guardrails">Guardrails & Budgets</span>
  </button>
  <button type="button" id="btnSubHubSplitView" class="sub-nav-pill" data-subhub="split" role="tab" aria-selected="false" aria-controls="containerWellbeingSplitView" title="Side-by-side Bento View">
    <span class="sub-nav-icon">🔲</span>
    <span id="txtSubNavSplit" data-i18n="subhub_split">Split View</span>
  </button>
</div>
```

### 2.2 Sub-Container Classes and Visibility Controls
Each sub-container receives:
- Class: `.wellbeing-sub-container`
- State Class: `.active` (when selected, `display: block; opacity: 1; transform: translateY(0);`)
- Inactive Class: `.hidden` (or absence of `.active`, `display: none;`)

---

## 🔄 3. State Management & Lifecycle Architecture

### 3.1 Controller State & Storage Schema
- **Storage Key:** `sentinel_wellbeing_active_subhub`
- **Allowed Values:** `'focus'` | `'sleep'` | `'guardrails'` | `'split'`
- **Default Value:** `'focus'`

```typescript
interface WellbeingSubHubState {
  activeSubHub: 'focus' | 'sleep' | 'guardrails' | 'split';
  lastSwitched: number;
}
```

### 3.2 State Transition Algorithm (`switchWellbeingSubHub`)
```javascript
function switchWellbeingSubHub(subHubKey) {
  const validKeys = ['focus', 'sleep', 'guardrails', 'split'];
  const targetKey = validKeys.includes(subHubKey) ? subHubKey : 'focus';

  // 1. Update Sub-Nav Buttons ARIA & active classes
  const pills = document.querySelectorAll('.sub-nav-pill');
  pills.forEach(pill => {
    const isTarget = pill.getAttribute('data-subhub') === targetKey;
    pill.classList.toggle('active', isTarget);
    pill.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  // 2. Toggle Sub-Container Visibility
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

  // 3. Persist Selection
  try {
    localStorage.setItem('sentinel_wellbeing_active_subhub', targetKey);
  } catch (_) {}

  // 4. Haptic / Click feedback
  if (typeof sentinelHaptics !== 'undefined' && sentinelHaptics.playClick) {
    sentinelHaptics.playClick();
  }
}
```

### 3.3 Rule 28 Compliance
The `switchWellbeingSubHub` implementation is ~38 lines, adhering strictly to the <= 50 line constraint and nesting depth <= 3.

---

## 🌐 4. Omni-Palette & Deep-Link Integration

### 4.1 Omni-Palette Actions
Register dedicated commands in `dashboard.js` (`getOmniPaletteCommands()`):
- ID: `nav-focus-hub`, Title: `Go to Focus Sentinel Hub`, Category: `Wellbeing`, Icon: `🎯`, Action: `switchTab('wellbeing'); switchWellbeingSubHub('focus');`
- ID: `nav-sleep-hub`, Title: `Go to Sleep Sentinel Hub`, Category: `Wellbeing`, Icon: `🌙`, Action: `switchTab('wellbeing'); switchWellbeingSubHub('sleep');`
- ID: `nav-guardrails`, Title: `Go to Productivity Guardrails & Budgets`, Category: `Wellbeing`, Icon: `🛡️`, Action: `switchTab('wellbeing'); switchWellbeingSubHub('guardrails');`

### 4.2 Sidebar Micro-Widget Deep-Linking
In `dashboard.js`, `#wellbeingLiveMicroWidget` click handler:
- Inspect active timers: If `currentDashSleepTimer` is running/fading and Pomodoro is idle, auto-route to `sleep` sub-hub. Otherwise route to `focus`.

---

## 🔒 5. Security & W3C Trusted Types Guardrails

- **Zero innerHTML:** All DOM generation, text updates, and indicator sync must use `textContent`, `classList`, or native element creation.
- **BOM Preservation:** Enforce UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited source files.
- **Fail-Safe Fallbacks:** If `localStorage` is disabled or blocked, default gracefully in-memory without throwing exceptions.
