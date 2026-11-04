# launch_hud_native.py
# Chrome / Edge Native Messaging Host for Video Detector HUD
# Zero-Prompt Standard: Silently launches Video Detector HUD via run_hud.vbs
# Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

import sys
import struct
import json
import os
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

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    vbs_path = os.path.join(current_dir, 'run_hud.vbs')
    bat_path = os.path.join(root_dir, 'Run_Video_Detector_HUD.bat')
    if not os.path.exists(bat_path):
        bat_path = os.path.join(current_dir, 'Run_Video_Detector_HUD.bat')

    # Read incoming message from browser
    incoming = read_message()

    # Silently launch HUD detached in background
    launched = False
    try:
        creation_flags = 0x00000008 | 0x08000000 if os.name == 'nt' else 0 # DETACHED_PROCESS | CREATE_NO_WINDOW
        if os.path.exists(vbs_path):
            subprocess.Popen(['wscript.exe', vbs_path], cwd=current_dir, creationflags=creation_flags)
            launched = True
        elif os.path.exists(bat_path):
            subprocess.Popen([bat_path], cwd=current_dir, shell=True, creationflags=creation_flags)
            launched = True
    except Exception as e:
        launched = False

    # Send response back to browser extension
    action = 'launch'
    if isinstance(incoming, dict):
        action = incoming.get('action', 'launch')

    send_message({
        "status": "success" if launched else "error",
        "action": action,
        "launched": launched,
        "message": "Video Detector HUD launched silently without prompt" if launched else "Failed to launch HUD"
    })

if __name__ == '__main__':
    main()
