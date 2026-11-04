# Windows Video-Only Inactivity Sentinel - Design System (DESIGN.md)

> **Document Type:** UI/UX Design System & Aesthetic Engineering Specifications  
> **Project Name:** Windows Video-Only Inactivity Sentinel Enterprise Expansion  
> **Workspace Path:** `Video Detector/`  
> **Author & UI Engineer:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Standard Compliance:** Dept 04 (UI/UX Design System), WCAG 2.1 AA/AAA Accessibility  
> **Status:** Authoritative Design Specification  

---

## 🎨 1. Design Philosophy & Anti-Generic Aesthetic

The Windows Video-Only Inactivity Sentinel rejects boring, generic AI-templated UI. It embraces a **Precision Aerospace & Cyber-Clean Aesthetic** characterized by:
- High information density without visual clutter.
- Real-time atomic HUD updates with zero scrolling or flickering.
- Calibrated contrast meeting strict WCAG 2.1 AAA standards.
- Purposeful micro-motion and tactile visual states.
- Seamless dual-mode execution: Terminal ANSI Interface and Web Dashboard.

---

## 💻 2. Terminal ANSI UI Design System

### 2.1 Color Palette & ANSI Tokens
The terminal dashboard uses standard ANSI 256 and 24-bit TrueColor sequences:

| Token Name | Hex Code | ANSI Escape Code | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `COLOR_BRAND` | `#6366F1` | `[38;2;99;102;241m` | Primary borders, titles, sentinel badge |
| `COLOR_SUCCESS` | `#10B981` | `[38;2;16;185;129m` | Active video playing, normal volume, AC power |
| `COLOR_WARNING` | `#F59E0B` | `[38;2;245;158;11m` | Pure audio playing, idle state, low battery |
| `COLOR_DANGER` | `#EF4444` | `[38;2;239;68;68m` | Auto-shutdown countdown active, ghost streams |
| `COLOR_INFO` | `#38BDF8` | `[38;2;56;189;248m` | Fullscreen indicator, hardware telemetry |
| `COLOR_MUTED` | `#64748B` | `[38;2;100;116;139m` | Dimmed labels, inactive states, border lines |
| `COLOR_BG` | `#0B0F17` | Standard terminal default | In-place dark canvas |

### 2.2 Screen Buffering & Atomic Redraw Mechanics
- **Zero-Flicker In-Place Refresh:** Screen is cleared once at startup using `[2J[H`.
- **Cursor Management:** Hidden on startup via `[?25l`, cleanly restored on exit via `[?25h`.
- **Atomic Line Writes:** Every card row ends with `[K` (clear to end of line). The tail of the output is buffered and written in a single `sys.stdout.write()` call.

### 2.3 Terminal HUD Layout Structure
```
========================================================================================
                 WINDOWS VIDEO INACTIVITY SENTINEL (वीडियो आइडल डिटेक्टर)
========================================================================================
  [● ACTIVE VIDEO DETECTED]  Status: BUSY (No Sleep)  │  Power: AC Mains [Charging 100%]
----------------------------------------------------------------------------------------
  PRIMARY STREAM INSPECTOR
  App / Executable     : Google Chrome (chrome.exe - PID 14280)
  Platform & Source    : YouTube (https://youtube.com/watch?v=...)
  Window Title         : Christopher Nolan - Oppenheimer Official 4K Trailer - YouTube
  Presentation Mode    : FULLSCREEN (Cinema 3840x2160 @ 60Hz)
  Volume & Audio Peak  : 85% [Muted: NO]  Peak: 0.428 [||||||||||||||||....]
  Hardware Telemetry   : CPU: 1.8% | RAM: 320 MB | HW Acceleration: DXVA2 Active
----------------------------------------------------------------------------------------
  SECONDARY MEDIA & GHOST STREAM AUDIT
  #1 [Spotify.exe]     : Track: "Starboy - The Weeknd" (PURE_AUDIO - Ignored)
  #2 [VLC.exe]         : Window Minimized (GHOST_STREAM - Muted)
----------------------------------------------------------------------------------------
  AUTO-SHUTDOWN COUNTDOWN HUD
  System State         : PROTECTED (Video is actively playing)
  Countdown Progress   : [========================================] 300s / 300s (STANDBY)
----------------------------------------------------------------------------------------
  TODAY WATCH-TIME ANALYTICS
  Total Video Watch    : 03h 42m 18s  │  Pure Audio Ignored: 01h 15m 02s
  24h Hourly Heatmap   : ..▃▅██▇▆▅▃....... (Peak: 21:00 - 22:00)
----------------------------------------------------------------------------------------
  HOTKEYS: [+] Inc Timer | [-] Dec Timer | [P] Pause | [R] Reset/Cancel | [Q] Exit
========================================================================================
```

---

## 🌐 3. Lightweight Web Dashboard Design System

### 3.1 Design Tokens (CSS Variables)
```css
:root {
  /* Color Palette */
  --bg-primary: #0b0f17;
  --bg-surface: #131b2e;
  --bg-surface-elevated: #1a243d;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(99, 102, 241, 0.5);

  --brand-primary: #6366f1;
  --brand-glow: rgba(99, 102, 241, 0.25);
  
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-danger: #ef4444;
  --status-info: #38bdf8;

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Elevations & Glassmorphism */
  --glass-bg: rgba(19, 27, 46, 0.75);
  --glass-blur: blur(12px);
  --card-radius: 12px;
  --button-radius: 8px;
}
```

### 3.2 Mobile-First Responsive Breakpoints
- **Mobile Viewport (360px - 600px):** Single-column stacked cards. Emergency "ABORT SHUTDOWN" button pinned to bottom viewport thumb-zone. Large touch targets (minimum 48px height).
- **Tablet Viewport (601px - 1024px):** 2-column layout with status hero on left and telemetry on right.
- **Desktop Viewport (1025px+):** Full multi-stream inspector, 24-hour interactive SVG heatmap, and hardware telemetry gauges.

### 3.3 Tactile UI Components
1. **Live State Hero Badge:** Glowing pulse indicator (Green pulse for Active Video, Amber for Pure Audio, Red flashing for Active Countdown).
2. **Radial Countdown Meter:** Animated SVG circular progress ring indicating remaining seconds with high-contrast numerical display.
3. **One-Click Quick Actions:** Large tactile buttons for "+5 Min", "Snooze 15m", "Pause Monitoring", and "Emergency Abort".
4. **24-Hour Activity Heatmap Grid:** 24 interactive hourly bars with hover tooltips showing minute-by-minute playback breakdown.

---

## ♿ 4. Accessibility & Human Factors

1. **Color Contrast:** All body text maintains a minimum contrast ratio of **7:1** against backgrounds, exceeding WCAG AAA standards.
2. **Keyboard Trapping Prevention:** Full tab navigation support with visible focus rings (`outline: 2px solid var(--brand-primary)`).
3. **Reduced Motion Support:** Honors `@media (prefers-reduced-motion: reduce)` by disabling pulse animations and smooth layout transitions for sensitive users.
