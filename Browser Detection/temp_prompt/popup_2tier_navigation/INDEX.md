# Popup 2-Tier Segmented Control & Hybrid Dynamic Navigation — Tracking Board & Dossier

> **Task ID:** `TASK-POPUP-2TIER-NAV-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Governance Specification:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Path:** `temp_prompt/popup_2tier_navigation/INDEX.md`  
> **Status:** `ACTIVE / PROMPTS_GENERATED`  
> **Implementation Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomy Score: 1.0)  
> **Prompt Requirement:** `PROMPT_FILES_REQUIRED = YES`

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The Chrome Extension Popup for Web Activity & Media Sentinel currently houses 7 navigation tabs (`Media`, `Audio`, `Tools`, `Studio`, `Tracking`, `Domains`, `Sleep`) displayed in a single horizontal navigation row (`.top-nav-tabs`). In a compact 420px popup container:
1. **Visual Crowding & Micro-Targets:** Squeezing 7 buttons into 420px forces narrow button widths (~56px each), compressed typography (10px), and micro touch targets that impair user ergonomics.
2. **Context Switching Friction:** Users wanting live playback controls must mentally scan past analytics and sleep tabs; users wanting screen-time analytics must visually skip past playback and sound engineering tabs.
3. **Static Tab Presentation:** The navigation lacks dynamic contextual awareness. While media is actively playing, playback telemetry should be front and center; when media is idle, productive digital wellness and site activity analytics should be prioritized, without clobbering user manual intent.

### 1.2 The Solution: 2-Tier Segmented Control & Hybrid Dynamic Navigation
Introduce a high-efficiency 2-Tier Segmented Control architecture:
1. **Tier 1: Top-Tier Category Segmented Navigation (`#tier1SegmentedNav`):**
   A sleek, modern segmented pill control featuring 4 functional categories:
   - **🎬 Playback (`#tier1BtnPlayback`):** Core media playback, audio equalization/DSP, and smart playback automations.
     - Maps to Tier 2 tabs: `Media` (`#mainTabMedia`), `Audio` (`#mainTabAudio`), `Tools` (`#mainTabTools`).
   - **📚 Studio (`#tier1BtnStudio`):** Creative clips, timestamp notes, and saved playback sessions.
     - Maps to Tier 2 tab: `Studio` (`#mainTabStudio`).
   - **⏱️ Analytics (`#tier1BtnAnalytics`):** Productive browsing telemetry, donut charts, and domain activity.
     - Maps to Tier 2 tabs: `Tracking` (`#mainTabTracking`), `Domains` (`#mainTabDomains`).
   - **🌙 Wellness (`#tier1BtnWellness`):** Focus sessions, bedtime cutoff, and sleep timer automation.
     - Maps to Tier 2 tab: `Sleep` (`#mainTabSleep`).

2. **Tier 2: Filtered Sub-Navigation (`.top-nav-tabs`):**
   When a Tier 1 category is active, the second tier dynamically filters and displays only the corresponding child tabs, expanding touch targets (~130px for 3 tabs, ~195px for 2 tabs) with crisp typography and distinct visual breathing room.

3. **Hybrid Dynamic Media State Detection & Manual Selection Preservation:**
   - **Dynamic Context Routing:**
     - When media is actively playing (`isPlayingNow === true`): Automatically activates **Playback** category and `Media` tab.
     - When media is idle or stopped (`!hasActiveMedia`): Automatically switches to **Analytics** category and `Tracking` tab.
   - **Manual Selection Preservation Lock:**
     - When a user explicitly clicks any Tier 1 category or Tier 2 tab, `userManualOverride` is latched to `true`.
     - Periodic background polling or refresh heartbeats are strictly prohibited from resetting or bouncing the user's manual selection.

4. **Theme Parity, Bilingual i18n & Zero-innerHTML Safety:**
   - Full dark mode and light mode styling with WCAG 2.1 AA compliant contrast.
   - Bilingual localization (`en.json` and `hi.json`) for all new segmented controls.
   - 100% W3C Trusted Types compliance: zero `innerHTML` mutations, strictly `textContent` and `setAttribute`.

### 1.3 Ironclad Architectural Invariants
- **ZERO Backend Mutations:** 100% frontend extension UI/UX enhancement. Zero edits to `background.js`, WebSocket servers, native daemons, or IPC protocols ("बैकएंड में अभी कोई भी चेंजिंग नहीं करना है").
- **Preservation of All 7 Canonical Tab IDs & Panes:** `#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`, `#mainTabSleep` and `#viewMediaPane` through `#viewSleepPane` remain completely intact.
- **Fixed 420px Popup Geometry:** Symmetrical layout, zero horizontal scrollbars, zero viewport clipping.
- **100% Master Test Suite Integrity:** All 89 existing automated test suites plus the new independent test suite `test_popup_2tier_navigation.js` must pass with exit code 0.

---

## 📂 2. Ephemeral Architecture Specifications & Documentation Dossier

| Document | Purpose & Path | Status |
| :--- | :--- | :--- |
| **SUMMARY.md** | [Executive Architecture Summary](SUMMARY.md) | `ACTIVE` |
| **PRD.md** | [Product Requirements Document](PRD.md) | `ACTIVE` |
| **TRD.md** | [Technical Architecture & State Contract](TRD.md) | `ACTIVE` |
| **DESIGN.md** | [Design System & UI Tokens](DESIGN.md) | `ACTIVE` |
| **Phase 01 Prompt** | [PHASE_01_DOM_AND_I18N.md](PHASE_01_DOM_AND_I18N.md) | `PENDING_AUTHORIZATION` |
| **Phase 02 Prompt** | [PHASE_02_CSS_AND_THEMES.md](PHASE_02_CSS_AND_THEMES.md) | `PENDING_AUTHORIZATION` |
| **Phase 03 Prompt** | [PHASE_03_JS_HYBRID_NAVIGATION.md](PHASE_03_JS_HYBRID_NAVIGATION.md) | `PENDING_AUTHORIZATION` |
| **Phase 04 Prompt** | [PHASE_04_TESTING_AND_VERIFICATION.md](PHASE_04_TESTING_AND_VERIFICATION.md) | `PENDING_AUTHORIZATION` |

---

## 📋 3. Comprehensive Phase Status Checklist

| Phase # | Phase Title | Status | Assigned Role | Test Gate | Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | [HTML DOM Restructuring & Bilingual i18n Parity](PHASE_01_DOM_AND_I18N.md) | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_syntax_and_manifest_integrity.js` | Grade A+ |
| **Phase 02** | [CSS 2-Tier Segmented Control & Theme Parity](PHASE_02_CSS_AND_THEMES.md) | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_theme_toggle.js` | Grade A+ |
| **Phase 03** | [JS Hybrid State Detection, Filtering & Manual Lock](PHASE_03_JS_HYBRID_NAVIGATION.md) | `PENDING_AUTHORIZATION` | Level 4 Frontend Engineer | `node tests/test_tab_switch_and_storage_persistence.js` | Grade A+ |
| **Phase 04** | [Independent Test Suite & Master Test Verification](PHASE_04_TESTING_AND_VERIFICATION.md) | `PENDING_AUTHORIZATION` | Level 4 QA Verification Tester | `node tests/test_popup_2tier_navigation.js` & `node run_all_tests.js` | Grade A+ |

---

## 📊 4. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause / Scope | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `popup/popup.html` | 7 tabs crowded in one row without categorical grouping | Add `#tier1SegmentedNav` container with 4 category buttons (`#tier1BtnPlayback`, `#tier1BtnStudio`, `#tier1BtnAnalytics`, `#tier1BtnWellness`); add `data-group` attributes to 7 child tabs | Clean 2-tier hierarchy; zero deletion of existing tab IDs; ARIA accessible tablists | Phase 01 | `node tests/test_syntax_and_manifest_integrity.js` |
| 2 | `locales/en.json` & `locales/hi.json` | Missing localization strings for Tier 1 segmented buttons | Add keys: `tier1_playback`, `tier1_studio`, `tier1_analytics`, `tier1_wellness` in both English and Hindi | Seamless bilingual language toggle parity; zero untranslated text | Phase 01 | `node tests/test_dashboard_i18n_bilingual_parity.js` |
| 3 | `popup/popup.css` | No styles for `#tier1SegmentedNav`; `.top-nav-tabs` statically divides 6-7 columns | Add glassmorphism pill segmented container styles; add dynamic filtering classes (`.tab-hidden`, `.group-playback`, etc.); add light mode contrast variables | Ergonomic touch targets; smooth pill animation; WCAG AA compliance in both dark and light themes | Phase 02 | `node tests/test_theme_toggle.js` |
| 4 | `popup/popup.js` | Tab switching logic lacks Tier 1 awareness and dynamic filtering of child tabs | Implement `switchTier1Category(category, isManual)` and update `switchTopTab`; synchronize Tier 1 with active tab; dynamically show/hide child tabs; wire click events | Seamless 2-tier switching; child tabs filter smoothly; active state persisted in storage | Phase 03 | `node tests/test_tab_switch_and_storage_persistence.js` |
| 5 | `popup/popup.js` | Auto-switch only knows `media` vs `tracking` and can override user clicks | Enhance `updateLiveMediaCard` to switch Tier 1 (`playback` on active media, `analytics` on idle) while strictly respecting `userManualOverride` | Intelligent zero-click contextual mode routing; zero disruptive clobbering of user selections | Phase 03 | `node -c popup/popup.js` |
| 6 | `tests/test_popup_2tier_navigation.js` | Need formal regression and functional proof for 2-tier navigation | Author comprehensive unit/integration test suite covering Tier 1 DOM, dynamic filtering, hybrid switching, manual lock, i18n, and CSP compliance | Automated verification gate proving 100% specification compliance | Phase 04 | `node tests/test_popup_2tier_navigation.js` |
| 7 | `run_all_tests.js` | Master test suite must verify entire project with 0 regressions | Execute all test suites including new 2-tier navigation test | 90/90 suites pass cleanly with exit code 0 | Phase 04 | `node run_all_tests.js` |
