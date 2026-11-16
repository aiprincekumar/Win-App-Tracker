# Phase 3: Media Player Volume & Scrubber Alignment Specification Prompt
# फेज़ 3: मीडिया प्लेयर वॉल्यूम व स्क्रबर सममितीय संरेखण इंजीनियरिंग प्रॉम्प्ट

> **फ़ाइल पाथ (Phase File):** [`temp_prompt/ui_ux_restoration_v4/phase_03_media_player_volume_scrubber_alignment.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_restoration_v4/phase_03_media_player_volume_scrubber_alignment.md)  
> **लक्षित कंपोनेंट (Target Component):** Hero Media Player Sliders (`#heroProgressBar`, `#heroVolumeBar`, `.hero-volume-section`, `.hero-progress-section`)  
> **अग्रणी वास्तुकार (Author):** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **संस्करण (Version):** 4.0.0  
> **स्वीकृति स्थिति (Status):** READY_FOR_SUBAGENT_EXECUTION

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

हीरो मीडिया प्लेयर में वीडियो प्रोग्रेस स्क्रबर कंटेनर (`.hero-progress-section` / `.scrubber-wrapper`) और वॉल्यूम बार कंटेनर (`.hero-volume-section` / `.hero-volume-track`) के आकारों को सममितीय (symmetrical) रूप से संरेखित करना। `.hero-volume-track` पर लगी कृत्रिम सीमा (`max-width: 260px`) को हटाकर दोनों स्लाइडर्स को एकसमान पूर्ण-चौड़ाई ग्रिड/फ्लेक्स कंटेनर, 6px डिफ़ॉल्ट ऊँचाई, 8px स्मूथ होवर विस्तार, और सुसंगत फ्लोटिंग टूलटिप्स से सुसज्जित करना।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट (Prerequisites & Inputs)

- **सक्रिय रिपॉजिटरी:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)
- **लक्ष्य फ़ाइलें:**
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L644-L681) (स्क्रबर एवं वॉल्यूम मार्कअप)
  - [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L328-L475) (स्लाइडर एवं ट्रैक शैलियाँ)
  - [`dashboard/styles/themes.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/themes.css) (लाइट मोड थीम नियम)
- **पूर्व-सत्यापन स्थिति:** Phase 1 व 2 पूर्ण तथा 44/44 टेस्ट सुइट्स उत्तीर्ण।

---

## 🔍 3. तकनीकी संदर्भ एवं समस्या विश्लेषण (Technical Context & Root Cause)

- **मूल कारण (Root Cause):**
  `dashboard/styles/media.css` में `.hero-volume-track` पर `max-width: 260px` लागू था, जबकि स्क्रबर कंटेनर `width: 100%` चौड़ा था। इसके अतिरिक्त `.volume-info-group` बाईं ओर खुला पड़ा था, जिससे वॉल्यूम बार का ट्रैक स्क्रबर ट्रैक से छोटा और बाईं ओर खिसका हुआ दिखता था।
- **महत्वपूर्ण आईडी संरक्षण (Critical Test IDs):**
  `test_volume_timeline_fullscreen_controls.js` और `test_dashboard_uiux_phase1.js` निम्नलिखित आईडी का सख्त परीक्षण करते हैं:
  - `#heroProgressBar`, `#heroProgressFill`
  - `#heroVolumeBar`, `#heroVolumeFill`, `#heroVolumeIcon`, `#heroVolumeText`, `#lblHeroVolume`
  - `.vol-floating-tooltip`, `.scrubber-floating-tooltip`

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### कदम 3.1: `dashboard/styles/media.css` में वॉल्यूम ट्रैक का विस्तार
1. `.hero-volume-section` को लचीला और सममितीय बनाएं:
   ```css
   .hero-volume-section {
     display: flex;
     align-items: center;
     gap: 14px;
     width: 100%;
     padding-top: 8px;
     position: relative;
     user-select: none;
   }
   ```
2. `.hero-volume-track` से `max-width: 260px` हटाएं और स्क्रबर जैसी ज्यामिति लागू करें:
   ```css
   .hero-volume-track {
     flex: 1;
     width: 100%;
     max-width: none !important;
     position: relative;
     height: 6px;
     background: rgba(255, 255, 255, 0.12);
     border-radius: var(--radius-full, 9999px);
     cursor: pointer;
     box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
     transition: height 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 180ms ease;
     touch-action: none;
   }

   .hero-volume-track:hover,
   .hero-volume-track.dragging {
     height: 8px;
     background: rgba(255, 255, 255, 0.18);
   }

   .hero-volume-fill {
     height: 100%;
     background: linear-gradient(90deg, #8b5cf6, #06b6d4);
     border-radius: var(--radius-full, 9999px);
     position: relative;
     box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
   }
   ```
3. `.vol-thumb` को स्मूथ और सूक्ष्म बनाएं ताकि ड्रैग के दौरान यह स्क्रबर थंब के समान दिखे।
4. `.vol-floating-tooltip` के फ्लोटिंग ग्लासमोर्फिज्म लुक को `.scrubber-floating-tooltip` के समकक्ष संरेखित करें (24px ब्लर, स्पेक्युलर बॉर्डर)।

### कदम 3.2: `dashboard/styles/themes.css` में लाइट मोड ट्यूनिंग
लाइट मोड में वॉल्यूम ट्रैक और फिल के बैकग्राउंड को सुनिश्चित करें:
```css
body.theme-light .hero-volume-track {
  background: rgba(0, 0, 0, 0.10);
}
body.theme-light .hero-volume-track:hover {
  background: rgba(0, 0, 0, 0.14);
}
```

---

## 🚫 5. वास्तुकला प्रतिबंध एवं सीमाएं (Out-of-Scope Boundaries)

- **प्रतिबंध 1:** `#heroVolumeBar`, `#heroProgressBar`, `#heroVolumeFill`, `#heroProgressFill` आईडी को किसी भी स्थिति में न बदलें।
- **प्रतिबंध 2:** `dashboard.js` में वॉल्यूम ड्रैग इवेंट लॉजिक (`pointerdown`, `pointermove`, `pointerup`) और गणितीय अनुपात गणना में कोई बाधा न डालें।
- **प्रतिबंध 3:** W3C Trusted Types (0 `innerHTML`) का पूर्ण अनुपालन।

---

## 📦 6. देय सामग्री सूची (Deliverables Manifest)

1. अद्यतन [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css) (वॉल्यूम ट्रैक का पूर्ण-चौड़ाई सममितीय विस्तार)
2. अद्यतन [`dashboard/styles/themes.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/themes.css) (लाइट मोड संरेखण)
3. यदि आवश्यक हो, तो [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) में वॉल्यूम सेक्शन कंटेनर का सूक्ष्म अलाइनमेंट।

---

## 🧪 7. स्थानीय सत्यापन गेट (Local Verification Gate)

```bash
# 1. Verify volume & timeline scrubber tests
node tests/test_volume_timeline_fullscreen_controls.js
node tests/test_unified_timeline_scrubber.js

# 2. Verify all 44 test suites remain green
node run_all_tests.js
```
