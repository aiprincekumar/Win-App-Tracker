# Phase 2: Kinetic Telemetry & Spatial Indicators (System C & System E)
# फेज़ 2: काइनेटिक टेलीमेट्री एवं स्थानिक इंडिकेटर्स विनिर्देश प्रॉम्प्ट

> **फेज़ आईडी (Phase ID):** `PHASE-DASHBOARD-FUTURE-UIUX-02`  
> **लक्षित भूमिका (Target Role):** Frontend Engineer (Dept 05: Frontend Engineering)  
> **सिस्टम्स (Covered Systems):**  
> - **System C:** Live Audio Visualizer Equalizer Pulse in Sidebar & Header  
> - **System E:** Omni Command Palette Domain Favicons & Keyboard Accelerator Badges  
> **मास्टर विनिर्देश स्रोत:** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md) (अनुभाग 3 एवं 5)  
> **सक्रिय ऑथराइजेशन टोकन:** `AUTH-MGR-20261116-DASHBOARD-FUTURE-UIUX`  
> **स्थानीय टेस्ट गेट:** `node tests/test_dashboard_future_phase2_kinetic_telemetry.js`  

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

साइडबार नेविगेशन और हेडर स्टेटस में 3-बार काइनेटिक ऑडियो विज़ुअलाइज़र पल्स जोड़ना जो बैकग्राउंड मीडिया प्लेबैक पर 60fps GPU स्प्रिंग एनीमेशन के साथ ऑसिलेट करे और पॉज़ पर शांत हो जाए, तथा `Ctrl+K` ओम्नी कमांड पैलेट में प्रत्येक डोमेन का 16px क्रिस्टल-क्लियर Google S2 फेविकॉन, सिमेंटिक `<kbd>` कीबोर्ड एक्सीलरेटर बैज, और रीसेंट सर्च हिस्ट्री चिप्स एकीकृत करना।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट्स (Prerequisites & Inputs)

- फेज़ 1 की पूर्णता (Visual Parity Certified)
- `dashboard/dashboard.css` (मौजूदा नेविगेशन व ओम्नी पैलेट स्टाइल्स)
- `dashboard/dashboard.js` (मौजूदा ओम्नी पैलेट लॉजिक, मीडिया प्लेबैक इवेंट्स)
- `dashboard/dashboard.html` (मौजूदा `#navTabMedia`, `#omniPaletteResults`)

---

## 🔍 3. तकनीकी संदर्भ एवं फ़ाइल एंकर्स (Technical Context & File Anchors)

- [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css): काइनेटिक इक्वलाइज़र एनीमेशन व ओम्नी परिणाम स्टाइलिंग।
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js): इक्वलाइज़र स्टेट स्विचिंग व ओम्नी रेंडरिंग।
- [`dashboard_future_uiux_recommendations.md#L712-L863`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L712-L863): System C का संपूर्ण CSS एवं JS विनिर्देश।
- [`dashboard_future_uiux_recommendations.md#L1052-L1252`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L1052-L1252): System E का संपूर्ण CSS एवं JS विनिर्देश।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### 4.1 System C: Live Audio Equalizer Pulse Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - `.kinetic-eq-visualizer` कंटेनर लागू करें (ऊँचाई: 16px, 3 लंबवत कैप्सूल बार्स)।
   - 3 बार्स (`.eq-bar`, `.eq-bar-1`, `.eq-bar-2`, `.eq-bar-3`) को वायलेट-इंडिगो ग्रेडिएंट और `transform-origin: bottom` दें।
   - `.eq-playing` क्लास पर 3 भिन्न हार्मोनिक एनीमेशन कीफ्रेम्स लागू करें:
     - बार 1: `eqBounce1 0.8s ease-in-out infinite alternate`
     - बार 2: `eqBounce2 1.15s ease-in-out infinite alternate 0.15s`
     - बार 3: `eqBounce3 0.65s ease-in-out infinite alternate 0.3s`
   - शून्य-CPU गारंटी: केवल `transform: scaleY(...)` और `will-change: transform` का उपयोग करें।
   - `.eq-paused` क्लास पर बार्स को `scaleY(0.18)` और `opacity: 0.3` में शांत अवस्था दें।
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `initSidebarAudioEqualizer()` लागू करें।
   - `#navTabMedia` और हेडर स्टेटस एरिया में `.kinetic-eq-visualizer` नोड इंजेक्ट करें।
   - `mediaPlaybackStatusChanged` इवेंट सुनकर प्लेबैक चालू होने पर `.eq-playing` तथा पॉज़/स्टॉप होने पर `.eq-paused` क्लास लगाएं।

### 4.2 System E: Omni Command Palette Rich UI Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - `.omni-palette-result-item` को फ्लैक्स लेआउट, 12px गैप और होवर ट्रांसलेशन दें।
   - `.omni-item-favicon` (18x18px) और `.omni-item-avatar-fallback` (ग्रेडिएंट इनिशियल बैज) स्टाइल करें।
   - `.omni-kbd` सिमेंटिक बैज स्टाइल करें: गहरा डार्क बैकग्राउंड, 1px बॉर्डर, और सब्टल 3D शैडो।
   - `.omni-recent-chips-container` और `.omni-chip` पिल्स स्टाइल करें।
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `renderOmniPaletteEnhancedResults(items, container)` लागू करें।
   - डोमेन होने पर `https://www.google.com/s2/favicons?domain=...&sz=32` से इमेज बनाएं; `onerror` पर `createFallbackAvatar(name)` लगाएं।
   - सिमेंटिक `<kbd>` बैज जोड़ें।
   - इनपुट खाली रहने पर `chrome.storage.local['recentOmniSearches']` से हालिया खोज चिप्स लोड करें और क्लिक पर खोज दोहराएं।

---

## 🚫 5. वास्तुकला प्रतिबंध व सीमाएँ (Architectural Constraints & Boundaries)

- **आउट-ऑफ-स्कोप:** स्टिकी मिनी-डॉक (System B) या बेंटो ग्रिड ड्रैग (System F) को इस फेज़ में न छुएं।
- **शून्य-CPU ओवरहेड:** इक्वलाइज़र में `setInterval` या `requestAnimationFrame` के बजाय शुद्ध CSS कीफ्रेम एनीमेशन का उपयोग अनिवार्य है।
- **W3C Trusted Types:** इमेज और टेक्स्ट नोड्स `document.createElement` द्वारा ही निर्मित हों।

---

## 📦 6. डिलीवरेबल्स मैनिफेस्ट (Deliverables Manifest)

1. संशोधित: `dashboard/dashboard.css` (System C व E स्टाइल्स)
2. संशोधित: `dashboard/dashboard.js` (System C व E लॉजिक)
3. नया टेस्ट सुइट: `tests/test_dashboard_future_phase2_kinetic_telemetry.js`
4. अद्यतन: `temp_prompt/dashboard_future_uiux/INDEX.md` (फेज़ 2 स्थिति अपडेट)

---

## 🧪 7. स्थानीय सत्यापन टेस्ट गेट (Local Verification Gate)

```powershell
node tests/test_dashboard_future_phase2_kinetic_telemetry.js
```
*परीक्षण में 3-बार इक्वलाइज़र कीफ्रेम्स, प्लेइंग/पॉज़्ड स्टेट स्विचिंग, ओम्नी फेविकॉन रेंडरिंग, और `<kbd>` बैज का 100% पास होना अनिवार्य है।*
