@echo off
title Apertura Server
echo.
echo ========================================
echo    APERTURA - Servidor Local
echo ========================================
echo.
echo Iniciando servidor...
echo.

cd /d "%~dp0"
node index.js

echo.
echo ========================================
echo    Servidor detenido
echo ========================================
echo.
pause