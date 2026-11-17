# Product Requirements Document (PRD) — Interactive WebSocket Connection Status Cards

> **Task ID:** `TASK-WS-CARD-NAV-001`  
> **Feature:** Interactive WebSocket Connection Status Cards & Deep-Link Navigation to Settings  
> **Target Audience:** Extension Users, Developers, System Administrators  
> **Status:** Architecture Certified (Level 3C Specialist)  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: The Multi-Tasking Power User
- **Profile:** Tracks daily web browsing and media consumption across Chrome, Edge, and desktop applications.
- **Scenario:** Notices the SQLite Data Hub status dot is red (`offline`) in the sidebar while viewing the Time Tracking analytics pane. Wants to immediately jump to the SQLite Hub settings and reconnect without hunting through navigation menus.

### Persona 2: The Media Sentinel Operator
- **Profile:** Uses the Video Detector HUD desktop overlay daemon (`ws://127.0.0.1:65432`) to synchronize active video playback across Windows applications.
- **Scenario:** Observes the Video Detector HUD status widget is offline. Clicks the card to deep-link directly into the HUD bridge configuration and clicks "Reconnect HUD" within one second.

### Persona 3: The Accessibility-First User
- **Profile:** Navigates the extension dashboard exclusively using keyboard shortcuts, Tab navigation, and screen reader assistive technology.
- **Scenario:** Tabs through sidebar navigation items to the status indicators, hears appropriate accessible names and roles ("SQLite Data Hub Status Indicator. Click or press Enter to configure in Settings"), presses Enter/Space to activate, and is smoothly guided directly to the focused reconnect button.

---

## 🎯 2. Functional Requirements (FR)

- **FR-1: Clickable Status Indicators:**
  - Both `#sidebarDataHubCard` and `#sidebarHudCard` must be interactive visual buttons.
  - Hovering over either card must change the cursor to `pointer` and apply an elevated card hover state (`translateY(-1px)` with specular border glow).
- **FR-2: Keyboard Accessibility (WCAG 2.1 AA Button Pattern):**
  - Both cards must carry `role="button"`, `tabindex="0"`, `aria-controls="cardHardwareBridges"`, and descriptive `aria-label` attributes.
  - Pressing `Enter` or `Space` while focused on either card must trigger the navigation action.
  - When `Space` is pressed, `event.preventDefault()` must be invoked to prevent page scrolling.
- **FR-3: Tab Navigation to Settings:**
  - Activating either card must trigger `switchTab('settings')`, switching the active dashboard pane from the current tab to `#paneSettings`.
  - The Settings navigation tab (`#navTabSettings`) must become active (`aria-selected="true"`).
- **FR-4: Deep-Link Targeted Scroll:**
  - When `#sidebarDataHubCard` is activated, the dashboard view must smoothly scroll to `#rowBridgeHub` (the SQLite Data Hub service row).
  - When `#sidebarHudCard` is activated, the dashboard view must smoothly scroll to `#rowBridgeHud` (the Video Detector HUD service row).
  - Scrolling must use `scrollIntoView({ behavior: 'smooth', block: 'center' })` (or `behavior: 'auto'` if `prefers-reduced-motion` is active).
- **FR-5: Action Button Focus Transfer:**
  - Following tab switch and viewport positioning, keyboard focus must be transferred directly to the corresponding reconnect button:
    - SQLite Data Hub: `#btnSidebarReconnectHub`
    - Video Detector HUD: `#btnSidebarReconnect`
  - A subsequent click or press of `Enter`/`Space` by the user must immediately trigger the reconnect action.
- **FR-6: Transient Visual Feedback:**
  - The target service row must receive `.service-row-highlight`, triggering a glowing border/box-shadow keyframe animation (`serviceRowHighlightGlow`).
  - The target reconnect button must receive `.highlight-pulse`, triggering a scale and pulse animation (`reconnectBtnPulse`).
  - Both highlight classes must automatically clear after 2000 milliseconds to restore default DOM styling.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-1: Performance & Frame Rate:**
  - Tab transition and highlight animations must run at a smooth 60fps with zero layout thrashing or long tasks (>50ms).
- **NFR-2: Strict Security & Trusted Types:**
  - 100% compliant with W3C Trusted Types; zero usage of `innerHTML`, `outerHTML`, or `document.write`.
- **NFR-3: Zero Memory Leaks:**
  - Highlight cleanup timers must be tracked and cleared if the user clicks between cards rapidly, preventing timer accumulation.
- **NFR-4: Motion Safety:**
  - Respect `prefers-reduced-motion: reduce` across both CSS keyframe animations and JavaScript scroll behavior.

---

## 📋 4. INVEST-Compliant User Stories & Acceptance Criteria

### Story 1: SQLite Data Hub Status Deep-Link
```gherkin
Feature: SQLite Data Hub Deep-Link Navigation
  As a dashboard user
  I want to click the SQLite Data Hub status indicator in the sidebar
  So that I am navigated directly to its connection settings and reconnect button

  Scenario: User clicks SQLite Data Hub status card
    Given the user is on any tab of the dashboard (e.g., Time Tracking or Media Analytics)
    When the user clicks the "#sidebarDataHubCard" element
    Then the active tab switches to "Settings & Data"
    And the viewport smoothly scrolls to the "#rowBridgeHub" container
    And the "#btnSidebarReconnectHub" button receives keyboard focus
    And the "#rowBridgeHub" element receives the "service-row-highlight" class
    And the highlight class clears after 2000ms
```

### Story 2: Video Detector HUD Status Deep-Link
```gherkin
Feature: Video Detector HUD Deep-Link Navigation
  As a dashboard user
  I want to click the Video Detector HUD status indicator in the sidebar
  So that I am navigated directly to its HUD bridge configuration and reconnect button

  Scenario: User clicks Video Detector HUD status card
    Given the user is on any tab of the dashboard
    When the user clicks the "#sidebarHudCard" element
    Then the active tab switches to "Settings & Data"
    And the viewport smoothly scrolls to the "#rowBridgeHud" container
    And the "#btnSidebarReconnect" button receives keyboard focus
    And the "#rowBridgeHud" element receives the "service-row-highlight" class
    And the highlight class clears after 2000ms
```

### Story 3: Keyboard Accessibility
```gherkin
Feature: Keyboard Activation of WebSocket Status Cards
  As a keyboard-only user
  I want to activate the WebSocket status cards using Enter or Space
  So that I can configure connections without using a mouse

  Scenario Outline: Keyboard activation with Enter and Space
    Given the user focuses on "<card_id>" using the Tab key
    When the user presses the "<key>" key
    Then the default browser action is prevented for Space
    And the active tab switches to "Settings & Data"
    And the corresponding "<button_id>" receives keyboard focus

    Examples:
      | card_id             | key   | button_id                |
      | #sidebarDataHubCard | Enter | #btnSidebarReconnectHub  |
      | #sidebarDataHubCard | Space | #btnSidebarReconnectHub  |
      | #sidebarHudCard     | Enter | #btnSidebarReconnect     |
      | #sidebarHudCard     | Space | #btnSidebarReconnect     |
```
