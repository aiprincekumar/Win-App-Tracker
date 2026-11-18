# Phase 02: CSS Glassmorphism & Responsive Layouts

> **Document Type:** Standalone Phase Execution Directive  
> **Workspace Container:** `temp_prompt/ui_container_split_focus_sleep_hubs/`  
> **Phase #:** 02 of 04  
> **Target Subsystem:** `dashboard/dashboard.css`  
> **Assigned Subagent Role:** Level 4 UI/UX Engineer  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 04 (UI/UX Design System)  

---

## 🎯 1. Phase Objective
Author cohesive Cyber-Dark liquid glassmorphic styling rules in `dashboard/dashboard.css` for the newly introduced `#wellbeingSubNav` segmented pill bar and the `.wellbeing-sub-container` sub-hubs, delivering:
1. Sleek, tactile segmented controller navigation with subtle hover lifts, active glowing pill indicators, and high-contrast typography.
2. Full-width (`bento-span-12`) ergonomic layout for `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` with centered or side-by-side dial + controls organization.
3. Hardware-accelerated transitions (`opacity`, `transform`) between sub-hub container switches.
4. Robust responsive layouts across desktop, tablet, and mobile screen sizes.

---

## 📋 2. Prerequisites & Inputs
1. Successful completion and verification of Phase 01 (`dashboard/dashboard.html` container split).
2. Existing design tokens and styles in `dashboard/dashboard.css`.

---

## ⚓ 3. Technical Context & File Anchors
- **Target File:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)
- **Anchor Region:** Wellbeing / Pomodoro & Sleep Hub section (search for `.pomodoro-hero-card` or `.dash-sleep-hero-body`).

---

## 🔨 4. Step-by-Step Surgical Instructions

### Step 2.1: Segmented Sub-Nav Container Styling
```css
/* =============================================================================
   Wellbeing Sub-Hub Segmented Navigation Bar
   ============================================================================= */
.wellbeing-header-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.wellbeing-sub-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 5px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sub-nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  white-space: nowrap;
}

.sub-nav-pill:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.sub-nav-pill.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.sub-nav-pill[data-subhub="focus"].active {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.25);
}

.sub-nav-pill[data-subhub="sleep"].active {
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 2px 12px rgba(56, 189, 248, 0.25);
}

.sub-nav-pill[data-subhub="guardrails"].active {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.25);
}

.sub-nav-pill:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
```

### Step 2.2: Sub-Container State Transitions
```css
/* Sub-Hub Containers */
.wellbeing-sub-container {
  width: 100%;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.wellbeing-sub-container.active {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.wellbeing-sub-container.hidden {
  display: none !important;
  opacity: 0;
  transform: translateY(6px);
}
```

### Step 2.3: Expanded Full-Width Hero Ergonomics
In full-width mode (`bento-span-12`), style `#widgetPomodoroSentinel` and `#cardSleepSentinelHub` so that on desktop screens (>= 1024px), the dial, controls, and presets breathe comfortably:
```css
#containerFocusHub .pomodoro-hero-card,
#containerSleepHub .sleep-hero-card {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  #containerFocusHub .dash-focus-hero-body {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    align-items: start;
  }
}
```

### Step 2.4: UTF-8 with BOM Verification
Save `dashboard/dashboard.css` strictly with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Out-of-Scope Boundaries
- Do NOT modify JS controller logic in this phase.
- Do NOT remove existing media visualizer or time tracking CSS rules.

---

## 📦 6. Deliverables Manifest
- Updated [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css) with sub-nav pill and sub-container styles.

---

## 🧪 7. Local Verification Gate
Execute the following verification command:
```powershell
node -e "
const fs = require('fs');
const css = fs.readFileSync('dashboard/dashboard.css', 'utf8');
const selectors = ['.wellbeing-sub-nav', '.sub-nav-pill', '.wellbeing-sub-container', 'sub-nav-pill:hover', 'sub-nav-pill.active'];
selectors.forEach(s => {
  if (!css.includes(s)) {
    console.error('MISSING CSS SELECTOR:', s);
    process.exit(1);
  }
});
console.log('✅ Phase 2 CSS Verification: 100% Passed!');
"
```
