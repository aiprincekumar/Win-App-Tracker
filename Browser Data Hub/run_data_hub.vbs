' Browser Data Hub - Silent Background Launcher
' Runs Run_Browser_Data_Hub.bat with 0 console window (completely invisible)
' Author: Atul Verma (aiprincekumar / aiprincekumar010100@gmail.com)

Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = strDir

batPath = strDir & "\Run_Browser_Data_Hub.bat"
WshShell.Run """" & batPath & """", 0, False

Set WshShell = Nothing
Set fso = Nothing
