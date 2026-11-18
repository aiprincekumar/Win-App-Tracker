# UI Container Split for Focus & Sleep Hubs: Executive Architecture Summary

> **Document Type:** Executive Architecture Summary & Milestone Roadmap  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Initiative ID:** `TASK-UI-SPLIT-FOCUS-SLEEP-HUBS-001`  
> **Lead Departments:** Dept 04 (UI/UX Design), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🎯 1. Initiative Scope & Core Technical Objectives

The **Web Activity & Media Sentinel** dashboard provides enterprise analytics, media controls, and digital wellbeing capabilities. Currently, both the **Focus Sentinel & Pomodoro Hero Card** (`#widgetPomodoroSentinel`) and the **Sleep Sentinel Hub** (`#cardSleepSentinelHub`) are crammed into a single 2-column bento grid within `#paneWellbeing`.

This initiative delivers a **surgical, high-performance UI Container Split** that gives each subsystem a dedicated, expansive visual canvas while retaining 100% backward compatibility with all existing test suites, DOM selectors, and storage keys.

### Core Technical Objectives:
1. **Ergonomic Decompression:** Provide dedicated, distraction-free workspaces for **Focus Work** and **Sleep Preparation**, expanding the radial countdown dials, interactive controls, and visual feedback surfaces.
2. **Sub-Hub Segmented Controller:** Introduce a modern, glassmorphic segmented sub-navigation bar (`#wellbeingSubNav`) allowing instantaneous switching between:
   - 🎯 **Focus Sentinel Hub** (`#containerFocusHub`)
   - 🌙 **Sleep Sentinel Hub** (`#containerSleepHub`)
   - 🛡️ **Productivity & Privacy Guardrails** (`#containerGuardrailsHub`)
   - 🔲 **Bento Split Overview** (`#containerWellbeingSplitView` / dual-mode view)
3. **State Persistence & Deep-Linking:** Automatically remember the user's active sub-hub in `localStorage` (`sentinel_wellbeing_active_subhub`), and enable direct deep-linking from the sidebar micro-widget (`#wellbeingLiveMicroWidget`) and Omni Command Palette.
4. **Bilingual Parity:** Fully localize all new UI elements across English and Hindi in accordance with the dashboard's i18n subsystem.
5. **Zero-Regression & W3C Trusted Types Safety:** Guarantee that all 83+ existing test suites continue passing with zero modification to core IDs, and enforce strict zero-innerHTML compliance.

---

## 🗺️ 2. Cross-Phase Milestone Roadmap & Dependency Topology

```mermaid
flowchart TD
    subgraph Phase1 ["Phase 01: DOM Architecture & Markup Split"]
        P1_A["Inspect dashboard.html #paneWellbeing"] --> P1_B["Wrap in Semantic Containers: Focus, Sleep, Guardrails"]
        P1_B --> P1_C["Inject Glassmorphic #wellbeingSubNav Segmented Bar"]
        P1_C --> P1_D["Verify Zero-DOM-ID Regression & AST Parity"]
    end

    subgraph Phase2 ["Phase 02: CSS Glassmorphism & Responsive Layouts"]
        P2_A["Define .wellbeing-sub-nav & .sub-nav-pill"] --> P2_B["Style Full-Width Bento Hero Layouts (bento-span-12)"]
        P2_B --> P2_C["Implement 60fps Fade & Slide Container Transitions"]
        P2_C --> P2_D["Add Mobile & Tablet Responsive Breakpoints"]
    end

    subgraph Phase3 ["Phase 03: Controller State Machine & Omni-Palette"]
        P3_A["Implement switchWellbeingSubHub(key) Controller"] --> P3_B["Add localStorage Persistence & State Restoration"]
        P3_B --> P3_C["Wire Sidebar Micro-Widget HUD Deep-Linking"]
        P3_C --> P3_D["Register Omni-Palette Command Actions & Bilingual i18n"]
    end

    subgraph Phase4 ["Phase 04: Independent QA Verification & Regression Gate"]
        P4_A["Author test_ui_container_split_focus_sleep_hubs.js"] --> P4_B["Execute 8-Battery DOM, CSS, JS, and i18n Suite"]
        P4_B --> P4_C["Run Master Regression: node run_all_tests.js (83+ Suites)"]
        P4_C --> P4_D["Gitleaks Secret Scan & Grade A+ Certification"]
    end

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
```

---

## ⚖️ 3. Risk Mitigation & Architectural Tradeoff Analysis

| Risk / Tradeoff | Impact | Likelihood | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Breaking Existing Automated Tests** | High | Low | **Preservation Invariant:** Every existing ID (`#widgetPomodoroSentinel`, `#cardSleepSentinelHub`, `#paneWellbeing`, etc.) remains strictly in place. Containers are created as wrapper elements without renaming or removing existing nodes. |
| **UI Layout Shift (CLS) on Tab Switching** | Medium | Low | Container visibility is managed via hardware-accelerated CSS classes (`.active`, `.hidden`, `opacity`, `transform`) with pre-calculated minimum heights to prevent content jumping. |
| **User Preference Loss Across Sessions** | Low | Low | The active sub-hub selection is immediately saved to `localStorage.getItem('sentinel_wellbeing_active_subhub')` and restored whenever `#paneWellbeing` is rendered. |
| **Code Length Inflation in `dashboard.js`** | Medium | Low | Universal Rule 28 strictly enforced: all new controller functions must be <= 50 lines with nesting depth <= 3. |
| **XSS / HTML Injection Vulnerability** | High | Zero | 100% W3C Trusted Types safe: strictly use `textContent`, `setAttribute`, and DOM creation methods. Zero `innerHTML` assignments. |

---

## 🚀 4. Implementation Strategy Recommendation

- **Selected Strategy:** **Strategy A: Fully Autonomous Phase-wise Execution**
- **Calculated Autonomy Score:** **1.0**
- **Rationale:** The scope is rigorously defined, the target files (`dashboard.html`, `dashboard.css`, `dashboard.js`) are fully mapped, existing test contracts provide deterministic validation, and the architecture strictly guarantees zero regression for the rest of the application.
