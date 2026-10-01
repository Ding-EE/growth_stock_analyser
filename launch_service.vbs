Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Check if port 8000 is already active without flashing any console
cmdCheck = "powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command ""if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"""
retCode = objShell.Run(cmdCheck, 0, True)

If retCode <> 0 Then
    ' Start backend FastAPI server windowlessly in the background
    cmdStart = "powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command ""Set-Location '" & scriptDir & "'; python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"""
    objShell.Run cmdStart, 0, False
    WScript.Sleep 2500
End If

' If /open argument was passed, open browser
For Each arg In WScript.Arguments
    If LCase(arg) = "/open" Or LCase(arg) = "--open" Then
        objShell.Run "http://localhost:8000"
        Exit For
    End If
Next
