' Browser Data Hub - Direct Silent Background Daemon Launcher
' Finds Python dynamically and runs browser_data_hub.py with 0 console window
' Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

Option Explicit

Dim fso, wsh, strDir, pyScript, pyExec, userProfile

Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
pyScript = strDir & "\browser_data_hub.py"

Set wsh = CreateObject("WScript.Shell")
userProfile = wsh.ExpandEnvironmentStrings("%USERPROFILE%")

' Dynamic Python resolution
pyExec = ""
If fso.FileExists(userProfile & "\.venv\Scripts\pythonw.exe") Then
    pyExec = userProfile & "\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(strDir & "\.venv\Scripts\pythonw.exe") Then
    pyExec = strDir & "\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(strDir & "\..\.venv\Scripts\pythonw.exe") Then
    pyExec = strDir & "\..\.venv\Scripts\pythonw.exe"
ElseIf fso.FileExists(userProfile & "\.local\bin\python.exe") Then
    pyExec = userProfile & "\.local\bin\python.exe"
Else
    pyExec = "pythonw"
End If

wsh.CurrentDirectory = strDir
wsh.Run """" & pyExec & """ """ & pyScript & """", 0, False

Set wsh = Nothing
Set fso = Nothing
