const fs = require('fs');
const path = require('path');

function writeUtf8Bom(filePath, text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  const content = Buffer.from(text, 'utf8');
  fs.writeFileSync(filePath, Buffer.concat([bom, content]));
}

// Ensure all subdirectories exist
fs.mkdirSync(path.join('popup', 'styles', 'tabs'), { recursive: true });
fs.mkdirSync(path.join('popup', 'styles', 'themes'), { recursive: true });
fs.mkdirSync(path.join('dashboard', 'styles', 'layout'), { recursive: true });
fs.mkdirSync(path.join('dashboard', 'styles', 'media'), { recursive: true });

// 1. Read sources
const tabsRaw = fs.readFileSync('popup/styles/tabs.css', 'utf8');
const themesRaw = fs.readFileSync('popup/styles/themes.css', 'utf8');
const layoutRaw = fs.readFileSync('dashboard/styles/layout.css', 'utf8');
const mediaRaw = fs.readFileSync('dashboard/styles/media.css', 'utf8');

const wellnessRaw = fs.readFileSync('popup/styles/wellness.css', 'utf8');
const audioLabRaw = fs.readFileSync('popup/styles/audio_lab.css', 'utf8');
const qsRaw = fs.readFileSync('popup/styles/quick_settings.css', 'utf8');

const tabsLines = tabsRaw.split('\n');
const themesLines = themesRaw.split('\n');
const layoutLines = layoutRaw.split('\n');
const mediaLines = mediaRaw.split('\n');
const wellnessLines = wellnessRaw.split('\n');
const audioLabLines = audioLabRaw.split('\n');
const qsLines = qsRaw.split('\n');

function slice(lines, start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// ============================================================================
// 1. POPUP TABS DECOMPOSITION (popup/styles/tabs/)
// ============================================================================

// tab_activity.css (Activity tracker tab styles: Domain Breakdown Section)
const tabActivityContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 5: Activity Tracking Styles',
  ' * File: popup/styles/tabs/tab_activity.css',
  ' * Domain Breakdown Section, Search Filters, Favicon Lists & Activity Meters',
  ' */',
  '',
  slice(tabsLines, 902, 1193).trim()
].join('\n') + '\n';

// tab_media.css (Media controls, video/audio cards, volume, playback speed)
const tabMediaContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 1: Live Media Player Styles',
  ' * File: popup/styles/tabs/tab_media.css',
  ' * Live Media Sentinel Card, Dynamic Playback Controls, Volume & Speed Stepper',
  ' */',
  '',
  slice(tabsLines, 145, 774).trim()
].join('\n') + '\n';

// tab_analytics.css (Analytics, charts, category breakdown)
const tabAnalyticsContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 6: Analytics & Domain Charts',
  ' * File: popup/styles/tabs/tab_analytics.css',
  ' * Interactive Donut Chart, Temporal Navigation Sub-Tabs & Statistics Pills',
  ' */',
  '',
  slice(tabsLines, 775, 901).trim()
].join('\n') + '\n';

// tab_automations.css (Smart automations, rules, studio vault, notes, clips)
const tabAutomationsContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 3: Studio, Vault & Smart Automations',
  ' * File: popup/styles/tabs/tab_automations.css',
  ' * Studio Vault, Bookmarks, Timed Clips, Screenshot Gallery, Resume Playback & Smart Rules',
  ' */',
  '',
  slice(tabsLines, 1194, 1434).trim(),
  '',
  '/* Sub-Cards & Smart Automations Card */',
  slice(qsLines, 286, 394).trim()
].join('\n') + '\n';

// tab_wellness.css (Digital wellness, doomscroll alert)
const tabWellnessContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 4: Digital Wellness & Focus Styles',
  ' * File: popup/styles/tabs/tab_wellness.css',
  ' * Focus Ratio Card, Productive / Entertainment Meters & Doomscroll Breaker Alert',
  ' */',
  '',
  slice(wellnessLines, 340, 440).trim()
].join('\n') + '\n';

// tab_audio_lab.css (Audio lab, EQ, bass boost)
const tabAudioLabContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Tab 2: Audio Lab & DSP Styles',
  ' * File: popup/styles/tabs/tab_audio_lab.css',
  ' * Audio Card, Bass Boost Range Slider, 5-Band Graphic EQ & Sound Enhancements',
  ' */',
  '',
  slice(audioLabLines, 7, 231).trim()
].join('\n') + '\n';

// Write all 6 tab files
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_activity.css'), tabActivityContent);
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_media.css'), tabMediaContent);
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_analytics.css'), tabAnalyticsContent);
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_automations.css'), tabAutomationsContent);
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_wellness.css'), tabWellnessContent);
writeUtf8Bom(path.join('popup', 'styles', 'tabs', 'tab_audio_lab.css'), tabAudioLabContent);

console.log('✅ 6 Tab files written to popup/styles/tabs/');

// Aggregate popup/styles/tabs.css
const navBaseContent = slice(tabsLines, 7, 144).trim();

const aggregatedTabsContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Navigation & Views',
  ' * File: popup/styles/tabs.css',
  ' * 6-Tab Single-Word Navigation, Active Indicators, Media Player Card, Donut Chart & Domain List',
  ' * Aggregates granular sub-tab stylesheets from popup/styles/tabs/',
  ' */',
  '',
  "@import './tabs/tab_activity.css';",
  "@import './tabs/tab_media.css';",
  "@import './tabs/tab_analytics.css';",
  "@import './tabs/tab_automations.css';",
  "@import './tabs/tab_wellness.css';",
  "@import './tabs/tab_audio_lab.css';",
  '',
  navBaseContent,
  '',
  slice(tabsLines, 145, 1434).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('popup', 'styles', 'tabs.css'), aggregatedTabsContent);
console.log('✅ popup/styles/tabs.css updated with @imports and aggregation');

// ============================================================================
// 2. POPUP THEMES DECOMPOSITION (popup/styles/themes/)
// ============================================================================

// dark_glass.css (Cybernetic dark glassmorphic theme & high contrast mode)
const darkGlassContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Cybernetic Dark Glassmorphic Theme',
  ' * File: popup/styles/themes/dark_glass.css',
  ' * Dark Mode Substrates, Specular Highlights & High Contrast Mode Accessibility (WCAG AAA)',
  ' */',
  '',
  slice(themesLines, 7, 123).trim()
].join('\n') + '\n';

// light_contrast.css (Light contrast theme WCAG AA/AAA)
const lightContrastContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Light Mode High Contrast Theme',
  ' * File: popup/styles/themes/light_contrast.css',
  ' * Comprehensive Light Mode Overrides (WCAG AA/AAA Contrast & Readability Certified)',
  ' */',
  '',
  slice(themesLines, 124, 1302).trim()
].join('\n') + '\n';

// palettes.css (Dynamic color accent palettes)
const palettesContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Dynamic Color Accent Palettes',
  ' * File: popup/styles/themes/palettes.css',
  ' * Dynamic Color Accent Palettes (Emerald, Cyan, Sky, Purple, Amber, Rose) & Glow Systems',
  ' */',
  '',
  '/* Dynamic Accent Palettes & Active Accent Tokens */',
  ':root,',
  '[data-palette="emerald"] {',
  '  --accent-primary: #10b981;',
  '  --accent-primary-glow: rgba(16, 185, 129, 0.25);',
  '  --color-accent: #10b981;',
  '  --color-accent-glow: rgba(16, 185, 129, 0.25);',
  '}',
  '',
  '[data-palette="cyan"] {',
  '  --accent-primary: #06b6d4;',
  '  --accent-primary-glow: rgba(6, 182, 212, 0.25);',
  '  --color-accent: #06b6d4;',
  '  --color-accent-glow: rgba(6, 182, 212, 0.25);',
  '}',
  '',
  '[data-palette="purple"] {',
  '  --accent-primary: #8b5cf6;',
  '  --accent-primary-glow: rgba(139, 92, 246, 0.25);',
  '  --color-accent: #8b5cf6;',
  '  --color-accent-glow: rgba(139, 92, 246, 0.25);',
  '}',
  '',
  '[data-palette="amber"] {',
  '  --accent-primary: #f59e0b;',
  '  --accent-primary-glow: rgba(245, 158, 11, 0.25);',
  '  --color-accent: #f59e0b;',
  '  --color-accent-glow: rgba(245, 158, 11, 0.25);',
  '}',
  '',
  '[data-palette="rose"] {',
  '  --accent-primary: #f43f5e;',
  '  --accent-primary-glow: rgba(244, 63, 94, 0.25);',
  '  --color-accent: #f43f5e;',
  '  --color-accent-glow: rgba(244, 63, 94, 0.25);',
  '}',
  '',
  '/* Palette Utility Classes */',
  '.palette-emerald { --accent-active: #10b981; }',
  '.palette-cyan { --accent-active: #06b6d4; }',
  '.palette-purple { --accent-active: #8b5cf6; }',
  '.palette-amber { --accent-active: #f59e0b; }',
  '.palette-rose { --accent-active: #f43f5e; }'
].join('\n') + '\n';

writeUtf8Bom(path.join('popup', 'styles', 'themes', 'dark_glass.css'), darkGlassContent);
writeUtf8Bom(path.join('popup', 'styles', 'themes', 'light_contrast.css'), lightContrastContent);
writeUtf8Bom(path.join('popup', 'styles', 'themes', 'palettes.css'), palettesContent);

console.log('✅ 3 Theme files written to popup/styles/themes/');

// Aggregate popup/styles/themes.css
const aggregatedThemesContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Popup Themes & High Contrast Styles',
  ' * File: popup/styles/themes.css',
  ' * Defect 16: High Contrast Mode & Comprehensive Light Mode Overrides (WCAG AA Certified)',
  ' * Aggregates modular theme stylesheets from popup/styles/themes/',
  ' */',
  '',
  "@import './themes/dark_glass.css';",
  "@import './themes/light_contrast.css';",
  "@import './themes/palettes.css';",
  '',
  slice(themesLines, 7, 1302).trim(),
  '',
  '/* ========================================================================= */',
  '/* Dynamic Accent Palettes & Active Accent Tokens                            */',
  '/* ========================================================================= */',
  palettesContent.trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('popup', 'styles', 'themes.css'), aggregatedThemesContent);
console.log('✅ popup/styles/themes.css updated with @imports and aggregation');

// ============================================================================
// 3. DASHBOARD LAYOUT DECOMPOSITION (dashboard/styles/layout/)
// ============================================================================

// header_sidebar.css (Header, status badges, sidebar nav)
const headerSidebarContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Header & Sidebar Navigation',
  ' * File: dashboard/styles/layout/header_sidebar.css',
  ' * Reset, Global App Grid, Sticky Sidebar, Top App Bar & Status Badges',
  ' */',
  '',
  slice(layoutLines, 7, 33).trim(),
  '',
  slice(layoutLines, 34, 278).trim(),
  '',
  slice(layoutLines, 279, 589).trim(),
  '',
  slice(layoutLines, 1162, 1260).trim()
].join('\n') + '\n';

// bento_grid.css (Bento grid container, metric cards)
const bentoGridContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Bento Grid & Modular Cards',
  ' * File: dashboard/styles/layout/bento_grid.css',
  ' * 12-Column Bento Grid Container, Metric Cards, Zero CLS Shimmer Loaders & Settings Grid',
  ' */',
  '',
  slice(layoutLines, 590, 706).trim(),
  '',
  slice(layoutLines, 738, 769).trim(),
  '',
  slice(layoutLines, 770, 1161).trim()
].join('\n') + '\n';

// responsive.css (Responsive media queries & mobile viewports)
const responsiveContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Responsive Breakpoints & Viewports',
  ' * File: dashboard/styles/layout/responsive.css',
  ' * Responsive Media Queries, Column Collapse Rules & Mobile Screen Adaptations',
  ' */',
  '',
  slice(layoutLines, 707, 737).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'styles', 'layout', 'header_sidebar.css'), headerSidebarContent);
writeUtf8Bom(path.join('dashboard', 'styles', 'layout', 'bento_grid.css'), bentoGridContent);
writeUtf8Bom(path.join('dashboard', 'styles', 'layout', 'responsive.css'), responsiveContent);

console.log('✅ 3 Layout files written to dashboard/styles/layout/');

// Aggregate dashboard/styles/layout.css
const aggregatedLayoutContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Dashboard Layout & Structure',
  ' * File: dashboard/styles/layout.css',
  ' * Reset, Grid Layout, Sidebar Navigation, Bento Container & Shimmer Loaders',
  ' * Aggregates modular layout stylesheets from dashboard/styles/layout/',
  ' */',
  '',
  "@import './layout/header_sidebar.css';",
  "@import './layout/bento_grid.css';",
  "@import './layout/responsive.css';",
  '',
  slice(layoutLines, 7, 1260).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'styles', 'layout.css'), aggregatedLayoutContent);
console.log('✅ dashboard/styles/layout.css updated with @imports and aggregation');

// ============================================================================
// 4. DASHBOARD MEDIA DECOMPOSITION (dashboard/styles/media/)
// ============================================================================

// hero_player.css (Hero player widget, album art, play controls)
const heroPlayerContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Hero Media Player Widget',
  ' * File: dashboard/styles/media/hero_player.css',
  ' * Live Player Hero Card, Album Artwork, Transport Controls & Playback Speed Stepper',
  ' */',
  '',
  slice(mediaLines, 7, 640).trim()
].join('\n') + '\n';

// scrubber_controls.css (Volume scrubber, timeline seek bar)
const scrubberControlsContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Timeline Scrubber & Volume Controls',
  ' * File: dashboard/styles/media/scrubber_controls.css',
  ' * Precision Timeline Scrubber, Elastic Slider Thumb Physics, Volume Track & Tooltips',
  ' */',
  '',
  slice(mediaLines, 641, 836).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'styles', 'media', 'hero_player.css'), heroPlayerContent);
writeUtf8Bom(path.join('dashboard', 'styles', 'media', 'scrubber_controls.css'), scrubberControlsContent);

console.log('✅ 2 Media files written to dashboard/styles/media/');

// Aggregate dashboard/styles/media.css
const aggregatedMediaContent = [
  '/**',
  ' * Sentinel Web Activity & Media Sentinel - Media Player & Scrubber Styles',
  ' * File: dashboard/styles/media.css',
  ' * Tab B: Live Media Player Hero Card, Precision Timeline Scrubber & Volume Controls',
  ' * Aggregates modular media stylesheets from dashboard/styles/media/',
  ' */',
  '',
  "@import './media/hero_player.css';",
  "@import './media/scrubber_controls.css';",
  '',
  slice(mediaLines, 7, 836).trim()
].join('\n') + '\n';

writeUtf8Bom(path.join('dashboard', 'styles', 'media.css'), aggregatedMediaContent);
console.log('✅ dashboard/styles/media.css updated with @imports and aggregation');

console.log('🎉 All 14 modular files written cleanly!');
