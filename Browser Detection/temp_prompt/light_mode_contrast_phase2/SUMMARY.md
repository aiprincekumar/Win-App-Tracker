# Light Mode Contrast & Visibility Overhaul Phase 2: Executive Architecture Summary

> **Document Type:** Executive Architecture Summary  
> **Workspace Container:** `temp_prompt/light_mode_contrast_phase2/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🏛️ 1. Executive Summary & Initiative Scope

Following the successful completion of Phase 1 (`TASK-LIGHT-MODE-CONTRAST-001`), an extensive accessibility audit identified 6 remaining dashboard UI components where light mode contrast is suboptimal or where dark mode defaults bleed into light theme viewports.

This Phase 2 initiative resolves these contrast and visibility defects across:
1. **EXTEND TIME buttons (+5m, +15m)** in Focus and Sleep Sentinel.
2. **Completion Chime row & Focus toggle cards** in Focus Advanced Suite.
3. **Pomodoro Reset button** and secondary action controls.
4. **Focus Mode Selector Bar & Streak/Session Progress Bar**.
5. **Sleep Sentinel Hub Card** (dial track, countdown typography, idle badge).
6. **Media Controls / Action Bar** (`#btnMuteAllOthers`, `#btnMuteAll`, hero stepper, active stream badge).

---

## 📐 2. Architectural Design & Modularity Discipline (Universal Rule 28)

### 2.1 File Budget & Companion Stylesheet Strategy
- **`wellbeing_blacklist.css` (1,640 lines):** Strictly **FROZEN & PRESERVED**. It already exceeds the 700-line hard split threshold. No modifications or append actions are permitted.
- **`focus_sleep_advanced.css` (654 lines):** Approaching the 700-line warning threshold. Adding substantial new CSS rules directly risks breaching the 700-line limit.
- **`wellbeing_light.css` (77 lines):** Created during Phase 1 as a modular companion stylesheet. It is currently only 77 lines and is already linked in `dashboard/dashboard.html` (line 31). This stylesheet is the primary designated home for all Focus, Sleep, and Blacklist light mode companion rules.
- **`dashboard/styles/media.css` and `dashboard/styles/media/hero_player.css`:** Used for scoped media control rules where appropriate, or centralized in `wellbeing_light.css` / `themes.css`.

### 2.2 Scoping Invariants
All new CSS rules must be scoped strictly under `body.theme-light` and `[data-theme="light"]`:
```css
body.theme-light .target-selector,
[data-theme="light"] .target-selector {
  /* light mode overrides */
}
```
Under no circumstances may any rule lacking the light theme selector prefix be introduced, ensuring a **Dark Mode Zero-Mutation Invariant**.

---

## 🧭 3. Implementation Strategy & Autonomy Profile

### Strategy Recommendation: Strategy A (Fully Autonomous Phase-wise Execution)
- **Autonomy Score:** 1.0 (Zero pause, continuous autonomous execution).
- **Justification:**
  - Standardized color palettes and tokens are mathematically defined by WCAG 2.1 AA/AAA standards (contrast ratio >= 7:1 for text, >= 3:1 for graphical controls).
  - No database migrations, background service workers, or behavioral JS logic are affected; this is a purely visual presentation and accessibility overhaul.
  - Phase 1 successfully proven this pattern with 108/108 passing tests.
- **Phase Roadmap:**
  - **Phase 1:** Focus Hub Contrast & Controls (`wellbeing_light.css`)
  - **Phase 2:** Sleep Hub & Media Action Bar Contrast (`wellbeing_light.css`, `media.css`)
  - **Phase 3:** Dedicated QA Test Suite (`test_light_mode_contrast_phase2.js` & `run_all_tests.js`)

---

## 🛡️ 4. Risk Mitigation & Quality Gates

| Risk Category | Potential Failure | Mitigation Strategy |
| :--- | :--- | :--- |
| **Dark Mode Regression** | Inadvertent mutation of dark theme styles | Strict selector scoping (`body.theme-light`, `[data-theme="light"]`) and automated test assertions verifying dark theme tokens remain unchanged. |
| **Rule 28 Bloat** | Exceeding 700 lines on `focus_sleep_advanced.css` | Route all new rules into modular companion stylesheet `dashboard/styles/wellbeing_light.css` (< 200 lines). |
| **Accessibility Failure** | Low contrast text (< 4.5:1 or < 7:1) | Mathematical luminance contrast verification in Phase 3 test suite. |
| **BOM / Encoding Corruption** | Loss of UTF-8 BOM on saved files | Verify UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all edited files. |
