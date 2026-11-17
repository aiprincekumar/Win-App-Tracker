# Design System & UI Specification: Liquid Glass 2.0 Studio Aesthetics

> **Workspace:** `temp_prompt/ui_ux_audio_sidebar_polish/`  
> **Project:** Web Activity & Media Sentinel (Chrome MV3 Browser Extension)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Lead Department:** Dept 04 Design System & Dept 05 Frontend Engineering  
> **Design Theme:** Liquid Glass 2.0 Cybernetic Glassmorphic UI  

---

## 🎨 1. Core Visual Tokens & Theme Substrates

The Web Activity & Media Sentinel dashboard utilizes the **Liquid Glass 2.0** design language, blending deep substrate colors with high-precision specular border highlights, multi-layer backdrop blurs, and neon cybernetic accents.

### 1.1 Dark Theme Color Tokens (Default Substrate)
```css
:root, body.theme-dark {
  --bg-deep: #080b11;
  --bg-sidebar: #0d121d;
  --bg-stage: #0f172a;
  --bg-card: rgba(22, 30, 49, 0.75);
  --bg-card-hover: rgba(28, 38, 62, 0.85);
  --glass-surface-bg: rgba(19, 25, 38, 0.75);
  --glass-specular-border: rgba(255, 255, 255, 0.08);
  --glass-backdrop-blur: blur(24px);

  /* Cybernetic Accent Palette */
  --accent-emerald: #10b981;
  --accent-emerald-glow: rgba(16, 185, 129, 0.45);
  --accent-emerald-dim: rgba(16, 185, 129, 0.15);
  
  --accent-cyan: #06b6d4;
  --accent-cyan-glow: rgba(6, 182, 212, 0.45);
  --accent-cyan-dim: rgba(6, 182, 212, 0.15);
  
  --accent-violet: #8b5cf6;
  --accent-violet-glow: rgba(139, 92, 246, 0.45);
  --accent-violet-dim: rgba(139, 92, 246, 0.15);
  
  --accent-amber: #f59e0b;
  --accent-amber-glow: rgba(245, 158, 11, 0.45);
  --accent-amber-dim: rgba(245, 158, 11, 0.15);

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --mono-font: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 1.2 Light Theme Color Tokens (Daylight Studio Substrate)
```css
body.theme-light {
  --bg-deep: #f1f5f9;
  --bg-sidebar: #e2e8f0;
  --bg-stage: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-card-hover: rgba(255, 255, 255, 0.95);
  --glass-surface-bg: rgba(255, 255, 255, 0.82);
  --glass-specular-border: rgba(0, 0, 0, 0.12);
  --glass-backdrop-blur: blur(20px);

  --accent-emerald: #059669;
  --accent-emerald-glow: rgba(5, 150, 105, 0.35);
  --accent-emerald-dim: rgba(5, 150, 105, 0.12);

  --accent-cyan: #0891b2;
  --accent-cyan-glow: rgba(8, 145, 178, 0.35);
  --accent-cyan-dim: rgba(8, 145, 178, 0.12);

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
}
```

---

## 🎛️ 2. Studio Deck 5-Band Equalizer Visual Specification

The 5-Band Graphic Equalizer (`#heroAudioEqCard` / `.audio-eq-widget`) delivers tactile physical mixing console aesthetics within a digital glass substrate.

### 2.1 Component Layout & Proportions
```
+-----------------------------------------------------------------------------------+
| 🎛️ 5-BAND GRAPHIC EQUALIZER STUDIO DECK                        [Preset: Flat ▼] [↺ Reset] |
| 60Hz Sub-Bass • 250Hz Bass • 1kHz Mid • 4kHz Presence • 16kHz Treble  |
+-----------------------------------------------------------------------------------+
|    +12dB            +12dB            +12dB            +12dB            +12dB      |
|      |                |                |                |                |        |
|      |                |                |                |                |        |
| ----[■]--------------[■]--------------[■]--------------[■]--------------[■]---- 0dB |
|      |                |                |                |                |        |
|      |                |                |                |                |        |
|    -12dB            -12dB            -12dB            -12dB            -12dB      |
|    60Hz             250Hz            1kHz             4kHz             16kHz      |
|   Sub-Bass          Bass            Vocals          Presence            Air       |
+-----------------------------------------------------------------------------------+
```

### 2.2 Micro-Interactions & Styling Tokens
- **Zero-dB Detent Line (`.eq-bands-grid::before`):**
  - Continuous 1px horizontal rule across all 5 columns at the exact 0dB center line (50% slider track position).
  - Subtle glowing linear gradient: `linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.4) 20%, rgba(16, 185, 129, 0.4) 80%, transparent 100%)`.
- **Vertical Slider Tracks (`.eq-vertical-slider`):**
  - Track width: `8px`, track background: `rgba(255, 255, 255, 0.08)` (Dark) / `rgba(0, 0, 0, 0.08)` (Light).
  - Track border radius: `4px`.
- **Illuminated Slider Thumb (`::-webkit-slider-thumb`):**
  - Horizontal rectangular studio fader cap: `width: 26px`, `height: 14px`, `border-radius: 4px`.
  - Color: `var(--accent-emerald, #10b981)`.
  - Box Shadow: `0 0 10px rgba(16, 185, 129, 0.65), 0 2px 4px rgba(0, 0, 0, 0.5)`.
  - Hover state: `transform: scale(1.12)`, `box-shadow: 0 0 16px rgba(16, 185, 129, 0.9)`.
  - Active/Dragging state: `box-shadow: 0 0 20px rgba(16, 185, 129, 1), 0 0 6px #fff`.
- **Decibel Badge (`.eq-db-val`):**
  - Font: `var(--mono-font)`, `font-size: 0.82rem`, `font-weight: 700`.
  - Active state (> 0dB): border glow in emerald, text in bright emerald (`#10b981`).
  - Active cut (< 0dB): border glow in cyan, text in bright cyan (`#06b6d4`).
  - Zero state (0dB): muted border `rgba(255, 255, 255, 0.1)`, text in `var(--text-secondary)`.

---

## 🔊 3. Audio Lab & DSP Telemetry Visual Specification

### 3.1 Master Boost Slider (`#heroAudioBoostSlider`)
- **Range:** 0% to 200%, default 100%.
- **Dynamic Track Fill:**
  - 0% to 100%: Emerald gradient (`#10b981`).
  - 101% to 200%: Overdrive warning amber gradient (`#f59e0b`).
- **Scale Indicators:**
  - `0%` (Min) - Muted gray.
  - `100% (Normal)` - Glowing emerald badge text.
  - `200% (Max)` - Amber badge text.

### 3.2 Enhancement Toggle Cards
- **Vocal Clarity (`#toggleVocalClarity`), Night Mode (`#toggleNightMode`), Audio-Only (`#toggleAudioOnlyMode`):**
  - Clean card wrappers with specular border: `1px solid var(--glass-specular-border)`.
  - On toggle activation: Card background transitions to subtle emerald tint (`rgba(16, 185, 129, 0.08)`), border lights up in emerald, and matching status badge switches from `OFF` to `ON` with green pulse.

---

## 🔔 4. Settings Tactile Audio Haptics Visual Specification

Card 1.8 (`#cardAppearanceSettings`) provides users with fine-grained control over procedural Web Audio UI sound effects.

### 4.1 Layout & Component Architecture
```
+-----------------------------------------------------------------------------------+
| 🎨 Appearance & Tactile Haptics                                                   |
| Custom substrate materials, dynamic specular accents, and Web Audio haptics      |
+-----------------------------------------------------------------------------------+
| Tactile Audio Feedback                                                [  ON (●) ] |
| Subtle procedural sound effects on sliders, clicks, and actions                   |
|-----------------------------------------------------------------------------------|
| Haptic Feedback Volume                                                            |
| Volume level for procedural clicks and chimes (Default: 15%)                       |
|   [=================o--------------------------]   [ 15% ]   [ 🔔 Test ]          |
+-----------------------------------------------------------------------------------+
```

### 4.2 Component Tokens
- **Volume Slider (`.styled-range-slider`):**
  - Track: `height: 6px`, `border-radius: 9999px`, `background: rgba(255, 255, 255, 0.1)`.
  - Thumb: Circular pill `18px x 18px`, `border-radius: 50%`, `background: var(--accent-cyan, #06b6d4)`, `box-shadow: 0 0 10px rgba(6, 182, 212, 0.7)`.
  - Hover: `transform: scale(1.15)`, `box-shadow: 0 0 16px rgba(6, 182, 212, 0.9)`.
- **Volume Badge (`.volume-badge`):**
  - Monospace pill badge: `padding: 4px 10px`, `border-radius: 8px`, `background: rgba(6, 182, 212, 0.12)`, `border: 1px solid rgba(6, 182, 212, 0.3)`, `color: var(--accent-cyan)`, `font-family: var(--mono-font)`.
- **Test Chime Button (`.btn-test-chime`):**
  - Pill button: `padding: 6px 14px`, `border-radius: 9999px`, `background: rgba(255, 255, 255, 0.06)`, `border: 1px solid var(--glass-specular-border)`.
  - Hover state: `background: rgba(6, 182, 212, 0.15)`, `border-color: var(--accent-cyan)`, `color: #fff`, `transform: translateY(-1px)`.
  - Active click: `transform: scale(0.96)`.

---

## 🧭 5. Minimalist Sidebar Telemetry HUD Specification

### 5.1 Stripped-Down Telemetry HUD Card
Eliminates bulky buttons and optimizes vertical density:

```
+-----------------------------------+
| SQLite Data Hub           (●)     |
| Hub Offline                       |
| ws://127.0.0.1:65433 (WAL)        |
+-----------------------------------+
| Video Detector HUD        (●)     |
| HUD Offline                       |
| ws://127.0.0.1:65432              |
+-----------------------------------+
```

### 5.2 Micro-Typography & Pulsing Dots
- Card Dimensions: Compact vertical padding `0.65rem 0.85rem`, border radius `12px`, background `rgba(255, 255, 255, 0.02)`.
- Status Dot (`.hud-dot`): `8px x 8px`, circular, with dynamic pulsing animation:
  - Online (`.hud-dot.online`): Emerald `#10b981` with `box-shadow: 0 0 8px #10b981`.
  - Offline (`.hud-dot.offline`): Muted Slate/Red `#ef4444` with subtle pulse.
- Status Text: `font-size: 11.5px`, `font-weight: 600`, color `var(--text-secondary)`.
- Port/Address Subtext: `font-size: 10px`, `font-family: var(--mono-font)`, color `var(--text-muted)`.

---

## 🔌 6. Local Services & Hardware Bridges Card in Settings

### 6.1 Card Layout & Visual Structure
```
+-----------------------------------------------------------------------------------+
| 🔌 Local Services & Hardware Bridges                                              |
| WebSocket daemons, SQLite storage engine, and peripheral telemetry                |
+-----------------------------------------------------------------------------------+
| 💾 SQLite Data Hub Daemon           [Port 65433 (WAL)]      [ ⚡ Reconnect Hub ]   |
| Local high-concurrency event telemetry & persistent database store                |
| Status: [Offline]  |  Protocol: RFC 6455  |  Mode: WAL SQLite3                    |
|-----------------------------------------------------------------------------------|
| 🖥️ Video Detector HUD Bridge       [Port 65432]            [ ⚡ Reconnect HUD ]   |
| Real-time overlay bridge for Windows desktop video sentinel                       |
| Status: [Offline]  |  Protocol: RFC 6455  |  Target: localhost                     |
+-----------------------------------------------------------------------------------+
```

### 6.2 Action Button Styling (`.btn-bridge-action` / `.btn-hud-reconnect`)
- Styling: High-tech glass action button:
  - `padding: 0.55rem 1.15rem`, `border-radius: 10px`.
  - `background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))`.
  - `border: 1px solid rgba(16, 185, 129, 0.35)`.
  - `color: #fff`, `font-weight: 600`, `font-size: 0.84rem`.
  - Hover: `background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))`, `border-color: var(--accent-emerald)`, `transform: translateY(-1px)`, `box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3)`.
  - Active: `transform: scale(0.97)`.
- Port Badges (`.bridge-port-badge`):
  - `font-size: 11px`, `padding: 2px 8px`, `border-radius: 6px`, `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid var(--border-subtle)`, `font-family: var(--mono-font)`.
