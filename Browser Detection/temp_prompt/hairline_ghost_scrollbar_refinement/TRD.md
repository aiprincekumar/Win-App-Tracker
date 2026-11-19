# Hairline Ghost-Style Scrollbar Refinement: Technical Requirements Document (TRD)

> **Document Type:** Technical Requirements Document  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Lead Department:** Dept 02 (Solution Architecture) & Dept 05 (Frontend Engineering)  

---

## 🛠️ 1. CSS Technical Architecture

### 1.1 WebKit vs W3C Standard Scrollbar Mechanics
Chrome/Chromium extensions render with Chromium's Blink layout engine. Blink supports both WebKit scrollbar pseudo-elements and standard W3C CSS Scrollbars Module Level 1 properties.

```css
/* Standard W3C Scrollbar (Firefox & Standard compliant engines) */
scrollbar-width: thin;
scrollbar-color: <thumb_color> transparent;

/* WebKit Pseudo-Elements (Chromium/Blink precision pixel sizing) */
::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: <thumb_color>;
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: <hover_color>;
}
```

---

## 🎨 2. Token & Property Matrix

| File Target | Selector | Property | Previous Value | Target Hairline Ghost Value |
| :--- | :--- | :--- | :--- | :--- |
| `popup/popup.css` | `body, .tab-pane, .drawer-inner-content, .drawer-expandable-wrap` | `scrollbar-color` | `rgba(255, 255, 255, 0.18) transparent` | `rgba(255, 255, 255, 0.12) transparent` |
| `popup/popup.css` | `body::-webkit-scrollbar, .tab-pane::-webkit-scrollbar, ...` | `width`, `height` | `4px`, `4px` | `2px`, `2px` |
| `popup/popup.css` | `...::-webkit-scrollbar-thumb` | `background` | `rgba(255, 255, 255, 0.18)` | `rgba(255, 255, 255, 0.12)` |
| `popup/popup.css` | `...::-webkit-scrollbar-thumb:hover` | `background` | `rgba(255, 255, 255, 0.3)` | `rgba(255, 255, 255, 0.28)` |
| `popup/popup.css` | `.domains-list::-webkit-scrollbar` | `width` | `4px` | `2px` |
| `popup/popup.css` | `.domains-list::-webkit-scrollbar-thumb` | `background` | `#334155` | `rgba(255, 255, 255, 0.12)` (or `#334155`) |
| `popup/popup.css` | `.studio-items-list::-webkit-scrollbar` | `width` | `4px` | `2px` |
| `popup/popup.css` | `[data-theme="light"] ...::-webkit-scrollbar` | `width`, `height` | `4px`, `4px` | `2px`, `2px` |
| `popup/popup.css` | `[data-theme="light"] ...` | `scrollbar-color` | `rgba(0, 0, 0, 0.2) transparent` | `rgba(0, 0, 0, 0.12) transparent` |
| `popup/popup.css` | `[data-theme="light"] ...-thumb` | `background` | `rgba(0, 0, 0, 0.2)` | `rgba(0, 0, 0, 0.12)` |
| `popup/popup.css` | `[data-theme="light"] ...-thumb:hover` | `background` | `rgba(0, 0, 0, 0.35)` | `rgba(0, 0, 0, 0.25)` |
| `popup/styles/tabs/tab_sleep.css` | `#viewSleepPane, #sleepSettingsDrawer .drawer-inner-content` | `scrollbar-color` | `rgba(129, 140, 248, 0.45) transparent` | `rgba(129, 140, 248, 0.28) transparent` |
| `popup/styles/tabs/tab_sleep.css` | `...::-webkit-scrollbar` | `width`, `height` | `4px`, `4px` | `2px`, `2px` |
| `popup/styles/tabs/tab_sleep.css` | `...::-webkit-scrollbar-thumb` | `background` | `rgba(129, 140, 248, 0.45)` | `rgba(129, 140, 248, 0.28)` |
| `popup/styles/tabs/tab_sleep.css` | `...::-webkit-scrollbar-thumb:hover` | `background` | `rgba(129, 140, 248, 0.75)` | `rgba(129, 140, 248, 0.65)` |
| `popup/styles/tabs/tab_sleep.css` | `[data-theme="light"] ...` | `scrollbar-color` | `rgba(99, 102, 241, 0.4) transparent` | `rgba(99, 102, 241, 0.25) transparent` |
| `popup/styles/tabs/tab_sleep.css` | `[data-theme="light"] ...-thumb` | `background` | `rgba(99, 102, 241, 0.4)` | `rgba(99, 102, 241, 0.25)` |
| `popup/styles/tabs/tab_sleep.css` | `[data-theme="light"] ...-thumb:hover` | `background` | `rgba(99, 102, 241, 0.7)` | `rgba(99, 102, 241, 0.55)` |
| `popup/styles/tabs/tab_wellness.css` | `#viewFocusPane, #focusSettingsDrawer .drawer-inner-content` | `scrollbar-color` | `rgba(6, 182, 212, 0.45) transparent` | `rgba(6, 182, 212, 0.28) transparent` |
| `popup/styles/tabs/tab_wellness.css` | `...::-webkit-scrollbar` | `width`, `height` | `4px`, `4px` | `2px`, `2px` |
| `popup/styles/tabs/tab_wellness.css` | `...::-webkit-scrollbar-thumb` | `background` | `rgba(6, 182, 212, 0.45)` | `rgba(6, 182, 212, 0.28)` |
| `popup/styles/tabs/tab_wellness.css` | `...::-webkit-scrollbar-thumb:hover` | `background` | `rgba(6, 182, 212, 0.75)` | `rgba(6, 182, 212, 0.65)` |
| `popup/styles/tabs/tab_wellness.css` | `[data-theme="light"] ...` | `scrollbar-color` | `rgba(15, 118, 110, 0.35) transparent` | `rgba(15, 118, 110, 0.22) transparent` |
| `popup/styles/tabs/tab_wellness.css` | `[data-theme="light"] ...-thumb` | `background` | `rgba(15, 118, 110, 0.35)` | `rgba(15, 118, 110, 0.22)` |
| `popup/styles/tabs/tab_wellness.css` | `[data-theme="light"] ...-thumb:hover` | `background` | `rgba(15, 118, 110, 0.6)` | `rgba(15, 118, 110, 0.45)` |

---

## 🔍 3. Test Assertion Mapping

In `tests/test_popup_drawer_docking_and_scrollbar_fix.js`:
- Line 135: Update expected `scrollbar-color` to check `rgba(255, 255, 255, 0.12) transparent;`.
- Line 141: Update `width: 4px;` and `height: 4px;` assertion to `width: 2px;` and `height: 2px;`.
- Line 149: Update thumb background assertion to check `rgba(255, 255, 255, 0.12);`.
- Line 164: Update sleep CSS thumb color assertion to check `rgba(129, 140, 248, 0.28)`.
- Line 175: Update wellness CSS thumb color assertion to check `rgba(6, 182, 212, 0.28)`.
- Line 181: Update light theme popup scrollbar-color assertion to check `rgba(0, 0, 0, 0.12) transparent;`.
- Line 185: Update light theme sleep assertion to check `rgba(99, 102, 241, 0.25)`.
- Line 189: Update light theme wellness assertion to check `rgba(15, 118, 110, 0.22)`.
