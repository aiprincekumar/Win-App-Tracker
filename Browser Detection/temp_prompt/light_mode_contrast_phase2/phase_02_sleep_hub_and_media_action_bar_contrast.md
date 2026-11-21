# Phase 2 Execution Instruction: Sleep Hub & Media Action Bar Contrast

> **Phase ID:** PHASE-LIGHT-CONTRAST-002  
> **Target Subsystems:** Sleep Sentinel Hub & Multi-Tab Media Deck Actions  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Target Files:** `dashboard/styles/wellbeing_light.css`, `dashboard/styles/media.css`  
> **Reference Specs:** [`INDEX.md`](INDEX.md), [`TRD.md`](TRD.md), [`DESIGN.md`](DESIGN.md)  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager prior to file mutation.

---

## 🎯 1. Phase Objective
Complete the high-contrast light mode styling for:
1. **Sleep Sentinel Hub Card:** `#cardSleepSentinelHub`, dial track `.dash-sleep-dial-track`, countdown display `.dash-sleep-time`, finish text `.dash-sleep-finish`, and status badge `.dash-sleep-badge.idle`.
2. **Media Deck Header Actions:** `#btnMuteAllOthers`, `#btnMuteAll` in `.media-deck-header-actions`, active state buttons, and active streams badge `#badgeActiveStreamsCount`.
3. **Hero Player Remote Media Controls:** Stepper button boundaries and speed value contrast.

---

## 📐 2. Concrete Modification Steps

### Step 1: Open `dashboard/styles/wellbeing_light.css`
Append the following Sleep Sentinel Hub and Media Deck light mode overrides:

```css
/* Sleep Sentinel Hub Card Refinements */
body.theme-light .dash-sleep-dial-track,
[data-theme="light"] .dash-sleep-dial-track {
  stroke: #e2e8f0 !important;
}

body.theme-light .dash-sleep-time,
[data-theme="light"] .dash-sleep-time {
  color: #0f172a !important;
}

body.theme-light .dash-sleep-finish,
[data-theme="light"] .dash-sleep-finish {
  color: #475569 !important;
}

body.theme-light .dash-sleep-badge.idle,
[data-theme="light"] .dash-sleep-badge.idle {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}

/* Media Deck Header Action Buttons */
body.theme-light .media-deck-header-actions .btn.btn-secondary,
[data-theme="light"] .media-deck-header-actions .btn.btn-secondary {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .media-deck-header-actions .btn.btn-secondary:hover,
[data-theme="light"] .media-deck-header-actions .btn.btn-secondary:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

body.theme-light .media-deck-header-actions .btn.active,
[data-theme="light"] .media-deck-header-actions .btn.active {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  color: #dc2626 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.25) !important;
}

/* Active Streams Counter Badge */
body.theme-light #badgeActiveStreamsCount,
[data-theme="light"] #badgeActiveStreamsCount {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}
```

### Step 2: Verify `dashboard/styles/media.css` or `hero_player.css`
Verify that `.btn-ctrl-hero` in `dashboard/styles/media/hero_player.css` retains its high-contrast light mode styling and that speed stepper `.hero-speed-stepper` maintains solid borders in light mode.

---

## 🔒 3. Verification Gate
- Verify UTF-8 with BOM on all touched files.
- Verify existing media and sleep test suites:
  - `node tests/test_bidirectional_mute_toggle_phase3.js`
  - `node tests/test_sleep_backend_and_dashboard_hub.js`
- All tests must pass with Exit Code 0.
