@echo off
title Stop Growth Stock Analyser Server
color 0E

echo ======================================================================
echo    Stopping Growth Stock Analyser Background Server
echo ======================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { Write-Host 'Stopping Process ID:' $c.OwningProcess; Stop-Process -Id $c.OwningProcess -Force } Write-Host 'Server successfully stopped.' } else { Write-Host 'No active server was found on port 8000.' }"

echo.
echo Done.
timeout /t 3 >nul
