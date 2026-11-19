# Phase 3: Verification Test Suite & QA Signoff Specification

> **Phase Identifier:** `PHASE-03-VERIFICATION-QA`  
> **Task:** Sleep Cutoff Sentinel & Power Automation Redesign  
> **Target Files:**
> - `tests/test_sleep_cutoff_power_automation_redesign.js` (New dedicated test suite)
> - `tests/test_ui_container_split_focus_sleep.js`
> - `tests/test_dashboard_sleep_pause_and_parity.js`
> - `tests/test_advanced_features_focus_sleep.js`  
> **Target Sub-Agent:** Level 4 QA Verification Subagent  
> **Pre-requisite:** Phase 1 & 2 Execution Complete & Manager Authorization Token (`AUTH-MGR-*`)

---

## 🎯 1. Phase Objective
Author a comprehensive automated test suite `tests/test_sleep_cutoff_power_automation_redesign.js` covering the new 2-column grid architecture, toggle components, select integration, accessibility roles, and UTF-8 BOM encoding. Execute regression suites and provide Grade A+ certification with exit code 0.

---

## 🧪 2. Test Battery Matrix for `test_sleep_cutoff_power_automation_redesign.js`

| Battery # | Battery Name | Test Assertions |
| :--- | :--- | :--- |
| **Battery 1** | DOM Architecture & 2-Column Grid | Verifies `#widgetSleepAdvancedAutomation` contains `.dash-sleep-toggles-container` and exactly 10 cards (`.dash-sleep-toggle-row` and `.dash-sleep-select-row`). |
| **Battery 2** | Switch Toggle Markup & Roles | Verifies all 9 toggles have `<label class="switch-toggle">`, `<input role="switch">`, and `<span class="slider-round">`. |
| **Battery 3** | Timeout Action Select Integration | Verifies `#selectDashSleepTimeoutAction` exists inside `.dash-sleep-select-row` with options `pause`, `mute`, and `close_tab`. |
| **Battery 4** | Complete 10 Control IDs Verification | Confirms all 10 IDs (`toggleDashSleepEndOfVideo`, `toggleSleepAutoplayBlock`, `toggleDashSleepInactivity`, `toggleSleepInactivityFastCutoff`, `selectDashSleepTimeoutAction`, `toggleSleepScreenDimmer`, `toggleSleepTabHibernate`, `toggleSleepCloseAllMediaTabs`, `toggleSleepDarkenDisplay`, `toggleSleepSystemInactivitySync`) exist. |
| **Battery 5** | CSS Grid & Responsive Sizing | Verifies `.dash-sleep-toggles-container` defines `grid-template-columns: repeat(2, minmax(0, 1fr))` and 768px media query in stylesheets. |
| **Battery 6** | W3C Trusted Types & Security Audit | Confirms zero `innerHTML` usage and zero unsafe inline handlers in touched code. |
| **Battery 7** | UTF-8 with BOM Standard | Confirms `0xEF, 0xBB, 0xBF` preamble on `dashboard.html`, `wellbeing_blacklist.css`, `focus_sleep_advanced.css`, and `dashboard.css`. |

---

## 🛠️ 3. Execution & Regression Commands

```bash
# 1. Run new dedicated test suite
node tests/test_sleep_cutoff_power_automation_redesign.js

# 2. Run existing container split regression suite
node tests/test_ui_container_split_focus_sleep.js

# 3. Run existing sleep pause and parity regression suite
node tests/test_dashboard_sleep_pause_and_parity.js

# 4. Run existing focus sleep advanced regression suite
node tests/test_advanced_features_focus_sleep.js
```

---

## ✅ 4. Grade A+ Acceptance Gate
- All test batteries in the dedicated suite and regression suites must PASS with 100% exit code 0.
- Zero secret leaks verified via git/gitleaks.
- Clean terminal output captured for final Level 2 Manager report.
