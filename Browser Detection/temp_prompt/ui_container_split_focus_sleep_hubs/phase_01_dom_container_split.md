# Phase 01: DOM Container Split & Segmented Sub-Nav Architecture

> **Document Type:** Standalone Phase Execution Directive  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Phase #:** 01 of 04  
> **Target Subsystem:** `dashboard/dashboard.html`  
> **Assigned Subagent Role:** Level 4 Frontend Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 05 (Frontend Engineering)  

---

## 🎯 1. Phase Objective
Refactor the DOM markup inside `dashboard/dashboard.html` within `#paneWellbeing` to introduce a sleek, glassmorphic **Sub-Hub Segmented Controller** (`#wellbeingSubNav`) and wrap the respective widgets into distinct semantic sub-containers:
- `#containerFocusHub` (housing `#widgetPomodoroSentinel`)
- `#containerSleepHub` (housing `#cardSleepSentinelHub`)
- `#containerGuardrailsHub` (housing `#cardDomainBudgets`, `#cardTrackingBlacklist`, `#cardPinnedDomainsQuickview`)
- `#containerWellbeingSplitView` (housing a side-by-side bento layout for dual-view comparison)

**Strict Mandate:** Every existing element ID, SVG path, readout, and child element MUST be preserved identically to prevent breaking any existing test suites or JavaScript event listeners.

---

## 📋 2. Prerequisites & Inputs
1. Clean git working tree on branch `main`.
2. Existing `dashboard/dashboard.html` with `#paneWellbeing` (lines ~1230-1614).
3. Authorization token: `AUTH-MGR-20261118-UI-CONTAINER-SPLIT-FOCUS-SLEEP-HUBS-001`.

---

## ⚓ 3. Technical Context & File Anchors
- **Target File:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1230-L1615)
- **Top Anchor:** `<section id="paneWellbeing" class="tab-pane" role="tabpanel" aria-labelledby="navTabWellbeing">`
- **Bottom Anchor:** `</section>` preceding `<!-- TAB C: SETTINGS & DATA MANAGEMENT -->`

---

## 🔨 4. Step-by-Step Surgical Instructions

### Step 1.1: Inject `#wellbeingSubNav` Header
Directly inside `#paneWellbeing`, before any cards, insert the segmented sub-hub navigation bar:
```html
<div class="wellbeing-header-wrapper">
  <div id="wellbeingSubNav" class="wellbeing-sub-nav" role="tablist" aria-label="Wellbeing Hub Navigation">
    <button type="button" id="btnSubHubFocus" class="sub-nav-pill active" data-subhub="focus" role="tab" aria-selected="true" aria-controls="containerFocusHub">
      <span class="sub-nav-icon">🎯</span>
      <span id="txtSubNavFocus" class="sub-nav-text" data-i18n="subhub_focus">Focus Sentinel</span>
    </button>
    <button type="button" id="btnSubHubSleep" class="sub-nav-pill" data-subhub="sleep" role="tab" aria-selected="false" aria-controls="containerSleepHub">
      <span class="sub-nav-icon">🌙</span>
      <span id="txtSubNavSleep" class="sub-nav-text" data-i18n="subhub_sleep">Sleep Sentinel</span>
    </button>
    <button type="button" id="btnSubHubGuardrails" class="sub-nav-pill" data-subhub="guardrails" role="tab" aria-selected="false" aria-controls="containerGuardrailsHub">
      <span class="sub-nav-icon">🛡️</span>
      <span id="txtSubNavGuardrails" class="sub-nav-text" data-i18n="subhub_guardrails">Guardrails & Budgets</span>
    </button>
    <button type="button" id="btnSubHubSplitView" class="sub-nav-pill" data-subhub="split" role="tab" aria-selected="false" aria-controls="containerWellbeingSplitView" title="Side-by-side Bento View">
      <span class="sub-nav-icon">🔲</span>
      <span id="txtSubNavSplit" class="sub-nav-text" data-i18n="subhub_split">Split View</span>
    </button>
  </div>
</div>
```

### Step 1.2: Restructure Containers inside `#tabContentWellbeing`
Inside `#tabContentWellbeing`, create distinct sub-containers:
1. `<div id="containerFocusHub" class="wellbeing-sub-container active" role="tabpanel" aria-labelledby="btnSubHubFocus">`
   - Place `#widgetPomodoroSentinel` inside it. Ensure `#widgetPomodoroSentinel` has classes `bento-card liquid-glass-card bento-span-12 pomodoro-hero-card`.
2. `<div id="containerSleepHub" class="wellbeing-sub-container hidden" role="tabpanel" aria-labelledby="btnSubHubSleep">`
   - Place `#cardSleepSentinelHub` inside it. Ensure `#cardSleepSentinelHub` has classes `bento-card liquid-glass-card bento-span-12 sleep-hero-card`.
3. `<div id="containerGuardrailsHub" class="wellbeing-sub-container hidden" role="tabpanel" aria-labelledby="btnSubHubGuardrails">`
   - Place `#cardDomainBudgets`, `#cardTrackingBlacklist`, and `#cardPinnedDomainsQuickview` inside it.
4. `<div id="containerWellbeingSplitView" class="wellbeing-sub-container hidden" role="tabpanel" aria-labelledby="btnSubHubSplitView">`
   - Provides a split-view grid layout where cards can render side-by-side (`bento-span-6`).

*Note on Backward Compatibility:* Keep all existing card IDs intact. Do not delete or rename any ID.

### Step 1.3: Character Encoding Verification
Save `dashboard/dashboard.html` strictly with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Out-of-Scope Boundaries
- Do NOT alter any DOM IDs outside of `#paneWellbeing`.
- Do NOT modify `background.js` or timer business logic.
- Do NOT introduce any `innerHTML` calls.

---

## 📦 6. Deliverables Manifest
- Updated [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) with `#wellbeingSubNav` and sub-containers.

---

## 🧪 7. Local Verification Gate
Execute the following verification command in the project root:
```powershell
node -e "
const fs = require('fs');
const html = fs.readFileSync('dashboard/dashboard.html', 'utf8');
const requiredIds = [
  'wellbeingSubNav',
  'btnSubHubFocus',
  'btnSubHubSleep',
  'btnSubHubGuardrails',
  'btnSubHubSplitView',
  'containerFocusHub',
  'containerSleepHub',
  'containerGuardrailsHub',
  'widgetPomodoroSentinel',
  'cardSleepSentinelHub',
  'cardDomainBudgets',
  'cardTrackingBlacklist',
  'cardPinnedDomainsQuickview'
];
requiredIds.forEach(id => {
  if (!html.includes('id=\"' + id + '\"')) {
    console.error('MISSING ID:', id);
    process.exit(1);
  }
});
console.log('✅ Phase 1 DOM Verification: 100% Passed!');
"
```
Gate Pass Criteria: Exit code 0 with `✅ Phase 1 DOM Verification: 100% Passed!`.
