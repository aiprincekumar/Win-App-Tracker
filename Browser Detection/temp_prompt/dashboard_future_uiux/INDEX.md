# Dashboard Future UI/UX Enhancements: Master Tracking Index & Problem-Solution Dossier
# डैशबोर्ड भविष्य यूआई/यूएक्स संवर्धन: मास्टर ट्रैकिंग इंडेक्स एवं समस्या-समाधान डॉसियर

> **दस्तावेज़ प्रकार (Document Type):** Master Tracking Board & Ephemeral Execution Dossier (Universal Rule 22)  
> **कार्यक्षेत्र (Target Workspace):** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **टास्क आईडी (Task ID):** `TASK-DASHBOARD-FUTURE-UIUX-001`  
> **सक्रिय ऑथराइजेशन टोकन (Active Auth Token):** Pending Manager Approval (`AUTH-MGR-20261116-DASHBOARD-FUTURE-UIUX`)  
> **प्रॉम्प्ट आर्किटेक्ट (Lead Architect):** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **मास्टर विनिर्देश डॉसियर (Master Specification Source):** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md)  
> **गवर्नेंस मानक (Governance Standard):** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **प्रॉम्प्ट फाइल्स मूल्यांकन (Prompt Files Assessment):** `PROMPT_FILES_REQUIRED = YES` (Certified Explicit Assessment)  
> **अनुशंसित निष्पादन रणनीति (Recommended Strategy):** `STRATEGY_A_AUTONOMOUS` (Target Autonomy Score: 1.0)  

---

## 📌 1. कार्यकारी समस्या-समाधान सारांश (Executive Problem-Solution Dossier)

### 1.1 वर्तमान यूआई/यूएक्स सीमाएँ व विसंगतियाँ (The Core Architectural Problems)
वेब एक्टिविटी व मीडिया सेंटिनल डैशबोर्ड के बेसलाइन 4 फेज़ / 8 सिस्टम 100% कार्यशील हैं, परंतु डिजिटल वर्कस्टेशन के आगामी उपयोगिता मानकों के आधार पर 6 प्रमुख यूआई/यूएक्स सुधार अवसर चिन्हित किए गए हैं:

1. **सिस्टम A (Hero Volume Slider Disparity):** वीडियो टाइमलाइन स्क्रबर में आधुनिक ग्रेडिएंट ट्रैक और प्रिसिजन सीक थंब मौजूद है, परंतु वॉल्यूम स्लाइडर सादा है, फ्लोटिंग पर्सेंटेज टूलटिप अनुपस्थित है, थंब संरेखण असंगत है, और म्यूट आइकन गतिशील मोर्फिंग (🔇/🔈/🔉/🔊) प्रदर्शित नहीं करता।
2. **सिस्टम B (Viewport Scrolling Disconnect):** जब यूजर टॉप 50 डोमेन तालिका या विस्तृत लॉग्स देखने के लिए नीचे स्क्रॉल करता है, तो हीरो मीडिया प्लेयर कार्ड व्यूपोर्ट से बाहर हो जाता है। बैकग्राउंड मीडिया के प्लेबैक स्टेटस की टेलीमेट्री खो जाती है और त्वरित नियंत्रण के लिए पूरे पेज को वापस स्क्रॉल करना पड़ता है।
3. **सिस्टम C (Static Audio Indicators):** साइडबार नेविगेशन में एक्टिव मीडिया की उपस्थिति केवल एक छोटे स्थिर हरे बिंदु द्वारा दर्शाई जाती है; इसमें कोई काइनेटिक 60fps इक्वलाइज़र पल्स नहीं है जो ऑडियो प्लेबैक की सक्रियता दर्शाए।
4. **सिस्टम D (Static SVG Donut Center Hole):** टाइम डिस्ट्रीब्यूशन कार्ड में SVG डोनट चार्ट का केंद्रीय भाग स्थैतिक कुल समय दिखाता है; जब यूजर विभिन्न रंगीन स्लाइसेस पर माउस ले जाता है, तो केंद्र में डोमेन का लोगो, नाम, और समय का गतिशील HUD रीडआउट प्रदर्शित नहीं होता।
5. **सिस्टम E (Text-Only Omni Palette Results):** `Ctrl+K` ओम्नी कमांड पैलेट में डोमेन परिणामों में कोई फ़ेविकॉन नहीं है, कीबोर्ड एक्सीलरेटर बैज (`<kbd>`) का अभाव है, और रीसेंट सर्च चिप्स मौजूद नहीं हैं।
6. **सिस्टम F (Fixed Bento Grid Order):** 12-कॉलम बेंटो ग्रिड लेआउट हार्डकोडेड क्रम में है; यूजर अपनी प्राथमिकता के अनुसार कार्ड्स को ड्रैग-एंड-ड्रॉप करके पुनर्व्यवस्थित नहीं कर सकता और न ही लेआउट प्रेफरेंस पर्सिस्ट होती है।

### 1.2 वास्तुकला समाधान (The Architectural Solution Suite)
- **Phase 1 (Visual Parity & Micro-Interactions):** System A (Hero Volume Slider) + System D (SVG Donut Dynamic Center HUD)।
- **Phase 2 (Kinetic Telemetry & Spatial Indicators):** System C (Live 3-Bar Audio Equalizer Pulse) + System E (Omni Command Palette Favicons & `<kbd>` Badges)।
- **Phase 3 (Sticky Viewport Sentinel & Floating Mini-Dock):** System B (`IntersectionObserver` Viewport Sentinel + Floating Frosted Glass Mini-Player Dock `#stickyMiniPlayerDock`)।
- **Phase 4 (Bento Modular Layout Engine):** System F (HTML5 Drag-and-Drop Reordering Engine + `chrome.storage.local['customBentoLayoutOrder']` Persistence + Reset Button)।
- **Phase 5 (Polish, WCAG AAA High-Contrast & Regression Audit):** 7:1 Contrast Validation, Dual-Ring Focus, Zero-CLS Audit, All 37+ Repository Test Suites Verification, and Gitleaks Audit.

---

## 🚦 2. फेज़ स्थिति चेकलिस्ट (Comprehensive Phase Status Checklist)

| Phase # | Phase Title (फेज़ शीर्षक) | Target Systems | Assigned Role | Gate Status | Local Test Suite | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **01** | Visual Parity & Micro-Interactions | System A (Volume Slider), System D (Donut HUD) | Frontend Engineer (Dept 05) | `PAUSED` | `tests/test_dashboard_future_phase1_visual_parity.js` | Pending |
| **02** | Kinetic Telemetry & Spatial Indicators | System C (Live Equalizer), System E (Omni Favicons) | Frontend Engineer (Dept 05) | `PAUSED` | `tests/test_dashboard_future_phase2_kinetic_telemetry.js` | Pending |
| **03** | Sticky Viewport Sentinel & Floating Dock | System B (Sticky PiP Mini-Player Dock) | Frontend State Architect (Dept 05) | `PAUSED` | `tests/test_dashboard_future_phase3_sticky_dock.js` | Pending |
| **04** | Bento Modular Layout Engine | System F (Drag-and-Drop Bento Grid) | Frontend Engineer (Dept 05) | `PAUSED` | `tests/test_dashboard_future_phase4_bento_drag_layout.js` | Pending |
| **05** | Comprehensive Polish, WCAG AAA & Full Regression | All Systems (A-F) + WCAG 2.1 AAA | QA Verification Tester (Dept 08) | `PAUSED` | All 37+ Test Suites (`npm test`) + Gitleaks | Pending |

---

## 📊 3. यूनिवर्सल 7-कॉलम डायग्नोस्टिक इम्पैक्ट मैट्रिक्स (Rule 20 Diagnostic Matrix)

| क्र.सं. | फ़ाइल (File) | मूल कारण (Root Cause) | प्रस्तावित समाधान (Proposed Fix) | समाधान उपरांत प्रभाव (Post-Fix Impact) | फेज़ # | टेस्ट गेट (Test Gate) |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.css`<br>`dashboard/dashboard.js`<br>`dashboard/dashboard.html` | वॉल्यूम स्लाइडर सादा है, थंब केंद्र में संरेखित नहीं है, और फ्लोटिंग प्रतिशत टूलटिप अनुपस्थित है। | सिंगल-ट्रैक कैप्सूल, कंसेंट्रिक ग्लास थंब (`.vol-thumb`), और फ्लोटिंग टूलटिप (`.vol-floating-tooltip`) जोड़ें। | वॉल्यूम स्क्रबर टाइमलाइन के समान आधुनिक विज़ुअल पैरिटी प्राप्त करेगा। | फेज़ 1 | `node tests/test_dashboard_future_phase1_visual_parity.js` |
| **2** | `dashboard/dashboard.js`<br>`dashboard/dashboard.html` | वॉल्यूम आइकन स्थिर है, स्तर (0%, 30%, 70%, 100%) के अनुसार मोर्फ नहीं होता। | `updateVolumeUI` में डायनेमिक आइकन स्टेट्स (🔇, 🔈, 🔉, 🔊) और टूलटिप टेक्स्ट सिंक्रोनाइज़ेशन जोड़ें। | वॉल्यूम स्तर के अनुसार सटीक और तुरंत विज़ुअल व हैप्टिक फीडबैक मिलेगा। | फेज़ 1 | `node tests/test_dashboard_future_phase1_visual_parity.js` |
| **3** | `dashboard/dashboard.js`<br>`dashboard/dashboard.css`<br>`dashboard/dashboard.html` | SVG डोनट चार्ट का केंद्र स्थैतिक है; स्लाइस होवर पर कोई डोमेन-विशिष्ट विवरण नहीं दिखता। | `attachDonutChartDynamicCenterHUD` फंक्शन लागू करें: होवर पर डोमेन फेविकॉन, समय, और प्रतिशत चिप का स्मूथ क्रॉस-फेड। | उपयोगकर्ता को पाई स्लाइस पर होवर करते ही केंद्र में क्रिस्टल-क्लियर टेलीमेट्री दिखेगी। | फेज़ 1 | `node tests/test_dashboard_future_phase1_visual_parity.js` |
| **4** | `dashboard/dashboard.css` | डोनट स्लाइस होवर पर स्ट्रोक फैलाव (dilation) और शेष स्लाइसेस की डिमिंग नहीं होती। | `.donut-slice:hover { stroke-width: 34px !important; }` और `.dashboard-donut-svg:has(...)` सिबलिंग डिमिंग जोड़ें। | एक्टिव स्लाइस तुरंत उभर कर दिखेगा और शेष स्लाइस सब्टल डिम हो जाएंगे। | फेज़ 1 | `node tests/test_dashboard_future_phase1_visual_parity.js` |
| **5** | `dashboard/dashboard.css`<br>`dashboard/dashboard.js` | साइडबार में मीडिया प्लेबैक केवल स्थिर हरे बिंदु द्वारा दर्शाया जाता है। | 3-बार काइनेटिक इक्वलाइज़र (`.kinetic-eq-visualizer`) जोड़ें जो प्लेबैक पर 60fps GPU बाउंस करे और पॉज़ पर शांत हो जाए। | साइडबार और हेडर में लाइव ऑडियो स्ट्रीमिंग का वास्तविक-समय विज़ुअल पल्स दिखेगा। | फेज़ 2 | `node tests/test_dashboard_future_phase2_kinetic_telemetry.js` |
| **6** | `dashboard/dashboard.js`<br>`dashboard/dashboard.css` | ओम्नी कमांड पैलेट परिणाम टेक्स्ट-ओनली हैं; डोमेन फेविकॉन और हॉटकी बैज अनुपस्थित हैं। | Google S2 फेविकॉन इन्जेशन, सिमेंटिक `<kbd>` एक्सीलरेटर बैज, और रीसेंट सर्च हिस्ट्री चिप्स कंटेनर जोड़ें। | `Ctrl+K` सर्च अत्यंत समृद्ध, तेज और विज़ुअली स्पष्ट अनुभव प्रदान करेगा। | फेज़ 2 | `node tests/test_dashboard_future_phase2_kinetic_telemetry.js` |
| **7** | `dashboard/dashboard.html`<br>`dashboard/dashboard.css`<br>`dashboard/dashboard.js` | पेज स्क्रॉल करने पर हीरो प्लेयर कार्ड व्यूपोर्ट से बाहर चला जाता है और टेलीमेट्री/कंट्रोल्स खो जाते हैं। | `IntersectionObserver` आधारित व्यूपोर्ट सेंटिनल और फ्लोटिंग फ्रॉस्टेड ग्लास मिनी-डॉक (`#stickyMiniPlayerDock`) लागू करें। | नीचे स्क्रॉल करने पर बॉटम-राइट मिनी प्लेयर अपने आप स्लाइड-इन होकर प्ले/पॉज़/PiP व स्क्रोल-टू-टॉप देगा। | फेज़ 3 | `node tests/test_dashboard_future_phase3_sticky_dock.js` |
| **8** | `dashboard/dashboard.js`<br>`dashboard/dashboard.css` | 12-कॉलम बेंटो ग्रिड कार्ड्स का क्रम निश्चित है; यूजर की पसंद के अनुसार कस्टमाइज़ेशन संभव नहीं है। | HTML5 ड्रैग-एंड-ड्रॉप हैंडल (`⠿`), स्मूथ रिऑर्डरिंग, और `chrome.storage.local['customBentoLayoutOrder']` सिंक जोड़ें। | यूजर कार्ड्स को अपनी इच्छानुसार व्यवस्थित कर सकेंगे और रीसेट बटन से डिफ़ॉल्ट लेआउट रिस्टोर होगा। | फेज़ 4 | `node tests/test_dashboard_future_phase4_bento_drag_layout.js` |
| **9** | `dashboard/dashboard.css`<br>`tests/` | नए कंपोनेंट्स (मिनी डॉक, टूलटिप्स, ड्रैग हैंडल्स) में डार्क/लाइट थीम व WCAG 2.1 AAA कंट्रास्ट विसंगतियाँ हो सकती हैं। | 7:1 कंट्रास्ट रेशियो, 2px नियॉन फोकस रिंग्स, शून्य CLS गारंटी, और सभी 37+ रिपॉजिटरी टेस्ट सुइट्स का पूर्ण सत्यापन। | 100% रिग्रेशन-मुक्त, एक्सेसिबल और रॉक-सॉलिड प्रोडक्शन रिलीज़ प्रमाणित होगी। | फेज़ 5 | `npm test` (सभी 37+ सुइट्स) |

---

## 🛡️ 4. वास्तुकला नियम व संवैधानिक सीमाएँ (Constitutional Boundaries)
1. **शून्य संचयी लेआउट शिफ्ट (Zero CLS Guarantee):** मिनी डॉक `position: fixed` रहेगा; किसी भी विजेट से मौजूदा पेज लेआउट 1px भी नहीं हिलेगा।
2. **60fps एनीमेशन बजट (GPU Transforms Only):** केवल `transform`, `opacity`, `filter` का प्रयोग; कोई लेआउट रीफ्लो नहीं।
3. **W3C Trusted Types व शून्य innerHTML (Zero-innerHTML Policy):** केवल `document.createElement`, `textContent`, और `setAttribute` द्वारा नोड्स का निर्माण।
4. **WCAG 2.1 AAA एक्सेसिबिलिटी (High-Contrast Standards):** सभी टेक्स्ट और बैकग्राउंड में 7:1 कंट्रास्ट, कीबोर्ड नेविगेशन (`ArrowKeys`, `Tab`, `Enter`, `Space`)।
5. **UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) एनकोडिंग मानक:** सभी फ़ाइलों को यूनिकोड BOM के साथ सहेजा जाए।
