' Video Detector HUD - Silent Background Launcher
' Runs Run_Video_Detector_HUD.bat with 0 console window (completely invisible)
' Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
rootDir = fso.GetParentFolderName(strDir)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = rootDir

batPath = rootDir & "\Run_Video_Detector_HUD.bat"
If Not fso.FileExists(batPath) Then
    batPath = strDir & "\Run_Video_Detector_HUD.bat"
End If
WshShell.Run """" & batPath & """", 0, False

Set WshShell = Nothing
Set fso = Nothing
