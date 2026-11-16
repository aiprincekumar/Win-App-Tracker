# Phase 1: Visual Parity & Micro-Interactions (System A & System D)
# फेज़ 1: विज़ुअल पैरिटी एवं माइक्रो-इंटरैक्शन विनिर्देश प्रॉम्प्ट

> **फेज़ आईडी (Phase ID):** `PHASE-DASHBOARD-FUTURE-UIUX-01`  
> **लक्षित भूमिका (Target Role):** Frontend Engineer (Dept 05: Frontend Engineering)  
> **सिस्टम्स (Covered Systems):**  
> - **System A:** Hero Volume Slider Visual Parity & Micro-Interactions  
> - **System D:** SVG Donut Chart Central Dynamic Readout & Slice Dilation  
> **मास्टर विनिर्देश स्रोत:** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md) (अनुभाग 1 एवं 4)  
> **सक्रिय ऑथराइजेशन टोकन:** `AUTH-MGR-20261116-DASHBOARD-FUTURE-UIUX`  
> **स्थानीय टेस्ट गेट:** `node tests/test_dashboard_future_phase1_visual_parity.js`  

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

हीरो मीडिया प्लेयर कार्ड के वॉल्यूम स्लाइडर को टाइमलाइन प्रोग्रेस बार के समान आधुनिक विज़ुअल पैरिटी (6px कैप्सूल ट्रैक, कंसेंट्रिक ग्लास थंब, फ्लोटिंग रियल-टाइम पर्सेंटेज टूलटिप, मोर्फिंग आइकन) प्रदान करना, तथा टाइम डिस्ट्रीब्यूशन कार्ड में SVG डोनट चार्ट के केंद्रीय हिस्से को इंटरैक्टिव डायनामिक HUD में बदलना जो स्लाइस होवर पर डोमेन फेविकॉन, डोमेन नाम, खर्च समय और प्रतिशत अनुपात प्रदर्शित करे।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट्स (Prerequisites & Inputs)

- `dashboard/dashboard.css` (मौजूदा वॉल्यूम व डोनट स्टाइल्स)
- `dashboard/dashboard.js` (मौजूदा `initHeroVolumeSlider`, डोनट रेंडरिंग फंक्शन्स)
- `dashboard/dashboard.html` (मौजूदा `#heroVolumeBar`, `#heroVolumeFill`, `#dashboardDonutSvg`)
- Web Audio हैप्टिक फीडबैक सिंथेसाइज़र (`playHapticFeedback`)

---

## 🔍 3. तकनीकी संदर्भ एवं फ़ाइल एंकर्स (Technical Context & File Anchors)

- [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css): वॉल्यूम ट्रैक, थंब, टूलटिप, और डोनट स्लाइस स्ट्रोक रूल्स।
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js): वॉल्यूम ड्रैग, आइकन मोर्फिंग, और डोनट स्लाइस इवेंट लिस्नर्स।
- [`dashboard_future_uiux_recommendations.md#L80-L397`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L80-L397): System A का संपूर्ण CSS एवं JS विनिर्देश।
- [`dashboard_future_uiux_recommendations.md#L866-L1048`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L866-L1048): System D का संपूर्ण CSS एवं JS विनिर्देश।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### 4.1 System A: Hero Volume Slider Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - वॉल्यूम ट्रैक (`.hero-volume-track`, `#heroVolumeBar`) को 6px कैप्सूल ट्रैक (`border-radius: 999px`) में बदलें, होवर/ड्रैग पर ऊँचाई 8px करें।
   - प्रोग्रेस फिल (`.hero-volume-fill`, `#heroVolumeFill`) पर वायब्रेंट लीनियर ग्रेडिएंट `linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)` और वायलेट ग्लो शैडो लागू करें।
   - 14px कंसेंट्रिक ग्लास थंब (`.vol-thumb`) जोड़ें जिसमें 2px सेमी-ट्रांसपेरेंट फ्रॉस्टेड बॉर्डर और केंद्र में 4px ग्लोइंग कोर डॉट हो। होवर/ड्रैग पर `scale(1.3)` करें।
   - फ्लोटिंग पर्सेंटेज टूलटिप (`.vol-floating-tooltip`) स्टाइल करें: `backdrop-filter: blur(12px) saturate(180%)`, मोनोस्पेस फ़ॉन्ट, थंब के ऊपर 8px।
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `initHeroVolumeMicroInteractions()` लागू करें।
   - पॉइंटर इवेंट्स (`pointerdown`, `pointermove`, `pointerup`) से सुचारु ड्रैग सुनिश्चित करें।
   - वॉल्यूम प्रतिशत के आधार पर डायनामिक आइकन मोर्फिंग जोड़ें:
     - `0%` -> 🔇 (Muted)
     - `1% - 33%` -> 🔈 (Low)
     - `34% - 66%` -> 🔉 (Medium)
     - `67% - 100%` -> 🔊 (High)
   - स्नैप पॉइंट्स (0%, 50%, 100%) पर `playHapticFeedback('click', 120, 0.03)` ट्रिगर करें।
   - कीबोर्ड एक्सेसिबिलिटी (`ArrowLeft/Right`, `ArrowUp/Down`, `PageUp/Down`, `Home`, `End`) लागू करें और `e.preventDefault()` सुनिश्चित करें।

### 4.2 System D: SVG Donut Dynamic Center HUD Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - `.donut-slice` पर `transition: stroke-width 0.25s, opacity 0.2s, filter 0.25s` लागू करें।
   - `.donut-slice:hover` पर `stroke-width: 34px !important` और नियॉन ड्रॉप-शैडो जोड़ें।
   - सिबलिंग स्लाइस डिमिंग जोड़ें: `.dashboard-donut-svg:has(.donut-slice:hover) .donut-slice:not(:hover) { opacity: 0.35; }`।
   - `.donut-center-info` बॉक्स स्टाइल करें: 130x130px, स्प्रिंग क्रॉस-फेड ट्रांज़िशन।
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `attachDonutChartDynamicCenterHUD(slicesData, totalFormattedTime)` लागू करें।
   - स्लाइस पर माउस एंटर होने पर केंद्र में डोमेन फेविकॉन (`https://www.google.com/s2/favicons?domain=...&sz=32`), डोमेन नाम, खर्च समय और प्रतिशत चिप (`32.4%`) इंजेक्ट करें (W3C Trusted Types, Safe DOM)।
   - स्लाइस से माउस हटने पर डिफ़ॉल्ट कुल समय को स्मूथली रिस्टोर करें।

---

## 🚫 5. वास्तुकला प्रतिबंध व सीमाएँ (Architectural Constraints & Boundaries)

- **आउट-ऑफ-स्कोप:** स्टिकी मिनी-डॉक (System B) या बेंटो ड्रैग (System F) को इस फेज़ में न छुएं।
- **W3C Trusted Types:** कच्चा `innerHTML` स्ट्रिंग असाइनमेंट निषिद्ध है; केवल `document.createElement`, `textContent`, और `setAttribute` का उपयोग करें।
- **UTF-8 with BOM:** सभी संशोधित फ़ाइलों को यूनिकोड BOM के साथ सहेजा जाए।
- **म्यूट बटन इनवेरिएंट:** `#heroVolumeIcon` क्लिक पर म्यूट/अनम्यूट कार्यक्षमता 100% संरक्षित रहनी चाहिए।

---

## 📦 6. डिलीवरेबल्स मैनिफेस्ट (Deliverables Manifest)

1. संशोधित: `dashboard/dashboard.css` (System A व D स्टाइल्स)
2. संशोधित: `dashboard/dashboard.js` (System A व D लॉजिक)
3. नया टेस्ट सुइट: `tests/test_dashboard_future_phase1_visual_parity.js`
4. अद्यतन: `temp_prompt/dashboard_future_uiux/INDEX.md` (फेज़ 1 स्थिति अपडेट)

---

## 🧪 7. स्थानीय सत्यापन टेस्ट गेट (Local Verification Gate)

```powershell
node tests/test_dashboard_future_phase1_visual_parity.js
```
*परीक्षण में वॉल्यूम कैप्सूल स्टाइल, थंब स्केलिंग, आइकन मोर्फिंग, डोनट स्ट्रोक डाइलेशन, और सेंटर HUD रेंडरिंग का 100% पास होना अनिवार्य है।*
