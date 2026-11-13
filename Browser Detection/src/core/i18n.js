/**
 * Web Activity & Media Sentinel - Core i18n Dictionary
 * Bilingual English and Hindi interface translations.
 * 
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  const DICTIONARY = {
    en: {
      appName: 'Web Activity & Media Sentinel',
      mediaTab: 'Media',
      audioTab: 'Audio Lab',
      toolsTab: 'Tools',
      studioTab: 'Studio',
      trackingTab: 'Tracking',
      domainsTab: 'Domains',
      noMediaActive: 'No active media detected on this tab',
      play: 'Play',
      pause: 'Pause',
      sleepTimer: 'Sleep Timer',
      quickSettings: 'Quick Settings',
      today: 'Today',
      dailyAvg: 'Daily Avg',
      total: 'Total',
      volumeBoost: 'Volume Boost',
      equalizer: '5-Band Equalizer'
    },
    hi: {
      appName: 'वेब एक्टिविटी और मीडिया प्रहरी',
      mediaTab: 'मीडिया',
      audioTab: 'ऑडियो लैब',
      toolsTab: 'टूल्स',
      studioTab: 'स्टूडियो',
      trackingTab: 'ट्रैकिंग',
      domainsTab: 'डोमेन',
      noMediaActive: 'इस टैब पर कोई सक्रिय मीडिया नहीं मिला',
      play: 'चलाएं',
      pause: 'रोकें',
      sleepTimer: 'स्लीप टाइमर',
      quickSettings: 'त्वरित सेटिंग्स',
      today: 'आज',
      dailyAvg: 'दैनिक औसत',
      total: 'कुल',
      volumeBoost: 'वॉल्यूम बूस्ट',
      equalizer: '5-बैंड इक्वलाइज़र'
    }
  };

  function translate(key, lang = 'en') {
    const l = DICTIONARY[lang] || DICTIONARY.en;
    return l[key] || DICTIONARY.en[key] || key;
  }

  const I18n = Object.freeze({
    DICTIONARY,
    t: translate
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
  }
  global.I18n = I18n;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
