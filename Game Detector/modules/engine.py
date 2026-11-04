# -*- coding: utf-8 -*-
"""
engine.py: Windows Native Game Detection Engine (Xbox Game Bar Architecture).
Department 02: Solution Architecture & Department 06: Systems Engineering.

Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)
Workspace: Win App Tracker / Game Detector
"""

import sys
import os
import time
import logging
import threading
import winreg
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any

import ctypes
from ctypes import wintypes

from .config import (
    user32,
    kernel32,
    ole32,
    PROCESS_QUERY_LIMITED_INFORMATION,
    PROCESS_QUERY_INFORMATION,
    TH32CS_SNAPPROCESS,
    decrypt_dpapi_blob
)
from .tracker import (
    GameActivityTracker,
    get_activity_tracker,
    reset_activity_tracker
)

COINIT_MULTITHREADED = 0x2
try:
    if ole32:
        _com_init_hr = ole32.CoInitializeEx(None, COINIT_MULTITHREADED)
except Exception:
    pass


class GUID(ctypes.Structure):
    _fields_ = [
        ("Data1", wintypes.DWORD),
        ("Data2", wintypes.WORD),
        ("Data3", wintypes.WORD),
        ("Data4", ctypes.c_ubyte * 8)
    ]


def _make_guid(s: str) -> GUID:
    g = GUID()
    if ole32:
        ole32.IIDFromString(s, ctypes.byref(g))
    return g


CLSID_MMDeviceEnumerator   = _make_guid("{BCDE0395-E52F-467C-8E3D-C4579291692E}")
IID_IMMDeviceEnumerator    = _make_guid("{A95664D2-9614-4F35-A746-DE8DB63617E6}")
IID_IAudioMeterInformation = _make_guid("{C02216F6-8C67-4B5B-9D00-D008E73E0064}")


def _call_com_method(this_ptr: ctypes.c_void_p, vtable_index: int, restype: Any, argtypes: List[Any], *args) -> Any:
    """Dispatches a direct COM vtable method call."""
    vtable = ctypes.cast(this_ptr, ctypes.POINTER(ctypes.POINTER(ctypes.c_void_p))).contents
    fn = ctypes.WINFUNCTYPE(restype, ctypes.c_void_p, *argtypes)(vtable[vtable_index])
    return fn(this_ptr, *args)


def get_wasapi_master_audio_peak() -> float:
    """
    Directly queries Windows Core Audio API (WASAPI) MMDeviceEnumerator / IAudioMeterInformation
    for the master audio peak level (0.0 to 1.0).
    Non-blocking, fast (< 0.2ms).
    """
    if not ole32:
        return 0.0
    try:
        p_enumerator = ctypes.c_void_p()
        hr = ole32.CoCreateInstance(
            ctypes.byref(CLSID_MMDeviceEnumerator),
            None,
            1,  # CLSCTX_INPROC_SERVER
            ctypes.byref(IID_IMMDeviceEnumerator),
            ctypes.byref(p_enumerator)
        )
        if hr != 0 or not p_enumerator.value:
            return 0.0

        p_device_col = ctypes.c_void_p()
        hr = _call_com_method(
            p_enumerator, 3, ctypes.c_long,
            [ctypes.c_int, wintypes.DWORD, ctypes.POINTER(ctypes.c_void_p)],
            0, 1, ctypes.byref(p_device_col)
        )
        if hr != 0 or not p_device_col.value:
            _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])
            return 0.0

        dev_count = ctypes.c_uint(0)
        _call_com_method(p_device_col, 3, ctypes.c_long, [ctypes.POINTER(ctypes.c_uint)], ctypes.byref(dev_count))

        max_master_peak = 0.0
        for d in range(dev_count.value):
            p_dev = ctypes.c_void_p()
            _call_com_method(p_device_col, 4, ctypes.c_long, [ctypes.c_uint, ctypes.POINTER(ctypes.c_void_p)], d, ctypes.byref(p_dev))

            p_meter = ctypes.c_void_p()
            _call_com_method(
                p_dev, 3, ctypes.c_long,
                [ctypes.POINTER(GUID), wintypes.DWORD, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)],
                ctypes.byref(IID_IAudioMeterInformation), 1, None, ctypes.byref(p_meter)
            )
            if p_meter.value:
                peak = ctypes.c_float(0.0)
                _call_com_method(p_meter, 3, ctypes.c_long, [ctypes.POINTER(ctypes.c_float)], ctypes.byref(peak))
                max_master_peak = max(max_master_peak, float(peak.value))
                _call_com_method(p_meter, 2, ctypes.c_ulong, [])

            _call_com_method(p_dev, 2, ctypes.c_ulong, [])

        _call_com_method(p_device_col, 2, ctypes.c_ulong, [])
        _call_com_method(p_enumerator, 2, ctypes.c_ulong, [])
        return max(0.0, min(1.0, max_master_peak))
    except Exception:
        return 0.0


def get_live_wasapi_audio_state() -> Dict[str, Any]:
    """Returns master audio peak and session state."""
    peak = get_wasapi_master_audio_peak()
    return {
        "master_peak": peak,
        "is_audio_active": peak > 0.0001
    }


# 64-bit safe Win32 function signatures
if user32:
    user32.GetForegroundWindow.restype = wintypes.HWND
    user32.GetForegroundWindow.argtypes = []

    user32.GetWindowThreadProcessId.restype = wintypes.DWORD
    user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]

    user32.GetWindowTextW.restype = ctypes.c_int
    user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]

    user32.GetWindowTextLengthW.restype = ctypes.c_int
    user32.GetWindowTextLengthW.argtypes = [wintypes.HWND]

    user32.IsWindowVisible.restype = wintypes.BOOL
    user32.IsWindowVisible.argtypes = [wintypes.HWND]

    user32.GetShellWindow.restype = wintypes.HWND
    user32.GetShellWindow.argtypes = []

    user32.GetDesktopWindow.restype = wintypes.HWND
    user32.GetDesktopWindow.argtypes = []

if kernel32:
    kernel32.OpenProcess.restype = wintypes.HANDLE
    kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]

    kernel32.CloseHandle.restype = wintypes.BOOL
    kernel32.CloseHandle.argtypes = [wintypes.HANDLE]

    kernel32.QueryFullProcessImageNameW.restype = wintypes.BOOL
    kernel32.QueryFullProcessImageNameW.argtypes = [
        wintypes.HANDLE,
        wintypes.DWORD,
        wintypes.LPWSTR,
        ctypes.POINTER(wintypes.DWORD)
    ]

    kernel32.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
    kernel32.CreateToolhelp32Snapshot.argtypes = [wintypes.DWORD, wintypes.DWORD]


class PROCESSENTRY32W(ctypes.Structure):
    _fields_ = [
        ('dwSize', wintypes.DWORD),
        ('cntUsage', wintypes.DWORD),
        ('th32ProcessID', wintypes.DWORD),
        ('th32DefaultHeapID', ctypes.c_size_t),
        ('th32ModuleID', wintypes.DWORD),
        ('cntThreads', wintypes.DWORD),
        ('th32ParentProcessID', wintypes.DWORD),
        ('pcPriClassBase', wintypes.LONG),
        ('dwFlags', wintypes.DWORD),
        ('szExeFile', wintypes.WCHAR * 260)
    ]


if kernel32:
    kernel32.Process32FirstW.restype = wintypes.BOOL
    kernel32.Process32FirstW.argtypes = [wintypes.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]

    kernel32.Process32NextW.restype = wintypes.BOOL
    kernel32.Process32NextW.argtypes = [wintypes.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]


EXCLUDED_STORE_PACKAGES = {
    "microsoft.mspaint",
    "microsoft.yourphone",
    "clipchamp.clipchamp",
    "28017charlesmilette.translucenttb",
    "microsoft.desktopappinstaller",
    "microsoft.gethelp",
    "microsoftcorporationii.windowssubsystemforlinux",
    "11413ptruceanbogdan.wintoys",
    "neroag.neroaiimageupscaler365",
    "uabplanner5d.planner5d-homeinteriordesign"
}

SYSTEM_EXES = {
    "explorer.exe", "cmd.exe", "powershell.exe", "pwsh.exe", "conhost.exe",
    "taskmgr.exe", "code.exe", "chrome.exe", "firefox.exe", "msedge.exe",
    "brave.exe", "antigravity.exe", "python.exe", "pythonw.exe", "py.exe",
    "system", "registry", "smss.exe", "csrss.exe", "wininit.exe", "services.exe",
    "lsass.exe", "svchost.exe", "fontdrvhost.exe", "dwm.exe", "spoolsv.exe",
    "gamebar.exe", "gamebarft.exe", "gamebarpresencewriter.exe", "bcastdvr.exe",
    "steam.exe", "steamservice.exe", "steamwebhelper.exe", "epicgameslauncher.exe",
    "discord.exe", "spotify.exe", "slack.exe", "teams.exe"
}

MEDIA_VIDEO_PLAYERS = {
    "vlc.exe": "VLC Media Player",
    "potplayermini64.exe": "Daum PotPlayer",
    "potplayer.exe": "Daum PotPlayer",
    "mpc-hc64.exe": "Media Player Classic",
    "mpc-hc.exe": "Media Player Classic",
    "mpc-be64.exe": "MPC-BE",
    "mpc-be.exe": "MPC-BE",
    "wmplayer.exe": "Windows Media Player",
    "movies.tv.exe": "Movies & TV",
    "video.ui.exe": "Windows Media Player (Modern)",
    "netflix.exe": "Netflix",
    "plex.exe": "Plex Desktop",
    "kodi.exe": "Kodi",
    "kmplayer.exe": "KMPlayer",
    "gopromux.exe": "GoPro Player",
    "quicktimeplayer.exe": "QuickTime",
    "obs64.exe": "OBS Studio",
    "handbrake.exe": "HandBrake"
}

BROWSER_EXES = {
    "chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe", "vivaldi.exe"
}

VIDEO_TITLE_KEYWORDS = [
    "youtube", "netflix", "twitch", "prime video", "hotstar", "disney+",
    "hulu", "vimeo", "dailymotion", "video", "crunchyroll", "bilibili"
]


@dataclass
class GameInfo:
    """Represents a game registered in Windows or actively detected."""
    name: str
    executable_name: str
    full_path: Optional[str] = None
    parent_directory: Optional[str] = None
    title_id: Optional[str] = None
    guid: Optional[str] = None
    flags: Optional[int] = None
    type: Optional[int] = None
    source: str = "Windows GameConfigStore"
    detection_method: Optional[str] = None
    pid: Optional[int] = None
    window_title: Optional[str] = None
    genre: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ProcessInfo:
    """Represents a running process on Windows."""
    pid: int
    name: str
    path: Optional[str] = None
    window_title: Optional[str] = None
    hwnd: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def classify_game_genre(game: Optional[GameInfo], is_video_active: bool = False) -> str:
    """Classifies a detected game into its genre / category heuristic."""
    if not game:
        if is_video_active:
            return "None (वीडियो को निष्क्रिय माना जाता है)"
        return "None"

    text = f"{game.name} {game.executable_name} {game.window_title or ''} {game.full_path or ''}".lower()

    racing_kw = [
        "racing", "forza", "need for speed", "nfs", "dirt", "f1 ", "f1_", "f1 2", "assetto",
        "truck simulator", "amtrucks", "eurotruck", "trackmania", "wrc", "burnout", "grid",
        "project cars", "the crew", "motorfest", "kart", "iracing", "ride ", "motogp", "asphalt"
    ]
    if any(k in text for k in racing_kw):
        genre = "Racing / Simulation"
    elif any(k in text for k in [
        "civilization", "age of empires", "total war", "cities: skylines", "stellaris",
        "crusader kings", "hearts of iron", "sims", "rimworld", "factorio", "satisfactory",
        "anno", "command & conquer", "starcraft", "warcraft", "company of heroes", "frostpunk",
        "football manager", "flight simulator", "kingdom rush", "tower defense", "strategy",
        "tycoon", "simulator"
    ]):
        genre = "Strategy / Simulation"
    elif any(k in text for k in [
        "cyberpunk", "witcher", "grand theft auto", "gta5", "gta 5", "gta v", "gtaiv", "gta iv",
        "red dead", "rdr2", "rdr", "sekiro", "elden ring", "dark souls", "bloodborne",
        "god of war", "starfield", "baldur's gate", "hogwarts", "call of duty", "battlefield",
        "assassin's creed", "far cry", "spider-man", "horizon zero", "horizon forbidden",
        "death stranding", "resident evil", "monster hunter", "star wars jedi", "final fantasy",
        "ghost of tsushima", "alan wake", "control"
    ]):
        if any(k in text for k in ["sekiro", "elden ring", "dark souls", "bloodborne", "witcher"]):
            genre = "AAA / Action RPG"
        elif any(k in text for k in ["gta", "red dead", "rdr"]):
            genre = "AAA / Open World"
        else:
            genre = "AAA"
    elif any(k in text for k in [
        "rpg", "role play", "skyrim", "fallout", "warframe", "diablo", "destiny", "genshin",
        "honkai", "path of exile", "mass effect", "dragon age", "persona", "tales of",
        "kingdom hearts", "dragons dogma", "baldurs gate", "chronicles"
    ]):
        genre = "Role Play (RPG) / Action"
    elif any(k in text for k in [
        "hollow knight", "dead cells", "cuphead", "celeste", "ori", "hades", "rogue",
        "spelunky", "brotato", "vampire survivors", "binding of isaac", "sonic", "mario",
        "pac-man", "tetris", "geometry dash", "meat boy", "arcade", "platformer"
    ]):
        genre = "Arcade / Platformer"
    elif any(k in text for k in [
        "chess", "solitaire", "monopoly", "tabletop", "hearthstone", "magic: the gathering",
        "yu-gi-oh", "slay the spire", "balatro", "poker", "checkers", "board", "mahjong"
    ]):
        genre = "Board / Card"
    elif any(k in text for k in [
        "counter-strike", "csgo", "cs:go", "cs2", "valorant", "overwatch", "apex",
        "fortnite", "rainbow six", "pubg", "doom", "wolfenstein", "halo", "team fortress",
        "left 4 dead", "payday", "quake", "tarkov", "rust", "deep rock"
    ]):
        genre = "Shooter / Action"
    elif game.type == 2 or (game.flags and (game.flags & 0x1)):
        genre = "Xbox / Store Game"
    else:
        genre = "Win32 Game / PC Game"

    if is_video_active:
        return f"{genre} (वीडियो को निष्क्रिय माना जाता है)"
    return genre


def detect_active_player(game: Optional[GameInfo]) -> str:
    """Identifies active game distribution platform or launcher."""
    if not game:
        return "None"

    if game.title_id and ("Steam" in (game.source or "") or (game.full_path and "steamapps" in game.full_path.lower())):
        return f"Steam (AppID: {game.title_id})"
    if "Steam" in (game.source or "") or (game.full_path and "steamapps" in game.full_path.lower()):
        return "Steam"

    if "Xbox" in (game.source or "") or (game.full_path and "xboxgames" in game.full_path.lower()):
        return "Xbox Game Pass"
    if game.type == 2:
        return "Xbox App / Windows Gaming"

    if game.full_path and "epic games" in game.full_path.lower():
        return "Epic Games"

    if game.full_path and "gog galaxy" in game.full_path.lower():
        return "GOG Galaxy"

    if game.full_path and ("ubisoft" in game.full_path.lower() or "uplay" in game.full_path.lower()):
        return "Ubisoft Connect"
    if game.full_path and ("ea games" in game.full_path.lower() or "origin" in game.full_path.lower()):
        return "EA App"

    return "Custom / Win32 Game"


def _clean_title(title: Optional[str], max_len: int = 42) -> str:
    """Cleans and truncates title cleanly to maintain a fixed-width card."""
    if not title:
        return "None"
    s = str(title).strip()
    if not s or s.lower() == "none":
        return "None"
    if len(s) > max_len:
        return s[:max_len - 3] + "..."
    return s


class WindowsGameEngine:
    """Core Autonomous Detector Engine for active PC games on Microsoft Windows."""

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger("WindowsGameEngine")
        self._registered_games: List[GameInfo] = []
        self._by_full_path: Dict[str, GameInfo] = {}
        self._by_exe_name: Dict[str, GameInfo] = {}
        self._by_parent_dir: Dict[str, GameInfo] = {}
        self._by_title_id: Dict[str, GameInfo] = {}
        self._steam_path: Optional[Path] = None
        self._steam_library_folders: List[Path] = []
        self._last_registry_refresh: float = 0.0

        # Asynchronous background scanner state
        self._bg_thread: Optional[threading.Thread] = None
        self._bg_stop_event: threading.Event = threading.Event()
        self._cached_background_game: Optional[GameInfo] = None
        self._cached_video_status: bool = False
        self._cached_video_desc: str = ""
        self._bg_worker_running: bool = False

        # Continuous activity tracker
        self.tracker: GameActivityTracker = GameActivityTracker()

        # Initialize registries and ecosystem
        self.refresh_registered_games()
        self._init_steam_environment()

    def refresh_registered_games(self) -> List[GameInfo]:
        """Queries Windows GameConfigStore and game stores to build active game index."""
        games: List[GameInfo] = []
        now = time.time()

        reg_path = r"System\GameConfigStore\Children"
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, reg_path) as parent_key:
                subkeys_count, _, _ = winreg.QueryInfoKey(parent_key)
                for i in range(subkeys_count):
                    try:
                        child_guid = winreg.EnumKey(parent_key, i)
                        with winreg.OpenKey(parent_key, child_guid) as child_key:
                            vals_count = winreg.QueryInfoKey(child_key)[1]
                            data: Dict[str, Any] = {}
                            for vi in range(vals_count):
                                vn, vv, _ = winreg.EnumValue(child_key, vi)
                                data[vn] = vv

                            flags = data.get("Flags", 0)
                            gtype = data.get("Type", 1)
                            title_id = str(data.get("TitleId")) if data.get("TitleId") is not None else None
                            matched_exe = data.get("MatchedExeFullPath")
                            exe_parent_dir = data.get("ExeParentDirectory")
                            guid = data.get("GameDVR_GameGUID", child_guid)

                            parent_blob = data.get("Parent")
                            decrypted_exe = None
                            if isinstance(parent_blob, (bytes, bytearray)):
                                decrypted_exe = decrypt_dpapi_blob(parent_blob)

                            if decrypted_exe:
                                d_low = decrypted_exe.lower()
                                if any(pkg in d_low for pkg in EXCLUDED_STORE_PACKAGES):
                                    continue
                                if d_low.endswith("!app") and gtype == 2 and (flags & 0x1 == 0):
                                    continue

                            game_name = None
                            if exe_parent_dir:
                                game_name = exe_parent_dir
                            elif matched_exe:
                                game_name = Path(matched_exe).stem
                            elif decrypted_exe:
                                game_name = Path(decrypted_exe).stem
                            elif title_id:
                                game_name = f"Xbox Title {title_id}"
                            else:
                                game_name = f"Game {child_guid[:8]}"

                            exe_name = ""
                            if matched_exe:
                                exe_name = Path(matched_exe).name
                            elif decrypted_exe:
                                exe_name = Path(decrypted_exe).name
                            elif exe_parent_dir:
                                exe_name = f"{exe_parent_dir}.exe"

                            if not exe_name and not matched_exe and not exe_parent_dir and not title_id:
                                continue

                            game_obj = GameInfo(
                                name=game_name,
                                executable_name=exe_name,
                                full_path=matched_exe,
                                parent_directory=exe_parent_dir,
                                title_id=title_id,
                                guid=guid,
                                flags=flags,
                                type=gtype,
                                source="GameConfigStore (Children)"
                            )
                            games.append(game_obj)
                    except Exception:
                        continue
        except Exception as e:
            self.logger.debug(f"Could not open GameConfigStore Children: {e}")

        # Legacy / Compatibility GameUX Registry
        gameux_paths = [
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\GameUX\Games"),
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\GameUX\Games"),
            (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\GameUX\Games")
        ]
        for hive, gpath in gameux_paths:
            try:
                with winreg.OpenKey(hive, gpath) as gkey:
                    sub_count, _, _ = winreg.QueryInfoKey(gkey)
                    for i in range(sub_count):
                        try:
                            g_guid = winreg.EnumKey(gkey, i)
                            with winreg.OpenKey(gkey, g_guid) as sub_k:
                                title, _ = winreg.QueryValueEx(sub_k, "Title")
                                app_exe, _ = winreg.QueryValueEx(sub_k, "AppExe")
                                games.append(GameInfo(
                                    name=title,
                                    executable_name=Path(app_exe).name,
                                    full_path=app_exe,
                                    guid=g_guid,
                                    source="GameUX (Registry)"
                                ))
                        except Exception:
                            continue
            except Exception:
                pass

        self._registered_games = games
        self._by_full_path.clear()
        self._by_exe_name.clear()
        self._by_parent_dir.clear()
        self._by_title_id.clear()

        for g in games:
            if g.full_path:
                self._by_full_path[os.path.normpath(g.full_path).lower()] = g
            if g.executable_name:
                self._by_exe_name[g.executable_name.lower()] = g
            if g.parent_directory:
                self._by_parent_dir[g.parent_directory.lower()] = g
            if g.title_id:
                self._by_title_id[g.title_id] = g

        self._last_registry_refresh = now
        return games

    def _init_steam_environment(self):
        """Discovers Steam install location and library paths."""
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as skey:
                spath, _ = winreg.QueryValueEx(skey, "SteamPath")
                if spath:
                    self._steam_path = Path(os.path.normpath(spath))
                    common = self._steam_path / "steamapps" / "common"
                    if common.exists():
                        self._steam_library_folders.append(common)
        except Exception:
            pass

    def get_steam_active_appid(self) -> int:
        """Reads HKCU\\Software\\Valve\\Steam\\RunningAppID."""
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as skey:
                appid, _ = winreg.QueryValueEx(skey, "RunningAppID")
                return int(appid)
        except Exception:
            return 0

    def get_foreground_process(self) -> Optional[ProcessInfo]:
        """Inspects currently active foreground window using Win32 API."""
        if not user32 or not kernel32:
            return None
        hwnd = user32.GetForegroundWindow()
        if not hwnd:
            return None

        if hwnd == user32.GetDesktopWindow() or hwnd == user32.GetShellWindow():
            return None

        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        pid_val = pid.value
        if pid_val <= 4:
            return None

        title = ""
        length = user32.GetWindowTextLengthW(hwnd)
        if length > 0:
            buf = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buf, length + 1)
            title = buf.value.strip()

        h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid_val)
        if not h_proc:
            return ProcessInfo(pid=pid_val, name=f"PID_{pid_val}", window_title=title, hwnd=hwnd)

        try:
            buf_path = ctypes.create_unicode_buffer(1024)
            size = wintypes.DWORD(1024)
            if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf_path, ctypes.byref(size)):
                full_path = buf_path.value
                exe_name = Path(full_path).name
                return ProcessInfo(pid=pid_val, name=exe_name, path=full_path, window_title=title, hwnd=hwnd)
        finally:
            kernel32.CloseHandle(h_proc)

        return ProcessInfo(pid=pid_val, name=f"PID_{pid_val}", window_title=title, hwnd=hwnd)

    def get_all_running_processes(self) -> List[ProcessInfo]:
        """Enumerates all running processes using pure Win32 CreateToolhelp32Snapshot."""
        processes: List[ProcessInfo] = []
        if not kernel32:
            return processes
        h_snap = kernel32.CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
        if not h_snap or h_snap == -1:
            return processes

        entry = PROCESSENTRY32W()
        entry.dwSize = ctypes.sizeof(PROCESSENTRY32W)

        try:
            if kernel32.Process32FirstW(h_snap, ctypes.byref(entry)):
                while True:
                    pid_val = entry.th32ProcessID
                    exe_name = entry.szExeFile

                    if pid_val > 4 and exe_name.lower() not in SYSTEM_EXES:
                        full_path = None
                        h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid_val)
                        if h_proc:
                            try:
                                buf_path = ctypes.create_unicode_buffer(1024)
                                size = wintypes.DWORD(1024)
                                if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf_path, ctypes.byref(size)):
                                    full_path = buf_path.value
                            finally:
                                kernel32.CloseHandle(h_proc)

                        processes.append(ProcessInfo(pid=pid_val, name=exe_name, path=full_path))

                    if not kernel32.Process32NextW(h_snap, ctypes.byref(entry)):
                        break
        finally:
            kernel32.CloseHandle(h_snap)

        return processes

    def match_process_to_game(self, proc: ProcessInfo) -> Optional[GameInfo]:
        """Matches a running process against registered Windows games and signatures."""
        if not proc or not proc.name:
            return None

        exe_lower = proc.name.lower()
        if exe_lower in SYSTEM_EXES:
            return None

        path_norm = os.path.normpath(proc.path).lower() if proc.path else ""

        if path_norm and path_norm in self._by_full_path:
            g = self._by_full_path[path_norm]
            return GameInfo(
                name=g.name,
                executable_name=proc.name,
                full_path=proc.path,
                parent_directory=g.parent_directory,
                title_id=g.title_id,
                guid=g.guid,
                flags=g.flags,
                type=g.type,
                source=f"{g.source} (MatchedExeFullPath)",
                pid=proc.pid,
                window_title=proc.window_title
            )

        if exe_lower in self._by_exe_name:
            g = self._by_exe_name[exe_lower]
            return GameInfo(
                name=g.name,
                executable_name=proc.name,
                full_path=proc.path,
                parent_directory=g.parent_directory,
                title_id=g.title_id,
                guid=g.guid,
                flags=g.flags,
                type=g.type,
                source=f"{g.source} (DPAPI Parent Match)",
                pid=proc.pid,
                window_title=proc.window_title
            )

        if path_norm:
            parent_dir_name = Path(path_norm).parent.name.lower()
            if parent_dir_name in self._by_parent_dir:
                g = self._by_parent_dir[parent_dir_name]
                return GameInfo(
                    name=g.name or parent_dir_name.title(),
                    executable_name=proc.name,
                    full_path=proc.path,
                    parent_directory=g.parent_directory,
                    title_id=g.title_id,
                    guid=g.guid,
                    flags=g.flags,
                    type=g.type,
                    source=f"{g.source} (ParentDirectory Match)",
                    pid=proc.pid,
                    window_title=proc.window_title
                )

        if path_norm and ("\\steamapps\\common\\" in path_norm or "/steamapps/common/" in path_norm):
            orig_parts = Path(os.path.normpath(proc.path)).parts if proc.path else ()
            lower_parts = [p.lower() for p in orig_parts]
            try:
                idx = lower_parts.index("common")
                if idx + 1 < len(orig_parts):
                    folder_game_name = orig_parts[idx + 1]
                    if folder_game_name.lower() not in ("steamworks shared", "_commonredist"):
                        return GameInfo(
                            name=folder_game_name,
                            executable_name=proc.name,
                            full_path=proc.path,
                            source="Steam Library (steamapps/common)",
                            pid=proc.pid,
                            window_title=proc.window_title
                        )
            except Exception:
                pass

        if path_norm:
            if ("\\xboxgames\\" in path_norm or "/xboxgames/" in path_norm or
                "\\epic games\\" in path_norm or "/epic games/" in path_norm):
                folder_game_name = Path(proc.path).parent.name if proc.path else "Game"
                return GameInfo(
                    name=folder_game_name,
                    executable_name=proc.name,
                    full_path=proc.path,
                    source="Gaming Library Directory",
                    pid=proc.pid,
                    window_title=proc.window_title
                )

        return None

    def start_background_scanner(self, scan_interval: float = 1.0):
        """Starts asynchronous background worker for non-blocking UI tick."""
        if self._bg_worker_running:
            return
        self._bg_stop_event.clear()
        self._bg_worker_running = True

        def _worker():
            while not self._bg_stop_event.is_set():
                try:
                    running_procs = self.get_all_running_processes()
                    found_game = None
                    found_video = False
                    video_desc = ""

                    for proc in running_procs:
                        if not found_game:
                            matched = self.match_process_to_game(proc)
                            if matched:
                                matched.detection_method = "running_process_background"
                                found_game = matched

                        exe_low = proc.name.lower()
                        if exe_low in MEDIA_VIDEO_PLAYERS:
                            found_video = True
                            video_desc = MEDIA_VIDEO_PLAYERS[exe_low]

                    self._cached_background_game = found_game
                    self._cached_video_status = found_video
                    self._cached_video_desc = video_desc
                except Exception:
                    pass
                self._bg_stop_event.wait(scan_interval)

        self._bg_thread = threading.Thread(target=_worker, name="GameDetectorBgScanner", daemon=True)
        self._bg_thread.start()

    def stop_background_scanner(self):
        """Stops asynchronous background worker."""
        self._bg_stop_event.set()
        self._bg_worker_running = False
        if self._bg_thread and self._bg_thread.is_alive():
            self._bg_thread.join(timeout=0.5)
        self._bg_thread = None

    def evaluate_game_inactivity(self, now: Optional[float] = None) -> Dict[str, Any]:
        """Evaluates active game state and tracks metrics."""
        fg_proc = self.get_foreground_process()
        matched_fg_game = self.match_process_to_game(fg_proc) if fg_proc else None

        is_video = False
        video_name = ""
        if fg_proc:
            exe_low = fg_proc.name.lower()
            if exe_low in MEDIA_VIDEO_PLAYERS:
                is_video = True
                video_name = MEDIA_VIDEO_PLAYERS[exe_low]
            elif exe_low in BROWSER_EXES:
                w_title = (fg_proc.window_title or "").lower()
                if any(k in w_title for k in VIDEO_TITLE_KEYWORDS):
                    is_video = True
                    video_name = f"{exe_low} ({fg_proc.window_title})"

        if not is_video and self._cached_video_status:
            is_video = True
            video_name = self._cached_video_desc

        detected_game = None
        playback_state = "STOPPED"

        if matched_fg_game:
            matched_fg_game.detection_method = "foreground_window"
            playback_state = "PLAYING"
            detected_game = matched_fg_game
        else:
            steam_appid = self.get_steam_active_appid()
            if steam_appid > 0:
                steam_game = GameInfo(
                    name=f"Steam Game (AppID: {steam_appid})",
                    executable_name=fg_proc.name if fg_proc else "steam_game.exe",
                    full_path=fg_proc.path if fg_proc else None,
                    title_id=str(steam_appid),
                    source="Steam Active RunningAppID",
                    detection_method="steam_active_appid",
                    pid=fg_proc.pid if fg_proc else None,
                    window_title=fg_proc.window_title if fg_proc else None
                )
                detected_game = steam_game
                if fg_proc and fg_proc.name.lower() not in SYSTEM_EXES and not is_video:
                    playback_state = "PLAYING"
                else:
                    playback_state = "PAUSED"
            else:
                bg_game = self._cached_background_game
                if bg_game is None and not self._bg_worker_running:
                    for proc in self.get_all_running_processes():
                        matched = self.match_process_to_game(proc)
                        if matched:
                            matched.detection_method = "running_process_background"
                            bg_game = matched
                            break
                        exe_low = proc.name.lower()
                        if exe_low in MEDIA_VIDEO_PLAYERS:
                            is_video = True
                            video_name = MEDIA_VIDEO_PLAYERS[exe_low]

                if bg_game:
                    playback_state = "PAUSED"
                    detected_game = bg_game
                else:
                    playback_state = "STOPPED"
                    detected_game = None

        audio_peak = get_wasapi_master_audio_peak()
        if now is None:
            now = time.time()
        is_playing = (playback_state == "PLAYING")
        tracker_res = self.tracker.update(is_playing, now=now)

        return {
            "playback_state": playback_state,
            "game": detected_game,
            "foreground_process": fg_proc,
            "is_video_active": is_video,
            "video_desc": video_name,
            "audio_peak": audio_peak,
            "continuous_play_seconds": tracker_res["continuous_play_seconds"],
            "continuous_pause_seconds": tracker_res["continuous_pause_seconds"],
            "activity_history_60m": tracker_res["activity_history_60m"]
        }


# Backwards compatibility alias
WindowsGameDetector = WindowsGameEngine

__all__ = [
    "WindowsGameEngine",
    "WindowsGameDetector",
    "GameInfo",
    "ProcessInfo",
    "decrypt_dpapi_blob",
    "classify_game_genre",
    "detect_active_player",
    "_clean_title",
    "GameActivityTracker",
    "get_activity_tracker",
    "reset_activity_tracker",
    "get_wasapi_master_audio_peak",
    "get_live_wasapi_audio_state",
]
