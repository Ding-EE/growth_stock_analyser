$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) {
    $scriptDir = (Get-Location).Path
}

Write-Host "Configuring Growth Stock Analyser Windows Startup..." -ForegroundColor Cyan
Write-Host "Project Directory: $scriptDir"

$ws = New-Object -ComObject WScript.Shell
$startupPath = [System.Environment]::GetFolderPath('Startup')
$shortcutFile = Join-Path $startupPath "GrowthStockAnalyser.lnk"

# 1. Create Startup Shortcut
$shortcut = $ws.CreateShortcut($shortcutFile)
$shortcut.TargetPath = "wscript.exe"
$vbsPath = Join-Path $scriptDir "launch_service.vbs"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $scriptDir
$shortcut.Description = "Growth Stock Analyser Background Auto-Start Service"
$shortcut.Save()

Write-Host "Created Startup Shortcut: $shortcutFile" -ForegroundColor Green

# 2. Create Desktop Shortcut for easy 1-click access
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$desktopShortcutFile = Join-Path $desktopPath "Growth Stock Analyser.lnk"
$batPath = Join-Path $scriptDir "start_dashboard.bat"

$dShortcut = $ws.CreateShortcut($desktopShortcutFile)
$dShortcut.TargetPath = $batPath
$dShortcut.WorkingDirectory = $scriptDir
$dShortcut.Description = "Launch Growth Stock Analyser Dashboard"
$dShortcut.Save()

Write-Host "Created Desktop Shortcut: $desktopShortcutFile" -ForegroundColor Green

# 3. Check if server is running
$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $conns) {
    Write-Host "Launching background service now via launch_service.vbs..." -ForegroundColor Yellow
    Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`""
    Start-Sleep -Seconds 2
} else {
    Write-Host "Background service is already running on port 8000." -ForegroundColor Green
}

Write-Host "`nSetup successfully finished!" -ForegroundColor Green
Write-Host "Access dashboard at: http://localhost:8000" -ForegroundColor Cyan
