@echo off
title Apertura - Instalador
echo.
echo ========================================
echo    APERTURA - INSTALADOR
echo ========================================
echo.
echo Este script instalará Apertura como un servicio de Windows
echo que se iniciará automáticamente con el sistema.
echo.
pause

echo.
echo 1. Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo    Descarga Node.js desde: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 2. Instalando dependencias del cliente...
cd client
call npm install
if errorlevel 1 goto error

echo.
echo 3. Construyendo cliente...
call npm run build
if errorlevel 1 goto error

echo.
echo 4. Instalando dependencias del servidor...
cd ..\server
call npm install
if errorlevel 1 goto error

echo.
echo 5. ¿Quieres instalar como servicio de Windows? (s/n)
set /p choice="Opción: "
if /i "%choice%"=="s" (
    echo Instalando servicio...
    node install-service.js
    echo.
    echo ✅ Apertura instalado como servicio de Windows
    echo 🚀 Se iniciará automáticamente con Windows
) else (
    echo.
    echo ✅ Instalación manual completada
    echo 🚀 Ejecuta 'start.bat' para iniciar el servidor
)

echo.
echo ========================================
echo    ✅ INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo Accede a: http://localhost:5000
echo.
goto end

:error
echo.
echo ========================================
echo    ❌ ERROR EN INSTALACIÓN
echo ========================================
echo.

:end
pause