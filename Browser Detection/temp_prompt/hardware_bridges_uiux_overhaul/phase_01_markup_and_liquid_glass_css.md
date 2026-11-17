# Phase 1 Execution Prompt: Semantic HTML Markup & High-Fidelity Liquid Glass 2.0 CSS Styling

> **Phase:** 1 of 3  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Departments:** Dept 04 UI/UX Design System, Dept 05 Frontend Engineering  
> **Authorization State:** REQUIRES_AUTH_MGR_TOKEN  

---

## 🎯 Phase Objective
Overhaul the HTML markup of `#cardHardwareBridges` in `dashboard/dashboard.html` and engineer studio-grade Liquid Glass 2.0 CSS styles in `dashboard/dashboard.css` and `dashboard/styles/settings.css`. Provide dedicated inline real-time status pills (`.bridge-status-pill`), LED animated dots (`.bridge-status-dot`), port capsules (`.bridge-port-badge`), and tactile action buttons (`.btn-bridge-action`), ensuring seamless responsiveness and WCAG 2.1 AAA contrast across all theme substrates.

---

## 📂 File Anchors & Prerequisites
- **Target Files:**
  - `dashboard/dashboard.html` (Around `#cardHardwareBridges`)
  - `dashboard/dashboard.css` (Section: `LOCAL SERVICES & HARDWARE BRIDGES CARD`)
  - `dashboard/styles/settings.css`
- **Dependencies:**
  - Preserves exact canonical button IDs: `#btnSidebarReconnectHub` and `#btnSidebarReconnect`.
  - Conforms to W3C Trusted Types: zero inline event handlers (`onclick`, etc.).

---

## 🛠️ Step-by-Step Instructions

### Step 1: Overhaul `#cardHardwareBridges` in `dashboard/dashboard.html`
Replace the existing body of `#cardHardwareBridges` with the upgraded markup:
1. Wrap each service inside `.bridge-service-row` (`#rowBridgeHub` and `#rowBridgeHud`).
2. Add `#bridgeHubStatusBadge` inside the name wrap of SQLite Data Hub:
   ```html
   <div id="bridgeHubStatusBadge" class="bridge-status-pill offline" role="status" aria-live="polite">
     <span id="bridgeHubStatusDot" class="bridge-status-dot" aria-hidden="true"></span>
     <span id="bridgeHubStatusText" class="bridge-status-text">Offline</span>
   </div>
   ```
3. Add `#bridgeHudStatusBadge` inside the name wrap of Video Detector HUD Bridge:
   ```html
   <div id="bridgeHudStatusBadge" class="bridge-status-pill offline" role="status" aria-live="polite">
     <span id="bridgeHudStatusDot" class="bridge-status-dot" aria-hidden="true"></span>
     <span id="bridgeHudStatusText" class="bridge-status-text">Offline</span>
   </div>
   ```
4. Verify `#btnSidebarReconnectHub` and `#btnSidebarReconnect` are preserved with proper `type="button"`, `title`, and `aria-label` attributes.

### Step 2: Implement Liquid Glass 2.0 Styles in `dashboard/dashboard.css`
1. Enhance `.bridge-service-row` with flex alignment, gap, subtle borders, and smooth transitions.
2. Implement `.bridge-status-pill` with states `.online`, `.starting`, and `.offline`.
3. Implement `.bridge-status-dot` with `@keyframes bridgeDotPulse` (2s infinite ease-in-out) and `@keyframes bridgeDotBlink` (0.8s infinite).
4. Enhance `.btn-bridge-action` with tactile hover elevation (`transform: translateY(-1.5px)`), glassmorphic gradients, active press (`scale(0.98)`), and `:focus-visible` outline rings.
5. Mirror or import essential rules into `dashboard/styles/settings.css` for modular stylesheet consistency.

### Step 3: Validate AST & Encoding Standards
1. Ensure both modified files start with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).
2. Verify zero inline event handlers in `dashboard/dashboard.html`.

---

## 🧪 Local Verification Gate
- [ ] `node -c dashboard/dashboard.js` passes with 0 syntax errors.
- [ ] In-memory DOM check confirms existence of `#cardHardwareBridges`, `#bridgeHubStatusBadge`, `#bridgeHudStatusBadge`, `#btnSidebarReconnectHub`, `#btnSidebarReconnect`.
- [ ] CSS audit confirms existence of `.bridge-status-pill`, `.bridge-status-dot`, and `.btn-bridge-action`.
- [ ] UTF-8 BOM byte sequence verified on all edited files.
