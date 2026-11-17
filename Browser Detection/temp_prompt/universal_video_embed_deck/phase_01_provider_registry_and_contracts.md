# Phase 1: Provider Registry Abstraction & Extensible URL Parser Contracts

> **Phase:** 01 of 05  
> **Target Subsystem:** `src/dashboard/features/embed_player_deck/provider_registry.js`  
> **Associated Feature:** Universal Embedded Video Player Deck  
> **Lead Department:** Dept 02 Solution Architecture & Dept 05 Frontend Engineering  
> **Prerequisites:** Clean workspace, existing `media_deck_visualizer_feature.js` reference  
> **Gate Verification:** Node AST compile + unit test suite parsing 30+ URLs  

---

## 🎯 1. Phase Objective

The objective of Phase 1 is to establish a modular, decoupled **Provider Registry Architecture** (`SentinelProviderRegistry`) and high-precision **Universal Video URL Parser Engine**. This engine serves as the foundational data contract layer for the Embedded Video Player Deck, capable of parsing and extracting canonical IDs, timestamps, and metadata from 30+ URL variations across YouTube, Vimeo, Twitch, DailyMotion, and direct video file streams.

---

## 📂 2. File Anchors & Prerequisites

- **Primary Module to Author:**
  - [`src/dashboard/features/embed_player_deck/provider_registry.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/embed_player_deck/provider_registry.js)
- **Reference URL Detection Logic:**
  - [`src/dashboard/features/media_deck_visualizer_feature.js#L14-L29`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L14-L29) (`getPlatformFromUrl`)
- **Unit Test Harness:**
  - [`tests/test_embed_provider_registry.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_embed_provider_registry.js)

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 1.1: Create Module Directory Structure
Ensure directory `src/dashboard/features/embed_player_deck/` exists.

### Step 1.2: Author `provider_registry.js` with Universal Provider Interface
Author `src/dashboard/features/embed_player_deck/provider_registry.js` adhering to UMD/CommonJS module pattern:
```javascript
/**
 * Web Activity & Media Sentinel - Universal Video Provider Registry
 * Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
 */

(function (global) {
  'use strict';

  // Base Registry State
  const _providers = new Map();

  class SentinelProviderRegistry {
    /**
     * Registers a new provider adapter.
     * @param {Object} adapter
     */
    static register(adapter) {
      if (!adapter || !adapter.id || typeof adapter.canHandle !== 'function') {
        throw new TypeError('[ProviderRegistry] Invalid adapter interface');
      }
      _providers.set(adapter.id.toLowerCase(), adapter);
    }

    /**
     * Retrieves a registered adapter by ID.
     */
    static get(providerId) {
      return _providers.get(String(providerId).toLowerCase()) || null;
    }

    /**
     * Returns all registered provider IDs.
     */
    static getRegisteredIds() {
      return Array.from(_providers.keys());
    }

    /**
     * Resolves the matching adapter for a given URL.
     */
    static resolveAdapter(rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') return null;
      const url = rawUrl.trim();
      for (const adapter of _providers.values()) {
        if (adapter.canHandle(url)) {
          return adapter;
        }
      }
      return null;
    }

    /**
     * Universal Parser: Normalizes URL and extracts canonical video metadata.
     */
    static parse(rawUrl, options = {}) {
      if (!rawUrl || typeof rawUrl !== 'string') {
        return {
          valid: false,
          error: 'EMPTY_OR_INVALID_URL',
          rawUrl: rawUrl || ''
        };
      }

      const url = rawUrl.trim();
      const adapter = this.resolveAdapter(url);
      if (!adapter) {
        return {
          valid: false,
          error: 'UNSUPPORTED_PROVIDER',
          rawUrl: url
        };
      }

      try {
        const metadata = adapter.parse(url, options);
        return {
          valid: true,
          providerId: adapter.id,
          providerName: adapter.displayName || adapter.id,
          ...metadata
        };
      } catch (err) {
        return {
          valid: false,
          error: 'PARSE_FAILED',
          message: err.message,
          rawUrl: url
        };
      }
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentinelProviderRegistry;
  }
  global.SentinelProviderRegistry = SentinelProviderRegistry;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
```

### Step 1.3: Define Provider Parsing Rules & URL Regex Matrix
In the provider registry, define regex parsers covering:
1. **YouTube Patterns:**
   - Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Shortened: `https://youtu.be/VIDEO_ID`
   - Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
   - Embed: `https://www.youtube.com/embed/VIDEO_ID`
   - Timestamp query parameter: `?t=120s` or `&t=120`
2. **Vimeo Patterns:**
   - Standard: `https://vimeo.com/12345678`
   - Channels/Groups: `https://vimeo.com/channels/staffpicks/12345678`
   - Embed: `https://player.vimeo.com/video/12345678`
3. **Twitch Patterns:**
   - Live Channel: `https://www.twitch.tv/shroud`
   - Video VoD: `https://www.twitch.tv/videos/123456789`
   - Clip: `https://clips.twitch.tv/ClipSlug` or `https://www.twitch.tv/channel/clip/ClipSlug`
4. **Direct Video URLs:**
   - Extensions: `.mp4`, `.webm`, `.ogg`, `.m4v`, `.m3u8`

---

## 🚫 4. Architectural Boundaries & Constraints

- **Strict Out-of-Scope:** Do NOT touch `dashboard/dashboard.html` or DOM styling in this phase. Phase 1 is purely the decoupled provider registry engine and URL contracts.
- **Zero External Dependencies:** Do NOT import any external NPM packages; use native regex and browser/Node standard URL objects.
- **Zero InnerHTML:** Never output HTML strings from the parser.

---

## 📦 5. Deliverables Manifest

1. `src/dashboard/features/embed_player_deck/provider_registry.js` (Created with UTF-8 BOM).
2. `tests/test_embed_provider_registry.js` (Unit test verifying 30+ URLs).

---

## 🚦 6. Local Verification Gate

Execute the following commands to certify completion of Phase 1:
```bash
# 1. Verify Node AST compilation of provider registry
node -e "require('./src/dashboard/features/embed_player_deck/provider_registry.js'); console.log('Provider Registry AST OK');"

# 2. Run unit tests for 30+ URL permutations
node tests/test_embed_provider_registry.js
```
*Gate Success Condition: 100% test assertions pass with exit code 0.*
