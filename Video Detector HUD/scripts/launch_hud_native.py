# launch_hud_native.py
# Universal Chrome / Edge Native Messaging Host for Video Detector HUD & Browser Data Hub
# Zero-Prompt Standard: Silently launches services via dynamic path resolution
# Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

import sys
import struct
import json
import os
import socket
import subprocess

def read_message():
    try:
        raw_length = sys.stdin.buffer.read(4)
        if len(raw_length) < 4:
            return None
        message_length = struct.unpack('@I', raw_length)[0]
        if message_length <= 0 or message_length > 1024 * 1024:
            return None
        data = sys.stdin.buffer.read(message_length)
        return json.loads(data.decode('utf-8'))
    except Exception:
        return None

def send_message(message_content):
    try:
        encoded_content = json.dumps(message_content).encode('utf-8')
        sys.stdout.buffer.write(struct.pack('@I', len(encoded_content)))
        sys.stdout.buffer.write(encoded_content)
        sys.stdout.buffer.flush()
    except Exception:
        pass

def is_port_listening(port: int, host: str = "127.0.0.1") -> bool:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        result = s.connect_ex((host, port))
        s.close()
        return result == 0
    except Exception:
        return False

def launch_detached_process(script_or_bat: str, work_dir: str) -> bool:
    creation_flags = 0x00000008 | 0x08000000 if os.name == 'nt' else 0  # DETACHED_PROCESS | CREATE_NO_WINDOW
    try:
        if script_or_bat.endswith('.vbs'):
            subprocess.Popen(['wscript.exe', script_or_bat], cwd=work_dir, creationflags=creation_flags)
            return True
        elif script_or_bat.endswith('.bat'):
            subprocess.Popen([script_or_bat], cwd=work_dir, shell=True, creationflags=creation_flags)
            return True
        elif script_or_bat.endswith('.py'):
            python_bin = sys.executable or "python"
            subprocess.Popen([python_bin, script_or_bat], cwd=work_dir, creationflags=creation_flags)
            return True
    except Exception:
        return False
    return False

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    hud_dir = os.path.dirname(current_dir)
    workspace_dir = os.path.dirname(hud_dir)
    hub_dir = os.path.join(workspace_dir, "Browser Data Hub")

    # Locate HUD Launchers
    hud_vbs = os.path.join(current_dir, 'run_hud.vbs')
    hud_bat = os.path.join(hud_dir, 'Run_Video_Detector_HUD.bat')

    # Locate Data Hub Launchers
    hub_vbs = os.path.join(hub_dir, 'run_data_hub.vbs')
    hub_bat = os.path.join(hub_dir, 'Run_Browser_Data_Hub.bat')
    hub_py = os.path.join(hub_dir, 'browser_data_hub.py')

    incoming = read_message() or {}
    action = incoming.get('action', 'launch') if isinstance(incoming, dict) else 'launch'

    results = {
        "hud_status": "already_running" if is_port_listening(65432) else "stopped",
        "hub_status": "already_running" if is_port_listening(65433) else "stopped"
    }

    # 1. Handle Video Detector HUD Launch
    if action in ('launch', 'launch_hud', 'launch_all', 'ping'):
        if not is_port_listening(65432):
            if os.path.exists(hud_vbs):
                launched = launch_detached_process(hud_vbs, current_dir)
            elif os.path.exists(hud_bat):
                launched = launch_detached_process(hud_bat, hud_dir)
            else:
                launched = False
            results["hud_launched"] = launched
        else:
            results["hud_launched"] = False

    # 2. Handle Browser Data Hub Launch
    if action in ('launch_hub', 'launch_data_hub', 'launch_all') or (action == 'launch' and not is_port_listening(65433)):
        if not is_port_listening(65433):
            launched = False
            if os.path.exists(hub_vbs):
                launched = launch_detached_process(hub_vbs, hub_dir)
            elif os.path.exists(hub_bat):
                launched = launch_detached_process(hub_bat, hub_dir)
            elif os.path.exists(hub_py):
                launched = launch_detached_process(hub_py, hub_dir)
            results["hub_launched"] = launched
        else:
            results["hub_launched"] = False

    send_message({
        "status": "success",
        "action": action,
        "results": results,
        "message": "Native host processed service requests successfully"
    })

if __name__ == '__main__':
    main()
