## [unreleased]

### 🚀 Features

- *(refactor)* Dynamic path resolution across batch launchers, powershell scripts, and python modules
- *(init)* Initialize Win App Tracker as standalone repository with dynamic architecture, comprehensive .gitignore, and documentation
- *(github)* Add enterprise GitHub configuration, CI/CD pipeline, templates, dependabot, and root requirements.txt
- *(startup)* Add automated Windows Startup auto-boot installer and silent background launcher for Browser Data Hub

### 🐛 Bug Fixes

- *(ci)* Add Pillow to requirements and make tray icon import resilient
- *(ui,hub,hud)* Fix header clipping, dynamic path resolution, and auto-service launch
- *(launcher)* Use absolute script path in run_data_hub.vbs
- *(data-hub)* Resolve 30s idle disconnect, force-reconnect hanging sockets, and add responsive polling

### 📚 Documentation

- *(readme)* Revamp README into comprehensive production-grade showcase with architecture diagrams, API specs, and CLI guide
