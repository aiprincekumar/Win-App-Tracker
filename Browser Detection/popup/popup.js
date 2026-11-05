/**
 * Browser Detection / popup/popup.js
 * Multi-Tab Interactive Glassmorphic Dashboard, Dynamic Status Sentinel & Live Media Controller
 * Features:
 *   - 2 Multi-Tabs System (Tab 1: Live Media Player, Tab 2: Time Tracking)
 *   - "Switch to Media Tab" 1-click focus action (JUMP_TO_MEDIA_TAB)
 *   - Pure English by Default & Centralized Language System (EN / HI sync via chrome.storage.local)
 *   - Single dynamic status button (Playing / Paused / Buffering / Muted / Stopped / Idle)
 *   - Full video title display (multi-line, no cutting/ellipsis)
 *   - Video progress bar with exact numerical time and percentage + click-to-seek
 *   - Interactive Volume Progress Bar with click & drag scrubbing + mute indicator
 *   - Full media telemetry badges and quick controls
 *   - Circular Donut chart and domain breakdown
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

'use strict';

const browserAPI = typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime 
  ? globalThis.browser 
  : globalThis.chrome;

// Color palette for donut slices and domain bars
const PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#64748b'  // Muted Slate (Others)
];

const CIRCUMFERENCE = 2 * Math.PI * 76; // r = 76 -> ~477.52

// Strict 0.25x speed stepping ladder (0.25x min, 2.0x max per user specification)
const SPEED_LADDER = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

function calculateNextLadderSpeed(currentSpeed, direction) {
  const cur = (typeof currentSpeed === 'number' && !isNaN(currentSpeed) && currentSpeed > 0)
    ? Math.round(currentSpeed * 100) / 100
    : 1.0;

  let closestIdx = 3; // default 1.0
  let minDiff = Infinity;
  for (let i = 0; i < SPEED_LADDER.length; i++) {
    const diff = Math.abs(SPEED_LADDER[i] - cur);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  let nextIdx;
  if (direction === 'down' || direction === -1) {
    nextIdx = Math.max(0, closestIdx - 1);
  } else {
    nextIdx = Math.min(SPEED_LADDER.length - 1, closestIdx + 1);
  }
  return SPEED_LADDER[nextIdx];
}

// =============================================================================
// Centralized Language System (Pure English by default, Clean Hindi on switch)
// =============================================================================

const I18N_POPUP = {
  en: {
    brand_subtitle: 'Activity & Media Telemetry',
    hud_offline: 'HUD Offline',
    hud_connected: 'HUD Connected',
    hud_starting: 'Starting HUD...',
    hud_link_title: 'Video Detector HUD Link',
    
    // Tabs
    tab_media: 'Live Media',
    tab_tracking: 'Time Tracking',
    tab_media_active_title: 'Media Active',
    
    // Headings
    heading_video: 'LIVE VIDEO SENTINEL',
    heading_audio: 'LIVE AUDIO SENTINEL',
    heading_paused: 'MEDIA PAUSED',
    heading_buffering: 'BUFFERING STREAM',
    heading_idle: 'LIVE MEDIA SENTINEL',
    
    // Dynamic Status Button
    status_buffering: '⏳ Buffering',
    status_buffering_title: 'Media is buffering',
    status_muted_playing: '🔇 Muted Playing',
    status_muted_title: 'Media is muted - Click to toggle mute/play',
    status_playing: '🟢 Playing',
    status_playing_title: 'Media is actively playing - Click to pause',
    status_paused: '⏸️ Paused',
    status_paused_title: 'Media is paused - Click to play',
    status_stopped: '⏹️ Stopped',
    status_stopped_title: 'Media is stopped',
    status_ready: '⚪ Ready',
    status_ready_title: 'Media is ready',
    status_idle: '⚪ Idle - No Media',
    status_idle_title: 'No active media playing',
    
    // Progress & Volume Labels
    watched: 'Watched:',
    total: 'Total:',
    volume: 'Volume:',
    normal_vol: '🔊 Normal',
    muted_vol: '🔇 Muted',
    muted_percent: 'Muted (0%)',
    seek_title: 'Click to seek',
    vol_slider_title: 'Click or drag to adjust volume',
    vol_toggle_mute_title: 'Toggle Mute',
    
    // Quick Controls
    btn_rewind: '⏪ -10s',
    btn_rewind_title: 'Rewind 10 seconds',
    btn_play: '▶️ Play',
    btn_pause: '⏸️ Pause',
    btn_play_title: 'Play / Pause',
    btn_forward: '⏩ +10s',
    btn_forward_title: 'Forward 10 seconds',
    btn_mute: '🔇 Mute',
    btn_unmute: '🔊 Unmute',
    btn_mute_title: 'Toggle Mute',
    speed_down_title: 'Decrease speed (-0.25x)',
    speed_up_title: 'Increase speed (+0.25x)',
    speed_container_title: 'Adjust playback speed (-0.25x / +0.25x)',
    
    // Advanced Modes
    btn_fullscreen: 'Fullscreen',
    btn_fullscreen_title: 'Toggle Fullscreen',
    btn_pip: 'Pop-up PiP',
    btn_pip_title: 'Toggle Picture-in-Picture',
    btn_theater: 'Theater',
    btn_theater_title: 'Toggle Theater Mode',
    quality_down_title: 'Decrease quality',
    quality_up_title: 'Increase quality',
    quality_container_title: 'Change video quality',
    
    // Empty state & guidance
    empty_prompt: 'Play YouTube, Netflix or any media in any browser tab. Live player and controls will appear here.',
    btn_go_tracking: '⏱️ View Time Tracking',
    no_media_detected: 'No Active Media Stream Detected',
    
    // Temporal tabs & stats
    tab_today: 'Today',
    tab_daily: 'Daily Avg',
    tab_total: 'Total Time',
    center_today: "Today's Time",
    center_daily: 'Daily Avg',
    center_total: 'Total Time',
    sessions_label: 'Sessions',
    domain_breakdown: 'Domain Breakdown',
    search_domain_placeholder: 'Search domain...',
    no_activity: 'No browsing activity recorded yet. Browse any website to start tracking!',
    no_matching_domain: 'No matching domains found.',
    others: 'Others',
    
    // Footer buttons
    btn_refresh: 'Refresh',
    btn_connect_hud: 'HUD',
    btn_connect_hud_title: 'Launch & Connect Video Detector HUD',
    btn_switch_tab: 'Switch Tab',
    btn_switch_tab_title: 'Switch to active media tab',
    btn_dashboard: '📊 Dashboard',
    btn_dashboard_title: 'Open Full Dashboard',
    
    // Toasts
    toast_refreshed: 'Telemetry refreshed',
    toast_hud_already: 'HUD is already connected',
    toast_hud_launching: 'Launching Video Detector HUD...',
    toast_hud_connected: 'HUD connected successfully',
    toast_hud_failed: 'Could not connect to HUD',
    toast_switched_tab: 'Focused media tab',
    toast_no_media_tab: 'No active media tab found'
  },
  hi: {
    brand_subtitle: 'गतिविधि व मीडिया टेलीमेट्री',
    hud_offline: 'HUD ऑफलाइन',
    hud_connected: 'HUD कनेक्टेड',
    hud_starting: 'HUD शुरू हो रहा है...',
    hud_link_title: 'Video Detector HUD लिंक',
    
    // Tabs
    tab_media: 'लाइव मीडिया',
    tab_tracking: 'टाइम ट्रैकिंग',
    tab_media_active_title: 'मीडिया सक्रिय है',
    
    // Headings
    heading_video: 'लाइव वीडियो सेंटिनल',
    heading_audio: 'लाइव ऑडियो सेंटिनल',
    heading_paused: 'मीडिया रुका हुआ',
    heading_buffering: 'बफरिंग स्ट्रीम',
    heading_idle: 'लाइव मीडिया सेंटिनल',
    
    // Dynamic Status Button
    status_buffering: '⏳ बफरिंग',
    status_buffering_title: 'मीडिया बफर हो रहा है',
    status_muted_playing: '🔇 म्यूट पर चल रहा है',
    status_muted_title: 'मीडिया म्यूट है - म्यूट या प्ले टॉगल करें',
    status_playing: '🟢 चल रहा है',
    status_playing_title: 'मीडिया सक्रिय रूप से चल रहा है - पॉज़ करने के लिए क्लिक करें',
    status_paused: '⏸️ रुका हुआ',
    status_paused_title: 'मीडिया रुका हुआ है - प्ले करने के लिए क्लिक करें',
    status_stopped: '⏹️ बंद',
    status_stopped_title: 'मीडिया बंद है',
    status_ready: '⚪ तैयार',
    status_ready_title: 'मीडिया तैयार है',
    status_idle: '⚪ स्टैंडबाय - कोई मीडिया नहीं',
    status_idle_title: 'कोई सक्रिय मीडिया नहीं चल रहा',
    
    // Progress & Volume Labels
    watched: 'देखा गया:',
    total: 'कुल:',
    volume: 'वॉल्यूम:',
    normal_vol: '🔊 सामान्य',
    muted_vol: '🔇 म्यूट',
    muted_percent: 'म्यूट (0%)',
    seek_title: 'सीक करने के लिए क्लिक करें',
    vol_slider_title: 'वॉल्यूम बदलने के लिए क्लिक या ड्रैग करें',
    vol_toggle_mute_title: 'म्यूट या अनम्यूट टॉगल करें',
    
    // Quick Controls
    btn_rewind: '⏪ -10s',
    btn_rewind_title: '10 सेकंड पीछे',
    btn_play: '▶️ प्ले',
    btn_pause: '⏸️ पॉज़',
    btn_play_title: 'प्ले या पॉज़ करें',
    btn_forward: '⏩ +10s',
    btn_forward_title: '10 सेकंड आगे',
    btn_mute: '🔇 म्यूट',
    btn_unmute: '🔊 अनम्यूट',
    btn_mute_title: 'म्यूट या अनम्यूट करें',
    speed_down_title: 'स्पीड कम करें (-0.25x)',
    speed_up_title: 'स्पीड बढ़ाएं (+0.25x)',
    speed_container_title: 'प्लेबैक गति नियंत्रित करें (-0.25x / +0.25x)',
    
    // Advanced Modes
    btn_fullscreen: 'फुल स्क्रीन',
    btn_fullscreen_title: 'फुल स्क्रीन टॉगल करें',
    btn_pip: 'पॉप-अप PiP',
    btn_pip_title: 'पॉप-अप पिक्चर-इन-पिक्चर टॉगल करें',
    btn_theater: 'थिएटर',
    btn_theater_title: 'थिएटर मोड टॉगल करें',
    quality_down_title: 'क्वालिटी कम करें',
    quality_up_title: 'क्वालिटी बढ़ाएं',
    quality_container_title: 'वीडियो क्वालिटी बदलें',
    
    // Empty state & guidance
    empty_prompt: 'ब्राउज़र में YouTube, Netflix या कोई मीडिया चलाएं। लाइव प्लेयर और कंट्रोल्स यहाँ दिखाई देंगे।',
    btn_go_tracking: '⏱️ टाइम ट्रैकिंग देखें',
    no_media_detected: 'कोई सक्रिय मीडिया स्ट्रीम नहीं मिली',
    
    // Temporal tabs & stats
    tab_today: 'आज',
    tab_daily: 'दैनिक औसत',
    tab_total: 'कुल समय',
    center_today: 'आज का समय',
    center_daily: 'दैनिक औसत',
    center_total: 'कुल समय',
    sessions_label: 'सत्र संख्या',
    domain_breakdown: 'डोमेन विवरण',
    search_domain_placeholder: 'डोमेन खोजें...',
    no_activity: 'कोई ब्राउज़िंग गतिविधि दर्ज नहीं है। ट्रैकिंग शुरू करने के लिए कोई वेबसाइट खोलें!',
    no_matching_domain: 'कोई मेल खाता डोमेन नहीं मिला।',
    others: 'अन्य',
    
    // Footer buttons
    btn_refresh: 'रीफ्रेश',
    btn_connect_hud: 'HUD',
    btn_connect_hud_title: 'Video Detector HUD लॉन्च व कनेक्ट करें',
    btn_switch_tab: 'टैब स्विच',
    btn_switch_tab_title: 'सक्रिय मीडिया टैब पर जाएं',
    btn_dashboard: '📊 डैशबोर्ड',
    btn_dashboard_title: 'पूर्ण डैशबोर्ड खोलें',
    
    // Toasts
    toast_refreshed: 'डेटा रीफ्रेश हो गया',
    toast_hud_already: 'HUD पहले से कनेक्टेड है',
    toast_hud_launching: 'Video Detector HUD शुरू हो रहा है...',
    toast_hud_connected: 'HUD सफलतापूर्वक कनेक्ट हो गया',
    toast_hud_failed: 'HUD से कनेक्ट नहीं हो सका',
    toast_switched_tab: 'मीडिया टैब पर स्विच किया गया',
    toast_no_media_tab: 'कोई सक्रिय मीडिया टैब नहीं मिला'
  }
};

let currentLang = 'en';

function t(key) {
  const dict = I18N_POPUP[currentLang] || I18N_POPUP.en;
  return dict[key] || I18N_POPUP.en[key] || key;
}

function applyPopupLanguage(lang) {
  currentLang = (lang === 'hi') ? 'hi' : 'en';

  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  const setTitle = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.title = t(key);
  };

  setTxt('brandSubtitle', 'brand_subtitle');
  setTxt('topTabMediaText', 'tab_media');
  setTxt('topTabTrackingText', 'tab_tracking');
  setTitle('tabMediaLiveDot', 'tab_media_active_title');

  setTxt('lblTimeElapsed', 'watched');
  setTxt('lblTimeDuration', 'total');
  setTxt('lblVolume', 'volume');
  setTitle('btnQuickMute', 'vol_toggle_mute_title');
  setTitle('progressBarContainer', 'seek_title');
  setTitle('volumeBarContainer', 'vol_slider_title');

  setTitle('btnCtrlRewind', 'btn_rewind_title');
  setTitle('btnCtrlForward', 'btn_forward_title');
  setTitle('btnCtrlSpeedDown', 'speed_down_title');
  setTitle('btnCtrlSpeedUp', 'speed_up_title');

  setTxt('ctrlFullscreenText', 'btn_fullscreen');
  setTitle('btnCtrlFullscreen', 'btn_fullscreen_title');
  setTxt('ctrlPipText', 'btn_pip');
  setTitle('btnCtrlPip', 'btn_pip_title');
  setTxt('ctrlTheaterText', 'btn_theater');
  setTitle('btnCtrlTheater', 'btn_theater_title');
  setTitle('btnCtrlQualityDown', 'quality_down_title');
  setTitle('btnCtrlQualityUp', 'quality_up_title');

  setTxt('emptyMediaText', 'empty_prompt');
  setTxt('btnGoToTracking', 'btn_go_tracking');

  setTxt('subtabTodayText', 'tab_today');
  setTxt('subtabDailyText', 'tab_daily');
  setTxt('subtabTotalText', 'tab_total');
  setTxt('pillTodayLabel', 'tab_today');
  setTxt('pillDailyLabel', 'tab_daily');
  setTxt('pillSessionsLabel', 'sessions_label');
  setTxt('sectionDomainTitle', 'domain_breakdown');

  const searchInput = document.getElementById('domainSearchInput');
  if (searchInput) searchInput.placeholder = t('search_domain_placeholder');

  const emptyDomainText = document.getElementById('emptyDomainStateText');
  if (emptyDomainText) emptyDomainText.textContent = t('no_activity');

  setTxt('btnRefreshText', 'btn_refresh');
  setTxt('btnReconnectWsText', 'btn_connect_hud');
  setTitle('btnReconnectWs', 'btn_connect_hud_title');
  setTxt('btnSwitchMediaTabText', 'btn_switch_tab');
  setTitle('btnSwitchMediaTab', 'btn_switch_tab_title');
  setTxt('btnOpenDashboardText', 'btn_dashboard');
  setTitle('btnOpenDashboard', 'btn_dashboard_title');

  // Re-render dynamic components with localized strings
  if (dashboardData) {
    renderWebSocketBadge(dashboardData.wsConnected);
    renderMediaCard(dashboardData.globalMediaState);
    renderStatsPills(dashboardData);
    const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
    renderDonutChart(items, totalSeconds);
    renderDomainList(items, totalSeconds);
  }
}

let popupToastTimer = null;
function showPopupToast(message, type = 'success') {
  const toast = document.getElementById('popupToastNotification');
  const msgEl = document.getElementById('popupToastMessage');
  const iconEl = document.getElementById('popupToastIcon');
  if (!toast || !msgEl) return;

  if (popupToastTimer) clearTimeout(popupToastTimer);

  msgEl.textContent = message;
  iconEl.textContent = type === 'danger' ? '⚠️' : (type === 'starting' ? '⏳' : '✅');
  toast.className = `toast-banner ${type}`;
  toast.classList.remove('hidden');

  popupToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Application State
let activeTopTab = 'media'; // 'media' | 'tracking'
let userManualOverride = false;
let isInitialLoad = true;
let lastMediaPlaying = false;
let isDraggingVolume = false;

let currentTemporalTab = 'today'; // 'today' | 'daily' | 'total'
let dashboardData = null;
let searchQuery = '';
let activeMediaCached = null;

// Standalone SQLite Data Hub state & Multi-Browser Filter
let dataHubConnected = false;
let dataHubAnalytics = null;
let selectedBrowser = 'all';

/**
 * Returns favicon URL with Google S2 service fallback
 */
function getFaviconUrl(domain) {
  if (!domain || domain.includes(':')) return '../icons/icon32.png';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

/**
 * Updates dynamic options in browser filter dropdown when Data Hub reports new clients
 */
function updateBrowserFilterOptions(registeredBrowsers = []) {
  const sel = document.getElementById('browserFilterSelect');
  if (!sel) return;

  const existingValues = new Set(Array.from(sel.options).map(o => o.value));
  registeredBrowsers.forEach(b => {
    if (b && !existingValues.has(b)) {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b.charAt(0).toUpperCase() + b.slice(1);
      sel.appendChild(opt);
    }
  });
  sel.value = selectedBrowser;
}

/**
 * Escapes HTML entities for safe DOM injection (OWASP / MV3 CSP compliant)
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats seconds into human-readable browsing duration
 */
function formatDuration(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds));
  if (sec === 0) return '0s';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSec}s`;
  }
  return `${remainingSec}s`;
}

/**
 * Formats seconds into digital video time format (mm:ss or hh:mm:ss)
 */
function formatVideoTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

/**
 * Formats seconds for center readout (compact)
 */
function formatCenterTime(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${sec}s`;
}

/**
 * Switches the top-level tab (Media Player vs Time Tracking)
 */
function switchTopTab(tabName, isManual = false) {
  if (isManual) {
    userManualOverride = true;
  }
  activeTopTab = tabName;

  const btnMedia = document.getElementById('mainTabMedia');
  const btnTracking = document.getElementById('mainTabTracking');
  const paneMedia = document.getElementById('viewMediaPane');
  const paneTracking = document.getElementById('viewTrackingPane');

  if (tabName === 'media') {
    btnMedia.classList.add('active');
    btnMedia.setAttribute('aria-selected', 'true');
    btnTracking.classList.remove('active');
    btnTracking.setAttribute('aria-selected', 'false');

    paneMedia.classList.add('active');
    paneTracking.classList.remove('active');
  } else {
    btnTracking.classList.add('active');
    btnTracking.setAttribute('aria-selected', 'true');
    btnMedia.classList.remove('active');
    btnMedia.setAttribute('aria-selected', 'false');

    paneTracking.classList.add('active');
    paneMedia.classList.remove('active');
  }
}

/**
 * Fetches latest dashboard state from background service worker
 */
async function fetchDashboardData(forceRefresh = false) {
  return new Promise((resolve) => {
    browserAPI.runtime.sendMessage({
      type: 'GET_DASHBOARD_DATA',
      forceRefresh: Boolean(forceRefresh)
    }, (response) => {
      if (browserAPI.runtime.lastError || !response) {
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

let lastControlActionKey = '';
let lastControlActionTime = 0;

/**
 * Sends interactive media control action to background service worker with click debounce.
 */
function sendMediaControl(action, data = {}) {
  const now = Date.now();
  const actionKey = `${action}_${JSON.stringify(data)}`;

  if (actionKey === lastControlActionKey && (now - lastControlActionTime) < 280) {
    return;
  }
  if (action !== 'set_volume' && (now - lastControlActionTime) < 180) {
    return;
  }
  lastControlActionKey = actionKey;
  lastControlActionTime = now;

  browserAPI.runtime.sendMessage({
    type: 'CONTROL_MEDIA',
    action,
    data
  }, () => {
    setTimeout(refreshDashboard, 120);
  });
}

/**
 * Extracts list of domains with duration and session stats based on active temporal tab
 */
function processDomainStats(data, tabType) {
  // 1. Standalone SQLite Data Hub Mode (Source of Truth when Connected)
  if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.domain_distribution)) {
    const rawItems = dataHubAnalytics.domain_distribution;
    const todaySec = dataHubAnalytics.today_seconds || 0;
    const dailyAvgSec = dataHubAnalytics.daily_average_seconds || 0;
    const totalSecAll = dataHubAnalytics.total_seconds || todaySec;

    let targetTotal = todaySec;
    if (tabType === 'daily') {
      targetTotal = dailyAvgSec;
    } else if (tabType === 'total') {
      targetTotal = totalSecAll;
    }

    const items = rawItems.map(d => {
      let domainSec = d.seconds;
      if (tabType === 'daily') {
        domainSec = (dailyAvgSec > 0 && todaySec > 0)
          ? Math.round(dailyAvgSec * ((d.percent || 0) / 100.0))
          : Math.round(d.seconds / 7);
      } else if (tabType === 'total') {
        domainSec = (totalSecAll > 0 && totalSecAll !== todaySec && todaySec > 0)
          ? Math.round(totalSecAll * ((d.percent || 0) / 100.0))
          : d.seconds;
      }

      return {
        domain: d.domain,
        seconds: domainSec,
        sessions: d.session_count || 1,
        favicon: d.favicon_url || getFaviconUrl(d.domain),
        lastActive: d.last_active ? (d.last_active > 1e11 ? d.last_active : d.last_active * 1000) : Date.now(),
        percent: d.percent
      };
    });

    items.sort((a, b) => b.seconds - a.seconds);
    return { items, totalSeconds: targetTotal };
  }

  // 2. Graceful Local Fallback Mode (chrome.storage.local activityData)
  if (!data || !data.activityData || !data.activityData.domains) {
    return { items: [], totalSeconds: 0 };
  }

  const todayStr = data.todayStr;
  const historyDays = Math.max(1, data.activityData.historyDaysCount || 1);
  const domains = data.activityData.domains;

  const items = [];
  let totalSec = 0;

  for (const [domain, entry] of Object.entries(domains)) {
    let domainSec = 0;
    let sessions = entry.sessionCount || 1;

    if (tabType === 'today') {
      if (entry.days && entry.days[todayStr]) {
        domainSec = entry.days[todayStr].seconds || 0;
        sessions = entry.days[todayStr].sessions || 1;
      }
    } else if (tabType === 'daily') {
      domainSec = Math.round((entry.totalSeconds || 0) / historyDays);
    } else {
      domainSec = entry.totalSeconds || 0;
    }

    if (domainSec > 0) {
      items.push({
        domain,
        seconds: domainSec,
        sessions,
        favicon: entry.favicon || getFaviconUrl(domain),
        lastActive: entry.lastActive
      });
      totalSec += domainSec;
    }
  }

  items.sort((a, b) => b.seconds - a.seconds);
  return { items, totalSeconds: totalSec };
}

/**
 * Renders the pure SVG Donut chart slices
 */
function renderDonutChart(items, totalSeconds) {
  const slicesGroup = document.getElementById('donutSlicesGroup');
  const centerTimeEl = document.getElementById('donutCenterTime');
  const centerLabelEl = document.getElementById('donutCenterLabel');
  if (!slicesGroup || !centerTimeEl || !centerLabelEl) return;

  slicesGroup.innerHTML = '';

  const getLabel = () => {
    return currentTemporalTab === 'today' ? t('center_today') : (currentTemporalTab === 'daily' ? t('center_daily') : t('center_total'));
  };

  if (totalSeconds <= 0 || items.length === 0) {
    centerTimeEl.textContent = '0h 00m';
    centerLabelEl.textContent = getLabel();
    return;
  }

  centerTimeEl.textContent = formatCenterTime(totalSeconds);
  centerLabelEl.textContent = getLabel();

  const topItems = items.slice(0, 5);
  const otherItems = items.slice(5);

  const displaySlices = [...topItems];
  if (otherItems.length > 0) {
    const otherSec = otherItems.reduce((acc, curr) => acc + curr.seconds, 0);
    displaySlices.push({
      domain: t('others'),
      seconds: otherSec,
      isOther: true
    });
  }

  let accumulatedPercent = 0;

  displaySlices.forEach((slice, index) => {
    const slicePercent = slice.seconds / totalSeconds;
    const sliceLength = slicePercent * CIRCUMFERENCE;
    const offset = -(accumulatedPercent * CIRCUMFERENCE);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '100');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '76');
    circle.setAttribute('class', 'donut-slice');
    circle.setAttribute('stroke', PALETTE[index % PALETTE.length]);
    circle.setAttribute('stroke-dasharray', `${sliceLength} ${CIRCUMFERENCE}`);
    circle.setAttribute('stroke-dashoffset', String(offset));

    circle.addEventListener('mouseenter', () => {
      centerTimeEl.textContent = formatCenterTime(slice.seconds);
      centerLabelEl.textContent = `${slice.domain} (${Math.round(slicePercent * 100)}%)`;
    });

    circle.addEventListener('mouseleave', () => {
      centerTimeEl.textContent = formatCenterTime(totalSeconds);
      centerLabelEl.textContent = getLabel();
    });

    slicesGroup.appendChild(circle);
    accumulatedPercent += slicePercent;
  });
}

/**
 * Renders domain breakdown list
 */
function renderDomainList(items, totalSeconds) {
  const container = document.getElementById('domainsListContainer');
  if (!container) return;
  container.innerHTML = '';

  const filtered = items.filter(it => 
    !searchQuery || it.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>${searchQuery ? t('no_matching_domain') : t('no_activity')}</span>
      </div>
    `;
    return;
  }

  filtered.forEach((item, idx) => {
    const pct = totalSeconds > 0 ? Math.round((item.seconds / totalSeconds) * 100) : 0;
    const color = PALETTE[idx % PALETTE.length];

    const card = document.createElement('div');
    card.className = 'domain-item';
    card.innerHTML = `
      <div class="domain-item-top">
        <div class="domain-brand-group">
          <img src="${escapeHtml(item.favicon || '../icons/icon32.png')}" class="domain-favicon" alt="">
          <span class="domain-name" title="${escapeHtml(item.domain)}">${escapeHtml(item.domain)}</span>
        </div>
        <div class="domain-time-group">
          <span class="domain-time">${formatDuration(item.seconds)}</span>
          <span class="domain-pct">${pct}%</span>
        </div>
      </div>
      <div class="domain-bar-bg">
        <div class="domain-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
      </div>
    `;

    const faviconImg = card.querySelector('.domain-favicon');
    if (faviconImg) {
      faviconImg.addEventListener('error', () => {
        faviconImg.src = '../icons/icon32.png';
      }, { once: true });
    }

    container.appendChild(card);
  });
}

/**
 * Renders quick stats pills
 */
function renderStatsPills(data) {
  let todaySeconds = 0;
  let dailyAvgSeconds = 0;
  let totalSessions = 0;

  if (dataHubConnected && dataHubAnalytics && Array.isArray(dataHubAnalytics.domain_distribution)) {
    todaySeconds = dataHubAnalytics.today_seconds || 0;
    dailyAvgSeconds = dataHubAnalytics.daily_average_seconds || 0;
    totalSessions = dataHubAnalytics.domain_distribution.reduce((acc, curr) => acc + (curr.session_count || 0), 0);
  } else {
    const todayStats = processDomainStats(data, 'today');
    const dailyStats = processDomainStats(data, 'daily');
    todaySeconds = todayStats.totalSeconds;
    dailyAvgSeconds = dailyStats.totalSeconds;

    if (data && data.activityData && data.activityData.domains) {
      const todayStr = data.todayStr;
      for (const d of Object.values(data.activityData.domains)) {
        if (d.days && d.days[todayStr]) {
          totalSessions += (d.days[todayStr].sessions || 1);
        }
      }
    }
  }

  const pToday = document.getElementById('pillTodayTime');
  const pDaily = document.getElementById('pillDailyAvg');
  const pSessions = document.getElementById('pillSessionsCount');

  if (pToday) pToday.textContent = formatCenterTime(todaySeconds);
  if (pDaily) pDaily.textContent = formatCenterTime(dailyAvgSeconds);
  if (pSessions) pSessions.textContent = String(totalSessions);
}

/**
 * Formats platform tag name cleanly (e.g. YouTube, Netflix, Twitch)
 */
function formatPlatformName(domain) {
  if (!domain) return 'WEB MEDIA';
  const d = domain.toLowerCase();
  if (d.includes('youtube')) return 'YOUTUBE';
  if (d.includes('netflix')) return 'NETFLIX';
  if (d.includes('twitch')) return 'TWITCH';
  if (d.includes('hotstar') || d.includes('disney')) return 'DISNEY+ HOTSTAR';
  if (d.includes('primevideo')) return 'PRIME VIDEO';
  if (d.includes('spotify')) return 'SPOTIFY';
  return domain.toUpperCase();
}

/**
 * Renders the Live Media Telemetry Card, Status Button, and Volume Progress Bar
 */
function renderMediaCard(globalMediaState) {
  const card = document.getElementById('mediaSentinelCard');
  const heading = document.getElementById('mediaStatusHeading');
  const dynamicStatusBtn = document.getElementById('dynamicStatusBtn');
  const dynamicStatusText = document.getElementById('dynamicStatusText');
  const platformTag = document.getElementById('mediaPlatformTag');
  const qualityBadge = document.getElementById('mediaQualityBadge');
  const titleText = document.getElementById('mediaTitleText');
  const progressSection = document.getElementById('mediaProgressSection');
  const progressBarFill = document.getElementById('progressBarFill');
  const timeElapsed = document.getElementById('timeElapsed');
  const timeDuration = document.getElementById('timeDuration');
  const timeProgressPercent = document.getElementById('timeProgressPercent');
  const metaRow = document.getElementById('mediaMetaRow');
  const domainBadge = document.getElementById('mediaDomainBadge');
  const resolutionBadge = document.getElementById('mediaResolutionBadge');
  const speedBadge = document.getElementById('mediaSpeedBadge');
  const volumeBadge = document.getElementById('mediaVolumeBadge');
  const controlsRow = document.getElementById('mediaControlsRow');
  const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');
  const btnCtrlToggleMute = document.getElementById('btnCtrlToggleMute');
  const mediaEmptyPrompt = document.getElementById('mediaEmptyPrompt');

  // Volume UI elements
  const volumeSection = document.getElementById('mediaVolumeSection');
  const volumeIcon = document.getElementById('volumeIcon');
  const volumePercentReadout = document.getElementById('volumePercentReadout');
  const btnQuickMute = document.getElementById('btnQuickMute');
  const quickMuteText = document.getElementById('quickMuteText');
  const volumeBarFill = document.getElementById('volumeBarFill');
  const volumeBarContainer = document.getElementById('volumeBarContainer');

  if (!card || !heading || !dynamicStatusBtn || !dynamicStatusText) return;

  const pm = globalMediaState && globalMediaState.primaryMedia;
  activeMediaCached = pm;

  if (pm) {
    const isVideo = (pm.mediaType === 'video');
    const state = pm.state || (pm.isPlaying ? 'playing' : (pm.isBuffering ? 'buffering' : 'paused'));
    const isPlaying = Boolean(pm.isPlaying);
    const isBuffering = (state === 'buffering' || pm.isBuffering);
    const rawVolume = (typeof pm.volume === 'number') ? pm.volume : 1.0;
    const volPercent = (typeof pm.volumePercent === 'number') ? pm.volumePercent : Math.round(rawVolume * 100);
    const isMuted = Boolean(pm.isMuted || rawVolume <= 0.001);

    // Hide empty guidance prompt
    if (mediaEmptyPrompt) mediaEmptyPrompt.classList.add('hidden');

    // 1. Dynamic Status Button Styling & Localized Text
    dynamicStatusBtn.className = 'dynamic-status-btn';

    if (isBuffering) {
      dynamicStatusBtn.classList.add('buffering');
      dynamicStatusText.textContent = t('status_buffering');
      dynamicStatusBtn.title = t('status_buffering_title');
    } else if (isPlaying) {
      if (isMuted) {
        dynamicStatusBtn.classList.add('muted');
        dynamicStatusText.textContent = t('status_muted_playing');
        dynamicStatusBtn.title = t('status_muted_title');
      } else {
        dynamicStatusBtn.classList.add('playing');
        dynamicStatusText.textContent = t('status_playing');
        dynamicStatusBtn.title = t('status_playing_title');
      }
    } else if (state === 'paused') {
      dynamicStatusBtn.classList.add('paused');
      dynamicStatusText.textContent = t('status_paused');
      dynamicStatusBtn.title = t('status_paused_title');
    } else if (state === 'stopped') {
      dynamicStatusBtn.classList.add('stopped');
      dynamicStatusText.textContent = t('status_stopped');
      dynamicStatusBtn.title = t('status_stopped_title');
    } else {
      dynamicStatusBtn.classList.add('idle');
      dynamicStatusText.textContent = t('status_ready');
      dynamicStatusBtn.title = t('status_ready_title');
    }

    // 2. Card Background & Header
    card.className = 'media-card';
    if (isPlaying) {
      card.classList.add(isVideo ? 'playing' : 'audio');
      heading.textContent = isVideo ? t('heading_video') : t('heading_audio');
    } else if (state === 'paused') {
      card.classList.add('paused');
      heading.textContent = t('heading_paused');
    } else if (isBuffering) {
      card.classList.add('buffering');
      heading.textContent = t('heading_buffering');
    } else {
      card.classList.add('idle');
      heading.textContent = t('heading_idle');
    }

    // 3. Platform & Quality Badges
    if (platformTag) platformTag.textContent = formatPlatformName(pm.domain);
    const displayResolution = (pm.resolutionLabel && pm.resolutionLabel !== 'Audio / Unknown' && pm.resolutionLabel !== 'Unknown')
      ? pm.resolutionLabel
      : (isVideo ? 'Video (Auto)' : 'Audio Stream');
    if (qualityBadge) {
      qualityBadge.textContent = displayResolution;
      qualityBadge.className = isVideo ? 'badge badge-quality' : 'badge badge-dim';
    }

    // 4. Full Video Title (prominently displayed multi-line without truncation)
    if (titleText) {
      titleText.textContent = pm.title || pm.domain || 'Active Media Stream';
      titleText.title = pm.title || 'Video Title';
    }

    // 5. Progress Bar & Numerical Readouts
    const duration = Number(pm.duration) || 0;
    const current = Number(pm.currentTime) || 0;
    const isLive = Boolean(pm.isLive && duration <= 0);
    const pct = (duration > 0)
      ? Math.min(100, Math.max(0, (current / duration) * 100))
      : (isLive ? 100 : (Number(pm.progressPercent) || 0));

    if (progressSection) progressSection.classList.remove('hidden');
    if (progressBarFill) progressBarFill.style.width = `${pct.toFixed(1)}%`;
    if (timeElapsed) timeElapsed.textContent = formatVideoTime(current);
    if (timeDuration) timeDuration.textContent = isLive ? '🔴 LIVE' : (duration > 0 ? formatVideoTime(duration) : '--:--');
    if (timeProgressPercent) timeProgressPercent.textContent = isLive ? 'LIVE' : `${pct.toFixed(1)}%`;

    // 6. Volume Progress Bar & Control Section
    if (volumeSection) volumeSection.classList.remove('hidden');
    if (!isDraggingVolume) {
      const displayVol = isMuted ? 0 : volPercent;
      if (volumeBarFill) volumeBarFill.style.width = `${displayVol}%`;
      if (volumePercentReadout) volumePercentReadout.textContent = isMuted ? t('muted_percent') : `${volPercent}%`;
      if (volumeIcon) volumeIcon.textContent = isMuted ? '🔇' : (volPercent < 40 ? '🔉' : '🔊');
      if (volumeBarContainer) volumeBarContainer.setAttribute('aria-valuenow', String(displayVol));

      if (btnQuickMute) btnQuickMute.className = isMuted ? 'btn-quick-mute is-muted' : 'btn-quick-mute';
      if (quickMuteText) quickMuteText.textContent = isMuted ? t('muted_vol') : t('normal_vol');
    }

    // 7. Metrics Row (Resolution, Speed, Volume, Domain)
    if (metaRow) metaRow.classList.remove('hidden');
    if (domainBadge) domainBadge.textContent = pm.domain || 'web';
    if (resolutionBadge) resolutionBadge.textContent = displayResolution;
    if (speedBadge) speedBadge.textContent = `⚡ ${(pm.playbackRate || 1.0).toFixed(2).replace(/\.00$/, '')}x`;
    if (volumeBadge) volumeBadge.textContent = isMuted ? t('muted_vol') : `🔊 ${volPercent}%`;

    // 8. Quick Interactive Controls Row & Speed Stepper
    if (controlsRow) controlsRow.classList.remove('hidden');
    if (btnCtrlTogglePlay) {
      btnCtrlTogglePlay.textContent = isPlaying ? t('btn_pause') : t('btn_play');
      btnCtrlTogglePlay.className = isPlaying ? 'ctrl-btn primary' : 'ctrl-btn';
    }
    if (btnCtrlToggleMute) {
      btnCtrlToggleMute.textContent = isMuted ? t('btn_unmute') : t('btn_mute');
    }

    const speedDisplay = document.getElementById('ctrlSpeedDisplay');
    if (speedDisplay) {
      speedDisplay.textContent = `⚡ ${(pm.playbackRate || 1.0).toFixed(2).replace(/\.00$/, '')}x`;
    }

    // 9. Advanced Controls Row
    const advancedRow = document.getElementById('mediaAdvancedRow');
    if (advancedRow) advancedRow.classList.remove('hidden');

    const qualityDisplay = document.getElementById('ctrlQualityDisplay');
    if (qualityDisplay) {
      const qMap = {
        'tiny': '144P',
        'small': '240P',
        'medium': '360P',
        'large': '480P',
        'hd720': '720P',
        'hd1080': '1080P',
        'hd1440': '1440P',
        'hd2160': '4K',
        'hd2880': '5K',
        'highres': '8K'
      };
      let qText = 'Quality';
      if (pm.playbackQuality && qMap[pm.playbackQuality]) {
        qText = qMap[pm.playbackQuality];
      } else if (pm.playbackQuality) {
        qText = pm.playbackQuality.replace(/^hd/, '') + (pm.playbackQuality.startsWith('hd') ? 'p' : '');
      } else if (pm.resolutionLabel && pm.resolutionLabel !== 'Video (Auto)') {
        qText = pm.resolutionLabel.split(' ')[0];
      }
      qualityDisplay.textContent = qText.toUpperCase();
    }

  } else {
    // Idle / No Media State
    card.className = 'media-card idle';
    heading.textContent = t('heading_idle');

    dynamicStatusBtn.className = 'dynamic-status-btn idle';
    dynamicStatusText.textContent = t('status_idle');
    dynamicStatusBtn.title = t('status_idle_title');

    if (platformTag) platformTag.textContent = 'NO MEDIA';
    if (qualityBadge) {
      qualityBadge.textContent = 'Idle';
      qualityBadge.className = 'badge badge-dim';
    }

    if (titleText) {
      titleText.textContent = t('no_media_detected');
      titleText.title = t('empty_prompt');
    }

    if (progressSection) progressSection.classList.add('hidden');
    if (volumeSection) volumeSection.classList.add('hidden');
    if (metaRow) metaRow.classList.add('hidden');
    if (controlsRow) controlsRow.classList.add('hidden');

    const advancedRow = document.getElementById('mediaAdvancedRow');
    if (advancedRow) advancedRow.classList.add('hidden');

    if (mediaEmptyPrompt) mediaEmptyPrompt.classList.remove('hidden');
  }
}

/**
 * Updates WebSocket connection status badge
 */
function renderWebSocketBadge(isConnected) {
  const badge = document.getElementById('wsStatusBadge');
  const text = document.getElementById('wsStatusText');
  if (badge && text) {
    if (isConnected) {
      badge.className = 'ws-badge connected';
      text.textContent = t('hud_connected');
      badge.title = `${t('hud_connected')} (ws://127.0.0.1:65432)`;
    } else {
      badge.className = 'ws-badge disconnected';
      text.textContent = t('hud_offline');
      badge.title = `${t('hud_offline')} (Port 65432)`;
    }
  }

  if (dashboardData) {
    renderDataHubBadge(Boolean(dataHubConnected && dataHubAnalytics !== null));
  }
}

/**
 * Updates Standalone SQLite Data Hub badge in popup header
 */
function renderDataHubBadge(isConnected) {
  const badge = document.getElementById('hubStatusBadge');
  const text = document.getElementById('hubStatusText');
  if (!badge || !text) return;

  if (isConnected) {
    badge.className = 'ws-badge connected';
    text.textContent = 'Hub Active';
    badge.title = 'Standalone SQLite Data Hub Connected (ws://127.0.0.1:65433)';
  } else {
    badge.className = 'ws-badge disconnected';
    text.textContent = 'Hub Offline';
    badge.title = 'Standalone SQLite Data Hub Offline (Port 65433)';
  }
}

/**
 * Handles Dynamic Auto-Switching between Tab 1 (Media) and Tab 2 (Time Tracking)
 */
function handleAutoTabSwitching(data) {
  const pm = data && data.globalMediaState && data.globalMediaState.primaryMedia;
  const hasActiveMedia = Boolean(pm && (pm.isPlaying || pm.state === 'playing' || pm.state === 'paused' || pm.state === 'buffering'));
  const isPlayingNow = Boolean(pm && pm.isPlaying);

  // Live pulsating dot on Tab 1
  const liveDot = document.getElementById('tabMediaLiveDot');
  if (liveDot) {
    liveDot.classList.toggle('hidden', !isPlayingNow);
  }

  // 1. Initial Load: Automatically choose the right tab
  if (isInitialLoad) {
    isInitialLoad = false;
    if (hasActiveMedia) {
      switchTopTab('media', false);
    } else {
      switchTopTab('tracking', false);
    }
  }

  // 2. Playback just started while popup is open -> Auto-switch to Media tab
  if (isPlayingNow && !lastMediaPlaying) {
    switchTopTab('media', false);
    userManualOverride = false;
  }

  // 3. If no media and user hasn't explicitly chosen Media tab -> Auto-switch to Time Tracking
  if (!userManualOverride && !hasActiveMedia && activeTopTab === 'media') {
    switchTopTab('tracking', false);
  }

  lastMediaPlaying = isPlayingNow;
}

/**
 * Full dashboard refresh
 */
async function refreshDashboard(forceRefresh = false) {
  dashboardData = await fetchDashboardData(forceRefresh);
  if (!dashboardData) return;

  dataHubConnected = Boolean(dashboardData.dataHubConnected);

  // If Standalone SQLite Data Hub is connected, query analytics matching dashboard.js pattern
  if (dataHubConnected) {
    try {
      const hubRes = await new Promise((res) => {
        browserAPI.runtime.sendMessage({
          type: 'QUERY_DATA_HUB',
          query: 'ANALYTICS',
          browser: selectedBrowser || 'all',
          date: dashboardData.todayStr || new Date().toISOString().split('T')[0]
        }, (hr) => {
          if (browserAPI.runtime.lastError || !hr || !hr.success) {
            res(null);
          } else {
            res(hr.data || null);
          }
        });
      });

      if (hubRes) {
        dataHubAnalytics = hubRes;
        renderDataHubBadge(true);
        if (Array.isArray(hubRes.registered_browsers)) {
          updateBrowserFilterOptions(hubRes.registered_browsers);
        }
      } else {
        dataHubAnalytics = null;
        renderDataHubBadge(false);
      }
    } catch (_) {
      dataHubAnalytics = null;
      renderDataHubBadge(false);
    }
  } else {
    dataHubAnalytics = null;
    renderDataHubBadge(false);
  }

  handleAutoTabSwitching(dashboardData);
  renderWebSocketBadge(dashboardData.wsConnected);
  renderMediaCard(dashboardData.globalMediaState);
  renderStatsPills(dashboardData);

  const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
  renderDonutChart(items, totalSeconds);
  renderDomainList(items, totalSeconds);
}

/**
 * Calculates volume percent from pointer coordinate and updates UI + sends command
 */
function updateVolumeFromEvent(e) {
  const container = document.getElementById('volumeBarContainer');
  const fill = document.getElementById('volumeBarFill');
  const readout = document.getElementById('volumePercentReadout');
  const icon = document.getElementById('volumeIcon');
  if (!container || !fill || !readout || !icon) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const percent = rect.width > 0 ? Math.round((clickX / rect.width) * 100) : 100;

  fill.style.width = `${percent}%`;
  readout.textContent = `${percent}%`;
  icon.textContent = percent === 0 ? '🔇' : (percent < 40 ? '🔉' : '🔊');
  container.setAttribute('aria-valuenow', String(percent));

  sendMediaControl('set_volume', { percent, volume: percent / 100 });
}

let popupListenersAttached = false;

/**
 * UI Event Listeners Setup
 */
function setupEventListeners() {
  if (popupListenersAttached) return;
  popupListenersAttached = true;

  // Top Primary Multi-Tabs Navigation (Media Player vs Time Tracking)
  const tabMediaBtn = document.getElementById('mainTabMedia');
  const tabTrackingBtn = document.getElementById('mainTabTracking');
  const btnGoToTracking = document.getElementById('btnGoToTracking');

  if (tabMediaBtn) {
    tabMediaBtn.addEventListener('click', () => {
      switchTopTab('media', true);
    });
  }

  if (tabTrackingBtn) {
    tabTrackingBtn.addEventListener('click', () => {
      switchTopTab('tracking', true);
    });
  }

  if (btnGoToTracking) {
    btnGoToTracking.addEventListener('click', () => {
      switchTopTab('tracking', true);
    });
  }

  // Temporal Sub-Tabs Navigation (Today | Daily Avg | Total Time)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTemporalTab = btn.getAttribute('data-tab');

      if (dashboardData) {
        const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
        renderDonutChart(items, totalSeconds);
        renderDomainList(items, totalSeconds);
      }
    });
  });

  // Multi-Browser Dropdown Filter
  const browserFilterSelect = document.getElementById('browserFilterSelect');
  if (browserFilterSelect) {
    browserFilterSelect.value = selectedBrowser;
    browserFilterSelect.addEventListener('change', async (e) => {
      selectedBrowser = e.target.value;
      await browserAPI.storage.local.set({ selected_browser_filter: selectedBrowser });
      await refreshDashboard(false);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showPopupToast(`Filter: ${selectedText}`, 'info');
    });
  }

  // Domain search filter
  const searchInput = document.getElementById('domainSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (dashboardData) {
        const { items, totalSeconds } = processDomainStats(dashboardData, currentTemporalTab);
        renderDomainList(items, totalSeconds);
      }
    });
  }

  // Action Buttons: 1. Refresh Telemetry
  const btnRefresh = document.getElementById('btnRefresh');
  let isRefreshing = false;
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      if (isRefreshing) return;
      isRefreshing = true;
      btnRefresh.classList.add('spinning');
      btnRefresh.disabled = true;

      try {
        await refreshDashboard(true);
        showPopupToast(t('toast_refreshed'), 'success');
      } catch (_) {
        showPopupToast(t('toast_refreshed'), 'success');
      } finally {
        setTimeout(() => {
          btnRefresh.classList.remove('spinning');
          btnRefresh.disabled = false;
          isRefreshing = false;
        }, 650);
      }
    });
  }

  // 2. Connect HUD / Auto-Launch Desktop Overlay
  let hudLaunchInProgress = false;

  function handleConnectOrLaunchHUD() {
    if (dashboardData && dashboardData.wsConnected) {
      showPopupToast(t('toast_hud_already'), 'success');
      return;
    }

    if (hudLaunchInProgress) return;
    hudLaunchInProgress = true;

    const badge = document.getElementById('wsStatusBadge');
    const text = document.getElementById('wsStatusText');
    const btnText = document.getElementById('btnReconnectWsText');

    if (badge) badge.className = 'ws-badge starting';
    if (text) text.textContent = t('hud_starting');
    if (btnText) btnText.textContent = t('hud_starting');

    showPopupToast(t('toast_hud_launching'), 'starting');

    // 1. Dispatch Native Messaging Host request
    browserAPI.runtime.sendMessage({ type: 'LAUNCH_DESKTOP_HUD' }, (res) => {
      if (res && res.fallbackRequired) {
        try {
          let iframe = document.getElementById('__hud_launcher_frame__');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = '__hud_launcher_frame__';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
          }
          iframe.src = 'videohud://launch';
        } catch (_) {}
      }
    });

    browserAPI.runtime.sendMessage({ type: 'TRIGGER_WS_RECONNECT' });

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      const data = await fetchDashboardData(true);
      if (data && data.wsConnected) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        renderWebSocketBadge(true);
        if (btnText) btnText.textContent = t('btn_connect_hud');
        showPopupToast(t('toast_hud_connected'), 'success');
        refreshDashboard(true);
      } else if (attempts >= 7) {
        clearInterval(pollInterval);
        hudLaunchInProgress = false;
        if (btnText) btnText.textContent = t('btn_connect_hud');
        if (!data || !data.wsConnected) {
          renderWebSocketBadge(false);
          showPopupToast(t('toast_hud_failed'), 'danger');
        }
      }
    }, 1100);
  }

  const wsBadge = document.getElementById('wsStatusBadge');
  if (wsBadge) {
    wsBadge.addEventListener('click', handleConnectOrLaunchHUD);
  }

  const hubBadge = document.getElementById('hubStatusBadge');
  if (hubBadge) {
    let popupHubConnecting = false;
    hubBadge.addEventListener('click', () => {
      if (popupHubConnecting) return;
      popupHubConnecting = true;
      const hubText = document.getElementById('hubStatusText');
      if (hubText) hubText.textContent = (currentLang === 'hi') ? 'कनेक्ट हो रहा है...' : 'Connecting...';
      hubBadge.className = 'ws-badge starting';

      browserAPI.runtime.sendMessage({ type: 'LAUNCH_DATA_HUB' });
      showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub (पोर्ट 65433) से कनेक्ट किया जा रहा है...' : 'Connecting to SQLite Data Hub (port 65433)...', 'info');

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const res = await fetchDashboardData(true);
        if (res && res.dataHubConnected) {
          clearInterval(pollInterval);
          popupHubConnecting = false;
          renderDataHubBadge(true);
          showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub सफलतापूर्वक कनेक्ट हो गया!' : 'SQLite Data Hub connected successfully!', 'success');
          refreshDashboard(true);
        } else if (attempts >= 10) {
          clearInterval(pollInterval);
          popupHubConnecting = false;
          if (!res || !res.dataHubConnected) {
            renderDataHubBadge(false);
            showPopupToast((currentLang === 'hi') ? 'SQLite Data Hub से कनेक्ट नहीं हो सका' : 'Could not connect to SQLite Data Hub', 'danger');
          }
        }
      }, 500);
    });
  }

  const btnReconnectWs = document.getElementById('btnReconnectWs') || document.getElementById('btnConnectHud');
  if (btnReconnectWs) {
    btnReconnectWs.addEventListener('click', handleConnectOrLaunchHUD);
  }

  // 3. Switch to Active Media Tab (टैब स्विच) Button
  const btnSwitchMediaTab = document.getElementById('btnSwitchMediaTab');
  if (btnSwitchMediaTab) {
    btnSwitchMediaTab.addEventListener('click', () => {
      const pm = (activeMediaCached && activeMediaCached.tabId)
        ? activeMediaCached
        : (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia);
      const targetTabId = (pm && pm.tabId) ? pm.tabId : undefined;
      const targetWindowId = (pm && pm.windowId) ? pm.windowId : undefined;
      browserAPI.runtime.sendMessage({
        type: 'JUMP_TO_MEDIA_TAB',
        tabId: targetTabId,
        windowId: targetWindowId
      }, (res) => {
        if (res && res.success) {
          showPopupToast(t('toast_switched_tab'), 'success');
        } else {
          showPopupToast(t('toast_no_media_tab'), 'danger');
        }
      });
    });
  }

  // 4. Open Full Dashboard
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  if (btnOpenDashboard) {
    btnOpenDashboard.addEventListener('click', () => {
      const dashboardUrl = browserAPI.runtime.getURL('dashboard/dashboard.html');
      browserAPI.tabs.create({ url: dashboardUrl });
    });
  }

  // Media Controls
  const handleTogglePlay = () => {
    if (activeMediaCached) {
      activeMediaCached.isPlaying = !activeMediaCached.isPlaying;
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    sendMediaControl('toggle_play');
  };

  const dynamicStatusBtn = document.getElementById('dynamicStatusBtn');
  if (dynamicStatusBtn) dynamicStatusBtn.addEventListener('click', handleTogglePlay);

  const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');
  if (btnCtrlTogglePlay) btnCtrlTogglePlay.addEventListener('click', handleTogglePlay);

  const btnRewind = document.getElementById('btnCtrlRewind');
  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
        activeMediaCached.currentTime = Math.max(0, activeMediaCached.currentTime - 10);
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      sendMediaControl('seek_relative', { offsetSeconds: -10 });
    });
  }

  const btnForward = document.getElementById('btnCtrlForward');
  if (btnForward) {
    btnForward.addEventListener('click', () => {
      if (activeMediaCached && typeof activeMediaCached.currentTime === 'number') {
        activeMediaCached.currentTime = activeMediaCached.currentTime + 10;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      sendMediaControl('seek_relative', { offsetSeconds: 10 });
    });
  }

  const btnCtrlToggleMute = document.getElementById('btnCtrlToggleMute');
  if (btnCtrlToggleMute) {
    btnCtrlToggleMute.addEventListener('click', () => {
      if (activeMediaCached) {
        activeMediaCached.isMuted = !activeMediaCached.isMuted;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      sendMediaControl('toggle_mute');
    });
  }

  const btnQuickMute = document.getElementById('btnQuickMute');
  if (btnQuickMute) {
    btnQuickMute.addEventListener('click', () => {
      if (activeMediaCached) {
        activeMediaCached.isMuted = !activeMediaCached.isMuted;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }
      sendMediaControl('toggle_mute');
    });
  }

  const btnSpeedDown = document.getElementById('btnCtrlSpeedDown');
  if (btnSpeedDown) {
    btnSpeedDown.addEventListener('click', () => {
      const cur = (activeMediaCached && typeof activeMediaCached.playbackRate === 'number')
        ? activeMediaCached.playbackRate
        : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'down');

      if (activeMediaCached) {
        activeMediaCached.playbackRate = targetSpeed;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }

      const speedDisplay = document.getElementById('ctrlSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      const speedBadge = document.getElementById('mediaSpeedBadge');
      if (speedBadge) {
        speedBadge.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }

      sendMediaControl('step_speed', { direction: 'down', targetSpeed, step: -0.25 });
    });
  }

  const btnSpeedUp = document.getElementById('btnCtrlSpeedUp');
  if (btnSpeedUp) {
    btnSpeedUp.addEventListener('click', () => {
      const cur = (activeMediaCached && typeof activeMediaCached.playbackRate === 'number')
        ? activeMediaCached.playbackRate
        : 1.0;
      const targetSpeed = calculateNextLadderSpeed(cur, 'up');

      if (activeMediaCached) {
        activeMediaCached.playbackRate = targetSpeed;
        renderMediaCard({ primaryMedia: activeMediaCached });
      }

      const speedDisplay = document.getElementById('ctrlSpeedDisplay');
      if (speedDisplay) {
        speedDisplay.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }
      const speedBadge = document.getElementById('mediaSpeedBadge');
      if (speedBadge) {
        speedBadge.textContent = `⚡ ${targetSpeed.toFixed(2).replace(/\.00$/, '')}x`;
      }

      sendMediaControl('step_speed', { direction: 'up', targetSpeed, step: 0.25 });
    });
  }

  const btnFullscreen = document.getElementById('btnCtrlFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      sendMediaControl('toggle_fullscreen');
    });
  }

  const btnPip = document.getElementById('btnCtrlPip');
  if (btnPip) {
    btnPip.addEventListener('click', () => {
      sendMediaControl('toggle_pip');
    });
  }

  const btnTheater = document.getElementById('btnCtrlTheater');
  if (btnTheater) {
    btnTheater.addEventListener('click', () => {
      sendMediaControl('toggle_theater');
    });
  }

  const btnQualityDown = document.getElementById('btnCtrlQualityDown');
  if (btnQualityDown) {
    btnQualityDown.addEventListener('click', () => {
      sendMediaControl('step_quality', { direction: 'down' });
    });
  }

  const btnQualityUp = document.getElementById('btnCtrlQualityUp');
  if (btnQualityUp) {
    btnQualityUp.addEventListener('click', () => {
      sendMediaControl('step_quality', { direction: 'up' });
    });
  }

  // Progress Bar Seeking
  const progressContainer = document.getElementById('progressBarContainer');
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      if (!activeMediaCached || !activeMediaCached.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      activeMediaCached.currentTime = (pct / 100) * activeMediaCached.duration;
      activeMediaCached.progressPercent = pct;
      renderMediaCard({ primaryMedia: activeMediaCached });
      sendMediaControl('seek_percent', { percent: pct });
    });
  }

  // Volume Bar Scrubbing
  const volumeContainer = document.getElementById('volumeBarContainer');
  if (volumeContainer) {
    volumeContainer.addEventListener('pointerdown', (e) => {
      isDraggingVolume = true;
      try {
        volumeContainer.setPointerCapture(e.pointerId);
      } catch (_) {}
      updateVolumeFromEvent(e);
    });

    volumeContainer.addEventListener('pointermove', (e) => {
      if (isDraggingVolume) {
        updateVolumeFromEvent(e);
      }
    });

    const stopVolumeDrag = (e) => {
      if (isDraggingVolume) {
        isDraggingVolume = false;
        try {
          volumeContainer.releasePointerCapture(e.pointerId);
        } catch (_) {}
        updateVolumeFromEvent(e);
      }
    };

    volumeContainer.addEventListener('pointerup', stopVolumeDrag);
    volumeContainer.addEventListener('pointercancel', stopVolumeDrag);
  }
}

// Bootstrap Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  // Load language preference and browser filter from storage
  browserAPI.storage.local.get(['language', 'media_sentinel_settings', 'selected_browser_filter'], (res) => {
    let lang = 'en';
    if (res && res.language) {
      lang = res.language;
    } else if (res && res.media_sentinel_settings && res.media_sentinel_settings.language) {
      lang = res.media_sentinel_settings.language;
    }
    if (res && res.selected_browser_filter) {
      selectedBrowser = res.selected_browser_filter;
      const sel = document.getElementById('browserFilterSelect');
      if (sel) sel.value = selectedBrowser;
    }
    applyPopupLanguage(lang);
    refreshDashboard();
  });

  // High-frequency auto-refresh popup while open (every 1 second for live progress updates)
  setInterval(refreshDashboard, 1000);

  // Instant reactive updates via IPC broadcast
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'LIVE_MEDIA_UPDATE' && message.payload) {
      renderMediaCard(message.payload);
      handleAutoTabSwitching({ globalMediaState: message.payload });
    } else if (message && message.type === 'DATA_HUB_STATUS_CHANGED') {
      renderDataHubBadge(Boolean(message.connected));
      refreshDashboard(true);
    }
  });

  // Reactive Language and Browser Filter Synchronization across Dashboard & Popup
  browserAPI.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.language && changes.language.newValue) {
        applyPopupLanguage(changes.language.newValue);
      } else if (changes.media_sentinel_settings && changes.media_sentinel_settings.newValue && changes.media_sentinel_settings.newValue.language) {
        applyPopupLanguage(changes.media_sentinel_settings.newValue.language);
      }
      if (changes.selected_browser_filter && changes.selected_browser_filter.newValue) {
        selectedBrowser = changes.selected_browser_filter.newValue;
        const sel = document.getElementById('browserFilterSelect');
        if (sel) sel.value = selectedBrowser;
        refreshDashboard(false);
      }
    }
  });
});
