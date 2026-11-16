# Product Requirements Document (PRD)
## Fullscreen Parity & Reliable Execution Specification

> **Task ID:** `TASK-FULLSCREEN-PARITY-002`  
> **Target Version:** `v2.4.2`  
> **Product Lead:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Department Governance:** Department 01 (Product Requirements & Management)  
> **Specification Standard:** INVEST Principles & Gherkin Given-When-Then Contracts  

---

## 📋 1. Executive Summary & Problem Context

### 1.1 Context & User Grievance
Users of the Sentinel Media Controller extension have reported that while the **in-page floating square HUD button** (`#__sentinel_fs_floating_btn__`) successfully toggles fullscreen on video players such as YouTube, clicking the **fullscreen button inside the extension popup** (`#btnCtrlFullscreen`) displays an On-Screen Display (OSD) overlay stating "Fullscreen ⛶", but the video player itself does NOT enter fullscreen mode.

The user mandate states:
> *"फुल स्क्रीन वाला बटन भी काम नहीं कर रहा है। एक स्क्रीन पर डिस्प्ले आ रहा है फुल स्क्रीन, मगर हो नहीं रहा है। तो उसको खुद से चेक करो। बाकी किसी भी कमांड को टच नहीं करना है, सिर्फ फुल स्क्रीन वाला रिलेटेड जो बटन है उसे को टेस्ट करना है... जब उससे काम कर रहा है वीडियो पर राइट साइड में स्क्वायर वाला बटन आ रहा है उससे काम कर रहा है, तो ये जब उसी से लिंक है डायनेमिक राउटिंग हुआ हुआ है, तो फिर ये काम क्यों नहीं कर रहा है? वो काम कर रहा है वहाँ पर क्लिक करने से यहाँ पर क्लिक करने से क्यों नहीं काम कर रहा?"*

### 1.2 Core Product Objective
Deliver 100% reliable fullscreen behavior parity between the extension popup and the in-page floating button, eliminating false-positive OSD messages and guaranteeing that clicking `#btnCtrlFullscreen` in the popup causes the active media player to immediately expand to full viewport size across all web media platforms.

---

## 👥 2. User Personas & Scenarios

### Persona 1: Daily Video Consumer (Multitasking via Extension Popup)
- **Scenario:** The user is watching a lecture or tutorial on YouTube in another window or background monitor. They open the Sentinel extension popup to control media and click the Fullscreen button.
- **Expectation:** The video on the target tab immediately fills the viewport/screen. The user should never see an OSD message claiming "Fullscreen" if the video remained small.

### Persona 2: In-Page Video Watcher (Direct UI Interaction)
- **Scenario:** The user hovers over the YouTube player, sees the square Sentinel floating HUD button on the top right, and clicks it.
- **Expectation:** Native OS fullscreen engages immediately via browser transient user activation. If the browser blocks native fullscreen, it falls back seamlessly to Web Fullscreen without jarring failure.

---

## 🎯 3. Functional Requirements (FR)

| Requirement ID | Title | Description | Priority |
| :--- | :--- | :--- | :---: |
| **FR-01** | **Popup Fullscreen Reliability** | Clicking `#btnCtrlFullscreen` in `popup/popup.js` MUST reliably toggle fullscreen mode on the active media tab, filling the viewport. | MUST HAVE |
| **FR-02** | **Synthetic Event Fallback** | When a fullscreen action is triggered via synthetic events (`e.isTrusted === false`) from extension popups or background scripts, the controller MUST automatically engage Web Fullscreen (`enterWebFullscreen`) rather than failing silently on native clicks. | MUST HAVE |
| **FR-03** | **Truthful OSD Presentation** | The On-Screen Display (OSD) message `showOSD('Fullscreen', '⛶')` MUST only display if fullscreen was actually activated (`isFullscreenActive() === true`). If native fullscreen failed, no premature success notification may be shown. | MUST HAVE |
| **FR-04** | **In-Page Floating Button Parity** | The floating square HUD button (`#__sentinel_fs_floating_btn__`) MUST continue to trigger native fullscreen on physical user clicks (`e.isTrusted === true`) and fall back to web fullscreen if native is rejected. | MUST HAVE |
| **FR-05** | **IPC Media Control Fallback** | In `content_media.js`, handling `toggle_fullscreen` over Chrome IPC MUST reliably engage web fullscreen if the floating button is missing or unclickable. | MUST HAVE |

---

## ⚡ 4. Non-Functional Requirements (NFR)

| Requirement ID | Metric | Target Specification |
| :--- | :--- | :--- |
| **NFR-01: Performance & Latency** | Toggle Activation Time | Fullscreen activation must execute within `< 50ms` from user click. |
| **NFR-02: Security & W3C Standards** | W3C Trusted Types Compliance | Zero assignments to `.innerHTML`. All DOM and SVG injections must use `document.createElement`, `document.createElementNS`, and text nodes. |
| **NFR-03: Scope Isolation** | Blast Radius | Zero modification to other media controls (`#btnGlobalMediaToggle`, play/pause, volume, timeline, speed, PiP). |
| **NFR-04: Compatibility** | Cross-Browser & Site Parity | Function seamlessly on YouTube, Twitch, Netflix, Vimeo, and arbitrary HTML5 `<video>` tags. |

---

## 📖 5. INVEST-Compliant User Stories

### User Story 1: Popup Fullscreen Parity
> **As a** user controlling media from the Sentinel extension popup,  
> **I want** clicking `#btnCtrlFullscreen` to actually make the video player full screen on the target tab,  
> **So that** I don't have to navigate to the tab and manually search for the video's fullscreen button.

### User Story 2: Synthetic Event Fallback Determinism
> **As an** extension engine handling cross-world scripting,  
> **I want** synthetic events (`isTrusted: false`) to automatically invoke CSS Web Fullscreen,  
> **So that** browser and YouTube security restrictions against programmatic native fullscreen requests do not break functionality.

### User Story 3: Verified OSD Presentation
> **As a** user observing feedback overlays on screen,  
> **I want** the "Fullscreen ⛶" OSD notification to appear ONLY when the video actually expands,  
> **So that** I am never deceived by false-positive indicators when an action was blocked.

---

## ⚖️ 6. MoSCoW Prioritization

- **Must Have:**
  - True state verification before showing OSD or returning success in `enterNativeFullscreen()`.
  - Synthetic event guard (`!e.isTrusted`) in floating button listener to trigger web fullscreen directly.
  - Direct controller invocation (`{ forceWeb: true }`) prioritized in `popup/popup.js`.
  - Reliable IPC fallback in `content_media.js`.
- **Should Have:**
  - Automated tests validating synthetic event paths.
  - Smooth 0.25s CSS transition for web fullscreen expansion.
- **Could Have:**
  - Subtle sound effect on fullscreen toggle (future enhancement).
- **Won't Have (Strict Anti-Scope):**
  - Modifying `#btnGlobalMediaToggle` or any other media button.
  - Changing popup layout, color schemes, or dimensions.
  - Altering PiP or playback rate logic.

---

## 📝 7. Given-When-Then Acceptance Criteria Contracts

### Contract 1: In-Page Floating Button Physical Click (Trusted Gesture)
```gherkin
Scenario: User physically clicks the floating square HUD button on YouTube player
  Given a YouTube video is actively playing on the page
  And the Sentinel floating button (#__sentinel_fs_floating_btn__) is visible
  When the user physically clicks the button with a mouse (e.isTrusted === true)
  Then enterNativeFullscreen() is invoked
  And ytFsBtn.click() or requestFullscreen() is executed with user activation
  And isFullscreenActive() becomes true
  And the OSD notification displays "Fullscreen ⛶"
```

### Contract 2: Extension Popup Fullscreen Click (Synthetic Scripting)
```gherkin
Scenario: User clicks the fullscreen button inside the extension popup
  Given the extension popup is open
  And a YouTube video is playing in the active or primary media tab
  When the user clicks #btnCtrlFullscreen
  Then executeScript invokes window.__SentinelFullscreenController.toggle(null, { forceWeb: true })
  And enterWebFullscreen() applies .sentinel-fullscreen-active to documentElement and body
  And the video container expands to 100vw and 100vh
  And YouTube masthead, sidebars, and comments are concealed
  And isFullscreenActive() returns true
  And the OSD displays "Web Fullscreen ⛶"
  And the video is visually confirmed at full viewport dimensions
```

### Contract 3: Synthetic Click on Floating Button Fallback
```gherkin
Scenario: A script or extension proxy programmatically clicks the floating button
  Given the in-page floating button exists in the DOM
  When floatingBtn.click() is called programmatically (e.isTrusted === false)
  Then the click listener detects !e.isTrusted
  And immediately executes enterWebFullscreen()
  And does NOT attempt untrusted native button clicks on YouTube
  And isFullscreenActive() becomes true
  And OSD displays "Web Fullscreen ⛶"
```

### Contract 4: Prevention of Fake OSD Success
```gherkin
Scenario: Native fullscreen attempt is rejected or ignored by the browser
  Given a media element on an arbitrary page
  When enterNativeFullscreen() is called and ytFsBtn.click() is ignored by the player
  And isFullscreenActive() evaluates to false
  Then showOSD('Fullscreen', '⛶') is NOT called
  And enterNativeFullscreen() automatically delegates to enterWebFullscreen()
  And the video expands to full viewport via Web Fullscreen
```

### Contract 5: Exit Fullscreen via ESC Key or Secondary Click
```gherkin
Scenario: User exits Web Fullscreen
  Given Web Fullscreen is actively engaged (.sentinel-fullscreen-active is present)
  When the user presses the 'Escape' key OR clicks #btnCtrlFullscreen again
  Then exitFullscreen() is called
  And .sentinel-fullscreen-active and .sentinel-web-fullscreen classes are removed
  And all inline dimension resets are reverted
  And the video returns to its original container size
  And OSD displays "Exit Fullscreen ⛶"
```

### Contract 6: Total Isolation of Non-Fullscreen Controls
```gherkin
Scenario: Verification of non-fullscreen media controls
  Given any media playback session
  When any operation in this initiative is executed
  Then #btnGlobalMediaToggle, #btnCtrlPlayPause, #btnCtrlMute, #btnCtrlSpeed, and #btnCtrlPip remain identical in behavior and code
```
