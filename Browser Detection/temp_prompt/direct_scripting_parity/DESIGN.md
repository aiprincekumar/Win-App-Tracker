# Parity Overhaul: Direct 0ms Main World Scripting Restoration & Popup-Dashboard Media Actuation Parity
## UI/UX Design System & Actuation Interaction Tokens (DESIGN.md)

> **Document Type:** Design System & Interaction Tokens Specification  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Ephemeral Container:** `temp_prompt/direct_scripting_parity/`  

---

## 🎨 1. Design System Consistency & Zero-Layout Mutation Policy

The architectural changes in this task are focused on restoring 0ms media actuation responsiveness via direct DOM scripting. The existing Glassmorphic Design System, visual tokens, layout grids, and color palettes must be preserved with 100% fidelity.

### 1.1 Core Visual Tokens (Preserved)
- **Primary Brand Color:** `#10b981` (Emerald Accent)
- **Secondary Accent:** `#06b6d4` (Cyan Focus)
- **Active State Highlights:** `#3b82f6` (Blue Active Indicator)
- **Glassmorphic Surface Backgrounds:** `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)`
- **Border Treatments:** `1px solid rgba(255, 255, 255, 0.08)`
- **Typography:** Inter / system-ui, `-apple-system`, BlinkMacSystemFont, `sans-serif`

---

## ⚡ 2. Interaction Latency & Feedback Profiles

### 2.1 The 0ms Perception Threshold
Research in human-computer interaction (HCI) shows that latency below 100ms feels instantaneous, while latency below 16ms matches 60fps display refresh boundaries. 

| Layer | Prior Behavior (IPC Hop) | Restored Behavior (Dual Actuation) | Perceived Latency |
| :--- | :--- | :--- | :--- |
| **In-Page Media DOM** | 25ms – 80ms (IPC round-trip) | **< 1ms (Direct Scripting)** | **Instantaneous (0ms)** |
| **Popup UI Button State** | Optimistic (< 1ms) | Optimistic (< 1ms) | Instantaneous |
| **Telemetry Sync** | Background IPC | Background IPC | Transparent / Asynchronous |
| **Flicker / Bounceback** | Prevented by 800ms cooldown | Prevented by 800ms cooldown | Rock-solid stability |

### 2.2 Active Interaction Feedback Specs
1. **Play/Pause Button (`#btnCtrlTogglePlay` / `#dynamicStatusBtn`):**
   - Click triggers immediate CSS scale pulse `transform: scale(0.96)` for 120ms.
   - Text/Icon shifts immediately between `▶️ Play` / `⏸️ Pause` / `🟢 Playing` / `⏸️ Paused`.
2. **Speed Steppers (`#btnCtrlSpeedDown` / `#btnCtrlSpeedUp`):**
   - Badge text (`#ctrlSpeedDisplay`) updates synchronously with the ladder value (`0.75x`, `1.0x`, `1.25x`, etc.).
3. **Seek Rewind/Forward (`#btnCtrlRewind` / `#btnCtrlForward`):**
   - Progress bar fill and numerical timestamp update optimistically with immediate ±10s offset.
4. **Volume Bar (`#volumeBarContainer`):**
   - Scrubbing updates fill width, percentage text, and mute icon synchronously.

---

## ♿ 3. Accessibility & W3C Compliance

1. **ARIA Roles & Value Text:**
   - Sliders must maintain `role="slider"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.
   - Toggle buttons must maintain clear `aria-label` and `aria-pressed` / `aria-expanded` attributes.
2. **Keyboard Navigation:**
   - Full keyboard focusability with visible focus rings (`outline: 2px solid #06b6d4`).
   - Space and Enter keys execute button actions cleanly.
3. **W3C Trusted Types:**
   - No `innerHTML` or `outerHTML` assignments anywhere in injected scripts.
   - All dynamic text updates must use `textContent`.
