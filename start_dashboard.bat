@echo off
title Growth Stock Analyser Launcher
color 0A

echo ======================================================================
echo    Growth Stock Analyser ^& TradingAgents Multi-Agent Committee
echo    US ^& Bursa Malaysia Automated Live Financial Intelligence
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Checking if background server is active on port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) { Write-Host 'Starting background service...'; Start-Process 'wscript.exe' -ArgumentList 'launch_service.vbs'; Start-Sleep -Seconds 2 } else { Write-Host 'Server is already active.' }"

echo [2/3] Verifying server health...
powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($i=0; $i -lt 15; $i++) { try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2 -UseBasicParsing; if ($r.StatusCode -eq 200) { Write-Host 'Server is healthy.'; break } } catch {}; Start-Sleep -Seconds 1 }"

echo [3/3] Opening dashboard in your default browser...
start http://localhost:8000

echo.
echo ======================================================================
echo  Dashboard is live at: http://localhost:8000
echo  Background scheduler is running daily post-market scans and alerts.
echo  You can safely close this window now.
echo ======================================================================
timeout /t 3 >nul
exit
