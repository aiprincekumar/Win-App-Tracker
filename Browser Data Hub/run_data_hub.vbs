' Browser Data Hub - Direct Silent Background Daemon Launcher
' Finds Python dynamically and runs browser_data_hub.py with 0 console window
' Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

Option Explicit

Dim fso, wsh, scriptPath, strDir, pyScript, pyExec, userProfile, alreadyRunning, procList

Set fso = CreateObject("Scripting.FileSystemObject")
scriptPath = fso.GetAbsolutePathName(WScript.ScriptFullName)
strDir = fso.GetParentFolderName(scriptPath)
pyScript = strDir & "\browser_data_hub.py"

Set wsh = CreateObject("WScript.Shell")
userProfile = wsh.ExpandEnvironmentStrings("%USERPROFILE%")

' 1. Check if Browser Data Hub is already running to avoid duplicate processes
alreadyRunning = False
On Error Resume Next
Set procList = GetObject("winmgmts:").ExecQuery("SELECT ProcessId, CommandLine FROM Win32_Process WHERE CommandLine LIKE '%browser_data_hub.py%'")
If Not procList Is Nothing Then
    If procList.Count > 0 Then
        alreadyRunning = True
    End If
End If
On Error GoTo 0

If alreadyRunning Then
    WScript.Quit 0
End If

' 2. Dynamic Python resolution (Prefer pythonw for 0 console window)
pyExec = ""
If fso.FileExists(userProfile & "\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\pythonw.exe") Then
    pyExec = userProfile & "\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\pythonw.exe"
ElseIf fso.FileExists(userProfile & "\.venv\Scripts\pythonw.exe") Then
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

' 3. Launch completely hidden (window style 0, detached)
wsh.CurrentDirectory = strDir
wsh.Run """" & pyExec & """ """ & pyScript & """", 0, False

Set wsh = Nothing
Set fso = Nothing
