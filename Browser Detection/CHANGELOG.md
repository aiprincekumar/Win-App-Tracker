## [unreleased]

### 🚀 Features

- *(refactor)* Dynamic path resolution across batch launchers, powershell scripts, and python modules
- *(init)* Initialize Win App Tracker as standalone repository with dynamic architecture, comprehensive .gitignore, and documentation
- *(popup)* Synchronize SQLite Data Hub analytics, domain distribution, and multi-browser filter into extension popup
- *(dashboard,popup)* Display all-time total seconds and domain distribution across midnight rollover
- *(dashboard)* Add tracking mode selector, internal schemes filter, and dual pills presentation
- *(popup)* Add tracking method selector, category filter, and mini internal scheme badges

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

### 🧪 Testing

- Add verification test suite for active tab timer fix and dual media tracking
