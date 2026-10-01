@echo off
title Uninstall Growth Stock Analyser Windows Auto-Start
color 0C

echo ======================================================================
echo    Remove Growth Stock Analyser Windows Auto-Start
echo ======================================================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0uninstall_autostart.ps1"

echo.
pause
