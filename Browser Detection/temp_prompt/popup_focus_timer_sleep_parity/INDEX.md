# TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002: Live Tracking Board & Problem-Solution Dossier

> **Specification & Governance:**
> - **Task Identifier:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`
> - **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **System Architecture:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)
> - **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Prompt Generation Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)

---

## 📋 1. Executive Problem-Solution Summary

### Problem Context & Defect Analysis
The user provided explicit critical feedback regarding the Focus Timer in the extension popup:
> *"लेकिन इसमें तो सभी बटन, फंक्शन और फीचर स्लीप वाले की तरह नहीं हैं। फोकस को पूरी तरह से स्लीप वाले के जैसा बनाओ, जिसमें कि फोकस को प्लस, माइनस वगैरह जितना भी फीचर है, जो कि पॉप-अप मोड में होना चाहिए, वो ऐड करो। सिर्फ़ तुम गोला, सर्कल, स्लीप टाइमर ऐड कर दिया हो। स्लीप टाइमर के जैसा बाकी फंक्शन और फीचर तो ऐड है ही नहीं।"*
>
> *(English translation: "However, in this, all the buttons, functions, and features are not like the sleep one. Make Focus completely like the sleep timer, where all the features like plus, minus, etc., whatever should be in popup mode, are added. You only added the circle/radial dial for focus like sleep timer. Rest of the functions and features like sleep timer are not added at all.")*

### Technical Gap Analysis (Sleep Timer vs. Current Focus Timer in Popup)
| Feature Dimension | Sleep Timer Tab (`#viewSleepPane`) | Current Focus Card (`#cardPopupFocusTimer`) | Parity Delta / Required Fix |
| :--- | :--- | :--- | :--- |
| **Radial SVG Dial** | Centered SVG Dial ($r=54$, $C=339.292$) with glow gradient | Centered SVG Dial ($r=54$, $C=339.292$) with glow gradient | Present, but lacks target finish time readout |
| **Target Finish Time** | Live readout: `sleepDialFinishTime` ("Finish: 11:30 PM" / "No active timer") | None (`popupFocusClock` and `popupFocusDialState` only) | **MISSING**: Add `#popupFocusDialFinishTime` / `#popupFocusTargetTime` |
| **Quick Action Buttons** | Start/Pause (`btnSleepToggleRun`), +5m (`btnSleepExtend5m`), +15m (`btnSleepExtend15m`), Reset (`btnSleepReset`) | Only Start/Pause (`btnPopupFocusToggle`) and Reset (`btnPopupFocusReset`) | **MISSING**: Add `-5m` (`btnPopupFocusReduce5m`), `+5m` (`btnPopupFocusExtend5m`), `+15m` (`btnPopupFocusExtend15m`), upgrade Toggle to icon + text |
| **Duration Preset Chips** | 6 Preset Chips: 15m, 30m, 45m, 60m, 90m, 120m (`.sleep-tab-preset-btn`) | None in Popup Focus card | **MISSING**: Add Focus Presets grid: 15m, 25m, 30m, 45m, 50m, 60m (`.focus-tab-preset-btn`) with active state tracking |
| **Custom Duration Form** | Input number (1-1440 min) + "Set" button (`btnSetSleepCustom`) | None in Popup Focus card | **MISSING**: Add custom duration input wrap (`#inputFocusCustomMinutes` + `#btnSetFocusCustom`) |
| **Backend Time Delta IPC** | `EXTEND_SLEEP_TIMER` supports positive extension | `EXTEND_FOCUS_TIMER` only supported `minsToAdd > 0` | **MISSING**: Support negative delta (`-5m`) in `extendFocusTimer` with min clamping ($\ge 1$ min / 60s) |
| **Legacy Compatibility** | Fully preserved DOM IDs and event handlers | Must preserve all existing DOM IDs (`#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset`) | **MANDATORY**: Zero breaking changes to existing tests |

### The Surgical 4-Phase Solution
1. **Phase 1: HTML Architecture in `popup/popup.html`**
   - Inject Target Finish Time readout inside `.popup-focus-dial-content` (`#popupFocusDialFinishTime`).
   - Upgrade action controls into `.popup-focus-quick-actions-row` featuring:
     - Toggle button (`#btnPopupFocusToggle` with `#btnPopupFocusToggleIcon` and `#btnPopupFocusToggleText`)
     - Decrement `-5m` (`#btnPopupFocusReduce5m`)
     - Extender `+5m` (`#btnPopupFocusExtend5m`)
     - Extender `+15m` (`#btnPopupFocusExtend15m`)
     - Reset button (`#btnPopupFocusReset`)
   - Add Duration Presets card (`#cardFocusPresetsAndCustom`) featuring 6 preset chips (15m, 25m, 30m, 45m, 50m, 60m) and Custom Duration input form (`#inputFocusCustomMinutes` + `#btnSetFocusCustom`).
   - Preserve all legacy DOM IDs to ensure zero test regressions.
2. **Phase 2: CSS Cyber-Dark Glass Styling in `popup/popup.css` & `popup/styles/tabs/tab_wellness.css`**
   - Style `.popup-focus-quick-actions-row` with cyber capsules, emerald/cyan accents, and responsive layout.
   - Style `.focus-tab-presets-grid` and `.focus-tab-preset-btn` with cyber glassmorphism, active neon borders, and hover micro-animations.
   - Style `.focus-custom-input-row` and `#btnSetFocusCustom` with dark translucent input styling and emerald CTA.
   - Ensure complete light mode compatibility (`[data-theme="light"]`) matching WCAG 2.1 AA contrast standards.
3. **Phase 3: JavaScript State & IPC Controls in `popup/popup.js` & `background.js`**
   - Connect `-5m`, `+5m`, `+15m`, presets, and custom duration input listeners.
   - Update `extendFocusTimer` in `background.js` to support negative delta (decrement `-5m`) with safe clamping ($\ge 1\text{ min}$ / 60s).
   - Dynamically compute and format Target Finish Time ("Finish: 10:45 AM" / "No active timer") on every tick and state transition.
   - Highlight active preset button dynamically when current focus duration matches.
   - Ensure 100% W3C Trusted Types zero-innerHTML safety.
4. **Phase 4: Independent QA Verification & Regression Testing (`tests/`)**
   - Create dedicated 8-battery test suite `tests/test_popup_focus_timer_sleep_parity.js`.
   - Run master regression suite `node run_all_tests.js` ensuring 100% of all test suites pass cleanly (Exit Code 0).
   - Audit for secret leaks via `gitleaks detect --redact` (0 leaks).
   - Verify UTF-8 with BOM on all touched files.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Primary Target Files | Target Subagent | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | HTML Architecture & Full Controls Row | `popup/popup.html` | Frontend Specialist (Level 4) | `PENDING` | Gate 1 Required |
| **02** | CSS Cyber-Dark Glass Styling & Presets | `popup/popup.css`, `popup/styles/tabs/tab_wellness.css` | Frontend Specialist (Level 4) | `PENDING` | Gate 2 Required |
| **03** | JS State, IPC Delta & Target Time Sync | `popup/popup.js`, `background.js` | Fullstack / IPC Specialist (Level 4) | `PENDING` | Gate 3 Required |
| **04** | Independent QA Verification & Regression | `tests/test_popup_focus_timer_sleep_parity.js`, `run_all_tests.js` | QA Verification Subagent (Level 4) | `PENDING` | Gate 4 Required |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | `popup/popup.html` | Focus card lacks +/- buttons, target finish time, preset chips, and custom minute input | Add quick actions row (-5m, +5m, +15m, toggle, reset), finish time span, presets grid, custom input wrap | 100% DOM feature parity with Sleep Timer in popup | Phase 1 | DOM node assertion test |
| 2 | `popup/popup.css` | Missing layout and styles for focus quick actions, preset buttons, and custom input | Add cyber-dark glass classes for `.popup-focus-quick-actions-row`, `.focus-tab-preset-btn`, `.focus-custom-input-wrap` | Premium visual alignment with `tab_sleep.css` | Phase 2 | Visual & CSS class audit |
| 3 | `popup/styles/tabs/tab_wellness.css` | Lacks dedicated rules for focus preset chips and custom duration input | Add scoped rules for `.focus-section-card`, `.focus-tab-presets-grid`, `.focus-tab-preset-btn.active` | Modular CSS encapsulation without style pollution | Phase 2 | CSS token check |
| 4 | `popup/popup.js` | Missing event listeners for +/- buttons, presets, custom minutes, and finish time formatting | Bind click handlers for -5m, +5m, +15m, presets, custom input; implement `formatFocusFinishTime` | Seamless real-time user interaction and state updates | Phase 3 | IPC mock event tests |
| 5 | `background.js` | `extendFocusTimer` rejected non-positive minutes (`minsToAdd <= 0`), preventing `-5m` decrement | Allow negative delta with clamping (`remainingSeconds >= 60`, `durationMinutes >= 1`); update targetTime & alarms | Safe decrements without crashing or negative alarms | Phase 3 | Backend unit tests |
| 6 | `tests/test_popup_focus_timer_sleep_parity.js` | No existing automated test suite specifically verifying Sleep-Focus parity | Construct comprehensive 8-battery automated verification test suite | Guaranteed zero regressions and Grade A+ signoff | Phase 4 | `node tests/test_popup_focus_timer_sleep_parity.js` |

---

## 🛡️ 4. Architecture Invariants & Governance

1. **Constitutional Zero-Code Hard Lock:** All implementations must be executed by dedicated Level 4 Subagents dispatched by Level 2 Manager with an active `AUTH-MGR-*` token.
2. **Zero innerHTML / W3C Trusted Types Safety:** All DOM mutations in `popup.js` and `background.js` must strictly use `textContent`, `setAttribute`, or safe DOM element construction.
3. **UTF-8 with BOM Standard:** All newly created and modified files must maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding.
4. **Rule 28 Line Budget Compliance:** Functions must remain $\le 50$ lines and file complexity within healthy bounds.
5. **Universal Rule 15 Compliance:** Autonomous local micro-commits on every phase completion; secret scanning via `gitleaks` prior to signoff.
