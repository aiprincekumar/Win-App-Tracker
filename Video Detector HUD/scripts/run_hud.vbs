' Video Detector HUD - Direct Silent Background Launcher
' Runs src\video_detector_hud.py with 0 console window (completely invisible)
' Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

Option Explicit

Dim fso, wsh, scriptPath, strDir, rootDir, pyScript, pyExec, userProfile

Set fso = CreateObject("Scripting.FileSystemObject")
scriptPath = fso.GetAbsolutePathName(WScript.ScriptFullName)
strDir = fso.GetParentFolderName(scriptPath)
rootDir = fso.GetParentFolderName(strDir)
pyScript = rootDir & "\src\video_detector_hud.py"

Set wsh = CreateObject("WScript.Shell")
userProfile = wsh.ExpandEnvironmentStrings("%USERPROFILE%")

pyExec = ""
If fso.FileExists(userProfile & "\.venv\Scripts\pythonw.exe") Then
    pyExec = userProfile & "\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(rootDir & "\.venv\Scripts\pythonw.exe") Then
    pyExec = rootDir & "\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(rootDir & "\..\.venv\Scripts\pythonw.exe") Then
    pyExec = rootDir & "\..\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(userProfile & "\.local\bin\python.exe") Then
    pyExec = userProfile & "\.local\bin\python.exe"
Else
    pyExec = "pythonw"
End If

wsh.CurrentDirectory = rootDir & "\src"
wsh.Run """" & pyExec & """ """ & pyScript & """", 0, False

Set wsh = Nothing
Set fso = Nothing
