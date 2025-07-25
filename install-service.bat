@echo off
title Apertura - Instalador de Servicio
echo.
echo ========================================
echo    APERTURA - INSTALADOR DE SERVICIO
echo ========================================
echo.
echo Este script instalará Apertura como un servicio de Windows
echo que se iniciará automáticamente con el sistema.
echo.
echo ⚠️  IMPORTANTE:
echo    - Este script DEBE ejecutarse como administrador
echo    - Haz clic derecho en este archivo y selecciona "Ejecutar como administrador"
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
echo 2. Verificando dependencias...
cd server
if not exist "node_modules" (
    echo 📦 Instalando dependencias del servidor...
    call npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)
echo ✅ Dependencias listas

echo.
echo 3. Verificando archivos del servidor...
if not exist "index.js" (
    echo ❌ No se encontró index.js
    pause
    exit /b 1
)
echo ✅ Archivos del servidor encontrados

echo.
echo 4. Desinstalando servicio anterior (si existe)...
node uninstall-service.js
timeout /t 2 >nul

echo.
echo 5. Instalando nuevo servicio...
node install-service.js
if errorlevel 1 (
    echo.
    echo ❌ Error instalando el servicio
    echo.
    echo 🔍 Diagnosticar problemas:
    echo    node check-service.js
    echo.
    echo 💡 Posibles soluciones:
    echo    1. Ejecutar como administrador
    echo    2. Verificar permisos de usuario
    echo    3. Comprobar que no hay antivirus bloqueando
    echo.
    pause
    exit /b 1
)

echo.
echo 6. Verificando instalación...
timeout /t 3 >nul
node check-service.js

echo.
echo ========================================
echo    ✅ INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo 🚀 El servicio AperturaServer está instalado
echo 🔄 Se iniciará automáticamente con Windows
echo 🌐 Accede a: http://localhost:5000
echo.
echo 📋 Comandos útiles:
echo    - Verificar servicio: node check-service.js
echo    - Desinstalar servicio: node uninstall-service.js
echo    - Iniciar manual: node index.js
echo.
pause