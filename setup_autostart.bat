@echo off
title Install Growth Stock Analyser Windows Auto-Start
color 0B

echo ======================================================================
echo    Growth Stock Analyser - Windows Logon Auto-Start Installer
echo ======================================================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1"

echo.
pause
