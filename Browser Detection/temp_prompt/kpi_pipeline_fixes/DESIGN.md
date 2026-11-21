# Design Specifications (DESIGN.md): Bento KPI Cards

> **Document Path:** `temp_prompt/kpi_pipeline_fixes/DESIGN.md`  
> **Initiative:** Web Activity & Media Sentinel - Bento KPI Card Visual & Telemetry Standards  
> **Lead Department:** Dept 04 UI/UX Design System  
> **Date:** 2026-11-21  

---

## 🎨 1. Bento Grid Metric Card Hierarchy & Tokens

The extension dashboard utilizes a 10-card Bento Grid layout (5x2 symmetrical desktop matrix, responsive mobile flow). The 3 affected cards adhere to the following design specifications:

### Card 1: Peak Activity Hour (Tab A, Card 9)
- **Container ID:** `#cardMetricPeakHour` (or `.bento-card` wrapper)
- **Label Element:** `<span id="lblMetricPeakHour" class="metric-label" data-i18n="metric_peak_hour">Peak Activity Hour</span>`
- **Value Element:** `<span id="trackMetricPeakHour" class="metric-big-num">--:--</span>`
- **Subtext Element:** `<span id="subMetricPeakHour" class="metric-subtext" data-i18n="metric_peak_hour_sub">Highest usage window</span>`
- **Typography Scale:**
  - Value: `font-size: 1.65rem; font-weight: 700; letter-spacing: -0.02em; font-family: var(--font-mono, monospace);`
  - Label: `font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);`
- **Format Requirements:** Exactly `HH:00 - HH:00` (e.g., `14:00 - 15:00`). If no data, `--:--`.

### Card 2: Active Live Streams (Tab B, Card 5)
- **Container ID:** `#cardMediaActiveStreams`
- **Label Element:** `<span id="lblMediaActiveStreams" class="metric-label" data-i18n="media_metric_active_streams">Live Streams</span>`
- **Value Element:** `<span id="mediaMetricActiveStreams" class="metric-big-num">0</span>`
- **Subtext Element:** `<span id="subMediaActiveStreams" class="metric-subtext" data-i18n="media_sub_active_streams">Broadcasts & live radio</span>`
- **State Token:** When `activeStreamsCount > 0`, highlight accent pulse token (`color: var(--accent-cyan); text-shadow: 0 0 12px rgba(6, 182, 212, 0.4);`).

### Card 3: Muted Sessions Count (Tab B, Card 9)
- **Container ID:** `#cardMediaMutedSessions`
- **Label Element:** `<span id="lblMediaMutedSessions" class="metric-label" data-i18n="media_metric_muted_sessions">Muted Sessions</span>`
- **Value Element:** `<span id="mediaMetricMutedSessions" class="metric-big-num">0</span>`
- **Subtext Element:** `<span id="subMediaMutedSessions" class="metric-subtext" data-i18n="media_sub_muted_sessions">Silent / muted playback</span>`
- **Format Requirements:** Integer count (`0`, `1`, `2`, ...).

---

## ♿ 2. Accessibility & WCAG 2.1 AA Compliance

- **Contrast Ratio:** Text-to-background contrast ratio >= 4.5:1 across both Cyber-Dark and Day-Light themes.
- **Screen Reader Support:** Semantic labels linked via `aria-labelledby` and dynamic value updates reflected to assistive technology.
- **Zero-Flicker Transitions:** KPI updates apply micro-transitions (`transition: opacity 0.2s ease, transform 0.2s ease`) without layout shift (CLS = 0).
