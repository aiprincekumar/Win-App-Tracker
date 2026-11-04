# -*- coding: utf-8 -*-
"""
analyzer.py: AntiGravity Brain Session Transcript Analyzer & Multi-Session Aggregator.
Department 02: Systems Engineering & Department 06: Backend & API Engineering.

Capabilities:
  - Real-time JSON Lines (`transcript.jsonl`) streaming parser.
  - Heuristic provenance inspection: distinguishes Root User Chats from Subagents.
  - Multi-session concurrency aggregation (Boolean-OR architecture aligned with core analyzer).
  - Precise state detection: WORKING, IN_FLIGHT, WAITING_USER, SETTLING, COMPLETED.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Anti-Gravity Detector
"""

import os
import time
import json
import glob
from pathlib import Path
from typing import Dict, List, Optional, Any

from .config import DEFAULT_BRAIN_DIR


class AntigravitySessionAnalyzer:
    """
    Inspects AntiGravity brain transcript.jsonl files within the configured window.
    Determines real-time agent execution status, tools in flight, and silence durations.
    """
    def __init__(self, brain_dir: Optional[Path] = None, window_hours: float = 2.0):
        self.brain_dir = Path(brain_dir) if brain_dir else DEFAULT_BRAIN_DIR
        self.window_hours = window_hours
        self._mock_eval: Optional[Dict[str, Any]] = None

    def set_mock_eval(self, eval_data: Optional[Dict[str, Any]]) -> None:
        """Injects mock evaluation data for unit testing."""
        self._mock_eval = eval_data

    def scan_transcripts(self) -> List[Path]:
        """Finds all transcript.jsonl files inside the brain directory."""
        if not self.brain_dir.exists():
            return []
        pattern = str(self.brain_dir / "*" / ".system_generated" / "logs" / "transcript.jsonl")
        return [Path(p) for p in glob.glob(pattern)]

    def analyze_transcript(self, file_path: Path, idle_buffer: float = 60.0) -> Dict[str, Any]:
        """
        Analyzes a single transcript.jsonl file to determine its current operational state:
          - WORKING: Agent actively running tools, subagents, or thinking.
          - WAITING_USER: Agent invoked ask_question and is waiting for user input.
          - SETTLING: Agent finished step, but quiet silence duration < idle_buffer.
          - COMPLETED: Agent completed turn, no tools pending, silence >= idle_buffer.
          - EMPTY: Blank transcript.
        """
        now = time.time()
        try:
            mtime = os.path.getmtime(file_path)
        except Exception as e:
            return {
                "status": "ERROR",
                "reason": f"Cannot read mtime: {e}",
                "silence": 0.0,
                "mtime": now,
                "step_index": None,
                "step_type": None,
                "tool_calls": []
            }

        silence = max(0.0, now - mtime)

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                lines = [line.strip() for line in f if line.strip()]
        except Exception as e:
            return {
                "status": "ERROR",
                "reason": f"Cannot read transcript: {e}",
                "silence": silence,
                "mtime": mtime,
                "step_index": None,
                "step_type": None,
                "tool_calls": []
            }

        if not lines:
            return {
                "status": "EMPTY",
                "reason": "Transcript is empty",
                "silence": silence,
                "mtime": mtime,
                "step_index": None,
                "step_type": None,
                "tool_calls": [],
                "session_kind": "USER_CHAT",
                "is_subagent": False
            }

        # Determine session kind: Root User Chat vs Subagent
        is_subagent = True
        for raw_line in lines[:25]:
            try:
                entry = json.loads(raw_line)
                src = entry.get("source")
                tp = entry.get("type")
                if src == "USER_EXPLICIT" or (tp == "USER_INPUT" and src != "SYSTEM_SDK"):
                    is_subagent = False
                    break
            except Exception:
                continue

        session_kind = "SUBAGENT" if is_subagent else "USER_CHAT"

        def _ret(data: Dict[str, Any]) -> Dict[str, Any]:
            data["session_kind"] = session_kind
            data["is_subagent"] = is_subagent
            return data

        # Parse the last valid step from the end of the file
        last_step = None
        for raw_line in reversed(lines[-10:]):
            try:
                last_step = json.loads(raw_line)
                break
            except Exception:
                continue

        if not last_step:
            return _ret({
                "status": "WORKING",
                "reason": "Transcript actively being written (JSON in flight)",
                "silence": silence,
                "mtime": mtime,
                "step_index": None,
                "step_type": None,
                "tool_calls": []
            })

        step_type = last_step.get("type", "UNKNOWN")
        step_stat = last_step.get("status", "DONE")
        step_idx = last_step.get("step_index")
        raw_tools = last_step.get("tool_calls", [])
        tool_calls = [c.get("tool_name") or c.get("name") or "tool" for c in raw_tools if isinstance(c, dict)]

        # Check Step Status != DONE
        if step_stat != "DONE":
            if silence >= idle_buffer:
                return _ret({
                    "status": "COMPLETED",
                    "reason": f"Step #{step_idx} status '{step_stat}' but settled for {silence:.1f}s",
                    "silence": silence,
                    "mtime": mtime,
                    "step_index": step_idx,
                    "step_type": step_type,
                    "tool_calls": tool_calls
                })
            return _ret({
                "status": "WORKING",
                "reason": f"Step #{step_idx} in progress (status: {step_stat})",
                "silence": silence,
                "mtime": mtime,
                "step_index": step_idx,
                "step_type": step_type,
                "tool_calls": tool_calls
            })

        # USER_INPUT waiting for agent response
        if step_type == "USER_INPUT":
            if silence >= idle_buffer:
                return _ret({
                    "status": "COMPLETED",
                    "reason": f"User prompt settled for {silence:.1f}s",
                    "silence": silence,
                    "mtime": mtime,
                    "step_index": step_idx,
                    "step_type": step_type,
                    "tool_calls": tool_calls
                })
            return _ret({
                "status": "WORKING",
                "reason": "User prompt received; agent thinking/preparing response",
                "silence": silence,
                "mtime": mtime,
                "step_index": step_idx,
                "step_type": step_type,
                "tool_calls": tool_calls
            })

        # GENERIC step evaluation (Tool execution output returned to agent)
        if step_type == "GENERIC":
            if silence >= idle_buffer:
                return _ret({
                    "status": "COMPLETED",
                    "reason": f"Tool output settled for {silence:.1f}s",
                    "silence": silence,
                    "mtime": mtime,
                    "step_index": step_idx,
                    "step_type": step_type,
                    "tool_calls": tool_calls
                })
            return _ret({
                "status": "WORKING",
                "reason": f"Tool output returned at Step #{step_idx}; agent evaluating response",
                "silence": silence,
                "mtime": mtime,
                "step_index": step_idx,
                "step_type": step_type,
                "tool_calls": tool_calls
            })

        # PLANNER_RESPONSE evaluation
        if step_type == "PLANNER_RESPONSE":
            if tool_calls:
                if "ask_question" in tool_calls:
                    return _ret({
                        "status": "WAITING_USER",
                        "reason": "Interactive input pending: Waiting for user to answer 'ask_question'",
                        "silence": silence,
                        "mtime": mtime,
                        "step_index": step_idx,
                        "step_type": step_type,
                        "tool_calls": tool_calls
                    })
                if silence < idle_buffer:
                    tools_str = ", ".join(tool_calls[:2]) + ("..." if len(tool_calls) > 2 else "")
                    return _ret({
                        "status": "WORKING",
                        "reason": f"Tool execution in flight: [{tools_str}]",
                        "silence": silence,
                        "mtime": mtime,
                        "step_index": step_idx,
                        "step_type": step_type,
                        "tool_calls": tool_calls
                    })
                return _ret({
                    "status": "COMPLETED",
                    "reason": f"Tool execution completed; settled for {silence:.1f}s",
                    "silence": silence,
                    "mtime": mtime,
                    "step_index": step_idx,
                    "step_type": step_type,
                    "tool_calls": tool_calls
                })

            # Planner response without tool calls and status DONE
            if silence < idle_buffer:
                rem = idle_buffer - silence
                return _ret({
                    "status": "SETTLING",
                    "reason": f"Turn finished; awaiting silence buffer ({silence:.1f}s / {idle_buffer:.0f}s, {rem:.1f}s left)",
                    "silence": silence,
                    "mtime": mtime,
                    "step_index": step_idx,
                    "step_type": step_type,
                    "tool_calls": []
                })
            return _ret({
                "status": "COMPLETED",
                "reason": f"Turn finished; settled for {silence:.1f}s",
                "silence": silence,
                "mtime": mtime,
                "step_index": step_idx,
                "step_type": step_type,
                "tool_calls": []
            })

        # Fallback for GENERIC or ephemeral steps
        if silence < idle_buffer:
            return _ret({
                "status": "SETTLING",
                "reason": f"Recent step ({step_type}); awaiting silence buffer",
                "silence": silence,
                "mtime": mtime,
                "step_index": step_idx,
                "step_type": step_type,
                "tool_calls": tool_calls
            })
        return _ret({
            "status": "COMPLETED",
            "reason": f"Settled for {silence:.1f}s",
            "silence": silence,
            "mtime": mtime,
            "step_index": step_idx,
            "step_type": step_type,
            "tool_calls": tool_calls
        })

    def evaluate_all(self, idle_buffer: float = 60.0) -> Dict[str, Any]:
        """
        Evaluates all recent AntiGravity brain sessions.
        Returns aggregate evaluation status.
        """
        if self._mock_eval is not None:
            return self._mock_eval

        now = time.time()
        window_cutoff = now - (self.window_hours * 3600.0)
        files = self.scan_transcripts()

        active_sessions = []
        for file_path in files:
            try:
                mtime = os.path.getmtime(file_path)
            except Exception:
                continue

            if mtime < window_cutoff:
                continue

            info = self.analyze_transcript(file_path, idle_buffer=idle_buffer)
            info["conversation_id"] = file_path.parent.parent.parent.name
            info["path"] = str(file_path)
            active_sessions.append(info)

        # Sort by mtime descending (most recently modified session first)
        active_sessions.sort(key=lambda s: s.get("mtime", 0.0), reverse=True)

        if not active_sessions:
            return {
                "all_completed": True,
                "agent_active": False,
                "agent_state": "IDLE",
                "summary": "No active AntiGravity sessions in observation window",
                "hindi_summary": "ऑब्जर्वेशन विंडो में कोई सक्रिय एंटी-ग्रेविटी सेशन नहीं है",
                "active_session_id": "None",
                "current_step": "None (Standby)",
                "silence_seconds": idle_buffer,
                "total_sessions": 0,
                "active_sessions_count": 0,
                "inactive_sessions_count": 0,
                "working_sessions_count": 0,
                "settling_sessions_count": 0,
                "waiting_sessions_count": 0,
                "user_chats_total": 0,
                "user_chats_active": 0,
                "user_chats_inactive": 0,
                "subagents_total": 0,
                "subagents_active": 0,
                "subagents_inactive": 0,
                "sessions": []
            }

        # Multi-Session Blocking Aggregation (Aligned with core/analyzer.py architecture)
        blocking_sessions = [
            s for s in active_sessions
            if s.get("status") in ("WORKING", "BUSY", "IN_FLIGHT", "WAITING_USER", "SETTLING", "ERROR")
        ]

        total_sessions = len(active_sessions)
        active_chats_count = len(blocking_sessions)
        inactive_chats_count = total_sessions - active_chats_count

        user_sessions = [s for s in active_sessions if not s.get("is_subagent", False)]
        subagent_sessions = [s for s in active_sessions if s.get("is_subagent", False)]

        user_active = [s for s in user_sessions if s in blocking_sessions]
        user_inactive = [s for s in user_sessions if s not in blocking_sessions]

        sub_active = [s for s in subagent_sessions if s in blocking_sessions]
        sub_inactive = [s for s in subagent_sessions if s not in blocking_sessions]

        user_chats_total = len(user_sessions)
        user_chats_active = len(user_active)
        user_chats_inactive = len(user_inactive)

        subagents_total = len(subagent_sessions)
        subagents_active = len(sub_active)
        subagents_inactive = len(sub_inactive)

        working_sessions = [s for s in blocking_sessions if s.get("status") in ("WORKING", "BUSY")]
        in_flight_sessions = [s for s in blocking_sessions if s.get("status") == "IN_FLIGHT"]
        waiting_sessions = [s for s in blocking_sessions if s.get("status") == "WAITING_USER"]
        settling_sessions = [s for s in blocking_sessions if s.get("status") == "SETTLING"]

        if blocking_sessions:
            all_completed = False
            agent_active = True  # Agent/Sentinel active while any session is working, in-flight, waiting, or settling!

            if working_sessions:
                agent_state = "WORKING"
                lead_session = min(working_sessions, key=lambda s: s.get("silence", 999999.0))
                active_count = len(working_sessions)
                if active_count > 1:
                    hindi_sum = f"एंटी-ग्रेविटी एजेंट सक्रिय रूप से कार्य कर रहा है ({active_count} सेशन समानांतर कार्यरत, {lead_session.get('reason', '')})"
                else:
                    hindi_sum = f"एंटी-ग्रेविटी एजेंट सक्रिय रूप से कार्य कर रहा है ({lead_session.get('reason', '')})"
            elif in_flight_sessions:
                agent_state = "IN_FLIGHT"
                lead_session = min(in_flight_sessions, key=lambda s: s.get("silence", 999999.0))
                hindi_sum = "यूजर प्रॉम्प्ट प्राप्त; एजेंट प्रतिक्रिया तैयार कर रहा है (IN_FLIGHT)"
            elif waiting_sessions:
                agent_state = "WAITING_USER"
                lead_session = min(waiting_sessions, key=lambda s: s.get("silence", 999999.0))
                hindi_sum = "एंटी-ग्रेविटी एजेंट यूजर के इनपुट की प्रतीक्षा कर रहा है (ask_question)"
            elif settling_sessions:
                agent_state = "SETTLING"
                lead_session = min(settling_sessions, key=lambda s: s.get("silence", 999999.0))
                rem = max(0.0, idle_buffer - lead_session.get("silence", 0.0))
                hindi_sum = f"कार्य पूर्ण हुआ, आइडल बफर की प्रतीक्षा है ({lead_session.get('silence', 0.0):.1f}s / {idle_buffer:.0f}s, {rem:.1f}s शेष)"
            else:
                agent_state = "WORKING"
                lead_session = blocking_sessions[0]
                hindi_sum = lead_session.get("reason", "Session active")
        else:
            all_completed = True
            agent_active = False
            agent_state = "IDLE"
            lead_session = active_sessions[0] if active_sessions else {}
            lead_silence = lead_session.get("silence", idle_buffer)
            hindi_sum = f"सभी एंटी-ग्रेविटी सेशन पूर्ण व शांत हैं (आइडल: {lead_silence:.1f}s)"

        lead_id = lead_session.get("conversation_id", "Unknown")
        lead_silence = lead_session.get("silence", 0.0)
        step_idx = lead_session.get("step_index")
        tools = lead_session.get("tool_calls", [])

        if tools:
            step_desc = f"Step #{step_idx} (Tool: {tools[0]})" if step_idx is not None else f"Tool: {tools[0]}"
        elif step_idx is not None:
            step_desc = f"Step #{step_idx} ({lead_session.get('step_type', 'RESPONSE')})"
        else:
            step_desc = "Session Active"

        working_count = len(working_sessions)
        if working_count > 1:
            step_desc = f"[{working_count} Parallel Active] " + step_desc

        return {
            "all_completed": all_completed,
            "agent_active": agent_active,
            "agent_state": agent_state,
            "summary": lead_session.get("reason", "Session Evaluated"),
            "hindi_summary": hindi_sum,
            "active_session_id": lead_id,
            "current_step": step_desc,
            "silence_seconds": round(lead_silence, 2),
            "total_sessions": total_sessions,
            "active_sessions_count": active_chats_count,
            "inactive_sessions_count": inactive_chats_count,
            "working_sessions_count": working_count,
            "settling_sessions_count": len(settling_sessions),
            "waiting_sessions_count": len(waiting_sessions),
            "user_chats_total": user_chats_total,
            "user_chats_active": user_chats_active,
            "user_chats_inactive": user_chats_inactive,
            "subagents_total": subagents_total,
            "subagents_active": subagents_active,
            "subagents_inactive": subagents_inactive,
            "sessions": active_sessions
        }
