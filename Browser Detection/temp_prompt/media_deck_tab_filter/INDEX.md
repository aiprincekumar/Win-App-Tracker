﻿# Multi-Tab Live Media Deck Tab Filtering: Master Tracking Board & Architecture Index

> **Document Type:** Live Phase Orchestration Index, Problem-Solution Dossier & Diagnostic Matrix  
> **Workspace Container:** temp_prompt/media_deck_tab_filter/  
> **Governing Architecture:** [PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (prompt_generation_specialist)  
> **Date:** 2026-11-17  
> **Target Task ID:** TASK-MEDIA-DECK-TAB-FILTER-001  
> **Target Scope:** Multi-Tab Live Media Deck filtering across content scripts, background worker, and dashboard visualizer.

---

## 📋 1. Executive Problem-Solution Dossier

### Problem Statement
In the Browser Detection extension, the Multi-Tab Live Media Deck feature (Feature 3 in Tab B / Media Analytics) is designed to aggregate and display interactive media control cards for all open browser tabs actively playing or holding audio/video media (e.g. YouTube, Spotify, Netflix, Twitch, Soundcloud, Bandcamp, local HTML5 video/audio).

However, currently the deck erroneously displays **ALL open browser tabs**—including completely non-media tabs such as **WhatsApp Web, Google Drive, Google Search, Wikipedia, documentation, and idle text pages**. This occurs due to flaws across multiple pipeline stages:
1. **Unconditional Telemetry Dispatch in Content Script (content_media.js):** In dispatchMediaTelemetry(), when top-level frames load, they transmit MEDIA_STATE_CHANGED even when currentState.hasMedia === false and no media elements exist on the page.
2. **Unfiltered Storage in Service Worker (ackground.js):** When the background service worker receives MEDIA_STATE_CHANGED, it executes 	abMediaMap.set(tabId, payload) indiscriminately, storing empty non-media payloads permanently in 	abMediaMap.
3. **Unfiltered Tab Aggregation (ackground.js - getAllActiveMediaStreams()):** In getAllActiveMediaStreams(), the function loops over every entry in 	abMediaMap (or (const [tabId, mediaState] of tabMediaMap.entries())) without checking mediaState.hasMedia, mediaState.primaryMedia, or playback state. It constructs a synthetic streamInfo object with playbackState: 'paused', currentTime: 0, and duration: 0 for every tracked tab, returning non-media tabs as valid streams to the dashboard.
4. **Lack of Presentation Filtering (media_deck_visualizer_feature.js):** The dashboard visualizer accepts whatever list ackground.js provides without validating that each card represents a bona fide media stream, polluting the user interface with irrelevant, non-interactive cards for messaging and search tabs.

### Architectural Solution
Implement a multi-tier defense-in-depth filtering architecture ensuring that only tabs with genuine, verifiable media are retained and rendered in the Multi-Tab Live Media Deck:
1. **Tier 1 - Content Script Reporting Guards (content_media.js):**
   - Enforce that top-level frames without any audio/video elements (mediaNodes.length === 0 and !anyPlaying and !hasMedia) do not dispatch ongoing telemetry messages that register them as active media holders.
   - When a tab transitions from having media to having no media (e.g., navigating away or removing player nodes), dispatch an explicit MEDIA_CLEARED event or payload with hasMedia: false to allow immediate cleanup.
2. **Tier 2 - Service Worker Ingestion & Aggregation Filtering (ackground.js):**
   - In onMessage handler for MEDIA_STATE_CHANGED: If a payload arrives with !payload.hasMedia && !payload.anyPlaying && !payload.primaryMedia, clean up any existing session (inalizeMediaSession(tabId)) and remove the tab from 	abMediaMap (	abMediaMap.delete(tabId)).
   - In getAllActiveMediaStreams(): Filter tabs strictly. Only include tabs where:
     Boolean(mediaState.hasMedia || (mediaState.primaryMedia && (mediaState.primaryMedia.src || mediaState.primaryMedia.title || mediaState.primaryMedia.duration > 0 || mediaState.primaryMedia.isPlaying)) || mediaState.anyPlaying || mediaState.isAudible).
     Completely skip non-media tabs.
   - Retain discovery of background audible tabs (chrome.tabs.query({ audible: true })) for tabs playing sound without explicit content script hooks.
3. **Tier 3 - Presentation Layer Validation & Empty State Handling (media_deck_visualizer_feature.js):**
   - In pollMultiTabMediaStreams and enderMultiTabMediaDeck: Validate stream objects to guarantee zero non-media cards leak into the DOM.
   - Ensure the empty state card (.deck-empty-state with 🎧 icon and friendly message) displays cleanly when only non-media tabs are open.
   - Update adgeActiveStreamsCount accurately to reflect true media stream counts.
4. **Tier 4 - Automated Verification & Regression Suite (	ests/test_media_deck_tab_filter.js):**
   - Create a dedicated automated test suite testing WhatsApp, Google Drive, and search page tab exclusion, alongside positive inclusion of YouTube, Spotify, and audible background tabs.
   - Verify zero regressions against 	ests/test_dashboard_features_phase2.js.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Focus & Scope | Assigned Role | Status | Test Gate | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Content Script Reporting Guards | Refine evaluatePageMediaState() and dispatchMediaTelemetry() in content_media.js to guard against empty media registrations | Level 4 Content Script Engineer | PENDING | 
ode -c content_media.js | Gate 1 Pending |
| **Phase 2** | Service Worker Ingestion & Filter | Update 	abMediaMap lifecycle and getAllActiveMediaStreams() in ackground.js to strictly exclude non-media tabs | Level 4 Background Services Engineer | PENDING | 
ode -c background.js | Gate 2 Pending |
| **Phase 3** | Dashboard Deck Visualizer Defense | Enhance src/dashboard/features/media_deck_visualizer_feature.js stream validation, badge counting, and empty state rendering | Level 4 Frontend Engineer | PENDING | 
ode -c src/dashboard/features/media_deck_visualizer_feature.js | Gate 3 Pending |
| **Phase 4** | QA Verification & Regression Tests | Author 	ests/test_media_deck_tab_filter.js and execute full regression battery across existing test suites | Level 4 QA Verification Tester | PENDING | 
ode tests/test_media_deck_tab_filter.js & full test suite | Gate 4 Pending |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | content_media.js | Top-level frames unconditionally dispatch MEDIA_STATE_CHANGED even when currentState.hasMedia === false, polluting background state | In dispatchMediaTelemetry(), suppress reporting if !currentState.hasMedia && !lastReportedState; if transitioning to no-media, send clean teardown payload | Reduces IPC noise; stops non-media tabs like WhatsApp from masquerading as media streams | Phase 1 | 
ode -c content_media.js |
| 2 | ackground.js | MEDIA_STATE_CHANGED listener stores payload in 	abMediaMap regardless of whether payload.hasMedia or primaryMedia exists | If !payload.hasMedia && !payload.anyPlaying && !payload.primaryMedia, remove 	abId from 	abMediaMap and finalize session | Keeps 	abMediaMap clean containing only tabs with actual active or paused media | Phase 2 | 
ode -c background.js |
| 3 | ackground.js | getAllActiveMediaStreams() iterates all 	abMediaMap entries without verifying media presence, synthesizing cards for non-media tabs | Add strict filter condition checking mediaState.hasMedia, mediaState.primaryMedia, nyPlaying, or isAudible before creating stream object | Excludes WhatsApp, Google Drive, search pages; returns only genuine media streams | Phase 2 | 	ests/test_media_deck_tab_filter.js |
| 4 | src/dashboard/features/media_deck_visualizer_feature.js | Dashboard visualizer renders all items in streams without secondary validation, showing cards even if background leaks non-media data | Add defensive validation filter in enderMultiTabMediaDeck() and pollMultiTabMediaStreams(); ensure empty state card displays when count is 0 | Guaranteed clean UI; zero empty or phantom cards; accurate stream badge counters | Phase 3 | 	ests/test_dashboard_features_phase2.js |
| 5 | 	ests/test_media_deck_tab_filter.js | No existing automated test suite asserts that non-media tabs (WhatsApp, Google Drive, search) are excluded from getAllActiveMediaStreams | Author comprehensive automated test suite mocking multiple tab configurations (YouTube, Spotify, WhatsApp, Drive, search, closed tabs) | Prevents regressions; provides deterministic terminal verification of tab filtering | Phase 4 | 
ode tests/test_media_deck_tab_filter.js |
| 6 | 	ests/test_dashboard_features_phase2.js | Battery 4 & 5 verify multi-tab discovery and deck rendering, needing validation that new filter logic does not break existing deck tests | Run test suite and ensure 100% pass rate across all 10 test batteries | Confirms full backward compatibility and zero regressions across Phase 2 features | Phase 4 | 
ode tests/test_dashboard_features_phase2.js |

---

## 🛡️ 4. Constitutional Invariants & Boundary Guards

1. **Paused Media Preservation Invariant:** Tabs holding paused media (e.g. YouTube video paused midway, Spotify track paused) **MUST REMAIN INCLUDED** in the media deck. The filter must distinguish between *non-media tabs* (zero media elements, no stream) and *paused media tabs* (valid media player, paused state, valid duration/title).
2. **Audible Background Discovery Invariant:** Tabs without content scripts that are actively producing sound (	ab.audible === true from chrome.tabs.query({ audible: true })) **MUST BE PRESERVED** and presented with audio stream indicator.
3. **W3C Trusted Types & MV3 CSP Invariant:** All visualizer DOM updates must maintain 100% strict compliance using document.createElement, 	extContent, and setAttribute. Strictly zero innerHTML or outerHTML.
4. **UTF-8 with BOM Standard:** All modified and created files must strictly adhere to the UTF-8 with BOM ( xEF, 0xBB, 0xBF) encoding standard.
5. **No Blind Poll Loops:** Tab polling in dashboard must respect existing interval timers and idle sleep sentinel loops without causing memory leaks or runaway CPU usage.