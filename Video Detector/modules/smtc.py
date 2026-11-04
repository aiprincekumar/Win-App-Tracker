# -*- coding: utf-8 -*-
"""
modules/smtc.py: Windows Native System Media Transport Controls (SMTC) Reader & Poller.
Dedicated strictly to Windows Media Player (Modern & Legacy).
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import time
import threading
import asyncio
import atexit
from typing import Dict, Any, Optional

try:
    import winsdk.windows.media.control as _wmc
    import winsdk.windows.media as _wm
    HAS_WINSDK_SMTC = True
except ImportError:
    HAS_WINSDK_SMTC = False

_smtc_lock = threading.Lock()
_cached_smtc_wmp: Dict[str, Dict[str, Any]] = {}
_smtc_stop_event = threading.Event()
_smtc_thread: Optional[threading.Thread] = None


def _smtc_poller_worker():
    """
    Background daemon thread to query Windows Native SMTC API (GlobalSystemMediaTransportControlsSessionManager).
    Dedicated strictly and exclusively to Windows Media Player (Modern: Microsoft.Media.Player.exe and Legacy: wmplayer.exe).
    Keeps all other players (VLC, Chrome, Edge, etc.) completely intact.
    Zero UI latency (<0.001ms read).
    """
    if not HAS_WINSDK_SMTC:
        return

    async def _async_loop():
        try:
            mgr = await _wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
        except Exception:
            return

        while not _smtc_stop_event.is_set():
            try:
                sessions = mgr.get_sessions()
                new_wmp_sessions: Dict[str, Dict[str, Any]] = {}

                for s in sessions:
                    sid = (s.source_app_user_model_id or "").lower()
                    is_modern = ("zunemusic" in sid or "media.player" in sid)
                    is_legacy = ("wmplayer" in sid or "windowsmediaplayer" in sid)

                    # Strictly dedicated to Windows Media Player (Modern & Legacy)
                    if not (is_modern or is_legacy):
                        continue

                    info = s.get_playback_info()
                    p_type = int(info.playback_type) if (info and info.playback_type is not None) else 0
                    p_status = int(info.playback_status) if (info and info.playback_status is not None) else 0

                    title = ""
                    artist = ""
                    try:
                        props = await s.try_get_media_properties_async()
                        if props:
                            title = props.title or ""
                            artist = props.artist or ""
                    except Exception:
                        pass

                    key = "modern" if is_modern else "legacy"
                    new_wmp_sessions[key] = {
                        "source_id": sid,
                        "player_type": key,
                        "playback_type": p_type,        # 1: MUSIC, 2: VIDEO, 0: UNKNOWN
                        "playback_status": p_status,    # 4: PLAYING, 5: PAUSED, 3: STOPPED
                        "title": title,
                        "artist": artist,
                        "timestamp": time.time()
                    }

                with _smtc_lock:
                    global _cached_smtc_wmp
                    _cached_smtc_wmp = new_wmp_sessions

            except Exception:
                pass

            # Non-blocking async sleep with fast cancellation check
            for _ in range(5):
                if _smtc_stop_event.is_set():
                    break
                await asyncio.sleep(0.1)

    try:
        asyncio.run(_async_loop())
    except Exception:
        pass


def start_smtc_poller():
    """Starts the SMTC background poller thread if supported and not running."""
    global _smtc_thread
    if HAS_WINSDK_SMTC and (_smtc_thread is None or not _smtc_thread.is_alive()):
        _smtc_stop_event.clear()
        _smtc_thread = threading.Thread(target=_smtc_poller_worker, daemon=True, name="WmpSmtcPoller")
        _smtc_thread.start()


def stop_smtc_poller():
    """Signals the SMTC poller thread to cleanly terminate."""
    _smtc_stop_event.set()


def get_wmp_smtc_info(player_type: str) -> Optional[Dict[str, Any]]:
    """
    Returns cached Windows Native SMTC session info for Windows Media Player ('modern' or 'legacy').
    Non-blocking (<0.001ms), thread-safe.
    """
    with _smtc_lock:
        return _cached_smtc_wmp.get(player_type)


def set_mock_wmp_smtc_info(player_type: str, data: Optional[Dict[str, Any]]) -> None:
    """Helper for automated unit tests to mock SMTC state."""
    with _smtc_lock:
        if data is None:
            _cached_smtc_wmp.pop(player_type, None)
        else:
            _cached_smtc_wmp[player_type] = data


# Start poller thread on module load
if HAS_WINSDK_SMTC:
    start_smtc_poller()
    atexit.register(stop_smtc_poller)
