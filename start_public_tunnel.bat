@echo off
title Cloudflare Tunnel - Public Mobile / Web Access
color 0B

echo ======================================================================
echo    Growth Stock Analyser - Instant Free Cloudflare Tunnel
echo    Access your dashboard from your phone or any device on the web!
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM 1. Ensure local server is running
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) { Write-Host 'Starting local background server...'; Start-Process 'wscript.exe' -ArgumentList 'launch_service.vbs'; Start-Sleep -Seconds 3 }"

REM 2. Check for cloudflared executable
if not exist "%SCRIPT_DIR%cloudflared.exe" (
    echo Downloading portable Cloudflare Tunnel client (cloudflared.exe)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
    echo Download complete.
)

echo.
echo ======================================================================
echo  Starting Cloudflare Tunnel to http://localhost:8000 ...
echo  Look for the 'https://*.trycloudflare.com' link below!
echo  Open that URL on your phone or any browser to access your dashboard.
echo  Keep this window open while you need remote access.
echo ======================================================================
echo.

"%SCRIPT_DIR%cloudflared.exe" tunnel --url http://localhost:8000

pause
