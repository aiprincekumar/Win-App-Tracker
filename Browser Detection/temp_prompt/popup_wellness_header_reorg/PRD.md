# Product Requirements Document (PRD) — Popup Mode Wellness Sub-Tabs & Header/Footer Reorganization

> **Task ID:** `TASK-POPUP-WELLNESS-HEADER-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/popup_wellness_header_reorg/PRD.md`  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. Overview & Problem Statement

Users of the Web Activity & Media Sentinel extension rely on the Popup UI for quick access to media playback telemetry, DSP controls, screen time tracking, and sleep timers. However, recent usability feedback reveals three pain points:
1. **Single-Pillar Wellness Navigation:** The Wellness category only provides a Sleep Timer, missing a companion Focus Timer pillar for daytime productivity.
2. **Disorganized Top Header:** Category navigation (`#tier1SegmentedNav`) is clustered between utility buttons without visual hierarchy.
3. **Misplaced Quick Settings Button:** Having the settings gear in the top header clutters the primary navigation space, while appearance toggles (Theme Toggle) reside in the footer dock.

---

## 👥 2. User Personas & Use Cases

- **Alex (Deep Work & Media Consumer):** Wants to easily toggle between daytime Focus sessions and nighttime Sleep timers under a single "Wellness" mental model without hunting through different categories.
- **Priya (Keyboard & Power User):** Uses popup shortcuts and wants category exploration on the left and quick utility buttons on the right for predictable eye scanning.
- **David (Minimalist Operator):** Wants global preferences (Theme toggle & Quick Settings) cleanly grouped together in the bottom utility toolbar so the main canvas stays focused on content.

---

## 📋 3. Functional Requirements (FR)

- **FR-1: Wellness Sub-Tab Navigation:**
  - The Tier 1 Wellness category (`#tier1BtnWellness`) must reveal both `#mainTabSleep` ("Sleep") and `#mainTabFocus` ("Focus") in `.top-nav-tabs`.
  - Clicking `#mainTabFocus` must activate the Focus tab and display `#viewFocusPane` while hiding other view panes.
  - Clicking `#mainTabSleep` must activate the Sleep tab and display `#viewSleepPane` without affecting any running countdown timer.
  - `#viewFocusPane` must display a clean, high-polish placeholder card for future focus timer integration.

- **FR-2: Header Layout Reorganization:**
  - Inside `<header class="header"> .header-badges`, `#tier1SegmentedNav` must be positioned on the left side.
  - `#btnSwitchMediaTab` and `#btnOpenDashboard` must be positioned on the right side of `.header-badges`.
  - Visual separation between navigation and utility actions must be clear and intuitive.

- **FR-3: Quick Settings Button Relocation:**
  - `#btnQuickSettings` must be relocated from `.header-badges` to `<footer>` directly adjacent to `#btnThemeToggle`.
  - Clicking `#btnQuickSettings` must toggle `#quickSettingsPopover`.
  - `#quickSettingsPopover` must open upwards from the footer dock cleanly without being clipped by the window edges.
  - Clicking outside the popover or clicking `#btnCloseQuickSettings` must close the popover and update `aria-expanded="false"`.

- **FR-4: Bilingual i18n Localization:**
  - Both English (`locales/en.json`) and Hindi (`locales/hi.json`) must include strings for the Focus sub-tab and placeholder card.
  - 100% parity must be maintained between English and Hindi keys.

---

## 🛡️ 4. Non-Functional Requirements (NFR)

- **NFR-1 (Geometry & Viewport):** Fixed width of 380px (`min-width: 380px; max-width: 380px;`). Zero horizontal scrollbars (`overflow-x: hidden`).
- **NFR-2 (Performance):** Zero UI lag or re-render flicker during tab switches. Sub-16ms transition response.
- **NFR-3 (Accessibility & WCAG 2.1 AA):** All interactive elements must maintain valid ARIA roles (`role="tab"`, `role="tablist"`, `role="dialog"`, `aria-selected`, `aria-expanded`, `aria-controls`), keyboard focus rings, and high contrast mode compatibility.
- **NFR-4 (Security & Trusted Types):** 100% W3C Trusted Types zero-innerHTML safety. Zero eval or inline script execution.
- **NFR-5 (Non-Interference):** 100% backward compatibility for all existing 91 test suites, especially sleep timer alarms and media playback listeners.

---

## 💎 5. MoSCoW Prioritization

| Priority | Requirement Code | Feature Scope |
| :--- | :--- | :--- |
| **Must Have** | `FR-1`, `FR-2`, `FR-3`, `NFR-1`, `NFR-4`, `NFR-5` | Wellness Focus/Sleep sub-tabs, Header left/right reorder, Footer gear button, 380px zero-scroll, Trusted Types |
| **Should Have** | `FR-4`, `NFR-3` | 100% Bilingual parity in authentic Devanagari Hindi, complete ARIA accessibility |
| **Could Have** | `COULD-01` | Micro-bounce CSS animation on popover entry |
| **Won't Have (This Task)** | `WONT-01` | Full Focus Timer Pomodoro countdown logic (Focus tab is placeholder/dummy structure for now) |

---

## 📜 6. Acceptance Criteria Contracts (Given-When-Then)

### Contract 1: Wellness Sub-Tab Toggling
```gherkin
Scenario: User switches between Sleep and Focus tabs under Wellness category
  Given the popup is open and Tier 1 "Wellness" category (#tier1BtnWellness) is active
  When the user inspects the Tier 2 sub-navigation bar (#topNavTabs)
  Then both "#mainTabSleep" and "#mainTabFocus" are visible and neither has class "tab-hidden"
  And tabs for Playback, Studio, and Analytics have class "tab-hidden"
  When the user clicks "#mainTabFocus"
  Then "#mainTabFocus" has class "active" and aria-selected="true"
  And "#viewFocusPane" has class "active" and is visible
  And "#mainTabSleep" has aria-selected="false" and "#viewSleepPane" is hidden
  When the user clicks "#mainTabSleep"
  Then "#mainTabSleep" has class "active" and "#viewSleepPane" is visible
  And any running sleep timer continues uninterrupted
```

### Contract 2: Header Left/Right Alignment
```gherkin
Scenario: User views the top header layout
  Given the popup is open in 380px width
  When the user views the top header (.header)
  Then "#tier1SegmentedNav" is aligned to the left of the badge cluster
  And "#btnSwitchMediaTab" and "#btnOpenDashboard" are grouped to the right side
  And "#btnQuickSettings" is NOT present in the top header
  And no horizontal scrollbar is present on the popup window
```

### Contract 3: Footer Quick Settings Dock & Popover
```gherkin
Scenario: User triggers Quick Settings from footer dock
  Given the popup is open
  When the user inspects the footer toolbar (footer.footer)
  Then "#btnQuickSettings" is located immediately adjacent to "#btnThemeToggle"
  When the user clicks "#btnQuickSettings"
  Then "#quickSettingsPopover" is toggled from hidden to visible
  And "#quickSettingsPopover" opens upwards from above the footer toolbar
  And "#btnQuickSettings" has aria-expanded="true"
  When the user clicks outside or clicks "#btnCloseQuickSettings"
  Then "#quickSettingsPopover" receives class "hidden"
  And "#btnQuickSettings" has aria-expanded="false"
```
