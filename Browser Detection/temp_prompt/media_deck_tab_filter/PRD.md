# Product Requirements Document (PRD): Multi-Tab Live Media Deck Filtering

> **Task ID:** TASK-MEDIA-DECK-TAB-FILTER-001  
> **Workspace Container:** temp_prompt/media_deck_tab_filter/  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (prompt_generation_specialist)  
> **Date:** 2026-11-17  

---

## 1. Executive Summary & Objective
The Multi-Tab Live Media Deck in the Browser Detection dashboard provides users with unified multi-stream playback controls, volume scrubbers, and Solo Mode toggles across all open media tabs.

Currently, non-media tabs (such as WhatsApp Web, Google Drive, Google Search, Wikipedia, and developer documentation) populate the deck as idle cards with 0:00 duration and disabled scrubbers, cluttering the interface and confusing the user. The goal of this product enhancement is to ensure that **ONLY tabs containing genuine audio/video media (playing or paused) or producing audible sound are presented in the Live Media Deck**.

---

## 2. User Personas & Problem Scenarios

### User Personas:
1. **Multi-Tasking Power User:** Typically has 30+ tabs open (research, docs, email, WhatsApp, multiple YouTube videos, Spotify). Uses the Live Media Deck to monitor and solo audio from specific streams.
2. **Audio/Media Producer:** Uses the deck to isolate audio streams, adjust individual tab volumes, and visualize waveforms without non-media clutter.

### Problem Scenario:
A user opens Tab B (Media Analytics) in the dashboard. Instead of seeing their 2 active media streams (a YouTube tutorial and a Spotify playlist), they see 15 cards including Google Drive, WhatsApp Web, 5 search queries, and documentation pages. The user cannot quickly find their media cards and must scroll through phantom entries.

---

## 3. INVEST User Stories

- **US-01 (Clean Deck View):** As a user with many tabs open, I want the Multi-Tab Live Media Deck to display only tabs that actually have media, so that I don't have to scroll past non-media tabs like WhatsApp or Google Drive.
- **US-02 (Paused Media Retention):** As a user listening to music or watching a video, I want paused media tabs to remain in the deck, so that I can resume playback remotely without switching back to that tab.
- **US-03 (Accurate Stream Count):** As a user, I want the active stream badge counter (#badgeActiveStreamsCount) to reflect only true media tabs, so that the status count matches what is visible in the deck.
- **US-04 (Friendly Empty State):** As a user with no media playing or loaded across any tab, I want to see a friendly empty state card explaining that no active media streams were detected, rather than broken cards.

---

## 4. MoSCoW Feature Prioritization

- **Must Have (P0):**
  - Complete exclusion of non-media tabs (WhatsApp Web, Google Drive, search engines, text articles) from getAllActiveMediaStreams().
  - Retention of tabs with active audio/video or paused media elements with valid duration/source.
  - Retention of audible background tabs discovered via chrome.tabs.query({ audible: true }).
  - Correct badge count on #badgeActiveStreamsCount.
  - Clean empty state presentation when zero media streams exist.
- **Should Have (P1):**
  - Content script optimization to suppress unnecessary IPC broadcasts from non-media top frames.
  - Automatic teardown of media sessions when a tab navigates from a media page to a non-media page.
- **Could Have (P2):**
  - Custom domain tagging for emerging podcast and Web Audio platforms.
- **Won't Have (This Iteration):**
  - Modification of background Native Messaging bridge or SQLite activity database schemas.

---

## 5. Given-When-Then Acceptance Criteria

### Scenario 1: Non-Media Tab Filtering
- **Given** open browser tabs for WhatsApp Web, Google Drive, and Google Search,
- **When** DASHBOARD_GET_ALL_MEDIA_STREAMS is requested or pollMultiTabMediaStreams() executes,
- **Then** none of these tabs shall appear in the returned streams array, and no cards shall be rendered for them in the media deck.

### Scenario 2: Active & Paused Media Tab Ingestion
- **Given** an open tab playing a YouTube video and another open tab with a paused Vimeo video,
- **When** getAllActiveMediaStreams() executes,
- **Then** both tabs shall be included in the streams array with their respective titles, favicons, durations, and playback states ('playing' and 'paused').

### Scenario 3: Audible Background Tab Detection
- **Given** an open tab producing sound via Web Audio API where no standard HTMLMediaElement is attached,
- **When** rowserAPI.tabs.query({ audible: true }) reports the tab,
- **Then** the tab shall be included in the media deck with isAudible: true and an audio stream badge.

### Scenario 4: All Tabs Closed / Non-Media State
- **Given** all open tabs are non-media pages (or all media tabs are closed),
- **When** the dashboard renders the Multi-Tab Media Deck,
- **Then** the container #multiTabMediaContainer shall render the .deck-empty-state element with friendly text and #badgeActiveStreamsCount shall display "0 active streams".