# Phase 4: Bento Modular Layout Engine (System F)
# फेज़ 4: बेंटो मॉड्यूलर लेआउट इंजन विनिर्देश प्रॉम्प्ट

> **फेज़ आईडी (Phase ID):** `PHASE-DASHBOARD-FUTURE-UIUX-04`  
> **लक्षित भूमिका (Target Role):** Frontend Engineer (Dept 05: Frontend Engineering)  
> **सिस्टम्स (Covered Systems):**  
> - **System F:** Bento Grid Drag-and-Drop Customizable Layout Engine & Persistence  
> **मास्टर विनिर्देश स्रोत:** [`dashboard_future_uiux_recommendations.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md) (अनुभाग 6)  
> **सक्रिय ऑथराइजेशन टोकन:** `AUTH-MGR-20261116-DASHBOARD-FUTURE-UIUX`  
> **स्थानीय टेस्ट गेट:** `node tests/test_dashboard_future_phase4_bento_drag_layout.js`  

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

डैशबोर्ड के 12-कॉलम बेंटो ग्रिड को कस्टमाइज़ेबल ड्रैग-एंड-ड्रॉप इंजन में बदलना। प्रत्येक बेंटो कार्ड के ऊपरी-दाएँ कोने में सब्टल 6-डॉट ग्रिप हैंडल (`⠿`) जोड़ना, स्मूथ HTML5 ड्रैग रिऑर्डरिंग सक्षम करना, कार्ड्स के क्रम को `chrome.storage.local['customBentoLayoutOrder']` में सहेजना, और सेटिंग्स में 1-क्लिक लेआउट रीसेट बटन प्रदान करना जो मूल गोल्डन रेशियो डिफ़ॉल्ट लेआउट तुरंत बहाल करे।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट्स (Prerequisites & Inputs)

- फेज़ 1, 2, 3 की पूर्णता
- `dashboard/dashboard.html` (बेंटो ग्रिड कंटेनर्स `#tabContentTimeTracking`, `#tabContentMediaAnalytics`, बेंटो कार्ड्स)
- `dashboard/dashboard.css` (बेंटो ग्रिड स्पैन क्लासेज, कार्ड स्टाइल्स)
- `dashboard/dashboard.js` (टैब इनिशियलाइज़ेशन, सेटिंग्स मोडल)
- `chrome.storage.local` एपीआई

---

## 🔍 3. तकनीकी संदर्भ एवं फ़ाइल एंकर्स (Technical Context & File Anchors)

- [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css): ड्रैग हैंडल, ड्रैगिंग एक्टिव स्टेट, और ड्रॉप प्लेसहोल्डर स्टाइल्स।
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js): HTML5 ड्रैग इवेंट्स (`dragstart`, `dragover`, `dragend`), स्टोरेज सिंक और रीसेट।
- [`dashboard_future_uiux_recommendations.md#L1255-L1428`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_uiux_recommendations.md#L1255-L1428): System F का संपूर्ण CSS एवं JS विनिर्देश।

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### 4.1 System F: Bento Grid Drag & Drop Engine Implementation
1. **CSS Enhancement (`dashboard/dashboard.css`):**
   - `.bento-card` पर `position: relative` और ट्रांज़िशन्स (`transform 0.25s, box-shadow 0.25s, opacity 0.2s`) सुनिश्चित करें।
   - `.bento-drag-handle` स्टाइल लागू करें:
     - स्थिति: `position: absolute; top: 10px; right: 10px; width: 24px; height: 24px;`
     - कर्सर: `cursor: grab;`, ओपेसिटी: डिफ़ॉल्ट रूप से `0`, कार्ड होवर पर `opacity: 1`।
     - ट्रांज़िशन: `opacity 0.2s ease, background-color 0.15s ease`।
   - `.bento-card.is-dragging` स्टाइल:
     - `opacity: 0.45; transform: scale(0.98); border: 1px dashed rgba(99, 102, 241, 0.6) !important;`
   - `.bento-drop-placeholder` स्टाइल:
     - `background: rgba(99, 102, 241, 0.08); border: 2px dashed rgba(99, 102, 241, 0.45); border-radius: 20px; min-height: 120px;`
2. **JavaScript Implementation (`dashboard/dashboard.js`):**
   - `initBentoGridCustomizer(gridContainerId, storageKey)` लागू करें।
   - पेज लोड पर `chrome.storage.local` से `customBentoLayoutOrder` पढ़ें; यदि सहेजा गया क्रम उपलब्ध हो, तो कार्ड्स को सहेजे गए क्रम में कंटेनर में जोड़ें।
   - प्रत्येक `.bento-card` में गतिशील रूप से `.bento-drag-handle` इंजेक्ट करें (W3C Trusted Types Safe DOM)।
   - ड्रैग हैंडल पर माउस एंटर पर `card.setAttribute('draggable', 'true')` तथा माउस लीव पर `removeAttribute('draggable')` लगाएं ताकि कार्ड के आंतरिक फॉर्म्स व बटन्स बाधित न हों।
   - HTML5 ड्रैग इवेंट्स बाइंड करें:
     - `dragstart`: ड्रैग्ड कार्ड की आईडी `dataTransfer` में सेट करें और `.is-dragging` क्लास जोड़ें।
     - `dragover`: `e.preventDefault()`, माउस की ऊँचाई के आधार पर कार्ड को `card.before(draggedCard)` या `card.after(draggedCard)` करें।
     - `dragend`: `.is-dragging` हटाएं और `saveCurrentBentoLayout(container, storageKey)` कॉल करें।
   - `saveCurrentBentoLayout()` में वर्तमान कार्ड्स की आईडीज़ की सूची बनाकर `chrome.storage.local.set({ [storageKey]: orderIds })` करें।
   - सेटिंग्स में `#btnResetBentoLayout` बटन पर लिस्नर जोड़ें जो स्टोरेज से की हटाकर डिफ़ॉल्ट DOM क्रम को पुनर्स्थापित करे।

---

## 🚫 5. वास्तुकला प्रतिबंध व सीमाएँ (Architectural Constraints & Boundaries)

- **ड्रैग आइसोलेशन:** केवल ड्रैग हैंडल (`⠿`) पर क्लिक करने से ही ड्रैग सक्रिय होना चाहिए; कार्ड के अन्य भागों पर क्लिक करने से टेक्स्ट सिलेक्शन या बटन क्लिक्स बाधित नहीं होने चाहिए।
- **ग्रिड अखंडता:** कार्ड्स के रिस्पॉन्सिव स्पैन क्लासेज (`bento-span-12`, `bento-span-8`, `bento-span-4`) में कोई बदलाव नहीं होना चाहिए।
- **स्टोरेज सुरक्षा:** अवैध या डिलीट हो चुके कार्ड्स की आईडीज़ को लोड करते समय नजरअंदाज किया जाए (Graceful degradation)।

---

## 📦 6. डिलीवरेबल्स मैनिफेस्ट (Deliverables Manifest)

1. संशोधित: `dashboard/dashboard.css` (System F ड्रैग स्टाइल्स)
2. संशोधित: `dashboard/dashboard.js` (System F रिऑर्डरिंग एवं स्टोरेज लॉजिक)
3. नया टेस्ट सुइट: `tests/test_dashboard_future_phase4_bento_drag_layout.js`
4. अद्यतन: `temp_prompt/dashboard_future_uiux/INDEX.md` (फेज़ 4 स्थिति अपडेट)

---

## 🧪 7. स्थानीय सत्यापन टेस्ट गेट (Local Verification Gate)

```powershell
node tests/test_dashboard_future_phase4_bento_drag_layout.js
```
*परीक्षण में ड्रैग हैंडल इंजेक्शन, ड्रैग इवेंट बाइंडिंग्स, DOM नोड स्वैपिंग, और Chrome स्टोरेज पर्सिस्टेंस का 100% पास होना अनिवार्य है।*
