$startupPath = [System.Environment]::GetFolderPath('Startup')
$shortcutFile = Join-Path $startupPath "GrowthStockAnalyser.lnk"

if (Test-Path $shortcutFile) {
    Remove-Item -Path $shortcutFile -Force
    Write-Host "Removed Startup shortcut: $shortcutFile" -ForegroundColor Yellow
} else {
    Write-Host "Startup shortcut was not found." -ForegroundColor Gray
}

$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$desktopShortcutFile = Join-Path $desktopPath "Growth Stock Analyser.lnk"

if (Test-Path $desktopShortcutFile) {
    Remove-Item -Path $desktopShortcutFile -Force
    Write-Host "Removed Desktop shortcut: $desktopShortcutFile" -ForegroundColor Yellow
} else {
    Write-Host "Desktop shortcut was not found." -ForegroundColor Gray
}

Write-Host "`nAuto-start has been uninstalled." -ForegroundColor Green
