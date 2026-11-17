## [unreleased]

### 🚀 Features

- *(refactor)* Dynamic path resolution across batch launchers, powershell scripts, and python modules
- *(init)* Initialize Win App Tracker as standalone repository with dynamic architecture, comprehensive .gitignore, and documentation
- *(popup)* Synchronize SQLite Data Hub analytics, domain distribution, and multi-browser filter into extension popup
- *(dashboard,popup)* Display all-time total seconds and domain distribution across midnight rollover
- *(dashboard)* Add tracking mode selector, internal schemes filter, and dual pills presentation
- *(popup)* Add tracking method selector, category filter, and mini internal scheme badges
- *(qa)* Implement 10-suite sleep timer and UI controls verification suite, integrate modern SVG toolbar and popover markup
- *(core)* Bump extension version to 2.4.9 and enhance fullscreen toggle with frame traversal and keyboard dispatch
- *(media)* Complete iframe fullscreen policy enforcement and test coverage
- *(popup)* Implement strict single-row action footer toolbar
- *(popup)* Add single-row time tracking pause/resume button and service worker state
- *(media)* Implement dedicated modular fullscreen_controller with guaranteed web fullscreen and in-page native gesture HUD button
- *(popup)* Integrate 4-pillar hub UI layout, quick settings dialog, and smart automation controls
- *(popup)* Add CSS styles for 4-pillar hub navigation, quick settings, audio lab, and studio panes
- *(popup)* Implement comprehensive 4-pillar hub architecture UI and UX
- *(popup)* Implement 6-tab single-word UI/UX architecture and dedicated view panels
- *(popup)* Arrange sound enhancements controls in single horizontal row
- *(popup)* Convert header status badges to ultra-compact icon-only interactive controls
- *(a11y)* Add keyboard navigation and accessible starting state labels for header badges
- *(popup)* Redesign smart automations card into compact 2-row layout matching sound enhancements
- *(popup)* Add dark mode and light mode header toggle button
- *(popup)* Implement Phase 1 quick settings dynamic sync, sound chime, and high contrast styling
- *(automations)* Implement Phase 2 auto-pause on new tab, ad silencer, and domain speed memory
- *(wellness)* Implement Phase 3 doomscroll breaker alarm and desktop notification engine
- *(studio)* Implement Phase 4 precision canvas video screenshot and closed tab media revival
- *(audiolab)* Implement Phase 5 Web Audio DSP pipeline, video blanking, EQ presets, and data hub launcher
- *(dashboard)* Implement Phase 1 sleep timer and inactivity sentinel UI and storage binding (defects 01-08)
- *(dashboard)* Implement RFC 4180 CSV export standards and OWASP DDE formula injection mitigation
- *(dashboard)* Implement Phase 3 window focus restoration & sqlite hub reconnect resilience (defects 11-13)
- *(background)* Optimistic tab media control state synchronization
- *(dashboard)* Expand bilingual i18n parity and centralized dictionary for sleep settings (Defect 14)
- *(dashboard)* Complete Phase 5 visual accessibility, WCAG AA tokens & Audio Lab DSP parity (Defects 15-17)
- *(dashboard)* Full 5-band graphic equalizer, EQ presets & audio lab DSP feature parity (Defect 15 Deep Parity)
- *(dashboard)* Implement Phase 1 bento grid layout and iOS 26 liquid glass theme tokens
- *(dashboard)* Implement Phase 2 omni command palette and ergonomic hotkeys
- *(dashboard)* Implement Phase 3 precision scrubber and kinetic rollers
- *(dashboard)* Implement 4-phase iOS 26 liquid glass & bento grid ui/ux enhancement (phases 1-4)
- *(dashboard)* Unify hero media seek slider and progress bar into single timeline
- *(dashboard)* Extract 5-band equalizer into dedicated bento liquid glass card and streamline audio lab widget
- *(dashboard)* Execute Dashboard Future UI/UX Enhancement suite phases 1-5 with iOS 26 Liquid Glass, Bento Grid, Omni Command Palette, Precision Scrubber, and Synthesized Audio Haptics
- *(styles)* Implement modular css architecture for dashboard and popup with full zero-build backward compatibility
- *(phase-05)* Deconstruct popup.js into modular domain subsystems under src/popup/ and certify html views
- *(styles)* Decompose heavy modular stylesheets into granular domain sub-modules with zero-build backward compatibility
- *(features)* Establish universal modular feature registry for upcoming feature expansion
- *(dashboard)* Implement Phase 1 temporal engine and productivity classifier (Features 1 & 2)
- *(dashboard)* Implement Phase 2 multi-tab media deck and audio visualizer (Features 3 & 4)
- *(dashboard)* Implement Phase 3 backup, snapshots, SQLite hub sync and executive digest (Features 5 & 6)
- *(dashboard)* Implement Phase 4 wellbeing sentinel, annotations and blacklist (Features 7 & 8)
- *(ui/ux)* Phase 1 Bento Grid 5-metric subgrid & export dropdown restoration
- *(ui/ux)* Phase 2 Sidebar de-clutter & Top Bar Pomodoro pill popover
- *(ui/ux)* Phase 3 Compact Chrono Heatmap & Domain Table badge popover
- *(ui/ux)* Phase 4 Media chip strip, ambient visualizer & settings modular CSS
- *(dashboard)* Implement UI/UX restoration v4 phases 1-4 (decongestion, 4th tab, scrubber alignment, liquid glass polish)
- *(dashboard)* Style Advanced Backup, Snapshots & SQLite Hub buttons with liquid-glass theme and WCAG parity
- *(dashboard)* Polish settings and hardware bridge telemetry button styles
- *(ui)* Compact sidebar status HUD cards and preserve telemetry DOM contracts
- *(dashboard)* Complete Phase 1 and 2 of Hardware Bridges UI/UX overhaul and telemetry parity
- *(visualizer)* Apply iOS 26 liquid glass styling and dark theme capsule controls to visualizer and eq studio deck

### 🐛 Bug Fixes

- *(ui,hub,hud)* Fix header clipping, dynamic path resolution, and auto-service launch
- *(data-hub)* Resolve 30s idle disconnect, force-reconnect hanging sockets, and add responsive polling
- *(timer)* Resolve stuck active tab timer on dashboard/internal tabs and implement dual foreground/background media tracking
- *(analytics)* Filter cards, donut chart, and stats pills by domain category and treat 127.0.0.1/localhost as internal
- *(tracking)* Restore mode-specific filtering, compact dropdown UI labels, and add audible background media tracking
- *(tracking)* Mode-aware empty states, startup audible sweep, and resilient background media tracking
- *(system)* Eliminate popup.js syntax error and add HTTP dashboard route to Data Hub
- *(popup)* Eliminate popup.js syntax error regression, bump version to 2.4.1, and add syntax integrity test
- *(ui)* Overhaul popup domain breakdown layout, filters toolbar, domain cards, and action footer
- *(background)* Guard tabs.sendMessage and runtime.sendMessage against unhandled receiving end promise rejections, bump version to 2.4.2
- *(background)* Throttle WebSocket reconnection with capped exponential backoff and offline pause to eliminate ERR_CONNECTION_REFUSED spam, bump version to 2.4.3
- *(background)* Implement silent HTTP pre-flight probe before WebSocket connection to eliminate net::ERR_CONNECTION_REFUSED on offline Data Hub, bump version to 2.4.4
- *(osd)* Replace innerHTML with safe DOM creation in showOSD to eliminate TrustedHTML CSP violations on YouTube, bump version to 2.4.5
- *(media)* Preserve transient user activation for Fullscreen and PiP gestures, eliminate buggy miniplayer fallback, bump version to 2.4.6
- *(media)* Eliminate PiP double-trigger race condition and Edge synthetic fullscreen unavailable error, bump version to 2.4.7
- *(media)* Enable direct HTML5 video manipulation in content script and native key 'f' fullscreen fallback, bump version to 2.4.8
- *(ui)* Eliminate footer toolbar button clipping with 2-tier responsive layout
- *(media)* Resolve embedded iframe fullscreen unavailable error via allow attribute injection and cross-frame messaging
- *(media)* Fix fullscreen, theater mode, resolution, and playback speed controls with main-world tri-channel bridge and bump version to 2.5.0
- *(player)* Trigger native YouTube video player fullscreen instead of window F11
- *(media)* Resolve fullscreen toggle failure on YouTube with robust CSS web fullscreen and deduplicated dispatch
- *(controls)* Restore volume slider, timeline scrubbing seek and reliable web fullscreen
- *(fullscreen)* Resolve popup and dashboard fullscreen trigger with robust container targeting and cross-world aliases
- *(popup)* Update popup.html markup for six tab architecture
- *(fullscreen)* Fix nativeTriggered blocking applyWebFs in popup and dashboard fullscreen controls
- *(popup)* Ensure outside click check handles svg child elements of quick settings button
- *(popup)* Resolve default today time rendering and second row stats pills hydration
- *(ui)* Enhance light mode text readability and color contrast for WCAG AA compliance
- *(iframe)* Eliminate Chrome Blink precedence warnings by prioritizing modern Permissions Policy
- *(media-controls)* Route popup controls and link fullscreen to on-video overlay button
- *(popup)* Direct main world execution for single-tab play/pause toggle
- *(popup)* Enforce single-dispatch determinism and main world execution for media controls 1 to 5
- *(popup)* Lock optimistic media cooldown and eliminate controls flicker
- *(popup)* Preserve activeMediaCached play state during toggle
- *(popup)* Debounce seek relative and telemetry refresh
- *(popup)* Lock mute and speed toggle telemetry debounce
- *(popup)* Dispatch sendMediaControl unconditionally and target top frame
- *(media)* Enforce single-execution determinism in popup and content script
- *(bridge)* Resolve mute double-inversion, bridge fallback dead-end, and popup tabId resolution
- *(popup)* Define formatTime alias to formatVideoTime to resolve ReferenceError
- *(actuation)* Restore direct 0ms MAIN world scripting in popup button handlers and unblock content fallback
- *(content_media)* Implement extension context invalidation guards and graceful teardown
- *(media)* Implement explicit idempotent play/pause and mute/unmute with strict mutual exclusion
- *(popup)* Align PiP and fullscreen to deterministic single-execution pattern eliminating double-toggle bug
- *(dashboard)* Center timeline scrubber thumb vertically on progress track
- *(fullscreen)* Eliminate synthetic event disparity and false-positive OSD with reliable web fallback
- *(fullscreen)* Eliminate blackout fallback and enable multi-frame video targeting
- *(content_media)* Bulletproof extension context invalidation guards, timers, and IPC
- *(fullscreen)* Restore native monitor fullscreen in popup mode and eliminate web blackout
- *(qa)* Repair template string syntax in src/content and enforce UTF-8 BOM standard
- *(tests)* Enforce UTF-8 with BOM encoding across 24 test suites for Universal Rule 5/8 compliance
- *(uiux)* Resolve top-bar DOM nesting defect and compact controls into 28px icon-pills
- *(dashboard)* Correct theme tokens, add .sr-only utility, fix header squish, and tighten layout gap

### 📚 Documentation

- *(changelog)* Update CHANGELOG.md via git-cliff for v2.4.8
- *(specs)* Archive phase-wise prompt architecture and specifications for sleep timer and UI controls suite
- *(spec)* Add six_tab_popup_architecture phased prompts and specification artifacts
- *(refactor)* Update INDEX.md phase checklist to Grade A+ Certified
- *(refactor)* Track all modular architecture refactor specifications in temp_prompt/
- Add popup non-working functions inventory and phased implementation roadmap
- *(memory)* Synchronize project feature memory ledger for Phase 4 Studio Vault completion
- *(prompts)* Architect phase-wise execution framework for media controls and fullscreen fix
- *(memory)* Update project feature memory and changelog for media controls and fullscreen fix
- *(dashboard)* Author non-working functions inventory and phased implementation roadmap
- *(prompts)* Author ephemeral prompt architecture for popup media controls 1 to 5 fix
- *(memory)* Certify Phase 2 Grade A+ QA sign-off for defects 09 and 10 in project_feature_memory
- *(memory)* Update project_feature_memory with Phase 3 defects 11-13 certified
- *(memory)* Update project_feature_memory with Phase 3 defects 11-13 QA signoff certified
- *(memory)* Update project_feature_memory with Phase 4 defect 14 QA signoff certified
- *(qa)* Certify Phase 3 QA verification, update memory ledgers, and align test suites
- *(ephemeral)* Add Phase 5 execution prompt blueprint in temp_prompt
- *(memory)* Update project feature memory and ephemeral prompt completion
- *(dashboard)* Author master future features & UI/UX enhancement prompt specifications
- *(sync)* Update diagnostic matrix Defect 16, gate ledger, and phase tracking board
- *(memory)* Document Defect 50 extension context invalidation guards in diagnostic matrix
- *(memory)* Update state ledger and diagnostic matrix with Defect 50 and 51
- *(spec)* Commit phase prompt specifications and live tracking boards for direct scripting parity and dashboard uiux
- *(tracking)* Update project feature memory and phase 3 completion status for idempotent controls
- *(memory)* Certify Phase 3 completion and document Defect 53 for PiP and Fullscreen single-execution alignment
- *(dashboard)* Author future uiux enhancement recommendations specification
- *(prompt)* Architect modular industrial split overhaul prompt suite and phase specifications
- *(phase-04)* Mark phase 04 css modular split completed on tracking board
- *(temp_prompt)* Track facade slimming and modular decomposition architectural specifications
- *(ui-ux)* Architect phase-wise UI/UX restoration master prompt and project memory
- *(memory)* Update project_ui_ux_restoration_memory.md to COMPLETED_AND_VERIFIED state
- *(prompt)* Add phase-wise prompt architecture specification for topbar DOM UI/UX fix

### 🚜 Refactor

- *(popup)* Ultra-compact sound enhancements single-row layout
- *(ui)* Relocate sound enhancements card from audio tab to tools tab
- *(core,background)* Establish domain-driven layered modular architecture in src/ and wire orchestrator
- *(content,inject,fullscreen)* Modularize DOM observers, media extraction, ladders, and fullscreen engine under src/
- *(ui)* Modularize popup and dashboard UI state, components, charts, and tabs under src/
- *(core)* Execute Phase 01 shared core domain and background service worker modular split
- *(content)* Execute Phase 02 content scripts and fullscreen controller modular split
- *(dashboard)* Execute Phase 03 dashboard javascript modular split

### 🎨 Styling

- *(dashboard)* Direct link modular css, polish audio lab & eq, minimalist sidebar status and shift hardware bridges to settings

### 🧪 Testing

- Add verification test suite for active tab timer fix and dual media tracking
- *(integrity)* Update test suite assertions for version 2.4.9
- *(popup)* Align UI test suite to validate 6-tab navigation architecture and CSS grid
- *(popup)* Add verification test suite for compact icon-only header status badges
- *(qa)* Add comprehensive media controls and fullscreen linking test suite
- Add Test 8 optimistic state lock verification
- *(popup)* Overhaul media controls test suite with unconditional IPC verification and runtime mock
- *(media)* Overhaul test suite for single-execution determinism
- *(qa)* Certify full audio lab parity, regression battery and align test suites
- *(parity)* Add Test 10 asserting mute single-inversion, bridge fallback, and tabId resolution parity
- *(parity)* Modernize media controls test suite for dual 0ms direct scripting and IPC telemetry
- *(media)* Modernize test suite for explicit idempotent commands and strict mutual exclusion
- *(qa)* Align media controls test assertions with single-execution pattern and enforce UTF-8 BOM
- *(popup)* Assert single-execution fallback and exclusion invariants for fullscreen
- *(media)* Update test suite for PiP and Fullscreen single-execution fallback pattern
- *(dashboard)* Modernize audio lab and bento tests for dedicated equalizer card with grade A+ certification
- *(qa)* Add comprehensive multi-frame and blackout regression assertions

### ⚙️ Miscellaneous Tasks

- *(docs)* Clean trailing artifact remnants in popup_phase_wise_plan.md and certify UTF-8 BOM
