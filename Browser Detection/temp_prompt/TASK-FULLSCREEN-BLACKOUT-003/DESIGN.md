<!-- UTF-8 with BOM -->
# TASK-FULLSCREEN-BLACKOUT-003: Design System & Fullscreen Tokens (DESIGN.md)

> **Document Class:** Design System & CSS Viewport Tokens Specification  
> **Task Identifier:** `TASK-FULLSCREEN-BLACKOUT-003`  
> **Author:** Level 3C Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Lead Department:** Department 05 (Frontend Engineering)  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🎨 1. Fullscreen Visual Viewport Tokens

### 1.1 CSS Stacking Context & Geometry

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--sentinel-fs-z-index` | `2147483647` | Maximum 32-bit integer z-index to break above all web page overlays |
| `--sentinel-fs-bg` | `#000000` | Pure pitch black backdrop for cinematic viewing |
| `--sentinel-fs-width` | `100vw` | Viewport width coverage |
| `--sentinel-fs-height` | `100vh` | Viewport height coverage |
| `--sentinel-fs-object-fit` | `contain` | Preserves original video aspect ratio with letterboxing/pillarboxing |

### 1.2 Viewport Lock Tokens
```css
/* Viewport Lock on html/body (Only activated when valid video player is active) */
html.sentinel-fullscreen-active,
body.sentinel-fullscreen-active,
html.sentinel-has-web-fullscreen,
body.sentinel-has-web-fullscreen {
  overflow: hidden !important;
  width: 100vw !important;
  height: 100vh !important;
  min-width: 100vw !important;
  min-height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
}
```

---

## 🎛️ 2. In-Page Floating HUD Button Design Specifications

### 2.1 Visual Styles
```css
.sentinel-fs-floating-btn {
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  width: 38px !important;
  height: 38px !important;
  border-radius: 8px !important;
  background: rgba(15, 23, 42, 0.8) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #38bdf8 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 2147483645 !important;
  opacity: 0 !important;
  transform: scale(0.92) !important;
  transition: opacity 0.25s ease, transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
  pointer-events: auto !important;
  user-select: none !important;
  box-sizing: border-box !important;
  padding: 0 !important;
}

.sentinel-fs-floating-btn.visible,
.sentinel-fs-floating-btn:hover {
  opacity: 1 !important;
  transform: scale(1) !important;
}

.sentinel-fs-floating-btn:hover {
  background: rgba(15, 23, 42, 0.95) !important;
  border-color: #38bdf8 !important;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.6) !important;
  color: #ffffff !important;
  transform: scale(1.08) !important;
}

.sentinel-fs-floating-btn:active {
  transform: scale(0.96) !important;
}
```

### 2.2 On-Screen Display (OSD) Notification
```css
.__sentinel_fs_osd__ {
  position: fixed !important;
  top: 15% !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: rgba(15, 23, 42, 0.92) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(56, 189, 248, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.3) !important;
  color: #f8fafc !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  padding: 10px 22px !important;
  border-radius: 9999px !important;
  z-index: 2147483647 !important;
  pointer-events: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  opacity: 0 !important;
  transition: opacity 0.25s ease, transform 0.25s ease !important;
  white-space: nowrap !important;
}
```

---

## ♿ 3. Accessibility & Keyboard Discipline (WCAG 2.1 AA)

1. **Escape Key Exit Discipline:**
   - Pressing `Escape` key immediately removes `.sentinel-web-fullscreen`, `.sentinel-fullscreen-active`, and `.sentinel-has-web-fullscreen` from all elements.
2. **Focus State & Screen Reader Notice:**
   - Floating HUD button includes `aria-label="Toggle Fullscreen"` and dynamic `title="Antigravity Sentinel Fullscreen (Click for Native, Shift+Click for Web)"`.
3. **Contrast Ratio:**
   - `#38bdf8` (Sky Blue) on `#0f172a` (Slate 900) exceeds 7.5:1 contrast ratio, surpassing WCAG AAA criteria.
