# -*- coding: utf-8 -*-
"""
modules/wmp_surface.py: Legacy Windows Media Player (wmplayer.exe) EVR & DirectShow Video Surface Detector.
Department 02: Solution Architecture & Systems Engineering.
Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
"""

import os
import urllib.parse
import ctypes
from ctypes import wintypes, byref
from typing import Optional, Tuple, Dict, Any

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

from .config import AUDIO_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS
from .win32_api import user32, WNDENUMPROC

_mock_wmp_legacy_video_surface: Optional[Dict[str, Any]] = None


class WmpSurfaceResult(tuple):
    """
    Dual-compatibility return type for detect_wmp_legacy_video_surface:
    Acts as a 4-tuple by default for 100% backward compatibility with legacy 4-element unpackers:
      is_video, rationale, detected_ext, detected_filename = detect_wmp_legacy_video_surface(...)
    While also exposing .detected_path for complete timeline and metadata resolution.
    """
    def __new__(cls, is_video: bool, rationale: str, detected_ext: Optional[str], detected_filename: Optional[str], detected_path: Optional[str] = None):
        t = super().__new__(cls, (is_video, rationale, detected_ext, detected_filename))
        t.is_video = is_video
        t.rationale = rationale
        t.detected_ext = detected_ext
        t.detected_filename = detected_filename
        t.detected_path = detected_path
        t.detected_filepath = detected_path
        return t


def set_mock_wmp_legacy_video_surface(data: Optional[Dict[str, Any]]) -> None:
    """Helper for automated unit tests to mock Legacy WMP video surface detection."""
    global _mock_wmp_legacy_video_surface
    _mock_wmp_legacy_video_surface = data


def detect_wmp_legacy_video_surface(hwnd: Optional[int] = None, pid_str: Optional[str] = None) -> WmpSurfaceResult:
    """
    Dedicated detection strictly for Legacy Windows Media Player (wmplayer.exe):
      1. Mock hook for unit testing.
      2. Inspects Win32 child window hierarchy for EVR / DirectShow video rendering surfaces
         (EVRVideoHandler, VideoRenderer, WMP Transition Window, WMPVideoCtrlNotifyWndClass).
      3. Inspects process command-line arguments and open file handles for active media files.
    Returns:
      WmpSurfaceResult(is_video, rationale, detected_ext, detected_filename, detected_path)
    """
    if _mock_wmp_legacy_video_surface is not None:
        is_vid = bool(_mock_wmp_legacy_video_surface.get("is_video", False))
        reason = _mock_wmp_legacy_video_surface.get("reason", "Mock Legacy WMP video surface")
        file_ext = _mock_wmp_legacy_video_surface.get("file_ext", None)
        file_name = _mock_wmp_legacy_video_surface.get("file_name", None)
        file_path = _mock_wmp_legacy_video_surface.get("file_path", None)
        return WmpSurfaceResult(is_vid, reason, file_ext, file_name, file_path)

    pid_int: Optional[int] = None
    if isinstance(pid_str, int) and pid_str > 0:
        pid_int = pid_str
    elif isinstance(pid_str, str) and pid_str.isdigit():
        pid_int = int(pid_str)
    elif hwnd:
        dw_pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, byref(dw_pid))
        pid_int = dw_pid.value

    # First discover any file from cmdline or open_files via psutil
    detected_file_ext: Optional[str] = None
    detected_filename: Optional[str] = None
    detected_filepath: Optional[str] = None
    proc_has_audio_file = False
    proc_has_video_file = False

    if HAS_PSUTIL and pid_int:
        try:
            proc = psutil.Process(pid_int)
            try:
                cmdline = proc.cmdline()
                for arg in cmdline:
                    clean_arg = arg.strip('\'"')
                    if clean_arg.startswith('file:///'):
                        clean_arg = urllib.parse.unquote(clean_arg[8:])
                    elif clean_arg.startswith('file://'):
                        clean_arg = urllib.parse.unquote(clean_arg[7:])
                    arg_low = clean_arg.lower()
                    for ext in VIDEO_FILE_EXTENSIONS:
                        if arg_low.endswith(ext):
                            proc_has_video_file = True
                            detected_file_ext = ext
                            detected_filepath = os.path.normpath(clean_arg)
                            detected_filename = os.path.basename(detected_filepath)
                            break
                    if proc_has_video_file:
                        break
                    for ext in AUDIO_FILE_EXTENSIONS:
                        if arg_low.endswith(ext):
                            proc_has_audio_file = True
                            detected_file_ext = ext
                            detected_filepath = os.path.normpath(clean_arg)
                            detected_filename = os.path.basename(detected_filepath)
                            break
                    if proc_has_audio_file:
                        break
            except Exception:
                pass

            if not detected_file_ext:
                try:
                    open_files = proc.open_files()
                    for of in open_files:
                        path_low = of.path.lower()
                        for ext in VIDEO_FILE_EXTENSIONS:
                            if path_low.endswith(ext):
                                proc_has_video_file = True
                                detected_file_ext = ext
                                detected_filepath = os.path.normpath(of.path)
                                detected_filename = os.path.basename(detected_filepath)
                                break
                        if proc_has_video_file:
                            break
                        for ext in AUDIO_FILE_EXTENSIONS:
                            if path_low.endswith(ext):
                                proc_has_audio_file = True
                                detected_file_ext = ext
                                detected_filepath = os.path.normpath(of.path)
                                detected_filename = os.path.basename(detected_filepath)
                                break
                        if proc_has_audio_file:
                            break
                except Exception:
                    pass
        except Exception:
            pass

    # Inspect child windows and top windows of PID for active video rendering surfaces
    video_surfaces = []
    target_hwnds = []
    if hwnd:
        target_hwnds.append(hwnd)

    if pid_int:
        def top_enum_cb(thwnd, lp):
            dw_pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(thwnd, byref(dw_pid))
            if dw_pid.value == pid_int:
                target_hwnds.append(thwnd)
                tcls = ctypes.create_unicode_buffer(256)
                user32.GetClassNameW(thwnd, tcls, 256)
                cls_low = tcls.value.lower()
                if "wmpvideoctrlnotify" in cls_low:
                    video_surfaces.append(("WMPVideoCtrlNotify", 0, 0))
            return True
        try:
            user32.EnumWindows(WNDENUMPROC(top_enum_cb), 0)
        except Exception:
            pass

    seen_hwnds = set()
    for th in target_hwnds:
        if th in seen_hwnds:
            continue
        seen_hwnds.add(th)

        def child_cb(chwnd, lp):
            ccls = ctypes.create_unicode_buffer(256)
            user32.GetClassNameW(chwnd, ccls, 256)
            cls_name = ccls.value
            cls_low = cls_name.lower()
            if any(k in cls_low for k in ["evrvideohandler", "videorenderer", "wmptransitionwindow", "wmp transition window"]):
                rect = wintypes.RECT()
                user32.GetWindowRect(chwnd, byref(rect))
                w = rect.right - rect.left
                h = rect.bottom - rect.top
                if w > 0 and h > 0:
                    video_surfaces.append((cls_name, w, h))
            return True

        try:
            user32.EnumChildWindows(th, WNDENUMPROC(child_cb), 0)
        except Exception:
            pass

    # 1. Video rendering surface confirmed
    if video_surfaces:
        best = next((item for item in video_surfaces if "evr" in item[0].lower()), video_surfaces[0])
        dim_str = f" ({best[1]}x{best[2]})" if best[1] > 0 else ""
        file_desc = f" for '{detected_filename}'" if detected_filename else ""
        return WmpSurfaceResult(
            True,
            f"Active video rendering surface detected in Legacy Windows Media Player ({best[0]}{dim_str}){file_desc}",
            detected_file_ext,
            detected_filename,
            detected_filepath
        )

    # 2. Open video file handle / command line confirmed
    if proc_has_video_file:
        file_desc = f"'{detected_filename}' " if detected_filename else ""
        return WmpSurfaceResult(
            True,
            f"Legacy Windows Media Player opened video file {file_desc}({detected_file_ext})",
            detected_file_ext,
            detected_filename,
            detected_filepath
        )

    # 3. Open pure audio file handle / command line confirmed
    if proc_has_audio_file:
        file_desc = f"'{detected_filename}' " if detected_filename else ""
        return WmpSurfaceResult(
            False,
            f"Legacy Windows Media Player opened pure audio file {file_desc}({detected_file_ext})",
            detected_file_ext,
            detected_filename,
            detected_filepath
        )

    return WmpSurfaceResult(
        False,
        "No active video surface or video file handle detected in Legacy Windows Media Player",
        None,
        None,
        None
    )
