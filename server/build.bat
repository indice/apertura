@echo off
title Apertura - Build Complete
echo.
echo ========================================
echo    APERTURA - Build Completo
echo ========================================
echo.

echo 1. Construyendo cliente...
cd /d "%~dp0\..\client"
call npm run build
if errorlevel 1 goto error

echo.
echo 2. Instalando dependencias del servidor...
cd /d "%~dp0"
call npm install --production
if errorlevel 1 goto error

echo.
echo 3. Creando ejecutable...
call npm run build-exe
if errorlevel 1 goto error

echo.
echo ========================================
echo    ✅ BUILD COMPLETADO
echo ========================================
echo.
echo Ejecutable creado en: ../dist/apertura-server.exe
echo.
goto end

:error
echo.
echo ========================================
echo    ❌ ERROR EN BUILD
echo ========================================
echo.

:end
pause