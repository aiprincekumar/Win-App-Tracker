# Phase 2: Focus & Wellbeing 4th Tab Restoration Specification Prompt
# फेज़ 2: फोकस व वेलबीइंग चतुर्थ टैब पुनर्स्थापना इंजीनियरिंग प्रॉम्प्ट

> **फ़ाइल पाथ (Phase File):** [`temp_prompt/ui_ux_restoration_v4/phase_02_focus_wellbeing_4th_tab_restoration.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/ui_ux_restoration_v4/phase_02_focus_wellbeing_4th_tab_restoration.md)  
> **लक्षित कंपोनेंट (Target Component):** Sidebar 4th Tab (`#navTabWellbeing`), Stage Pane (`#paneWellbeing`), 4-Pillar Bento Grid & Live Micro-Widget HUD  
> **अग्रणी वास्तुकार (Author):** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **संस्करण (Version):** 4.0.0  
> **स्वीकृति स्थिति (Status):** READY_FOR_SUBAGENT_EXECUTION

---

## 🎯 1. फेज़ उद्देश्य (Phase Objective)

डैशबोर्ड के साइडबार में एक समर्पित चतुर्थ टैब `"🧘 Focus & Wellbeing"` (`#navTabWellbeing`) जोड़ना, मुख्य स्टेज पर 12-कॉलम बेंटो ग्रिड युक्त चतुर्थ पैनल (`#paneWellbeing`) स्थापित करना, और साइडबार/हेडर में एक सुरुचिपूर्ण कॉम्पैक्ट लाइव माइक्रो-विजेट HUD (`#wellbeingLiveMicroWidget`) प्रदान करना। पोमोडोरो हीरो कार्ड (`#widgetPomodoroSentinel`), डोमेन दैनिक बजट (`#cardDomainBudgets`), और प्राइवेसी ब्लैकलिस्ट (`#cardTrackingBlacklist`) को इस केंद्रीय चतुर्थ टैब में एकीकृत करना, साथ ही `switchTab('wellbeing')` और द्विभाषी शब्दकोश का शत-प्रतिशत विस्तार करना।

---

## 📋 2. पूर्वापेक्षाएँ एवं इनपुट (Prerequisites & Inputs)

- **सक्रिय रिपॉजिटरी:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)
- **लक्ष्य फ़ाइलें:**
  - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) (साइडबार नेविगेशन व चतुर्थ सेक्शन मार्कअप)
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) (`switchTab`, i18n शब्दकोश, इवेंट लिसनर्स)
  - [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css) (चतुर्थ टैब व बेंटो ग्रिड लेआउट)
  - [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css) (वेलबीइंग बेंटो कार्ड्स)
- **पूर्व-सत्यापन स्थिति:** Phase 1 पूर्ण एवं 44/44 टेस्ट सुइट्स उत्तीर्ण।

---

## 🔍 3. तकनीकी संदर्भ एवं महत्वपूर्ण एंकर (Technical Context & Critical Anchors)

- **`dashboard.html` Lines 24-43:** साइडबार नेविगेशन (`.sidebar-nav`)।
- **`dashboard.html` Lines 980-990:** सेटिंग्स सेक्शन (`#paneSettings`) के ठीक पूर्व चतुर्थ सेक्शन (`#paneWellbeing`) का स्थान।
- **महत्वपूर्ण आईडी संरक्षण (Critical Test Anchor IDs):**
  `tests/test_dashboard_features_phase4.js` द्वारा जाँची जाने वाली निम्नलिखित आईडी अनिवार्य रूप से डोम में विद्यमान रहनी चाहिए:
  - `#widgetPomodoroSentinel`
  - `#cardDomainBudgets`
  - `#cardTrackingBlacklist`
  - `#modalDomainNote`
  - `#navTabTracking`, `#navTabMedia`, `#navTabSettings`, `#paneTracking`, `#paneMedia`, `#paneSettings`

---

## 🛠️ 4. चरणबद्ध सर्जिकल निर्देश (Surgical Step-by-Step Instructions)

### कदम 2.1: `dashboard.html` में 4वां साइडबार टैब जोड़ना
`.sidebar-nav` के भीतर `#navTabMedia` के बाद और `#navTabSettings` के पहले चतुर्थ बटन जोड़ें:
```html
<button id="navTabWellbeing" class="nav-item" data-tab="wellbeing" role="tab" aria-selected="false" aria-controls="paneWellbeing">
  <span class="nav-icon">🧘</span>
  <span id="navWellbeingText" class="nav-text">Focus & Wellbeing</span>
</button>
```

### कदम 2.2: साइडबार में लाइव माइक्रो-विजेट HUD जोड़ना
साइडबार के डेटा हब कार्ड के ऊपर या नीचे एक स्लीक माइक्रो-विजेट स्थापित करें:
```html
<div id="wellbeingLiveMicroWidget" class="sidebar-hud-card wellbeing-micro-hud" title="Focus Sentinel State">
  <div class="hud-card-header">
    <span class="hud-card-title">🧘 Focus Sentinel</span>
    <span id="wellbeingMicroStatusDot" class="hud-dot idle"></span>
  </div>
  <div class="hud-card-body">
    <span id="wellbeingMicroClock" class="hud-status-text">25:00</span>
    <span id="wellbeingMicroMode" class="hud-address">Focus Idle</span>
  </div>
</div>
```

### कदम 2.3: `dashboard.html` में चतुर्थ स्टेज सेक्शन `#paneWellbeing` स्थापित करना
`#paneMedia` के बाद और `#paneSettings` से पहले:
```html
<section id="paneWellbeing" class="tab-pane" role="tabpanel" aria-labelledby="navTabWellbeing">
  <div class="bento-grid">
    <!-- Pillar 1: Hero Pomodoro Sentinel State Machine Card (Preserves id="widgetPomodoroSentinel") -->
    <div id="widgetPomodoroSentinel" class="bento-card liquid-glass-card bento-span-6 pomodoro-hero-card">
      <div class="card-header-row">
        <div class="card-title-group">
          <span class="card-icon">🧘</span>
          <h3 id="txtPomodoroTitle" class="card-heading">Focus Sentinel & Pomodoro</h3>
        </div>
        <span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>
      </div>
      <div class="pomodoro-hero-body">
        <div id="pomodoroTimeDisplay" class="pomodoro-hero-clock">25:00</div>
        <div class="pomodoro-progress-track">
          <div id="pomodoroProgressBar" class="pomodoro-progress-fill" style="width: 100%;"></div>
        </div>
        <div class="pomodoro-hero-actions">
          <button type="button" id="btnStartPomodoro" class="btn-pomodoro primary">▶️ Start Focus</button>
          <button type="button" id="btnPausePomodoro" class="btn-pomodoro">⏸️ Pause</button>
          <button type="button" id="btnResetPomodoro" class="btn-pomodoro">🔄 Reset</button>
        </div>
      </div>
    </div>

    <!-- Pillar 2: Domain Daily Time Budgets Card -->
    <div id="cardDomainBudgets" class="bento-card liquid-glass-card bento-span-6 settings-section-card">
      <div class="card-header-row">
        <div class="card-title-group">
          <span class="card-icon">⏱️</span>
          <h3 id="txtBudgetTitle" class="card-heading">Domain Daily Time Budgets</h3>
        </div>
      </div>
      <p id="txtBudgetDesc" class="card-subtext">Configure daily minute limits per domain with 80% warning and 100% cutoff badges</p>
      <div class="budget-input-row">
        <input type="text" id="inputBudgetDomain" class="styled-input" placeholder="Domain (e.g. twitter.com, youtube.com)">
        <input type="number" id="inputBudgetMinutes" class="styled-input" placeholder="Minutes" min="1" max="1440" value="30">
        <button type="button" id="btnAddBudget" class="btn-save-primary">Set Budget</button>
      </div>
      <div id="domainBudgetsList" class="domain-budgets-list"></div>
    </div>

    <!-- Pillar 3: Privacy Tracking Exclusion Blacklist Card -->
    <div id="cardTrackingBlacklist" class="bento-card liquid-glass-card bento-span-6 settings-section-card">
      <div class="card-header-row">
        <div class="card-title-group">
          <span class="card-icon">🛡️</span>
          <h3 id="txtBlacklistTitle" class="card-heading">Privacy Tracking Exclusion Blacklist</h3>
        </div>
      </div>
      <p id="txtBlacklistDesc" class="card-subtext">Domains matching these patterns will never be recorded in history</p>
      <div class="blacklist-input-row">
        <input type="text" id="inputBlacklistPattern" class="styled-input" placeholder="e.g. localhost:*, 192.168.*:*, *bank.internal*">
        <button type="button" id="btnAddBlacklistPattern" class="btn-save-primary">Add Pattern</button>
      </div>
      <div id="blacklistChipsContainer" class="blacklist-chips-grid"></div>
      <hr class="blacklist-purge-divider">
      <div class="blacklist-purge-row">
        <button type="button" id="btnPurgeBlacklistedHistory" class="btn-danger-outline">🗑️ Retroactive History Purge</button>
        <span class="purge-hint">Permanently delete past telemetry for all active blacklist rules</span>
      </div>
    </div>

    <!-- Pillar 4: Starred & Pinned Domains Quick Access -->
    <div id="cardPinnedDomainsQuickview" class="bento-card liquid-glass-card bento-span-6">
      <div class="card-header-row">
        <div class="card-title-group">
          <span class="card-icon">⭐</span>
          <h3 id="txtStarredTitle" class="card-heading">Pinned Domains & Project Notes</h3>
        </div>
      </div>
      <p id="txtStarredDesc" class="card-subtext">Starred domains remain anchored at the top of your domain breakdown table</p>
      <div id="starredDomainsQuickList" class="starred-quick-list"></div>
    </div>
  </div>
</section>
```
*(नोट: यदि `#cardDomainBudgets` और `#cardTrackingBlacklist` पहले सेटिंग्स टैब में थे, तो उन्हें सेटिंग्स टैब से हटाकर इस नए `#paneWellbeing` में स्थानांतरित किया जाएगा ताकि डुप्लीकेट आईडी का निर्माण न हो।)*

### कदम 2.4: `dashboard/dashboard.js` में स्विचिंग एवं i18n तर्क का विस्तार
1. `switchTab` फलन में:
   ```javascript
   const panes = {
     tracking: document.getElementById('paneTracking'),
     media: document.getElementById('paneMedia'),
     wellbeing: document.getElementById('paneWellbeing'),
     settings: document.getElementById('paneSettings')
   };
   ```
   तथा हेडर टाइटल/सबटाइटल में:
   ```javascript
   } else if (tabKey === 'wellbeing') {
     titleEl.textContent = t('title_wellbeing');
     subEl.textContent = t('sub_wellbeing');
   }
   ```
2. नेविगेशन इवेंट लिसनर्स में:
   ```javascript
   const navTabWellbeing = document.getElementById('navTabWellbeing');
   if (navTabWellbeing) {
     navTabWellbeing.addEventListener('click', () => switchTab('wellbeing'));
   }
   ```
3. `DASHBOARD_I18N.en` और `DASHBOARD_I18N.hi` दोनों में 100% शुद्ध की-पैरिटी दर्ज करें:
   - `nav_wellbeing`: `'Focus & Wellbeing'` / `'फोकस व वेलबीइंग'`
   - `title_wellbeing`: `'🧘 Focus & Digital Wellbeing'` / `'🧘 फोकस व डिजिटल वेलबीइंग'`
   - `sub_wellbeing`: `'Pomodoro timer, daily domain limits, starred domains, and privacy exclusion rules'` / `'पोमोडोरो टाइमर, दैनिक डोमेन सीमाएं, पसंदीदा डोमेन व गोपनीयता नियम'`
   - `txt_starred_title`: `'Pinned Domains & Project Notes'` / `'पसंदीदा डोमेन व प्रोजेक्ट नोट्स'`
   - `txt_starred_desc`: `'Starred domains remain anchored at the top of your domain breakdown table'` / `'पिन किए गए डोमेन आपकी एनालिटिक्स टेबल के शीर्ष पर स्थिर रहते हैं'`

---

## 🚫 5. वास्तुकला प्रतिबंध एवं सीमाएं (Out-of-Scope Boundaries)

- **प्रतिबंध 1:** `#widgetPomodoroSentinel` आईडी को बदलना या हटाना सख्त वर्जित है, क्योंकि यह `test_dashboard_features_phase4.js` के लिए अनिवार्य एंकर है।
- **प्रतिबंध 2:** `wellbeing_blacklist_feature.js` के आंतरिक स्टेट लॉजिक (पोमोडोरो स्टेट मशीन, ऑडियो चाइम) को नहीं बदलना है; केवल यूआई लेआउट और टैब स्विचिंग को जोड़ना है।
- **प्रतिबंध 3:** W3C Trusted Types का 100% अनुपालन; 0 `innerHTML`।

---

## 📦 6. देय सामग्री सूची (Deliverables Manifest)

1. अद्यतन [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) (चतुर्थ टैब, बेंटो ग्रिड सेक्शन व माइक्रो-विजेट)
2. अद्यतन [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) (`switchTab`, लिसनर्स व i18n शब्दकोश)
3. अद्यतन [`dashboard/styles/layout.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/layout.css) व [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css)

---

## 🧪 7. स्थानीय सत्यापन गेट (Local Verification Gate)

```bash
# 1. Syntax check
node -c dashboard/dashboard.js

# 2. Verify bilingual i18n parity
node tests/test_dashboard_i18n_bilingual_parity.js

# 3. Verify Phase 4 Wellbeing Sentinel & Blacklist features
node tests/test_dashboard_features_phase4.js

# 4. Verify all 44 test suites pass cleanly
node run_all_tests.js
```
