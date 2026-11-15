# Design System & Component State Specification (DESIGN.md)
## Media Controls Resilience & OSD HUD Standards

> **Initiative:** Parity Overhaul: Popup Mode & Dashboard Mode Media Controls Resilience & Fix Latent Bridge Bugs  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎨 1. Visual Feedback HUD (OSD Toast Overlay)

The on-screen display (OSD) provides instant visual confirmation directly over the video player container for volume, mute, speed, and quality transitions.

### 1.1 Visual Design Tokens
```css
#__media_sentinel_osd__ {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  background: rgba(15, 23, 42, 0.88); /* Slate 900 with 88% opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 9999px; /* Pill */
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(16, 185, 129, 0.4);
  z-index: 2147483647;
  pointer-events: none;
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}
```

### 1.2 OSD State Display Mapping

| Action | Resulting State | Icon | Display Text |
| :--- | :--- | :---: | :--- |
| `toggle_mute` | Muted | 🔇 | `Muted` |
| `toggle_mute` | Unmuted | 🔊 | `Unmuted` |
| `set_volume` | Volume 0% | 🔇 | `Muted` |
| `set_volume` | 1% – 39% | 🔉 | `<N>%` |
| `set_volume` | 40% – 100% | 🔊 | `<N>%` |
| `step_speed` / `set_speed` | 0.25x – 2.0x | ⚡ | `<N>x Speed` |
| `step_quality` / `set_quality`| Discrete level | 🎞️ | `Quality: <LABEL>` |
| `toggle_fullscreen` | Active | ⛶ | `Web Fullscreen` |
| `toggle_fullscreen` | Inactive | ⛶ | `Exit Fullscreen` |

### 1.3 W3C Trusted Types Compliance Rule
Under strict page CSP (such as on `youtube.com`), innerHTML assignment throws a SecurityError.
All OSD DOM construction MUST use safe DOM node APIs:
```javascript
while (osd.firstChild) {
  osd.removeChild(osd.firstChild);
}
const iconSpan = document.createElement('span');
iconSpan.style.fontSize = '20px';
iconSpan.textContent = icon || '';

const textSpan = document.createElement('span');
textSpan.textContent = text || '';

osd.appendChild(iconSpan);
osd.appendChild(textSpan);
```

---

## ⏱️ 2. Optimistic UI State Lock & Cooldown Timers

To prevent visual flicker, button bounce-back, and race conditions between optimistic local UI updates and asynchronous telemetry polling, the following timing constants are strictly enforced:

| Constant / Guard | Duration | Purpose | Location |
| :--- | :---: | :--- | :--- |
| **Action Key Debounce** | `280ms` | Drops identical rapid repeated button clicks | `sendMediaControl` in popup & dashboard |
| **General Control Debounce** | `180ms` | Minimum threshold between distinct control actions | `sendMediaControl` in popup & dashboard |
| **OSD HUD Toast Duration** | `1100ms` | On-screen visibility time before fade-out | `inject_main_world.js` |
| **Optimistic Card Render Lock** | `800ms` | Suppresses overwriting optimistic state with stale polling | `renderMediaCard` in `popup.js` |
| **Fullscreen Double-Click Cooldown** | `350ms` | Prevents rapid toggle spamming on fullscreen buttons | `#btnCtrlFullscreen`, `#btnHeroFullscreen` |
| **PiP Double-Click Cooldown** | `350ms` | Prevents rapid toggle spamming on PiP buttons | `#btnCtrlPip`, `#btnHeroPip` |

---

## ♿ 3. Accessibility & Keyboard State Guidelines

1. **ARIA Attributes:**
   - Sliders (`#volumeBarContainer`, `#progressBarContainer` in popup; `#heroVolumeContainer`, `#heroProgressContainer` in dashboard) must maintain valid `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`.
2. **Keyboard Esc Handler:**
   - Pressing `Escape` while in CSS Web Fullscreen must cleanly exit fullscreen mode via the passive event listener in `inject_main_world.js`.
3. **Contrast & Focus Indicators:**
   - High-contrast outlines on all control buttons ensuring WCAG 2.1 AA compliance.
