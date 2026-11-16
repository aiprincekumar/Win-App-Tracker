# Design System & UI Tokens: Dashboard Future UI/UX Enhancements
# डिज़ाइन सिस्टम एवं यूआई टोकन्स विनिर्देश

> **दस्तावेज़ प्रकार (Document Type):** Semantic Design System & Visual Token Constitution (Universal Rule 22)  
> **पहल (Initiative):** Web Activity & Media Sentinel - Future UI/UX Enhancements  
> **डिज़ाइन भाषा (Design Language):** iOS 26 Liquid Glass Material + Bento Grid Precision Workstation  
> **प्रॉम्प्ट आर्किटेक्ट (Lead Architect):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **मास्टर विनिर्देश स्रोत (Master Source):** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md)  

---

## 🎨 1. सिमेंटिक डिज़ाइन टोकन्स (Semantic Design Tokens)

### 1.1 लिक्विड ग्लास मैटेरियल टोकन्स (Liquid Glass Material Tokens)

```css
:root {
  /* Frosted Liquid Glass Backgrounds */
  --glass-bg-base: rgba(15, 23, 42, 0.72);
  --glass-bg-elevated: rgba(15, 23, 42, 0.85);
  --glass-bg-floating-dock: rgba(15, 23, 42, 0.88);
  --glass-bg-tooltip: rgba(15, 23, 42, 0.94);
  
  /* Specular Reflective Borders */
  --glass-border-subtle: 1px solid rgba(255, 255, 255, 0.10);
  --glass-border-standard: 1px solid rgba(255, 255, 255, 0.16);
  --glass-border-glow: 1px solid rgba(168, 85, 247, 0.45);
  
  /* Hardware Accelerated Blur & Saturation */
  --glass-backdrop-blur: blur(28px) saturate(200%);
  --glass-backdrop-tooltip: blur(14px) saturate(180%);
  
  /* 3D Dynamic Elevation Shadows */
  --shadow-floating-dock: 0 16px 36px -6px rgba(0, 0, 0, 0.5), 
                          0 0 20px rgba(99, 102, 241, 0.25),
                          inset 0 1px 1px rgba(255, 255, 255, 0.2);
  --shadow-bento-dragging: 0 20px 40px rgba(0, 0, 0, 0.65), 
                           0 0 25px rgba(168, 85, 247, 0.4);
  --shadow-tooltip: 0 4px 14px rgba(0, 0, 0, 0.45);
}

/* Light Theme Overrides (High-Contrast Parity) */
[data-theme="light"] {
  --glass-bg-base: rgba(255, 255, 255, 0.82);
  --glass-bg-elevated: rgba(255, 255, 255, 0.92);
  --glass-bg-floating-dock: rgba(255, 255, 255, 0.95);
  --glass-bg-tooltip: rgba(15, 23, 42, 0.96); /* High contrast dark chip */
  
  --glass-border-subtle: 1px solid rgba(0, 0, 0, 0.08);
  --glass-border-standard: 1px solid rgba(0, 0, 0, 0.14);
  --glass-border-glow: 1px solid rgba(99, 102, 241, 0.55);
}
```

### 1.2 रंग पैलेट एवं वायब्रेंट ग्रेडिएंट्स (Vibrant Color Spectrums)

- **प्राइमरी इंडिगो-वायलेट ग्रेडिएंट:** `linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)` (वॉल्यूम फिल, मिनी-डॉक प्रोग्रेस बार, इक्वलाइज़र बार्स)।
- **नियॉन पर्पल एम्बिएंट ग्लो:** `rgba(168, 85, 247, 0.65)` (वॉल्यूम थंब होवर, एक्टिव डोनट स्लाइस)।
- **सिमेंटिक टेक्स्ट टोकन्स:**
  - `--text-primary`: `#ffffff` (Dark) / `#0f172a` (Light) -> Contrast > 17:1 (WCAG AAA Pass)
  - `--text-secondary`: `#94a3b8` (Dark) / `#334155` (Light) -> Contrast > 7.2:1 (WCAG AAA Pass)
  - `--text-accent`: `#a5b4fc` (Dark) / `#4338ca` (Light)

---

## 📐 2. टाइपोग्राफी एवं मोनोस्पेस डेटा ग्रिड्स (Typography Scales)

- **शीर्षक एवं कार्ड हेडर:** System Sans-Serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`), `font-weight: 700`, `letter-spacing: -0.02em`।
- **टेलीमेट्री एवं टाइमस्टैम्प्स:** Dedicated Tabular Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`), `font-weight: 600` (शून्य विस्थापन के लिए)।
- **टूलटिप एवं कीबोर्ड बैज (`.vol-floating-tooltip`, `.omni-kbd`):** `font-size: 11px`, `font-family: monospace`, `font-weight: 700`।

---

## 🏃 3. 60fps माइक्रो-मोशन एवं स्प्रिंग काइनेटिक्स (Micro-Motion Curves)

- **स्प्रिंग बाउंस (Interactive Elastic):** `cubic-bezier(0.34, 1.56, 0.64, 1)` (वॉल्यूम थंब विस्तार, डोनट स्लाइस होवर, मिनी-डॉक बटन होवर)।
- **स्मूथ एंट्री/एग्ज़िट (Deceleration Curve):** `cubic-bezier(0.16, 1, 0.3, 1)` (मिनी-डॉक स्लाइड-इन/आउट, टूलटिप क्रॉस-फेड)।
- **ऑडियो इक्वलाइज़र बाउंस एनीमेशन:**
  - बार 1: `eqBounce1 0.8s ease-in-out infinite alternate`
  - बार 2: `eqBounce2 1.15s ease-in-out infinite alternate 0.15s`
  - बार 3: `eqBounce3 0.65s ease-in-out infinite alternate 0.3s`

---

## ♿ 4. WCAG 2.1 AAA एक्सेसिबिलिटी मानक (Accessibility Standards)

1. **7:1 न्यूनतम कंट्रास्ट अनुपात:** सभी सूचनात्मक टेक्स्ट और ग्लास बैकग्राउंड्स के बीच 7:1 कंट्रास्ट अनिवार्य।
2. **डुअल-रिंग नियॉन फोकस इंडिकेटर:**
   ```css
   :focus-visible {
     outline: 2px solid #a855f7;
     outline-offset: 2px;
   }
   ```
3. **कीबोर्ड पूर्ण नियंत्रण:** वॉल्यूम स्लाइडर को `ArrowRight`, `ArrowLeft`, `PageUp`, `PageDown`, `Home`, `End` से बिना पेज स्क्रॉल किए नियंत्रित किया जा सकेगा (`e.preventDefault()`)।
4. **स्क्रीन रीडर घोषणाएं:** सभी इंटरैक्टिव घटकों पर उपयुक्त `role="slider"`, `role="region"`, `aria-label`, और `aria-valuenow` अनिवार्य।
