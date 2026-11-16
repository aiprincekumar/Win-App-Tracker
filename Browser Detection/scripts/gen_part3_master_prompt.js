// scripts/gen_part3_master_prompt.js
const { writeBomFile } = require('./build_uiux_prompts');

const masterPromptContent = `# Web Activity & Media Sentinel - Dashboard UI/UX Restoration & Refinement Master Specification Prompt
# डैशबोर्ड यूआई/यूएक्स पुनर्स्थापना एवं सौंदर्य संवर्धन: मास्टर इंजीनियरिंग प्रॉम्प्ट

> **दस्तावेज़ प्रकार (Document Type):** Master UI/UX Engineering Specification & Restoration Prompt  
> **लक्ष्य सिस्टम (Target System):** Web Activity & Media Sentinel (Chrome MV3 Dashboard)  
> **कार्यक्षेत्र (Workspace):** [\`c:\\Users\\Atul Verma\\Desktop\\Win App Tracker\\Browser Detection\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **संस्करण (Version):** 3.0.0 (Aesthetic Restoration & Symmetrical Harmony)  
> **फ़ाइल आउटपुट (Output File):** [\`dashboard_ui_ux_restoration_prompt.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **अस्थायी प्रॉम्प्ट डायरेक्टरी (Ephemeral Directory):** [\`temp_prompt/dashboard_ui_ux_restoration/\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/dashboard_ui_ux_restoration/)  
> **सक्रिय मेमोरी संदर्भ (Active Memory Anchor):** [\`project_ui_ux_restoration_memory.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_ui_ux_restoration_memory.md) एवं [\`project_feature_memory.md\`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md)  
> **अग्रणी यूआई/यूएक्स वास्तुकार (Lead UI/UX Architect):** Atul Verma (\`aiprincekumar\` / \`aiprincekumar010100@gmail.com\`)  
> **कार्यान्वयन निर्देश (Execution Directive):** "तुम्हें अभी सिर्फ प्रॉम्प्ट फाइल ही बनाना है ठीक करने के लिए, अभी ठीक नहीं करना है।" — यह दस्तावेज़ आगामी कार्यान्वयन सत्र के लिए संपूर्ण ब्लूप्रिंट और चरणबद्ध विनिर्देश प्रदान करता है।

---

## 🇮🇳 कार्यकारी सारांश व सौंदर्य विज़न (Executive Summary & Aesthetic Vision)

वेब एक्टिविटी व मीडिया सेंटिनल डैशबोर्ड में फेज़ 1 से 4 के दौरान 8 शक्तिशाली फीचर्स (टेम्पोरल हीटमैप, प्रोडक्टिविटी क्लासिफायर, मल्टी-टैब मीडिया डेक, ऑडियो विजुअलाइज़र, बैकअप/रिस्टोर, एग्जीक्यूटिव डाइजेस्ट, डोमेन नोट्स व पोमोडोरो फोकस सेंटिनल) सफलतापूर्वक जोड़े गए। कार्यक्षमता (Functionality) 100% सटीक और 44 टेस्ट सुइट्स में उत्तीर्ण है, परंतु तीव्र कार्यान्वयन के दौरान मूल **iOS 26 Liquid Glass & Bento Grid** लेआउट (कमिट \`ef7d720\`) का संतुलन बिगड़ गया:
1. 12-कॉलम बेंटो ग्रिड में 5वां मेट्रिक कार्ड अकेले अगली पंक्ति में टूट रहा है।
2. साइडबार में बड़ा पोमोडोरो विजेट ठूंसने से अनचाहा वर्टिकल स्क्रॉलबार आ गया है।
3. टॉप बार में पीडीएफ व रिपोर्ट बटनों की भीड़ से नेवबार रैप हो रहा है।
4. 168-सेल हीटमैप अत्यधिक लंबवत स्थान घेरकर डोमेन टेबल को नीचे धकेल रहा है।
5. डोमेन टेबल की हर पंक्ति में क्रूड नेटिव \`<select>\` और खुले बटनों से पंक्तियों की ऊंचाई विकृत हो गई है।
6. मीडिया पेन में मल्टी-टैब डेक और विजुअलाइज़र कैनवस का फैलाव हीरो प्लेयर को दबा रहा है।
7. सेटिंग्स फॉर्म्स में असंगत बटन और इनपुट शैलियाँ आ गई हैं।
8. 1466 लाइनों का सीएसएस कोड \`dashboard.css\` में बिना मॉड्यूल के भर गया है।

**यह मास्टर प्रॉम्प्ट इन सभी 8 कमियों को बिना किसी भी फीचर को हटाए या कार्यक्षमता को नुकसान पहुंचाए, एक निर्बाध, सुरुचिपूर्ण, और सम्मितीय (symmetrical) रूप में पुनर्स्थापित करने का पूर्ण खाका प्रस्तुत करता है।**

---

## 🏛️ 1. आर्किटेक्चरल डिज़ाइन संविधान (Architectural Design Constitution)

\`\`\`mermaid
flowchart TD
    subgraph CorePillars["The 5 Aesthetic Core Pillars"]
        P1["1. Symmetrical Bento Grid (12-Col System + 5-Col Subgrid)"]
        P2["2. iOS 26 Liquid Glass 2.0 (24px Blur + 190% Sat + Specular Border)"]
        P3["3. Compact Ergonomic Surfaces (Popovers over Inline Bloat)"]
        P4["4. Zero Vertical Overflow in Sidebar (Fixed Micro-Cards)"]
        P5["5. Modular CSS Tree (Zero-Duplicate Domain Sheets)"]
    end

    CorePillars --> Constitution["Restored Symmetrical Sentinel Dashboard"]
\`\`\`

1. **सम्पूर्ण ग्रिड सम्मिति (Symmetrical Grid Harmony):** कोई भी मेट्रिक कार्ड अकेला या विषम नहीं दिखेगा। 5 मेट्रिक्स एक समर्पित 5-कॉलम सबग्रिड रो में समान चौड़ाई और ऊंचाई के साथ एक ही पंक्ति में रहेंगे।
2. **इनलाइन कचरे का उन्मूलन (Popovers over Inline Clutter):** टेबल पंक्तियों के अंदर भारी \`<select>\` ड्रॉपडाउन के स्थान पर सुरुचिपूर्ण क्लिक-टू-ओपन ग्लासमोर्फिज्म पिल्स और पॉपओवर्स का उपयोग होगा।
3. **साइडबार स्वच्छता (Sidebar Purity):** साइडबार केवल मुख्य नेविगेशन और सूक्ष्म सिस्टम स्थिति (HUD) के लिए आरक्षित रहेगा। पोमोडोरो जैसे टूल्स टॉप बार या समर्पित मॉडल में निवास करेंगे।
4. **एकीकृत निर्यात केंद्र (Consolidated Export Hub):** शीर्ष बार में बिखरने वाले निर्यात बटनों को एक सुरुचिपूर्ण \`[📥 Export ▾]\` ड्रॉपडाउन में समेटा जाएगा।
5. **सीएसएस मॉड्यूलरिटी (Clean CSS Modularity):** सभी शैलियों को \`dashboard/styles/\` के तहत विषयवार विभाजित किया जाएगा ताकि मास्टर सीएसएस फाइल स्वच्छ और समझने योग्य रहे।

---

## 📐 2. आठों सब-सिस्टम्स का विस्तृत पुनर्स्थापना ब्लूप्रिंट (Detailed Restoration Blueprints)

### सब-सिस्टम 1: बेंटो ग्रिड 5-कॉलम सबग्रिड मेट्रिक्स रो (Bento Grid 5-Metric Subgrid)
- **समस्या:** 12-कॉलम ग्रिड में 5 कार्ड्स को \`bento-span-3\` देने पर $4 \\times 3 = 12$ कॉलम भर जाते हैं और 5वां कार्ड अकेले 3 कॉलम लेकर 9 कॉलम खाली छोड़ देता है।
- **समाधान:** एक पूर्ण-चौड़ाई कंटेनर \`.metrics-bento-row.bento-span-12\` बनाएं और उसमें CSS सबग्रिड लागू करें:
\`\`\`html
<div class="metrics-bento-row bento-span-12" role="region" aria-label="Key Performance Indicators">
  <div class="metric-card liquid-glass-card">...Today...</div>
  <div class="metric-card liquid-glass-card">...Total...</div>
  <div class="metric-card liquid-glass-card">...Domains...</div>
  <div class="metric-card liquid-glass-card">...Media...</div>
  <div id="metricProductivityScore" class="metric-card liquid-glass-card">...Productivity Index...</div>
</div>
\`\`\`
\`\`\`css
.metrics-bento-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}
@media (max-width: 1280px) { .metrics-bento-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px)  { .metrics-bento-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .metrics-bento-row { grid-template-columns: 1fr; } }
\`\`\`

---

### सब-सिस्टम 2: टॉप ऐप बार कंसोलिडेटेड एक्सपोर्ट हब (Consolidated Export Dropdown Hub)
- **समस्या:** \`#btnPrintPdf\` और \`#btnDownloadHtmlDigest\` शीर्ष पट्टी में भीड़ पैदा कर रहे हैं और 1366px स्क्रीन पर बटनों को दूसरी पंक्ति में रैप कर देते हैं।
- **समाधान:** सभी निर्यात बटनों को एक ड्रॉपडाउन ट्रिगर \`#btnExportMenu\` में समेटें:
\`\`\`html
<div class="export-dropdown-container">
  <button type="button" id="btnExportMenu" class="btn-action-outline btn-export-trigger" aria-haspopup="true" aria-expanded="false" title="Export & Reports">
    <span class="action-btn-icon">📥</span>
    <span id="btnExportMenuText">Export</span>
    <span class="dropdown-chevron">▾</span>
  </button>
  <div id="exportDropdownMenu" class="export-dropdown-menu liquid-glass-card hidden" role="menu">
    <button type="button" id="btnPrintPdf" class="export-menu-item" role="menuitem">🖨️ Save PDF Executive Digest</button>
    <button type="button" id="btnDownloadHtmlDigest" class="export-menu-item" role="menuitem">📄 Offline HTML Report</button>
    <div class="dropdown-divider"></div>
    <button type="button" id="btnExportTimeCsv" class="export-menu-item" role="menuitem">📊 Export Time Data (CSV)</button>
    <button type="button" id="btnExportMediaCsv" class="export-menu-item" role="menuitem">🎬 Export Media History (CSV)</button>
  </div>
</div>
\`\`\`

---

### सब-सिस्टम 3: साइडबार शुद्धिकरण व पोमोडोरो पिल (Sidebar De-Clutter & Top Bar Pomodoro Pill)
- **समस्या:** भारी \`#widgetPomodoroSentinel\` विजेट साइडबार में होने से 768px स्क्रीन पर स्क्रॉलबार आ जाता है।
- **समाधान:** साइडबार से पोमोडोरो विजेट को हटाएं। टॉप ऐप बार के दाएँ भाग में एक कॉम्पैक्ट इंटरैक्टिव पिल \`#pomodoroNavPill\` रखें। क्लिक करने पर एक सुंदर ग्लासमोर्फिज़्म पॉपओवर (\`#pomodoroPopoverModal\`) खुलेगा जिसमें स्टार्ट, पॉज़, रीसेट और समय प्रगति बार होगा।

---

### सब-सिस्टम 4: लीनियर-स्टाइल 168-सेल एक्टिविटी हीटमैप (Linear-Style Compact Heatmap)
- **समस्या:** 380px ऊंचा हीटमैप मुख्य डोमेन टेबल को स्क्रीन से बाहर धकेल देता है।
- **समाधान:** 
  1. सेल का आकार 16px x 16px करें।
  2. कुल ऊंचाई घटाकर <= 240px करें।
  3. 24 घंटों के स्थान पर केवल 6 प्रमुख मील के पत्थर (00:00, 04:00, 08:00, 12:00, 16:00, 20:00) दिखाएं।
  4. माउस होवर पर स्मूथ ग्लासमोर्फिज़्म फ्लोटिंग टूलटिप (\`heatmap-floating-tooltip\`) दिखाएं।

---

### सब-सिस्टम 5: डोमेन टेबल एर्गोनॉमिक्स व पॉपओवर पिल्स (Ergonomic Table & Popover Badge)
- **समस्या:** टेबल सेल के अंदर नेटिव \`<select>\` पंक्तियों की ऊंचाई को 58px+ कर देता है और पुराना लगता है।
- **समाधान:**
  1. \`<select>\` को हटाकर \`.badge-productivity\` पिल लगाएं।
  2. क्लिक करने पर हल्का 3-विकल्पी मेनू (Productive, Neutral, Distracting) खुलेगा।
  3. स्टार (⭐) और नोट्स (📝) को \`.cell-quick-actions\` में रखें जो माउस होवर पर या सक्रिय होने पर चमकेंगे।
  4. टेबल पंक्ति की ऊंचाई को बिल्कुल 42px पर स्थिर करें।

---

### सब-सिस्टम 6: मीडिया पैन टैब स्ट्रिप व एम्बिएंट विजुअलाइज़र (Media Tab Strip & Ambient Visualizer)
- **समस्या:** मल्टी-टैब कार्ड्स और ऑडियो विजुअलाइज़र का कैनवस अलग-अलग बक्सों में होने से मीडिया पैन अत्यधिक लंबा हो गया है।
- **समाधान:**
  1. मल्टी-टैब डेक को हीरो प्लेयर के ठीक ऊपर एक पतली हॉरिजॉन्टल चिप स्ट्रिप (\`.media-tab-strip\`) में बदलें।
  2. ऑडियो विजुअलाइज़र कैनवस (\`#canvasMediaAudioVisualizer\`) को हीरो प्लेयर कार्ड के बैकग्राउंड में एक एम्बिएंट लेयर के रूप में एम्बेड करें, जिसमें एक टॉगल बटन (\`[📊 Visualizer]\`) होगा।

---

### सब-सिस्टम 7: सेटिंग्स फॉर्म्स मानकीकरण (Settings Forms Standardization)
- **समस्या:** फेज़ 3 व 4 में जोड़े गए कार्ड्स (\`#settingCardBackupSync\`, \`#settingCardWellbeing\`) में असंगत सीएसएस क्लासेज थीं।
- **समाधान:** सभी कार्ड्स को डिज़ाइन सिस्टम के मानकों (\`.settings-section-card\`, \`.settings-form-row\`, \`.form-control-input\`, \`.btn-action-primary\`) के अनुसार एकरूप करें।

---

### सब-सिस्टम 8: सीएसएस मॉड्यूलरिटी व ब्लोट मुक्ति (CSS Modularity & Zero-Bloat Tree)
- **समस्या:** \`dashboard.css\` में 1466 लाइनें सीधे डाल दी गईं और 4 अलग फाइलें बिखर गईं।
- **समाधान:**
  - \`dashboard/styles/tokens.css\`
  - \`dashboard/styles/layout.css\`
  - \`dashboard/styles/metrics.css\`
  - \`dashboard/styles/tracking.css\`
  - \`dashboard/styles/media.css\`
  - \`dashboard/styles/settings.css\`
  - \`dashboard/styles/components.css\`
  - \`dashboard.css\` केवल \`@import\` नियमों के साथ मास्टर एग्रीगेटर के रूप में कार्य करेगा।

---

## 🚦 3. चरणबद्ध कार्यान्वयन रोडमैप (Phase Rollout Roadmap)

1. **फेज़ 1:** बेंटो ग्रिड 5-कॉलम सबग्रिड एवं टॉप बार एक्सपोर्ट ड्रॉपडाउन का एकीकरण।
2. **फेज़ 2:** साइडबार से पोमोडोरो विजेट को हटाना और टॉप बार पिल/पॉपओवर के रूप में पुनर्स्थापित करना।
3. **फेज़ 3:** 168-सेल हीटमैप को कॉम्पैक्ट लीनियर-स्टाइल में बदलना और डोमेन टेबल में पॉपओवर पिल्स लागू करना।
4. **फेज़ 4:** मीडिया टैब स्ट्रिप, एम्बिएंट विजुअलाइज़र कैनवस और सेटिंग्स फॉर्म्स का पूर्ण मानकीकरण व सीएसएस स्प्लिट।

---

## 🧪 4. शून्य-प्रतिगमन सत्यापन गेट (Zero-Regression Verification Gate)

कार्यान्वयन के पश्चात निम्नलिखित सत्यापन अनिवार्य हैं:
1. **सभी 44 टेस्ट सुइट्स:** \`node run_all_tests.js\` एग्जिट कोड 0 के साथ उत्तीर्ण होना चाहिए।
2. **सिंटैक्स शुद्धता:** \`node -c\` द्वारा जावास्क्रिप्ट में 0 सिंटैक्स त्रुटियां होनी चाहिए।
3. **यूटीएफ-8 बीओएम मानक:** सभी नई व संपादित फाइलों पर \`0xEF, 0xBB, 0xBF\` प्रीफिक्स होना चाहिए।
4. **सीक्रेट सुरक्षा:** \`gitleaks detect --redact\` में 0 सीक्रेट्स की पुष्टि होनी चाहिए।
`;

writeBomFile('dashboard_ui_ux_restoration_prompt.md', masterPromptContent);
