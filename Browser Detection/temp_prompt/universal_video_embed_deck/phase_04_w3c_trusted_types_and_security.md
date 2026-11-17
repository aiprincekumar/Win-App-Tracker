# Phase 4: W3C Trusted Types Policy Enforcement, Iframe Sandboxing & Security

> **Phase:** 04 of 05  
> **Target Subsystem:** `src/dashboard/features/embed_player_deck/security/`, `dashboard/dashboard.js`  
> **Associated Feature:** Universal Embedded Video Player Deck  
> **Lead Department:** Dept 10 AppSec & InfoSec & Dept 05 Frontend Engineering  
> **Prerequisites:** Phases 1 through 3 complete  
> **Gate Verification:** Security audit suite passing Trusted Types, Sandbox attributes, and origin validation  

---

## 🎯 1. Phase Objective

The objective of Phase 4 is to establish an uncompromising security perimeter for the Embedded Video Player Deck. Because the deck embeds third-party content within an extension dashboard, Phase 4 enforces:
1. **W3C Trusted Types Compliance:** Policy creation (`sentinel-embed-policy`) ensuring zero raw HTML string sinks.
2. **Strict Iframe Sandboxing:** Enforcing `sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"` and explicitly omitting `allow-top-navigation` to prevent iframe escape.
3. **Origin Whitelist Enforcement:** Rejecting unverified or dangerous external origins before iframes can be created.
4. **Lifecycle & CPU-Aware Sleep Integration:** Wiring the deck state transitions into `dashboard/dashboard.js`, automatically suspending the 60fps canvas visualizer loop when Deck mode is active.

---

## 📂 2. File Anchors & Prerequisites

- **Security Module to Author:**
  - `src/dashboard/features/embed_player_deck/security/trusted_types_policy.js`
- **Dashboard Controller Integration Anchor:**
  - [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js)
- **Visualizer Loop Hook Anchor:**
  - [`src/dashboard/features/media_deck_visualizer_feature.js#L1007-L1008`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L1007-L1008) (`startVisualizerLoop`, `stopVisualizerLoop`)
- **Unit Test Anchor:**
  - `tests/test_embed_security_policy.js`

---

## 🔨 3. Surgical Step-by-Step Implementation Instructions

### Step 4.1: Author `trusted_types_policy.js`
In `src/dashboard/features/embed_player_deck/security/trusted_types_policy.js`:
1. Register `sentinel-embed-policy` with `window.trustedTypes`.
2. Implement `createScriptURL`:
   - Validates that the input URL is a valid URL string.
   - Enforces `https:` protocol (or `http://localhost`).
   - Verifies that the host matches the allowed embed origin whitelist.
   - Rejects any disallowed protocol or unknown domain with `TypeError`.
3. Implement `createHTML`:
   - Rejects all string invocations with `TypeError('[SecurityViolation] Raw HTML injection is forbidden.')`.

### Step 4.2: Author Safe Iframe Factory Function
Implement `createSafeEmbedIframe(metadata, options)`:
```javascript
function createSafeEmbedIframe(metadata, options = {}) {
  const iframe = document.createElement('iframe');
  
  // Mandatory Sandbox Flags (Never allow-top-navigation or allow-modals)
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-forms');
  
  // Feature Policy / Permissions Policy
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  
  // Privacy & Leak Prevention
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('frameBorder', '0');
  iframe.className = 'embedded-deck-iframe';
  iframe.id = 'embeddedPlayerIframe';
  
  // Validate and assign src
  const safeSrc = SentinelSecurityPolicy.validateEmbedUrl(metadata.embedUrl);
  iframe.src = safeSrc;
  
  return iframe;
}
```

### Step 4.3: Wire Mode Switcher & CPU Sleep in `dashboard/dashboard.js`
In `dashboard/dashboard.js`:
1. Attach click listener to `#btnModeVisualizer` and `#btnModeEmbeddedDeck`.
2. When switching to `#btnModeEmbeddedDeck`:
   - Add `.hidden` to `#visualizerPanel`, remove `.hidden` from `#embeddedVideoDeckContainer`.
   - Update `aria-selected` attributes and `.active` classes.
   - Call `MediaDeckVisualizerFeature.stopVisualizerLoop()` to pause 60fps canvas FFT rendering.
3. When switching to `#btnModeVisualizer`:
   - If video is actively playing in the deck, send `pause` command via adapter.
   - Add `.hidden` to `#embeddedVideoDeckContainer`, remove `.hidden` from `#visualizerPanel`.
   - Update `aria-selected` attributes and `.active` classes.
   - Call `MediaDeckVisualizerFeature.startVisualizerLoop()` to resume 60fps FFT rendering.
4. Wire URL paste listener `#btnDeckPasteUrl` reading clipboard via `navigator.clipboard.readText()`.
5. Wire Load button `#btnDeckLoadVideo` calling `SentinelProviderRegistry.parse(url)`.

---

## 🚫 4. Architectural Boundaries & Constraints

- **Absolute Prohibition on `allow-top-navigation`:** The iframe sandbox MUST NOT include `allow-top-navigation` or `allow-top-navigation-by-user-activation` to guarantee the embedded player can never redirect the parent extension dashboard.
- **Zero InnerHTML Usage:** All DOM attachments must use `appendChild()`, `replaceChildren()`, or `textContent`.
- **Zero Unhandled Rejections:** Async clipboard reading and postMessage calls must be wrapped in `try/catch` or `.catch()` handlers.

---

## 📦 5. Deliverables Manifest

1. `src/dashboard/features/embed_player_deck/security/trusted_types_policy.js`
2. Updated `dashboard/dashboard.js` with mode switching and lifecycle management.
3. `tests/test_embed_security_policy.js` verifying Trusted Types and sandbox properties.

---

## 🚦 6. Local Verification Gate

Execute the following commands to certify completion of Phase 4:
```bash
# 1. Run security policy and sandbox attributes test suite
node tests/test_embed_security_policy.js
```
*Gate Success Condition: 100% security checks pass; iframe sandbox explicitly omits allow-top-navigation; zero unwhitelisted origins accepted.*
