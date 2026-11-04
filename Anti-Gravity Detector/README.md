# Windows Native AntiGravity Agent Inactivity Sentinel (एंटी-ग्रेविटी आइडल डिटेक्टर)

> **Dedicated Google AntiGravity AI Coding Agent Sentinel (Brain & Session Architecture)**  
> **Author:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Location:** `Anti-Gravity Detector/`  
> **Operating Engine:** Real-Time Brain Transcript Analyzer & Process Monitor (`%USERPROFILE%\.gemini\antigravity\brain`)  
> **UI Architecture:** In-Place Zero-Scrolling Overwriting UI (`\033[H`, `\033[K`, `\033[J`) with 70-Character Standardized Card

---

## 🎯 1. Overview & Core Mission (परिचय एवं मुख्य उद्देश्य)

**Windows Native AntiGravity Agent Inactivity Sentinel** is a precision monitoring engine designed specifically for the **Google AntiGravity AI Coding Agent platform**.

It inspects agent sessions and brain transcripts in real time to determine whether:
1. The AI Agent is actively generating code, running tool calls, or executing subagents (**`WORKING / कार्यरत`**).
2. The AI Agent has paused and is waiting for user input, such as answering an interactive `ask_question` prompt (**`WAITING_USER / प्रतीक्षारत`**).
3. The AI Agent has completed its turn and is in the silence settling buffer countdown (**`SETTLING / स्थिर हो रहा`**).
4. All tasks are finished, silence has exceeded 60 seconds, or no active agent sessions exist (**`IDLE / आइडियल`**).

---

## 🏛️ 2. Architectural Features & File Organization

```
Anti-Gravity Detector/
├── modules/                         # Clean Enterprise Modular Architecture
│   ├── __init__.py                  # Public API package exports
│   ├── config.py                    # ANSI styling palette, paths & Win32 VT handlers
│   ├── analyzer.py                  # Brain transcript scanner & session aggregator
│   ├── tracker.py                   # Continuous active/idle duration & 60m activity buffer
│   ├── dashboard.py                 # ANSI terminal card renderer & timeline generator
│   └── sentinel.py                  # Evaluation logic & live monitoring loops
├── antigravity_detector.py          # Lightweight CLI entry point (~100 lines)
├── Run_AntiGravity_Detector.bat     # 1-Click direct launcher (UTF-8 BOM)
└── README.md                        # Comprehensive bilingual documentation
```

### Key Capabilities:
1. **Brain Session Transcript Inspection & Tool Output Tracking:**
   - Real-time JSON Lines (`transcript.jsonl`) streaming parser.
   - Accurately tracks `USER_INPUT`, `PLANNER_RESPONSE`, `GENERIC` tool execution outputs, and active tool calls (`run_command`, `invoke_subagent`, `read_file`, `write_file`).
   - Prevents false-idle drops while AI model processes tool outputs during multi-step turns.
2. **Multi-Session Concurrency & Root User Chat vs Subagent Separation:**
   - Seamlessly monitors multiple parallel running projects/chats and subagents simultaneously.
   - Differentiates between Root User Chats and Subagents by scanning initial session transcript provenance (`USER_EXPLICIT` vs SDK dispatched subagent prompts).
   - Real-time dashboard telemetry displays exact live breakdown: `X User Chats (Y Active | Z Inactive) + W Subagent(s)` updating dynamically tick-by-tick.
3. **Clean English Typography (Font-Safe Windows Terminal):**
   - Pure English badges (`YES`, `NO`, `WORKING`, `SETTLING`, `WAITING_USER`, `IDLE`) and header (`WINDOWS ANTIGRAVITY INACTIVITY SENTINEL`).
   - Completely eliminates unsightly empty brackets `()` caused by raster font glyph missing errors in standard Windows Command Prompt.
4. **Anti-Flapping Debounce & Hysteresis Window:**
   - 5.0s debounce buffer prevents continuous active timer resets during brief sub-second LLM inter-token thinking pauses.
5. **Interactive `ask_question` Detection:**
   - Detects when the agent has asked a question and is standing by for human answers (`WAITING_USER`), preventing premature shutdown or false completion.
6. **Continuous Active & Idle Telemetry:**
   - Tracks continuous active duration and continuous idle duration (`HH:MM:SS`).
   - Maintains a 60-minute rolling historical activity bar (`[■■■■░░░░■■■■░░░░]`).
7. **Strict 60-Second Inactivity Lock:**
   - While silence duration < threshold (default `60.0s`), `Is Windows Idle?` remains **`FALSE`**.
   - Only when all sessions are complete and silence has reached `>= 60.0s`, `Is Windows Idle?` becomes **`TRUE`**.
8. **CLI & Automation Support:**
   - `--once`: Single-check evaluation exiting with code `0` (Idle) or `1` (Active/Busy).
   - `--json`: Machine-readable JSON output of evaluation card data including user chat and subagent counters.
   - `--threshold`: Custom inactivity timeout (default: `60.0` seconds).
   - `--debounce`: Custom debounce hysteresis in seconds (default: `5.0` seconds).
   - `--interval`: Fast poll interval (default: `0.5` seconds).
   - `--brain-dir`: Path to brain directory.
   - `--window-hours`: Lookback window in hours (default: `2.0` hours).
   - `--window-minutes`: Lookback window in minutes (overrides `--window-hours` if specified).

---

## 📊 3. Terminal Dashboard Interface

```
======================================================================
          WINDOWS ANTIGRAVITY INACTIVITY SENTINEL
======================================================================
  Agent Active        : YES / NO
  Target Service      : Google AntiGravity Agent & Brain Sessions
  Agent State         : WORKING / IDLE / WAITING_USER / SETTLING
  Chat Sessions       : 4 User Chats (1 Active | 3 Inactive) + 1 Subagent
  Active Session ID   : 6a142f23-9bd1-4a9d...
  Current Task / Step : Step #14 (Tool: run_command)
  Continuous Active   : 00:05:22
  Continuous Idle     : 00:00:00
  Brain Silence Time  :  1.2s (Agent actively executing)
  60s Idle Timer      :  0.0s / 60s [░░░░░░░░░░░░░░░░░░░░░░░░]   0% (RESET - AGENT WORKING)
  60m Activity Graph  : [■■■■■■■■■■■■░░░░░░░░■■■■■■■■]
----------------------------------------------------------------------
  Is Agent Active?    : TRUE / FALSE
  Is Windows Idle?    : TRUE / FALSE (60s lock)
======================================================================
```

---

## 🚀 4. How to Run & Verify

### 1-Click Launch:
Double-click `Run_AntiGravity_Detector.bat`.

### Command Line:
```powershell
# Continuous live in-place monitoring (0.5s update)
python antigravity_detector.py

# Single-check verification
python antigravity_detector.py --once

# Structured JSON output
python antigravity_detector.py --json
```
