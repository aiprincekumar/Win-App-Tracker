# 6-Tab Single-Word Architecture UI/UX Refinement — Tracking Board & Dossier

> **Task ID:** `TASK-POPUP-6TAB-UIUX-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/six_tab_popup_architecture/INDEX.md`  
> **Status:** `ACTIVE / PROMPTS_GENERATED`  
> **Implementation Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The Web Activity & Media Sentinel extension popup previously operated with a 4-pillar navigation (`Player`, `Audio Lab`, `Studio`, `Focus`). While a significant improvement over the legacy 2-tab view, grouping multiple disparate capabilities into broad pillars caused cognitive density issues within the strict 420px popup width:
1. The **Player** pane combined core playback telemetry with rich background automation switches (`#cardSmartAutomations`), creating unnecessary vertical scrolling.
2. The **Focus** pane combined analytics (donut chart, stats pills, domain activity breakdown table) with wellness features (`#cardFocusWellness`), overloading a single view.
3. Multi-word tab titles (`Audio Lab`) caused irregular horizontal button widths and visual imbalance.

### 1.2 The Solution: 6-Tab Single-Word Architecture
Adopt an ultra-clean, symmetrical, high-density 6-Tab Single-Word Architecture where each tab features a distinct icon and a single concise word:
1. **Tab 1: `🎬 Media` (`#mainTabMedia` -> `#viewMediaPane`):** Core live media telemetry, dynamic interactive status button, full video title, timeline seeker, watched/total progress stats, volume slider, quick mute, and player in-card micro-actions row (`#playerMicroActionsRow`).
2. **Tab 2: `🎛️ Audio` (`#mainTabAudio` -> `#viewAudioPane`):** Dedicated sound engineering hub containing Master Volume & 0-200% Boost slider, Audio-Only Mode toggle, 5-Band Graphic Equalizer (`#audioEqCard`) with frequency sliders (60Hz, 250Hz, 1kHz, 4kHz, 16kHz) and 5 presets, plus Dialogue Vocal Clarity and Night Listening Shield.
3. **Tab 3: `⚡ Tools` (`#mainTabTools` -> `#viewToolsPane`):** Dedicated automation and browser utility hub housing Smart Automations (`#cardSmartAutomations`: Auto-Pause on new tab, Auto Ad Silencer, Domain Speed Memory), Cinema Dimmer, Loop Media, and quick tool toggles.
4. **Tab 4: `📚 Studio` (`#mainTabStudio` -> `#viewStudioPane`):** Timestamp note-taking card (`#studioNoteCard`), bookmarked timestamp clips list (`#studioBookmarksCard`), screenshot gallery (`#studioScreenshotsCard`), and "Pick Up Where You Left Off" resume card (`#studioResumePlaybackCard`).
5. **Tab 5: `⏱️ Tracking` (`#mainTabTracking` -> `#viewTrackingPane`):** Dedicated time and digital wellness analytics hub housing Donut Chart (`#donutChartContainer`), stats pills (`#pillTodayTime`, `#pillDailyAvg`, `#pillSessionsCount`), Focus Ratio Balance Bar, and Doomscroll Breaker (`#doomscrollBreakerCard`).
6. **Tab 6: `🌐 Domains` (`#mainTabDomains` -> `#viewDomainsPane`):** Comprehensive web domain activity directory (`.breakdown-section`), category filter dropdown (`#domainCategorySelect`), real-time search input (`#domainSearchInput`), and scrollable domain records container (`#domainsListContainer`).

### 1.3 Ironclad Architectural Invariants & Constraints
- **ZERO Backend Mutations:** Strictly pure frontend UI/UX modifications. No changes permitted to `background.js`, WebSocket servers, native daemons, or IPC protocols ("बैकएंड में अभी कोई भी चेंजिंग नहीं करना है").
- **Preservation of All 34 Canonical DOM IDs:** Every existing element ID (`mediaSentinelCard`, `dynamicStatusBtn`, `progressBarContainer`, `volumeBarContainer`, `btnQuickSettings`, `cardSmartAutomations`, `audioEqCard`, `studioNoteCard`, `cardFocusWellness`, `donutChartContainer`, footer toolbar buttons `#btnRefresh` through `#btnOpenDashboard`, etc.) remains strictly intact.
- **Fixed 420px Viewport Geometry:** Symmetrical 6-column CSS grid (`repeat(6, 1fr)`) with compact padding and micro-typography (10.5px) ensuring zero horizontal clipping or wrapping.
- **100% Test Suite Integrity:** All 14 existing automated test suites must pass cleanly with 0 failures.

---

## 📋 2. Comprehensive Phase Status Checklist

| Phase # | Phase Title | Status | Assigned Role | Test Gate | Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | HTML DOM Restructuring & 6-Pane Decomposition | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_syntax_and_manifest_integrity.js` | Grade A+ |
| **Phase 02** | High-Density 420px CSS Grid & Aesthetic Styling | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_four_pillar_hub_ui.js` | Grade A+ |
| **Phase 03** | JavaScript Tab Switching & Storage Persistence | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_tab_switch_and_storage_persistence.js` | Grade A+ |
| **Phase 04** | Test Suite Alignment & 14-Suite Full Regression | `PENDING_AUTHORIZATION` | Level 4 QA Verification Tester | All 14 test suites passing cleanly | Grade A+ |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause / Scope | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `popup/popup.html` | Navigation limited to 4 tabs; Player pane cluttered with automations; Tracking pane overloaded with domain list | Add `#mainTabTools` and `#mainTabDomains` to `<nav class="top-nav-tabs">`; create `#viewToolsPane` and `#viewDomainsPane`; migrate `#cardSmartAutomations` into Tools pane and `.breakdown-section` into Domains pane | Modular 6-tab organization; zero element deletion; all 34 canonical IDs preserved | Phase 01 | `node tests/test_syntax_and_manifest_integrity.js` |
| 2 | `popup/popup.css` | `.top-nav-tabs` configured as 4-column grid (`repeat(4, 1fr)`); tabs lack specific accent gradients for Tools and Domains | Update grid to 6 columns (`repeat(6, 1fr)`); tune button padding to `6px 1px`, font size to `10.5px`, add amber gradient for Tools and emerald gradient for Domains; preserve backward-compatible CSS selector | Symmetrical 420px layout with zero horizontal overflow; distinct color identities for all 6 tabs | Phase 02 | `node tests/test_syntax_and_manifest_integrity.js` |
| 3 | `popup/popup.js` | `switchTopTab` array only tracks 4 tabs (`media`, `audio`, `studio`, `tracking`); event listeners only bound for 4 tabs | Expand `tabs` registry in `switchTopTab` to include `tools` (`#mainTabTools`, `#viewToolsPane`) and `domains` (`#mainTabDomains`, `#viewDomainsPane`); bind click listeners; persist active tab to `chrome.storage.local` | Seamless switching across all 6 tabs with immediate state persistence | Phase 03 | `node tests/test_tab_switch_and_storage_persistence.js` |
| 4 | `popup/popup.js` | Default tab fallback & Quick Settings default tab selector need support for `tools` and `domains` | Add `<option value="tools">⚡ Tools</option>` and `<option value="domains">🌐 Domains</option>` to `#selectDefaultTab`; handle default boot | User can configure any of the 6 tabs as default landing view | Phase 03 | `node -c popup/popup.js` |
| 5 | `tests/test_four_pillar_hub_ui.js` | Test 8 explicitly asserts `grid-template-columns: repeat(4, 1fr)` and Test 1 checks only 4 tabs | Update test assertions to verify all 6 navigation tabs (`media`, `audio`, `tools`, `studio`, `tracking`, `domains`) and 6 view panels while maintaining full backward compatibility | 100% test passage for 6-tab architecture | Phase 04 | `node tests/test_four_pillar_hub_ui.js` |
| 6 | Entire Test Suite | 14 test suites must execute cleanly without regressions | Run all 14 test suites in sequence: `test_syntax_and_manifest_integrity.js`, `test_four_pillar_hub_ui.js`, `test_volume_timeline_fullscreen_controls.js`, etc. | 14/14 test suites pass with 100% success | Phase 04 | Full workspace test runner |
