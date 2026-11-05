## [unreleased]

### 🚀 Features

- *(refactor)* Dynamic path resolution across batch launchers, powershell scripts, and python modules
- *(init)* Initialize Win App Tracker as standalone repository with dynamic architecture, comprehensive .gitignore, and documentation
- *(github)* Add enterprise GitHub configuration, CI/CD pipeline, templates, dependabot, and root requirements.txt
- *(startup)* Add automated Windows Startup auto-boot installer and silent background launcher for Browser Data Hub
- *(popup)* Synchronize SQLite Data Hub analytics, domain distribution, and multi-browser filter into extension popup
- *(hub)* Add all_time_seconds, all_time_domain_distribution, and history metadata to analytics query
- *(dashboard,popup)* Display all-time total seconds and domain distribution across midnight rollover

### 🐛 Bug Fixes

- *(ci)* Add Pillow to requirements and make tray icon import resilient
- *(ui,hub,hud)* Fix header clipping, dynamic path resolution, and auto-service launch
- *(launcher)* Use absolute script path in run_data_hub.vbs
- *(data-hub)* Resolve 30s idle disconnect, force-reconnect hanging sockets, and add responsive polling

### 📚 Documentation

- *(readme)* Revamp README into comprehensive production-grade showcase with architecture diagrams, API specs, and CLI guide
- *(changelog)* Initialize changelog using git-cliff
- *(changelog)* Update changelog with popup SQLite Data Hub synchronization
