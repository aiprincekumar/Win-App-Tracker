# Phase 3: Sticky Viewport Sentinel & Floating Mini-Dock (System B)
# फेज़ 3: स्टिकी व्यूपोर्ट सेंटिनल एवं फ्लोटिंग मिनी-डॉक विनिर्देश प्रॉम्प्ट

> **फेज़ आईडी (Phase ID):** `PHASE-DASHBOARD-FUTURE-UIUX-03`  
> **लक्षित भूमिका (Target Role):** Frontend State Architect (Dept 05: Frontend Engineering)  
> **सिस्टम्स (Covered Systems):**  
> - **System B:** Sticky PiP Mini-Player Dock & Viewport Sentinel  
> **मास्टर विनिर्देश स्रोत:** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md) (अनुभाग 2)  
> **सक्रिय ऑथराइजेशन टोकन:** `AUTH-MGR-20261116-DASHBOARD-FUTURE-UIUX`  
> **स्थानीय टेस्ट गेट:** `node tests/test_dashboard_future_phase3_sticky_dock.js`  

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

जब उपयोगकर्ता डैशबोर्ड में डोमेन एनालिटिक्स तालिका या विस्तृत लॉग्स देखने के लिए नीचे स्क्रॉल करे और शीर्ष पर स्थित हीरो मीडिया प्लेयर कार्ड (`#heroMediaPlayerCard`) व्यूपोर्ट से बाहर हो जाए, तो आधुनिक `IntersectionObserver` आधारित व्यूपोर्ट सेंटिनल द्वारा बॉटम-राइट में एक 360x72px का फ्रॉस्टेड लिक्विड ग्लास मिनी-प्लेयर डॉक (`#stickyMiniPlayerDock`) स्मूथली स्लाइड-इन करना। यह मिनी-डॉक बिना किसी लेआउट शिफ्ट (CLS = 0) के लाइव मीडिया टेलीमेट्री, प्ले/पॉज़, नेटिव PiP और 1-क्लिक स्मूथ स्क्रोल-टू-टॉप प्रदान करेगा।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट्स (Prerequisites & Inputs)

- फेज़ 1 व 2 की पूर्णता
- `dashboard/dashboard.html` (`#heroMediaPlayerCard`, बॉडी कंटेनर)
- `dashboard/dashboard.css` (ग्लास टोकन्स, फिक्स्ड डॉक स्टाइल्स)
- `dashboard/dashboard.js` (हीरो मीडिया स्टेट, टाइमर व प्रोग्रेस अपडेटर्स)

---

## 🔍 3. तकनीकी संदर्भ एवं फ़ाइल एंकर्स (Technical Context & File Anchors)

- [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css): फ्लोटिंग मिनी-डॉक एनीमेशन, ग्लास सामग्री, और बटन स्टाइल्स।
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js): `IntersectionObserver`, टेलीमेट्री सिंक्रोनाइज़ेशन, और इवेंट बाइंडिंग्स।
- [`dashboard_future_uiux_recommendations.md#L400-L709`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L400-L709): System B का संपूर्ण CSS एवं JS विनिर्देश।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### 4.1 System B: Viewport Sentinel & Floating Mini-Dock Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - `.sticky-mini-player-dock` स्टाइल लागू करें:
     - स्थिति: `position: fixed; bottom: 24px; right: 28px; width: 360px; height: 72px; z-index: 9999;`
     - सामग्री: `background: rgba(15, 23, 42, 0.82); backdrop-filter: blur(28px) saturate(200%); border-radius: 20px;`
     - 3D शैडो: `0 16px 36px -6px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25)`
     - डिफ़ॉल्ट स्थिति: `transform: translateY(120%) scale(0.92); opacity: 0; pointer-events: none;`
   - `.sticky-mini-player-dock.dock-visible` स्टाइल:
     - `transform: translateY(0) scale(1); opacity: 1; pointer-events: auto;`
     - ट्रांज़िशन: `transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease`
   - स्लिम टॉप प्रोग्रेस बार (`.dock-top-progress`, `.dock-top-progress-fill`) लागू करें।
   - अवतार बॉक्स (`.dock-avatar-box`), मार्की टाइटल रैपर (`.dock-marquee-wrapper`), और टाइमस्टैम्प (`.dock-meta-sub`) स्टाइल करें।
   - एक्शन बटन्स ग्रुप (`.dock-actions-group`, `.dock-btn`, `.dock-btn-primary`) स्टाइल करें।
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `initStickyViewportSentinel()` लागू करें।
   - DOM में यदि `#stickyMiniPlayerDock` उपस्थित न हो, तो उसे गतिशील और सुरक्षित रूप से निर्मित करें (W3C Trusted Types)।
   - एक्शन बटन्स पर तेज़ बाइंडिंग्स जोड़ें:
     - `#btnDockPlayPause` -> `#btnHeroPlayPause` के क्लिक को ट्रिगर करे।
     - `#btnDockPip` -> `#btnHeroPip` के क्लिक को ट्रिगर करे।
     - `#btnDockScrollTop` -> `heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' })` ट्रिगर करे।
   - `IntersectionObserver` कॉन्फ़िगर करें:
     - `root: null`, `threshold: [0.15]`
     - जब हीरो कार्ड व्यूपोर्ट से 85% बाहर हो और सक्रिय मीडिया बज रहा हो, तो `.dock-visible` क्लास लगाएं।
     - हीरो कार्ड के वापस आने पर या मीडिया न होने पर `.dock-visible` हटाएं।
   - टेलीमेट्री सिंक हुक: जब डॉक विज़िबल हो, तो हीरो प्लेयर के टाइटल, टाइमर और प्रोग्रेस पर्सेंटेज को मिनी-डॉक के कंट्रोल्स से रीयल-टाइम में सिंक रखें।

---

## 🚫 5. वास्तुकला प्रतिबंध व सीमाएँ (Architectural Constraints & Boundaries)

- **शून्य CLS इनवेरिएंट:** मिनी-डॉक केवल फिक्स्ड ओवरले लेयर में रहेगा; मुख्य पृष्ठ की किसी भी ग्रिड या कार्ड को धकेलना या हिलाना पूर्णतः वर्जित है।
- **स्क्रोल लिसनर निषेध:** `window.addEventListener('scroll', ...)` पूर्णतः वर्जित है; केवल गैर-अवरोधक `IntersectionObserver` का उपयोग करें।
- **सिंक अखंडता:** मिनी-डॉक के बटन्स सीधे हीरो कार्ड के मौजूदा कार्यशील इवेंट हैंडलर्स को ट्रिगर करेंगे ताकि कोड का दोहराव न हो।

---

## 📦 6. डिलीवरेबल्स मैनिफेस्ट (Deliverables Manifest)

1. संशोधित: `dashboard/dashboard.css` (System B मिनी-डॉक स्टाइल्स)
2. संशोधित: `dashboard/dashboard.js` (System B सेंटिनल लॉजिक)
3. नया टेस्ट सुइट: `tests/test_dashboard_future_phase3_sticky_dock.js`
4. अद्यतन: `temp_prompt/dashboard_future_uiux/INDEX.md` (फेज़ 3 स्थिति अपडेट)

---

## 🧪 7. स्थानीय सत्यापन टेस्ट गेट (Local Verification Gate)

```powershell
node tests/test_dashboard_future_phase3_sticky_dock.js
```
*परीक्षण में मिनी-डॉक DOM संरचना, IntersectionObserver थ्रेशोल्ड, स्लाइड-इन एनीमेशन क्लासेज, और बटन प्रॉक्सी डिस्पैच का 100% पास होना अनिवार्य है।*
