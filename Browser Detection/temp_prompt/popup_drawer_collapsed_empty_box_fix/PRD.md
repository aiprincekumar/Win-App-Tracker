# Product Requirements Document (PRD): Popup Collapsible Drawer Collapsed Zero-Docking

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/popup_drawer_collapsed_empty_box_fix/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 01 Product Requirements & Specification Engineering  

---

## 👤 1. User Personas & Problem Statement

### Persona: Extension User
- Operates Chrome extension popup daily to view sleep automation timer and focus work intervals.
- Expects a clean, dense, cyber-dark interface where collapsed controls do not consume dead vertical space.

### Problem Statement:
- Upon opening the Sleep or Focus tabs, the user noticed that even though the settings drawer is collapsed, a large empty dark box stretches across the bottom of the popup viewport.
- The user asks: *"यह जो है, कोलैप्स मोड में भी ऐसा क्यों शो हो रहा है?"*
- The empty box creates visual confusion, making the user wonder if content failed to load or if the layout is broken.

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Collapsed Tight Hug):** When `#sleepSettingsDrawer` or `#focusSettingsDrawer` does not have the `.open` class, its outer container height must equal only the height of the toggle button and its borders (~34px).
- **FR-02 (Open Expansion):** When the user clicks the toggle button, adding `.open`, the drawer container must expand and flex to accommodate the inner content up to 200px.
- **FR-03 (Theme Parity):** Both dark and light themes must display identical zero-docking behavior with no visual artifacting or border seams.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Layout Shift):** Transitions between collapsed and open states must animate smoothly at 60fps using CSS grid-template-rows transitions.
- **NFR-02 (Accessibility):** `aria-expanded` and keyboard navigation must remain fully operational.
- **NFR-03 (Performance & Zero Flashing):** Zero reflow jitter or scrollbar popping during tab switches.

---

## 🧪 4. Given-When-Then Acceptance Criteria

### Scenario 1: Sleep Drawer in Collapsed State
- **Given** the Sleep tab (`#viewSleepPane`) is active and `#sleepSettingsDrawer` does NOT have `.open`.
- **When** the popup is rendered.
- **Then** `#sleepSettingsDrawer` must have `flex: 0 0 auto;`, and its container height must not exceed ~36px (button + border). No empty space is visible below the button.

### Scenario 2: Sleep Drawer in Open State
- **Given** `#sleepSettingsDrawer` is clicked by the user.
- **When** the `.open` class is appended to the container.
- **Then** the container receives `flex: 1 1 auto; min-height: 0;`, and `.drawer-inner-content` expands up to `max-height: 200px` with custom 2px hairline scrollbars.

### Scenario 3: Focus Drawer in Collapsed & Open States
- **Given** the Focus tab (`#viewFocusPane`) is active.
- **When** `#focusSettingsDrawer` toggles between collapsed and open states.
- **Then** it exhibits identical zero-docking behavior and smooth expansion.
