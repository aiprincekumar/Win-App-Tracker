<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Executive Architecture Summary
# Task: Visualizer Toolbar Flex Alignment & Dual-Mode Full Window / Full Screen Controls
# Task ID: TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001

> **Governance Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Lead Department:** Dept 01 Product Requirements & Architecture Management
> - **Target Architecture:** 4-Level Command Hierarchy per [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)

---

## 🏛️ 1. Technical Objective & Scope
The objective of this initiative is to elevate the UX and visual hierarchy of the Audio Spectrum Visualizer toolbar in the Web Activity & Media Sentinel dashboard:
1. **Toolbar Alignment:** Transition `.visualizer-controls-bar` from an `inline-flex` clustered pill into a responsive, full-width flex container (`justify-content: space-between`). The effect selection dropdown anchors to the left, while the action icon buttons group neatly on the right within `.viz-actions-group`.
2. **Dual-Mode Window Controls:** Disambiguate between Viewport Theater Maximize and Native OS Fullscreen:
   - **Full Window Mode (`#btnVizFullWindow`):** Expands the visualizer card to occupy 100vw × 100vh of the browser window (`.visualizer-theater-mode`), preserving window title bars, tabs, and developer tools.
   - **Full Screen Mode (`#btnVizFullscreen`):** Invokes the browser's native `Element.requestFullscreen()` API on the visualizer container, delivering an immersive, borderless presentation across the physical monitor display.
3. **Event-Driven Parity & Accessibility:** Ensure bidirectional state reflection (listening for `fullscreenchange` and `Escape`), preserving ARIA states (`aria-expanded`, `aria-label`), keyboard navigation (`tabindex="0"`), and WCAG 2.1 AA contrast in dark and light modes.
4. **Zero-Regression Assurance:** Preserve 100% backward compatibility for all existing tests and classes, authoring regression assertions in `test_visualizer_compact_fullscreen_embed.js`.

---

## 🧭 2. Architectural Roadmap & Phasing Strategy
The implementation is decomposed into 3 sequential, deterministic phases:
- **Phase 1: Toolbar DOM & Flex `justify-between` CSS Alignment**
  Refactor `dashboard/dashboard.html` and stylesheets (`dashboard/styles/media.css`, `dashboard/dashboard.css`) to introduce `.viz-actions-group`, `#btnVizFullWindow`, and full-width flex layout.
- **Phase 2: Dual-Mode Full Window (Theater) & True W3C Fullscreen JS Wiring**
  Update `src/dashboard/features/media_deck_visualizer_feature.js` and `dashboard/dashboard.js` to decouple theater mode from native `requestFullscreen()`, wiring event listeners and dynamic canvas resizing.
- **Phase 3: Automated Regression Test Battery & Full Suite Verification**
  Update `tests/test_visualizer_compact_fullscreen_embed.js` with comprehensive assertions for both modes, validating all 57+ repository test suites with exit code 0.

---

## ⚖️ 3. Execution Strategy Recommendation
- **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Fully Autonomous Phase-wise Execution)
- **Target Autonomy Score:** 1.0
- **Rationale:** The scope is tightly bounded to the visualizer UI layer and DOM event handling. The requirements, DOM anchors, CSS classes, and test gates are 100% unambiguous. Execution can proceed autonomously through all 3 phases under Level 4 Sub Agents without pausing for intermediate user decisions.
