# 6-Tab Single-Word Architecture UI/UX Refinement — DESIGN SYSTEM & TOKENS

> **Document Type:** Design System & UI Specification  
> **Task ID:** `TASK-POPUP-6TAB-UIUX-001`  
> **Target Path:** `temp_prompt/six_tab_popup_architecture/DESIGN.md`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Status:** APPROVED / READY FOR EXECUTION  

---

## 🎨 1. Aesthetic Direction & Design Philosophy

The 6-Tab Single-Word Architecture transforms the extension popup into a premium, dark-mode, cyberpunk-infused glassmorphism control hub. By adopting single-word labels (`Media`, `Audio`, `Tools`, `Studio`, `Tracking`, `Domains`), the interface eliminates visual clutter, creates perfect horizontal symmetry across the 420px viewport, and gives every major capability an unmistakable visual identity.

### Visual Principles:
- **Zero Ellipsis / Zero Text Clipping:** Single-word labels comfortably fit inside each 65px grid column with zero text wrapping or ellipsis.
- **Color-Coded Semantic Gradients:** Each tab possesses a unique luminous gradient theme that signals its functional domain.
- **Glassmorphism & Depth:** Soft borders (`rgba(255, 255, 255, 0.08)`), subtle background blurs (`backdrop-filter: blur(12px)`), and inset shadows for pressed/selected states.
- **High-Density Micro-Typography:** Clean tabular figures and dense layout that displays maximum useful data without feeling overcrowded.

---

## 📐 2. Geometry & Spacing Grid (420px Fixed Geometry)

| Element / Region | Dimensions & Constraints | Layout Behavior |
| :--- | :--- | :--- |
| **Popup Viewport** | `width: 420px; max-width: 420px; min-width: 420px;` | Strict fixed width; zero horizontal scrollbars. |
| **Top Navigation Bar (`.top-nav-tabs`)** | `padding: 3px; gap: 3px; border-radius: 10px;` | 6-column equal grid (`grid-template-columns: repeat(6, 1fr)`). |
| **Tab Buttons (`.top-tab-btn`)** | `padding: 6px 1px; min-width: 0;` | Symmetrical 65px target box, centered flex content. |
| **Tab Icons (`.top-tab-icon`)** | `font-size: 12px; line-height: 1;` | Crisp emoji representation. |
| **Tab Labels (`.top-tab-label`)** | `font-size: 10.5px; font-weight: 600; letter-spacing: -0.2px;` | Single-word uppercase/titlecase text. |
| **Panes Container (`.tab-pane`)** | `padding: 10px 12px;` | Dynamic tab panel with smooth fade-in transition. |
| **Footer Toolbar (`.footer-actions`)** | `height: 44px; flex-wrap: nowrap; gap: 4px;` | Strict single-row 7-button invariant. |

---

## 🌈 3. Semantic Color Palette & Active Tab Tokens

### Tab 1: 🎬 Media
- **Identity:** Live Playback, Streams, Scrubber, Fullscreen
- **Active Gradient:** `linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(6, 182, 212, 0.18) 100%)`
- **Border Accent:** `rgba(59, 130, 246, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(59, 130, 246, 0.25)`

### Tab 2: 🎛️ Audio
- **Identity:** Master 0-200% Boost, 5-Band EQ, Vocal Clarity
- **Active Gradient:** `linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(217, 70, 239, 0.18) 100%)`
- **Border Accent:** `rgba(139, 92, 246, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(139, 92, 246, 0.25)`

### Tab 3: ⚡ Tools
- **Identity:** Background Automations, Cinema Dimmer, Quick Actions
- **Active Gradient:** `linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(251, 191, 36, 0.18) 100%)`
- **Border Accent:** `rgba(245, 158, 11, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(245, 158, 11, 0.25)`

### Tab 4: 📚 Studio
- **Identity:** Timestamp Notes, Bookmarks, Screenshots, Resume
- **Active Gradient:** `linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(16, 185, 129, 0.18) 100%)`
- **Border Accent:** `rgba(6, 182, 212, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(6, 182, 212, 0.25)`

### Tab 5: ⏱️ Tracking
- **Identity:** Donut Chart, Stats Pills, Wellness, Focus Ratio
- **Active Gradient:** `linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(236, 72, 153, 0.18) 100%)`
- **Border Accent:** `rgba(244, 63, 94, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(244, 63, 94, 0.25)`

### Tab 6: 🌐 Domains
- **Identity:** Browsing History, Filter Dropdowns, Real-Time Search
- **Active Gradient:** `linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%)`
- **Border Accent:** `rgba(16, 185, 129, 0.5)`
- **Glow Shadow:** `0 2px 10px rgba(16, 185, 129, 0.25)`

---

## ♿ 4. Accessibility & Interaction States (WCAG 2.1 AA)

- **Contrast Ratios:** White `#ffffff` text on selected gradient backgrounds exceeds 4.5:1 contrast ratio against the dark container (`#12131a`).
- **Focus Indicators:** `:focus-visible` defines an unmistakable `2px solid rgba(59, 130, 246, 0.8)` ring with `2px` offset.
- **ARIA Semantics:**
  - `<nav class="top-nav-tabs" role="tablist">`
  - Each button uses `role="tab"`, `aria-selected="true|false"`, and `aria-controls="view<Name>Pane"`.
  - Each pane uses `role="tabpanel"` and `aria-labelledby="mainTab<Name>"`.
- **Keyboard Navigation:** Tab key cycles sequentially across tab buttons; Enter/Space activates the tab.
